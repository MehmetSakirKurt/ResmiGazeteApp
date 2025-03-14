import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

// Departman listesi
const DEPARTMENTS = [
  'HUKUK VE UYUMLULUK',
  'FİNANS VE MUHASEBE',
  'İNSAN KAYNAKLARI (İK)',
  'YÖNETİM VE İDARİ BİRİMLER',
  'SATIN ALMA VE LOJİSTİK',
  'BİLGİ İŞLEM',
  'İŞ SAĞLIĞI VE GÜVENLİĞİ',
  'DIŞ TİCARET',
  'KALİTE'
];

const RegisterScreen: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }
    
    setLoading(true);
    try {
      // Firebase ile yeni kullanıcı oluştur
      await register(email, password);
      
      // Not: User profil güncellemesi için Firebase Auth'un user.updateProfile metodu kullanılabilir,
      // ancak bu işlemi AuthContext içinde veya ayrı bir profil güncelleme işlevi olarak yapmak daha iyi olacaktır.
      
      Alert.alert('Başarılı', 'Hesabınız başarıyla oluşturuldu.');
    } catch (error: any) {
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre en az 6 karakter olmalıdır.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi.';
      }
      Alert.alert('Kayıt Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Auth');
  };

  const selectDepartment = (item: string) => {
    setDepartment(item);
    setShowDepartmentModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Yeni Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Resmi Gazete uygulamasına hoş geldiniz.</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>KURULUŞ ADI</Text>
          <TextInput
            style={styles.input}
            placeholder="Anonim Şirket veya Limited Şirket"
            value={companyName}
            onChangeText={setCompanyName}
          />
          
          <Text style={styles.label}>GÖREV / UNVAN</Text>
          <TextInput
            style={styles.input}
            placeholder="İnsan Kaynakları Müdürü"
            value={position}
            onChangeText={setPosition}
          />
          
          <Text style={styles.label}>İLGİLİ DEPARTMAN</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setShowDepartmentModal(true)}
          >
            <TextInput
              style={styles.selectInput}
              placeholder="Departman seçiniz"
              value={department}
              editable={false}
            />
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#888" style={styles.selectIcon} />
          </TouchableOpacity>
          
          <Text style={styles.label}>REFERANS KODU</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={referenceCode}
            onChangeText={setReferenceCode}
            keyboardType="number-pad"
          />
          
          <Text style={styles.label}>EPOSTA</Text>
          <TextInput
            style={styles.input}
            placeholder="test@resmigazete.ai"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>ŞİFRE</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginText}>Zaten hesabınız var mı? <Text style={styles.loginLink}>Giriş Yap</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Departman Seçim Modalı */}
      <Modal
        visible={showDepartmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Departman Seçin</Text>
              <TouchableOpacity onPress={() => setShowDepartmentModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DEPARTMENTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.departmentItem}
                  onPress={() => selectDepartment(item)}
                >
                  <Text style={styles.departmentText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    marginVertical: 30,
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
  selectContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  selectInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  selectIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
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
    color: '#666',
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  departmentItem: {
    padding: 15,
  },
  departmentText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
  },
});

export default RegisterScreen;
