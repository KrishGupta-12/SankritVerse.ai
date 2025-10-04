'use client';

import VerseAnalyzer from '@/components/verse-analyzer';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WordAnalyzer from '@/components/word-analyzer';

export default function AnalyzerPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <p>Loading...</p>
            </div>
        );
    }
  
    return (
         <section id="analyzer" className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="text-primary" />
                    AI-Powered Analysis
                </CardTitle>
                <CardDescription>
                    Analyze a full Sanskrit verse or look up the meaning of a single word.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="verse" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="verse">Verse Analyzer</TabsTrigger>
                            <TabsTrigger value="word">Word Analyzer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="verse">
                           <VerseAnalyzer />
                        </TabsContent>
                        <TabsContent value="word">
                           <WordAnalyzer />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </section>
    );
}
