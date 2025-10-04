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
    .describe('A collection of Sanskrit verses and their summaries that the user has previously saved or interacted with. This provides context on their interests.'),
  userPreferences: z
    .string()
    .describe('General user preferences for shlokas, such as themes (e.g., dharma, karma, knowledge) or scriptures (e.g., Bhagavad Gita, Upanishads).'),
  availableShlokas: z
    .string()
    .describe('An optional list of available shlokas to choose from. If this is empty, you should generate a new, unique, and relevant shloka that is not in the userInteractionHistory.'),
});
export type PersonalizedShlokaRecommendationsInput = z.infer<
  typeof PersonalizedShlokaRecommendationsInputSchema
>;

const PersonalizedShlokaRecommendationsOutputSchema = z.object({
  recommendedShloka: z
    .string()
    .describe('The recommended Sanskrit shloka in the Devanagari script.'),
  reasoning: z
    .string()
    .describe('A brief (1-2 sentences) explanation for why this specific shloka was recommended, linking it to the user\'s history or preferences.'),
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
  prompt: `You are an AI assistant that provides personalized Sanskrit shloka recommendations. Your goal is to act as a knowledgeable guide, introducing users to new wisdom that resonates with their past interests.

  - Analyze the user's interaction history and stated preferences.
  - Your primary task is to find or generate a NEW, profound shloka that the user has NOT seen before (i.e., not present in their history).
  - The recommendation should be relevant to the themes found in their history.
  - Provide a short, insightful reason for the recommendation.

  User Interaction History (Verses they have saved):
  {{{userInteractionHistory}}}
  
  Stated User Preferences: 
  {{{userPreferences}}}

  Based on the above, provide a new, recommended shloka and a concise reason for your choice. Do not recommend a shloka that is already in the user's history.
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
