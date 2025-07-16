
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChats, type Conversation } from "@/contexts/ChatsContext";
import Image from "next/image";
import React, { memo, useState, useMemo } from "react";
import { cn, getSafeAvatar } from "@/lib/utils";


const Highlight = memo(function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-primary font-bold">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});


const ConversationItem = memo(function ConversationItem({ chat, searchTerm }: { chat: Conversation; searchTerm:string }) {
  const { match, name, avatar, id, timestamp, unread, lastMessage } = chat;

  const displayMessage = match?.type === 'message' ? match.text : lastMessage;
  const highlightTerm = match?.type === 'message' ? searchTerm : '';
  const safeAvatarUrl = getSafeAvatar(avatar, name);


  return (
    <Link href={`/chats/${id}`} className="block hover:bg-accent/50 rounded-lg transition-colors">
      <div className="flex items-center p-3 space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={safeAvatarUrl} alt={name} />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate">
              <Highlight text={name} highlight={searchTerm} />
            </p>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <div className="flex justify-between items-center">
            <p className={cn("text-sm truncate", match?.type === 'message' ? "text-foreground" : "text-muted-foreground")}>
              <Highlight text={displayMessage} highlight={highlightTerm} />
            </p>
            {unread > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});


export default function ChatsPage() {
  const { conversations } = useChats();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) {
      return conversations;
    }
    return conversations.map(conversation => {
      const nameMatch = conversation.name.toLowerCase().includes(lowerCaseSearchTerm);

      if (nameMatch) {
          return { ...conversation, match: { type: 'name', text: conversation.name } };
      }

      const matchingMessage = conversation.messages?.find(message =>
          message.text.toLowerCase().includes(lowerCaseSearchTerm)
      );

      if (matchingMessage) {
          return { ...conversation, match: { type: 'message', text: matchingMessage.text } };
      }
      
      const lastMessageMatch = conversation.lastMessage?.toLowerCase().includes(lowerCaseSearchTerm);
       if (lastMessageMatch) {
           return { ...conversation, match: { type: 'message', text: conversation.lastMessage } };
       }

      return null;
    }).filter((c): c is (Conversation & { match: { type: "name" | "message"; text: string; } }) => c !== null);

  }, [conversations, searchTerm]);

  return (
    <div className="container mx-auto h-[calc(100vh-var(--header-height,8rem))] flex flex-col py-8"> {/* Adjust header height if you have a fixed one */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Chats</h1>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Chats durchsuchen..." 
          className="pl-10" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredConversations.length > 0 ? (
      <ScrollArea className="flex-grow rounded-md border bg-card/80 backdrop-blur-sm">
        <div className="p-2 space-y-1">
          {filteredConversations.map(chat => (
            <ConversationItem key={chat.id} chat={chat} searchTerm={searchTerm} />
          ))}
        </div>
      </ScrollArea>
      ) : (
        <Card className="flex-grow flex flex-col items-center justify-center text-center border-dashed bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <MessageSquarePlus className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle>{conversations.length > 0 ? "Keine Chats gefunden" : "Starte eine neue Konversation"}</CardTitle>
              <CardDescription>
                {searchTerm ? "Deine Suche ergab keine Treffer. Versuche es mit einem anderen Suchbegriff." : "Du hast noch keine aktiven Chats. Finde Buddies, um ein Gespräch zu beginnen."}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                  <Link href="/partner-finden">
                    <Search className="mr-2 h-4 w-4" /> Buddies finden
                  </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
