/* My Recipe Book — Phase 40: Recipe Link Normalizer */
(function(){
 'use strict';
 function normalizeRecipeLink(value){
  let raw=String(value||'').trim();
  if(!raw)return '';
  if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))raw='https://'+raw;
  try{
   const u=new URL(raw);
   return ['http:','https:'].includes(u.protocol)?u.href:'';
  }catch{
   return '';
  }
 }
 window.MRBRecipeLinkBridge={normalize:normalizeRecipeLink};
})();
