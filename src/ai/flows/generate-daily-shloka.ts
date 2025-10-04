'use server';
/**
 * @fileOverview Generates a daily Sanskrit shloka.
 *
 * - generateDailyShloka - A function that returns a shloka for the day.
 * - GenerateDailyShlokaOutput - The return type for the generateDailyShloka function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyShlokaOutputSchema = z.object({
  verseText: z.string().describe('A profound Sanskrit verse from a major Hindu scripture.'),
  source: z.string().describe('The scripture from which the verse is taken (e.g., Bhagavad Gita).'),
  chapter: z.number().describe('The chapter number of the verse.'),
  verse: z.number().describe('The verse number.'),
});
export type GenerateDailyShlokaOutput = z.infer<typeof GenerateDailyShlokaOutputSchema>;

export async function generateDailyShloka(): Promise<GenerateDailyShlokaOutput> {
  return generateDailyShlokaFlow();
}

const prompt = ai.definePrompt({
  name: 'generateDailyShlokaPrompt',
  output: {schema: GenerateDailyShlokaOutputSchema},
  prompt: `You are an expert in Sanskrit and Hindu scriptures. Your task is to select a single, profound Sanskrit verse (shloka) that is suitable for a "Verse of the Day" feature.

  - The verse should be from a well-known scripture like the Bhagavad Gita, the Upanishads, or the Vedas.
  - Provide the verse in its original Devanagari script.
  - Also provide the source, chapter, and verse number.

  Please select a new, random verse each time you are called. Do not provide any explanation or translation, only the requested data in the specified JSON format.
`,
});

const generateDailyShlokaFlow = ai.defineFlow(
  {
    name: 'generateDailyShlokaFlow',
    outputSchema: GenerateDailyShlokaOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
