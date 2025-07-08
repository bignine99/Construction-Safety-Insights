'use client';

import { useState } from 'react';
import type { AiAnalysis, Incident } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiAnalysis } from '@/app/actions';
import { Loader2, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export default function AnalysisClient({ incidents }: { incidents: Incident[] }) {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysis | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);
    const descriptions = incidents.map(i => i.causeSpecific);
    const result = await getAiAnalysis(descriptions);
    setAnalysisResult(result);
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12">
      <div className="flex justify-center">
        <Button onClick={handleAnalysis} disabled={loading} size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Zap className="mr-2 h-5 w-5" />
          )}
          {loading ? '분석 중...' : 'AI로 테마 분석하기'}
        </Button>
      </div>

      {loading && (
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {analysisResult && (
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>핵심 사고 테마</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysisResult.themes.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>AI 추천 예방 대책</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {analysisResult.preventativeMeasures.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
