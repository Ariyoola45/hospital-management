// ============================================================================
// Firebase configuration
// ----------------------------------------------------------------------------
// Replace the placeholder values below with your own Firebase project's
// config, found in Firebase Console > Project Settings > General > Your apps.
// It is recommended to load these from environment variables (.env) rather
// than committing real keys to source control. A .env.example is provided.
// ============================================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqkQriyE5iYQxpojo0RBgjx5KhiUgha8g",
  authDomain: "hopital-management-system.firebaseapp.com",
  projectId: "hopital-management-system",
  storageBucket: "hopital-management-system.firebasestorage.app",
  messagingSenderId: "123694510271",
  appId: "1:123694510271:web:033d5b54b1d1682b0bd60a",
  measurementId: "G-C0B312J00L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
