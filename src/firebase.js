import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- REPLACE WITH YOUR ACTUAL FIREBASE KEYS ---
const firebaseConfig = {
  apiKey: "AIzaSyBZoTQRxz5M1KoIEd9wpMbKy7hf6x7KZyg",
  authDomain: "mcd-hrms.firebaseapp.com",
  projectId: "mcd-hrms",
  storageBucket: "mcd-hrms.firebasestorage.app",
  messagingSenderId: "453491779262",
  appId: "1:453491779262:web:8c0e7d7780fccf01c920ef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// !!! CRITICAL: Export auth and db as named exports !!!
export { auth, db };
export default app;