'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OrganizerForm } from '@/components/OrganizerForm';
import { getOrganizerById, updateOrganizer } from '@/lib/organizerService';
import { Organizer, UpdateOrganizerData } from '@/types/organizer';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditOrganizerPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadOrganizer = async () => {
      try {
        setLoading(true);
        console.log('🔍 Загружаем организатора для редактирования:', organizerId);
        
        const organizerData = await getOrganizerById(organizerId);
        if (!organizerData) {
          console.log('❌ Организатор не найден');
          setNotFound(true);
          return;
        }
        
        setOrganizer(organizerData);
        console.log('✅ Организатор загружен для редактирования:', organizerData);
      } catch (error) {
        console.error('❌ Ошибка загрузки организатора:', error);
        toast.error('Не удалось загрузить организатора');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      loadOrganizer();
    }
  }, [organizerId]);

  const handleSubmit = async (organizerData: UpdateOrganizerData) => {
    if (!organizer) return;
    
    setIsSubmitting(true);
    try {
      console.log('✏️ Обновляем организатора:', organizerData);
      
      await updateOrganizer(organizer.id, organizerData);
      console.log('✅ Организатор успешно обновлен');
      
      toast.success('Организатор успешно обновлен!');
      
      // Перенаправляем на админ панель
      router.push('/admin');
    } catch (error: any) {
      console.error('❌ Ошибка обновления организатора:', error);
      toast.error(error.message || 'Не удалось обновить организатора');
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
            Только администраторы могут редактировать организаторов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка организатора...</span>
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
            Только администраторы могут редактировать организаторов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-destructive mb-4">Организатор не найден</h1>
              <p className="text-muted-foreground mb-6">
                Запрашиваемый организатор не существует или был удален.
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
          Только администраторы могут редактировать организаторов.
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
            <span className="text-sm text-muted-foreground">Редактирование организатора</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Форма редактирования */}
        <OrganizerForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          initialData={organizer}
          isEditing={true}
        />
      </div>
    </AdminOnly>
  );
}
