# Android APK Build Instructions

This project has been configured with **Capacitor** to generate an Android application.

## Prerequisites

1.  **Android Studio**: You must have Android Studio installed on your machine.
2.  **Java/JDK**: Ensure you have Java installed (usually comes with Android Studio).

## How to Build the APK

1.  **Generate the Web Assets**:
    Run the following command in your project terminal to build the web app and sync it to the Android project:
    ```bash
    npm run build:android
    ```
    *(Note: This uses `vite build` directly to bypass strict TypeScript checks temporarily)*

2.  **Open in Android Studio**:
    Run the following command to open the Android project in Android Studio:
    ```bash
    npx cap open android
    ```
    Alternatively, launch Android Studio manually and open the `android` folder located in this project.

3.  **Build APK**:
    -   In Android Studio, wait for Gradle sync to finish.
    -   Go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    -   Once finished, a notification will appear. Click "locate" to find your `.apk` file (usually in `android/app/build/outputs/apk/debug/`).

4.  **Run on Device/Emulator**:
    -   Connect your Android device or start an emulator.
    -   Click the **Run** button (green play icon) in Android Studio toolbar.

## Troubleshooting

-   If you see TypeScript errors during `npm run build`, you can fix them in the code or rely on `npm run build:android` which attempts to build despite type errors.
-   If Android Studio complains about SDK versions, you may need to install the required Android SDK Platform via the SDK Manager in Android Studio.
