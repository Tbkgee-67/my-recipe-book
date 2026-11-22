My Recipe Book — Phase 11 testing

This package starts from the user-confirmed Phase 10 version.

Change in Phase 11:
- Moved only the Browser Compatibility Notice script into scripts/browser-compatibility.js.
- The external script is loaded at the original script position.
- All other inline JavaScript, existing separated scripts, and styles.css are preserved.

GitHub upload:
1. Extract this ZIP.
2. Upload/replace index.html in the icons testing folder.
3. Add scripts/browser-compatibility.js to the existing scripts folder.
4. Keep all previous scripts and styles.css in place.

Test the browser compatibility notice: check that it appears when appropriate, Close dismisses it, Check again reruns the check, and it respects its 30-day dismissal period. Also retest recipe photos after refresh/reopening and previously tested app features.

This is a testing build. Do not replace the live app until the test is confirmed.
