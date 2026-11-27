
const params=new URLSearchParams(location.search);
const slug=document.body.dataset.section;
const labels={baking:'Baking',smoking:'Smoking / Curing',brewing:'Brewing'};
const section=labels[slug];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function recipeMarkup(r,actions=true){
 const lines=(v)=>esc(v||'').replace(/\n/g,'<br>');
 return `<article class="recipe"><a class="no-print" href="${slug}.html">← Back to ${esc(section)}</a><h1>${esc(r.title)}</h1>
 ${r.description?`<p>${lines(r.description)}</p>`:''}
 ${r.photo?`<img src="${esc(r.photo)}" alt="${esc(r.title)}">`:''}
 <p class="meta">${[r.yield,r.times,Array.isArray(r.categories)?r.categories.join(', '):''].filter(Boolean).map(esc).join(' · ')}</p>
 ${actions?`<div class="recipe-actions no-print"><button onclick="window.print()">Save as PDF</button><button class="secondary" onclick="window.print()">Print recipe</button><button class="secondary" onclick="downloadRecipeById('${esc(r.id)}')">Download recipe data</button></div>`:''}
 ${r.ingredients?`<h2>Ingredients</h2><pre>${lines(r.ingredients)}</pre>`:''}
 ${r.directions?`<h2>Directions</h2><pre>${lines(r.directions)}</pre>`:''}
 ${r.nutrition?`<h2>Nutrition</h2><pre>${lines(r.nutrition)}</pre>`:''}
 ${r.notes?`<h2>Notes</h2><pre>${lines(r.notes)}</pre>`:''}
 ${r.videoLink?`<p><a href="${esc(r.videoLink)}" target="_blank" rel="noopener">Watch video</a></p>`:''}
 ${r.websiteLink?`<p><a href="${esc(r.websiteLink)}" target="_blank" rel="noopener">Recipe website</a></p>`:''}
 </article>`;
}
function downloadRecipeById(id){
 const r=window.publicRecipeItems.find(x=>x.id===id); if(!r)return;
 const blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(r.title||'recipe').replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'')+'.json';a.click();URL.revokeObjectURL(a.href);
}
fetch('recipes.json').then(r=>r.json()).then(all=>{
 const items=all.filter(r=>r.section===section); window.publicRecipeItems=items;
 const detail=params.get('recipe');
 if(detail){
  const r=items.find(x=>x.id===detail);
  document.querySelector('main').innerHTML=r?recipeMarkup(r):'<p>Recipe not found.</p>';
  document.title=(r?.title||'Recipe')+' | My Recipe Book';
  return;
 }
 const root=document.querySelector('main');
 root.innerHTML=`<p class="intro">Browse ${items.length} recipes in ${esc(section)}. Choose a recipe to view the full ingredients and directions.</p>
 <div class="tools no-print"><input id="search" type="search" placeholder="Search ${esc(section)} recipes…" aria-label="Search recipes"></div>
 <div class="grid" id="recipes"></div>`;
 const grid=document.querySelector('#recipes'),search=document.querySelector('#search');
 function render(){
  const q=search.value.trim().toLowerCase();
  const found=items.filter(r=>(r.title+' '+r.description+' '+(r.categories||[]).join(' ')).toLowerCase().includes(q));
  grid.innerHTML=found.length?found.map(r=>`<article class="card">${r.photo?`<img src="${esc(r.photo)}" alt="" loading="lazy">`:''}<div class="card-body"><h2>${esc(r.title)}</h2><p>${esc(r.description||'')}</p><button onclick="location.href='${slug}.html?recipe=${encodeURIComponent(r.id)}'">View recipe</button></div></article>`).join(''):'<p class="empty">No recipes match that search.</p>';
 }
 search.addEventListener('input',render);render();
}).catch(()=>document.querySelector('main').innerHTML='<p>Recipes could not be loaded. Please try again later.</p>');
