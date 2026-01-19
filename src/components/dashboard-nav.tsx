// src/components/dashboard-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, FileDown, LayoutDashboard, Loader2, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        onclone: (document) => {
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

      pdf.save('safety-analysis-report.pdf');
      
      toast({
        title: '다운로드 완료',
        description: '분석 보고서가 성공적으로 생성되었습니다.',
      });
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

  const NavItem = ({ href, icon: Icon, label, isActive }: any) => (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "relative h-12 flex-1 min-w-[180px] rounded-xl font-bold transition-all duration-300",
        isActive 
          ? "bg-white text-indigo-600 shadow-sm border border-slate-100 ring-1 ring-slate-100" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <Link href={href} className="flex items-center justify-center gap-2">
        <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
        <span className="text-sm">{label}</span>
        {isActive && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
        )}
      </Link>
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-slate-100/50 border border-slate-200/60 backdrop-blur-sm">
      <NavItem 
        href="/" 
        icon={LayoutDashboard} 
        label="분석 대시보드" 
        isActive={pathname === '/'} 
      />
      <NavItem 
        href="/analysis" 
        icon={BrainCircuit} 
        label="지능형 AI 분석" 
        isActive={pathname === '/analysis'} 
      />
      <Button
        variant="ghost"
        onClick={handlePdfDownload}
        disabled={isDownloading}
        className="h-12 flex-1 min-w-[180px] rounded-xl font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        ) : (
          <FileDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
        )}
        <span className="text-sm ml-2">{isDownloading ? '생성 중...' : '리포트 내보내기'}</span>
      </Button>
      <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg shadow-indigo-200/50 animate-pulse-glow">
        <Sparkles className="w-3 h-3 text-white animate-float" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest animate-text-glow">Premium AI Active</span>
      </div>
    </div>
  );
}
