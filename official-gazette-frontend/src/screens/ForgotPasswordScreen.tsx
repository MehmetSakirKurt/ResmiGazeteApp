import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Başarılı', 
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Auth') 
          }
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi.';
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Auth');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>Şifrenizi sıfırlamak için e-posta adresinizi girin.</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>EPOSTA</Text>
        <TextInput
          style={styles.input}
          placeholder="test@resmigazete.ai"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.resetButtonText}>Şifremi Sıfırla</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginText}>Giriş sayfasına dön</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
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
  resetButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
