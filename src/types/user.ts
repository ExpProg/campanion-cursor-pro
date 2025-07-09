export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: UserRole; // По умолчанию будет 'user'
}

export interface UpdateUserProfileData {
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
}

// Права доступа для разных ролей
export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageCamps: true,
    canManageEvents: true,
    canViewAdminPanel: true,
    canDeleteCamps: true,
    canEditAllCamps: true,
  },
  moderator: {
    canManageUsers: false,
    canManageCamps: true,
    canManageEvents: true,
    canViewAdminPanel: true,
    canDeleteCamps: false,
    canEditAllCamps: true,
  },
  user: {
    canManageUsers: false,
    canManageCamps: false,
    canManageEvents: true, // Только свои события
    canViewAdminPanel: false,
    canDeleteCamps: false,
    canEditAllCamps: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin; 