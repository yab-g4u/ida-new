'use server';

/**
 * @fileOverview A flow that simplifies medication instructions into a single, easy-to-understand paragraph.
 *
 * - simplifyMedicationInstructions - A function that takes complex medical instructions and simplifies them.
 * - SimplifyMedicationInstructionsInput - The input type for the simplifyMedicationInstructions function
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SimplifyMedicationInstructionsInputSchema = z.object({
  instructions: z.string().describe('The complex medication instructions to simplify.'),
  language: z.enum(['en', 'am', 'om']).describe('The target language for the simplified output.'),
});
export type SimplifyMedicationInstructionsInput = z.infer<typeof SimplifyMedicationInstructionsInputSchema>;

const SimplifyMedicationInstructionsOutputSchema = z.object({
    simplifiedInstructions: z.string().describe('A single, easy-to-understand paragraph of the medication instructions.'),
});

export async function simplifyMedicationInstructions(
  input: SimplifyMedicationInstructionsInput
): Promise<z.infer<typeof SimplifyMedicationInstructionsOutputSchema>> {
  return simplifyMedicationInstructionsFlow(input);
}

const simplifyMedicationInstructionsPrompt = ai.definePrompt({
  name: 'simplifyMedicationInstructionsPrompt',
  input: {schema: SimplifyMedicationInstructionsInputSchema},
  output: {schema: SimplifyMedicationInstructionsOutputSchema},
  prompt: `You are a helpful AI assistant that simplifies complex medication instructions for patients.
Your response must be a single, easy-to-understand paragraph.
Translate the simplified instructions into the target language: {{{language}}}.
  
Original instructions: "{{{instructions}}}"`,
});

const simplifyMedicationInstructionsFlow = ai.defineFlow(
  {
    name: 'simplifyMedicationInstructionsFlow',
    inputSchema: SimplifyMedicationInstructionsInputSchema,
    outputSchema: SimplifyMedicationInstructionsOutputSchema,
  },
  async (input) => {
    const {output} = await simplifyMedicationInstructionsPrompt(input);
    return output!;
  }
);
