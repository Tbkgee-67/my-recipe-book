My Recipe Book — Stage 2 source package

Stage 2 separates the main and per-recipe timer logic into timers.js.
The app now has six source files: index.html, styles.css, app-core.js,
app-tools.js, app-enhancements.js, and timers.js.

Testing notes:
- Load all files from the same folder using a compatible local web server or web host.
- Keep Android-Test-Baseline.html as the known-good single-file Android fallback.
- The Android single-file baseline has not been modified.
- Timer state remains independent for the main timer and recipe timer.
- The timer module is loaded before app-core.js so the core can initialize it.

Please test: add/delete a recipe, main timer start/pause/resume/stop/reset, and
recipe timer start/pause/resume/stop/reset. Do not replace the live app with this test package.
