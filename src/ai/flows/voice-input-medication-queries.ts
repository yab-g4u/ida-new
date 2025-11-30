'use server';

/**
 * @fileOverview This file defines a Genkit flow for handling voice input queries about medications.
 *
 * It allows users to ask questions about their medications in Amharic, Oromo, or English
 * and receive a simplified response from the AI health assistant.
 *
 * @exports {
 *   voiceInputForMedicationQueries,
 *   VoiceInputForMedicationQueriesInput,
 *   VoiceInputForMedicationQueriesOutput,
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoiceInputForMedicationQueriesInputSchema = z.object({
  query: z
    .string()
    .describe(
      'The voice input query about medications in Amharic, Oromo, or English.'
    ),
  language: z.enum(['am', 'om', 'en']).describe('The language of the query.'),
});
export type VoiceInputForMedicationQueriesInput =
  z.infer<typeof VoiceInputForMedicationQueriesInputSchema>;

const VoiceInputForMedicationQueriesOutputSchema = z.object({
  response: z
    .string()
    .describe('The simplified response from the AI health assistant.'),
});
export type VoiceInputForMedicationQueriesOutput =
  z.infer<typeof VoiceInputForMedicationQueriesOutputSchema>;

export async function voiceInputForMedicationQueries(
  input: VoiceInputForMedicationQueriesInput
): Promise<VoiceInputForMedicationQueriesOutput> {
  return voiceInputForMedicationQueriesFlow(input);
}

const voiceInputForMedicationQueriesPrompt = ai.definePrompt({
  name: 'voiceInputForMedicationQueriesPrompt',
  input: { schema: VoiceInputForMedicationQueriesInputSchema },
  output: { schema: VoiceInputForMedicationQueriesOutputSchema },
  prompt: `You are a helpful AI health assistant. A user has asked a question about their medication in {{{language}}}. Please provide a simplified and easy-to-understand response in the same language.

Question: {{{query}}}`,
});

const voiceInputForMedicationQueriesFlow = ai.defineFlow(
  {
    name: 'voiceInputForMedicationQueriesFlow',
    inputSchema: VoiceInputForMedicationQueriesInputSchema,
    outputSchema: VoiceInputForMedicationQueriesOutputSchema,
  },
  async input => {
    const { output } = await voiceInputForMedicationQueriesPrompt(input);
    return output!;
  }
);
