# Настройка ролевой системы

## Обзор

В приложении реализована полноценная ролевая система с тремя уровнями доступа:

- **admin**: Полный доступ ко всем функциям
- **moderator**: Управление кэмпами и событиями, просмотр админ-панели  
- **user**: Базовые функции, управление только своими событиями

## Структура файлов

```
src/
├── types/user.ts              # Типы для ролевой системы
├── lib/userService.ts         # Сервис для работы с профилями пользователей
├── lib/setupAdmin.ts          # Утилиты для первоначальной настройки
├── contexts/AuthContext.tsx   # Расширенный контекст аутентификации
├── hooks/useRole.ts           # Хуки для проверки ролей и прав
├── components/
│   ├── RoleProtected.tsx      # Компоненты защиты контента по ролям
│   └── UserRoleManager.tsx    # Компонент управления ролями пользователей
└── app/admin/users/page.tsx   # Страница управления пользователями
```

## Firebase Firestore правила

Обновите правила безопасности в Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для коллекции camps
    match /camps/{campId} {
      allow read: if true; // Публичное чтение
      allow write: if request.auth != null;
    }
    
    // Правила для коллекции events
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.uid == resource.data.userId || 
                       request.auth.uid == request.resource.data.userId);
    }
    
    // Правила для коллекции userProfiles
    match /userProfiles/{userId} {
      // Читать могут все авторизованные пользователи
      allow read: if request.auth != null;
      
      // Создавать может только сам пользователь (при регистрации)
      allow create: if request.auth != null && 
                       request.auth.uid == userId &&
                       request.resource.data.role == 'user'; // По умолчанию роль 'user'
      
      // Обновлять может сам пользователь (кроме роли) или админ
      allow update: if request.auth != null && (
        // Пользователь может обновить свой профиль, но не роль
        (request.auth.uid == userId && 
         !('role' in request.resource.data.diff(resource.data))) ||
        // Админ может обновить любой профиль (проверяем роль в отдельном запросе)
        isAdmin(request.auth.uid)
      );
      
      // Удалять может только админ
      allow delete: if request.auth != null && isAdmin(request.auth.uid);
    }
    
    // Функция проверки роли администратора
    function isAdmin(uid) {
      return exists(/databases/$(database)/documents/userProfiles/$(uid)) &&
             get(/databases/$(database)/documents/userProfiles/$(uid)).data.role == 'admin';
    }
    
    // Правила для других коллекций
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Первое назначение администратора

### Вариант 1: Через консоль разработчика

1. Войдите в приложение через любой аккаунт
2. Откройте консоль разработчика (F12)
3. Выполните команду:

```javascript
// Получите UID текущего пользователя
console.log('Ваш UID:', firebase.auth().currentUser?.uid);

// Если setupAdmin доступен в window (в development режиме)
if (window.setupAdmin) {
  const uid = firebase.auth().currentUser?.uid;
  await window.setupAdmin.forceSetAdmin(uid);
  window.location.reload();
}
```

### Вариант 2: Через Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект
3. Перейдите в **Firestore Database**
4. Найдите коллекцию `userProfiles`
5. Найдите документ с вашим UID пользователя
6. Измените поле `role` с `user` на `admin`
7. Сохраните изменения
8. Обновите страницу приложения

### Вариант 3: Программно при регистрации

Можно изменить логику в `AuthContext.tsx` для автоматического назначения админа:

```typescript
// В функции loadUserProfile добавьте проверку
const profile = await ensureUserProfile(
  firebaseUser.uid,
  firebaseUser.email!,
  firebaseUser.displayName || undefined,
  firebaseUser.photoURL || undefined
);

// Если это первый пользователь, делаем его админом
const allUsers = await getAllUsers();
if (allUsers.length === 1) {
  await updateUserProfile(firebaseUser.uid, { role: 'admin' });
  // Перезагружаем профиль
  const updatedProfile = await getUserProfile(firebaseUser.uid);
  setUserProfile(updatedProfile);
} else {
  setUserProfile(profile);
}
```

## Использование компонентов защиты

### Основные компоненты

```tsx
import { 
  RequireRole, 
  RequireAnyRole, 
  RequirePermission,
  AdminOnly,
  ModeratorOrAdmin,
  RoleGuard 
} from '@/components/RoleProtected';

// Только для администраторов
<AdminOnly fallback={<div>Нет доступа</div>}>
  <AdminContent />
</AdminOnly>

// Для админов или модераторов  
<ModeratorOrAdmin>
  <ModeratorContent />
</ModeratorOrAdmin>

// По конкретной роли
<RequireRole role="admin">
  <AdminOnlyButton />
</RequireRole>

// По нескольким ролям
<RequireAnyRole roles={['admin', 'moderator']}>
  <ManagementPanel />
</RequireAnyRole>

// По правам доступа
<RequirePermission permission="canDeleteCamps">
  <DeleteButton />
</RequirePermission>

// Универсальный компонент
<RoleGuard 
  roles={['admin', 'moderator']} 
  fallback={<div>Нет прав</div>}
>
  <ProtectedContent />
</RoleGuard>
```

### Хуки для проверки ролей

```tsx
import { 
  useUserRole, 
  useIsAdmin, 
  useIsModerator,
  usePermission,
  useAuthRole 
} from '@/hooks/useRole';

function MyComponent() {
  const userRole = useUserRole(); // 'admin' | 'moderator' | 'user' | null
  const isAdmin = useIsAdmin(); // boolean
  const canDelete = usePermission('canDeleteCamps'); // boolean
  
  const { 
    isAuthenticated, 
    permissions, 
    hasRole 
  } = useAuthRole();
  
  if (!isAuthenticated) return <Login />;
  
  return (
    <div>
      <p>Ваша роль: {userRole}</p>
      {canDelete && <DeleteButton />}
      {hasRole('admin') && <AdminSettings />}
    </div>
  );
}
```

## Права доступа по ролям

```typescript
const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,      // Управление пользователями
    canManageCamps: true,      // Управление кэмпами  
    canManageEvents: true,     // Управление событиями
    canViewAdminPanel: true,   // Доступ к админ-панели
    canDeleteCamps: true,      // Удаление кэмпов
    canEditAllCamps: true,     // Редактирование всех кэмпов
  },
  moderator: {
    canManageUsers: false,
    canManageCamps: true,
    canManageEvents: true,
    canViewAdminPanel: true,
    canDeleteCamps: false,     // Модераторы не могут удалять
    canEditAllCamps: true,
  },
  user: {
    canManageUsers: false,
    canManageCamps: false,
    canManageEvents: true,     // Только свои события
    canViewAdminPanel: false,
    canDeleteCamps: false,
    canEditAllCamps: false,
  },
};
```

## Управление пользователями

После назначения администратора:

1. **Доступ к управлению**: `/admin/users`
2. **Статистика ролей**: Автоматический подсчет пользователей по ролям
3. **Поиск пользователей**: По email или имени
4. **Изменение ролей**: Dropdown для быстрого изменения
5. **Индикаторы**: Цветовые бейджи для ролей

## Безопасность

### Клиентская защита
- Все компоненты проверяют роли на клиенте
- Навигация скрывается для неавторизованных действий
- API запросы проверяются на сервере

### Серверная защита  
- Firebase Security Rules проверяют права на уровне базы данных
- Роли хранятся в защищенной коллекции `userProfiles`
- Изменение ролей доступно только администраторам

### Рекомендации
- Регулярно проверяйте список администраторов
- Используйте принцип минимальных привилегий
- Логируйте изменения ролей пользователей

## Тестирование

1. **Создайте тестовых пользователей** с разными ролями
2. **Проверьте доступ** к различным функциям
3. **Протестируйте защищенные маршруты**
4. **Убедитесь в корректности Firebase Rules**

## Troubleshooting

### Не показывается админ-панель
- Проверьте роль в Header (должна отображаться)
- Обновите страницу после изменения роли
- Проверьте консоль на ошибки

### Ошибки прав доступа
- Убедитесь что Firebase Rules обновлены
- Проверьте что профиль пользователя создан в Firestore
- Проверьте токены аутентификации

### Не работает изменение ролей
- Убедитесь что у вас роль admin
- Проверьте подключение к Firestore
- Проверьте правила безопасности для userProfiles 