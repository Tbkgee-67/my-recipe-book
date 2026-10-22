MY RECIPE BOOK — INSTALLABLE HOME-SCREEN WEB APP

Included features
- Offline-first recipe and shopping-list storage in this browser on this device.
- Search, add, edit, view, delete, shopping list, and print a recipe.
- Import recipe text from TXT/MD/CSV/HTML/EML and extract selectable text from PDFs (PDF reader loads from the internet on first PDF use).
- JSON backup download and merge restore (does not replace existing local recipes).
- Manual Google Drive Sync Now using Drive appDataFolder. Recipe records merge by ID and latest updatedAt; deletion markers are retained to help propagate deletions.
- PWA manifest, service worker, and app icons for installing to the Samsung S25 home screen.

IMPORTANT LIMITATIONS / SETUP
1. This is a PWA source package, not an APK. It must be hosted at an HTTPS address for service workers and installation. You can use GitHub Pages or another HTTPS static host.
2. Google Drive Sync requires Google Cloud setup. Create a Google Cloud project, enable Google Drive API, configure an OAuth 2.0 Client ID of type Web application, and add the exact HTTPS origin of the hosted app to Authorized JavaScript origins. Paste that client ID into the app's Google Drive sync panel. Never paste a Google password or client secret into the app. Test sync using a small test dataset first.
3. The app's data is saved in the browser's localStorage. Clearing Chrome site data or using a different browser/profile can remove or isolate it. Download JSON backups regularly.
4. PDF text extraction needs internet access the first time because PDF.js is loaded from a CDN. Scanned/image-only PDFs may not have selectable text to extract.
5. The PWA and Google Drive sync code have not been independently penetration-tested or fully end-to-end verified here. Keep separate backups until tested.

HOW TO HOST WITH GITHUB PAGES
- Create a GitHub repository.
- Upload the contents of this folder (index.html, manifest.webmanifest, sw.js, icons folder) to the repository root.
- In repository Settings > Pages, deploy from the main branch and root folder.
- Open the generated HTTPS Pages URL in Chrome on the Samsung S25.
- Visit once while online; use Chrome menu ⋮ > Add to Home screen or Install app.

GOOGLE DRIVE SETUP
- Google Cloud Console: enable Google Drive API.
- Configure OAuth consent screen for your account/testing users as required by Google's current setup.
- Create OAuth client ID > Web application; add hosted origin (e.g. https://YOURNAME.github.io) as Authorized JavaScript origin.
- Paste the Client ID (ends in .apps.googleusercontent.com) in Sync panel, then press Sync Now while online and sign into Google.
