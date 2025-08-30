'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CampTypeForm } from '@/components/CampTypeForm';
import { getCampTypeById, updateCampType } from '@/lib/campTypeService';
import { CampType, UpdateCampTypeData } from '@/types/campType';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCampTypePage() {
  const router = useRouter();
  const params = useParams();
  const campTypeId = params.id as string;
  
  const [campType, setCampType] = useState<CampType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCampType = async () => {
      try {
        setLoading(true);
        console.log('🔍 Загружаем тип кэмпа для редактирования:', campTypeId);
        
        const campTypeData = await getCampTypeById(campTypeId);
        if (!campTypeData) {
          console.log('❌ Тип кэмпа не найден');
          setNotFound(true);
          return;
        }
        
        setCampType(campTypeData);
        console.log('✅ Тип кэмпа загружен для редактирования:', campTypeData);
      } catch (error) {
        console.error('❌ Ошибка загрузки типа кэмпа:', error);
        toast.error('Не удалось загрузить тип кэмпа');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (campTypeId) {
      loadCampType();
    }
  }, [campTypeId]);

  const handleSubmit = async (campTypeData: UpdateCampTypeData) => {
    if (!campType) return;
    
    setIsSubmitting(true);
    try {
      console.log('✏️ Обновляем тип кэмпа:', campTypeData);
      
      await updateCampType(campType.id, campTypeData);
      console.log('✅ Тип кэмпа успешно обновлен');
      
      toast.success('Тип кэмпа успешно обновлен!');
      
      // Перенаправляем на админ панель
      router.push('/admin');
    } catch (error: any) {
      console.error('❌ Ошибка обновления типа кэмпа:', error);
      toast.error(error.message || 'Не удалось обновить тип кэмпа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <AdminOnly fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
          <p className="text-muted-foreground mt-2">
            Только администраторы могут редактировать типы кэмпов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка типа кэмпа...</span>
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    );
  }

  if (notFound) {
    return (
      <AdminOnly fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
          <p className="text-muted-foreground mt-2">
            Только администраторы могут редактировать типы кэмпов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-destructive mb-4">Тип кэмпа не найден</h1>
              <p className="text-muted-foreground mb-6">
                Запрашиваемый тип кэмпа не существует или был удален.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleCancel} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
                <Link href="/admin">
                  <Button>В админ панель</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">
          Только администраторы могут редактировать типы кэмпов.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Редактировать тип кэмпа</h1>
            <p className="text-muted-foreground mt-2">
              Измените информацию о типе кэмпа "{campType?.name}"
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Форма редактирования */}
        <CampTypeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          initialData={campType}
          isEditing={true}
        />
      </div>
    </AdminOnly>
  );
}
