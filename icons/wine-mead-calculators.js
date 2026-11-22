// Alcohol by Volume calculator (specific gravity readings).
(function initAbvCalculator(){
 const $=id=>document.getElementById(id);
 const og=$('abvOriginalGravity'), fg=$('abvFinalGravity'), results=$('abvResults');
 if(!og||!fg||!results)return;
 function calculateAbv(){
  const original=Number(og.value), final=Number(fg.value);
  if(!og.value.trim()||!fg.value.trim()||!Number.isFinite(original)||!Number.isFinite(final)){
   results.innerHTML='<h3>Estimated alcohol</h3><p>Please enter both gravity readings.</p>';return;
  }
  if(original<0.900||original>1.200||final<0.900||final>1.200){
   results.innerHTML='<h3>Check your readings</h3><p>Enter specific gravity values between 0.900 and 1.200, such as 1.060 and 1.010.</p>';return;
  }
  if(final>=original){
   results.innerHTML='<h3>No positive ABV estimate</h3><p>Final gravity should normally be lower than original gravity. Check the readings and try again.</p>';return;
  }
  const abv=(original-final)*131.25;
  const points=(original-final)*1000;
  results.innerHTML='<h3>Estimated alcohol by volume</h3><div style="font-size:2.2rem;font-weight:800;color:var(--g);margin:8px 0">'+abv.toFixed(2)+'% ABV</div><p>Gravity drop: '+points.toFixed(1)+' points</p><p class="help">Based on OG '+original.toFixed(3)+' and FG '+final.toFixed(3)+'.</p>';
 }
 $('abvCalculateBtn').onclick=calculateAbv;
 $('abvResetBtn').onclick=()=>{og.value='1.060';fg.value='1.010';results.innerHTML='<h3>Estimated alcohol</h3><p>Enter your gravity readings and tap Calculate ABV.</p>';};
 og.addEventListener('keydown',e=>{if(e.key==='Enter')calculateAbv()});
 fg.addEventListener('keydown',e=>{if(e.key==='Enter')calculateAbv()});
})();


// Sugar and honey planning calculators.
(function initSugarAndSweetnessCalculators(){
 const $id=id=>document.getElementById(id);
 const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:0});
 const toLitres=(value,unit)=>value*(unit==='US gal'?3.785411784:unit==='Imp gal'?4.54609:1);
 function wireCustom(selectId,wrapId){
  const s=$id(selectId),w=$id(wrapId); if(!s||!w)return;
  const update=()=>w.style.display=s.value==='custom'?'':'none';
  s.addEventListener('change',update); update();
 }
 wireCustom('abvBoostTarget','abvBoostCustomWrap');
 wireCustom('sweetTarget','sweetCustomWrap');

 function show(id,title,msg){const el=$id(id);if(el)el.innerHTML='<h3>'+title+'</h3>'+msg;}
 function calcBoost(){
  const enteredVolume=Number($id('abvBoostVolume').value),v=toLitres(enteredVolume,$id('abvBoostUnit').value),cur=Number($id('abvBoostCurrent').value);
  const sel=$id('abvBoostTarget').value,t=sel==='custom'?Number($id('abvBoostCustom').value):Number(sel);
  const factor=Number($id('abvBoostSweetener').value);
  if(!(v>0)||!Number.isFinite(cur)||!Number.isFinite(t)||!(factor>0)||cur<0||t>25){show('abvBoostResults','Check your entries','<p>Enter a valid batch volume and ABV values.</p>');return;}
  if(t<=cur){show('abvBoostResults','No additional sugar needed','<p>Your target must be higher than the current ABV.</p>');return;}
  const sugar=(t-cur)*17*v,amount=sugar/factor;
  show('abvBoostResults','Estimated addition','<div style="font-size:1.9rem;font-weight:800;color:var(--g)">'+fmt(amount)+' g</div><p>Approximately '+(amount/1000).toFixed(2)+' kg of '+($id('abvBoostSweetener').selectedOptions[0].text.split(' (')[0])+'.</p><p>Target increase: '+(t-cur).toFixed(1)+' percentage points ABV.</p><p class="help">This is an estimate of fermentable sugar required. Add in stages, monitor gravity, and confirm yeast tolerance.</p>');
 }
 function calcSweet(){
  const enteredVolume=Number($id('sweetVolume').value),v=toLitres(enteredVolume,$id('sweetUnit').value),cur=Number($id('sweetCurrent').value);
  const sel=$id('sweetTarget').value,t=sel==='custom'?Number($id('sweetCustom').value):Number(sel);
  const factor=Number($id('sweetSweetener').value);
  if(!(v>0)||!Number.isFinite(cur)||!Number.isFinite(t)||cur<0.990||cur>1.200||t<0.990||t>1.200||!(factor>0)){show('sweetResults','Check your entries','<p>Enter a valid batch volume and specific-gravity readings between 0.990 and 1.200.</p>');return;}
  if(t<=cur){show('sweetResults','No sweetener needed','<p>Your current specific gravity ('+cur.toFixed(3)+') is already at or above the selected target ('+t.toFixed(3)+'). Do not add sweetener based on this target.</p>');return;}
  const sugar=(t-cur)*2600*v,amount=sugar/factor;
  show('sweetResults','Estimated addition','<div style="font-size:1.9rem;font-weight:800;color:var(--g)">'+fmt(amount)+' g</div><p>Approximately '+(amount/1000).toFixed(2)+' kg of '+($id('sweetSweetener').selectedOptions[0].text.split(' (')[0])+'.</p><p>Estimated gravity increase: '+(t-cur).toFixed(3)+' SG, from '+cur.toFixed(3)+' to '+t.toFixed(3)+'.</p><p class="help">Add gradually, mix thoroughly, allow bubbles to settle, and recheck with a hydrometer. This is an estimate, not a precise residual-sugar measurement.</p>');
 }
 $id('abvBoostCalculate')?.addEventListener('click',calcBoost);
 $id('sweetCalculate')?.addEventListener('click',calcSweet);
 $id('abvBoostReset')?.addEventListener('click',()=>{$id('abvBoostVolume').value=20;$id('abvBoostUnit').value='L';$id('abvBoostCurrent').value=10;$id('abvBoostTarget').value='13';$id('abvBoostCustom').value=13.5;$id('abvBoostSweetener').value='1';wireCustom('abvBoostTarget','abvBoostCustomWrap');show('abvBoostResults','Additional fermentable sugar','<p>Enter your batch details and calculate.</p>');});
 $id('sweetReset')?.addEventListener('click',()=>{$id('sweetVolume').value=20;$id('sweetUnit').value='L';$id('sweetCurrent').value=1.000;$id('sweetTarget').value='1.010';$id('sweetCustom').value=1.015;$id('sweetSweetener').value='1';wireCustom('sweetTarget','sweetCustomWrap');show('sweetResults','Sweetener required','<p>Enter your batch volume and current specific gravity.</p>');});
})();
