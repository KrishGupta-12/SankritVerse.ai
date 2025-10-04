import { config } from 'dotenv';
config();

import '@/ai/flows/generate-verse-explanations.ts';
import '@/ai/flows/personalized-shloka-recommendations.ts';
import '@/ai/flows/generate-daily-shloka.ts';
import '@/ai/flows/scan-verse-from-image.ts';
