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
import { useMemo, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { generateDailyShloka } from '@/ai/flows/generate-daily-shloka';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type DailyShloka = {
  id?: string;
  verseId: string;
  date: Timestamp;
  interpretation: string;
  verseText: string;
  verseSource: string; 
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

  const generateAndStoreShloka = async (force = false) => {
    if (!firestore) {
      toast({ title: "Error", description: "Database connection not available.", variant: "destructive" });
      return;
    };
    
    if (shlokas?.length && !force) {
        toast({ title: "Already up to date", description: "Today's verse has already been generated." });
        return;
    }

    setIsGenerating(true);

    try {
      toast({ title: "Generating new verse...", description: "Please wait, this may take a moment."});
      const analysis = await generateDailyShloka();

      const verseId = btoa(unescape(encodeURIComponent(analysis.verseText))).substring(0, 20);
      const shlokaId = `${new Date().toISOString().split('T')[0]}-${verseId}`;
      const dailyShlokaRef = doc(firestore, 'dailyShlokas', shlokaId);
      
      const newShlokaData: DailyShloka = {
        verseId,
        date: todayTimestamp,
        verseText: analysis.verseText,
        verseSource: analysis.source,
        verseChapter: analysis.chapter,
        verseNumber: analysis.verse,
        interpretation: analysis.summary,
        transliteration: analysis.transliteration,
        wordMeanings: analysis.wordMeanings,
        grammarTags: analysis.grammarTags,
        translation: analysis.englishTranslation,
      };

      setDocumentNonBlocking(dailyShlokaRef, newShlokaData, { merge: true });
      
      toast({ title: "Verse of the Day is ready!", description: "Enjoy the wisdom for today."});

    } catch (e) {
      console.error("Failed to generate shloka of the day:", e);
      toast({ title: "Generation Failed", description: "Could not generate a new verse. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || (!shloka && !error)) {
    return (
       <section>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
          <CardHeader className="text-center bg-secondary/50 p-6">
            <Skeleton className="h-6 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading today's verse...</p>
          </CardContent>
           <CardFooter className="bg-secondary/50 p-3 justify-center">
             <Button variant="ghost" size="sm" onClick={() => generateAndStoreShloka(true)} disabled={isGenerating || isLoading}>
                 <RefreshCw className="mr-2 h-4 w-4" /> Force refresh
             </Button>
           </CardFooter>
        </Card>
      </section>
    )
  }

  if (error || !shloka) {
    return (
       <section>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-destructive/20 overflow-hidden">
           <CardHeader className="text-center">
                <CardTitle className="text-destructive">Verse Not Found</CardTitle>
                <CardDescription>A verse for today has not been generated yet.</CardDescription>
           </CardHeader>
           <CardContent className="p-8 md:p-12 text-center flex flex-col items-center gap-4">
            <p className="text-muted-foreground">Click the button below to generate a new verse for today.</p>
            <Button onClick={() => generateAndStoreShloka(true)} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Generate Today's Verse
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
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
         <CardFooter className="bg-secondary/50 p-3 justify-center">
             <Button variant="ghost" size="sm" onClick={() => generateAndStoreShloka(true)} disabled={isGenerating}>
                 <RefreshCw className="mr-2 h-4 w-4" /> Force refresh
             </Button>
           </CardFooter>
      </Card>
    </section>
  );
}
