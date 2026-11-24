/* My Recipe Book — Phase 48: Recipe text zoom controls */
(()=>{'use strict';
  let zoom=100;
  const $=id=>document.getElementById(id);
  function set(value){
    zoom=Math.max(80,Math.min(160,Math.round(Number(value)/10)*10));
    const detail=$('detail'),level=$('zoomLevel'),out=$('zoomOutBtn'),inBtn=$('zoomInBtn');
    if(detail)detail.style.fontSize=zoom+'%';
    if(level)level.textContent=zoom+'%';
    if(out)out.disabled=zoom<=80;
    if(inBtn)inBtn.disabled=zoom>=160;
    return zoom;
  }
  function init(){
    const out=$('zoomOutBtn'),inBtn=$('zoomInBtn');
    if(out)out.onclick=()=>set(zoom-10);
    if(inBtn)inBtn.onclick=()=>set(zoom+10);
    set(zoom);
  }
  window.MRBRecipeZoom={set,get:()=>zoom,init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
