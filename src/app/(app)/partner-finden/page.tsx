
'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, CheckCircle, MessageSquare, Users, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBuddies } from "@/contexts/PartnersContext";
import { useChats } from "@/contexts/ChatsContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import type { AppUser } from "@/lib/types";

const AlertDialogContent = dynamic(() => import('@/components/ui/alert-dialog').then(mod => mod.AlertDialogContent));

export default function PartnerFindenPage() {
  const [suggestions, setSuggestions] = useState<AppUser[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState<AppUser | null>(null);
  const { buddies: likedBuddies, addBuddy, loading: buddiesLoading } = useBuddies();
  const { startNewChat } = useChats();
  const router = useRouter();
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      // Wait for currentUser and for the buddy list to finish loading.
      if (!currentUser || buddiesLoading) return;

      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);
        const allUsers = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));

        const myBuddyIds = new Set(likedBuddies.map(b => b.id));
        
        // Filter out the current user and users who are already buddies.
        const filteredSuggestions = allUsers.filter(
          user => user.uid !== currentUser.uid && !myBuddyIds.has(user.uid)
        );
        
        setSuggestions(filteredSuggestions);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, likedBuddies, buddiesLoading]);


  const handleAction = useCallback(async (action: 'like' | 'reject') => {
    if (suggestions.length === 0 || swipeState) return;

    const currentBuddy = suggestions[0];
    setSwipeState(action === 'like' ? 'right' : 'left');
    
    setTimeout(async () => {
      if (action === 'like') {
        const userDocRef = doc(db, 'users', currentBuddy.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const likedUser = userDoc.data() as AppUser;
            addBuddy(likedUser);
            setMatchedBuddy(likedUser);
            setShowMatchDialog(true);
        }
      } else {
        // Add to rejected list for later
        setRejectedSuggestions(prev => [...prev, currentBuddy]);
      }
      
      // Remove the user from the suggestions list regardless of action
      setSuggestions(queue => queue.slice(1));
      setSwipeState(null);
    }, 300); 
  }, [suggestions, swipeState, addBuddy]);

  const closeDialogAndContinue = () => {
    setShowMatchDialog(false);
    setMatchedBuddy(null);
  };

  const handleShowRejected = () => {
    setSuggestions(rejectedSuggestions);
    setRejectedSuggestions([]);
  };

  const handleChat = async () => {
    if (!matchedBuddy) return;
    const chatId = await startNewChat(matchedBuddy);
    if(chatId) {
        router.push(`/chats/${chatId}`);
    }
    closeDialogAndContinue();
  };
  
  const renderContent = () => {
    if (isLoading || buddiesLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full w-full">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      );
    }

    if (suggestions.length > 0) {
      const buddy = suggestions[0];
      const safePhotoURL = buddy.photoURL && !buddy.photoURL.includes('thispersondoesnotexist.com') 
        ? buddy.photoURL 
        : 'https://i.imgur.com/PKtZX0C.jpeg';

      return (
        <>
          <div className="relative w-full max-w-xs h-[450px] md:h-[500px] mb-8">
                <Card 
                  key={buddy.uid} 
                  className={cn(
                    "absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out",
                    swipeState === 'left' && "transform -translate-x-[150%] rotate-[-15deg]",
                    swipeState === 'right' && "transform translate-x-[150%] rotate-[15deg]"
                  )}
                >
                  <Image src={safePhotoURL} alt={buddy.displayName || "user"} fill sizes="320px" className="object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold drop-shadow-md">{buddy.displayName}</h3>
                    <p className="text-sm opacity-90 drop-shadow-sm">{buddy.studiengang}</p>
                  </div>
                </Card>
          </div>
          <div className="flex justify-center space-x-6">
            <Button 
              onClick={() => handleAction('reject')} 
              variant="outline" 
              size="icon" 
              className="rounded-full h-20 w-20 bg-card shadow-lg border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-transform duration-200 hover:scale-110 active:scale-95"
              disabled={!!swipeState || suggestions.length === 0}
            >
              <X className="h-10 w-10" />
              <span className="sr-only">Ablehnen</span>
            </Button>
            <Button 
              onClick={() => handleAction('like')} 
              variant="outline" 
              size="icon" 
              className="rounded-full h-20 w-20 bg-card shadow-lg border-2 border-green-500/50 text-green-500 hover:bg-green-500/10 transition-transform duration-200 hover:scale-110 active:scale-95"
              disabled={!!swipeState || suggestions.length === 0}
            >
              <Heart className="h-10 w-10" />
              <span className="sr-only">Interesse zeigen</span>
            </Button>
          </div>
        </>
      );
    }
    
    if (rejectedSuggestions.length > 0) {
       return (
        <div className="flex flex-col items-center justify-center text-center h-full bg-card/80 backdrop-blur-sm rounded-2xl w-full max-w-xs p-4 shadow-inner">
          <RefreshCw className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle>Keine neuen Vorschläge</CardTitle>
          <CardDescription className="mt-2 mb-4">
            Möchtest du zuvor abgelehnte Profile erneut sehen?
          </CardDescription>
          <Button onClick={handleShowRejected}>
            Abgelehnte Profile anzeigen
          </Button>
        </div>
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
              Super! {matchedBuddy?.displayName} wurde zu deinen Buddies hinzugefügt. Starte doch gleich ein Gespräch.
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
