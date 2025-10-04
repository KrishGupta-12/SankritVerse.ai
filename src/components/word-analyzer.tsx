'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateWordExplanation, type GenerateWordExplanationOutput } from '@/ai/flows/generate-word-explanation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

function WordAnalysisDisplay({ result, originalWord }: { result: GenerateWordExplanationOutput, originalWord: string }) {
    return (
        <div className="mt-8 pt-6 border-t">
            <div className="mb-6">
                 <h3 className="text-2xl font-bold font-body text-primary mb-2">Analysis for: <span className="font-noto-devanagari">{originalWord}</span></h3>
                 <p className="text-muted-foreground capitalize">{result.englishTranslation}</p>
            </div>
             <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Meaning & Definition</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed">{result.meaning}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Grammatical Analysis</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap">{result.grammaticalAnalysis}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Usage Example</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed whitespace-pre-wrap">{result.usageExample}</AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}


export default function WordAnalyzer() {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateWordExplanationOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      toast({
        title: 'Empty Word',
        description: 'Please enter a Sanskrit word to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysisResult = await generateWordExplanation({ word });
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the word. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6">
        <form onSubmit={handleAnalyze}>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter a Sanskrit word... e.g., धर्म"
                    className="flex-grow text-lg font-noto-devanagari focus-visible:ring-accent"
                    disabled={loading}
                />
                <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
                    {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                    ) : (
                    'Analyze Word'
                    )}
                </Button>
            </div>
        </form>
         {result && <WordAnalysisDisplay result={result} originalWord={word} />}
    </div>
  );
}
