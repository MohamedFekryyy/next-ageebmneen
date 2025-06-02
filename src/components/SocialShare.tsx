"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Share2, MessageCircle, Twitter, Facebook, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
}

export function SocialShare({ 
  title = "أجيب منين - حاسبة تكلفة الموبايل والابتوب",
  description = "احسب تكلفة شراء الموبايل أو اللابتوب من الخارج مع الجمارك والضرايب المصرية",
  url = typeof window !== 'undefined' ? window.location.href : ''
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الموقع بنجاح",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "خطأ في النسخ",
        description: "لم يتم نسخ الرابط، جرب مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  return (
    <Card className="mt-2 bg-zinc-200/50 shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          شارك الحاسبة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Native Share (mobile) */}
          {typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              شارك
            </Button>
          )}

          {/* WhatsApp */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" />
              واتساب
            </a>
          </Button>

          {/* Twitter */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer">
              <Twitter className="w-4 h-4" />
              تويتر
            </a>
          </Button>

          {/* Facebook */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
          >
            <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="w-4 h-4" />
              فيسبوك
            </a>
          </Button>

          {/* Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                نسخ الرابط
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-right">
          ساعد أصحابك في معرفة التكلفة الحقيقية للشراء من الخارج
        </p>
      </CardContent>
    </Card>
  );
} 