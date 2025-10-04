'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy, getDoc, doc } from 'firebase/firestore';
import { personalizedShlokaRecommendations, type PersonalizedShlokaRecommendationsOutput } from '@/ai/flows/personalized-shloka-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VerseAnalysisDisplay from './verse-analysis-display';
import { generateVerseExplanations } from '@/ai/flows/generate-verse-explanations';

type UserVerse = {
    id: string;
    verseId: string;
};

type Verse = {
    id: string;
    text: string;
    translation: string;
    summary: string;
};

function useUserLibraryHistory() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [history, setHistory] = useState<Verse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userVersesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/userVerses`),
            orderBy('savedTimestamp', 'desc'),
            limit(10)
        );
    }, [user, firestore]);

    const { data: savedVerses, isLoading: isLoadingUserVerses } = useCollection<UserVerse>(userVersesQuery);

    useEffect(() => {
        if (isLoadingUserVerses || !savedVerses || !firestore) {
            if(!savedVerses) setIsLoading(false);
            return;
        };

        const fetchVerseDetails = async () => {
            setIsLoading(true);
            const versePromises = savedVerses.map(sv => getDoc(doc(firestore, 'verses', sv.verseId)));
            const verseDocs = await Promise.all(versePromises);
            const detailedVerses = verseDocs
                .filter(doc => doc.exists())
                .map(doc => doc.data() as Verse);
            
            setHistory(detailedVerses);
            setIsLoading(false);
        };

        fetchVerseDetails();
    }, [savedVerses, firestore, isLoadingUserVerses]);

    return { history, isLoading };
}

export default function PersonalizedRecommendations() {
    const { history, isLoading: isLoadingHistory } = useUserLibraryHistory();
    const [recommendation, setRecommendation] = useState<PersonalizedShlokaRecommendationsOutput | null>(null);
    const [analysis, setAnalysis] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const getRecommendation = async () => {
        setIsLoading(true);
        setRecommendation(null);
        setAnalysis(null);
        
        try {
            const interactionHistory = history.map(v => `Verse: ${v.text}\nSummary: ${v.summary}`).join('\n\n');
            
            if (!interactionHistory) {
                toast({
                    title: "Not enough data",
                    description: "Save some verses to your library to get personalized recommendations.",
                });
                return;
            }

            const rec = await personalizedShlokaRecommendations({
                userInteractionHistory: interactionHistory,
                userPreferences: 'General spiritual wisdom, verses about dharma, karma, and self-realization.',
                // The availableShlokas can be left empty for the AI to generate a new one
                availableShlokas: '', 
            });
            setRecommendation(rec);

            // Now, get the full analysis of the recommended shloka
            const analysisResult = await generateVerseExplanations({ verseText: rec.recommendedShloka });
            setAnalysis(analysisResult);

        } catch (error) {
            console.error("Failed to get recommendation:", error);
            toast({
                title: "Recommendation Failed",
                description: "Could not generate a recommendation at this time.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch recommendation on initial load if history is available
    useEffect(() => {
        if(history.length > 0 && !recommendation) {
            getRecommendation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]);

    if (isLoadingHistory) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Recommended For You</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading your library history...</p>
                </CardContent>
            </Card>
        );
    }
    
    if (history.length === 0) {
        return (
             <section id="recommendations">
                <Card className="max-w-4xl mx-auto text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><Sparkles className="text-primary"/>Recommended For You</CardTitle>
                        <CardDescription>Get AI-powered shloka recommendations based on your saved verses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your library is currently empty.</p>
                        <p className="text-muted-foreground mt-1">Start by saving some verses from the Analyzer or the Shloka of the Day!</p>
                    </CardContent>
                </Card>
            </section>
        )
    }

    return (
        <section id="recommendations">
             <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                             <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Recommended For You</CardTitle>
                             {recommendation?.reasoning && <CardDescription className="mt-2">{recommendation.reasoning}</CardDescription>}
                        </div>
                        <Button variant="outline" size="icon" onClick={getRecommendation} disabled={isLoading}>
                           <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="text-center">
                             <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                             <p className="mt-2 text-muted-foreground">Finding a new verse for you...</p>
                        </div>
                    )}
                    {recommendation && analysis && (
                        <VerseAnalysisDisplay result={analysis} originalVerse={recommendation.recommendedShloka} />
                    )}
                    {!isLoading && !recommendation && (
                         <div className="text-center p-8">
                            <p className="text-muted-foreground mb-4">Click the refresh button to generate a new recommendation.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </section>
    );
}