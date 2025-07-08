'use client';

import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex w-full items-center gap-4">
      <SidebarTrigger className="md:hidden" />
      <Card className="flex-1">
        <div className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="hidden justify-start md:flex">
            <Image
              src="https://cnu.nhi.go.kr/upload/bureau/logo/20240306/F20240306164930230.png"
              alt="Chungnam National University Logo"
              width={270}
              height={68}
              className="h-14 w-auto object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          </div>
          <div className="hidden justify-end md:flex">
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
