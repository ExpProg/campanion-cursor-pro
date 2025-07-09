import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole } from '@/types/user';
import { getAllUsers } from './userService';

/**
 * Назначить роль пользователю по email
 */
export async function setUserRoleByEmail(email: string, role: UserRole): Promise<boolean> {
  try {
    // Найти пользователя по email
    const usersRef = collection(db, 'userProfiles');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error(`Пользователь с email ${email} не найден`);
      return false;
    }
    
    // Обновить роль для найденного пользователя
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'userProfiles', userDoc.id);
    
    await updateDoc(userRef, {
      role: role,
      updatedAt: new Date()
    });
    
    console.log(`Роль ${role} успешно назначена пользователю ${email}`);
    return true;
  } catch (error) {
    console.error('Ошибка при назначении роли:', error);
    return false;
  }
}

/**
 * Сделать пользователя администратором по email
 */
export async function makeUserAdmin(email: string): Promise<boolean> {
  return await setUserRoleByEmail(email, 'admin');
}

/**
 * Получить список всех администраторов
 */
export async function getAdmins(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'userProfiles');
    const q = query(usersRef, where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        photoURL: data.photoURL || undefined,
        role: data.role as UserRole,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Ошибка при получении списка админов:', error);
    return [];
  }
}

// Для использования в консоли разработчика
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.adminUtils = {
    makeUserAdmin,
    setUserRoleByEmail,
    getAdmins,
    getAllUsers,
    
    // Быстрое назначение амorneff@gmail.com админом
    makeAmorneffAdmin: () => makeUserAdmin('amorneff@gmail.com'),
    
    // Быстрые ссылки для разработчиков
    goToTest: () => window.location.href = '/test-registration',
    goToAdmin: () => window.location.href = '/admin',
    goToUsers: () => window.location.href = '/admin/users',
    
    // Помощь
    help: () => {
      console.log(`
🛠️ Административные утилиты:

📝 Управление ролями:
- window.adminUtils.makeUserAdmin('email@example.com')
- window.adminUtils.setUserRoleByEmail('email@example.com', 'admin')
- window.adminUtils.makeAmorneffAdmin()
- window.adminUtils.getAdmins()
- window.adminUtils.getAllUsers()

📍 Быстрые переходы:
- window.adminUtils.goToTest()    // Тестирование регистрации
- window.adminUtils.goToAdmin()   // Админ-панель  
- window.adminUtils.goToUsers()   // Управление пользователями

🔍 Отладка:
- window.adminUtils.help()        // Эта помощь
      `);
    }
  };
  
  // Показываем помощь при загрузке (только в dev режиме)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Административные утилиты загружены! Введите window.adminUtils.help() для справки.');
  }
} 