/* Phase 38 — Recipe Nutrition Calculator separated from the main app script. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const bridge=window.MRBRecipeNutritionCalculatorBridge;
 const say=bridge&&typeof bridge.say==='function'?bridge.say:(message,isError=false)=>console[isError?'error':'log'](message);
function initRecipeNutritionCalculator(){
 const rows=$('recipeNutritionRows'),servings=$('nutritionServings'),list=$('nutritionIngredientOptions');if(!rows||!servings||!list)return;
 const baseIngredients=[
  ['All-purpose flour',364,10.3,76.3,1],['Bread flour',361,12.0,72.5,1.5],['Whole wheat flour',340,13.2,72.6,2.5],['Cake flour',362,8.0,78.0,0.9],['00 pizza flour',356,12.0,72.0,1.5],['Durum flour',360,12.7,72.8,1.1],['Rye flour',335,10.9,75.9,1.5],['Oat flour',404,14.7,65.7,9.1],['Cornmeal',370,7.1,79.4,3.9],['Vital wheat gluten',370,75.0,13.0,1.8],
  ['Granulated sugar',387,0,100,0],['Brown sugar',380,0.1,98.1,0],['Powdered sugar',389,0,99.8,0],['Honey',304,0.3,82.4,0],['Maple syrup',260,0,67.0,0.1],['Molasses',290,0,74.7,0.1],
  ['Butter, salted',717,0.9,0.1,81.1],['Butter, unsalted',717,0.9,0.1,81.1],['Olive oil',884,0,0,100],['Vegetable oil',884,0,0,100],['Coconut oil',892,0,0,100],['Shortening',884,0,0,100],
  ['Whole milk',61,3.2,4.8,3.3],['2% milk',50,3.3,4.8,2],['Skim milk',34,3.4,5,0.1],['Heavy cream',340,2.8,2.8,36.1],['Buttermilk',40,3.3,4.8,0.9],['Plain Greek yogurt',97,9,3.9,5],['Sour cream',198,2.4,4.6,19.4],['Cream cheese',342,6.2,4.1,34.4],
  ['Egg, whole',143,12.6,0.7,9.5],['Egg white',52,10.9,0.7,0.2],['Egg yolk',322,15.9,3.6,26.5],['Active dry yeast',325,40.4,41.2,7.6],['Instant yeast',325,40.4,41.2,7.6],['Baking powder',53,0.1,27.7,0],['Baking soda',0,0,0,0],['Table salt',0,0,0,0],['Vanilla extract',288,0.1,12.7,0.1],
  ['Rolled oats',389,16.9,66.3,6.9],['Almond flour',571,21.2,21.6,49.9],['Almonds',579,21.2,21.6,49.9],['Walnuts',654,15.2,13.7,65.2],['Chia seeds',486,16.5,42.1,30.7],['Flaxseed',534,18.3,28.9,42.2],['Sesame seeds',573,17.7,23.4,49.7],['Sunflower seeds',584,20.8,20,51.5],
  ['Raisins',299,3.1,79.2,0.5],['Dried cranberries, sweetened',308,0.1,82.4,1.1],['Chocolate chips, semi-sweet',479,4.2,63.0,23.0],['Cocoa powder, unsweetened',228,19.6,57.9,13.7],['Shredded coconut, unsweetened',660,6.9,23.7,64.5],
  ['Banana',89,1.1,22.8,0.3],['Apple',52,0.3,13.8,0.2],['Blueberries',57,0.7,14.5,0.3],['Strawberries',32,0.7,7.7,0.3],['Pumpkin puree, canned',34,1.1,8.1,0.3],['Potato',77,2,17.5,0.1],['Sweet potato',86,1.6,20.1,0.1],
  ['Cream of tartar',258,0,61.5,0]
 ];
 const key=v=>String(v||'').trim().toLowerCase();
 let custom=[];try{custom=JSON.parse(localStorage.getItem('recipeBookCustomNutritionIngredients')||'[]');if(!Array.isArray(custom))custom=[]}catch{custom=[]}
 const all=()=>[...baseIngredients,...custom];
 const escHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function refreshOptions(){list.innerHTML=all().map(x=>'<option value="'+escHtml(x[0])+'"></option>').join('')}
 refreshOptions();rows.innerHTML='';
 function addRow(){
  const row=document.createElement('div');row.className='recipe-nutrition-row';
  row.innerHTML=`<div class="nutrition-field"><label>Ingredient (type to search)</label><input type="text" list="nutritionIngredientOptions" class="nutrition-name" placeholder="Search flour, butter, egg…" autocomplete="off"></div>
   <div class="nutrition-field"><label>Amount (g)</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-grams" placeholder="g"></div>
   <div class="nutrition-field"><label>Calories/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-kcal" placeholder="kcal"></div>
   <div class="nutrition-field"><label>Protein g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-protein" placeholder="g"></div>
   <div class="nutrition-field"><label>Carbs g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-carbs" placeholder="g"></div>
   <div class="nutrition-field"><label>Fat g/100g</label><input type="number" min="0" step="any" inputmode="decimal" class="nutrition-fat" placeholder="g"></div>`;
  rows.appendChild(row);
  const name=row.querySelector('.nutrition-name');
  name.addEventListener('change',()=>{const found=all().find(x=>key(x[0])===key(name.value));if(found){row.querySelector('.nutrition-kcal').value=found[1];row.querySelector('.nutrition-protein').value=found[2];row.querySelector('.nutrition-carbs').value=found[3];row.querySelector('.nutrition-fat').value=found[4];calculate()} });
  row.querySelectorAll('input').forEach(input=>input.addEventListener('input',calculate));
 }
 function sum(className){return [...rows.querySelectorAll('.recipe-nutrition-row')].reduce((total,row)=>{const grams=Number(row.querySelector('.nutrition-grams').value)||0;const per100=Number(row.querySelector('.'+className).value)||0;return total+grams*per100/100;},0)}
 function fmt(n){return (Math.round(n*10)/10).toLocaleString(undefined,{maximumFractionDigits:1})}
 function calculate(){const calories=sum('nutrition-kcal'),protein=sum('nutrition-protein'),carbs=sum('nutrition-carbs'),fat=sum('nutrition-fat');const count=Math.max(1,Number(servings.value)||1);$('nutritionTotalCalories').textContent=fmt(calories)+' kcal';$('nutritionPerServing').textContent=fmt(calories/count)+' kcal';$('nutritionProtein').textContent=fmt(protein/count)+' g';$('nutritionCarbs').textContent=fmt(carbs/count)+' g';$('nutritionFat').textContent=fmt(fat/count)+' g';$('nutritionCalculatorNote').textContent='Calculated from '+rows.children.length+' ingredient row(s). Values are estimates; verify with product labels for best accuracy.'}
 servings.addEventListener('input',calculate);$('addNutritionIngredient').addEventListener('click',()=>{addRow();calculate()});
 $('saveCustomNutritionIngredient').addEventListener('click',()=>{const row=rows.querySelector('.recipe-nutrition-row:last-child');if(!row){say('Add an ingredient row first.');return}const name=row.querySelector('.nutrition-name').value.trim();const vals=['nutrition-kcal','nutrition-protein','nutrition-carbs','nutrition-fat'].map(c=>row.querySelector('.'+c).value);if(!name||vals.some(v=>v==='')){say('Enter an ingredient name and all four nutrition values before saving.',true);return}const entry=[name,...vals.map(Number)];const idx=custom.findIndex(x=>key(x[0])===key(name));if(idx>=0)custom[idx]=entry;else custom.push(entry);try{localStorage.setItem('recipeBookCustomNutritionIngredients',JSON.stringify(custom));refreshOptions();say('Saved '+name+' to your custom ingredient list on this device.')}catch{say('Could not save this ingredient on this device.',true)}});
 addRow();calculate();
}
 try{
  initRecipeNutritionCalculator();
 }catch(error){
  console.error('Recipe Nutrition Calculator could not initialize:',error);
  say('The Recipe Nutrition Calculator could not be opened. Please refresh the app.',true);
 }
})();
