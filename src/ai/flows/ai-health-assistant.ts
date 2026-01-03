'use server';

/**
 * @fileOverview A conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { streamFlow } from '@genkit-ai/next/server';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user question about a health topic.'),
  language: z.enum(['am', 'om', 'en']).describe('The preferred language of the user.'),
});

const AiHealthAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});

export const aiHealthAssistant = streamFlow(
  {
    name: 'aiHealthAssistantStream',
    inputSchema: AiHealthAssistantInputSchema,
    outputSchema: AiHealthAssistantOutputSchema,
  },
  async ({ query, language }) => {
    const prompt = `You are a helpful AI health assistant. Your responses must be empathetic, professional, and use simple, human-level language suitable for the general public.
    Provide concise answers based on the user's query.
    The response must be in the language specified: ${language}.
    
    User Query: "${query}"
    Language: ${language}
    `;

    const { stream } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: prompt,
      stream: true,
    });
    
    let responseText = '';
    const outputStream = new ReadableStream<AiHealthAssistantOutputSchema>({
      async start(controller) {
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          if (chunkText) {
            responseText += chunkText;
            controller.enqueue({ response: chunkText });
          }
        }
        controller.close();
      },
    });

    return outputStream;
  }
);
