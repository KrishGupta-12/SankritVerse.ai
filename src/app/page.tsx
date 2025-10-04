import Image from 'next/image';
import ShlokaOfTheDay from '@/components/shloka-of-the-day';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Eye, Rocket } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-mandala');

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative text-center rounded-xl overflow-hidden mb-12 bg-card p-8 border shadow-sm">
        <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-10"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10">
          <h1 className="font-headline text-5xl md:text-7xl text-primary drop-shadow-sm">
            SanskritVerse AI
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the wisdom of ancient scriptures. Analyze, learn, and immerse yourself in the beauty of Sanskrit verses.
          </p>
        </div>
      </section>

      <ShlokaOfTheDay />

      <section id="founder" className="mb-12">
        <h2 className="text-3xl font-headline text-center mb-6 text-primary">Our Founder</h2>
        <Card className="max-w-xl mx-auto shadow-lg">
          <CardContent className="p-6 flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarFallback className="text-4xl font-bold bg-secondary text-primary">
                KG
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">Krish Gupta</h3>
              <p className="text-muted-foreground">Founder and CEO</p>
              <Link href="https://krishgupta.in" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                krishgupta.in
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="vision-mission" className="mb-12">
         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To make the profound wisdom of Sanskrit scriptures accessible to everyone, everywhere, breaking down barriers of language and complexity through the power of AI.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To build the most comprehensive and intuitive platform for the study and exploration of Sanskrit verses, fostering a global community of learners and enthusiasts.
                </p>
              </CardContent>
            </Card>
         </div>
      </section>
    </div>
  );
}
