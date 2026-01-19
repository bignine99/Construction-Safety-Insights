'use client';

import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function PageHeader({
  title: defaultTitle,
  subtitle: defaultSubtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const title = process.env.NEXT_PUBLIC_APP_TITLE || defaultTitle;
  const subtitle = process.env.NEXT_PUBLIC_APP_SUBTITLE || defaultSubtitle;
  const cnuLogoUrl = process.env.NEXT_PUBLIC_CNU_LOGO_URL || "https://cnu.nhi.go.kr/upload/bureau/logo/20240306/F20240306164930230.png";
  const ninetynineLogoUrl = process.env.NEXT_PUBLIC_NINETYNINE_LOGO_URL || "https://i.postimg.cc/x80mN6S0/NN01.png";

  return (
    <div className="flex w-full items-center justify-between gap-6 py-2">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden text-slate-400 hover:text-indigo-600 transition-colors" />
        <div className="flex-shrink-0">
          <Image
            src={cnuLogoUrl}
            alt="Chungnam National University Logo"
            width={240}
            height={60}
            className="h-14 w-auto object-contain mix-blend-multiply opacity-90"
          />
        </div>
      </div>

      <div className="flex flex-col items-center text-center max-w-2xl px-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight animate-rainbow">
          {title}
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest animate-instagram">
          {subtitle}
        </p>
        <p className="mt-2 text-[10px] font-medium text-slate-400 max-w-lg hidden md:block">
          국토안전관리원 건설안전사고사례 (2019.07 ~ 2024.06) 공공데이터 기반 정밀 분석 시스템
        </p>
      </div>

      <div className="flex items-center justify-end">
        <a 
          href="https://www.ninetynine99.co.kr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Image
            src={ninetynineLogoUrl}
            alt="Ninetynine Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
}
