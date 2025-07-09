'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Shield, UserCheck, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, UserRole } from '@/types/user';
import { getAllUsers, updateUserProfile } from '@/lib/userService';
import { AdminOnly } from '@/components/RoleProtected';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  moderator: 'Модератор',
  user: 'Пользователь',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  moderator: 'bg-blue-100 text-blue-800 border-blue-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      setUpdating(uid);
      await updateUserProfile(uid, { role: newRole });
      
      // Обновляем локальное состояние
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === uid ? { ...user, role: newRole } : user
        )
      );
      
      toast.success('Роль пользователя обновлена');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Ошибка обновления роли');
    } finally {
      setUpdating(null);
    }
  };

  const getUserInitials = (displayName?: string, email?: string) => {
    if (displayName) {
      return displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'П';
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  return (
    <AdminOnly 
      fallback={
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Доступ запрещен
            </CardTitle>
            <CardDescription>
              У вас нет прав доступа к управлению ролями
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Статистика ролей */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{ROLE_LABELS[role]}</p>
                    <p className="text-2xl font-bold">{roleStats[role] || 0}</p>
                  </div>
                  <div className="p-2 rounded-full bg-primary/10">
                    {role === 'admin' && <Shield className="h-5 w-5 text-red-600" />}
                    {role === 'moderator' && <UserCheck className="h-5 w-5 text-blue-600" />}
                    {role === 'user' && <Users className="h-5 w-5 text-gray-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Управление пользователями */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Управление ролями пользователей
                </CardTitle>
                <CardDescription>
                  Всего пользователей: {users.length}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadUsers} 
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Поиск */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по email или имени..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Список пользователей */}
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Загрузка пользователей...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div 
                    key={user.uid} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {user.photoURL && (
                          <AvatarImage 
                            src={user.photoURL} 
                            alt={user.displayName || user.email}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <AvatarFallback className="text-sm">
                          {getUserInitials(user.displayName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.displayName || 'Без имени'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={ROLE_COLORS[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) => handleRoleChange(user.uid, newRole)}
                        disabled={updating === user.uid}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Пользователь</SelectItem>
                          <SelectItem value="moderator">Модератор</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {updating === user.uid && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}; 