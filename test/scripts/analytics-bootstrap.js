window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FDFV84LFLB');

  // Track successful PWA installs where the browser exposes the event.
  window.addEventListener('appinstalled', function () {
    gtag('event', 'pwa_install', { method: 'browser_install' });
  });

  // Track launches in standalone mode as a separate indicator of installed use.
  (function () {
    var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) gtag('event', 'pwa_standalone_launch');
  })();
