'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, BrainCircuit, FileDown } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const { toast } = useToast();

  const handlePdfDownload = () => {
    toast({
      title: '기능 구현 중',
      description: '분석결과 PDF 다운로드 기능은 현재 개발 중입니다.',
    });
  };

  return (
    <div className="flex w-full items-start gap-4">
      <SidebarTrigger className="md:hidden" />
      <Card className="flex-1">
        <div className="flex items-start justify-between p-4">
          <div className="hidden flex-1 flex-col items-start gap-3 md:flex">
            <Image
              src="https://cnu.nhi.go.kr/upload/bureau/logo/20240306/F20240306164930230.png"
              alt="Chungnam National University Logo"
              width={270}
              height={68}
              className="h-14 w-auto object-contain"
            />
            <div className="flex gap-2 pl-1">
              <Button
                asChild
                variant={pathname === '/' ? 'default' : 'outline'}
                size="sm"
              >
                <Link href="/">
                  <LayoutDashboard />
                  안전사고 분석 대시보드
                </Link>
              </Button>
              <Button
                asChild
                variant={pathname === '/analysis' ? 'default' : 'outline'}
                size="sm"
              >
                <Link href="/analysis">
                  <BrainCircuit />
                  AI 기반 데이터 분석
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePdfDownload}>
                <FileDown />
                분석결과 PDF 다운로드
              </Button>
            </div>
          </div>
          <div className="pt-2 text-center">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          </div>
          <div className="hidden flex-1 justify-end md:flex">
            <Image
              src="https://i.postimg.cc/x80mN6S0/NN01.png"
              alt="Ninetynine Logo"
              width={225}
              height={75}
              className="h-14 w-auto object-contain"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
