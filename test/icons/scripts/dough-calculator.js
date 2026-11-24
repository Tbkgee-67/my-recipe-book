(function(){
 const $=id=>document.getElementById(id);
 const ids=['doughPreset','doughCount','doughPortion','doughFlourChoice','doughDurumPct','doughHydration','doughSalt','doughYeast','doughOil','doughSugar','doughStarter','doughFerment','doughCustomHours'];
 const presets={
  pizza:{count:4,portion:250,flour:'apdurum',durum:30,hydration:62,salt:2.5,yeast:0.3,oil:1,sugar:0,starter:0},
  calzone:{count:4,portion:250,flour:'apdurum',durum:25,hydration:60,salt:2.2,yeast:0.6,oil:2,sugar:1,starter:0},
  panzerotti:{count:4,portion:180,flour:'apdurum',durum:30,hydration:58,salt:2.2,yeast:0.7,oil:3,sugar:1,starter:0},
  bread:{count:1,portion:900,flour:'bread',durum:0,hydration:68,salt:2,yeast:1,oil:0,sugar:0,starter:0},
  sourdough:{count:1,portion:900,flour:'bread',durum:0,hydration:75,salt:2,yeast:0,oil:0,sugar:0,starter:20},
  custom:{count:4,portion:250,flour:'ap',durum:30,hydration:65,salt:2,yeast:0.5,oil:0,sugar:0,starter:0}
 };
 const fmt=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
 function setPreset(){
  const p=presets[$('doughPreset').value];Object.entries({doughCount:p.count,doughPortion:p.portion,doughFlourChoice:p.flour,doughDurumPct:p.durum,doughHydration:p.hydration,doughSalt:p.salt,doughYeast:p.yeast,doughOil:p.oil,doughSugar:p.sugar,doughStarter:p.starter}).forEach(([id,v])=>$(id).value=v);
  updateFields();calculate();
 }
 function updateFields(){
  $('doughDurumWrap').style.display=['apdurum','breaddurum','custom'].includes($('doughFlourChoice').value)?'block':'none';
  $('doughCustomWrap').style.display=$('doughFerment').value==='custom'?'block':'none';
 }
 function calculate(){
  const count=Math.max(1,Math.floor(Number($('doughCount').value))),portion=Number($('doughPortion').value);
  const vals=['doughHydration','doughSalt','doughYeast','doughOil','doughSugar','doughStarter'].map(id=>Number($(id).value));
  const [hydration,saltPct,yeastPct,oilPct,sugarPct,starterPct]=vals;
  const out=$('doughResults');
  if(!Number.isFinite(count)||!Number.isFinite(portion)||count<1||portion<=0||vals.some(v=>!Number.isFinite(v)||v<0)||hydration>150||starterPct>100){out.innerHTML='<strong>Please enter valid positive dough weights and non-negative percentages.</strong>';return;}
  const target=count*portion, flourFactor=1+hydration/100+saltPct/100+yeastPct/100+oilPct/100+sugarPct/100;
  const starterFactor=starterPct/100;
  const baseFlour=target/(flourFactor+starterFactor);
  const starter=baseFlour*starterFactor;
  const starterFlour=starter/2, starterWater=starter/2;
  const flourToAdd=baseFlour-starterFlour;
  const waterToAdd=baseFlour*hydration/100-starterWater;
  const salt=baseFlour*saltPct/100, yeast=baseFlour*yeastPct/100, oil=baseFlour*oilPct/100, sugar=baseFlour*sugarPct/100;
  const choice=$('doughFlourChoice').value, durumPct=choice==='durum'?100:(['apdurum','breaddurum','custom'].includes(choice)?Math.min(100,Math.max(0,Number($('doughDurumPct').value)||0)):0);
  const durum=flourToAdd*durumPct/100, mainFlour=flourToAdd-durum;
  const baseName=choice==='bread'||choice==='breaddurum'?'Bread flour':choice==='durum'?'Durum flour':'All-purpose flour';
  const mainName=choice==='custom'?'Main flour (choose your blend)':baseName;
  const fermentation=$('doughFerment').value;
  const fermentLabel=fermentation==='same'?'Same day: about 2–4 hours':fermentation==='overnight'?'Overnight: about 12–18 hours':fermentation==='custom'?$('doughCustomHours').value+' hours (custom)':fermentation+' hours cold fermentation';
  const rows=[];
  if(mainFlour>0.05)rows.push([mainName,mainFlour]);
  if(durum>0.05)rows.push(['Durum flour',durum]);
  if(waterToAdd>0.05)rows.push(['Water',waterToAdd]);
  if(starter>0.05)rows.push(['100% hydration sourdough starter',starter]);
  if(salt>0.05)rows.push(['Salt',salt]);
  if(yeast>0.05)rows.push(['Yeast',yeast]);
  if(oil>0.05)rows.push(['Oil',oil]);
  if(sugar>0.05)rows.push(['Sugar',sugar]);
  const total=rows.reduce((a,r)=>a+r[1],0);
  const lines=rows.map(r=>r[0]+': '+fmt(r[1])+' g');
  out.dataset.recipe='Dough formula\n'+lines.join('\n')+'\nTotal dough: '+fmt(total)+' g\nPortions: '+count+' × '+fmt(portion)+' g\nHydration: '+fmt(hydration)+'%\nFermentation: '+fermentLabel;
  out.innerHTML='<h3 style="margin:0 0 8px">Your dough formula</h3><p style="font-size:1.35rem;font-weight:800;color:var(--g);margin:0 0 8px">'+fmt(total)+' g total dough</p><p><strong>'+count+' portions × '+fmt(portion)+' g each</strong></p><ul>'+rows.map(r=>'<li><strong>'+r[0]+':</strong> '+fmt(r[1])+' g</li>').join('')+'</ul><p><strong>Hydration:</strong> '+fmt(hydration)+'% &nbsp; <strong>Flour blend:</strong> '+(durumPct?fmt(durumPct)+'% durum':'single flour')+'</p><p><strong>Fermentation:</strong> '+fermentLabel+'</p><p class="help">Weights are rounded for display; calculations use unrounded values.</p>';
 }
 $('doughPreset').addEventListener('change',setPreset);
 $('doughFlourChoice').addEventListener('change',()=>{updateFields();calculate()});
 $('doughFerment').addEventListener('change',()=>{updateFields();calculate()});
 ids.forEach(id=>$(id).addEventListener('input',calculate));
 $('doughCalculate').onclick=calculate;
 $('doughReset').onclick=()=>{$('doughPreset').value='pizza';setPreset();$('doughFerment').value='same';updateFields();calculate()};
 $('doughPrint').onclick=()=>{calculate();const w=window.open('','_blank');if(!w)return;w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Dough Recipe</title><style>body{font:16px Arial;padding:24px}h1{font-size:22px}pre{white-space:pre-wrap;font:16px/1.6 Arial}</style></head><body><h1>My Recipe Book — Dough Formula</h1><pre>'+($('doughResults').dataset.recipe||'')+'</pre></body></html>');w.document.close();w.focus();w.print()};
 $('doughCopy').onclick=async()=>{calculate();const value=$('doughResults').dataset.recipe||'';try{await navigator.clipboard.writeText(value);$('doughCopy').textContent='Copied!';setTimeout(()=>$('doughCopy').textContent='Copy ingredients',1600)}catch(e){const area=document.createElement('textarea');area.value=value;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();$('doughCopy').textContent='Copied!'}};
 $('doughBackBtn').onclick=()=>{quickToolMode=false;showPage('tools');};
 updateFields();setPreset();
})();
