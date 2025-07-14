
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
import { useRouter } from 'next/navigation';
import { lerninteressenOptions, lernstilOptions, verfuegbarkeitOptions, studiengangOptions, semesterOptions, HAW_LANDSHUT_EMAIL_DOMAIN } from '@/lib/constants';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import HochschuleLogo from '@/components/layout/HochschuleLogo';
import { Loader2, Send } from 'lucide-react';


const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Vollständiger Name ist erforderlich (mind. 3 Zeichen).' }),
  studiengang: z.string().optional(),
  customStudiengang: z.string().optional(),
  semester: z.string().min(1, { message: 'Semester ist erforderlich.' }),
  photoURL: z.string().url({ message: 'Ungültige URL für Profilbild.' }).optional().or(z.literal('')),
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

export default function ProfilErstellenPage() {
  const { currentUser, loading: authLoading, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      studiengang: '',
      customStudiengang: '',
      semester: '',
      photoURL: '',
      ueberMich: '',
      lerninteressen: [],
      lernstil: '',
      kurse: '',
      verfuegbarkeit: [],
    },
  });
  
  const studiengangValue = form.watch('studiengang');

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
    if (!currentUser) {
      toast({ title: 'Fehler', description: 'Nicht angemeldet.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const finalStudiengang = data.studiengang === 'anderer' ? data.customStudiengang : data.studiengang;

      const updatedProfile: Partial<AppUser> = {
        displayName: data.fullName,
        studiengang: finalStudiengang,
        semester: data.semester,
        photoURL: data.photoURL,
        ueberMich: data.ueberMich,
        bio: data.ueberMich,
        lerninteressen: data.lerninteressen,
        lernstil: data.lernstil,
        kurse: data.kurse?.split(',').map(k => k.trim()),
        verfuegbarkeit: data.verfuegbarkeit,
        profileComplete: true,
      };

      await updateUserProfile(updatedProfile);


      toast({
        title: 'Profil erstellt!',
        description: 'Dein Profil wurde erfolgreich eingerichtet. Du wirst weitergeleitet.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Fehler bei Profilerstellung',
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

  if (!currentUser && !authLoading) {
    router.push('/anmelden');
    return null;
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="items-center text-center">
          <HochschuleLogo className="h-12 w-auto mb-4 text-primary" />
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Profil erstellen</CardTitle>
          <CardDescription>Vervollständige dein Profil, um StudyBuddy optimal zu nutzen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Vollständiger Name</FormLabel><FormControl><Input placeholder="Max Mustermann" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="photoURL" render={({ field }) => (<FormItem><FormLabel>Profilbild URL (optional)</FormLabel><FormControl><Input placeholder="https://example.com/bild.png" {...field} /></FormControl><FormDescription>Link zu deinem Profilbild (z.B. von LinkedIn, Gravatar).</FormDescription><FormMessage /></FormItem>)} />
              
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
                          <Input placeholder="z.B. Mechatronik" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <FormField control={form.control} name="ueberMich" render={({ field }) => (<FormItem><FormLabel>Über Mich / Meine Lernziele</FormLabel><FormControl><Textarea placeholder="Erzähl etwas über dich, deine Lernmethoden und was du dir von einem Lernpartner erwartest..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="lerninteressen" render={() => (
                <FormItem>
                  <FormLabel>Lerninteressen</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                    {lerninteressenOptions.map((item) => (
                      <FormField key={item.id} control={form.control} name="lerninteressen" render={({ field }) => {
                        return (<FormItem className="flex flex-row items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal text-sm">{item.label}</FormLabel></FormItem>);
                      }}/>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="lernstil" render={({ field }) => (<FormItem><FormLabel>Lernstil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Bevorzugten Lernstil wählen" /></SelectTrigger></FormControl><SelectContent>{lernstilOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="kurse" render={({ field }) => (<FormItem><FormLabel>Kurse/Module (kommagetrennt)</FormLabel><FormControl><Input placeholder="z.B. Mathe I, BWL Grundlagen, Software Engineering" {...field} /></FormControl><FormDescription>Gib Kurse an, für die du aktuell lernst oder Hilfe suchst.</FormDescription><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="verfuegbarkeit" render={() => (
                <FormItem>
                  <FormLabel>Verfügbarkeit</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                    {verfuegbarkeitOptions.map((item) => (
                      <FormField key={item.id} control={form.control} name="verfuegbarkeit" render={({ field }) => {
                        return (<FormItem className="flex flex-row items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal text-sm">{item.label}</FormLabel></FormItem>);
                      }}/>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                Profil speichern und loslegen
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
