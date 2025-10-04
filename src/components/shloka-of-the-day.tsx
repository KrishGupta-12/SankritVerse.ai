'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenText } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';

type DailyShloka = {
  verseId: string;
  date: Timestamp;
  interpretation: string;
  verseText: string;
  verseSource: string;
  verseChapter: number;
  verseNumber: number;
}

export default function ShlokaOfTheDay() {
  const firestore = useFirestore();
  
  const todayTimestamp = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
  }, []);

  const dailyShlokaQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'dailyShlokas'),
      where('date', '==', todayTimestamp),
      limit(1)
    );
  }, [firestore, todayTimestamp]);

  const { data: shlokas, isLoading } = useCollection<DailyShloka>(dailyShlokaQuery);
  const shloka = shlokas?.[0];

  if (isLoading) {
    return (
       <section className="mb-12">
        <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
          <CardHeader className="text-center bg-secondary/50 p-6">
            <Skeleton className="h-6 w-48 mx-auto" />
          </CardHeader>
          <CardContent className="p-8 md:p-12 text-center">
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!shloka) {
    // Optional: Render a message if no shloka is found for the day
    return (
       <section className="mb-12">
        <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
           <CardContent className="p-8 md:p-12 text-center">
            <p>No shloka available for today. Please check back tomorrow!</p>
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
            <p className="font-body text-3xl md:text-4xl leading-relaxed whitespace-pre-line mb-6">
              {shloka.verseText}
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
