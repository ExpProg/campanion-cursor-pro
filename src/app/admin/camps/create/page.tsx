'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampForm } from '@/components/CampForm';
import { createCamp } from '@/lib/campService';
import { CreateCampData } from '@/types/camp';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';

export default function CreateCampPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (campData: CreateCampData) => {
    setIsLoading(true);
    try {
      console.log('🎯 Создаем новый кэмп:', campData);
      
      const newCamp = await createCamp(campData);
      console.log('✅ Кэмп успешно создан:', newCamp);
      
      toast.success('Кэмп успешно создан!');
      
      // Перенаправляем на страницу созданного кэмпа
      router.push(`/camps/${newCamp.id}`);
    } catch (error: any) {
      console.error('❌ Ошибка создания кэмпа:', error);
      toast.error(error.message || 'Не удалось создать кэмп');
    } finally {
      setIsLoading(false);
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Создание нового кэмпа</h1>
          <p className="text-muted-foreground mt-2">
            Заполните форму для создания нового кэмпа. Все обязательные поля должны быть заполнены.
          </p>
        </div>
        
        <CampForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </AdminOnly>
  );
} 