import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "أجيب منين؟ – حساب تكلفة الموبايل مصر ولا بره",
  description: "احسب تكلفة شراء الموبايل من الخارج مقارنة بمصر مع الجمارك والضرايب. أداة مجانية لمساعدة المصريين في اتخاذ قرار الشراء الأمثل.",
  keywords: "موبايل, جمارك, ضرايب, مصر, شراء, حساب تكلفة, استيراد, أجيب منين",
  authors: [{ name: "أجيب منين" }],
  creator: "أجيب منين",
  publisher: "أجيب منين",
  
  // Open Graph meta tags for Facebook, LinkedIn, etc.
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://ageebmneen.vercel.app",
    siteName: "أجيب منين؟",
    title: "أجيب منين؟ – حساب تكلفة الموبايل مصر ولا بره",
    description: "احسب تكلفة شراء الموبايل من الخارج مقارنة بمصر مع الجمارك والضرايب. أداة مجانية لمساعدة المصريين في اتخاذ قرار الشراء الأمثل.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "أجيب منين؟ – حساب تكلفة الموبايل",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card meta tags
  twitter: {
    card: "summary_large_image",
    site: "@ageebmneen",
    creator: "@ageebmneen",
    title: "أجيب منين؟ – حساب تكلفة الموبايل مصر ولا بره",
    description: "احسب تكلفة شراء الموبايل من الخارج مقارنة بمصر مع الجمارك والضرايب. أداة مجانية لمساعدة المصريين.",
    images: ["/og-image.png"],
  },
  
  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification and other meta tags
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  
  // App-specific meta tags
  applicationName: "أجيب منين؟",
  category: "Finance",
  classification: "Calculator Tool",
  
  // Additional meta tags for better SEO
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "أجيب منين؟",
    "mobile-web-app-capable": "yes",
    "theme-color": "#ffffff",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "أجيب منين؟",
    "alternateName": "Ageeb Mneen",
    "description": "احسب تكلفة شراء الموبايل من الخارج مقارنة بمصر مع الجمارك والضرايب",
    "url": "https://ageebmneen.vercel.app",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EGP"
    },
    "author": {
      "@type": "Organization",
      "name": "أجيب منين؟"
    },
    "inLanguage": "ar-EG",
    "audience": {
      "@type": "Audience",
      "geographicArea": {
        "@type": "Country",
        "name": "Egypt"
      }
    }
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body style={{ fontFamily: "'IBM Plex Sans Arabic', 'IBM Plex Sans', 'Kanit', sans-serif" }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
