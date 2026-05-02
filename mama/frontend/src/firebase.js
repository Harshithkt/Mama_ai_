import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA6LZU7ZcTgLKQRUFbLXoURvjM_x-rXQWU",
  authDomain: "mamaai-e42d6.firebaseapp.com",
  projectId: "mamaai-e42d6",
  storageBucket: "mamaai-e42d6.firebasestorage.app",
  messagingSenderId: "876993959102",
  appId: "1:876993959102:web:678b332b0eaefaf0dcbaef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
