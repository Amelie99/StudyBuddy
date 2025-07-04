
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data, in a real app this would be fetched from a database
const fetchSessionDetails = async (sessionId: string) => {
    console.log("Fetching session details for: ", sessionId);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const sessionDetails: {[key: string]: any} = {
        "1": {
            id: "1",
            title: "Mathe II Lerngruppe",
            date: "15. Juli 2024",
            time: "10:00 - 11:30 Uhr",
            location: "Raum E0.04",
            type: "Gruppe",
            description: "Wir besprechen die Übungsaufgaben von Blatt 5 und bereiten uns auf die kommende Vorlesung vor. Bitte bringt das Skript und eure Fragen mit.",
            organizer: { name: "Max Mustermann", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
            attendees: [
                { id: "user1", name: "Lisa Schmidt", avatar: "https://i.imgur.com/PKtZX0C.jpeg", dataAiHint: "woman student" },
                { id: "user2", name: "Sarah Chen", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman smiling" },
                { id: "user3", name: "Du", avatar: "https://placehold.co/100x100.png", dataAiHint: "person icon" },
            ]
        },
        "2": {
            id: "2",
            title: "Projektbesprechung SE",
            date: "25. Dezember 2024",
            time: "14:30 - 15:30 Uhr",
            location: "Online - Zoom (Link im Chat)",
            type: "Einzel",
            description: "Finale Abstimmung der Meilensteine für den Prototypen. Agenda: 1. Review letzter Sprint, 2. Planung nächster Sprint, 3. Offene Punkte.",
            organizer: { name: "David Meier", avatar: "https://i.imgur.com/ZiKvLxU.jpeg", dataAiHint: "man portrait" },
            attendees: [
                { id: "user4", name: "Du", avatar: "https://placehold.co/100x100.png", dataAiHint: "person icon" },
            ]
        }
    };
    return sessionDetails[sessionId] || null;
};

export default function SessionDetailPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            fetchSessionDetails(sessionId).then(data => {
                setSession(data);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to fetch session details", err);
                toast({ title: "Fehler", description: "Termin nicht gefunden.", variant: "destructive" });
                setLoading(false);
            });
        }
    }, [sessionId, toast]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!session) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Termin nicht gefunden</h1>
                <p className="text-muted-foreground">Dieser Termin existiert nicht oder konnte nicht geladen werden.</p>
                <Button onClick={() => router.push('/kalender')} className="mt-4">Zurück zum Kalender</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
            </Button>
            <Card className="max-w-3xl mx-auto shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{session.title}</CardTitle>
                    <CardDescription>Details zur Lernsitzung</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-md">
                        <div className="flex items-center">
                            <Calendar className="mr-3 h-5 w-5 text-primary" />
                            <span>{session.date}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-3 h-5 w-5 text-primary" />
                            <span>{session.time}</span>
                        </div>
                        <div className="flex items-center col-span-1 md:col-span-2">
                            <MapPin className="mr-3 h-5 w-5 text-primary" />
                            <span>{session.location}</span>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> Beschreibung</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{session.description}</p>
                    </div>

                    <Separator />

                    <div>
                         <h3 className="font-semibold text-lg mb-3 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Teilnehmer ({session.attendees.length})</h3>
                         <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                                <Avatar>
                                    <AvatarImage src={session.organizer.avatar} alt={session.organizer.name} data-ai-hint={session.organizer.dataAiHint} />
                                    <AvatarFallback>{session.organizer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{session.organizer.name} <span className="text-xs text-primary">(Organisator)</span></span>
                            </div>
                            {session.attendees.map((attendee: any) => (
                                <div key={attendee.id} className="flex items-center space-x-3 text-sm">
                                    <Avatar>
                                        <AvatarImage src={attendee.avatar} alt={attendee.name} data-ai-hint={attendee.dataAiHint} />
                                        <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span>{attendee.name}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
