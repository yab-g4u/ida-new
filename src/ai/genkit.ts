import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set. AI features will not work.");
}

export const ai = genkit({
  plugins: [googleAI({apiKey: geminiApiKey})],
});
