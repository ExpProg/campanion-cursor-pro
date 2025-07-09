import { updateUserProfile, getAllUsers } from './userService';

/**
 * Утилита для назначения роли администратора первому пользователю
 * Используется для начальной настройки системы
 */
export async function setupFirstAdmin(userUid: string): Promise<boolean> {
  try {
    // Проверяем, есть ли уже администраторы в системе
    const allUsers = await getAllUsers();
    const existingAdmins = allUsers.filter(user => user.role === 'admin');
    
    if (existingAdmins.length > 0) {
      console.log('Администраторы уже существуют в системе');
      return false;
    }
    
    // Назначаем роль администратора указанному пользователю
    await updateUserProfile(userUid, { role: 'admin' });
    console.log('Роль администратора успешно назначена');
    return true;
  } catch (error) {
    console.error('Ошибка при назначении роли администратора:', error);
    return false;
  }
}

/**
 * Принудительное назначение роли администратора (используйте осторожно!)
 */
export async function forceSetAdmin(userUid: string): Promise<boolean> {
  try {
    await updateUserProfile(userUid, { role: 'admin' });
    console.log('Роль администратора принудительно назначена');
    return true;
  } catch (error) {
    console.error('Ошибка при принудительном назначении роли администратора:', error);
    return false;
  }
}

/**
 * Инструкции для первоначальной настройки
 */
export const SETUP_INSTRUCTIONS = `
# Настройка ролевой системы

## Первое назначение администратора

1. Войдите в приложение через любой аккаунт (email/пароль или Google)
2. Откройте консоль разработчика (F12)
3. Выполните следующую команду:

\`\`\`javascript
// Получите UID текущего пользователя
const uid = firebase.auth().currentUser?.uid;

// Назначьте роль администратора
import { forceSetAdmin } from '@/lib/setupAdmin';
await forceSetAdmin(uid);

// Обновите страницу
window.location.reload();
\`\`\`

## Альтернативный способ через Firebase Console

1. Откройте Firebase Console
2. Перейдите в Firestore Database
3. Найдите коллекцию 'userProfiles'
4. Найдите документ с вашим UID
5. Измените поле 'role' на 'admin'
6. Сохраните изменения

## После назначения администратора

- В Header появится ваша роль
- В Sidebar появится пункт "Админ-панель"
- В админ-панели будет доступно "Управление пользователями"
- Вы сможете назначать роли другим пользователям

## Роли в системе

- **admin**: Полный доступ ко всем функциям
- **moderator**: Управление кэмпами и событиями, просмотр админ-панели
- **user**: Базовые функции, управление только своими событиями
`;

// Для использования в консоли разработчика
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.setupAdmin = {
    setupFirstAdmin,
    forceSetAdmin,
    instructions: SETUP_INSTRUCTIONS
  };
} 