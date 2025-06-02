"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, TrendingUp, Star } from 'lucide-react';

export function PopularLinks() {
  const popularLinks = [
    // Row 1 - Popular iPhones
    {
      title: 'iPhone 15 Pro Max',
      href: '/compare/iphone-15-pro-max-256gb',
      description: 'مقارنة أسعار آيفون 15 برو ماكس',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'flagship'
    },
    {
      title: 'iPhone 15',
      href: '/compare/iphone-15-128gb',
      description: 'مقارنة أسعار آيفون 15 عادي',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'flagship'
    },
    {
      title: 'iPhone 14',
      href: '/compare/iphone-14-128gb',
      description: 'مقارنة أسعار آيفون 14',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'flagship'
    },
    
    // Row 2 - Popular Samsung
    {
      title: 'Galaxy S24 Ultra',
      href: '/compare/samsung-galaxy-s24-ultra-256gb',
      description: 'مقارنة أسعار جالاكسي S24 الترا',
      icon: <Star className="w-4 h-4" />,
      category: 'flagship'
    },
    {
      title: 'Galaxy S23',
      href: '/compare/samsung-galaxy-s23-256gb',
      description: 'مقارنة أسعار جالاكسي S23',
      icon: <Star className="w-4 h-4" />,
      category: 'flagship'
    },
    {
      title: 'Xiaomi 14 Ultra',
      href: '/compare/xiaomi-14-ultra-512gb',
      description: 'مقارنة أسعار شاومي 14 الترا',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'flagship'
    },
    
    // Row 3 - Brand Categories
    {
      title: 'موبايلات Apple',
      href: '/compare/brand/apple',
      description: 'جميع موبايلات آبل',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'brand'
    },
    {
      title: 'موبايلات Samsung',
      href: '/compare/brand/samsung',
      description: 'جميع موبايلات سامسونج',
      icon: <Star className="w-4 h-4" />,
      category: 'brand'
    },
    {
      title: 'موبايلات Xiaomi',
      href: '/compare/brand/xiaomi',
      description: 'جميع موبايلات شاومي',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'brand'
    },
    
    // Row 4 - Price Categories
    {
      title: 'تحت 20 ألف',
      href: '/compare/under-20000',
      description: 'موبايلات تحت 20 ألف جنيه',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'budget'
    },
    {
      title: '20-50 ألف',
      href: '/compare/20000-50000',
      description: 'موبايلات من 20 إلى 50 ألف',
      icon: <Star className="w-4 h-4" />,
      category: 'mid-range'
    },
    {
      title: 'أكثر من 50 ألف',
      href: '/compare/over-50000',
      description: 'موبايلات أكثر من 50 ألف',
      icon: <Smartphone className="w-4 h-4" />,
      category: 'flagship'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'flagship':
        return 'border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50';
      case 'brand':
        return 'border-green-200 hover:border-green-300 bg-green-50/50 hover:bg-green-50';
      case 'mid-range':
        return 'border-orange-200 hover:border-orange-300 bg-orange-50/50 hover:bg-orange-50';
      case 'budget':
        return 'border-purple-200 hover:border-purple-300 bg-purple-50/50 hover:bg-purple-50';
      default:
        return 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50';
    }
  };

  return (
    <div className="py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">مقارنات شائعة</h2>
          <p className="text-gray-600">اكتشف أسعار أشهر الموبايلات في مصر والخارج</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Card className={`h-full transition-all !p-0 duration-200 cursor-pointer ${getCategoryColor(link.category)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {link.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Link 
            href="/compare/category/flagship"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            عرض جميع المقارنات
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 