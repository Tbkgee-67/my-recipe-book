(()=> {
 const $=id=>document.getElementById(id);
 const ids=['dcMeatWeight','dcWeightUnit','dcTargetPpm','dcNitritePct','dcSaltPct','dcSugarPct'];
 const out=$('dcResults'); if(!out)return;
 const fmt=n=>Number(n.toFixed(3)).toString();
 function calculate(){
  const [raw,unit,ppmRaw,nitriteRaw,saltRaw,sugarRaw]=ids.map(id=>$(id).value);
  const weight=Number(raw),ppm=Number(ppmRaw),nitrite=Number(nitriteRaw),saltPct=Number(saltRaw),sugarPct=Number(sugarRaw);
  if(!raw||!ppmRaw||!nitriteRaw||saltRaw===''||sugarRaw===''||![weight,ppm,nitrite,saltPct,sugarPct].every(Number.isFinite)||weight<=0||ppm<=0||nitrite<=0||nitrite>=100||saltPct<0||sugarPct<0){
   out.classList.remove('hidden');out.innerHTML='<strong>Check your entries.</strong><p>Enter a positive meat weight and nitrite target, a valid Cure #1 nitrite percentage, and non-negative salt and sugar percentages.</p>';return;
  }
  const meatG=weight*(unit==='lb'?453.59237:1);
  const cureG=meatG*ppm/1000000/(nitrite/100);
  const saltInCureG=cureG*(1-nitrite/100);
  const targetSaltG=meatG*saltPct/100;
  const plainSaltG=targetSaltG-saltInCureG;
  const sugarG=meatG*sugarPct/100;
  const totalG=cureG+Math.max(0,plainSaltG)+sugarG;
  let html='<h4 style="margin-top:0">🥓 Results</h4><p><strong>Meat weight:</strong> '+fmt(meatG)+' g</p><p><strong>Cure #1 weight:</strong> '+fmt(cureG)+' g</p>';
  if(plainSaltG < -0.0005){html+='<p style="color:#a63e32"><strong>Warning:</strong> The salt already contained in Cure #1 exceeds the desired total salt amount. These inputs do not fit together. Do not use this result; check your tested recipe and product label.</p>';}
  else {html+='<p><strong>Salt weight:</strong> '+fmt(plainSaltG)+' g</p>';}
  html+='<p><strong>Sugar weight:</strong> '+fmt(sugarG)+' g</p><p><strong>Total:</strong> '+fmt(totalG)+' g</p><p class="help">Salt weight is the additional plain salt after subtracting the salt contribution from Cure #1. Total is the sum of the ingredients to add.</p>';
  out.innerHTML=html;out.classList.remove('hidden');
 }
 $('dcCalculateBtn').addEventListener('click',calculate);
 $('dcClearBtn').addEventListener('click',()=>{ids.forEach(id=>$(id).value=({dcWeightUnit:'g',dcNitritePct:'6.25',dcSaltPct:'2',dcSugarPct:'1'}[id]??''));out.classList.add('hidden');out.innerHTML='';});
})();
