
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import { PlusCircle, ListChecks, Clock, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { de } from 'date-fns/locale';
import { format } from 'date-fns';


export default function KalenderPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [allUpcomingSessions, setAllUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs only on the client, after the page has loaded.
    // This is the correct way to use 'new Date()' to avoid server/client mismatches.
    const getFutureDate = (days: number) => {
      const future = new Date();
      future.setDate(future.getDate() + days);
      return future;
    };
    
    // Set initial selected date and events on client mount
    setDate(new Date()); 
    setAllUpcomingSessions([
        { id: 1, date: getFutureDate(2), title: "Mathe II Lerngruppe", time: "10:00 Uhr" },
        { id: 'se-abgabe', date: getFutureDate(10), title: "Abgabe SE Projekt", time: "23:59 Uhr" },
        { id: 'thesis-david', date: getFutureDate(15), title: "Diskussion Thesis David", time: "14:00 Uhr" },
        { id: 2, date: getFutureDate(20), title: "Projektbesprechung SE", time: "14:30 Uhr" },
        { id: 'bwl-klausur', date: getFutureDate(25), title: "Klausur BWL Grundlagen", time: "09:00 Uhr" },
    ]);
    setLoading(false);
  }, []); // Empty dependency array ensures this runs once on mount
  
  const today = new Date();
  today.setHours(0,0,0,0); // Normalize today's date

  // Filter events for the selected day in the calendar
  const selectedDayEvents = date ? allUpcomingSessions.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0,0,0,0); // Normalize event date
    return eventDate.getTime() === new Date(date).setHours(0,0,0,0);
  }) : [];

   // Filter for sessions that have a numeric ID and are upcoming.
  const linkableUpcomingSessions = allUpcomingSessions
    .filter(session => typeof session.id === 'number' && new Date(session.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
      return (
          <div className="container mx-auto py-8 space-y-8 flex justify-center items-center h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">Mein Lernkalender</h1>
        <Button asChild>
          <Link href="/kalender/event-erstellen">
            <PlusCircle className="mr-2 h-5 w-5" /> Termin erstellen
          </Link>
        </Button>
      </div>

      {/* Top section with Calendar and selected day's events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Kalenderansicht</CardTitle>
            <CardDescription>Wähle einen Tag, um Termine anzuzeigen.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              locale={de}
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-0"
              modifiers={{ 
                eventDay: allUpcomingSessions.map(e => e.date),
              }}
              classNames={{
                cell: "[&:has([aria-selected])]:bg-transparent",
                day_selected: "border-2 border-primary bg-transparent text-primary rounded-md",
                day_today: "border-2 border-primary rounded-md",
                day_eventDay: "font-bold"
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Termine am {date ? format(date, 'd. MMMM', { locale: de }) : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.sort((a,b) => a.time.localeCompare(b.time)).map((event, index) => (
                  <li key={index} className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" /> {event.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {date ? "Keine Termine für diesen Tag." : "Wähle einen Tag im Kalender."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* New section for all upcoming sessions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Alle anstehenden Termine
          </CardTitle>
          <CardDescription>Eine Übersicht aller deiner geplanten Lernsitzungen und Termine.</CardDescription>
        </CardHeader>
        <CardContent>
          {linkableUpcomingSessions.length > 0 ? (
            <ul className="space-y-4">
              {linkableUpcomingSessions.map(session => (
                <li key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg flex-wrap gap-4">
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    <p className="text-sm text-muted-foreground">{format(session.date, "EEEE, d. MMMM yyyy", { locale: de })} - {session.time}</p>
                  </div>
                  {typeof session.id === 'number' && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/kalender/${session.id}`}>Details</Link>
                    </Button>
                  )}
                </li>
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
