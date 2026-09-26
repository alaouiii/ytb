import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQEkjz_asgt6I1XLjYC6j-fIhRL2A_yKk",
  authDomain: "pdfconvert-9d31f.firebaseapp.com",
  projectId: "pdfconvert-9d31f",
  storageBucket: "pdfconvert-9d31f.firebasestorage.app",
  messagingSenderId: "101911522882",
  appId: "1:101911522882:web:24ebfa66265ea7001607db"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
