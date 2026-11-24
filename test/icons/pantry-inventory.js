/* Phase 36: Pantry Inventory. Inventory data remains in the same localStorage key on this device. */
(()=>{'use strict';
const bridge=window.MRBPantryInventoryBridge;
if(!bridge)return;
const $=id=>document.getElementById(id);
const INVENTORY_KEY='myRecipeBook_pantry_inventory_v1';
const readLocalArray=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:[]}catch{return []}};
const writeLocalArray=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){bridge.say('Could not save this information. Browser storage may be full.',true);return false}};
let inventoryItems=readLocalArray(INVENTORY_KEY);
function renderInventory(){
 inventoryItems=readLocalArray(INVENTORY_KEY);
 const q=($('invSearch').value||'').trim().toLowerCase(),host=$('inventoryList');
 const rows=inventoryItems.filter(x=>!q||[x.name,x.location,x.unit].join(' ').toLowerCase().includes(q));
 if(!rows.length){host.innerHTML='<p class="help">No inventory items found. Add your first ingredient above.</p>';return;}
 host.innerHTML=['Pantry','Refrigerator','Freezer'].map(loc=>{
  const group=rows.filter(x=>x.location===loc);if(!group.length)return '';
  return '<h3>'+loc+'</h3>'+group.map(x=>{
   const today=new Date().toISOString().slice(0,10),expired=x.expiry&&x.expiry<today,soon=x.expiry&&!expired&&x.expiry<=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
   return `<article style="border:1px solid var(--line);border-radius:10px;padding:10px;margin:8px 0"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><strong>${bridge.escapeHtml(x.name)}</strong><span class="pill">${bridge.escapeHtml(x.qty)} ${bridge.escapeHtml(x.unit||'')}</span></div><div class="help">${x.expiry?'Best before: '+bridge.escapeHtml(x.expiry):'No expiry date'}${expired?' · EXPIRED':soon?' · Expiring soon':''}</div><div class="actions"><button type="button" class="alt" data-inv-use="${bridge.escapeHtml(x.id)}">Use amount</button><button type="button" class="alt" data-inv-edit="${bridge.escapeHtml(x.id)}">Edit</button><button type="button" class="danger" data-inv-del="${bridge.escapeHtml(x.id)}">Delete</button></div></article>`;
  }).join('');
 }).join('');
}
const openButton=$('openPantryInventoryBtn');
if(openButton)openButton.addEventListener('click',()=>{renderInventory();bridge.showPage('inventory')});
const backButton=$('inventoryBackBtn');
if(backButton)backButton.addEventListener('click',()=>bridge.showPage('tools'));
const addButton=$('invAddBtn');
if(addButton)addButton.addEventListener('click',()=>{
 const name=$('invName').value.trim(),qty=Number($('invQty').value),unit=$('invUnit').value.trim(),location=$('invLocation').value,expiry=$('invExpiry').value;
 if(!name||$('invQty').value===''||!Number.isFinite(qty)||qty<0){bridge.say('Enter an ingredient and a valid quantity.',true);return;}
 inventoryItems.push({id:bridge.id(),name,qty,unit,location,expiry});
 if(writeLocalArray(INVENTORY_KEY,inventoryItems)){['invName','invQty','invUnit','invExpiry'].forEach(k=>$(k).value='');renderInventory();}
});
const search=$('invSearch');if(search)search.addEventListener('input',renderInventory);
const list=$('inventoryList');
if(list)list.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const itemId=b.dataset.invUse||b.dataset.invEdit||b.dataset.invDel,x=inventoryItems.find(v=>v.id===itemId);if(!x)return;
 if(b.dataset.invDel!==undefined){
  if(confirm('Delete '+x.name+' from inventory?')){inventoryItems=inventoryItems.filter(v=>v.id!==itemId);writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();}
 }else if(b.dataset.invEdit!==undefined){
  const name=prompt('Ingredient name:',x.name);if(name===null)return;
  const qty=prompt('Quantity:',x.qty);if(qty===null)return;
  const unit=prompt('Unit:',x.unit||'');if(unit===null)return;
  const location=prompt('Storage location (Pantry, Refrigerator or Freezer):',x.location);if(location===null)return;
  const expiry=prompt('Expiry date (YYYY-MM-DD), or leave blank:',x.expiry||'');if(expiry===null)return;
  const n=Number(qty),loc=['pantry','refrigerator','freezer'].find(v=>v===location.trim().toLowerCase());
  if(!name.trim()||!Number.isFinite(n)||n<0||!loc){bridge.say('Please enter a valid name, quantity and storage location.',true);return;}
  Object.assign(x,{name:name.trim(),qty:n,unit:unit.trim(),location:loc[0].toUpperCase()+loc.slice(1),expiry:expiry.trim()});writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();
 }else{
  const used=prompt('How much '+x.name+' did you use? (same unit: '+(x.unit||'unit')+')','1');if(used===null)return;
  const n=Number(used);if(!Number.isFinite(n)||n<0||n>Number(x.qty)){bridge.say('Enter an amount from zero up to the available quantity.',true);return;}
  x.qty=Number(x.qty)-n;writeLocalArray(INVENTORY_KEY,inventoryItems);renderInventory();
 }
});
const finderButton=$('invUseInFinderBtn');
if(finderButton)finderButton.addEventListener('click',()=>{
 const names=inventoryItems.filter(x=>Number(x.qty)>0).map(x=>x.name);
 if(!names.length){bridge.say('There are no ingredients with a quantity above zero.',true);return;}
 $('pantryIngredients').value=[...new Set(names)].join(', ');bridge.showPage('pantry');$('pantryFindBtn').click();
});
})();
