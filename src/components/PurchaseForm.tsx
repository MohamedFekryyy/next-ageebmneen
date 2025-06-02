"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ChevronDownIcon, Loader2 } from 'lucide-react';
import { useHighValueGuard } from '@/lib/useHighValueGuard';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useFetchPrice } from '@/hooks/useFetchPrice';
import { AutocompleteDropdown } from '@/components/AutocompleteDropdown';
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

// Countries that don't have Amazon marketplaces - use UAE with international shipping
const PROXY_COUNTRIES = ['KWT', 'QAT', 'OMN', 'JOR', 'LBN'];

export function PurchaseForm({ value, onChange, onNext }: {
  value: PurchaseState;
  onChange: (v: PurchaseState) => void;
  onNext: () => void;
}) {
  const { checkHighValue } = useHighValueGuard();
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
  const { rates: liveRates, isLoading: ratesLoading, error: ratesError } = useExchangeRates();
  const { fetchPrice, isLoading: isSearching } = useFetchPrice();

  // Helper: update a single field
  function update<K extends keyof PurchaseState>(key: K, val: PurchaseState[K]) {
    onChange({ ...value, [key]: val });
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

  // Handle autocomplete suggestion selection
  const handleSuggestionSelect = async (suggestion: {
    id: string;
    title: string;
    description?: string;
    image?: string | null;
    brand?: string;
    category?: string;
  }) => {
    // Update the device query with the selected suggestion
    update('deviceQuery', suggestion.title);
    
    // Automatically trigger price search for the selected product
    if (value.country && suggestion.title) {
      update('isSearching', true);
      const result = await fetchPrice(value.country, suggestion.title);
      
      if (result !== null) {
        update('foreignPrice', result.foreignPrice);
        update('localPrice', result.localPrice);
        
        // Run high-value guard after API fill
        const convertedEGP = result.foreignPrice * getExchangeRate(value.country);
        const isHighValue = checkHighValue(convertedEGP);
        
        // Auto-advance if all fields are valid and not high value
        if (!isHighValue && value.mode) {
          // Small delay to let user see the fetched prices
          setTimeout(() => {
            onNext();
          }, 1500);
        }
      }
      
      update('isSearching', false);
    }
  };

  // Derived values
  const rate = getExchangeRate(value.country);
  const currencyLabel = fallbackRates[value.country as keyof typeof fallbackRates]?.cur || "EGP";
  const convertedEGP = value.foreignPrice * rate;

  // Required fields check - for advanced mode, also need device query
  const requiredFilled = value.country && value.foreignPrice > 0 && value.localPrice > 0 &&
    (value.searchMode === 'manual' || (value.searchMode === 'advanced' && value.deviceQuery.trim()));

  return (
    <form className="space-y-2.5 overflow-visible" dir="rtl" onSubmit={e => { e.preventDefault(); if (requiredFilled && !checkHighValue(convertedEGP)) onNext(); }}>
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
              value={value.mode ?? ''}
              onValueChange={val => val && update('mode', val as 'phone' | 'laptop')}
              aria-label="اختر نوع الجهاز"
              className="w-full"
            >
              <ToggleGroupItem value="laptop" aria-label="لابتوب" className="flex-1">💻 لابتوب</ToggleGroupItem>
              <ToggleGroupItem value="phone" aria-label="موبايل" className="flex-1">📱 موبايل</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Only show the rest of the form if a device type is selected */}
      <AnimatePresence>
        {value.mode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="space-y-2.5"
          >
            {/* Card 1.5 - Search Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الوضع</CardTitle>
              </CardHeader>
              <CardContent>
                <div dir="ltr">
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={value.searchMode}
                    onValueChange={val => val && update('searchMode', val as 'manual' | 'advanced')}
                    aria-label="اختر وضع الإدخال"
                    className="w-full"
                  >
                    <ToggleGroupItem value="manual" aria-label="يدوي" className="flex-1">يدوي</ToggleGroupItem>
                    <ToggleGroupItem value="advanced" aria-label="متقدم" className="flex-1">🔍 متقدّم</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                {value.searchMode === 'advanced' && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    البحث التلقائي عن أسعار الأجهزة مع اقتراحات ذكية
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card 2 – الدولة والسعر */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {value.searchMode === 'advanced' ? 'البحث والسعر' : 'الدولة والسعر'}
                </CardTitle>
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

                {/* Advanced Search: Enhanced Autocomplete Input */}
                {value.searchMode === 'advanced' && (
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label htmlFor="deviceQuery" className="block text-sm font-medium mb-1">اسم الجهاز</label>
                        </TooltipTrigger>
                        <TooltipContent side="top">ابحث عن جهازك واختر من الاقتراحات أو اكتب اسم المنتج مباشرة</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="space-y-3">
                      <AutocompleteDropdown
                        value={value.deviceQuery}
                        onChange={(newValue: string) => update('deviceQuery', newValue)}
                        onSelect={handleSuggestionSelect}
                        placeholder="مثال: iPhone 15 Pro Max 256GB"
                        disabled={isSearching}
                      />
                      
                      {/* Manual Search Button */}
                      {value.deviceQuery.trim() && !value.foreignPrice && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            if (!value.deviceQuery.trim() || !value.country) return;
                            
                            update('isSearching', true);
                            const result = await fetchPrice(value.country, value.deviceQuery);
                            
                            if (result !== null) {
                              update('foreignPrice', result.foreignPrice);
                              update('localPrice', result.localPrice);
                              
                              // Run high-value guard after API fill
                              const convertedEGP = result.foreignPrice * getExchangeRate(value.country);
                              const isHighValue = checkHighValue(convertedEGP);
                              
                              // Auto-advance if all fields are valid and not high value
                              if (!isHighValue && value.mode) {
                                // Small delay to let user see the fetched prices
                                setTimeout(() => {
                                  onNext();
                                }, 1500);
                              }
                            }
                            
                            update('isSearching', false);
                          }}
                          disabled={!value.deviceQuery.trim() || !value.country || isSearching}
                          className="w-full"
                        >
                          {isSearching ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              🔍 جاري البحث في أمازون...
                            </>
                          ) : (
                            '🔍 ابحث عن السعر'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Foreign price input - hidden in advanced mode or auto-filled */}
                {value.searchMode === 'manual' && (
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
                  </div>
                )}

                {/* Advanced mode: Show fetched price (read-only) */}
                {value.searchMode === 'advanced' && value.foreignPrice > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">السعر من أمازون</label>
                    <div className="relative flex flex-row-reverse items-center w-full">
                      <Input
                        type="text"
                        value={`${value.foreignPrice.toLocaleString('en-US')} ${currencyLabel}`}
                        readOnly
                        className="text-right w-full bg-green-50 border-green-200"
                        aria-label="السعر المُستخرج من أمازون"
                      />
                    </div>
                    
                    {/* Amazon-specific details */}
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-700 flex items-center gap-1">
                        ✅ تم جلب السعر من أمازون مباشرة
                      </p>
                      {PROXY_COUNTRIES.includes(value.country) && (
                        <p className="text-xs text-blue-600">
                          📦 شحن دولي من الإمارات
                        </p>
                      )}
                    </div>
                    
                    {/* Live conversion display */}
                    <LiveConversion
                      foreignPrice={value.foreignPrice}
                      exchangeRate={rate}
                      isLoading={ratesLoading}
                      error={ratesError}
                    />
                  </div>
                )}

                {/* Local price input - manual mode OR advanced mode with fetched price */}
                {value.searchMode === 'manual' ? (
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
                ) : (
                  /* Advanced mode: Show fetched Egyptian price (read-only) */
                  value.localPrice > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">السعر في مصر</label>
                      <div className="relative flex flex-row-reverse items-center w-full">
                        <Input
                          type="text"
                          value={`${value.localPrice.toLocaleString('en-US')} EGP`}
                          readOnly
                          className="text-right w-full bg-blue-50 border-blue-200"
                          aria-label="السعر في مصر المُستخرج"
                        />
                      </div>
                      
                      {/* Egyptian price source details */}
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-blue-700 flex items-center gap-1">
                          🇪🇬 من مصادر محلية مصرية
                        </p>
                      </div>
                    </div>
                  )
                )}
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
                      {/* VAT slider (only for laptops when importing) */}
                      {value.mode === 'laptop' && (
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
                      {/* Fixed phone customs rate display */}
                      {value.mode === 'phone' && (
                        <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">جمارك وضرايب الموبايلات</div>
                          <div className="text-xs text-blue-700 mt-1">معدل ثابت: 38.5% (حسب القانون المصري)</div>
                        </div>
                      )}
                      {/* One phone only switch (phones only) */}
                      {value.mode === 'phone' && (
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
                      )}
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
              disabled={!requiredFilled || isSearching}
              aria-disabled={!requiredFilled || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                'التالي'
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
} 