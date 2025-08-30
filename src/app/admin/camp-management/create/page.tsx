'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampForm } from '@/components/CampForm';
import { createCamp } from '@/lib/campService';
import { CreateCampData } from '@/types/camp';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCampPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (campData: CreateCampData) => {
    setIsSubmitting(true);
    try {
      console.log('✏️ Создаем кэмп:', campData);
      
      const campId = await createCamp(campData);
      console.log('✅ Кэмп успешно создан с ID:', campId);
      
      toast.success('Кэмп успешно создан!');
      
      // Перенаправляем на страницу кэмпа
      router.push(`/camps/${campId}`);
    } catch (error: any) {
      console.error('❌ Ошибка создания кэмпа:', error);
      toast.error(error.message || 'Не удалось создать кэмп');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <AdminOnly fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">
          Только администраторы могут создавать кэмпы.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Создать кэмп</h1>
            <p className="text-muted-foreground mt-2">
              Добавьте новый кэмп в систему
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Форма создания */}
        <CampForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          isEditing={false}
        />
      </div>
    </AdminOnly>
  );
}
