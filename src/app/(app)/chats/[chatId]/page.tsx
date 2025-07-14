
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, CalendarPlus, Smile, Paperclip, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogTrigger, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChats } from '@/contexts/ChatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatDetail, Message } from '@/lib/types';
import dynamic from 'next/dynamic';

const PopoverContent = dynamic(() => import('@/components/ui/popover').then(mod => mod.PopoverContent));
const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent));

const ChatMessageItem = memo(function ChatMessageItem({ msg, currentUserId }: { msg: Message; currentUserId: string | undefined }) {
    const isSelf = msg.senderId === currentUserId;
    return (
        <div className={cn("flex mb-3", isSelf ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[70%] p-3 rounded-xl",
                isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"
            )}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70 text-right">{msg.timestamp}</p>
            </div>
        </div>
    );
});


export default function ChatDetailPage() {
    const params = useParams();
    const chatId = params.chatId as string;
    const router = useRouter();
    const { toast } = useToast();
    const { getChatDetails, sendMessage, markChatAsRead } = useChats();
    const { currentUser } = useAuth();
    const [chatDetails, setChatDetails] = useState<ChatDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const emojis = ['😊', '👍', '😂', '🙏', '❤️'];

    useEffect(() => {
        const fetchChatDetails = async () => {
            if (chatId) {
                setLoading(true);
                const data = await getChatDetails(chatId);
                setChatDetails(data);
                if (currentUser) {
                    markChatAsRead(chatId);
                }
                setLoading(false);
            }
        };

        fetchChatDetails();
    }, [chatId, getChatDetails, markChatAsRead, currentUser]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [chatDetails?.messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !chatId || !currentUser) return;

        const message = {
            senderId: currentUser.uid,
            text: newMessage,
        };

        await sendMessage(chatId, message);

        setNewMessage('');
    };

    if (loading || !currentUser) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!chatDetails) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Chat nicht gefunden</h1>
                <p className="text-muted-foreground">Der Chat existiert nicht oder Sie haben keine Berechtigung, ihn anzusehen.</p>
                <Button onClick={() => router.push('/chats')} className="mt-4">Zurück zu Chats</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--mobile-nav-height,4rem))] md:h-[calc(100vh-var(--header-height,4rem))] bg-card">
            <header className="flex items-center p-3 border-b sticky top-0 bg-card z-10">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={chatDetails.avatar} alt={chatDetails.name} sizes="40px" />
                    <AvatarFallback>{chatDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="font-semibold text-lg">{chatDetails.name}</h2>
                    <p className="text-xs text-green-500">Online</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/kalender/event-erstellen?chatId=${chatId}`}>
                            <CalendarPlus className="mr-1.5 h-4 w-4" /> Sitzung planen
                        </Link>
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
                {chatDetails.messages.map((msg: any) => (
                    <ChatMessageItem key={msg.id} msg={msg} currentUserId={currentUser?.uid} />
                ))}
            </ScrollArea>

            <footer className="p-3 border-t sticky bottom-0 bg-card">
                <div className="flex items-center space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Smile className="h-5 w-5 text-muted-foreground" />
                                <span className="sr-only">Emoji hinzufügen</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-auto p-2">
                            <div className="flex gap-1">
                                {emojis.map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setNewMessage((prev) => prev + emoji)}
                                        className="text-xl p-1 h-auto w-auto"
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                                <span className="sr-only">Datei anhängen</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Datei anhängen</DialogTitle>
                                <DialogDescription>
                                    Füge deiner Nachricht eine Datei hinzu.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg border-muted-foreground/30 hover:bg-muted/20 transition-colors cursor-pointer">
                                    <UploadCloud className="w-12 h-12 text-muted-foreground/50" />
                                    <p className="mt-4 text-sm text-muted-foreground">Dateien per Drag & Drop hierher ziehen</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">oder</p>
                                    <Button variant="outline" className="mt-3">
                                        Datei auswählen
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Input
                        placeholder="Nachricht schreiben..."
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Senden</span>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
