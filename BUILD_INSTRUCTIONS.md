# Android APK Build Instructions

This guide will help you create a signed APK for Android using EAS Build.

## Prerequisites

1. **Expo Account**: You need a free Expo account
2. **EAS CLI**: Already installed (version 16.17.4 or higher)
3. **Android Package Name**: Configured in `app.json` as `com.testtask.app`

## Step 1: Login to Expo

```bash
eas login
```

If you don't have an account, create one at https://expo.dev

## Step 2: Configure the Project

The project is already configured with:
- `app.json`: Android package name set to `com.testtask.app`
- `eas.json`: Build configuration for preview and production APKs

## Step 3: Build the APK

### Option A: Build Preview APK (Recommended for Testing)

```bash
eas build --platform android --profile preview
```

This will:
- Build an APK (not AAB)
- Sign it automatically with Expo's credentials
- Make it available for download

### Option B: Build Production APK

```bash
eas build --platform android --profile production
```

## Step 4: Download the APK

After the build completes:
1. You'll receive a URL to download the APK
2. Or visit https://expo.dev/accounts/[your-account]/builds
3. Download the APK file

## Step 5: Install on Device

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Open the APK file and install

## Alternative: Local Build (Advanced)

If you want to build locally without EAS:

### 1. Prebuild Native Code

```bash
npx expo prebuild --platform android
```

### 2. Generate Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore testtask-release-key.keystore -alias testtask-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configure Gradle

Create `android/gradle.properties`:
```
MYAPP_RELEASE_STORE_FILE=testtask-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=testtask-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-store-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

### 4. Build APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Notes

- **Package Name**: Currently set to `com.testtask.app`. Change it in `app.json` if needed.
- **Version Code**: Increment `versionCode` in `app.json` for each new release.
- **Signing**: EAS Build handles signing automatically. For local builds, you need to manage your own keystore.
- **APK vs AAB**: APK is for direct installation. AAB (Android App Bundle) is required for Google Play Store.

## Troubleshooting

### Build Fails
- Check your Expo account is logged in: `eas whoami`
- Verify app.json configuration
- Check build logs on expo.dev

### APK Installation Fails
- Ensure "Install from Unknown Sources" is enabled
- Check if device architecture matches (arm64-v8a, armeabi-v7a, x86, x86_64)

### Need to Change Package Name
1. Update `android.package` in `app.json`
2. Run `eas build --platform android --clear-cache`

## Next Steps

- For Google Play Store: Build AAB instead of APK
- Update `eas.json` production profile to use `"buildType": "app-bundle"`
- Submit to Play Store using: `eas submit --platform android`

