'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    description?: string;
    location?: string;
    type: 'Gruppe' | 'Einzel';
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
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This ensures date-dependent data is only generated on the client, avoiding hydration mismatches.
        const getFutureDate = (days: number): Date => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        };

        const initialEvents: CalendarEvent[] = [
            { id: "1", title: "Mathe II Lerngruppe", date: getFutureDate(1), type: "Gruppe" },
            { id: "2", title: "Projektbesprechung SE", date: getFutureDate(5), type: "Einzel" },
        ];
        
        setEvents(initialEvents);
        setLoading(false);
    }, []);

    const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = {
            id: `event-${Date.now()}`,
            ...eventData,
        };
        setEvents(prevEvents => [...prevEvents, newEvent].sort((a,b) => a.date.getTime() - b.date.getTime()));
    }, []);

    const value = {
        events,
        addEvent,
        loading,
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};
