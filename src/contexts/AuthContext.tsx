import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, profileData: any) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
      setUser(user);
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (user.email === 'betojp24@gmail.com' && data.role !== 'admin') {
              console.log('Promoting site owner to admin...');
              try {
                await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
                setUserProfile({ ...data, role: 'admin' });
              } catch (updateErr) {
                console.error('Error promoting owner to admin:', updateErr);
                setUserProfile(data);
              }
            } else {
              setUserProfile(data);
            }
          } else {
            console.log('No profile found, creating default (likely Google login)...');
            const names = (user.displayName || '').split(' ');
            const firstName = names[0] || 'Nuevo';
            const lastName = names.slice(1).join(' ') || 'Estudiante';
            
            const newProfile = {
              firstName,
              lastName,
              email: user.email,
              role: user.email === 'betojp24@gmail.com' ? 'admin' : 'student',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (email: string, password: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, {
      displayName: `${profileData.firstName} ${profileData.lastName}`
    });

    const newProfile = {
      ...profileData,
      email,
      role: email === 'betojp24@gmail.com' ? 'admin' : 'student',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      login, 
      signUpWithEmail, 
      signInWithEmail, 
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
