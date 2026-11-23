// Phase 24: Sugar & Nutrition Checker extracted from the main app script.
function initSugarNutritionChecker(){
 const search=document.getElementById('sugarFoodSearch'),list=document.getElementById('sugarFoodOptions');
 if(!search||search.dataset.ready==='1')return;
 search.dataset.ready='1';
 const foods=[
 ['Apple',52,10.4,13.8,0.3,0.2,2.4],['Apple, with skin',52,10.4,13.8,0.3,0.2,2.4],['Banana',89,12.2,22.8,1.1,0.3,2.6],['Orange',47,9.4,11.8,0.9,0.1,2.4],['Grapes',69,15.5,18.1,0.7,0.2,0.9],['Blueberries',57,10.0,14.5,0.7,0.3,2.4],['Strawberries',32,4.9,7.7,0.7,0.3,2.0],['Raspberries',52,4.4,11.9,1.2,0.7,6.5],['Blackberries',43,4.9,9.6,1.4,0.5,5.3],['Cherries, sweet',63,12.8,16.0,1.1,0.2,2.1],['Peach',39,8.4,9.5,0.9,0.3,1.5],['Pear',57,9.8,15.2,0.4,0.1,3.1],['Pineapple',50,9.9,13.1,0.5,0.1,1.4],['Watermelon',30,6.2,7.6,0.6,0.2,0.4],['Mango',60,13.7,15.0,0.8,0.4,1.6],['Lemon juice',22,2.5,6.9,0.4,0.2,0.3],['Avocado',160,0.7,8.5,2.0,14.7,6.7],
 ['Carrot',41,4.7,9.6,0.9,0.2,2.8],['Tomato',18,2.6,3.9,0.9,0.2,1.2],['Onion',40,4.2,9.3,1.1,0.1,1.7],['Potato',77,0.8,17.5,2.0,0.1,2.2],['Sweet potato',86,4.2,20.1,1.6,0.1,3.0],['Corn, sweet',86,6.3,18.7,3.3,1.4,2.0],['Broccoli',34,1.7,6.6,2.8,0.4,2.6],['Cucumber',15,1.7,3.6,0.7,0.1,0.5],['Bell pepper, red',31,4.2,6.0,1.0,0.3,2.1],
 ['Whole milk',61,5.1,4.8,3.2,3.3,0],['2% milk',50,5.0,4.8,3.3,2.0,0],['Skim milk',34,5.0,5.0,3.4,0.1,0],['Plain Greek yogurt',97,4.0,3.9,9.0,5.0,0],['Plain yogurt',61,4.7,4.7,3.5,3.3,0],['Cheddar cheese',403,0.5,1.3,25.0,33.0,0],['Egg, whole',143,0.4,0.7,12.6,9.5,0],
 ['All-purpose flour',364,0.3,76.3,10.3,1.0,2.7],['Bread flour',361,0.3,72.5,12.0,1.5,2.4],['Whole wheat flour',340,0.4,72.6,13.2,2.5,10.7],['Rolled oats',389,0.9,66.3,16.9,6.9,10.6],['White rice, cooked',130,0.1,28.2,2.7,0.3,0.4],['Brown rice, cooked',123,0.2,25.6,2.7,1.0,1.6],['White bread',266,5.0,49.0,8.9,3.2,2.7],['Whole wheat bread',247,5.0,41.0,13.0,4.2,7.0],
 ['Granulated sugar',387,100,100,0,0,0],['Brown sugar',380,97,98.1,0.1,0,0],['Powdered sugar',389,99.8,99.8,0,0,0],['Honey',304,82.1,82.4,0.3,0,0.2],['Maple syrup',260,60.5,67.0,0,0.1,0],['Molasses',290,55.0,74.7,0,0.1,0],['Corn syrup',283,0,76.0,0,0,0],['Jam, strawberry',250,50,65,0.5,0.1,1.0],['Raisins',299,59.2,79.2,3.1,0.5,3.7],['Dates, dried',282,63.4,75.0,2.5,0.4,8.0],['Dried cranberries, sweetened',308,65,82.4,0.1,1.1,5.0],
 ['Butter',717,0.1,0.1,0.9,81.1,0],['Olive oil',884,0,0,0,100,0],['Peanut butter',588,9.2,20.0,25.0,50.0,6.0],['Almonds',579,4.4,21.6,21.2,49.9,12.5],['Walnuts',654,2.6,13.7,15.2,65.2,6.7],['Dark chocolate, 70–85%',598,24,45.9,7.8,42.6,10.9],['Milk chocolate',535,51.5,59.4,7.7,29.7,3.4]
 ];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let custom=[];try{custom=JSON.parse(localStorage.getItem('myRecipeBookCustomSugarFoods')||'[]');if(!Array.isArray(custom))custom=[]}catch{custom=[]}
 const all=()=>[...foods,...custom];
 function refresh(){list.innerHTML=all().map(f=>'<option value="'+esc(f[0])+'"></option>').join('')}
 function find(name){return all().find(f=>String(f[0]).toLowerCase()===String(name).trim().toLowerCase())}
 function clear(){['sugarFoodSugar','sugarFoodCalories','sugarFoodCarbs','sugarFoodProtein','sugarFoodFat','sugarFoodFibre'].forEach(id=>$(id).textContent='—')}
 function calculate(){
  const name=search.value.trim(),food=find(name),amount=Number(document.getElementById('sugarFoodAmount').value),unit=document.getElementById('sugarFoodUnit').value;
  if(!food){clear();document.getElementById('sugarFoodStatus').textContent=name?'Food not found. Choose a listed food or add it as a custom food below.':'Search for a food to begin.';return}
  if(!(amount>0)){clear();document.getElementById('sugarFoodStatus').textContent='Enter an amount greater than zero.';return}
  const grams=amount*(unit==='oz'?28.349523125:unit==='lb'?453.59237:1),factor=grams/100;
  const [label,kcal,sugar,carbs,protein,fat,fibre]=food;
  const fmt=(v,d=1)=>Number(v*factor).toFixed(d).replace(/\.0$/,'');
  document.getElementById('sugarFoodSugar').textContent=fmt(sugar)+' g';
  document.getElementById('sugarFoodCalories').textContent=Math.round(kcal*factor)+' kcal';
  document.getElementById('sugarFoodCarbs').textContent=fmt(carbs)+' g';
  document.getElementById('sugarFoodProtein').textContent=fmt(protein)+' g';
  document.getElementById('sugarFoodFat').textContent=fmt(fat)+' g';
  document.getElementById('sugarFoodFibre').textContent=fmt(fibre)+' g';
  document.getElementById('sugarFoodStatus').textContent=label+' — calculated for '+fmt(grams)+' g. Values are estimates.';
 }
 function saveCustom(){
  const name=document.getElementById('customSugarName').value.trim();
  const vals=['customSugarCalories','customSugarValue','customSugarCarbs','customSugarProtein','customSugarFat','customSugarFibre'].map(id=>Number($(id).value));
  if(!name||vals.some((v,i)=>!$(['customSugarCalories','customSugarValue','customSugarCarbs','customSugarProtein','customSugarFat','customSugarFibre'][i]).value.trim()||!Number.isFinite(v)||v<0)){
   document.getElementById('sugarFoodStatus').textContent='Enter a food name and all six nutrition values per 100 g.';return;
  }
  const [kcal,sugar,carbs,protein,fat,fibre]=vals;
  const item=[name,kcal,sugar,carbs,protein,fat,fibre];
  custom=custom.filter(f=>String(f[0]).toLowerCase()!==name.toLowerCase());custom.push(item);
  try{localStorage.setItem('myRecipeBookCustomSugarFoods',JSON.stringify(custom));refresh();search.value=name;calculate();document.getElementById('sugarFoodStatus').textContent=name+' saved on this device.';}
  catch{document.getElementById('sugarFoodStatus').textContent='Could not save this food. Device storage may be full.';}
 }
 refresh();
 document.getElementById('checkSugarFoodBtn').onclick=calculate;
 document.getElementById('sugarFoodSearch').addEventListener('change',calculate);
 document.getElementById('sugarFoodAmount').addEventListener('input',calculate);
 document.getElementById('sugarFoodUnit').addEventListener('change',calculate);
 document.getElementById('saveCustomSugarFoodBtn').onclick=saveCustom;
 document.getElementById('saveSugarFoodBtn').onclick=()=>{document.getElementById('customSugarName').value=search.value.trim();document.getElementById('customSugarName').focus();document.getElementById('sugarNutritionChecker').querySelector('details').open=true;};
}
