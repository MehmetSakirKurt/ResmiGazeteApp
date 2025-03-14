import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    // Authentication logic will be implemented later
    console.log('Auth attempt with:', { email, password });
  };

  const handleGoogleAuth = () => {
    // Google authentication logic will be implemented later
    console.log('Google auth attempt');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          {/* Replace with actual logo image when available */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>RG</Text>
          </View>
          <Text style={styles.title}>Resmi Gazete</Text>
          <Text style={styles.subtitle}>Kategorize Edilmiş İçerikler</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={COLORS.disabled}
              />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          )}

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleAuth}>
            <MaterialIcons name="login" size={24} color={COLORS.text} />
            <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchButton}>
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  logoText: {
    color: COLORS.card,
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    opacity: 0.7,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.l,
    ...SHADOWS.medium,
  },
  formTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.l,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    marginBottom: SPACING.m,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    paddingHorizontal: SPACING.m,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  passwordToggle: {
    padding: SPACING.m,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.m,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingVertical: SPACING.m,
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  authButtonText: {
    color: COLORS.card,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.m,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.text,
    paddingHorizontal: SPACING.m,
    fontSize: SIZES.small,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.m,
    marginBottom: SPACING.m,
  },
  googleButtonText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    marginLeft: SPACING.m,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.text,
    fontSize: SIZES.small,
  },
  switchButton: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
});

export default AuthScreen;
