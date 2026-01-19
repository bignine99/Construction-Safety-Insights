'use client';

import { useState, useRef } from 'react';
import type { AiAnalysis, Incident, VisualAnalysisInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiAnalysis, performVisualAnalysisAction } from '@/app/actions';
import { Loader2, Paperclip, Sparkles, Wand2, X, RotateCcw, BrainCircuit, ShieldAlert, ClipboardCheck, MessageSquareMore } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const LoadingSkeleton = () => (
    <Card className="border-none shadow-none bg-slate-50/50">
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
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
    if (descriptions.length === 0) {
      toast({
        title: '분석 대상 없음',
        description: 'AI 분석을 실행하려면 먼저 데이터를 필터링해주세요.',
        variant: 'destructive',
      })
      setLoading(false);
      return;
    }
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
    if (!question.trim() && !uploadedImage) {
      toast({
        title: '입력 오류',
        description: '질문이나 이미지를 입력해주세요.',
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
        title: '시스템 오류',
        description: 'AI 응답 수신 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setQaLoading(false);
    }
  };

  const handleResetQuestion = () => {
    setQuestion('');
    setAnswer('');
    setUploadedImage(null);
    setQaLoading(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const renderBulletPoints = (items: string[], icon: React.ReactNode, bgColor: string) => (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-sm text-slate-600 leading-relaxed group">
          <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", bgColor)} />
          <span className="group-hover:text-slate-900 transition-colors">{item}</span>
        </li>
      ))}
    </ul>
  );
  
  const isQuestionReady = question.trim().length > 0 || !!uploadedImage;

  return (
    <div className="flex flex-col gap-10">
      {/* 1. 핵심 분석 섹션 */}
      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold tracking-tight">AI 안전 분석 레포트 생성</h3>
              </div>
              <p className="text-slate-400 text-sm">추출된 {incidents.length}건의 데이터를 기반으로 고도화된 안전 진단을 수행합니다.</p>
            </div>
            <Button 
              onClick={handleAnalysis} 
              disabled={loading || incidents.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-none h-12 px-8 rounded-full font-semibold transition-all hover:scale-105"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              분석 리포트 발행
            </Button>
          </div>
        </div>

        <CardContent className="p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : analysisResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
                  <ShieldAlert className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-700 uppercase">Analysis Results</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">데이터 분석 결과</h4>
                {renderBulletPoints(analysisResult.analysisResults, null, "bg-indigo-500")}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg w-fit">
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-600 uppercase">Prevention</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">재발 방지 대책</h4>
                {renderBulletPoints(analysisResult.preventativeMeasures, null, "bg-indigo-600")}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg w-fit">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-600 uppercase">Safety Instructions</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">안전작업 지시사항</h4>
                {renderBulletPoints(analysisResult.safetyInstructions, null, "bg-emerald-500")}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
              <Sparkles className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium text-sm">데이터를 선택하고 분석 버튼을 눌러 리포트를 확인하세요.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. 대화형 AI 인터페이스 섹션 */}
      <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <MessageSquareMore className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">Safety AI 어드바이저</CardTitle>
          </div>
          <CardDescription className="text-slate-500 leading-relaxed max-w-2xl text-sm">
            현장 사진, 체크리스트, 작업 일보를 첨부하여 질문해 보세요. <br/>
            이미지 분석 기술을 활용하여 실시간 위험성 평가를 도와드립니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-grow w-full space-y-4">
              <div className="relative group">
                <Input 
                  placeholder="예: 이 사진에서 식별되는 추락 위험 요소는 무엇입니까?"
                  className="h-14 pl-6 pr-32 rounded-xl border-slate-200 shadow-sm focus:ring-indigo-500 transition-all text-sm"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isQuestionReady && handleAskQuestion()}
                  disabled={qaLoading}
                />
                <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={qaLoading}
                    className="rounded-lg h-full px-4 border-slate-200 hover:bg-slate-50"
                  >
                    <Paperclip className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-xs font-semibold text-slate-600">파일</span>
                  </Button>
                  <Button 
                    onClick={handleAskQuestion} 
                    disabled={qaLoading || !isQuestionReady}
                    className="rounded-lg h-full px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md"
                  >
                    {qaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    분석
                  </Button>
                </div>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

              {uploadedImage && (
                <div className="relative w-48 h-48 border-2 border-slate-100 rounded-xl overflow-hidden shadow-md group animate-fade-in">
                  <Image src={uploadedImage} alt="Uploaded preview" fill className="object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <Button variant="ghost" onClick={handleResetQuestion} disabled={qaLoading} className="h-14 px-6 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              초기화
            </Button>
          </div>

          {(qaLoading || answer) && (
            <div className={cn(
              "mt-8 p-8 rounded-2xl border transition-all animate-fade-in",
              answer ? "bg-indigo-50/30 border-indigo-100" : "bg-slate-50 border-slate-100"
            )}>
              {qaLoading && !answer ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Thinking...</span>
                  </div>
                  <Skeleton className="h-4 w-4/5 bg-slate-200" />
                  <Skeleton className="h-4 w-full bg-slate-200" />
                  <Skeleton className="h-4 w-2/3 bg-slate-200" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Expert Opinion</span>
                  </div>
                  <div className="text-slate-700 text-[15px] leading-[1.8] whitespace-pre-wrap font-medium">
                    {answer}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
