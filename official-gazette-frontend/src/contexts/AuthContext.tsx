import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail
} from '../config/firebase';
import { User } from 'firebase/auth';

// AuthContext için tip tanımlaması
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: (idToken: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
}

// Context oluşturma
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context Provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı oturum durumunu izleme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/şifre ile giriş
  const login = async (email: string, password: string) => {
    console.log("Login attempt with:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user.uid);
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      throw error;
    }
  };

  // Yeni kullanıcı kaydı
  const register = async (email: string, password: string) => {
    console.log("Register attempt with:", email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful:", userCredential.user.uid);
      return userCredential;
    } catch (error: any) {
      console.error("Registration error:", error.code, error.message);
      throw error;
    }
  };

  // Çıkış yapma
  const logout = async () => {
    console.log("Logout attempt");
    try {
      await signOut(auth);
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error.code, error.message);
      throw error;
    }
  };

  // Google ile giriş
  const googleSignIn = async (idToken: string) => {
    console.log("Google sign-in attempt");
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log("Google sign-in successful:", userCredential.user.uid);
      return userCredential;
    } catch (error: any) {
      console.error("Google sign-in error:", error.code, error.message);
      throw error;
    }
  };

  // Şifre sıfırlama
  const resetPassword = async (email: string) => {
    console.log("Password reset attempt for:", email);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
    } catch (error: any) {
      console.error("Password reset error:", error.code, error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleSignIn,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Context hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
