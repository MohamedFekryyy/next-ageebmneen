import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  getProductBySlug, 
  getProductsByBrand, 
  getProductsByCategory, 
  getProductsByPriceRange,
  generateComparisonSlugs,
  type SEOProduct 
} from '@/lib/seo-products';
import { ComparisonPage } from '@/components/ComparisonPage';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Generate static params for all comparison pages
export async function generateStaticParams() {
  const slugs = generateComparisonSlugs();
  
  return slugs.map((slug) => ({
    slug: slug.split('/').slice(1), // Remove 'compare/' prefix
  }));
}

// Generate metadata for each comparison page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Individual product comparison
  if (slug.length === 1) {
    const product = getProductBySlug(slug[0]);
    if (!product) return { title: 'Product Not Found' };
    
    const cheapestIntl = product.internationalPrices.reduce((min, curr) => 
      curr.price < min.price ? curr : min
    );
    
    return {
      title: `${product.name} - مقارنة الأسعار مصر والخارج | أجيب منين؟`,
      description: `مقارنة أسعار ${product.name} في مصر (${product.egyptPrice.toLocaleString()} جنيه) مع ${cheapestIntl.country} (${cheapestIntl.price.toLocaleString()} ${cheapestIntl.currency}). احسب الجمارك والضرايب واعرف الأوفر.`,
      keywords: `${product.searchTerms.join(', ')}, مقارنة أسعار, جمارك, ضرايب, ${product.brand}`,
      openGraph: {
        title: `${product.name} - مقارنة الأسعار مصر والخارج`,
        description: `مقارنة أسعار ${product.name} في مصر والخارج مع حساب الجمارك والضرايب`,
        type: 'article',
        locale: 'ar_EG',
      },
      alternates: {
        canonical: `https://ageebmneen.vercel.app/compare/${product.slug}`,
      },
    };
  }
  
  // Brand comparison
  if (slug[0] === 'brand' && slug[1]) {
    const brandName = slug[1].replace(/-/g, ' ');
    const products = getProductsByBrand(brandName);
    if (products.length === 0) return { title: 'Brand Not Found' };
    
    return {
      title: `مقارنة أسعار موبايلات ${products[0].brand} - مصر والخارج | أجيب منين؟`,
      description: `مقارنة شاملة لأسعار موبايلات ${products[0].brand} في مصر والخارج. اعرف الأوفر مع حساب الجمارك والضرايب لكل موديل.`,
      keywords: `${products[0].brand}, موبايلات, مقارنة أسعار, جمارك, ضرايب`,
      openGraph: {
        title: `مقارنة أسعار موبايلات ${products[0].brand} - مصر والخارج`,
        description: `مقارنة شاملة لأسعار موبايلات ${products[0].brand} في مصر والخارج`,
        type: 'article',
        locale: 'ar_EG',
      },
    };
  }
  
  // Category comparison
  if (slug[0] === 'category' && slug[1]) {
    const categoryNames = {
      'flagship': 'الفلاجشيب',
      'mid-range': 'الفئة المتوسطة',
      'budget': 'الاقتصادية'
    };
    
    const categoryName = categoryNames[slug[1] as keyof typeof categoryNames];
    
    return {
      title: `مقارنة أسعار موبايلات ${categoryName} - مصر والخارج | أجيب منين؟`,
      description: `مقارنة شاملة لأسعار موبايلات ${categoryName} في مصر والخارج. اعرف الأوفر مع حساب الجمارك والضرايب.`,
      keywords: `موبايلات ${categoryName}, مقارنة أسعار, جمارك, ضرايب`,
      openGraph: {
        title: `مقارنة أسعار موبايلات ${categoryName} - مصر والخارج`,
        description: `مقارنة شاملة لأسعار موبايلات ${categoryName} في مصر والخارج`,
        type: 'article',
        locale: 'ar_EG',
      },
    };
  }
  
  // Price range comparison
  if (slug[0].includes('-')) {
    const priceRangeNames = {
      'under-20000': 'تحت 20 ألف جنيه',
      '20000-50000': 'من 20 إلى 50 ألف جنيه',
      'over-50000': 'أكثر من 50 ألف جنيه'
    };
    
    const rangeName = priceRangeNames[slug[0] as keyof typeof priceRangeNames];
    
    return {
      title: `مقارنة أسعار موبايلات ${rangeName} - مصر والخارج | أجيب منين؟`,
      description: `مقارنة شاملة لأسعار موبايلات ${rangeName} في مصر والخارج. اعرف الأوفر مع حساب الجمارك والضرايب.`,
      keywords: `موبايلات ${rangeName}, مقارنة أسعار, جمارك, ضرايب`,
      openGraph: {
        title: `مقارنة أسعار موبايلات ${rangeName} - مصر والخارج`,
        description: `مقارنة شاملة لأسعار موبايلات ${rangeName} في مصر والخارج`,
        type: 'article',
        locale: 'ar_EG',
      },
    };
  }
  
  return {
    title: 'مقارنة أسعار الموبايلات | أجيب منين؟',
    description: 'مقارنة شاملة لأسعار الموبايلات في مصر والخارج',
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Individual product comparison
  if (slug.length === 1) {
    const product = getProductBySlug(slug[0]);
    if (!product) notFound();
    
    return <ComparisonPage type="product" data={product} />;
  }
  
  // Brand comparison
  if (slug[0] === 'brand' && slug[1]) {
    const brandName = slug[1].replace(/-/g, ' ');
    const products = getProductsByBrand(brandName);
    if (products.length === 0) notFound();
    
    return <ComparisonPage type="brand" data={products} brandName={products[0].brand} />;
  }
  
  // Category comparison
  if (slug[0] === 'category' && slug[1]) {
    const products = getProductsByCategory(slug[1]);
    if (products.length === 0) notFound();
    
    return <ComparisonPage type="category" data={products} categoryName={slug[1]} />;
  }
  
  // Price range comparison
  if (slug[0].includes('-')) {
    let products: SEOProduct[] = [];
    
    switch (slug[0]) {
      case 'under-20000':
        products = getProductsByPriceRange(0, 20000);
        break;
      case '20000-50000':
        products = getProductsByPriceRange(20000, 50000);
        break;
      case 'over-50000':
        products = getProductsByPriceRange(50000, Infinity);
        break;
    }
    
    if (products.length === 0) notFound();
    
    return <ComparisonPage type="priceRange" data={products} priceRange={slug[0]} />;
  }
  
  notFound();
} 