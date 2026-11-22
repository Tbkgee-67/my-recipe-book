My Recipe Book — Phase 12 testing package

Starting point: the confirmed Phase 11 package.

Change in this phase:
- Extracted only the standalone Install My Recipe Book invitation / installation-instructions handler into scripts/install-invite.js.
- The external script is loaded at the same location as the original inline script, preserving classic-script execution order.
- No other application JavaScript or CSS was intentionally changed.

GitHub upload:
1. Extract this ZIP.
2. Upload/replace index.html in the icons testing folder.
3. Upload scripts/install-invite.js into the existing icons/scripts folder.
4. Keep all previously uploaded script files and styles.css in place.

Test the install invitation: dismiss it, reopen the site, use the install/instructions button, and check that an installed app does not show the invitation. Also test previously working features and recipe photos after refresh/reopening.

This is a testing copy only. Do not replace the live app until the test is confirmed.
