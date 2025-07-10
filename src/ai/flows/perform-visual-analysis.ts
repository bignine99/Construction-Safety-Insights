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
    const systemPrompt = `You are a construction safety expert AI. Your role is to analyze images and text related to construction sites to identify potential hazards, suggest safety improvements, and answer questions. Be concise, clear, and professional. Prioritize actionable advice. If no image is provided, answer the question based on your general knowledge of construction safety. Respond in Korean.`;
    
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
