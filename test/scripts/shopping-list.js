(()=>{
 'use strict';
 const bridge=window.MRBShoppingBridge;
 if(!bridge)return;
 const $=id=>document.getElementById(id);
 const KEY=bridge.storageKey;
 $('shopBtn').onclick=()=>{
  const select=$('shopRecipe');
  select.innerHTML='<option value="">Choose recipe…</option>'+bridge.getRecipes().map(r=>`<option value="${bridge.escapeText(r.id)}">${bridge.escapeText(r.title)}</option>`).join('');
  $('shopText').value=localStorage.getItem(KEY)||'';
  bridge.showPage('shopping');
 };
 $('shoppingBackBtn').onclick=()=>{bridge.save();bridge.showPage('tools');bridge.openTools()};
 $('shopRecipe').onchange=()=>{
  const recipe=bridge.getRecipes().find(x=>String(x.id)===String($('shopRecipe').value));
  if(recipe){$('shopText').value+=($('shopText').value.trim()?'\n':'')+(recipe.ingredients||'');bridge.save();$('shopRecipe').value=''}
 };
 $('shopText').oninput=()=>{try{localStorage.setItem(KEY,$('shopText').value)}catch{}};
 $('shopPrint').onclick=()=>{
  const w=window.open('','_blank');
  if(!w){bridge.say('Allow pop-ups to print.',true);return}
  w.document.write('<h1>Shopping list</h1><pre style="white-space:pre-wrap;font:18px Arial">'+bridge.escapeText($('shopText').value)+'</pre><script>onload=()=>print()<\\/script>');
  w.document.close();
 };
 $('shopCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('shopText').value);bridge.say('Shopping list copied.')}catch{bridge.say('Select and copy the shopping list text.')}};
 $('shopClear').onclick=()=>{if(confirm('Clear the entire shopping list?')){$('shopText').value='';bridge.save();bridge.say('Shopping list cleared.')}};
})();
