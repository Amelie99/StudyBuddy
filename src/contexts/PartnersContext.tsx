
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { AppUser, Buddy } from '@/lib/types';

interface BuddiesContextType {
    buddies: Buddy[];
    addBuddy: (buddy: AppUser) => Promise<void>;
    removeBuddy: (buddyId: string) => Promise<void>;
    loading: boolean;
}

const BuddiesContext = createContext<BuddiesContextType | undefined>(undefined);

export function useBuddies() {
    const context = useContext(BuddiesContext);
    if (!context) {
        throw new Error('useBuddies must be used within a BuddiesProvider');
    }
    return context;
}

export const BuddiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setBuddies([]);
            return;
        }

        setLoading(true);
        const buddiesRef = collection(db, 'users', currentUser.uid, 'buddies');
        
        const unsubscribe = onSnapshot(buddiesRef, (snapshot) => {
            const buddiesList = snapshot.docs.map(doc => doc.data() as Buddy);
            setBuddies(buddiesList);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch buddies with real-time listener:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);


    const addBuddy = useCallback(async (buddy: AppUser) => {
        if (!currentUser) throw new Error("No current user found");

        const buddyRef = doc(db, 'users', currentUser.uid, 'buddies', buddy.uid);
        
        const buddyData: Buddy = {
            id: buddy.uid,
            name: buddy.displayName || 'Unknown',
            course: buddy.studiengang || 'Not specified',
            avatar: buddy.photoURL || '',
            dataAiHint: buddy.dataAiHint, // Make sure to carry over the hint
        };

        await setDoc(buddyRef, buddyData);

        const otherBuddyRef = doc(db, 'users', buddy.uid, 'buddies', currentUser.uid);
        const currentUserAsBuddy: Buddy = {
             id: currentUser.uid,
             name: currentUser.displayName || 'Unknown',
             course: currentUser.studiengang || 'Not specified',
             avatar: currentUser.photoURL || '',
             dataAiHint: currentUser.dataAiHint,
        };
        await setDoc(otherBuddyRef, currentUserAsBuddy);
    }, [currentUser]);

    const removeBuddy = useCallback(async (buddyId: string) => {
        if (!currentUser) throw new Error("No current user found");

        const buddyRef = doc(db, 'users', currentUser.uid, 'buddies', buddyId);
        await deleteDoc(buddyRef);

        const otherBuddyRef = doc(db, 'users', buddyId, 'buddies', currentUser.uid);
        await deleteDoc(otherBuddyRef);
    }, [currentUser]);

    const value = useMemo(() => ({
        buddies,
        addBuddy,
        removeBuddy,
        loading,
    }), [buddies, addBuddy, removeBuddy, loading]);

    return (
        <BuddiesContext.Provider value={value}>
            {children}
        </BuddiesContext.Provider>
    );
};
