"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Search, TrendingUp, AlertCircle } from 'lucide-react';

interface PriceDiscoveryResult {
  product: string;
  country: string;
  price: number;
  currency: string;
  source: string;
  confidence: number;
  lastUpdated: string;
}

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export function PremiumPriceDiscovery() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceDiscoveryResult | null>(null);
  const [error, setError] = useState<string>('');
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState('');

  const discoverPrice = async () => {
    if (!product || !country) {
      setError('يرجى إدخال اسم المنتج والدولة');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/premium-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          country,
          userId: 'demo-user', // In production, use actual user ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في اكتشاف السعر');
      }

      setResult(data.data);
      setUsage(data.usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'عالية';
    if (confidence >= 0.6) return 'متوسطة';
    return 'منخفضة';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <CardTitle className="flex items-center gap-2">
            اكتشاف الأسعار الذكي
            <Badge variant="secondary" className="text-xs">
              Premium
            </Badge>
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          اكتشف أسعار المنتجات في الوقت الفعلي باستخدام الذكاء الاصطناعي
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Usage Info */}
        {usage && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">الاستخدام الشهري:</span>
              <span className="ml-2">{usage.used} / {usage.limit}</span>
            </div>
            <Badge variant={usage.remaining > 10 ? 'default' : 'destructive'}>
              {usage.remaining} متبقي
            </Badge>
          </div>
        )}

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المنتج</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="مثال: iPhone 15 Pro Max 256GB"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">الدولة</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر الدولة</option>
              <option value="United States">الولايات المتحدة</option>
              <option value="United Arab Emirates">الإمارات العربية المتحدة</option>
              <option value="Saudi Arabia">المملكة العربية السعودية</option>
              <option value="United Kingdom">المملكة المتحدة</option>
              <option value="Germany">ألمانيا</option>
              <option value="France">فرنسا</option>
              <option value="Japan">اليابان</option>
              <option value="South Korea">كوريا الجنوبية</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={discoverPrice}
          disabled={loading || !product || !country}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري البحث...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              اكتشف السعر
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">تم اكتشاف السعر بنجاح!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">المنتج</p>
                <p className="font-medium">{result.product}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">الدولة</p>
                <p className="font-medium">{result.country}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">السعر</p>
                <p className="text-lg font-bold text-green-600">
                  {result.price.toLocaleString()} {result.currency}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">المصدر</p>
                <p className="font-medium">{result.source}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">دقة البيانات:</span>
                <Badge className={getConfidenceColor(result.confidence)}>
                  {getConfidenceText(result.confidence)} ({Math.round(result.confidence * 100)}%)
                </Badge>
              </div>
              
              <span className="text-xs text-gray-500">
                آخر تحديث: {new Date(result.lastUpdated).toLocaleString('ar-EG')}
              </span>
            </div>
          </div>
        )}

        {/* Pricing Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">خطط الاشتراك</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium">مجاني</p>
              <p className="text-gray-600">0 استعلام</p>
              <p className="text-green-600">مجاناً</p>
            </div>
            <div className="text-center">
              <p className="font-medium">أساسي</p>
              <p className="text-gray-600">100 استعلام</p>
              <p className="text-blue-600">199 ج.م</p>
            </div>
            <div className="text-center">
              <p className="font-medium">احترافي</p>
              <p className="text-gray-600">500 استعلام</p>
              <p className="text-purple-600">499 ج.م</p>
            </div>
            <div className="text-center">
              <p className="font-medium">مؤسسي</p>
              <p className="text-gray-600">2000 استعلام</p>
              <p className="text-orange-600">1299 ج.م</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 