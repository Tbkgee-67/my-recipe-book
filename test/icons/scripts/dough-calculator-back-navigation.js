// Capture the Dough Calculator Back action before any other page handlers.
document.addEventListener('click', function(event) {
  const backButton = event.target && event.target.closest ? event.target.closest('#doughBackBtn') : null;
  if (!backButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  try {
    quickToolMode = false;
    if (typeof window.showPage === 'function') window.showPage('tools');
    const bakingMenu = document.getElementById('bakingToolsDropdown');
    if (bakingMenu) {
      bakingMenu.open = true;
      bakingMenu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    // Fallback: at minimum return to the main Tools page.
    document.querySelectorAll('.app-page').forEach(page => page.classList.add('hidden'));
    const toolsPage = document.getElementById('toolsPage');
    if (toolsPage) toolsPage.classList.remove('hidden');
  }
}, true);
