'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, CheckCircle, Users, CalendarClock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data
const upcomingSessions = [
  { id: 1, title: "Mathe II Lerngruppe", time: "Morgen, 10:00 Uhr", type: "Gruppe" },
  { id: 2, title: "Projektbesprechung SE", time: "25. Dez, 14:30 Uhr", type: "Einzel" },
];

const learningPartners = [
  { id: 1, name: "Lisa Schmidt", course: "Soziale Arbeit", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
  { id: 2, name: "David Meier", course: "Master Elektrotechnik", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
];


export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Willkommen zurück, {currentUser?.displayName || 'Nutzer'}!
          </h1>
          <p className="text-muted-foreground">Dein Lern-Hub für die Hochschule Landshut.</p>
        </div>
        <Button variant="ghost" size="icon" className="relative mt-4 sm:mt-0">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="sr-only">Benachrichtigungen</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area - can be 2/3 and sidebar 1/3 or full width */}
        <div className="md:col-span-2 space-y-6">
          <Card>
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
                    <li key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">{session.time} - {session.type}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/kalender">Details</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Keine anstehenden Sitzungen.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Meine Lernpartner
              </CardTitle>
              <CardDescription>Bleibe mit deinen Connections in Kontakt.</CardDescription>
            </CardHeader>
            <CardContent>
              {learningPartners.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {learningPartners.map(partner => (
                    <div key={partner.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <Image src={partner.avatar} alt={partner.name} width={40} height={40} className="rounded-full" data-ai-hint={partner.dataAiHint} />
                      <div>
                        <p className="font-semibold">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.course}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Du hast noch keine Lernpartner.</p>
              )}
               <Button className="mt-4 w-full md:w-auto" asChild>
                 <Link href="/partner-finden">Neue Partner finden</Link>
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar area on desktop */}
        <div className="md:col-span-1 space-y-6">
           <Card className="bg-primary text-primary-foreground">
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
          <Card>
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
