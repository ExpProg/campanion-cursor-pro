'use client';

import { useState, useEffect } from 'react';
import { Camp, CreateCampData, UpdateCampData } from '@/types/camp';
import { getAllCamps, createCamp, updateCamp, deleteCamp, getCampById } from '@/lib/campService';
import { useAuth } from '@/contexts/AuthContext';

export function useCamps() {
  const { user } = useAuth();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для определения актуальности кэмпа
  const isCampActive = (camp: Camp): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return camp.startDate >= today;
  };

  // Загрузка кэмпов
  const loadCamps = async () => {
    try {
      setLoading(true);
      setError(null);
      const allCampsData = await getAllCamps();
      setAllCamps(allCampsData);
      
      // Фильтруем только актуальные кэмпы для основного списка
      const activeCamps = allCampsData.filter(isCampActive);
      setCamps(activeCamps);
    } catch (err) {
      console.error('Ошибка загрузки кэмпов:', err);
      setError('Не удалось загрузить кэмпы');
    } finally {
      setLoading(false);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    loadCamps();
  }, []);

  // Создание нового кэмпа
  const createNewCamp = async (campData: CreateCampData): Promise<Camp | null> => {
    if (!user?.uid) {
      setError('Пользователь не авторизован');
      return null;
    }

    try {
      setError(null);
      const newCamp = await createCamp(campData);
      
      // Обновляем оба состояния
      setAllCamps(prev => [newCamp, ...prev]);
      
      // Добавляем в основной список только если кэмп актуальный
      if (isCampActive(newCamp)) {
        setCamps(prev => [newCamp, ...prev]);
      }
      
      return newCamp;
    } catch (err) {
      console.error('Ошибка создания кэмпа:', err);
      setError('Не удалось создать кэмп');
      return null;
    }
  };

  // Обновление кэмпа
  const updateExistingCamp = async (id: string, campData: UpdateCampData): Promise<Camp | null> => {
    try {
      setError(null);
      await updateCamp(id, campData);
      
      // Обновляем кэмп в локальном состоянии
      const updatedCamp = await getCampById(id);
      if (updatedCamp) {
        // Обновляем в общем списке
        setAllCamps(prev => prev.map(camp => camp.id === id ? updatedCamp : camp));
        
        // Обновляем в основном списке только если кэмп там был
        setCamps(prev => {
          const existingIndex = prev.findIndex(camp => camp.id === id);
          if (existingIndex !== -1) {
            // Если кэмп стал неактуальным, убираем его из основного списка
            if (!isCampActive(updatedCamp)) {
              return prev.filter(camp => camp.id !== id);
            }
            // Иначе обновляем
            return prev.map(camp => camp.id === id ? updatedCamp : camp);
          } else {
            // Если кэмпа не было в основном списке, добавляем только если он актуальный
            if (isCampActive(updatedCamp)) {
              return [updatedCamp, ...prev];
            }
            return prev;
          }
        });
        
        return updatedCamp;
      }
      return null;
    } catch (err) {
      console.error('Ошибка обновления кэмпа:', err);
      setError('Не удалось обновить кэмп');
      return null;
    }
  };

  // Удаление кэмпа
  const deleteExistingCamp = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteCamp(id);
      
      // Удаляем из обоих списков
      setAllCamps(prev => prev.filter(camp => camp.id !== id));
      setCamps(prev => prev.filter(camp => camp.id !== id));
      
      return true;
    } catch (err) {
      console.error('Ошибка удаления кэмпа:', err);
      setError('Не удалось удалить кэмп');
      return false;
    }
  };

  // Получение кэмпа по ID
  const getCamp = (id: string): Camp | undefined => {
    return camps.find(camp => camp.id === id);
  };

  // Обновление данных (refetch)
  const refetch = () => {
    loadCamps();
  };

  return {
    camps,
    allCamps,
    loading,
    error,
    createCamp: createNewCamp,
    updateCamp: updateExistingCamp,
    deleteCamp: deleteExistingCamp,
    getCamp,
    refetch,
    isCampActive,
  };
} 