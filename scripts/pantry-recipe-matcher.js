
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
