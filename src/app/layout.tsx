import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';

// 환경 변수에서 메타데이터 값을 읽어옵니다.
const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || 'Construction Safety Insights';
const appDescription = process.env.NEXT_PUBLIC_APP_SUBTITLE || '건설산업 안전사고 분석 대시보드';

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Suppress favicon and apple-touch-icon requests to avoid 404 errors */}
        <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
