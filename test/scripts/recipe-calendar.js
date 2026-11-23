/* Phase 31: Recipe Calendar module. Uses only the narrow app bridge. */
(()=>{'use strict';
const bridge=window.MRBRecipeCalendarBridge;
if(!bridge){console.error('Recipe Calendar could not start: app bridge is missing.');return;}
const $=id=>document.getElementById(id);
const recipes=()=>bridge.getRecipes();
const esc=bridge.esc, say=bridge.say, showPage=bridge.showPage, close=bridge.close;
// Recipe Calendar: independent local schedule storage; it does not alter recipe records.
const RECIPE_CALENDAR_KEY='myRecipeBook_recipe_calendar_v1';
let calendarPlans=[],calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),calendarSelected=calendarDateKey(new Date());
try{const saved=JSON.parse(localStorage.getItem(RECIPE_CALENDAR_KEY)||'[]');if(Array.isArray(saved))calendarPlans=saved;}catch{}
function saveCalendar(){try{localStorage.setItem(RECIPE_CALENDAR_KEY,JSON.stringify(calendarPlans));return true}catch(e){say('Could not save the calendar. Check available browser storage.',true);return false}}
function calendarDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function calendarRecipeOptions(){const sel=$('calendarRecipe');if(!sel)return;const old=sel.value;sel.innerHTML='<option value="">Choose a saved recipe…</option>'+recipes().map(r=>'<option value="'+esc(String(r.id))+'">'+esc(r.title)+'</option>').join('');if(recipes().some(r=>String(r.id)===old))sel.value=old}
function calendarTasksFor(date){return calendarPlans.flatMap(plan=>(plan.tasks||[]).filter(t=>t.date===date).map(t=>({plan,task:t})))}
function addRecipeToCalendar(rid){
 const recipe=recipes().find(x=>String(x.id)===String(rid));
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
 const recipe=recipes().find(r=>String(r.id)===$('calendarRecipe').value),start=$('calendarStart').value,tasks=$('calendarTasks').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!recipe){say('Choose a saved recipe first.',true);return}
 if(!start){say('Choose the recipe start date.',true);return}
 if(!tasks.length){say('Enter at least one daily task.',true);return}
 const startDate=new Date(start+'T12:00:00');
 const plan={id:Date.now().toString(36)+Math.random().toString(36).slice(2),recipeId:recipe.id,title:recipe.title,start,tasks:tasks.map((text,i)=>{const d=new Date(startDate);d.setDate(d.getDate()+i);return{date:calendarDateKey(d),text,done:false}})};
 calendarPlans.push(plan);if(saveCalendar()){calendarSelected=start;calendarMonth=new Date(startDate.getFullYear(),startDate.getMonth(),1);$('calendarTasks').value='';renderCalendar();say('Recipe plan added to your calendar.')}
};

window.MRBRecipeCalendar={addRecipeToCalendar};
})();
