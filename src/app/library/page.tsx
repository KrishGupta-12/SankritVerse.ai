'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type UserVerse = {
    id: string; // This is the userVerse document ID from the subcollection
    verseId: string;
    savedTimestamp: any;
};

type Verse = {
    text?: string;
    translation?: string;
}

function SavedVerseCard({ userVerse }: { userVerse: UserVerse }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser();
    const [deleting, setDeleting] = useState(false);

    // This reference points to the document in the top-level 'verses' collection
    const verseRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // The verseId from the user's subcollection points to the main verse doc
        return doc(firestore, 'verses', userVerse.verseId);
    }, [firestore, userVerse.verseId]);

    const { data: verse, isLoading: isLoadingVerse } = useDoc<Verse>(verseRef);

    const handleDelete = async () => {
        if (!user || !firestore) return;
        setDeleting(true);
        try {
            // This reference points to the document in the user's 'userVerses' subcollection
            const userVerseDocRef = doc(firestore, `users/${user.uid}/userVerses`, userVerse.id);
            await deleteDoc(userVerseDocRef);
            toast({
                title: "Verse Removed",
                description: "The verse has been removed from your library.",
            });
        } catch (error) {
            console.error("Error removing verse: ", error);
            toast({
                title: "Error",
                description: "Could not remove the verse. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex justify-between items-start">
                {isLoadingVerse ? (
                     <div className="flex items-center space-x-4">
                        <div className="space-y-2">
                            <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                ) : verse ? (
                    <div>
                        <p className="font-noto-devanagari text-lg mb-2">{verse?.text}</p>
                        <p className="text-muted-foreground italic">"{verse?.translation}"</p>
                    </div>
                ) : (
                    <div>
                      <p className="text-muted-foreground">Verse details could not be loaded.</p>
                    </div>
                )}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deleting}>
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the verse from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}


export default function LibraryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const userVersesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/userVerses`),
            orderBy('savedTimestamp', 'desc')
        );
    }, [user, firestore]);

    const { data: savedVerses, isLoading: isLoadingVerses } = useCollection<UserVerse>(userVersesQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || isLoadingVerses) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-headline text-primary mb-6">My Saved Verses</h1>
            {savedVerses && savedVerses.length > 0 ? (
                <div className="grid gap-4">
                    {savedVerses.map((verse) => (
                        <SavedVerseCard key={verse.id} userVerse={verse} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Your library is empty.</p>
                        <p className="text-muted-foreground mt-2">Use the "Analyze" feature to find and save verses.</p>
                        <Button asChild className="mt-4">
                            <Link href="/analyzer">Analyze a Verse</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
