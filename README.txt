MY RECIPE BOOK — COMPLETE UPDATED APP

Included:
- index.html — main app
- manifest.webmanifest — installable app details
- sw.js — basic offline app-shell cache
- icons/icon-192.png and icons/icon-512.png — home-screen icons

Features in this version:
- Recipe description field
- Pizza and Sourdough categories
- Favorites category and favorite toggle
- Add, edit, delete, search, and print recipes
- Recipe photos
- Shopping list
- Import recipe text/files and backup/restore JSON
- Recipe website import helper
- Optional Google Drive app-data sync setup

IMPORTANT:
1. Before replacing files, open the current app's Import & backup section and download a JSON backup of your recipes.
2. Extract this ZIP and upload its contents to the ROOT of your GitHub repository. Keep the icons folder.
3. Replace index.html, manifest.webmanifest, and sw.js when prompted. Keep unrelated repository files.
4. This package has not been tested against your live GitHub repository. Recipe data is stored in browser local storage; keep a backup before replacing files.
5. Google Drive sync requires a Google OAuth Web Client ID and Google Cloud configuration. OCR/PDF text extraction may require internet access.
