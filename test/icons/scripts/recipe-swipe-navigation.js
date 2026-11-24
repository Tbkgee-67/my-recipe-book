/* Phase 34: Recipe previous/next and touch-swipe navigation. */
(function () {
  'use strict';
  const bridge = () => window.MRBRecipeSwipeNavigationBridge;
  const byId = (id) => document.getElementById(id);

  function update() {
    const app = bridge();
    if (!app) return;
    const list = app.getVisibleRecipes() || [];
    const currentId = app.getCurrentRecipeId();
    const index = list.findIndex((recipe) => recipe.id === currentId);
    const count = byId('recipeSwipeCount');
    const previous = byId('prevRecipeBtn');
    const next = byId('nextRecipeBtn');
    if (count) count.textContent = index < 0 ? 'Not in current list' : `${index + 1} of ${list.length}`;
    if (previous) {
      previous.disabled = index <= 0;
      previous.style.opacity = index <= 0 ? '.45' : '1';
    }
    if (next) {
      next.disabled = index < 0 || index >= list.length - 1;
      next.style.opacity = index < 0 || index >= list.length - 1 ? '.45' : '1';
    }
  }

  function step(direction) {
    const app = bridge();
    if (!app) return;
    const list = app.getVisibleRecipes() || [];
    const index = list.findIndex((recipe) => recipe.id === app.getCurrentRecipeId());
    const target = list[index + direction];
    if (target) app.openRecipe(target.id);
  }

  const previous = byId('prevRecipeBtn');
  const next = byId('nextRecipeBtn');
  if (previous) previous.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));

  const detail = byId('detail');
  const dialog = byId('detailDlg');
  let touchStart = null;
  if (detail) {
    detail.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
    }, { passive: true });
    detail.addEventListener('touchend', (event) => {
      if (!touchStart || !dialog || !dialog.open || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.25) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  window.MRBRecipeSwipeNavigation = { update };
})();
