'use server';

/**
 * This route handler is responsible for exposing all Genkit flows
 * that are defined in the application.
 *
 * It uses the default handler from `@genkit-ai/next` to create a
 * POST-only endpoint that can be called from the client.
 */

import handler from '@genkit-ai/next';
import '@/ai/dev'; // Make sure to import all the flow definitions

export const POST = handler;
