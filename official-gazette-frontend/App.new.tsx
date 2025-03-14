import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';

// Import navigation
import Navigation from './src/navigation';
import { COLORS } from './src/constants/theme';

// Import Auth Provider
import { AuthProvider } from './src/contexts/AuthContext';

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
          <StatusBar style="dark" backgroundColor={COLORS.background} />
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
