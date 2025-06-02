'use client';
import { useState, useEffect } from 'react';
import { PurchaseForm } from './PurchaseForm';
import { ResultScreen } from './ResultScreen';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

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
  mode: undefined,
  country: 'SAU',
  foreignPrice: 0,
  localPrice: 0,
  caught: true,
  taxRate: 18,
  onePhone: true,
};

function HeroSection() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`transition-all duration-300 mb-4 ${collapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[200px] opacity-100'}`}>
      <HeroCard />
    </div>
  );
}

function HeroCard() {
  return (
    <Card className="text-center p-4">
      <CardHeader>
        <div className="flex justify-center mb-3">
          {/* Logo placeholder: replace with <Image src="/logo.png" ... /> if available */}
          <div className="h-14 w-14 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold">📱</div>
        </div>
        <Image src="/am-logo.svg" alt="أجيب منين" height={56} width={200} className="h-8 mx-auto w-auto" priority />
        <CardDescription className="text-muted-foreground text-balance text-sm mt-1">
        احسب فرق السعر في ثانية وشوف أوفر لك تشتري من مصر ولا تشحنها معاك من برّه.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function Wizard() {
  const [step, setStep] = useState<WizardStep>('input');
  const [purchase, setPurchase] = useState<PurchaseState>(defaultState);
  
  // Check if no device is selected for centering on desktop
  const noDeviceSelected = step === 'input' && !purchase.mode;
  
  return (
    <div dir="rtl" className={`max-w-md mx-auto p-4 space-y-4 ${noDeviceSelected ? 'md:min-h-screen md:flex md:flex-col md:justify-center' : ''}`}>
      <HeroSection />
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