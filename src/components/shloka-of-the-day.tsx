'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenText, Heart, Loader2, RefreshCw, Share2, Volume2, VolumeX } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, Timestamp, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { generateDailyShloka } from '@/ai/flows/generate-daily-shloka';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useRouter } from 'next/navigation';

type DailyShloka = {
  id?: string;
  verseId: string;
  date: Timestamp;
  interpretation: string; // Corresponds to 'summary' from AI
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
  const { user } = useUser();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
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

  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && !!window.speechSynthesis);
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!canSpeak || !shloka) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(shloka.verseText);
    const voices = window.speechSynthesis.getVoices();
    const sanskritVoice = voices.find(v => v.lang === 'sa-IN') || voices.find(v => v.lang === 'hi-IN');
    if (sanskritVoice) {
      utterance.voice = sanskritVoice;
    }
    utterance.rate = 0.8;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    if (!shloka) return;
    const shareText = `Shloka of the Day:\n${shloka.verseText}\n\nTranslation:\n${shloka.translation}\n\nAnalyzed with SanskritVerse AI.`;
    navigator.clipboard.writeText(shareText);
    toast({
        title: "Copied to Clipboard",
        description: "Verse and translation have been copied."
    });
  };

  const handleSave = async () => {
    if (!user || !firestore || !shloka) {
      router.push('/login');
      return;
    }
    setIsSaving(true);
    try {
        const verseRef = doc(firestore, 'verses', shloka.verseId);
        const verseData = {
            id: shloka.verseId,
            text: shloka.verseText,
            transliteration: shloka.transliteration,
            wordMeanings: shloka.wordMeanings,
            grammarTags: shloka.grammarTags,
            translation: shloka.translation,
            summary: shloka.interpretation,
        };
        setDocumentNonBlocking(verseRef, verseData, { merge: true });

        const userVerseRef = doc(firestore, `users/${user.uid}/userVerses`, shloka.verseId);
        const docSnap = await getDoc(userVerseRef);
        if (docSnap.exists()) {
             toast({
                title: "Already in Library",
                description: "This verse is already saved.",
            });
        } else {
            const userVerseData = {
                verseId: shloka.verseId,
                savedTimestamp: serverTimestamp(),
            };
            setDocumentNonBlocking(userVerseRef, userVerseData, {});
            toast({
                title: "Verse Saved!",
                description: "Added to your personal library.",
            });
        }
    } catch (error) {
        console.error("Error saving verse:", error);
        toast({
            title: "Save Failed",
            description: "Could not save the verse.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const generateAndStoreShloka = async (force = false) => {
    if (!firestore) return;
    if (shlokas?.length && !force) return;

    setIsGenerating(true);
    try {
      toast({ title: "Generating new verse...", description: "Please wait a moment."});
      const analysis = await generateDailyShloka();

      const verseId = btoa(unescape(encodeURIComponent(analysis.verseText))).substring(0, 20);
      const shlokaId = `${new Date().toISOString().split('T')[0]}`; // One per day
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
      
      toast({ title: "Verse of the Day is ready!", description: "Enjoy today's wisdom."});

    } catch (e) {
      console.error("Failed to generate shloka:", e);
      toast({ title: "Generation Failed", variant: "destructive" });
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
        <CardHeader className="bg-secondary/50 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpenText className="w-5 h-5"/>
                        <CardDescription className="text-lg">
                            {shloka.verseSource} - Chapter {shloka.verseChapter}, Verse {shloka.verseNumber}
                        </CardDescription>
                    </div>
                     <CardTitle className="font-noto-devanagari text-3xl mt-2">{shloka.verseText}</CardTitle>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleSpeak} disabled={!canSpeak}>
                                    {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Listen to pronunciation</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleShare}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Copy verse & translation</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{user ? "Save to your library" : "Login to save"}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">English Translation</AccordionTrigger>
                    <AccordionContent className="text-xl leading-relaxed italic">"{shloka.translation}"</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Summary & Interpretation</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed">{shloka.interpretation}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Transliteration</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed font-mono">{shloka.transliteration}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className="text-lg font-semibold">Word by Word Meanings</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap">{shloka.wordMeanings}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger className="text-lg font-semibold">Grammar Tags</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap font-mono">{shloka.grammarTags}</AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
         <CardFooter className="bg-secondary/50 p-3 justify-center">
             <Button variant="ghost" size="sm" onClick={() => generateAndStoreShloka(true)} disabled={isGenerating}>
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                 Generate a different verse
             </Button>
           </CardFooter>
      </Card>
    </section>
  );
}
