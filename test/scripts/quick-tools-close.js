
(()=>{
 const button=document.getElementById('quickToolsCloseBtn');
 const menu=document.getElementById('quickToolsDropdown');
 if(button&&menu){
  button.addEventListener('click',()=>{menu.open=false;});
 }
})();
