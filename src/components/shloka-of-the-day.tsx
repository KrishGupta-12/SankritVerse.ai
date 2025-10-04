'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenText, Loader2, RefreshCw } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, Timestamp, doc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { generateDailyShloka } from '@/ai/flows/generate-daily-shloka';
import { generateVerseExplanations } from '@/ai/flows/generate-verse-explanations';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type DailyShloka = {
  id?: string;
  verseId: string;
  date: Timestamp;
  interpretation: string; // This comes from the 'summary' of analysis
  verseText: string;
  verseSource: string; // This will be the 'source' from generation
  verseChapter: number;
  verseNumber: number;
  transliteration: string;
  wordMeanings: string;
  grammarTags: string;
  translation: string;
}

export default function ShlokaOfTheDay() {
  const firestore = useFirestore();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const todayTimestamp = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
  }, []);

  const dailyShlokaQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'dailyShlokas'),
      where('date', '>=', todayTimestamp),
      limit(1)
    );
  }, [firestore, todayTimestamp]);

  const { data: shlokas, isLoading, error } = useCollection<DailyShloka>(dailyShlokaQuery);
  const shloka = shlokas?.[0];

  const generateAndStoreShloka = async () => {
    if (!firestore) {
      toast({ title: "Error", description: "Database connection not available.", variant: "destructive" });
      return;
    };
    setIsGenerating(true);

    try {
      // 1. Generate a new shloka
      toast({ title: "Generating new verse...", description: "Please wait while we select a verse for you."});
      const { verseText, source, chapter, verse } = await generateDailyShloka();

      // 2. Get detailed explanations for it
      toast({ title: "Analyzing the verse...", description: "Getting translations and grammar details."});
      const analysis = await generateVerseExplanations({ verseText });

      // 3. Prepare the data for Firestore
      const verseId = btoa(unescape(encodeURIComponent(verseText))).substring(0, 20);
      const shlokaId = `${new Date().toISOString().split('T')[0]}-${verseId}`;
      const dailyShlokaRef = doc(firestore, 'dailyShlokas', shlokaId);
      
      const newShlokaData: DailyShloka = {
        verseId,
        date: todayTimestamp,
        verseText,
        verseSource: source,
        verseChapter: chapter,
        verseNumber: verse,
        interpretation: analysis.summary,
        transliteration: analysis.transliteration,
        wordMeanings: analysis.wordMeanings,
        grammarTags: analysis.grammarTags,
        translation: analysis.englishTranslation,
      };

      // 4. Save to Firestore non-blockingly
      setDocumentNonBlocking(dailyShlokaRef, newShlokaData, { merge: true });
      
      toast({ title: "Verse of the Day is ready!", description: "Enjoy the wisdom for today."});

    } catch (e) {
      console.error("Failed to generate shloka of the day:", e);
      toast({ title: "Generation Failed", description: "Could not generate a new verse. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
       <section className="mb-12">
        <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
          <CardHeader className="text-center bg-secondary/50 p-6">
            <Skeleton className="h-6 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{isGenerating ? 'Generating a fresh verse with AI...' : 'Loading today\'s verse...'}</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!shloka) {
    return (
       <section className="mb-12">
        <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
           <CardContent className="p-8 md:p-12 text-center flex flex-col items-center gap-4">
            <p className="text-muted-foreground">No shloka available for today. An administrator needs to generate one.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
      <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
        <CardHeader className="text-center bg-secondary/50 p-6">
          <div className="flex justify-center items-center gap-2 text-muted-foreground">
             <BookOpenText className="w-5 h-5"/>
             <CardDescription className="text-lg">
                {shloka.verseSource} - Chapter {shloka.verseChapter}, Verse {shloka.verseNumber}
             </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <blockquote className="text-center">
            <p className="font-body text-3xl md:text-4xl leading-relaxed whitespace-pre-line mb-6 font-noto-devanagari">
              {shloka.verseText}
            </p>
            <p className="font-mono text-lg text-muted-foreground mb-6">{shloka.transliteration}</p>
            <p className="text-xl md:text-2xl leading-relaxed mb-6">
              "{shloka.translation}"
            </p>
            <footer className="text-base md:text-lg text-muted-foreground italic">
              {shloka.interpretation}
            </footer>
          </blockquote>
        </CardContent>
      </Card>
    </section>
  );
}
