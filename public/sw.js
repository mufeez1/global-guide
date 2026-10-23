// Offline support for pages you've opened. Remote API data is cached separately in IndexedDB.
const VERSION = "ic-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Build assets are content-hashed: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }

  // Pages: network first, fall back to the last copy, then the offline page.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => put(req, res))
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL)))
    );
  }
});

function put(req, res) {
  if (res.ok) {
    const copy = res.clone();
    caches.open(VERSION).then((c) => c.put(req, copy));
  }
  return res;
}
