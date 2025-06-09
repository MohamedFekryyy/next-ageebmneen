import { NextRequest, NextResponse } from 'next/server';
import { PremiumPriceService } from '@/lib/perplexity-service';

// Initialize premium service (in production, this would be per-user)
const premiumService = new PremiumPriceService(
  process.env.PERPLEXITY_API_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { product, country, userId } = await request.json();

    // Validate required fields
    if (!product || !country || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: product, country, userId' },
        { status: 400 }
      );
    }

    // Check if Perplexity API key is configured
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Premium service not configured' },
        { status: 503 }
      );
    }

    // Get price with usage tracking
    const result = await premiumService.getPriceWithUsageCheck(
      userId,
      product,
      country
    );

    // Check if result is an error
    if ('error' in result) {
      return NextResponse.json(result, { status: 429 });
    }

    // Return successful price discovery
    return NextResponse.json({
      success: true,
      data: result,
      usage: premiumService.getUserUsage(userId)
    });

  } catch (error) {
    console.error('Premium price discovery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Return usage information
    const usage = premiumService.getUserUsage(userId);
    
    return NextResponse.json({
      usage,
      pricing: {
        free: { limit: 0, price: 0, currency: 'EGP' },
        basic: { limit: 100, price: 199, currency: 'EGP' },
        pro: { limit: 500, price: 499, currency: 'EGP' },
        enterprise: { limit: 2000, price: 1299, currency: 'EGP' }
      }
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 