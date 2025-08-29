import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { BookingRequest } from '@/types/booking';

const COLLECTION_NAME = 'bookingRequests';

export const createBookingRequest = async (data: Omit<BookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking request:', error);
    throw new Error('Не удалось создать запрос на бронирование');
  }
};

export const getBookingRequests = async (): Promise<BookingRequest[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as BookingRequest[];
  } catch (error) {
    console.error('Error getting booking requests:', error);
    throw new Error('Не удалось получить запросы на бронирование');
  }
};

export const getBookingRequestById = async (id: string): Promise<BookingRequest | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BookingRequest;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting booking request:', error);
    throw new Error('Не удалось получить запрос на бронирование');
  }
};

export const updateBookingRequestStatus = async (id: string, status: BookingRequest['status']): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating booking request status:', error);
    throw new Error('Не удалось обновить статус запроса');
  }
};

export const getBookingRequestsByCampId = async (campId: string): Promise<BookingRequest[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('campId', '==', campId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as BookingRequest[];
  } catch (error) {
    console.error('Error getting booking requests by camp ID:', error);
    throw new Error('Не удалось получить запросы на бронирование для кэмпа');
  }
};

export const checkUserBookingExists = async (campId: string, userContact: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('campId', '==', campId),
      where('contact', '==', userContact)
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user booking:', error);
    return false; // В случае ошибки считаем, что заявки нет
  }
};

