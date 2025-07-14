
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, MessageSquare, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions } from '@/lib/constants';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';
import { useBuddies } from '@/contexts/PartnersContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const fetchUserDetails = async (userId: string): Promise<AppUser | null> => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { ...userDoc.data(), uid: userDoc.id } as AppUser;
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
    const { buddies, removeBuddy } = useBuddies();

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
    
    const isBuddy = useMemo(() => buddies.some(b => b.id === userId), [buddies, userId]);

    const handleRemoveBuddy = async () => {
        try {
            await removeBuddy(userId);
            toast({
                title: 'Buddy entfernt',
                description: `${user?.displayName} ist nicht mehr dein Buddy.`
            });
            // Optionally, you can navigate away or just update the UI
            // For now, the button will just disappear as `isBuddy` becomes false.
        } catch (error) {
            console.error('Failed to remove buddy', error);
            toast({
                title: 'Fehler',
                description: 'Konnte Buddy nicht entfernen.',
                variant: 'destructive'
            });
        }
    }

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

    const profilePicUrl = user.photoURL && user.photoURL.startsWith('http') ? user.photoURL : 'https://i.imgur.com/8bFhU43.jpeg';

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
                        {isBuddy && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" >
                                        <UserX className="mr-2 h-4 w-4" /> Buddy entfernen
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Möchtest du {user.displayName} wirklich als Buddy entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRemoveBuddy}>
                                            Entfernen
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
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
