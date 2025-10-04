'use server';
/**
 * @fileOverview A personalized shloka recommendation AI agent.
 *
 * - personalizedShlokaRecommendations - A function that handles the shloka recommendation process.
 * - PersonalizedShlokaRecommendationsInput - The input type for the personalizedShlokaRecommendations function.
 * - PersonalizedShlokaRecommendationsOutput - The return type for the personalizedShlokaRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedShlokaRecommendationsInputSchema = z.object({
  userInteractionHistory: z
    .string()
    .describe('The user interaction history with previous shlokas.'),
  userPreferences: z
    .string()
    .describe('The user preferences for shlokas, such as themes or authors.'),
  availableShlokas: z
    .string()
    .describe('The list of available shlokas to choose from.'),
});
export type PersonalizedShlokaRecommendationsInput = z.infer<
  typeof PersonalizedShlokaRecommendationsInputSchema
>;

const PersonalizedShlokaRecommendationsOutputSchema = z.object({
  recommendedShloka: z
    .string()
    .describe('The recommended shloka based on user interaction and preferences.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the shloka recommendation.'),
});
export type PersonalizedShlokaRecommendationsOutput = z.infer<
  typeof PersonalizedShlokaRecommendationsOutputSchema
>;

export async function personalizedShlokaRecommendations(
  input: PersonalizedShlokaRecommendationsInput
): Promise<PersonalizedShlokaRecommendationsOutput> {
  return personalizedShlokaRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedShlokaRecommendationsPrompt',
  input: {schema: PersonalizedShlokaRecommendationsInputSchema},
  output: {schema: PersonalizedShlokaRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized Shloka recommendations based on user interaction history and preferences.

  User Interaction History: {{{userInteractionHistory}}}
  User Preferences: {{{userPreferences}}}
  Available Shlokas: {{{availableShlokas}}}

  Based on the user's past interactions and preferences, select the most relevant Shloka from the list of available Shlokas.
  Explain your reasoning for the recommendation.
  Return the recommended Shloka and the reasoning behind it in the specified JSON format.
  `,
});

const personalizedShlokaRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedShlokaRecommendationsFlow',
    inputSchema: PersonalizedShlokaRecommendationsInputSchema,
    outputSchema: PersonalizedShlokaRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
