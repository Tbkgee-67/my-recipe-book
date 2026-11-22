(function(){
 const KEY='myRecipeBook_displayTheme_v1';
 function init(){
  const actions=document.querySelector('.head-actions');
  if(!actions||document.getElementById('themeModeBtn'))return;
  let mode='dark';try{mode=localStorage.getItem(KEY)==='light'?'light':'dark'}catch(e){}
  const btn=document.createElement('button');btn.type='button';btn.id='themeModeBtn';btn.className='alt';btn.setAttribute('aria-label','Switch colour theme');
  function apply(){document.body.setAttribute('data-mrb-theme',mode);btn.textContent=mode==='dark'?'☀ Light':'🌙 Dark';btn.title=mode==='dark'?'Switch to light mode':'Switch to dark mode';btn.setAttribute('aria-pressed',String(mode==='dark'));const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=mode==='dark'?'#1b1613':'#ffffff';}
  btn.addEventListener('click',()=>{mode=mode==='dark'?'light':'dark';try{localStorage.setItem(KEY,mode)}catch(e){}apply()});
  const quick=actions.querySelector('#quickToolsDropdown');if(quick)actions.insertBefore(btn,quick);else actions.appendChild(btn);
  apply();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
