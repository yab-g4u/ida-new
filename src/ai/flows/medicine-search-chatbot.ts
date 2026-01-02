'use server';

/**
 * @fileOverview A conversational AI chatbot for the medicine search page.
 *
 * - medicineSearchChatbot - A function that provides conversational answers about medications.
 * - MedicineSearchChatbotInput - The input type for the function.
 * - MedicineSearchChatbotOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const MedicineSearchChatbotInputSchema = z.object({
  query: z.string().describe('The user question about a medication.'),
  language: z.enum(['am', 'om', 'en']).describe('The preferred language of the user.'),
});
export type MedicineSearchChatbotInput = z.infer<typeof MedicineSearchChatbotInputSchema>;

export const MedicineSearchChatbotOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type MedicineSearchChatbotOutput = z.infer<typeof MedicineSearchChatbotOutputSchema>;

export async function medicineSearchChatbot(input: MedicineSearchChatbotInput): Promise<MedicineSearchChatbotOutput> {
  return medicineSearchChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicineSearchChatbotPrompt',
  input: {schema: MedicineSearchChatbotInputSchema},
  output: {schema: MedicineSearchChatbotOutputSchema},
  prompt: `You are a helpful AI health assistant specializing in providing easy-to-understand information about medications.
  Your responses must be empathetic, professional, and use simple, human-level language suitable for the general public.
  Provide concise answers based on the user's query.

  User Query: {{{query}}}
  Language: {{{language}}}
  `,
});

const medicineSearchChatbotFlow = ai.defineFlow(
  {
    name: 'medicineSearchChatbotFlow',
    inputSchema: MedicineSearchChatbotInputSchema,
    outputSchema: MedicineSearchChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
