/* Phase 33: Bakers Percentage, Preferment, and Dough Temperature calculators. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
$('openBakersPctBtn').onclick=()=>showPage('bakersPct');
$('openPrefermentBtn').onclick=()=>showPage('preferment');
$('openDoughTempBtn').onclick=()=>showPage('doughTemp');
['bakersPct','preferment','doughTemp'].forEach(k=>{
 const back=$(k==='bakersPct'?'bakersPctBack':k==='preferment'?'prefermentBack':'doughTempBack');
 back.onclick=()=>showPage('tools');
});
const num=id=>{const v=parseFloat($(id).value);return Number.isFinite(v)?v:0};
const fmt=n=>Number.isFinite(n)?(Math.round(n*100)/100).toLocaleString(undefined,{maximumFractionDigits:2}):'—';
function updateBakersPct(){
 const f=num('bpFlour'), vals=[['Flour',f],['Water',num('bpWater')],['Salt',num('bpSalt')],['Yeast / starter',num('bpYeast')],['Other',num('bpOther')]];
 const total=vals.reduce((a,x)=>a+x[1],0);
 $('bpResults').innerHTML=f>0?`<p><strong>Total dough weight: ${fmt(total)} g</strong></p><ul>${vals.map(([n,v])=>`<li>${n}: ${fmt(v)} g — ${fmt(v/f*100)}%</li>`).join('')}</ul>`:'Enter a flour weight greater than zero.';
}
['bpFlour','bpWater','bpSalt','bpYeast','bpOther'].forEach(id=>$(id).addEventListener('input',updateBakersPct));
$('bpReset').onclick=()=>{[['bpFlour',500],['bpWater',350],['bpSalt',10],['bpYeast',5],['bpOther',0]].forEach(([i,v])=>$(i).value=v);updateBakersPct()};updateBakersPct();

function updatePreferment(){
 const f=num('pfTotalFlour'),p=num('pfPct'),h=num('pfHydration'),th=num('pfTotalHydration');
 const pf=f*p/100, pw=pf*h/100, totalWater=f*th/100, finalFlour=f-pf, finalWater=totalWater-pw;
 $('pfResults').innerHTML=f>0&&p>=0&&p<=100&&finalWater>=0?`<h3>Preferment</h3><p>Flour: <strong>${fmt(pf)} g</strong><br>Water: <strong>${fmt(pw)} g</strong></p><h3>Final dough additions</h3><p>Remaining flour: <strong>${fmt(finalFlour)} g</strong><br>Remaining water: <strong>${fmt(finalWater)} g</strong></p><p>Total recipe water: ${fmt(totalWater)} g (${fmt(th)}% hydration)</p>`:'Check your values. Preferment flour must be 0–100% and preferment water cannot exceed the recipe water.';
}
['pfTotalFlour','pfPct','pfHydration','pfTotalHydration'].forEach(id=>$(id).addEventListener('input',updatePreferment));
$('pfReset').onclick=()=>{[['pfTotalFlour',500],['pfPct',30],['pfHydration',100],['pfTotalHydration',75]].forEach(([i,v])=>$(i).value=v);updatePreferment()};updatePreferment();


function updateDoughTemp(){
 const unit=$('dtUnit').value, raw=[num('dtTarget'),num('dtRoom'),num('dtFlour'),num('dtPreferment'),num('dtFriction')];
 // Convert absolute temperatures to Celsius; friction is a temperature difference.
 const vals=unit==='F'?[...raw.slice(0,4).map(v=>(v-32)*5/9),raw[4]*5/9]:raw;
 const [target,room,flour,pref,friction]=vals;
 const waterC=target*4-room-flour-pref-friction, waterF=waterC*9/5+32;
 $('dtResults').innerHTML=`<h3>Required water temperature</h3><p style="font-size:1.6rem;font-weight:800;color:var(--g)">${fmt(waterC)} °C / ${fmt(waterF)} °F</p><p class="help">Calculation in Celsius: (${fmt(target)} × 4) − ${fmt(room)} − ${fmt(flour)} − ${fmt(pref)} − ${fmt(friction)}</p>`;
}
function updateDoughTempLabels(){const u=$('dtUnit').value;[['dtTargetLabel','Desired dough temperature'],['dtRoomLabel','Room temperature'],['dtFlourLabel','Flour temperature'],['dtPrefermentLabel','Preferment temperature'],['dtFrictionLabel','Friction factor']].forEach(([id,label])=>$(id).textContent=`${label} (${u==='C'?'°C':'°F'})`);updateDoughTemp()}
['dtTarget','dtRoom','dtFlour','dtPreferment','dtFriction'].forEach(id=>$(id).addEventListener('input',updateDoughTemp));
$('dtUnit').addEventListener('change',updateDoughTempLabels);
$('dtReset').onclick=()=>{$('dtUnit').value='C';[['dtTarget',24],['dtRoom',22],['dtFlour',22],['dtPreferment',22],['dtFriction',6]].forEach(([i,v])=>$(i).value=v);updateDoughTempLabels()};updateDoughTempLabels();

})();
