import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase yapılandırma bilgileri
// NOT: Bu bilgileri gerçek bir uygulama için .env dosyasında saklamanız önerilir
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Auth servisini al
const auth = getAuth(app);

export { auth };
