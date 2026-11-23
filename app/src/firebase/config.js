
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


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
