'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRole } from '@/hooks/useRole';
import { getAllUsers } from '@/lib/userService';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export const RegistrationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { register, user, userProfile } = useAuth();
  const { userRole, isAuthenticated } = useAuthRole();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast.error('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      console.log('🎯 Начинаем тестовую регистрацию:', { email, displayName });
      await register(email, password, displayName);
      toast.success('Регистрация успешна! Проверьте консоль для деталей.');
      
      // Очищаем форму
      setEmail('');
      setPassword('');
      setDisplayName('');
      
      // Загружаем обновленный список пользователей
      setTimeout(() => {
        loadAllUsers();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Ошибка регистрации:', error);
      toast.error(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      console.log('📋 Загружен список пользователей:', users);
      toast.success(`Загружено ${users.length} пользователей`);
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoadingUsers(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Информация о текущем пользователе */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Текущий пользователь</CardTitle>
            <CardDescription>Информация о авторизованном пользователе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Имя:</strong> {user?.displayName || 'Не указано'}</p>
              <p><strong>UID:</strong> {user?.uid}</p>
              <div className="flex items-center gap-2">
                <strong>Роль:</strong>
                {userRole && (
                  <Badge className={getRoleColor(userRole)}>
                    {userRole}
                  </Badge>
                )}
              </div>
              <p><strong>Профиль создан:</strong> {userProfile?.createdAt?.toLocaleString() || 'Не указано'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Форма регистрации */}
      <Card>
        <CardHeader>
          <CardTitle>Тест регистрации</CardTitle>
          <CardDescription>
            Тестирование автоматического создания профиля пользователя с ролью 'user'
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="displayName">Имя</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Иван Иванов"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Список всех пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Все пользователи в базе данных</CardTitle>
          <CardDescription>
            Проверка созданных профилей пользователей
          </CardDescription>
          <Button onClick={loadAllUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Загружаем...' : 'Обновить список'}
          </Button>
        </CardHeader>
        <CardContent>
          {allUsers.length === 0 ? (
            <p className="text-muted-foreground">Пользователи не найдены. Нажмите "Обновить список".</p>
          ) : (
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user.uid} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.displayName || 'Без имени'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">UID: {user.uid}</p>
                      <p className="text-xs text-muted-foreground">
                        Создан: {user.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 