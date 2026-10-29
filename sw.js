
const CACHE = 'my-recipe-book-rebuilt-v5';
const FILES = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await Promise.all(FILES.map(async file => {
        try {
          const response = await fetch(file, { cache: 'no-store' });
          if (response && response.ok) {
            await cache.put(file, response);
          }
        } catch (_) {}
      }));
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key =>
        key.startsWith('my-recipe-book-rebuilt-') &&
        key !== CACHE
      )
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isPage =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname.endsWith('/index.html');

  if (isPage) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, {
          cache: 'no-store'
        });
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(event.request)) ||
          (await caches.match('./index.html')) ||
          new Response('My Recipe Book is unavailable offline.', {
            status: 503
          });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    const response = await fetch(event.request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(event.request, response.clone()).catch(() => {});
    }
    return response;
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const targetUrl = new URL('./', self.registration.scope).href;
    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of windows) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client && client.url !== targetUrl) {
          try {
            await client.navigate(targetUrl);
          } catch (_) {}
        }
        return;
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
