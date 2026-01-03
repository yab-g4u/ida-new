'use server';

/**
 * @fileOverview A conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English.
 *
 * - aiHealthAssistant - A function that handles the health assistant process.
 * - AiHealthAssistantInput - The input type for the aiHealthAssistant function.
 * - AiHealthAssistantOutput - The return type for the aiHealthAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user query related to health.'),
  language: z.enum(['am', 'om', 'en']).describe('The preferred language of the user (Amharic, Oromo, or English).'),
});
type AiHealthAssistantInput = z.infer<typeof AiHealthAssistantInputSchema>;

const AiHealthAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
  citations: z.string().optional().describe('Citations for the grounded information.'),
});
type AiHealthAssistantOutput = z.infer<typeof AiHealthAssistantOutputSchema>;

export async function aiHealthAssistant(input: AiHealthAssistantInput): Promise<AiHealthAssistantOutput> {
  return aiHealthAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHealthAssistantPrompt',
  input: {schema: AiHealthAssistantInputSchema},
  output: {schema: AiHealthAssistantOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a helpful AI health assistant that provides real-time, grounded information in the user's preferred language.
  Your responses must be empathetic, professional, and use language suitable for the general public.
  All answers must be based on up-to-date, verifiable sources, and you must provide citations where applicable.

  User Query: {{{query}}}
  Language: {{{language}}}
  `,
  tools: [],
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const aiHealthAssistantFlow = ai.defineFlow(
  {
    name: 'aiHealthAssistantFlow',
    inputSchema: AiHealthAssistantInputSchema,
    outputSchema: AiHealthAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);