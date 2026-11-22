/* Phase 35: Recipe printing. Uses a narrow bridge to the app's private recipe data and formatting helpers. */
(()=>{'use strict';
const bridge=window.MRBRecipePrintingBridge;
const button=document.getElementById('printBtn');
if(!bridge||!button||button.dataset.mrbPrintBound==='true')return;
button.dataset.mrbPrintBound='true';
button.addEventListener('click',()=>{
 const recipe=bridge.getCurrentRecipe();
 if(!recipe)return;
 const win=window.open('','_blank');
 if(!win){bridge.say('Allow pop-ups to print this recipe.',true);return;}
 const esc=bridge.escapeHtml;
 const section=bridge.sectionHtml;
 win.document.write(`<meta charset="utf-8"><title>${esc(recipe.title)}</title><style>body{font:16px Arial;max-width:760px;margin:25px auto}pre{white-space:pre-wrap;font:inherit}h2{border-bottom:1px solid #aaa}</style><h1>${esc(recipe.title)}</h1><p>${esc(recipe.description)}</p>${section('Ingredients',recipe.ingredients)}${section('Directions',recipe.directions)}${section('Nutrition',recipe.nutrition)}${section('Notes / source / tips',recipe.notes)}<script>onload=()=>print()<\/script>`);
 win.document.close();
});
})();
