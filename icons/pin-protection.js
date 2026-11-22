/* Phase 37 — PIN protection module. Preserves the existing SHA-256 format and storage key. */
(()=>{'use strict';
 const bridge=window.MRBPinProtectionBridge;
 if(!bridge||!bridge.storageKey||typeof bridge.say!=='function'){
  console.error('My Recipe Book PIN protection could not connect to the app.');
  return;
 }
 const STORAGE_KEY=bridge.storageKey;
 const say=bridge.say;
 async function pinDigest(pin){
  const bytes=new TextEncoder().encode('MyRecipeBook-PIN-v1:'+pin);
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 async function getPinHash(){return localStorage.getItem(STORAGE_KEY)||'';}
 async function setPinFlow(){
  let old=await getPinHash();
  if(old){
   const current=prompt('Enter your current 4-digit PIN to change it:');
   if(current===null)return false;
   if(!/^\d{4}$/.test(current)||await pinDigest(current)!==old){say('Incorrect PIN. PIN was not changed.',true);return false;}
  }
  const a=prompt(old?'Choose a new 4-digit PIN:':'Choose a 4-digit PIN:');
  if(a===null)return false;
  if(!/^\d{4}$/.test(a)){say('PIN must be exactly 4 digits.',true);return false;}
  const b=prompt('Enter the 4-digit PIN again to confirm:');
  if(b!==a){say('PINs did not match. PIN was not changed.',true);return false;}
  localStorage.setItem(STORAGE_KEY,await pinDigest(a));
  say(old?'PIN changed.':'PIN set. Keep it somewhere safe.');
  return true;
 }
 async function authorizeDestructiveAction(){
  let stored=await getPinHash();
  if(!stored){
   const setup=confirm('A 4-digit PIN is needed to protect deletion and backup restore. Set one now?');
   if(!setup)return false;
   if(!await setPinFlow())return false;
   stored=await getPinHash();
  }
  const entered=prompt('Enter your 4-digit PIN to continue:');
  if(entered===null)return false;
  if(!/^\d{4}$/.test(entered)||await pinDigest(entered)!==stored){say('Incorrect PIN. Nothing was changed.',true);return false;}
  return true;
 }
 window.MRBPinProtection={setPinFlow,authorizeDestructiveAction};
 const settingsButton=document.getElementById('pinSettingsBtn');
 if(settingsButton){
  settingsButton.addEventListener('click',async()=>{
   try{await setPinFlow();}
   catch(e){say('Could not set PIN in this browser. Please try again.',true);}
  });
 }
})();
