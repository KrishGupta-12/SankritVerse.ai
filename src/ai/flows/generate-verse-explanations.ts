// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Generates explanations and interpretations of Sanskrit verses.
 *
 * - generateVerseExplanations - A function that generates explanations for Sanskrit verses.
 * - GenerateVerseExplanationsInput - The input type for the generateVerseExplanations function.
 * - GenerateVerseExplanationsOutput - The return type for the generateVerseExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVerseExplanationsInputSchema = z.object({
  verseText: z
    .string()
    .describe('The Sanskrit verse text to be explained.'),
});
export type GenerateVerseExplanationsInput = z.infer<typeof GenerateVerseExplanationsInputSchema>;

const GenerateVerseExplanationsOutputSchema = z.object({
  transliteration: z
    .string()
    .describe('The transliteration of the Sanskrit verse.'),
  wordMeanings: z
    .string()
    .describe('The meaning of each word in the verse.'),
  grammarTags: z
    .string()
    .describe('The grammar tags for each word in the verse.'),
  englishTranslation: z
    .string()
    .describe('The English translation of the Sanskrit verse.'),
  summary: z.string().describe('A summary of the verse and its meaning'),
});
export type GenerateVerseExplanationsOutput = z.infer<typeof GenerateVerseExplanationsOutputSchema>;

export async function generateVerseExplanations(
  input: GenerateVerseExplanationsInput
): Promise<GenerateVerseExplanationsOutput> {
  return generateVerseExplanationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVerseExplanationsPrompt',
  input: {schema: GenerateVerseExplanationsInputSchema},
  output: {schema: GenerateVerseExplanationsOutputSchema},
  prompt: `You are an expert in Sanskrit and Hindu scriptures. You are able to provide detailed explanations, interpretations, and context for Sanskrit verses.

  Given the following Sanskrit verse, please provide the following information:

  - Transliteration: The transliteration of the verse into a readable format.
  - Word Meanings: The meaning of each individual word in the verse.
  - Grammar Tags: The grammatical tags associated with each word.
  - English Translation: A clear and accurate English translation of the verse.
  - Summary: A short summary of the verse, explaining its meaning and context.

  Verse: {{{verseText}}}

  Please provide the output in a well-formatted and easily understandable manner.
`,
});

const generateVerseExplanationsFlow = ai.defineFlow(
  {
    name: 'generateVerseExplanationsFlow',
    inputSchema: GenerateVerseExplanationsInputSchema,
    outputSchema: GenerateVerseExplanationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
