import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAGwzDlJp1E56x69KeyhWibHtvoTNWMQ4c",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "campanion-cursor.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "campanion-cursor",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "campanion-cursor.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "22851781795",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:22851781795:web:PLACEHOLDER",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Authentication
export const auth = getAuth(app);

// Инициализация Firestore
export const db = getFirestore(app);

export default app; 