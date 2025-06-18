'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import { PlusCircle, ListChecks, Clock } from "lucide-react";
import Link from "next/link";
import React from "react";

// Mock data for events - in a real app, this would come from Firestore
const events = [
  { date: new Date(2024, 6, 15), title: "Mathe II Lerngruppe", time: "10:00" }, // July 15th (Month is 0-indexed)
  { date: new Date(2024, 6, 15), title: "Abgabe SE Projekt", time: "23:59" },
  { date: new Date(2024, 6, 18), title: "Diskussion Thesis David", time: "14:00" },
  { date: new Date(2024, 6, 22), title: "Klausur BWL Grundlagen", time: "09:00" },
];


export default function KalenderPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const today = new Date();
  today.setHours(0,0,0,0); // Normalize today's date

  // Filter events for the selected day
  const selectedDayEvents = date ? events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0,0,0,0); // Normalize event date
    return eventDate.getTime() === new Date(date).setHours(0,0,0,0);
  }) : [];


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">Mein Lernkalender</h1>
        <Button asChild>
          <Link href="/kalender/event-erstellen">
            <PlusCircle className="mr-2 h-5 w-5" /> Termin erstellen
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Kalenderansicht</CardTitle>
            <CardDescription>Wähle einen Tag, um Termine anzuzeigen.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-0"
              modifiers={{ 
                eventDay: events.map(e => e.date),
                today: today
              }}
              modifiersStyles={{
                eventDay: { fontWeight: 'bold', color: 'hsl(var(--primary))' },
                today: { border: '2px solid hsl(var(--primary))' }
              }}
              
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Termine am {date ? date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'ausgewählten Tag'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.map((event, index) => (
                  <li key={index} className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" /> {event.time} Uhr
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
    </div>
  );
}
