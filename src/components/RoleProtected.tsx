'use client';

import React from 'react';
import { useHasRole, useHasAnyRole, usePermission, useHasAllPermissions, useHasAnyPermission } from '@/hooks/useRole';
import { UserRole, Permission } from '@/types/user';

interface RoleProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Компонент для защиты контента по роли
interface RequireRoleProps extends RoleProtectedProps {
  role: UserRole;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children, fallback = null }) => {
  const hasRole = useHasRole(role);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
};

// Компонент для защиты контента по нескольким ролям (OR)
interface RequireAnyRoleProps extends RoleProtectedProps {
  roles: UserRole[];
}

export const RequireAnyRole: React.FC<RequireAnyRoleProps> = ({ roles, children, fallback = null }) => {
  const hasAnyRole = useHasAnyRole(roles);
  
  return hasAnyRole ? <>{children}</> : <>{fallback}</>;
};

// Компонент для защиты контента по праву доступа
interface RequirePermissionProps extends RoleProtectedProps {
  permission: Permission;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children, fallback = null }) => {
  const hasPermission = usePermission(permission);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Компонент для защиты контента по всем правам доступа (AND)
interface RequireAllPermissionsProps extends RoleProtectedProps {
  permissions: Permission[];
}

export const RequireAllPermissions: React.FC<RequireAllPermissionsProps> = ({ permissions, children, fallback = null }) => {
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
};

// Компонент для защиты контента по любому праву доступа (OR)
interface RequireAnyPermissionProps extends RoleProtectedProps {
  permissions: Permission[];
}

export const RequireAnyPermission: React.FC<RequireAnyPermissionProps> = ({ permissions, children, fallback = null }) => {
  const hasAnyPermission = useHasAnyPermission(permissions);
  
  return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
};

// Компонент только для администраторов
export const AdminOnly: React.FC<RoleProtectedProps> = ({ children, fallback = null }) => {
  return <RequireRole role="admin" fallback={fallback}>{children}</RequireRole>;
};

// Компонент для модераторов и администраторов
export const ModeratorOrAdmin: React.FC<RoleProtectedProps> = ({ children, fallback = null }) => {
  return <RequireAnyRole roles={['admin', 'moderator']} fallback={fallback}>{children}</RequireAnyRole>;
};

// Универсальный компонент для проверки ролей и прав
interface RoleGuardProps extends RoleProtectedProps {
  role?: UserRole;
  roles?: UserRole[];
  permission?: Permission;
  permissions?: Permission[];
  requireAllPermissions?: boolean; // true = AND, false = OR
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  role, 
  roles, 
  permission, 
  permissions, 
  requireAllPermissions = true,
  children, 
  fallback = null 
}) => {
  // Проверка конкретной роли
  if (role) {
    return <RequireRole role={role} fallback={fallback}>{children}</RequireRole>;
  }
  
  // Проверка нескольких ролей
  if (roles) {
    return <RequireAnyRole roles={roles} fallback={fallback}>{children}</RequireAnyRole>;
  }
  
  // Проверка конкретного права
  if (permission) {
    return <RequirePermission permission={permission} fallback={fallback}>{children}</RequirePermission>;
  }
  
  // Проверка нескольких прав
  if (permissions) {
    if (requireAllPermissions) {
      return <RequireAllPermissions permissions={permissions} fallback={fallback}>{children}</RequireAllPermissions>;
    } else {
      return <RequireAnyPermission permissions={permissions} fallback={fallback}>{children}</RequireAnyPermission>;
    }
  }
  
  // Если ничего не указано, показываем контент
  return <>{children}</>;
}; 