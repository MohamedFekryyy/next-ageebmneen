import { NextRequest, NextResponse } from 'next/server';

// Type definitions for API responses
interface ProductSuggestion {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  image?: string;
  thumbnail?: string;
  brand?: string;
  category?: string;
}

interface FormattedSuggestion {
  id: string;
  title: string;
  description: string;
  image: string | null;
  brand: string;
  category: string;
}

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // Higher limit for autocomplete

// RapidAPI Produkter API configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'produkter.p.rapidapi.com';
const PRODUKTER_BASE_URL = `https://${RAPIDAPI_HOST}`;

// Cache for suggestions to reduce API calls
const suggestionsCache = new Map<string, { data: FormattedSuggestion[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

// Get cached suggestions or fetch new ones
function getCachedSuggestions(query: string): FormattedSuggestion[] | null {
  const cached = suggestionsCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Cache suggestions
function cacheSuggestions(query: string, data: FormattedSuggestion[]): void {
  suggestionsCache.set(query.toLowerCase(), {
    data,
    timestamp: Date.now()
  });
}

// Fallback suggestions for common electronics
const fallbackSuggestions = [
  'iPhone 15 Pro Max',
  'Samsung Galaxy S24 Ultra',
  'MacBook Pro M3',
  'iPad Air',
  'AirPods Pro',
  'Dell XPS 13',
  'HP Pavilion',
  'Lenovo ThinkPad',
  'Sony WH-1000XM5',
  'Nintendo Switch',
  'PlayStation 5',
  'Xbox Series X',
  'Apple Watch',
  'Google Pixel 8',
  'OnePlus 12'
];

// Get product suggestions using Produkter API
async function getProductSuggestions(query: string): Promise<FormattedSuggestion[]> {
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not configured, using fallback suggestions');
    return getFallbackSuggestions(query);
  }

  try {
    const response = await fetch(
      `${PRODUKTER_BASE_URL}/suggestions?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const suggestions = await response.json();
    
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      // Format suggestions for our UI
      return suggestions.slice(0, 8).map((suggestion: ProductSuggestion | string, index: number) => {
        const suggestionObj = typeof suggestion === 'string' ? { title: suggestion } : suggestion;
        const title = suggestionObj.title || suggestionObj.name || (typeof suggestion === 'string' ? suggestion : 'Unknown Product');
        
        return {
          id: `suggestion-${index}`,
          title: title,
          description: suggestionObj.description || suggestionObj.summary || '',
          image: suggestionObj.image || suggestionObj.thumbnail || null,
          brand: suggestionObj.brand || extractBrandFromTitle(title),
          category: suggestionObj.category || detectCategory(title)
        };
      });
    }

    return getFallbackSuggestions(query);

  } catch (error) {
    console.error('Produkter API suggestions error:', error);
    return getFallbackSuggestions(query);
  }
}

// Get fallback suggestions based on query
function getFallbackSuggestions(query: string): FormattedSuggestion[] {
  const lowerQuery = query.toLowerCase();
  
  // Filter fallback suggestions based on query
  const filtered = fallbackSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(lowerQuery)
  );
  
  // If no matches, return popular suggestions
  if (filtered.length === 0) {
    return fallbackSuggestions.slice(0, 6).map((suggestion, index) => ({
      id: `fallback-${index}`,
      title: suggestion,
      description: '',
      image: null,
      brand: extractBrandFromTitle(suggestion),
      category: detectCategory(suggestion)
    }));
  }
  
  return filtered.slice(0, 6).map((suggestion, index) => ({
    id: `filtered-${index}`,
    title: suggestion,
    description: '',
    image: null,
    brand: extractBrandFromTitle(suggestion),
    category: detectCategory(suggestion)
  }));
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

// Detect product category
function detectCategory(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('iphone') || lowerTitle.includes('galaxy') || lowerTitle.includes('pixel') || lowerTitle.includes('phone')) {
    return 'phone';
  }
  
  if (lowerTitle.includes('macbook') || lowerTitle.includes('laptop') || lowerTitle.includes('notebook') || lowerTitle.includes('thinkpad')) {
    return 'laptop';
  }
  
  if (lowerTitle.includes('ipad') || lowerTitle.includes('tablet')) {
    return 'tablet';
  }
  
  if (lowerTitle.includes('airpods') || lowerTitle.includes('headphones') || lowerTitle.includes('earbuds')) {
    return 'audio';
  }
  
  if (lowerTitle.includes('watch')) {
    return 'wearable';
  }
  
  if (lowerTitle.includes('playstation') || lowerTitle.includes('xbox') || lowerTitle.includes('nintendo')) {
    return 'gaming';
  }
  
  return 'electronics';
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
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { suggestions: [] },
        { status: 200 }
      );
    }

    // Check cache first
    const cached = getCachedSuggestions(query.trim());
    if (cached) {
      return NextResponse.json({
        suggestions: cached,
        cached: true
      });
    }

    // Get suggestions from API
    const suggestions = await getProductSuggestions(query.trim());
    
    // Cache the results
    cacheSuggestions(query.trim(), suggestions);

    return NextResponse.json({
      suggestions,
      cached: false
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 