MY RECIPE BOOK — PDF IMPORT FIX

This updated package keeps the app features and improves PDF recipe importing.

PDF import improvements:
- Reads text using PDF text positions, so lines are kept in top-to-bottom order.
- Attempts to read left-column content before right-column content on two-column pages.
- Looks for Ingredients and Directions/Instructions/Method headings.
- Loads imported text into the recipe editor instead of saving immediately, so you can check and correct it first.

Other features retained in the app include recipe descriptions, Pizza and Sourdough categories, Favorites, recipe editing/printing, photos, shopping list, backup/restore, and website import.

INSTALL:
1. Back up your recipes from the current app before replacing files.
2. Extract this ZIP.
3. Upload the files to the root of your GitHub repository.
4. Replace index.html, manifest.webmanifest, and sw.js; keep the icons folder and other unrelated files.
5. After GitHub Pages updates, reload the app. If it still shows the old version, close it and clear/reload the site cache in Chrome.

Note: PDF layout varies. This update improves ordering but cannot perfectly interpret every scanned/image-only PDF. Scanned PDFs may need OCR; always review the recipe fields before saving.
