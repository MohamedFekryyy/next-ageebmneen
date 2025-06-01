'use client';
import { Card } from "@/components/ui/card";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Map country code to flag emoji
const countryFlags: Record<CountryCode, string> = {
  SAU: "🇸🇦", UAE: "🇦🇪", EUR: "🇪🇺", USA: "🇺🇸", KWT: "🇰🇼", OMN: "🇴🇲", QAT: "🇶🇦", TUR: "🇹🇷", LBY: "🇱🇾", IRQ: "🇮🇶", EGY: "🇪🇬", JOR: "🇯🇴", LBN: "🇱🇧", MAR: "🇲🇦", TUN: "🇹🇳", ALG: "🇩🇿"
};

export default function Home() {
  // State for all form fields
  const [country, setCountry] = useState<CountryCode>("SAU");
  const [priceAbroad, setPriceAbroad] = useState("");
  const [localPrice, setLocalPrice] = useState("");
  const [customsRate, setCustomsRate] = useState(38.5);
  const [dutyFree, setDutyFree] = useState("yes");

  // Compute EGP value for priceAbroad
  const rate = rates[country].rate;
  const currencyLabel = rates[country].cur;
  const abroadRaw = parseFloat(priceAbroad) || 0;
  const priceInEGP = abroadRaw ? abroadRaw * rate : 0;

  // Calculations for results
  const localPriceNum = parseFloat(localPrice) || 0;
  const withCustomsCost = priceInEGP * (1 + customsRate / 100);
  const payDuty = dutyFree === "no";
  const finalCost = payDuty ? withCustomsCost : priceInEGP;
  const diff = localPriceNum ? localPriceNum - finalCost : 0;

  // Chart data
  const chartData = {
    labels: ['مصر', 'بره بدون جمارك', 'بره بعد الجمارك'],
    datasets: [
      {
        label: 'التكلفة بالجنيه',
        data: [localPriceNum, priceInEGP, withCustomsCost],
        backgroundColor: [
          '#4ade80', // مصر
          '#60a5fa', // بره بدون جمارك
          '#fbbf24', // بره بعد الجمارك
        ],
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Decision message logic
  let decisionMsg = "";
  if (localPriceNum && abroadRaw) {
    if (diff > 0) {
      decisionMsg = `أوفر لك تستورد: هتوفر حوالي ${diff.toLocaleString()} جم.`;
    } else if (diff < 0) {
      decisionMsg = `الأوفر تشتري من مصر: هتوفر حوالي ${Math.abs(diff).toLocaleString()} جم.`;
    } else {
      decisionMsg = "السعرين متقاربين جدًا.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] p-8">
      <Card className="max-w-lg w-full p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-right">حساب تكلفة الموبايل</h1>

        <div className="flex flex-row-reverse gap-4 items-center mb-6 flex-wrap">
          <div className="flex-1 flex flex-col items-end min-w-[180px]">
            <Label htmlFor="country" className="block font-semibold mb-1 text-base sm:text-lg">اختار الدولة</Label>
            <Select value={country} onValueChange={v => setCountry(v as CountryCode)} name="country">
              <SelectTrigger id="country" className="mb-0" />
              <SelectContent>
                <SelectItem value="SAU">🇸🇦 السعودية</SelectItem>
                <SelectItem value="UAE">🇦🇪 الإمارات</SelectItem>
                <SelectItem value="EUR">🇪🇺 أوروبا (يورو)</SelectItem>
                <SelectItem value="USA">🇺🇸 أمريكا</SelectItem>
                <SelectItem value="KWT">🇰🇼 الكويت</SelectItem>
                <SelectItem value="OMN">🇴🇲 عُمان</SelectItem>
                <SelectItem value="QAT">🇶🇦 قطر</SelectItem>
                <SelectItem value="TUR">🇹🇷 تركيا</SelectItem>
                <SelectItem value="LBY">🇱🇾 ليبيا</SelectItem>
                <SelectItem value="IRQ">🇶 العراق</SelectItem>
                <SelectItem value="EGY">🇪🇬 مصر</SelectItem>
                <SelectItem value="JOR">🇯🇴 الأردن</SelectItem>
                <SelectItem value="LBN">🇱🇧 لبنان</SelectItem>
                <SelectItem value="MAR">🇲🇦 المغرب</SelectItem>
                <SelectItem value="TUN">🇹🇳 تونس</SelectItem>
                <SelectItem value="ALG">🇩🇿 الجزائر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex flex-col items-end min-w-[180px]">
            <Label htmlFor="priceAbroad" className="block font-semibold mb-1 text-base sm:text-lg">سعر في بلد الشراء (بالعملة المحلية)</Label>
            <Input id="priceAbroad" type="number" min={0} step={0.01} placeholder="مثلاً 1000" className="mb-1 text-right" value={priceAbroad} onChange={e => setPriceAbroad(e.target.value)} />
            <small id="priceInEGP" className="block text-gray-500 text-right text-sm">
              {abroadRaw ? `السعر بالجنيه: ${priceInEGP.toLocaleString()} جم` : "السعر بالجنيه: —"}
            </small>
          </div>
        </div>

        <Label htmlFor="localPrice" className="block font-semibold mt-4 mb-1 text-base sm:text-lg text-right">السعر في مصر (بالجنيه المصري)</Label>
        <Input id="localPrice" type="number" min={0} step={0.01} placeholder="مثلاً 59999" className="mb-6 text-right" value={localPrice} onChange={e => setLocalPrice(e.target.value)} />

        <div className="flex flex-row-reverse gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="customsRate" className="block font-semibold mb-1 text-base sm:text-lg text-right">نسبة الجمارك: {customsRate}%</Label>
            <Slider id="customsRate" min={0} max={38.5} step={0.5} value={[customsRate]} onValueChange={([v]) => setCustomsRate(v)} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="dutyFree" className="block font-semibold mb-1 text-base sm:text-lg text-right">معاك كام موبايل؟</Label>
            <Select value={dutyFree} onValueChange={setDutyFree} name="dutyFree">
              <SelectTrigger id="dutyFree" />
              <SelectContent>
                <SelectItem value="yes">أيوة، واحد بس</SelectItem>
                <SelectItem value="no">أكتر من واحد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-[#e9f8e1] rounded-md p-4 sm:p-6 mt-8 text-right">
          <p className="mb-1 flex flex-row-reverse items-center gap-2 justify-end">
            السعر بالمصري: <strong>{priceInEGP ? priceInEGP.toLocaleString() + " جم" : "—"}</strong>
            <span className="text-xl">{countryFlags[country]}</span>
          </p>
          <p className="mb-1">{payDuty ? `بعد الجمارك (${customsRate}٪): ` : "من غير جمارك: "}<strong>{payDuty ? withCustomsCost.toLocaleString() + " جم" : priceInEGP ? priceInEGP.toLocaleString() + " جم" : "—"}</strong></p>
          <p className="mb-1 flex flex-row-reverse items-center gap-2 justify-end">
            سعره في مصر: <strong>{localPriceNum ? localPriceNum.toLocaleString() + " جم" : "—"}</strong>
            <span className="text-xl">🇪🇬</span>
          </p>
          <p className="mb-2">فرق السعر: <strong>{localPriceNum && abroadRaw ? diff.toLocaleString() + " جم" : "—"}</strong></p>
          <div className="mt-4">
            <Bar data={chartData} options={chartOptions} height={180} />
          </div>
          <div id="decisionMsg" className="font-bold mt-4 text-lg">{decisionMsg}</div>
        </div>

        <footer className="mt-6 text-xs text-gray-600 leading-relaxed">
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
      </Card>
    </div>
  );
}
