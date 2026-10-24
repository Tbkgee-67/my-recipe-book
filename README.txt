MY RECIPE BOOK — OFFLINE-FIRST INSTALLABLE WEB APP
==================================================

FEATURES
- Recipes and shopping list saved locally in this browser.
- Works offline after the first successful load and service-worker cache.
- Add, edit, search, delete, and print recipes.
- Import TXT and other text files; import text-based PDFs (PDF text extraction may require internet access to load its reader library).
- Download a JSON backup and restore it later. Restore merges by recipe ID and preserves existing local recipes.
- No Google Drive sync, Google sign-in, or cloud account connection.

FILES
- index.html: app
- manifest.webmanifest: app name and installation settings
- sw.js: service-worker cache
- icons/icon-192.png and icons/icon-512.png: app icons

INSTALL ON SAMSUNG S25
1. Upload all files and the icons folder to the root of your GitHub repository.
2. Enable GitHub Pages from Settings > Pages, using the main branch and root folder.
3. Open the resulting HTTPS address in Chrome on your Samsung S25.
4. Chrome menu (⋮) > Add to Home screen or Install app. Wording can vary by version.
5. Keep a separate JSON backup. Browser storage is local to that browser/device and is not a cloud backup.

BACKUPS
Use Import & backup > Download backup regularly. To recover recipes, choose Restore backup and select a previously downloaded JSON backup. Confirm the merge. Existing recipes are preserved unless a backup contains a newer version of a recipe with the same ID.

LIMITATIONS
- There is no Google Drive sync or automatic cross-device synchronization.
- Offline storage can be cleared by browser/site-data cleanup; maintain external backups.
- PDF import works best with selectable text; scanned/image-only PDFs require OCR separately.


NAVIGATION UPDATE
The four main navigation buttons are fixed to the bottom of the screen for easier thumb access on mobile. The page includes bottom padding so content is not hidden behind the navigation bar.

Recipe photos update:
- In Add recipe or Edit recipe, tap “Take photo” to use the phone camera, or “Upload photo files” to select existing images.
- Up to 8 photos can be attached to each recipe. Photos are resized to reduce storage use and saved with the recipe in this browser.
- Photos appear above the recipe title when opened and when printed; the first photo also appears on recipe cards.
- Include photos in your regular JSON backup. Photos are stored locally in this browser and are not automatically synced to another device.

Recipe categories: choose Dinner, Breakfast, Lunch, Snacks, Dessert, Bread, Appetizers & Sides, Soups & Salads, or Drinks when adding/editing a recipe. Choose Other / custom category to enter your own category. Existing custom categories remain editable.


Recipe URL import
- Open Import & backup and paste a recipe webpage address into Recipe website URL, then choose Import from URL.
- Automatic import works when the site allows browser access and publishes structured recipe data (Schema.org Recipe).
- Some websites block browser access or do not publish recipe data. In that case, choose Open website, copy the ingredients and instructions, and paste them into the text import box below.


NEW FEATURES — SYNC EVERYWHERE + RECIPE SCANNER
- Recipe Scanner can photograph a printed recipe or use an uploaded image. OCR places recognized text in the recipe text box for review before import. First use needs internet to load Tesseract.js. Recognition quality depends on photo clarity; review the text before saving.
- Sync Everywhere uses the private Google Drive appDataFolder. Configure Google Cloud: enable Google Drive API, create an OAuth Web Client ID, configure consent, and add the exact HTTPS GitHub Pages origin to Authorized JavaScript origins. Paste the Client ID in the app and choose Connect Google & sync. Do not put a client secret in this app.
- Connect Google on each device/browser session. While authorized and online, recipe saves trigger automatic sync; the Sync now button is available too. Recipes remain stored locally and can be used offline.
- Keep a downloaded JSON backup before updating. Google sign-in can require testing-user setup or verification depending on your Google project settings.
