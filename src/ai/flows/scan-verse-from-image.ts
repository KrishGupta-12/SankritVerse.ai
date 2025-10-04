'use server';
/**
 * @fileOverview An AI flow to scan a Sanskrit verse from an image and provide analysis.
 *
 * - scanVerseFromImage - A function that takes an image and returns a full analysis of the verse found within it.
 * - ScanVerseFromImageInput - The input type for the scanVerseFromImage function.
 * - ScanVerseFromImageOutput - The return type for the scanVerseFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanVerseFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a Sanskrit verse, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanVerseFromImageInput = z.infer<typeof ScanVerseFromImageInputSchema>;

const ScanVerseFromImageOutputSchema = z.object({
  verseText: z.string().describe('The Sanskrit verse text identified in the image.'),
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
  summary: z.string().describe('A summary of the verse and its meaning.'),
});
export type ScanVerseFromImageOutput = z.infer<typeof ScanVerseFromImageOutputSchema>;

export async function scanVerseFromImage(
  input: ScanVerseFromImageInput
): Promise<ScanVerseFromImageOutput> {
  return scanVerseFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanVerseFromImagePrompt',
  input: {schema: ScanVerseFromImageInputSchema},
  output: {schema: ScanVerseFromImageOutputSchema},
  prompt: `You are an expert in Sanskrit and Hindu scriptures. Your task is to analyze an image containing a Sanskrit verse.

  1. First, identify and extract the full Sanskrit verse from the image.
  2. Then, provide a complete analysis of that verse.

  Given the image, please provide the following information:
  - The original verse text you identified.
  - Transliteration: The transliteration of the verse.
  - Word Meanings: The meaning of each individual word in the verse.
  - Grammar Tags: The grammatical tags associated with each word.
  - English Translation: A clear and accurate English translation of the verse.
  - Summary: A short summary of the verse, explaining its meaning and context.

  Image of the verse: {{media url=imageDataUri}}

  Please provide the output in a well-formatted and easily understandable manner.
`,
});

const scanVerseFromImageFlow = ai.defineFlow(
  {
    name: 'scanVerseFromImageFlow',
    inputSchema: ScanVerseFromImageInputSchema,
    outputSchema: ScanVerseFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
