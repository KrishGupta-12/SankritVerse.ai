'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { generateVerseExplanations, type GenerateVerseExplanationsOutput } from '@/ai/flows/generate-verse-explanations';
import { useToast } from '@/hooks/use-toast';
import VerseAnalysisDisplay from '@/components/verse-analysis-display';
import CameraScanner from './camera-scanner';
import { ScanVerseFromImageOutput } from '@/ai/flows/scan-verse-from-image';

export default function VerseAnalyzer() {
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateVerseExplanationsOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.trim()) {
      toast({
        title: 'Empty Verse',
        description: 'Please enter a Sanskrit verse to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysisResult = await generateVerseExplanations({ verseText: verse });
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the verse. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = (scanResult: ScanVerseFromImageOutput, verseText: string) => {
    setVerse(verseText);
    setResult(scanResult);
  };

  return (
    <section id="analyzer" className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            AI-Powered Analysis
          </CardTitle>
          <CardDescription>
            Enter a Sanskrit verse below, or scan one from a book, to get a detailed breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze}>
            <Textarea
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="Enter your Sanskrit verse here... e.g., कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"
              className="min-h-[120px] text-lg font-noto-devanagari mb-4 focus-visible:ring-accent"
              disabled={loading}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Verse'
                )}
              </Button>
              <CameraScanner 
                onScanComplete={handleScanComplete}
                setParentLoading={setLoading}
              />
            </div>
          </form>
          {result && <VerseAnalysisDisplay result={result} originalVerse={verse} />}
        </CardContent>
      </Card>
    </section>
  );
}
