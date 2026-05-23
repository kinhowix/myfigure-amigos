import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhgQzk7hk0g-Zx0TUG79Derke-Ol31z5Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "myfigure-amigos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "myfigure-amigos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "myfigure-amigos.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "594734425064",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:594734425064:web:41bda7595d5c3bbf287a5d"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Código/Senha Master de Cadastro para os amigos criarem conta (ex: 'myfigure2026')
export const REGISTRATION_CODE = import.meta.env.VITE_REGISTRATION_CODE || "myfigure2026";

