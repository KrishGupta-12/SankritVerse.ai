'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc, Timestamp, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Trash2, Search, Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";


// Represents the document in the user's subcollection
type UserVerse = {
    id: string;
    verseId: string;
    savedTimestamp: Timestamp;
};

// Represents the full verse data from the top-level 'verses' collection
type Verse = {
    id: string;
    text: string;
    translation: string;
    transliteration: string;
    wordMeanings: string;
    grammarTags: string;
    summary: string;
};

// A combined type for easier handling in the UI
type CombinedVerse = UserVerse & {
    details?: Verse;
};

function VerseDetailDialog({ verse, isOpen, onOpenChange }: { verse: CombinedVerse | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!verse || !verse.details) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-noto-devanagari text-2xl">{verse.details.text}</DialogTitle>
                    <DialogDescription className="pt-2">
                        Saved on {format(verse.savedTimestamp.toDate(), "PPP")}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">Translation</h3>
                            <p className="text-muted-foreground italic">"{verse.details.translation}"</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Summary</h3>
                            <p className="text-muted-foreground">{verse.details.summary}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Transliteration</h3>
                            <p className="text-muted-foreground font-mono">{verse.details.transliteration}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Word Meanings</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{verse.details.wordMeanings}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Grammar Tags</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap font-mono">{verse.details.grammarTags}</p>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function VerseRow({ verse, onSelectVerse, onDelete }: { verse: CombinedVerse, onSelectVerse: () => void, onDelete: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = async () => {
        setIsDeleting(true);
        await onDelete();
        setIsDeleting(false);
    };

    return (
        <div className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <button onClick={onSelectVerse} className="flex-grow text-left">
                <p className="font-noto-devanagari text-base truncate">{verse.details?.text ?? 'Loading verse...'}</p>
                <p className="text-xs text-muted-foreground">
                    Saved on {format(verse.savedTimestamp.toDate(), "PP")}
                </p>
            </button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this verse from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClick} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function useVerseDetails(verseIds: string[]) {
    const firestore = useFirestore();
    const [verses, setVerses] = useState<Record<string, Verse>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!firestore || verseIds.length === 0) {
            setVerses({});
            return;
        };

        const fetchVerses = async () => {
            setIsLoading(true);
            const newVerses: Record<string, Verse> = {};
            // By getting the current state of verses from inside the effect, we avoid adding `verses` to dependency array.
            const versesToFetch = verseIds.filter(id => !(id in verses));
            
            if(versesToFetch.length > 0) {
                for (const id of versesToFetch) {
                    const verseRef = doc(firestore, 'verses', id);
                    const docSnap = await getDoc(verseRef);
                    if (docSnap.exists()) {
                        newVerses[id] = { id: docSnap.id, ...docSnap.data() } as Verse;
                    }
                }
                setVerses(prev => ({ ...prev, ...newVerses }));
            }
            setIsLoading(false);
        };

        fetchVerses();

    }, [firestore, verseIds]); // Depend only on firestore and verseIds

    return { verses, isLoading: isLoading };
}

export default function LibraryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedVerse, setSelectedVerse] = useState<CombinedVerse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const userVersesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/userVerses`),
            orderBy('savedTimestamp', 'desc')
        );
    }, [user, firestore]);

    const { data: savedVerses, isLoading: isLoadingUserVerses } = useCollection<UserVerse>(userVersesQuery);

    const verseIds = useMemo(() => savedVerses?.map(v => v.verseId) ?? [], [savedVerses]);
    // The useVerseDetails hook was causing an infinite loop. I'm memoizing verseDetails as well.
    const { verses: verseDetailsMap, isLoading: isLoadingVerseDetails } = useVerseDetails(verseIds);
    
    const combinedVerses = useMemo(() => {
        return (savedVerses ?? []).map(sv => ({
            ...sv,
            details: verseDetailsMap[sv.verseId]
        })).filter(cv => cv.details); // Only include verses where details have loaded
    }, [savedVerses, verseDetailsMap]);
    
    const filteredVerses = useMemo(() => {
        let verses = combinedVerses;
        
        if(searchQuery) {
            verses = verses.filter(v => v.details?.text.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if(selectedDate) {
            verses = verses.filter(v => format(v.savedTimestamp.toDate(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
        }

        return verses;
    }, [combinedVerses, searchQuery, selectedDate]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleDelete = async (userVerseId: string) => {
        if (!user || !firestore) return;
        try {
            const userVerseDocRef = doc(firestore, `users/${user.uid}/userVerses`, userVerseId);
            await deleteDoc(userVerseDocRef);
            toast({
                title: "Verse Removed",
                description: "The verse has been removed from your library.",
            });
            if(selectedVerse?.id === userVerseId) {
                setIsDialogOpen(false);
                setSelectedVerse(null);
            }
        } catch (error) {
            console.error("Error removing verse: ", error);
            toast({
                title: "Error",
                description: "Could not remove the verse. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const isLoading = isUserLoading || isLoadingUserVerses || isLoadingVerseDetails;

    if (isLoading && !filteredVerses.length) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-headline text-primary">My Saved Verses</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search verses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full sm:w-[240px] justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Filter by date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    {selectedDate && (
                         <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    {isLoading && <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />}
                    {!isLoading && filteredVerses.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filteredVerses.map((verse) => (
                                <VerseRow 
                                    key={verse.id} 
                                    verse={verse}
                                    onSelectVerse={() => {
                                        setSelectedVerse(verse);
                                        setIsDialogOpen(true);
                                    }}
                                    onDelete={() => handleDelete(verse.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-muted-foreground">
                                {combinedVerses.length === 0 ? "Your library is empty." : "No verses match your filters."}
                            </p>
                            {combinedVerses.length === 0 && (
                                <>
                                 <p className="text-muted-foreground mt-2">Use the "Analyze" feature to find and save verses.</p>
                                 <Button asChild className="mt-4">
                                     <Link href="/analyzer">Analyze a Verse</Link>
                                 </Button>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <VerseDetailDialog 
                verse={selectedVerse}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
}
