'use server';
/**
 * @fileOverview A flow for translating a bundle of medical text fields from English to other languages.
 *
 * - translateMedicalBundle - A function that translates a structured object of medical terms.
 * - TranslateMedicalBundleInput - The input type for the function.
 * - TranslateMedicalBundleOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MedicalInfoToTranslateSchema = z.object({
  title: z.string().describe('The section title, e.g., "Drug Class"'),
  content: z
    .string()
    .describe('The content for that section, e.g., "Analgesic"'),
});

const TranslateMedicalBundleInputSchema = z.object({
  sections: z.array(MedicalInfoToTranslateSchema).describe('An array of sections to translate.'),
  targetLanguage: z
    .enum(['am', 'om', 'en'])
    .describe('The target language (Amharic or Oromo).'),
});
export type TranslateMedicalBundleInput = z.infer<typeof TranslateMedicalBundleInputSchema>;

const TranslatedMedicalInfoSchema = z.object({
  translatedTitle: z.string().describe('The translated section title.'),
  translatedContent: z.string().describe('The translated section content.'),
});

const TranslateMedicalBundleOutputSchema = z.object({
  translatedSections: z.array(TranslatedMedicalInfoSchema).describe('The array of translated sections.'),
});
export type TranslateMedicalBundleOutput = z.infer<typeof TranslateMedicalBundleOutputSchema>;

export async function translateMedicalBundle(
  input: TranslateMedicalBundleInput
): Promise<TranslateMedicalBundleOutput> {
  if (input.targetLanguage === 'en') {
    return {
      translatedSections: input.sections.map(s => ({
        translatedTitle: s.title,
        translatedContent: s.content,
      })),
    };
  }
  return translateMedicalBundleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateMedicalBundlePrompt',
  input: { schema: TranslateMedicalBundleInputSchema },
  output: { schema: TranslateMedicalBundleOutputSchema },
  prompt: `Translate the following array of medical information sections into the language code "{{targetLanguage}}".
For each object in the input array, translate both the "title" and the "content" field.
Maintain the same array structure for the output. Return ONLY the translated content in the specified JSON format.

Input Sections:
{{#each sections}}
- Title: "{{this.title}}", Content: "{{this.content}}"
{{/each}}
`,
});

const translateMedicalBundleFlow = ai.defineFlow(
  {
    name: 'translateMedicalBundleFlow',
    inputSchema: TranslateMedicalBundleInputSchema,
    outputSchema: TranslateMedicalBundleOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
