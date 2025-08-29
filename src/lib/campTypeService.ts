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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CampType, CreateCampTypeData, UpdateCampTypeData } from '@/types/campType';

const CAMP_TYPES_COLLECTION = 'campTypes';

// Создание нового типа кэмпа
export async function createCampType(data: CreateCampTypeData): Promise<CampType> {
  console.log('🔄 Создаем тип кэмпа:', data);

  const campTypeData = {
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon || '',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, CAMP_TYPES_COLLECTION), campTypeData);
    console.log('✅ Тип кэмпа создан с ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('❌ Ошибка создания типа кэмпа:', error);
    throw error;
  }
}

// Получение всех типов кэмпов
export async function getAllCampTypes(): Promise<CampType[]> {
  try {
    console.log('🔍 Загружаем все типы кэмпов из Firestore');
    
    const typesRef = collection(db, CAMP_TYPES_COLLECTION);
    const q = query(typesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const campTypes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon || '',
        isActive: data.isActive !== false, // По умолчанию активен
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as CampType;
    });
    
    console.log(`✅ Загружено ${campTypes.length} типов кэмпов`);
    return campTypes;
  } catch (error) {
    console.error('❌ Ошибка загрузки типов кэмпов:', error);
    return [];
  }
}

// Получение активных типов кэмпов
export async function getActiveCampTypes(): Promise<CampType[]> {
  try {
    console.log('🔍 Загружаем активные типы кэмпов из Firestore');
    
    const typesRef = collection(db, CAMP_TYPES_COLLECTION);
    const q = query(typesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    // Фильтруем активные типы на клиенте
    const campTypes = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon || '',
          isActive: data.isActive !== false, // По умолчанию активен
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as CampType;
      })
      .filter(type => type.isActive); // Фильтруем только активные
    
    console.log(`✅ Загружено ${campTypes.length} активных типов кэмпов`);
    return campTypes;
  } catch (error) {
    console.error('❌ Ошибка загрузки активных типов кэмпов:', error);
    return [];
  }
}

// Получение типа кэмпа по ID
export async function getCampTypeById(id: string): Promise<CampType | null> {
  try {
    console.log('🔍 Загружаем тип кэмпа по ID:', id);
    
    const docRef = doc(db, CAMP_TYPES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const campType = {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as CampType;
      
      console.log('✅ Тип кэмпа найден:', campType.name);
      return campType;
    } else {
      console.log('❌ Тип кэмпа не найден');
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки типа кэмпа:', error);
    return null;
  }
}

// Обновление типа кэмпа
export async function updateCampType(id: string, data: UpdateCampTypeData): Promise<void> {
  console.log('🔄 Обновляем тип кэмпа:', id, data);

  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  // Добавляем только те поля, которые переданы
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  try {
    const docRef = doc(db, CAMP_TYPES_COLLECTION, id);
    await updateDoc(docRef, updateData);
    console.log('✅ Тип кэмпа обновлен');
  } catch (error) {
    console.error('❌ Ошибка обновления типа кэмпа:', error);
    throw error;
  }
}

// Удаление типа кэмпа
export async function deleteCampType(id: string): Promise<void> {
  console.log('🗑️ Удаляем тип кэмпа:', id);

  try {
    const docRef = doc(db, CAMP_TYPES_COLLECTION, id);
    await deleteDoc(docRef);
    console.log('✅ Тип кэмпа удален');
  } catch (error) {
    console.error('❌ Ошибка удаления типа кэмпа:', error);
    throw error;
  }
}

// Создание начальных типов кэмпов
export async function seedCampTypes(): Promise<void> {
  console.log('🌱 Создаем начальные типы кэмпов');

  const initialTypes: CreateCampTypeData[] = [
    {
      name: 'летний',
      description: 'Летние активности и отдых на природе',
      color: '#f59e0b',
      icon: '☀️'
    },
    {
      name: 'зимний',
      description: 'Зимние виды спорта и развлечения',
      color: '#0ea5e9',
      icon: '❄️'
    },
    {
      name: 'языковой',
      description: 'Изучение иностранных языков в игровой форме',
      color: '#8b5cf6',
      icon: '🌍'
    },
    {
      name: 'спортивный',
      description: 'Физическая активность и спортивные тренировки',
      color: '#10b981',
      icon: '⚽'
    },
    {
      name: 'творческий',
      description: 'Искусство, музыка, рисование и творчество',
      color: '#f43f5e',
      icon: '🎨'
    },
    {
      name: 'технический',
      description: 'Программирование, робототехника и технологии',
      color: '#6366f1',
      icon: '💻'
    },
    {
      name: 'приключенческий',
      description: 'Походы, скалолазание и экстремальные виды спорта',
      color: '#f97316',
      icon: '🏔️'
    },
    {
      name: 'образовательный',
      description: 'Академические программы и развитие навыков',
      color: '#4f46e5',
      icon: '📚'
    }
  ];

  try {
    for (const typeData of initialTypes) {
      await createCampType(typeData);
    }
    console.log('✅ Начальные типы кэмпов созданы');
  } catch (error) {
    console.error('❌ Ошибка создания начальных типов кэмпов:', error);
    throw error;
  }
} 