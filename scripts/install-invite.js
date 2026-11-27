/* My Recipe Book installation invitation and App Tools installer */
(() => {
  "use strict";

  const dialog = document.getElementById("recipeBookInstallInvite");
  const installButton = document.getElementById("recipeBookInstallAction");
  const laterButton = document.getElementById("recipeBookInstallLater");
  const instructions = document.getElementById("recipeBookInstallInstructions");
  const toolsInstallButton = document.getElementById("openInstallFromToolsBtn");
  if (!dialog || !installButton || !laterButton || !instructions) return;

  const STORAGE_KEY = "myRecipeBook_installInviteDismissed_v2";
  const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
  let deferredInstallPrompt = null;
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

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  const dismissInvite = () => {
    markDismissed();
    closeDialog();
  };

  const showInstructions = () => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      instructions.innerHTML = "<strong>Install on iPhone or iPad</strong><br>In Safari, tap the Share button, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.";
    } else if (/Android/i.test(ua)) {
      instructions.innerHTML = "<strong>Install on Android</strong><br>If the direct install prompt is unavailable, open your browser menu (⋮), choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then follow the prompts.";
    } else {
      instructions.innerHTML = "<strong>Install on your computer</strong><br>In Chrome or Edge, use the install icon in the address bar or choose <strong>Install My Recipe Book</strong> from the browser menu, if available.";
    }
    instructions.hidden = false;
    installButton.textContent = "Got it";
  };

  const openDialog = () => {
    if (!dialog.open) {
      try { dialog.showModal(); } catch (_) {}
    }
  };

  const showInvite = () => {
    if (isInstalled() || dialog.open) return;
    const anotherDialogOpen = Array.from(document.querySelectorAll("dialog"))
      .some((item) => item !== dialog && item.open);
    if (anotherDialogOpen) {
      if (retryCount++ < 12) window.setTimeout(showInvite, 5000);
      return;
    }
    openDialog();
  };

  const resetInstallDialog = () => {
    instructions.hidden = true;
    instructions.textContent = "";
    installButton.textContent = "⬇ Install My Recipe Book";
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the browser's native install confirmation available to our button.
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.textContent = "⬇ Install My Recipe Book";
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    markDismissed("installed");
    closeDialog();
  });

  laterButton.addEventListener("click", dismissInvite);
  dialog.addEventListener("cancel", dismissInvite);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dismissInvite();
  });

  installButton.addEventListener("click", async () => {
    if (isInstalled()) {
      markDismissed("installed");
      closeDialog();
      return;
    }

    // On supported Android/desktop browsers this opens the native install sheet.
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === "accepted") {
          markDismissed("installed");
          closeDialog();
          return;
        }
        // The user chose not to install yet. Keep the dialog available.
        installButton.textContent = "⬇ Try installing again";
        return;
      } catch (_) {
        // If the native prompt fails, provide browser-specific instructions below.
      }
    }

    showInstructions();
    installButton.onclick = () => {
      installButton.onclick = null;
      closeDialog();
    };
  });

  if (toolsInstallButton) {
    toolsInstallButton.addEventListener("click", () => {
      if (isInstalled()) {
        instructions.innerHTML = "<strong>My Recipe Book is already installed</strong><br>You can open it from your home screen or apps list.";
        instructions.hidden = false;
        installButton.textContent = "Close";
        installButton.onclick = () => {
          installButton.onclick = null;
          closeDialog();
        };
      } else {
        resetInstallDialog();
        installButton.onclick = null;
      }
      openDialog();
    });
  }

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
