
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, MessageSquare, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useGroups, type Group } from "@/contexts/GroupsContext";
import { memo } from "react";

const GroupCard = memo(function GroupCard({ group }: { group: Group }) {
  return (
    <Card key={group.id} className="flex flex-col">
      <CardHeader>
        {group.image && (
          <div className="relative h-40 w-full mb-4 rounded-t-lg overflow-hidden">
            <Image 
              src={group.image} 
              alt={group.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover" 
              data-ai-hint={group.dataAiHint} />
          </div>
        )}
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{group.members} Mitglieder</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/chats/group-${group.id}`}> 
            <MessageSquare className="mr-2 h-4 w-4" /> Chat
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link href={`/gruppen/${group.id}`}>
            <Settings className="mr-2 h-4 w-4" /> Verwalten
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});


export default function GruppenPage() {
  const { groups: myGroups } = useGroups();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Meine Lerngruppen</h1>
        <Button asChild>
          <Link href="/gruppen/erstellen">
            <PlusCircle className="mr-2 h-5 w-5" /> Gruppe erstellen
          </Link>
        </Button>
      </div>

      {myGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Keine Gruppen gefunden</CardTitle>
            <CardDescription>Du bist noch keiner Lerngruppe beigetreten oder hast eine erstellt.</CardDescription>
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
  );
}
