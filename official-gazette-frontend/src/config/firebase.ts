// Firebase yapılandırması
// Expo projelerinde Firebase'i kullanmak için firebase-js-sdk kullanılmalıdır
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyCWf9OcFUoGgYOI1hYlBvou1-SLwblJL40",
  authDomain: "react-app-768a8.firebaseapp.com",
  databaseURL: "https://react-app-768a8-default-rtdb.firebaseio.com",
  projectId: "react-app-768a8",
  storageBucket: "react-app-768a8.firebasestorage.app",
  messagingSenderId: "197735022486",
  appId: "1:197735022486:web:d3fa5af239008282c527b7",
  measurementId: "G-HL3MWFJCEQ"
};

// Firebase uygulamasını başlat (eğer zaten başlatılmışsa, mevcut uygulamayı kullan)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth servisini al
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  googleProvider,
  signInWithPopup
};
