import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../api/splitSmartApi';
import { setCredentials } from '../features/auth/authSlice';
import { COLORS } from '../theme/colors';

const ACCENT = COLORS.primary;

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      const result = await login({ username: email, password }).unwrap();
      dispatch(setCredentials({ token: result.access_token, user: { email } }));
    } catch {
      alert('Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Clean refined card */}
        <View style={styles.inputCard}>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor={ACCENT}
            left={<TextInput.Icon icon="email-outline" color={ACCENT} />}
            textColor={COLORS.text}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { marginBottom: 0 }]}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor={ACCENT}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                color={ACCENT}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            textColor={COLORS.text}
          />

        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
          labelStyle={{ fontSize: 18, fontWeight: '600' }}
        >
          Login
        </Button>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 30 }}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
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
    paddingHorizontal: 30,
    paddingBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'left',
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 35,
    marginTop: 4,
  },

  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.border,

    // Softer, more premium shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,

    marginBottom: 35,
  },

  input: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },

  button: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: ACCENT,
    paddingVertical: 8,
  },

  linkText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },

  linkBold: {
    color: ACCENT,
    fontWeight: '700',
  },
});

export default LoginScreen;
