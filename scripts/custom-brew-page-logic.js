(()=>{
 const $=id=>document.getElementById(id);
 const KEY='myRecipeBook_customBrews_v1';
 let brews=[];
 try{const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(parsed))brews=parsed;}catch(e){}
 const fields=['Name','Category','Abv','Gravity','Video','Description','Ingredients','Instructions'];
 const fieldIds=fields.map(x=>'customBrew'+x);
 const escHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const status=(message,isError=false)=>{const el=$('customBrewStatus');if(el){el.textContent=message;el.style.color=isError?'#d45b55':'var(--muted)';}};
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(brews));return true;}catch(e){status('Could not save. Browser storage may be full.',true);return false;}};
 const resetForm=()=>{$('customBrewForm').reset();$('customBrewEditId').value='';$('customBrewCategory').value='Mead';$('customBrewSaveBtn').textContent='Save Recipe';status('');};
 const openForm=(item=null)=>{resetForm();if(item){$('customBrewEditId').value=item.id;fieldIds.forEach((id,i)=>$(id).value=item[fields[i].toLowerCase()]||'');$('customBrewSaveBtn').textContent='Update Recipe';} $('customBrewName').focus({preventScroll:true});$('customBrewForm').scrollIntoView({behavior:'smooth',block:'start'});};
 const render=()=>{
  const host=$('customBrewList');if(!host)return;
  if(!brews.length){host.innerHTML='<p class="muted">No custom brews saved yet. Choose “Add Brew” to create your first one.</p>';return;}
  host.innerHTML=brews.map(item=>`<article class="custom-brew-card"><h3>${escHtml(item.name)}</h3><p class="custom-brew-meta">${escHtml(item.category)} · Target ABV: ${escHtml(item.abv)}</p><p>${escHtml(item.description)}</p>${item.gravity?`<p class="custom-brew-meta">${escHtml(item.gravity)}</p>`:''}<div class="custom-brew-actions"><button type="button" data-brew-action="view" data-id="${escHtml(item.id)}">View Recipe</button><button class="alt" type="button" data-brew-action="edit" data-id="${escHtml(item.id)}">Edit</button><button class="alt" type="button" data-brew-action="delete" data-id="${escHtml(item.id)}">Delete</button></div></article>`).join('');
 };
 const openRecipe=(item)=>{
  const lines=(v)=>escHtml(v||'').split(/\r?\n/).filter(Boolean).map(x=>`<li>${x}</li>`).join('');
  const overlay=document.createElement('div');overlay.className='modal';overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:#000b;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto';
  overlay.innerHTML=`<section class="panel" style="width:min(680px,100%);max-height:90vh;overflow:auto"><div class="toolbar" style="justify-content:space-between"><h2>${escHtml(item.name)}</h2><button type="button" class="alt" data-close>✕</button></div><p><strong>${escHtml(item.category)}</strong> · Target ABV: ${escHtml(item.abv)}</p>${item.gravity?`<p>${escHtml(item.gravity)}</p>`:''}<p>${escHtml(item.description)}</p>${item.video?`<p><a href="${escHtml(item.video)}" target="_blank" rel="noopener">▶ Watch YouTube video</a></p>`:''}<h3>Ingredients (1 gallon)</h3><ul>${lines(item.ingredients)}</ul><h3>Step-by-Step Instructions</h3><ol>${lines(item.instructions)}</ol><button type="button" data-close>Close</button></section>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('[data-close]'))overlay.remove();});document.body.appendChild(overlay);
 };
 $('customBrewForm').addEventListener('submit',e=>{e.preventDefault();const obj={};fields.forEach((f,i)=>obj[f.toLowerCase()]=$(fieldIds[i]).value.trim());if(!obj.name||!obj.category||!obj.abv||!obj.description||!obj.ingredients||!obj.instructions){status('Please complete all required fields.',true);return;}if(obj.video&&!/^https:\/\//i.test(obj.video)){status('Please enter a valid HTTPS YouTube link.',true);return;}const id=$('customBrewEditId').value;if(id){const index=brews.findIndex(x=>x.id===id);if(index>=0)brews[index]={...brews[index],...obj};}else{obj.id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);obj.createdAt=new Date().toISOString();brews.unshift(obj);}if(persist()){resetForm();render();status('Recipe saved on this device.');$('customBrewList').scrollIntoView({behavior:'smooth',block:'start'});}});
 $('customBrewList').addEventListener('click',e=>{const btn=e.target.closest('[data-brew-action]');if(!btn)return;const item=brews.find(x=>x.id===btn.dataset.id);if(!item)return;const action=btn.dataset.brewAction;if(action==='edit'){openForm(item);}else if(action==='view'){openRecipe(item);}else if(action==='delete'&&confirm('Delete “'+item.name+'”?')){brews=brews.filter(x=>x.id!==item.id);if(persist())render();}});
 const close=()=>{resetForm();showPage('tools');const wine=document.querySelector('.wine-mead-tools-dropdown');if(wine)wine.open=true;};
 $('customBrewBackBtn').addEventListener('click',close);$('customBrewCancelFormBtn').addEventListener('click',resetForm);$('customBrewNewBtn').addEventListener('click',()=>openForm());
 $('openCustomBrewBtn').addEventListener('click',()=>{render();resetForm();showPage('customBrew');});
 render();
})();
