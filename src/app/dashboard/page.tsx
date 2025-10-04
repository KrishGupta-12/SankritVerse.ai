'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ShlokaOfTheDay from '@/components/shloka-of-the-day';
import { Loader2 } from 'lucide-react';
import PersonalizedRecommendations from '@/components/personalized-recommendations';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
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
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-headline text-primary mb-2">Welcome, {user.displayName || 'User'}!</h1>
            <p className="text-muted-foreground mb-8">Here is your spiritual insight for the day.</p>
            <div className="space-y-12">
                <ShlokaOfTheDay />
                <Separator />
                <PersonalizedRecommendations />
            </div>
        </div>
    );
}
