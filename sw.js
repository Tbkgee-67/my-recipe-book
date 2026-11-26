// My Recipe Book - production service worker
// Release marker: first-install starter recipes added (2026-11-26)
// Network-first keeps the installed app current when online, with a cache fallback offline.

const CACHE_PREFIX = "my-recipe-book-cache:";
const CACHE_NAME = CACHE_PREFIX + new URL(self.registration.scope).pathname;

self.addEventListener("install", () => {
  // Wait for the app's Update Now button before replacing the active worker.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;

      if (request.mode === "navigate") {
        const appPage = await cache.match(new URL("./index.html", self.registration.scope).href);
        if (appPage) return appPage;
      }
      throw error;
    }
  })());
});
