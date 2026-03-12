import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // User exists in Auth but not in Firestore (shouldn't happen with our login flow)
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time updates to the user profile
  useEffect(() => {
    if (user?.id) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.id), (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.data() as User);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  const loginWithGoogle = async (role: UserRole) => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        role: role,
        avatar: firebaseUser.photoURL || undefined,
        created_at: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      setUser(newUser);
    } else {
      setUser(userDoc.data() as User);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
