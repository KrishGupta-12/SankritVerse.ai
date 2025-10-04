'use client';

import VerseAnalyzer from '@/components/verse-analyzer';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  
    return <VerseAnalyzer />;
}
