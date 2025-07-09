'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CampForm } from '@/components/CampForm';
import { getCampById, updateCamp } from '@/lib/campService';
import { Camp, UpdateCampData } from '@/types/camp';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCampPage() {
  const router = useRouter();
  const params = useParams();
  const campId = params.id as string;
  
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCamp = async () => {
      try {
        setLoading(true);
        console.log('🔍 Загружаем кэмп для редактирования:', campId);
        
        const campData = await getCampById(campId);
        if (!campData) {
          console.log('❌ Кэмп не найден');
          setNotFound(true);
          return;
        }
        
        setCamp(campData);
        console.log('✅ Кэмп загружен для редактирования:', campData);
      } catch (error) {
        console.error('❌ Ошибка загрузки кэмпа:', error);
        toast.error('Не удалось загрузить кэмп');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (campId) {
      loadCamp();
    }
  }, [campId]);

  const handleSubmit = async (campData: UpdateCampData) => {
    if (!camp) return;
    
    setIsSubmitting(true);
    try {
      console.log('✏️ Обновляем кэмп:', campData);
      
      await updateCamp(camp.id, campData);
      console.log('✅ Кэмп успешно обновлен');
      
      toast.success('Кэмп успешно обновлен!');
      
      // Перенаправляем на страницу кэмпа
      router.push(`/camps/${camp.id}`);
    } catch (error: any) {
      console.error('❌ Ошибка обновления кэмпа:', error);
      toast.error(error.message || 'Не удалось обновить кэмп');
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
            Только администраторы могут редактировать кэмпы.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка кэмпа...</span>
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
            Только администраторы могут редактировать кэмпы.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-destructive mb-4">Кэмп не найден</h1>
              <p className="text-muted-foreground mb-6">
                Кэмп с указанным ID не существует или был удален.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/admin/camps">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    К списку кэмпов
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button>
                    К админ-панели
                  </Button>
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
          Только администраторы могут редактировать кэмпы.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/camps">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Редактирование кэмпа</h1>
            <p className="text-muted-foreground mt-2">
              Обновите информацию о кэмпе "{camp?.title}"
            </p>
          </div>
        </div>
        
        <CampForm
          initialData={camp}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          isEditing={true}
        />
      </div>
    </AdminOnly>
  );
} 