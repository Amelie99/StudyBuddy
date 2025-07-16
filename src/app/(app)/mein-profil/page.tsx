
'use client';
import { useState, useEffect, useRef } from 'react';
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
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions, studiengangOptions as defaultStudiengangOptions, semesterOptions } from '@/lib/constants';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Edit3, Save, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getSafeAvatar } from '@/lib/utils';


const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Vollständiger Name ist erforderlich (mind. 3 Zeichen).' }),
  studiengang: z.string().optional(),
  customStudiengang: z.string().optional(),
  semester: z.string().min(1, { message: 'Semester ist erforderlich.' }),
  ueberMich: z.string().max(500, { message: 'Maximal 500 Zeichen.' }).optional(),
  lerninteressen: z.array(z.string()).min(1, { message: 'Wählen Sie mindestens ein Lerninteresse.' }),
  lernstil: z.string().min(1, { message: 'Lernstil ist erforderlich.' }),
  kurse: z.string().optional(),
  verfuegbarkeit: z.array(z.string()).min(1, { message: 'Wählen Sie mindestens eine Verfügbarkeit.' }),
}).refine(data => {
    if (data.studiengang === 'anderer') {
        return !!data.customStudiengang && data.customStudiengang.length > 2;
    }
    return !!data.studiengang;
}, {
    message: 'Bitte geben Sie Ihren Studiengang an oder wählen Sie einen aus der Liste.',
    path: ['studiengang'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;


export default function MeinProfilPage() {
  const { currentUser, loading: authLoading, updateUserProfile, deleteCurrentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      studiengang: '',
      customStudiengang: '',
      semester: '',
      ueberMich: '',
      lerninteressen: [],
      lernstil: '',
      kurse: '',
      verfuegbarkeit: [],
    },
  });
  
  const studiengangValue = form.watch('studiengang');
  const studiengangOptions = defaultStudiengangOptions;

  useEffect(() => {
    if (currentUser) {
       const userStudiengang = currentUser.studiengang || '';
       const isStandardCourse = studiengangOptions.some(o => o.label === userStudiengang);

      form.reset({
        fullName: currentUser.displayName || '',
        studiengang: isStandardCourse ? studiengangOptions.find(o => o.label === userStudiengang)?.id : 'anderer',
        customStudiengang: isStandardCourse ? '' : userStudiengang,
        semester: currentUser.semester || '',
        ueberMich: currentUser.ueberMich || '',
        lerninteressen: currentUser.lerninteressen || [],
        lernstil: currentUser.lernstil || '',
        kurse: currentUser.kurse?.join(', ') || '',
        verfuegbarkeit: currentUser.verfuegbarkeit || [],
      });
    }
  }, [currentUser, form, isEditing, studiengangOptions]);

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
       const finalStudiengang = data.studiengang === 'anderer' 
            ? data.customStudiengang 
            : studiengangOptions.find(o => o.id === data.studiengang)?.label;

      const profileData = {
        displayName: data.fullName,
        studiengang: finalStudiengang,
        semester: Number(data.semester),
        ueberMich: data.ueberMich,
        bio: data.ueberMich, // also update bio
        lerninteressen: data.lerninteressen,
        lernstil: data.lernstil,
        kurse: data.kurse?.split(',').map(k => k.trim()).filter(Boolean),
        verfuegbarkeit: data.verfuegbarkeit,
        profileComplete: true,
      }
      await updateUserProfile(profileData);
      
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

  const handleDeleteProfile = async () => {
    toast({
        title: "Profil wird gelöscht...",
        description: "Du wirst in Kürze ausgeloggt."
    })
    try {
        await deleteCurrentUser();
    } catch (error: any) {
        toast({
            title: "Fehler",
            description: "Profil konnte nicht gelöscht werden: " + error.message,
            variant: "destructive"
        })
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUser) {
    return <div className="text-center p-8">Bitte zuerst anmelden.</div>;
  }
  
  const profilePicUrl = getSafeAvatar(currentUser.photoURL, currentUser.displayName || 'User');


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
            <div className="relative mx-auto mb-4 w-32 h-32">
                 <Avatar className={`w-32 h-32 border-4 border-primary shadow-lg`}>
                    <AvatarImage src={profilePicUrl} alt={currentUser.displayName || 'Profilbild'} />
                    <AvatarFallback className="text-4xl">
                      {currentUser.displayName ? currentUser.displayName.substring(0,2).toUpperCase() : '??'}
                    </AvatarFallback>
                </Avatar>
                {isEditing && (
                    <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-card" asChild>
                        <Link href="/einstellungen/profilbild">
                            <Edit className="h-4 w-4"/>
                            <span className="sr-only">Profilbild ändern</span>
                        </Link>
                    </Button>
                )}
            </div>
          <CardTitle className="text-3xl font-bold">{form.watch('fullName') || currentUser.displayName}</CardTitle>
          <CardDescription>{currentUser.studiengang} - {currentUser.semester ? `${currentUser.semester}. Semester` : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Über Mich</h3>
                <p className="text-muted-foreground whitespace-pre-line">{currentUser?.ueberMich || 'Keine Beschreibung vorhanden.'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Lerninteressen</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser?.lerninteressen?.map(interesse => <Badge key={interesse}>{lerninteressenOptions.find(o=>o.id === interesse)?.label || interesse}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                </div>
              </div>
               <div>
                <h3 className="font-semibold text-lg mb-1">Lernstil</h3>
                <p className="text-muted-foreground">{lernstilOptions.find(o=>o.id === currentUser?.lernstil)?.label || currentUser?.lernstil || 'Kein Lernstil angegeben.'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Kurse/Module</h3>
                <p className="text-muted-foreground">{currentUser?.kurse?.join(', ') || 'Keine Kurse angegeben.'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Verfügbarkeit</h3>
                 <div className="flex flex-wrap gap-2">
                  {currentUser?.verfuegbarkeit?.map(zeit => <Badge variant="secondary" key={zeit}>{verfuegbarkeitOptions.find(o=>o.id === zeit)?.label || zeit}</Badge>) || <p className="text-muted-foreground">Keine angegeben.</p>}
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full mt-6">
                <Edit3 className="mr-2 h-4 w-4" /> Profil bearbeiten
              </Button>
            </div>
          ) : (
            <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Vollständiger Name</FormLabel><FormControl><Input placeholder="Max Mustermann" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="studiengang" render={({ field }) => (<FormItem><FormLabel>Studiengang</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Studiengang wählen" /></SelectTrigger></FormControl><SelectContent>{studiengangOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Semester wählen" /></SelectTrigger></FormControl><SelectContent>{semesterOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                     {studiengangValue === 'anderer' && (
                        <FormField
                            control={form.control}
                            name="customStudiengang"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Eigener Studiengang</FormLabel>
                                <FormControl>
                                <Input placeholder="z.B. Mechatronik, DPM" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                     )}
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
                <Separator className="my-8"/>
                <div className="text-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Profil löschen
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bist du absolut sicher?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle zugehörigen Daten werden dauerhaft gelöscht.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive hover:bg-destructive/90">
                                    Ja, Profil löschen
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
