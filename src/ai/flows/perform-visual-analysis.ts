'use server';
/**
 * @fileOverview A visual analysis AI agent that can answer questions about images.
 *
 * - performVisualAnalysis - A function that handles visual analysis requests.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { VisualAnalysisInput } from '@/lib/types';
import type { Part } from '@genkit-ai/googleai';

const VisualAnalysisInputSchema = z.object({
  prompt: z.string().describe('The user\'s question or prompt.'),
  photoDataUri: z
    .string()
    .nullable()
    .describe(
      "An optional photo of a construction site or document, as a data URI."
    ),
});

export async function performVisualAnalysis(
  input: VisualAnalysisInput
): Promise<AsyncGenerator<string>> {
  return performVisualAnalysisFlow(input);
}

const performVisualAnalysisFlow = ai.defineFlow(
  {
    name: 'performVisualAnalysisFlow',
    inputSchema: VisualAnalysisInputSchema,
    outputSchema: z.string(),
    stream: true,
  },
  async (input, streamingCallback) => {
    const systemPrompt = `당신은 건설 안전 전문가 AI입니다. 당신의 역할은 건설 현장과 관련된 이미지와 텍스트를 분석하여 잠재적 위험 요소를 식별하고, 안전 개선 사항을 제안하며, 관련 질문에 답변하는 것입니다. 답변은 간결하고 명확하며 전문가적인 어조를 유지해야 합니다. 실행 가능한 조언을 우선적으로 제공하세요. 이미지가 제공되지 않은 경우, 건설 안전에 대한 일반적인 지식을 바탕으로 질문에 답변하세요. 모든 답변은 한국어로 제공해야 합니다.`;
    
    const promptParts: Part[] = [{ text: input.prompt }];

    if (input.photoDataUri) {
      promptParts.unshift({
        media: {
          url: input.photoDataUri,
        },
      });
    }

    const { stream } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      prompt: promptParts,
      stream: streamingCallback,
    });
    
    let fullResponse = '';
    for await (const chunk of stream) {
      fullResponse += chunk.text;
    }

    return fullResponse;
  }
);
