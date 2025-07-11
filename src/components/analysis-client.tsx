'use client';

import { useState, useRef } from 'react';
import type { AiAnalysis, Incident, VisualAnalysisInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiAnalysis, performVisualAnalysisAction } from '@/app/actions';
import { Loader2, HelpCircle, Paperclip, Sparkles, Wand2, X, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import Image from 'next/image';

function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const LoadingSkeleton = () => (
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
);

export default function AnalysisClient({ incidents }: { incidents: Incident[] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysis | null>(null);

  const [qaLoading, setQaLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);
    const descriptions = incidents.map(i => i.name).filter(Boolean);
    const result = await getAiAnalysis(descriptions);
    setAnalysisResult(result);
    setLoading(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: '파일 크기 초과',
          description: '4MB 이하의 이미지만 업로드할 수 있습니다.',
          variant: 'destructive',
        });
        return;
      }
      const dataUri = await fileToDataURI(file);
      setUploadedImage(dataUri);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: '질문을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setQaLoading(true);
    setAnswer('');
    
    const visualInput: VisualAnalysisInput = {
      prompt: question,
      photoDataUri: uploadedImage,
    };

    try {
      const { stream } = await performVisualAnalysisAction(visualInput);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setAnswer(fullResponse);
      }
    } catch (error) {
      console.error('Visual analysis failed:', error);
      toast({
        title: '분석 중 오류 발생',
        description: 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setQaLoading(false);
    }
  };

  const renderBulletPoints = (items: string[]) => (
    <ul className="list-disc space-y-2 pl-5 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">AI 기반 데이터 분석</CardTitle>
          <CardDescription className="text-primary/90">
            AI를 통해 필터링된 데이터를 분석하여 데이터 분석 결과, 재발 방지 대책, 안전작업 지시사항을 제공합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleAnalysis} disabled={loading || incidents.length === 0}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? '분석 중...' : `AI 분석 실행 (${incidents.length}건)`}
          </Button>

          {loading && (
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          )}

          {analysisResult && (
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>데이터 분석 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {renderBulletPoints(analysisResult.analysisResults)}
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>재발 방지 대책</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {renderBulletPoints(analysisResult.preventativeMeasures)}
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>안전작업 지시사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {renderBulletPoints(analysisResult.safetyInstructions)}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <HelpCircle className="h-6 w-6" />
            AI 질문 및 분석 창
          </CardTitle>
          <CardDescription className="text-primary/90">
            건설 안전에 대한 질문을 하거나, 현장 사진 또는 작업일보를 업로드하여 분석을 요청하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="예: 이 사진에서 위험요소는 무엇인가요?"
              className="flex-grow"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              disabled={qaLoading}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={qaLoading}>
              <Paperclip className="mr-2 h-4 w-4" />
              파일 첨부
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button onClick={handleAskQuestion} disabled={qaLoading}>
              {qaLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              질문하기
            </Button>
          </div>
          {uploadedImage && (
            <div className="relative w-48 h-48 border rounded-md">
              <Image src={uploadedImage} alt="Uploaded preview" fill objectFit="cover" className="rounded-md" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setUploadedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {qaLoading && !answer && (
             <div className="space-y-2 pt-4">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          )}
          {answer && (
            <div className="pt-4">
              <Textarea value={answer} readOnly className="h-48 text-sm" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
