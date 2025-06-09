"use client";
import { Button } from '@/components/ui/button';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';
import { usePurchaseCalculator } from '../hooks/usePurchaseCalculator';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { logSubmission, createSubmissionData, validateSubmissionData } from '@/lib/analytics';
import PriceBreakdown from './PriceBreakdown';
import { SocialShare } from './SocialShare';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ChartDataLabels);

// Set global Chart.js font defaults
ChartJS.defaults.font.family = "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif";

// Country mappings
const countryFlags: Record<string, string> = {
  SAU: "🇸🇦", UAE: "🇦🇪", EUR: "🇪🇺", USA: "🇺🇸", KWT: "🇰🇼", OMN: "🇴🇲", QAT: "🇶🇦", TUR: "🇹🇷", LBY: "🇱🇾", IRQ: "🇮🇶", EGY: "🇪🇬", JOR: "🇯🇴", LBN: "🇱🇧", MAR: "🇲🇦", TUN: "🇹🇳", ALG: "🇩🇿"
};

const countryNames: Record<string, string> = {
  SAU: "السعودية",
  UAE: "الإمارات",
  EUR: "أوروبا",
  USA: "أمريكا",
  KWT: "الكويت",
  OMN: "عُمان",
  QAT: "قطر",
  TUR: "تركيا",
  LBY: "ليبيا",
  IRQ: "العراق",
  EGY: "مصر",
  JOR: "الأردن",
  LBN: "لبنان",
  MAR: "المغرب",
  TUN: "تونس",
  ALG: "الجزائر"
};

export function ResultScreen({ value, onBack }: {
  value: PurchaseState;
  onBack: () => void;
}) {
  const { rates: liveRates } = useExchangeRates();
  const { base, tax, customs, totalAbroad } = usePurchaseCalculator(value, liveRates);
  const localPrice = value.localPrice;

  // Ensure font is applied to Chart.js
  useEffect(() => {
    ChartJS.defaults.font.family = "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif";
  }, []);

  // Log submission data
  useEffect(() => {
    const submissionData = createSubmissionData(value, totalAbroad, localPrice);
    
    // Validate data before logging
    if (validateSubmissionData && validateSubmissionData(submissionData)) {
      logSubmission(submissionData).then(result => {
        // In development, we can show more detailed feedback
        if (process.env.NODE_ENV === 'development' && !result.success) {
          console.warn('Logging failed:', result.error);
        }
      }).catch(error => {
        // This shouldn't happen with the new implementation, but just in case
        console.warn('Unexpected logging error:', error);
      });
    } else {
      console.warn('Invalid submission data, skipping log:', submissionData);
    }
  }, [value, totalAbroad, localPrice]);

  // Chart data
  const chartLabels = value.mode === 'phone' 
    ? ['سعر في مصر', 'بره (بدون جمارك)', 'بره (مع جمارك وضرايب)']
    : ['سعر في مصر', 'بره (بدون ضريبة)', 'بره (مع ضريبة)'];
  const abroadTaxOnly = Math.round(base + tax);
  const abroadTaxCustoms = Math.round(totalAbroad);
  const abroadVals: number[] = [Math.round(localPrice), abroadTaxOnly, abroadTaxCustoms];
  let barColors: string[] = [];
  const customsBarLabel = value.mode === 'phone' ? 'بره (مع جمارك وضرايب)' : 'بره (مع ضريبة)';
  
  // Always show all bars since importing is always enabled
  const filtered = abroadVals.filter(val => val > 0);
  const minVal = Math.min(...filtered);
  const maxVal = Math.max(...filtered);
  
  // Use sophisticated Tailwind colors that work well together
  const colors = {
    cheapest: '#10b981',    // emerald-500 - for the cheapest option
    expensive: '#f59e0b',   // amber-500 - for the most expensive option  
    middle: '#6366f1',      // indigo-500 - for middle option
    neutral: '#64748b'      // slate-500 - for neutral/equal values
  };
  
  barColors = abroadVals.map(v => {
    if (v === minVal) return colors.cheapest;
    if (v === maxVal) return colors.expensive;
    return colors.middle;
  });
  
  const chartData = {
    labels: [chartLabels[0], chartLabels[1], customsBarLabel],
    datasets: [
      {
        label: 'السعر بالجنيه',
        data: abroadVals,
        backgroundColor: barColors,
        hoverBackgroundColor: barColors.map(color => {
          // Create slightly darker hover colors
          const colorMap: Record<string, string> = {
            '#10b981': '#059669', // emerald-600
            '#f59e0b': '#d97706', // amber-600
            '#6366f1': '#4f46e5', // indigo-600
            '#64748b': '#475569'  // slate-600
          };
          return colorMap[color] || color;
        }),
        borderColor: barColors.map(color => {
          // Add subtle borders
          const borderMap: Record<string, string> = {
            '#10b981': '#047857', // emerald-700
            '#f59e0b': '#b45309', // amber-700
            '#6366f1': '#3730a3', // indigo-700
            '#64748b': '#334155'  // slate-700
          };
          return borderMap[color] || color;
        }),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    locale: 'ar-EG',
    font: {
      family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: { 
        display: false,
        labels: {
          font: {
            family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
          }
        }
      },
      title: { 
        display: false,
        font: {
          family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
        }
      },
      datalabels: {
        color: '#ffffff',
        font: { 
          weight: 'bold' as const,
          family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
          size: 12,
        },
        formatter: (value: number) => Math.round(value).toLocaleString('en-US') + ' ج.م',
        anchor: 'center' as const,
        align: 'center' as const,
        textStrokeColor: 'rgba(0,0,0,0.3)',
        textStrokeWidth: 1,
      },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
          size: 12,
        },
        callbacks: {
          label: function(context: { parsed: { x: number } }) {
            return `${Math.round(context.parsed.x).toLocaleString('en-US')} جنيه مصري`;
          }
        }
      },
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'السعر بالجنيه',
          font: {
            family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
            size: 12,
            weight: 'bold' as const,
          },
          color: '#64748b',
        }, 
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          font: {
            family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
            size: 11,
          },
          color: '#64748b',
          callback: function(value: string | number) {
            return Math.round(Number(value)).toLocaleString('en-US');
          }
        }
      },
      y: { 
        title: { 
          display: false,
          font: {
            family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
          }
        }, 
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif",
            size: 11,
            weight: 500,
          },
          color: '#374151',
          padding: 8,
        }
      },
    },
  };

  // Result alert
  const isCheaperAbroad = totalAbroad < localPrice;
  const diff = Math.round(Math.abs(Math.round(totalAbroad) - Math.round(localPrice)));
  
  // Get country-specific information
  const countryFlag = countryFlags[value.country] || "🌍";
  const countryName = countryNames[value.country] || "الخارج";

  return (
    <div className="space-y-4" dir="rtl">
      <Button variant="ghost" onClick={onBack} className="mb-2">← رجوع</Button>
      {/* Result Alert */}
      <Card className={`w-full ${isCheaperAbroad ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gradient-to-r from-red-200 via-white to-gray-300 text-gray-900 border-zinc-500/10'}`}>
        <CardHeader>
          <CardTitle className="text-base">
            {isCheaperAbroad ? `${countryFlag} أرخص تجيبه من ${countryName}` : '🇪🇬 أرخص تشتريه من مصر!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {isCheaperAbroad
            ? <>هتوفر حوالي <strong>{diff.toLocaleString('en-US')}</strong> جنيه لو جبته من {countryName}.</>
            : <>هتدفع حوالي <strong>{diff.toLocaleString('en-US')}</strong> جنيه زيادة لو جبته من {countryName}.</>}
        </CardContent>
      </Card>
      {/* Breakdown Card */}
      <PriceBreakdown
        foreignPriceEGP={base}
        phoneTax={tax}
        customs={customs}
        totalForeign={totalAbroad}
        mode={value.mode || undefined}
      />
      {/* Horizontal Bar Chart */}
      <Card className="mt-2">
        <CardHeader>
          <CardTitle className="text-base">مقارنة الأسعار</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 220 }}>
          <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} aria-label="مخطط مقارنة الأسعار" />
        </CardContent>
      </Card>
      
      {/* Social Share Component */}
      <SocialShare />
      
      {/* Resources Accordion */}
      <Card className="mt-2 bg-transparent shadow-none border-none ">
        <CardHeader>
          <CardTitle className="text-base">مصادر ومعلومات مفيدة</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="customs-law">
              <AccordionTrigger className="text-right">قانون الجمارك المصرية</AccordionTrigger>
              <AccordionContent className="text-right text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>مصلحة الجمارك المصرية:</strong> &quot;يتم تطبيق رسوم جمركية بنسبة 38.5% على الهواتف المحمولة المستوردة اعتباراً من 1 يناير 2025&quot;
                </p>
                <p>
                  دي القوانين الجديدة اللي طبقتها الحكومة المصرية عشان تحمي الصناعة المحلية وتقلل الاستيراد العشوائي.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="comparison-tips">
              <AccordionTrigger className="text-right">نصايح للمقارنة الذكية</AccordionTrigger>
              <AccordionContent className="text-right text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p><strong>• اسعار السوق المحلي:</strong> دور على أكتر من محل واقارن الأسعار قبل ما تقرر</p>
                  <p><strong>• ضمان الجهاز:</strong> الأجهزة المستوردة ممكن ماتكونش ليها ضمان محلي</p>
                  <p><strong>• العملة الأجنبية:</strong> خد بالك من تقلبات أسعار الصرف</p>
                  <p><strong>• مصاريف إضافية:</strong> حسب تكلفة الشحن والتأمين كمان</p>
                  <p><strong>• مواقع مقارنة الأسعار:</strong> 
                    <a href="https://www.yaoota.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">ياقوطة</a> | 
                    <a href="https://www.jumia.com.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">جوميا</a> | 
                    <a href="https://www.amazon.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">امازون</a>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="travel-tips">
              <AccordionTrigger className="text-right">نصايح السفر والاستيراد</AccordionTrigger>
              <AccordionContent className="text-right text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p><strong>موبايل واحد فقط:</strong> لو معاك موبايل واحد للاستعمال الشخصي، غالباً هتعدي من غير مشاكل</p>
                  <p><strong>الفواتير مهمة:</strong> خلي معاك فاتورة الشراء الأصلية دايماً</p>
                  <p><strong>إعلان الجمارك:</strong> لو القيمة عالية، أعلن عنها في الجمارك عشان تتجنب المشاكل</p>
                  <p><strong>قوانين متغيرة:</strong> القوانين بتتغير، فتأكد من آخر التحديثات قبل السفر</p>
                  <p><strong>دليل المسافر:</strong> 
                    <a href="https://www.cairo-airport.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">مطار القاهرة</a> | 
                    <a href="https://www.egyptair.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">مصر للطيران</a>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="official-sources">
              <AccordionTrigger className="text-right">المصادر الرسمية</AccordionTrigger>
              <AccordionContent className="text-right text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p><strong>مصلحة الجمارك المصرية:</strong> <a href="https://www.customs.gov.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">الموقع الرسمي</a> للاستعلام عن آخر التعريفات الجمركية</p>
                  <p><strong>البنك المركزي المصري:</strong> <a href="https://www.cbe.org.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">أسعار الصرف الرسمية</a></p>
                  <p><strong>وزارة التجارة والصناعة:</strong> <a href="https://www.mti.gov.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">سياسات الاستيراد والتصدير</a></p>
                  <p><strong>الهيئة العامة للاستعلامات:</strong> <a href="https://www.sis.gov.eg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">معلومات حكومية رسمية</a></p>
                  <p className="text-xs text-orange-600 mt-3">
                    تنبيه: هذه المعلومات إرشادية، يُنصح بالتأكد من المصادر الرسمية قبل اتخاذ أي قرار
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 