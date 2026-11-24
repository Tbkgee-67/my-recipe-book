
(()=>{
 const $=id=>document.getElementById(id);
 const dlg=$('welcomeGuideDlg');
 if(!dlg||!$('openWelcomeGuide'))return;
 const featureSteps=[
  {page:'recipesPage',icon:'📖',title:'1. Recipe Collection, Search & Sorting',desc:'The Recipes page is your home page. Tap anywhere on a recipe card to open it. Use Search to find recipes by name or ingredient, the Categories menu to filter your collection, and the sort menu to arrange recipes by recently updated, name, or oldest first. Use Favorites to find recipes you have marked.'},
  {page:'detailDlg',icon:'🍞',title:'2. Reading & Cooking from a Recipe',desc:'Open a recipe card to see its ingredients and directions. Use Edit to change it, the star to add or remove it from Favorites, Print or Share to use it elsewhere, and the zoom controls to adjust the text. Active Cooking helps you follow the directions while you work; use the baking timer beneath it for timed steps. Voice commands and Read Recipe controls are available on the recipe screen when supported by your browser.'},
  {page:'toolsPage',icon:'🍳',title:'Cooking History',desc:'Open Tools & Settings → App Tools & Settings → Cooking History to review recipes you have cooked. Search past records, edit notes, see your most-cooked recipes, or open a recipe to cook it again. Cooking history is saved automatically and included in backups.'},
  {page:'categoriesPage',icon:'📂',title:'3. Category Manager',desc:'On the home page, open the Categories menu to filter recipes. To manage the list, go to Tools & Settings → Baking Tools → Category Manager. Add, rename, delete, and arrange categories or subcategories, then save your changes. Choose a category when adding or editing a recipe.'},
  {page:'calendarPage',icon:'📅',title:'4. Recipe Calendar & Daily Tasks',desc:'Go to Tools & Settings → Baking Tools → Recipe Calendar & Daily Tasks. Choose a saved recipe and a start date, then enter one task per day and add the plan. Move between months, select a date to see its tasks, and check off tasks as you complete them.'},
  {page:'timerPage',icon:'⏱️',title:'5. Baking Timer',desc:'Go to Tools & Settings → Baking Tools → Baking Timer, or add it to Quick Tools in the header. Enter minutes and seconds, tap Start, and use Stop or Reset as needed. It is handy for dough rests, proofing, and baking.'},
  {page:'hydrationPage',icon:'💧',title:'6. Sourdough Hydration Calculator',desc:'Open Quick Tools in the page header and choose Sourdough Hydration Calculator. Enter additional flour and starter weights, choose the starter hydration, desired dough hydration, and salt percentage, then Calculate. The calculation includes the flour and water already in your starter. A sourdough video link is also provided on the page.'},
  {page:'doughPage',icon:'🍞',title:'7. Dough Calculator',desc:'Go to Tools & Settings → Baking Tools → Dough Calculator. Choose a dough preset and fermentation option, enter your batch details, and calculate to see ingredient weights and dough portions. You can copy or print the resulting formula.'},
  {page:'bakingPage',icon:'🥩',title:'8. EQ Dry Cure Calculator',desc:'Open the Dry Cure Calculator from Quick Tools in the header if it is in your selected shortcuts. Enter the meat weight and unit, check the curing-salt label and select its nitrite percentage, then set the desired salt, sugar, and nitrite values. Review the calculated amounts carefully and follow a tested, safe curing recipe; this calculator does not replace food-safety guidance.'},
  {page:'caloriePage',icon:'🥗',title:'9. Calorie Calculator',desc:'Go to Tools & Settings → Baking Tools → Calorie Calculator. Search for or select an ingredient, enter the amount, and use the calculator to estimate the calories for the ingredients or quantities you are checking. Review the displayed total.'},
  {page:'sugarNutritionPage',icon:'🍎',title:'10. Sugar & Nutrition Checker',desc:'Go to Tools & Settings → Baking Tools → Sugar & Nutrition Checker. Search for a food or ingredient, enter the amount, and review the sugar and nutrition estimate. Use the save option for a custom food when available.'},
  {page:'cookingTempsPage',icon:'🌡️',title:'11. Cooking Temperatures',desc:'Go to Tools & Settings → Baking Tools → Cooking Temperatures. Find the food in the reference list and use the temperature information as a guide when checking whether it is cooked. Follow the appropriate food-safety guidance for the food you are preparing.'},
  {page:'measurementPage',icon:'📏',title:'12. Measurement Converter',desc:'Go to Tools & Settings → Baking Tools → Measurement Converter. Choose the conversion and, where required, the ingredient. Enter an amount and read the converted measurement. Gram conversions depend on the selected ingredient.'},
  {page:'substitutesPage',icon:'🔄',title:'13. Ingredient Substitutes',desc:'Go to Tools & Settings → Baking Tools → Ingredient Substitutes. Search for the ingredient you need to replace, then review the suggested alternatives and any quantity notes before using one in your recipe.'},
  {page:'pantryPage',icon:'🥕',title:'14. Pantry / What’s-in-My-Fridge Recipe Finder',desc:'Go to Tools & Settings → Baking Tools → Pantry / What’s-in-My-Fridge. Enter ingredients you already have and tap Find to look for recipe ideas that match. Use Clear to remove the current ingredient list and start again.'},
  {page:'inventoryPage',icon:'🧺',title:'15. Pantry Inventory',desc:'Go to Tools & Settings → Baking Tools → Pantry Inventory. Add each ingredient with its quantity, unit, storage location (pantry, refrigerator, or freezer), and expiry or best-before date. Search your inventory, and use the inventory in the recipe finder to help find recipes that use what you have. Inventory is saved on this device.'},
  {page:'shoppingPage',icon:'🛒',title:'16. Shopping List',desc:'Go to Tools & Settings → Baking Tools → Shopping List. Add ingredients from a recipe or type items yourself, then use the list while shopping. Your list is saved on this device.'},
  {page:'starterPage',icon:'🌱',title:'17. Sourdough Starter & Dough Journal',desc:'Tap the starter/jar icon in the page header to open the journal. Record starter feedings and dough progress, including notes such as time, temperature, and rise observations. Save entries to track how your starter and dough are behaving.'},
  {page:'toolsPage',icon:'🧰',title:'18. Find Tools & Quick Tools',desc:'Open Tools & Settings from the app to see the Tools page. Baking Tools are listed first; App Tools & Settings is at the bottom. Quick Tools in the page header provides shortcuts to selected functions. Use Add or remove Quick Tools to choose which shortcuts appear in that menu.'},
  {page:'backupDlg',icon:'💾',title:'19. Backup & Restore',desc:'Open Tools & Settings → App Tools & Settings → Backup / Restore, then choose Open Backup / Restore. Create a backup regularly and keep the file somewhere safe. Use the full backup option so your recipe photos are included. Restore a backup when you need to bring your recipes back.'},
  {page:'toolsPage',icon:'☁️',title:'20. Automatic Save / Backup',desc:'Open Tools & Settings → App Tools & Settings → Automatic Save / Backup. Choose a file location when your browser offers it. This feature depends on browser and device support; read the status message and continue making regular Backup / Restore copies as an extra safety measure.'},
  {page:'toolsPage',icon:'🔒',title:'21. PIN Settings',desc:'Open Tools & Settings → App Tools & Settings → PIN Settings to set or manage the app PIN. Keep your PIN somewhere safe and do not share it with anyone you do not trust.'},
  {page:'appIconDlg',icon:'🎨',title:'22. App Icon & Appearance',desc:'Open Tools & Settings → App Tools & Settings → App Icon & Appearance. Choose a built-in icon or upload your own picture. Restore TDK default returns to the standard TDK app icon. The home-screen icon may need to be refreshed or reinstalled through your device.'},
  {page:'toolsPage',icon:'➕',title:'23. Add a Recipe',desc:'Go to Tools & Settings → Baking Tools → Add Recipe. Enter the recipe title, ingredients, and directions, choose a category, and add a picture or other recipe details if you wish. Save the recipe to add it to your collection.'},
  {page:'importDlg',icon:'📥',title:'24. Import Recipes',desc:'Go to Tools & Settings → Baking Tools → Import Recipes. Choose a text file, PDF, recipe photo, or scanned page, or paste recipe or email text. Tap Review imported recipe, check and correct the title, ingredients, and directions, choose categories, then save it.'}
 ];
 const importSteps=[
  {page:'importDlg',icon:'📥',card:'📄',title:'Open Import Recipes',desc:'From the home page, open Tools & Settings, then choose Import Recipes. Tap Choose recipes to import.'},
  {page:'importDlg',icon:'📂',card:'📷',title:'Choose a recipe source',desc:'Select a text file, PDF, photo, or scanned page. You can also paste recipe or email text into the box.'},
  {page:'importDlg',icon:'🔎',card:'🧾',title:'Review the imported recipe',desc:'Tap Review imported recipe. The app opens the recipe editor so you can check the title, ingredients, and directions.'},
  {page:'importDlg',icon:'✏️',card:'📝',title:'Make any corrections',desc:'Fix recognition mistakes, choose categories, and add notes, a photo, or video and website links if you wish.'},
  {page:'recipesPage',icon:'✅',card:'📖',title:'Save your recipe',desc:'Tap Save recipe. Your new recipe will appear in your recipe collection.'}
 ];
 const installSteps=[
  {icon:'🌐',card:'🔗',title:'1. Open the website',desc:'Open your My Recipe Book website in a browser and wait for the page to finish loading. For the best install option, use an up-to-date browser and an internet connection.'},
  {icon:'📱',card:'⋮',title:'2. Android — Chrome',desc:'In Chrome, tap the three dots ⋮. Choose Install app if it appears, then confirm Install. If Chrome shows Add to Home screen instead, choose it and follow the prompts. The wording can vary by phone and Chrome version.'},
  {icon:'🌐',card:'☰',title:'3. Android — Samsung Internet or Edge',desc:'In Samsung Internet, open the browser menu and look for Add page to or Add to Home screen. In Edge, open the menu and look for Add to phone or Install. Choose the option offered by your browser and confirm. If no install option appears, try opening the website in Chrome.'},
  {icon:'🍎',card:'↥',title:'4. iPhone or iPad — Safari',desc:'Open the website in Safari. Tap Share (the square with the upward arrow), scroll down, and choose Add to Home Screen. Confirm the name and tap Add. Other iPhone browsers may show different options.'},
  {icon:'💻',card:'⬇',title:'5. Windows or Mac computer',desc:'In Chrome or Edge, look for the install icon at the right side of the address bar. You can also open the browser menu and choose Install My Recipe Book or Install this site as an app, if offered. Follow the confirmation prompt.'},
  {icon:'🏠',card:'📖',title:'6. Open the installed app',desc:'Find the My Recipe Book icon on your phone home screen, app list, or computer desktop and open it. If you only added a website shortcut, it may open in your browser rather than as a separate installed app.'},
  {icon:'🔄',card:'⬆',title:'7. Updating the app',desc:'When an update notice appears, choose Update Now and allow the page to reload. If the new version does not appear, close the app and reopen it. Your saved recipes are stored separately from the website update; keep regular backups as a precaution.'}
 ];
 let mode='features',step=0;
 function steps(){return mode==='features'?featureSteps:mode==='import'?importSteps:installSteps}
 function renderGuidePage(pageId,cardIcon){
  const host=$('guidePagePreview');if(!host)return;
  host.replaceChildren();
  const source=pageId==='importDlg'?$('importDlg'):pageId?$(pageId):null;
  let heading='My Recipe Book';
  if(source){const h=source.querySelector('h2,h3');if(h)heading=h.textContent.trim();}
  const title=document.createElement('div');title.className='guide-preview-title';title.textContent=heading;host.append(title);
  const addLine=(text,kind='line')=>{const el=document.createElement('div');el.className=kind==='action'?'guide-preview-action':kind==='card'?'guide-preview-card':'guide-preview-line';el.textContent=text;host.append(el)};
  if(pageId==='recipesPage'){
   addLine('🍞  Sourdough bread','card');addLine('🥖  French bread','card');addLine('🍕  Pizza dough','card');addLine('Categories  •  Search');
  }else if(pageId==='toolsPage'){
   const items=[...source.querySelectorAll('.tool-button')].map(x=>x.textContent.trim());(items.length?items:['Baking Tools','App Tools & Settings']).slice(0,6).forEach(x=>addLine(x,'action'));
  }else if(pageId==='importDlg'){
   addLine('Choose file or recipe photo','action');addLine('PDF  •  Text  •  Photo');addLine('Paste recipe or email text');addLine('Recipe website URL');addLine('Review imported recipe','action');
  }else if(pageId==='hydrationPage'){
   addLine('Flour weight  •  Water weight');addLine('Hydration percentage');addLine('Salt percentage');addLine('Calculate','action');
  }else if(pageId==='timerPage'){
   addLine('Minutes     5');addLine('Seconds     0');addLine('05:00','card');addLine('▶ Start   ↺ Reset','action');
  }else if(pageId==='shoppingPage'){
   addLine('Add ingredients from recipe');addLine('Choose recipe…','card');addLine('Shopping list');addLine('Flour  •  Salt  •  Butter');
  }else if(pageId==='starterPage'){
   addLine('Starter & Dough Journal');addLine('Record feeding and rise');addLine('Temperature  •  Time');addLine('Save entry','action');
  }else if(pageId==='calendarPage'){
   addLine('Choose a date','action');addLine('Add recipe to calendar');addLine('Daily tasks');
  }else if(pageId==='categoriesPage'){
   addLine('Recipe categories','card');addLine('Add or rename category');addLine('Organize subcategories');
  }else if(pageId==='doughPage'){
   addLine('Batch size and dough values');addLine('Ingredient weights');addLine('Calculate','action');
  }else if(pageId==='caloriePage'){
   addLine('Enter food and amount');addLine('Review calorie estimate');addLine('Calculate','action');
  }else if(pageId==='sugarNutritionPage'){
   addLine('Search food or ingredient');addLine('Enter amount');addLine('Check sugar & nutrition','action');
  }else if(pageId==='cookingTempsPage'){
   addLine('Find a food');addLine('Cooking temperature reference');
  }else if(pageId==='measurementPage'){
   addLine('Choose ingredient or conversion');addLine('Enter amount');addLine('View converted amount','action');
  }else if(pageId==='substitutesPage'){
   addLine('Search ingredient');addLine('Review substitute ideas');addLine('Search','action');
  }else if(pageId==='pantryPage'){
   addLine('Enter ingredients on hand');addLine('Find matching recipes','action');
  }else if(pageId==='backupDlg'){
   addLine('Create a backup','action');addLine('Restore a backup','action');addLine('Keep a safe copy');
  }else if(pageId==='appIconDlg'){
   addLine('Choose a built-in icon');addLine('Upload your own picture');addLine('Restore TBK default','action');
  }else if(pageId==='detailDlg'){
   addLine('Ingredients and directions');addLine('Edit  •  Favourite  •  Print');addLine('Share  •  Zoom  •  Active Cooking');
  }else{
   addLine(cardIcon||'Explore your app','card');addLine('Your tools and recipe pages');addLine('Tap to open a section');
  }
 }
 function draw(){
  const list=steps(),item=list[step],last=step===list.length-1;
  $('guideCaption').textContent=item.title;$('guideDescription').textContent=item.desc;
  $('guideBigIcon').textContent=item.icon;
  renderGuidePage(item.page||null,item.card||'');
  $('guideStepCount').textContent='Step '+(step+1)+' of '+list.length;
  $('guideProgressBar').style.width=((step+1)/list.length*100)+'%';
  $('guideBackBtn').disabled=step===0;$('guideNextBtn').textContent=last?'Finish ✓':'Next →';
  $('guideSkipBtn').textContent=last?'Close':'Skip';
 }
 function setMode(next){mode=next;step=0;$('guideFeaturesTab').setAttribute('aria-selected',String(mode==='features'));$('guideImportTab').setAttribute('aria-selected',String(mode==='import'));$('guideInstallTab').setAttribute('aria-selected',String(mode==='install'));$('guideFeaturesTab').classList.toggle('alt',mode!=='features');$('guideImportTab').classList.toggle('alt',mode!=='import');$('guideInstallTab').classList.toggle('alt',mode!=='install');draw()}
 const SEEN_KEY='myRecipeBook_welcomeGuide_seen_v1';
 // Existing installations are identified by their established app data/settings keys.
 const EXISTING_KEYS=['myRecipeBook_v1','myRecipeBook_categories_v1','myRecipeBook_shop_v1','myRecipeBook_pin_hash_v1','myRecipeBook_deleted_categories_v1','myRecipeBook_quick_tools_v1','myRecipeBook_categories_collapsed_v1','myRecipeBook_sourdough_journal_v1','myRecipeBook_drive_auto_sync_v1'];
 function alreadyUsedApp(){try{return EXISTING_KEYS.some(key=>localStorage.getItem(key)!==null)}catch(e){return true}}
 function updateWelcomeLaunchVisibility(){const launch=$('welcomeGuideLaunch');if(launch)launch.classList.remove('hidden')}
 function markSeen(){try{localStorage.setItem(SEEN_KEY,'yes')}catch(e){/* Tutorial remains usable if storage is unavailable. */}updateWelcomeLaunchVisibility()}
 function closeGuide(){markSeen();if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open')}
 function open(){setMode('features');if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','')}
 $('openWelcomeGuide').addEventListener('click',open);
 $('replayWelcomeGuideFromTools').addEventListener('click',open);
 $('closeWelcomeGuide').addEventListener('click',closeGuide);
 $('guideFeaturesTab').addEventListener('click',()=>setMode('features'));
 $('guideImportTab').addEventListener('click',()=>setMode('import'));
 $('guideInstallTab').addEventListener('click',()=>setMode('install'));
 $('guideBackBtn').addEventListener('click',()=>{if(step>0){step--;draw()}});
 $('guideNextBtn').addEventListener('click',()=>{if(step<steps().length-1){step++;draw()}else closeGuide()});
 $('guideSkipBtn').addEventListener('click',closeGuide);
 $('guideReplayBtn').addEventListener('click',()=>{step=0;draw()});
 dlg.addEventListener('click',e=>{if(e.target===dlg)closeGuide()});
 dlg.addEventListener('cancel',markSeen);
 draw();
 // Show only on a genuinely fresh install; never interrupt an established recipe collection.
 let seen=false;try{seen=localStorage.getItem(SEEN_KEY)==='yes'}catch(e){seen=true}
 updateWelcomeLaunchVisibility();
 if(!seen&&!alreadyUsedApp())window.setTimeout(()=>{if(!dlg.open)open()},700);
})();
