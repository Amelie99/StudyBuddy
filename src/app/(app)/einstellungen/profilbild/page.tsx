
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSafeAvatar } from '@/lib/utils';

const imageSchema = z.object({
  photoURL: z.string().url({ message: 'Bitte geben Sie eine gültige URL ein.' }).optional().or(z.literal('')),
});

type ImageFormValues = z.infer<typeof imageSchema>;

export default function ProfilbildPage() {
    const { currentUser, uploadProfilePicture, updateUserProfile } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.photoURL || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ImageFormValues>({
        resolver: zodResolver(imageSchema),
        defaultValues: {
            photoURL: '',
        },
    });

    useEffect(() => {
        if (currentUser?.photoURL) {
            setPreviewUrl(currentUser.photoURL);
        }
    }, [currentUser?.photoURL]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            form.setValue('photoURL', ''); // Clear URL field if file is selected
        }
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        if (form.getValues('photoURL') === url) { // Check schema validation on the URL
             setPreviewUrl(url);
             setSelectedFile(null); // Clear file if URL is being typed
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setIsLoading(true);

        try {
            if (selectedFile) {
                // Handle file upload
                const newPhotoURL = await uploadProfilePicture(selectedFile, currentUser.uid);
                 toast({
                    title: 'Profilbild aktualisiert',
                    description: 'Dein neues Bild wurde erfolgreich hochgeladen und gespeichert.',
                });
                router.push('/mein-profil');
            } else {
                 const newUrl = form.getValues('photoURL');
                 if (newUrl) {
                    await updateUserProfile({ photoURL: newUrl });
                    toast({
                        title: 'Profilbild aktualisiert',
                        description: 'Dein neues Bild wurde erfolgreich gespeichert.',
                    });
                    router.push('/mein-profil');
                } else {
                     toast({
                        title: 'Keine Änderung',
                        description: 'Es wurde kein neues Bild zum Speichern ausgewählt.',
                        variant: 'default',
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: 'Speichern fehlgeschlagen',
                description: error.message || 'Das Bild konnte nicht gespeichert werden.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };


    if (!currentUser) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    const safePreviewUrl = getSafeAvatar(previewUrl, '160x160');

    return (
        <div className="container mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
            </Button>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Profilbild ändern</CardTitle>
                    <CardDescription>Lade ein neues Bild hoch oder gib eine URL an, um dein Profilbild zu aktualisieren.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <Avatar className="w-40 h-40 border-4 border-primary shadow-lg">
                            <AvatarImage src={safePreviewUrl} alt="Profilbild Vorschau" data-ai-hint="person portrait" sizes="160px" />
                            <AvatarFallback className="text-5xl">
                                {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : '??'}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>Datei hochladen</TabsTrigger>
                            <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4"/>URL verwenden</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload">
                             <div className="p-4 border rounded-md">
                                <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Datei auswählen
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                />
                                {selectedFile && <p className="text-sm text-center mt-2 text-muted-foreground">Ausgewählte Datei: {selectedFile.name}</p>}
                            </div>
                        </TabsContent>
                        <TabsContent value="url">
                             <div className="p-4 border rounded-md">
                                 <Form {...form}>
                                    <form>
                                        <FormField
                                            control={form.control}
                                            name="photoURL"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bild-URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://beispiel.com/bild.png"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                handleUrlChange(e);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                             </div>
                        </TabsContent>
                    </Tabs>
                    
                     <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Änderungen speichern
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
