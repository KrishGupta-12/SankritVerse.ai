'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, User as UserIcon, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);
    
    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return names[0].substring(0, 2);
    }

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
             <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">My Profile</CardTitle>
                    <CardDescription>Your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                            <AvatarFallback className="text-3xl font-bold bg-secondary text-primary">
                                {getInitials(user.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                             <h2 className="text-2xl font-bold">{user.displayName}</h2>
                             <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">
                                <span className="font-semibold">User ID:</span> {user.uid}
                            </span>
                        </div>
                         <div className="flex items-center gap-3">
                            {user.emailVerified ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldAlert className="h-5 w-5 text-yellow-600" />}
                            <span className="text-sm">
                               <span className="font-semibold">Email Verified:</span> {user.emailVerified ? 'Yes' : 'No'}
                                {!user.emailVerified && <span className="text-xs text-muted-foreground"> (Check your inbox to verify)</span>}
                            </span>
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>
    );
}
