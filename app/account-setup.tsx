import React, { useState } from 'react';
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
import { saveUserData } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';

interface FormErrors {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function AccountSetupScreen() {
  const { setAuthenticatedUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateField = (name: keyof typeof formData, value: string): string => {
    if (!value.trim()) {
      return 'This field is required.';
    }

    switch (name) {
      case 'email':
        if (!validateEmail(value)) {
          return 'Please enter a valid email address.';
        }
        break;
      case 'password':
        if (value.length < 6) {
          return 'Password must be at least 6 characters.';
        }
        break;
      case 'phoneNumber':
        if (!validatePhone(value)) {
          return 'Please enter a valid phone number.';
        }
        break;
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
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      // Normalize email to lowercase before saving
      const normalizedFormData = {
        ...formData,
        email: formData.email.toLowerCase().trim(),
      };
      await saveUserData(normalizedFormData);
      setAuthenticatedUser(normalizedFormData);
      Alert.alert('Success!', 'Account created successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save account. Please try again.');
    }
  };

  const isSaveDisabled = () => {
    return (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
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
            Account setup
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

          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={styles.label}>FIRST NAME</ThemedText>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              placeholder="enter your first name"
              placeholderTextColor="#999"
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              onBlur={() => handleBlur('firstName')}
              autoCapitalize="words"
            />
            {errors.firstName ? (
              <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={styles.label}>LAST NAME</ThemedText>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              placeholder="enter your last name"
              placeholderTextColor="#999"
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              onBlur={() => handleBlur('lastName')}
              autoCapitalize="words"
            />
            {errors.lastName ? (
              <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={styles.label}>PHONE NUMBER</ThemedText>
            <TextInput
              style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
              placeholder="enter a phone number"
              placeholderTextColor="#999"
              value={formData.phoneNumber}
              onChangeText={(value) => handleChange('phoneNumber', value)}
              onBlur={() => handleBlur('phoneNumber')}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber ? (
              <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText>
            ) : null}
          </ThemedView>

          <TouchableOpacity
            onPress={() => router.push('/signin')}
            style={styles.signInLink}>
            <ThemedText style={styles.signInLinkText}>Already registered? Sign in here</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.saveButton, isSaveDisabled() && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSaveDisabled()}>
            <ThemedText style={styles.saveButtonText}>SAVE & START</ThemedText>
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
  signInLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  signInLinkText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 20,
  },
  successMessage: {
    alignSelf: 'flex-start',
  },
  successText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#87CEEB',
    borderWidth: 2,
    borderColor: '#4682B4',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#d3d3d3',
    borderColor: '#a9a9a9',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

