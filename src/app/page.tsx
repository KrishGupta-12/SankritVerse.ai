import Image from 'next/image';
import ShlokaOfTheDay from '@/components/shloka-of-the-day';
import VerseAnalyzer from '@/components/verse-analyzer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

      <VerseAnalyzer />
    </div>
  );
}
