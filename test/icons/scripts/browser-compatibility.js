(()=>{
 'use strict';
 const KEY='myRecipeBook_browser_notice_dismissed_v1';
 const DAY=86400000;
 const safe=(fn,fallback)=>{try{return fn()}catch(e){return fallback}};
 function run(){
  if(document.getElementById('browserCompatibilityNotice'))return;
  const checks=[
   {ok:!!window.indexedDB,name:'Recipe photo storage',help:'This browser may not save recipe photos reliably. Use a current version of Chrome, Edge, Firefox, Safari, or Samsung Internet.'},
   {ok:safe(()=>{const k='__mr_storage_test';localStorage.setItem(k,'1');localStorage.removeItem(k);return true},false),name:'Local recipe settings',help:'Browser storage is blocked or unavailable. Saved recipes and settings may not persist. Enable site data and avoid private/incognito browsing.'},
   {ok:!!(window.crypto&&crypto.subtle),name:'Secure browser features',help:'Some security features are unavailable. Open the app using its HTTPS GitHub Pages address and a current browser.'},
   {ok:!!navigator.serviceWorker,name:'Offline app support',help:'This browser does not support service workers, so install/offline features may be limited.'}
  ];
  const optional=[];
  if(!( 'showSaveFilePicker' in window))optional.push('Direct save-to-folder is not available here. Use the normal backup download option instead.');
  if(!( 'SpeechRecognition' in window)&&!( 'webkitSpeechRecognition' in window))optional.push('Voice commands are not supported in this browser. You can still use the app normally and read recipe directions on screen.');
  if(!( 'beforeinstallprompt' in window))optional.push('The automatic install pop-up is not supported by every browser. Use the browser menu (or Share menu on iPhone/iPad) and choose Add to Home Screen / Install when available.');
  if(!( 'share' in navigator))optional.push('The browser share sheet is unavailable. Use the download or copy options instead.');
  const failures=checks.filter(x=>!x.ok);
  const now=Date.now();
  const last=safe(()=>Number(localStorage.getItem(KEY)||0),0);
  if(now-last<30*DAY)return;
  const panel=document.createElement('section');panel.id='browserCompatibilityNotice';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
  const close=document.createElement('button');close.type='button';close.className='compat-close';close.setAttribute('aria-label','Close browser information');close.textContent='×';
  const heading=document.createElement('h3');heading.textContent=failures.length?'Browser compatibility notice':'My Recipe Book browser check';
  const intro=document.createElement('p');intro.textContent=failures.length?'Some browser features may be limited. Your recipes may still be usable, but review the notes below.':'Your browser supports the main app storage and security features.';
  panel.append(close,heading,intro);
  if(failures.length){const list=document.createElement('ul');failures.forEach(x=>{const li=document.createElement('li');li.innerHTML='<strong></strong> ';li.querySelector('strong').textContent=x.name;li.append(document.createTextNode(' — '+x.help));list.append(li)});panel.append(list)}
  if(optional.length){const h=document.createElement('p');h.innerHTML='<strong>Optional features and alternatives:</strong>';const list=document.createElement('ul');optional.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.append(li)});panel.append(h,list)}
  const backup=document.createElement('p');backup.innerHTML='<strong>Important:</strong> Recipes are stored in this browser on this device. Regularly use Backup / Restore and keep a copy somewhere safe. Clearing browser data, using private browsing, changing browsers, or changing devices can make locally stored recipes unavailable. Include photos in your backup.';panel.append(backup);
  const actions=document.createElement('div');actions.className='compat-actions';
  const closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='alt';closeBtn.textContent='Close';
  const checkBtn=document.createElement('button');checkBtn.type='button';checkBtn.textContent='Check again';
  actions.append(checkBtn,closeBtn);panel.append(actions);document.body.append(panel);
  const dismiss=()=>{safe(()=>localStorage.setItem(KEY,String(Date.now())),null);panel.remove()};close.addEventListener('click',dismiss);closeBtn.addEventListener('click',dismiss);checkBtn.addEventListener('click',()=>{panel.remove();run()});
  if(!failures.length){heading.classList.add('compat-good')}else heading.classList.add('compat-warn');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
