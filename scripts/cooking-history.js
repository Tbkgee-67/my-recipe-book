(()=>{
 'use strict';
 const app=window.MRBCookingHistoryBridge;
 if(!app){console.error('Cooking History could not connect to My Recipe Book.');return;}
 const $=id=>document.getElementById(id);
 const KEY='myRecipeBook_cooking_history_v1';
 let history=read(),editingId=null,selectedRecipe=null;
 function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(history));app.afterHistorySave();return true}catch(error){app.say('Cooking history could not be saved. Device storage may be full.',true);return false}}
 function localDate(value){const date=new Date(value||Date.now());return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)}
 function recipes(){return app.getRecipes().slice().sort((a,b)=>String(a.title||'').localeCompare(String(b.title||'')))}
 function populateRecipeChoices(selectedId,fallbackTitle){
  const select=$('cookingEntryRecipeSelect');select.replaceChildren();
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose a recipe';select.append(placeholder);
  const list=recipes();let found=false;
  list.forEach(recipe=>{const option=document.createElement('option');option.value=String(recipe.id);option.textContent=recipe.title||'Untitled recipe';if(String(recipe.id)===String(selectedId)){option.selected=true;found=true;}select.append(option)});
  if(selectedId&&!found){const option=document.createElement('option');option.value=String(selectedId);option.textContent=(fallbackTitle||'Previously saved recipe')+' (not in collection)';option.selected=true;select.append(option)}
  if(!selectedId)select.value='';
  updateRecipeLabel();
 }
 function updateRecipeLabel(){const selected=$('cookingEntryRecipeSelect').selectedOptions[0];$('cookingEntryRecipe').textContent=selected&&selected.value?'Selected: '+selected.textContent:'Select the recipe you cooked.'}
 function showHistory(){history=read();render();app.open('cookingHistoryDlg')}
 function openEditor(recipe,entry){selectedRecipe=recipe||null;editingId=entry?.id||null;populateRecipeChoices(recipe?.id||entry?.recipeId,entry?.recipeTitle);$('cookingEntryHeading').textContent=entry?'Edit Cooking Record':'Record Cooking';$('cookingEntryDate').value=localDate(entry?.cookedAt||Date.now());$('cookingEntryRating').value=String(entry?.rating||0);$('cookingEntryNotes').value=entry?.notes||'';app.open('cookingEntryDlg')}
 function saveEntry(){
  const recipeId=$('cookingEntryRecipeSelect').value;const recipe=app.getRecipeById(recipeId);
  if(!recipe&&!editingId){app.say('Choose a recipe from your collection.',true);return;}
  const date=new Date($('cookingEntryDate').value);if(Number.isNaN(date.getTime())){app.say('Choose a valid cooking date.',true);return;}
  let entry=history.find(item=>item.id===editingId);
  if(!entry){entry={id:'cook_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)};history.unshift(entry)}
  const chosen=recipe||selectedRecipe||{};
  entry.recipeId=String(chosen.id||entry.recipeId||recipeId||'');entry.recipeTitle=String(chosen.title||entry.recipeTitle||'Untitled recipe');entry.categories=Array.isArray(chosen.categories)?chosen.categories.slice():entry.categories||[];
  entry.cookedAt=date.toISOString();entry.rating=Number($('cookingEntryRating').value)||0;entry.notes=$('cookingEntryNotes').value.trim();
  history.sort((a,b)=>new Date(b.cookedAt)-new Date(a.cookedAt));
  if(persist()){app.close('cookingEntryDlg');render();app.say('Cooking history saved.');}
 }
 function render(){
  history=read();const query=($('cookingHistorySearch').value||'').trim().toLowerCase();
  const unique=new Set(history.map(item=>item.recipeId||item.recipeTitle));const counts={};history.forEach(item=>counts[item.recipeTitle]=(counts[item.recipeTitle]||0)+1);
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];$('cookingHistoryTotal').textContent=String(history.length);$('cookingHistoryUnique').textContent=String(unique.size);$('cookingHistoryTop').textContent=top?top[0]+' ('+top[1]+')':'—';
  const host=$('cookingHistoryList');host.replaceChildren();
  const list=history.filter(item=>[item.recipeTitle,(item.categories||[]).join(' '),item.notes].join(' ').toLowerCase().includes(query));
  if(!list.length){const p=document.createElement('p');p.className='help';p.textContent=history.length?'No cooking records match your search.':'No cooking history yet. Use Record Cooking to add your first entry.';host.append(p);return;}
  list.forEach(entry=>{
   const card=document.createElement('div');card.className='panel';card.style.margin='10px 0';const heading=document.createElement('h3');heading.textContent=entry.recipeTitle;
   const meta=document.createElement('p');meta.className='help';meta.textContent=new Date(entry.cookedAt).toLocaleString()+(entry.rating?'  •  '+'★'.repeat(entry.rating):'');
   const notes=document.createElement('p');notes.textContent=entry.notes||'No cooking notes added.';const actions=document.createElement('div');actions.className='row';
   const edit=document.createElement('button');edit.type='button';edit.className='alt';edit.textContent='Edit notes / rating';edit.onclick=()=>{const recipe=app.getRecipeById(entry.recipeId)||{id:entry.recipeId,title:entry.recipeTitle,categories:entry.categories||[]};openEditor(recipe,entry)};
   const again=document.createElement('button');again.type='button';again.textContent='Cook again';again.onclick=()=>{const recipe=app.getRecipeById(entry.recipeId);if(recipe){app.close('cookingHistoryDlg');if($('detailDlg')?.open)app.close('detailDlg');app.openRecipe(recipe.id)}else app.say('This recipe is no longer in your collection. The history record is still saved.');};
   const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Delete record';del.onclick=()=>{if(!confirm('Delete this cooking history record?'))return;history=history.filter(item=>item.id!==entry.id);if(persist())render();};
   actions.append(edit,again,del);card.append(heading,meta,notes,actions);host.append(card);
  });
 }
 $('openCookingHistoryBtn').addEventListener('click',showHistory);
 $('addCookingRecordBtn').addEventListener('click',()=>openEditor(null,null));
 $('cookingEntryRecipeSelect').addEventListener('change',updateRecipeLabel);
 $('closeCookingHistoryBtn').addEventListener('click',()=>app.close('cookingHistoryDlg'));
 $('closeCookingEntryBtn').addEventListener('click',()=>app.close('cookingEntryDlg'));
 $('cancelCookingEntryBtn').addEventListener('click',()=>app.close('cookingEntryDlg'));
 $('saveCookingEntryBtn').addEventListener('click',saveEntry);
 $('cookingHistorySearch').addEventListener('input',render);
})();
