'use client';

import { useState } from 'react';
import type { AiAnalysis, Incident } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiAnalysis } from '@/app/actions';
import { Loader2, HelpCircle, Paperclip, Sparkles, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AnalysisClient({ incidents }: { incidents: Incident[] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysis | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);
    const descriptions = incidents.map(i => i.causeDetail).filter(Boolean);
    const result = await getAiAnalysis(descriptions);
    setAnalysisResult(result);
    setLoading(false);
  };

  const handleNotImplemented = () => {
    toast({
      title: '기능 구현 중',
      description: '해당 기능은 현재 개발 중입니다.',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI 기반 데이터 분석</CardTitle>
          <CardDescription>
            AI를 통해 필터링된 데이터를 분석하여 핵심 테마, 재발방지대책, 작업지시사항을 도출합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleAnalysis} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? '분석 중...' : 'AI 분석 실행'}
          </Button>

          {loading && (
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
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
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            AI 질문 및 분석 창
          </CardTitle>
          <CardDescription>
            건설 안전에 대한 질문을 하거나, 현장 사진 또는 작업일보를 업로드하여 분석을 요청하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="예: 이 사진에서 위험요소는 무엇인가요?"
              className="flex-grow"
            />
            <Button variant="outline" onClick={handleNotImplemented}>
              <Paperclip className="mr-2 h-4 w-4" />
              파일 첨부
            </Button>
            <Button onClick={handleNotImplemented}>
              <Sparkles className="mr-2 h-4 w-4" />
              질문하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
