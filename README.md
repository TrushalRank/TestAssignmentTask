# TestTask - Secure Authentication App

A React Native application built with Expo Router that implements secure authentication with account setup, sign-in, and session management features.

## Table of Contents

- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running the App](#running-the-app)
- [Architecture](#architecture)
- [Validation Rules](#validation-rules)
- [Security Approach](#security-approach)
- [Testing](#testing)
- [Scripts](#scripts)
- [Trade-offs & Considerations](#trade-offs--considerations)

## Screenshots & Recording
<img width="406" height="1322" alt="Simulator Screenshot - iPhone 16 Pro - 2025-11-18 at 10 47 27" src="https://github.com/user-attachments/assets/4f15769a-4867-4050-b512-713f6081799f" />
<img width="406" height="1322" alt="Simulator Screenshot - iPhone 16 Pro - 2025-11-18 at 10 47 30" src="https://github.com/user-attachments/assets/308147a6-4e24-4eec-8998-9a29093b05f3" />
<img width="406" height="1322" alt="Simulator Screenshot - iPhone 16 Pro - 2025-11-18 at 10 47 44" src="https://github.com/user-attachments/assets/18052110-807b-4012-8b0d-316699f6c8d4" />
<img width="406" height="1322" alt="Simulator Screenshot - iPhone 16 Pro - 2025-11-18 at 10 48 37" src="https://github.com/user-attachments/assets/f4f0e33f-bbfc-4ce0-9bc7-b8d2986bb243" />
<img width="406" height="1322" alt="Simulator Screenshot - iPhone 16 Pro - 2025-11-18 at 10 48 43" src="https://github.com/user-attachments/assets/7f68d97f-f845-470b-82e9-99589db730f4" />

## Features

### Authentication
- **Account Setup Form**: Create new accounts with email, password, first name, last name, and phone number
- **Sign In Form**: Login with email and password
- **Secure Storage**: Credentials stored using Expo SecureStore (Keychain/Keystore)
- **Session Persistence**: Automatic login on app restart if previously authenticated
- **Failed Login Protection**: Account lockout after 5 failed attempts (15-minute lockout period)
- **Biometric Authentication**: Optional Face ID/Touch ID/Fingerprint unlock support
- **Auto-login**: Seamless authentication on app restart

### User Interface
- **Form Validation**: Real-time validation with error messages
- **Disabled Submit Buttons**: Buttons remain disabled until all validations pass
- **User Profile**: Home page displays logged-in user information
- **Logout Functionality**: Secure logout with confirmation dialog

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd TestTask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

## Running the App

### Development Mode

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

### Other Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Type check (TypeScript)
npm run type-check
```

## Architecture

### Project Structure

```
TestTask/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home page (user profile)
│   │   └── explore.tsx    # Explore tab
│   ├── account-setup.tsx  # Account registration form
│   ├── signin.tsx         # Sign in form
│   ├── index.tsx          # Initial routing/auto-login handler
│   └── _layout.tsx        # Root layout with AuthProvider
├── components/            # Reusable UI components
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication context
├── utils/                 # Utility functions
│   ├── auth.ts            # Authentication logic & SecureStore operations
│   └── __tests__/         # Unit tests
├── hooks/                 # Custom React hooks
└── constants/            # App constants (themes, colors)
```

### Key Components

#### Authentication Flow

1. **Initial Load** (`app/index.tsx`)
   - Checks authentication status on app start
   - Redirects to home if authenticated, sign-in if not

2. **Account Setup** (`app/account-setup.tsx`)
   - Validates all required fields
   - Saves user data to SecureStore
   - Sets authenticated status
   - Redirects to home page

3. **Sign In** (`app/signin.tsx`)
   - Validates email and password
   - Checks against stored credentials
   - Tracks failed login attempts
   - Implements lockout after 5 failed attempts
   - Supports biometric authentication

4. **Home Page** (`app/(tabs)/index.tsx`)
   - Displays user information
   - Provides logout functionality

#### Authentication Context (`contexts/AuthContext.tsx`)

- Manages global authentication state
- Provides `useAuth()` hook for components
- Handles login, logout, and biometric authentication
- Maintains user session state

#### Auth Utilities (`utils/auth.ts`)

- Secure storage operations using Expo SecureStore
- User data management
- Login attempt tracking
- Lockout management
- Biometric authentication helpers

## Validation Rules

### Account Setup Form

1. **Email Address**
   - Required field
   - Must match valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Error message: "This field is required." or "Please enter a valid email address."

2. **Password**
   - Required field
   - Minimum 6 characters
   - Error message: "This field is required." or "Password must be at least 6 characters."

3. **First Name**
   - Required field
   - Error message: "This field is required."

4. **Last Name**
   - Required field
   - Error message: "This field is required."

5. **Phone Number**
   - Required field
   - Must contain at least 10 digits
   - Allows common phone number formats (spaces, dashes, parentheses, plus sign)
   - Error message: "This field is required." or "Please enter a valid phone number."

### Sign In Form

1. **Email Address**
   - Required field
   - Must match valid email format
   - Error message: "This field is required." or "Please enter a valid email address."

2. **Password**
   - Required field
   - Error message: "This field is required."

### Form Behavior

- All fields validate on blur
- Submit buttons are disabled until all validations pass
- Real-time error messages displayed below each field
- Form submission only proceeds if all validations pass

## Security Approach

### Secure Storage

- **Expo SecureStore**: Used instead of AsyncStorage for credential storage
  - iOS: Uses Keychain Services
  - Android: Uses EncryptedSharedPreferences (Android Keystore)
  - Provides hardware-backed encryption when available

### Password Storage

- **Current Implementation**: Passwords are stored in SecureStore (encrypted at rest)
- **Production Recommendation**: In a production environment, passwords should be:
  - Hashed using bcrypt or similar
  - Never stored in plaintext
  - Sent over HTTPS only

### Session Management

- Authentication status stored in SecureStore
- Session persists across app restarts
- Logout clears authentication status but keeps user data (for re-login)
- Full data clearing available via `clearAllData()` function

### Failed Login Protection

- Tracks failed login attempts in SecureStore
- Locks account after 5 failed attempts
- 15-minute lockout period
- Lockout status cleared after expiration
- Failed attempts reset on successful login

### Biometric Authentication

- Uses `expo-local-authentication`
- Checks for hardware availability
- Checks for enrolled biometrics
- Falls back to password if biometric fails
- Optional feature (only shown if available)

### Security Best Practices Implemented

1. ✅ Secure credential storage (Keychain/Keystore)
2. ✅ Session persistence with secure storage
3. ✅ Failed login attempt tracking
4. ✅ Account lockout mechanism
5. ✅ Biometric authentication support
6. ✅ Input validation on client side
7. ✅ Secure logout functionality

### Security Considerations for Production

1. **Password Hashing**: Implement server-side password hashing (bcrypt, Argon2)
2. **HTTPS Only**: All API calls should use HTTPS
3. **Token-Based Auth**: Consider JWT tokens for session management
4. **Rate Limiting**: Implement server-side rate limiting
5. **2FA**: Consider adding two-factor authentication
6. **Certificate Pinning**: Implement SSL pinning for API calls
7. **Code Obfuscation**: Obfuscate production builds

## Testing

### Unit Tests

Tests are located in `utils/__tests__/`:

- **validation.test.ts**: Tests for email, password, phone number, and required field validation
- **auth.test.ts**: Tests for authentication logic, lockout mechanism, and SecureStore operations

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Tests cover:
- Email validation logic
- Password validation logic
- Phone number validation logic
- Required field validation
- User data save/retrieve operations
- Authentication status checks
- Login success/failure scenarios
- Failed attempt tracking
- Account lockout mechanism
- Lockout expiration handling
- Logout functionality

## Scripts

| Script | Description |
|--------|-------------|
| `npm install` | Install all dependencies |
| `npm start` | Start Expo development server |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run ios` | Start on iOS simulator |
| `npm run android` | Start on Android emulator |
| `npm run web` | Start on web browser |

## Trade-offs & Considerations

### Current Implementation Trade-offs

1. **Password Storage**
   - **Trade-off**: Passwords stored in SecureStore (encrypted) but not hashed
   - **Reason**: This is a demo app; production should use server-side hashing
   - **Impact**: If device is compromised, passwords could be extracted (though encrypted)

2. **Client-Side Validation Only**
   - **Trade-off**: Validation happens only on client side
   - **Reason**: No backend server in this implementation
   - **Impact**: Malicious users could bypass validation (mitigated by SecureStore protection)

3. **Single User Storage**
   - **Trade-off**: Only one user account can be stored at a time
   - **Reason**: Simplified for demo purposes
   - **Impact**: Users must clear data to create a new account

4. **No Network Authentication**
   - **Trade-off**: All authentication is local
   - **Reason**: No backend API implemented
   - **Impact**: Cannot sync across devices or verify credentials remotely

5. **Biometric Fallback**
   - **Trade-off**: Biometric authentication falls back to password
   - **Reason**: User experience consideration
   - **Impact**: If biometric fails, user can still use password

### Performance Considerations

- SecureStore operations are asynchronous but fast
- Form validation happens on blur (not on every keystroke) for better performance
- Authentication status checked once on app start

### Future Enhancements

1. Server-side authentication API
2. Password hashing (bcrypt/Argon2)
3. JWT token-based sessions
4. Multi-user support
5. Password reset functionality
6. Email verification
7. Two-factor authentication
8. Account recovery options

## License

This project is private and for demonstration purposes only.
