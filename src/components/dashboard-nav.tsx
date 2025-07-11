// src/components/dashboard-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, FileDown, LayoutDashboard, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function DashboardNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePdfDownload = async () => {
    const content = document.getElementById('page-content');
    if (!content) {
      toast({
        title: '오류',
        description: 'PDF로 변환할 콘텐츠를 찾을 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // 캡처 전 스크롤을 최상단으로 이동하여 전체 페이지가 보이도록 함
      window.scrollTo(0, 0);
      // 약간의 지연을 주어 렌더링 시간을 확보
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(content, {
        scale: 2, // 해상도를 높여 품질 개선
        useCORS: true, // CORS 이미지 처리를 위함
        onclone: (document) => {
          // re-charts의 일부 스타일이 복제된 문서에 제대로 적용되지 않는 문제를 해결
          const style = document.createElement('style');
          style.innerHTML = `
            .recharts-surface {
              overflow: visible !important;
            }
          `;
          document.head.appendChild(style);
        }
      });
      
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('analysis-report.pdf');
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      toast({
        title: 'PDF 생성 오류',
        description: 'PDF를 생성하는 동안 문제가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-muted/50 p-1">
      <Button
        asChild
        variant={pathname === '/' ? 'default' : 'outline'}
        className="flex-1 justify-center min-w-[200px]"
      >
        <Link href="/">
          <LayoutDashboard />
          안전사고 분석 대시보드
        </Link>
      </Button>
      <Button
        asChild
        variant={pathname === '/analysis' ? 'default' : 'outline'}
        className="flex-1 justify-center min-w-[200px]"
      >
        <Link href="/analysis">
          <BrainCircuit />
          AI 기반 데이터 분석
        </Link>
      </Button>
      <Button
        variant="outline"
        onClick={handlePdfDownload}
        className="flex-1 justify-center min-w-[200px]"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <FileDown />
        )}
        {isDownloading ? '다운로드 중...' : '분석결과 PDF 다운로드'}
      </Button>
    </div>
  );
}
