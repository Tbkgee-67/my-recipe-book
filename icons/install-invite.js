(()=>{
 'use strict';
 const dlg=document.getElementById('recipeBookInstallInvite');
 const installBtn=document.getElementById('recipeBookInstallAction');
 const laterBtn=document.getElementById('recipeBookInstallLater');
 const instructions=document.getElementById('recipeBookInstallInstructions');
 if(!dlg||!installBtn||!laterBtn)return;
 const DISMISSED_KEY='myRecipeBook_installInviteDismissed_v1';
 let installPrompt=null,shown=false;
 const isInstalled=()=>{
  try{return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone===true ||
    document.referrer.startsWith('android-app://');}
  catch(e){return false}
 };
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  installBtn.textContent='⬇ Install My Recipe Book';
  installBtn.hidden=false;
 });
 window.addEventListener('appinstalled',()=>{
  installPrompt=null;
  try{localStorage.setItem(DISMISSED_KEY,'installed')}catch(e){}
  if(dlg.open)dlg.close();
 });
 function deviceInstructions(){
  const ua=navigator.userAgent||'';
  if(/iPhone|iPad|iPod/i.test(ua)){
   return '<strong>Install on iPhone or iPad</strong><br>Tap the Share button in Safari, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>. If you are using another browser, open this website in Safari first.';
  }
  if(/Android/i.test(ua)){
   return '<strong>Install on Android</strong><br>Tap your browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then follow the prompts.';
  }
  return '<strong>Install on your computer</strong><br>In Chrome or Edge, look for the install icon in the address bar, or open the browser menu and choose <strong>Install My Recipe Book</strong> / <strong>Install this site as an app</strong>, if available.';
 }
 function show(){
  if(shown||isInstalled())return;
  try{if(localStorage.getItem(DISMISSED_KEY))return;}catch(e){}
  shown=true;
  if(!dlg.open){if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');}
 }
 function schedule(){
  if(isInstalled())return;
  window.setTimeout(()=>{
   const welcome=document.getElementById('welcomeGuideDlg');
   if(welcome&&welcome.open){
    welcome.addEventListener('close',()=>window.setTimeout(show,500),{once:true});
   }else show();
  },2200);
 }
 installBtn.addEventListener('click',async()=>{
  if(installPrompt){
   const promptEvent=installPrompt;
   installPrompt=null;
   try{
    await promptEvent.prompt();
    const choice=await promptEvent.userChoice;
    if(choice&&choice.outcome==='accepted'){
     try{localStorage.setItem(DISMISSED_KEY,'installed')}catch(e){}
     if(dlg.open)dlg.close();
     return;
    }
   }catch(e){}
   installBtn.textContent='Install option not available';
   instructions.innerHTML=deviceInstructions();
   instructions.hidden=false;
   return;
  }
  instructions.innerHTML=deviceInstructions();
  instructions.hidden=false;
  installBtn.textContent='See installation instructions';
 });
 function dismiss(){
  try{localStorage.setItem(DISMISSED_KEY,'yes')}catch(e){}
  if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open');
 }
 laterBtn.addEventListener('click',dismiss);
 dlg.addEventListener('click',event=>{if(event.target===dlg)dismiss()});
 dlg.addEventListener('cancel',dismiss);
 schedule();
})();
