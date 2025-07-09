'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types/user';

// Хук для получения роли пользователя
export function useUserRole(): UserRole | null {
  const { userProfile } = useAuth();
  return userProfile?.role || null;
}

// Хук для проверки конкретной роли
export function useHasRole(role: UserRole): boolean {
  const userRole = useUserRole();
  return userRole === role;
}

// Хук для проверки нескольких ролей
export function useHasAnyRole(roles: UserRole[]): boolean {
  const userRole = useUserRole();
  return userRole ? roles.includes(userRole) : false;
}

// Хук для проверки прав доступа
export function usePermission(permission: Permission): boolean {
  const userRole = useUserRole();
  
  if (!userRole) {
    return false;
  }
  
  return ROLE_PERMISSIONS[userRole][permission];
}

// Хук для проверки нескольких прав доступа
export function usePermissions(permissions: Permission[]): boolean[] {
  const userRole = useUserRole();
  
  if (!userRole) {
    return permissions.map(() => false);
  }
  
  return permissions.map(permission => ROLE_PERMISSIONS[userRole][permission]);
}

// Хук для проверки всех прав доступа (AND)
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const userRole = useUserRole();
  
  if (!userRole) {
    return false;
  }
  
  return permissions.every(permission => ROLE_PERMISSIONS[userRole][permission]);
}

// Хук для проверки любого права доступа (OR)
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const userRole = useUserRole();
  
  if (!userRole) {
    return false;
  }
  
  return permissions.some(permission => ROLE_PERMISSIONS[userRole][permission]);
}

// Хук для получения всех прав доступа текущего пользователя
export function useUserPermissions() {
  const userRole = useUserRole();
  
  if (!userRole) {
    return {};
  }
  
  return ROLE_PERMISSIONS[userRole];
}

// Хук для проверки прав администратора
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

// Хук для проверки прав модератора или администратора
export function useIsModerator(): boolean {
  return useHasAnyRole(['admin', 'moderator']);
}

// Хук для проверки авторизации и роли
export function useAuthRole() {
  const { user, userProfile, loading } = useAuth();
  const userRole = useUserRole();
  const isAdmin = useIsAdmin();
  const isModerator = useIsModerator();
  const permissions = useUserPermissions();
  
  return {
    user,
    userProfile,
    userRole,
    isAuthenticated: !!user,
    isAdmin,
    isModerator,
    permissions,
    loading,
    hasRole: useHasRole,
    hasAnyRole: useHasAnyRole,
    hasPermission: usePermission,
    hasAllPermissions: useHasAllPermissions,
    hasAnyPermission: useHasAnyPermission,
  };
} 