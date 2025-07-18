
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks, Clock, CalendarDays, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { de } from 'date-fns/locale';
import { format, isSameDay } from 'date-fns';
import { useCalendar, type CalendarEvent } from "@/contexts/CalendarContext";
import { SimpleCalendar } from '@/components/kalender/SimpleCalendar';

const UpcomingEventItem = React.memo(function UpcomingEventItem({ session }: { session: CalendarEvent }) {
  return (
    <li className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg flex-wrap gap-4">
      <div>
        <p className="font-semibold">{session.title}</p>
        <p className="text-sm text-muted-foreground">{format(session.date, "EEEE, d. MMMM' - 'HH:mm 'Uhr'", { locale: de })}</p>
      </div>
      <Button variant="outline" size="sm" asChild>
          <Link href={`/kalender/${session.id}`}>Details</Link>
      </Button>
    </li>
  );
});

export default function KalenderPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, loading } = useCalendar();
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  const sortedEvents = useMemo(() => {
    if (loading || initialRender) return [];
    return [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, loading, initialRender]);
  
  const today = useMemo(() => {
    if (initialRender) return new Date(); 
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [initialRender]);

  const selectedDayEvents = selectedDate ? sortedEvents.filter(event => isSameDay(event.date, selectedDate)) : [];

  const upcomingEvents = useMemo(() => sortedEvents.filter(event => new Date(event.date) >= today), [sortedEvents, today]);
  
  const eventDays = useMemo(() => events.map(e => e.date), [events]);

  if (loading || initialRender) {
      return (
          <div className="container mx-auto py-8 space-y-8 flex justify-center items-center h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-foreground">Mein Lernkalender</h1>
        <Button asChild>
          <Link href="/kalender/event-erstellen">
            <PlusCircle className="mr-2 h-5 w-5" /> Termin erstellen
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Kalenderansicht</CardTitle>
            <CardDescription>Wähle einen Tag, um Termine anzuzeigen.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center flex-col">
            <SimpleCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                eventDays={eventDays}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Termine am {selectedDate ? format(selectedDate, 'd. MMMM', { locale: de }) : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <li key={event.id} className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" /> {format(event.date, "HH:mm", { locale: de })} Uhr
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {selectedDate ? "Keine Termine für diesen Tag." : "Wähle einen Tag im Kalender."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Alle anstehenden Termine
          </CardTitle>
          <CardDescription>Eine Übersicht aller deiner geplanten Lernsitzungen und Termine.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-4">
              {upcomingEvents.map(session => (
                <UpcomingEventItem key={session.id} session={session} />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">Keine anstehenden Lernsitzungen geplant.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

