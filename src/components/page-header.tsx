'use client';

import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden"/>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="hidden items-center space-x-4 md:flex">
        <Image
          src="https://placehold.co/180x40"
          alt="Chungnam National University Logo"
          width={180}
          height={40}
          data-ai-hint="university logo"
        />
        <Image
          src="https://placehold.co/150x40"
          alt="Ninetynine Logo"
          width={150}
          height={40}
          data-ai-hint="company logo"
        />
      </div>
    </div>
  );
}
