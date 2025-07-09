'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { UserProfile, UserRole } from '@/types/user';
import { ensureUserProfile, getUserProfile } from '@/lib/userService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Загрузка профиля пользователя
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      console.log('🔄 Загружаем профиль пользователя:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      const profile = await ensureUserProfile(
        firebaseUser.uid,
        firebaseUser.email!,
        firebaseUser.displayName || undefined,
        firebaseUser.photoURL || undefined
      );
      
      console.log('✅ Профиль пользователя загружен/создан:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля пользователя:', error);
      setUserProfile(null);
    }
  };

  // Обновление профиля пользователя
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    console.log('🚀 Начинаем вход через Google');
    
    const provider = new GoogleAuthProvider();
    // Добавляем дополнительные scopes если нужно
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    
    if (result.user) {
      console.log('✅ Google пользователь авторизован:', result.user.uid);
      
      // Принудительно создаем/обновляем профиль пользователя в Firestore
      try {
        const profile = await ensureUserProfile(
          result.user.uid,
          result.user.email!,
          result.user.displayName || undefined,
          result.user.photoURL || undefined
        );
        console.log('✅ Профиль Google пользователя обработан в Firestore:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('❌ Ошибка обработки Google профиля в Firestore:', error);
        // Не бросаем ошибку, так как пользователь уже авторизован
      }
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    console.log('🚀 Начинаем регистрацию пользователя:', email);
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      console.log('✅ Firebase пользователь создан:', result.user.uid);
      
      // Обновляем displayName в Firebase Auth
      await updateProfile(result.user, { displayName });
      console.log('✅ DisplayName обновлен:', displayName);
      
      // Перезагружаем данные пользователя для получения обновленного displayName
      await result.user.reload();
      
      // Принудительно создаем профиль пользователя в Firestore
      try {
        const profile = await ensureUserProfile(
          result.user.uid,
          result.user.email!,
          displayName, // Используем переданный displayName напрямую
          result.user.photoURL || undefined
        );
        console.log('✅ Профиль пользователя создан в Firestore:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('❌ Ошибка создания профиля в Firestore:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/camps');
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 