import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Camp } from '@/types/camp';

const CAMPS_COLLECTION = 'camps';

// Преобразование даты в Timestamp для Firebase
const dateToTimestamp = (date: Date) => Timestamp.fromDate(date);

// Преобразование Timestamp из Firebase в Date
const timestampToDate = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Преобразование данных кэмпа для отправки в Firebase
const campToFirestore = (camp: Omit<Camp, 'id'>) => {
  // Явно исключаем поле id, даже если оно есть в объекте
  const { id, ...campData } = camp as any;
  
  return {
    ...campData,
    startDate: dateToTimestamp(campData.startDate),
    endDate: dateToTimestamp(campData.endDate),
    createdAt: dateToTimestamp(campData.createdAt),
    updatedAt: dateToTimestamp(campData.updatedAt)
  };
};

// Преобразование данных кэмпа из Firebase
const campFromFirestore = (doc: any): Camp => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startDate: timestampToDate(data.startDate),
    endDate: timestampToDate(data.endDate),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt)
  };
};

// Получить все кэмпы
export const getAllCamps = async (): Promise<Camp[]> => {
  try {
    const campsCollection = collection(db, CAMPS_COLLECTION);
    const campsQuery = query(campsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(campsQuery);
    
    return snapshot.docs.map(campFromFirestore);
  } catch (error) {
    console.error('Ошибка при получении кэмпов:', error);
    throw error;
  }
};

// Получить кэмп по ID
export const getCampById = async (id: string): Promise<Camp | null> => {
  try {
    const campDoc = doc(db, CAMPS_COLLECTION, id);
    const snapshot = await getDoc(campDoc);
    
    if (snapshot.exists()) {
      return campFromFirestore(snapshot);
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении кэмпа:', error);
    throw error;
  }
};

// Добавить новый кэмп
export const addCamp = async (camp: Omit<Camp, 'id'>): Promise<string> => {
  try {
    const campsCollection = collection(db, CAMPS_COLLECTION);
    const firestoreData = campToFirestore(camp);
    
    const docRef = await addDoc(campsCollection, firestoreData);
    return docRef.id;
  } catch (error) {
    console.error('Ошибка при добавлении кэмпа:', error);
    throw error;
  }
};

// Обновить кэмп
export const updateCamp = async (id: string, camp: Partial<Omit<Camp, 'id'>>): Promise<void> => {
  try {
    const campDoc = doc(db, CAMPS_COLLECTION, id);
    const updateData: any = { ...camp };
    
    // Преобразуем даты в Timestamp, если они есть
    if (camp.startDate) updateData.startDate = dateToTimestamp(camp.startDate);
    if (camp.endDate) updateData.endDate = dateToTimestamp(camp.endDate);
    if (camp.updatedAt) updateData.updatedAt = dateToTimestamp(camp.updatedAt);
    
    await updateDoc(campDoc, updateData);
  } catch (error) {
    console.error('Ошибка при обновлении кэмпа:', error);
    throw error;
  }
};

// Удалить кэмп
export const deleteCamp = async (id: string): Promise<void> => {
  try {
    const campDoc = doc(db, CAMPS_COLLECTION, id);
    await deleteDoc(campDoc);
  } catch (error) {
    console.error('Ошибка при удалении кэмпа:', error);
    throw error;
  }
};

// Получить кэмпы по типу
export const getCampsByType = async (type: string): Promise<Camp[]> => {
  try {
    const campsCollection = collection(db, CAMPS_COLLECTION);
    const campsQuery = query(
      campsCollection, 
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(campsQuery);
    
    return snapshot.docs.map(campFromFirestore);
  } catch (error) {
    console.error('Ошибка при получении кэмпов по типу:', error);
    throw error;
  }
};

// Функция для первоначальной загрузки данных (можно использовать один раз)
export const seedCamps = async (camps: Omit<Camp, 'id'>[]): Promise<void> => {
  try {
    for (const camp of camps) {
      await addCamp(camp);
    }
  } catch (error) {
    console.error('Ошибка при загрузке кэмпов:', error);
    throw error;
  }
}; 