/* Phase 26: App Icon customization extracted from the main app script. */
(()=>{
 'use strict';
 const KEY='myRecipeBook_custom_icon_v1';
 const bridge=window.MRBAppIconBridge;
 const $=id=>document.getElementById(id);
 if(!bridge){console.error('App Icon customization could not start: app bridge is unavailable.');return;}
 function applyAppIcon(){
  const brand=document.querySelector('.head-brand h1');if(!brand)return;
  const stored=localStorage.getItem(KEY);
  brand.textContent='';
  if(stored&&stored.startsWith('data:image/')){
   const img=document.createElement('img');img.src=stored;img.alt='';img.style.cssText='width:28px;height:28px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:5px';
   img.onerror=()=>{const fallback=document.createElement('span');fallback.textContent='📖 ';fallback.style.marginRight='5px';img.replaceWith(fallback)};
   brand.append(img);
  }else{
   const icon=document.createElement('span');icon.textContent=(stored||'📖')+' ';icon.style.cssText='display:inline-block;margin-right:5px';brand.append(icon);
  }
  const title=document.createElement('span');title.textContent='My Recipe Book';brand.append(title);
 }
 const openBtn=$('openAppIconSettingsBtn'),closeBtn=$('closeAppIconDlg'),resetBtn=$('resetAppIconBtn'),fileInput=$('customAppIconFile');
 if(openBtn)openBtn.onclick=()=>{applyAppIcon();bridge.open('appIconDlg')};
 if(closeBtn)closeBtn.onclick=()=>bridge.close('appIconDlg');
 document.querySelectorAll('[data-app-icon]').forEach(btn=>btn.addEventListener('click',()=>{
  localStorage.setItem(KEY,btn.dataset.appIcon);applyAppIcon();const status=$('appIconStatus');if(status)status.textContent='Icon updated and saved on this device.';
 }));
 if(resetBtn)resetBtn.onclick=()=>{
  localStorage.removeItem(KEY);applyAppIcon();if(fileInput)fileInput.value='';const status=$('appIconStatus');if(status)status.textContent='The original TBK icon has been restored inside the app.';
 };
 if(fileInput)fileInput.addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){bridge.say('Choose an image file.',true);return;}
  let url='';
  try{
   url=URL.createObjectURL(file);const img=new Image();img.src=url;
   if(img.decode)await img.decode();else await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});
   const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');
   if(!ctx)throw new Error('Image processing is unavailable.');
   const side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
   ctx.drawImage(img,sx,sy,side,side,0,0,128,128);
   const data=canvas.toDataURL('image/jpeg',.78);
   if(data.length>90000)throw new Error('That picture is too large. Please choose a smaller image.');
   localStorage.setItem(KEY,data);applyAppIcon();const status=$('appIconStatus');if(status)status.textContent='Your picture is saved as the in-app icon.';
  }catch(err){bridge.say(err.message||'Could not use that picture.',true);}
  finally{if(url)URL.revokeObjectURL(url);e.target.value='';}
 });
 applyAppIcon();
})();
