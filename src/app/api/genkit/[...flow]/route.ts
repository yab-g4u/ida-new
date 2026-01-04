'use server';
/**
 * @fileoverview This file is the entry point for all Genkit flow API routes.
 * It uses the `defineNextHandler` from `@genkit-ai/next` to automatically
 * create API endpoints for all the flows defined in the application.
 */

import { defineNextHandler } from '@genkit-ai/next';
import '@/ai/dev'; // Make sure to import all the flow definitions

export const POST = defineNextHandler();
