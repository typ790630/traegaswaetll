# EAS Build Guide (Cloud Build)

Since your local environment lacks Android build tools, using Expo Application Services (EAS) is the perfect solution. I have configured the project to use your Expo account `typ7906301`.

## Configuration Status

*   **App Config**: Created `app.json` linked to owner `typ7906301`.
*   **Build Config**: Updated `eas.json` with a `release-apk` profile specifically for Capacitor projects.
*   **Code**: All latest changes (Real Environment, Real Exchange Rates) are included.

## How to Generate APK

Please run the following command in your terminal. You will be prompted to log in to your Expo account.

```bash
npx eas build --platform android --profile release-apk
```

### What happens next?
1.  **Login**: You'll be asked to log in to Expo (if not already logged in).
2.  **Upload**: The project code will be uploaded to Expo's build servers.
3.  **Build**: Expo will compile the Android APK in the cloud (this takes about 10-15 minutes).
4.  **Download**: Once finished, you will get a direct link to download the `app-release.apk`.

## Note
This method **does not** require Android Studio or Java on your local machine. It runs entirely in the cloud.
