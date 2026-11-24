// Keep every expandable menu closed until the user opens it. After a choice
// (a menu action or recipe category), close all open details panels.
document.addEventListener('click',event=>{
 const target=event.target;
 // Close any open dropdown when the click lands outside its panel.
 // The centered modal backdrop is a pseudo-element on the <details> itself,
 // so a click whose target is the menu container also dismisses it.
 document.querySelectorAll('details[open]').forEach(panel=>{
   if(target===panel || !panel.contains(target)) panel.open=false;
 });
});

document.querySelectorAll('[data-tool-back]').forEach(btn=>btn.addEventListener('click',()=>{const d=btn.closest('details');if(d)d.open=false;const top=document.getElementById('bakingToolsDropdown');if(top){top.open=true;top.scrollIntoView({behavior:'smooth',block:'start'})}}));
