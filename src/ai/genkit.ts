import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai'; // The unified 2026 plugin
import { openAI } from 'genkitx-openai';

const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: geminiApiKey }),
    openAI({ apiKey: openaiApiKey })
  ],
  // FIX: Use the model helper instead of a direct import
  model: googleAI.model('gemini-2.5-flash-lite'), 
});