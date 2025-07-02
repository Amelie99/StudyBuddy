
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions } from '@/lib/constants';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Mock data fetching for a user
const fetchUserDetails = async (userId: string) => {
  // In a real app, fetch from Firestore
  console.log("Fetching user details for:", userId);
  await new Promise(resolve => setTimeout(resolve, 300));

  const users: {[key: string]: any} = {
    "1": {
      id: "1",
      fullName: "Lisa Schmidt",
      studiengang: "Soziale Arbeit",
      semester: "2",
      photoURL: "https://placehold.co/128x128.png",
      dataAiHint: "woman student",
      ueberMich: "Neu an der HAWL und suche Anschluss! Brauche Hilfe bei den Grundlagen in 'Wissenschaftliches Arbeiten' und würde gerne Lerngruppen für die ersten Semester gründen.",
      lerninteressen: ["hausaufgabenhilfe", "lerngruppefinden"],
      lernstil: "diskussion",
      kurse: "Einführung in die Soziale Arbeit, Wissenschaftliches Arbeiten",
      verfuegbarkeit: ["wochentags", "flexibel"],
      badges: [
          { id: 1, name: "Gründergeist", image: "https://placehold.co/80x80.png", dataAiHint:"shield award" },
      ]
    },
    "2": {
      id: "2",
      fullName: "David Meier",
      studiengang: "Master Elektrotechnik",
      semester: "3",
      photoURL: "https://placehold.co/128x128.png",
      dataAiHint: "man student",
      ueberMich: "Fokussiert auf meine Masterarbeit. Suche einen Sparringspartner für wöchentliche Fortschritts-Checks und zur Diskussion von Fachartikeln.",
      lerninteressen: ["tiefverstaendnis", "projektarbeit"],
      lernstil: "visuell",
      kurse: "Regelungstechnik II, Simulationstechnik",
      verfuegbarkeit: ["abends"],
      badges: [
           { id: 2, name: "Feedback-Champion", image: "https://placehold.co/80x80.png", dataAiHint:"star badge" },
           { id: 3, name: "Teamplayer", image: "https://placehold.co/80x80.png", dataAiHint:"team award" },
      ]
    },
  };
  return users[userId] || null;
}

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId).then(data => {
                setUser(data);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to fetch user details", err);
                toast({ title: "Fehler", description: "Benutzerprofil nicht gefunden.", variant: "destructive" });
                setLoading(false);
            });
        }
    }, [userId, toast]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Benutzer nicht gefunden</h1>
                <p className="text-muted-foreground">Dieses Profil existiert nicht oder konnte nicht geladen werden.</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">Zurück zum Dashboard</Button>
            </div>
        );
    }

    const profilePicUrl = user.photoURL || `https://placehold.co/128x128.png`;

    return (
        <div className="container mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
            </Button>
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="text-center">
                    <Avatar className="w-32 h-32 border-4 border-primary shadow-lg mx-auto mb-4">
                        <AvatarImage src={profilePicUrl} alt={user.fullName} data-ai-hint={user.dataAiHint} />
                        <AvatarFallback className="text-4xl">
                            {user.fullName ? user.fullName.substring(0,2).toUpperCase() : '??'}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-bold">{user.fullName}</CardTitle>
                    <CardDescription>{user.studiengang} - {user.semester ? `${user.semester}. Semester` : ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex justify-center gap-2">
                        <Button><MessageSquare className="mr-2 h-4 w-4" /> Nachricht senden</Button>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Über Mich</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{user.ueberMich || 'Keine Beschreibung vorhanden.'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Lerninteressen</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.lerninteressen?.map((interesse: string) => <Badge key={interesse}>{lerninteressenOptions.find(o=>o.id === interesse)?.label || interesse}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Lernstil</h3>
                        <p className="text-muted-foreground">{lernstilOptions.find(o=>o.id === user.lernstil)?.label || user.lernstil || 'Kein Lernstil angegeben.'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Kurse/Module</h3>
                        <p className="text-muted-foreground">{user.kurse || 'Keine Kurse angegeben.'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Verfügbarkeit</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.verfuegbarkeit?.map((zeit: string) => <Badge variant="secondary" key={zeit}>{verfuegbarkeitOptions.find(o=>o.id === zeit)?.label || zeit}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
