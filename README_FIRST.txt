MY RECIPE BOOK — NATIVE ANDROID TEST PROJECT

IMPORTANT
- This is an Android Studio source project, not a finished APK.
- It has not been compiled or tested on a physical phone yet.
- Keep the current GitHub Pages/PWA app installed and working. Do not uninstall it or clear Chrome data.
- Before testing the native app, create a fresh JSON backup in the current PWA and keep that file safe.
- After installing the APK built from this project, use Backup / Restore > Restore / merge to import the JSON backup. This app has separate local storage from Chrome.

WHAT THIS PROTOTYPE ADDS
- An Android WebView wrapper around the current My Recipe Book HTML.
- A native Android file-share intent for the “Share a backup” button, which should open Android's chooser and share a .json attachment.

IMPORTANT LIMITATION
- Google Drive sign-in/sync from a WebView may be blocked by Google's web sign-in policy. The existing PWA remains unchanged and should be kept for your current Google Drive workflow. This native build is a test for the sharing feature and recipe import/export, not a verified replacement for every PWA feature.

BUILDING
1. On the Windows computer, unzip the project folder.
2. Open Android Studio and choose Open, then select the MyRecipeBookNative folder.
3. Allow Gradle sync. If Android Studio asks to install Android SDK Platform 35 or build tools, accept.
4. Build > Build Bundle(s) / APK(s) > Build APK(s).
5. Use the APK path Android Studio reports. Transfer it to the Samsung S25 and install it.

If Gradle reports an error, send a screenshot of the full error before changing files. This project uses Java and does not use Compose.
