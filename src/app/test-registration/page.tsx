import { RegistrationTest } from '@/components/RegistrationTest';

export default function TestRegistrationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Тестирование регистрации</h1>
        <p className="text-muted-foreground mt-2">
          Проверка автоматического создания профилей пользователей с ролью 'user'
        </p>
      </div>
      <RegistrationTest />
    </div>
  );
} 