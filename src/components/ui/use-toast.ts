// Standard ShadcnUI toast hook implementation
import * as React from "react"

export type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export type ToastActionElement = React.ReactElement

export interface ToastContextProps {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextProps | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context.toast
}

// You must wrap your app in a ToastProvider for this to work. 