import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider } from 'firebase/auth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, googleSignIn, user } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to Home");
      // User is already logged in, navigate to Home
      // This will be handled by the RootNavigator
    }
  }, [user, navigation]);

  // Expo Auth Session ile Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID', // Firebase console'dan alınacak
    // Diğer yapılandırma seçenekleri burada eklenebilir
  });

  // Google Sign-In yanıtını işle
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleCredential(id_token);
    }
  }, [response]);

  const handleGoogleCredential = async (idToken: string) => {
    try {
      setGoogleLoading(true);
      setLoginError(null);
      const credential = GoogleAuthProvider.credential(idToken);
      await googleSignIn(idToken);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setLoginError('Google ile giriş yapılırken bir hata oluştu.');
      Alert.alert('Google Giriş Hatası', 'Google ile giriş yapılırken bir hata oluştu.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Lütfen e-posta ve şifre alanlarını doldurun.');
      Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }
    
    setLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting to login with:", email);
      await login(email, password);
      console.log("Login successful, user should be redirected by AuthContext");
      // Başarılı giriş sonrası kullanıcı AuthContext tarafından yönlendirilecek
    } catch (error: any) {
      console.error("Login error in screen:", error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre girdiniz.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Geçersiz kimlik bilgileri. Lütfen e-posta ve şifrenizi kontrol edin.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      }
      
      setLoginError(errorMessage);
      Alert.alert('Giriş Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!request) {
      setLoginError('Google Sign-In hazır değil. Lütfen daha sonra tekrar deneyin.');
      Alert.alert('Hata', 'Google Sign-In hazır değil. Lütfen daha sonra tekrar deneyin.');
      return;
    }
    
    setGoogleLoading(true);
    setLoginError(null);
    
    try {
      console.log("Attempting Google sign-in");
      await promptAsync();
      // Yanıt useEffect içinde işlenecek
    } catch (error: any) {
      console.error('Google Sign-In Prompt Error:', error);
      setLoginError('Google ile giriş yapılırken bir hata oluştu.');
      Alert.alert('Google Giriş Hatası', 'Google ile giriş yapılırken bir hata oluştu.');
      setGoogleLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Giriş Yap</Text>
      </View>
      
      <View style={styles.formContainer}>
        {loginError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{loginError}</Text>
          </View>
        )}
        
        <Text style={styles.label}>EPOSTA</Text>
        <TextInput
          style={styles.input}
          placeholder="test@resmigazete.ai"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email-input"
        />
        
        <Text style={styles.label}>ŞİFRE</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            testID="password-input"
          />
          <TouchableOpacity 
            style={styles.passwordVisibilityButton}
            onPress={togglePasswordVisibility}
          >
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color="#888" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
          testID="login-button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.rememberMeContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Beni Hatırla</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
          testID="google-login-button"
        >
          {googleLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Bir Hesabın Yok mu? </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerLink}>Yeni Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#888',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    color: '#666',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  googleButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
