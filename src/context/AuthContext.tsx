import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import {
  createInitialUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../lib/firestoreService';
import type { ExperienceLevel, PreferredLanguage, UserProfile } from '../../shared/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfilePreferences: (updates: {
    displayName: string;
    experienceLevel: ExperienceLevel;
    preferredLanguage: PreferredLanguage;
    learningGoal: string;
    onboardingCompleted?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const existing = await getUserProfile(firebaseUser.uid);
    if (existing) {
      setProfile(existing);
      return existing;
    }
    const created = await createInitialUserProfile({
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner',
      email: firebaseUser.email || '',
    });
    setProfile(created);
    return created;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError(null);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        await loadOrCreateProfile(firebaseUser);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to load learner profile.';
        setAuthError(msg);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);
    const cred = await signInWithPopup(auth, googleProvider);
    return loadOrCreateProfile(cred.user);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!auth.currentUser) return;
    const latest = await getUserProfile(auth.currentUser.uid);
    if (latest) setProfile(latest);
  };

  const saveProfilePreferences = async (updates: {
    displayName: string;
    experienceLevel: ExperienceLevel;
    preferredLanguage: PreferredLanguage;
    learningGoal: string;
    onboardingCompleted?: boolean;
  }): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to save profile preferences.');
    }
    await updateUserProfile(auth.currentUser.uid, updates);
    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signInWithGoogle,
        logout,
        refreshProfile,
        saveProfilePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
