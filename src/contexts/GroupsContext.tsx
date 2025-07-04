'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// This is the shape of a group object used in the display pages
export interface Group {
    id: string;
    name: string;
    description: string;
    members: number;
    image: string;
    dataAiHint: string;
}

// Data passed when creating a new group from the form
export interface NewGroupData {
    name: string;
    description?: string;
}

interface GroupsContextType {
    groups: Group[];
    addGroup: (group: NewGroupData) => void;
}

// Mock initial data, consistent with the other pages
const initialGroups = [
  { id: "1", name: " Mathe Profis WS23/24", description: "Vorbereitung Analysis & Lineare Algebra", members: 5, image: "https://i.imgur.com/s4M5N0Q.png", dataAiHint:"mathematics study-group" },
  { id: "2", name: "SE Projekt 'LernApp'", description: "Entwicklungsteam für die Software Engineering App", members: 3, image: "https://placehold.co/600x400.png", dataAiHint:"software development" },
  { id: "3", name: "BWL Erstis HAWL", description: "Allgemeine Lerngruppe für BWL Grundlagen", members: 12, image: "https://i.imgur.com/xsVNjlV.png", dataAiHint:"business students" },
];

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function useGroups() {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error('useGroups must be used within a GroupsProvider');
    }
    return context;
}

export const GroupsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<Group[]>(initialGroups);

    const addGroup = useCallback((newGroupData: NewGroupData) => {
        const newGroup: Group = {
            id: `group-${Date.now()}`,
            name: newGroupData.name,
            description: newGroupData.description || 'Keine Beschreibung vorhanden.',
            members: 1, // The creator
            image: "https://placehold.co/600x400.png",
            dataAiHint: "new study group"
        };
        setGroups(prevGroups => [...prevGroups, newGroup]);
    }, []);

    const value = useMemo(() => ({
        groups,
        addGroup,
    }), [groups, addGroup]);

    return (
        <GroupsContext.Provider value={value}>
            {children}
        </GroupsContext.Provider>
    );
};
