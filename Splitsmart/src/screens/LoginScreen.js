// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../api/splitSmartApi';
import { setCredentials } from '../features/auth/authSlice';
import { COLORS } from '../theme/colors';

const LoginScreen = () => {
  // --- Hooks and State Initialization ---
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // State for the form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // RTK Query mutation hook
  // isLoading: true when the mutation is in progress
  // error: contains error details if the mutation fails
  const [login, { isLoading, error }] = useLoginMutation();

  // --- Logic for Handling Login ---
  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Input Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Call the login mutation from RTK Query
      const result = await login({ username: email, password }).unwrap();

      // If successful, dispatch the credentials to the Redux store
      dispatch(setCredentials({ token: result.access_token, user: { email } }));

      // The AppNavigator will automatically detect the change in
      // authentication state and navigate to the MainAppStack.

    } catch (err) {
      // --- Robust Error Handling ---
      console.error('Login failed (raw error):', JSON.stringify(err, null, 2));

      // Function to parse the complex error object from FastAPI
      const parseErrorMessage = (errorObj) => {
        if (errorObj.data && errorObj.data.detail) {
          // If detail is an array (FastAPI validation error 422)
          if (Array.isArray(errorObj.data.detail)) {
            // Extract the 'msg' from the first error in the array
            return errorObj.data.detail[0].msg || 'Validation failed. Please check your inputs.';
          }
          // If detail is a string (e.g., 401 Unauthorized "Incorrect username or password")
          return errorObj.data.detail;
        }
        // Fallback for generic network errors or other issues
        return 'An unexpected error occurred. Please try again.';
      };

      const friendlyMessage = parseErrorMessage(err);

      Alert.alert(
        'Login Failed',
        friendlyMessage // Pass the guaranteed string to the alert
      );
    }
  };

  // --- JSX for the Component's UI ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Welcome Back!</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
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
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye' : 'eye-off'}
              onPress={() => setShowPassword(!showPassword)}
              color={COLORS.accentCyan}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </Button>

        {/* This optional text can show a generic error message below the button */}
        {/* {error && <Text style={styles.errorText}>Login failed. Please try again.</Text>} */}

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.highlightLink}>Sign Up</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Forgot Password?', 'This feature is not yet implemented.')} style={styles.link}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Styles for the Component ---
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
    color: COLORS.accentPink,
    marginBottom: 40,
    textShadowColor: COLORS.accentPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  input: {
    width: '90%',
    marginBottom: 15,
  },
  button: {
    width: '90%',
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
    color: COLORS.accentCyan,
    fontSize: 16,
    textShadowColor: COLORS.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  highlightLink: {
    fontWeight: 'bold',
    color: COLORS.accentPink,
    textShadowColor: COLORS.accentPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;