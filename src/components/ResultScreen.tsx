"use client";
import { Button } from '@/components/ui/button';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';
import { usePurchaseCalculator } from '../hooks/usePurchaseCalculator';
import PriceBreakdown from './PriceBreakdown';
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
import React from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ChartDataLabels);

export function ResultScreen({ value, onBack }: {
  value: PurchaseState;
  onBack: () => void;
}) {
  const { base, tax, customs, totalAbroad } = usePurchaseCalculator(value);
  const localPrice = value.localPrice;

  // Chart data
  const chartLabels = value.mode === 'phone' 
    ? ['سعر في مصر', 'بره (بدون جمارك)', 'بره (مع جمارك وضرايب)']
    : ['سعر في مصر', 'بره (بدون ضريبة)', 'بره (مع ضريبة)'];
  const abroadTaxOnly = Math.round(base + tax);
  const abroadTaxCustoms = totalAbroad;
  const abroadVals: number[] = [localPrice, abroadTaxOnly, abroadTaxCustoms];
  let barColors: string[] = [];
  const customsBarLabel = value.mode === 'phone' ? 'بره (مع جمارك وضرايب)' : 'بره (مع ضريبة)';
  
  // Always show all bars since importing is always enabled
  const filtered = abroadVals.filter(val => val > 0);
  const minVal = Math.min(...filtered);
  const maxVal = Math.max(...filtered);
  barColors = abroadVals.map(v => v === minVal ? '#4caf50' : v === maxVal ? '#ff9800' : '#909090');
  
  const chartData = {
    labels: [chartLabels[0], chartLabels[1], customsBarLabel],
    datasets: [
      {
        label: 'السعر بالجنيه',
        data: abroadVals,
        backgroundColor: barColors,
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    locale: 'ar-EG',
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        color: '#000',
        font: { weight: 'bold' as const },
        formatter: (value: number) => Math.round(value).toLocaleString('en-US') + ' ج.م',
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'السعر بالجنيه' }, beginAtZero: true },
      y: { title: { display: false }, beginAtZero: true },
    },
  };

  // Result alert
  const isCheaperAbroad = totalAbroad < localPrice;
  const diff = Math.round(Math.abs(totalAbroad - localPrice));

  return (
    <div className="space-y-4" dir="rtl">
      <Button variant="ghost" onClick={onBack} className="mb-2">← رجوع</Button>
      {/* Result Alert */}
      <Card className={`w-full ${isCheaperAbroad ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gradient-to-r from-red-200 via-white to-gray-300 text-gray-900 border-zinc-500/10'}`}>
        <CardHeader>
          <CardTitle className="text-base">
            {isCheaperAbroad ? '✔️ أرخص تجيبه من بره!' : '🇪🇬 أرخص تشتريه من مصر!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {isCheaperAbroad
            ? <>هتوفر حوالي <strong>{diff.toLocaleString('en-US')}</strong> جنيه لو جبته من بره.</>
            : <>هتدفع حوالي <strong>{diff.toLocaleString('en-US')}</strong> جنيه زيادة لو جبته من بره.</>}
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
                  <strong>مصلحة الجمارك المصرية:</strong> "يتم تطبيق رسوم جمركية بنسبة 38.5% على الهواتف المحمولة المستوردة اعتباراً من 1 يناير 2025"
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