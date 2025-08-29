import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Organizer } from '@/types/organizer';

const COLLECTION_NAME = 'organizers';

// Get all organizers
export const getOrganizers = async (): Promise<Organizer[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Organizer[];
  } catch (error) {
    console.error('Error getting organizers:', error);
    throw error;
  }
};

// Alias for compatibility
export const getAllOrganizers = getOrganizers;

// Get active organizers
export const getActiveOrganizers = async (): Promise<Organizer[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('isActive', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Organizer[];
  } catch (error) {
    console.error('Error getting active organizers:', error);
    throw error;
  }
};

// Get organizer by ID
export const getOrganizerById = async (id: string): Promise<Organizer | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Organizer;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting organizer:', error);
    throw error;
  }
};

// Create new organizer
export const createOrganizer = async (organizerData: Omit<Organizer, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), organizerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating organizer:', error);
    throw error;
  }
};

// Update organizer
export const updateOrganizer = async (id: string, organizerData: Partial<Organizer>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, organizerData);
  } catch (error) {
    console.error('Error updating organizer:', error);
    throw error;
  }
};

// Delete organizer
export const deleteOrganizer = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting organizer:', error);
    throw error;
  }
}; 