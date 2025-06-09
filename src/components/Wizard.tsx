'use client';
import { useState } from 'react';
import { PurchaseForm } from './PurchaseForm';
import { ResultScreen } from './ResultScreen';
import { ExamplesShowcase } from './ExamplesShowcase';
import type { PurchaseState } from '../hooks/usePurchaseCalculator';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export type WizardStep = 'input' | 'result';

function ProgressIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="flex justify-between text-xs text-muted-foreground sm:mb-2 mb-4 sm:mt-0 mt-4">
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

// Helper function to check if any meaningful form inputs have been filled
function hasFilledInputs(purchase: PurchaseState): boolean {
  return purchase.foreignPrice > 0 || purchase.localPrice > 0 || purchase.onePhone !== true;
}

function HeroSection({ deviceSelected, onReset, showResetButton }: { 
  deviceSelected: boolean; 
  onReset?: () => void;
  showResetButton: boolean;
}) {
  return (
    <div className="mb-4">
      <HeroCard deviceSelected={deviceSelected} onReset={onReset} showResetButton={showResetButton} />
    </div>
  );
}

function HeroCard({ deviceSelected, onReset, showResetButton }: { 
  deviceSelected: boolean; 
  onReset?: () => void;
  showResetButton: boolean;
}) {
  return (
    <Card className={`transition-all duration-200 ${deviceSelected ? 'text-center p-2' : 'text-center p-4'}`}>
      <CardHeader className="!px-2 !py-0 !items-center">
        {deviceSelected ? (
          // Compact horizontal layout when device is selected
          <div className="flex items-center !px-0 w-full justify-between">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-lg">
                📱
              </div>
              <Image src="/am-logo.svg" alt="أجيب منين" height={32} width={120} className="h-5 w-auto" priority />
            </div>
            {showResetButton && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-xs flex items-center gap-1">
                🔄 اعادة البدء
              </Button>
            )}
          </div>
        ) : (
          // Full layout when no device is selected
          <>
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold">📱</div>
            </div>
            <Image src="/am-logo.svg" alt="أجيب منين" height={56} width={200} className="h-8 mx-auto w-auto" priority />
            <CardDescription className="text-muted-foreground text-balance text-sm mt-1">
            احسب فرق السعر في ثانية وشوف أوفر لك تشتري من مصر ولا تشحنها معاك من برّه.
            </CardDescription>
          </>
        )}
      </CardHeader>
    </Card>
  );
}

export function Wizard() {
  const [step, setStep] = useState<WizardStep>('input');
  const [purchase, setPurchase] = useState<PurchaseState>(defaultState);
  
  // Check if no device is selected for centering on desktop
  const noDeviceSelected = step === 'input' && !purchase.mode;
  const deviceSelected = step === 'input' && !!purchase.mode;
  
  // Check if any meaningful form inputs have been filled
  const showResetButton = hasFilledInputs(purchase);
  
  const handleReset = () => {
    setPurchase(defaultState);
    setStep('input');
  };
  
  return (
    <div dir="rtl" className={`max-w-md mx-auto p-4 space-y-4 ${noDeviceSelected ? 'md:min-h-screen md:flex md:flex-col md:justify-center' : ''} ${deviceSelected ? 'md:pt-20' : ''}`}>
      <HeroSection 
        deviceSelected={deviceSelected} 
        onReset={handleReset} 
        showResetButton={showResetButton}
      />
      <ProgressIndicator step={step} />
      {step === 'input' ? (
        <>
          <PurchaseForm
            value={purchase}
            onChange={setPurchase}
            onNext={() => setStep('result')}
          />
          {/* Show examples when no device is selected */}
          {!purchase.mode && (
            <div className="mt-6">
              <ExamplesShowcase onStartCalculation={handleReset} />
            </div>
          )}
        </>
      ) : (
        <ResultScreen
          value={purchase}
          onBack={() => setStep('input')}
        />
      )}
    </div>
  );
} 