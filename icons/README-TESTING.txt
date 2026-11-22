MY RECIPE BOOK — PHASE 16 TEST BUILD

Starting point: your confirmed working Phase 15 package.

Phase 16 change:
- Extracted the standalone Cooking History page handler from index.html into scripts/cooking-history.js.
- The external script is loaded at the same location as the original inline script, preserving its execution order and dependencies.
- The original script contents are preserved exactly in the new file.

UPLOAD INSTRUCTIONS
1. Extract this ZIP.
2. In your GitHub TESTING folder only, replace index.html with this Phase 16 index.html.
3. Upload scripts/cooking-history.js into your existing scripts folder.
4. Leave styles.css and every other existing script untouched.
5. Refresh the testing website (a hard refresh may be needed).

TEST CHECKLIST
- Open Cooking History.
- Add a cooking record, including date, rating, and notes.
- Search/filter the history.
- Edit a record and confirm changes save.
- Use Cook Again on a recipe that still exists.
- Delete a record and confirm it stays deleted after refresh.
- Confirm previous features still work: recipe photos after refresh/reopen, backup/restore, Quick Tools, Baking/Brewing tools, Wine & Mead calculators, Custom Brew page, Welcome Guide, and dark/light mode.

IMPORTANT
- This is a TEST build. Do not replace the live app.
- Report any issue before moving to Phase 17.
