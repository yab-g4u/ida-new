'use server';
/**
 * @fileOverview A flow that summarizes medical information into a compact JSON for QR code generation.
 *
 * - summarizeMedicalInfo - A function that takes raw medical text and returns a summarized JSON string.
 * - SummarizeMedicalInfoInput - The input type for the summarizeMedicalInfo function.
 * - SummarizeMedicalInfoOutput - The return type for the summarizeMedicalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalInfoInputSchema = z.object({
  rawText: z.string().describe('The raw medical information including form data and text extracted from a PDF.'),
});
export type SummarizeMedicalInfoInput = z.infer<typeof SummarizeMedicalInfoInputSchema>;

const SummarizeMedicalInfoOutputSchema = z.object({
  summarizedJson: z.string().describe('A compact JSON object string with the most vital medical info. Should be less than 200 characters.'),
});
export type SummarizeMedicalInfoOutput = z.infer<typeof SummarizeMedicalInfoOutputSchema>;

export async function summarizeMedicalInfo(input: SummarizeMedicalInfoInput): Promise<SummarizeMedicalInfoOutput> {
  return summarizeMedicalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMedicalInfoPrompt',
  input: {schema: SummarizeMedicalInfoInputSchema},
  output: {schema: SummarizeMedicalInfoOutputSchema},
  prompt: `Extract the most vital medical info from this text: "{{rawText}}". 
    Format it as a tiny JSON object for an emergency QR code. 
    The JSON object should be a single line of text with no line breaks.
    Fields: "N" (Name), "B" (Blood Type), "A" (Allergies), "M" (Medications), "C" (Conditions).
    Example: {"N":"John D","B":"O+","A":"Peanuts","M":"Lisinopril","C":"Hypertension"}
    Keep it under 200 characters total. Be concise.`,
});

const summarizeMedicalInfoFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalInfoFlow',
    inputSchema: SummarizeMedicalInfoInputSchema,
    outputSchema: SummarizeMedicalInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return { summarizedJson: output!.summarizedJson };
  }
);
