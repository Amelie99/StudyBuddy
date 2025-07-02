'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Consistent Partner type for use across the app
export interface Partner {
    id: string;
    name: string;
    course: string;
    avatar: string;
    dataAiHint: string;
}

// This is the shape of the partner object from the "partner-finden" page suggestions
export interface SuggestedPartner {
    id: number;
    name: string;
    studiengang: string;
    image: string;
    dataAiHint: string;
    mutualInterests: string[];
}


interface PartnersContextType {
    partners: Partner[];
    addPartner: (partner: SuggestedPartner) => void;
}

// Mock initial data, consistent with the other pages
const initialPartners: Partner[] = [
  { id: "1", name: "Lisa Schmidt", course: "Soziale Arbeit", avatar: "https://placehold.co/100x100.png", dataAiHint: "woman student" },
  { id: "2", name: "David Meier", course: "Master Elektrotechnik", avatar: "https://placehold.co/100x100.png", dataAiHint: "man student" },
];

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

export function usePartners() {
    const context = useContext(PartnersContext);
    if (!context) {
        throw new Error('usePartners must be used within a PartnersProvider');
    }
    return context;
}

export const PartnersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [partners, setPartners] = useState<Partner[]>(initialPartners);

    const addPartner = (suggestedPartner: SuggestedPartner) => {
        const partnerId = suggestedPartner.id.toString();
        // Check if partner already exists
        if (partners.some(p => p.id === partnerId)) {
            return;
        }

        const newPartner: Partner = {
            id: partnerId,
            name: suggestedPartner.name,
            course: suggestedPartner.studiengang,
            // Adjust image size from swipe card to list view avatar
            avatar: suggestedPartner.image.replace('300x400', '100x100'),
            dataAiHint: suggestedPartner.dataAiHint,
        };
        setPartners(prevPartners => [...prevPartners, newPartner]);
    };

    const value = {
        partners,
        addPartner,
    };

    return (
        <PartnersContext.Provider value={value}>
            {children}
        </PartnersContext.Provider>
    );
};
