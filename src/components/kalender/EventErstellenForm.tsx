
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarPlus, Clock, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCalendar } from '@/contexts/CalendarContext';
import dynamic from 'next/dynamic';
import { Calendar } from '@/components/ui/calendar';

const eventSchema = z.object({
  title: z.string().min(3, { message: 'Titel muss mindestens 3 Zeichen lang sein.' }),
  date: z.date({ required_error: 'Datum ist erforderlich.' }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Ungültige Startzeit (HH:MM).' }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Ungültige Endzeit (HH:MM).' }),
  description: z.string().max(500, { message: 'Beschreibung darf maximal 500 Zeichen lang sein.' }).optional(),
  location: z.string().optional(),
  attendees: z.string().optional(), // Comma-separated emails or names for simplicity
}).refine(data => {
    // Optional: Validate endTime is after startTime if both are provided and on the same day
    if(data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, {message: "Endzeit muss nach Startzeit liegen.", path: ["endTime"]});


type EventFormValues = z.infer<typeof eventSchema>;

export default function EventErstellenForm() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { addEvent } = useCalendar();

  const chatIdParam = searchParams.get('chatId'); // For pre-filling attendees or linking back

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      attendees: '', // Could pre-fill if chatIdParam is present and we fetch chat members
    },
  });

  async function onSubmit(data: EventFormValues) {
    if (!currentUser) {
      toast({ title: 'Fehler', description: 'Nicht angemeldet.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // Combine date and time
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const eventData = {
        title: data.title,
        date: startDateTime,
        description: data.description,
        location: `${data.location || 'N/A'} (${data.startTime} - ${data.endTime})`,
        type: 'Einzel' as const,
        attendees: [currentUser.uid], // Start with current user
      };

      addEvent(eventData);
      
      toast({
        title: 'Termin erstellt!',
        description: `Der Termin "${data.title}" wurde erfolgreich im Kalender gespeichert.`,
      });
      router.push('/kalender'); 
    } catch (error: any) {
      toast({
        title: 'Fehler bei Terminerstellung',
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
          <CalendarPlus className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Neue Lernsitzung planen</CardTitle>
          <CardDescription>Organisiere deine Lerntermine und lade Teilnehmer ein.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titel der Lernsitzung</FormLabel><FormControl><Input placeholder="z.B. Mathe Klausurvorbereitung" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Datum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: de }) : <span>Datum wählen</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) } initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Startzeit</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Endzeit</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Beschreibung (optional)</FormLabel><FormControl><Textarea placeholder="Themen, Agenda, benötigte Materialien..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Ort / Link (optional)</FormLabel><FormControl><Input placeholder="z.B. Raum E0.01, Zoom-Link" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              {/* Simple attendees input for now. Could be a multi-select component in future. */}
              <FormField control={form.control} name="attendees" render={({ field }) => (<FormItem><FormLabel>Teilnehmer (optional, kommagetrennt)</FormLabel><FormControl><Input placeholder="max.mustermann@..., lisa.s@..." {...field} /></FormControl><FormDescription>Füge E-Mail-Adressen oder Namen hinzu.</FormDescription><FormMessage /></FormItem>)} />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4"/>}
                Termin erstellen
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
