
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, CalendarPlus, Smile, Paperclip, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef, memo } from 'react';
import { cn, getSafeAvatar } from '@/lib/utils';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogTrigger, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChats } from '@/contexts/ChatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/lib/types';
import dynamic from 'next/dynamic';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

const PopoverContent = dynamic(() => import('@/components/ui/popover').then(mod => mod.PopoverContent));
const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent));


const ChatMessageItem = memo(function ChatMessageItem({ msg, currentUserId, onDelete }: { msg: Message; currentUserId: string | undefined, onDelete: (messageId: string) => void }) {
    const isSelf = msg.senderId === currentUserId;

    return (
        <div className={cn("flex flex-col mb-3", isSelf ? "items-end" : "items-start")}>
             <p className={cn("text-xs text-muted-foreground mb-1", isSelf ? "mr-3" : "ml-3")}>
                {isSelf ? 'Du' : msg.senderName}
            </p>
            <div className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!isSelf}>
                            <div className={cn("max-w-[85%] p-3 rounded-xl cursor-pointer",
                                isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"
                            )}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className="text-xs mt-1 opacity-70 text-right">{msg.timestamp}</p>
                            </div>
                        </DropdownMenuTrigger>
                        {isSelf && (
                            <DropdownMenuContent>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Löschen
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Nachricht löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Diese Aktion kann nicht rückgängig gemacht werden. Möchtest du diese Nachricht wirklich dauerhaft löschen?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(msg.id)} className="bg-destructive hover:bg-destructive/90">
                                Löschen
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
});


export default function ChatDetailPage() {
    const params = useParams();
    const chatId = params.chatId as string;
    const router = useRouter();
    const { toast } = useToast();
    const { chatDetails, loadingChatDetails, subscribeToChatDetails, sendMessage, markChatAsRead, deleteMessage } = useChats();
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const emojis = ['😊', '👍', '😂', '🙏', '❤️'];

    useEffect(() => {
        if (chatId && currentUser) {
            const unsubscribe = subscribeToChatDetails(chatId);
            markChatAsRead(chatId);

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [chatId, currentUser, subscribeToChatDetails, markChatAsRead]);


    useEffect(() => {
        // Scroll to bottom whenever messages change
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [chatDetails?.messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !chatId || !currentUser) return;

        // The UI will update automatically via the real-time listener
        await sendMessage(chatId, {
            text: newMessage,
        });

        setNewMessage('');
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await deleteMessage(chatId, messageId);
            toast({
                title: "Nachricht gelöscht",
                description: "Deine Nachricht wurde erfolgreich entfernt.",
            });
        } catch (error) {
             toast({
                title: "Fehler",
                description: "Die Nachricht konnte nicht gelöscht werden.",
                variant: "destructive",
            });
        }
    };

    if (loadingChatDetails || !currentUser) {
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
                    <AvatarImage src={getSafeAvatar(chatDetails.avatar, chatDetails.name)} alt={chatDetails.name} />
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
                    <ChatMessageItem key={msg.id} msg={msg} currentUserId={currentUser?.uid} onDelete={handleDeleteMessage}/>
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
