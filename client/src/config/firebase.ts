// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaAsoGrdTDVeFvfIkk7_IWo5raq3oir2g",
    authDomain: "achariyalms.firebaseapp.com",
    projectId: "achariyalms",
    storageBucket: "achariyalms.firebasestorage.app",
    messagingSenderId: "219276293300",
    appId: "1:219276293300:web:61ffebc9b575c2de9dd3e1",
    measurementId: "G-6W7RYGSC1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
