import { Metadata } from 'next';
import { PremiumPriceDiscovery } from '@/components/PremiumPriceDiscovery';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Search, TrendingUp, Shield, Clock, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الخدمة المميزة - اكتشاف الأسعار الذكي | أجيب منين',
  description: 'اكتشف أسعار المنتجات في الوقت الفعلي من جميع أنحاء العالم باستخدام الذكاء الاصطناعي المتقدم',
  keywords: 'اكتشاف الأسعار, الذكاء الاصطناعي, مقارنة الأسعار, خدمة مميزة, أسعار المنتجات',
};

export default function PremiumPage() {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: 'بحث ذكي',
      description: 'اكتشاف الأسعار من مئات المتاجر والمواقع الإلكترونية تلقائياً'
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: 'في الوقت الفعلي',
      description: 'أسعار محدثة لحظياً من أحدث المصادر المتاحة'
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      title: 'تغطية عالمية',
      description: 'أسعار من جميع أنحاء العالم بعملات مختلفة'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: 'تحليل دقيق',
      description: 'تقييم دقة البيانات ومصداقية المصادر'
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: 'موثوق وآمن',
      description: 'بيانات محمية ومشفرة مع ضمان الخصوصية'
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: 'سرعة فائقة',
      description: 'نتائج فورية خلال ثوانٍ معدودة'
    }
  ];

  const useCases = [
    {
      title: 'التجار والمستوردين',
      description: 'مراقبة أسعار المنافسين وتحديد أفضل مصادر الاستيراد لتوفير آلاف الجنيهات',
      example: 'مثال: وفر 5000 ج.م عند استيراد 10 أجهزة iPhone 15 من الإمارات بدلاً من أمريكا'
    },
    {
      title: 'المتسوقين الأذكياء',
      description: 'العثور على أفضل الصفقات قبل الشراء أو السفر',
      example: 'مثال: اكتشف أن Samsung Galaxy S24 أرخص بـ 3000 ج.م في دبي عن القاهرة'
    },
    {
      title: 'محلات الموبايلات',
      description: 'تحديد أسعار تنافسية ومعرفة اتجاهات السوق',
      example: 'مثال: تتبع أسعار أحدث الهواتف لضمان أفضل هامش ربح'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              الخدمة المميزة
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اكتشف أسعار المنتجات في الوقت الفعلي من جميع أنحاء العالم باستخدام 
            تقنية الذكاء الاصطناعي المتقدمة من Perplexity AI
          </p>
        </div>

        {/* Main Component */}
        <div className="mb-12">
          <PremiumPriceDiscovery />
        </div>

        {/* Value Proposition Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-800 mb-2">💰 الخدمة تدفع تكلفة نفسها!</h2>
                <p className="text-green-700 text-lg">وفر آلاف الجنيهات على مشترياتك الأولى</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">2000+ ج.م</div>
                  <p className="text-sm text-green-700">متوسط التوفير على iPhone واحد</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">199 ج.م</div>
                  <p className="text-sm text-green-700">تكلفة الاشتراك الشهري</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1800+ ج.م</div>
                  <p className="text-sm text-green-700">صافي التوفير من أول عملية شراء</p>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-green-800 font-medium">
                  🎯 العائد على الاستثمار: +1200% من أول استخدام!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">مميزات الخدمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">حالات الاستخدام</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>مثال:</strong> {useCase.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">مقارنة الخطط</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'مجاني', price: 'مجاناً', queries: '0', features: ['الحاسبة الأساسية', 'مقارنات ثابتة'] },
              { name: 'أساسي', price: '199 ج.م', queries: '100', features: ['اكتشاف الأسعار', 'تحديثات شهرية', 'دعم فني'] },
              { name: 'احترافي', price: '499 ج.م', queries: '500', features: ['تحليلات متقدمة', 'تتبع الاتجاهات', 'تقارير مفصلة'] },
              { name: 'مؤسسي', price: '1299 ج.م', queries: '2000', features: ['API مخصص', 'دعم أولوية', 'تكامل مخصص'] }
            ].map((plan, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${index === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                  <p className="text-gray-600 mb-4">{plan.queries} استعلام/شهر</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center justify-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">التفاصيل التقنية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">مصادر البيانات</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• متاجر إلكترونية رسمية</li>
                  <li>• مواقع مقارنة الأسعار</li>
                  <li>• منصات التجارة الإلكترونية</li>
                  <li>• مواقع الشركات المصنعة</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">ضمانات الجودة</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• تحديث البيانات كل ساعة</li>
                  <li>• تقييم مصداقية المصادر</li>
                  <li>• فلترة البيانات المشكوك فيها</li>
                  <li>• نسخ احتياطية متعددة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">ابدأ رحلتك مع الخدمة المميزة</h2>
              <p className="mb-4">
                انضم إلى آلاف المستخدمين المصريين الذين يوفرون المال والوقت باستخدام خدمتنا المتقدمة
              </p>
              <p className="mb-6 text-blue-100 text-sm">
                💳 ادفع بسهولة عبر: فوري • فودافون كاش • أورانج موني • بطاقات فيزا/ماستركارد
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  🚀 ابدأ بـ 199 ج.م فقط
                </button>
                <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  📞 تواصل معنا
                </button>
              </div>
              <p className="mt-4 text-xs text-blue-200">
                ⭐ ضمان استرداد المبلغ خلال 7 أيام • بدون رسوم خفية • إلغاء في أي وقت
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 