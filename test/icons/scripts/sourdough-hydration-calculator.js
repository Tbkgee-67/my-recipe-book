// Phase 20: Sourdough Hydration Calculator
// Standalone DOM-only implementation; does not depend on the main app's private helpers.
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const ids=['hydFlour','hydStarter','hydStarterPct','hydTarget','hydSaltPct'];
 const out=$('hydResults');
 if(!out||!$('hydCalculate')||!$('hydReset'))return;
 function calculateHydration(){
  const flour=Number($('hydFlour').value),starter=Number($('hydStarter').value),starterPct=Number($('hydStarterPct').value),target=Number($('hydTarget').value),saltPct=Number($('hydSaltPct').value);
  if(!Number.isFinite(flour)||!Number.isFinite(starter)||flour<=0||starter<0){out.innerHTML='<strong>Please enter a flour weight greater than zero and a starter weight of zero or more.</strong>';return;}
  const starterFlour=starter/(1+starterPct/100),starterWater=starter-starterFlour,totalFlour=flour+starterFlour,totalWater=totalFlour*target/100,waterToAdd=totalWater-starterWater,saltToAdd=totalFlour*saltPct/100;
  if(waterToAdd<0){out.innerHTML='<strong>This starter already contains more water than the selected hydration allows.</strong><p class="help">Choose a higher target hydration or reduce the starter amount.</p>';return;}
  const fmt=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
  out.innerHTML='<h3 style="margin:0 0 10px">Your sourdough formula</h3><p style="font-size:1.45rem;font-weight:800;color:var(--g);margin:0 0 10px">Add '+fmt(waterToAdd)+' g water</p><p><strong>Desired hydration:</strong> '+target+'%</p><p><strong>Salt percentage:</strong> '+saltPct+'%</p><p><strong>Salt to add:</strong> '+fmt(saltToAdd)+' g</p><p><strong>Total flour (including starter):</strong> '+fmt(totalFlour)+' g</p><p><strong>Total water (including starter):</strong> '+fmt(totalWater)+' g</p><p><strong>Flour from starter:</strong> '+fmt(starterFlour)+' g</p><p><strong>Water from starter:</strong> '+fmt(starterWater)+' g</p><p><strong>Additional flour:</strong> '+fmt(flour)+' g</p><p><strong>Starter added:</strong> '+fmt(starter)+' g</p>';
 }
 $('hydCalculate').addEventListener('click',calculateHydration);
 ids.forEach(id=>$(id).addEventListener('input',calculateHydration));
 $('hydReset').addEventListener('click',()=>{$('hydFlour').value=500;$('hydStarter').value=100;$('hydStarterPct').value='100';$('hydTarget').value='70';$('hydSaltPct').value='2';calculateHydration();});
 calculateHydration();
})();
