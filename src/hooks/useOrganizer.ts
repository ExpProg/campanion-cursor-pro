import { useState, useEffect } from 'react';
import { getOrganizerById } from '@/lib/organizerService';
import { Organizer } from '@/types/organizer';
import { sampleOrganizers } from '@/data/sampleOrganizers';

export const useOrganizer = (organizerId: string | null) => {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizerId) {
      setOrganizer(null);
      return;
    }

    const fetchOrganizer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Сначала проверяем образцы данных
        const sampleOrganizer = sampleOrganizers.find(org => org.id === organizerId);
        if (sampleOrganizer) {
          setOrganizer(sampleOrganizer);
          setLoading(false);
          return;
        }
        
        // Если не найден в образцах, пробуем загрузить из Firebase
        const data = await getOrganizerById(organizerId);
        setOrganizer(data);
      } catch (err) {
        console.error('Ошибка загрузки организатора:', err);
        setError('Не удалось загрузить организатора');
        setOrganizer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [organizerId]);

  return { organizer, loading, error };
}; 