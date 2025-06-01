'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PriceBreakdown from "@/components/PriceBreakdown";
import { useHighValueGuard } from "@/lib/useHighValueGuard";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon } from 'lucide-react';
import { useMediaQuery } from '@/lib/useMediaQuery';

// Exchange rates (EGP per unit, June 2025, approx)
const rates = {
  SAU: { cur: "SAR", rate: 13.33 },
  UAE: { cur: "AED", rate: 13.62 },
  EUR: { cur: "EUR", rate: 56.45 },
  USA: { cur: "USD", rate: 50.0 },
  KWT: { cur: "KWD", rate: 163.0 },
  OMN: { cur: "OMR", rate: 130.0 },
  QAT: { cur: "QAR", rate: 13.74 },
  TUR: { cur: "TRY", rate: 1.56 },
  LBY: { cur: "LYD", rate: 10.3 },
  IRQ: { cur: "IQD", rate: 0.038 },
  EGY: { cur: "EGP", rate: 1.0 },
  JOR: { cur: "JOD", rate: 70.5 },
  LBN: { cur: "LBP", rate: 0.033 },
  MAR: { cur: "MAD", rate: 5.5 },
  TUN: { cur: "TND", rate: 18.0 },
  ALG: { cur: "DZD", rate: 0.37 },
};

type CountryCode = keyof typeof rates;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Map country code to flag emoji
const countryFlags: Record<CountryCode, string> = {
  SAU: "🇸🇦", UAE: "🇦🇪", EUR: "🇪🇺", USA: "🇺🇸", KWT: "🇰🇼", OMN: "🇴🇲", QAT: "🇶🇦", TUR: "🇹🇷", LBY: "🇱🇾", IRQ: "🇮🇶", EGY: "🇪🇬", JOR: "🇯🇴", LBN: "🇱🇧", MAR: "🇲🇦", TUN: "🇹🇳", ALG: "🇩🇿"
};

export default function Home() {
  // State for all form fields
  const [country, setCountry] = useState<CountryCode>("SAU");
  const [priceAbroad, setPriceAbroad] = useState("");
  const [localPrice, setLocalPrice] = useState("");
  const [customsRate, setCustomsRate] = useState(38); // percent
  const [onePhone, setOnePhone] = useState(true); // true = one phone (duty free)
  const [lastCustomsRate, setLastCustomsRate] = useState(38);
  const { checkHighValue } = useHighValueGuard();
  const [mode, setMode] = useState<'phone' | 'laptop'>('phone');
  const [caught, setCaught] = useState(false);
  const [taxRate, setTaxRate] = useState(18);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);

  // Compute EGP value for priceAbroad
  const rate = rates[country].rate;
  const currencyLabel = rates[country].cur;
  const abroadRaw = parseFloat(priceAbroad) || 0;
  const priceInEGP = abroadRaw ? abroadRaw * rate : 0;

  // Update calculation logic
  const base = abroadRaw * rate;
  const isCaught = caught;
  const tax = isCaught ? base * (taxRate / 100) : 0;
  let customs = 0;
  if (mode === 'phone' && isCaught && !onePhone && base > 15000) {
    customs = base * 0.20;
  }
  const totalAbroad = base + tax + customs;

  // Calculations for results
  const localPriceNum = parseFloat(localPrice) || 0;

  // Chart data (Arabic labels, new logic)
  const chartLabels = ['سعر في مصر', 'بره (ضريبة الموبايل فقط)', 'بره (ضريبة + جمارك)'];
  const abroadTaxOnly = base + tax;
  const abroadTaxCustoms = totalAbroad;

  // If customs is not applicable, grey out or hide the customs bar
  const abroadVals: number[] = [localPriceNum, abroadTaxOnly, abroadTaxCustoms];
  let barColors: string[] = [];
  let customsBarLabel = 'بره (ضريبة + جمارك)';
  if (customs === 0) {
    // Grey out the customs bar and set its value to 0 for visual clarity
    abroadVals[2] = 0;
    barColors = abroadVals.map((v, i) => {
      if (i === 2) return '#cccccc'; // customs bar greyed
      // Color logic: green for cheapest, orange for most expensive, neutral for middle
      const filtered = abroadVals.filter(val => val > 0);
      const minVal = Math.min(...filtered);
      const maxVal = Math.max(...filtered);
      if (v === minVal) return '#4caf50';
      if (v === maxVal) return '#ff9800'; // orange for most expensive
      return '#909090';
    });
    customsBarLabel += ' (غير مطبقة)';
  } else {
    // Color logic: green for cheapest, orange for most expensive, neutral for middle
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
    responsive: true,
    maintainAspectRatio: false,
    locale: 'ar-EG',
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        color: '#000',
        font: { weight: 'bold' as const },
        formatter: (value: number) => value.toLocaleString('en-US') + ' ج.م',
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'طريقة الشراء' } },
      y: { title: { display: true, text: 'السعر بالجنيه' }, beginAtZero: true },
    },
  };

  // Only show chart and breakdown if all inputs are filled
  const allInputsFilled = country && priceAbroad && localPrice;

  const isMobile = useMediaQuery("(max-width: 640px)");
  const countries = Object.entries(rates).map(([code, { cur }]) => ({
    code,
    flag: countryFlags[code as CountryCode],
    label: (() => {
      switch (code) {
        case 'USA': return 'أمريكا (دولار)';
        case 'EUR': return 'أوروبا (يورو)';
        case 'SAU': return 'السعودية (ريـال)';
        case 'UAE': return 'الإمارات (درهم)';
        case 'KWT': return 'الكويت (دينار)';
        case 'OMN': return 'عُمان (ريـال)';
        case 'QAT': return 'قطر (ريـال)';
        case 'TUR': return 'تركيا (ليرة)';
        case 'LBY': return 'ليبيا (دينار)';
        case 'IRQ': return 'العراق (دينار)';
        case 'EGY': return 'مصر (جنيه)';
        case 'JOR': return 'الأردن (دينار)';
        case 'LBN': return 'لبنان (ليرة)';
        case 'MAR': return 'المغرب (درهم)';
        case 'TUN': return 'تونس (دينار)';
        case 'ALG': return 'الجزائر (دينار)';
        default: return code;
      }
    })(),
  }));

  return (
    <div
      dir="rtl"
      // Add more top padding on medium+ screens for better vertical spacing
      className={`p-4 max-w-md mx-auto w-full pt-4 md:pt-20 lg:pt-24 ${!allInputsFilled ? 'min-h-screen flex flex-col justify-center items-center' : ''}`}
    >
      {/* Device Mode Toggle */}
      <div className="flex justify-center mb-4" dir="ltr">
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={(val) => setMode(val as 'phone' | 'laptop')}
          aria-label="اختر نوع الجهاز"
        >
          <ToggleGroupItem value="phone" aria-label="موبايل">📱 موبايل</ToggleGroupItem>
          <ToggleGroupItem value="laptop" aria-label="لابتوب">💻 لابتوب</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Caught at Airport Switch */}
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="caught" className="text-sm font-medium">هيفتشوك في المطار؟</Label>
        <Switch
          id="caught"
          checked={caught}
          onCheckedChange={setCaught}
          aria-label="هيفتشوك في المطار؟"
        />
      </div>

      {/* Tax Rate Slider */}
      {caught && (
        <div className="mb-4">
          <Label htmlFor="taxRate" className="text-sm font-medium">نسبة الضريبة (٪)</Label>
          <Slider
            id="taxRate"
            value={[taxRate]}
            min={10}
            max={25}
            step={1}
            onValueChange={([val]) => setTaxRate(val)}
            aria-label="نسبة الضريبة"
          />
        </div>
      )}

      {/* One Phone Only Switch (only in phone mode) */}
      {mode === 'phone' && (
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="onePhone" className="text-sm font-medium">هاتف واحد فقط (معفي)</Label>
          <Switch
            id="onePhone"
            checked={onePhone}
            onCheckedChange={setOnePhone}
            aria-label="هاتف واحد فقط (معفي)"
          />
        </div>
      )}

      {/* Form: Country and Price Inputs */}
      <form className="space-y-3 w-full" aria-label="حاسبة مقارنة الأسعار">
        {/* Country Selector */}
        <div className="w-full">
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            اختر البلد
          </label>
          {isMobile ? (
            <Sheet open={countrySheetOpen} onOpenChange={setCountrySheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {countries.find(c => c.code === country)?.label || "اختر البلد"}
                  <ChevronUpIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="p-0">
                <ul className="divide-y">
                  {countries.map(c => (
                    <li key={c.code}>
                      <button
                        className="w-full py-3 text-right px-4"
                        onClick={() => {
                          setCountry(c.code as CountryCode);
                          setCountrySheetOpen(false);
                        }}
                      >
                        {c.flag} {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          ) : (
            <Select value={country} onValueChange={val => setCountry(val as CountryCode)}>
              <SelectTrigger className="w-full" aria-label="اختيار البلد">
                <SelectValue
                  placeholder="اختر البلد"
                  className="flex flex-row-reverse items-center justify-between w-full text-right gap-2"
                  asChild
                >
                  {country ? (
                    <span className="flex flex-row-reverse items-center justify-between w-full gap-2">
                      <span className="flex-1 text-right">
                        {countries.find(c => c.code === country)?.label}
                      </span>
                      <span className="text-xl ltr:ml-2 rtl:mr-2">{countryFlags[country]}</span>
                    </span>
                  ) : (
                    <span className="flex-1 text-right">اختر البلد</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Price Abroad Input */}
        <div className="w-full">
          <label htmlFor="priceAbroad" className="block text-sm font-medium mb-1">
            السعر بره
          </label>
          <div className="relative w-full">
            <Input
              type="number"
              id="priceAbroad"
              value={priceAbroad}
              onChange={e => {
                const val = e.target.value;
                const numVal = parseFloat(val) || 0;
                const convertedEGP = numVal * rate;
                if (checkHighValue(convertedEGP)) {
                  // Optionally clear or keep the old value; here we keep it
                  return;
                }
                setPriceAbroad(val);
              }}
              placeholder="مثال: 800"
              className="text-right w-full appearance-none pr-4 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="السعر بره"
              style={{ MozAppearance: 'textfield' }}
            />
            {/* Show selected currency symbol at far left */}
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
              {currencyLabel}
            </span>
          </div>
        </div>

        {/* Local Price Input */}
        <div className="w-full">
          <label htmlFor="localPrice" className="block text-sm font-medium mb-1">
            السعر في مصر (جنيه)
          </label>
          <div className="relative w-full">
            <Input
              type="number"
              id="localPrice"
              value={localPrice}
              onChange={e => setLocalPrice(e.target.value)}
              placeholder="مثال: 20000"
              className="text-right w-full appearance-none pr-4 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="السعر في مصر"
              style={{ MozAppearance: 'textfield' }}
            />
            {/* Show EGP at far left */}
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
              EGP
            </span>
          </div>
        </div>
      </form>

      {allInputsFilled && (
        <Card className="max-w-lg w-full p-6 sm:p-8 rounded-lg shadow-md mt-4">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-right">بيانات الشراء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mt-4" style={{height: 220}}>
              {/* Add aria-label for accessibility */}
              <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} aria-label="مخطط مقارنة الأسعار" />
            </div>
            {/* Pass new props to PriceBreakdown */}
            <PriceBreakdown
              foreignPriceEGP={base}
              phoneTax={tax}
              customs={customs}
              totalForeign={totalAbroad}
            />
            {/* Result Alert: dynamic message indicating which option is cheaper */}
            {(localPriceNum && abroadRaw) ? (
              <div
                className={`mt-4 rounded-md p-4 flex items-center gap-3 w-full ${totalAbroad < localPriceNum ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-orange-100 text-orange-800 border border-orange-300'}`}
                role="alert"
                aria-live="polite"
              >
                <span style={{fontSize: 22}}>{totalAbroad < localPriceNum ? '✔️' : '⚠️'}</span>
                <div>
                  <div className="font-bold text-base">
                    {totalAbroad < localPriceNum
                      ? 'أرخص تجيبه من بره!'
                      : 'أرخص تشتريه من مصر!'}
                  </div>
                  <div className="text-sm">
                    {totalAbroad < localPriceNum
                      ? <>هتوفر حوالي <strong>{(localPriceNum - totalAbroad).toLocaleString('en-US')}</strong> جنيه لو جبته من بره.</>
                      : <>هتدفع حوالي <strong>{(totalAbroad - localPriceNum).toLocaleString('en-US')}</strong> جنيه زيادة لو جبته من بره.</>}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <footer className="mt-6 text-sm text-gray-600 leading-relaxed">
        معدّل الجمارك والضرايب على الموبايلات حوالى 38.5٪ (‏مُحدَّث 1-يونيو-2025).<br />
        مسافر ومعاك موبايل واحد شخصي غالباً هيعدّي؛ أكتر من واحد بيُحاسَب.<br />
        لو حبيت تغيّر أسعار الصرف حدّثها في الكود.
        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="source">
            <AccordionTrigger>ماذا يقول المصدر؟</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pr-4">
                <li>بيان الهيئة العامة للاستعلامات عن بدء تطبيق 38.5 ٪ على الموبايلات المستوردة بداية 1 يناير 2025 - <a href="https://sis.gov.eg/Story/203961/Egyptians-to-start-paying-taxes-on-imported-mobiles-1-January-2025%2C-not-retroactively?lang=en-us&utm_source=chatgpt.com" className="underline">SIS</a></li>
                <li>تصريح متحدث المالية لجريدة «الأهرام الإنجليزية» يشرح تفاصيل نسبة 38.5 ٪ - <a href="https://english.ahram.org.eg/News/537862.aspx?utm_source=chatgpt.com" className="underline">Ahram Online</a></li>
                <li>وكالة شينخوا تنقل عن رئيس الوزراء اعتماد النسبة نفسها للحد من التهريب - <a href="https://english.news.cn/africa/20250102/7a8bf50dbe964613abd87994331abeeb/c.html?utm_source=chatgpt.com" className="underline">Xinhua News</a></li>
                <li>«Egypt Independent» يوضح إن مسافر معاه موبايل واحد يُعفى، والزيادة تُحاسَب - <a href="https://www.egyptindependent.com/how-many-personal-phones-are-allowed-to-enter-egypt-from-the-airport/?utm_source=chatgpt.com" className="underline">Egypt Independent</a></li>
                <li>«Scoop Empire» يؤكد الإعفاء لهاتف واحد ودفع 38.5 ٪ للباقي - <a href="https://scoopempire.com/egypts-3-new-customs-measures-to-tackle-mobile-phone-smuggling/?utm_source=chatgpt.com" className="underline">Scoop Empire</a></li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </footer>
    </div>
  );
}
