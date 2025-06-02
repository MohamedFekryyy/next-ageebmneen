import type { PurchaseState } from '@/hooks/usePurchaseCalculator';

export interface SubmissionData {
  mode: string;
  country: string;
  foreignPrice: number;
  localPrice: number;
  caught: boolean;
  taxRate: number;
  onePhone: boolean;
  // Results
  totalAbroad: number;
  savings: number;
  isCheaperAbroad: boolean;
}

export async function logSubmission(data: SubmissionData): Promise<void> {
  try {
    await fetch('/api/log-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail - don't break user experience if logging fails
    console.warn('Failed to log submission:', error);
  }
}

export function createSubmissionData(
  state: PurchaseState, 
  totalAbroad: number, 
  localPrice: number
): SubmissionData {
  const savings = Math.abs(totalAbroad - localPrice);
  const isCheaperAbroad = totalAbroad < localPrice;
  
  return {
    mode: state.mode || 'unknown',
    country: state.country,
    foreignPrice: state.foreignPrice,
    localPrice: localPrice,
    caught: state.caught,
    taxRate: state.taxRate,
    onePhone: state.onePhone,
    totalAbroad: Math.round(totalAbroad),
    savings: Math.round(savings),
    isCheaperAbroad,
  };
} 