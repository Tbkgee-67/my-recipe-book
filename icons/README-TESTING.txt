MY RECIPE BOOK — PHASE 15 TEST BUILD

Phase 15 continues from the user-confirmed working Phase 14 package.

CHANGE IN THIS PHASE
- Extracted the standalone Wine & Mead calculator logic (ABV, sugar boost, and sweetness planning) from its inline script in index.html into scripts/wine-mead-calculators.js.
- The external script retains the original script id and is loaded at the exact same location in index.html, before the existing wine/mead navigation script. This preserves the prior execution order.

UNCHANGED
- styles.css is unchanged from Phase 14.
- All Phase 14 scripts are retained unchanged.
- The existing wine-mead-navigation.js file is unchanged.
- Other app logic, recipe data, photos, backup/restore, Google Drive behavior, theme handling, and PWA behavior are otherwise unchanged.
- This is a separate testing build. Do not replace the live app with it until it has been tested and explicitly approved.

GITHUB TEST FOLDER UPDATE
1. Extract this ZIP.
2. Upload the Phase 15 index.html to the existing GitHub testing folder, replacing the Phase 14 index.html.
3. Upload scripts/wine-mead-calculators.js into the existing scripts folder.
4. Leave styles.css and all other existing scripts untouched.
5. Refresh the testing site (hard refresh if needed).

TESTS
- Open the Wine & Mead tools.
- Test the ABV calculator with original gravity 1.060 and final gravity 1.010; it should show an estimated ABV.
- Test invalid readings and the reset button.
- Test the sugar/ABV boost calculator and its unit selector, target selector, calculate, and reset controls.
- Test the sweetness calculator and its unit selector, target selector, calculate, and reset controls.
- Confirm Wine & Mead navigation still works.
- Check representative existing functions: recipe photos after refresh, backup/restore, Quick Tools, Baking/Brewing tools, and dark/light mode.

Please report the results before moving to Phase 16.
