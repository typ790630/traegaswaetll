# Android APK Build Guide

Since the current environment lacks the necessary Java Development Kit (JDK) and Android SDK, the APK cannot be generated directly here. However, the codebase is fully prepared for a production release.

## Prerequisites

To build the APK on your local machine, you need:
1.  **Node.js** (Installed)
2.  **Java Development Kit (JDK) 17**
3.  **Android Studio** (with Android SDK installed)

## Build Steps

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Build Web Assets**:
    This compiles the React application into the `dist` folder and syncs it to the Android project.
    ```bash
    npm run build:android
    ```

3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
    *   Wait for Gradle sync to complete.

4.  **Build Signed APK**:
    *   Go to **Build** > **Generate Signed Bundle / APK**.
    *   Select **APK**.
    *   **Key Store Path**: `android/app/release-key.keystore`
    *   **Key Store Password**: `123456`
    *   **Key Alias**: `key0`
    *   **Key Password**: `123456`
    *   Select **Release** variant.
    *   Click **Finish**.

5.  **Locate APK**:
    The APK will be generated at:
    `android/app/release/app-release.apk`

## Important Notes
*   **Real Environment**: The app is currently configured to use the **Real BSC Mainnet**. Ensure you are testing with real funds and addresses.
*   **Wallet Address**: The default wallet is hardcoded to `0x739Ee5E0CD7Ee3EfEAe2796E9C4dC5b2916Cd9f1`.
