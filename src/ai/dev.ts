'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/simplify-medication-instructions.ts';
import '@/ai/flows/ai-health-assistant.ts';
import '@/ai/flows/voice-input-medication-queries.ts';
import '@/ai/flows/analyze-medicine-package.ts';
import '@/ai/flows/medicine-search-chatbot.ts';
