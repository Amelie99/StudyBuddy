'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, MessageSquare, User, Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const myPartners = [
  { id: "1", name: "Lisa Schmidt", course: "Soziale Arbeit", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
  { id: "2", name: "David Meier", course: "Master Elektrotechnik", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
  { id: "3", name: "Sarah Chen", course: "Betriebswirtschaft (BWL)", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman smiling" },
];

const myGroups = [
  { id: "1", name: " Mathe Profis WS23/24", description: "Vorbereitung Analysis & Lineare Algebra", members: 5, image: "https://placehold.co/600x400.png", dataAiHint:"mathematics study-group" },
  { id: "2", name: "SE Projekt 'LernApp'", description: "Entwicklungsteam für die Software Engineering App", members: 3, image: "https://placehold.co/600x400.png", dataAiHint:"software development" },
  { id: "3", name: "BWL Erstis HAWL", description: "Allgemeine Lerngruppe für BWL Grundlagen", members: 12, image: "https://placehold.co/600x400.png", dataAiHint:"business students" },
];

export default function PartnerAndGroupsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Partner & Gruppen</h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/partner-finden">
                    <Search className="mr-2 h-5 w-5" /> Partner finden
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
        {/* Lernpartner Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Meine Lernpartner</h2>
          <div className="space-y-4">
            {myPartners.length > 0 ? (
              myPartners.map(partner => (
                <Link href={`/profil/${partner.id}`} key={partner.id} className="block group">
                  <Card className="hover:shadow-lg hover:border-primary/50 transition-all group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
                    <CardContent className="flex items-center space-x-4 p-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={partner.avatar} alt={partner.name} data-ai-hint={partner.dataAiHint} />
                        <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.course}</p>
                      </div>
                       <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/chats/${partner.id}`}> 
                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                          </Link>
                        </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="text-center py-12 border-dashed">
                <CardHeader>
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle>Keine Partner</CardTitle>
                  <CardDescription>Finde neue Lernpartner, um loszulegen.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/partner-finden">
                      <Search className="mr-2 h-4 w-4" /> Partner finden
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
                 <Link href={`/gruppen/${group.id}`} key={group.id} className="block group">
                    <Card className="hover:shadow-lg hover:border-primary/50 transition-all group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
                        <CardContent className="flex items-center space-x-4 p-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={group.image} alt={group.name} data-ai-hint={group.dataAiHint}/>
                                <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{group.name}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{group.members} Mitglieder</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <Link href={`/chats/group-${group.id}`}> 
                                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
              ))
            ) : (
              <Card className="text-center py-12 border-dashed">
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
          </div>
        </div>
      </div>
    </div>
  );
}
