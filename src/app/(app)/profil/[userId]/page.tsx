
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions } from '@/lib/constants';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';

const fetchUserDetails = async (userId: string): Promise<AppUser | null> => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data() as AppUser;
  }
  return null;
}

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<AppUser | null>(null);
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
                        <AvatarImage src={profilePicUrl} alt={user.displayName || ''} data-ai-hint="person portrait" sizes="128px" />
                        <AvatarFallback className="text-4xl">
                            {user.displayName ? user.displayName.substring(0,2).toUpperCase() : '??'}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-bold">{user.displayName}</CardTitle>
                    <CardDescription>{user.studiengang} - {user.semester ? `${user.semester}. Semester` : ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex justify-center gap-2">
                        <Button asChild>
                            <Link href={`/chats/${user.uid}`}>
                               <MessageSquare className="mr-2 h-4 w-4" /> Nachricht senden
                            </Link>
                        </Button>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Über Mich</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{user.bio || 'Keine Beschreibung vorhanden.'}</p>
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
                        <p className="text-muted-foreground">{user.kurse?.join(', ') || 'Keine Kurse angegeben.'}</p>
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
