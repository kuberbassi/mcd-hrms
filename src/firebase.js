import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBZoTQRxz5M1KoIEd9wpMbKy7hf6x7KZyg",
    authDomain: "mcd-hrms.firebaseapp.com",
    projectId: "mcd-hrms",
    storageBucket: "mcd-hrms.firebasestorage.app",
    messagingSenderId: "453491779262",
    appId: "1:453491779262:web:8c0e7d7780fccf01c920ef",
    measurementId: "G-RBJV74CBV5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
