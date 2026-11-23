/* My Recipe Book — Phase 43 HTML escaping helper.
   Preserves the original HTML-escaping behavior for text inserted into markup. */
(()=>{'use strict';
function escapeHtml(value){
 return String(value??'').replace(/[&<>\"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));
}
window.MRBHtmlEscapeBridge={escape:escapeHtml};
})();
