// src/screens/SplashScreen.js

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, StatusBar, Animated, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// --- (Your theme and font setup) ---
const CYBERPUNK_THEME = {
  BACKGROUND_DARK: '#0D011A',
  ACCENT_PINK: '#F900E5',
  ACCENT_CYAN: '#00FFFF',
};

const SplashScreen = () => {
  // This hook is the reason for the error.
  // It can only work if this component is rendered inside a Navigator.
  const navigation = useNavigation();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 50000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Auth');
      }, 50000);
    });
  }, [opacityAnim, navigation]);

  return (
    <ImageBackground
      source={require('../assets/images/cyberpunk-background.png')} // Make sure this path is correct
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={CYBERPUNK_THEME.BACKGROUND_DARK} />
      <Animated.View style={[styles.contentContainer, { opacity: opacityAnim }]}>
        <Text style={styles.header}>SplitSmart</Text>
        <Text style={styles.tagline}>Split smart, live smart</Text>
      </Animated.View>
    </ImageBackground>
  );
};

// --- (Your full styles from before) ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    fontFamily: 'Rajdhani-Bold', // Use your custom font
    fontSize: 72,
    color: CYBERPUNK_THEME.ACCENT_PINK,
    textShadowColor: CYBERPUNK_THEME.ACCENT_PINK,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 20,
  },
  tagline: {
    fontFamily: 'Rajdhani-Medium', // Use your custom font
    fontSize: 28,
    color: CYBERPUNK_THEME.ACCENT_CYAN,
    textShadowColor: CYBERPUNK_THEME.ACCENT_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});

export default SplashScreen;