'use server';

import type { AiAnalysis, Incident, VisualAnalysisInput, SavedSolution, DashboardStats } from '@/lib/types';
import * as incidentService from '@/services/incident.service';
import * as solutionService from '@/services/solution.service';

/**
 * 사용 가능한 모델 목록 조회
 */
async function listAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('[진단] 모델 목록 조회 실패:', response.status);
      return [];
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // generateContent를 지원하는 모델만 필터링
    const availableModels = models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => name.includes('gemini'));
    
    console.log('[진단] 사용 가능한 모델 목록:', availableModels);
    return availableModels;
  } catch (error: any) {
    console.error('[진단] 모델 목록 조회 중 오류:', error.message);
    return [];
  }
}

/**
 * REST API를 직접 호출하여 Gemini 모델 사용
 */
async function callGeminiAPI(apiKey: string, modelName: string, prompt: string) {
  // v1 API 엔드포인트 사용
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('API 응답 형식이 올바르지 않습니다.');
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * AI 기반 안전사고 데이터 심층 분석
 */
export async function getAiAnalysis(
  accidentDescriptions: string[]
): Promise<AiAnalysis> {
  console.log(`[AI] 전문가 모드 분석 시작 (대상: ${accidentDescriptions.length}건)`);

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  console.log('[진단] API 키 존재 여부:', apiKey ? '있음' : '없음');
  console.log('[진단] API 키 길이:', apiKey?.length || 0);

  if (!apiKey) {
    return {
      analysisResults: ['API 키가 설정되지 않았습니다.'],
      preventativeMeasures: ['.env 파일에 GOOGLE_GENAI_API_KEY를 입력해주세요.'],
      safetyInstructions: [],
    };
  }

  // 1단계: 사용 가능한 모델 목록 조회
  console.log('[AI] 사용 가능한 모델 목록 조회 중...');
  const availableModels = await listAvailableModels(apiKey);
  
  if (availableModels.length === 0) {
    return {
      analysisResults: [
        '❌ 사용 가능한 Gemini 모델을 찾을 수 없습니다.',
        'API 키가 Gemini API에 대한 권한이 없거나,',
        '구글 클라우드 프로젝트에서 Gemini API가 활성화되지 않았습니다.'
      ],
      preventativeMeasures: [
        '1. Google AI Studio (https://aistudio.google.com) 접속',
        '2. 완전히 새로운 프로젝트 생성',
        '3. "Get API Key" 클릭하여 새 키 발급',
        '4. .env 파일에 GOOGLE_GENAI_API_KEY=새키 입력',
        '5. npm run build && pm2 restart safety-dashboard 실행'
      ],
      safetyInstructions: [
        '현재 API 키로는 Gemini 모델에 접근할 수 없습니다.'
      ],
    };
  }

  // 2단계: 사용 가능한 모델 중 첫 번째 모델 사용
  const modelName = availableModels[0];
  console.log(`[AI] 선택된 모델: ${modelName}`);

  // 50건 데이터 구성
  const targetData = accidentDescriptions.slice(0, 50);
  const accidentsList = targetData.map((d, i) => `[사고${i+1}] ${d}`).join('\n');

  const prompt = `당신은 건설안전 전문가입니다. 다음 ${targetData.length}건의 안전사고 데이터를 분석하여 보고서를 작성하세요.

[사고 데이터]
${accidentsList}

[요구사항]
반드시 아래의 JSON 형식으로만 답변하세요. 다른 설명은 추가하지 마세요.
{
  "analysisResults": ["주요 사고 원인 및 패턴 분석 3~5개"],
  "preventativeMeasures": ["실질적인 재발 방지 대책 3~5개"],
  "safetyInstructions": ["현장 안전 지시사항 3~5개"]
}`;

  try {
    console.log(`[AI] REST API 직접 호출 중 (모델: ${modelName})...`);
    
    const text = await callGeminiAPI(apiKey, modelName, prompt);
    
    console.log('[AI] 응답 수신 완료. JSON 파싱 중...');
    
    // JSON 추출
    let jsonStr = text.trim();
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // JSON 객체 시작/끝 찾기
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsedResult = JSON.parse(jsonStr);
    
    console.log('[AI] ✅ 분석 성공!');

    // 결과 저장
    solutionService.saveSolution({
      analysisResults: parsedResult.analysisResults,
      preventativeMeasures: parsedResult.preventativeMeasures,
      safetyInstructions: parsedResult.safetyInstructions,
      incidentCount: accidentDescriptions.length,
      title: `${targetData.length}건 전문가 심층 분석 (${modelName})`,
    }).catch(e => console.error('[AI] 저장 실패:', e));

    return parsedResult;

  } catch (error: any) {
    console.error('[AI] 에러 발생:', error.message);
    
    if (error.message?.includes('404')) {
      return {
        analysisResults: [
          '❌ 모델을 찾을 수 없습니다 (404).',
          `시도한 모델: ${modelName}`,
          'API 키가 해당 모델에 접근할 권한이 없는 것으로 보입니다.'
        ],
        preventativeMeasures: [
          '1. Google AI Studio에서 새 API 키 발급',
          '2. 프로젝트에 Gemini API가 활성화되어 있는지 확인',
          '3. API 키 권한 설정 확인'
        ],
        safetyInstructions: [
          `에러: ${error.message.substring(0, 200)}`
        ],
      };
    }
    
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        analysisResults: ['⚠️ AI 서비스 할당량이 소진되었습니다.'],
        preventativeMeasures: ['약 2~3분 후 다시 시도해 주세요.'],
        safetyInstructions: [],
      };
    }

    return {
      analysisResults: [
        `❌ 분석 실패`,
        `에러: ${error.message?.substring(0, 200) || '알 수 없는 오류'}`
      ],
      preventativeMeasures: [
        '가상 서버 터미널의 상세 로그를 확인해주세요.'
      ],
      safetyInstructions: [],
    };
  }
}

// --- 나머지 서비스 함수들 ---
export async function getIncidents(): Promise<Incident[]> { 
  return await incidentService.getIncidents(); 
}

export async function getPaginatedIncidentsAction(
  filters: incidentService.IncidentFilters,
  page: number = 1,
  pageSize: number = 50
) { 
  return await incidentService.getPaginatedIncidents(filters, page, pageSize); 
}

export async function getDashboardStats(filters: incidentService.IncidentFilters): Promise<DashboardStats> { 
  return await incidentService.getDashboardStats(filters); 
}

export async function getFilterOptions() { 
  return await incidentService.getFilterOptions(); 
}

export async function getRecentSolutionsAction(limit: number = 5): Promise<SavedSolution[]> { 
  return await solutionService.getRecentSolutions(limit); 
}

export async function performVisualAnalysisAction(input: VisualAnalysisInput): Promise<{ stream: AsyncGenerator<string> }> {
  const { performVisualAnalysis } = await import('@/ai/flows/perform-visual-analysis');
  return { stream: await performVisualAnalysis(input) };
}
