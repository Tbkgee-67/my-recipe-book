
/* app-tools.js
 * Extracted from Keep-working-index.html.
 * Original inline script order is preserved within this file.
 * Keep this file loaded after app-core.js and app-tools.js as applicable.
 */

/* ===== original line 2575 (original line 2575) ===== */
(()=> {
'use strict';
const $=id=>document.getElementById(id);
const KEY='myRecipeBook_sourdough_journal_v1';
const blank=()=>({name:'',home:'counter',interval:'24',custom:24,createdAt:'',entries:[],reminders:false,lastNotice:0});
let data=blank(), photoData='';
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&typeof v==='object')data={...blank(),...v};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){alert('The journal could not be saved. Device storage may be full; export your journal and remove some large photos.');}};
const fmt=v=>v?new Date(v).toLocaleString():'Not recorded';
const localInput=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,16);};
const interval=()=>data.interval==='custom'?Math.max(1,Number(data.custom)||24):Number(data.interval)||24;
const last=()=>data.entries.length?data.entries[0]:null;
const due=()=>{const e=last();return e?new Date(new Date(e.at).getTime()+interval()*3600000):null;};
function collect(){data.name=$('sjName').value.trim();data.home=$('sjHome').value;data.interval=$('sjInterval').value;data.custom=Number($('sjCustom').value)||24;}
function fill(){ $('sjName').value=data.name||'';$('sjHome').value=data.home||'counter';$('sjInterval').value=data.interval||'24';$('sjCustom').value=data.custom||24;$('sjCustomWrap').classList.toggle('hidden',data.interval!=='custom'); }
function render(){
 const e=last(), d=due(), now=new Date();
 $('sjLastFed').textContent=e?fmt(e.at):'Not recorded';
 $('sjNextFed').textContent=d?fmt(d):'Not scheduled';
 $('sjAge').textContent=data.createdAt?Math.max(0,Math.floor((now-new Date(data.createdAt))/86400000))+' days':'Not set';
 $('sjRiseSummary').textContent=e&&e.rise?e.rise+'%':(e&&e.peakHours?e.peakHours+' hours to peak':'Not recorded');
 const status=!e?'Not started':!d?'Active':now>=d?'Feeding due':'On schedule';
 $('sjHealth').textContent=status;
 $('sjDueMessage').textContent=!e?'Save your first feeding entry to start your journal.':now>=d?'Your next feeding is due. Last feeding: '+fmt(e.at)+'.':'Next feeding is due in '+Math.max(0,Math.ceil((d-now)/3600000))+' hour(s).';
 const list=$('sjEntries');list.innerHTML='';
 if(!data.entries.length){list.innerHTML='<p class="muted">No entries yet.</p>';return;}
 data.entries.slice(0,100).forEach((v,i)=>{
  const card=document.createElement('div');card.className='panel';card.style.margin='8px 0';
  const title=document.createElement('strong');title.textContent=fmt(v.at)+' — '+(v.ratio||'Feeding');
  const details=document.createElement('p');details.style.margin='6px 0';details.textContent=[
   'Ratio '+(v.ratio||'—'),
   'Starter '+(v.starterG??'—')+' g / water '+(v.waterG??'—')+' g / flour '+(v.flourG??'—')+' g',
   v.flourType?'Flour: '+v.flourType:'',
   v.temp!==''&&v.temp!=null?'Temperature: '+v.temp+' °C':'',
   v.rise?'Rise: '+v.rise+'%':'',
   v.peakHours?'Peak: '+v.peakHours+' hours':'',
   v.smell?'Smell: '+v.smell:'',
   v.texture?'Texture: '+v.texture:'',
   v.notes||''
  ].filter(Boolean).join(' • ');
  card.append(title,details);
  if(v.photo){const img=document.createElement('img');img.src=v.photo;img.alt='Starter photo';img.style='max-width:150px;max-height:150px;border-radius:8px;display:block;margin:6px 0';card.appendChild(img);}
  const del=document.createElement('button');del.type='button';del.className='alt';del.textContent='Delete entry';del.addEventListener('click',()=>{if(confirm('Delete this feeding entry?')){data.entries.splice(i,1);save();render();}});
  card.appendChild(del);list.appendChild(card);
 });
 checkReminder();
}
function checkReminder(){
 const d=due();if(!d||new Date()<d||!data.reminders||!('Notification'in window)||Notification.permission!=='granted')return;
 if(Date.now()-(data.lastNotice||0)<12*3600000)return;
 try{new Notification('Sourdough feeding due',{body:(data.name||'Your starter')+' is due for feeding.',tag:'sourdough-'+KEY});data.lastNotice=Date.now();save();}catch(e){}
}
function resetEntryForm(){ $('sjFedAt').value=localInput(new Date());$('sjRatio').value='1:1:1';$('sjStarterG').value=25;$('sjWaterG').value=25;$('sjFlourG').value=25;$('sjFlourType').value='';$('sjTemp').value='';$('sjRise').value='';$('sjPeakHours').value='';$('sjSmell').value='';$('sjTexture').value='';$('sjFeedNotes').value='';$('sjPhoto').value='';$('sjPhotoPreview').src='';$('sjPhotoPreview').classList.add('hidden');photoData='';}
function logFeed(useNow=false){
 collect();
 const at=useNow?new Date().toISOString():new Date($('sjFedAt').value).toISOString();
 if(!at||at==='Invalid Date'){alert('Please enter a valid feeding date and time.');return;}
 const entry={at,ratio:$('sjRatio').value,starterG:Number($('sjStarterG').value)||0,waterG:Number($('sjWaterG').value)||0,flourG:Number($('sjFlourG').value)||0,flourType:$('sjFlourType').value.trim(),temp:$('sjTemp').value,rise:$('sjRise').value,peakHours:$('sjPeakHours').value,smell:$('sjSmell').value,texture:$('sjTexture').value,notes:$('sjFeedNotes').value.trim(),photo:photoData};
 data.entries.unshift(entry);data.entries=data.entries.slice(0,100);if(!data.createdAt)data.createdAt=at;data.lastNotice=0;
 save();resetEntryForm();render();
}
['sjName','sjHome','sjInterval','sjCustom'].forEach(id=>$(id).addEventListener('change',()=>{collect();save();$('sjCustomWrap').classList.toggle('hidden',data.interval!=='custom');render();}));
$('sjLogFeed').addEventListener('click',()=>logFeed(false));
$('sjQuickFed').addEventListener('click',()=>logFeed(true));
$('sjPhoto').addEventListener('change',e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;
 if(!f.type.startsWith('image/')){alert('Please choose an image.');return;}
 const reader=new FileReader();reader.onload=()=>{
  const img=new Image();img.onload=()=>{
   const scale=Math.min(1,900/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   photoData=c.toDataURL('image/jpeg',0.72);$('sjPhotoPreview').src=photoData;$('sjPhotoPreview').classList.remove('hidden');
  };img.src=reader.result;
 };reader.readAsDataURL(f);
});
$('sjNotify').addEventListener('click',async()=>{
 if(!('Notification'in window)){alert('This browser does not support web notifications.');return;}
 try{const p=await Notification.requestPermission();data.reminders=p==='granted';save();render();alert(p==='granted'?'Notifications are allowed. Reminders are checked while the app is running and when reopened.':'Notifications were not allowed. Check browser and phone settings.');}catch(e){alert('Could not request notification permission in this browser.');}
});
$('sjExport').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sourdough-starter-journal.json';a.click();URL.revokeObjectURL(url);
});
$('sjImportBtn').addEventListener('click',()=>$('sjImportFile').click());
$('sjImportFile').addEventListener('change',e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const v=JSON.parse(r.result);if(!v||!Array.isArray(v.entries))throw Error();if(!confirm('Replace this device journal with the imported journal?'))return;data={...blank(),...v};fill();save();render();alert('Journal imported.');}catch(err){alert('That file is not a valid starter journal.');}};r.readAsText(f);e.target.value='';
});
$('sjReset').addEventListener('click',()=>{if(!confirm('Clear the entire sourdough journal and all its entries? Export first if you want a copy.'))return;data=blank();save();fill();resetEntryForm();render();});
fill();resetEntryForm();render();
setInterval(checkReminder,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
})();

/* ===== original line 2667 (original line 2667) ===== */
(()=>{
const input=document.getElementById('substituteSearch'),out=document.getElementById('substituteResults');
if(!input||!out)return;
const data=[
{n:'Butter',a:['butter','unsalted butter','salted butter'],s:[['Neutral oil','Use ¾ cup oil for each 1 cup butter.','Makes baked goods moister and less buttery; best in quick breads, muffins and cakes.'],['Margarine','Use 1 cup for each 1 cup butter.','Choose a baking-style block; spreads may contain extra water.'],['Coconut oil','Use 1 cup for each 1 cup butter.','Use refined for a milder flavour; texture may change.']]},
{n:'Egg (one large)',a:['egg','eggs','large egg'],s:[['Ground flaxseed','Mix 1 tbsp ground flaxseed with 3 tbsp water; rest 5–10 minutes.','Good binder for cookies, muffins and quick breads; not ideal where eggs provide lift.'],['Ground chia','Mix 1 tbsp ground chia with 3 tbsp water; rest until gelled.','Adds a little texture; best as a binder.'],['Unsweetened applesauce','Use ¼ cup per egg.','Works in moist cakes and muffins; may make the result denser.'],['Mashed banana','Use ¼ cup per egg.','Adds banana flavour and moisture; best in sweet baking.']]},
{n:'Buttermilk (1 cup)',a:['buttermilk'],s:[['Milk + lemon juice or vinegar','Add 1 tbsp lemon juice or white vinegar to a measuring cup, then add milk to 1 cup. Rest 5–10 minutes.','Good for pancakes, biscuits and quick breads.'],['Plain yogurt','Use about ¾ cup yogurt thinned with ¼ cup milk or water.','Use plain, unsweetened yogurt.'] ]},
{n:'Baking powder (1 tsp)',a:['baking powder'],s:[['Baking soda + cream of tartar','Mix ¼ tsp baking soda with ½ tsp cream of tartar.','Use immediately; this provides the acid and base in baking powder.']]},
{n:'Baking soda (1 tsp)',a:['baking soda','bicarbonate of soda'],s:[['Baking powder','Use about 3 tsp baking powder for 1 tsp baking soda.','This can affect flavour and texture; reduce other acidic ingredients only if the recipe allows.']]},
{n:'Sour cream (1 cup)',a:['sour cream'],s:[['Plain Greek yogurt','Use 1 cup for 1 cup.','Closest easy swap; choose unsweetened full-fat for richer results.'],['Plain yogurt','Use 1 cup for 1 cup.','Thinner than sour cream; may make batter looser.']]},
{n:'Milk (1 cup)',a:['milk','whole milk','2% milk'],s:[['Unsweetened plant milk','Use 1 cup for 1 cup.','Choose unflavoured, unsweetened soy or oat milk for baking.'],['Evaporated milk + water','Mix ½ cup evaporated milk with ½ cup water.','Useful when regular milk is unavailable.']]},
{n:'Heavy cream (1 cup)',a:['heavy cream','whipping cream'],s:[['Milk + butter','Melt ⅓ cup butter and combine with enough milk to make 1 cup.','Useful in sauces and cooking; it will not whip like cream.'],['Evaporated milk','Use 1 cup.','Works in many soups and sauces, but is less rich and will not whip.']]},
{n:'Oil (1 cup)',a:['oil','vegetable oil','canola oil'],s:[['Melted butter','Use 1 cup for 1 cup oil.','Adds butter flavour; baked texture may be slightly different.'],['Unsweetened applesauce','Replace up to half the oil with equal volume applesauce.','Reduces fat and makes baking moister/denser; not a universal 1:1 swap for all the oil.']]},
{n:'Cornstarch (1 tbsp)',a:['cornstarch','corn starch'],s:[['All-purpose flour','Use 2 tbsp flour for each 1 tbsp cornstarch.','Needs longer cooking and gives a cloudier, less glossy sauce.'],['Arrowroot powder','Use 1 tbsp for 1 tbsp.','Good for many sauces; avoid prolonged boiling.']]},
{n:'Lemon juice (1 tbsp)',a:['lemon juice'],s:[['White vinegar','Use 1 tbsp for 1 tbsp.','Similar acidity, but flavour differs; use in small amounts.'],['Lime juice','Use 1 tbsp for 1 tbsp.','Works well where citrus flavour is suitable.']]},
{n:'Vanilla extract (1 tsp)',a:['vanilla','vanilla extract'],s:[['Maple syrup','Use 1 tsp for 1 tsp.','Adds maple flavour and a little sweetness.'],['Almond extract','Use about ¼ tsp.','Much stronger; changes the flavour noticeably.']]},
{n:'Bread flour (1 cup)',a:['bread flour'],s:[['All-purpose flour','Use 1 cup for 1 cup.','The loaf may be a little less chewy and may rise slightly less.']]},
{n:'All-purpose flour (1 cup)',a:['all-purpose flour','plain flour'],s:[['Bread flour','Use 1 cup for 1 cup.','Can make the result chewier; avoid overmixing cakes and pastries.']]},
{n:'Brown sugar (1 cup, packed)',a:['brown sugar'],s:[['White sugar + molasses','Mix 1 cup white sugar with 1 tbsp molasses for light brown, or 2 tbsp for dark brown.','Closest flavour and moisture match.'],['White sugar','Use 1 cup.','Less moisture and caramel flavour; texture may be crisper.']]},
{n:'Honey (1 cup)',a:['honey'],s:[['Granulated sugar','Use about 1¼ cups sugar plus ¼ cup extra liquid; reduce other liquid slightly if needed.','Less honey flavour; sugar does not behave exactly the same in baking.'],['Maple syrup','Use 1 cup for 1 cup.','Adds maple flavour and moisture; reduce other liquid slightly in baking.']]},
{n:'Molasses (1 cup)',a:['molasses'],s:[['Honey or dark corn syrup','Use 1 cup for 1 cup.','The flavour will be milder and less robust; colour may be lighter.']]},
{n:'Cream cheese (1 cup)',a:['cream cheese'],s:[['Neufchâtel','Use 1 cup for 1 cup.','Slightly lower fat and softer texture.'],['Thick strained Greek yogurt','Use 1 cup for 1 cup in dips and some fillings.','Tangier and less rich; not a reliable swap in cheesecake.']]},
{n:'Mayonnaise (1 cup)',a:['mayonnaise','mayo'],s:[['Plain Greek yogurt','Use 1 cup for 1 cup in dips, dressings and some salads.','Tangier and lower in fat; not suitable for every baked recipe.']]},
{n:'Fresh garlic (1 clove)',a:['garlic','fresh garlic'],s:[['Garlic powder','Use about ⅛ tsp for 1 clove.','Adjust to taste; powder is more concentrated.'],['Jarred minced garlic','Use about ½ tsp for 1 clove.','Flavour may be milder.']]},
{n:'Fresh herbs',a:['fresh herbs','parsley','basil','thyme','rosemary','cilantro','coriander leaves'],s:[['Dried herbs','Use about 1 part dried for 3 parts fresh.','Dried herbs are more concentrated; add earlier in cooking.']]}
];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function search(){const q=input.value.trim().toLowerCase();if(!q){out.innerHTML='<span class="muted">Enter an ingredient first.</span>';return;}const matches=data.filter(x=>x.n.toLowerCase().includes(q)||x.a.some(a=>a.includes(q)||q.includes(a)));if(!matches.length){out.innerHTML='<strong>No exact match found.</strong><p class="muted">Try a simpler name, such as “egg”, “butter”, “milk”, or “flour”. This guide covers common substitutions, not every ingredient.</p>';return;}out.innerHTML=matches.map(x=>'<div style="margin-bottom:14px"><h4 style="margin:0 0 8px">Replace: '+esc(x.n)+'</h4>'+x.s.map(y=>'<div style="padding:9px 0;border-top:1px solid var(--line)"><strong>'+esc(y[0])+'</strong><div>'+esc(y[1])+'</div><div class="help">'+esc(y[2])+'</div></div>').join('')+'</div>').join('');}
document.getElementById('substituteSearchBtn').addEventListener('click',search);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search();}});document.getElementById('substituteClearBtn').addEventListener('click',()=>{input.value='';out.innerHTML='<span class="muted">Enter an ingredient to see possible replacements.</span>';input.focus();});
})();

/* ===== original line 2698 (original line 2698) ===== */
(()=>{
const box=document.getElementById('pantryIngredients'),out=document.getElementById('pantryResults');
if(!box||!out)return;
const STORE='myRecipeBook_pantry_ingredients_v1';
try{box.value=localStorage.getItem(STORE)||''}catch(e){}
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stop=new Set(['and','or','of','for','to','the','a','an','as','taste','optional','divided','plus','more','about','large','small','medium','fresh','chopped','minced','sliced','diced','softened','melted','room','temperature','unsalted','salted','packed','warm','cold','whole']);
function words(v){return String(v||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/\b\d+(?:\.\d+)?\b/g,' ').replace(/[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘]/g,' ').replace(/[^a-z\s-]/g,' ').split(/\s+/).map(w=>w.replace(/s$/,'')).filter(w=>w.length>1&&!stop.has(w))}
function ingredientLines(v){return String(v||'').split(/\n|;|•/).map(x=>x.trim().replace(/^[-*▪‣]+\s*/, '')).filter(Boolean)}
function getPantry(){return [...new Set(box.value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean))]}
function find(){const pantry=getPantry();try{localStorage.setItem(STORE,box.value)}catch(e){}
 if(!pantry.length){out.innerHTML='<span class="muted">Enter at least one ingredient you have.</span>';return}
 const pantryWords=new Set(pantry.flatMap(words));
 let saved=[];try{saved=JSON.parse(localStorage.getItem('myRecipeBook_v1')||'[]')}catch(e){}
 const recipes=Array.isArray(saved)?saved.map(r=>({id:String(r.id||''),title:String(r.title||r.name||'Untitled recipe'),ingredients:String(r.ingredients||'')})):[];
 display(recipes,pantry);
}
function display(recipes,pantry){const pantryWords=new Set(pantry.flatMap(words));const results=recipes.map(r=>{const lines=ingredientLines(r.ingredients);const matched=[],missing=[];for(const line of lines){const ws=words(line);const ok=ws.some(w=>pantryWords.has(w))||pantry.some(p=>line.toLowerCase().includes(p.toLowerCase())||p.toLowerCase().includes(line.toLowerCase()));(ok?matched:missing).push(line)}return{r,matched,missing,total:lines.length,score:lines.length?matched.length/lines.length:0}}).filter(x=>x.matched.length).sort((a,b)=>b.score-a.score||b.matched.length-a.matched.length||a.r.title.localeCompare(b.r.title));
 if(!results.length){out.innerHTML='<strong>No close matches yet.</strong><p class="muted">Try broader ingredient names (for example, “flour” instead of “bread flour”), or add more ingredients to your list. Only recipes already saved in My Recipe Book are searched.</p>';return}
 out.innerHTML='<p class="help">Found '+results.length+' matching saved recipe'+(results.length===1?'':'s')+'. Matches are estimates based on ingredient wording.</p>'+results.map(x=>'<article style="padding:11px 0;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><strong>'+esc(x.r.title)+'</strong><span class="pill">'+x.matched.length+'/'+x.total+' ingredients</span></div><div style="margin-top:7px"><strong>Have:</strong> '+esc(x.matched.join('; '))+'</div>'+(x.missing.length?'<div style="margin-top:5px"><strong>Still need:</strong> '+esc(x.missing.join('; '))+'</div>':'<div style="margin-top:5px;color:#28723a"><strong>You appear to have everything listed!</strong></div>')+'<div class="actions" style="margin-top:8px"><button type="button" data-view="'+esc(x.r.id)+'">View recipe</button></div></article>').join('');
}

document.getElementById('pantryFindBtn').addEventListener('click',find);
box.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();find()}});
document.getElementById('pantryClearBtn').addEventListener('click',()=>{box.value='';try{localStorage.removeItem(STORE)}catch(e){}out.innerHTML='<span class="muted">Your pantry list has been cleared. Add ingredients and tap Find recipes.</span>';box.focus()});
})();

/* ===== original line 2726 (original line 2726) ===== */
(()=> {
 const $=id=>document.getElementById(id);
 const ids=['dcMeatWeight','dcWeightUnit','dcTargetPpm','dcNitritePct','dcSaltPct','dcSugarPct'];
 const out=$('dcResults'); if(!out)return;
 const fmt=n=>Number(n.toFixed(3)).toString();
 function calculate(){
  const [raw,unit,ppmRaw,nitriteRaw,saltRaw,sugarRaw]=ids.map(id=>$(id).value);
  const weight=Number(raw),ppm=Number(ppmRaw),nitrite=Number(nitriteRaw),saltPct=Number(saltRaw),sugarPct=Number(sugarRaw);
  if(!raw||!ppmRaw||!nitriteRaw||saltRaw===''||sugarRaw===''||![weight,ppm,nitrite,saltPct,sugarPct].every(Number.isFinite)||weight<=0||ppm<=0||nitrite<=0||nitrite>=100||saltPct<0||sugarPct<0){
   out.classList.remove('hidden');out.innerHTML='<strong>Check your entries.</strong><p>Enter a positive meat weight and nitrite target, a valid Cure #1 nitrite percentage, and non-negative salt and sugar percentages.</p>';return;
  }
  const meatG=weight*(unit==='lb'?453.59237:1);
  const cureG=meatG*ppm/1000000/(nitrite/100);
  const saltInCureG=cureG*(1-nitrite/100);
  const targetSaltG=meatG*saltPct/100;
  const plainSaltG=targetSaltG-saltInCureG;
  const sugarG=meatG*sugarPct/100;
  const totalG=cureG+Math.max(0,plainSaltG)+sugarG;
  let html='<h4 style="margin-top:0">🥓 Results</h4><p><strong>Meat weight:</strong> '+fmt(meatG)+' g</p><p><strong>Cure #1 weight:</strong> '+fmt(cureG)+' g</p>';
  if(plainSaltG < -0.0005){html+='<p style="color:#a63e32"><strong>Warning:</strong> The salt already contained in Cure #1 exceeds the desired total salt amount. These inputs do not fit together. Do not use this result; check your tested recipe and product label.</p>';}
  else {html+='<p><strong>Salt weight:</strong> '+fmt(plainSaltG)+' g</p>';}
  html+='<p><strong>Sugar weight:</strong> '+fmt(sugarG)+' g</p><p><strong>Total:</strong> '+fmt(totalG)+' g</p><p class="help">Salt weight is the additional plain salt after subtracting the salt contribution from Cure #1. Total is the sum of the ingredients to add.</p>';
  out.innerHTML=html;out.classList.remove('hidden');
 }
 $('dcCalculateBtn').addEventListener('click',calculate);
 $('dcClearBtn').addEventListener('click',()=>{ids.forEach(id=>$(id).value=({dcWeightUnit:'g',dcNitritePct:'6.25',dcSaltPct:'2',dcSugarPct:'1'}[id]??''));out.classList.add('hidden');out.innerHTML='';});
})();

/* ===== welcomeGuideScript (original line 2818) ===== */
(()=>{
 const $=id=>document.getElementById(id);
 const dlg=$('welcomeGuideDlg');
 if(!dlg||!$('openWelcomeGuide'))return;
 const featureSteps=[
  {page:'recipesPage',icon:'📖',title:'1. Recipe Collection, Search & Sorting',desc:'The Recipes page is your home page. Tap anywhere on a recipe card to open it. Use Search to find recipes by name or ingredient, the Categories menu to filter your collection, and the sort menu to arrange recipes by recently updated, name, or oldest first. Use Favorites to find recipes you have marked.'},
  {page:'detailDlg',icon:'🍞',title:'2. Reading & Cooking from a Recipe',desc:'Open a recipe card to see its ingredients and directions. Use Edit to change it, the star to add or remove it from Favorites, Print or Share to use it elsewhere, and the zoom controls to adjust the text. Active Cooking helps you follow the directions while you work; use the baking timer beneath it for timed steps. Voice commands and Read Recipe controls are available on the recipe screen when supported by your browser.'},
  {page:'toolsPage',icon:'🍳',title:'Cooking History',desc:'Open Tools & Settings → App Tools & Settings → Cooking History to review recipes you have cooked. Search past records, edit notes, see your most-cooked recipes, or open a recipe to cook it again. Cooking history is saved automatically and included in backups.'},
  {page:'categoriesPage',icon:'📂',title:'3. Category Manager',desc:'On the home page, open the Categories menu to filter recipes. To manage the list, go to Tools & Settings → Baking Tools → Category Manager. Add, rename, delete, and arrange categories or subcategories, then save your changes. Choose a category when adding or editing a recipe.'},
  {page:'calendarPage',icon:'📅',title:'4. Recipe Calendar & Daily Tasks',desc:'Go to Tools & Settings → Baking Tools → Recipe Calendar & Daily Tasks. Choose a saved recipe and a start date, then enter one task per day and add the plan. Move between months, select a date to see its tasks, and check off tasks as you complete them.'},
  {page:'timerPage',icon:'⏱️',title:'5. Baking Timer',desc:'Go to Tools & Settings → Baking Tools → Baking Timer, or add it to Quick Tools in the header. Enter minutes and seconds, tap Start, and use Stop or Reset as needed. It is handy for dough rests, proofing, and baking.'},
  {page:'hydrationPage',icon:'💧',title:'6. Sourdough Hydration Calculator',desc:'Open Quick Tools in the page header and choose Sourdough Hydration Calculator. Enter additional flour and starter weights, choose the starter hydration, desired dough hydration, and salt percentage, then Calculate. The calculation includes the flour and water already in your starter. A sourdough video link is also provided on the page.'},
  {page:'doughPage',icon:'🍞',title:'7. Dough Calculator',desc:'Go to Tools & Settings → Baking Tools → Dough Calculator. Choose a dough preset and fermentation option, enter your batch details, and calculate to see ingredient weights and dough portions. You can copy or print the resulting formula.'},
  {page:'bakingPage',icon:'🥩',title:'8. EQ Dry Cure Calculator',desc:'Open the Dry Cure Calculator from Quick Tools in the header if it is in your selected shortcuts. Enter the meat weight and unit, check the curing-salt label and select its nitrite percentage, then set the desired salt, sugar, and nitrite values. Review the calculated amounts carefully and follow a tested, safe curing recipe; this calculator does not replace food-safety guidance.'},
  {page:'caloriePage',icon:'🥗',title:'9. Calorie Calculator',desc:'Go to Tools & Settings → Baking Tools → Calorie Calculator. Search for or select an ingredient, enter the amount, and use the calculator to estimate the calories for the ingredients or quantities you are checking. Review the displayed total.'},
  {page:'sugarNutritionPage',icon:'🍎',title:'10. Sugar & Nutrition Checker',desc:'Go to Tools & Settings → Baking Tools → Sugar & Nutrition Checker. Search for a food or ingredient, enter the amount, and review the sugar and nutrition estimate. Use the save option for a custom food when available.'},
  {page:'cookingTempsPage',icon:'🌡️',title:'11. Cooking Temperatures',desc:'Go to Tools & Settings → Baking Tools → Cooking Temperatures. Find the food in the reference list and use the temperature information as a guide when checking whether it is cooked. Follow the appropriate food-safety guidance for the food you are preparing.'},
  {page:'measurementPage',icon:'📏',title:'12. Measurement Converter',desc:'Go to Tools & Settings → Baking Tools → Measurement Converter. Choose the conversion and, where required, the ingredient. Enter an amount and read the converted measurement. Gram conversions depend on the selected ingredient.'},
  {page:'substitutesPage',icon:'🔄',title:'13. Ingredient Substitutes',desc:'Go to Tools & Settings → Baking Tools → Ingredient Substitutes. Search for the ingredient you need to replace, then review the suggested alternatives and any quantity notes before using one in your recipe.'},
  {page:'pantryPage',icon:'🥕',title:'14. Pantry / What’s-in-My-Fridge Recipe Finder',desc:'Go to Tools & Settings → Baking Tools → Pantry / What’s-in-My-Fridge. Enter ingredients you already have and tap Find to look for recipe ideas that match. Use Clear to remove the current ingredient list and start again.'},
  {page:'inventoryPage',icon:'🧺',title:'15. Pantry Inventory',desc:'Go to Tools & Settings → Baking Tools → Pantry Inventory. Add each ingredient with its quantity, unit, storage location (pantry, refrigerator, or freezer), and expiry or best-before date. Search your inventory, and use the inventory in the recipe finder to help find recipes that use what you have. Inventory is saved on this device.'},
  {page:'shoppingPage',icon:'🛒',title:'16. Shopping List',desc:'Go to Tools & Settings → Baking Tools → Shopping List. Add ingredients from a recipe or type items yourself, then use the list while shopping. Your list is saved on this device.'},
  {page:'starterPage',icon:'🌱',title:'17. Sourdough Starter & Dough Journal',desc:'Tap the starter/jar icon in the page header to open the journal. Record starter feedings and dough progress, including notes such as time, temperature, and rise observations. Save entries to track how your starter and dough are behaving.'},
  {page:'toolsPage',icon:'🧰',title:'18. Find Tools & Quick Tools',desc:'Open Tools & Settings from the app to see the Tools page. Baking Tools are listed first; App Tools & Settings is at the bottom. Quick Tools in the page header provides shortcuts to selected functions. Use Add or remove Quick Tools to choose which shortcuts appear in that menu.'},
  {page:'backupDlg',icon:'💾',title:'19. Backup & Restore',desc:'Open Tools & Settings → App Tools & Settings → Backup / Restore, then choose Open Backup / Restore. Create a backup regularly and keep the file somewhere safe. Use the full backup option so your recipe photos are included. Restore a backup when you need to bring your recipes back.'},
  {page:'toolsPage',icon:'☁️',title:'20. Automatic Save / Backup',desc:'Open Tools & Settings → App Tools & Settings → Automatic Save / Backup. Choose a file location when your browser offers it. This feature depends on browser and device support; read the status message and continue making regular Backup / Restore copies as an extra safety measure.'},
  {page:'toolsPage',icon:'🔒',title:'21. PIN Settings',desc:'Open Tools & Settings → App Tools & Settings → PIN Settings to set or manage the app PIN. Keep your PIN somewhere safe and do not share it with anyone you do not trust.'},
  {page:'appIconDlg',icon:'🎨',title:'22. App Icon & Appearance',desc:'Open Tools & Settings → App Tools & Settings → App Icon & Appearance. Choose a built-in icon or upload your own picture. Restore TDK default returns to the standard TDK app icon. The home-screen icon may need to be refreshed or reinstalled through your device.'},
  {page:'toolsPage',icon:'➕',title:'23. Add a Recipe',desc:'Go to Tools & Settings → Baking Tools → Add Recipe. Enter the recipe title, ingredients, and directions, choose a category, and add a picture or other recipe details if you wish. Save the recipe to add it to your collection.'},
  {page:'importDlg',icon:'📥',title:'24. Import Recipes',desc:'Go to Tools & Settings → Baking Tools → Import Recipes. Choose a text file, PDF, recipe photo, or scanned page, or paste recipe or email text. Tap Review imported recipe, check and correct the title, ingredients, and directions, choose categories, then save it.'}
 ];
 const importSteps=[
  {page:'importDlg',icon:'📥',card:'📄',title:'Open Import Recipes',desc:'From the home page, open Tools & Settings, then choose Import Recipes. Tap Choose recipes to import.'},
  {page:'importDlg',icon:'📂',card:'📷',title:'Choose a recipe source',desc:'Select a text file, PDF, photo, or scanned page. You can also paste recipe or email text into the box.'},
  {page:'importDlg',icon:'🔎',card:'🧾',title:'Review the imported recipe',desc:'Tap Review imported recipe. The app opens the recipe editor so you can check the title, ingredients, and directions.'},
  {page:'importDlg',icon:'✏️',card:'📝',title:'Make any corrections',desc:'Fix recognition mistakes, choose categories, and add notes, a photo, or video and website links if you wish.'},
  {page:'recipesPage',icon:'✅',card:'📖',title:'Save your recipe',desc:'Tap Save recipe. Your new recipe will appear in your recipe collection.'}
 ];
 const installSteps=[
  {icon:'🌐',card:'🔗',title:'1. Open the website',desc:'Open your My Recipe Book website in a browser and wait for the page to finish loading. For the best install option, use an up-to-date browser and an internet connection.'},
  {icon:'📱',card:'⋮',title:'2. Android — Chrome',desc:'In Chrome, tap the three dots ⋮. Choose Install app if it appears, then confirm Install. If Chrome shows Add to Home screen instead, choose it and follow the prompts. The wording can vary by phone and Chrome version.'},
  {icon:'🌐',card:'☰',title:'3. Android — Samsung Internet or Edge',desc:'In Samsung Internet, open the browser menu and look for Add page to or Add to Home screen. In Edge, open the menu and look for Add to phone or Install. Choose the option offered by your browser and confirm. If no install option appears, try opening the website in Chrome.'},
  {icon:'🍎',card:'↥',title:'4. iPhone or iPad — Safari',desc:'Open the website in Safari. Tap Share (the square with the upward arrow), scroll down, and choose Add to Home Screen. Confirm the name and tap Add. Other iPhone browsers may show different options.'},
  {icon:'💻',card:'⬇',title:'5. Windows or Mac computer',desc:'In Chrome or Edge, look for the install icon at the right side of the address bar. You can also open the browser menu and choose Install My Recipe Book or Install this site as an app, if offered. Follow the confirmation prompt.'},
  {icon:'🏠',card:'📖',title:'6. Open the installed app',desc:'Find the My Recipe Book icon on your phone home screen, app list, or computer desktop and open it. If you only added a website shortcut, it may open in your browser rather than as a separate installed app.'},
  {icon:'🔄',card:'⬆',title:'7. Updating the app',desc:'When an update notice appears, choose Update Now and allow the page to reload. If the new version does not appear, close the app and reopen it. Your saved recipes are stored separately from the website update; keep regular backups as a precaution.'}
 ];
 let mode='features',step=0;
 function steps(){return mode==='features'?featureSteps:mode==='import'?importSteps:installSteps}
 function renderGuidePage(pageId,cardIcon){
  const host=$('guidePagePreview');if(!host)return;
  host.replaceChildren();
  const source=pageId==='importDlg'?$('importDlg'):pageId?$(pageId):null;
  let heading='My Recipe Book';
  if(source){const h=source.querySelector('h2,h3');if(h)heading=h.textContent.trim();}
  const title=document.createElement('div');title.className='guide-preview-title';title.textContent=heading;host.append(title);
  const addLine=(text,kind='line')=>{const el=document.createElement('div');el.className=kind==='action'?'guide-preview-action':kind==='card'?'guide-preview-card':'guide-preview-line';el.textContent=text;host.append(el)};
  if(pageId==='recipesPage'){
   addLine('🍞  Sourdough bread','card');addLine('🥖  French bread','card');addLine('🍕  Pizza dough','card');addLine('Categories  •  Search');
  }else if(pageId==='toolsPage'){
   const items=[...source.querySelectorAll('.tool-button')].map(x=>x.textContent.trim());(items.length?items:['Baking Tools','App Tools & Settings']).slice(0,6).forEach(x=>addLine(x,'action'));
  }else if(pageId==='importDlg'){
   addLine('Choose file or recipe photo','action');addLine('PDF  •  Text  •  Photo');addLine('Paste recipe or email text');addLine('Recipe website URL');addLine('Review imported recipe','action');
  }else if(pageId==='hydrationPage'){
   addLine('Flour weight  •  Water weight');addLine('Hydration percentage');addLine('Salt percentage');addLine('Calculate','action');
  }else if(pageId==='timerPage'){
   addLine('Minutes     5');addLine('Seconds     0');addLine('05:00','card');addLine('▶ Start   ↺ Reset','action');
  }else if(pageId==='shoppingPage'){
   addLine('Add ingredients from recipe');addLine('Choose recipe…','card');addLine('Shopping list');addLine('Flour  •  Salt  •  Butter');
  }else if(pageId==='starterPage'){
   addLine('Starter & Dough Journal');addLine('Record feeding and rise');addLine('Temperature  •  Time');addLine('Save entry','action');
  }else if(pageId==='calendarPage'){
   addLine('Choose a date','action');addLine('Add recipe to calendar');addLine('Daily tasks');
  }else if(pageId==='categoriesPage'){
   addLine('Recipe categories','card');addLine('Add or rename category');addLine('Organize subcategories');
  }else if(pageId==='doughPage'){
   addLine('Batch size and dough values');addLine('Ingredient weights');addLine('Calculate','action');
  }else if(pageId==='caloriePage'){
   addLine('Enter food and amount');addLine('Review calorie estimate');addLine('Calculate','action');
  }else if(pageId==='sugarNutritionPage'){
   addLine('Search food or ingredient');addLine('Enter amount');addLine('Check sugar & nutrition','action');
  }else if(pageId==='cookingTempsPage'){
   addLine('Find a food');addLine('Cooking temperature reference');
  }else if(pageId==='measurementPage'){
   addLine('Choose ingredient or conversion');addLine('Enter amount');addLine('View converted amount','action');
  }else if(pageId==='substitutesPage'){
   addLine('Search ingredient');addLine('Review substitute ideas');addLine('Search','action');
  }else if(pageId==='pantryPage'){
   addLine('Enter ingredients on hand');addLine('Find matching recipes','action');
  }else if(pageId==='backupDlg'){
   addLine('Create a backup','action');addLine('Restore a backup','action');addLine('Keep a safe copy');
  }else if(pageId==='appIconDlg'){
   addLine('Choose a built-in icon');addLine('Upload your own picture');addLine('Restore TBK default','action');
  }else if(pageId==='detailDlg'){
   addLine('Ingredients and directions');addLine('Edit  •  Favourite  •  Print');addLine('Share  •  Zoom  •  Active Cooking');
  }else{
   addLine(cardIcon||'Explore your app','card');addLine('Your tools and recipe pages');addLine('Tap to open a section');
  }
 }
 function draw(){
  const list=steps(),item=list[step],last=step===list.length-1;
  $('guideCaption').textContent=item.title;$('guideDescription').textContent=item.desc;
  $('guideBigIcon').textContent=item.icon;
  renderGuidePage(item.page||null,item.card||'');
  $('guideStepCount').textContent='Step '+(step+1)+' of '+list.length;
  $('guideProgressBar').style.width=((step+1)/list.length*100)+'%';
  $('guideBackBtn').disabled=step===0;$('guideNextBtn').textContent=last?'Finish ✓':'Next →';
  $('guideSkipBtn').textContent=last?'Close':'Skip';
 }
 function setMode(next){mode=next;step=0;$('guideFeaturesTab').setAttribute('aria-selected',String(mode==='features'));$('guideImportTab').setAttribute('aria-selected',String(mode==='import'));$('guideInstallTab').setAttribute('aria-selected',String(mode==='install'));$('guideFeaturesTab').classList.toggle('alt',mode!=='features');$('guideImportTab').classList.toggle('alt',mode!=='import');$('guideInstallTab').classList.toggle('alt',mode!=='install');draw()}
 const SEEN_KEY='myRecipeBook_welcomeGuide_seen_v1';
 // Existing installations are identified by their established app data/settings keys.
 const EXISTING_KEYS=['myRecipeBook_v1','myRecipeBook_categories_v1','myRecipeBook_shop_v1','myRecipeBook_pin_hash_v1','myRecipeBook_deleted_categories_v1','myRecipeBook_quick_tools_v1','myRecipeBook_categories_collapsed_v1','myRecipeBook_sourdough_journal_v1','myRecipeBook_drive_auto_sync_v1'];
 function alreadyUsedApp(){try{return EXISTING_KEYS.some(key=>localStorage.getItem(key)!==null)}catch(e){return true}}
 function updateWelcomeLaunchVisibility(){const launch=$('welcomeGuideLaunch');if(launch)launch.classList.remove('hidden')}
 function markSeen(){try{localStorage.setItem(SEEN_KEY,'yes')}catch(e){/* Tutorial remains usable if storage is unavailable. */}updateWelcomeLaunchVisibility()}
 function closeGuide(){markSeen();if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open')}
 function open(){setMode('features');if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','')}
 $('openWelcomeGuide').addEventListener('click',open);
 $('replayWelcomeGuideFromTools').addEventListener('click',open);
 $('closeWelcomeGuide').addEventListener('click',closeGuide);
 $('guideFeaturesTab').addEventListener('click',()=>setMode('features'));
 $('guideImportTab').addEventListener('click',()=>setMode('import'));
 $('guideInstallTab').addEventListener('click',()=>setMode('install'));
 $('guideBackBtn').addEventListener('click',()=>{if(step>0){step--;draw()}});
 $('guideNextBtn').addEventListener('click',()=>{if(step<steps().length-1){step++;draw()}else closeGuide()});
 $('guideSkipBtn').addEventListener('click',closeGuide);
 $('guideReplayBtn').addEventListener('click',()=>{step=0;draw()});
 dlg.addEventListener('click',e=>{if(e.target===dlg)closeGuide()});
 dlg.addEventListener('cancel',markSeen);
 draw();
 // Show only on a genuinely fresh install; never interrupt an established recipe collection.
 let seen=false;try{seen=localStorage.getItem(SEEN_KEY)==='yes'}catch(e){seen=true}
 updateWelcomeLaunchVisibility();
 if(!seen&&!alreadyUsedApp())window.setTimeout(()=>{if(!dlg.open)open()},700);
})();

/* ===== recipeBookUpdateChecker (original line 2969) ===== */
(()=>{
 const notice=document.getElementById('recipeBookUpdateNotice');
 const current=document.querySelector('meta[name="my-recipe-book-build"]');
 if(!notice||!current||!location.protocol.startsWith('http'))return;
 const build=current.content;
 const key='myRecipeBook_updateLaterBuild_v1';
 let updateFound=false,checking=false;
 function show(){updateFound=true;notice.style.display='block';}
 async function check(){
  if(checking||document.visibilityState==='hidden')return;
  checking=true;
  try{
   const url=new URL(location.href);url.searchParams.set('recipebook_update_check',String(Date.now()));
   const response=await fetch(url.href,{cache:'no-store',credentials:'same-origin'});
   if(!response.ok)return;
   const source=await response.text();
   const match=source.match(/<meta\s+name=["']my-recipe-book-build["']\s+content=["']([^"']+)["']/i);
   if(!match||match[1]===build)return;
   const normalized=source.replace(/(<meta\s+name=["']my-recipe-book-build["']\s+content=["'])[^"']+(["'])/i,'$1BUILD_HASH$2');
   const bytes=new TextEncoder().encode(normalized);
   const digest=await crypto.subtle.digest('SHA-256',bytes);
   const remoteHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   if(remoteHash!==build){show();}
  }catch(e){/* Offline or temporarily unavailable: keep the app usable. */}
  finally{checking=false;}
 }
 document.getElementById('recipeBookUpdateLater').addEventListener('click',()=>{notice.style.display='none';try{localStorage.setItem(key,build)}catch(e){}});
 document.getElementById('recipeBookUpdateNow').addEventListener('click',async()=>{
  const button=document.getElementById('recipeBookUpdateNow');button.disabled=true;button.textContent='Updating…';
  try{
   if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>{})));}
   const u=new URL(location.href);u.searchParams.set('recipebook_refresh',String(Date.now()));location.replace(u.href);
  }catch(e){location.reload();}
 });
 check();
 window.setInterval(check,10*60*1000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
})();

/* ===== recipeBookInstallInviteScript (original line 3037) ===== */
(()=>{
 'use strict';
 const dlg=document.getElementById('recipeBookInstallInvite');
 const installBtn=document.getElementById('recipeBookInstallAction');
 const laterBtn=document.getElementById('recipeBookInstallLater');
 const instructions=document.getElementById('recipeBookInstallInstructions');
 if(!dlg||!installBtn||!laterBtn)return;
 const DISMISSED_KEY='myRecipeBook_installInviteDismissed_v1';
 let installPrompt=null,shown=false;
 const isInstalled=()=>{
  try{return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone===true ||
    document.referrer.startsWith('android-app://');}
  catch(e){return false}
 };
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  installBtn.textContent='⬇ Install My Recipe Book';
  installBtn.hidden=false;
 });
 window.addEventListener('appinstalled',()=>{
  installPrompt=null;
  try{localStorage.setItem(DISMISSED_KEY,'installed')}catch(e){}
  if(dlg.open)dlg.close();
 });
 function deviceInstructions(){
  const ua=navigator.userAgent||'';
  if(/iPhone|iPad|iPod/i.test(ua)){
   return '<strong>Install on iPhone or iPad</strong><br>Tap the Share button in Safari, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>. If you are using another browser, open this website in Safari first.';
  }
  if(/Android/i.test(ua)){
   return '<strong>Install on Android</strong><br>Tap your browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then follow the prompts.';
  }
  return '<strong>Install on your computer</strong><br>In Chrome or Edge, look for the install icon in the address bar, or open the browser menu and choose <strong>Install My Recipe Book</strong> / <strong>Install this site as an app</strong>, if available.';
 }
 function show(){
  if(shown||isInstalled())return;
  try{if(localStorage.getItem(DISMISSED_KEY))return;}catch(e){}
  shown=true;
  if(!dlg.open){if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');}
 }
 function schedule(){
  if(isInstalled())return;
  window.setTimeout(()=>{
   const welcome=document.getElementById('welcomeGuideDlg');
   if(welcome&&welcome.open){
    welcome.addEventListener('close',()=>window.setTimeout(show,500),{once:true});
   }else show();
  },2200);
 }
 installBtn.addEventListener('click',async()=>{
  if(installPrompt){
   const promptEvent=installPrompt;
   installPrompt=null;
   try{
    await promptEvent.prompt();
    const choice=await promptEvent.userChoice;
    if(choice&&choice.outcome==='accepted'){
     try{localStorage.setItem(DISMISSED_KEY,'installed')}catch(e){}
     if(dlg.open)dlg.close();
     return;
    }
   }catch(e){}
   installBtn.textContent='Install option not available';
   instructions.innerHTML=deviceInstructions();
   instructions.hidden=false;
   return;
  }
  instructions.innerHTML=deviceInstructions();
  instructions.hidden=false;
  installBtn.textContent='See installation instructions';
 });
 function dismiss(){
  try{localStorage.setItem(DISMISSED_KEY,'yes')}catch(e){}
  if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open');
 }
 laterBtn.addEventListener('click',dismiss);
 dlg.addEventListener('click',event=>{if(event.target===dlg)dismiss()});
 dlg.addEventListener('cancel',dismiss);
 schedule();
})();

/* ===== original line 3124 (original line 3124) ===== */
(function(){
 const $=id=>document.getElementById(id);
 const ids=['doughPreset','doughCount','doughPortion','doughFlourChoice','doughDurumPct','doughHydration','doughSalt','doughYeast','doughOil','doughSugar','doughStarter','doughFerment','doughCustomHours'];
 const presets={
  pizza:{count:4,portion:250,flour:'apdurum',durum:30,hydration:62,salt:2.5,yeast:0.3,oil:1,sugar:0,starter:0},
  calzone:{count:4,portion:250,flour:'apdurum',durum:25,hydration:60,salt:2.2,yeast:0.6,oil:2,sugar:1,starter:0},
  panzerotti:{count:4,portion:180,flour:'apdurum',durum:30,hydration:58,salt:2.2,yeast:0.7,oil:3,sugar:1,starter:0},
  bread:{count:1,portion:900,flour:'bread',durum:0,hydration:68,salt:2,yeast:1,oil:0,sugar:0,starter:0},
  sourdough:{count:1,portion:900,flour:'bread',durum:0,hydration:75,salt:2,yeast:0,oil:0,sugar:0,starter:20},
  custom:{count:4,portion:250,flour:'ap',durum:30,hydration:65,salt:2,yeast:0.5,oil:0,sugar:0,starter:0}
 };
 const fmt=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
 function setPreset(){
  const p=presets[$('doughPreset').value];Object.entries({doughCount:p.count,doughPortion:p.portion,doughFlourChoice:p.flour,doughDurumPct:p.durum,doughHydration:p.hydration,doughSalt:p.salt,doughYeast:p.yeast,doughOil:p.oil,doughSugar:p.sugar,doughStarter:p.starter}).forEach(([id,v])=>$(id).value=v);
  updateFields();calculate();
 }
 function updateFields(){
  $('doughDurumWrap').style.display=['apdurum','breaddurum','custom'].includes($('doughFlourChoice').value)?'block':'none';
  $('doughCustomWrap').style.display=$('doughFerment').value==='custom'?'block':'none';
 }
 function calculate(){
  const count=Math.max(1,Math.floor(Number($('doughCount').value))),portion=Number($('doughPortion').value);
  const vals=['doughHydration','doughSalt','doughYeast','doughOil','doughSugar','doughStarter'].map(id=>Number($(id).value));
  const [hydration,saltPct,yeastPct,oilPct,sugarPct,starterPct]=vals;
  const out=$('doughResults');
  if(!Number.isFinite(count)||!Number.isFinite(portion)||count<1||portion<=0||vals.some(v=>!Number.isFinite(v)||v<0)||hydration>150||starterPct>100){out.innerHTML='<strong>Please enter valid positive dough weights and non-negative percentages.</strong>';return;}
  const target=count*portion, flourFactor=1+hydration/100+saltPct/100+yeastPct/100+oilPct/100+sugarPct/100;
  const starterFactor=starterPct/100;
  const baseFlour=target/(flourFactor+starterFactor);
  const starter=baseFlour*starterFactor;
  const starterFlour=starter/2, starterWater=starter/2;
  const flourToAdd=baseFlour-starterFlour;
  const waterToAdd=baseFlour*hydration/100-starterWater;
  const salt=baseFlour*saltPct/100, yeast=baseFlour*yeastPct/100, oil=baseFlour*oilPct/100, sugar=baseFlour*sugarPct/100;
  const choice=$('doughFlourChoice').value, durumPct=choice==='durum'?100:(['apdurum','breaddurum','custom'].includes(choice)?Math.min(100,Math.max(0,Number($('doughDurumPct').value)||0)):0);
  const durum=flourToAdd*durumPct/100, mainFlour=flourToAdd-durum;
  const baseName=choice==='bread'||choice==='breaddurum'?'Bread flour':choice==='durum'?'Durum flour':'All-purpose flour';
  const mainName=choice==='custom'?'Main flour (choose your blend)':baseName;
  const fermentation=$('doughFerment').value;
  const fermentLabel=fermentation==='same'?'Same day: about 2–4 hours':fermentation==='overnight'?'Overnight: about 12–18 hours':fermentation==='custom'?$('doughCustomHours').value+' hours (custom)':fermentation+' hours cold fermentation';
  const rows=[];
  if(mainFlour>0.05)rows.push([mainName,mainFlour]);
  if(durum>0.05)rows.push(['Durum flour',durum]);
  if(waterToAdd>0.05)rows.push(['Water',waterToAdd]);
  if(starter>0.05)rows.push(['100% hydration sourdough starter',starter]);
  if(salt>0.05)rows.push(['Salt',salt]);
  if(yeast>0.05)rows.push(['Yeast',yeast]);
  if(oil>0.05)rows.push(['Oil',oil]);
  if(sugar>0.05)rows.push(['Sugar',sugar]);
  const total=rows.reduce((a,r)=>a+r[1],0);
  const lines=rows.map(r=>r[0]+': '+fmt(r[1])+' g');
  out.dataset.recipe='Dough formula\n'+lines.join('\n')+'\nTotal dough: '+fmt(total)+' g\nPortions: '+count+' × '+fmt(portion)+' g\nHydration: '+fmt(hydration)+'%\nFermentation: '+fermentLabel;
  out.innerHTML='<h3 style="margin:0 0 8px">Your dough formula</h3><p style="font-size:1.35rem;font-weight:800;color:var(--g);margin:0 0 8px">'+fmt(total)+' g total dough</p><p><strong>'+count+' portions × '+fmt(portion)+' g each</strong></p><ul>'+rows.map(r=>'<li><strong>'+r[0]+':</strong> '+fmt(r[1])+' g</li>').join('')+'</ul><p><strong>Hydration:</strong> '+fmt(hydration)+'% &nbsp; <strong>Flour blend:</strong> '+(durumPct?fmt(durumPct)+'% durum':'single flour')+'</p><p><strong>Fermentation:</strong> '+fermentLabel+'</p><p class="help">Weights are rounded for display; calculations use unrounded values.</p>';
 }
 $('doughPreset').addEventListener('change',setPreset);
 $('doughFlourChoice').addEventListener('change',()=>{updateFields();calculate()});
 $('doughFerment').addEventListener('change',()=>{updateFields();calculate()});
 ids.forEach(id=>$(id).addEventListener('input',calculate));
 $('doughCalculate').onclick=calculate;
 $('doughReset').onclick=()=>{$('doughPreset').value='pizza';setPreset();$('doughFerment').value='same';updateFields();calculate()};
 $('doughPrint').onclick=()=>{calculate();const w=window.open('','_blank');if(!w)return;w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Dough Recipe</title></head><body><h1>My Recipe Book — Dough Formula</h1><pre>'+($('doughResults').dataset.recipe||'')+'</pre></body></html>');w.document.close();w.focus();w.print()};
 $('doughCopy').onclick=async()=>{calculate();const value=$('doughResults').dataset.recipe||'';try{await navigator.clipboard.writeText(value);$('doughCopy').textContent='Copied!';setTimeout(()=>$('doughCopy').textContent='Copy ingredients',1600)}catch(e){const area=document.createElement('textarea');area.value=value;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();$('doughCopy').textContent='Copied!'}};
 $('doughBackBtn').onclick=()=>{quickToolMode=false;showPage('tools');};
 updateFields();setPreset();
})();

/* ===== browserCompatibilityEnhancement (original line 3214) ===== */
(()=>{
 'use strict';
 const KEY='myRecipeBook_browser_notice_dismissed_v1';
 const DAY=86400000;
 const safe=(fn,fallback)=>{try{return fn()}catch(e){return fallback}};
 function run(){
  if(document.getElementById('browserCompatibilityNotice'))return;
  const checks=[
   {ok:!!window.indexedDB,name:'Recipe photo storage',help:'This browser may not save recipe photos reliably. Use a current version of Chrome, Edge, Firefox, Safari, or Samsung Internet.'},
   {ok:safe(()=>{const k='__mr_storage_test';localStorage.setItem(k,'1');localStorage.removeItem(k);return true},false),name:'Local recipe settings',help:'Browser storage is blocked or unavailable. Saved recipes and settings may not persist. Enable site data and avoid private/incognito browsing.'},
   {ok:!!(window.crypto&&crypto.subtle),name:'Secure browser features',help:'Some security features are unavailable. Open the app using its HTTPS GitHub Pages address and a current browser.'},
   {ok:!!navigator.serviceWorker,name:'Offline app support',help:'This browser does not support service workers, so install/offline features may be limited.'}
  ];
  const optional=[];
  if(!( 'showSaveFilePicker' in window))optional.push('Direct save-to-folder is not available here. Use the normal backup download option instead.');
  if(!( 'SpeechRecognition' in window)&&!( 'webkitSpeechRecognition' in window))optional.push('Voice commands are not supported in this browser. You can still use the app normally and read recipe directions on screen.');
  if(!( 'beforeinstallprompt' in window))optional.push('The automatic install pop-up is not supported by every browser. Use the browser menu (or Share menu on iPhone/iPad) and choose Add to Home Screen / Install when available.');
  if(!( 'share' in navigator))optional.push('The browser share sheet is unavailable. Use the download or copy options instead.');
  const failures=checks.filter(x=>!x.ok);
  const now=Date.now();
  const last=safe(()=>Number(localStorage.getItem(KEY)||0),0);
  if(now-last<30*DAY)return;
  const panel=document.createElement('section');panel.id='browserCompatibilityNotice';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
  const close=document.createElement('button');close.type='button';close.className='compat-close';close.setAttribute('aria-label','Close browser information');close.textContent='×';
  const heading=document.createElement('h3');heading.textContent=failures.length?'Browser compatibility notice':'My Recipe Book browser check';
  const intro=document.createElement('p');intro.textContent=failures.length?'Some browser features may be limited. Your recipes may still be usable, but review the notes below.':'Your browser supports the main app storage and security features.';
  panel.append(close,heading,intro);
  if(failures.length){const list=document.createElement('ul');failures.forEach(x=>{const li=document.createElement('li');li.innerHTML='<strong></strong> ';li.querySelector('strong').textContent=x.name;li.append(document.createTextNode(' — '+x.help));list.append(li)});panel.append(list)}
  if(optional.length){const h=document.createElement('p');h.innerHTML='<strong>Optional features and alternatives:</strong>';const list=document.createElement('ul');optional.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.append(li)});panel.append(h,list)}
  const backup=document.createElement('p');backup.innerHTML='<strong>Important:</strong> Recipes are stored in this browser on this device. Regularly use Backup / Restore and keep a copy somewhere safe. Clearing browser data, using private browsing, changing browsers, or changing devices can make locally stored recipes unavailable. Include photos in your backup.';panel.append(backup);
  const actions=document.createElement('div');actions.className='compat-actions';
  const closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='alt';closeBtn.textContent='Close';
  const checkBtn=document.createElement('button');checkBtn.type='button';checkBtn.textContent='Check again';
  actions.append(checkBtn,closeBtn);panel.append(actions);document.body.append(panel);
  const dismiss=()=>{safe(()=>localStorage.setItem(KEY,String(Date.now())),null);panel.remove()};close.addEventListener('click',dismiss);closeBtn.addEventListener('click',dismiss);checkBtn.addEventListener('click',()=>{panel.remove();run()});
  if(!failures.length){heading.classList.add('compat-good')}else heading.classList.add('compat-warn');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* ===== original line 3256 (original line 3256) ===== */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const KEY='myRecipeBook_cooking_history_v1';
 let history=read(), editingId=null, selectedRecipe=null;
 function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(history));if(typeof scheduleDriveAutoSync==='function')scheduleDriveAutoSync();if(typeof scheduleFileAutoSave==='function')scheduleFileAutoSave();return true}catch(e){say('Cooking history could not be saved. Device storage may be full.',true);return false}}
 function localDate(v){const d=new Date(v||Date.now());return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
 function showHistory(){history=read();render();open('cookingHistoryDlg')}
 function openEditor(recipe,entry){selectedRecipe=recipe;editingId=entry?.id||null;$('cookingEntryHeading').textContent=entry?'Edit Cooking Record':'Record Cooking';$('cookingEntryRecipe').textContent=recipe?.title||entry?.recipeTitle||'Recipe';$('cookingEntryDate').value=localDate(entry?.cookedAt||Date.now());$('cookingEntryRating').value=String(entry?.rating||0);$('cookingEntryNotes').value=entry?.notes||'';open('cookingEntryDlg')}
 function saveEntry(){const date=new Date($('cookingEntryDate').value);if(Number.isNaN(date.getTime())){say('Choose a valid cooking date.',true);return}let entry=history.find(x=>x.id===editingId);if(!entry){entry={id:'cook_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)};history.unshift(entry)}const recipe=selectedRecipe||{};entry.recipeId=String(recipe.id||entry.recipeId||'');entry.recipeTitle=String(recipe.title||entry.recipeTitle||'Untitled recipe');entry.categories=Array.isArray(recipe.categories)?recipe.categories.slice():entry.categories||[];entry.cookedAt=date.toISOString();entry.rating=Number($('cookingEntryRating').value)||0;entry.notes=$('cookingEntryNotes').value.trim();history.sort((a,b)=>new Date(b.cookedAt)-new Date(a.cookedAt));if(persist()){close('cookingEntryDlg');render();say('Cooking history saved.')}}
 function render(){history=read();const q=($('cookingHistorySearch')?.value||'').trim().toLowerCase();const unique=new Set(history.map(x=>x.recipeId||x.recipeTitle));const counts={};history.forEach(x=>counts[x.recipeTitle]=(counts[x.recipeTitle]||0)+1);const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];$('cookingHistoryTotal').textContent=String(history.length);$('cookingHistoryUnique').textContent=String(unique.size);$('cookingHistoryTop').textContent=top?top[0]+' ('+top[1]+')':'—';const host=$('cookingHistoryList');host.replaceChildren();const list=history.filter(x=>[x.recipeTitle,(x.categories||[]).join(' '),x.notes].join(' ').toLowerCase().includes(q));if(!list.length){const p=document.createElement('p');p.className='help';p.textContent=history.length?'No cooking records match your search.':'No cooking history yet. Add cooking records from Cooking History to start.';host.append(p);return}list.forEach(entry=>{const card=document.createElement('div');card.className='panel';card.style.margin='10px 0';const h=document.createElement('h3');h.textContent=entry.recipeTitle;const meta=document.createElement('p');meta.className='help';meta.textContent=new Date(entry.cookedAt).toLocaleString()+(entry.rating?'  •  '+'★'.repeat(entry.rating):'');const notes=document.createElement('p');notes.textContent=entry.notes||'No cooking notes added.';const actions=document.createElement('div');actions.className='row';const edit=document.createElement('button');edit.type='button';edit.className='alt';edit.textContent='Edit notes / rating';edit.onclick=()=>{const recipe=(recipes||[]).find(r=>String(r.id)===String(entry.recipeId))||{id:entry.recipeId,title:entry.recipeTitle,categories:entry.categories||[]};openEditor(recipe,entry)};const again=document.createElement('button');again.type='button';again.textContent='Cook again';again.onclick=()=>{const recipe=(recipes||[]).find(r=>String(r.id)===String(entry.recipeId));if(recipe){close('cookingHistoryDlg');if($('detailDlg').open)close('detailDlg');view(recipe.id)}else say('This recipe is no longer in your collection. The history record is still saved.')};const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Delete record';del.onclick=()=>{if(!confirm('Delete this cooking history record?'))return;history=history.filter(x=>x.id!==entry.id);persist();render()};actions.append(edit,again,del);card.append(h,meta,notes,actions);host.append(card)})}
 $('openCookingHistoryBtn').addEventListener('click',showHistory);$('closeCookingHistoryBtn').addEventListener('click',()=>close('cookingHistoryDlg'));$('closeCookingEntryBtn').addEventListener('click',()=>close('cookingEntryDlg'));$('cancelCookingEntryBtn').addEventListener('click',()=>close('cookingEntryDlg'));$('saveCookingEntryBtn').addEventListener('click',saveEntry);$('cookingHistorySearch').addEventListener('input',render);
 
})();

/* ===== myRecipeBookOwnershipProtection (original line 3301) ===== */
(function(){
 const KEY='myRecipeBookTermsAccepted_2026_v1';
 function init(){
  const dlg=document.getElementById('licenseTermsDlg');
  if(!dlg)return;
  const open=()=>{if(!dlg.open)dlg.showModal()};
  document.getElementById('openTermsBtn')?.addEventListener('click',open);
  document.getElementById('footerTermsBtn')?.addEventListener('click',open);
  document.getElementById('acceptLicenseTermsBtn')?.addEventListener('click',()=>{
   try{localStorage.setItem(KEY,JSON.stringify({accepted:true,acceptedAt:new Date().toISOString(),version:'2026-v1'}));}catch(e){}
   dlg.close();
  });
  dlg.addEventListener('cancel',e=>{try{if(!localStorage.getItem(KEY))e.preventDefault();}catch(err){e.preventDefault();}});
  let accepted=false;try{accepted=!!localStorage.getItem(KEY)}catch(e){}
  if(!accepted)open();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* ===== wineMeadCalculators (original line 3328) ===== */
// Alcohol by Volume calculator (specific gravity readings).
(function initAbvCalculator(){
 const $=id=>document.getElementById(id);
 const og=$('abvOriginalGravity'), fg=$('abvFinalGravity'), results=$('abvResults');
 if(!og||!fg||!results)return;
 function calculateAbv(){
  const original=Number(og.value), final=Number(fg.value);
  if(!og.value.trim()||!fg.value.trim()||!Number.isFinite(original)||!Number.isFinite(final)){
   results.innerHTML='<h3>Estimated alcohol</h3><p>Please enter both gravity readings.</p>';return;
  }
  if(original<0.900||original>1.200||final<0.900||final>1.200){
   results.innerHTML='<h3>Check your readings</h3><p>Enter specific gravity values between 0.900 and 1.200, such as 1.060 and 1.010.</p>';return;
  }
  if(final>=original){
   results.innerHTML='<h3>No positive ABV estimate</h3><p>Final gravity should normally be lower than original gravity. Check the readings and try again.</p>';return;
  }
  const abv=(original-final)*131.25;
  const points=(original-final)*1000;
  results.innerHTML='<h3>Estimated alcohol by volume</h3><div style="font-size:2.2rem;font-weight:800;color:var(--g);margin:8px 0">'+abv.toFixed(2)+'% ABV</div><p>Gravity drop: '+points.toFixed(1)+' points</p><p class="help">Based on OG '+original.toFixed(3)+' and FG '+final.toFixed(3)+'.</p>';
 }
 $('abvCalculateBtn').onclick=calculateAbv;
 $('abvResetBtn').onclick=()=>{og.value='1.060';fg.value='1.010';results.innerHTML='<h3>Estimated alcohol</h3><p>Enter your gravity readings and tap Calculate ABV.</p>';};
 og.addEventListener('keydown',e=>{if(e.key==='Enter')calculateAbv()});
 fg.addEventListener('keydown',e=>{if(e.key==='Enter')calculateAbv()});
})();


// Sugar and honey planning calculators.
(function initSugarAndSweetnessCalculators(){
 const $id=id=>document.getElementById(id);
 const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:0});
 const toLitres=(value,unit)=>value*(unit==='US gal'?3.785411784:unit==='Imp gal'?4.54609:1);
 function wireCustom(selectId,wrapId){
  const s=$id(selectId),w=$id(wrapId); if(!s||!w)return;
  const update=()=>w.style.display=s.value==='custom'?'':'none';
  s.addEventListener('change',update); update();
 }
 wireCustom('abvBoostTarget','abvBoostCustomWrap');
 wireCustom('sweetTarget','sweetCustomWrap');

 function show(id,title,msg){const el=$id(id);if(el)el.innerHTML='<h3>'+title+'</h3>'+msg;}
 function calcBoost(){
  const enteredVolume=Number($id('abvBoostVolume').value),v=toLitres(enteredVolume,$id('abvBoostUnit').value),cur=Number($id('abvBoostCurrent').value);
  const sel=$id('abvBoostTarget').value,t=sel==='custom'?Number($id('abvBoostCustom').value):Number(sel);
  const factor=Number($id('abvBoostSweetener').value);
  if(!(v>0)||!Number.isFinite(cur)||!Number.isFinite(t)||!(factor>0)||cur<0||t>25){show('abvBoostResults','Check your entries','<p>Enter a valid batch volume and ABV values.</p>');return;}
  if(t<=cur){show('abvBoostResults','No additional sugar needed','<p>Your target must be higher than the current ABV.</p>');return;}
  const sugar=(t-cur)*17*v,amount=sugar/factor;
  show('abvBoostResults','Estimated addition','<div style="font-size:1.9rem;font-weight:800;color:var(--g)">'+fmt(amount)+' g</div><p>Approximately '+(amount/1000).toFixed(2)+' kg of '+($id('abvBoostSweetener').selectedOptions[0].text.split(' (')[0])+'.</p><p>Target increase: '+(t-cur).toFixed(1)+' percentage points ABV.</p><p class="help">This is an estimate of fermentable sugar required. Add in stages, monitor gravity, and confirm yeast tolerance.</p>');
 }
 function calcSweet(){
  const enteredVolume=Number($id('sweetVolume').value),v=toLitres(enteredVolume,$id('sweetUnit').value),cur=Number($id('sweetCurrent').value);
  const sel=$id('sweetTarget').value,t=sel==='custom'?Number($id('sweetCustom').value):Number(sel);
  const factor=Number($id('sweetSweetener').value);
  if(!(v>0)||!Number.isFinite(cur)||!Number.isFinite(t)||cur<0.990||cur>1.200||t<0.990||t>1.200||!(factor>0)){show('sweetResults','Check your entries','<p>Enter a valid batch volume and specific-gravity readings between 0.990 and 1.200.</p>');return;}
  if(t<=cur){show('sweetResults','No sweetener needed','<p>Your current specific gravity ('+cur.toFixed(3)+') is already at or above the selected target ('+t.toFixed(3)+'). Do not add sweetener based on this target.</p>');return;}
  const sugar=(t-cur)*2600*v,amount=sugar/factor;
  show('sweetResults','Estimated addition','<div style="font-size:1.9rem;font-weight:800;color:var(--g)">'+fmt(amount)+' g</div><p>Approximately '+(amount/1000).toFixed(2)+' kg of '+($id('sweetSweetener').selectedOptions[0].text.split(' (')[0])+'.</p><p>Estimated gravity increase: '+(t-cur).toFixed(3)+' SG, from '+cur.toFixed(3)+' to '+t.toFixed(3)+'.</p><p class="help">Add gradually, mix thoroughly, allow bubbles to settle, and recheck with a hydrometer. This is an estimate, not a precise residual-sugar measurement.</p>');
 }
 $id('abvBoostCalculate')?.addEventListener('click',calcBoost);
 $id('sweetCalculate')?.addEventListener('click',calcSweet);
 $id('abvBoostReset')?.addEventListener('click',()=>{$id('abvBoostVolume').value=20;$id('abvBoostUnit').value='L';$id('abvBoostCurrent').value=10;$id('abvBoostTarget').value='13';$id('abvBoostCustom').value=13.5;$id('abvBoostSweetener').value='1';wireCustom('abvBoostTarget','abvBoostCustomWrap');show('abvBoostResults','Additional fermentable sugar','<p>Enter your batch details and calculate.</p>');});
 $id('sweetReset')?.addEventListener('click',()=>{$id('sweetVolume').value=20;$id('sweetUnit').value='L';$id('sweetCurrent').value=1.000;$id('sweetTarget').value='1.010';$id('sweetCustom').value=1.015;$id('sweetSweetener').value='1';wireCustom('sweetTarget','sweetCustomWrap');show('sweetResults','Sweetener required','<p>Enter your batch volume and current specific gravity.</p>');});
})();

/* ===== wineMeadCalculatorNavigation (original line 3395) ===== */
(function wireWineMeadTools(){
 const $=id=>document.getElementById(id);
 const go=(id)=>{if(typeof window.showPage==='function')window.showPage(id)};
 $('openAbvCalculatorBtn')?.addEventListener('click',()=>go('abv'));
 $('openAbvBoostCalculatorBtn')?.addEventListener('click',()=>go('abvBoost'));
 $('openSweetnessCalculatorBtn')?.addEventListener('click',()=>go('sweetness'));
 $('abvBackBtn')?.addEventListener('click',()=>go('tools'));
 $('abvBoostBackBtn')?.addEventListener('click',()=>go('tools'));
 $('sweetBackBtn')?.addEventListener('click',()=>go('tools'));
})();

