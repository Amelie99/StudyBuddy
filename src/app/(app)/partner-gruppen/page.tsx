
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, MessageSquare, User, Search, Wand2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGroups, type Group } from "@/contexts/GroupsContext";
import { useBuddies, type Buddy } from "@/contexts/PartnersContext";
import { useChats } from "@/contexts/ChatsContext";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { Loader2 } from "lucide-react";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { AppUser } from "@/lib/types";
import { suggestGroups, SuggestGroupsOutput } from "@/ai/flows/suggest-groups-flow";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const approvedHosts = ['i.imgur.com', 'placehold.co'];
const getSafeAvatar = (url?: string) => {
    try {
        if (!url) return 'https://i.imgur.com/8bFhU43.jpeg';
        const hostname = new URL(url).hostname;
        return approvedHosts.includes(hostname) ? url : 'https://i.imgur.com/8bFhU43.jpeg';
    } catch (_e) {
        return 'https://i.imgur.com/8bFhU43.jpeg';
    }
};

const BuddyCard = memo(function BuddyCard({ buddy }: { buddy: Buddy }) {
  const { startNewChat } = useChats();
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const safeAvatar = getSafeAvatar(buddy.avatar);

  const handleStartChat = async () => {
    setIsCreatingChat(true);
    try {
        const userDocRef = doc(db, 'users', buddy.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const appUser = { ...userDoc.data(), uid: userDoc.id } as AppUser;
            const chatId = await startNewChat(appUser);
            if (chatId) {
                router.push(`/chats/${chatId}`);
            }
        } else {
             throw new Error("User document not found");
        }
    } catch (error) {
        console.error("Failed to start chat", error);
        // Optionally, show a toast notification to the user
    } finally {
        setIsCreatingChat(false);
    }
  };

  return (
    <Card className="hover:shadow-lg hover:border-primary/50 transition-all bg-card/80 backdrop-blur-sm">
      <CardContent className="flex items-center justify-between space-x-4 p-4">
        <Link href={`/profil/${buddy.id}`} className="flex items-center space-x-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-14 w-14">
            <AvatarImage src={safeAvatar} alt={buddy.name} sizes="56px" />
            <AvatarFallback>{buddy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{buddy.name}</p>
            <p className="text-sm text-muted-foreground">{buddy.course}</p>
          </div>
        </Link>
         <Button variant="outline" size="sm" onClick={handleStartChat} disabled={isCreatingChat}>
            {isCreatingChat ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
            )}
            Chat
          </Button>
      </CardContent>
    </Card>
  );
});

const GroupCard = memo(function GroupCard({ group }: { group: Group }) {
  const safeImage = getSafeAvatar(group.image);
  return (
    <Card className="hover:shadow-lg hover:border-primary/50 transition-all bg-card/80 backdrop-blur-sm">
      <CardContent className="flex items-center justify-between space-x-4 p-4">
          <Link href={`/gruppen/${group.id}`} className="flex items-center space-x-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-14 w-14">
                  <AvatarImage src={safeImage} alt={group.name} data-ai-hint={group.dataAiHint} sizes="56px"/>
                  <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                  <p className="font-semibold text-lg">{group.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{group.members} Mitglieder</span>
                  </div>
              </div>
          </Link>
          <Button variant="outline" size="sm" asChild>
              <Link href={`/chats/group-${group.id}`}> 
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </Link>
          </Button>
      </CardContent>
    </Card>
  );
});

const SuggestedGroupCard = memo(function SuggestedGroupCard({
  suggestion,
  onCreate,
}: {
  suggestion: { name: string; description: string };
  onCreate: (name: string, description: string) => void;
}) {
  return (
    <Card className="bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">{suggestion.name}</CardTitle>
        <CardDescription>{suggestion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onCreate(suggestion.name, suggestion.description)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Gruppe erstellen
        </Button>
      </CardContent>
    </Card>
  );
});

export default function PartnerAndGroupsPage() {
  const { groups: myGroups, addGroup } = useGroups();
  const { buddies: myBuddies } = useBuddies();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestGroupsOutput['suggestions']>([]);

  const handleGenerateSuggestions = async () => {
    if (!currentUser) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const result = await suggestGroups(currentUser);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Failed to generate group suggestions:', error);
      toast({
        title: 'Fehler',
        description: 'Gruppenvorschläge konnten nicht generiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateGroupFromSuggestion = (name: string, description: string) => {
    addGroup({ name, description });
    toast({
      title: 'Gruppe erstellt!',
      description: `Die Gruppe "${name}" wurde erfolgreich erstellt.`,
    });
    router.push('/gruppen');
    setSuggestions([]); // Clear suggestions after creating one
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Buddies & Gruppen</h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/partner-finden">
                    <Search className="mr-2 h-5 w-5" /> Buddies finden
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/gruppen/erstellen">
                    <PlusCircle className="mr-2 h-5 w-5" /> Gruppe erstellen
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Buddy Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Meine Buddies</h2>
          <div className="space-y-4">
            {myBuddies.length > 0 ? (
              myBuddies.map(buddy => (
                <BuddyCard key={buddy.id} buddy={buddy} />
              ))
            ) : (
              <Card className="text-center py-12 border-dashed bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle>Keine Buddies</CardTitle>
                  <CardDescription>Finde neue Buddies, um loszulegen.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/partner-finden">
                      <Search className="mr-2 h-4 w-4" /> Buddies finden
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Lerngruppen Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center"><Users className="mr-3 h-6 w-6 text-primary"/>Meine Lerngruppen</h2>
          <div className="space-y-4">
            {myGroups.length > 0 ? (
              myGroups.map(group => (
                 <GroupCard key={group.id} group={group} />
              ))
            ) : (
              <Card className="text-center py-12 border-dashed bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle>Keine Gruppen</CardTitle>
                  <CardDescription>Erstelle eine Gruppe oder trete einer bei.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/gruppen/erstellen">
                      <PlusCircle className="mr-2 h-4 w-4" /> Erste Gruppe erstellen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="pt-4">
                {isGenerating && (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Generiere Vorschläge...</span>
                    </div>
                )}
                {suggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">KI-basierte Gruppenvorschläge</h3>
                    {suggestions.map((suggestion, index) => (
                      <SuggestedGroupCard
                        key={index}
                        suggestion={suggestion}
                        onCreate={handleCreateGroupFromSuggestion}
                      />
                    ))}
                  </div>
                )}
                 <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleGenerateSuggestions}
                    disabled={isGenerating}
                >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Gruppenvorschläge generieren
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
