/* My Recipe Book — Phase 39: Recipe Card Description Cleanup */
(function(){
 'use strict';
 function cleanRecipeCardDescription(value,title=''){
  let text=String(value||'');
  text=text
   .replace(/(?:Mead\s+)?Category\s*:\s*.*?(?=(?:\b(?:Mead\s+)?Batch\s*:|\bBatch\s*:|\bPhoto supplied\b|\bOriginal source\s*:|$))/gi,' ')
   .replace(/\b(?:Mead\s+)?Batch\s*:\s*.*?(?=(?:\bCategory\s*:|\bPhoto supplied\b|\bOriginal source\s*:|$))/gi,' ')
   .replace(/Photo supplied with (?:this )?.*?(?=(?:\bOriginal source\s*:|$))/gi,' ')
   .replace(/Original source\s*:\s*https?:\/\/\S+/gi,' ')
   .replace(/https?:\/\/\S+/gi,' ')
   .replace(/\s+/g,' ').trim();
  if(title){
   const escaped=String(title).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   text=text.replace(new RegExp(escaped,'gi'),' ').replace(/\s+/g,' ').trim();
  }
  return text;
 }
 window.MRBRecipeCardDescriptionBridge={clean:cleanRecipeCardDescription};
})();
