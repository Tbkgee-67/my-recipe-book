// Phase 29: initialize the optional embedded preview backup before the main app starts.
try {
  window.__MRB_PREVIEW_BACKUP__ = JSON.parse(
    document.getElementById("mrb-preview-backup").textContent
  );
} catch (error) {
  window.__MRB_PREVIEW_BACKUP__ = null;
}
