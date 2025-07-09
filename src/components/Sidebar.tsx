'use client';

import { Calendar, Tent, Home, LogIn, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback, memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { AuthForm } from '@/components/AuthForm';
import { usePermission } from '@/hooks/useRole';
import { useState } from 'react';

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

const protectedMenuItems = [
  {
    title: 'Главная',
    href: '/home',
    icon: Home,
  },
  {
    title: 'Мероприятия',
    href: '/events',
    icon: Calendar,
  },
  {
    title: 'Кэмпы',
    href: '/camps',
    icon: Tent,
  },
  {
    title: 'Админ-панель',
    href: '/admin',
    icon: Settings,
  },
];

const publicMenuItems = [
  {
    title: 'Кэмпы',
    href: '/camps',
    icon: Tent,
  },
];

// Мемоизированный компонент для отдельного пункта меню
const SidebarItem = memo(({ item, isActive, onItemClick }: {
  item: typeof protectedMenuItems[0];
  isActive: boolean;
  onItemClick: () => void;
}) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onItemClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
        "hover:bg-muted/50",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{item.title}</span>
    </Link>
  );
});

SidebarItem.displayName = 'SidebarItem';

export const Sidebar = memo(() => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const canViewAdminPanel = usePermission('canViewAdminPanel');

  const isCurrentRoutePublic = isPublicRoute(pathname);

  // Закрываем сайдбар при изменении роута
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Закрываем сайдбар при клике на Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeSidebar]);

  // Блокируем скролл body когда сайдбар открыт
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Определяем какие пункты меню показывать
  const menuItems = useMemo(() => {
    if (user) {
      // Авторизованный пользователь видит пункты в зависимости от прав
      return protectedMenuItems.filter(item => {
        if (item.href === '/admin') {
          return canViewAdminPanel; // Админ-панель только для пользователей с правами
        }
        return true; // Остальные пункты доступны всем авторизованным
      });
    } else if (isCurrentRoutePublic) {
      return publicMenuItems; // Неавторизованный на публичной странице видит только кэмпы
    }
    return []; // На защищенных страницах неавторизованный не видит sidebar
  }, [user, isCurrentRoutePublic, canViewAdminPanel]);

  // Обработчик клика по пункту меню
  const handleItemClick = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  // Стабильные элементы меню
  const navItems = useMemo(() => {
    return menuItems.map((item) => (
      <SidebarItem
        key={item.href}
        item={item}
        isActive={pathname === item.href || (pathname === '/' && item.href === '/camps')}
        onItemClick={handleItemClick}
      />
    ));
  }, [pathname, menuItems, handleItemClick]);

  // Не показываем sidebar на защищенных страницах для неавторизованных пользователей
  if (!user && !isCurrentRoutePublic) {
    return null;
  }

  return (
    <>
      {/* Backdrop/Overlay - показываем только когда сайдбар открыт */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out",
          // Скрыт по умолчанию, показывается только когда isOpen = true
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header с кнопкой закрытия */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Меню</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={closeSidebar}
              className="p-2"
              aria-label="Закрыть меню"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Навигация */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navItems}
            </nav>

            {/* Кнопка входа для неавторизованных пользователей на публичных страницах */}
            {!user && isCurrentRoutePublic && (
              <div className="mt-6 pt-4 border-t border-border">
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full gap-3"
                      onClick={() => {
                        setAuthDialogOpen(true);
                        closeSidebar();
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      Войти в аккаунт
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">Авторизация</DialogTitle>
                    <AuthForm onClose={() => setAuthDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Footer с информацией */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Campanion Pro
              <br />
              {isCurrentRoutePublic ? 'Кэмпы и мероприятия для всех возрастов' : 'Управление мероприятиями'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar'; 