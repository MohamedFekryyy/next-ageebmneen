import { NextRequest, NextResponse } from 'next/server';
import aws4 from 'aws4';

// Type definitions for PA-API responses
interface ProductResult {
  title: string;
  price: number;
  currency: string;
  image: string | null;
  brand: string;
  features: string[];
  isAmazonFulfilled: boolean;
  isFreeShipping: boolean;
  isInternationalShipping: boolean;
  source: string;
  asin: string;
}

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory cache for PA-API responses (6 hours as per plan)
const priceCache = new Map<string, { data: ProductResult; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Throttling for PA-API (1 req/sec, burst 10 as per plan)
let lastRequestTime = 0;
const REQUEST_INTERVAL = 1000; // 1 second

// Amazon PA-API v5 Configuration
const PA_API_CONFIG = {
  USA: {
    host: 'webservices.amazon.com',
    region: 'us-east-1',
    marketplace: 'www.amazon.com',
    accessKey: process.env.PAAPI_US_ACCESS,
    secretKey: process.env.PAAPI_US_SECRET,
    partnerTag: process.env.PAAPI_US_PARTNER_TAG,
  },
  SAU: {
    host: 'webservices.amazon.sa',
    region: 'eu-west-1',
    marketplace: 'www.amazon.sa',
    accessKey: process.env.PAAPI_SA_ACCESS,
    secretKey: process.env.PAAPI_SA_SECRET,
    partnerTag: process.env.PAAPI_SA_PARTNER_TAG,
  },
  UAE: {
    host: 'webservices.amazon.ae',
    region: 'eu-west-1',
    marketplace: 'www.amazon.ae',
    accessKey: process.env.PAAPI_AE_ACCESS,
    secretKey: process.env.PAAPI_AE_SECRET,
    partnerTag: process.env.PAAPI_AE_PARTNER_TAG,
  },
  EUR: {
    host: 'webservices.amazon.fr',
    region: 'eu-west-1',
    marketplace: 'www.amazon.fr',
    accessKey: process.env.PAAPI_FR_ACCESS,
    secretKey: process.env.PAAPI_FR_SECRET,
    partnerTag: process.env.PAAPI_FR_PARTNER_TAG,
  },
};

// Countries that don't have Amazon marketplaces - use UAE with international shipping
const PROXY_COUNTRIES = ['KWT', 'QAT', 'OMN', 'JOR', 'LBN'];

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

// Get cached price data
function getCachedPrice(cacheKey: string): ProductResult | null {
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Cache price data
function cachePrice(cacheKey: string, data: ProductResult): void {
  priceCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

// Throttle PA-API requests (1 req/sec, burst 10)
function throttleRequest(): Promise<void> {
  return new Promise((resolve) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest >= REQUEST_INTERVAL) {
      lastRequestTime = now;
      resolve();
    } else {
      const delay = REQUEST_INTERVAL - timeSinceLastRequest;
      setTimeout(() => {
        lastRequestTime = Date.now();
        resolve();
      }, delay);
    }
  });
}

// Build signed PA-API v5 SearchItems request
async function searchAmazonProducts(country: string, query: string): Promise<ProductResult> {
  // Map country to marketplace config
  let config = PA_API_CONFIG[country as keyof typeof PA_API_CONFIG];
  
  // For proxy countries, use UAE marketplace
  if (PROXY_COUNTRIES.includes(country)) {
    config = PA_API_CONFIG.UAE;
  }
  
  if (!config || !config.accessKey || !config.secretKey || !config.partnerTag) {
    throw new Error(`PA-API credentials not configured for ${country}`);
  }

  // Check cache first
  const cacheKey = `${country}-${query.toLowerCase()}`;
  const cached = getCachedPrice(cacheKey);
  if (cached) {
    return cached;
  }

  // Throttle request
  await throttleRequest();

  // Build PA-API v5 SearchItems request
  const requestBody = {
    Keywords: query,
    Resources: [
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsAmazonFulfilled',
      'Offers.Listings.DeliveryInfo.IsFreeShippingEligible',
      'Offers.Listings.DeliveryInfo.IsEligibleForInternationalShipping'
    ],
    SearchIndex: 'All',
    ItemCount: 10,
    PartnerTag: config.partnerTag,
    PartnerType: 'Associates',
    Marketplace: config.marketplace
  };

  const requestOptions = {
    host: config.host,
    path: '/paapi5/searchitems',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
    },
    body: JSON.stringify(requestBody),
    service: 'ProductAdvertisingAPI',
    region: config.region
  };

  // Sign the request with AWS4
  const signedRequest = aws4.sign(requestOptions, {
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey
  });

  try {
    const response = await fetch(`https://${config.host}/paapi5/searchitems`, {
      method: 'POST',
      headers: signedRequest.headers as HeadersInit,
      body: requestOptions.body
    });

    if (!response.ok) {
      throw new Error(`PA-API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Errors && data.Errors.length > 0) {
      throw new Error(`PA-API error: ${data.Errors[0].Message}`);
    }

    if (!data.SearchResult || !data.SearchResult.Items || data.SearchResult.Items.length === 0) {
      throw new Error('No products found');
    }

    // Process results and find the best price
    const items = data.SearchResult.Items;
    let bestItem = null;
    let lowestPrice = Infinity;

    for (const item of items) {
      if (item.Offers && item.Offers.Listings && item.Offers.Listings.length > 0) {
        for (const listing of item.Offers.Listings) {
          if (listing.Price && listing.Price.Amount) {
            const price = parseFloat(listing.Price.Amount);
            
            // For proxy countries, prefer items eligible for international shipping
            if (PROXY_COUNTRIES.includes(country)) {
              if (listing.DeliveryInfo && listing.DeliveryInfo.IsEligibleForInternationalShipping) {
                if (price < lowestPrice) {
                  lowestPrice = price;
                  bestItem = { item, listing };
                }
              }
            } else {
              if (price < lowestPrice) {
                lowestPrice = price;
                bestItem = { item, listing };
              }
            }
          }
        }
      }
    }

    if (!bestItem) {
      throw new Error('No valid offers found');
    }

    const result = {
      title: bestItem.item.ItemInfo?.Title?.DisplayValue || query,
      price: lowestPrice,
      currency: bestItem.listing.Price.CurrencyCode || 'USD',
      image: bestItem.item.Images?.Primary?.Medium?.URL || null,
      brand: bestItem.item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 'Unknown',
      features: bestItem.item.ItemInfo?.Features?.DisplayValues || [],
      isAmazonFulfilled: bestItem.listing.DeliveryInfo?.IsAmazonFulfilled || false,
      isFreeShipping: bestItem.listing.DeliveryInfo?.IsFreeShippingEligible || false,
      isInternationalShipping: bestItem.listing.DeliveryInfo?.IsEligibleForInternationalShipping || false,
      source: `Amazon ${config.marketplace}`,
      asin: bestItem.item.ASIN
    };

    // Cache the result
    cachePrice(cacheKey, result);
    
    return result;

  } catch (error) {
    console.error('PA-API request failed:', error);
    throw error;
  }
}

// Mock function to search Egyptian prices (simulate searching local Egyptian sources)
async function searchEgyptianPrice(query: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  // Generate realistic Egyptian prices based on product type
  const lowerQuery = query.toLowerCase();
  let basePrice = 15000; // Default base price in EGP
  
  if (lowerQuery.includes('iphone')) {
    if (lowerQuery.includes('pro') || lowerQuery.includes('max')) {
      basePrice = Math.floor(Math.random() * 15000) + 45000; // 45k-60k EGP
    } else {
      basePrice = Math.floor(Math.random() * 10000) + 25000; // 25k-35k EGP
    }
  } else if (lowerQuery.includes('samsung galaxy')) {
    if (lowerQuery.includes('ultra') || lowerQuery.includes('note')) {
      basePrice = Math.floor(Math.random() * 12000) + 35000; // 35k-47k EGP
    } else {
      basePrice = Math.floor(Math.random() * 8000) + 20000; // 20k-28k EGP
    }
  } else if (lowerQuery.includes('macbook')) {
    if (lowerQuery.includes('pro')) {
      basePrice = Math.floor(Math.random() * 20000) + 60000; // 60k-80k EGP
    } else {
      basePrice = Math.floor(Math.random() * 15000) + 40000; // 40k-55k EGP
    }
  } else if (lowerQuery.includes('laptop')) {
    basePrice = Math.floor(Math.random() * 20000) + 25000; // 25k-45k EGP
  }
  
  return {
    title: `${query} - Egypt Local`,
    price: basePrice,
    currency: 'EGP',
    source: 'مصادر محلية مصرية'
  };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const query = searchParams.get('query');

    if (!country || !query) {
      return NextResponse.json(
        { error: 'Missing country or query parameter' },
        { status: 400 }
      );
    }

    try {
      // Search for products in parallel - both Amazon and Egyptian prices
      const [amazonProduct, egyptianProduct] = await Promise.all([
        searchAmazonProducts(country, query),
        searchEgyptianPrice(query)
      ]);

      // Add shipping note for proxy countries
      let shippingNote = '';
      if (PROXY_COUNTRIES.includes(country)) {
        shippingNote = 'السعر شحن دولي من الإمارات';
      }

      // Return both prices
      return NextResponse.json({
        foreignPrice: {
          price: amazonProduct.price,
          currency: amazonProduct.currency,
          title: amazonProduct.title,
          image: amazonProduct.image,
          brand: amazonProduct.brand,
          features: amazonProduct.features,
          source: amazonProduct.source,
          asin: amazonProduct.asin,
          isAmazonFulfilled: amazonProduct.isAmazonFulfilled,
          isFreeShipping: amazonProduct.isFreeShipping,
          isInternationalShipping: amazonProduct.isInternationalShipping,
          shippingNote: shippingNote || undefined
        },
        egyptianPrice: {
          price: egyptianProduct.price,
          currency: egyptianProduct.currency,
          title: egyptianProduct.title,
          source: egyptianProduct.source
        }
      });

    } catch (paApiError) {
      console.error('PA-API failed, falling back to mock data:', paApiError);
      
      // Fallback to mock data if PA-API fails
      const mockForeignPrice = generateEstimatedPrice(query);
      const egyptianProduct = await searchEgyptianPrice(query);
      
      return NextResponse.json({
        foreignPrice: {
          price: mockForeignPrice,
          currency: 'USD',
          title: `${query} (Estimated)`,
          image: null,
          brand: extractBrandFromTitle(query),
          features: [],
          source: 'Estimated Price',
          shippingNote: PROXY_COUNTRIES.includes(country) ? 'السعر تقديري' : undefined
        },
        egyptianPrice: {
          price: egyptianProduct.price,
          currency: egyptianProduct.currency,
          title: egyptianProduct.title,
          source: egyptianProduct.source
        }
      });
    }

  } catch (error) {
    console.error('Price lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback function to generate estimated prices
function generateEstimatedPrice(query: string): number {
  const lowerQuery = query.toLowerCase();
  
  // Phone price ranges
  if (lowerQuery.includes('iphone') || lowerQuery.includes('samsung galaxy') || lowerQuery.includes('pixel')) {
    if (lowerQuery.includes('pro') || lowerQuery.includes('max') || lowerQuery.includes('ultra')) {
      return Math.floor(Math.random() * 500) + 800; // $800-1300
    }
    return Math.floor(Math.random() * 400) + 400; // $400-800
  }
  
  // Laptop price ranges
  if (lowerQuery.includes('macbook') || lowerQuery.includes('laptop') || lowerQuery.includes('notebook')) {
    if (lowerQuery.includes('pro') || lowerQuery.includes('gaming')) {
      return Math.floor(Math.random() * 1000) + 1200; // $1200-2200
    }
    return Math.floor(Math.random() * 600) + 600; // $600-1200
  }
  
  // Default electronics price
  return Math.floor(Math.random() * 300) + 100; // $100-400
}

// Extract brand from product title
function extractBrandFromTitle(title: string): string {
  const commonBrands = [
    'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony', 'LG',
    'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft',
    'Nintendo', 'PlayStation', 'Xbox', 'Canon', 'Nikon', 'GoPro'
  ];
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Try to extract first word as brand
  const words = title.split(' ');
  return words[0] || 'Unknown';
} 