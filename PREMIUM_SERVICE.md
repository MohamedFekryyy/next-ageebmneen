# Premium Price Discovery Service

## Overview
The Premium Price Discovery Service integrates with Perplexity AI to provide real-time price discovery for products across global markets. This service uses advanced AI to search and analyze prices from hundreds of retailers and e-commerce platforms.

## Features
- **Real-time Price Discovery**: Get current prices from global retailers
- **Multi-country Support**: Compare prices across different countries
- **Confidence Scoring**: AI-powered confidence ratings for price accuracy
- **Source Attribution**: Know exactly where the price data comes from
- **Usage Tracking**: Monitor API usage with built-in limits
- **Batch Processing**: Discover prices for multiple countries simultaneously

## Setup

### 1. Get Perplexity API Key
1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an API account
3. Generate your API key from the dashboard

### 2. Environment Configuration
Create a `.env.local` file in your project root:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Service Architecture

#### Core Components
- `PerplexityPriceService`: Core API integration class
- `PremiumPriceService`: Business logic wrapper with usage tracking
- `/api/premium-price`: REST API endpoint
- `PremiumPriceDiscovery`: React component for UI

#### API Endpoints

**POST /api/premium-price**
```json
{
  "product": "iPhone 15 Pro Max 256GB",
  "country": "United States",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "iPhone 15 Pro Max 256GB",
    "country": "United States",
    "price": 1199,
    "currency": "USD",
    "source": "Apple Store",
    "confidence": 0.95,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "usage": {
    "used": 15,
    "limit": 100,
    "remaining": 85
  }
}
```

**GET /api/premium-price?userId=user123**
Returns usage information and pricing tiers.

## Pricing Tiers

| Tier | Monthly Queries | Price | Features |
|------|----------------|-------|----------|
| Free | 0 | مجاناً | Basic calculator only |
| Basic | 100 | 199 ج.م | Price discovery, monthly updates |
| Pro | 500 | 499 ج.م | Advanced analytics, trend tracking |
| Enterprise | 2000 | 1299 ج.م | Custom API, priority support |

## Usage Examples

### Basic Price Discovery
```typescript
import { PremiumPriceService } from '@/lib/perplexity-service';

const service = new PremiumPriceService(process.env.PERPLEXITY_API_KEY);

const result = await service.getPriceWithUsageCheck(
  'user123',
  'iPhone 15 Pro Max 256GB',
  'United States'
);

if ('error' in result) {
  console.error('Error:', result.error);
} else {
  console.log('Price:', result.price, result.currency);
  console.log('Source:', result.source);
  console.log('Confidence:', result.confidence);
}
```

### Batch Price Discovery
```typescript
const service = new PerplexityPriceService(apiKey);

const results = await service.batchPriceDiscovery(
  'iPhone 15 Pro Max 256GB',
  ['United States', 'United Arab Emirates', 'Germany']
);

results.forEach(result => {
  console.log(`${result.country}: ${result.price} ${result.currency}`);
});
```

## Integration with Main App

The premium service is integrated into the main app through:

1. **Premium Page**: `/premium` - Full-featured demo and pricing
2. **Popular Links Banner**: Promotional banner on homepage
3. **API Integration**: Ready-to-use REST endpoints
4. **Usage Tracking**: Built-in user limits and monitoring

## Technical Details

### Data Sources
- Official retailer websites
- E-commerce platforms (Amazon, eBay, etc.)
- Price comparison websites
- Manufacturer websites
- Regional marketplaces

### Quality Assurance
- Confidence scoring for each price point
- Source verification and reputation scoring
- Duplicate detection and filtering
- Real-time data validation
- Fallback mechanisms for failed queries

### Performance
- Average response time: 2-5 seconds
- Concurrent request handling
- Rate limiting and throttling
- Caching for frequently requested products
- Error handling and retry logic

## Monitoring and Analytics

### Usage Tracking
- Per-user monthly limits
- API call logging
- Success/failure rates
- Response time monitoring

### Business Metrics
- User engagement with premium features
- Conversion rates from free to paid
- Most popular products/countries
- Revenue tracking per tier

## Security

### API Security
- API key authentication
- Rate limiting per user
- Input validation and sanitization
- HTTPS encryption
- Request logging for audit

### Data Privacy
- No storage of personal data
- Encrypted API communications
- GDPR compliance ready
- User consent management

## Future Enhancements

### Planned Features
- Historical price tracking
- Price alerts and notifications
- Advanced analytics dashboard
- Mobile app integration
- Webhook support for real-time updates

### Scaling Considerations
- Database integration for user management
- Redis caching for performance
- Load balancing for high traffic
- CDN integration for global performance
- Microservices architecture

## Support and Maintenance

### Error Handling
- Graceful degradation when API is unavailable
- User-friendly error messages
- Automatic retry mechanisms
- Fallback to cached data when possible

### Monitoring
- API health checks
- Performance monitoring
- Error rate tracking
- User feedback collection

## Cost Analysis

### API Costs (Perplexity)
- Estimated $0.01-0.05 per query (~0.30-1.50 EGP)
- Volume discounts available
- Monthly billing cycle

### Revenue Projections (Egyptian Market)
- Basic tier: 199 EGP × users
- Pro tier: 499 EGP × users
- Enterprise: 1299 EGP × users
- Target: 60-70% gross margin (adjusted for local market)

### Market Analysis
- Egyptian purchasing power considerations
- Competitive pricing vs local alternatives
- Payment methods: Fawry, Vodafone Cash, Orange Money
- Target segments: Import businesses, e-commerce, tech enthusiasts

## Getting Started

1. Set up Perplexity API key
2. Configure environment variables
3. Test the `/premium` page
4. Monitor usage through admin panel
5. Implement payment processing (Fawry, mobile wallets)
6. Launch marketing campaign targeting Egyptian market

For technical support or questions, contact the development team. 