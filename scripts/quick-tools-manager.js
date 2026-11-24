/* Phase 50: Quick Tools selection, ordering, and dropdown behavior. */
(()=>{'use strict';
const bridge=window.MRBQuickToolsBridge;
if(!bridge){console.error('Quick Tools module could not start: app bridge is missing.');return;}
const $=bridge.$;
const currentSection=()=>bridge.getCurrentSection();
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
function openQuickTool(id){const item=QUICK_TOOL_ITEMS.find(x=>x.id===id);if(!item)return;const menu=$('quickToolsDropdown');if(menu)menu.open=false;bridge.setQuickToolMode(true);if(id==='calendar'){$('toolsOpenCalendarBtn').click();return;}if(item.page==='action'){bridge.showPage('recipes');if(id==='backup')$('backupBtn').click();else if(id==='pin')$('pinSettingsBtn').click();else if(id==='addrecipe')$('addBtn').click();else if(id==='import')$('importBtn').click();else if(id==='autosave')$('autoSaveLocationBtn').click();return;}bridge.showPage(item.page);}
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
 QUICK_TOOL_ITEMS.filter(x=>selected.includes(x.id)&&(x.group===((currentSection()||'Baking')+' Tools')||x.group==='App Tools')).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='tool-button alt';b.textContent=item.label;b.addEventListener('click',()=>openQuickTool(item.id));links.appendChild(b);});
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

function setQuickToolsCollapsed(collapsed){const menu=$('quickToolsDropdown');menu.open=!collapsed;const summary=menu.querySelector('summary');summary.setAttribute('aria-label',collapsed?'Open Baking Tools':'Close Baking Tools');summary.setAttribute('title',collapsed?'Baking Tools':'Close Baking Tools');summary.querySelector('.qt-arrow')?.remove();try{localStorage.setItem('myRecipeBook_quick_tools_collapsed_v1',collapsed?'true':'false')}catch{}}
$('quickToolsDropdown').addEventListener('toggle',()=>{const open=$('quickToolsDropdown').open;if(open&&$('categoriesDropdown').open)$('categoriesDropdown').open=false;const summary=$('quickToolsDropdown').querySelector('summary');summary.setAttribute('aria-label',open?'Close Baking Tools':'Open Baking Tools');summary.setAttribute('title',open?'Close Baking Tools':'Baking Tools');summary.querySelector('.qt-arrow')?.remove();try{localStorage.setItem('myRecipeBook_quick_tools_collapsed_v1',open?'false':'true')}catch{}});
window.MRBQuickTools={render:renderQuickTools,setCollapsed:setQuickToolsCollapsed};
// Initialize after the core app has created its state bridge.
renderQuickTools();
setQuickToolsCollapsed(true);
})();
