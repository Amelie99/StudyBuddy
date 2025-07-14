
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageSquare, UserPlus, Settings, CalendarPlus, Trash2, Edit, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import { useGroups, type Group } from '@/contexts/GroupsContext';

const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent));

// Mock user and event data - in a real app, this would be fetched
const mockMembers = [
    { id: "user1", name: "Max Mustermann", avatar: "https://i.imgur.com/D267ZyT.jpeg", dataAiHint: "man student" },
    { id: "user2", name: "Lisa Schmidt", avatar: "https://i.imgur.com/PKtZX0C.jpeg", dataAiHint: "woman student" },
    { id: "user3", name: "Admin User", avatar: "https://i.imgur.com/t05wynC.jpeg", dataAiHint: "person icon" },
];

const mockEvents = [
    { id: "event1", title: "Übungsaufgaben Besprechung", date: "20. Juli, 15:00 Uhr" },
    { id: "event2", title: "Q&A Session vor Klausur", date: "25. Juli, 18:00 Uhr" },
];

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

const GroupMemberItem = memo(function GroupMemberItem({ member, isAdmin }: { member: any, isAdmin: boolean }) {
    const safeAvatar = getSafeAvatar(member.avatar);
    return (
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/10">
            <Avatar>
                <AvatarImage src={safeAvatar} alt={member.name} data-ai-hint={member.dataAiHint} sizes="48px" />
                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{member.name} {isAdmin && <span className="text-xs text-primary ml-1">(Admin)</span>}</span>
        </div>
    );
});

const UpcomingGroupEventItem = memo(function UpcomingGroupEventItem({ event }: { event: any }) {
    return (
        <li className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.date}</p>
        </li>
    );
});


export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { groups } = useGroups();
  const [group, setGroup] = useState<Group | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock current user ID - replace with actual auth user
  const currentUserId = "user3"; 

  useEffect(() => {
    setLoading(true);
    if (groupId && groups.length > 0) {
      const foundGroup = groups.find(g => g.id === groupId);
      setGroup(foundGroup);
    }
    setLoading(false);
  }, [groupId, groups]);

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
  
  if (loading || group === undefined) {
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
  
  const isAdmin = true; // For now, assume user is admin of any group they view
  const groupMembers = mockMembers.slice(0, group.members);
  const upcomingEvents = mockEvents;


  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden shadow-xl">
        {group.image && (
          <div className="relative h-48 md:h-64 w-full">
            <Image src={group.image} alt={group.name} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" data-ai-hint={group.dataAiHint} />
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
              <Users className="mr-2 h-5 w-5 text-primary" /> Mitglieder ({groupMembers.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groupMembers.map((member: any) => (
                <GroupMemberItem key={member.id} member={member} isAdmin={member.id === currentUserId} />
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
            {upcomingEvents && upcomingEvents.length > 0 ? (
                <ul className="space-y-2">
                    {upcomingEvents.map((event:any) => (
                        <UpcomingGroupEventItem key={event.id} event={event} />
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

    
