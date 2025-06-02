"use client";
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PriceInfo {
  price: number;
  currency: string;
  title: string;
  image?: string;
  marketplace?: string;
  shippingNote?: string;
  source?: string;
}

interface FetchPriceResult {
  foreignPrice: PriceInfo;
  egyptianPrice: PriceInfo;
}

interface PriceSearchResult {
  foreignPrice: number;
  localPrice: number;
}

export function useFetchPrice() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrice = async (country: string, query: string): Promise<PriceSearchResult | null> => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "من فضلك اكتب اسم الجهاز أولاً"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/lookupPrice?country=${encodeURIComponent(country)}&query=${encodeURIComponent(query.trim())}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            variant: "destructive",
            title: "كثرة الطلبات",
            description: "استنى شوية وحاول تاني"
          });
        } else if (response.status === 404) {
          toast({
            variant: "destructive",
            title: "مش لاقي الجهاز",
            description: "ماعنديش سعر للجهاز ده دلوقتي، جرب اسم تاني"
          });
        } else {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "مقدرش أجيب السعر دلوقتي، حاول تاني"
          });
        }
        return null;
      }

      const result: FetchPriceResult = await response.json();
      
      // Show success toast with both prices
      toast({
        title: "تم حساب السعر بنجاح! ✅",
        description: `${result.foreignPrice.title}: ${result.foreignPrice.price.toLocaleString('en-US')} ${result.foreignPrice.currency} | مصر: ${result.egyptianPrice.price.toLocaleString('en-US')} ${result.egyptianPrice.currency}`,
        duration: 5000
      });

      return {
        foreignPrice: result.foreignPrice.price,
        localPrice: result.egyptianPrice.price
      };
    } catch (error) {
      console.error('Price fetch error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: "تأكد من الإنترنت وحاول تاني"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchPrice, isLoading };
} 