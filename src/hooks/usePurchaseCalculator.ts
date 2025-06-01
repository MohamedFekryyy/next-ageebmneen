export interface PurchaseState {
  mode: 'phone' | 'laptop';
  country: string;
  foreignPrice: number;
  localPrice: number;
  caught: boolean;
  taxRate: number;
  onePhone: boolean;
}

const rates: Record<string, { rate: number }> = {
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

export function usePurchaseCalculator(state: PurchaseState) {
  const fx = rates[state.country]?.rate || 1;
  const base = state.foreignPrice * fx;
  const tax = state.caught ? base * (state.taxRate / 100) : 0;
  let customs = 0;
  if (
    state.mode === 'phone' &&
    state.caught &&
    !state.onePhone &&
    base > 15000
  ) customs = base * 0.20;
  const totalAbroad = base + tax + customs;
  return { base, tax, customs, totalAbroad };
} 