My Recipe Book — Phase 13 testing package

Starting point: the user-confirmed Phase 12 package.

Change in this phase:
- Extracted only the standalone Welcome / How-to-Use Guide script from index.html into scripts/welcome-guide.js.
- Replaced the original inline script at the same location with a classic external script tag using the same element ID.
- The script's code is preserved exactly; all other JavaScript, CSS, and app markup are retained.

GitHub upload:
1. Extract this ZIP.
2. Upload/replace index.html in the icons testing folder.
3. Upload scripts/welcome-guide.js into the existing icons/scripts folder.
4. Keep all previously uploaded scripts and styles.css in place. Do not delete earlier phase files.

Test:
- Open the Welcome / How-to-Use Guide.
- Advance through the tutorial and close it.
- Confirm the guide's completion/hide behavior works as before.
- Reopen the guide using its in-app button.
- Test recipe viewing/editing, photos after refresh and app reopen, backup/restore, Quick Tools, Baking/Brewing tools, and dark/light mode.

This is a testing copy only. Do not replace the live app until Phase 13 is confirmed working.
