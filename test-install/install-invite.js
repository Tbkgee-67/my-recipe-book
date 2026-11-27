/* Isolated install invitation preview */
(() => {
  "use strict";
  const openInvite = () => {
    const dialog = document.getElementById("recipeBookInstallInvite");
    const installButton = document.getElementById("recipeBookInstallAction");
    const laterButton = document.getElementById("recipeBookInstallLater");
    const instructions = document.getElementById("recipeBookInstallInstructions");
    if (!dialog || !installButton || !laterButton || !instructions) return;

    const KEY = "mrb_install_invite_preview_dismissed_v2";
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    let promptEvent = null;
    const installed = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const closeRemember = () => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch (_) {}
      if (dialog.open) dialog.close();
    };

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      promptEvent = event;
    });

    laterButton.addEventListener("click", closeRemember);
    dialog.addEventListener("cancel", closeRemember);
    dialog.addEventListener("click", event => { if (event.target === dialog) closeRemember(); });

    installButton.addEventListener("click", async () => {
      if (promptEvent) {
        const p = promptEvent;
        promptEvent = null;
        try {
          await p.prompt();
          const result = await p.userChoice;
          if (result && result.outcome === "accepted") {
            try { localStorage.setItem(KEY, "installed"); } catch (_) {}
            if (dialog.open) dialog.close();
            return;
          }
        } catch (_) {}
      }
      const ua = navigator.userAgent || "";
      if (/iPhone|iPad|iPod/i.test(ua)) {
        instructions.innerHTML = "<strong>On iPhone or iPad</strong><br>Open this site in Safari, tap Share, choose <strong>Add to Home Screen</strong>, then tap Add.";
      } else if (/Android/i.test(ua)) {
        instructions.innerHTML = "<strong>On Android</strong><br>Tap your browser menu (⋮), choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then follow the prompts.";
      } else {
        instructions.innerHTML = "<strong>On a computer</strong><br>In Chrome or Edge, look for the install icon in the address bar, or open the browser menu and choose <strong>Install My Recipe Book</strong>, if available.";
      }
      instructions.hidden = false;
      installButton.textContent = "Got it";
      installButton.onclick = closeRemember;
    };

    if (installed()) return;
    let last = "";
    try { last = localStorage.getItem(KEY) || ""; } catch (_) {}
    if (last === "installed" || Date.now() - (Number(last) || 0) < WEEK) return;

    // The preview always checks the dialog after the page has loaded.
    window.setTimeout(() => {
      if (!installed() && !dialog.open) {
        try { dialog.showModal(); } catch (error) { console.warn("Install preview dialog:", error); }
      }
    }, 1500);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openInvite, { once: true });
  } else {
    openInvite();
  }
})();