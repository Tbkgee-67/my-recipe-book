
(function(){
 const KEY='myRecipeBookTermsAccepted_2026_v1';
 function init(){
  const dlg=document.getElementById('licenseTermsDlg');
  if(!dlg)return;
  const open=()=>{if(!dlg.open)dlg.showModal()};
  document.getElementById('openTermsBtn')?.addEventListener('click',open);
  document.getElementById('footerTermsBtn')?.addEventListener('click',open);
  document.getElementById('acceptLicenseTermsBtn')?.addEventListener('click',()=>{
   try{localStorage.setItem(KEY,JSON.stringify({accepted:true,acceptedAt:new Date().toISOString(),version:'2026-v1'}));}catch(e){}
   dlg.close();
  });
  dlg.addEventListener('cancel',e=>{try{if(!localStorage.getItem(KEY))e.preventDefault();}catch(err){e.preventDefault();}});
  let accepted=false;try{accepted=!!localStorage.getItem(KEY)}catch(e){}
  if(!accepted)open();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
