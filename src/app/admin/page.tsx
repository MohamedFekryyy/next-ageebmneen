"use client";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LogEntry {
  timestamp: string;
  userAgent: string;
  ip: string;
  mode: string;
  country: string;
  foreignPrice: number;
  localPrice: number;
  caught: boolean;
  taxRate: number;
  onePhone: boolean;
  totalAbroad: number;
  savings: number;
  isCheaperAbroad: boolean;
}

interface LogResponse {
  logs: LogEntry[];
  message?: string;
  environment?: string;
}

export default function AdminPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    cheaperAbroad: 0,
    cheaperLocal: 0,
    avgSavings: 0,
    topCountries: [] as { country: string; count: number }[]
  });

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/get-logs');
      const data: LogResponse = await response.json();
      setLogs(data.logs || []);
      setMessage(data.message || '');
      setEnvironment(data.environment || '');
      calculateStats(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setMessage('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const calculateStats = (logs: LogEntry[]) => {
    const total = logs.length;
    const cheaperAbroad = logs.filter(log => log.isCheaperAbroad).length;
    const cheaperLocal = total - cheaperAbroad;
    const avgSavings = logs.reduce((sum, log) => sum + log.savings, 0) / total || 0;
    
    // Count countries
    const countryCount: Record<string, number> = {};
    logs.forEach(log => {
      countryCount[log.country] = (countryCount[log.country] || 0) + 1;
    });
    
    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({ total, cheaperAbroad, cheaperLocal, avgSavings, topCountries });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إحصائيات أجيب منين</h1>
      
      {/* Environment Info */}
      {message && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>البيئة:</strong> {environment === 'production' ? 'الإنتاج' : 'التطوير'}</p>
              <p className="text-sm">{message}</p>
              {environment === 'production' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>ملاحظة:</strong> في بيئة الإنتاج، يتم حفظ السجلات في سجلات Vercel. 
                    يمكنك الوصول إليها من لوحة تحكم Vercel تحت &quot;Functions&quot; → &quot;View Function Logs&quot; والبحث عن &quot;SUBMISSION_LOG&quot;.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">إجمالي الاستعلامات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">أرخص من الخارج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.cheaperAbroad}</div>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.cheaperAbroad / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">أرخص محلياً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.cheaperLocal}</div>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.cheaperLocal / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">متوسط التوفير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgSavings).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">جنيه</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      {stats.topCountries.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>أكثر الدول استعلاماً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topCountries.map((item) => (
                <div key={item.country} className="flex justify-between items-center">
                  <span>{item.country}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آخر الاستعلامات</CardTitle>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {environment === 'production' 
                ? 'لا توجد سجلات متاحة في بيئة الإنتاج. راجع سجلات Vercel للحصول على البيانات.'
                : 'لا توجد سجلات بعد. قم بإجراء بعض الاستعلامات لإنشاء السجلات.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">التاريخ</th>
                    <th className="text-right p-2">النوع</th>
                    <th className="text-right p-2">الدولة</th>
                    <th className="text-right p-2">السعر الأجنبي</th>
                    <th className="text-right p-2">السعر المحلي</th>
                    <th className="text-right p-2">التوفير</th>
                    <th className="text-right p-2">النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 50).map((log, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(log.timestamp).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-2">{log.mode === 'phone' ? 'موبايل' : 'لابتوب'}</td>
                      <td className="p-2">{log.country}</td>
                      <td className="p-2">{log.foreignPrice.toLocaleString()}</td>
                      <td className="p-2">{log.localPrice.toLocaleString()}</td>
                      <td className="p-2">{log.savings.toLocaleString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.isCheaperAbroad 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.isCheaperAbroad ? 'أرخص من الخارج' : 'أرخص محلياً'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 