import { useState, useEffect } from 'react';
import { Camp } from '@/types/camp';
import { getAllCamps, getCampById, seedCamps } from '@/lib/camps';
import { sampleCamps } from '@/data/sampleCamps';

export const useCamps = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      setError(null);
      const campsData = await getAllCamps();
      
      // Если кэмпов нет в базе, загружаем исходные данные
      if (campsData.length === 0) {
        console.log('База данных пуста, загружаем исходные данные...');
        await seedCamps(sampleCamps.map(camp => ({ ...camp, id: undefined } as any)));
        const newCampsData = await getAllCamps();
        setCamps(newCampsData);
      } else {
        setCamps(campsData);
      }
    } catch (err) {
      console.error('Ошибка при загрузке кэмпов:', err);
      setError('Не удалось загрузить кэмпы');
      // В случае ошибки используем статические данные
      setCamps(sampleCamps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const refetch = () => {
    fetchCamps();
  };

  return {
    camps,
    loading,
    error,
    refetch
  };
};

export const useCamp = (id: string) => {
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCamp = async () => {
      try {
        setLoading(true);
        setError(null);
        const campData = await getCampById(id);
        setCamp(campData);
      } catch (err) {
        console.error('Ошибка при загрузке кэмпа:', err);
        setError('Не удалось загрузить кэмп');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCamp();
    }
  }, [id]);

  return {
    camp,
    loading,
    error
  };
}; 