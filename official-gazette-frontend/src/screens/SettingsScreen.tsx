import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';

const SettingsScreen: React.FC = () => {
  // State for various settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [dataUsageEnabled, setDataUsageEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Türkçe');
  const [selectedFontSize, setSelectedFontSize] = useState('Orta');

  // Language options
  const languages = ['Türkçe', 'English'];
  
  // Font size options
  const fontSizes = ['Küçük', 'Orta', 'Büyük'];

  // Handle language selection
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    Alert.alert(
      'Dil Değişikliği',
      'Uygulama dili değiştirilecek. Bu işlem uygulamayı yeniden başlatabilir.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Değiştir',
          onPress: () => {
            // In a real app, we would change the language here
            setSelectedLanguage(language);
          },
        },
      ]
    );
  };

  // Handle font size selection
  const handleFontSizeSelect = (size: string) => {
    setSelectedFontSize(size);
  };

  // Handle data clearing
  const handleClearData = () => {
    Alert.alert(
      'Veri Temizleme',
      'Tüm uygulama verileriniz silinecek. Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Temizle',
          onPress: () => {
            // In a real app, we would clear data here
            console.log('Data cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Bildirimleri Etkinleştir</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={notificationsEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            value={notificationsEnabled}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.settingItem, !notificationsEnabled && styles.disabledSetting]}
          disabled={!notificationsEnabled}
        >
          <View style={styles.settingInfo}>
            <MaterialIcons name="schedule" size={24} color={notificationsEnabled ? COLORS.primary : COLORS.disabled} />
            <Text style={[styles.settingText, !notificationsEnabled && styles.disabledText]}>
              Bildirim Zamanı
            </Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={[styles.settingValueText, !notificationsEnabled && styles.disabledText]}>
              09:00
            </Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={notificationsEnabled ? COLORS.disabled : COLORS.border} 
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, !notificationsEnabled && styles.disabledSetting]}
          disabled={!notificationsEnabled}
        >
          <View style={styles.settingInfo}>
            <MaterialIcons name="category" size={24} color={notificationsEnabled ? COLORS.primary : COLORS.disabled} />
            <Text style={[styles.settingText, !notificationsEnabled && styles.disabledText]}>
              Kategori Tercihleri
            </Text>
          </View>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={notificationsEnabled ? COLORS.disabled : COLORS.border} 
          />
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="dark-mode" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Karanlık Mod</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={darkModeEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setDarkModeEnabled(!darkModeEnabled)}
            value={darkModeEnabled}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="format-size" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Yazı Boyutu</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>{selectedFontSize}</Text>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
          </View>
        </TouchableOpacity>
        
        {/* Font Size Selection */}
        <View style={styles.selectionContainer}>
          {fontSizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.selectionItem,
                selectedFontSize === size && styles.selectedItem,
              ]}
              onPress={() => handleFontSizeSelect(size)}
            >
              <Text
                style={[
                  styles.selectionText,
                  selectedFontSize === size && styles.selectedText,
                  size === 'Küçük' && { fontSize: SIZES.small },
                  size === 'Orta' && { fontSize: SIZES.font },
                  size === 'Büyük' && { fontSize: SIZES.medium },
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dil</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="language" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Uygulama Dili</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>{selectedLanguage}</Text>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
          </View>
        </TouchableOpacity>
        
        {/* Language Selection */}
        <View style={styles.selectionContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language}
              style={[
                styles.selectionItem,
                selectedLanguage === language && styles.selectedItem,
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <Text
                style={[
                  styles.selectionText,
                  selectedLanguage === language && styles.selectedText,
                ]}
              >
                {language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="fingerprint" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Biyometrik Kimlik Doğrulama</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={biometricAuthEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setBiometricAuthEnabled(!biometricAuthEnabled)}
            value={biometricAuthEnabled}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="lock" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Şifre Değiştir</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      {/* Data & Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veri & Depolama</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="save" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Otomatik Kaydetme</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={autoSaveEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
            value={autoSaveEnabled}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="data-usage" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Mobil Veri Kullanımı</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={dataUsageEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setDataUsageEnabled(!dataUsageEnabled)}
            value={dataUsageEnabled}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleClearData}
        >
          <View style={styles.settingInfo}>
            <MaterialIcons name="delete" size={24} color={COLORS.error} />
            <Text style={[styles.settingText, { color: COLORS.error }]}>
              Tüm Verileri Temizle
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="info" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Uygulama Hakkında</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="description" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Kullanım Koşulları</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="privacy-tip" size={24} color={COLORS.primary} />
            <Text style={styles.settingText}>Gizlilik Politikası</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </TouchableOpacity>
      </View>

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
  section: {
    backgroundColor: COLORS.card,
    marginBottom: SPACING.m,
    paddingVertical: SPACING.m,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    paddingHorizontal: SPACING.l,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  disabledSetting: {
    opacity: 0.7,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SPACING.m,
  },
  disabledText: {
    color: COLORS.disabled,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: SIZES.font,
    color: COLORS.disabled,
    marginRight: SPACING.xs,
  },
  selectionContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
  },
  selectionItem: {
    flex: 1,
    paddingVertical: SPACING.s,
    alignItems: 'center',
    borderRadius: SIZES.base,
    marginRight: SPACING.s,
    backgroundColor: COLORS.background,
  },
  selectedItem: {
    backgroundColor: COLORS.primary,
  },
  selectionText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.card,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  versionText: {
    fontSize: SIZES.small,
    color: COLORS.disabled,
  },
});

export default SettingsScreen;
