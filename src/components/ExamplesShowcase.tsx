"use client";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ExampleDevice {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  egyptPrice: number;
  comparison: {
    country: string;
    countryCode: string;
    flag: string;
    price: number;
    currency: string;
    savings: number;
    isCheaper: boolean;
  };
  description: string;
  specs: string[];
}

const exampleDevices: ExampleDevice[] = [
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    // Use the specific Galaxy phone image
    image: '/images/@galaxy icon.png',
    category: 'موبايل',
    egyptPrice: 51999,
    comparison: {
      country: 'السعودية',
      countryCode: 'SAU',
      flag: '🇸🇦',
      price: 6200, // Raw price in SAR
      currency: 'SAR',
      savings: -8765, // Actually more expensive after customs
      isCheaper: false
    },
    description: 'هاتف سامسونج الرائد بكاميرا 200 ميجابكسل وهيكل من التيتانيوم - مع جمارك وضرايب 38.5%',
    specs: ['200MP كاميرا', 'هيكل تيتانيوم', 'S Pen مدمج', '12GB RAM']
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    // Use the specific iPhone image
    image: '/images/@iphone icon.png',
    category: 'موبايل',
    egyptPrice: 71500,
    comparison: {
      country: 'الإمارات',
      countryCode: 'UAE',
      flag: '🇦🇪',
      price: 4399, // Raw price in AED
      currency: 'AED',
      savings: 11600, // Cheaper even with customs (one phone exemption)
      isCheaper: true
    },
    description: 'آيفون الرائد من آبل بمعالج A17 Pro - موبايل واحد فقط (بدون جمارك)',
    specs: ['A17 Pro معالج', 'كاميرا 48MP', 'تيتانيوم', '256GB تخزين']
  },
  {
    id: 'redmi-note-11s',
    name: 'Redmi Note 11S',
    brand: 'Xiaomi',
    // Use a generic phone image for Xiaomi (you can replace with specific Xiaomi image if available)
    image: '/images/xiaomi-phone.png',
    category: 'موبايل',
    egyptPrice: 8444,
    comparison: {
      country: 'الكويت',
      countryCode: 'KWT',
      flag: '🇰🇼',
      price: 82, // Raw price in KWD
      currency: 'KWD',
      savings: -10012, // Much more expensive after customs
      isCheaper: false
    },
    description: 'هاتف شاومي متوسط الفئة بكاميرا 108 ميجابكسل - مع جمارك وضرايب 38.5%',
    specs: ['108MP كاميرا', '6GB RAM', '5000mAh بطارية', 'AMOLED شاشة']
  },
  {
    id: 'moto-g85-5g',
    name: 'Moto G85 5G',
    brand: 'Motorola',
    // Use a generic phone image for Motorola (you can replace with specific Motorola image if available)
    image: '/images/motorola-phone.png',
    category: 'موبايل',
    egyptPrice: 14933,
    comparison: {
      country: 'أمريكا',
      countryCode: 'USA',
      flag: '🇺🇸',
      price: 199, // Raw price in USD
      currency: 'USD',
      savings: 5083, // Cheaper even with customs (one phone exemption)
      isCheaper: true
    },
    description: 'موتورولا بذاكرة عشوائية كبيرة وبطارية قوية - موبايل واحد فقط (بدون جمارك)',
    specs: ['12GB RAM', '5000mAh بطارية', '5G شبكة', 'شحن سريع']
  }
];

interface ExampleResultProps {
  device: ExampleDevice;
  onBack: () => void;
  onStartCalculation?: () => void;
}

function ExampleResult({ device, onBack, onStartCalculation }: ExampleResultProps) {
  const { comparison } = device;
  
  const handleStartCalculation = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Call the reset function if provided
    if (onStartCalculation) {
      onStartCalculation();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-4"
      dir="rtl"
    >
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeftIcon className="ml-2 h-4 w-4" />
        رجوع للأمثلة
      </Button>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image
                  src={device.image}
                  alt={device.name}
                  fill
                  sizes="48px"
                  className="object-cover rounded-md"
                />
              </div>
              <div>
                <CardTitle className="text-lg">{device.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{device.brand}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{device.description}</p>
          <div className="flex flex-wrap gap-2">
            {device.specs.map((spec, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                {spec}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Result */}
      <Card className={`${comparison.isCheaper ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
        <CardHeader>
          <CardTitle className="text-base">
            {comparison.isCheaper 
              ? `${comparison.flag} أرخص تجيبه من ${comparison.country}`
              : `🇪🇬 أرخص تشتريه من مصر!`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {comparison.isCheaper
            ? <>هتوفر حوالي <strong>{comparison.savings.toLocaleString('en-US')}</strong> جنيه لو جبته من {comparison.country}.</>
            : <>هتدفع حوالي <strong>{Math.abs(comparison.savings).toLocaleString('en-US')}</strong> جنيه زيادة لو جبته من {comparison.country}.</>
          }
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">تفصيل الحساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">السعر في مصر</span>
            <span className="font-bold">{device.egyptPrice.toLocaleString('en-US')} ج.م</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="font-medium">السعر الأصلي في {comparison.country}</span>
            <span className="font-bold">
              {comparison.price.toLocaleString('en-US')} {comparison.currency}
            </span>
          </div>
          {/* Show calculation details */}
          <div className="text-xs text-muted-foreground p-3 bg-yellow-50 rounded-lg">
            <div className="font-medium mb-2">تفاصيل الحساب:</div>
            {device.description.includes('بدون جمارك') ? (
              <div>• موبايل واحد فقط للاستعمال الشخصي<br/>• معفى من الجمارك والضرايب</div>
            ) : (
              <div>• جمارك وضرايب: 38.5% من القيمة<br/>• ينطبق على الموبايلات المتعددة أو التجارية</div>
            )}
          </div>
          <div className={`flex justify-between items-center p-3 rounded-lg ${comparison.isCheaper ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className="font-medium">
              {comparison.isCheaper ? 'التوفير النهائي' : 'التكلفة الإضافية'}
            </span>
            <span className={`font-bold ${comparison.isCheaper ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(comparison.savings).toLocaleString('en-US')} ج.م
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-blue-800 mb-3">
              عايز تحسب لجهازك؟ ابدأ الحساب دلوقتي!
            </p>
            <Button onClick={handleStartCalculation} className="w-full">
              احسب لجهازي
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ExamplesShowcaseProps {
  onStartCalculation?: () => void;
}

export function ExamplesShowcase({ onStartCalculation }: ExamplesShowcaseProps) {
  const [selectedDevice, setSelectedDevice] = useState<ExampleDevice | null>(null);

  if (selectedDevice) {
    return (
      <ExampleResult 
        device={selectedDevice} 
        onBack={() => setSelectedDevice(null)}
        onStartCalculation={onStartCalculation}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
      dir="rtl"
    >
      <Card className="bg-transparent shadow-none border-none mb-0">
        <CardHeader>
          <CardTitle className="text-lg text-center">أمثلة من السوق</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            شوف أمثلة حقيقية لأسعار الأجهزة في مصر مقارنة بالخارج
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {exampleDevices.map((device) => (
          <Card 
            key={device.id} 
            className="cursor-pointer shadow-none bg-zinc-100 !pt-0 !px-0 transition-all hover:bg-white duration-200"
            onClick={() => setSelectedDevice(device)}
          >
            <CardContent className="pt-4">
          <div className="w-full h-24 relative mb-3 rounded-lg overflow-hidden">
            <Image
              src={device.image}
              alt={device.name}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{device.name}</h3>
                  <p className="text-xs text-muted-foreground">{device.brand}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>مصر:</span>
                  <span className="font-medium">{(device.egyptPrice / 1000).toFixed(0)}k ج.م</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{device.comparison.country}:</span>
                  <span className="font-medium">
                    {device.comparison.price.toLocaleString('en-US')} {device.comparison.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t">
                  <span className={`text-xs font-medium ${device.comparison.isCheaper ? 'text-green-600' : 'text-red-600'}`}>
                    {device.comparison.isCheaper 
                      ? `توفير: ${(device.comparison.savings / 1000).toFixed(0)}k`
                      : `إضافية: ${(Math.abs(device.comparison.savings) / 1000).toFixed(0)}k`
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">تفاصيل</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              الأسعار تقريبية وقد تختلف حسب المتجر والوقت
            </p>
            <p className="text-xs text-gray-500">
              استخدم الحاسبة أعلاه لحساب دقيق لجهازك
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 