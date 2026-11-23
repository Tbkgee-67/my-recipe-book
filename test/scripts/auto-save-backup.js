/* Phase 47: Automatic Save / Backup module. Preserves the existing file-handle workflow. */
(()=>{'use strict';
 const DB='MyRecipeBookFileHandles', STORE='handles';
 let getData=()=>({categories:[],recipes:[]}), say=()=>{}, requestPersistentStorage=async()=>{}, timer=null;
 const status=()=>document.getElementById('autoSaveStatus');
 const setStatus=(message)=>{const el=status();if(el)el.textContent=message};
 function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
 async function storeHandle(handle){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(handle,'recipeFile');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
 async function getHandle(){const db=await openDB();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).get('recipeFile');req.onsuccess=()=>{db.close();resolve(req.result||null)};req.onerror=()=>{db.close();reject(req.error)}})}
 async function write(showStatus=false){
  try{
   const handle=await getHandle();
   if(!handle){if(showStatus)setStatus('No external backup file has been selected yet. Your recipes are still saved on this device.');return false}
   let permission=await handle.queryPermission({mode:'readwrite'});
   if(permission!=='granted'&&showStatus)permission=await handle.requestPermission({mode:'readwrite'});
   if(permission!=='granted'){setStatus('Your backup location is remembered, but file permission needs renewing. Tap Automatic Save / Backup and allow access; you should not need to choose the location again.');return false}
   const data=getData();
   const payload=JSON.stringify({app:'My Recipe Book',version:1,updated:new Date().toISOString(),categories:data.categories,recipes:data.recipes},null,2);
   const writable=await handle.createWritable();await writable.write(payload);await writable.close();
   setStatus('Automatic backup saved to '+(handle.name||'your selected location')+' at '+new Date().toLocaleTimeString()+'.');return true;
  }catch(e){setStatus('The automatic backup could not be updated. Your on-device recipes are still saved. Tap Automatic Save / Backup to renew access. '+(e.message||''));return false}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>write(false),1200)}
 async function chooseLocation(){
  try{
   let handle;
   try{handle=await getHandle()}catch(e){}
   if(handle){let perm='prompt';try{perm=await handle.requestPermission({mode:'readwrite'})}catch(e){}if(perm==='granted'){const ok=await write(true);if(ok){say('Automatic recipe saving is enabled.');return}}}
   if(typeof window.showSaveFilePicker==='function'){
    handle=await window.showSaveFilePicker({suggestedName:'my-recipe-book-autosave.json',types:[{description:'My Recipe Book automatic backup',accept:{'application/json':['.json']}}]});
   }else if(typeof window.showDirectoryPicker==='function'){
    const directory=await window.showDirectoryPicker({mode:'readwrite'});const dirPermission=await directory.requestPermission({mode:'readwrite'});if(dirPermission!=='granted')throw new Error('Folder permission was not granted.');handle=await directory.getFileHandle('my-recipe-book-autosave.json',{create:true});const filePermission=await handle.requestPermission({mode:'readwrite'});if(filePermission!=='granted')throw new Error('File permission was not granted.');
   }else{setStatus('This browser does not offer a direct file or folder picker. Your recipes are still saved on this device. Use Backup / Restore to download a copy, or connect Google Drive for cloud backup.');return}
   await storeHandle(handle);await requestPersistentStorage();const ok=await write(true);if(ok)say('Automatic backup location selected. Recipe changes will be saved there automatically.');
  }catch(e){if(e.name!=='AbortError')setStatus('Could not set the automatic backup location: '+(e.message||'unknown error')+'. Your on-device recipes have not been removed.')}
 }
 async function checkOnStartup(){
  try{const h=await getHandle();if(!h){setStatus((typeof window.showSaveFilePicker==='function'||typeof window.showDirectoryPicker==='function')?'Your recipes are saved on this device. Tap Automatic Save / Backup to choose an additional backup file or folder.':'Your recipes are saved on this device. This browser does not provide a file/folder picker here; use Backup / Restore or Google Drive for an additional copy.');return}
   let permission='unknown';try{permission=await h.queryPermission({mode:'readwrite'})}catch(e){}
   if(permission==='granted'){setStatus('Automatic backup is ready. Saved location: '+(h.name||'your selected file')+'. Changes are saved there automatically.');write(false)}
   else setStatus('Your backup location is remembered: '+(h.name||'selected file')+'. File permission needs renewing. Tap Automatic Save / Backup; you should not need to choose the location again.');
  }catch(e){setStatus('Your on-device recipes are safe. The saved backup location could not be checked; tap Automatic Save / Backup to check it.')}
 }
 window.MRBAutoSaveBackup={init(options){getData=options.getData;say=options.say;requestPersistentStorage=options.requestPersistentStorage;const button=document.getElementById('autoSaveLocationBtn');if(button)button.onclick=chooseLocation},schedule,write,checkOnStartup};
})();
