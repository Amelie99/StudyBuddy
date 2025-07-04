'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions, studiengangOptions, semesterOptions } from '@/lib/constants';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Edit3, Save } from 'lucide-react';
import Image from 'next/image';

const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Vollständiger Name ist erforderlich (mind. 3 Zeichen).' }),
  studiengang: z.string().min(1, { message: 'Studiengang ist erforderlich.' }),
  semester: z.string().min(1, { message: 'Semester ist erforderlich.' }),
  photoURL: z.string().url({ message: 'Ungültige URL für Profilbild.' }).optional().or(z.literal('')),
  ueberMich: z.string().max(500, { message: 'Maximal 500 Zeichen.' }).optional(),
  lerninteressen: z.array(z.string()).min(1, { message: 'Wählen Sie mindestens ein Lerninteresse.' }),
  lernstil: z.string().min(1, { message: 'Lernstil ist erforderlich.' }),
  kurse: z.string().optional(), // For simplicity, comma-separated string. Could be array of tags.
  verfuegbarkeit: z.array(z.string()).min(1, { message: 'Wählen Sie mindestens eine Verfügbarkeit.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


export default function MeinProfilPage() {
  const { currentUser, loading: authLoading } = useAuth(); // Assuming updateUser is a function in AuthContext to update user details
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      studiengang: '',
      semester: '',
      photoURL: '',
      ueberMich: '',
      lerninteressen: [],
      lernstil: '',
      kurse: '',
      verfuegbarkeit: [],
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.displayName || '',
        studiengang: currentUser.studiengang || '',
        semester: currentUser.semester || '',
        photoURL: currentUser.photoURL || '',
        ueberMich: currentUser.ueberMich || '',
        lerninteressen: currentUser.lerninteressen || [],
        lernstil: currentUser.lernstil || '',
        kurse: currentUser.kurse?.join(', ') || '',
        verfuegbarkeit: currentUser.verfuegbarkeit || [],
      });
    }
  }, [currentUser, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      // In a real app, this would update Firestore and potentially Firebase Auth profile
      console.log('Profilaktualisierung:', data);
      // await updateUserProfile(currentUser.uid, data); // This would be your Firebase update function
      // Example of updating local state for mock:
      // @ts-ignore
      // updateAuthContextUser({ ...currentUser, ...data, displayName: data.fullName, kurse: data.kurse?.split(',').map(k => k.trim()) }); 
      
      toast({
        title: 'Profil aktualisiert',
        description: 'Ihre Profildaten wurden erfolgreich gespeichert.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Fehler bei Profilaktualisierung',
        description: error.message || 'Speichern fehlgeschlagen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUser) {
     // This case should ideally be handled by AuthGuard redirecting to login
    return <div className="text-center p-8">Bitte zuerst anmelden.</div>;
  }
  
  const profilePicUrl = form.watch('photoURL') || currentUser.photoURL || `https://placehold.co/128x128.png`;


  return (
    <div className="relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.imgur.com/FKZyONv.jpeg"
          alt="Mein Profil background"
          fill
          className="object-cover opacity-10 saturate-50"
          data-ai-hint="personal notebook"
          priority
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <div className="relative z-10">
        <div className="container mx-auto py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
                <div className="relative mx-auto mb-4 w-32 h-32">
                     <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
                        <AvatarImage src={profilePicUrl} alt={currentUser.displayName || 'Profilbild'} data-ai-hint="person portrait" />
                        <AvatarFallback className="text-4xl">
                          {currentUser.displayName ? currentUser.displayName.substring(0,2).toUpperCase() : '??'}
                        </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-card">
                            <Edit3 className="h-4 w-4"/>
                            <span className="sr-only">Profilbild ändern</span>
                        </Button>
                    )}
                </div>
              <CardTitle className="text-3xl font-bold">{form.watch('fullName') || currentUser.displayName}</CardTitle>
              <CardDescription>{form.watch('studiengang') || currentUser.studiengang} - {form.watch('semester') ? `${form.watch('semester')}. Semester` : (currentUser.semester ? `${currentUser.semester}. Semester` : '')}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Über Mich</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{form.watch('ueberMich') || 'Keine Beschreibung vorhanden.'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Lerninteressen</h3>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('lerninteressen')?.map(interesse => <Badge key={interesse}>{lerninteressenOptions.find(o=>o.id === interesse)?.label || interesse}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                    </div>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg mb-1">Lernstil</h3>
                    <p className="text-muted-foreground">{lernstilOptions.find(o=>o.id === form.watch('lernstil'))?.label || form.watch('lernstil') || 'Kein Lernstil angegeben.'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Kurse/Module</h3>
                    <p className="text-muted-foreground">{form.watch('kurse') || 'Keine Kurse angegeben.'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Verfügbarkeit</h3>
                     <div className="flex flex-wrap gap-2">
                      {form.watch('verfuegbarkeit')?.map(zeit => <Badge variant="secondary" key={zeit}>{verfuegbarkeitOptions.find(o=>o.id === zeit)?.label || zeit}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full mt-6">
                    <Edit3 className="mr-2 h-4 w-4" /> Profil bearbeiten
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Vollständiger Name</FormLabel><FormControl><Input placeholder="Max Mustermann" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="photoURL" render={({ field }) => (<FormItem><FormLabel>Profilbild URL</FormLabel><FormControl><Input placeholder="https://example.com/bild.png" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="studiengang" render={({ field }) => (<FormItem><FormLabel>Studiengang</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Studiengang wählen" /></SelectTrigger></FormControl><SelectContent>{studiengangOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Semester wählen" /></SelectTrigger></FormControl><SelectContent>{semesterOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="ueberMich" render={({ field }) => (<FormItem><FormLabel>Über Mich / Meine Lernziele</FormLabel><FormControl><Textarea placeholder="Erzähl etwas über dich und deine Lernziele..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lerninteressen" render={() => (
                        <FormItem>
                            <FormLabel>Lerninteressen</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {lerninteressenOptions.map((item) => (
                                <FormField key={item.id} control={form.control} name="lerninteressen" render={({ field }) => {
                                    return (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>);
                                }} />
                            ))}
                            </div><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lernstil" render={({ field }) => (<FormItem><FormLabel>Lernstil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Lernstil wählen" /></SelectTrigger></FormControl><SelectContent>{lernstilOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="kurse" render={({ field }) => (<FormItem><FormLabel>Kurse/Module (kommagetrennt)</FormLabel><FormControl><Input placeholder="z.B. Mathe I, BWL Grundlagen" {...field} /></FormControl><FormDescription>Gib deine relevanten Kurse an.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="verfuegbarkeit" render={() => (
                        <FormItem>
                            <FormLabel>Verfügbarkeit</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {verfuegbarkeitOptions.map((item) => (
                                <FormField key={item.id} control={form.control} name="verfuegbarkeit" render={({ field }) => {
                                    return (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>);
                                }} />
                            ))}
                            </div><FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Abbrechen</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ShadCN Badge (already in ui/badge.tsx)
// For simplicity, inline Badge style for demo:
const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = ({ children, variant = 'default', className }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
    variant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : 
    'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
  } ${className}`}>
    {children}
  </span>
);
