'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, CheckCircle, MessageSquare, Users, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBuddies, type SuggestedBuddy } from "@/contexts/PartnersContext";
import { useChats } from "@/contexts/ChatsContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const AlertDialogContent = dynamic(() => import('@/components/ui/alert-dialog').then(mod => mod.AlertDialogContent));


// The master list of all possible suggestions
const allSuggestedBuddies: SuggestedBuddy[] = [
  { id: 1, name: "Lisa Schmidt", studiengang: "Soziale Arbeit, 1. Sem.", image: "https://i.imgur.com/FwkjiPu.jpeg", avatar: "https://i.imgur.com/PKtZX0C.jpeg", dataAiHint: "woman student", mutualInterests: ["Wissenschaftliches Arbeiten", "Psychologie Grundlagen"] },
  { id: 101, name: "Anna Kurz", studiengang: "Informatik, 3. Sem.", image: "https://i.imgur.com/tfds6vN.jpeg", avatar: "https://i.imgur.com/PvGE2mz.jpeg", dataAiHint:"woman programmer", mutualInterests: ["Web-Entwicklung", "Python"] },
  { id: 102, name: "Markus Lang", studiengang: "BWL, 5. Sem.", image: "https://i.imgur.com/umNyodm.jpeg", avatar: "https://i.imgur.com/hlTMgKi.jpeg", dataAiHint: "man business", mutualInterests: ["Marketing", "Statistik"] },
  { id: 103, name: "Julia Klein", studiengang: "Soziale Arbeit, 1. Sem.", image: "https://i.imgur.com/FXdPVFK.jpeg", avatar: "https://i.imgur.com/Yt7EtV9.jpeg", dataAiHint:"woman social", mutualInterests: ["Grundlagen Psychologie"] },
  { id: 104, name: "Atal Vajpayee", studiengang: "Wirtschaftsingenieurwesen, 4. Sem.", image: "https://i.imgur.com/4yHyOzV.jpeg", avatar: "https://i.imgur.com/xJZT5sW.jpeg", dataAiHint: "man engineer", mutualInterests: ["Logistik", "Projektarbeit"] },
  { id: 105, name: "Sophie Becker", studiengang: "Maschinenbau, 6. Sem.", image: "https://i.imgur.com/m2xnjbE.jpeg", avatar: "https://i.imgur.com/Qx8BkHC.jpeg", dataAiHint: "woman smiling", mutualInterests: ["Thermodynamik", "Bachelorarbeit"] },
  { id: 106, name: "Felix Schmidt", studiengang: "Informatik, 2. Sem.", image: "https://i.imgur.com/bJa3doH.jpeg", avatar: "https://i.imgur.com/gqj9hH1.jpeg", dataAiHint: "man coding", mutualInterests: ["Java", "Algorithmen"] },
  { id: 107, name: "Lena Wolf", studiengang: "BWL, 2. Sem.", image: "https://i.imgur.com/MB2XPkM.jpeg", avatar: "https://i.imgur.com/13nuzOy.jpeg", dataAiHint: "woman student", mutualInterests: ["Controlling", "Rechnungswesen"] },
  { id: 108, name: "Sarah Chen", studiengang: "BWL, 3. Sem.", image: "https://i.imgur.com/LLFzmJS.jpeg", avatar: "https://i.imgur.com/NkY3Ovh.jpeg", dataAiHint:"woman international student", mutualInterests: ["Marketing", "Sprachaustausch"] },
];

export default function PartnerFindenPage() {
  const [suggestions, setSuggestions] = useState<SuggestedBuddy[] | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState<SuggestedBuddy | null>(null);
  const { buddies: myBuddies, addBuddy } = useBuddies();
  const { startNewChat } = useChats();
  const router = useRouter();
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);

  // This effect runs to set the initial queue and re-runs if the user's buddies change.
  useEffect(() => {
    // This logic runs on the client where localStorage is available.
    const myBuddyIds = new Set(myBuddies.map(b => parseInt(b.id, 10)));
    let declinedIds = new Set<number>();
    try {
      const storedDeclinedIds = localStorage.getItem('declinedBuddyIds');
      if (storedDeclinedIds) {
        const parsedIds = JSON.parse(storedDeclinedIds);
        if (Array.isArray(parsedIds)) {
          declinedIds = new Set(parsedIds);
        }
      }
    } catch (error) {
      console.error("Error parsing declined IDs from localStorage", error);
      localStorage.removeItem('declinedBuddyIds');
    }
    
    const initialSuggestions = allSuggestedBuddies.filter(
      suggested => !myBuddyIds.has(suggested.id) && !declinedIds.has(suggested.id)
    );
    
    setSuggestions(initialSuggestions);
  }, [myBuddies]);


  const handleAction = useCallback((action: 'like' | 'reject') => {
    if (!suggestions || suggestions.length === 0 || swipeState) return;

    const currentBuddy = suggestions[0];
    setSwipeState(action === 'like' ? 'right' : 'left');

    setTimeout(() => {
      if (action === 'like') {
        addBuddy(currentBuddy);
        startNewChat(currentBuddy);
        setMatchedBuddy(currentBuddy);
        setShowMatchDialog(true);
      } else {
        try {
          const storedDeclinedIds = localStorage.getItem('declinedBuddyIds');
          const declinedIds: number[] = storedDeclinedIds ? JSON.parse(storedDeclinedIds) : [];
          if (!declinedIds.includes(currentBuddy.id)) {
            declinedIds.push(currentBuddy.id);
            localStorage.setItem('declinedBuddyIds', JSON.stringify(declinedIds));
          }
        } catch (error) {
          console.error("Error updating localStorage", error);
        }
      }
      
      // Directly update the queue after the action
      setSuggestions(queue => queue!.slice(1));
      setSwipeState(null);
    }, 300); // Animation duration
  }, [suggestions, swipeState, addBuddy, startNewChat]);

  const closeDialogAndContinue = () => {
    setShowMatchDialog(false);
    setMatchedBuddy(null);
  };

  const handleChat = () => {
    if (!matchedBuddy) return;
    router.push(`/chats/${matchedBuddy.id}`);
    closeDialogAndContinue();
  };
  
  const renderContent = () => {
    if (suggestions === null) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full w-full">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      );
    }

    if (suggestions.length > 0) {
      return (
        <>
          <div className="relative w-full max-w-xs h-[450px] md:h-[500px] mb-8">
            {suggestions.map((buddy, index) => {
              const isTopCard = index === 0;
              return (
                <Card 
                  key={buddy.id} 
                  className={cn(
                    "absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out",
                    isTopCard && swipeState === 'left' && "transform -translate-x-[150%] rotate-[-15deg]",
                    isTopCard && swipeState === 'right' && "transform translate-x-[150%] rotate-[15deg]"
                  )}
                  style={{ 
                    zIndex: suggestions.length - index,
                    transform: `translateY(${Math.min(index, 2) * -8}px) scale(${1 - Math.min(index, 2) * 0.05})`,
                    opacity: index < 3 ? 1 : 0,
                  }}
                >
                  <Image src={buddy.image} alt={buddy.name} fill sizes="320px" className="object-cover" data-ai-hint={buddy.dataAiHint}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold drop-shadow-md">{buddy.name}</h3>
                    <p className="text-sm opacity-90 drop-shadow-sm">{buddy.studiengang}</p>
                    <p className="text-xs mt-2 opacity-80 drop-shadow-sm">Gemeinsame Interessen: {buddy.mutualInterests.join(', ')}</p>
                  </div>
                </Card>
              )
            })}
          </div>
          <div className="flex justify-center space-x-6">
            <Button 
              onClick={() => handleAction('reject')} 
              variant="outline" 
              size="icon" 
              className="rounded-full h-20 w-20 bg-card shadow-lg border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-transform duration-200 hover:scale-110 active:scale-95"
              disabled={!!swipeState}
            >
              <X className="h-10 w-10" />
              <span className="sr-only">Ablehnen</span>
            </Button>
            <Button 
              onClick={() => handleAction('like')} 
              variant="outline" 
              size="icon" 
              className="rounded-full h-20 w-20 bg-card shadow-lg border-2 border-green-500/50 text-green-500 hover:bg-green-500/10 transition-transform duration-200 hover:scale-110 active:scale-95"
              disabled={!!swipeState}
            >
              <Heart className="h-10 w-10" />
              <span className="sr-only">Interesse zeigen</span>
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center h-full bg-card/80 backdrop-blur-sm rounded-2xl w-full max-w-xs p-4 shadow-inner">
        <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle>Keine weiteren Vorschläge</CardTitle>
        <CardDescription className="mt-2">
          Du hast alle aktuellen Vorschläge gesehen.
          <br />
          Schau doch später nochmal vorbei!
        </CardDescription>
      </div>
    );
  };


  return (
    <>
      <div className="flex flex-col items-center py-8 h-full overflow-hidden">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Buddies entdecken</h1>
            <p className="text-muted-foreground">Wische durch Profile oder nutze die Buttons unten.</p>
          </div>
        
          <div className="flex-grow flex flex-col items-center justify-center w-full">
             {renderContent()}
          </div>
      </div>
      <AlertDialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
            <AlertDialogTitle className="text-2xl">Buddy gefunden!</AlertDialogTitle>
            <AlertDialogDescription>
              Super! {matchedBuddy?.name} wurde zu deinen Buddies hinzugefügt. Starte doch gleich ein Gespräch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={closeDialogAndContinue} className="w-full sm:w-auto" variant="outline">Suche weiter</Button>
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
