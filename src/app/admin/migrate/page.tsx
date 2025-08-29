'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { seedCampTypes } from '@/lib/campTypeService';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);

  const migrateCamps = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Начинаем миграцию кэмпов...');
      
      // Получаем все кэмпы
      const campsSnapshot = await getDocs(collection(db, 'camps'));
      const camps = campsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      console.log(`📊 Найдено ${camps.length} кэмпов для миграции`);
      
      let updatedCount = 0;
      
      for (const camp of camps) {
        console.log(`🔍 Проверяем кэмп ${camp.id}:`, camp);
        
        // Проверяем, есть ли organizerId
        if (!camp.organizerId && camp.organizer) {
          console.log(`⚠️ Кэмп ${camp.id} имеет organizer="${camp.organizer}" но нет organizerId`);
          
          // Получаем первого организатора (временно)
          const organizersSnapshot = await getDocs(collection(db, 'organizers'));
          const organizers = organizersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          
          if (organizers.length > 0) {
            const firstOrganizer = organizers[0];
            console.log(`✅ Используем организатора: ${firstOrganizer.name} (${firstOrganizer.id})`);
            
            // Обновляем кэмп
            await updateDoc(doc(db, 'camps', camp.id), {
              organizerId: firstOrganizer.id,
              // Сохраняем старое поле organizer как backup
              organizerBackup: camp.organizer
            });
            
            updatedCount++;
            console.log(`✅ Кэмп ${camp.id} обновлен`);
          } else {
            console.log(`❌ Нет организаторов в базе для кэмпа ${camp.id}`);
          }
        } else if (camp.organizerId) {
          console.log(`✅ Кэмп ${camp.id} уже имеет organizerId: ${camp.organizerId}`);
        } else {
          console.log(`❌ Кэмп ${camp.id} не имеет ни organizer, ни organizerId`);
        }
      }
      
      console.log(`🎉 Миграция завершена. Обновлено ${updatedCount} кэмпов`);
      toast.success(`Миграция завершена! Обновлено ${updatedCount} кэмпов`);
      
    } catch (error: any) {
      console.error('❌ Ошибка миграции:', error);
      toast.error(error.message || 'Не удалось выполнить миграцию');
    } finally {
      setIsLoading(false);
    }
  };

  const checkMissingOrganizers = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Проверяем недостающих организаторов...');
      
      // Получаем все кэмпы
      const campsSnapshot = await getDocs(collection(db, 'camps'));
      const camps = campsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Получаем всех организаторов
      const organizersSnapshot = await getDocs(collection(db, 'organizers'));
      const organizers = organizersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      console.log(`📊 Найдено ${camps.length} кэмпов и ${organizers.length} организаторов`);
      
      // Собираем все уникальные organizerId из кэмпов
      const usedOrganizerIds = new Set<string>();
      camps.forEach(camp => {
        if (camp.organizerId) {
          usedOrganizerIds.add(camp.organizerId);
        }
      });
      
      console.log('🔍 Используемые organizerId:', Array.from(usedOrganizerIds));
      console.log('🔍 Существующие организаторы:', organizers.map(o => o.id));
      
      // Находим недостающих организаторов
      const missingOrganizerIds = Array.from(usedOrganizerIds).filter(id => 
        !organizers.some(org => org.id === id)
      );
      
      console.log('❌ Недостающие организаторы:', missingOrganizerIds);
      
      if (missingOrganizerIds.length > 0) {
        // Создаем недостающих организаторов
        for (const missingId of missingOrganizerIds) {
          console.log(`➕ Создаем организатора с ID: ${missingId}`);
          
          await setDoc(doc(db, 'organizers', missingId), {
            id: missingId, // Это не сработает, Firestore сам генерирует ID
            name: `Организатор ${missingId.slice(0, 8)}...`,
            email: `organizer-${missingId.slice(0, 8)}@example.com`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          console.log(`✅ Организатор создан`);
        }
        
        toast.success(`Создано ${missingOrganizerIds.length} недостающих организаторов`);
      } else {
        toast.success('Все организаторы существуют');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка проверки организаторов:', error);
      toast.error(error.message || 'Не удалось проверить организаторов');
    } finally {
      setIsLoading(false);
    }
  };

  const showDetailedInfo = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Показываем детальную информацию...');
      
      // Получаем все кэмпы
      const campsSnapshot = await getDocs(collection(db, 'camps'));
      const camps = campsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Получаем всех организаторов
      const organizersSnapshot = await getDocs(collection(db, 'organizers'));
      const organizers = organizersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      console.log('📊 ВСЕ КЭМПЫ:');
      camps.forEach(camp => {
        console.log(`  Кэмп ${camp.id}:`, {
          title: camp.title,
          organizerId: camp.organizerId,
          organizer: camp.organizer,
          type: camp.type,
          status: camp.status
        });
      });
      
      console.log('📊 ВСЕ ОРГАНИЗАТОРЫ:');
      organizers.forEach(org => {
        console.log(`  Организатор ${org.id}:`, {
          name: org.name,
          email: org.email
        });
      });
      
      // Проверяем каждый кэмп
      console.log('🔍 ПРОВЕРКА КЭМПОВ:');
      camps.forEach(camp => {
        if (camp.organizerId) {
          const organizer = organizers.find(o => o.id === camp.organizerId);
          if (organizer) {
            console.log(`✅ Кэмп ${camp.id}: организатор найден - ${organizer.name}`);
          } else {
            console.log(`❌ Кэмп ${camp.id}: организатор НЕ НАЙДЕН (ID: ${camp.organizerId})`);
          }
        } else {
          console.log(`⚠️ Кэмп ${camp.id}: нет organizerId`);
        }
      });
      
      toast.success('Детальная информация выведена в консоль');
      
    } catch (error: any) {
      console.error('❌ Ошибка получения информации:', error);
      toast.error(error.message || 'Не удалось получить информацию');
    } finally {
      setIsLoading(false);
    }
  };

  const seedCampTypesData = async () => {
    setIsLoading(true);
    try {
      console.log('🌱 Создаем начальные типы кэмпов...');
      await seedCampTypes();
      console.log('✅ Начальные типы кэмпов созданы');
      toast.success('Начальные типы кэмпов созданы');
    } catch (error: any) {
      console.error('❌ Ошибка создания типов кэмпов:', error);
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
          Только администраторы могут выполнять миграции.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Миграция данных</h1>
          <p className="text-muted-foreground mt-2">
            Обновите существующие кэмпы для работы с новой системой организаторов.
          </p>
        </div>
        
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Миграция кэмпов</CardTitle>
            <CardDescription>
              Добавит organizerId к кэмпам, которые были созданы до внедрения системы организаторов.
              Старые кэмпы получат organizerId первого организатора в базе.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={migrateCamps} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Миграция...' : 'Выполнить миграцию'}
              </Button>
              
              <Button 
                onClick={checkMissingOrganizers} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Проверка...' : 'Проверить недостающих организаторов'}
              </Button>
              
              <Button 
                onClick={showDetailedInfo} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Загрузка...' : 'Показать детальную информацию'}
              </Button>

              <Button 
                onClick={seedCampTypesData} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Создание типов...' : 'Создать начальные типы кэмпов'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
} 