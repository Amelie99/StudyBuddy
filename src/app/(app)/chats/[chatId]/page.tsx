'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, CalendarPlus, Phone, Video, Smile, Paperclip, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Mock data - replace with actual data fetching
const fetchChatDetails = async (chatId: string) => {
  console.log("Fetching chat details for: ", chatId);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
  
  const chats: {[key: string]: any} = {
    "1": {
      id: "1",
      name: "Max Mustermann",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man student",
      type: "user",
      messages: [
        { id: "m1", senderId: "user1", text: "Hallo Max, hast du Zeit für die Matheaufgaben?", timestamp: "10:30", self: false },
        { id: "m2", senderId: "currentUser", text: "Hey! Ja, klar. Wann passt es dir?", timestamp: "10:31", self: true },
        { id: "m3", senderId: "user1", text: "Morgen Vormittag?", timestamp: "10:32", self: false },
      ]
    },
    "group-1": {
      id: "group-1",
      name: "Lerngruppe Mathe Profis",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "group icon",
      type: "group",
      membersCount: 5,
      messages: [
        { id: "gm1", senderId: "user2", senderName: "Lisa", text: "Hat jemand die Lösungen für Blatt 3?", timestamp: "Gestern 14:00", self: false },
        { id: "gm2", senderId: "currentUser", text: "Ich schau mal nach.", timestamp: "Gestern 14:05", self: true },
      ]
    }
  };
  return chats[chatId] || null;
};


export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock current user ID
  const currentUserId = "currentUser"; 

  useEffect(() => {
    if (chatId) {
      fetchChatDetails(chatId).then(data => {
        setChatDetails(data);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to fetch chat details", err);
        toast({ title: "Fehler", description: "Chat nicht gefunden.", variant: "destructive" });
        setLoading(false);
      });
    }
  }, [chatId, toast]);

  useEffect(() => {
    // Scroll to bottom when new messages are added or chat loads
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatDetails?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Simulate sending message
    const message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      self: true,
      ...(chatDetails.type === 'group' && { senderName: 'Ich' }) // Add senderName for group chats
    };
    setChatDetails((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
    setNewMessage('');
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!chatDetails) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Chat nicht gefunden</h1>
        <Button onClick={() => router.push('/chats')} className="mt-4">Zurück zu Chats</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--mobile-nav-height,4rem))] md:h-[calc(100vh-var(--header-height,4rem))] bg-card"> {/* Adjust heights */}
      {/* Chat Header */}
      <header className="flex items-center p-3 border-b sticky top-0 bg-card z-10">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={chatDetails.avatar} alt={chatDetails.name} data-ai-hint={chatDetails.dataAiHint} />
          <AvatarFallback>{chatDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{chatDetails.name}</h2>
          {chatDetails.type === 'group' && <p className="text-xs text-muted-foreground">{chatDetails.membersCount} Mitglieder</p>}
          {chatDetails.type === 'user' && <p className="text-xs text-green-500">Online</p>}
        </div>
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button> */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/kalender/event-erstellen?chatId=${chatId}`}>
              <CalendarPlus className="mr-1.5 h-4 w-4" /> Sitzung planen
            </Link>
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
        {chatDetails.messages.map((msg: any) => (
          <div key={msg.id} className={cn("flex mb-3", msg.self ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[70%] p-3 rounded-xl", 
              msg.self ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"
            )}>
              {chatDetails.type === 'group' && !msg.self && <p className="text-xs font-semibold mb-0.5 text-primary/80">{msg.senderName || "Unbekannt"}</p>}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs mt-1 opacity-70 text-right">{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Message Input Area */}
      <footer className="p-3 border-t sticky bottom-0 bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon"><Smile className="h-5 w-5 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-muted-foreground" /></Button>
          <Input 
            placeholder="Nachricht schreiben..." 
            className="flex-1" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Senden</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
