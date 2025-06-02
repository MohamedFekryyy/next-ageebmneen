import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Amazon marketplace configuration
const AMAZON_MARKETPLACES = {
  USA: {
    endpoint: 'webservices.amazon.com',
    marketplace: 'ATVPDKIKX0DER',
    region: 'us-east-1',
    currency: 'USD'
  },
  SAU: {
    endpoint: 'webservices.amazon.sa',
    marketplace: 'A17E79C6D8DWNP',
    region: 'eu-west-1',
    currency: 'SAR'
  },
  UAE: {
    endpoint: 'webservices.amazon.ae',
    marketplace: 'A2VIGQ35RCS4UG',
    region: 'eu-west-1',
    currency: 'AED'
  },
  EUR: {
    endpoint: 'webservices.amazon.fr',
    marketplace: 'A13V1IB3VIYZZH',
    region: 'eu-west-1',
    currency: 'EUR'
  }
} as const;

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

// Mock function for Amazon PA-API call (replace with actual implementation)
async function searchAmazonProducts(marketplace: string, query: string, requiresInternationalShipping = false) {
  // This is a mock implementation
  // In production, you would implement the actual Amazon PA-API v5 call here
  // using aws4 signing or @madlabs/aws-paapi library
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock responses for testing
  const mockProducts = [
    {
      title: `${query} - Premium Model`,
      price: Math.floor(Math.random() * 2000) + 500,
      currency: marketplace === 'USA' ? 'USD' : marketplace === 'SAU' ? 'SAR' : 'AED',
      image: 'https://via.placeholder.com/150',
      isEligibleForInternationalShipping: Math.random() > 0.3
    },
    {
      title: `${query} - Standard Edition`,
      price: Math.floor(Math.random() * 1500) + 300,
      currency: marketplace === 'USA' ? 'USD' : marketplace === 'SAU' ? 'SAR' : 'AED',
      image: 'https://via.placeholder.com/150',
      isEligibleForInternationalShipping: Math.random() > 0.5
    }
  ];
  
  let filteredProducts = mockProducts;
  
  if (requiresInternationalShipping) {
    filteredProducts = mockProducts.filter(p => p.isEligibleForInternationalShipping);
  }
  
  // Sort by price (lowest first)
  filteredProducts.sort((a, b) => a.price - b.price);
  
  return filteredProducts.length > 0 ? filteredProducts[0] : null;
}

// Mock function to search Egyptian prices (simulate searching local Egyptian sources)
async function searchEgyptianPrice(query: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  // Mock Egyptian price - typically higher than foreign prices
  const basePrice = Math.floor(Math.random() * 30000) + 15000; // 15k-45k EGP range
  
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

    // Determine marketplace and shipping requirements
    let marketplace: string;
    let requiresInternationalShipping = false;
    let shippingNote = '';

    if (PROXY_COUNTRIES.includes(country)) {
      // Use UAE marketplace for countries without Amazon
      marketplace = 'UAE';
      requiresInternationalShipping = true;
      shippingNote = 'السعر شحن من الإمارات';
    } else if (country in AMAZON_MARKETPLACES) {
      marketplace = country;
    } else {
      // Default to USA marketplace
      marketplace = 'USA';
    }

    // Search for products in parallel - both foreign and Egyptian prices
    const [foreignProduct, egyptianProduct] = await Promise.all([
      searchAmazonProducts(marketplace, query, requiresInternationalShipping),
      searchEgyptianPrice(query)
    ]);

    if (!foreignProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Return both prices
    return NextResponse.json({
      foreignPrice: {
        price: foreignProduct.price,
        currency: foreignProduct.currency,
        title: foreignProduct.title,
        image: foreignProduct.image,
        marketplace: marketplace,
        shippingNote: shippingNote || undefined
      },
      egyptianPrice: {
        price: egyptianProduct.price,
        currency: egyptianProduct.currency,
        title: egyptianProduct.title,
        source: egyptianProduct.source
      }
    });

  } catch (error) {
    console.error('Price lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 