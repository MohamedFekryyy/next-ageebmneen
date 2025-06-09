// Perplexity API Service for Premium Price Discovery
interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface PriceDiscoveryResult {
  product: string;
  country: string;
  price: number;
  currency: string;
  source: string;
  confidence: number;
  lastUpdated: string;
}

export class PerplexityPriceService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async discoverPrice(
    productName: string, 
    country: string, 
    currency: string = 'USD'
  ): Promise<PriceDiscoveryResult | null> {
    try {
      const query = this.buildPriceQuery(productName, country, currency);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a price discovery assistant. Return only structured price data in JSON format.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 200,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data: PerplexityResponse = await response.json();
      return this.parseResponse(data, productName, country, currency);
    } catch (error) {
      console.error('Price discovery failed:', error);
      return null;
    }
  }

  private buildPriceQuery(product: string, country: string, currency: string): string {
    return `Find the current retail price of "${product}" in ${country}. 
    Return ONLY a JSON object with this exact format:
    {
      "price": number,
      "currency": "${currency}",
      "source": "store_name",
      "confidence": 0.95
    }
    
    Search official retailers, e-commerce sites, and authorized dealers. 
    Price should be in ${currency}. If multiple prices found, use the most common/average price.`;
  }

  private parseResponse(
    response: PerplexityResponse, 
    product: string, 
    country: string, 
    currency: string
  ): PriceDiscoveryResult | null {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const priceData = JSON.parse(jsonMatch[0]);
      
      return {
        product,
        country,
        price: priceData.price,
        currency: priceData.currency || currency,
        source: priceData.source || 'Unknown',
        confidence: priceData.confidence || 0.5,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to parse price response:', error);
      return null;
    }
  }

  async batchPriceDiscovery(
    product: string, 
    countries: string[]
  ): Promise<PriceDiscoveryResult[]> {
    const promises = countries.map(country => 
      this.discoverPrice(product, country)
    );
    
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<PriceDiscoveryResult> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
}

// Premium service wrapper
export class PremiumPriceService {
  private perplexity: PerplexityPriceService;
  private usageTracker: Map<string, number> = new Map();
  private readonly MONTHLY_LIMIT = 100; // API calls per month

  constructor(apiKey: string) {
    this.perplexity = new PerplexityPriceService(apiKey);
  }

  async getPriceWithUsageCheck(
    userId: string,
    product: string,
    country: string
  ): Promise<PriceDiscoveryResult | { error: string }> {
    // Check usage limits
    const currentUsage = this.usageTracker.get(userId) || 0;
    
    if (currentUsage >= this.MONTHLY_LIMIT) {
      return { error: 'Monthly API limit reached. Please upgrade your plan.' };
    }

    // Discover price
    const result = await this.perplexity.discoverPrice(product, country);
    
    if (result) {
      // Track usage
      this.usageTracker.set(userId, currentUsage + 1);
    }

    return result || { error: 'Price discovery failed. Please try again.' };
  }

  getUserUsage(userId: string): { used: number; limit: number; remaining: number } {
    const used = this.usageTracker.get(userId) || 0;
    return {
      used,
      limit: this.MONTHLY_LIMIT,
      remaining: this.MONTHLY_LIMIT - used
    };
  }
} 