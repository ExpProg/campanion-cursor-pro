'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Функция для проверки публичных маршрутов
const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = ['/', '/camps'];
  const publicPatterns = ['/camps/']; // Поддержка динамических роутов /camps/[id]
  
  // Точное совпадение с публичными роутами
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // Проверка паттернов для динамических роутов
  return publicPatterns.some(pattern => pathname.startsWith(pattern));
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Проверяем, является ли текущий маршрут публичным
  const isCurrentRoutePublic = isPublicRoute(pathname);

  // Перенаправляем неавторизованных пользователей с защищенных страниц на кэмпы
  useEffect(() => {
    if (!loading && !user && !isCurrentRoutePublic) {
      router.push('/camps');
    }
  }, [user, loading, isCurrentRoutePublic, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  // Если это публичный маршрут, показываем контент без проверки аутентификации
  if (isCurrentRoutePublic) {
    return <>{children}</>;
  }

  // Для защищенных маршрутов требуем аутентификацию
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <AuthForm />
      </div>
    );
  }

  return <>{children}</>;
}; 