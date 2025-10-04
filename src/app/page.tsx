'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { BrainCircuit, Library, ScanText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-mandala');
  const { user } = useUser();

  const features = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: 'AI-Powered Analysis',
      description: 'Get instant, detailed breakdowns of any Sanskrit verse, including translation, transliteration, grammar, and word-by-word meanings.',
    },
    {
      icon: <Library className="h-10 w-10 text-primary" />,
      title: 'Personal Verse Library',
      description: 'Save your favorite verses and their analyses to your personal collection for easy access, review, and reflection anytime.',
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: 'Daily Spiritual Dose',
      description: 'Start your day with a "Shloka of the Day," complete with a full explanation to inspire and guide you. (For logged-in users)',
    },
    {
      icon: <ScanText className="h-10 w-10 text-primary" />,
      title: 'Scan from Book',
      description: 'Use your camera to instantly capture and analyze verses directly from physical books, bridging ancient texts and modern tech.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center rounded-b-xl overflow-hidden mb-16 bg-card py-16 md:py-24 border-b shadow-sm">
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
          <div className="container relative z-10">
            <h1 className="font-headline text-5xl md:text-7xl text-primary drop-shadow-sm">
              SanskritVerse AI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock the wisdom of ancient scriptures. Analyze, learn, and immerse yourself in the beauty of Sanskrit verses.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href={user ? "/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Get Started for Free"}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/analyzer">Analyze a Verse</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline text-primary">Discover the Power Within</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to dive deep into the world of Sanskrit wisdom.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Founder Section */}
        <section id="founder" className="bg-secondary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline text-primary mb-4">From a Visionary Founder</h2>
             <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              This platform is born from a passion for technology and ancient wisdom.
            </p>
            <Card className="max-w-md mx-auto shadow-xl overflow-hidden border-primary/20 border-2">
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <Avatar className="h-28 w-28 border-4 border-primary">
                   <AvatarImage src="https://avatars.githubusercontent.com/u/10756734?v=4" alt="Krish Gupta" />
                   <AvatarFallback className="text-5xl font-bold bg-secondary text-primary">
                    KG
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-3xl font-bold font-body">Krish Gupta</h3>
                  <p className="text-muted-foreground mt-1">Founder and CEO</p>
                  <Button variant="link" asChild className="mt-2">
                     <Link href="https://krishgupta.in" target="_blank" rel="noopener noreferrer">
                      krishgupta.in
                    </Link>
                  </Button>
                </div>
                 <p className="text-muted-foreground italic text-center mt-2">
                  "Our mission is to make the profound wisdom of Sanskrit scriptures accessible to everyone, everywhere, breaking down barriers of language and complexity through the power of AI."
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
