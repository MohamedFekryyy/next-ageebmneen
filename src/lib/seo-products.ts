// Popular phone models for programmatic SEO pages
export interface SEOProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  searchTerms: string[];
  egyptPrice: number; // EGP
  internationalPrices: {
    country: string;
    countryCode: string;
    price: number;
    currency: string;
  }[];
  specs: {
    storage: string;
    ram: string;
    screen: string;
    camera: string;
  };
  category: 'flagship' | 'mid-range' | 'budget';
  releaseYear: number;
}

export const seoProducts: SEOProduct[] = [
  // iPhone Models
  {
    id: 'iphone-15-pro-max-256gb',
    name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max-256gb',
    searchTerms: ['ايفون 15 برو ماكس', 'iPhone 15 Pro Max', 'ايفون 15 برو ماكس 256', 'آيفون 15 برو ماكس'],
    egyptPrice: 85000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 4799, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 4799, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 1199, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '8GB',
      screen: '6.7 بوصة',
      camera: '48 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2023
  },
  {
    id: 'iphone-15-128gb',
    name: 'iPhone 15 128GB',
    brand: 'Apple',
    model: 'iPhone 15',
    slug: 'iphone-15-128gb',
    searchTerms: ['ايفون 15', 'iPhone 15', 'ايفون 15 عادي', 'آيفون 15'],
    egyptPrice: 65000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 3399, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 3399, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 799, currency: 'USD' },
    ],
    specs: {
      storage: '128GB',
      ram: '6GB',
      screen: '6.1 بوصة',
      camera: '48 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2023
  },
  {
    id: 'iphone-14-128gb',
    name: 'iPhone 14 128GB',
    brand: 'Apple',
    model: 'iPhone 14',
    slug: 'iphone-14-128gb',
    searchTerms: ['ايفون 14', 'iPhone 14', 'ايفون 14 عادي', 'آيفون 14'],
    egyptPrice: 55000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 2999, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 2999, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 699, currency: 'USD' },
    ],
    specs: {
      storage: '128GB',
      ram: '6GB',
      screen: '6.1 بوصة',
      camera: '12 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2022
  },

  // Samsung Galaxy Models
  {
    id: 'samsung-galaxy-s24-ultra-256gb',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    searchTerms: ['سامسونج جالاكسي S24 الترا', 'Samsung Galaxy S24 Ultra', 'جالكسي S24 الترا', 'سامسونج S24 الترا'],
    egyptPrice: 75000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 4699, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 4699, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 1299, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '12GB',
      screen: '6.8 بوصة',
      camera: '200 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2024
  },
  {
    id: 'samsung-galaxy-s23-256gb',
    name: 'Samsung Galaxy S23 256GB',
    brand: 'Samsung',
    model: 'Galaxy S23',
    slug: 'samsung-galaxy-s23-256gb',
    searchTerms: ['سامسونج جالاكسي S23', 'Samsung Galaxy S23', 'جالكسي S23', 'سامسونج S23'],
    egyptPrice: 45000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 3199, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 3199, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 799, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '8GB',
      screen: '6.1 بوصة',
      camera: '50 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2023
  },

  // Xiaomi Models
  {
    id: 'xiaomi-14-ultra-512gb',
    name: 'Xiaomi 14 Ultra 512GB',
    brand: 'Xiaomi',
    model: '14 Ultra',
    slug: 'xiaomi-14-ultra-512gb',
    searchTerms: ['شاومي 14 الترا', 'Xiaomi 14 Ultra', 'شياومي 14 الترا', 'شاومى 14 الترا'],
    egyptPrice: 55000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 4299, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 4299, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 1199, currency: 'USD' },
    ],
    specs: {
      storage: '512GB',
      ram: '16GB',
      screen: '6.73 بوصة',
      camera: '50 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2024
  },
  {
    id: 'xiaomi-redmi-note-13-pro-256gb',
    name: 'Xiaomi Redmi Note 13 Pro 256GB',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    slug: 'xiaomi-redmi-note-13-pro-256gb',
    searchTerms: ['شاومي ريدمي نوت 13 برو', 'Xiaomi Redmi Note 13 Pro', 'ريدمي نوت 13 برو', 'شياومي ريدمي نوت 13'],
    egyptPrice: 18000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 1199, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 1199, currency: 'SAR' },
      { country: 'أمريكا', countryCode: 'USA', price: 299, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '8GB',
      screen: '6.67 بوصة',
      camera: '200 ميجابكسل'
    },
    category: 'mid-range',
    releaseYear: 2024
  },

  // Google Pixel Models
  {
    id: 'google-pixel-8-pro-256gb',
    name: 'Google Pixel 8 Pro 256GB',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    slug: 'google-pixel-8-pro-256gb',
    searchTerms: ['جوجل بكسل 8 برو', 'Google Pixel 8 Pro', 'بكسل 8 برو', 'جوجل بيكسل 8 برو'],
    egyptPrice: 50000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 3699, currency: 'AED' },
      { country: 'أمريكا', countryCode: 'USA', price: 999, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '12GB',
      screen: '6.7 بوصة',
      camera: '50 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2023
  },

  // OnePlus Models
  {
    id: 'oneplus-12-256gb',
    name: 'OnePlus 12 256GB',
    brand: 'OnePlus',
    model: '12',
    slug: 'oneplus-12-256gb',
    searchTerms: ['ون بلس 12', 'OnePlus 12', 'وان بلس 12', 'ونبلس 12'],
    egyptPrice: 42000,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 2999, currency: 'AED' },
      { country: 'أمريكا', countryCode: 'USA', price: 799, currency: 'USD' },
    ],
    specs: {
      storage: '256GB',
      ram: '12GB',
      screen: '6.82 بوصة',
      camera: '50 ميجابكسل'
    },
    category: 'flagship',
    releaseYear: 2024
  },

  // Budget Options
  {
    id: 'realme-c55-128gb',
    name: 'Realme C55 128GB',
    brand: 'Realme',
    model: 'C55',
    slug: 'realme-c55-128gb',
    searchTerms: ['ريلمي C55', 'Realme C55', 'ريل مي C55', 'ريلمى C55'],
    egyptPrice: 8500,
    internationalPrices: [
      { country: 'الإمارات', countryCode: 'UAE', price: 599, currency: 'AED' },
      { country: 'السعودية', countryCode: 'SAU', price: 599, currency: 'SAR' },
    ],
    specs: {
      storage: '128GB',
      ram: '6GB',
      screen: '6.72 بوصة',
      camera: '64 ميجابكسل'
    },
    category: 'budget',
    releaseYear: 2023
  }
];

// Generate comparison combinations
export function generateComparisonSlugs(): string[] {
  const slugs: string[] = [];
  
  // Individual product pages
  seoProducts.forEach(product => {
    slugs.push(`compare/${product.slug}`);
  });
  
  // Brand comparison pages
  const brands = [...new Set(seoProducts.map(p => p.brand))];
  brands.forEach(brand => {
    slugs.push(`compare/brand/${brand.toLowerCase().replace(/\s+/g, '-')}`);
  });
  
  // Category comparison pages
  const categories = [...new Set(seoProducts.map(p => p.category))];
  categories.forEach(category => {
    slugs.push(`compare/category/${category}`);
  });
  
  // Price range comparisons
  slugs.push('compare/under-20000');
  slugs.push('compare/20000-50000');
  slugs.push('compare/over-50000');
  
  return slugs;
}

// Get product by slug
export function getProductBySlug(slug: string): SEOProduct | undefined {
  return seoProducts.find(product => product.slug === slug);
}

// Get products by brand
export function getProductsByBrand(brand: string): SEOProduct[] {
  return seoProducts.filter(product => 
    product.brand.toLowerCase() === brand.toLowerCase()
  );
}

// Get products by category
export function getProductsByCategory(category: string): SEOProduct[] {
  return seoProducts.filter(product => product.category === category);
}

// Get products by price range
export function getProductsByPriceRange(min: number, max: number): SEOProduct[] {
  return seoProducts.filter(product => 
    product.egyptPrice >= min && product.egyptPrice <= max
  );
} 