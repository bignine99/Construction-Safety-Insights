'use server';

/**
 * @fileOverview An AI agent that suggests preventative measures based on accident themes.
 *
 * - suggestPreventativeMeasures - A function that handles the suggestion of preventative measures.
 * - SuggestPreventativeMeasuresInput - The input type for the suggestPreventativeMeasures function.
 * - SuggestPreventativeMeasuresOutput - The return type for the suggestPreventativeMeasures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPreventativeMeasuresInputSchema = z.object({
  accidentDescriptions: z.array(z.string()).describe('An array of accident descriptions to analyze.'),
});
export type SuggestPreventativeMeasuresInput = z.infer<typeof SuggestPreventativeMeasuresInputSchema>;

const SuggestPreventativeMeasuresOutputSchema = z.object({
  themes: z.array(z.string()).describe('Key themes identified in the accident descriptions.'),
  preventativeMeasures: z
    .array(z.string())
    .describe('Suggested preventative measures based on the identified themes.'),
});
export type SuggestPreventativeMeasuresOutput = z.infer<typeof SuggestPreventativeMeasuresOutputSchema>;

export async function suggestPreventativeMeasures(
  input: SuggestPreventativeMeasuresInput
): Promise<SuggestPreventativeMeasuresOutput> {
  return suggestPreventativeMeasuresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPreventativeMeasuresPrompt',
  input: {schema: SuggestPreventativeMeasuresInputSchema},
  output: {schema: SuggestPreventativeMeasuresOutputSchema},
  prompt: `You are a safety analyst. Analyze the following accident descriptions to identify key themes and suggest preventative measures.

Accident Descriptions:
{{#each accidentDescriptions}}- {{{this}}}\n{{/each}}

Identify the key themes that emerge from these descriptions and then suggest concrete preventative measures that could be implemented to address these themes.`,
});

const suggestPreventativeMeasuresFlow = ai.defineFlow(
  {
    name: 'suggestPreventativeMeasuresFlow',
    inputSchema: SuggestPreventativeMeasuresInputSchema,
    outputSchema: SuggestPreventativeMeasuresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
