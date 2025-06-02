"use client";
import { Button } from '@/components/ui/button';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';
import { usePurchaseCalculator } from '../hooks/usePurchaseCalculator';
import PriceBreakdown from './PriceBreakdown';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  let customsBarLabel = value.mode === 'phone' ? 'بره (مع جمارك وضرايب)' : 'بره (مع ضريبة)';
  if (customs === 0) {
    abroadVals[2] = 0;
    barColors = abroadVals.map((v, i) => {
      if (i === 2) return '#cccccc';
      const filtered = abroadVals.filter(val => val > 0);
      const minVal = Math.min(...filtered);
      const maxVal = Math.max(...filtered);
      if (v === minVal) return '#4caf50';
      if (v === maxVal) return '#ff9800';
      return '#909090';
    });
    customsBarLabel += ' (غير مطبقة)';
  } else {
    const filtered = abroadVals.filter(val => val > 0);
    const minVal = Math.min(...filtered);
    const maxVal = Math.max(...filtered);
    barColors = abroadVals.map(v => v === minVal ? '#4caf50' : v === maxVal ? '#ff9800' : '#909090');
  }
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
      <Card className={`w-full ${isCheaperAbroad ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
        <CardHeader>
          <CardTitle className="text-base">
            {isCheaperAbroad ? '✔️ أرخص تجيبه من بره!' : '⚠️ أرخص تشتريه من مصر!'}
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
    </div>
  );
} 