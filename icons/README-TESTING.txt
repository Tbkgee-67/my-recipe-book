My Recipe Book — Phase 8 testing

This phase starts from the Phase 7 testing package. It moves only the small Dough Calculator Back-button navigation handler into scripts/dough-calculator-back-navigation.js. The external script is loaded in the same document position as the original inline handler. Other inline JavaScript blocks and styles are unchanged.

Upload the contents of this package into the existing GitHub icons testing folder. Replace index.html and add scripts/dough-calculator-back-navigation.js to the existing scripts folder. Keep all previous script files, styles.css, icons, manifest, and service-worker assets in place.

Test opening the Dough Calculator from Tools and using its Back button. Confirm it returns to the Baking Tools dropdown as before. Also retest recipe photos after refresh/reopen, Quick Tools, dark/light mode, update notice, terms, Dry Cure Calculator, and Wine/Mead navigation. Do not replace the live app until testing is complete.
