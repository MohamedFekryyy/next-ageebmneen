import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "حساب تكلفة الموبايل – مصر ولا بره؟",
  description: "احسب تكلفة شراء الموبايل من الخارج مقارنة بمصر مع الجمارك والضرايب.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif" }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
