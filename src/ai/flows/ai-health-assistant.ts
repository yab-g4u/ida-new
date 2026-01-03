'use server';

/**
 * @fileOverview A mock conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English from a predefined FAQ list.
 */

import { faqData, type FaqItem } from '@/lib/faq-data';
import { z } from 'zod';
import Fuse from 'fuse.js';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user question about a health topic.'),
  language: z.enum(['am', 'om', 'en']).describe('The preferred language of the user.'),
});
export type AiHealthAssistantInput = z.infer<typeof AiHealthAssistantInputSchema>;

// Helper to simulate a streaming response
function createMockStream(text: string) {
  return new ReadableStream({
    async start(controller) {
      const words = text.split(' ');
      for (const word of words) {
        const chunk = word + ' ';
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ response: chunk })}\n\n`));
        // Small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      }
      controller.close();
    },
  });
}

const getFaqForLanguage = (lang: 'en' | 'am' | 'om') => {
    return faqData.map(item => ({
        q: item.q[lang],
        a: item.a[lang],
    }));
}

// This is an async generator function, the modern way to handle streaming in Genkit with Next.js Server Actions.
export async function* aiHealthAssistant({ query, language }: AiHealthAssistantInput) {
    const languageFaqs = getFaqForLanguage(language);

    const fuse = new Fuse(languageFaqs, {
        keys: ['q'],
        threshold: 0.2, // Strict threshold for exact or very close matches
    });

    const results = fuse.search(query);
    let responseText: string;

    const noAnswerResponses = {
        en: "I'm sorry, I can only answer questions about the flu, blood pressure, and healthy diets in this demo. Please try one of those topics!",
        am: "ይቅርታ፣ በዚህ ማሳያ ውስጥ ስለ ጉንፋን፣ የደም ግፊት እና ጤናማ አመጋገብ ጥያቄዎችን ብቻ መመለስ እችላለሁ። እባክዎ ከእነዚያ ርዕሶች ውስጥ አንዱን ይሞክሩ!",
        om: "Dhiifama, agarsiisa kana keessatti gaaffiiwwan waa'ee utaalloo, dhiibbaa dhiigaa, fi nyaata fayya qabeessaa qofa deebisuun danda'a. Maaloo mata dureewwan kanneen keessaa tokko yaali!",
    };
    
    if (results.length > 0) {
        responseText = results[0].item.a;
    } else {
        responseText = noAnswerResponses[language];
    }
    
    // Simulate streaming the response text
    const words = responseText.split(/(\s+)/); // Split by spaces, keeping them
    for (const word of words) {
        yield { response: word };
        // Small delay to simulate word-by-word generation
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    }
}
