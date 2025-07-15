
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, CheckCircle, Users, CalendarClock, Info, CheckCheck, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, memo, useEffect } from "react";
import { useBuddies } from "@/contexts/PartnersContext";
import { useCalendar } from "@/contexts/CalendarContext";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import dynamic from "next/dynamic";

const PopoverContent = dynamic(() => import('@/components/ui/popover').then(mod => mod.PopoverContent));


const initialNotifications = [
    { id: 1, title: "Update: Mathe II Lerngruppe", description: "Der Treffpunkt wurde auf Raum E0.04 geändert.", time: "vor 5 Min.", read: false },
    { id: 2, title: "Info: Projektbesprechung SE", description: "Lisa hat neue Dokumente für das Treffen hochgeladen.", time: "vor 1 Std.", read: false },
];

const BuddyItem = memo(function BuddyItem({ buddy }: { buddy: any }) {
  const approvedHosts = ['i.imgur.com', 'placehold.co'];
  const getSafeAvatar = (url?: string) => {
      try {
          if (!url) return 'https://placehold.co/40x40.png';
          const hostname = new URL(url).hostname;
          return approvedHosts.includes(hostname) ? url : 'https://placehold.co/40x40.png';
      } catch (_e) {
          return 'https://placehold.co/40x40.png';
      }
  };
  const safeAvatar = getSafeAvatar(buddy.avatar);
  return (
    <Link href={`/profil/${buddy.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-md transition-shadow h-full bg-background/50">
          <Image src={safeAvatar} alt={buddy.name} width={40} height={40} className="rounded-full" data-ai-hint={buddy.dataAiHint} />
          <div>
            <p className="font-semibold">{buddy.name}</p>
            <p className="text-xs text-muted-foreground">{buddy.course}</p>
          </div>
        </div>
    </Link>
  );
});

const UpcomingSessionItem = memo(function UpcomingSessionItem({ session }: { session: any }) {
  return (
    <li className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
      <div>
        <p className="font-semibold">{session.title}</p>
        <p className="text-sm text-muted-foreground">{session.time} - {session.type}</p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/kalender/${session.id}`}>Details</Link>
      </Button>
    </li>
  );
});


export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isProfileProgressVisible, setProfileProgressVisible] = useState(false);
  const { buddies } = useBuddies();
  const { events } = useCalendar();
  
  const PROFILE_CARD_DISMISSED_KEY = 'profileCardDismissed';

  useEffect(() => {
    // We need to check localStorage only on the client-side after hydration
    const dismissed = localStorage.getItem(PROFILE_CARD_DISMISSED_KEY);
    if (dismissed !== 'true') {
        setProfileProgressVisible(true);
    }
  }, []);

  const dismissProfileCard = () => {
    localStorage.setItem(PROFILE_CARD_DISMISSED_KEY, 'true');
    setProfileProgressVisible(false);
  };

  const upcomingSessions = useMemo(() => {
    if (!currentUser) return [];
    const now = new Date();
    return [...events]
      .filter(event => event.date >= now && event.attendees.includes(currentUser.uid))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 2)
      .map(event => ({
        id: event.id,
        title: event.title,
        time: formatDistanceToNow(event.date, { addSuffix: true, locale: de }),
        type: event.type
      }));
  }, [events, currentUser]);


  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(currentNotifications => 
      currentNotifications.map(n => ({...n, read: true}))
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Willkommen zurück, {currentUser?.displayName || 'Nutzer'}!
          </h1>
          <p className="text-muted-foreground">Dein Lern-Hub für die Hochschule Landshut.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative mt-4 sm:mt-0">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
              <span className="sr-only">Benachrichtigungen</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Benachrichtigungen</h4>
                <p className="text-sm text-muted-foreground">
                  Du hast {unreadCount} ungelesene {unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}.
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs justify-start" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                   Alle als gelesen markieren
                </Button>
              </div>
              <Separator />
               {notifications.length > 0 ? (
                <div className="grid gap-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    >
                      {!notification.read ? (
                         <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-primary" />
                      ) : (
                         <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-transparent border border-muted-foreground" />
                      )}
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                         <p className="text-xs text-muted-foreground/80 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground">Keine neuen Benachrichtigungen.</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area - can be 2/3 and sidebar 1/3 or full width */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-primary" />
                Anstehende Lernsitzungen
              </CardTitle>
              <CardDescription>Verpasse keine wichtigen Termine mehr.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingSessions.map(session => (
                    <UpcomingSessionItem key={session.id} session={session} />
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Keine anstehenden Sitzungen für dich geplant.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Meine Buddies
              </CardTitle>
              <CardDescription>Bleibe mit deinen Connections in Kontakt.</CardDescription>
            </CardHeader>
            <CardContent>
              {buddies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {buddies.map(buddy => (
                    <BuddyItem key={buddy.id} buddy={buddy} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Du hast noch keine Buddies.</p>
              )}
               <Button className="mt-4 w-full md:w-auto" asChild>
                 <Link href="/partner-finden">Neue Buddies finden</Link>
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar area on desktop */}
        <div className="md:col-span-1 space-y-6">
            {isProfileProgressVisible && (
              <Card className="bg-primary text-primary-foreground relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20"
                  onClick={dismissProfileCard}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Schließen</span>
                </Button>
                <CardHeader>
                  <CardTitle>Profil Fortschritt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                    <div>
                      <p className="font-semibold">Dein Profil ist vollständig!</p>
                      <p className="text-sm opacity-90">Sehr gut! Du bist bereit, durchzustarten.</p>
                    </div>
                  </div>
                    <Button variant="secondary" className="mt-4 w-full" asChild>
                      <Link href="/mein-profil">Profil ansehen</Link>
                    </Button>
                </CardContent>
              </Card>
            )}
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center border-dashed">
              <p className="text-sm text-muted-foreground">Hier könnte Ihre Werbung stehen!</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild><Link href="/gruppen/erstellen">Neue Gruppe erstellen</Link></Button>
              <Button variant="outline" className="w-full justify-start" asChild><Link href="/kalender/event-erstellen">Lernsitzung planen</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
