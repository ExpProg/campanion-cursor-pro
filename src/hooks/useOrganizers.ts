import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Organizer } from '../types/organizer';

export function useOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOrganizers() {
      try {
        setLoading(true);
        console.log('🔍 Загружаем организаторов из Firestore...');
        const querySnapshot = await getDocs(collection(db, 'organizers'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Organizer[];
        setOrganizers(data);
        console.log('✅ Загружено организаторов:', data.length, data);
      } catch (err) {
        console.error('❌ Ошибка загрузки организаторов:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizers();
  }, []);

  return { organizers, loading, error };
} 