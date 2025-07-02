'use client';

import { useState } from 'react';
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
import { Loader2, Users2, PlusCircle, UserPlus } from 'lucide-react';
import { studiengangOptions } from '@/lib/constants';

const groupSchema = z.object({
  name: z.string().min(3, { message: 'Gruppenname muss mindestens 3 Zeichen lang sein.' }).max(50, { message: 'Gruppenname darf maximal 50 Zeichen lang sein.' }),
  description: z.string().max(200, { message: 'Beschreibung darf maximal 200 Zeichen lang sein.' }).optional(),
  studiengang: z.string().optional(),
  kursModul: z.string().optional(),
  invites: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GruppeErstellenPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      studiengang: '',
      kursModul: '',
      invites: '',
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
      // Simulate group creation
      console.log('Neue Gruppe erstellen:', { ...data, createdBy: currentUser.uid });
      // In a real app, save to Firestore and update user's groups
      
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
                          {studiengangOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Mitglieder einladen (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Namen oder E-Mails mit Komma getrennt eingeben..." {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                        Lade Mitglieder direkt bei der Erstellung ein.
                    </FormDescription>
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
                        <Input type="checkbox" className="form-checkbox h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded" checked={field.value} onChange={field.onChange} />
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
