// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../api/splitSmartApi';
import { setCredentials } from '../features/auth/authSlice';
import { COLORS } from '../theme/colors';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Input Error', 'Please fill in all fields.');
      return;
    }
    try {
      // API expects email, full_name, password
      const result = await register({ email, full_name: fullName, password }).unwrap();
      // On successful registration, the API returns the user object (excluding password)
      // and we immediately log them in (assuming backend issues a token).
      // Note: Your register API returns the user object, not a token.
      // A common flow is to auto-login after register, so we'll do that manually or call login API.
      // For simplicity now, let's assume successful registration implies an immediate login or
      // you navigate to login to perform that step.
      // A more robust backend would return the token directly on registration for convenience.

      Alert.alert('Success', 'Account created! Please log in.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
      // If your backend for /register returned a token, you'd do:
      // dispatch(setCredentials({ token: result.access_token, user: result }));
      // navigation is handled by AppNavigator
    } catch (err) {
      console.error('Registration failed:', err);
      Alert.alert(
        'Registration Failed',
        err.data?.detail || 'An error occurred during registration. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Join SplitSmart</Text>

        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, underlineColor: 'transparent', onSurface: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          autoCapitalize="words"
          left={<TextInput.Icon icon="account-outline" color={COLORS.accentCyan} />}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, underlineColor: 'transparent', onSurface: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" color={COLORS.accentCyan} />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, underlineColor: 'transparent', onSurface: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye" : "eye-off"}
              onPress={() => setShowPassword(!showPassword)}
              color={COLORS.accentCyan}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </Button>

        {error && <Text style={styles.errorText}>{error.data?.detail || 'An unknown error occurred.'}</Text>}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.highlightLink}>Login</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.accentCyan,
    marginBottom: 40,
    textShadowColor: COLORS.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  input: {
    width: '90%',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
  },
  button: {
    width: '90%',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  buttonContent: {
    height: 50,
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: COLORS.accentPink,
    fontSize: 16,
    textShadowColor: COLORS.accentPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  highlightLink: {
    fontWeight: 'bold',
    color: COLORS.accentCyan,
    textShadowColor: COLORS.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default RegisterScreen;