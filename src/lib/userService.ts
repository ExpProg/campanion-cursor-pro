import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, CreateUserProfileData, UpdateUserProfileData, UserRole } from '@/types/user';

const USERS_COLLECTION = 'userProfiles';

// Создание профиля пользователя
export async function createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
  console.log('💾 Сохраняем профиль пользователя в Firestore:', data);
  
  const userRef = doc(db, USERS_COLLECTION, data.uid);
  
  const profileData = {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    role: data.role || 'user' as UserRole,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  console.log('📊 Данные для сохранения в Firestore:', profileData);
  
  try {
    await setDoc(userRef, profileData);
    console.log('✅ Профиль успешно сохранен в Firestore');
  } catch (error) {
    console.error('❌ Ошибка сохранения профиля в Firestore:', error);
    throw error;
  }
  
  // Возвращаем профиль с датами как Date объекты
  const resultProfile = {
    ...profileData,
    displayName: profileData.displayName || undefined,
    photoURL: profileData.photoURL || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  console.log('📤 Возвращаем созданный профиль:', resultProfile);
  return resultProfile;
}

// Получение профиля пользователя
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName || undefined,
      photoURL: data.photoURL || undefined,
      role: data.role as UserRole,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Обновление профиля пользователя
export async function updateUserProfile(uid: string, data: UpdateUserProfileData): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  
  await updateDoc(userRef, updateData);
}

// Получение всех пользователей (для админки)
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        photoURL: data.photoURL || undefined,
        role: data.role as UserRole,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Получение пользователей по роли
export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        photoURL: data.photoURL || undefined,
        role: data.role as UserRole,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error('Error getting users by role:', error);
    return [];
  }
}

// Проверка существования профиля
export async function userProfileExists(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user profile existence:', error);
    return false;
  }
}

// Создание профиля если его нет
export async function ensureUserProfile(
  uid: string, 
  email: string, 
  displayName?: string, 
  photoURL?: string
): Promise<UserProfile> {
  console.log('🔍 Проверяем существование профиля для пользователя:', uid);
  
  const existingProfile = await getUserProfile(uid);
  
  if (existingProfile) {
    console.log('✅ Профиль пользователя уже существует:', existingProfile);
    return existingProfile;
  }
  
  console.log('📝 Создаем новый профиль пользователя:', {
    uid,
    email,
    displayName,
    photoURL,
    role: 'user'
  });
  
  // Создаем новый профиль
  const newProfile = await createUserProfile({
    uid,
    email,
    displayName,
    photoURL,
    role: 'user', // По умолчанию обычный пользователь
  });
  
  console.log('✅ Новый профиль пользователя создан:', newProfile);
  return newProfile;
} 