/* Phase 32: Recipe Sharing module. Preserves the existing share/copy behavior. */
(()=>{'use strict';
const bridge=window.MRBRecipeSharingBridge;
if(!bridge){console.error('Recipe Sharing could not start: app bridge is missing.');return;}
const $=id=>document.getElementById(id);
$('shareRecipeBtn').onclick=async()=>{
  const r=bridge.getCurrentRecipe();if(!r)return;
  const parts=[r.title];
  if(r.description)parts.push(r.description);
  if(r.yield)parts.push('Yield: '+r.yield);
  if(r.times)parts.push('Times: '+r.times);
  if(r.categories.length)parts.push('Categories: '+r.categories.join(', '));
  if(r.ingredients)parts.push('\\nIngredients\\n'+r.ingredients);
  if(r.directions)parts.push('\\nDirections\\n'+r.directions);
  if(r.nutrition)parts.push('\\nNutrition\\n'+r.nutrition);
  if(r.notes)parts.push('\\nNotes / source / tips\\n'+r.notes);
  const shareText=parts.join('\\n');
  try{
    if(navigator.share){
      await navigator.share({title:r.title,text:shareText});
      bridge.say('Share menu opened.');
    }else if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(shareText);
      bridge.say('Recipe copied to clipboard. Paste it into a message or email.');
    }else{
      window.prompt('Copy this recipe to share it:',shareText);
    }
  }catch(e){
    if(e.name!=='AbortError')bridge.say('Could not open sharing. You can copy the recipe text from the prompt.',true);
  }
};
})();
