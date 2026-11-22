MY RECIPE BOOK — PHASE 14 TEST BUILD

Phase 14 continues from the user-confirmed working Phase 13 package.

CHANGE IN THIS PHASE
- Extracted the standalone Custom Brew page logic from its inline script in index.html into scripts/custom-brew-page-logic.js.
- The external script is loaded at the same location in index.html and retains the original script id, preserving execution order and the existing page markup.

UNCHANGED
- styles.css is unchanged from Phase 13.
- All Phase 13 scripts are retained unchanged.
- The main application code, recipe data handling, photos, backup/restore, Google Drive behavior, theme handling, and other app features are otherwise unchanged.
- This is a separate testing build. Do not replace the live app with it until it has been tested and explicitly approved.

GITHUB TEST FOLDER UPDATE
1. Extract this ZIP.
2. Upload the Phase 14 index.html to the existing GitHub testing folder, replacing its Phase 13 index.html.
3. Upload scripts/custom-brew-page-logic.js into the existing scripts folder.
4. Leave styles.css and all other existing scripts untouched.
5. Refresh the testing site (a hard refresh if needed).

TESTS
- Open the Custom Brew page.
- Create, edit, and delete a custom brew entry; confirm entries remain after refresh/reopening.
- Confirm the Custom Brew page navigation and its buttons work.
- Check representative existing functions: recipe photos after refresh, backup/restore, Quick Tools, Baking/Brewing tools, and dark/light mode.

Please report the results before moving to Phase 15.
