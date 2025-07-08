'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, FileDown, LayoutDashboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function DashboardNav() {
  const pathname = usePathname();
  const { toast } = useToast();

  const handlePdfDownload = () => {
    toast({
      title: '기능 구현 중',
      description: '분석결과 PDF 다운로드 기능은 현재 개발 중입니다.',
    });
  };

  return (
    <div className="flex gap-2 rounded-lg bg-muted/50 p-1">
      <Button
        asChild
        variant={pathname === '/' ? 'default' : 'outline'}
        className="flex-1 justify-center"
      >
        <Link href="/">
          <LayoutDashboard />
          안전사고 분석 대시보드
        </Link>
      </Button>
      <Button
        asChild
        variant={pathname === '/analysis' ? 'default' : 'outline'}
        className="flex-1 justify-center"
      >
        <Link href="/analysis">
          <BrainCircuit />
          AI 기반 데이터 분석
        </Link>
      </Button>
      <Button
        variant="outline"
        onClick={handlePdfDownload}
        className="flex-1 justify-center"
      >
        <FileDown />
        분석결과 PDF 다운로드
      </Button>
    </div>
  );
}
