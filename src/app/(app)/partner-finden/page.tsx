'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, CheckCircle, MessageSquare } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBuddies, type SuggestedBuddy } from "@/contexts/PartnersContext";
import { useChats } from "@/contexts/ChatsContext";

// The master list of all possible suggestions
const allSuggestedBuddies: SuggestedBuddy[] = [
  { id: 101, name: "Anna Kurz", studiengang: "Informatik, 3. Sem.", image: "https://placehold.co/300x400.png", dataAiHint:"woman programmer", mutualInterests: ["Web-Entwicklung", "Python"] },
  { id: 102, name: "Markus Lang", studiengang: "BWL, 5. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "man business", mutualInterests: ["Marketing", "Statistik"] },
  { id: 103, name: "Julia Klein", studiengang: "Soziale Arbeit, 1. Sem.", image: "https://placehold.co/300x400.png", dataAiHint:"woman social", mutualInterests: ["Grundlagen Psychologie"] },
  { id: 104, name: "Jonas Huber", studiengang: "Wirtschaftsingenieurwesen, 4. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "man engineer", mutualInterests: ["Logistik", "Projektarbeit"] },
  { id: 105, name: "Sophie Becker", studiengang: "Maschinenbau, 6. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "woman smiling", mutualInterests: ["Thermodynamik", "Bachelorarbeit"] },
  { id: 106, name: "Felix Schmidt", studiengang: "Informatik, 2. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "man coding", mutualInterests: ["Java", "Algorithmen"] },
  { id: 107, name: "Lena Wolf", studiengang: "BWL, 2. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "woman student", mutualInterests: ["Controlling", "Rechnungswesen"] },
];


export default function PartnerFindenPage() {
  const [suggestionQueue, setSuggestionQueue] = useState<SuggestedBuddy[]>([]);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState<SuggestedBuddy | null>(null);
  const { buddies: myBuddies, addBuddy } = useBuddies();
  const { startNewChat } = useChats();
  const router = useRouter();
  const [declinedBuddyIds, setDeclinedBuddyIds] = useState<Set<number>>(new Set());

  // Load declined IDs from localStorage on initial render
  useEffect(() => {
    const storedDeclinedIds = localStorage.getItem('declinedBuddyIds');
    if (storedDeclinedIds) {
        try {
            // Attempt to parse the stored data
            const parsedIds = JSON.parse(storedDeclinedIds);
            if (Array.isArray(parsedIds)) {
                setDeclinedBuddyIds(new Set(parsedIds));
            } else {
                localStorage.removeItem('declinedBuddyIds');
            }
        } catch (error) {
            console.error("Error parsing declined IDs from localStorage", error);
            localStorage.removeItem('declinedBuddyIds'); // Clear invalid data
        }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter out buddies that the user has already added or declined.
  useEffect(() => {
    // Ensure myBuddies IDs are numbers for consistent comparison
    const myBuddyIds = new Set(myBuddies.map(b => parseInt(b.id, 10)));
    
    const filteredSuggestions = allSuggestedBuddies.filter(
      suggested => !myBuddyIds.has(suggested.id) && !declinedBuddyIds.has(suggested.id)
    );
    setSuggestionQueue(filteredSuggestions);
  }, [myBuddies, declinedBuddyIds]); // Re-filter whenever the user's buddy list or declined list changes.

  const advanceQueueAndClose = () => {
    setShowMatchDialog(false);
    // Use a timeout to allow the dialog to close gracefully before the card disappears.
    // The suggestion queue will update automatically via the useEffect hook.
    setTimeout(() => {
        setMatchedBuddy(null);
    }, 150);
  };

  const handleInterest = () => {
    if (suggestionQueue.length === 0) return;
    const currentBuddy = suggestionQueue[0];
    addBuddy(currentBuddy); // Automatically add buddy, triggering the useEffect to re-filter
    startNewChat(currentBuddy); // Automatically create a new chat
    setMatchedBuddy(currentBuddy);
    setShowMatchDialog(true);
  };
  
  const handleReject = () => {
     if (suggestionQueue.length === 0) return;
     const rejectedBuddy = suggestionQueue[0];
     
     // Update the declined IDs state, which will trigger the useEffect to re-filter
     setDeclinedBuddyIds(prev => {
        const newDeclinedIds = new Set(prev);
        newDeclinedIds.add(rejectedBuddy.id);
        // Persist the new set to localStorage
        localStorage.setItem('declinedBuddyIds', JSON.stringify(Array.from(newDeclinedIds)));
        return newDeclinedIds;
     });
  }

  const handleChat = () => {
    if (!matchedBuddy) return;
    router.push(`/chats/${matchedBuddy.id}`);
    advanceQueueAndClose();
  };

  const handleResetSuggestions = () => {
    localStorage.removeItem('declinedBuddyIds');
    setDeclinedBuddyIds(new Set());
  };

  return (
    <>
      <div className="h-full flex flex-col justify-center items-center py-8">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Buddies finden</h1>
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center">
                <CardTitle>Buddies entdecken</CardTitle>
                <CardDescription>Wische durch Profile oder nutze die Buttons.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {suggestionQueue.length > 0 ? (
                  <div className="relative w-full max-w-xs h-[450px] md:h-[500px]">
                    {suggestionQueue.map((buddy, index) => (
                      <Card 
                        key={buddy.id} 
                        className="absolute w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out"
                        style={{ 
                          zIndex: suggestionQueue.length - index,
                          transform: `translateY(${index * 10}px) scale(${1 - index * 0.05})`,
                          opacity: index === 0 ? 1 : (index < 2 ? 0.7 : 0) // Show top 2 cards
                        }}
                      >
                        <Image src={buddy.image} alt={buddy.name} layout="fill" objectFit="cover" data-ai-hint={buddy.dataAiHint}/>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                          <h3 className="text-xl font-bold">{buddy.name}</h3>
                          <p className="text-sm">{buddy.studiengang}</p>
                          <p className="text-xs mt-1">Interessen: {buddy.mutualInterests.join(', ')}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[450px] md:h-[500px] bg-secondary rounded-xl w-full max-w-xs p-4">
                      <CardTitle>Keine weiteren Vorschläge</CardTitle>
                      <CardDescription className="mt-2">Du hast alle aktuellen Vorschläge gesehen. <br/> Komme später wieder!</CardDescription>
                      <Button onClick={handleResetSuggestions} variant="link" className="mt-4">
                        Vorschläge zurücksetzen
                      </Button>
                  </div>
                )}
                {suggestionQueue.length > 0 && (
                  <div className="flex justify-center space-x-6 mt-8">
                    <Button onClick={handleReject} variant="outline" size="icon" className="rounded-full h-16 w-16 border-destructive text-destructive hover:bg-destructive/10">
                      <X className="h-8 w-8" />
                      <span className="sr-only">Ablehnen</span>
                    </Button>
                    <Button onClick={handleInterest} variant="outline" size="icon" className="rounded-full h-16 w-16 border-green-500 text-green-500 hover:bg-green-500/10">
                      <Heart className="h-8 w-8" />
                      <span className="sr-only">Interesse zeigen</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
      <AlertDialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
            <AlertDialogTitle className="text-2xl">Buddy gefunden!</AlertDialogTitle>
            <AlertDialogDescription>
              Super! Du und {matchedBuddy?.name} habt Interesse aneinander. Starte doch gleich ein Gespräch oder suche weiter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={advanceQueueAndClose} className="w-full sm:w-auto" variant="outline">Suche weiter</Button>
            <Button onClick={handleChat} className="w-full sm:w-auto">
               <MessageSquare className="mr-2 h-4 w-4" />
               Chat starten
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
