// src/ai/flows/analyze-accident-themes.ts
'use server';

/**
 * @fileOverview Analyzes accident descriptions to identify themes, suggest preventative measures, and provide safety instructions.
 *
 * - analyzeAccidentThemes - A function that handles the analysis of accident themes.
 * - AnalyzeAccidentThemesInput - The input type for the analyzeAccidentThemes function.
 * - AnalyzeAccidentThemesOutput - The return type for the analyzeAccidentThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAccidentThemesInputSchema = z.object({
  accidentDescriptions: z
    .array(z.string())
    .describe('An array of accident descriptions to analyze.'),
});
export type AnalyzeAccidentThemesInput = z.infer<
  typeof AnalyzeAccidentThemesInputSchema
>;

const AnalyzeAccidentThemesOutputSchema = z.object({
  analysisResults: z
    .array(z.string())
    .describe('The identified key themes or results from the accident data analysis.'),
  preventativeMeasures: z
    .array(z.string())
    .describe('Suggested preventative measures based on the analysis.'),
  safetyInstructions: z
    .array(z.string())
    .describe('Actionable safety work instructions for field workers.'),
});
export type AnalyzeAccidentThemesOutput = z.infer<
  typeof AnalyzeAccidentThemesOutputSchema
>;

export async function analyzeAccidentThemes(
  input: AnalyzeAccidentThemesInput
): Promise<AnalyzeAccidentThemesOutput> {
  return analyzeAccidentThemesFlow(input);
}

const analyzeAccidentThemesPrompt = ai.definePrompt({
  name: 'analyzeAccidentThemesPrompt',
  input: {schema: AnalyzeAccidentThemesInputSchema},
  output: {schema: AnalyzeAccidentThemesOutputSchema},
  prompt: `You are a construction safety expert AI. Based on the provided list of accident cause descriptions, please perform a detailed analysis. Your response must be in Korean.

Analyze the following accident descriptions:
{{#each accidentDescriptions}}
- {{{this}}}
{{/each}}

Based on your analysis, generate the following three sections. Each item should be a concise bullet point.

1.  **데이터 분석 결과 (Data Analysis Results)**: Identify the primary causes and recurring patterns from the accident data.
2.  **재발 방지 대책 (Recurrence Prevention Measures)**: Propose strategic measures to prevent similar accidents in the future.
3.  **안전작업 지시사항 (Safety Work Instructions)**: Provide clear, actionable safety instructions for workers on site.
`,
});

const analyzeAccidentThemesFlow = ai.defineFlow(
  {
    name: 'analyzeAccidentThemesFlow',
    inputSchema: AnalyzeAccidentThemesInputSchema,
    outputSchema: AnalyzeAccidentThemesOutputSchema,
  },
  async input => {
    const {output} = await analyzeAccidentThemesPrompt(input);
    return output!;
  }
);
