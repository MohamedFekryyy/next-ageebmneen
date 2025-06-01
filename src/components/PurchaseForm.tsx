"use client";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useHighValueGuard } from '@/lib/useHighValueGuard';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';

// Exchange rates (EGP per unit)
const rates: Record<string, { cur: string; rate: number }> = {
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

export function PurchaseForm({ value, onChange, onNext }: {
  value: PurchaseState;
  onChange: (v: PurchaseState) => void;
  onNext: () => void;
}) {
  const { checkHighValue } = useHighValueGuard();
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);

  // Helper: update a single field
  function update<K extends keyof PurchaseState>(key: K, val: PurchaseState[K]) {
    onChange({ ...value, [key]: val });
  }

  // Derived values
  const rate = rates[value.country as keyof typeof rates]?.rate || 1;
  const currencyLabel = rates[value.country as keyof typeof rates]?.cur || "EGP";
  const convertedEGP = value.foreignPrice * rate;

  // Required fields check
  const requiredFilled = value.country && value.foreignPrice > 0 && value.localPrice > 0;

  // Card 1: نوع الجهاز
  // ... existing code ...
  return (
    <form className="space-y-2.5 bg-zinc-100 rounded-xl p-2" dir="rtl" onSubmit={e => { e.preventDefault(); if (requiredFilled && !checkHighValue(convertedEGP)) onNext(); }}>
      {/* Card 1 – نوع الجهاز */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">نوع الجهاز</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr">
            <ToggleGroup
              type="single"
              variant="outline"
              value={value.mode}
              onValueChange={val => val && update('mode', val as 'phone' | 'laptop')}
              aria-label="اختر نوع الجهاز"
              className="w-full"
            >
              <ToggleGroupItem value="phone" aria-label="موبايل" className="flex-1">📱 موبايل</ToggleGroupItem>
              <ToggleGroupItem value="laptop" aria-label="لابتوب" className="flex-1">💻 لابتوب</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Only show the rest of the form if a device type is selected */}
      {value.mode && (
        <>
          {/* Card 2 – الدولة والسعر */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الدولة والسعر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Country picker (bottom-sheet on mobile) */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">اختر البلد</label>
                <Sheet open={countrySheetOpen} onOpenChange={setCountrySheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" type="button">
                      <span>{countryFlags[value.country]} {Object.entries(rates).find(([code]) => code === value.country)?.[0]}</span>
                      <span className="text-xl">▼</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="p-0">
                    <ul className="divide-y">
                      {Object.entries(rates).map(([code]) => (
                        <li key={code}>
                          <button
                            type="button"
                            className="w-full py-3 text-right px-4"
                            onClick={() => { update('country', code); setCountrySheetOpen(false); }}
                          >
                            {countryFlags[code]} {code}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </SheetContent>
                </Sheet>
              </div>
              {/* Foreign price input */}
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
              </div>
              {/* Local price input */}
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

          {/* Card 3 – الضرايب والجمارك */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الضرايب والجمارك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Caught at airport switch */}
              <div className="flex items-center justify-between mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label htmlFor="caught" className="text-sm font-medium">هيفتشوك في المطار؟</label>
                    </TooltipTrigger>
                    <TooltipContent side="top">لو اتفتشت في المطار هتدفع ضريبة القيمة المضافة</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Switch
                  id="caught"
                  checked={value.caught}
                  onCheckedChange={val => update('caught', !!val)}
                  aria-label="هيفتشوك في المطار؟"
                />
              </div>
              {/* VAT slider (if caught) */}
              {value.caught && (
                <div className="mb-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label htmlFor="taxRate" className="text-sm font-medium">نسبة الضريبة (٪)</label>
                      </TooltipTrigger>
                      <TooltipContent side="top">حدد نسبة الضريبة حسب الدولة</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Slider
                    id="taxRate"
                    value={[value.taxRate]}
                    min={10}
                    max={25}
                    step={1}
                    onValueChange={([val]) => update('taxRate', val)}
                    aria-label="نسبة الضريبة"
                    className="h-10"
                  />
                  <div className="text-xs mt-1">{value.taxRate}%</div>
                </div>
              )}
              {/* One phone only switch (phones only) */}
              {value.mode === 'phone' && (
                <div className="flex items-center justify-between mb-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label htmlFor="onePhone" className="text-sm font-medium">موبايل واحد فقط؟</label>
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
              )}
            </CardContent>
          </Card>

          {/* Next Button */}
          <Button
            type="submit"
            variant="default"
            className="mt-4 w-full min-h-[44px] text-base"
            disabled={!requiredFilled}
            aria-disabled={!requiredFilled}
          >
            التالي
          </Button>
        </>
      )}
    </form>
  );
} 