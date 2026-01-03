'use server';

/**
 * @fileOverview A conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English.
 *
 * - aiHealthAssistant - A function that handles the health assistant process.
 * - AiHealthAssistantInput - The input type for the aiHealthAssistant function.
 * - AiHealthAssistantOutput - The return type for the aiHealthAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { streamFlow } from '@genkit-ai/next/server';

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

export async function aiHealthAssistant(input: AiHealthAssistantInput) {
  return streamFlow(aiHealthAssistantStream, input);
}

const aiHealthAssistantStream = ai.defineFlow(
  {
    name: 'aiHealthAssistantStream',
    inputSchema: AiHealthAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input, streamingCallback) => {
    const {stream, response} = ai.generateStream({
        model: 'openai/gpt-4o',
        prompt: {
            text: `You are a helpful AI health assistant that provides real-time, grounded information in the user's preferred language.
  Your responses must be empathetic, professional, and use language suitable for the general public.
  All answers must be based on up-to-date, verifiable sources, and you must provide citations where applicable.

  User Query: ${input.query}
  Language: ${input.language}`
        },
        tools: [],
        config: {}
    });

    for await (const chunk of stream) {
        if(chunk.text) {
            streamingCallback(chunk.text);
        }
    }

    const final = await response;
    return final.text || '';
  }
);