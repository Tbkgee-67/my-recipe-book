
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
