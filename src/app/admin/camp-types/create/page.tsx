'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampTypeForm } from '@/components/CampTypeForm';
import { createCampType } from '@/lib/campTypeService';
import { CreateCampTypeData } from '@/types/campType';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCampTypePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (campTypeData: CreateCampTypeData) => {
    setIsSubmitting(true);
    try {
      console.log('✏️ Создаем тип кэмпа:', campTypeData);
      
      const campType = await createCampType(campTypeData);
      console.log('✅ Тип кэмпа успешно создан с ID:', campType.id);
      
      toast.success('Тип кэмпа успешно создан!');
      
      // Перенаправляем на админ панель
      router.push('/admin');
    } catch (error: any) {
      console.error('❌ Ошибка создания типа кэмпа:', error);
      toast.error(error.message || 'Не удалось создать тип кэмпа');
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
          Только администраторы могут создавать типы кэмпов.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Создать тип кэмпа</h1>
            <p className="text-muted-foreground mt-2">
              Добавьте новый тип кэмпа в систему
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Форма создания */}
        <CampTypeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          isEditing={false}
        />
      </div>
    </AdminOnly>
  );
}
