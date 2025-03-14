import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { ThemeContext } from '../../App';
import * as LocalAuthentication from 'expo-local-authentication';
import { RootStackParamList } from '../navigation/types';

// Yazı boyutu seçenekleri
const FONT_SIZES = {
  small: 0.8,
  medium: 1,
  large: 1.2
} as const;

type FontSizeKey = keyof typeof FONT_SIZES;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme, fontSizeScale, setFontSizeScale } = useContext(ThemeContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [userData, setUserData] = useState({
    companyName: '',
    email: user?.email || ''
  });

  // Kullanıcı verilerini ayarla
  useEffect(() => {
    if (user) {
      // Firestore'dan kullanıcı verilerini çekebiliriz
      // Şimdilik sadece e-posta adresini kullanıyoruz
      setUserData({
        companyName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        email: user.email || ''
      });
    }
  }, [user]);

  // Biyometrik kimlik doğrulama kontrolü
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Çıkış Yap',
        'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Çıkış Yap',
            onPress: async () => {
              await logout();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  // Profili düzenleme işlevi
  const handleEditProfile = () => {
    // @ts-ignore - We'll fix the navigation types later
    navigation.navigate('EditProfile', { userData });
  };

  // Yazı boyutunu değiştirme işlevi
  const changeFontSize = (size: number) => {
    if (setFontSizeScale) {
      setFontSizeScale(size);
    }
  };

  // Yazı boyutunu ölçeklendirme
  const scaledFontSize = (size: number): number => {
    return Math.round(size * (fontSizeScale || 1));
  };

  // Biyometrik kimlik doğrulama kontrolü
  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert(
        'Uyarı',
        'Bu cihaz biyometrik kimlik doğrulamayı desteklemiyor.'
      );
      return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert(
        'Uyarı',
        'Bu cihazda biyometrik kimlik doğrulama ayarlanmamış.'
      );
      return false;
    }

    return true;
  };

  // Biyometrik kimlik doğrulama durumunu değiştir
  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      const supported = await checkBiometricSupport();
      if (supported) {
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Face ID ile kimlik doğrulama',
            disableDeviceFallback: false,
          });
          
          if (result.success) {
            setBiometricEnabled(true);
            Alert.alert('Başarılı', 'Face ID ile giriş etkinleştirildi');
          }
        } catch (error) {
          Alert.alert('Hata', 'Kimlik doğrulama başarısız oldu');
        }
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme?.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.extraLarge) }]}>Profil</Text>
      </View>

      <View style={[styles.profileSection, { backgroundColor: theme.card }]}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {userData.companyName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.profileName, { color: theme.text, fontSize: scaledFontSize(SIZES.large) }]}>{userData.companyName}</Text>
        <Text style={[styles.profileEmail, { color: theme.textLight, fontSize: scaledFontSize(SIZES.font) }]}>{userData.email}</Text>
        <TouchableOpacity 
          style={[styles.editProfileButton, styles.editProfileButtonActive]}
          onPress={handleEditProfile}
        >
          <Text style={[styles.editProfileButtonText, styles.editProfileButtonTextActive]}>Profili Düzenle</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Görünüm</Text>
        
        <View style={[styles.settingsItem, { borderBottomColor: theme.border }]}>
          <MaterialIcons name="format-size" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Yazı Boyutu</Text>
        </View>
        
        <View style={styles.fontSizeSelector}>
          <TouchableOpacity 
            style={[
              styles.fontSizeButton, 
              fontSizeScale === FONT_SIZES.small && styles.fontSizeButtonActive
            ]}
            onPress={() => changeFontSize(FONT_SIZES.small)}
          >
            <Text style={[
              styles.fontSizeButtonText, 
              { color: fontSizeScale === FONT_SIZES.small ? COLORS.white : theme.text }
            ]}>Küçük</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.fontSizeButton, 
              fontSizeScale === FONT_SIZES.medium && styles.fontSizeButtonActive
            ]}
            onPress={() => changeFontSize(FONT_SIZES.medium)}
          >
            <Text style={[
              styles.fontSizeButtonText, 
              { color: fontSizeScale === FONT_SIZES.medium ? COLORS.white : theme.text }
            ]}>Orta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.fontSizeButton, 
              fontSizeScale === FONT_SIZES.large && styles.fontSizeButtonActive
            ]}
            onPress={() => changeFontSize(FONT_SIZES.large)}
          >
            <Text style={[
              styles.fontSizeButtonText, 
              { color: fontSizeScale === FONT_SIZES.large ? COLORS.white : theme.text }
            ]}>Büyük</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Ayarlar</Text>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('Settings');
          }}
        >
          <MaterialIcons name="settings" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Uygulama Ayarları</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <View style={[styles.settingsItem, { borderBottomColor: theme.border }]}>
          <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Bildirimler</Text>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={notificationsEnabled ? COLORS.primary : theme.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            value={notificationsEnabled}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('Notifications');
          }}
        >
          <MaterialIcons name="notifications-active" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Bildirim Geçmişi</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Güvenlik</Text>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={toggleBiometric}
        >
          <MaterialIcons name="face" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Face ID ile Giriş</Text>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={biometricEnabled ? COLORS.primary : theme.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={toggleBiometric}
            value={biometricEnabled}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Kategoriler</Text>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('CategoryList');
          }}
        >
          <MaterialIcons name="category" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Kategori Tercihleri</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Yardım & Destek</Text>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('ChatDetail');
          }}
        >
          <MaterialIcons name="chat" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Sohbet Asistanı</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('FAQ');
          }}
        >
          <MaterialIcons name="help" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Sık Sorulan Sorular</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: scaledFontSize(SIZES.medium) }]}>Hakkında</Text>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('About');
          }}
        >
          <MaterialIcons name="info" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Uygulama Hakkında</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('TermsOfService');
          }}
        >
          <MaterialIcons name="description" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Kullanım Koşulları</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingsItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('PrivacyPolicy');
          }}
        >
          <MaterialIcons name="security" size={24} color={COLORS.primary} />
          <Text style={[styles.settingsItemText, { color: theme.text, fontSize: scaledFontSize(SIZES.font) }]}>Gizlilik Politikası</Text>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { fontSize: scaledFontSize(SIZES.medium) }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versiyon 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  profileImageContainer: {
    marginBottom: SPACING.m,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: SPACING.m,
  },
  editProfileButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.l,
    borderRadius: SIZES.base,
  },
  editProfileButtonActive: {
    backgroundColor: COLORS.primary,
  },
  editProfileButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontWeight: 'bold',
  },
  editProfileButtonTextActive: {
    color: COLORS.white || '#FFFFFF',
  },
  settingsSection: {
    backgroundColor: COLORS.white || '#FFFFFF',
    marginHorizontal: SPACING.m,
    borderRadius: SIZES.base,
    ...SHADOWS.small,
    marginBottom: SPACING.m,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: SPACING.m,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsItemText: {
    flex: 1,
    marginLeft: SPACING.m,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  fontSizeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
  },
  fontSizeButton: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white || '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fontSizeButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  fontSizeButtonTextActive: {
    color: COLORS.white || '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.m,
    marginVertical: SPACING.m,
    padding: SPACING.m,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontWeight: 'bold',
    fontSize: SIZES.medium,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  versionText: {
    fontSize: SIZES.small,
    color: COLORS.disabled,
  },
});

export default ProfileScreen;
