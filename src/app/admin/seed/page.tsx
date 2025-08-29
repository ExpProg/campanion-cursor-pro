'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { seedCampTypes } from '@/lib/campTypeService';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);

  const createTestOrganizers = async () => {
    setIsLoading(true);
    try {
      const organizers = [
        { name: 'ООО "Летний лагерь"', email: 'info@summercamp.ru' },
        { name: 'ИП Иванов А.А.', email: 'ivanov@camps.ru' },
        { name: 'Детский центр "Радость"', email: 'info@radost.ru' },
        { name: 'Спортивный клуб "Чемпион"', email: 'champion@sport.ru' },
      ];

      for (const organizer of organizers) {
        await addDoc(collection(db, 'organizers'), {
          ...organizer,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      toast.success('Тестовые организаторы созданы!');
    } catch (error: any) {
      console.error('Ошибка создания организаторов:', error);
      toast.error(error.message || 'Не удалось создать организаторов');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestCampTypes = async () => {
    setIsLoading(true);
    try {
      await seedCampTypes();
      toast.success('Типы кэмпов созданы!');
    } catch (error: any) {
      console.error('Ошибка создания типов кэмпов:', error);
      toast.error(error.message || 'Не удалось создать типы кэмпов');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminOnly fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">
          Только администраторы могут создавать тестовые данные.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Создание тестовых данных</h1>
          <p className="text-muted-foreground mt-2">
            Создайте тестовые организаторы и типы кэмпов для работы с формой.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Организаторы</CardTitle>
              <CardDescription>
                Создать тестовых организаторов для выбора в форме кэмпа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTestOrganizers} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Создание...' : 'Создать организаторов'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Типы кэмпов</CardTitle>
              <CardDescription>
                Создать типы кэмпов в базе данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTestCampTypes} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Создание...' : 'Создать типы кэмпов'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
} 