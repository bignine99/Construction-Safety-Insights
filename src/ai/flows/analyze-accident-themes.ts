// src/ai/flows/analyze-accident-themes.ts
'use server';

/**
 * @fileOverview Analyzes accident descriptions to identify themes and suggest preventative measures.
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
  themes: z
    .array(z.string())
    .describe('The identified themes from the accident descriptions.'),
  preventativeMeasures: z
    .array(z.string())
    .describe('Suggested preventative measures based on the themes.'),
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
  prompt: `You are a safety analyst. Analyze the following accident descriptions to identify common themes and suggest preventative measures.

Accident Descriptions:
{{#each accidentDescriptions}}
- {{{this}}}
{{/each}}

Identify the themes and suggest preventative measures based on the themes.

Output the themes and preventative measures.`,
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
