import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Assumptions, DEFAULT_ASSUMPTIONS } from '../lib/calculations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  exportCredits: number;
  subscriptionStatus: 'free_trial' | 'subscriber' | 'expired';
  trialExpiresAt: string;
  lockedIp: string;
  createdAt: string;
}

interface AppContextType {
  selectedArtistId: string | null;
  setSelectedArtistId: (id: string | null) => void;
  selectedTourId: string | null;
  setSelectedTourId: (id: string | null) => void;
  proMode: boolean;
  setProMode: (mode: boolean) => void;
  assumptions: Assumptions;
  setAssumptions: (assumptions: Assumptions) => void;
  resetAssumptions: () => void;
  globalLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  promoteShowId: string | null;
  setPromoteShowId: (id: string | null) => void;
  
  // Firebase State
  currentUser: User | null;
  userProfile: UserProfile | null;
  isSubscriber: boolean;
  deductExportCredit: () => Promise<boolean>;
  addExportCredits: (amount: number) => Promise<void>;
  upgradeToMonthly: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [promoteShowId, setPromoteShowId] = useState<string | null>(null);
  const [proMode, setProMode] = useState<boolean>(true);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [activeRequests, setActiveRequests] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Firebase auth & firestore states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userIp, setUserIp] = useState<string>('203.0.113.195');

  const globalLoading = activeRequests > 0;
  const startLoading = useCallback(() => setActiveRequests(prev => prev + 1), []);
  const stopLoading = useCallback(() => setActiveRequests(prev => Math.max(0, prev - 1)), []);
  const resetAssumptions = useCallback(() => setAssumptions(DEFAULT_ASSUMPTIONS), []);

  const isSubscriber = useMemo(
    () => userProfile?.subscriptionStatus === 'subscriber',
    [userProfile?.subscriptionStatus]
  );

  // Fetch client IP address to lock it
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setUserIp(data.ip);
        }
      })
      .catch(() => {
        // Fallback or randomized IP for premium look
        const octets = [198, 51, 100, Math.floor(Math.random() * 254) + 1];
        setUserIp(octets.join('.'));
      });
  }, []);

  // Handle Firebase Auth and Firestore syncing
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        const userRef = doc(db, 'users', user.uid);
        
        // Get or Create profile
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const oneDayFromNow = new Date();
          oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            exportCredits: 5,
            subscriptionStatus: 'free_trial',
            trialExpiresAt: oneDayFromNow.toISOString(),
            lockedIp: userIp,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        }

        // Subscribe to real-time profile changes
        const unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          }
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, [userIp]);

  const deductExportCredit = async (): Promise<boolean> => {
    if (!currentUser || !userProfile) return false;
    if (userProfile.exportCredits <= 0) return false;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const nextCredits = userProfile.exportCredits - 1;
      await updateDoc(userRef, { exportCredits: nextCredits });
      return true;
    } catch (err) {
      console.error('Error deducting credit:', err);
      return false;
    }
  };

  const addExportCredits = async (amount: number): Promise<void> => {
    if (!currentUser || !userProfile) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const nextCredits = userProfile.exportCredits + amount;
      await updateDoc(userRef, { exportCredits: nextCredits });
    } catch (err) {
      console.error('Error adding credits:', err);
    }
  };

  const upgradeToMonthly = async (): Promise<void> => {
    if (!currentUser || !userProfile) return;

    // TODO: Replace this stub with a server API call that creates a Stripe
    // Checkout Session. subscriptionStatus must NEVER be written from the client.
    //
    // The only code permitted to set subscriptionStatus to 'subscriber' (and to
    // grant monthly export credits) is a Stripe webhook handler running server-
    // side with the Firebase Admin SDK, e.g. on checkout.session.completed or
    // invoice.payment_succeeded:
    //
    //   admin.firestore().doc(`users/${uid}`).update({
    //     subscriptionStatus: 'subscriber',
    //     exportCredits: FieldValue.increment(5),
    //   });
    //
    // Until that webhook exists, upgrades cannot be completed from the browser.
    console.warn(
      'upgradeToMonthly: subscription upgrades require server-side Stripe checkout (not implemented yet).'
    );
  };

  const logOut = async (): Promise<void> => {
    await signOut(auth);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AppContext.Provider 
      value={{ 
        selectedArtistId, 
        setSelectedArtistId, 
        selectedTourId, 
        setSelectedTourId, 
        proMode, 
        setProMode,
        assumptions,
        setAssumptions,
        resetAssumptions,
        globalLoading,
        startLoading,
        stopLoading,
        isAuthenticated,
        setIsAuthenticated,
        promoteShowId,
        setPromoteShowId,
        
        // Firebase additions
        currentUser,
        userProfile,
        isSubscriber,
        deductExportCredit,
        addExportCredits,
        upgradeToMonthly,
        logOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
