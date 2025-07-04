
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// Consistent Buddy type for use across the app
export interface Buddy {
    id: string;
    name: string;
    course: string;
    avatar: string;
    dataAiHint: string;
}

// This is the shape of the buddy object from the "partner-finden" page suggestions
export interface SuggestedBuddy {
    id: number;
    name: string;
    studiengang: string;
    image: string;
    avatar?: string;
    dataAiHint: string;
    mutualInterests: string[];
}


interface BuddiesContextType {
    buddies: Buddy[];
    addBuddy: (buddy: SuggestedBuddy) => void;
}

// Mock initial data, consistent with the other pages
const initialBuddies: Buddy[] = [
  { id: "1", name: "Lisa Schmidt", course: "Soziale Arbeit", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
  { id: "2", name: "David Meier", course: "Master Elektrotechnik", avatar: "https://i.imgur.com/ZiKvLxU.jpeg", dataAiHint: "man portrait" },
];

const BuddiesContext = createContext<BuddiesContextType | undefined>(undefined);

export function useBuddies() {
    const context = useContext(BuddiesContext);
    if (!context) {
        throw new Error('useBuddies must be used within a BuddiesProvider');
    }
    return context;
}

export const BuddiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [buddies, setBuddies] = useState<Buddy[]>(initialBuddies);

    const addBuddy = useCallback((suggestedBuddy: SuggestedBuddy) => {
        const buddyId = suggestedBuddy.id.toString();
        
        setBuddies(prevBuddies => {
            // Check if buddy already exists inside the updater to get the latest state
            if (prevBuddies.some(p => p.id === buddyId)) {
                return prevBuddies;
            }

            const newBuddy: Buddy = {
                id: buddyId,
                name: suggestedBuddy.name,
                course: suggestedBuddy.studiengang,
                avatar: suggestedBuddy.avatar || suggestedBuddy.image.replace('300x400', '100x100'),
                dataAiHint: suggestedBuddy.dataAiHint,
            };
            return [...prevBuddies, newBuddy];
        });
    }, []); // No dependencies needed for setBuddies

    const value = useMemo(() => ({
        buddies,
        addBuddy,
    }), [buddies, addBuddy]);


    return (
        <BuddiesContext.Provider value={value}>
            {children}
        </BuddiesContext.Provider>
    );
};
