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
