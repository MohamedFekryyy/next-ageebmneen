"use client";
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AutocompleteSuggestion {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  brand?: string;
  category?: string;
}

interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
  cached: boolean;
}

export function useAutocomplete() {
  const toast = useToast();
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce function
  const debounce = useCallback((func: (...args: unknown[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: unknown[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('كثرة الطلبات، استنى شوية وحاول تاني');
        }
        throw new Error('خطأ في حساب الاقتراحات');
      }

      const data: AutocompleteResponse = await response.json();
      setSuggestions(data.suggestions || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setError(errorMessage);
      setSuggestions([]);
      
      // Show error toast only for non-rate-limit errors
      if (!errorMessage.includes('كثرة الطلبات')) {
        toast({
          variant: "destructive",
          title: "خطأ في الاقتراحات",
          description: errorMessage,
          duration: 3000
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions as (...args: unknown[]) => void, 300),
    [fetchSuggestions, debounce]
  );

  // Search function to be called from components
  const search = useCallback((query: string) => {
    debouncedFetchSuggestions(query);
  }, [debouncedFetchSuggestions]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((category?: string) => {
    switch (category) {
      case 'phone':
        return '📱';
      case 'laptop':
        return '💻';
      case 'tablet':
        return '📱';
      case 'audio':
        return '🎧';
      case 'wearable':
        return '⌚';
      case 'gaming':
        return '🎮';
      default:
        return '📦';
    }
  }, []);

  // Get category label in Arabic
  const getCategoryLabel = useCallback((category?: string) => {
    switch (category) {
      case 'phone':
        return 'موبايل';
      case 'laptop':
        return 'لابتوب';
      case 'tablet':
        return 'تابلت';
      case 'audio':
        return 'سماعات';
      case 'wearable':
        return 'ساعة ذكية';
      case 'gaming':
        return 'ألعاب';
      default:
        return 'إلكترونيات';
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    search,
    clearSuggestions,
    getCategoryIcon,
    getCategoryLabel
  };
} 