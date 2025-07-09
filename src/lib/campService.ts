import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import { Camp, CreateCampData, UpdateCampData } from '@/types/camp';

const CAMPS_COLLECTION = 'camps';

// Создание нового кэмпа
export async function createCamp(data: CreateCampData): Promise<Camp> {
  console.log('🔄 Создаем кэмп:', data);

  // Базовые данные для кэмпа
  const campData: any = {
    title: data.title,
    description: data.description,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    location: data.location,
    type: data.type,
    organizer: data.organizer,
    image: data.image || '',
    features: data.features,
    difficulty: data.difficulty,
    ageGroup: data.ageGroup,
    included: data.included,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Добавляем price или variants в зависимости от того, что используется
  if (data.variants && data.variants.length > 0) {
    campData.variants = data.variants;
  } else if (data.price !== undefined) {
    campData.price = data.price;
  }

  try {
    const docRef = await addDoc(collection(db, CAMPS_COLLECTION), campData);
    console.log('✅ Кэмп создан с ID:', docRef.id);
    
    // Возвращаем созданный кэмп
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('❌ Ошибка создания кэмпа:', error);
    throw error;
  }
}

// Получение всех кэмпов
export async function getAllCamps(): Promise<Camp[]> {
  try {
    console.log('🔍 Загружаем все кэмпы из Firestore');
    
    const campsRef = collection(db, CAMPS_COLLECTION);
    const q = query(campsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const camps = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
        location: data.location,
        type: data.type,
        price: data.price,
        variants: data.variants || [],
        organizer: data.organizer,
        image: data.image,
        features: data.features || [],
        difficulty: data.difficulty,
        ageGroup: data.ageGroup,
        included: data.included || [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as Camp;
    });
    
    console.log(`✅ Загружено ${camps.length} кэмпов`);
    return camps;
  } catch (error) {
    console.error('❌ Ошибка загрузки кэмпов:', error);
    return [];
  }
}

// Получение кэмпа по ID
export async function getCampById(id: string): Promise<Camp | null> {
  try {
    console.log('🔍 Загружаем кэмп с ID:', id);
    
    const campRef = doc(db, CAMPS_COLLECTION, id);
    const campSnap = await getDoc(campRef);
    
    if (!campSnap.exists()) {
      console.log('❌ Кэмп не найден');
      return null;
    }
    
    const data = campSnap.data();
    const camp = {
      id: campSnap.id,
      title: data.title,
      description: data.description,
      startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
      endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
      location: data.location,
      type: data.type,
      price: data.price,
      variants: data.variants || [],
      organizer: data.organizer,
      image: data.image,
      features: data.features || [],
      difficulty: data.difficulty,
      ageGroup: data.ageGroup,
      included: data.included || [],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Camp;
    
    console.log('✅ Кэмп загружен:', camp);
    return camp;
  } catch (error) {
    console.error('❌ Ошибка загрузки кэмпа:', error);
    return null;
  }
}

// Обновление кэмпа
export async function updateCamp(id: string, data: UpdateCampData): Promise<void> {
  try {
    console.log('🔄 Обновляем кэмп:', id, data);
    
    const campRef = doc(db, CAMPS_COLLECTION, id);
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };
    
    // Добавляем только те поля, которые действительно нужно обновить
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.organizer !== undefined) updateData.organizer = data.organizer;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.ageGroup !== undefined) updateData.ageGroup = data.ageGroup;
    if (data.included !== undefined) updateData.included = data.included;
    
    // Конвертируем даты в Timestamp если они есть
    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(data.endDate);
    }
    
    // Обрабатываем ценообразование
    if (data.variants && data.variants.length > 0) {
      updateData.variants = data.variants;
      // Если добавляем варианты, удаляем price
      updateData.price = deleteField();
    } else if (data.price !== undefined) {
      updateData.price = data.price;
      // Если добавляем price, удаляем variants
      updateData.variants = deleteField();
    }
    
    await updateDoc(campRef, updateData);
    console.log('✅ Кэмп обновлен');
  } catch (error) {
    console.error('❌ Ошибка обновления кэмпа:', error);
    throw error;
  }
}

// Удаление кэмпа
export async function deleteCamp(id: string): Promise<void> {
  try {
    console.log('🗑️ Удаляем кэмп:', id);
    
    const campRef = doc(db, CAMPS_COLLECTION, id);
    await deleteDoc(campRef);
    
    console.log('✅ Кэмп удален');
  } catch (error) {
    console.error('❌ Ошибка удаления кэмпа:', error);
    throw error;
  }
}

// Получение кэмпов по типу
export async function getCampsByType(type: string): Promise<Camp[]> {
  try {
    console.log('🔍 Загружаем кэмпы типа:', type);
    
    const campsRef = collection(db, CAMPS_COLLECTION);
    const q = query(
      campsRef, 
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const camps = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
        location: data.location,
        type: data.type,
        price: data.price,
        variants: data.variants || [],
        organizer: data.organizer,
        image: data.image,
        features: data.features || [],
        difficulty: data.difficulty,
        ageGroup: data.ageGroup,
        included: data.included || [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as Camp;
    });
    
    console.log(`✅ Загружено ${camps.length} кэмпов типа ${type}`);
    return camps;
  } catch (error) {
    console.error('❌ Ошибка загрузки кэмпов по типу:', error);
    return [];
  }
} 