'use server';
/**
 * @fileoverview This file is the entry point for all Genkit flow API routes.
 * It uses the `expressHandler` from `genkit/next` to automatically
 * create API endpoints for all the flows defined in the application.
 */

import { expressHandler } from 'genkit/next';
import '@/ai/dev'; // Make sure to import all the flow definitions

export const { POST } = expressHandler();
