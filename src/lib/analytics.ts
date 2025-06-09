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

export interface LogSubmissionResponse {
  success: boolean;
  method?: string;
  timestamp?: string;
  error?: string;
}

export async function logSubmission(data: SubmissionData): Promise<LogSubmissionResponse> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/log-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 seconds
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: LogSubmissionResponse = await response.json();
      
      // Log success in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Submission logged successfully:', {
          method: result.method,
          timestamp: result.timestamp,
          attempt
        });
      }

      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Log attempt failure in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`❌ Log submission attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      }

      // If this is the last attempt, don't retry
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // All attempts failed
  const errorMessage = lastError?.message || 'Unknown error occurred';
  
  // Silently fail in production to not break user experience
  // But log the error for debugging
  console.warn('Failed to log submission after all retries:', errorMessage);
  
  return {
    success: false,
    error: errorMessage
  };
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

// Helper function to validate submission data before sending
export function validateSubmissionData(data: SubmissionData): boolean {
  return (
    typeof data.mode === 'string' && data.mode.length > 0 &&
    typeof data.country === 'string' && data.country.length > 0 &&
    typeof data.foreignPrice === 'number' && data.foreignPrice >= 0 &&
    typeof data.localPrice === 'number' && data.localPrice >= 0 &&
    typeof data.totalAbroad === 'number' && data.totalAbroad >= 0 &&
    typeof data.savings === 'number' && data.savings >= 0 &&
    typeof data.isCheaperAbroad === 'boolean'
  );
} 