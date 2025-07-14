
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, query, where, getDocs, Timestamp, arrayUnion, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { AppUser } from '@/lib/types';


// This is the shape of a group object stored in Firestore and used in the app
export interface Group {
    id: string;
    name: string;
    description: string;
    members: string[]; // Array of user UIDs
    image?: string;
    dataAiHint?: string;
    createdBy: string;
    createdAt: Timestamp;
}

// Data passed when creating a new group from the form
export interface NewGroupData {
    name: string;
    description?: string;
    isPrivate?: boolean;
    invites?: string[]; // array of user UIDs to invite
    kursModul?: string;
    studiengang?: string;
}

export interface GroupMember extends AppUser {
    // We can extend this if we need role info, etc.
}


interface GroupsContextType {
    groups: Group[];
    addGroup: (group: NewGroupData) => Promise<string | undefined>;
    getGroupMembers: (memberIds: string[]) => Promise<GroupMember[]>;
    loading: boolean;
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
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();


    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setGroups([]);
            return;
        }

        setLoading(true);
        const groupsRef = collection(db, 'groups');
        // Query for groups where the current user is a member
        const q = query(groupsRef, where('members', 'array-contains', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const groupsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Group));
            setGroups(groupsList);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch groups:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);


    const addGroup = useCallback(async (newGroupData: NewGroupData) => {
        if (!currentUser) throw new Error("User not logged in");

        const initialMembers = Array.from(new Set([currentUser.uid, ...(newGroupData.invites || [])]));

        const groupPayload = {
            name: newGroupData.name,
            description: newGroupData.description || 'Keine Beschreibung vorhanden.',
            members: initialMembers,
            isPrivate: newGroupData.isPrivate || false,
            image: `https://placehold.co/600x400.png?text=${encodeURIComponent(newGroupData.name)}`,
            dataAiHint: "study group",
            createdBy: currentUser.uid,
            createdAt: Timestamp.now(),
            ...(newGroupData.studiengang && { studiengang: newGroupData.studiengang }),
            ...(newGroupData.kursModul && { kursModul: newGroupData.kursModul }),
        };

        const groupDocRef = await addDoc(collection(db, 'groups'), groupPayload);
        return groupDocRef.id;

    }, [currentUser]);

    const getGroupMembers = useCallback(async (memberIds: string[]): Promise<GroupMember[]> => {
        if (memberIds.length === 0) return [];
        
        // Firestore 'in' query is limited to 30 items. For larger groups, this would need batching.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', 'in', memberIds.slice(0,30)));

        const querySnapshot = await getDocs(q);
        const membersList = querySnapshot.docs.map(doc => doc.data() as GroupMember);
        
        return membersList;
    }, []);

    const value = useMemo(() => ({
        groups,
        addGroup,
        getGroupMembers,
        loading
    }), [groups, addGroup, getGroupMembers, loading]);

    return (
        <GroupsContext.Provider value={value}>
            {children}
        </GroupsContext.Provider>
    );
};
