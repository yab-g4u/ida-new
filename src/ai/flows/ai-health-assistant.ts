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

export async function aiHealthAssistant(input: AiHealthAssistantInput) {
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

  const reader = stream.getReader();
  const newStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value.text) {
            controller.enqueue(value.text);
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return newStream;
}
