
/* app-core.js
 * Extracted from Keep-working-index.html.
 * Original inline script order is preserved within this file.
 * Keep this file loaded after app-core.js and app-tools.js as applicable.
 */

/* ===== original line 1252 (original line 1252) ===== */
try{window.__MRB_PREVIEW_BACKUP__=JSON.parse(document.getElementById("mrb-preview-backup").textContent)}catch(e){window.__MRB_PREVIEW_BACKUP__=null}

/* ===== original line 1253 (original line 1253) ===== */
(()=>{'use strict';
const $=id=>document.getElementById(id),K='myRecipeBook_v1',CK='myRecipeBook_categories_v1',SK='myRecipeBook_shop_v1',PK='myRecipeBook_pin_hash_v1',DK='myRecipeBook_deleted_categories_v1',DRK='myRecipeBook_deleted_recipes_v1',CAT_COLLAPSED='myRecipeBook_categories_collapsed_v1',QT_COLLAPSED='myRecipeBook_quick_tools_collapsed_v1';
const defaults=[],CAT_ORDER_KEY='myRecipeBook_category_order_v1',SECTION_CUSTOM_CATS_KEY='myRecipeBook_section_custom_categories_v1';
const SECTION_CATS_BY_SECTION_KEY='myRecipeBook_section_categories_by_section_v4';
const SECTION_CATEGORY_DEFAULTS_MIGRATION='myRecipeBook_section_category_defaults_v1';
const SECTION_CATEGORY_ORDER_PREFIX='myRecipeBook_category_order_by_section_v1_';
const SECTION_CATEGORY_DEFAULTS={
 'Baking':['Breakfast','Lunch','Dinner','Desserts','Snacks','Appetizers','Side Dishes','Breads','Cakes & Pies'],
 'Brewing':['Mead','Wine','Cider','Beer','Fermented Drinks'],
 'Smoking / Curing':['Beef','Pork','Poultry','Fish','Sausage','Jerky','Bacon','Cheese']
};
function getSectionCustomCategories(section=currentSection){const all=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});return section&&Array.isArray(all?.[section])?all[section]:[]}
function sectionCategoryOrderKey(section=currentSection){return SECTION_CATEGORY_ORDER_PREFIX+encodeURIComponent(section||'Baking')}
function getSectionCategoryOrder(section=currentSection){const value=parse(localStorage.getItem(sectionCategoryOrderKey(section)),[]);return Array.isArray(value)?value:[]}
function saveSectionCategoryOrder(order,section=currentSection){try{localStorage.setItem(sectionCategoryOrderKey(section),JSON.stringify(order))}catch(e){}}
function ensureSectionCategoryDefaults(){try{if(localStorage.getItem(SECTION_CATEGORY_DEFAULTS_MIGRATION)==='done')return;const all=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});Object.entries(SECTION_CATEGORY_DEFAULTS).forEach(([section,names])=>{const existing=Array.isArray(all[section])?all[section]:[];all[section]=[...new Set([...existing,...names])];});localStorage.setItem(SECTION_CATS_BY_SECTION_KEY,JSON.stringify(all));localStorage.setItem(SECTION_CATEGORY_DEFAULTS_MIGRATION,'done')}catch(e){}}
function markSectionCustomCategory(name){if(!currentSection)return;const all=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});const list=Array.isArray(all[currentSection])?all[currentSection]:[];if(!list.includes(name)){all[currentSection]=[...list,name];try{localStorage.setItem(SECTION_CATS_BY_SECTION_KEY,JSON.stringify(all))}catch(e){}}}
let recipes=[],cats=[],active='All recipes',detailId=null,photoData='',selectedRecipeCategories=[],pendingPdfImages=[],currentSection=null;
const parse=(s,f)=>{try{return JSON.parse(s)||f}catch{return f}},id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const AUTO_SAVE_DB='MyRecipeBookFileHandles',AUTO_SAVE_STORE='handles';
function openAutoSaveDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(AUTO_SAVE_DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(AUTO_SAVE_STORE);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function storeAutoSaveHandle(handle){const db=await openAutoSaveDB();return new Promise((resolve,reject)=>{const tx=db.transaction(AUTO_SAVE_STORE,'readwrite');tx.objectStore(AUTO_SAVE_STORE).put(handle,'recipeFile');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function requestPersistentStorage(){try{if(navigator.storage?.persist)await navigator.storage.persist()}catch(e){/* Browser may decline; saved handles still remain in IndexedDB when retained. */}}
async function getAutoSaveHandle(){const db=await openAutoSaveDB();return new Promise((resolve,reject)=>{const req=db.transaction(AUTO_SAVE_STORE).objectStore(AUTO_SAVE_STORE).get('recipeFile');req.onsuccess=()=>{db.close();resolve(req.result||null)};req.onerror=()=>{db.close();reject(req.error)}})}
async function writeAutoSaveFile(showStatus=false){
 try{
  const handle=await getAutoSaveHandle();
  if(!handle){
   if(showStatus)$('autoSaveStatus').textContent='No external backup file has been selected yet. Your recipes are still saved on this device.';
   return false;
  }
  let permission=await handle.queryPermission({mode:'readwrite'});
  if(permission!=='granted'&&showStatus)permission=await handle.requestPermission({mode:'readwrite'});
  if(permission!=='granted'){
   $('autoSaveStatus').textContent='Your backup location is remembered, but file permission needs renewing. Tap Automatic Save / Backup and allow access; you should not need to choose the location again.';
   return false;
  }
  const data=JSON.stringify({app:'My Recipe Book',version:1,updated:new Date().toISOString(),categories:cats,recipes},null,2);
  const writable=await handle.createWritable();
  await writable.write(data);
  await writable.close();
  $('autoSaveStatus').textContent='Automatic backup saved to '+(handle.name||'your selected location')+' at '+new Date().toLocaleTimeString()+'.';
  return true;
 }catch(e){
  $('autoSaveStatus').textContent='The automatic backup could not be updated. Your on-device recipes are still saved. Tap Automatic Save / Backup to renew access. '+(e.message||'');
  return false;
 }
}
let autoSaveTimer=null;
function scheduleFileAutoSave(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(()=>writeAutoSaveFile(false),1200)}
$('autoSaveLocationBtn').onclick=async()=>{
 try{
  let handle;
  try{handle=await getAutoSaveHandle()}catch(e){}
  if(handle){
   let perm='prompt';
   try{perm=await handle.requestPermission({mode:'readwrite'})}catch(e){}
   if(perm==='granted'){
    const ok=await writeAutoSaveFile(true);
    if(ok){say('Automatic recipe saving is enabled.');return}
   }
  }
  if(typeof window.showSaveFilePicker==='function'){
   handle=await window.showSaveFilePicker({
    suggestedName:'my-recipe-book-autosave.json',
    types:[{description:'My Recipe Book automatic backup',accept:{'application/json':['.json']}}]
   });
  }else if(typeof window.showDirectoryPicker==='function'){
   const directory=await window.showDirectoryPicker({mode:'readwrite'});
   const dirPermission=await directory.requestPermission({mode:'readwrite'});
   if(dirPermission!=='granted')throw new Error('Folder permission was not granted.');
   handle=await directory.getFileHandle('my-recipe-book-autosave.json',{create:true});
   const filePermission=await handle.requestPermission({mode:'readwrite'});
   if(filePermission!=='granted')throw new Error('File permission was not granted.');
  }else{
   $('autoSaveStatus').textContent='This browser does not offer a direct file or folder picker. Your recipes are still saved on this device. Use Backup / Restore to download a copy, or connect Google Drive for cloud backup.';
   return;
  }
  await storeAutoSaveHandle(handle);
  await requestPersistentStorage();
  const ok=await writeAutoSaveFile(true);
  if(ok)say('Automatic backup location selected. Recipe changes will be saved there automatically.');
 }catch(e){
  if(e.name!=='AbortError')$('autoSaveStatus').textContent='Could not set the automatic backup location: '+(e.message||'unknown error')+'. Your on-device recipes have not been removed.';
 }
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function say(s,err=false){$('status').textContent=s;$('status').classList.toggle('err',err)}
function restoreNotice(message){const el=$('restoreStatus');if(el)el.textContent=message;}
let cookingWakeLock=null,activeCooking=false;
async function setActiveCooking(on){
 activeCooking=!!on;
 const btn=$('activeCookingBtn');
 if(btn){btn.textContent=activeCooking?'🍳 Active Cooking: ON':'🍳 Active Cooking: OFF';btn.setAttribute('aria-pressed',String(activeCooking));btn.classList.toggle('alt',!activeCooking);}
 if(!activeCooking){if(cookingWakeLock){try{await cookingWakeLock.release()}catch(e){}cookingWakeLock=null;}return;}
 if(!('wakeLock' in navigator)){say('Wake Mode is not supported by this browser.');activeCooking=false;if(btn){btn.textContent='🍳 Active Cooking: OFF';btn.setAttribute('aria-pressed','false');btn.classList.add('alt');}return;}
 try{if(!cookingWakeLock||cookingWakeLock.released){const lock=await navigator.wakeLock.request('screen');cookingWakeLock=lock;lock.addEventListener('release',()=>{if(cookingWakeLock===lock)cookingWakeLock=null;});}}
 catch(e){activeCooking=false;if(btn){btn.textContent='🍳 Active Cooking: OFF';btn.setAttribute('aria-pressed','false');btn.classList.add('alt');}say('Could not keep the screen awake. Check browser or phone power settings.',true);}
}
// Listen on the permanent recipe container so the control keeps working
// even though the recipe contents (including the button) are rebuilt each time.
$('detail').addEventListener('click',event=>{
 const button=event.target.closest('#activeCookingBtn');
 if(!button)return;
 event.preventDefault();
 setActiveCooking(!activeCooking);
});
function open(n){$(n).showModal()}function close(n){if(n==='detailDlg'){if('speechSynthesis'in window)speechSynthesis.cancel();clearTimeout(voiceTimer);if(voiceRecognition&&voiceListening){try{voiceRecognition.stop()}catch{}}setActiveCooking(false);}$(n).close()}$('detailDlg').addEventListener('close',()=>setActiveCooking(false));
let quickToolMode=false;
function showPage(which){document.body.classList.toggle('mrb-section-chooser',which==='sectionChooser');if(which==='tools'&&quickToolMode){which='recipes';quickToolMode=false;}const pages=['sectionChooser','recipes','tools','calendar','inventory','categories','starter','timer','baking','calorie','sugarNutrition','hydration','dough','measurement','cookingTemps','substitutes','pantry','shopping','bakersPct','preferment','doughTemp','abv','abvBoost','sweetness','customBrew'];pages.forEach(p=>$(p==='sectionChooser'?'sectionChooserPage':p==='recipes'?'recipesPage':p==='tools'?'toolsPage':p==='calendar'?'calendarPage':p==='inventory'?'inventoryPage':p==='categories'?'categoriesPage':p==='starter'?'starterPage':p==='timer'?'timerPage':p==='calorie'?'caloriePage':p==='sugarNutrition'?'sugarNutritionPage':p==='hydration'?'hydrationPage':p==='dough'?'doughPage':p==='measurement'?'measurementPage':p==='cookingTemps'?'cookingTempsPage':p==='substitutes'?'substitutesPage':p==='pantry'?'pantryPage':p==='shopping'?'shoppingPage':p==='bakersPct'?'bakersPctPage':p==='preferment'?'prefermentPage':p==='doughTemp'?'doughTempPage':p==='abv'?'abvPage':p==='abvBoost'?'abvBoostPage':p==='sweetness'?'sweetnessPage':p==='customBrew'?'customBrewPage':'bakingPage').classList.toggle('hidden',p!==which));if(which==='recipes'){$('toolsGearBtn').textContent='⚙';$('toolsGearBtn').removeAttribute('aria-current');$('toolsGearBtn').setAttribute('aria-label','Open Tools and Settings');$('toolsGearBtn').title='Tools & Settings'}else{$('toolsGearBtn').textContent='←';$('toolsGearBtn').setAttribute('aria-current','page');$('toolsGearBtn').setAttribute('aria-label',which==='sectionChooser'?'Choose a section':'Back to front page');$('toolsGearBtn').title=which==='sectionChooser'?'Choose a section':'Back to front page'}if(which==='tools')$('toolsPage').dataset.currentSection=(String(currentSection||'Baking').trim());window.scrollTo({top:0,behavior:'smooth'})}
function chooseMRBSection(section){currentSection=section;active='All recipes';cats=[...new Set(['All recipes','Favorites',...getSectionCustomCategories(section)])];render();if(typeof renderQuickTools==='function')renderQuickTools();showPage('recipes');}
function showMRBSectionChooser(){showPage('sectionChooser');}
window.setMRBSection=chooseMRBSection;window.showMRBSectionChooser=showMRBSectionChooser;

// Expose the page switcher to the separately loaded Wine & Mead calculator controls.
window.showPage=showPage;
// Recipe Calendar: independent local schedule storage; it does not alter recipe records.
const RECIPE_CALENDAR_KEY='myRecipeBook_recipe_calendar_v1';
let calendarPlans=[],calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),calendarSelected=calendarDateKey(new Date());
try{const saved=JSON.parse(localStorage.getItem(RECIPE_CALENDAR_KEY)||'[]');if(Array.isArray(saved))calendarPlans=saved;}catch{}
function saveCalendar(){try{localStorage.setItem(RECIPE_CALENDAR_KEY,JSON.stringify(calendarPlans));return true}catch(e){say('Could not save the calendar. Check available browser storage.',true);return false}}
function calendarDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function calendarRecipeOptions(){const sel=$('calendarRecipe');if(!sel)return;const old=sel.value;sel.innerHTML='<option value="">Choose a saved recipe…</option>'+recipes.map(r=>'<option value="'+esc(String(r.id))+'">'+esc(r.title)+'</option>').join('');if(recipes.some(r=>String(r.id)===old))sel.value=old}
function calendarTasksFor(date){return calendarPlans.flatMap(plan=>(plan.tasks||[]).filter(t=>t.date===date).map(t=>({plan,task:t})))}
function addRecipeToCalendar(rid){
 const recipe=recipes.find(x=>String(x.id)===String(rid));
 if(!recipe){say('Could not find this saved recipe. Please reopen it and try again.',true);return}
 const start=calendarDateKey(new Date());
 const rawSteps=String(recipe.directions||'').split(/\r?\n+/).map(x=>x.trim()).filter(Boolean);
 const steps=rawSteps.map(x=>x.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '')).filter(Boolean);
 const taskTexts=steps.length?steps:[String(recipe.description||'Work on '+recipe.title)];
 const startDate=new Date(start+'T12:00:00');
 const plan={id:Date.now().toString(36)+Math.random().toString(36).slice(2),recipeId:recipe.id,title:recipe.title,start,tasks:taskTexts.map((text,i)=>{const d=new Date(startDate);d.setDate(d.getDate()+i);return{date:calendarDateKey(d),text,done:false}})};
 calendarPlans.push(plan);
 if(saveCalendar()){
  calendarSelected=start;
  calendarMonth=new Date(startDate.getFullYear(),startDate.getMonth(),1);
  calendarRecipeOptions();
  $('calendarRecipe').value=String(recipe.id);
  $('calendarStart').value=start;
  // Close the modal first so the calendar page is not hidden behind it.
  const dialog=$('detailDlg');
  if(dialog && dialog.open)close('detailDlg');
  showPage('calendar');
  renderCalendar();
  say('“'+recipe.title+'” was added to your calendar. Its directions are listed as daily tasks.');
 }else{
  calendarPlans=calendarPlans.filter(x=>x.id!==plan.id);
 }
}
function renderCalendar(){
 const grid=$('calendarGrid');if(!grid)return;
 const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth();
 $('calendarMonthLabel').textContent=calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
 grid.innerHTML='';
 ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{const e=document.createElement('div');e.className='calendar-weekday';e.textContent=d;grid.append(e)});
 const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
 for(let i=0;i<first;i++){const e=document.createElement('div');grid.append(e)}
 for(let d=1;d<=days;d++){const date=calendarDateKey(new Date(y,m,d)),b=document.createElement('button');b.type='button';b.className='calendar-day'+(date===calendarDateKey(new Date())?' today':'')+(date===calendarSelected?' selected':'')+(calendarTasksFor(date).length?' has-task':'');b.textContent=String(d);b.setAttribute('aria-label',date+(calendarTasksFor(date).length?' has recipe tasks':''));b.onclick=()=>{calendarSelected=date;renderCalendar()};grid.append(b)}
 $('calendarSelectedLabel').textContent='Tasks for '+new Date(calendarSelected+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 const host=$('calendarDayTasks'),items=calendarTasksFor(calendarSelected);host.innerHTML='';
 if(!items.length){host.innerHTML='<p class="help">No recipe tasks scheduled for this date.</p>'}
 items.forEach(({plan,task})=>{const row=document.createElement('label');row.className='calendar-task'+(task.done?' done':'');const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!task.done;cb.onchange=()=>{task.done=cb.checked;saveCalendar();renderCalendar()};const span=document.createElement('span');span.textContent=plan.title+' — '+task.text;row.append(cb,span);host.append(row)});
 const plansHost=$('calendarPlans');plansHost.innerHTML='';
 if(!calendarPlans.length){plansHost.innerHTML='<p class="help">No recipe plans yet. Start one above.</p>'}
 calendarPlans.forEach(plan=>{const box=document.createElement('div');box.className='calendar-plan';const done=(plan.tasks||[]).filter(t=>t.done).length,total=(plan.tasks||[]).length;const h=document.createElement('strong');h.textContent=plan.title;const p=document.createElement('p');p.className='help';p.textContent='Started '+plan.start+' · '+done+' of '+total+' daily tasks completed';const del=document.createElement('button');del.type='button';del.className='alt';del.textContent='Remove plan';del.onclick=()=>{if(confirm('Remove the calendar plan for '+plan.title+'?')){calendarPlans=calendarPlans.filter(x=>x.id!==plan.id);saveCalendar();renderCalendar()}};box.append(h,p,del);plansHost.append(box)});
}
$('toolsOpenCalendarBtn').onclick=()=>{calendarRecipeOptions();if(!$('calendarStart').value)$('calendarStart').value=calendarDateKey(new Date());showPage('calendar');renderCalendar()};
$('calendarBackBtn').onclick=()=>showPage('tools');
$('calendarPrev').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar()};
$('calendarNext').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar()};
$('saveCalendarPlan').onclick=()=>{
 const recipe=recipes.find(r=>String(r.id)===$('calendarRecipe').value),start=$('calendarStart').value,tasks=$('calendarTasks').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!recipe){say('Choose a saved recipe first.',true);return}
 if(!start){say('Choose the recipe start date.',true);return}
 if(!tasks.length){say('Enter at least one daily task.',true);return}
 const startDate=new Date(start+'T12:00:00');
 const plan={id:Date.now().toString(36)+Math.random().toString(36).slice(2),recipeId:recipe.id,title:recipe.title,start,tasks:tasks.map((text,i)=>{const d=new Date(startDate);d.setDate(d.getDate()+i);return{date:calendarDateKey(d),text,done:false}})};
 calendarPlans.push(plan);if(saveCalendar()){calendarSelected=start;calendarMonth=new Date(startDate.getFullYear(),startDate.getMonth(),1);$('calendarTasks').value='';renderCalendar();say('Recipe plan added to your calendar.')}
};

let categoryDraft=[],categoryOrderDraft=[],categoryRenameMap={};
function startCategoryManager(){categoryRenameMap={};categoryDraft=getSectionCustomCategories(currentSection).slice();const savedOrder=getSectionCategoryOrder(currentSection);categoryOrderDraft=[...categoryDraft].sort((a,b)=>{const ai=savedOrder.indexOf(a),bi=savedOrder.indexOf(b);return(ai<0?9999:ai)-(bi<0?9999:bi)});$('categoriesPage').querySelector('h2').textContent='📂 '+(currentSection||'Baking')+' Categories';$('managerNewCategory').value='';$('categoryManagerStatus').textContent='These categories belong only to '+(currentSection||'Baking')+'. All Recipes and Favorites are built in.';renderCategoryManager();showPage('categories');}
const SUBCAT_SEP=' / ';function categoryHasRecipe(recipe,name){return (recipe.categories||[]).some(c=>c===name||c.startsWith(name+SUBCAT_SEP));}
function renderCategoryManager(){const host=$('categoryManagerList');host.innerHTML='';categoryOrderDraft.forEach((name,index)=>{const depth=name.split(SUBCAT_SEP).length-1;const parent=depth?name.slice(0,name.lastIndexOf(SUBCAT_SEP)):'';const row=document.createElement('div');row.className='category-manager-row';row.dataset.name=name;row.draggable=true;row.style.cssText='display:flex;align-items:center;gap:7px;padding:9px;margin-left:'+(depth?Math.min(depth,3)*22:0)+'px;border:1px solid var(--line);border-radius:10px;background:'+(depth?'#f7f8f4':'#fff')+';touch-action:pan-y';const grip=document.createElement('span');grip.textContent=depth?'↳':'☷';grip.title='Drag to reorder';grip.style.cssText='font-size:1.2rem;cursor:grab;touch-action:none';const label=document.createElement('strong');label.textContent=depth?name.slice(name.lastIndexOf(SUBCAT_SEP)+SUBCAT_SEP.length):name;label.style.cssText='flex:1;min-width:0;overflow-wrap:anywhere';const sub=document.createElement('button');sub.type='button';sub.className='alt';sub.textContent='+ Subcategory';sub.addEventListener('click',()=>{const value=prompt('Add a subcategory under “'+name+'”:');if(value===null)return;const child=value.trim();if(!child)return;const full=name+SUBCAT_SEP+child;if(categoryOrderDraft.includes(full)||categoryOrderDraft.includes(child)){ $('categoryManagerStatus').textContent='That subcategory already exists.';return;}categoryOrderDraft.splice(index+1,0,full);categoryDraft=[...categoryOrderDraft];renderCategoryManager();});const move=document.createElement('button');move.type='button';move.className='alt';move.textContent='Move';move.title='Move this category under another category or back to the main level';move.addEventListener('click',()=>{const subtree=categoryOrderDraft.filter(x=>x===name||x.startsWith(name+SUBCAT_SEP));const possible=categoryOrderDraft.filter(x=>!subtree.some(branch=>x===branch||x.startsWith(branch+SUBCAT_SEP))&&!x.includes(SUBCAT_SEP));const choices=['0. Main category (no parent)',...possible.map((x,i)=>(i+1)+'. '+x)];const answer=prompt('Move “'+name+'” where?\n\n'+choices.join('\n')+'\n\nEnter the number.');if(answer===null)return;const pick=Number(answer);if(!Number.isInteger(pick)||pick<0||pick>possible.length){$('categoryManagerStatus').textContent='No move made. Enter a listed number.';return;}const parent=pick===0?'':possible[pick-1];const leaf=name.split(SUBCAT_SEP).pop();const nextRoot=parent?parent+SUBCAT_SEP+leaf:leaf;if(nextRoot===name)return;if(categoryOrderDraft.some(x=>!subtree.includes(x)&&(x===nextRoot||x.startsWith(nextRoot+SUBCAT_SEP)))){$('categoryManagerStatus').textContent='A category with that name already exists under the selected parent.';return;}categoryOrderDraft=categoryOrderDraft.filter(x=>!subtree.includes(x));const moved=subtree.map(x=>nextRoot+x.slice(name.length));const insertAt=parent?categoryOrderDraft.indexOf(parent)+1:0;categoryOrderDraft.splice(insertAt,0,...moved);categoryRenameMap[name]=nextRoot;categoryDraft=[...categoryOrderDraft];$('categoryManagerStatus').textContent='Category moved. Save changes to apply it to your recipes.';renderCategoryManager();});const rename=document.createElement('button');rename.type='button';rename.className='alt';rename.textContent='Rename';rename.addEventListener('click',()=>{const next=prompt('Rename '+(depth?'subcategory':'category')+':',label.textContent);if(next===null)return;const value=next.trim();if(!value||value===label.textContent)return;const updated=(depth?name.slice(0,name.lastIndexOf(SUBCAT_SEP)+SUBCAT_SEP.length):'')+value;if(categoryOrderDraft.some(x=>x!==name&&(x===updated||x.startsWith(updated+SUBCAT_SEP)))){ $('categoryManagerStatus').textContent='That name already exists.';return;}categoryOrderDraft=categoryOrderDraft.map(x=>x===name?updated:x.startsWith(name+SUBCAT_SEP)?updated+x.slice(name.length):x);categoryRenameMap[name]=updated;categoryDraft=[...categoryOrderDraft];renderCategoryManager();});const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Delete';del.addEventListener('click',()=>{if(!confirm('Delete “'+name+'”'+(categoryOrderDraft.some(x=>x.startsWith(name+SUBCAT_SEP))?' and its subcategories':'')+'? Recipes will be kept but unassigned from these categories.'))return;categoryOrderDraft=categoryOrderDraft.filter(x=>x!==name&&!x.startsWith(name+SUBCAT_SEP));categoryDraft=[...categoryOrderDraft];renderCategoryManager();});row.append(grip,label,sub,move,rename,del);row.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',name);e.dataTransfer.effectAllowed='move';row.style.opacity='.45'});row.addEventListener('dragend',()=>{row.style.opacity='1';categoryDraft=[...categoryOrderDraft]});row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=e.dataTransfer.getData('text/plain');const a=categoryOrderDraft.indexOf(from),b=categoryOrderDraft.indexOf(name);if(a<0||b<0||a===b)return;const moving=categoryOrderDraft.filter(x=>x===from||x.startsWith(from+SUBCAT_SEP));categoryOrderDraft=categoryOrderDraft.filter(x=>!moving.includes(x));let insert=categoryOrderDraft.indexOf(name);categoryOrderDraft.splice(insert,0,...moving);renderCategoryManager()});host.appendChild(row)});if(!categoryOrderDraft.length){const empty=document.createElement('p');empty.className='help';empty.textContent='No custom categories yet. Add one above.';host.appendChild(empty)}}
$('managerAddCategory').onclick=()=>{const value=$('managerNewCategory').value.trim();if(!value)return;if(['All recipes','Favorites','Uncategorized'].includes(value)||categoryOrderDraft.includes(value)){ $('categoryManagerStatus').textContent='That name is reserved or already exists.';return;}categoryOrderDraft.push(value);categoryDraft=[...categoryOrderDraft];$('managerNewCategory').value='';renderCategoryManager();};
$('managerNewCategory').addEventListener('keydown',e=>{if(e.key==='Enter')$('managerAddCategory').click()});
$('saveCategoryManager').onclick=()=>{const section=currentSection||'Baking';const previous=getSectionCustomCategories(section);const removed=previous.filter(c=>!categoryOrderDraft.includes(c)&&!Object.keys(categoryRenameMap).some(old=>c===old||c.startsWith(old+SUBCAT_SEP)));let nextRecipes=recipes.map(r=>{if(recipeSection(r)!==section)return r;let updated=[...(r.categories||[])];removed.forEach(c=>updated=updated.filter(x=>x!==c&&!x.startsWith(c+SUBCAT_SEP)));Object.entries(categoryRenameMap).forEach(([oldName,newName])=>{updated=updated.map(x=>x===oldName?newName:x.startsWith(oldName+SUBCAT_SEP)?newName+x.slice(oldName.length):x)});return {...r,categories:updated}});const all=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});all[section]=categoryOrderDraft.slice();const oldCats=cats,oldRecipes=recipes;cats=[...new Set(['All recipes','Favorites',...Object.values(all).flat()])];recipes=nextRecipes;if(save()){localStorage.setItem(SECTION_CATS_BY_SECTION_KEY,JSON.stringify(all));saveSectionCategoryOrder(categoryOrderDraft,section);if(!categoryOrderDraft.includes(active))active='All recipes';render();showPage('recipes');say('Categories saved for '+section+'.');}else{cats=oldCats;recipes=oldRecipes;}};
$('cancelCategoryManager').onclick=$('categoryManagerBackBtn').onclick=()=>showPage('tools');
$('openCategoryManagerBtn').onclick=startCategoryManager;

$('toolsGearBtn').onclick=()=>showPage($('recipesPage').classList.contains('hidden')?'recipes':'tools');$('switchSectionBtn').onclick=showMRBSectionChooser;document.querySelectorAll('[data-mrb-section]').forEach(btn=>btn.addEventListener('click',()=>chooseMRBSection(btn.dataset.mrbSection)));
$('appToolsBackBtn').onclick=()=>showPage('recipes');
$('quickStarterBtn').onclick=()=>showPage('starter');

$('quickTimerBtn').onclick=()=>showPage('timer');
$('openCalorieCalculatorMenuBtn').onclick=()=>showPage('calorie');
$('openSugarNutritionMenuBtn').onclick=()=>{showPage('sugarNutrition');initSugarNutritionChecker()};
$('sugarNutritionBackBtn').onclick=()=>showPage('tools');
initSugarNutritionChecker();

$('openDoughCalculatorMenuBtn').onclick=()=>showPage('dough');
$('openBakersPctBtn').onclick=()=>showPage('bakersPct');
$('openPrefermentBtn').onclick=()=>showPage('preferment');
$('openDoughTempBtn').onclick=()=>showPage('doughTemp');
['bakersPct','preferment','doughTemp'].forEach(k=>{
 const back=$(k==='bakersPct'?'bakersPctBack':k==='preferment'?'prefermentBack':'doughTempBack');
 back.onclick=()=>showPage('tools');
});
const num=id=>{const v=parseFloat($(id).value);return Number.isFinite(v)?v:0};
const fmt=n=>Number.isFinite(n)?(Math.round(n*100)/100).toLocaleString(undefined,{maximumFractionDigits:2}):'—';
function updateBakersPct(){
 const f=num('bpFlour'), vals=[['Flour',f],['Water',num('bpWater')],['Salt',num('bpSalt')],['Yeast / starter',num('bpYeast')],['Other',num('bpOther')]];
 const total=vals.reduce((a,x)=>a+x[1],0);
 $('bpResults').innerHTML=f>0?`<p><strong>Total dough weight: ${fmt(total)} g</strong></p><ul>${vals.map(([n,v])=>`<li>${n}: ${fmt(v)} g — ${fmt(v/f*100)}%</li>`).join('')}</ul>`:'Enter a flour weight greater than zero.';
}
['bpFlour','bpWater','bpSalt','bpYeast','bpOther'].forEach(id=>$(id).addEventListener('input',updateBakersPct));
$('bpReset').onclick=()=>{[['bpFlour',500],['bpWater',350],['bpSalt',10],['bpYeast',5],['bpOther',0]].forEach(([i,v])=>$(i).value=v);updateBakersPct()};updateBakersPct();

function updatePreferment(){
 const f=num('pfTotalFlour'),p=num('pfPct'),h=num('pfHydration'),th=num('pfTotalHydration');
 const pf=f*p/100, pw=pf*h/100, totalWater=f*th/100, finalFlour=f-pf, finalWater=totalWater-pw;
 $('pfResults').innerHTML=f>0&&p>=0&&p<=100&&finalWater>=0?`<h3>Preferment</h3><p>Flour: <strong>${fmt(pf)} g</strong><br>Water: <strong>${fmt(pw)} g</strong></p><h3>Final dough additions</h3><p>Remaining flour: <strong>${fmt(finalFlour)} g</strong><br>Remaining water: <strong>${fmt(finalWater)} g</strong></p><p>Total recipe water: ${fmt(totalWater)} g (${fmt(th)}% hydration)</p>`:'Check your values. Preferment flour must be 0–100% and preferment water cannot exceed the recipe water.';
}
['pfTotalFlour','pfPct','pfHydration','pfTotalHydration'].forEach(id=>$(id).addEventListener('input',updatePreferment));
$('pfReset').onclick=()=>{[['pfTotalFlour',500],['pfPct',30],['pfHydration',100],['pfTotalHydration',75]].forEach(([i,v])=>$(i).value=v);updatePreferment()};updatePreferment();


function updateDoughTemp(){
 const unit=$('dtUnit').value, raw=[num('dtTarget'),num('dtRoom'),num('dtFlour'),num('dtPreferment'),num('dtFriction')];
 // Convert absolute temperatures to Celsius; friction is a temperature difference.
 const vals=unit==='F'?[...raw.slice(0,4).map(v=>(v-32)*5/9),raw[4]*5/9]:raw;
 const [target,room,flour,pref,friction]=vals;
 const waterC=target*4-room-flour-pref-friction, waterF=waterC*9/5+32;
 $('dtResults').innerHTML=`<h3>Required water temperature</h3><p style="font-size:1.6rem;font-weight:800;color:var(--g)">${fmt(waterC)} °C / ${fmt(waterF)} °F</p><p class="help">Calculation in Celsius: (${fmt(target)} × 4) − ${fmt(room)} − ${fmt(flour)} − ${fmt(pref)} − ${fmt(friction)}</p>`;
}
function updateDoughTempLabels(){const u=$('dtUnit').value;[['dtTargetLabel','Desired dough temperature'],['dtRoomLabel','Room temperature'],['dtFlourLabel','Flour temperature'],['dtPrefermentLabel','Preferment temperature'],['dtFrictionLabel','Friction factor']].forEach(([id,label])=>$(id).textContent=`${label} (${u==='C'?'°C':'°F'})`);updateDoughTemp()}
['dtTarget','dtRoom','dtFlour','dtPreferment','dtFriction'].forEach(id=>$(id).addEventListener('input',updateDoughTemp));
$('dtUnit').addEventListener('change',updateDoughTempLabels);
$('dtReset').onclick=()=>{$('dtUnit').value='C';[['dtTarget',24],['dtRoom',22],['dtFlour',22],['dtPreferment',22],['dtFriction',6]].forEach(([i,v])=>$(i).value=v);updateDoughTempLabels()};updateDoughTempLabels();


$('calorieBackBtn').onclick=()=>showPage('tools');
initRecipeNutritionCalculator();
$('openBakingTimerMenuBtn').onclick=()=>showPage('timer');
$('openCookingTempsMenuBtn').onclick=()=>showPage('cookingTemps');
$('cookingTempsBackBtn').onclick=()=>showPage('tools');
$('openMeasurementMenuBtn').onclick=()=>showPage('measurement');
$('measurementBackBtn').onclick=()=>showPage('tools');
$('openSubstitutesMenuBtn').onclick=()=>{showPage('substitutes');$('substituteSearch').focus()};
$('substitutesBackBtn').onclick=()=>showPage('tools');
$('openPantryMenuBtn').onclick=()=>{showPage('pantry');$('pantryIngredients').focus()};
$('pantryBackBtn').onclick=()=>showPage('tools');
if($('openStarterMenuBtn'))$('openStarterMenuBtn').onclick=()=>showPage('starter');
$('starterBackBtn').onclick=()=>showPage('tools');
$('timerBackBtn').onclick=()=>showPage('tools');
$('bakingBackBtn').onclick=()=>showPage('tools');
$('hydrationBackBtn').onclick=()=>showPage('tools');
 if($('openDryCureMenuBtn'))$('openDryCureMenuBtn').onclick=()=>showPage('baking');
// Front-page Quick Tools can be customized from the front page, App Tools, or Dry Cure page.
const QUICK_TOOLS_KEY='myRecipeBook_quick_tools_v1';
const QUICK_TOOL_ITEMS=[
 {id:'drycure',label:'🥩 Dry Cure Calculator',page:'baking',group:'Smoking / Curing Tools'},
 {id:'hydration',label:'💧 Sourdough Hydration Calculator',page:'hydration',group:'Baking Tools'},
 {id:'dough',label:'🍞 Dough Calculator',page:'dough',group:'Baking Tools'},
 {id:'bakersPct',label:'⚖️ Baker’s Percentage Calculator',page:'bakersPct',group:'Baking Tools'},
 {id:'preferment',label:'🥣 Preferment Calculator',page:'preferment',group:'Baking Tools'},
 {id:'doughTemp',label:'🌡️ Dough Temperature Calculator',page:'doughTemp',group:'Baking Tools'},
 {id:'starter',label:'🌾 Sourdough Starter Tracker',page:'starter',group:'Baking Tools'},
 {id:'timer',label:'⏱️ Baking Timer',page:'timer',group:'Baking Tools'},
 {id:'calendar',label:'📅 Recipe Calendar & Daily Tasks',page:'calendar',group:'Baking Tools'},
 {id:'calorie',label:'🥗 Calorie Calculator',page:'calorie',group:'Baking Tools'},
 {id:'sugarNutrition',label:'🍎 Sugar & Nutrition Checker',page:'sugarNutrition',group:'Baking Tools'},
 {id:'temps',label:'🌡️ Cooking Temperatures',page:'cookingTemps',group:'Baking Tools'},
 {id:'abv',label:'🍷 Alcohol By Volume (ABV) Calculator',page:'abv',group:'Brewing Tools'},
 {id:'abvBoost',label:'🍯 Sugar / Honey to Raise ABV',page:'abvBoost',group:'Brewing Tools'},
 {id:'sweetness',label:'🍯 Sweetness / Back-Sweetening Calculator',page:'sweetness',group:'Brewing Tools'},
 {id:'custombrew',label:'🧪 Custom Brews',page:'customBrew',group:'Brewing Tools'},
 {id:'backup',label:'💾 Backup / Restore',page:'action',group:'App Tools'},
 {id:'pin',label:'🔒 PIN Settings',page:'action',group:'App Tools'},
 {id:'addrecipe',label:'➕ Add Recipe',page:'action',group:'App Tools'},
 {id:'import',label:'📥 Import Recipes',page:'action',group:'App Tools'},
 {id:'autosave',label:'💾 Automatic Save / Backup',page:'action',group:'App Tools'},
 {id:'measure',label:'📏 Measurement Converter',page:'measurement',group:'Baking Tools'},
 {id:'substitutes',label:'🔄 Ingredient Substitutes',page:'substitutes',group:'Baking Tools'},
 {id:'pantry',label:'🥕 Pantry / What’s-in-My-Fridge',page:'pantry',group:'Baking Tools'},
 {id:'shopping',label:'🛒 Shopping List',page:'shopping',group:'Baking Tools'},
 {id:'inventory',label:'🥕 Pantry Inventory',page:'inventory',group:'Baking Tools'}
];
const QUICK_TOOLS_DOUGH_DEFAULT_MIGRATION='myRecipeBook_quick_tools_dough_default_v1';
const QUICK_TOOLS_SUGAR_MIGRATION='myRecipeBook_quick_tools_sugar_v1';
function getQuickToolSelection(){try{const raw=localStorage.getItem(QUICK_TOOLS_KEY);let v=raw?JSON.parse(raw):null;if(!Array.isArray(v))v=['drycure','starter','hydration','dough'];if(localStorage.getItem(QUICK_TOOLS_DOUGH_DEFAULT_MIGRATION)!=='done'){if(!v.includes('dough'))v.push('dough');localStorage.setItem(QUICK_TOOLS_KEY,JSON.stringify(v));localStorage.setItem(QUICK_TOOLS_DOUGH_DEFAULT_MIGRATION,'done');}if(localStorage.getItem(QUICK_TOOLS_SUGAR_MIGRATION)!=='done'){if(!v.includes('sugarNutrition'))v.push('sugarNutrition');localStorage.setItem(QUICK_TOOLS_KEY,JSON.stringify(v));localStorage.setItem(QUICK_TOOLS_SUGAR_MIGRATION,'done');}v=v.filter(id=>id!=='preservation'&&id!=='family');localStorage.setItem(QUICK_TOOLS_KEY,JSON.stringify(v));return v;}catch{return ['drycure','starter','hydration','dough','sugarNutrition'];}}
function saveQuickToolSelection(ids){try{localStorage.setItem(QUICK_TOOLS_KEY,JSON.stringify(ids));localStorage.setItem(QUICK_TOOLS_DOUGH_DEFAULT_MIGRATION,'done');}catch{}}
function openQuickTool(id){const item=QUICK_TOOL_ITEMS.find(x=>x.id===id);if(!item)return;const menu=$('quickToolsDropdown');if(menu)menu.open=false;quickToolMode=true;if(id==='calendar'){calendarRecipeOptions();if(!$('calendarStart').value)$('calendarStart').value=calendarDateKey(new Date());showPage('calendar');renderCalendar();return;}if(item.page==='action'){showPage('recipes');if(id==='backup')$('backupBtn').click();else if(id==='pin')$('pinSettingsBtn').click();else if(id==='addrecipe')$('addBtn').click();else if(id==='import')$('importBtn').click();else if(id==='autosave')$('autoSaveLocationBtn').click();return;}showPage(item.page);}
// Pointer-based drag sorting works with mouse, touchscreen and stylus.
function enableTouchDragSort(list,row,handle,onCommit){
 handle.style.touchAction='none';
 handle.setAttribute('aria-label','Drag to rearrange');
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==undefined&&e.button!==0)return;
  e.preventDefault();
  row.classList.add('dragging');
  try{handle.setPointerCapture(e.pointerId)}catch{}
  const move=ev=>{
   ev.preventDefault();
   const others=[...list.querySelectorAll('.quick-tool-order-row')].filter(x=>x!==row);
   let inserted=false;
   for(const target of others){
    const rect=target.getBoundingClientRect();
    if(ev.clientY<rect.top+rect.height/2){list.insertBefore(row,target);inserted=true;break;}
   }
   if(!inserted)list.appendChild(row);
  };
  const finish=()=>{
   document.removeEventListener('pointermove',move);
   document.removeEventListener('pointerup',finish);
   document.removeEventListener('pointercancel',finish);
   row.classList.remove('dragging');
   onCommit([...list.querySelectorAll('.quick-tool-order-row')].map(x=>x.dataset.id));
  };
  document.addEventListener('pointermove',move,{passive:false});
  document.addEventListener('pointerup',finish,{once:true});
  document.addEventListener('pointercancel',finish,{once:true});
 });
}
function renderQuickTools(){
 const selected=getQuickToolSelection().filter(id=>QUICK_TOOL_ITEMS.some(x=>x.id===id));
 const links=$('quickToolsLinks');
 links.innerHTML='';
 QUICK_TOOL_ITEMS.filter(x=>selected.includes(x.id)&&(x.group===((currentSection||'Baking')+' Tools')||x.group==='App Tools')).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='tool-button alt';b.textContent=item.label;b.addEventListener('click',()=>openQuickTool(item.id));links.appendChild(b);});
 if(!links.children.length){const note=document.createElement('p');note.className='help';note.textContent='No quick tools selected. Open “Add or remove Quick Tools” to choose some.';links.appendChild(note);}
 ['quickToolsManager','appQuickToolsManager','bakingQuickToolsManager','hydrationQuickToolsManager'].forEach(containerId=>{
  const host=$(containerId);if(!host)return;host.innerHTML='';
  const heading=document.createElement('div');heading.className='help';heading.textContent='Touch and hold the grip (⠿), then drag tools into your preferred order:';host.appendChild(heading);
  const order=document.createElement('div');order.className='quick-tool-order-list';order.setAttribute('aria-label','Selected Quick Tools order');host.appendChild(order);
  function commit(next){saveQuickToolSelection(next);renderQuickTools();}
  function drawOrder(){
   order.innerHTML='';
   const current=getQuickToolSelection().filter(id=>QUICK_TOOL_ITEMS.some(x=>x.id===id));
   current.forEach((id,index)=>{
    const item=QUICK_TOOL_ITEMS.find(x=>x.id===id);const row=document.createElement('div');row.className='quick-tool-order-row';row.draggable=false;row.dataset.id=id;
    const grip=document.createElement('span');grip.className='qt-drag';grip.textContent='⠿';grip.title='Drag to reorder';
    const name=document.createElement('span');name.className='qt-name';name.textContent=item.label;
    row.append(grip,name);
    enableTouchDragSort(order,row,grip,next=>{if(next.length)commit(next);});
    order.appendChild(row);
   });
   if(!current.length){const empty=document.createElement('p');empty.className='help';empty.textContent='No tools selected yet. Choose tools below.';order.appendChild(empty);}
  }
  drawOrder();
  const availableTitle=document.createElement('div');availableTitle.className='quick-tool-manager-heading';availableTitle.textContent='Add or remove tools';host.appendChild(availableTitle);
  let group='';
  QUICK_TOOL_ITEMS.forEach(item=>{if(group!==item.group){group=item.group;const h=document.createElement('div');h.className='quick-tool-group';h.textContent=group;host.appendChild(h);}const label=document.createElement('label');label.className='quick-tool-choice';const cb=document.createElement('input');cb.type='checkbox';cb.checked=selected.includes(item.id);cb.addEventListener('change',()=>{const next=getQuickToolSelection().filter(x=>x!==item.id);if(cb.checked)next.push(item.id);commit(next);});const span=document.createElement('span');span.textContent=item.label;label.append(cb,span);host.appendChild(label);});
 });
}
renderQuickTools();
// Tools page: place every tool under one of the three clear categories.
(()=>{
 const host=$('toolsPage'); if(!host)return;
 const panel=host.querySelector(':scope > .panel'); if(!panel)return;
 const firstArea=panel.querySelector(':scope > .tool-content > .tools-sections'); if(!firstArea)return;
 const quickManager=host.querySelector('#appQuickToolsManager')?.closest('details');
 const originalMain=host.querySelector('.main-tool-dropdown');
 const orderKey='myRecipeBook_groupedToolsOrder_v2';
 const bakingItems=[], smokingItems=[], appItems=[], wineItems=[];
 const protectedAppIds=new Set(['openTermsBtn','backupBtn','pinSettingsBtn','openAppIconSettingsBtn']);
 const wineDetail=firstArea.querySelector(':scope > details.wine-mead-tools-dropdown');
 // Collect the brewing controls by their stable IDs so they remain visible even
 // if the original Wine & Mead dropdown markup changes in a later edit.
 const brewingIds=['openAbvCalculatorBtn','openAbvBoostCalculatorBtn','openSweetnessCalculatorBtn','openCustomBrewBtn'];
 brewingIds.forEach(id=>{const btn=firstArea.querySelector('#'+id);if(btn)wineItems.push(btn);});
 // All ordinary tools from the original tools list belong in Baking Tools.
 Array.from(firstArea.children).forEach(el=>{
   if(el===wineDetail)return;
   if(el.matches('button.tool-button')){if(['openCategoryManagerBtn','toolsOpenCalendarBtn','addBtn','importBtn'].includes(el.id))appItems.push(el);else if(el.id==='openCookingTempsMenuBtn')smokingItems.push(el);else bakingItems.push(el);}
 });
 // Only the five requested settings/ownership functions remain in App Tools.
 if(originalMain){
   originalMain.querySelectorAll(':scope > .tool-content > .tools-sections > button.tool-button').forEach(btn=>{
     (protectedAppIds.has(btn.id)||['toolsOpenCalendarBtn','openCookingHistoryBtn'].includes(btn.id)?appItems:bakingItems).push(btn);
   });
   originalMain.querySelectorAll(':scope > .tool-content > .tools-sections > details.tool-dropdown').forEach(detail=>{
     const btn=detail.querySelector('button.tool-button');
     if(!btn)return;
     const label=detail.querySelector(':scope > summary')?.textContent.trim();
     if(label)btn.textContent=label;
     (protectedAppIds.has(btn.id)||['toolsOpenCalendarBtn','openCookingHistoryBtn'].includes(btn.id)?appItems:bakingItems).push(btn);
   });
   const autoButton=originalMain.querySelector('#autoSaveLocationBtn');
   if(autoButton){const block=autoButton.parentElement;if(block){block.style.margin='0';block.style.padding='0';block.style.border='0';autoButton.style.width='100%';autoButton.style.minHeight='44px';appItems.push(block);}}
   const updateButton=document.querySelector('#checkForUpdatesBtn');
   if(updateButton){
     const updateBlock=updateButton.parentElement;
     if(updateBlock){
       updateBlock.style.margin='0';
       updateBlock.style.padding='0';
       updateBlock.style.border='0';
       updateButton.style.width='100%';
       updateButton.style.minHeight='44px';
       appItems.push(updateBlock);
     }
   }
 }
 const unique=items=>items.filter((el,i,a)=>a.indexOf(el)===i);
 const dryCureButton=document.createElement('button');dryCureButton.type='button';dryCureButton.className='tool-button alt';dryCureButton.textContent='🥩 Dry Cure Calculator';dryCureButton.addEventListener('click',()=>showPage('baking'));smokingItems.unshift(dryCureButton);
 const groups=[
   {name:'🥖 Baking Tools',section:'Baking',items:unique(bakingItems)},
   {name:'🥩 Smoking / Curing Tools',section:'Smoking / Curing',items:unique(smokingItems)},
   {name:'🍷 Brewing Tools',section:'Brewing',items:unique(wineItems)},
   {name:'🧰 App Tools',section:'App Tools',items:unique(appItems)}
 ];
 const container=document.createElement('div');container.className='tools-direct-groups';
 groups.forEach((group,index)=>{
   const section=document.createElement('section');section.className='tools-direct-group tools-direct-group-'+index;section.dataset.group=index;section.dataset.section=group.section;
   const heading=document.createElement('h3');heading.className='tools-direct-heading';heading.textContent=group.name;section.appendChild(heading);
   const list=document.createElement('div');list.className='tools-sections';list.style.cssText='display:grid;grid-template-columns:1fr;gap:7px;margin:0';
   group.items.forEach(el=>{el.style.width='100%';el.style.minHeight='44px';list.appendChild(el)});
   if(!group.items.length){const empty=document.createElement('p');empty.className='help';empty.textContent='No tools in this section.';list.appendChild(empty);}
   section.appendChild(list);container.appendChild(section);group.section=section;group.list=list;
 });
 if(originalMain)originalMain.remove();
 const muted=host.querySelector(':scope > .panel > .tool-content > p.muted');if(muted)muted.remove();
 if(quickManager)quickManager.insertAdjacentElement('afterend',container);else firstArea.insertAdjacentElement('afterend',container);
 firstArea.remove();
 // Safety check: explicitly place the two requested fermentation calculators
 // in the visible Brewing Tools group, even if an earlier layout pass moved them.
 const brewingGroup=container.querySelector('.tools-direct-group[data-section="Brewing"]');
 const brewingList=brewingGroup?.querySelector('.tools-sections');
 [
   ['openAbvBoostCalculatorBtn','🍯 Sugar / Honey to Raise ABV','abvBoost'],
   ['openSweetnessCalculatorBtn','🍯 Sweetness / Back-Sweetening Calculator','sweetness']
 ].forEach(([id,label,page])=>{
   let btn=document.getElementById(id);
   if(!btn){
     btn=document.createElement('button');
     btn.id=id;btn.type='button';btn.className='tool-button alt';btn.textContent=label;
     btn.addEventListener('click',()=>showPage(page));
   }
   if(brewingList&&!brewingList.contains(btn))brewingList.appendChild(btn);
   if(btn){btn.hidden=false;btn.style.display='block';btn.style.visibility='visible';btn.style.width='100%';btn.style.minHeight='44px';}
 });
 if(brewingGroup){brewingGroup.style.display='block';brewingGroup.style.visibility='visible';}
 // Keep the existing arrange feature, with ordering saved separately inside each category.
 const arrange=document.createElement('details');arrange.className='tool-dropdown';arrange.style.margin='10px 0 12px';
 const arrangeSummary=document.createElement('summary');arrangeSummary.textContent='↕ Arrange Tools';arrange.appendChild(arrangeSummary);
 const arrangeContent=document.createElement('div');arrangeContent.className='tool-content';
 const arrangeHelp=document.createElement('p');arrangeHelp.className='help';arrangeHelp.textContent='Touch and hold the grip (⠿), then drag tools within their own section.';arrangeContent.appendChild(arrangeHelp);
 const orderList=document.createElement('div');orderList.className='quick-tool-order-list';orderList.setAttribute('aria-label','Tools order');arrangeContent.appendChild(orderList);arrange.appendChild(arrangeContent);
 container.insertAdjacentElement('afterend',arrange);
 const keyOf=el=>el.id||el.textContent.trim().slice(0,80);
 const labelOf=el=>el.textContent.trim();
 const getOrder=g=>{const keys=Array.from(g.list.children).filter(el=>el.matches('button,details,div')).map(keyOf);let saved=[];try{const all=JSON.parse(localStorage.getItem(orderKey)||'{}');saved=Array.isArray(all[g.name])?all[g.name]:[]}catch{}return [...saved.filter(k=>keys.includes(k)),...keys.filter(k=>!saved.includes(k))]};
 const saveOrder=(g,order)=>{let all={};try{all=JSON.parse(localStorage.getItem(orderKey)||'{}')}catch{}all[g.name]=order;try{localStorage.setItem(orderKey,JSON.stringify(all))}catch{}};
 const applyOrder=()=>groups.forEach(g=>{const byKey=new Map(Array.from(g.list.children).map(el=>[keyOf(el),el]));getOrder(g).forEach(k=>{const el=byKey.get(k);if(el)g.list.appendChild(el)})});
 applyOrder();
 function renderOrder(){orderList.innerHTML='';groups.forEach(g=>{const heading=document.createElement('strong');heading.textContent=g.name;heading.style.cssText='display:block;margin:12px 0 5px';orderList.appendChild(heading);getOrder(g).forEach(key=>{const el=Array.from(g.list.children).find(x=>keyOf(x)===key);if(!el)return;const row=document.createElement('div');row.className='quick-tool-order-row';row.draggable=false;row.dataset.id=key;const grip=document.createElement('span');grip.className='qt-drag';grip.textContent='⠿';grip.title='Drag to reorder';const name=document.createElement('span');name.className='qt-name';name.textContent=labelOf(el);row.append(grip,name);enableTouchDragSort(orderList,row,grip,()=>{const rows=Array.from(orderList.querySelectorAll('.quick-tool-order-row'));const groupRows=rows.filter(r=>Array.from(g.list.children).some(x=>keyOf(x)===r.dataset.id));saveOrder(g,groupRows.map(r=>r.dataset.id));applyOrder();renderOrder()});orderList.appendChild(row)})})}
 renderOrder();
 const welcomePanel=document.getElementById('welcomeGuideLaunch');const toolsPage=document.getElementById('toolsPage');const toolsToolbar=toolsPage&&toolsPage.querySelector('.toolbar');if(welcomePanel&&toolsToolbar)toolsToolbar.insertAdjacentElement('afterend',welcomePanel);
})();
// Independent safety pass: keep Check for Updates visible in App Tools even if
// the main tool-grouping pass is interrupted or the original settings dropdown
// has already been removed.
(()=>{
 const button=document.getElementById('checkForUpdatesBtn');
 const host=document.getElementById('toolsPage');
 if(!button||!host)return;
 let block=button.parentElement;
 if(!block||block===host||block===document.body){
   block=document.createElement('div');
   block.appendChild(button);
   const status=document.getElementById('checkForUpdatesStatus');
   if(status)block.appendChild(status);
 }
 block.style.margin='0';
 block.style.padding='0';
 block.style.border='0';
 button.hidden=false;
 button.style.display='block';
 button.style.visibility='visible';
 button.style.width='100%';
 button.style.minHeight='48px';
 let appGroup=host.querySelector('.tools-direct-group[data-section="App Tools"]');
 let list=appGroup&&appGroup.querySelector('.tools-sections');
 if(!list){
   let groups=host.querySelector('.tools-direct-groups');
   if(!groups){
     groups=document.createElement('div');
     groups.className='tools-direct-groups';
     const panel=host.querySelector('.panel');
     if(!panel)return;
     panel.appendChild(groups);
   }
   appGroup=document.createElement('section');
   appGroup.className='tools-direct-group';
   appGroup.dataset.section='App Tools';
   const heading=document.createElement('h3');
   heading.className='tools-direct-heading';
   heading.textContent='🧰 App Tools';
   list=document.createElement('div');
   list.className='tools-sections';
   list.style.cssText='display:grid;grid-template-columns:1fr;gap:7px;margin:0';
   appGroup.append(heading,list);
   groups.appendChild(appGroup);
 }
 if(!list.contains(block))list.appendChild(block);
})();
// Sourdough hydration calculator; starter flour and water are included in the totals.
(function(){
 const ids=['hydFlour','hydStarter','hydStarterPct','hydTarget','hydSaltPct'];
 const out=$('hydResults');
 function calculateHydration(){
  const flour=Number($('hydFlour').value),starter=Number($('hydStarter').value),starterPct=Number($('hydStarterPct').value),target=Number($('hydTarget').value),saltPct=Number($('hydSaltPct').value);
  if(!Number.isFinite(flour)||!Number.isFinite(starter)||flour<=0||starter<0){out.innerHTML='<strong>Please enter a flour weight greater than zero and a starter weight of zero or more.</strong>';return;}
  const starterFlour=starter/(1+starterPct/100),starterWater=starter-starterFlour,totalFlour=flour+starterFlour,totalWater=totalFlour*target/100,waterToAdd=totalWater-starterWater,saltToAdd=totalFlour*saltPct/100;
  if(waterToAdd<0){out.innerHTML='<strong>This starter already contains more water than the selected hydration allows.</strong><p class="help">Choose a higher target hydration or reduce the starter amount.</p>';return;}
  const fmt=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
  out.innerHTML='<h3 style="margin:0 0 10px">Your sourdough formula</h3><p style="font-size:1.45rem;font-weight:800;color:var(--g);margin:0 0 10px">Add '+fmt(waterToAdd)+' g water</p><p><strong>Desired hydration:</strong> '+target+'%</p><p><strong>Salt percentage:</strong> '+saltPct+'%</p><p><strong>Salt to add:</strong> '+fmt(saltToAdd)+' g</p><p><strong>Total flour (including starter):</strong> '+fmt(totalFlour)+' g</p><p><strong>Total water (including starter):</strong> '+fmt(totalWater)+' g</p><p><strong>Flour from starter:</strong> '+fmt(starterFlour)+' g</p><p><strong>Water from starter:</strong> '+fmt(starterWater)+' g</p><p><strong>Additional flour:</strong> '+fmt(flour)+' g</p><p><strong>Starter added:</strong> '+fmt(starter)+' g</p>';
 }
 $('hydCalculate').addEventListener('click',calculateHydration);
 ids.forEach(id=>$(id).addEventListener('input',calculateHydration));
 $('hydReset').addEventListener('click',()=>{$('hydFlour').value=500;$('hydStarter').value=100;$('hydStarterPct').value='100';$('hydTarget').value='70';$('hydSaltPct').value='2';calculateHydration();});
 calculateHydration();
})();
// Simple baking countdown timer; independent of recipe storage.
// Timer logic is maintained in the separate timers.js module.
const timerManager = window.MRBTimers.create({ $ });
timerManager.initMain();

function setCategoriesCollapsed(collapsed){$('categoriesDropdown').open=!collapsed;const summary=$('categoriesDropdown').querySelector('summary');summary.textContent=collapsed?'▼':'▲';summary.setAttribute('aria-label',collapsed?'Open categories':'Close categories');try{localStorage.setItem(CAT_COLLAPSED,collapsed?'true':'false')}catch{}}
$('categoriesDropdown').addEventListener('toggle',()=>{const open=$('categoriesDropdown').open;if(open&&$('quickToolsDropdown').open)$('quickToolsDropdown').open=false;try{localStorage.setItem(CAT_COLLAPSED,open?'false':'true')}catch{}});
function setQuickToolsCollapsed(collapsed){const menu=$('quickToolsDropdown');menu.open=!collapsed;const summary=menu.querySelector('summary');summary.setAttribute('aria-label',collapsed?'Open Baking Tools':'Close Baking Tools');summary.setAttribute('title',collapsed?'Baking Tools':'Close Baking Tools');summary.querySelector('.qt-arrow')?.remove();try{localStorage.setItem(QT_COLLAPSED,collapsed?'true':'false')}catch{}}
$('quickToolsDropdown').addEventListener('toggle',()=>{const open=$('quickToolsDropdown').open;if(open&&$('categoriesDropdown').open)$('categoriesDropdown').open=false;const summary=$('quickToolsDropdown').querySelector('summary');summary.setAttribute('aria-label',open?'Close Baking Tools':'Open Baking Tools');summary.setAttribute('title',open?'Close Baking Tools':'Baking Tools');summary.querySelector('.qt-arrow')?.remove();try{localStorage.setItem(QT_COLLAPSED,open?'false':'true')}catch{}});
setQuickToolsCollapsed(true);
async function pinDigest(pin){const bytes=new TextEncoder().encode('MyRecipeBook-PIN-v1:'+pin);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function getPinHash(){return localStorage.getItem(PK)||''}
async function setPinFlow(){let old=await getPinHash();if(old){let current=prompt('Enter your current 4-digit PIN to change it:');if(current===null)return false;if(!/^\d{4}$/.test(current)||await pinDigest(current)!==old){say('Incorrect PIN. PIN was not changed.',true);return false}}
let a=prompt(old?'Choose a new 4-digit PIN:':'Choose a 4-digit PIN:');if(a===null)return false;if(!/^\d{4}$/.test(a)){say('PIN must be exactly 4 digits.',true);return false}let b=prompt('Enter the 4-digit PIN again to confirm:');if(b!==a){say('PINs did not match. PIN was not changed.',true);return false}localStorage.setItem(PK,await pinDigest(a));say(old?'PIN changed.':'PIN set. Keep it somewhere safe.');return true}
async function authorizeDestructiveAction(){let stored=await getPinHash();if(!stored){let setup=confirm('A 4-digit PIN is needed to protect deletion and backup restore. Set one now?');if(!setup)return false;if(!await setPinFlow())return false;stored=await getPinHash()}let entered=prompt('Enter your 4-digit PIN to continue:');if(entered===null)return false;if(!/^\d{4}$/.test(entered)||await pinDigest(entered)!==stored){say('Incorrect PIN. Nothing was changed.',true);return false}return true}

function normalizeRecipeLink(value){let raw=String(value||'').trim();if(!raw)return '';if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))raw='https://'+raw;try{const u=new URL(raw);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function norm(r){let c=Array.isArray(r.categories)?r.categories:typeof r.categories==='string'?r.categories.split(','):r.category?[r.category]:[];return{id:String(r.id||id()),section:['Baking','Smoking / Curing','Brewing'].includes(r.section)?r.section:'',title:String(r.title||r.name||'Untitled recipe'),description:String(r.description||''),categories:c.map(x=>String(x).trim()).filter(Boolean),yield:String(r.yield||r.servings||''),times:String(r.times||r.time||''),ingredients:String(r.ingredients||''),directions:String(r.directions||r.instructions||r.method||''),nutrition:String(r.nutrition||''),notes:String(r.notes||''),videoLink:String(r.videoLink||r.videoUrl||r.video||''),websiteLink:String(r.websiteLink||r.websiteUrl||r.sourceUrl||''),favorite:!!(r.favorite||r.isFavorite),photo:typeof r.photo==='string'?r.photo:'',scalable:r.scalable!==false,createdAt:Number(r.createdAt||Date.now()),updatedAt:Number(r.updatedAt||Date.now())}}
let driveAutoSyncTimer=null,driveSyncBusy=false;
function scheduleDriveAutoSync(){if(driveSyncBusy||!driveToken||!localStorage.getItem('myRecipeBook_drive_auto_sync_v1'))return;clearTimeout(driveAutoSyncTimer);driveAutoSyncTimer=setTimeout(()=>syncDriveNow(true),1800)}
const RECIPE_PHOTO_DB='myRecipeBookPhotoStore_v1';
function openRecipePhotoDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('This browser does not support picture storage.'));return}/* Open the existing database at its current version; never request a downgrade. */const req=indexedDB.open(RECIPE_PHOTO_DB);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos')};req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('photos')){db.close();reject(new Error('The recipe photo database is missing its photos store.'));return}resolve(db)};req.onerror=()=>reject(req.error||new Error('Could not open picture storage.'));req.onblocked=()=>reject(new Error('Picture storage is busy in another app tab. Close other My Recipe Book tabs and try again.'))})}
async function storeRecipePhoto(recipeId,data){const db=await openRecipePhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(data,String(recipeId));tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error||new Error('Could not store the picture.'))};tx.onabort=()=>{db.close();reject(tx.error||new Error('Picture storage was interrupted.'))}})}
async function readRecipePhotos(){
 const db=await openRecipePhotoDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('photos','readonly');
  const store=tx.objectStore('photos');
  // Queue both reads immediately in the same transaction. This avoids
  // issuing one get() per key from a later callback, which can be fragile
  // on mobile browsers when the transaction has already become inactive.
  const keysRequest=store.getAllKeys();
  const valuesRequest=store.getAll();
  let keys=null,values=null,settled=false;
  const fail=err=>{if(settled)return;settled=true;try{db.close()}catch{}reject(err||new Error('Could not read saved recipe pictures.'))};
  keysRequest.onsuccess=()=>{keys=keysRequest.result||[]};
  valuesRequest.onsuccess=()=>{values=valuesRequest.result||[]};
  keysRequest.onerror=()=>fail(keysRequest.error);
  valuesRequest.onerror=()=>fail(valuesRequest.error);
  tx.oncomplete=()=>{
   if(settled)return;
   settled=true;
   const out={};
   (keys||[]).forEach((key,index)=>{
    const value=(values||[])[index];
    if(typeof value==='string'&&value)out[String(key)]=value;
   });
   db.close();resolve(out);
  };
  tx.onerror=()=>fail(tx.error);
  tx.onabort=()=>fail(tx.error);
 });
}
async function readLegacyRecipePhotos(){
 // Earlier builds stored pictures in this database. Keep it as a read-only
 // migration source so an app update cannot make those pictures appear lost.
 const legacyName='MyRecipeBookRecipePhotos';
 try{
  if(typeof indexedDB.databases==='function'){
   const databases=await indexedDB.databases();
   if(!databases.some(db=>db.name===legacyName))return {};
  }
  const db=await new Promise((resolve,reject)=>{
   const req=indexedDB.open(legacyName);
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error('Could not open the older picture store.'));
   req.onblocked=()=>reject(new Error('The older picture store is busy in another app tab.'));
  });
  if(!db.objectStoreNames.contains('photos')){db.close();return {}}
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction('photos','readonly'),store=tx.objectStore('photos');
   const keysReq=store.getAllKeys(),valuesReq=store.getAll();
   let keys=[],values=[];
   keysReq.onsuccess=()=>keys=keysReq.result||[];
   valuesReq.onsuccess=()=>values=valuesReq.result||[];
   tx.oncomplete=()=>{
    const out={};
    keys.forEach((key,index)=>{const value=values[index];if(typeof value==='string'&&value)out[String(key)]=value});
    db.close();resolve(out);
   };
   tx.onerror=()=>{db.close();reject(tx.error||new Error('Could not read the older picture store.'))};
   tx.onabort=()=>{db.close();reject(tx.error||new Error('Reading the older picture store was interrupted.'))};
  });
 }catch(error){
  // Do not block access to recipes if the legacy database is unavailable.
  console.warn('Older recipe photo migration was skipped:',error);
  return {};
 }
}
async function migrateAndLoadRecipePhotos(){
 try{
  // Ask the browser to preserve this origin's storage before touching photo data.
  await requestPersistentStorage();
  // IndexedDB is the primary photo store. Read it first so an old localStorage
  // copy can never overwrite a newer picture saved in IndexedDB.
  let photos=await readRecipePhotos();
  // Recover pictures saved by the previous database name before this build.
  const legacyPhotos=await readLegacyRecipePhotos();
  for(const [key,data] of Object.entries(legacyPhotos)){
   if(!photos[key]){
    await storeRecipePhoto(key,data);
    photos[key]=data;
   }
  }
  // Migrate legacy inline photos only where no IndexedDB copy exists yet.
  for(const r of recipes){
   const key=String(r.id);
   if(r.photo&&!photos[key]){
    await storeRecipePhoto(key,r.photo);
    photos[key]=r.photo;
   }
  }
  recipes=recipes.map(r=>({...r,photo:photos[String(r.id)]||r.photo||''}));
  if(!save())say('Recipe details could not be refreshed after loading pictures. Your existing data has been left untouched.',true);
 }catch(e){
  say('Picture storage could not be initialized: '+(e.message||'unknown error')+'. Your recipe details are still available; make a backup before clearing browser data.',true);
 }finally{
  render();
 }
}
function save(){try{const compact=recipes.map(r=>{const x={...r};delete x.photo;return x});localStorage.setItem(K,JSON.stringify(compact));localStorage.setItem(CK,JSON.stringify(cats));localStorage.setItem(SK,$('shopText').value);scheduleDriveAutoSync();scheduleFileAutoSave();return true}catch(e){say('Could not save recipe details. Device storage may be full.',true);return false}}
function load(){ensureSectionCategoryDefaults();let saved=parse(localStorage.getItem(K),[]);const preview=window.__MRB_PREVIEW_BACKUP__;if((!Array.isArray(saved)||!saved.length)&&preview&&Array.isArray(preview.recipes)&&preview.recipes.length){recipes=preview.recipes.map(norm);try{if(!localStorage.getItem(CK))localStorage.setItem(CK,JSON.stringify(preview.categories||[]));if(!localStorage.getItem(DRK))localStorage.setItem(DRK,JSON.stringify(preview.deletedRecipeIds||[]));}catch(e){}}else{recipes=Array.isArray(saved)?saved:[]}recipes=recipes.map(norm).map(r=>({...r,section:recipeSection(r)}));let deleted=parse(localStorage.getItem(DK),[]);if(!Array.isArray(deleted))deleted=[];const sectionCats=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});cats=[...new Set(['All recipes','Favorites',...Object.values(sectionCats||{}).flat().filter(Boolean)])];$('shopText').value=localStorage.getItem(SK)||''}
function recipeSection(r){if(r&&['Baking','Smoking / Curing','Brewing'].includes(r.section))return r.section;const text=[r.title,r.description,...(r.categories||[])].join(' ').toLowerCase();if(/\b(mead|wine|cider|beer|homebrew|home brew|brewing|ferment(?:ation)? vessel|must|wort|abv|liqueur)\b/.test(text))return 'Brewing';if(/\b(smok(?:e|ed|ing)|cur(?:e|ed|ing)|charcuterie|jerky|bacon|ham|pastrami|salami|sausage|brine cure|dry cure)\b/.test(text))return 'Smoking / Curing';return 'Baking'}function matches(r){let q=$('search').value.toLowerCase().trim();return(!currentSection||recipeSection(r)===currentSection)&&(active==='All recipes'||active==='Favorites'&&r.favorite||categoryHasRecipe(r,active))&&(!q||[r.title,r.description,r.categories.join(' '),r.yield,r.times,r.ingredients,r.directions,r.nutrition,r.notes,r.videoLink,r.websiteLink].join(' ').toLowerCase().includes(q))}
function categoryOptions(name){if(['All recipes','Favorites','Favorite'].includes(name)){say('This built-in category cannot be edited or deleted.');return}const choice=prompt('Hidden category options for "'+name+'":\nType R to rename, or D to delete.\nCancel to keep the category.');if(choice===null)return;const action=choice.trim().toLowerCase();if(action==='r'||action==='rename')renameCategory(name);else if(action==='d'||action==='delete')deleteCategory(name);else say('No category changes made.')}
function orderedVisibleRecipes(){let list=recipes.filter(matches),sort=$('sort').value;list.sort((a,b)=>sort==='az'?a.title.localeCompare(b.title):sort==='old'?a.createdAt-b.createdAt:b.updatedAt-a.updatedAt);return list}
function getDeletedRecipeIds(){let v=parse(localStorage.getItem(DRK),[]);return Array.isArray(v)?[...new Set(v.map(String))]:[]}
function saveDeletedRecipeIds(ids){try{localStorage.setItem(DRK,JSON.stringify([...new Set(ids.map(String))]));return true}catch(e){say('Could not save the deleted-recipe record. The recipe may return after syncing.',true);return false}}
async function deleteRecipeFromCard(recipeId){
 let r=recipes.find(x=>x.id===recipeId);
 if(!r)return;
 if(!confirm('Delete "'+r.title+'"? This cannot be undone unless you have a backup.'))return;
 if(!await authorizeDestructiveAction())return;
 const deleted=getDeletedRecipeIds();deleted.push(String(recipeId));
 if(!saveDeletedRecipeIds(deleted))return;
 recipes=recipes.filter(x=>String(x.id)!==String(recipeId));
 if(save()){render();say('Recipe deleted. It will not be restored by Google Drive sync.');}
}
function addRecipeLongPress(el,recipeId){
 let holdTimer=null,suppressClick=false,startX=0,startY=0;
 const cancel=()=>{if(holdTimer){clearTimeout(holdTimer);holdTimer=null}};
 const start=(e)=>{
  if(e.target && e.target.closest('button,a,input,select,textarea,label'))return;
  if(e.type==='touchstart' && e.touches && e.touches.length!==1)return;
  suppressClick=false;
  const point=e.touches?e.touches[0]:e;
  startX=point.clientX;startY=point.clientY;
  cancel();
  holdTimer=setTimeout(()=>{holdTimer=null;suppressClick=true;deleteRecipeFromCard(recipeId);},700);
 };
 el.addEventListener('touchstart',start,{passive:true});
 el.addEventListener('touchmove',e=>{
  if(!holdTimer)return;
  const t=e.touches&&e.touches[0];
  if(!t||Math.abs(t.clientX-startX)>12||Math.abs(t.clientY-startY)>12)cancel();
 },{passive:true});
 ['touchend','touchcancel','pointerleave'].forEach(ev=>el.addEventListener(ev,cancel,{passive:true}));
 el.addEventListener('contextmenu',e=>{
  if(e.target && e.target.closest('button,a,input,select,textarea,label'))return;
  e.preventDefault();suppressClick=true;deleteRecipeFromCard(recipeId);
 });
 el.addEventListener('click',e=>{
  if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}
 },true);
 el.title='Tap to open. Press and hold to delete.';
}
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
  const escaped=title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  text=text.replace(new RegExp(escaped,'gi'),' ').replace(/\s+/g,' ').trim();
 }
 return text;
}
function render(){let list=orderedVisibleRecipes();$('listTitle').textContent=(currentSection?currentSection+' · ':'')+active;$('cats').innerHTML='';let savedCatOrder=parse(localStorage.getItem(CAT_ORDER_KEY),[]);if(!Array.isArray(savedCatOrder))savedCatOrder=[];let sectionCustomCats=getSectionCustomCategories(currentSection);let userCats=sectionCustomCats.filter(c=>!['All recipes','Favorites'].includes(c));userCats.sort((a,b)=>{let ai=savedCatOrder.indexOf(a),bi=savedCatOrder.indexOf(b);return (ai<0?9999:ai)-(bi<0?9999:bi)});['All recipes','Favorites',...userCats].forEach((c,catIndex)=>{let row=document.createElement('div');row.className='catrow';let b=document.createElement('button');b.className='cat'+(c===active?' active':'');let sectionRecipes=recipes.filter(r=>!currentSection||recipeSection(r)===currentSection);let count=c==='All recipes'?sectionRecipes.length:c==='Favorites'?sectionRecipes.filter(r=>r.favorite).length:sectionRecipes.filter(r=>categoryHasRecipe(r,c)).length;b.innerHTML=`<span>${c==='Favorites'?'⭐ ':''}${esc(c)}</span><span>${count}</span>`;b.onclick=()=>{active=c;render();setCategoriesCollapsed(true)};row.append(b);if(!['All recipes','Favorites'].includes(c)){b.title='Tap to open. Press and hold to show Rename and Delete';b.setAttribute('aria-label',c+'. Tap to open; press and hold to rename or delete');let holdTimer=null,holdFired=false,suppressClick=false;const clearCategoryHold=()=>{if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null}};b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;holdFired=false;clearCategoryHold();holdTimer=setTimeout(()=>{holdTimer=null;holdFired=true;suppressClick=true;row.classList.add('cat-options-visible');},600)});b.addEventListener('pointerup',clearCategoryHold);b.addEventListener('pointercancel',clearCategoryHold);b.addEventListener('pointerleave',clearCategoryHold);b.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;holdFired=false}},true);b.addEventListener('contextmenu',e=>{e.preventDefault();clearCategoryHold();row.classList.add('cat-options-visible')});}if(!['All recipes','Favorites'].includes(c)){row.draggable=!(('ontouchstart' in window)||navigator.maxTouchPoints>0);row.dataset.category=c;row.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',c);e.dataTransfer.effectAllowed='move';row.classList.add('cat-dragging')});row.addEventListener('dragend',()=>{row.classList.remove('cat-dragging');const order=[...$('cats').querySelectorAll('.catrow[data-category]')].map(x=>x.dataset.category);localStorage.setItem(CAT_ORDER_KEY,JSON.stringify(order))});row.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'});row.addEventListener('drop',e=>{e.preventDefault();let from=e.dataTransfer.getData('text/plain');if(!from||from===c)return;let dragged=$('cats').querySelector('[data-category="'+CSS.escape(from)+'"]');if(!dragged)return;const box=row.getBoundingClientRect();row.parentNode.insertBefore(dragged,e.clientY<box.top+box.height/2?row:row.nextSibling);const order=[...$('cats').querySelectorAll('.catrow[data-category]')].map(x=>x.dataset.category);localStorage.setItem(CAT_ORDER_KEY,JSON.stringify(order));render()});let edit=document.createElement('button');edit.type='button';edit.className='cattool cat-longpress-rename';edit.textContent='✏️';edit.title='Rename category';edit.setAttribute('aria-label','Rename category '+c);edit.onclick=e=>{e.stopPropagation();renameCategory(c)};let del=document.createElement('button');del.type='button';del.className='cattool catdelete cat-longpress-delete';del.textContent='🗑';del.title='Delete category';del.setAttribute('aria-label','Delete category '+c);del.onclick=e=>{e.stopPropagation();deleteCategory(c)};row.append(edit,del)}$('cats').append(row)});$('cards').innerHTML='';list.forEach(r=>{let el=document.createElement('article');el.className='card';el.style.cursor='pointer';el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label','Open recipe: '+r.title);addRecipeLongPress(el,r.id);el.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label'))return;view(r.id)});el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===el){e.preventDefault();view(r.id)}});if(r.photo){let im=document.createElement('img');im.src=r.photo;im.alt='View recipe: '+r.title;im.style.cursor='pointer';im.title='Tap to view recipe';im.setAttribute('role','button');im.tabIndex=0;im.addEventListener('click',()=>view(r.id));im.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();view(r.id)}});el.append(im)}let b=document.createElement('div');b.className='body';b.innerHTML=`<div class="recipe-card-heading"><h3>${r.favorite?'⭐ ':''}${esc(r.title)}</h3></div>${cleanRecipeCardDescription(r.description,r.title)?`<div class="muted recipe-card-description">${esc(cleanRecipeCardDescription(r.description,r.title).slice(0,170))}</div>`:''}<div class="pills">${r.categories.map(c=>`<span class="pill">${esc(c)}</span>`).join('')}</div>${r.yield?`<div class="muted">${esc(r.yield)}</div>`:''}<div class="actions"><button data-view="${esc(r.id)}">Open recipe</button><button class="alt" data-edit="${esc(r.id)}">Edit</button><button class="alt" data-fav="${esc(r.id)}">${r.favorite?'★':'☆'}</button></div>`;el.append(b);$('cards').append(el)});$('empty').classList.toggle('hidden',!!list.length)}
try{localStorage.setItem('recipeCategoryViewMode','tiles')}catch{}
const categoryViewMode='tiles';
const renderRecipeCards=render;
function categoryViewEscape(value){const d=document.createElement('div');d.textContent=String(value??'');return d.innerHTML}
function renderCategoryTiles(){
 const host=$('cards');
 const tiles=document.createElement('nav');tiles.className='category-tiles';tiles.setAttribute('aria-label','Recipe categories');
 const order=getSectionCategoryOrder(currentSection);
 const names=getSectionCustomCategories(currentSection).filter(c=>!['All recipes','Favorites'].includes(c)).sort((a,b)=>{const ai=order.indexOf(a),bi=order.indexOf(b);return(ai<0?9999:ai)-(bi<0?9999:bi)});
 const roots=names.filter(name=>!name.includes(SUBCAT_SEP));
 const makeCategory=(name,depth=0)=>{
  const children=names.filter(x=>x.startsWith(name+SUBCAT_SEP)&&x.slice(name.length+SUBCAT_SEP.length).indexOf(SUBCAT_SEP)<0);
  const wrap=document.createElement('div');wrap.className='category-dropdown-item'+(depth?' category-subitem':'');
  const line=document.createElement('div');line.className='category-dropdown-line';
  const choose=document.createElement('button');choose.type='button';choose.className='category-tile'+(active===name?' active':'');
  const count=recipes.filter(r=>(!currentSection||recipeSection(r)===currentSection)&&categoryHasRecipe(r,name)).length;
  const label=name.split(SUBCAT_SEP).pop();
  choose.innerHTML='<strong>'+categoryViewEscape(label)+'</strong><span>('+count+')</span>';
  choose.title='Show recipes in '+name.replaceAll(SUBCAT_SEP,' › ');
  choose.addEventListener('click',()=>{active=name;render()});line.appendChild(choose);
  if(children.length){
   const toggle=document.createElement('button');toggle.type='button';toggle.className='category-dropdown-toggle';toggle.textContent='▾';toggle.setAttribute('aria-label','Show subcategories of '+label);toggle.setAttribute('aria-expanded','false');
   const menu=document.createElement('div');menu.className='category-subcategory-menu hidden';
   children.forEach(child=>menu.appendChild(makeCategory(child,depth+1)));
   toggle.addEventListener('click',()=>{const opening=menu.classList.contains('hidden');if(opening){tiles.querySelectorAll('.category-subcategory-menu').forEach(other=>{other.classList.add('hidden');const otherWrap=other.closest('.category-dropdown-item');if(otherWrap)otherWrap.classList.remove('category-menu-open');const otherToggle=other.parentElement.querySelector(':scope > .category-dropdown-line > .category-dropdown-toggle');if(otherToggle){otherToggle.textContent='▾';otherToggle.setAttribute('aria-expanded','false')}})}menu.classList.toggle('hidden',!opening);wrap.classList.toggle('category-menu-open',opening);toggle.textContent=opening?'▴':'▾';toggle.setAttribute('aria-expanded',String(opening))});
   line.appendChild(toggle);wrap.append(line,menu);
  }else wrap.appendChild(line);
  return wrap;
 };
 const sectionRecipes=recipes.filter(r=>!currentSection||recipeSection(r)===currentSection);
 const special=[{name:'All recipes',count:sectionRecipes.length},{name:'Favorites',count:sectionRecipes.filter(r=>r.favorite).length}];
 special.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='category-tile'+(active===item.name?' active':'');b.innerHTML='<strong>'+item.name+'</strong><span>('+item.count+')</span>';b.addEventListener('click',()=>{active=item.name;render()});tiles.appendChild(b)});
 roots.forEach(name=>tiles.appendChild(makeCategory(name)));
 host.insertAdjacentElement('beforebegin',tiles);
}
function renderCategoryAccordion(){
 const host=$('cards');
 const groupHost=document.createElement('div');groupHost.className='category-accordion';
 const visible=orderedVisibleRecipes();
 const order=getSectionCategoryOrder(currentSection);
 const names=getSectionCustomCategories(currentSection).filter(c=>!['All recipes','Favorites'].includes(c)).sort((a,b)=>{const ai=order.indexOf(a),bi=order.indexOf(b);return(ai<0?9999:ai)-(bi<0?9999:bi)});
 const groups=[...names.map(name=>({name,items:visible.filter(r=>r.categories.includes(name)),removable:true}))];
 const uncategorized=visible.filter(r=>!r.categories.length);
 if(uncategorized.length)groups.push({name:'Uncategorized',items:uncategorized,removable:false});
 groups.forEach(group=>{
  const details=document.createElement('details');
  const summary=document.createElement('summary');
  const title=document.createElement('span');title.textContent=group.name;
  const right=document.createElement('span');right.className='accordion-heading-actions';
  const count=document.createElement('span');count.className='help';count.textContent=group.items.length+' recipe'+(group.items.length===1?'':'s');right.appendChild(count);
  summary.append(title,right);details.appendChild(summary);
  if(group.removable){
   summary.title='Press and hold to rename or delete this category';
   summary.setAttribute('aria-label',group.name+'. Press and hold to show category actions');
   const actions=document.createElement('span');actions.className='accordion-category-actions';
   const rename=document.createElement('button');rename.type='button';rename.textContent='✏️ Rename';rename.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();renameCategory(group.name)});
   const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='🗑 Delete';remove.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();deleteCategory(group.name)});
   actions.append(rename,remove);right.appendChild(actions);
   let holdTimer=null,holdTriggered=false,startX=0,startY=0;
   const cancelHold=()=>{if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null}};
   summary.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;holdTriggered=false;startX=e.clientX;startY=e.clientY;cancelHold();holdTimer=setTimeout(()=>{holdTimer=null;holdTriggered=true;details.classList.add('category-actions-visible');details.open=true},650)});
   summary.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-startX)>12||Math.abs(e.clientY-startY)>12)cancelHold()});
   ['pointerup','pointerleave','pointercancel'].forEach(ev=>summary.addEventListener(ev,cancelHold));
   summary.addEventListener('click',e=>{if(holdTriggered){e.preventDefault();e.stopPropagation();holdTriggered=false}});
   summary.addEventListener('contextmenu',e=>{e.preventDefault();cancelHold();details.classList.add('category-actions-visible');details.open=true});
  }
  const inner=document.createElement('div');inner.className='accordion-recipes';
  if(group.items.length){const grid=document.createElement('div');grid.className='cards';group.items.forEach(r=>{const source=[...host.querySelectorAll('.card')].find(card=>card.querySelector('[data-view]')?.dataset.view===String(r.id));if(source){const clone=source.cloneNode(true);clone.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label'))return;view(r.id)});grid.appendChild(clone)}});inner.appendChild(grid)}
  else{const empty=document.createElement('p');empty.className='help accordion-empty';empty.textContent='No recipes in this category yet.';inner.appendChild(empty)}
  details.appendChild(inner);groupHost.appendChild(details);
 });
 const manage=document.createElement('section');manage.className='accordion-category-manager';
 const heading=document.createElement('strong');heading.textContent='Manage categories';manage.appendChild(heading);
 const row=document.createElement('div');row.className='accordion-add-row';
 const input=document.createElement('input');input.type='text';input.id='accordionNewCategory';input.placeholder='New category name';input.setAttribute('aria-label','New category name');
 const add=document.createElement('button');add.type='button';add.textContent='Add category';
 add.addEventListener('click',()=>addCategoryByName(input.value,'accordionNewCategory'));
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add.click()}});
 row.append(input,add);manage.appendChild(row);
 const note=document.createElement('p');note.className='help';note.textContent='Press and hold a category heading to show Rename and Delete. Choose Delete to confirm; recipes are kept and moved to Uncategorized if they have no other categories.';manage.appendChild(note);
 groupHost.appendChild(manage);
 host.insertAdjacentElement('beforebegin',groupHost);host.classList.add('hidden');
}
render=function(){const searchHost=$('categorySearchHost');const search=$('search');if(search.parentElement!==searchHost)searchHost.appendChild(search);$('categoriesDropdown').style.display='none';$('sort').style.display='none';$('recipesPage').querySelectorAll('.category-tiles,.category-accordion,.accordion-category-manager').forEach(el=>el.remove());renderRecipeCards();$('cards').classList.remove('hidden');renderCategoryTiles()};
function renderCategoryPicker(){const picker=$('categoryPicker');const sectionCats=getSectionCustomCategories(currentSection);picker.innerHTML='<option value="">Choose category…</option>'+sectionCats.filter(c=>!['All recipes','Favorites'].includes(c)).map(c=>`<option value="${esc(c)}">${esc(c.replaceAll(SUBCAT_SEP,' › '))}</option>`).join('');$('category').value=selectedRecipeCategories.join(', ');$('selectedRecipeCategories').innerHTML=selectedRecipeCategories.map(c=>`<span class="pill">${esc(c)} <button type="button" data-remove-recipe-category="${esc(c)}" aria-label="Remove ${esc(c)}" style="padding:0 4px;background:transparent;color:inherit">×</button></span>`).join('')}
function setRecipeCategories(values){selectedRecipeCategories=[...new Set((values||[]).map(c=>String(c).trim()).filter(c=>c&&!['All recipes','Favorites'].includes(c)))];renderCategoryPicker()}
function reset(){ $('form').reset();$('rid').value='';photoData='';selectedRecipeCategories=[];pendingPdfImages=[];$('pdfImageChoices').classList.add('hidden');$('pdfImageGrid').innerHTML='';renderCategoryPicker();$('photoHint').textContent='';if($('recipeSaveStatus'))$('recipeSaveStatus').textContent='';recipeSaveBusy=false;if($('saveRecipeBtn')){$('saveRecipeBtn').disabled=false;$('saveRecipeBtn').textContent='Save recipe'}}
function showPdfImageChoices(images){
 const wrap=$('pdfImageChoices'),grid=$('pdfImageGrid');grid.innerHTML='';if(!images?.length){wrap.classList.add('hidden');return}
 wrap.classList.remove('hidden');images.forEach((src,i)=>{const b=document.createElement('button');b.type='button';b.className='alt';b.style.cssText='padding:5px;border:2px solid '+(photoData===src?'var(--g)':'var(--line)')+';background:#fff;color:var(--ink);min-width:0';b.setAttribute('aria-label','Use PDF picture '+(i+1));const im=document.createElement('img');im.src=src;im.alt='PDF picture '+(i+1);im.style.cssText='display:block;width:100%;height:82px;object-fit:contain;background:#f7f7f4;border-radius:5px';const cap=document.createElement('span');cap.textContent=(photoData===src?'✓ Selected':'Use picture '+(i+1));cap.style.cssText='display:block;font-size:.75rem;margin-top:4px';b.append(im,cap);b.onclick=()=>{photoData=src;showPdfImageChoices(images);$('photoHint').textContent='PDF picture selected. It will be saved with this recipe.'};grid.append(b)});
}
function edit(rid=null,seed=null){reset();let r=recipes.find(x=>x.id===rid);$('editorTitle').textContent=r?'Edit recipe':seed?'Review imported recipe':'Add recipe';if(r){for(let k of ['title','description','yield','times','ingredients','directions','nutrition','notes','videoLink','websiteLink'])$(k).value=r[k]||'';setRecipeCategories(r.categories);$('favorite').checked=r.favorite;$('scalable').checked=r.scalable!==false;photoData=r.photo;$('photoHint').textContent=photoData?'Existing photo kept unless replaced.':'';$('rid').value=r.id}else if(seed){for(let k of ['title','description','yield','times','ingredients','directions','nutrition','notes','videoLink','websiteLink'])$(k).value=seed[k]||'';setRecipeCategories(seed.categories||[]);$('favorite').checked=!!seed.favorite;$('scalable').checked=seed.scalable!==false;pendingPdfImages=seed.pdfImages||[];photoData=seed.photo||pendingPdfImages[0]||'';$('photoHint').textContent=pendingPdfImages.length?'Automatically selected a picture from the PDF. You can change it below.':'Review the ingredient and direction order before saving.';showPdfImageChoices(pendingPdfImages)}else setRecipeCategories(!['All recipes','Favorites'].includes(active)?[active]:[]);renderCategoryPicker();open('editor')}
let recipeSaveBusy=false;
$('form').onsubmit=async e=>{
 e.preventDefault();
 if(recipeSaveBusy)return;
 const status=$('recipeSaveStatus'),button=$('saveRecipeBtn');
 const old=recipes.find(x=>x.id===$('rid').value);
 const now=Date.now();
 const videoLink=normalizeRecipeLink($('videoLink').value),websiteLink=normalizeRecipeLink($('websiteLink').value);
 if($('videoLink').value.trim()&&!videoLink){say('Enter a valid video link beginning with http:// or https://.',true);$('videoLink').focus();return;}
 if($('websiteLink').value.trim()&&!websiteLink){say('Enter a valid website link beginning with http:// or https://.',true);$('websiteLink').focus();return;}
 const r={id:old?.id||id(),section:old?.section||currentSection||'Baking',title:$('title').value.trim(),description:$('description').value.trim(),categories:[...new Set(selectedRecipeCategories)],yield:$('yield').value.trim(),times:$('times').value.trim(),ingredients:$('ingredients').value.trim(),directions:$('directions').value.trim(),nutrition:$('nutrition').value.trim(),notes:$('notes').value.trim(),videoLink,websiteLink,favorite:$('favorite').checked,scalable:$('scalable').checked,photo:photoData||old?.photo||'',createdAt:old?.createdAt||now,updatedAt:now};
 if(!r.title){say('Please enter a recipe name.',true);$('title').focus();return;}
 recipeSaveBusy=true;button.disabled=true;button.textContent='Saving…';status.textContent='Saving recipe and photo…';
 const beforeRecipes=recipes,beforeCats=cats;
 try{
  if(photoData)await storeRecipePhoto(r.id,photoData);
  recipes=old?recipes.map(x=>x.id===r.id?r:x):[r,...recipes];
  cats=[...cats];r.categories.forEach(c=>{if(!cats.includes(c))cats.push(c)});
  if(!save())throw new Error('The recipe could not be saved. Your existing recipes have been kept. Try a smaller picture or make a backup and free some storage.');
  status.textContent='Recipe saved successfully.';
  close('editor');active='All recipes';render();say(old?'Recipe updated.':'Recipe saved.');
 }catch(err){recipes=beforeRecipes;cats=beforeCats;status.textContent=err.message||'Could not save this recipe. Please try again.';say(status.textContent,true);}
 finally{recipeSaveBusy=false;button.disabled=false;button.textContent='Save recipe';}
};
$('addCategoryToRecipe').onclick=()=>{const c=$('categoryPicker').value;if(!c){say('Choose a category from the list first.',true);return}if(!selectedRecipeCategories.includes(c))selectedRecipeCategories.push(c);renderCategoryPicker();$('categoryPicker').value='';};
$('createCategoryForRecipe').onclick=()=>{
 const section=currentSection||'Baking';
 const answer=prompt('Enter a new category for '+section+':');
 if(answer===null)return;
 const name=answer.trim();
 if(!name){say('Enter a category name first.',true);return;}
 if(['All recipes','Favorites','Uncategorized'].includes(name)){say('That category name is reserved.',true);return;}
 const all=parse(localStorage.getItem(SECTION_CATS_BY_SECTION_KEY),{});
 const list=Array.isArray(all[section])?all[section]:[];
 const existing=list.find(c=>String(c).toLocaleLowerCase()===name.toLocaleLowerCase());
 if(existing){if(!selectedRecipeCategories.includes(existing))selectedRecipeCategories.push(existing);renderCategoryPicker();$('recipeSaveStatus').textContent='That category already exists and has been selected.';return;}
 all[section]=[...list,name];
 try{localStorage.setItem(SECTION_CATS_BY_SECTION_KEY,JSON.stringify(all));}
 catch(e){say('Could not save the new category. Check available device storage.',true);return;}
 cats=[...new Set([...cats,name])];
 if(!save()){all[section]=list;try{localStorage.setItem(SECTION_CATS_BY_SECTION_KEY,JSON.stringify(all));}catch(e){}cats=cats.filter(c=>c!==name);say('Could not save the new category. Please try again.',true);return;}
 if(!selectedRecipeCategories.includes(name))selectedRecipeCategories.push(name);
 renderCategoryPicker();
 $('recipeSaveStatus').textContent='New category “'+name+'” created for '+section+' and selected for this recipe. Save the recipe to finish.';
};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-remove-recipe-category]');if(!b)return;selectedRecipeCategories=selectedRecipeCategories.filter(c=>c!==b.dataset.removeRecipeCategory);renderCategoryPicker()});
$('photo').onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 const input=$('photo'),hint=$('photoHint');input.disabled=true;hint.textContent='Preparing picture…';
 let objectUrl='';
 try{
  if(!f.type.startsWith('image/'))throw new Error('Please choose an image file.');
  if(f.size>25*1024*1024)throw new Error('That picture is very large (over 25 MB). Please choose a smaller photo.');
  // Decode from a temporary object URL rather than reading the full original
  // into a second, large base64 string. This is gentler on Android memory.
  objectUrl=URL.createObjectURL(f);
  const im=new Image();im.decoding='async';im.src=objectUrl;
  if(im.decode)await im.decode();else await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject});
  if(!im.naturalWidth||!im.naturalHeight)throw new Error('The selected picture could not be opened.');
  let scale=Math.min(1,850/Math.max(im.naturalWidth,im.naturalHeight));
  let cv=document.createElement('canvas'),ctx=cv.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Picture processing is unavailable on this device.');
  let data='';
  // Keep stored recipe photos small enough for phones and local browser storage.
  for(let attempt=0;attempt<5;attempt++){
   cv.width=Math.max(1,Math.round(im.naturalWidth*scale));
   cv.height=Math.max(1,Math.round(im.naturalHeight*scale));
   ctx.drawImage(im,0,0,cv.width,cv.height);
   data=cv.toDataURL('image/jpeg',attempt<2?.68:.55);
   if(data.length<=420000)break;
   scale*=.78;
  }
  if(!data||data.length>600000)throw new Error('That picture is still too large after resizing. Please choose a smaller photo.');
  photoData=data;hint.textContent='Photo ready ('+Math.round(data.length/1024)+' KB).';
  cv.width=1;cv.height=1;
 }catch(err){
  input.value='';hint.textContent='';say(err.message||'Could not load that photo. Try a smaller picture.',true);
 }finally{
  if(objectUrl)URL.revokeObjectURL(objectUrl);
  input.disabled=false;
 }
};
function section(t,v){return v?`<h3>${t}</h3><pre>${esc(v)}</pre>`:''}
const fractionValues=[['⅛',1/8],['⅙',1/6],['⅕',1/5],['¼',1/4],['⅓',1/3],['⅜',3/8],['⅖',2/5],['½',1/2],['⅗',3/5],['⅝',5/8],['⅔',2/3],['¾',3/4],['⅘',4/5],['⅚',5/6],['⅞',7/8]];
const unicodeFractions={'⅛':1/8,'⅙':1/6,'⅕':1/5,'¼':1/4,'⅓':1/3,'⅜':3/8,'⅖':2/5,'½':1/2,'⅗':3/5,'⅝':5/8,'⅔':2/3,'¾':3/4,'⅘':4/5,'⅚':5/6,'⅞':7/8};
function amountNumber(raw){const x=String(raw||'').trim();if(!x)return null;if(unicodeFractions[x]!=null)return unicodeFractions[x];let m=x.match(/^(\d+)\s*([½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘])$/);if(m)return Number(m[1])+unicodeFractions[m[2]];if(/^\d+\s+\d+\/\d+$/.test(x)){let a=x.split(/\s+/);let f=a[1].split('/');return Number(a[0])+Number(f[0])/Number(f[1])}if(/^\d+\/\d+$/.test(x)){let a=x.split('/');return Number(a[0])/Number(a[1])}let n=Number(x);return Number.isFinite(n)?n:null}
function readLeadingAmount(line){const m=line.match(/^\s*(?:(?:[-*•▪‣]+)\s*)?((?:\d+\s+\d+\/\d+|\d+\s*[½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘]|\d+\/\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘]))(?=\s|$)/);if(!m)return null;const raw=m[1],start=m.index+m[0].lastIndexOf(raw);return{raw,value:amountNumber(raw),start,end:start+raw.length}}
function formatAmount(n){if(!Number.isFinite(n)||n<0)return String(n);let whole=Math.floor(n+1e-8),frac=n-whole;if(frac<.0125)return String(whole);let best=fractionValues.reduce((a,b)=>Math.abs(b[1]-frac)<Math.abs(a[1]-frac)?b:a);if(Math.abs(best[1]-frac)<.025){if(whole===0)return best[0];return whole+' '+best[0]}return String(Math.round(n*100)/100).replace(/\.0$/,'')}
function scaleIngredientLine(line,factor){const a=readLeadingAmount(line);if(!a||a.value==null)return line;const value=formatAmount(a.value*factor);return line.slice(0,a.start)+value+line.slice(a.end)}
function updateScaledIngredients(){const original=Number($('scaleOriginal')?.value),target=Number($('scaleTarget')?.value),out=$('scaledIngredients'),r=recipes.find(x=>x.id===detailId);if(!out||!r)return;if(!(original>0)||!(target>0)){out.textContent='Enter positive numbers for both amounts.';return}const factor=target/original;out.textContent=(r.ingredients||'').split('\n').map(line=>scaleIngredientLine(line,factor)).join('\n');const factorLabel=$('scaleFactor');if(factorLabel)factorLabel.textContent='Scaling factor: '+formatAmount(factor)+'×';}
let recipeZoom=100;function setRecipeZoom(value){recipeZoom=Math.max(80,Math.min(160,Math.round(value/10)*10));$('detail').style.fontSize=recipeZoom+'%';$('zoomLevel').textContent=recipeZoom+'%';$('zoomOutBtn').disabled=recipeZoom<=80;$('zoomInBtn').disabled=recipeZoom>=160;}
$('zoomOutBtn').onclick=()=>setRecipeZoom(recipeZoom-10);$('zoomInBtn').onclick=()=>setRecipeZoom(recipeZoom+10);
// Per-recipe timer behavior is maintained in timers.js.
function initRecipeBakingTimer(){ timerManager.initRecipeBakingTimer(); }


function initSugarNutritionChecker(){
 const search=$('sugarFoodSearch'),list=$('sugarFoodOptions');
 if(!search||search.dataset.ready==='1')return;
 search.dataset.ready='1';
 const foods=[
 ['Apple',52,10.4,13.8,0.3,0.2,2.4],['Apple, with skin',52,10.4,13.8,0.3,0.2,2.4],['Banana',89,12.2,22.8,1.1,0.3,2.6],['Orange',47,9.4,11.8,0.9,0.1,2.4],['Grapes',69,15.5,18.1,0.7,0.2,0.9],['Blueberries',57,10.0,14.5,0.7,0.3,2.4],['Strawberries',32,4.9,7.7,0.7,0.3,2.0],['Raspberries',52,4.4,11.9,1.2,0.7,6.5],['Blackberries',43,4.9,9.6,1.4,0.5,5.3],['Cherries, sweet',63,12.8,16.0,1.1,0.2,2.1],['Peach',39,8.4,9.5,0.9,0.3,1.5],['Pear',57,9.8,15.2,0.4,0.1,3.1],['Pineapple',50,9.9,13.1,0.5,0.1,1.4],['Watermelon',30,6.2,7.6,0.6,0.2,0.4],['Mango',60,13.7,15.0,0.8,0.4,1.6],['Lemon juice',22,2.5,6.9,0.4,0.2,0.3],['Avocado',160,0.7,8.5,2.0,14.7,6.7],
 ['Carrot',41,4.7,9.6,0.9,0.2,2.8],['Tomato',18,2.6,3.9,0.9,0.2,1.2],['Onion',40,4.2,9.3,1.1,0.1,1.7],['Potato',77,0.8,17.5,2.0,0.1,2.2],['Sweet potato',86,4.2,20.1,1.6,0.1,3.0],['Corn, sweet',86,6.3,18.7,3.3,1.4,2.0],['Broccoli',34,1.7,6.6,2.8,0.4,2.6],['Cucumber',15,1.7,3.6,0.7,0.1,0.5],['Bell pepper, red',31,4.2,6.0,1.0,0.3,2.1],
 ['Whole milk',61,5.1,4.8,3.2,3.3,0],['2% milk',50,5.0,4.8,3.3,2.0,0],['Skim milk',34,5.0,5.0,3.4,0.1,0],['Plain Greek yogurt',97,4.0,3.9,9.0,5.0,0],['Plain yogurt',61,4.7,4.7,3.5,3.3,0],['Cheddar cheese',403,0.5,1.3,25.0,33.0,0],['Egg, whole',143,0.4,0.7,12.6,9.5,0],
 ['All-purpose flour',364,0.3,76.3,10.3,1.0,2.7],['Bread flour',361,0.3,72.5,12.0,1.5,2.4],['Whole wheat flour',340,0.4,72.6,13.2,2.5,10.7],['Rolled oats',389,0.9,66.3,16.9,6.9,10.6],['White rice, cooked',130,0.1,28.2,2.7,0.3,0.4],['Brown rice, cooked',123,0.2,25.6,2.7,1.0,1.6],['White bread',266,5.0,49.0,8.9,3.2,2.7],['Whole wheat bread',247,5.0,41.0,13.0,4.2,7.0],
 ['Granulated sugar',387,100,100,0,0,0],['Brown sugar',380,97,98.1,0.1,0,0],['Powdered sugar',389,99.8,99.8,0,0,0],['Honey',304,82.1,82.4,0.3,0,0.2],['Maple syrup',260,60.5,67.0,0,0.1,0],['Molasses',290,55.0,74.7,0,0.1,0],['Corn syrup',283,0,76.0,0,0,0],['Jam, strawberry',250,50,65,0.5,0.1,1.0],['Raisins',299,59.2,79.2,3.1,0.5,3.7],['Dates, dried',282,63.4,75.0,2.5,0.4,8.0],['Dried cranberries, sweetened',308,65,82.4,0.1,1.1,5.0],
 ['Butter',717,0.1,0.1,0.9,81.1,0],['Olive oil',884,0,0,0,100,0],['Peanut butter',588,9.2,20.0,25.0,50.0,6.0],['Almonds',579,4.4,21.6,21.2,49.9,12.5],['Walnuts',654,2.6,13.7,15.2,65.2,6.7],['Dark chocolate, 70–85%',598,24,45.9,7.8,42.6,10.9],['Milk chocolate',535,51.5,59.4,7.7,29.7,3.4]
 ];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let custom=[];try{custom=JSON.parse(localStorage.getItem('myRecipeBookCustomSugarFoods')||'[]');if(!Array.isArray(custom))custom=[]}catch{custom=[]}
 const all=()=>[...foods,...custom];
 function refresh(){list.innerHTML=all().map(f=>'<option value="'+esc(f[0])+'"></option>').join('')}
 function find(name){return all().find(f=>String(f[0]).toLowerCase()===String(name).trim().toLowerCase())}
 function clear(){['sugarFoodSugar','sugarFoodCalories','sugarFoodCarbs','sugarFoodProtein','sugarFoodFat','sugarFoodFibre'].forEach(id=>$(id).textContent='—')}
 function calculate(){
  const name=search.value.trim(),food=find(name),amount=Number($('sugarFoodAmount').value),unit=$('sugarFoodUnit').value;
  if(!food){clear();$('sugarFoodStatus').textContent=name?'Food not found. Choose a listed food or add it as a custom food below.':'Search for a food to begin.';return}
  if(!(amount>0)){clear();$('sugarFoodStatus').textContent='Enter an amount greater than zero.';return}
  const grams=amount*(unit==='oz'?28.349523125:unit==='lb'?453.59237:1),factor=grams/100;
  const [label,kcal,sugar,carbs,protein,fat,fibre]=food;
  const fmt=(v,d=1)=>Number(v*factor).toFixed(d).replace(/\.0$/,'');
  $('sugarFoodSugar').textContent=fmt(sugar)+' g';
  $('sugarFoodCalories').textContent=Math.round(kcal*factor)+' kcal';
  $('sugarFoodCarbs').textContent=fmt(carbs)+' g';
  $('sugarFoodProtein').textContent=fmt(protein)+' g';
  $('sugarFoodFat').textContent=fmt(fat)+' g';
  $('sugarFoodFibre').textContent=fmt(fibre)+' g';
  $('sugarFoodStatus').textContent=label+' — calculated for '+fmt(grams)+' g. Values are estimates.';
 }
 function saveCustom(){
  const name=$('customSugarName').value.trim();
  const vals=['customSugarCalories','customSugarValue','customSugarCarbs','customSugarProtein','customSugarFat','customSugarFibre'].map(id=>Number($(id).value));
  if(!name||vals.some((v,i)=>!$(['customSugarCalories','customSugarValue','customSugarCarbs','customSugarProtein','customSugarFat','customSugarFibre'][i]).value.trim()||!Number.isFinite(v)||v<0)){
   $('sugarFoodStatus').textContent='Enter a food name and all six nutrition values per 100 g.';return;
  }
  const [kcal,sugar,carbs,protein,fat,fibre]=vals;
  const item=[name,kcal,sugar,carbs,protein,fat,fibre];
  custom=custom.filter(f=>String(f[0]).toLowerCase()!==name.toLowerCase());custom.push(item);
  try{localStorage.setItem('myRecipeBookCustomSugarFoods',JSON.stringify(custom));refresh();search.value=name;calculate();$('sugarFoodStatus').textContent=name+' saved on this device.';}
  catch{$('sugarFoodStatus').textContent='Could not save this food. Device storage may be full.';}
 }
 refresh();
 $('checkSugarFoodBtn').onclick=calculate;
 $('sugarFoodSearch').addEventListener('change',calculate);
 $('sugarFoodAmount').addEventListener('input',calculate);
 $('sugarFoodUnit').addEventListener('change',calculate);
 $('saveCustomSugarFoodBtn').onclick=saveCustom;
 $('saveSugarFoodBtn').onclick=()=>{$('customSugarName').value=search.value.trim();$('customSugarName').focus();$('sugarNutritionChecker').querySelector('details').open=true;};
}

function initRecipeNutritionCalculator(){
 const rows=$('recipeNutritionRows'),servings=$('nutritionServings'),list=$('nutritionIngredientOptions');if(!rows||!servings||!list)return;
 const baseIngredients=[
  ['All-purpose flour',364,10.3,76.3,1],['Bread flour',361,12.0,72.5,1.5],['Whole wheat flour',340,13.2,72.6,2.5],['Cake flour',362,8.0,78.0,0.9],['00 pizza flour',356,12.0,72.0,1.5],['Durum flour',360,12.7,72.8,1.1],['Rye flour',335,10.9,75.9,1.5],['Oat flour',404,14.7,65.7,9.1],['Cornmeal',370,7.1,79.4,3.9],['Vital wheat gluten',370,75.0,13.0,1.8],
  ['Granulated sugar',387,0,100,0],['Brown sugar',380,0.1,98.1,0],['Powdered sugar',389,0,99.8,0],['Honey',304,0.3,82.4,0],['Maple syrup',260,0,67.0,0.1],['Molasses',290,0,74.7,0.1],
  ['Butter, salted',717,0.9,0.1,81.1],['Butter, unsalted',717,0.9,0.1,81.1],['Olive oil',884,0,0,100],['Vegetable oil',884,0,0,100],['Coconut oil',892,0,0,100],['Shortening',884,0,0,100],
  ['Whole milk',61,3.2,4.8,3.3],['2% milk',50,3.3,4.8,2],['Skim milk',34,3.4,5,0.1],['Heavy cream',340,2.8,2.8,36.1],['Buttermilk',40,3.3,4.8,0.9],['Plain Greek yogurt',97,9,3.9,5],['Sour cream',198,2.4,4.6,19.4],['Cream cheese',342,6.2,4.1,34.4],
  ['Egg, whole',143,12.6,0.7,9.5],['Egg white',52,10.9,0.7,0.2],['Egg yolk',322,15.9,3.6,26.5],['Active dry yeast',325,40.4,41.2,7.6],['Instant yeast',325,40.4,41.2,7.6],['Baking powder',53,0.1,27.7,0],['Baking soda',0,0,0,0],['Table salt',0,0,0,0],['Vanilla extract',288,0.1,12.7,0.1],
  ['Rolled oats',389,16.9,66.3,6.9],['Almond flour',571,21.2,21.6,49.9],['Almonds',579,21.2,21.6,49.9],['Walnuts',654,15.2,13.7,65.2],['Chia seeds',486,16.5,42.1,30.7],['Flaxseed',534,18.3,28.9,42.2],['Sesame seeds',573,17.7,23.4,49.7],['Sunflower seeds',584,20.8,20,51.5],
  ['Raisins',299,3.1,79.2,0.5],['Dried cranberries, sweetened',308,0.1,82.4,1.1],['Chocolate chips, semi-sweet',479,4.2,63.0,23.0],['Cocoa powder, unsweetened',228,19.6,57.9,13.7],['Shredded coconut, unsweetened',660,6.9,23.7,64.5],
  ['Banana',89,1.1,22.8,0.3],['Apple',52,0.3,13.8,0.2],['Blueberries',57,0.7,14.5,0.3],['Strawberries',32,0.7,7.7,0.3],['Pumpkin puree, canned',34,1.1,8.1,0.3],['Potato',77,2,17.5,0.1],['Sweet potato',86,1.6,20.1,0.1],
  ['Cream of tartar',258,0,61.5,0]
 ];
 const key=v=>String(v||'').trim().toLowerCase();
 let custom=[];try{custom=JSON.parse(localStorage.getItem('recipeBookCustomNutritionIngredients')||'[]');if(!Array.isArray(custom))custom=[]}catch{custom=[]}
 const all=()=>[...baseIngredients,...custom];
 const escHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function refreshOptions(){list.innerHTML=all().map(x=>'<option value="'+escHtml(x[0])+'"></option>').join('')}
 refreshOptions();rows.innerHTML='';
 function addRow(){
  const row=document.createElement('div');row.className='recipe-nutrition-row';
  row.innerHTML=`<div class="nutrition-field"><label>Ingredient (type to search)</label><input type="text" list="nutritionIngredientOptions" class="nutrition-name" placeholder="Search flour, butter, egg…" autocomplete="off"></div>
   <div class="nutrition-field"><label>Amount (g)</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-grams" placeholder="g"></div>
   <div class="nutrition-field"><label>Calories/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-kcal" placeholder="kcal"></div>
   <div class="nutrition-field"><label>Protein g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-protein" placeholder="g"></div>
   <div class="nutrition-field"><label>Carbs g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-carbs" placeholder="g"></div>
   <div class="nutrition-field"><label>Fat g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-fat" placeholder="g"></div>`;
  rows.appendChild(row);
  const name=row.querySelector('.nutrition-name');
  name.addEventListener('change',()=>{const found=all().find(x=>key(x[0])===key(name.value));if(found){row.querySelector('.nutrition-kcal').value=found[1];row.querySelector('.nutrition-protein').value=found[2];row.querySelector('.nutrition-carbs').value=found[3];row.querySelector('.nutrition-fat').value=found[4];calculate()} });
  row.querySelectorAll('input').forEach(input=>input.addEventListener('input',calculate));
 }
 function sum(className){return [...rows.querySelectorAll('.recipe-nutrition-row')].reduce((total,row)=>{const grams=Number(row.querySelector('.nutrition-grams').value)||0;const per100=Number(row.querySelector('.'+className).value)||0;return total+grams*per100/100;},0)}
 function fmt(n){return (Math.round(n*10)/10).toLocaleString(undefined,{maximumFractionDigits:1})}
 function calculate(){const calories=sum('nutrition-kcal'),protein=sum('nutrition-protein'),carbs=sum('nutrition-carbs'),fat=sum('nutrition-fat');const count=Math.max(1,Number(servings.value)||1);$('nutritionTotalCalories').textContent=fmt(calories)+' kcal';$('nutritionPerServing').textContent=fmt(calories/count)+' kcal';$('nutritionProtein').textContent=fmt(protein/count)+' g';$('nutritionCarbs').textContent=fmt(carbs/count)+' g';$('nutritionFat').textContent=fmt(fat/count)+' g';$('nutritionCalculatorNote').textContent='Calculated from '+rows.children.length+' ingredient row(s). Values are estimates; verify with product labels for best accuracy.'}
 servings.addEventListener('input',calculate);$('addNutritionIngredient').addEventListener('click',()=>{addRow();calculate()});
 $('saveCustomNutritionIngredient').addEventListener('click',()=>{const row=rows.querySelector('.recipe-nutrition-row:last-child');if(!row){say('Add an ingredient row first.');return}const name=row.querySelector('.nutrition-name').value.trim();const vals=['nutrition-kcal','nutrition-protein','nutrition-carbs','nutrition-fat'].map(c=>row.querySelector('.'+c).value);if(!name||vals.some(v=>v==='')){say('Enter an ingredient name and all four nutrition values before saving.',true);return}const entry=[name,...vals.map(Number)];const idx=custom.findIndex(x=>key(x[0])===key(name));if(idx>=0)custom[idx]=entry;else custom.push(entry);try{localStorage.setItem('recipeBookCustomNutritionIngredients',JSON.stringify(custom));refreshOptions();say('Saved '+name+' to your custom ingredient list on this device.')}catch{say('Could not save this ingredient on this device.',true)}});
 addRow();calculate();
}

function view(rid){let r=recipes.find(x=>x.id===rid);if(!r)return;detailId=rid;voiceStepIndex=0;if('speechSynthesis'in window)speechSynthesis.cancel();setRecipeZoom(100);const yieldMatch=String(r.yield||'').match(/\d+(?:\.\d+)?/),base=yieldMatch?Number(yieldMatch[0]):1;$('detail').innerHTML=`${r.photo?`<img class="photo" src="${r.photo}" alt="Recipe photo">`:''}<div class="recipe-title-box"><h2>${r.favorite?'⭐ ':''}${esc(r.title)}</h2></div><div class="row" style="margin:8px 0 12px"><button type="button" id="addRecipeToCalendarBtn">📅 Add to Calendar</button></div>${r.description?`<p>${esc(r.description)}</p>`:''}<div class="pills">${r.categories.map(c=>`<span class="pill">${esc(c)}</span>`).join('')}</div>${r.yield?`<p><b>Original yield:</b> ${esc(r.yield)}</p>`:''}${r.times?`<p><b>Times:</b> ${esc(r.times)}</p>`:''}${r.scalable!==false?`<section class="scale-panel" aria-label="Scale recipe"><h3 style="margin:0 0 9px;border:0;padding:0">⚖️ Scale Recipe</h3><div class="scale-controls"><div class="field"><label for="scaleOriginal">Original batch amount</label><input id="scaleOriginal" type="number" min="0.01" step="any" value="${base}"></div><div class="field"><label for="scaleTarget">I want to make</label><input id="scaleTarget" type="number" min="0.01" step="any" value="${base}"></div></div><p id="scaleFactor" class="scale-note">Scaling factor: 1×</p><p class="scale-note">Ingredient amounts update below. The saved recipe stays unchanged. Lines without a clear starting quantity are left as written.</p></section>${r.ingredients?`<h3>Ingredients</h3><pre id="scaledIngredients"></pre>`:''}`:`${r.ingredients?`<h3>Ingredients</h3><pre>${esc(r.ingredients)}</pre>`:''}`}<div class="row recipe-active-cooking-row" style="margin:12px 0"><button aria-pressed="false" class="alt" id="activeCookingBtn" type="button">🍳 Active Cooking: OFF</button></div><section class="recipe-baking-timer" aria-label="Baking timer"><h3>⏱️ Baking Timer</h3><div class="recipe-timer-inputs"><div class="field"><label for="recipeTimerMinutes">Minutes</label><input id="recipeTimerMinutes" type="number" inputmode="numeric" min="0" max="999" step="1" value="5"></div><div class="field"><label for="recipeTimerSeconds">Seconds</label><input id="recipeTimerSeconds" type="number" inputmode="numeric" min="0" max="59" step="1" value="0"></div></div><div id="recipeTimerDisplay" class="recipe-timer-display" role="timer" aria-live="off">05:00</div><div class="recipe-timer-actions"><button id="recipeTimerStart" type="button">▶ Start</button><button id="recipeTimerReset" class="alt" type="button">↺ Reset</button><button id="recipeTimerStopAlarm" class="alt" type="button">■ Stop timer</button></div><p id="recipeTimerStatus" class="help" role="status">Ready when you are.</p></section>${section('Directions',r.directions)}${section('Nutrition',r.nutrition)}${section('Notes / source / tips',r.notes)}${r.videoLink||r.websiteLink?`<section class="recipe-links"><h3>Recipe links</h3>${r.videoLink?`<p>🎬 <a href="${esc(normalizeRecipeLink(r.videoLink))}" target="_blank" rel="noopener noreferrer">Open video</a></p>`:''}${r.websiteLink?`<p>🌐 <a href="${esc(normalizeRecipeLink(r.websiteLink))}" target="_blank" rel="noopener noreferrer">Open website</a></p>`:''}</section>`:''}`;if(r.scalable!==false){$('scaleOriginal').addEventListener('input',updateScaledIngredients);$('scaleTarget').addEventListener('input',updateScaledIngredients);updateScaledIngredients()}initRecipeBakingTimer();updateRecipeSwipeNav();$('favBtn').textContent=r.favorite?'★ Remove favorite':'☆ Add favorite';$('addRecipeToCalendarBtn').onclick=()=>addRecipeToCalendar(r.id);open('detailDlg')}

// Hands-free recipe reading and voice-command support (Web Speech API)
let voiceRecognition=null,voiceListening=false,voiceStepIndex=0,voiceTimer=null,voiceLastText='';
function voiceSayStatus(message,isError=false){const el=$('voiceStatus');if(el){el.textContent=message;el.style.color=isError?'#a63e32':'';}}
function currentVoiceRecipe(){return recipes.find(x=>x.id===detailId)}
function recipeDirectionSteps(){const r=currentVoiceRecipe();return String(r?.directions||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/^\s*(?:\d+[.)]|[-*•])\s*/,''));}
function speakText(text){if(!('speechSynthesis'in window)||typeof window.SpeechSynthesisUtterance!=='function'){voiceSayStatus('Speech reading is not supported on this device.',true);return;}if(!text){voiceSayStatus('There is no text to read.',true);return;}speechSynthesis.cancel();voiceLastText=text;const u=new SpeechSynthesisUtterance(text);u.lang='en-CA';u.rate=0.92;u.onstart=()=>voiceSayStatus('Reading aloud…');u.onend=()=>voiceSayStatus('Finished reading. Say “repeat” or “next step”.');u.onerror=()=>voiceSayStatus('Speech playback stopped.',true);speechSynthesis.speak(u);}
function speakCurrentStep(){const steps=recipeDirectionSteps();if(!steps.length){voiceSayStatus('This recipe has no directions yet.',true);return;}voiceStepIndex=Math.max(0,Math.min(steps.length-1,voiceStepIndex));speakText('Step '+(voiceStepIndex+1)+'. '+steps[voiceStepIndex]);}
function voiceReadIngredients(){const r=currentVoiceRecipe();if(!r)return;speakText(r.ingredients?'Ingredients. '+r.ingredients:'This recipe has no ingredients listed.');}
function voiceReadDirections(){const r=currentVoiceRecipe();if(!r)return;voiceStepIndex=0;if(!r.directions){voiceSayStatus('This recipe has no directions yet.',true);return;}speakText('Directions. '+r.directions);}
function voiceStartTimer(minutes){if(!(minutes>0&&minutes<=1440)){voiceSayStatus('Please choose a timer between 1 minute and 24 hours.',true);return;}clearTimeout(voiceTimer);voiceSayStatus('Timer started for '+minutes+' minutes.');speakText('Timer started for '+minutes+' minutes.');voiceTimer=setTimeout(()=>{voiceSayStatus('Timer finished!');if('vibrate'in navigator)navigator.vibrate([300,150,300]);if('speechSynthesis'in window&&typeof window.SpeechSynthesisUtterance==='function'){const u=new SpeechSynthesisUtterance('Your cooking timer is finished.');u.lang='en-CA';speechSynthesis.speak(u);}alert('My Recipe Book: '+minutes+' minute timer finished!');},minutes*60000);}
function runVoiceCommand(raw){const c=String(raw||'').toLowerCase().trim();if(!c)return;voiceSayStatus('Heard: “'+raw+'”');if(/\b(stop|quiet|cancel reading)\b/.test(c)){if('speechSynthesis'in window)speechSynthesis.cancel();clearTimeout(voiceTimer);voiceSayStatus('Reading and voice timer stopped.');return;}if(/\b(pause|hold)\b/.test(c)){if('speechSynthesis'in window&&speechSynthesis.speaking)speechSynthesis.pause();voiceSayStatus('Paused. Say “resume” to continue.');return;}if(/\b(resume|continue)\b/.test(c)){if('speechSynthesis'in window)speechSynthesis.resume();voiceSayStatus('Resumed.');return;}if(/\b(repeat|again)\b/.test(c)){if(voiceLastText)speakText(voiceLastText);else speakCurrentStep();return;}if(/\b(read ingredients|ingredients)\b/.test(c)){const r=currentVoiceRecipe();speakText(r?.ingredients?'Ingredients. '+r.ingredients:'No ingredients listed.');return;}if(/\b(read directions|directions|read steps)\b/.test(c)){voiceStepIndex=0;speakCurrentStep();return;}if(/\b(next step|next)\b/.test(c)){voiceStepIndex++;speakCurrentStep();return;}if(/\b(previous step|back a step|previous)\b/.test(c)){voiceStepIndex--;speakCurrentStep();return;}const tm=c.match(/(?:start|set|make)?\s*(?:a\s*)?timer\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)?/);if(tm){let n=Number(tm[1]),u=tm[2]||'minutes';if(/^s/.test(u))n/=60;else if(/^h/.test(u))n*=60;voiceStartTimer(n);return;}voiceSayStatus('Command not recognized. Try “next step”, “repeat”, or “read recipe”.',true);}
function startVoiceRecognition(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){voiceSayStatus('Voice commands are not supported in this browser. Try Chrome on your Samsung phone.',true);return;}if(voiceListening){try{voiceRecognition.stop()}catch{}return;}try{voiceRecognition=new SR();voiceRecognition.lang='en-CA';voiceRecognition.continuous=true;voiceRecognition.interimResults=false;voiceRecognition.onresult=e=>{const result=e.results[e.results.length-1];if(result&&result.isFinal)runVoiceCommand(result[0].transcript);};voiceRecognition.onerror=e=>{voiceSayStatus('Microphone issue: '+(e.error||'please check microphone permission.'),true);};voiceRecognition.onend=()=>{voiceListening=false;const b=$('voiceListenBtn');if(b)b.textContent='🎤 Start voice commands';};voiceRecognition.start();voiceListening=true;$('voiceListenBtn').textContent='🎤 Stop listening';voiceSayStatus('Listening for commands. Say “read recipe” or “next step”.');setActiveCooking(true);}catch(e){voiceSayStatus('Could not start the microphone. Allow microphone access and try again.',true);}}
$('voiceListenBtn').onclick=startVoiceRecognition;$('voiceReadIngredientsBtn').onclick=voiceReadIngredients;$('voiceReadDirectionsBtn').onclick=voiceReadDirections;$('voicePauseBtn').onclick=()=>{if('speechSynthesis'in window&&speechSynthesis.speaking){speechSynthesis.pause();voiceSayStatus('Paused.');}else if('speechSynthesis'in window){speechSynthesis.resume();voiceSayStatus('Resumed.');}};$('voiceStopBtn').onclick=()=>{if('speechSynthesis'in window)speechSynthesis.cancel();clearTimeout(voiceTimer);if(voiceRecognition&&voiceListening){try{voiceRecognition.stop()}catch{}}voiceSayStatus('Stopped.');};
function updateRecipeSwipeNav(){const list=orderedVisibleRecipes(),i=list.findIndex(x=>x.id===detailId);$('recipeSwipeCount').textContent=i<0?'Not in current list':`${i+1} of ${list.length}`;$('prevRecipeBtn').disabled=i<=0;$('nextRecipeBtn').disabled=i<0||i>=list.length-1;$('prevRecipeBtn').style.opacity=i<=0?'.45':'1';$('nextRecipeBtn').style.opacity=i<0||i>=list.length-1?'.45':'1'}
function stepRecipe(direction){const list=orderedVisibleRecipes(),i=list.findIndex(x=>x.id===detailId),next=list[i+direction];if(next)view(next.id)}
$('prevRecipeBtn').onclick=()=>stepRecipe(-1);$('nextRecipeBtn').onclick=()=>stepRecipe(1);
let recipeTouchStart=null;$('detail').addEventListener('touchstart',e=>{if(e.touches.length===1)recipeTouchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});$('detail').addEventListener('touchend',e=>{if(!recipeTouchStart||!$('detailDlg').open)return;const dx=e.changedTouches[0].clientX-recipeTouchStart.x,dy=e.changedTouches[0].clientY-recipeTouchStart.y;recipeTouchStart=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.25)stepRecipe(dx<0?1:-1)},{passive:true});
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.view)view(b.dataset.view);if(b.dataset.pantryView)view(b.dataset.pantryView);if(b.dataset.edit)edit(b.dataset.edit);if(b.dataset.fav)favorite(b.dataset.fav)});
function favorite(rid){let r=recipes.find(x=>x.id===rid);if(!r)return;r.favorite=!r.favorite;r.updatedAt=Date.now();save();render();if(detailId===rid&&$('detailDlg').open)view(rid)}
$('addBtn').onclick=()=>edit();$('sectionAddRecipeBtn').onclick=()=>edit();$('closeEditor').onclick=$('cancelEditor').onclick=()=>close('editor');$('closeDetail').onclick=()=>close('detailDlg');document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&activeCooking&&$('detailDlg').open&&!cookingWakeLock)setActiveCooking(true)});$('editBtn').onclick=()=>{let x=detailId;close('detailDlg');edit(x)};$('favBtn').onclick=()=>favorite(detailId);
$('shareRecipeBtn').onclick=async()=>{
  const r=recipes.find(x=>x.id===detailId);if(!r)return;
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
      say('Share menu opened.');
    }else if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(shareText);
      say('Recipe copied to clipboard. Paste it into a message or email.');
    }else{
      window.prompt('Copy this recipe to share it:',shareText);
    }
  }catch(e){
    if(e.name!=='AbortError')say('Could not open sharing. You can copy the recipe text from the prompt.',true);
  }
};
$('deleteBtn').onclick=async()=>{let r=recipes.find(x=>String(x.id)===String(detailId));if(!r||!confirm('Delete "'+r.title+'"? This cannot be undone unless you have a backup.'))return;if(!await authorizeDestructiveAction())return;const deleted=getDeletedRecipeIds();deleted.push(String(r.id));if(!saveDeletedRecipeIds(deleted))return;recipes=recipes.filter(x=>String(x.id)!==String(r.id));if(save()){close('detailDlg');render();say('Recipe deleted permanently. Sync will not restore it.')}};$('printBtn').onclick=()=>{let r=recipes.find(x=>x.id===detailId);if(!r)return;let w=window.open('','_blank');if(!w){say('Allow pop-ups to print this recipe.',true);return}w.document.write(`<meta charset="utf-8"><title>${esc(r.title)}</title><h1>${esc(r.title)}</h1><p>${esc(r.description)}</p>${section('Ingredients',r.ingredients)}${section('Directions',r.directions)}${section('Nutrition',r.nutrition)}${section('Notes / source / tips',r.notes)}<script>onload=()=>print()<\/script>`);w.document.close()};
function renameCategory(oldName){if(['All recipes','Favorites','Favorite'].includes(oldName)){say('This built-in category cannot be edited or deleted.',true);return}let next=prompt('Edit category name:',oldName);if(next===null)return;next=next.trim();if(!next||next===oldName)return;if(['All recipes','Favorites'].includes(next)){say('That category name is reserved.',true);return}if(cats.includes(next)){say('A category with that name already exists.',true);return}cats=cats.map(c=>c===oldName?next:c);recipes=recipes.map(r=>({...r,categories:r.categories.map(c=>c===oldName?next:c),updatedAt:r.categories.includes(oldName)?Date.now():r.updatedAt}));let deleted=parse(localStorage.getItem(DK),[]);if(!Array.isArray(deleted))deleted=[];if(!deleted.includes(oldName))deleted.push(oldName);localStorage.setItem(DK,JSON.stringify(deleted.filter(c=>c!==next)));if(active===oldName)active=next;if(save()){render();say('Category renamed. Recipes using it have been updated.')}}
async function deleteCategory(name){if(['All recipes','Favorites','Favorite'].includes(name)){say('This built-in category cannot be edited or deleted.',true);return}if(!confirm('Delete the category “'+name+'”? It will also be removed from any recipes that use it. The recipes themselves will not be deleted.'))return;if(!await authorizeDestructiveAction())return;cats=cats.filter(c=>c!==name);recipes=recipes.map(r=>({...r,categories:r.categories.filter(c=>c!==name),updatedAt:r.categories.includes(name)?Date.now():r.updatedAt}));let deleted=parse(localStorage.getItem(DK),[]);if(!Array.isArray(deleted))deleted=[];if(!deleted.includes(name))deleted.push(name);localStorage.setItem(DK,JSON.stringify(deleted));if(active===name)active='All recipes';if(save()){render();say('Category deleted. Recipes were kept.')}}
function addCategoryByName(raw,inputId){let c=String(raw||'').trim();if(!c)return;if(['All recipes','Favorites','Uncategorized'].includes(c)){say('That category name is reserved.',true);return}const alreadyInSection=getSectionCustomCategories(currentSection).includes(c);if(alreadyInSection){say('That category already exists in this section.',true);return}if(!getSectionCustomCategories(currentSection).includes(c))markSectionCustomCategory(c);if(!cats.includes(c))cats.push(c);let deleted=parse(localStorage.getItem(DK),[]);if(!Array.isArray(deleted))deleted=[];localStorage.setItem(DK,JSON.stringify(deleted.filter(x=>x!==c)));const field=$(inputId);if(field)field.value='';active=c;if(save()){render();say('Category added.')}}
$('search').oninput=render;$('sort').onchange=render;$('addCatBtn').onclick=()=>addCategoryByName($('newCat').value,'newCat');
$('importBtn').onclick=()=>open('importDlg');$('closeImport').onclick=$('cancelImport').onclick=()=>close('importDlg');
function parseText(raw){let lines=raw.replace(/\r/g,'').replace(/\u00a0/g,' ').split('\n').map(s=>s.trim()).filter(Boolean),sections={before:[],ingredients:[],directions:[],nutrition:[],notes:[]},sec='before';for(let l of lines){l=l.replace(/^[•●▪◦·]+\s*/,'').replace(/^I\s+(?=\d|[½¼¾⅓⅔⅛⅜⅝⅞])/,'').trim();if(!l)continue;if(/^(ingredients?|what you.?ll need)$/i.test(l)){sec='ingredients';continue}if(/^(directions?|instructions?|method|steps|preparation|how to make)$/i.test(l)){sec='directions';continue}if(/^(nutrition|nutrition facts|nutritional information|per serving)$/i.test(l)){sec='nutrition';continue}if(/^(notes?|tips|storage|source|grandma.?s tips)$/i.test(l)){sec='notes';continue}let bucket=sections[sec];if(bucket[bucket.length-1]!==l)bucket.push(l)}let title=sections.before[0]||'Imported recipe',all=raw.toLowerCase(),categories=[];if(/\bpizza\b/.test(all))categories.push('Pizza');if(/\bsourdough\b/.test(all))categories.push('Sourdough');return{title,description:sections.before.slice(1).join(' ').slice(0,800),categories,ingredients:sections.ingredients.join('\n')||raw,directions:sections.directions.join('\n'),nutrition:sections.nutrition.join('\n'),notes:sections.notes.join('\n')}}
async function loadTesseract(){if(window.Tesseract)return;await new Promise((res,rej)=>{let sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';sc.onload=res;sc.onerror=()=>rej(Error('OCR could not load. Check your internet connection and try again.'));document.head.append(sc)});if(!window.Tesseract)throw Error('OCR did not start correctly. Please try again.')}
async function prepareOcrImage(source){
 let bitmap;
 try{bitmap=await createImageBitmap(source)}catch(e){return source}
 const maxSide=2600,scale=Math.min(2.5,maxSide/Math.max(bitmap.width,bitmap.height));
 const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);bitmap.close?.();
 const frame=ctx.getImageData(0,0,w,h),d=frame.data;
 // Grayscale and gently increase contrast while preserving thin printed strokes.
 for(let i=0;i<d.length;i+=4){let y=.299*d[i]+.587*d[i+1]+.114*d[i+2];y=Math.max(0,Math.min(255,(y-128)*1.28+128));d[i]=d[i+1]=d[i+2]=y;}
 ctx.putImageData(frame,0,0);return canvas;
}
async function recognizeImage(source,label='Reading recipe photo'){
 await loadTesseract();
 $('ocrStatus').textContent='Preparing photo for clearer text…';
 let worker;
 try{
  const scanSource=await prepareOcrImage(source);
  $('ocrStatus').textContent='Loading text recognition… please keep this screen open.';
  worker=await Tesseract.createWorker('eng',1,{
   logger:m=>{
    if(m.status==='loading tesseract core')$('ocrStatus').textContent='Preparing scanner…';
    else if(m.status==='loading language traineddata')$('ocrStatus').textContent='Loading English text data…';
    else if(m.status==='recognizing text')$('ocrStatus').textContent='Reading recipe: '+Math.round((m.progress||0)*100)+'%';
   },
   errorHandler:e=>console.error('Recipe OCR:',e)
  });
  await worker.setParameters({preserve_interword_spaces:'1'});
  // Full-page layout works better for printed recipe sheets; compare it with
  // sparse-text recognition and keep the pass with the strongest confidence.
  $('ocrStatus').textContent='Reading page layout…';
  await worker.setParameters({tessedit_pageseg_mode:Tesseract.PSM.AUTO});
  const pageResult=await worker.recognize(scanSource);
  $('ocrStatus').textContent='Checking ingredient lines…';
  await worker.setParameters({tessedit_pageseg_mode:Tesseract.PSM.SPARSE_TEXT});
  const sparseResult=await worker.recognize(scanSource);
  const candidates=[pageResult,sparseResult].map(r=>({
   text:(r&&r.data&&r.data.text||'').replace(/\\u0000/g,'').trim(),
   confidence:Number(r&&r.data&&r.data.confidence||0)
  })).filter(r=>r.text.replace(/\\s/g,'').length>=8);
  if(!candidates.length)throw Error('I could not read enough text in that picture. Try a brighter, sharper photo with the whole recipe in view.');
  candidates.sort((a,b)=>b.confidence-a.confidence);
  const best=candidates[0];
  if(best.confidence>0&&best.confidence<28)throw Error('The photo is too difficult to read clearly. Please retake it in good light, keep the page flat, and fill the frame with the recipe.');
  return best.text;
 }catch(e){
  if(e&&/fetch|network|failed to load|worker|wasm|traineddata/i.test(e.message||''))throw Error('The text scanner could not load. Check that your phone is online, then try again.');
  throw e;
 }finally{if(worker)await worker.terminate().catch(()=>{})}
}
async function pdfImageData(obj){
 try{
  const w=obj.width||obj.bitmap?.width,h=obj.height||obj.bitmap?.height;if(!w||!h||w<80||h<60||w*h>12000000)return '';
  const c=document.createElement('canvas'),scale=Math.min(1,850/Math.max(w,h));c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));const x=c.getContext('2d',{alpha:false});if(!x)return '';
  if(obj.bitmap||(typeof ImageBitmap!=='undefined'&&obj instanceof ImageBitmap)||obj instanceof HTMLCanvasElement||obj instanceof HTMLImageElement){x.drawImage(obj.bitmap||obj,0,0,c.width,c.height)}
  else if(obj.data&&obj.data.length===w*h*4){const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(obj.data),w,h),0,0);x.drawImage(tmp,0,0,c.width,c.height);tmp.width=tmp.height=1}
  else if(obj.data&&obj.data.length===w*h*3){const rgba=new Uint8ClampedArray(w*h*4);for(let i=0,j=0;i<obj.data.length;i+=3,j+=4){rgba[j]=obj.data[i];rgba[j+1]=obj.data[i+1];rgba[j+2]=obj.data[i+2];rgba[j+3]=255}const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);x.drawImage(tmp,0,0,c.width,c.height);tmp.width=tmp.height=1}
  else return '';
  let data=c.toDataURL('image/jpeg',.72);if(data.length>420000)data=c.toDataURL('image/jpeg',.55);c.width=c.height=1;return data.length<=600000?data:'';
 }catch(e){return ''}
}
async function extractPdfImages(pdf){
 const found=[];
 for(let n=1;n<=pdf.numPages&&found.length<12;n++){
  const page=await pdf.getPage(n),ops=await page.getOperatorList(),seen=new Set();
  for(let i=0;i<ops.fnArray.length&&found.length<12;i++){
   if(ops.fnArray[i]!==pdfjsLib.OPS.paintImageXObject)continue;
   const name=ops.argsArray[i]?.[0];if(!name||seen.has(name))continue;seen.add(name);
   try{const obj=await new Promise(resolve=>page.objs.get(name,resolve));const data=await pdfImageData(obj);if(data&&!found.includes(data))found.push(data)}catch(e){}
  }
 }
 return found;
}
async function pdfText(file){
 pendingPdfImages=[];
 if(!window.pdfjsLib){await new Promise((res,rej)=>{let s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=res;s.onerror=()=>rej(Error('PDF support could not load. Check internet, or paste the PDF text.'));document.head.append(s)});window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}
 let pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,out=[];
 try{pendingPdfImages=await extractPdfImages(pdf)}catch(e){pendingPdfImages=[]}
 for(let n=1;n<=pdf.numPages;n++){
  let page=await pdf.getPage(n),content=await page.getTextContent();
  let items=content.items.filter(x=>x.str&&x.str.trim()).map(x=>({t:x.str.trim(),x:x.transform[4],y:x.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);
  // Assign each PDF text item to exactly one visual line.
  let groups=[];
  for(let item of items){let line=groups.find(g=>Math.abs(g.y-item.y)<=1.25);if(!line){line={y:item.y,items:[]};groups.push(line)}line.items.push(item)}
  let lines=groups.sort((a,b)=>b.y-a.y).map(g=>g.items.sort((a,b)=>a.x-b.x).map(i=>i.t).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean);
  out.push(lines.join('\n'));
 }
 let extracted=out.join('\n\n').trim();
 if(extracted.replace(/\s/g,'').length>=30)return extracted;
 $('ocrStatus').textContent='Scanned PDF detected. Starting OCR…';let recognized=[];
 for(let n=1;n<=pdf.numPages;n++){let page=await pdf.getPage(n),viewport=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;recognized.push(await recognizeImage(canvas,'Reading scanned PDF page '+n+' of '+pdf.numPages));canvas.width=canvas.height=1}
 return recognized.join('\n\n')
}
$('parseBtn').onclick=async()=>{try{$('ocrStatus').textContent='';let text=$('paste').value.trim(),f=$('file').files?.[0],url=$('url').value.trim();pendingPdfImages=[];if(f){if(/\.json$/i.test(f.name)){let o=JSON.parse(await f.text());if(o.recipes){if(!await authorizeDestructiveAction())return;merge(o);close('importDlg');render();restoreNotice('Backup restored.');return}text=JSON.stringify(o)}else if(/\.pdf$/i.test(f.name)||f.type==='application/pdf')text=await pdfText(f);else if(f.type.startsWith('image/'))text=await recognizeImage(f,'Reading recipe photo');else if(/\.html?$/i.test(f.name)){let d=new DOMParser().parseFromString(await f.text(),'text/html');text=d.body.innerText}else text=await f.text()}if(url)throw Error('Direct website import may be blocked by the website. Copy the recipe text and paste it above.');if(!text)throw Error('No text was found. Try a clearer photo or paste the recipe text.');let seed=parseText(text);seed.pdfImages=pendingPdfImages.slice();if(seed.pdfImages.length)seed.photo=seed.pdfImages[0];$('ocrStatus').textContent='';close('importDlg');edit(null,seed);say(seed.pdfImages.length?'Recipe imported. A PDF picture was selected automatically; you can change it before saving.':'Recipe text imported. Review the ingredients and directions carefully before saving.')}catch(e){$('ocrStatus').textContent='';say(e.message||'Import failed.',true)}};
// A selected camera/photo image is scanned automatically, then opened in the recipe editor for review.
$('file').addEventListener('change',async e=>{
 const f=e.target.files&&e.target.files[0];
 if(!f||!f.type.startsWith('image/'))return;
 const status=$('ocrStatus');
 try{
  $('parseBtn').disabled=true;
  status.textContent='Photo received. Starting text recognition…';
  const extracted=await recognizeImage(f,'Reading recipe photo');
  const seed=parseText(extracted);
  $('paste').value=extracted;
  status.textContent='Text found. Opening the recipe for review…';
  $('file').value='';
  close('importDlg');
  edit(null,seed);
  say('Recipe text recognized. Check the recipe name, ingredients and directions, then save it.');
 }catch(err){
  status.textContent=err.message||'The photo could not be read. Try another picture.';
  say(status.textContent,true);
 }finally{$('parseBtn').disabled=false;}
});
$('backupBtn').onclick=()=>open('backupDlg');$('closeBackup').onclick=()=>close('backupDlg');
function makeBackupBlob(){return new Blob([JSON.stringify({app:'My Recipe Book',version:2,categories:cats,deletedRecipeIds:getDeletedRecipeIds(),recipes,cookingHistory:JSON.parse(localStorage.getItem('myRecipeBook_cooking_history_v1')||'[]')},null,2)],{type:'application/json'})}
function downloadBackup(){
  try {
    const url=URL.createObjectURL(makeBackupBlob());
    const a=document.createElement('a');
    a.href=url;
    a.download='my-recipe-book-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    say('Backup download started. Check Downloads.');
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  } catch(e) { say('Backup failed: '+(e.message||'unknown error'),true); }
}
$('exportBtn').onclick=downloadBackup;
$('chooseBackupBtn').onclick=async()=>{
  try {
    if(typeof window.showSaveFilePicker!=='function'){
      say('This browser does not offer a choose-folder picker. Try Share / save backup, or Download recipe backup and move it with My Files.',true);
      return;
    }
    const handle=await window.showSaveFilePicker({suggestedName:'my-recipe-book-backup.json',types:[{description:'JSON recipe backup',accept:{'application/json':['.json']}}]});
    const writable=await handle.createWritable();
    await writable.write(makeBackupBlob());
    await writable.close();
    say('Backup saved to the location you selected. Please verify the file.');
  } catch(e) { if(e.name!=='AbortError')say('Could not save backup: '+(e.message||'unknown error'),true); }
};
$('shareBackupBtn').onclick=async()=>{
  try {
    const file=new File([makeBackupBlob()], 'my-recipe-book-backup.json',{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){
      await navigator.share({title:'My Recipe Book backup',text:'Recipe backup JSON file',files:[file]});
      say('Share menu opened. Choose a destination and confirm the save there.');
    } else {
      downloadBackup();
      say('This browser cannot share backup files directly, so a backup download was started. Check Downloads.');
    }
  } catch(e) {
    if(e.name==='AbortError') return;
    // Some mobile browsers/PWAs reject file sharing with Permission denied.
    // Preserve the backup by falling back to a normal JSON download.
    downloadBackup();
    say('Sharing was blocked by the browser, so a backup download was started instead. Check Downloads.');
  }
};
function merge(o){let inc=Array.isArray(o)?o:o.recipes||[];let deleted=getDeletedRecipeIds();for(let raw of inc){let r=norm(raw),id=String(r.id);deleted=deleted.filter(x=>x!==id);let i=recipes.findIndex(x=>String(x.id)===id);if(i>=0)recipes[i]=r;else{if(recipes.some(x=>x.title===r.title&&x.ingredients===r.ingredients))continue;recipes.push(r)}r.categories.forEach(c=>{if(!cats.includes(c))cats.push(c)})}saveDeletedRecipeIds(deleted);if(Array.isArray(o.categories))o.categories.forEach(c=>{if(!cats.includes(c))cats.push(c)});if(Array.isArray(o.cookingHistory)){let cur=JSON.parse(localStorage.getItem('myRecipeBook_cooking_history_v1')||'[]');let map=new Map(cur.map(x=>[String(x.id),x]));o.cookingHistory.forEach(x=>{if(x&&x.id)map.set(String(x.id),x)});localStorage.setItem('myRecipeBook_cooking_history_v1',JSON.stringify([...map.values()].sort((a,b)=>new Date(b.cookedAt)-new Date(a.cookedAt))))}save()}
$('restoreBtn').onclick=async()=>{try{if(!await authorizeDestructiveAction())return;let f=$('restoreFile').files?.[0];if(!f)throw Error('Choose a JSON backup first.');let o=JSON.parse(await f.text());if(!Array.isArray(o)&&!Array.isArray(o.recipes))throw Error('This does not look like a recipe backup.');merge(o);await Promise.all((Array.isArray(o)?o:o.recipes||[]).filter(r=>r&&r.photo).map(r=>storeRecipePhoto(String(r.id),r.photo)));render();restoreNotice('Backup restored / merged.')}catch(e){say(e.message,true)}};
$('pinSettingsBtn').onclick=async()=>{try{await setPinFlow()}catch(e){say('Could not set PIN in this browser. Please try again.',true)}};
$('deleteAllBtn').onclick=async()=>{if(!recipes.length){say('There are no recipes to delete.');return}if(!confirm('This will delete ALL '+recipes.length+' recipes from this browser. Continue?'))return;if(!await authorizeDestructiveAction())return;if(!confirm('Final confirmation: permanently delete every recipe? Download a backup first if you may need them.'))return;saveDeletedRecipeIds([...getDeletedRecipeIds(),...recipes.map(r=>String(r.id))]);recipes=[];save();render();close('backupDlg');say('All recipes deleted.')};
$('shopBtn').onclick=()=>{let s=$('shopRecipe');s.innerHTML='<option value="">Choose recipe…</option>'+recipes.map(r=>`<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');$('shopText').value=localStorage.getItem(SK)||'';showPage('shopping')};$('shoppingBackBtn').onclick=()=>{save();showPage('tools');$('bakingToolsDropdown').open=true};$('shopRecipe').onchange=()=>{let r=recipes.find(x=>x.id===$('shopRecipe').value);if(r){$('shopText').value+=($('shopText').value.trim()?'\n':'')+r.ingredients;save();$('shopRecipe').value=''}};$('shopText').oninput=()=>{try{localStorage.setItem(SK,$('shopText').value)}catch{}};$('shopPrint').onclick=()=>{let w=window.open('','_blank');if(!w){say('Allow pop-ups to print.',true);return}w.document.write('<h1>Shopping list</h1><pre style="white-space:pre-wrap;font:18px Arial">'+esc($('shopText').value)+'</pre><script>onload=()=>print()<\/script>');w.document.close()};$('shopCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('shopText').value);say('Shopping list copied.')}catch{say('Select and copy the shopping list text.')}};$('shopClear').onclick=()=>{if(confirm('Clear the entire shopping list?')){$('shopText').value='';save();say('Shopping list cleared.')}};
// // Shared OAuth Web Client ID for My Recipe Book. Each user signs in to their own Google account.
const GOOGLE_OAUTH_CLIENT_ID='212681706272-gneusem8rkfdjndss32j569a314no22h.apps.googleusercontent.com';
const getGoogleClientId=()=>GOOGLE_OAUTH_CLIENT_ID;
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
let driveToken='',driveTokenClient=null;
function driveSay(message,err=false){const el=$('driveStatus');if(el){el.textContent=message;el.style.color=err?'#a63e32':''}}
function initDriveAuth(){return new Promise((resolve,reject)=>{let tries=0;const wait=()=>{if(window.google?.accounts?.oauth2){try{driveTokenClient=google.accounts.oauth2.initTokenClient({client_id:getGoogleClientId(),scope:DRIVE_SCOPE,callback:resp=>{if(resp?.error){driveToken='';driveSay('Google authorization failed: '+resp.error+'. Tap Connect Google Drive to try again.',true);return}driveToken=resp.access_token||'';driveSay(driveToken?'Google Drive connected for this session.':'No access token received.',!driveToken);if(driveToken&&localStorage.getItem('myRecipeBook_drive_auto_sync_v1'))setTimeout(()=>syncDriveNow(false),300)}});resolve();}catch(e){reject(e)}return}if(++tries>40){reject(new Error('Google sign-in did not load. Check your internet connection and reload the page.'));return}setTimeout(wait,250)};wait()})}
async function connectDrive(){driveSay('Connecting to Google Drive…');try{await initDriveAuth();driveSay('Google sign-in is ready. Waiting for your authorization…');driveTokenClient.requestAccessToken({prompt:''})}catch(e){driveSay(e.message||'Could not start Google authorization.',true)}}
async function driveApi(path,options={}){if(!driveToken)throw new Error('Tap Connect Google Drive first.');const r=await fetch('https://www.googleapis.com/drive/v3'+path,{...options,headers:{Authorization:'Bearer '+driveToken,...(options.headers||{})}});if(!r.ok)throw new Error('Google Drive request failed ('+r.status+'): '+(await r.text()).slice(0,180));return r.status===204?null:r.json()}
async function saveDriveBackup(){try{if(!driveToken){driveSay('Tap Connect Google Drive first.',true);return}driveSay('Saving backup to Google Drive…');await uploadDriveBackupCore();driveSay('Backup saved to My Drive at '+new Date().toLocaleTimeString()+'.')}catch(e){driveSay(e.message||'Drive backup failed.',true)}}
async function syncDriveNow(quiet=true){
 if(driveSyncBusy)return;
 if(!driveToken){if(!quiet)driveSay('Tap Connect Google Drive to start syncing.',true);return}
 driveSyncBusy=true;
 try{
  if(!quiet)driveSay('Syncing with Google Drive…');
  const found=await driveApi('/files?q='+encodeURIComponent("name='my-recipe-book-backup.json' and trashed=false")+'&spaces=drive&pageSize=10&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)');
  if(found.files?.length){
   const file=found.files[0];
   const cloud=await driveApi('/files/'+file.id+'?alt=media');
   if(!cloud||!Array.isArray(cloud.recipes))throw new Error('The Drive backup is not a valid My Recipe Book backup.');
   // SAFETY: a cloud deletion marker must never erase a recipe that exists
   // locally. Older/other-device backups can contain stale deletion markers.
   // Only this device's own deletion list is applied automatically. Cloud-only
   // deletion markers are deliberately not imported during background sync.
   const locallyDeleted=getDeletedRecipeIds();
   recipes=recipes.filter(r=>!locallyDeleted.includes(String(r.id)));
   for(const raw of cloud.recipes){
    const cr=norm(raw),rid=String(cr.id);
    if(locallyDeleted.includes(rid))continue;
    const i=recipes.findIndex(r=>String(r.id)===rid);
    if(i<0){
     if(!recipes.some(r=>r.title===cr.title&&r.ingredients===cr.ingredients)){
      // Store incoming cloud photos in IndexedDB before compacting localStorage.
      if(cr.photo)await storeRecipePhoto(rid,cr.photo);
      recipes.push(cr);
     }
    }
    // If this recipe ID already exists locally, keep the local copy. This
    // prevents an older or conflicting Drive version from replacing it.
   }
   if(Array.isArray(cloud.categories))cloud.categories.forEach(c=>{if(c&&!cats.includes(c))cats.push(c)});
   recipes=recipes.map(norm);saveLocalOnly();
  }
  await uploadDriveBackupCore();
  driveSay('Automatic sync complete at '+new Date().toLocaleTimeString()+'.');
 }catch(e){driveSay('Automatic sync paused: '+(e.message||'Drive sync failed')+'. Reconnect Drive if needed.',true)}
 finally{driveSyncBusy=false}
}
function saveLocalOnly(){try{const compact=recipes.map(r=>{const x={...r};delete x.photo;return x});localStorage.setItem(K,JSON.stringify(compact));localStorage.setItem(CK,JSON.stringify(cats));localStorage.setItem(SK,$('shopText').value)}catch{}}
async function uploadDriveBackupCore(){
 const existing=await driveApi('/files?q='+encodeURIComponent("name='my-recipe-book-backup.json' and trashed=false")+'&spaces=drive&pageSize=10&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)');
 const fileData=JSON.stringify({app:'My Recipe Book',version:2,updated:new Date().toISOString(),categories:cats,deletedRecipeIds:getDeletedRecipeIds(),recipes,cookingHistory:JSON.parse(localStorage.getItem('myRecipeBook_cooking_history_v1')||'[]')},null,2);const boundary='recipebook_'+Date.now();
 const metadata=JSON.stringify({name:'my-recipe-book-backup.json',mimeType:'application/json'});
 let url,method,body;
 if(existing.files?.length){url='https://www.googleapis.com/upload/drive/v3/files/'+existing.files[0].id+'?uploadType=multipart&fields=id,name,modifiedTime';method='PATCH'}else{url='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime';method='POST'}
 body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+metadata+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+fileData+'\r\n--'+boundary+'--';
 const r=await fetch(url,{method,headers:{Authorization:'Bearer '+driveToken,'Content-Type':'multipart/related; boundary='+boundary},body});if(!r.ok)throw new Error('Could not update Drive backup ('+r.status+').');return r.json();
}

async function restoreDriveBackup(){
 try{
  if(!driveToken){driveSay('Tap Connect Google Drive first.',true);return}
  driveSay('Looking for your Drive backup…');
  const found=await driveApi('/files?q='+encodeURIComponent("name='my-recipe-book-backup.json' and trashed=false")+'&spaces=drive&pageSize=10&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)');
  if(!found.files?.length){driveSay('No My Recipe Book backup found in your Drive. Save a backup first, or upload your JSON backup to My Drive.',true);return}
  const file=found.files[0];
  if(!confirm('Restore the latest backup from '+new Date(file.modifiedTime).toLocaleString()+'? Existing recipes will be merged; matching recipe IDs will be updated.'))return;
  const body=await driveApi('/files/'+file.id+'?alt=media');
  if(!body||!Array.isArray(body.recipes))throw new Error('The Drive file is not a My Recipe Book backup.');
  // merge() keeps recipe photos in memory, but save() deliberately strips them
  // from localStorage. Persist every backed-up photo to IndexedDB before
  // reporting success, just as the JSON-file restore handler does.
  merge(body);
  const photoRecipes=body.recipes.filter(r=>r&&r.id&&typeof r.photo==='string'&&r.photo);
  await Promise.all(photoRecipes.map(r=>storeRecipePhoto(String(r.id),r.photo)));
  render();
  restoreNotice('Restored / merged '+body.recipes.length+' recipes from Google Drive, including '+photoRecipes.length+' saved pictures.');
  driveSay('Restored / merged '+body.recipes.length+' recipes and '+photoRecipes.length+' pictures from Google Drive.');
 }catch(e){
  driveSay(e.message||'Drive restore failed.',true);
 }
}
$('driveAutoSync').checked=localStorage.getItem('myRecipeBook_drive_auto_sync_v1')==='1';$('driveAutoSync').onchange=()=>{localStorage.setItem('myRecipeBook_drive_auto_sync_v1',$('driveAutoSync').checked?'1':'0');if($('driveAutoSync').checked){if(driveToken)syncDriveNow(false);else driveSay('Automatic sync is enabled. Checking your Google connection…')}else driveSay('Automatic sync is off. Manual backups still work.')};$('driveConnectBtn').onclick=connectDrive;$('driveBackupBtn').onclick=saveDriveBackup;$('driveRestoreBtn').onclick=restoreDriveBackup;
const SAMPLE_SEED_KEY='myRecipeBook_sample_recipes_seeded_v1';
const SAMPLE_RECIPES=[
 {id:'sample-sourdough-loaf-v1',title:'Beginner Sourdough Bread',description:'A simple example of a full bread recipe card, with a photo, yield, timing, ingredients and step-by-step directions.',categories:['Bread','Sourdough','Sample Recipes'],yield:'1 medium loaf',times:'Bulk fermentation: 4–6 hours; bake: 40–45 minutes',ingredients:'100 g active sourdough starter\n350 g water\n500 g bread flour\n10 g fine sea salt',directions:'1. Mix the starter and water.\n2. Add flour and salt; mix until no dry flour remains. Rest 30 minutes.\n3. Complete 3–4 sets of stretch and folds, 30 minutes apart.\n4. Let the dough rise until airy and noticeably expanded.\n5. Shape, place in a floured banneton and refrigerate overnight.\n6. Bake in a preheated covered Dutch oven at 230°C / 450°F for 20 minutes, then uncovered at 220°C / 425°F for 20–25 minutes.',nutrition:'Example recipe only; nutrition will depend on ingredients and loaf size.',notes:'Sample recipe — edit or delete it whenever you like.',photo:'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=900&auto=format&fit=crop&q=80'},
 {id:'sample-calzone-v1',title:'Homemade Cheese Calzones',description:'A sample filled-dough recipe showing how ingredients and directions appear together.',categories:['Pizza','Sample Recipes'],yield:'4 individual calzones',times:'Prep: 25 minutes; rise: 60–90 minutes; bake: 15–20 minutes',ingredients:'1 cup lukewarm water\n1 tsp active dry yeast\n2½ cups all-purpose flour\n1 tsp salt\n1 tbsp olive oil\n1 cup shredded mozzarella\n½ cup ricotta\n½ cup pizza sauce, for serving',directions:'1. Stir yeast into the water and let stand 5 minutes.\n2. Mix in flour, salt and olive oil. Knead until smooth.\n3. Cover and let rise until doubled.\n4. Divide into 4 pieces and roll each into a circle.\n5. Add mozzarella and ricotta to one half of each circle. Fold over and seal the edges.\n6. Bake at 220°C / 425°F for 15–20 minutes until golden.',notes:'Sample recipe — fillings can be changed to taste.',photo:'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80'},
 {id:'sample-fresh-pasta-v1',title:'Fresh Egg Pasta',description:'A short example recipe with a small ingredient list and hands-on instructions.',categories:['Pasta','Sample Recipes'],yield:'2–3 servings',times:'Rest: 30 minutes; cook: 2–4 minutes',ingredients:'200 g finely sifted durum flour\n2 large eggs\nA splash of water, only if needed',directions:'1. Mound the flour on a clean work surface and make a well in the centre.\n2. Add the eggs and gradually mix in the flour.\n3. Knead for 8–10 minutes until smooth, adding a few drops of water only if dry.\n4. Wrap and rest for 30 minutes.\n5. Roll thinly, cut into the desired shape and cook in boiling salted water for 2–4 minutes.',notes:'Sample recipe — cooking time depends on pasta thickness.',photo:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&auto=format&fit=crop&q=80'},
 {id:'sample-cinnamon-rolls-v1',title:'Old-Fashioned Cinnamon Rolls',description:'An example of a dessert recipe with preparation and baking times.',categories:['Breakfast','Desserts','Sample Recipes'],yield:'9 rolls',times:'Rise: about 1½ hours total; bake: 22–25 minutes',ingredients:'¾ cup warm milk\n2¼ tsp active dry yeast\n¼ cup sugar\n1 egg\n3 tbsp softened butter\n2½ cups all-purpose flour\n½ tsp salt\nFor filling: ¼ cup softened butter, ½ cup brown sugar and 1 tbsp cinnamon',directions:'1. Sprinkle yeast over warm milk with a pinch of sugar; wait until foamy.\n2. Mix in remaining sugar, egg, butter, flour and salt. Knead until soft and smooth.\n3. Cover and rise until doubled.\n4. Roll into a rectangle, spread with butter and sprinkle with brown sugar and cinnamon.\n5. Roll up, slice into 9 rolls and place in a greased pan. Rise until puffy.\n6. Bake at 180°C / 350°F for 22–25 minutes.',notes:'Sample recipe — add your favourite icing after baking.',photo:'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=900&auto=format&fit=crop&q=80'},
 {id:'sample-apple-pie-v1',title:'Classic Apple Pie',description:'A sample dessert card with a longer ingredient list and method.',categories:['Desserts','Sample Recipes'],yield:'1 nine-inch pie',times:'Prep: 30 minutes; bake: 50–60 minutes',ingredients:'2 prepared pie crusts\n6 cups peeled, sliced apples\n¾ cup sugar\n2 tbsp all-purpose flour\n1 tsp ground cinnamon\n1 tbsp lemon juice\n1 tbsp butter',directions:'1. Heat oven to 220°C / 425°F.\n2. Toss apples with sugar, flour, cinnamon and lemon juice.\n3. Line a 9-inch pie plate with one crust and add the apple mixture. Dot with butter.\n4. Cover with the second crust, seal and cut a few vents.\n5. Bake 15 minutes, reduce heat to 180°C / 350°F and bake 35–45 minutes more, until the filling bubbles and crust is golden.\n6. Cool before slicing.',notes:'Sample recipe — use a foil shield if the crust browns too quickly.',photo:'https://images.unsplash.com/photo-1562007908-17c67e878cfc?w=900&auto=format&fit=crop&q=80'}
];
function seedSampleRecipesIfFresh(){
 try{
  if(localStorage.getItem(SAMPLE_SEED_KEY)==='yes')return;
  if(localStorage.getItem(K)!==null){localStorage.setItem(SAMPLE_SEED_KEY,'yes');return;}
  const deleted=getDeletedRecipeIds();
  recipes=SAMPLE_RECIPES.filter(r=>!deleted.includes(String(r.id))).map(r=>norm({...r,createdAt:Date.now(),updatedAt:Date.now()}));
  if(!cats.includes('Sample Recipes'))cats.push('Sample Recipes');
  save();
  localStorage.setItem(SAMPLE_SEED_KEY,'yes');
 }catch(e){say('Sample recipes could not be added automatically. You can still add recipes normally.',true)}
}
const APP_ICON_KEY='myRecipeBook_custom_icon_v1';
function applyAppIcon(){
 const brand=document.querySelector('.head-brand h1');if(!brand)return;
 const stored=localStorage.getItem(APP_ICON_KEY);
 brand.textContent='';
 if(stored&&stored.startsWith('data:image/')){const img=document.createElement('img');img.src=stored;img.alt='';img.style.cssText='width:28px;height:28px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:5px';img.onerror=()=>{const fallback=document.createElement('span');fallback.textContent='📖 ';fallback.style.marginRight='5px';img.replaceWith(fallback)};brand.append(img);}
 else{const icon=document.createElement('span');icon.textContent=(stored||'📖')+' ';icon.style.cssText='display:inline-block;margin-right:5px';brand.append(icon);}
 const title=document.createElement('span');title.textContent='My Recipe Book';brand.append(title);
}
$('openAppIconSettingsBtn').onclick=()=>{applyAppIcon();open('appIconDlg')};
$('closeAppIconDlg').onclick=()=>close('appIconDlg');
document.querySelectorAll('[data-app-icon]').forEach(btn=>btn.addEventListener('click',()=>{localStorage.setItem(APP_ICON_KEY,btn.dataset.appIcon);applyAppIcon();$('appIconStatus').textContent='Icon updated and saved on this device.';}));
$('resetAppIconBtn').onclick=()=>{localStorage.removeItem(APP_ICON_KEY);applyAppIcon();$('customAppIconFile').value='';$('appIconStatus').textContent='The original TBK icon has been restored inside the app.';};
$('customAppIconFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(!file.type.startsWith('image/')){say('Choose an image file.',true);return;}
 let url='';
 try{
  url=URL.createObjectURL(file);const img=new Image();img.src=url;
  if(img.decode)await img.decode();else await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Image processing is unavailable.');
  const side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
  ctx.drawImage(img,sx,sy,side,side,0,0,128,128);
  const data=canvas.toDataURL('image/jpeg',.78);
  if(data.length>90000)throw new Error('That picture is too large. Please choose a smaller image.');
  localStorage.setItem(APP_ICON_KEY,data);applyAppIcon();$('appIconStatus').textContent='Your picture is saved as the in-app icon.';
 }catch(err){say(err.message||'Could not use that picture.',true);}
 finally{if(url)URL.revokeObjectURL(url);e.target.value='';}
});
load();seedSampleRecipesIfFresh();applyAppIcon();$('sectionChooserPage').classList.add('hidden');setCategoriesCollapsed(true);driveSay('Google Drive is not connected in this session. Tap Connect Google Drive to resume syncing.');migrateAndLoadRecipePhotos().then(()=>showPage('sectionChooser'));getAutoSaveHandle().then(async h=>{
 if(!h){
  $('autoSaveStatus').textContent=(typeof window.showSaveFilePicker==='function'||typeof window.showDirectoryPicker==='function')
   ?'Your recipes are saved on this device. Tap Automatic Save / Backup to choose an additional backup file or folder.'
   :'Your recipes are saved on this device. This browser does not provide a file/folder picker here; use Backup / Restore or Google Drive for an additional copy.';
  return;
 }
 let permission='unknown';
 try{permission=await h.queryPermission({mode:'readwrite'})}catch(e){}
 if(permission==='granted'){
  $('autoSaveStatus').textContent='Automatic backup is ready. Saved location: '+(h.name||'your selected file')+'. Changes are saved there automatically.';
  writeAutoSaveFile(false);
 }else{
  $('autoSaveStatus').textContent='Your backup location is remembered: '+(h.name||'selected file')+'. File permission needs renewing. Tap Automatic Save / Backup; you should not need to choose the location again.';
 }
}).catch(()=>{$('autoSaveStatus').textContent='Your on-device recipes are safe. The saved backup location could not be checked; tap Automatic Save / Backup to check it.'});if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Pantry Inventory. Stored locally on this device.
const INVENTORY_KEY='myRecipeBook_pantry_inventory_v1';
const readLocalArray=(key)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:[]}catch{return []}};
const writeLocalArray=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){say('Could not save this information. Browser storage may be full.',true);return false}};
let inventoryItems=readLocalArray(INVENTORY_KEY);
function renderInventory(){
 inventoryItems=readLocalArray(INVENTORY_KEY);const q=($('invSearch').value||'').trim().toLowerCase(),host=$('inventoryList');
 const rows=inventoryItems.filter(x=>!q||[x.name,x.location,x.unit].join(' ').toLowerCase().includes(q));
 if(!rows.length){host.innerHTML='<p class="help">No inventory items found. Add your first ingredient above.</p>';return;}
 host.innerHTML=['Pantry','Refrigerator','Freezer'].map(loc=>{const group=rows.filter(x=>x.location===loc);if(!group.length)return '';return '<h3>'+loc+'</h3>'+group.map(x=>{const today=new Date().toISOString().slice(0,10),expired=x.expiry&&x.expiry<today,soon=x.expiry&&!expired&&x.expiry<=new Date(Date.now()+7*86400000).toISOString().slice(0,10);return `<article style="border:1px solid var(--line);border-radius:10px;padding:10px;margin:8px 0"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><strong>${esc(x.name)}</strong><span class="pill">${esc(x.qty)} ${esc(x.unit||'')}</span></div><div class="help">${x.expiry?'Best before: '+esc(x.expiry):'No expiry date'}${expired?' · EXPIRED':soon?' · Expiring soon':''}</div><div class="actions"><button type="button" class="alt" data-inv-use="${esc(x.id)}">Use amount</button><button type="button" class="alt" data-inv-edit="${esc(x.id)}">Edit</button><button type="button" class="danger" data-inv-del="${esc(x.id)}">Delete</button></div></article>`}).join('')}).join('');
}
$('openPantryInventoryBtn').onclick=()=>{renderInventory();showPage('inventory')};
$('inventoryBackBtn').onclick=()=>showPage('tools');
$('invAddBtn').onclick=()=>{const name=$('invName').value.trim(),qty=Number($('invQty').value),unit=$('invUnit').value.trim(),location=$('invLocation').value,expiry=$('invExpiry').value;if(!name||$('invQty').value===''||!Number.isFinite(qty)||qty<0){say('Enter an ingredient and a valid quantity.',true);return;}inventoryItems.push({id:id(),name,qty,unit,location,expiry});if(writeLocalArray(INVENTORY_KEY,inventoryItems)){['invName','invQty','invUnit','invExpiry'].forEach(k=>$(k).value='');renderInventory();}};
$('invSearch').oninput=renderInventory;
$('inventoryList').onclick=e=>{const b=e.target.closest('button');if(!b)return;const itemId=b.dataset.invUse||b.dataset.invEdit||b.dataset.invDel,x=inventoryItems.find(v=>v.id===itemId);if(!x)return;if(b.dataset.invDel!==undefined){if(confirm('Delete '+x.name+' from inventory?')){inventoryItems=inventoryItems.filter(v=>v.id!==itemId);writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();}}else if(b.dataset.invEdit!==undefined){const name=prompt('Ingredient name:',x.name);if(name===null)return;const qty=prompt('Quantity:',x.qty);if(qty===null)return;const unit=prompt('Unit:',x.unit||'');if(unit===null)return;const location=prompt('Storage location (Pantry, Refrigerator or Freezer):',x.location);if(location===null)return;const expiry=prompt('Expiry date (YYYY-MM-DD), or leave blank:',x.expiry||'');if(expiry===null)return;const n=Number(qty),loc=['pantry','refrigerator','freezer'].find(v=>v===location.trim().toLowerCase());if(!name.trim()||!Number.isFinite(n)||n<0||!loc){say('Please enter a valid name, quantity and storage location.',true);return;}Object.assign(x,{name:name.trim(),qty:n,unit:unit.trim(),location:loc[0].toUpperCase()+loc.slice(1),expiry:expiry.trim()});writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();}else{const used=prompt('How much '+x.name+' did you use? (same unit: '+(x.unit||'unit')+')','1');if(used===null)return;const n=Number(used);if(!Number.isFinite(n)||n<0||n>Number(x.qty)){say('Enter an amount from zero up to the available quantity.',true);return;}x.qty=Number(x.qty)-n;writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();}};
$('invUseInFinderBtn').onclick=()=>{const names=inventoryItems.filter(x=>Number(x.qty)>0).map(x=>x.name);if(!names.length){say('There are no ingredients with a quantity above zero.',true);return;}$('pantryIngredients').value=[...new Set(names)].join(', ');showPage('pantry');$('pantryFindBtn').click();};


})();


// Cooking temperature reference with searchable safe minimums and preference values.
(()=>{
 const search=document.getElementById('cookingTempSearch'), results=document.getElementById('cookingTempResults');
 if(!search||!results)return;
 const safe='USDA safe min', pref='Preference';
 const entries=[
  {group:'POULTRY',name:'Chicken, turkey, duck, goose',detail:'Whole, parts, breasts, thighs, wings',c:74,f:165,type:safe,tags:'bird poultry whole breast thigh wing'},
  {group:'POULTRY',name:'Ground poultry',detail:'Ground chicken, turkey, duck',c:74,f:165,type:safe,tags:'ground poultry burger'},
  {group:'POULTRY',name:'Stuffing',detail:'Cooked alone or inside the bird',c:74,f:165,type:safe,tags:'dressing filling'},
  {group:'POULTRY',name:'Chicken / turkey dark meat',detail:'Thighs and legs; higher temperature is a texture preference, not the safe minimum',c:79,f:175,type:pref,tags:'poultry chicken turkey dark meat thigh leg'},
  {group:'POULTRY',name:'Fried chicken, bone-in (oil temp)',detail:'Typical frying oil temperature; check the chicken reaches a safe internal temperature',c:177,f:350,type:'Oil temp',tags:'fried chicken bone-in oil frying'},
  {group:'POULTRY',name:'Fried chicken wings (oil temp)',detail:'Typical frying oil temperature; check the chicken reaches a safe internal temperature',c:191,f:375,type:'Oil temp',tags:'fried chicken wings oil frying'},
  {group:'POULTRY',name:'Fried chicken tenders / nuggets (oil temp)',detail:'Typical frying oil temperature; check the chicken reaches a safe internal temperature',c:177,f:350,type:'Oil temp',tags:'fried chicken tenders nuggets oil frying'},
  {group:'BEEF, PORK, LAMB & VEAL',name:'Ground meat',detail:'Ground beef, pork, lamb, veal; burgers and meatloaf',c:71,f:160,type:safe,tags:'hamburger mince meatloaf'},
  {group:'BEEF, PORK, LAMB & VEAL',name:'Beef, pork, lamb, veal steaks, chops and roasts',detail:'Whole cuts; rest for at least 3 minutes before carving or eating',c:63,f:145,type:safe,tags:'steak roast chop tenderloin whole cuts'},
  {group:'SEAFOOD',name:'Fish with fins',detail:'Cook until flesh is opaque and separates easily with a fork',c:63,f:145,type:safe,tags:'salmon cod trout tilapia seafood'},
  {group:'SEAFOOD',name:'Shrimp, lobster and crab',detail:'Cook until flesh is pearly and opaque',c:null,f:null,type:'Cook until done',tags:'shellfish crustacean'},
  {group:'EGGS & LEFTOVERS',name:'Egg dishes',detail:'Casseroles and dishes containing eggs',c:71,f:160,type:safe,tags:'quiche frittata egg casserole'},
  {group:'EGGS & LEFTOVERS',name:'Leftovers and casseroles',detail:'Reheat leftovers thoroughly',c:74,f:165,type:safe,tags:'reheat casserole soup leftovers'},
  {group:'PORK & HAM',name:'Fresh ham and pork',detail:'Whole cuts; rest for at least 3 minutes',c:63,f:145,type:safe,tags:'pork ham fresh roast chop'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — blue rare',detail:'Very cool, deep red center; preference only',c:46,f:115,type:pref,tags:'steak beef blue rare doneness'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — rare',detail:'Preference only; not the recommended safe minimum for whole cuts',c:49,f:120,type:pref,tags:'steak beef doneness'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — medium-rare',detail:'Preference only; not the recommended safe minimum for whole cuts',c:54,f:130,type:pref,tags:'steak beef doneness'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — medium',detail:'Preference only; not the recommended safe minimum for whole cuts',c:60,f:140,type:pref,tags:'steak beef doneness'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — medium-well',detail:'Preference only; not the recommended safe minimum for whole cuts',c:66,f:150,type:pref,tags:'steak beef doneness'},
  {group:'DONENESS PREFERENCES',name:'Beef steak — well done',detail:'Preference value; safe minimum for whole cuts is 145°F / 63°C plus a 3-minute rest',c:71,f:160,type:pref,tags:'steak beef doneness'},
  {group:'BARBECUE PREFERENCES',name:'Pulled pork — typical pull range',detail:'Texture preference; use a safe cooking temperature and check tenderness',c:91,f:195,type:pref,tags:'bbq barbecue pork shoulder butt'},
  {group:'BARBECUE PREFERENCES',name:'Brisket — typical pull range',detail:'Texture preference; tenderness varies by cut and cooking method',c:93,f:200,type:pref,tags:'bbq barbecue beef brisket'},
  {group:'FRYING & OIL',name:'Deep-frying oil',detail:'Common range for many fried foods; use the recipe’s recommended temperature',c:177,f:350,type:pref,tags:'fry frying oil deep fry doughnuts fries'}
 ];
 const fmt=n=>typeof n==='number'?`${n} °C / ${Math.round(n*9/5+32)} °F`:n;
 function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=entries.filter(e=>(e.name+' '+e.detail+' '+e.group+' '+e.tags).toLowerCase().includes(q));
  if(!filtered.length){results.innerHTML='<div class="temp-empty">No matching temperatures. Try another food or term.</div>';return;}
  let last='';
  results.innerHTML=filtered.map(e=>{
   const heading=e.group!==last?`<h4 class="temp-group">${e.group}</h4>`:'';last=e.group;
   const value=typeof e.c==='number'?`${e.c} °C / ${e.f} °F`:'Cook until opaque and done';
   const kind=e.type===safe?'safe':(e.type==='Oil temp'?'oil':'preference');
   const label=e.type===safe?'♧ USDA safe min':e.type==='Oil temp'?'♢ Oil temp':e.type;
   return `${heading}<article class="temp-row"><div class="temp-name"><strong>${e.name}</strong><div class="temp-detail">${e.detail}</div></div><div class="temp-right"><div class="temp-value">${value}</div><span class="temp-chip ${kind}">${label}</span></div></article>`;
  }).join('');
 }
 search.addEventListener('input',render);render();
 const jump=document.getElementById('cookingTempsJumpBtn');if(jump)jump.addEventListener('click',()=>{const b=document.getElementById('openCookingTempsMenuBtn');if(b)b.click();});
})();

// Interactive measurement converter
(()=>{
 const $c=id=>document.getElementById(id); if(!$c('measurementConverter'))return;
 const units=[['Cups','cup',236.588],['Tablespoons','tbsp',14.7868],['Teaspoons','tsp',4.92892],['Fluid ounces','floz',29.5735],['Milliliters','ml',1],['Liters','l',1000]];
 const weights=[['Grams','g',1],['Kilograms','kg',1000],['Ounces','oz',28.3495],['Pounds','lb',453.592]];
 const gramsPerCup={water:236.588,flour:125,sugar:200,brown:215,butter:227,oats:90}; let activeVolume='cup',activeWeight='g',volumeBase=236.588,weightBase=236.588;
 function rowHtml(list,type){return list.map(([label,key])=>`<div style="display:grid;grid-template-columns:minmax(110px,1fr) minmax(100px,40%) 44px;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)"><label for="cv_${type}_${key}" style="font-weight:500">${label}</label><input id="cv_${type}_${key}" type="number" min="0" step="any" value="${key==='cup'&&type==='v'?1:key==='g'&&type==='w'?237:0}" inputmode="decimal" aria-label="${label}" style="text-align:right;padding:10px"><span class="help">${key==='floz'?'fl oz':key}</span></div>`).join('')}
 $c('volumeRows').innerHTML=rowHtml(units,'v');$c('weightRows').innerHTML=rowHtml(weights,'w');
 function fmt(n){if(!Number.isFinite(n))return '';return Number(n.toFixed(4)).toString()}
 function renderVolume(sourceType,sourceKey,value){const ing=$c('converterIngredient').value,gpc=gramsPerCup[ing];let ml;if(sourceType==='v')ml=value*units.find(x=>x[1]===sourceKey)[2];else {let g=value*weights.find(x=>x[1]===sourceKey)[2];ml=g/(gpc/236.588)};units.forEach(([l,k,mlper])=>{const el=$c('cv_v_'+k);if(el && !(sourceType==='v'&&sourceKey===k))el.value=fmt(ml/mlper)});let grams=ml/236.588*gpc;weights.forEach(([l,k,per])=>{const el=$c('cv_w_'+k);if(el && !(sourceType==='w'&&sourceKey===k))el.value=fmt(grams/per)});}
 units.forEach(([l,k])=>$c('cv_v_'+k).addEventListener('input',e=>{if(e.target.value==='')return;renderVolume('v',k,Number(e.target.value))}));weights.forEach(([l,k])=>$c('cv_w_'+k).addEventListener('input',e=>{if(e.target.value==='')return;renderVolume('w',k,Number(e.target.value))}));$c('converterIngredient').addEventListener('change',()=>renderVolume('v','cup',Number($c('cv_v_cup').value||0)));
 document.querySelectorAll('[data-convert-tab]').forEach(btn=>btn.addEventListener('click',()=>{const tab=btn.dataset.convertTab;['volume','count','temperature'].forEach(k=>$c('converter'+k[0].toUpperCase()+k.slice(1)).classList.toggle('hidden',k!==tab));document.querySelectorAll('[data-convert-tab]').forEach(b=>{const on=b===btn;b.classList.toggle('alt',!on);b.setAttribute('aria-selected',String(on))})}));
 function count(){let n=Math.max(0,Number($c('countInput').value)||0),u=$c('countUnit').value,pieces=u==='dozen'?n*12:u==='halfdozen'?n*6:u==='pair'?n*2:n;$c('countResults').innerHTML=`<strong>${fmt(pieces)} pieces / items</strong><p>${fmt(pieces/12)} dozen</p><p>${fmt(pieces/6)} half-dozen</p><p>${fmt(pieces/2)} pairs</p>`}$c('countInput').addEventListener('input',count);$c('countUnit').addEventListener('change',count);count();
 function temp(){let v=Number($c('tempInput').value)||0,c=$c('tempUnit').value==='F'?(v-32)*5/9:v,f=c*9/5+32,gas=c<110?'—':c<135?'¼':c<150?'1':c<165?'2':c<180?'3–4':c<195?'5':c<210?'6':c<225?'7–8':'9';$c('tempResults').innerHTML=`<p><strong>${fmt(f)} °F</strong></p><p><strong>${fmt(c)} °C</strong></p><p>Approximate gas mark: ${gas}</p>`}$c('tempInput').addEventListener('input',temp);$c('tempUnit').addEventListener('change',temp);temp();
 const jump=$c('converterJumpBtn');if(jump)jump.addEventListener('click',()=>showPage('measurement'));
 renderVolume('v','cup',1);
})();



// Keep every expandable menu closed until the user opens it. After a choice
// (a menu action or recipe category), close all open details panels.
document.addEventListener('click',event=>{
 const target=event.target;
 // Close any open dropdown when the click lands outside its panel.
 // The centered modal backdrop is a pseudo-element on the <details> itself,
 // so a click whose target is the menu container also dismisses it.
 document.querySelectorAll('details[open]').forEach(panel=>{
   if(target===panel || !panel.contains(target)) panel.open=false;
 });
});

document.querySelectorAll('[data-tool-back]').forEach(btn=>btn.addEventListener('click',()=>{const d=btn.closest('details');if(d)d.open=false;const top=document.getElementById('bakingToolsDropdown');if(top){top.open=true;top.scrollIntoView({behavior:'smooth',block:'start'})}}));

