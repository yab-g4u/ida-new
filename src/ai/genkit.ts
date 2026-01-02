import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Use the specific API key provided by the user
const geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyDzrpNlfvUnJNzrHdcEqsYibevkQ9zV5dk";

export const ai = genkit({
  plugins: [googleAI({apiKey: geminiApiKey})],
  model: 'googleai/gemini-2.5-flash',
});
