import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';

import { RootStackParamList } from './types';
import BottomTabNavigator from './BottomTabNavigator';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PublicationDetailScreen from '../screens/PublicationDetailScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';

// Import Auth Context
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

// Ortak header stilini tanımlayalım
const commonHeaderStyle = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: COLORS.primary,
};

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // Yükleme durumunda Splash ekranını göster
  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        // Kimlik doğrulama ekranları
        <>
          <Stack.Screen name="Auth" component={LoginScreen} />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              headerShown: true, 
              title: 'Yeni Hesap',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ 
              headerShown: true, 
              title: 'Şifremi Unuttum',
              ...commonHeaderStyle,
            }}
          />
        </>
      ) : (
        // Ana uygulama ekranları
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen 
            name="PublicationDetail" 
            component={PublicationDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Yayın Detayı',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="CategoryList" 
            component={CategoryListScreen}
            options={{ 
              headerShown: true, 
              title: 'Kategoriler',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{ 
              headerShown: true, 
              title: 'Arama',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="ChatDetail" 
            component={ChatDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Sohbet Asistanı',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              headerShown: true, 
              title: 'Ayarlar',
              ...commonHeaderStyle,
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ 
              headerShown: true, 
              title: 'Bildirimler',
              ...commonHeaderStyle,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
