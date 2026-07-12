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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('auth_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      // If we already have a cached user, we can bypass showing the loading spinner on page reload!
      // This makes the app feel incredibly fast ("liviana y rápida").
      return !localStorage.getItem('auth_user');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'Logged in' : 'Logged out');
      if (currentUser) {
        // Cache basic user fields
        const minimalUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        };
        setUser(currentUser);
        localStorage.setItem('auth_user', JSON.stringify(minimalUser));

        try {
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            let finalProfile = data;
            if (currentUser.email === 'betojp24@gmail.com' && data.role !== 'admin') {
              console.log('Promoting site owner to admin...');
              try {
                await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
                finalProfile = { ...data, role: 'admin' };
              } catch (updateErr) {
                console.error('Error promoting owner to admin:', updateErr);
              }
            }
            setUserProfile(finalProfile);
            localStorage.setItem('auth_user_profile', JSON.stringify(finalProfile));
          } else {
            console.log('No profile found, creating default (likely Google login)...');
            const names = (currentUser.displayName || '').split(' ');
            const firstName = names[0] || 'Nuevo';
            const lastName = names.slice(1).join(' ') || 'Estudiante';
            
            const newProfile = {
              firstName,
              lastName,
              email: currentUser.email,
              role: currentUser.email === 'betojp24@gmail.com' ? 'admin' : 'student',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            setUserProfile(newProfile);
            localStorage.setItem('auth_user_profile', JSON.stringify(newProfile));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_profile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      const minimalUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      localStorage.setItem('auth_user', JSON.stringify(minimalUser));
    }
  };

  const signUpWithEmail = async (email: string, password: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const currentUser = userCredential.user;
    
    await updateProfile(currentUser, {
      displayName: `${profileData.firstName} ${profileData.lastName}`
    });

    const newProfile = {
      ...profileData,
      email,
      role: email === 'betojp24@gmail.com' ? 'admin' : 'student',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', currentUser.uid), newProfile);
    setUser(currentUser);
    setUserProfile(newProfile);
    
    const minimalUser = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: `${profileData.firstName} ${profileData.lastName}`,
      photoURL: null
    };
    localStorage.setItem('auth_user', JSON.stringify(minimalUser));
    localStorage.setItem('auth_user_profile', JSON.stringify(newProfile));
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user) {
      const minimalUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      localStorage.setItem('auth_user', JSON.stringify(minimalUser));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_user_profile');
  };

  const refreshProfile = async () => {
    if (user) {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setUserProfile(data);
        localStorage.setItem('auth_user_profile', JSON.stringify(data));
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
