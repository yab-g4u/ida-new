'use server';

/**
 * @fileOverview A conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateStream } from 'genkit';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user question about a health topic.'),
  language: z.enum(['am', 'om', 'en']).describe('The preferred language of the user.'),
});
export type AiHealthAssistantInput = z.infer<typeof AiHealthAssistantInputSchema>;

export async function* aiHealthAssistant(input: AiHealthAssistantInput) {
  const model = ai.getModel('googleai/gemini-1.5-flash-latest');

  const { stream } = await generateStream({
    model,
    prompt: `You are a helpful and empathetic AI health assistant named IDA.
      Your goal is to provide clear, concise, and easy-to-understand answers to health-related questions.
      Your responses must be in the user's specified language.
      Keep your answers brief and to the point, suitable for a mobile chat interface. Do not use markdown.

      User Query: "${input.query}"
      Language: ${input.language}`,
    config: {
      temperature: 0.7,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text();
    if (text) {
      yield { response: text };
    }
  }
}
