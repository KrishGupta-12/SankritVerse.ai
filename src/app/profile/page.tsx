'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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


// We need a more detailed type that includes the verse details
type SavedVerse = {
    id: string; // This will be the userVerse document ID from the subcollection
    verseId: string;
    savedTimestamp: any;
    // These fields will be populated from the corresponding document in the /verses collection
    text?: string;
    translation?: string;
};


export default function LibraryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const userVersesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/userVerses`),
            orderBy('savedTimestamp', 'desc')
        );
    }, [user, firestore]);

    const { data: savedVerses, isLoading: isLoadingVerses } = useCollection<SavedVerse>(userVersesQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);


    const handleDelete = async (userVerseId: string) => {
        if (!user || !firestore) return;
        setDeletingId(userVerseId);
        try {
            const verseRef = doc(firestore, `users/${user.uid}/userVerses`, userVerseId);
            await deleteDoc(verseRef);
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
            setDeletingId(null);
        }
    };


    if (isUserLoading || isLoadingVerses) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        // This will be handled by the useEffect redirect, but it's good practice
        // to have a fallback UI state.
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-headline text-primary mb-6">My Saved Verses</h1>
            {savedVerses && savedVerses.length > 0 ? (
                <div className="grid gap-4">
                    {savedVerses.map((verse) => (
                        <Card key={verse.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex justify-between items-start">
                                <div>
                                    <p className="font-noto-devanagari text-lg mb-2">{verse.id}</p>
                                    <p className="text-muted-foreground italic">"{verse.verseId}"</p>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={deletingId === verse.id}>
                                      {deletingId === verse.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                                      <AlertDialogAction onClick={() => handleDelete(verse.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Your library is empty.</p>
                        <p className="text-muted-foreground mt-2">Use the "Analyze" feature to find and save verses.</p>
                        <Button asChild className="mt-4">
                            <a href="/analyzer">Analyze a Verse</a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
