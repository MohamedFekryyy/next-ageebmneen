export interface PurchaseState {
  mode?: 'phone' | 'laptop' | null;
  country: string;
  foreignPrice: number;
  localPrice: number;
  caught: boolean;
  taxRate: number;
  onePhone: boolean;
}

// Fallback exchange rates (EGP per unit)
const fallbackRates: Record<string, { rate: number }> = {
  SAU: { rate: 13.33 },
  UAE: { rate: 13.62 },
  EUR: { rate: 56.45 },
  USA: { rate: 50.0 },
  KWT: { rate: 163.0 },
  OMN: { rate: 130.0 },
  QAT: { rate: 13.74 },
  TUR: { rate: 1.56 },
  LBY: { rate: 10.3 },
  IRQ: { rate: 0.038 },
  EGY: { rate: 1.0 },
  JOR: { rate: 70.5 },
  LBN: { rate: 0.033 },
  MAR: { rate: 5.5 },
  TUN: { rate: 18.0 },
  ALG: { rate: 0.37 },
};

// Map country codes to currency codes
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

export function usePurchaseCalculator(
  state: PurchaseState, 
  liveRates?: Record<string, number> | null
) {
  // Get exchange rate (live or fallback)
  function getExchangeRate(countryCode: string): number {
    const currencyCode = currencyMap[countryCode];
    if (liveRates && currencyCode && liveRates[currencyCode]) {
      return liveRates[currencyCode];
    }
    // Fallback to hardcoded rates
    return fallbackRates[countryCode]?.rate || 1;
  }

  const fx = getExchangeRate(state.country);
  const base = Math.round(state.foreignPrice * fx);
  
  let tax = 0;
  let customs = 0;
  
  if (state.mode === 'phone') {
    // Fixed 38.5% combined customs and tax rate for phones
    // Apply to all imported phones (removing threshold and onePhone exemption for now)
    customs = Math.round(base * 0.385);
    tax = 0; // Already included in customs rate
  } else if (state.mode === 'laptop') {
    // Laptops only have VAT, no customs
    tax = Math.round(base * (state.taxRate / 100));
    customs = 0;
  }
  
  const totalAbroad = Math.round(base + tax + customs);
  return { base, tax, customs, totalAbroad };
} 