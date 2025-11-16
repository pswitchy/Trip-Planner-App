// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from '@firebase/auth'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXb2QnyMSTzlJ92NfoIFXto0beK4IJ8I0",
  authDomain: "collaborativetripplanne.firebaseapp.com",
  projectId: "collaborativetripplanne",
  storageBucket: "collaborativetripplanne.firebasestorage.app",
  messagingSenderId: "1049928220790",
  appId: "1:1049928220790:web:94f833ac443d35f3c21f57",
  measurementId: "G-6K14T9EH8H"
};

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


// Initialize Firestore
const db = getFirestore(app);

// --- NEW: Initialize Auth with persistence ---
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const analytics = getAnalytics(app);

export { app, db, auth };