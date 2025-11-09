// src/navigation/AppNavigator.js

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';     // We will create this
import RegisterScreen from '../screens/RegisterScreen'; // We will create this
import MainAppStack from './MainAppStack';         // The main app part
import { setLoading, setCredentials, selectIsAuthenticated, selectAuthLoading } from '../features/auth/authSlice';

const Stack = createNativeStackNavigator();

// This stack will handle the non-authenticated flow
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // In a real app, you'd verify this token with an API call (e.g., getMe)
          // For now, we'll just set it if found.
          dispatch(setCredentials({ token, user: null })); // User will be fetched later
        }
      } catch (e) {
        console.error("Failed to load token from storage", e);
      } finally {
        dispatch(setLoading(false)); // Indicate that initial loading is complete
      }
    };

    loadToken();
  }, [dispatch]);

  if (isLoading) {
    // Show splash screen while checking for token
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainAppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;