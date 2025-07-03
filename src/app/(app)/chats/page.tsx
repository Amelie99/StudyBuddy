'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChats } from "@/contexts/ChatsContext";

export default function ChatsPage() {
  const { conversations } = useChats();

  return (
    <div className="container mx-auto h-[calc(100vh-var(--header-height,8rem))] flex flex-col py-8"> {/* Adjust header height if you have a fixed one */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Chats</h1>
        <Button variant="outline">
          <MessageSquarePlus className="mr-2 h-5 w-5" /> Neuer Chat
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Chats durchsuchen..." className="pl-10" />
      </div>

      {conversations.length > 0 ? (
      <ScrollArea className="flex-grow rounded-md border bg-card">
        <div className="p-2 space-y-1">
          {conversations.map(chat => (
            <Link href={`/chats/${chat.id}`} key={chat.id} className="block hover:bg-accent/50 rounded-lg transition-colors">
              <div className="flex items-center p-3 space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.dataAiHint} />
                  <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      ) : (
        <Card className="flex-grow flex flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
              <MessageSquarePlus className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle>Keine Chats vorhanden</CardTitle>
              <CardDescription>Starte eine neue Konversation oder finde Buddies.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button>Neuen Chat starten</Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
