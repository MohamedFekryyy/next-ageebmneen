"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import { type SEOProduct } from '@/lib/seo-products';

// Exchange rates (fallback - same as in PurchaseForm)
const exchangeRates: Record<string, number> = {
  'AED': 13.62,
  'SAR': 13.33,
  'USD': 50.0,
  'EUR': 56.45,
};

interface ComparisonPageProps {
  type: 'product' | 'brand' | 'category' | 'priceRange';
  data: SEOProduct | SEOProduct[];
  brandName?: string;
  categoryName?: string;
  priceRange?: string;
}

function calculateSavings(product: SEOProduct) {
  const cheapestIntl = product.internationalPrices.reduce((min, curr) => 
    curr.price < min.price ? curr : min
  );
  
  const convertedPrice = cheapestIntl.price * exchangeRates[cheapestIntl.currency];
  const withCustoms = convertedPrice * 1.385; // 38.5% customs and taxes
  const savings = product.egyptPrice - withCustoms;
  
  return {
    cheapestIntl,
    convertedPrice,
    withCustoms,
    savings,
    isEgyptCheaper: savings < 0
  };
}

function ProductCard({ product }: { product: SEOProduct }) {
  const calculation = calculateSavings(product);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{product.brand} • {product.releaseYear}</p>
          </div>
          <Badge variant={product.category === 'flagship' ? 'default' : product.category === 'mid-range' ? 'secondary' : 'outline'}>
            {product.category === 'flagship' ? 'فلاجشيب' : product.category === 'mid-range' ? 'متوسط' : 'اقتصادي'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>📱 {product.specs.screen}</div>
          <div>💾 {product.specs.storage}</div>
          <div>🧠 {product.specs.ram}</div>
          <div>📸 {product.specs.camera}</div>
        </div>
        
        {/* Price Comparison */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">السعر في مصر:</span>
            <span className="font-semibold">{product.egyptPrice.toLocaleString()} جنيه</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">أرخص سعر خارجي:</span>
            <span className="font-semibold">
              {calculation.cheapestIntl.price.toLocaleString()} {calculation.cheapestIntl.currency}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">مع الجمارك والضرايب:</span>
            <span className="font-semibold">{Math.round(calculation.withCustoms).toLocaleString()} جنيه</span>
          </div>
          
          <div className={`flex justify-between items-center p-2 rounded-lg ${
            calculation.isEgyptCheaper ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <span className="text-sm font-medium">
              {calculation.isEgyptCheaper ? 'مصر أرخص' : 'الخارج أرخص'}
            </span>
            <span className="font-bold flex items-center gap-1">
              {calculation.isEgyptCheaper ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {Math.abs(calculation.savings).toLocaleString()} جنيه
            </span>
          </div>
        </div>
        
        {/* CTA */}
        <Link href={`/?product=${product.slug}`}>
          <Button className="w-full" variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            احسب بالتفصيل
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function ComparisonPage({ type, data, brandName, categoryName, priceRange }: ComparisonPageProps) {
  const products = Array.isArray(data) ? data : [data];
  
  // Page title and description based on type
  let pageTitle = '';
  let pageDescription = '';
  
  switch (type) {
    case 'product':
      const product = data as SEOProduct;
      pageTitle = `مقارنة أسعار ${product.name}`;
      pageDescription = `مقارنة شاملة لأسعار ${product.name} في مصر والخارج مع حساب الجمارك والضرايب`;
      break;
    case 'brand':
      pageTitle = `مقارنة أسعار موبايلات ${brandName}`;
      pageDescription = `مقارنة شاملة لأسعار موبايلات ${brandName} في مصر والخارج`;
      break;
    case 'category':
      const categoryNames = {
        'flagship': 'الفلاجشيب',
        'mid-range': 'الفئة المتوسطة',
        'budget': 'الاقتصادية'
      };
      const catName = categoryNames[categoryName as keyof typeof categoryNames];
      pageTitle = `مقارنة أسعار موبايلات ${catName}`;
      pageDescription = `مقارنة شاملة لأسعار موبايلات ${catName} في مصر والخارج`;
      break;
    case 'priceRange':
      const priceRangeNames = {
        'under-20000': 'تحت 20 ألف جنيه',
        '20000-50000': 'من 20 إلى 50 ألف جنيه',
        'over-50000': 'أكثر من 50 ألف جنيه'
      };
      const rangeName = priceRangeNames[priceRange as keyof typeof priceRangeNames];
      pageTitle = `مقارنة أسعار موبايلات ${rangeName}`;
      pageDescription = `مقارنة شاملة لأسعار موبايلات ${rangeName} في مصر والخارج`;
      break;
  }
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للحاسبة
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-lg text-gray-600">{pageDescription}</p>
          
          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-500">عدد الموديلات:</span>
              <span className="font-semibold ml-2">{products.length}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-500">نطاق الأسعار:</span>
              <span className="font-semibold ml-2">
                {Math.min(...products.map(p => p.egyptPrice)).toLocaleString()} - {Math.max(...products.map(p => p.egyptPrice)).toLocaleString()} جنيه
              </span>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* SEO Content */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">دليل شراء الموبايلات من الخارج</h2>
          <div className="prose prose-lg max-w-none" dir="rtl">
            <p className="text-gray-700 mb-4">
              عند التفكير في شراء موبايل من الخارج، من المهم حساب التكلفة الإجمالية بما في ذلك الجمارك والضرايب. 
              في مصر، تبلغ نسبة الجمارك والضرايب على الموبايلات 38.5% من قيمة الجهاز.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">نصائح مهمة للشراء من الخارج:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>تأكد من أن الموبايل يدعم شبكات المحمول المصرية</li>
              <li>احسب التكلفة الإجمالية بما في ذلك الشحن والجمارك</li>
              <li>تحقق من الضمان وخدمة ما بعد البيع في مصر</li>
              <li>قارن الأسعار مع السوق المحلي قبل اتخاذ القرار</li>
            </ul>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                💡 نصيحة: استخدم حاسبة &quot;أجيب منين؟&quot; للحصول على مقارنة دقيقة ومحدثة للأسعار
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Calculator className="w-5 h-5 mr-2" />
              احسب تكلفة موبايلك الآن
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 