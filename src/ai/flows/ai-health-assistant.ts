'use server';

/**
 * @fileOverview A conversational AI health assistant that provides real-time, grounded information in Amharic, Oromo, and English.
 * This is a mock implementation that uses a local FAQ library for demo purposes.
 */

import { faqData, type FaqItem } from '@/lib/faq-data';

interface AiHealthAssistantInput {
  query: string;
  language: 'en' | 'am' | 'om';
}

function findAnswer(query: string, language: 'en' | 'am' | 'om'): string | null {
  const lowerCaseQuery = query.toLowerCase().trim();
  
  for (const item of faqData) {
    const question = item.q[language]?.toLowerCase();
    if (question && question.includes(lowerCaseQuery)) {
      return item.a[language];
    }
  }

  // Check for greetings or simple phrases
  const directMatch = faqData.find(item => item.q[language]?.toLowerCase() === lowerCaseQuery);
  if (directMatch) {
    return directMatch.a[language];
  }

  return null;
}

export async function aiHealthAssistant(input: AiHealthAssistantInput): Promise<ReadableStream<string>> {
  const { query, language } = input;

  let answer = findAnswer(query, language);

  if (!answer) {
    const fallbackAnswers = {
        en: "I'm sorry, I can only answer a few questions for this demo. Please try one of the suggestions.",
        am: "ይቅርታ፣ ለዚህ ማሳያ ጥቂት ጥያቄዎችን ብቻ መመለስ እችላለሁ። እባክዎ ከቀረቡት አማራጮች ውስጥ አንዱን ይሞክሩ። (Yik’irita, lezzi masaya t’ik’it k’it’ak’ewochini bicha memeles ichilalehu. Ibakiwo ke k’erebuti amirach’ochi wisit’i anduni yimokiru.)",
        om: "Dhiifama, agarsiisa kanaaf gaaffiiwwan muraasa qofa deebisuun danda'a. Maaloo yaada dhiyaate keessaa tokko yaali.",
    };
    answer = fallbackAnswers[language];
  }

  // Simulate a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = answer!.split(' ');
      for (const chunk of chunks) {
        // Add a small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 50));
        controller.enqueue(chunk + ' ');
      }
      controller.close();
    },
  });

  return stream;
}
