import React, { useContext, createContext, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { useColorScheme } from 'react-native';

// Import navigation
import Navigation from './src/navigation';
import { COLORS } from './src/constants/theme';

// Import Auth Provider
import { AuthProvider } from './src/contexts/AuthContext';

// Theme Context
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: {
    background: string;
    card: string;
    text: string;
    textLight: string;
    border: string;
    tabBar: string;
    tabBarInactive: string;
  };
  fontSizeScale: number;
  setFontSizeScale: (scale: number) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: {
    background: COLORS.background,
    card: COLORS.white || '#FFFFFF',
    text: COLORS.text,
    textLight: COLORS.textLight || '#94A3B8',
    border: COLORS.border,
    tabBar: COLORS.white || '#FFFFFF',
    tabBarInactive: COLORS.disabled,
  },
  fontSizeScale: 1,
  setFontSizeScale: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');
  const [fontSizeScale, setFontSizeScale] = useState(1); // Default font size scale

  useEffect(() => {
    // Cihaz teması değiştiğinde güncelle
    setIsDarkMode(deviceTheme === 'dark');
  }, [deviceTheme]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Tema renklerini ayarla
  const theme = {
    background: isDarkMode ? '#121212' : COLORS.background,
    card: isDarkMode ? '#1E1E1E' : COLORS.white || '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : COLORS.text,
    textLight: isDarkMode ? '#BBBBBB' : COLORS.textLight || '#94A3B8',
    border: isDarkMode ? '#333333' : COLORS.border,
    tabBar: isDarkMode ? '#1E1E1E' : COLORS.white || '#FFFFFF',
    tabBarInactive: isDarkMode ? '#666666' : COLORS.disabled,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, fontSizeScale, setFontSizeScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

// StatusBar bileşeni
const ThemedStatusBar = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  return (
    <StatusBar 
      style={isDarkMode ? "light" : "dark"} 
      backgroundColor={theme.background} 
    />
  );
};

// Temporary empty store until we implement reducers
const store = configureStore({
  reducer: {
    // We'll add reducers here later
    temp: (state = {}, action) => state,
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <ThemeProvider>
              <NavigationContainer
                theme={{
                  dark: false, // NavigationContainer'ın kendi dark mode'unu kullanmıyoruz
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: COLORS.white || '#FFFFFF',
                    text: COLORS.text,
                    border: COLORS.border,
                    notification: COLORS.notification,
                  },
                  fonts: {
                    regular: {
                      fontFamily: 'System',
                      fontWeight: 'normal',
                    },
                    medium: {
                      fontFamily: 'System',
                      fontWeight: '500',
                    },
                    bold: {
                      fontFamily: 'System',
                      fontWeight: 'bold',
                    },
                    heavy: {
                      fontFamily: 'System',
                      fontWeight: '900',
                    },
                  },
                }}
              >
                <ThemedStatusBar />
                <Navigation />
              </NavigationContainer>
            </ThemeProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
