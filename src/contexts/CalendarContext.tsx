
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    description?: string;
    location?: string;
    type: 'Gruppe' | 'Einzel';
    attendees: string[]; // List of user IDs
}

interface CalendarContextType {
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    loading: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function useCalendar() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
}

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This ensures date-dependent data is only generated on the client, avoiding hydration mismatches.
        const getFutureDate = (days: number): Date => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        };
        
        // Mock user IDs from seed data for realistic scenario
        const davidMeierId = 'jXo8P8Q6yYg4Z2n2V5N2fW1t1Y23';
        const annaSchmidtId = 'kL9qRstUvWxYz3o3W6P3gX2u2Z34';
        const juliaSchneiderId = 'mN0sTuVwXyZa1b1X7Q4hY3v3A45';

        const initialEvents: CalendarEvent[] = [
            // This event includes David and Julia, so it will show up for them.
            { id: "1", title: "Mathe II Lerngruppe", date: getFutureDate(1), type: "Gruppe", attendees: [davidMeierId, juliaSchneiderId] },
            // This event only includes Anna, so it will only show for her.
            { id: "2", title: "Projektbesprechung SE", date: getFutureDate(5), type: "Einzel", attendees: [annaSchmidtId] },
            // A general event for everyone to see initially
            { id: "3", title: "Allgemeine Q&A Session", date: getFutureDate(10), type: "Gruppe", attendees: [davidMeierId, annaSchmidtId, juliaSchneiderId] },
        ];
        
        setEvents(initialEvents);
        setLoading(false);
    }, []);

    const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
        if(!currentUser) return;
        const newEvent: CalendarEvent = {
            id: `event-${Date.now()}`,
            ...eventData,
            // Automatically add the creator to the attendees
            attendees: [...new Set([...(eventData.attendees || []), currentUser.uid])]
        };
        setEvents(prevEvents => [...prevEvents, newEvent].sort((a,b) => a.date.getTime() - b.date.getTime()));
    }, [currentUser]);

    const value = useMemo(() => ({
        events,
        addEvent,
        loading,
    }), [events, addEvent, loading]);

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};
