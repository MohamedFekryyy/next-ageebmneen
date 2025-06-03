"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Shimmer loading component
function ShimmerSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gray-200 rounded h-4 w-24">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
      />
    </div>
  );
}

// Animated number counter
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const startTime = Date.now();
    const duration = 300; // 300ms animation

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const current = start + (end - start) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    }

    if (Math.abs(end - start) > 0.01) {
      requestAnimationFrame(animate);
    }

    previousValue.current = end;
  }, [value]);

  return (
    <span>
      {Math.round(displayValue).toLocaleString('en-US')}{suffix}
    </span>
  );
}

export function LiveConversion({ 
  foreignPrice, 
  exchangeRate, 
  isLoading, 
  error 
}: {
  foreignPrice: number;
  exchangeRate: number | null;
  isLoading: boolean;
  error?: string | null;
}) {
  const [show, setShow] = useState(false);

  // Show conversion when there's a valid price
  useEffect(() => {
    setShow(foreignPrice > 0);
  }, [foreignPrice]);

  if (!show || foreignPrice <= 0) return null;

  const convertedAmount = exchangeRate ? foreignPrice * exchangeRate : 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              ≈
            </motion.span>
            
            {isLoading ? (
              <div className="flex items-center gap-1">
                <ShimmerSkeleton />
                <span>جنيه مصري</span>
              </div>
            ) : error ? (
              <span className="text-orange-500 text-xs">
                سعر تقريبي
              </span>
            ) : exchangeRate ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1"
              >
                <span className="font-medium text-green-600">
                  <AnimatedNumber value={convertedAmount} suffix=" جنيه مصري" />
                </span>
                
                {/* Live indicator */}
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-[10px] text-green-600">حي</span>
                </motion.div>
              </motion.div>
            ) : (
              <span className="text-muted-foreground">
                جاري التحديث...
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 