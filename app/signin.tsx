import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

interface FormErrors {
  email: string;
  password: string;
}

export default function SignInScreen() {
  const { login, biometricLogin, isBiometricEnabled } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
  });

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string>('');

  const checkBiometric = async () => {
    const available = await isBiometricEnabled();
    setBiometricAvailable(available);
  };

  useEffect(() => {
    checkBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBiometricLogin = async () => {
    const success = await biometricLogin();
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Biometric Authentication Failed', 'Please try again or use email/password.');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name: keyof typeof formData, value: string): string => {
    if (!value.trim()) {
      return 'This field is required.';
    }

    if (name === 'email' && !validateEmail(value)) {
      return 'Please enter a valid email address.';
    }

    return '';
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: keyof typeof formData) => {
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = (): boolean => {
    const newErrors: FormErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    setLoginMessage('');
    // Normalize email to lowercase for case-insensitive login
    const normalizedEmail = formData.email.toLowerCase().trim();
    const result = await login(normalizedEmail, formData.password);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setLoginMessage(result.message || 'Invalid email or password. Please try again.');
      if (result.attemptsRemaining !== undefined) {
        Alert.alert(
          'Login Failed',
          `${result.message}\n${result.attemptsRemaining > 0 ? `Attempts remaining: ${result.attemptsRemaining}` : ''}`,
        );
      } else {
        Alert.alert('Error', result.message || 'Invalid email or password. Please try again.');
      }
    }
  };

  const isLoginDisabled = () => {
    return (
      !formData.email ||
      !formData.password ||
      Object.values(errors).some((error) => error !== '')
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.formContainer}>
          <ThemedText type="title" style={styles.title}>
            Sign In
          </ThemedText>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={styles.label}>EMAIL ADDRESS</ThemedText>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="enter a email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={styles.label}>PASSWORD</ThemedText>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="enter a password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              onBlur={() => handleBlur('password')}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </ThemedView>

          <TouchableOpacity
            onPress={() => router.push('/account-setup')}
            style={styles.signUpLink}>
            <ThemedText style={styles.signUpLinkText}>
              Don&apos;t have an account? Sign up here
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.bottomSection}>
          {loginMessage ? (
            <ThemedText style={styles.errorMessage}>{loginMessage}</ThemedText>
          ) : null}
          {biometricAvailable && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
              <ThemedText style={styles.biometricButtonText}>🔐 Use Biometric</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.loginButton, isLoginDisabled() && styles.loginButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoginDisabled()}>
            <ThemedText style={styles.loginButtonText}>SIGN IN</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  signUpLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  signUpLinkText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 20,
  },
  errorMessage: {
    color: '#ff0000',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  biometricButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#87CEEB',
    borderWidth: 2,
    borderColor: '#4682B4',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#d3d3d3',
    borderColor: '#a9a9a9',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

