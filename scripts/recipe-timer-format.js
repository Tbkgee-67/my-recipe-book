/* My Recipe Book — Phase 41: Recipe Timer Display Formatting */
(function(){
 'use strict';
 function formatRecipeTimerSeconds(n){
  n=Math.max(0,Math.ceil(n));
  return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 }
 window.MRBRecipeTimerFormatBridge={format:formatRecipeTimerSeconds};
})();
