import { shlokas, type Shloka } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenText } from 'lucide-react';

export default function ShlokaOfTheDay() {
  // For demonstration, we'll just pick a shloka based on the day of the month.
  const dayOfMonth = new Date().getDate();
  const shloka: Shloka = shlokas[dayOfMonth % shlokas.length];

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-headline text-center mb-6 text-primary">Shloka of the Day</h2>
      <Card className="max-w-4xl mx-auto shadow-lg border-2 border-primary/20 overflow-hidden">
        <CardHeader className="text-center bg-secondary/50 p-6">
          <div className="flex justify-center items-center gap-2 text-muted-foreground">
             <BookOpenText className="w-5 h-5"/>
             <CardDescription className="text-lg">
                {shloka.source} - Chapter {shloka.chapter}, Verse {shloka.verse}
             </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <blockquote className="text-center">
            <p className="font-body text-3xl md:text-4xl leading-relaxed whitespace-pre-line mb-6">
              {shloka.shloka}
            </p>
            <footer className="text-base md:text-lg text-muted-foreground italic">
              {shloka.explanation}
            </footer>
          </blockquote>
        </CardContent>
      </Card>
    </section>
  );
}
