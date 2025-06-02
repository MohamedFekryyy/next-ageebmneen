"use client";
import { useState, useEffect, useCallback } from 'react';

interface ExchangeRateResponse {
  success: boolean;
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface ExchangeRateHook {
  rates: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchRates: () => Promise<void>;
}

// Cache for 10 minutes to avoid excessive API calls
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'exchange_rates_cache';

interface CachedData {
  rates: Record<string, number>;
  timestamp: number;
}

export function useExchangeRates(): ExchangeRateHook {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check if cached data is still valid
  const getCachedRates = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Return cached data if still valid
      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }
      
      // Remove expired cache
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  // Save rates to cache
  const cacheRates = useCallback((rates: Record<string, number>) => {
    try {
      const data: CachedData = {
        rates,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore cache errors
    }
  }, []);

  // Fetch rates from API
  const fetchRates = useCallback(async () => {
    // First check cache
    const cached = getCachedRates();
    if (cached) {
      setRates(cached.rates);
      setLastUpdated(new Date(cached.timestamp));
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use EGP as base currency for Egyptian app
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EGP');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: فشل في حساب أسعار الصرف`);
      }

      const data: ExchangeRateResponse = await response.json();
      
      if (!data.success && data.success !== undefined) {
        throw new Error('فشل في حساب أسعار الصرف من الخادم');
      }

      // Invert rates since we want to convert TO EGP, not FROM EGP
      const invertedRates: Record<string, number> = {};
      Object.entries(data.rates).forEach(([currency, rate]) => {
        invertedRates[currency] = 1 / rate;
      });

      setRates(invertedRates);
      setLastUpdated(new Date());
      cacheRates(invertedRates);
      
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      setError(err instanceof Error ? err.message : 'خطأ في حساب أسعار الصرف');
      
      // Fallback to hardcoded rates if API fails
      const fallbackRates = {
        SAR: 13.33,
        AED: 13.62,
        EUR: 56.45,
        USD: 50.0,
        KWD: 163.0,
        OMR: 130.0,
        QAR: 13.74,
        TRY: 1.56,
        LYD: 10.3,
        IQD: 0.038,
        JOD: 70.5,
        LBP: 0.033,
        MAD: 5.5,
        TND: 18.0,
        DZD: 0.37,
      };
      setRates(fallbackRates);
      setLastUpdated(new Date());
      
    } finally {
      setIsLoading(false);
    }
  }, [getCachedRates, cacheRates]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    isLoading,
    error,
    lastUpdated,
    fetchRates
  };
} 