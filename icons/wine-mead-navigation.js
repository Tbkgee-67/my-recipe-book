(function wireWineMeadTools(){
 const $=id=>document.getElementById(id);
 const go=(id)=>{if(typeof window.showPage==='function')window.showPage(id)};
 $('openAbvCalculatorBtn')?.addEventListener('click',()=>go('abv'));
 $('openAbvBoostCalculatorBtn')?.addEventListener('click',()=>go('abvBoost'));
 $('openSweetnessCalculatorBtn')?.addEventListener('click',()=>go('sweetness'));
 $('abvBackBtn')?.addEventListener('click',()=>go('tools'));
 $('abvBoostBackBtn')?.addEventListener('click',()=>go('tools'));
 $('sweetBackBtn')?.addEventListener('click',()=>go('tools'));
})();
