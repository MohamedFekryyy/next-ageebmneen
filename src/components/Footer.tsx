"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-zinc-200 border-t border-zinc-300 py-4 px-4 mt-8" dir="rtl">
      <div className="max-w-md mx-auto text-center">
        <div className="text-sm text-zinc-600 space-y-2">
          <div className="flex items-center justify-center gap-2">

            <span>أجيب منين</span>
            <span>🇪🇬</span>
          </div>
          <p className="text-xs text-zinc-500">
            © {currentYear} - مقارنة الأسعار للمصريين
          </p>
          <p className="text-xs text-zinc-400">
            الأسعار تقريبية - استشر مصادر رسمية للتأكد
          </p>
        </div>
      </div>
    </footer>
  );
} 