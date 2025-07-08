'use client';

import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex w-full items-start gap-4">
      <SidebarTrigger className="md:hidden" />
      <Card className="flex-1">
        <div className="flex items-end justify-between p-4">
          <div className="flex flex-1 items-end justify-start">
            <Image
              src="https://cnu.nhi.go.kr/upload/bureau/logo/20240306/F20240306164930230.png"
              alt="Chungnam National University Logo"
              width={270}
              height={68}
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="pb-1 text-center">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-1 items-end justify-end">
            <Image
              src="https://i.postimg.cc/x80mN6S0/NN01.png"
              alt="Ninetynine Logo"
              width={225}
              height={75}
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
