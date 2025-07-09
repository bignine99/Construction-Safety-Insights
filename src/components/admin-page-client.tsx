'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { deleteAllIncidents, uploadIncidentChunk } from '@/app/admin/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Incident } from '@/lib/types';
import { Loader2, Upload, Trash2, ServerCrash } from 'lucide-react';

type RawIncident = Record<string, any>;

function cleanConstructionType(type: string): string {
  if (!type) return '기타';
  const cleaned = type.replace(/^[0-9]+\s*/, '').trim();
  return cleaned || '기타';
}

function mapRawToIncident(raw: RawIncident): Incident {
  return {
    id: raw['사건_Code'],
    name: raw['사고명'],
    dateTime: raw['사고일시'],
    projectOwner: raw['사업특성_구분'],
    projectType: raw['사업특성_용도'],
    projectCost: raw['사업특성_공사비(억원미만)'],
    constructionTypeMain: cleanConstructionType(raw['공종_대분류']),
    constructionTypeSub: cleanConstructionType(raw['공종_중분류']),
    workType: raw['공종_작업'],
    objectMain: raw['사고객체_대분류'],
    objectSub: raw['사고객체_중분류'],
    causeMain: raw['사고원인-대분류'],
    causeMiddle: raw['사고원인-중분류'],
    causeSub: raw['사고원인-소분류'],
    causeDetail: raw['사고원인_상세'],
    resultMain: raw['사고결과_대분류'],
    resultDetail: raw['사고결과_상세'],
    fatalities: Number(raw['사고피해_사망자수']) || 0,
    injuries: Number(raw['사고피해_부상자수']) || 0,
    costDamage: Number(raw['금액(백만원)']) || 0,
    riskIndex: Number(raw['사고위험지수']) || 0,
  };
}


export default function AdminPageClient() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: '파일 없음',
        description: '업로드할 JSON 파일을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setStatusMessage('파일을 읽는 중...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error('파일을 읽을 수 없습니다.');
        }

        const rawIncidents: RawIncident[] = JSON.parse(content);
        const incidents = rawIncidents.map(mapRawToIncident);
        const totalIncidents = incidents.length;
        const CHUNK_SIZE = 100; // 한 번에 보낼 데이터 수 (안정적인 값)
        const totalChunks = Math.ceil(totalIncidents / CHUNK_SIZE);
        setStatusMessage(`총 ${totalIncidents}개의 데이터를 ${totalChunks}개로 나누어 업로드를 시작합니다.`);

        for (let i = 0; i < totalChunks; i++) {
          const chunk = incidents.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          setStatusMessage(`${i + 1}/${totalChunks}번째 덩어리 업로드 중... (${chunk.length}개)`);

          const result = await uploadIncidentChunk(chunk);
          
          if (!result.success) {
            throw new Error(`청크 ${i + 1} 업로드 실패: ${result.message}`);
          }
          
          const currentProgress = ((i + 1) / totalChunks) * 100;
          setProgress(currentProgress);
          
          // Firestore 과부하 방지를 위한 휴식 시간
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setStatusMessage('모든 데이터가 성공적으로 업로드되었습니다!');
        toast({
          title: '업로드 완료',
          description: `총 ${totalIncidents}개의 사고 데이터가 성공적으로 업로드되었습니다.`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('업로드 실패:', errorMessage);
        setStatusMessage(`오류 발생: ${errorMessage}`);
        toast({
          title: '업로드 실패',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        setFile(null);
      }
    };
    reader.readAsText(file);
  };
  
  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setStatusMessage('모든 사고 데이터를 삭제하는 중...');
    const result = await deleteAllIncidents();

    if (result.success) {
      toast({
        title: '삭제 완료',
        description: result.message,
      });
      setStatusMessage('모든 데이터가 삭제되었습니다.');
    } else {
      toast({
        title: '삭제 실패',
        description: result.message,
        variant: 'destructive',
      });
       setStatusMessage(`삭제 중 오류 발생: ${result.message}`);
    }
    setIsDeleting(false);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>사고 데이터 업로드</CardTitle>
          <CardDescription>
            `incidents.json` 파일을 선택하여 Firestore 데이터베이스에 업로드합니다. 기존 데이터에 덮어씁니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".json" onChange={handleFileChange} disabled={isUploading || isDeleting} />
          <Button onClick={handleUpload} disabled={!file || isUploading || isDeleting}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? '업로드 중...' : '업로드 실행'}
          </Button>
          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>데이터베이스 초기화</CardTitle>
           <CardDescription>
            Firestore의 'incidents' 컬렉션에 있는 모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isUploading || isDeleting}>
                 {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {isDeleting ? '삭제 중...' : '전체 사고 데이터 삭제'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 데이터베이스에서 모든 사고 데이터가 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>계속</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           {isDeleting && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
