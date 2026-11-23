(()=> {
'use strict';
const $=id=>document.getElementById(id);
const KEY='myRecipeBook_sourdough_journal_v1';
const blank=()=>({name:'',home:'counter',interval:'24',custom:24,createdAt:'',entries:[],reminders:false,lastNotice:0});
let data=blank(), photoData='';
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&typeof v==='object')data={...blank(),...v};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){alert('The journal could not be saved. Device storage may be full; export your journal and remove some large photos.');}};
const fmt=v=>v?new Date(v).toLocaleString():'Not recorded';
const localInput=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,16);};
const interval=()=>data.interval==='custom'?Math.max(1,Number(data.custom)||24):Number(data.interval)||24;
const last=()=>data.entries.length?data.entries[0]:null;
const due=()=>{const e=last();return e?new Date(new Date(e.at).getTime()+interval()*3600000):null;};
function collect(){data.name=$('sjName').value.trim();data.home=$('sjHome').value;data.interval=$('sjInterval').value;data.custom=Number($('sjCustom').value)||24;}
function fill(){ $('sjName').value=data.name||'';$('sjHome').value=data.home||'counter';$('sjInterval').value=data.interval||'24';$('sjCustom').value=data.custom||24;$('sjCustomWrap').classList.toggle('hidden',data.interval!=='custom'); }
function render(){
 const e=last(), d=due(), now=new Date();
 $('sjLastFed').textContent=e?fmt(e.at):'Not recorded';
 $('sjNextFed').textContent=d?fmt(d):'Not scheduled';
 $('sjAge').textContent=data.createdAt?Math.max(0,Math.floor((now-new Date(data.createdAt))/86400000))+' days':'Not set';
 $('sjRiseSummary').textContent=e&&e.rise?e.rise+'%':(e&&e.peakHours?e.peakHours+' hours to peak':'Not recorded');
 const status=!e?'Not started':!d?'Active':now>=d?'Feeding due':'On schedule';
 $('sjHealth').textContent=status;
 $('sjDueMessage').textContent=!e?'Save your first feeding entry to start your journal.':now>=d?'Your next feeding is due. Last feeding: '+fmt(e.at)+'.':'Next feeding is due in '+Math.max(0,Math.ceil((d-now)/3600000))+' hour(s).';
 const list=$('sjEntries');list.innerHTML='';
 if(!data.entries.length){list.innerHTML='<p class="muted">No entries yet.</p>';return;}
 data.entries.slice(0,100).forEach((v,i)=>{
  const card=document.createElement('div');card.className='panel';card.style.margin='8px 0';
  const title=document.createElement('strong');title.textContent=fmt(v.at)+' — '+(v.ratio||'Feeding');
  const details=document.createElement('p');details.style.margin='6px 0';details.textContent=[
   'Ratio '+(v.ratio||'—'),
   'Starter '+(v.starterG??'—')+' g / water '+(v.waterG??'—')+' g / flour '+(v.flourG??'—')+' g',
   v.flourType?'Flour: '+v.flourType:'',
   v.temp!==''&&v.temp!=null?'Temperature: '+v.temp+' °C':'',
   v.rise?'Rise: '+v.rise+'%':'',
   v.peakHours?'Peak: '+v.peakHours+' hours':'',
   v.smell?'Smell: '+v.smell:'',
   v.texture?'Texture: '+v.texture:'',
   v.notes||''
  ].filter(Boolean).join(' • ');
  card.append(title,details);
  if(v.photo){const img=document.createElement('img');img.src=v.photo;img.alt='Starter photo';img.style='max-width:150px;max-height:150px;border-radius:8px;display:block;margin:6px 0';card.appendChild(img);}
  const del=document.createElement('button');del.type='button';del.className='alt';del.textContent='Delete entry';del.addEventListener('click',()=>{if(confirm('Delete this feeding entry?')){data.entries.splice(i,1);save();render();}});
  card.appendChild(del);list.appendChild(card);
 });
 checkReminder();
}
function checkReminder(){
 const d=due();if(!d||new Date()<d||!data.reminders||!('Notification'in window)||Notification.permission!=='granted')return;
 if(Date.now()-(data.lastNotice||0)<12*3600000)return;
 try{new Notification('Sourdough feeding due',{body:(data.name||'Your starter')+' is due for feeding.',tag:'sourdough-'+KEY});data.lastNotice=Date.now();save();}catch(e){}
}
function resetEntryForm(){ $('sjFedAt').value=localInput(new Date());$('sjRatio').value='1:1:1';$('sjStarterG').value=25;$('sjWaterG').value=25;$('sjFlourG').value=25;$('sjFlourType').value='';$('sjTemp').value='';$('sjRise').value='';$('sjPeakHours').value='';$('sjSmell').value='';$('sjTexture').value='';$('sjFeedNotes').value='';$('sjPhoto').value='';$('sjPhotoPreview').src='';$('sjPhotoPreview').classList.add('hidden');photoData='';}
function logFeed(useNow=false){
 collect();
 const at=useNow?new Date().toISOString():new Date($('sjFedAt').value).toISOString();
 if(!at||at==='Invalid Date'){alert('Please enter a valid feeding date and time.');return;}
 const entry={at,ratio:$('sjRatio').value,starterG:Number($('sjStarterG').value)||0,waterG:Number($('sjWaterG').value)||0,flourG:Number($('sjFlourG').value)||0,flourType:$('sjFlourType').value.trim(),temp:$('sjTemp').value,rise:$('sjRise').value,peakHours:$('sjPeakHours').value,smell:$('sjSmell').value,texture:$('sjTexture').value,notes:$('sjFeedNotes').value.trim(),photo:photoData};
 data.entries.unshift(entry);data.entries=data.entries.slice(0,100);if(!data.createdAt)data.createdAt=at;data.lastNotice=0;
 save();resetEntryForm();render();
}
['sjName','sjHome','sjInterval','sjCustom'].forEach(id=>$(id).addEventListener('change',()=>{collect();save();$('sjCustomWrap').classList.toggle('hidden',data.interval!=='custom');render();}));
$('sjLogFeed').addEventListener('click',()=>logFeed(false));
$('sjQuickFed').addEventListener('click',()=>logFeed(true));
$('sjPhoto').addEventListener('change',e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;
 if(!f.type.startsWith('image/')){alert('Please choose an image.');return;}
 const reader=new FileReader();reader.onload=()=>{
  const img=new Image();img.onload=()=>{
   const scale=Math.min(1,900/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   photoData=c.toDataURL('image/jpeg',0.72);$('sjPhotoPreview').src=photoData;$('sjPhotoPreview').classList.remove('hidden');
  };img.src=reader.result;
 };reader.readAsDataURL(f);
});
$('sjNotify').addEventListener('click',async()=>{
 if(!('Notification'in window)){alert('This browser does not support web notifications.');return;}
 try{const p=await Notification.requestPermission();data.reminders=p==='granted';save();render();alert(p==='granted'?'Notifications are allowed. Reminders are checked while the app is running and when reopened.':'Notifications were not allowed. Check browser and phone settings.');}catch(e){alert('Could not request notification permission in this browser.');}
});
$('sjExport').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sourdough-starter-journal.json';a.click();URL.revokeObjectURL(url);
});
$('sjImportBtn').addEventListener('click',()=>$('sjImportFile').click());
$('sjImportFile').addEventListener('change',e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const v=JSON.parse(r.result);if(!v||!Array.isArray(v.entries))throw Error();if(!confirm('Replace this device journal with the imported journal?'))return;data={...blank(),...v};fill();save();render();alert('Journal imported.');}catch(err){alert('That file is not a valid starter journal.');}};r.readAsText(f);e.target.value='';
});
$('sjReset').addEventListener('click',()=>{if(!confirm('Clear the entire sourdough journal and all its entries? Export first if you want a copy.'))return;data=blank();save();fill();resetEntryForm();render();});
fill();resetEntryForm();render();
setInterval(checkReminder,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
})();
