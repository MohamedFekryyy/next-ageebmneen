import { useToast } from "@/components/ui/use-toast";

export const useHighValueGuard = () => {
  const toast = useToast();
  // hard-coded FX: 1 USD ≈ 50 EGP. 500 000 USD → 25 000 000 EGP
  const LIMIT_EGP = 500_000 * 50;

  function checkHighValue(convertedEGP: number) {
    if (convertedEGP > LIMIT_EGP) {
      toast({
        title: "😳 يا باشا…",
        description:
          "إنت ناوي تشتري مصنع موبايلات ولا إيه؟ الرقم ده خرافي! الأداة مش مهيّأة تحسب صفقات بالملايين. ننصحك ما تستخدمش AgeebMneen للحساب ده.",
        variant: "destructive",
        duration: 8000,
      });
      return true; // high value detected
    }
    return false;
  }

  return { checkHighValue };
}; 