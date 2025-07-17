'use client';

import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

export default function PageHeader({
  title: defaultTitle,
  subtitle: defaultSubtitle,
}: {
  title: string;
  subtitle: string;
}) {
  // 환경 변수에서 값을 읽어오고, 없으면 props의 기본값을 사용합니다.
  const title = process.env.NEXT_PUBLIC_APP_TITLE || defaultTitle;
  const subtitle = process.env.NEXT_PUBLIC_APP_SUBTITLE || defaultSubtitle;
  const cnuLogoUrl = process.env.NEXT_PUBLIC_CNU_LOGO_URL || "https://cnu.nhi.go.kr/upload/bureau/logo/20240306/F20240306164930230.png";
  const ninetynineLogoUrl = process.env.NEXT_PUBLIC_NINETYNINE_LOGO_URL || "https://i.postimg.cc/x80mN6S0/NN01.png";

  return (
    <div className="flex w-full items-start gap-4">
      <SidebarTrigger className="md:hidden" />
      <Card className="flex-1">
        <div className="flex items-end justify-between p-4">
          <div className="flex flex-1 items-end justify-start">
            <Image
              src={cnuLogoUrl}
              alt="Chungnam National University Logo"
              width={270}
              height={68}
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="pb-1 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-primary/90 md:text-base">
              {subtitle}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              본 데이터 분석은 공공데이터 포탈에서 제공하는 국토안전관리원 건설안전사고사례 자료(2019.07 ~ 2024.06)를 활용하였습니다.
            </p>
          </div>
          <div className="flex flex-1 items-end justify-end">
            <Image
              src={ninetynineLogoUrl}
              alt="Ninetynine Logo"
              width={225}
              height={75}
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
