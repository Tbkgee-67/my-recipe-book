/* My Recipe Book installation invitation */
(() => {
  "use strict";

  const dialog = document.getElementById("recipeBookInstallInvite");
  const installButton = document.getElementById("recipeBookInstallAction");
  const laterButton = document.getElementById("recipeBookInstallLater");
  const instructions = document.getElementById("recipeBookInstallInstructions");
  if (!dialog || !installButton || !laterButton || !instructions) return;

  const STORAGE_KEY = "myRecipeBook_installInviteDismissed_v2";
  const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
  let installPrompt = null;
  let retryCount = 0;

  const isInstalled = () => {
    try {
      return window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.navigator.standalone === true ||
        document.referrer.startsWith("android-app://");
    } catch (_) { return false; }
  };

  const markDismissed = (value = String(Date.now())) => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  };

  const dismiss = () => {
    markDismissed();
    if (dialog.open) dialog.close();
  };

  const deviceInstructions = () => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      return "<strong>Install on iPhone or iPad</strong><br>In Safari, tap the Share button, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.";
    }
    if (/Android/i.test(ua)) {
      return "<strong>Install on Android</strong><br>Tap your browser menu (⋮), then choose <strong>Install app</strong> or <strong>Add to Home screen</strong> and follow the prompts.";
    }
    return "<strong>Install on your computer</strong><br>In Chrome or Edge, look for the install icon in the address bar, or open the browser menu and choose <strong>Install My Recipe Book</strong>, if available.";
  };

  const showInvite = () => {
    if (isInstalled() || dialog.open) return;
    const anotherDialogOpen = Array.from(document.querySelectorAll("dialog"))
      .some((item) => item !== dialog && item.open);
    if (anotherDialogOpen) {
      if (retryCount++ < 12) window.setTimeout(showInvite, 5000);
      return;
    }
    try { dialog.showModal(); } catch (_) {}
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.textContent = "⬇ Install My Recipe Book";
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    markDismissed("installed");
    if (dialog.open) dialog.close();
  });

  laterButton.addEventListener("click", dismiss);
  dialog.addEventListener("cancel", dismiss);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dismiss();
  });

  installButton.addEventListener("click", async () => {
    if (isInstalled()) {
      markDismissed("installed");
      if (dialog.open) dialog.close();
      return;
    }

    if (installPrompt) {
      const promptEvent = installPrompt;
      installPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === "accepted") {
          markDismissed("installed");
          if (dialog.open) dialog.close();
          return;
        }
      } catch (_) {}
    }

    instructions.innerHTML = deviceInstructions();
    instructions.hidden = false;
    installButton.textContent = "Got it";
    installButton.onclick = dismiss;
  });

  if (isInstalled()) {
    markDismissed("installed");
    return;
  }

  let lastDismissed = "";
  try { lastDismissed = localStorage.getItem(STORAGE_KEY) || ""; } catch (_) {}
  if (lastDismissed === "installed") return;
  const lastTime = Number(lastDismissed) || 0;
  if (Date.now() - lastTime < REMIND_AFTER_MS) return;

  window.addEventListener("load", () => {
    window.setTimeout(showInvite, 8000);
  }, { once: true });
})();
