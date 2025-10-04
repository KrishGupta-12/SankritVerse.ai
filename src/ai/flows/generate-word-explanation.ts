'use server';
/**
 * @fileOverview Generates a detailed analysis for a single Sanskrit word.
 *
 * - generateWordExplanation - A function that returns a detailed explanation of a Sanskrit word.
 * - GenerateWordExplanationInput - The input type for the function.
 * - GenerateWordExplanationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordExplanationInputSchema = z.object({
  word: z.string().describe('A single Sanskrit word to be analyzed.'),
});
export type GenerateWordExplanationInput = z.infer<typeof GenerateWordExplanationInputSchema>;

const GenerateWordExplanationOutputSchema = z.object({
  meaning: z.string().describe('The detailed meaning and definition of the word.'),
  englishTranslation: z
    .string()
    .describe('The common English translation(s) for the word.'),
  grammaticalAnalysis: z
    .string()
    .describe(
      'A breakdown of the word\'s grammatical properties, such as root, noun/verb type, case, gender, and number.'
    ),
  usageExample: z
    .string()
    .describe(
      'A short example sentence or phrase (in Sanskrit with transliteration and translation) demonstrating how the word is used in context.'
    ),
});
export type GenerateWordExplanationOutput = z.infer<typeof GenerateWordExplanationOutputSchema>;

export async function generateWordExplanation(
  input: GenerateWordExplanationInput
): Promise<GenerateWordExplanationOutput> {
  return generateWordExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordExplanationPrompt',
  input: {schema: GenerateWordExplanationInputSchema},
  output: {schema: GenerateWordExplanationOutputSchema},
  prompt: `You are an expert Sanskrit grammarian and lexicographer.

  Your task is to provide a comprehensive analysis of a single Sanskrit word. Given the word, provide the following details:

  - Meaning: The detailed definition and core concept of the word.
  - English Translation: The most common English equivalent(s).
  - Grammatical Analysis: Identify the word's root, its type (noun, verb, adjective, etc.), and its grammatical properties (case, gender, number, tense, person, etc., as applicable).
  - Usage Example: Provide a simple Sanskrit sentence or phrase that uses the word. Include the Devanagari script, IAST transliteration, and an English translation of the example.

  Word to analyze: {{{word}}}

  Please provide a clear, accurate, and concise analysis in the specified JSON format.
`,
});

const generateWordExplanationFlow = ai.defineFlow(
  {
    name: 'generateWordExplanationFlow',
    inputSchema: GenerateWordExplanationInputSchema,
    outputSchema: GenerateWordExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
