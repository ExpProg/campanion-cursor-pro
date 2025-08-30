'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizerForm } from '@/components/OrganizerForm';
import { createOrganizer } from '@/lib/organizerService';
import { CreateOrganizerData } from '@/types/organizer';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrganizerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (organizerData: CreateOrganizerData) => {
    setIsSubmitting(true);
    try {
      console.log('✏️ Создаем организатора:', organizerData);
      
      const organizerId = await createOrganizer(organizerData);
      console.log('✅ Организатор успешно создан с ID:', organizerId);
      
      toast.success('Организатор успешно создан!');
      
      // Перенаправляем на админ панель
      router.push('/admin');
    } catch (error: any) {
      console.error('❌ Ошибка создания организатора:', error);
      toast.error(error.message || 'Не удалось создать организатора');
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
          Только администраторы могут создавать организаторов.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Создать организатора</h1>
            <p className="text-muted-foreground mt-2">
              Добавьте нового организатора в систему
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Форма создания */}
        <OrganizerForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          isEditing={false}
        />
      </div>
    </AdminOnly>
  );
}
