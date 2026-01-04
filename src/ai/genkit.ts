import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/google-genai';
import {openAI} from 'genkitx-openai';

const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set. Some AI features may not work.");
}

if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not set. The AI assistant will not work.");
}

export const ai = genkit({
  plugins: [
    googleAI({apiKey: geminiApiKey}),
    openAI({apiKey: openaiApiKey})
  ],
});
