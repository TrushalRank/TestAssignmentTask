/**
 * Validation utility tests
 */

describe('Email Validation', () => {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  test('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('test@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('Password Validation', () => {
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  test('should validate passwords with 6 or more characters', () => {
    expect(validatePassword('password123')).toBe(true);
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('abcdef')).toBe(true);
  });

  test('should reject passwords shorter than 6 characters', () => {
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('pass')).toBe(false);
    expect(validatePassword('')).toBe(false);
  });
});

describe('Phone Number Validation', () => {
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  test('should validate correct phone numbers', () => {
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('+1 (123) 456-7890')).toBe(true);
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('+12345678901')).toBe(true);
  });

  test('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('123456789')).toBe(false);
    expect(validatePhone('abc1234567')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('Required Field Validation', () => {
  const validateRequired = (value: string): string => {
    if (!value.trim()) {
      return 'This field is required.';
    }
    return '';
  };

  test('should return error for empty strings', () => {
    expect(validateRequired('')).toBe('This field is required.');
    expect(validateRequired('   ')).toBe('This field is required.');
  });

  test('should return empty string for valid values', () => {
    expect(validateRequired('test')).toBe('');
    expect(validateRequired('  test  ')).toBe('');
  });
});
