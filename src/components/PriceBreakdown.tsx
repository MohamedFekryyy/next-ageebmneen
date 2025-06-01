import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

type PriceBreakdownProps = {
  foreignPriceEGP: number;
  phoneTax: number;
  customs: number;
  totalForeign: number;
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ foreignPriceEGP, phoneTax, customs, totalForeign }) => (
  <Card className="bg-muted/20 text-sm mt-2">
    <CardHeader>
      <CardTitle>تفاصيل السعر</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1 text-right">
      <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
        <p>السعر الأصلي بالجنيه: {foreignPriceEGP.toLocaleString("en-US")} جنيه</p>
      </div>
      <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
        <p>ضريبة الموبايل ١٨٪: {phoneTax.toLocaleString("en-US")} جنيه</p>
      </div>
      {customs > 0 ? (
        <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
          <p>الجمارك ٢٠٪: {customs.toLocaleString("en-US")} جنيه</p>
        </div>
      ) : (
        <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
          <p>الجمارك: معفى</p>
        </div>
      )}
      <div style={{ fontWeight: 'bold', paddingTop: '8px', borderTop: '2px solid #000' }}>
        <p>الإجمالي بره: {totalForeign.toLocaleString("en-US")} جنيه</p>
      </div>
    </CardContent>
  </Card>
);

export default PriceBreakdown; 