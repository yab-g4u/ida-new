'use server';
/**
 * @fileOverview A flow that provides detailed, user-friendly information about a medicine.
 *
 * - getMedicineInfo - A function that takes a medicine name and returns structured information.
 * - GetMedicineInfoInput - The input type for the function.
 * - GetMedicineInfoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetMedicineInfoInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to look up.'),
});
export type GetMedicineInfoInput = z.infer<typeof GetMedicineInfoInputSchema>;

const GetMedicineInfoOutputSchema = z.object({
  isMedicine: z.boolean().describe('Set to false if the input is not a recognizable medicine or is a dangerous substance.'),
  medicineName: z.string().describe('The official name of the medicine found.'),
  whatItIs: z.string().describe('A simple 1-sentence explanation of the drug and its class.'),
  usage: z.string().describe('What specific conditions it treats (e.g., headache, infection).'),
  foodInstructions: z.string().describe('Explicitly state if it should be taken before, during, or after food.'),
  timeTaken: z.string().describe('How long it typically takes to start working.'),
  sideEffects: z.array(z.string()).describe('A list of the top 3 most common side effects.'),
  localSummaryAmharic: z.string().describe('A 1-sentence summary of the main usage in Amharic.'),
  localSummaryOromo: z.string().describe('A 1-sentence summary of the main usage in Afaan Oromo.'),
});
export type GetMedicineInfoOutput = z.infer<typeof GetMedicineInfoOutputSchema>;

export async function getMedicineInfo(
  input: GetMedicineInfoInput
): Promise<GetMedicineInfoOutput> {
  return getMedicineInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMedicineInfoPrompt',
  input: { schema: GetMedicineInfoInputSchema },
  output: { schema: GetMedicineInfoOutputSchema },
  system: `You are a professional, specialized "Medication Information Assistant" for the IDA health app. Your goal is to provide concise, structured, and easy-to-understand information about medicines.

For every medicine requested, you MUST provide the following sections:

- 💊 What it is: A simple 1-sentence explanation of the drug and its class.
- ✅ Usage: What specific conditions it treats (e.g., headache, infection).
- 🍽️ Food Instructions: Explicitly state if it should be taken before, during, or after food.
- ⏱️ Time Taken: How long it typically takes to start working.
- ⚠️ Side Effects: List the top 3 most common side effects in bullet points.
- 🌍 Local Translation: Provide a 1-sentence summary of the main usage in Amharic and Afaan Oromo.

Safety Constraints:
- If the user asks for a non-medical item or a dangerous substance, you must set 'isMedicine' to false and politely refuse in the 'whatItIs' field. For all other fields, provide empty strings or arrays.
- Use "patient-friendly" language (avoid complex jargon).

The user is asking about: "{{medicineName}}"
`,
});

const getMedicineInfoFlow = ai.defineFlow(
  {
    name: 'getMedicineInfoFlow',
    inputSchema: GetMedicineInfoInputSchema,
    outputSchema: GetMedicineInfoOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
