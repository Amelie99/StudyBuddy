
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { AppUser, SuggestedBuddy, Buddy } from '@/lib/types';

interface BuddiesContextType {
    buddies: Buddy[];
    addBuddy: (buddy: SuggestedBuddy) => void;
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
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            if (currentUser) {
                try {
                    const usersCollectionRef = collection(db, "users");
                    const querySnapshot = await getDocs(usersCollectionRef);
                    const allUsers = querySnapshot.docs
                        .map(doc => {
                            const data = doc.data() as AppUser;
                            return {
                                id: doc.id,
                                name: data.displayName || 'Unnamed User',
                                course: data.studiengang || 'Studiengang nicht angegeben',
                                avatar: data.photoURL || 'https://i.imgur.com/PKtZX0C.jpeg',
                                dataAiHint: 'user profile picture',
                            };
                        });
                    const otherUsers = allUsers.filter(user => user.id !== currentUser.uid);
                    setBuddies(otherUsers);
                } catch (error) {
                    console.error("Error fetching users for BuddiesProvider:", error);
                }
            }
        };

        fetchUsers();
    }, [currentUser]);

    const addBuddy = useCallback((suggestedBuddy: SuggestedBuddy) => {
        const buddyId = suggestedBuddy.id.toString();
        
        setBuddies(prevBuddies => {
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
    }, []);

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
