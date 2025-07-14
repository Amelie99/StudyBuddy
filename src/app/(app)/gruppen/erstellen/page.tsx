
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users2, PlusCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { studiengangOptions as defaultStudiengangOptions } from '@/lib/constants';
import { useGroups } from '@/contexts/GroupsContext';
import { useBuddies } from '@/contexts/PartnersContext';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { AppUser } from '@/lib/types';


const groupSchema = z.object({
  name: z.string().min(3, { message: 'Gruppenname muss mindestens 3 Zeichen lang sein.' }).max(50, { message: 'Gruppenname darf maximal 50 Zeichen lang sein.' }),
  description: z.string().max(200, { message: 'Beschreibung darf maximal 200 Zeichen lang sein.' }).optional(),
  studiengang: z.string().optional(),
  kursModul: z.string().optional(),
  invites: z.array(z.string()).optional(),
  isPrivate: z.boolean().default(false),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GruppeErstellenPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addGroup } = useGroups();
  const { buddies } = useBuddies();
  const [dynamicStudiengangOptions, setDynamicStudiengangOptions] = useState(defaultStudiengangOptions);


  useEffect(() => {
    const fetchAndSetUniqueCourses = async () => {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const allUsers = querySnapshot.docs.map(doc => doc.data() as AppUser);
        
        const coursesFromDB = allUsers
            .map(user => user.studiengang)
            .filter((course): course is string => !!course);

        const combinedCourseLabels = new Set([
            ...defaultStudiengangOptions.map(o => o.label), 
            ...coursesFromDB
        ]);
        
        const newOptions = Array.from(combinedCourseLabels).map(label => {
            const existingOption = defaultStudiengangOptions.find(o => o.label === label);
            return existingOption || { id: label.toLowerCase().replace(/\s/g, ''), label: label };
        });

        setDynamicStudiengangOptions(newOptions);
    };

    fetchAndSetUniqueCourses();
  }, []);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      studiengang: '',
      kursModul: '',
      invites: [],
      isPrivate: false,
    },
  });

  async function onSubmit(data: GroupFormValues) {
    if (!currentUser) {
      toast({ title: 'Fehler', description: 'Nicht angemeldet.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      addGroup({
        name: data.name,
        description: data.description,
      });
      
      console.log("Invited buddies:", data.invites);

      toast({
        title: 'Gruppe erstellt!',
        description: `Die Gruppe "${data.name}" wurde erfolgreich erstellt.`,
      });
      router.push('/gruppen'); // Redirect to groups list page
    } catch (error: any) {
      toast({
        title: 'Fehler bei Gruppenerstellung',
        description: error.message || 'Erstellung fehlgeschlagen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zurück
      </Button>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Users2 className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Neue Lerngruppe erstellen</CardTitle>
          <CardDescription>Finde Gleichgesinnte und lernt gemeinsam effektiver.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gruppenname</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Mathe-Profis WS23/24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Kurze Beschreibung der Gruppe, Ziele, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studiengang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zugehöriger Studiengang (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Studiengang wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicStudiengangOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                          <SelectItem value="allgemein">Studiengangübergreifend</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kursModul"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurs/Modul (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Analysis I" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Für welches Fach ist die Gruppe?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                    control={form.control}
                    name="invites"
                    render={() => (
                        <FormItem>
                            <FormLabel className="flex items-center">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Mitglieder einladen (optional)
                            </FormLabel>
                            <FormDescription className="text-xs">
                                Wähle deine Buddies aus, die du zur Gruppe einladen möchtest.
                            </FormDescription>
                             <ScrollArea className="h-40 w-full rounded-md border p-4">
                               <div className="space-y-4">
                                {buddies.length > 0 ? buddies.map((buddy) => (
                                    <FormField
                                        key={buddy.id}
                                        control={form.control}
                                        name="invites"
                                        render={({ field }) => {
                                            return (
                                                <FormItem key={buddy.id} className="flex flex-row items-center space-x-3">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(buddy.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), buddy.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== buddy.id));
                                                            }}
                                                        />
                                                    </FormControl>
                                                     <Avatar className="h-8 w-8">
                                                        <AvatarImage src={buddy.avatar} alt={buddy.name} />
                                                        <AvatarFallback>{buddy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <FormLabel className="font-normal flex flex-col">
                                                        <span>{buddy.name}</span>
                                                        <span className="text-xs text-muted-foreground">{buddy.course}</span>
                                                    </FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                )) : <p className="text-sm text-muted-foreground text-center py-4">Du hast noch keine Buddies, die du einladen kannst.</p>}
                               </div>
                            </ScrollArea>
                            <FormMessage />
                        </FormItem>
                    )}
                />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Private Gruppe?</FormLabel>
                        <FormDescription className="text-xs">
                        Private Gruppen sind nicht öffentlich sichtbar und erfordern eine Einladung.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4"/>}
                Gruppe erstellen
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
