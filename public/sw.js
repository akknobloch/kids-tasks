self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch; no caching to avoid stale data.
self.addEventListener('fetch', () => {});
