'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AuthFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !displayName)) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Успешный вход!');
      } else {
        await register(email, password, displayName);
        toast.success('Аккаунт создан!');
      }
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code === 'auth/user-not-found' 
        ? 'Пользователь не найден'
        : err.code === 'auth/wrong-password'
        ? 'Неверный пароль'
        : err.code === 'auth/email-already-in-use'
        ? 'Email уже используется'
        : err.code === 'auth/weak-password'
        ? 'Пароль слишком слабый'
        : err.code === 'auth/invalid-email'
        ? 'Неверный формат email'
        : err.message || 'Произошла ошибка. Попробуйте снова.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Успешный вход через Google!');
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code === 'auth/popup-closed-by-user'
        ? 'Окно входа было закрыто'
        : err.code === 'auth/popup-blocked'
        ? 'Всплывающее окно заблокировано браузером'
        : err.code === 'auth/cancelled-popup-request'
        ? 'Запрос отменен'
        : err.message || 'Ошибка при входе через Google';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? 'Вход' : 'Регистрация'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            <span className="ml-2">Войти через Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Введите ваше имя"
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>
        </div>
        
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Нужен аккаунт? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 