
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageSquare, UserPlus, Settings, CalendarPlus, Trash2, Edit, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// Mock data - replace with actual data fetching
const fetchGroupDetails = async (groupId: string) => {
  console.log("Fetching group details for: ", groupId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  if (groupId === "1") { // Example group
    return {
      id: "1",
      name: "Mathe Profis WS23/24",
      description: "Vorbereitung Analysis & Lineare Algebra für Erstsemester. Wöchentliche Treffen geplant.",
      image: "https://placehold.co/800x300.png",
      dataAiHint: "mathematics chalkboard",
      members: [
        { id: "user1", name: "Max Mustermann", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
        { id: "user2", name: "Lisa Schmidt", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
        { id: "user3", name: "Admin User", avatar: "https://placehold.co/100x100.png", dataAiHint: "person icon" },
      ],
      createdBy: "user3", // Assume current user is admin for demo
      upcomingEvents: [
        { id: "event1", title: "Übungsaufgaben Besprechung", date: "20. Juli, 15:00 Uhr" },
        { id: "event2", title: "Q&A Session vor Klausur", date: "25. Juli, 18:00 Uhr" },
      ]
    };
  }
  return null;
};


export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null); // Replace 'any' with a proper Group type
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock current user ID - replace with actual auth user
  const currentUserId = "user3"; 

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId).then(data => {
        setGroup(data);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to fetch group details", err);
        toast({ title: "Fehler", description: "Gruppe nicht gefunden.", variant: "destructive" });
        setLoading(false);
        // router.push('/gruppen');
      });
    }
  }, [groupId, toast]);

  const handleInviteMember = () => {
    if (!inviteEmail) {
      toast({ title: "E-Mail fehlt", description: "Bitte gib eine E-Mail-Adresse ein.", variant: "destructive" });
      return;
    }
    console.log(`Inviting ${inviteEmail} to group ${group?.name}`);
    toast({ title: "Einladung gesendet", description: `${inviteEmail} wurde zur Gruppe eingeladen (Simulation).` });
    setInviteEmail('');
    // Close dialog if needed, depends on Dialog structure
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!group) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Gruppe nicht gefunden</h1>
        <p className="text-muted-foreground">Diese Lerngruppe existiert nicht oder konnte nicht geladen werden.</p>
        <Button onClick={() => router.push('/gruppen')} className="mt-4">Zurück zu meinen Gruppen</Button>
      </div>
    );
  }
  
  const isAdmin = group.createdBy === currentUserId;


  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden shadow-xl">
        {group.image && (
          <div className="relative h-48 md:h-64 w-full">
            <Image src={group.image} alt={group.name} layout="fill" objectFit="cover" data-ai-hint={group.dataAiHint} />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        <CardHeader className={group.image ? "relative -mt-16 z-10 bg-card/80 backdrop-blur-sm rounded-t-lg p-6" : "p-6"}>
          <CardTitle className={`text-3xl font-bold ${group.image ? 'text-card-foreground' : 'text-foreground'}`}>{group.name}</CardTitle>
          <CardDescription className={`${group.image ? 'text-card-foreground/90' : 'text-muted-foreground'}`}>{group.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button asChild>
              <Link href={`/chats/group-${group.id}`}> {/* Example group chat link */}
                <MessageSquare className="mr-2 h-4 w-4" /> Gruppenchat
              </Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href={`/kalender/event-erstellen?groupId=${group.id}`}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Termin planen
              </Link>
            </Button>
            {isAdmin && (
                 <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Gruppe löschen
                </Button>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" /> Mitglieder ({group.members.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.members.map((member: any) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/10">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{member.name} {member.id === group.createdBy && <span className="text-xs text-primary ml-1">(Admin)</span>}</span>
                </div>
              ))}
            </div>
            {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="mt-4">
                  <UserPlus className="mr-2 h-4 w-4" /> Mitglieder einladen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mitglied einladen</DialogTitle>
                  <DialogDescription>
                    Gib die E-Mail-Adresse des Studenten ein, den du einladen möchtest.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                    <Input 
                      id="invite-email" 
                      type="email" 
                      placeholder="name@stud.haw-landshut.de" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleInviteMember} className="w-full">Einladung senden</Button>
                </div>
              </DialogContent>
            </Dialog>
            )}
          </div>
          
          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5 text-primary" /> Anstehende Termine
            </h3>
            {group.upcomingEvents && group.upcomingEvents.length > 0 ? (
                <ul className="space-y-2">
                    {group.upcomingEvents.map((event:any) => (
                        <li key={event.id} className="p-3 bg-secondary/50 rounded-lg">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                        </li>
                    ))}
                </ul>
            ): (
                <p className="text-muted-foreground">Keine anstehenden Termine für diese Gruppe.</p>
            )}
          </div>

          {isAdmin && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" /> Gruppeneinstellungen
                </h3>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Gruppendetails bearbeiten
                </Button>
                 {/* More settings can go here */}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
