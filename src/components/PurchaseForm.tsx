"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ChevronDownIcon } from 'lucide-react';
import { useHighValueGuard } from '@/lib/useHighValueGuard';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { LiveConversion } from '@/components/LiveConversion';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';

// Fallback exchange rates (EGP per unit) - used if API fails
const fallbackRates: Record<string, { cur: string; rate: number }> = {
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

// Map country codes to currency codes for API
const currencyMap: Record<string, string> = {
  SAU: "SAR",
  UAE: "AED", 
  EUR: "EUR",
  USA: "USD",
  KWT: "KWD",
  OMN: "OMR",
  QAT: "QAR",
  TUR: "TRY",
  LBY: "LYD",
  IRQ: "IQD",
  EGY: "EGP",
  JOR: "JOD",
  LBN: "LBP",
  MAR: "MAD",
  TUN: "TND",
  ALG: "DZD"
};

// Map countries to their respective shopping sites
const countrySites: Record<string, { name: string; url: string }> = {
  SAU: { name: "Amazon Saudi Arabia", url: "https://www.amazon.sa" },
  UAE: { name: "Amazon UAE", url: "https://www.amazon.ae" },
  KWT: { name: "OpenSooq", url: "https://www.opensooq.com" },
  OMN: { name: "Sharaf DG Oman", url: "https://oman.sharafdg.com" },
  QAT: { name: "AliExpress", url: "https://www.aliexpress.com" },
  TUR: { name: "Trendyol", url: "https://www.trendyol.com" },
  LBY: { name: "OpenSooq Libya", url: "https://ly.opensooq.com" },
  EUR: { name: "Amazon Europe", url: "https://www.amazon.de" },
  USA: { name: "Amazon US", url: "https://www.amazon.com" },
  // Add fallbacks for other countries
  IRQ: { name: "OpenSooq", url: "https://www.opensooq.com" },
  EGY: { name: "Jumia Egypt", url: "https://www.jumia.com.eg" },
  JOR: { name: "OpenSooq", url: "https://www.opensooq.com" },
  LBN: { name: "OpenSooq", url: "https://www.opensooq.com" },
  MAR: { name: "Jumia Morocco", url: "https://www.jumia.ma" },
  TUN: { name: "Jumia Tunisia", url: "https://www.jumia.com.tn" },
  ALG: { name: "Jumia Algeria", url: "https://www.jumia.dz" }
};

export function PurchaseForm({ value, onChange, onNext }: {
  value: PurchaseState;
  onChange: (v: PurchaseState) => void;
  onNext: () => void;
}) {
  const { checkHighValue } = useHighValueGuard();
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
  const { rates: liveRates, isLoading: ratesLoading, error: ratesError } = useExchangeRates();

  // Helper: update a single field
  function update<K extends keyof PurchaseState>(key: K, val: PurchaseState[K]) {
    // Set mode to phone by default when user starts interacting with the form
    if (!value.mode && (key === 'foreignPrice' || key === 'localPrice' || key === 'country')) {
      onChange({ ...value, [key]: val, mode: 'phone' });
    } else {
      onChange({ ...value, [key]: val });
    }
  }

  // Get exchange rate (live or fallback)
  function getExchangeRate(countryCode: string): number {
    const currencyCode = currencyMap[countryCode];
    if (liveRates && currencyCode && liveRates[currencyCode]) {
      return liveRates[currencyCode];
    }
    // Fallback to hardcoded rates
    return fallbackRates[countryCode]?.rate || 1;
  }

  // Derived values
  const rate = getExchangeRate(value.country);
  const currencyLabel = fallbackRates[value.country as keyof typeof fallbackRates]?.cur || "EGP";
  const convertedEGP = value.foreignPrice * rate;

  // Required fields check - manual mode only
  const requiredFilled = value.country && value.foreignPrice > 0 && value.localPrice > 0;

  return (
    <form 
      className="space-y-2.5 overflow-visible" 
      dir="rtl" 
      onSubmit={(e) => { 
        e.preventDefault(); 
        if (requiredFilled && !checkHighValue(convertedEGP)) {
          onNext(); 
        }
      }}
    >
      {/* Card 2 – الدولة والسعر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">الدولة والسعر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Country picker (bottom-sheet on mobile) */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">اختر البلد</label>
            
            {/* Desktop Select (md and up) */}
            <div className="hidden md:block">
              <Select value={value.country} onValueChange={val => update('country', val)}>
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="اختر البلد">
                    {value.country && (
                      <span className="flex items-center justify-end gap-2">
                        <span>{countryNames[value.country]}</span>
                        <span>{countryFlags[value.country]}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right">
                  {Object.entries(fallbackRates).map(([code]) => (
                    <SelectItem key={code} value={code} className="text-right flex-row-reverse">
                      <span className="flex items-center justify-end gap-2 w-full">
                        <span>{countryNames[code]}</span>
                        <span>{countryFlags[code]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Sheet (below md) */}
            <div className="block md:hidden">
              <Sheet open={countrySheetOpen} onOpenChange={setCountrySheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" type="button">
                    <span>{countryFlags[value.country]} {countryNames[value.country]}</span>
                    <ChevronDownIcon className="size-4 opacity-50" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="p-0 max-h-[95vh] overflow-y-auto" dir="rtl">
                  <ul className="divide-y">
                    {Object.entries(fallbackRates).map(([code]) => (
                      <li key={code}>
                        <button
                          type="button"
                          className="w-full py-3 text-right px-4 flex items-center justify-end gap-2"
                          onClick={() => { update('country', code); setCountrySheetOpen(false); }}
                        >
                          <span>{countryNames[code]}</span>
                          <span>{countryFlags[code]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Foreign price input - manual mode only */}
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="foreignPrice" className="block text-sm font-medium mb-1">السعر بره</label>
                </TooltipTrigger>
                <TooltipContent side="top">سعر الجهاز في البلد المختارة</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="relative flex flex-row-reverse items-center w-full">
              <Input
                id="foreignPrice"
                type="number"
                min={0}
                value={value.foreignPrice || ''}
                onChange={e => {
                  const numVal = parseFloat(e.target.value) || 0;
                  update('foreignPrice', numVal);
                }}
                placeholder="مثال: 800"
                className="text-right w-full pr-4 pl-[4ch]"
                inputMode="decimal"
                pattern="[0-9]*"
                aria-label="السعر بره"
              />
              <span className="min-w-[3ch] px-2 text-muted-foreground absolute left-0 top-0 h-full flex items-center">{currencyLabel}</span>
            </div>
            
            {/* Live conversion display */}
            <LiveConversion
              foreignPrice={value.foreignPrice}
              exchangeRate={rate}
              isLoading={ratesLoading}
              error={ratesError}
            />
            
            {/* Helper text with shopping site link */}
            {value.country && countrySites[value.country] && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded-md">
                <span>ابحث عن جهازك في </span>
                <a 
                  href={countrySites[value.country].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {countrySites[value.country].name}
                </a>
              </div>
            )}
          </div>

          {/* Local price input - manual mode only */}
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="localPrice" className="block text-sm font-medium mb-1">السعر في مصر (جنيه)</label>
                </TooltipTrigger>
                <TooltipContent side="top">سعر الجهاز في السوق المحلي</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="relative flex flex-row-reverse items-center w-full">
              <Input
                id="localPrice"
                type="number"
                min={0}
                value={value.localPrice || ''}
                onChange={e => {
                  const numVal = parseFloat(e.target.value) || 0;
                  update('localPrice', numVal);
                }}
                placeholder="مثال: 20000"
                className="text-right w-full pr-4 pl-[4ch]"
                inputMode="decimal"
                pattern="[0-9]*"
                aria-label="السعر في مصر"
              />
              <span className="min-w-[3ch] px-2 text-muted-foreground absolute left-0 top-0 h-full flex items-center">EGP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3 – الضرايب والجمارك (only show when all required fields are filled) */}
      <AnimatePresence>
        {requiredFilled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الضرايب والجمارك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Fixed phone customs rate display */}
                <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">جمارك وضرايب الموبايلات</div>
                  <div className="text-xs text-blue-700 mt-1">معدل ثابت: 38.5% (حسب القانون المصري)</div>
                </div>
                
                {/* One phone only switch */}
                <div className="flex items-center justify-between mb-2" dir="ltr">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label htmlFor="onePhone" className="text-sm font-medium" dir="rtl">موبايل واحد فقط؟</label>
                      </TooltipTrigger>
                      <TooltipContent side="top">لو معاك موبايل واحد بس غالباً هتعدي من غير جمارك</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Switch
                    id="onePhone"
                    checked={value.onePhone}
                    onCheckedChange={val => update('onePhone', !!val)}
                    aria-label="موبايل واحد فقط؟"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      <Button
        type="submit"
        variant="default"
        className="mt-4 w-full min-h-[44px] text-base"
        disabled={!requiredFilled}
      >
        التالي
      </Button>
    </form>
  );
} 