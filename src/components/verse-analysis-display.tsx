'use client';

import { useEffect, useState } from 'react';
import { GenerateVerseExplanationsOutput } from '@/ai/flows/generate-verse-explanations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Share2, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

interface VerseAnalysisDisplayProps {
  result: GenerateVerseExplanationsOutput;
  originalVerse: string;
}

export default function VerseAnalysisDisplay({ result, originalVerse }: VerseAnalysisDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();


  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && !!window.speechSynthesis);
    const loadVoices = () => {
      // getVoices is async on some browsers
      window.speechSynthesis.getVoices();
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
    if (!canSpeak) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(originalVerse);
    const voices = window.speechSynthesis.getVoices();
    const sanskritVoice = voices.find(v => v.lang === 'sa-IN') || voices.find(v => v.lang === 'hi-IN');
    if (sanskritVoice) {
      utterance.voice = sanskritVoice;
    } else {
        console.warn("Sanskrit/Hindi voice not found, using default.")
    }
    utterance.rate = 0.8;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };
  
  const handleShare = () => {
    const shareText = `Sanskrit Verse:\n${originalVerse}\n\nTranslation:\n${result.englishTranslation}\n\nAnalyzed with SanskritVerse AI.`;
    navigator.clipboard.writeText(shareText);
    toast({
        title: "Copied to Clipboard",
        description: "Verse and translation have been copied."
    });
  }

  const handleSave = async () => {
    if (!user || !firestore) {
      router.push('/login');
      return;
    }
    setIsSaving(true);
    
    // 1. Save the main verse data to /verses/{verseId} if it's new
    // We can use a hash of the verse text as a simple ID
    const verseId = btoa(unescape(encodeURIComponent(originalVerse))).substring(0, 20);
    const verseRef = doc(firestore, 'verses', verseId);
    
    const verseData = {
      text: originalVerse,
      transliteration: result.transliteration,
      wordMeanings: result.wordMeanings,
      grammarTags: result.grammarTags,
      translation: result.englishTranslation,
      summary: result.summary,
    };
    // Use set with merge to avoid overwriting if it already exists
    setDocumentNonBlocking(verseRef, verseData, { merge: true });

    // 2. Save the verse to the user's personal library
    const userVerseRef = doc(firestore, `users/${user.uid}/userVerses`, verseId);
    const userVerseData = {
      verseId: verseId,
      savedTimestamp: serverTimestamp(),
    };
    setDocumentNonBlocking(userVerseRef, userVerseData, { merge: true });

    toast({
      title: "Verse Saved!",
      description: "This verse has been added to your personal library.",
    });

    setIsSaving(false);
  }

  return (
    <div className="mt-8 pt-6 border-t">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-2xl font-bold font-body text-primary mb-2">Analysis Results</h3>
                <p className="text-muted-foreground whitespace-pre-line text-lg font-bold">{originalVerse}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleSpeak} disabled={!canSpeak}>
                                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                <span className="sr-only">Listen to verse</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Listen to pronunciation</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleShare}>
                                <Share2 className="h-5 w-5" />
                                <span className="sr-only">Share verse</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy verse and translation</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                                <span className="sr-only">Save to library</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{user ? "Save to your library" : "Login to save"}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">English Translation</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed">{result.englishTranslation}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">Summary</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed">{result.summary}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">Transliteration</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed font-mono">{result.transliteration}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg font-semibold">Word by Word Meanings</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap">{result.wordMeanings}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold">Grammar Tags</AccordionTrigger>
          <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap font-mono">{result.grammarTags}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
