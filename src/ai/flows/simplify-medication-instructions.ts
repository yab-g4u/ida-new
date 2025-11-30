'use server';

/**
 * @fileOverview A flow that simplifies medication instructions into a single, easy-to-understand paragraph.
 *
 * - simplifyMedicationInstructions - A function that takes complex medical instructions and simplifies them.
 * - SimplifyMedicationInstructionsInput - The input type for the simplifyMedicationInstructions function.
 * - SimplifyMedicationInstructionsOutput - The return type for the simplifyMedicationInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyMedicationInstructionsInputSchema = z.object({
  instructions: z
    .string()
    .describe('The complex medication instructions to simplify.'),
  language: z.enum(['am', 'om', 'en']).describe('The language to simplify the instructions into (Amharic, Oromo, or English).'),
});
export type SimplifyMedicationInstructionsInput = z.infer<typeof SimplifyMedicationInstructionsInputSchema>;

const SimplifyMedicationInstructionsOutputSchema = z.object({
  simplifiedInstructions: z
    .string()
    .describe('The simplified medication instructions in the specified language.'),
});
export type SimplifyMedicationInstructionsOutput = z.infer<typeof SimplifyMedicationInstructionsOutputSchema>;

export async function simplifyMedicationInstructions(
  input: SimplifyMedicationInstructionsInput
): Promise<SimplifyMedicationInstructionsOutput> {
  return simplifyMedicationInstructionsFlow(input);
}

const simplifyMedicationInstructionsPrompt = ai.definePrompt({
  name: 'simplifyMedicationInstructionsPrompt',
  input: {schema: SimplifyMedicationInstructionsInputSchema},
  output: {schema: SimplifyMedicationInstructionsOutputSchema},
  prompt: `You are a helpful medical assistant that simplifies medication instructions for patients with low health literacy.

  Simplify the following instructions into a single paragraph that is easy to understand in the specified language.

  Language: {{{language}}}
  Instructions: {{{instructions}}}
  `,
});

const simplifyMedicationInstructionsFlow = ai.defineFlow(
  {
    name: 'simplifyMedicationInstructionsFlow',
    inputSchema: SimplifyMedicationInstructionsInputSchema,
    outputSchema: SimplifyMedicationInstructionsOutputSchema,
  },
  async input => {
    const {output} = await simplifyMedicationInstructionsPrompt(input);
    return output!;
  }
);
