'use client';

import { Bell, Search, LogOut, LogIn, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { AuthForm } from '@/components/AuthForm';
import { toast } from 'sonner';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/user';
import Image from 'next/image';

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

export function Header() {
  const { user, userProfile, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  const isCurrentRoutePublic = isPublicRoute(pathname);

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'Администратор',
      moderator: 'Модератор', 
      user: 'Пользователь',
    };
    return labels[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role];
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы вышли из аккаунта');
    } catch {
      toast.error('Ошибка при выходе');
    }
  };

  const getUserInitials = (displayName?: string | null, email?: string | null) => {
    if (displayName) {
      return displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'П';
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email || 'Пользователь';
  };

  // Показываем бургер-кнопку, если пользователь авторизован или на публичных страницах
  const showBurgerMenu = user || isCurrentRoutePublic;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть - бургер-кнопка и лого */}
          <div className="flex items-center gap-3">
            {/* Бургер-кнопка */}
            {showBurgerMenu && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="p-2 hover:bg-muted"
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            

            
            {/* Лого и название */}
            <Link 
              href="/camps" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[40px]">
                <span role="img" aria-label="Палатка">🏕️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">Campanion Pro</h1>
                <p className="text-xs text-muted-foreground">
                  {isCurrentRoutePublic ? 'Кэмпы и мероприятия для всех возрастов' : 'Управление мероприятиями'}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold text-foreground">Campanion</h1>
              </div>
            </Link>
          </div>

          {/* Центральная часть - поиск */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по сайту..."
                className="pl-10 bg-background/50"
              />
            </div>
          </div>

          {/* Правая часть - уведомления и профиль / кнопка входа */}
          <div className="flex items-center gap-3">
            {user ? (
              // Авторизованный пользователь
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                      <Avatar className="h-8 w-8">
                        {user?.photoURL && (
                          <AvatarImage 
                            src={user.photoURL} 
                            alt={getUserDisplayName()}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user?.displayName, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-foreground">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        {user?.photoURL && (
                          <AvatarImage 
                            src={user.photoURL} 
                            alt={getUserDisplayName()}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user?.displayName, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 flex-1">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        {userProfile?.role && (
                          <Badge className={`text-xs w-fit ${getRoleColor(userProfile.role)}`}>
                            {getRoleLabel(userProfile.role)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Неавторизованный пользователь на публичной странице
              isCurrentRoutePublic && (
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <LogIn className="mr-2 h-4 w-4" />
                      Войти
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">Авторизация</DialogTitle>
                    <AuthForm onClose={() => setAuthDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 