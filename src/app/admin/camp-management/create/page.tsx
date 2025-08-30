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
      {/* Sticky навигация */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Админ панель
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">Создание кэмпа</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

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
