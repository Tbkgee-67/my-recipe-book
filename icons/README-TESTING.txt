My Recipe Book — Phase 2 JavaScript split test

This is a separate testing copy based on the confirmed working Phase 1 build.

Files:
- index.html
- styles.css
- scripts/quick-tools-close.js

Upload the contents of this package into the existing GitHub testing folder:
https://tbkgee-67.github.io/my-recipe-book/icons/
Keep existing icons, manifest, service-worker, and other app assets in place.
The scripts folder must be uploaded with its subfolder structure intact.

Only the small Quick Tools Close-button handler was moved into an external file.
It remains at the same position in the HTML so it runs at the same point in page loading.
All other inline JavaScript blocks are intended to remain unchanged.

Test the app appearance and normal functions, especially opening and closing Quick Tools.
Also test recipe photos after refresh and after closing/reopening the installed app.
Do not replace the live app until this testing version is confirmed.
