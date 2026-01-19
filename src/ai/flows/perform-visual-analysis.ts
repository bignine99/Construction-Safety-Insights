'use server';

/**
 * @fileOverview A visual analysis AI agent that can answer questions about images.
 * JSON 배열 형식 스트리밍 응답 처리
 */

import {VisualAnalysisInput} from '@/lib/types';

/**
 * 사용 가능한 모델 목록 조회
 */
async function listAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    const availableModels = models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => name.includes('gemini'));
    
    return availableModels;
  } catch (error: any) {
    return [];
  }
}

export async function performVisualAnalysis(
  input: VisualAnalysisInput
): Promise<AsyncGenerator<string>> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    async function* errorGenerator() {
      yield '[오류] API 키가 설정되지 않았습니다.';
    }
    return errorGenerator();
  }

  // 사용 가능한 모델 목록 조회
  const availableModels = await listAvailableModels(apiKey);
  if (availableModels.length === 0) {
    async function* errorGenerator() {
      yield '[오류] 사용 가능한 모델을 찾을 수 없습니다.';
    }
    return errorGenerator();
  }

  // 이미지 분석에 적합한 모델 선택 (flash 모델 우선)
  const modelName = availableModels.find(m => m.includes('flash')) || availableModels[0];
  console.log(`[Visual AI] 선택된 모델: ${modelName}`);

  // 시스템 프롬프트를 사용자 질문에 통합
  const systemContext = `당신은 건설 안전 전문가 AI입니다. 건설 현장 이미지와 텍스트를 분석하여 잠재적 위험 요소를 식별하고, 안전 개선 사항을 제안하며, 관련 질문에 답변하세요. 답변은 간결하고 명확하며 전문가적인 어조로 한국어로 제공하세요.`;

  const userPrompt = input.prompt || '이 이미지를 분석해주세요.';
  const fullPrompt = `${systemContext}\n\n${userPrompt}`;

  // REST API 직접 호출 (v1 엔드포인트, 스트리밍 지원)
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:streamGenerateContent?key=${apiKey}`;
  
  const requestBody: any = {
    contents: [{
      parts: []
    }]
  };

  // 이미지가 있으면 추가
  if (input.photoDataUri) {
    try {
      // Data URI를 base64로 변환
      const base64Data = input.photoDataUri.split(',')[1];
      const mimeType = input.photoDataUri.split(',')[0].split(':')[1].split(';')[0];
      
      requestBody.contents[0].parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    } catch (e) {
      console.error('[Visual AI] 이미지 처리 오류:', e);
    }
  }

  // 텍스트 프롬프트 추가
  requestBody.contents[0].parts.push({
    text: fullPrompt
  });

  async function* generate() {
    try {
      console.log('[Visual AI] API 요청 시작...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Visual AI] API 오류:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('[Visual AI] 스트리밍 응답 수신 시작...');

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트리밍 응답을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let hasYielded = false;
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // 마지막 버퍼 처리
          if (buffer.trim()) {
            try {
              // JSON 배열 형식 처리
              const trimmed = buffer.trim();
              if (trimmed.startsWith('[')) {
                const array = JSON.parse(trimmed);
                for (const item of array) {
                  if (item.candidates?.[0]?.content?.parts?.[0]?.text) {
                    hasYielded = true;
                    yield item.candidates[0].content.parts[0].text;
                  }
                }
              } else if (trimmed.startsWith('{')) {
                const data = JSON.parse(trimmed);
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                  hasYielded = true;
                  yield data.candidates[0].content.parts[0].text;
                }
              }
            } catch (e) {
              // 파싱 실패는 무시
            }
          }
          
          console.log(`[Visual AI] 스트리밍 완료. 총 청크: ${chunkCount}, yield 횟수: ${hasYielded ? '있음' : '없음'}`);
          if (!hasYielded) {
            yield '[알림] 응답이 비어있습니다.';
          }
          break;
        }

        chunkCount++;
        buffer += decoder.decode(value, { stream: true });
        
        // JSON 배열이 완성될 때까지 버퍼에 모으기
        // 완전한 JSON 객체를 찾아서 파싱
        let braceCount = 0;
        let bracketCount = 0;
        let startPos = -1;
        
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] === '[') {
            if (bracketCount === 0) startPos = i;
            bracketCount++;
          } else if (buffer[i] === ']') {
            bracketCount--;
            if (bracketCount === 0 && startPos !== -1) {
              // 완전한 JSON 배열 발견
              try {
                const jsonStr = buffer.substring(startPos, i + 1);
                const array = JSON.parse(jsonStr);
                
                for (const item of array) {
                  if (item.candidates?.[0]?.content?.parts) {
                    for (const part of item.candidates[0].content.parts) {
                      if (part.text) {
                        hasYielded = true;
                        yield part.text;
                      }
                    }
                  }
                }
                
                // 처리한 부분 제거
                buffer = buffer.substring(i + 1);
                startPos = -1;
                break;
              } catch (e) {
                // 파싱 실패 시 계속 진행
              }
            }
          } else if (buffer[i] === '{') {
            if (bracketCount === 0 && braceCount === 0) startPos = i;
            braceCount++;
          } else if (buffer[i] === '}') {
            braceCount--;
            if (braceCount === 0 && bracketCount === 0 && startPos !== -1) {
              // 완전한 JSON 객체 발견
              try {
                const jsonStr = buffer.substring(startPos, i + 1);
                const data = JSON.parse(jsonStr);
                
                if (data.candidates?.[0]?.content?.parts) {
                  for (const part of data.candidates[0].content.parts) {
                    if (part.text) {
                      hasYielded = true;
                      yield part.text;
                    }
                  }
                }
                
                // 처리한 부분 제거
                buffer = buffer.substring(i + 1);
                startPos = -1;
                break;
              } catch (e) {
                // 파싱 실패 시 계속 진행
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[Visual AI] 에러 발생:', error.message);
      // 에러 발생 시 사용자에게 알림
      yield `\n\n[오류 발생] ${error.message?.substring(0, 300) || '알 수 없는 오류'}\n`;
      if (error.message?.includes('429')) {
        yield '할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요.\n';
      } else if (error.message?.includes('400')) {
        yield '요청 형식 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n';
      }
    }
  }

  return generate();
}
