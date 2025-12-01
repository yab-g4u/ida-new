'use server';
/**
 * @fileOverview A flow for analyzing a medicine package image.
 * 
 * - analyzeMedicinePackage - A function that takes an image of a medicine package and returns structured information about it.
 * - AnalyzeMedicinePackageInput - The input type for the analyzeMedicinePackage function.
 * - AnalyzeMedicinePackageOutput - The return type for the analyzeMedicinePackage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeMedicinePackageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a medicine package, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMedicinePackageInput = z.infer<typeof AnalyzeMedicinePackageInputSchema>;

export const AnalyzeMedicinePackageOutputSchema = z.object({
  name: z.string().describe('The name of the medicine.'),
  pros: z.string().describe('The benefits or pros of taking this medicine.'),
  cons: z.string().describe('The potential side effects or cons of taking this medicine.'),
  usage: z.string().describe('Instructions on how and how much of the medicine to take.'),
});
export type AnalyzeMedicinePackageOutput = z.infer<typeof AnalyzeMedicinePackageOutputSchema>;

export async function analyzeMedicinePackage(input: AnalyzeMedicinePackageInput): Promise<AnalyzeMedicinePackageOutput> {
  return analyzeMedicinePackageFlow(input);
}

const analyzeMedicinePackagePrompt = ai.definePrompt({
  name: 'analyzeMedicinePackagePrompt',
  input: {schema: AnalyzeMedicinePackageInputSchema},
  output: {schema: AnalyzeMedicinePackageOutputSchema},
  prompt: `You are an expert pharmacist. Analyze the following image of a medicine package. 
  
  Extract the following information:
  1. The name of the medicine.
  2. The pros/benefits of taking this medicine.
  3. The cons/potential side effects of this medicine.
  4. Clear instructions on how and how much of the medicine to take.
  
  Provide the output in a structured format.

  Image: {{media url=imageDataUri}}`,
});

const analyzeMedicinePackageFlow = ai.defineFlow(
  {
    name: 'analyzeMedicinePackageFlow',
    inputSchema: AnalyzeMedicinePackageInputSchema,
    outputSchema: AnalyzeMedicinePackageOutputSchema,
  },
  async input => {
    const {output} = await analyzeMedicinePackagePrompt(input);
    return output!;
  }
);
