/* Isolated install invitation preview — does not touch recipe data */
(() => {
  "use strict";
  const dialog = document.getElementById("recipeBookInstallInvite");
  const installButton = document.getElementById("recipeBookInstallAction");
  const laterButton = document.getElementById("recipeBookInstallLater");
  const instructions = document.getElementById("recipeBookInstallInstructions");
  if (!dialog || !installButton || !laterButton || !instructions) return;

  const KEY = "mrb_install_invite_preview_dismissed";
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  let promptEvent = null;

  const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const closeAndRemember = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (_) {}
    if (dialog.open) dialog.close();
  };

  const showInstructions = () => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      instructions.innerHTML = "<strong>On iPhone or iPad</strong><br>Open this site in Safari, tap Share, choose <strong>Add to Home Screen</strong>, then tap Add.";
    } else if (/Android/i.test(ua)) {
      instructions.innerHTML = "<strong>On Android</strong><br>Open the browser menu (⋮), choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then follow the prompts.";
    } else {
      instructions.innerHTML = "<strong>On a computer</strong><br>In Chrome or Edge, look for the install icon in the address bar, or open the browser menu and choose <strong>Install My Recipe Book</strong>, if available.";
    }
    instructions.hidden = false;
    installButton.textContent = "Got it";
    installButton.onclick = closeAndRemember;
  };

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    promptEvent = event;
  });

  laterButton.addEventListener("click", closeAndRemember);
  dialog.addEventListener("cancel", closeAndRemember);
  dialog.addEventListener("click", event => { if (event.target === dialog) closeAndRemember(); });

  installButton.addEventListener("click", async () => {
    if (promptEvent) {
      const p = promptEvent;
      promptEvent = null;
      try {
        await p.prompt();
        const choice = await p.userChoice;
        if (choice && choice.outcome === "accepted") {
          try { localStorage.setItem(KEY, "installed"); } catch (_) {}
          if (dialog.open) dialog.close();
          return;
        }
      } catch (_) {}
    }
    showInstructions();
  });

  if (isInstalled()) return;
  let previous = "";
  try { previous = localStorage.getItem(KEY) || ""; } catch (_) {}
  if (previous === "installed" || (Date.now() - (Number(previous) || 0) < WEEK)) return;

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      if (!dialog.open) { try { dialog.showModal(); } catch (_) {} }
    }, 3000);
  }, { once: true });
})();