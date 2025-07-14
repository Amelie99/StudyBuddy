
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { AppUser, Buddy } from '@/lib/types';

interface BuddiesContextType {
    buddies: Buddy[];
    addBuddy: (buddy: AppUser) => Promise<void>;
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
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(buddiesRef, (snapshot) => {
            const buddiesList = snapshot.docs.map(doc => doc.data() as Buddy);
            setBuddies(buddiesList);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch buddies with real-time listener:", error);
            setLoading(false);
        });

        // Cleanup the listener when the component unmounts or user changes
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
        };

        await setDoc(buddyRef, buddyData);

        // Also add the current user to the buddy's buddy list to make it reciprocal
        const otherBuddyRef = doc(db, 'users', buddy.uid, 'buddies', currentUser.uid);
        const currentUserAsBuddy: Buddy = {
             id: currentUser.uid,
             name: currentUser.displayName || 'Unknown',
             course: currentUser.studiengang || 'Not specified',
             avatar: currentUser.photoURL || '',
        };
        await setDoc(otherBuddyRef, currentUserAsBuddy);

        // No need to manually update state here, onSnapshot will handle it.
    }, [currentUser]);

    const value = useMemo(() => ({
        buddies,
        addBuddy,
        loading,
    }), [buddies, addBuddy, loading]);

    return (
        <BuddiesContext.Provider value={value}>
            {children}
        </BuddiesContext.Provider>
    );
};
