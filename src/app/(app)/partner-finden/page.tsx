
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Heart, Search, SlidersHorizontal, X, CheckCircle, MessageSquare } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBuddies, type SuggestedBuddy } from "@/contexts/PartnersContext";
import Link from "next/link";

// Mock data for swipe cards
const initialBuddies: SuggestedBuddy[] = [
  { id: 1, name: "Anna Kurz", studiengang: "Informatik, 3. Sem.", image: "https://placehold.co/300x400.png", dataAiHint:"woman programmer", mutualInterests: ["Web-Entwicklung", "Python"] },
  { id: 2, name: "Markus Lang", studiengang: "BWL, 5. Sem.", image: "https://placehold.co/300x400.png", dataAiHint: "man business", mutualInterests: ["Marketing", "Statistik"] },
  { id: 3, name: "Julia Klein", studiengang: "Soziale Arbeit, 1. Sem.", image: "https://placehold.co/300x400.png", dataAiHint:"woman social", mutualInterests: ["Grundlagen Psychologie"] },
];

export default function PartnerFindenPage() {
  const [buddies, setBuddies] = useState(initialBuddies);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState<SuggestedBuddy | null>(null);
  const { addBuddy } = useBuddies();
  const router = useRouter();

  const advanceQueueAndClose = () => {
    setShowMatchDialog(false);
    // Use a timeout to allow the dialog to close before the card disappears
    setTimeout(() => {
        setBuddies(currentBuddies => currentBuddies.slice(1));
        setMatchedBuddy(null);
    }, 150);
  };

  const handleInterest = () => {
    if (buddies.length === 0) return;
    const currentBuddy = buddies[0];
    addBuddy(currentBuddy); // Automatically add buddy to the user's list
    setMatchedBuddy(currentBuddy);
    setShowMatchDialog(true);
  };
  
  const handleReject = () => {
     if (buddies.length === 0) return;
     setBuddies(currentBuddies => currentBuddies.slice(1));
  }

  const handleChat = () => {
    if (!matchedBuddy) return;
    router.push(`/chats/${matchedBuddy.id}`);
    advanceQueueAndClose();
  };

  return (
    <>
      <div className="h-full flex flex-col justify-center items-center py-8">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Buddies finden</h1>
          <Tabs defaultValue="vorschlaege" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="vorschlaege">Vorschläge</TabsTrigger>
              <TabsTrigger value="suche">Suche & Filter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vorschlaege">
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="text-center">
                  <CardTitle>Buddies entdecken</CardTitle>
                  <CardDescription>Wische durch Profile oder nutze die Buttons.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {buddies.length > 0 ? (
                    <div className="relative w-full max-w-xs h-[450px] md:h-[500px]">
                      {buddies.map((buddy, index) => (
                        <Card 
                          key={buddy.id} 
                          className="absolute w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out"
                          style={{ 
                            zIndex: buddies.length - index,
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
                    <div className="flex flex-col items-center justify-center text-center h-[450px] md:h-[500px] bg-secondary rounded-xl w-full max-w-xs">
                        <CardTitle>Keine weiteren Vorschläge</CardTitle>
                        <CardDescription className="mt-2">Du hast alle aktuellen Vorschläge gesehen. <br/> Probiere die gezielte Suche!</CardDescription>
                        <Button className="mt-4" onClick={() => setBuddies(initialBuddies)}>Nochmal anzeigen</Button>
                    </div>
                  )}
                  {buddies.length > 0 && (
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
            </TabsContent>

            <TabsContent value="suche">
              <Card>
                <CardHeader>
                  <CardTitle>Gezielte Suche</CardTitle>
                  <CardDescription>Finde Buddies nach deinen Kriterien.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-2">
                    <Input placeholder="Suche nach Name, Kurs..." className="flex-grow" />
                    <Button>
                      <Search className="mr-2 h-4 w-4" /> Suchen
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary"/> Filteroptionen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="studiengang">Studiengang</Label>
                        <Select>
                          <SelectTrigger id="studiengang">
                            <SelectValue placeholder="Studiengang wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="informatik">Informatik</SelectItem>
                            <SelectItem value="bwl">BWL</SelectItem>
                            <SelectItem value="sozialearbeit">Soziale Arbeit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="semester">Semester</Label>
                        <Select>
                          <SelectTrigger id="semester">
                            <SelectValue placeholder="Semester wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>{s}. Semester</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Lerninteressen</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Klausurvorbereitung', 'Hausaufgaben', 'Projekte', 'Sprachaustausch'].map(interesse => (
                        <div key={interesse} className="flex items-center space-x-2">
                          <Checkbox id={`interesse-${interesse}`} />
                          <Label htmlFor={`interesse-${interesse}`} className="font-normal">{interesse}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Verfügbarkeit</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Wochentags', 'Wochenende', 'Abends'].map(zeit => (
                        <div key={zeit} className="flex items-center space-x-2">
                          <Checkbox id={`zeit-${zeit}`} />
                          <Label htmlFor={`zeit-${zeit}`} className="font-normal">{zeit}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full md:w-auto ml-auto">Filter anwenden</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
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
