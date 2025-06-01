'use client';
import { useState } from 'react';
import { PurchaseForm } from './PurchaseForm';
import { ResultScreen } from './ResultScreen';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';

export type WizardStep = 'input' | 'result';

function ProgressIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="flex justify-between text-xs text-muted-foreground mb-2">
      <span>{step === 'input' ? '●' : '○'} بيانات الشراء</span>
      <span>{step === 'result' ? '●' : '○'} النتيجة</span>
    </div>
  );
}

const defaultState: PurchaseState = {
  mode: 'phone',
  country: 'SAU',
  foreignPrice: 0,
  localPrice: 0,
  caught: false,
  taxRate: 18,
  onePhone: true,
};

export function Wizard() {
  const [step, setStep] = useState<WizardStep>('input');
  const [purchase, setPurchase] = useState<PurchaseState>(defaultState);
  return (
    <div dir="rtl" className="max-w-md mx-auto p-4 space-y-4">
      <ProgressIndicator step={step} />
      {step === 'input' ? (
        <PurchaseForm
          value={purchase}
          onChange={setPurchase}
          onNext={() => setStep('result')}
        />
      ) : (
        <ResultScreen
          value={purchase}
          onBack={() => setStep('input')}
        />
      )}
    </div>
  );
} 