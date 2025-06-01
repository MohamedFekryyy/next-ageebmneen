'use client';
import * as React from "react";
import { Toast, ToastContext } from "./use-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      setTimeout(() => dismiss(id), toast.duration ?? 5000);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Simple toast rendering area */}
      <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.variant === 'destructive' ? '#ffebee' : '#e3fcec',
            color: t.variant === 'destructive' ? '#b71c1c' : '#256029',
            border: '1px solid',
            borderColor: t.variant === 'destructive' ? '#f44336' : '#4caf50',
            borderRadius: 8,
            padding: '16px 24px',
            margin: '8px 0',
            minWidth: 280,
            maxWidth: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 16,
            fontWeight: 500,
            pointerEvents: 'auto',
            direction: 'rtl',
            textAlign: 'right',
          }}>
            {t.title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>}
            {t.description && <div>{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 