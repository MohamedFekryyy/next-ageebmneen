import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

type PriceBreakdownProps = {
  foreignPriceEGP: number;
  phoneTax: number;
  customs: number;
  totalForeign: number;
  mode?: 'phone' | 'laptop';
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ foreignPriceEGP, phoneTax, customs, totalForeign, mode }) => (
  <Card className="bg-white text-sm mt-2">
    <CardHeader>
      <CardTitle>تفاصيل السعر</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1 text-right">
      <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
        <p>السعر الأصلي بالجنيه: {Math.round(foreignPriceEGP).toLocaleString("en-US")} جنيه</p>
      </div>
      {mode === 'phone' && customs > 0 ? (
        <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
          <p>جمارك وضرايب ٣٨.٥٪: {Math.round(customs).toLocaleString("en-US")} جنيه</p>
        </div>
      ) : mode === 'laptop' && phoneTax > 0 ? (
        <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
          <p>ضريبة القيمة المضافة: {Math.round(phoneTax).toLocaleString("en-US")} جنيه</p>
        </div>
      ) : mode === 'phone' ? (
        <div style={{ paddingBottom: '8px', marginBottom: '8px' }}>
          <p>جمارك وضرايب: معفى</p>
        </div>
      ) : (
        <div style={{ paddingBottom: '8px', marginBottom: '8px' }}>
          <p>ضريبة: معفى</p>
        </div>
      )}
      <div style={{ fontWeight: 'bold', paddingTop: '8px', borderTop: '2px solid #000' }}>
        <p>الإجمالي بره: {Math.round(totalForeign).toLocaleString("en-US")} جنيه</p>
      </div>
    </CardContent>
  </Card>
);

export default PriceBreakdown; 