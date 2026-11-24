(()=>{
 'use strict';
 let wakeLock=null, active=false;
 const detail=document.getElementById('detail');
 const dialog=document.getElementById('detailDlg');
 function status(message,isError=false){const el=document.getElementById('status');if(el){el.textContent=message;el.classList.toggle('err',isError);}}
 function updateButton(){const btn=document.getElementById('activeCookingBtn');if(!btn)return;btn.textContent=active?'🍳 Active Cooking: ON':'🍳 Active Cooking: OFF';btn.setAttribute('aria-pressed',String(active));btn.classList.toggle('alt',!active);}
 async function setActiveCooking(on){
  active=!!on; updateButton();
  if(!active){if(wakeLock){try{await wakeLock.release();}catch(e){}wakeLock=null;}return;}
  if(!('wakeLock' in navigator)){active=false;updateButton();status('Wake Mode is not supported by this browser.');return;}
  try{if(!wakeLock||wakeLock.released){const lock=await navigator.wakeLock.request('screen');wakeLock=lock;lock.addEventListener('release',()=>{if(wakeLock===lock)wakeLock=null;});}}
  catch(e){active=false;updateButton();status('Could not keep the screen awake. Check browser or phone power settings.',true);}
 }
 if(detail)detail.addEventListener('click',event=>{const button=event.target.closest('#activeCookingBtn');if(!button)return;event.preventDefault();setActiveCooking(!active);});
 if(dialog)dialog.addEventListener('close',()=>setActiveCooking(false));
})();
