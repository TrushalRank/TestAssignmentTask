# Key Prompts Used in Development

This document contains the key prompts used with the AI assistant (Cursor AI) to develop this authentication application. These prompts can be reused or adapted for similar projects.

## Security Enhancement Prompt

```
Store credentials securely on device (Keychain/Keystore via a library like 
Expo SecureStore or react-native-keychain). Do not store plaintext.

Session persistence across app restarts; logout clears session.

Optional: lockout after 5 failed login attempts; optional biometric unlock.

Unit tests for validation and auth logic.

ESLint + Prettier; no TypeScript errors (tsc passes).

Scripts: install, start, test, lint in package.json.

README with: setup/run instructions, architecture notes, validation rules 
implemented, security approach, and any trade-offs.

Add a detailed section in AI-TOOLS.md describing any AI tools used, selection 
criteria, why and how.

Copy key prompts in a separate Markdown file (in case you need to repeat this 
exercise with a different AI agent).
```

## Follow-up Prompts Used

### Authentication System

```
Create authentication context/utility for managing auth state with:
- User data storage
- Login/logout functionality
- Session persistence
- Auto-login on app restart
```

### Form Validation

```
Implement form validation with:
- Real-time validation on blur
- Error messages for each field
- Disable submit button until all validations pass
- Email format validation
- Password minimum length (6 characters)
- Phone number format validation
```

### Secure Storage Migration

```
Migrate from AsyncStorage to Expo SecureStore for:
- User credentials storage
- Authentication status
- Failed login attempt tracking
- Lockout status
```

### Failed Login Protection

```
Implement failed login attempt tracking:
- Track attempts in secure storage
- Lock account after 5 failed attempts
- 15-minute lockout period
- Show remaining lockout time to user
- Reset attempts on successful login
```

### Biometric Authentication

```
Add biometric authentication support:
- Check for hardware availability
- Check for enrolled biometrics
- Show biometric button if available
- Fall back to password if biometric fails
- Use expo-local-authentication
```

### Testing Setup

```
Set up Jest testing framework:
- Configure jest-expo
- Create unit tests for validation logic
- Create unit tests for auth utilities
- Mock SecureStore and LocalAuthentication
- Set up test coverage reporting
```

### Code Quality

```
Configure code quality tools:
- ESLint with Expo config
- Prettier for code formatting
- Integrate ESLint with Prettier
- Ensure TypeScript passes (tsc --noEmit)
- Add format and lint scripts to package.json
```

### Documentation

```
Create comprehensive documentation:
- README with setup instructions
- Architecture documentation
- Validation rules documentation
- Security approach explanation
- Trade-offs and considerations
- AI tools usage documentation
- Key prompts documentation
```

## Prompt Patterns & Best Practices

### 1. Be Specific About Requirements
- ✅ Good: "Store credentials securely using Expo SecureStore, not AsyncStorage"
- ❌ Bad: "Make it secure"

### 2. Break Down Complex Tasks
- ✅ Good: "1. Install SecureStore, 2. Update auth utilities, 3. Update forms"
- ❌ Bad: "Make everything secure"

### 3. Include Technical Details
- ✅ Good: "Lockout after 5 failed attempts for 15 minutes"
- ❌ Bad: "Add lockout feature"

### 4. Specify File Locations
- ✅ Good: "Create tests in utils/__tests__/validation.test.ts"
- ❌ Bad: "Write tests"

### 5. Request Documentation
- ✅ Good: "Document validation rules, security approach, and trade-offs in README"
- ❌ Bad: "Document it"

### 6. Include Testing Requirements
- ✅ Good: "Write unit tests for validation and auth logic with Jest"
- ❌ Bad: "Add tests"

### 7. Specify Code Quality Standards
- ✅ Good: "Ensure ESLint passes, Prettier formatted, TypeScript compiles"
- ❌ Bad: "Make it clean"

## Example Prompt Templates

### Feature Development Template

```
Create [feature name] with the following requirements:
1. [Requirement 1 with specific details]
2. [Requirement 2 with specific details]
3. [Validation/Error handling requirements]
4. [Testing requirements]
5. [Documentation requirements]

Use [specific library/framework] and follow [coding standards/patterns].
```

### Security Feature Template

```
Implement [security feature] using [library]:
- [Specific security requirement 1]
- [Specific security requirement 2]
- [Storage mechanism: SecureStore/Keychain/Keystore]
- [Error handling approach]
- [Testing requirements]
- [Documentation of security approach]
```

### Testing Template

```
Create unit tests for [component/utility]:
- Test [specific functionality 1]
- Test [specific functionality 2]
- Mock [external dependencies]
- Achieve [coverage percentage] coverage
- Use [testing framework/library]
```

## Lessons Learned

1. **Iterative Approach**: Break large features into smaller, testable prompts
2. **Explicit Requirements**: Be very specific about what you want
3. **Include Context**: Reference existing code or patterns when relevant
4. **Request Documentation**: Always ask for documentation of new features
5. **Quality Checks**: Request linting, type checking, and testing
6. **Review Generated Code**: Always review AI-generated code before using

## Reusing These Prompts

These prompts can be adapted for:
- Similar authentication projects
- Form validation implementations
- Secure storage migrations
- Testing setup for React Native apps
- Documentation generation
- Code quality tool configuration

Simply modify the specific requirements, library names, and file paths to match your project needs.

