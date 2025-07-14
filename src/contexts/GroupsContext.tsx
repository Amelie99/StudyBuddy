
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

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function useGroups() {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error('useGroups must be used within a GroupsProvider');
    }
    return context;
}

export const GroupsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<Group[]>([]);

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
