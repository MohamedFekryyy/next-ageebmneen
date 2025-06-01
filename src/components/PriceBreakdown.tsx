import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

type PriceBreakdownProps = {
  countryCode: string;
  foreignPrice: number;
  foreignPriceEGP: number;
  phoneTax: number;
  customs: number;
  totalForeign: number;
};

const currencyName: Record<string, string> = {
  USA: "دولار",
  EUR: "يورو",
  SAU: "ريـال",
  UAE: "درهم"
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ countryCode, foreignPrice, foreignPriceEGP, phoneTax, customs, totalForeign }) => (
  <Card className="bg-muted/20 text-sm mt-2">
    <CardHeader>
      <CardTitle>تفاصيل السعر</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1 text-right">
      {/* Base price conversion detail */}
      <p>السعر الأصلي بالجنيه: {foreignPriceEGP.toLocaleString("en-US")} جنيه</p>
      {/* Phone tax (always applied) */}
      <p>ضريبة الموبايل ١٨٪: {phoneTax.toLocaleString("en-US")} جنيه</p>
      {/* Customs (20%, if any) */}
      {customs > 0 ? (
        <p>الجمارك ٢٠٪: {customs.toLocaleString("en-US")} جنيه</p>
      ) : (
        <p>الجمارك: معفى</p>
      )}
      {/* Total abroad price after all */}
      <p className="font-bold">الإجمالي بره: {totalForeign.toLocaleString("en-US")} جنيه</p>
    </CardContent>
  </Card>
);

export default PriceBreakdown; 