const CACHE_VERSION = "maffia-assets-2026-07-30-17";
const CORE_ASSETS = [
  "./style.css?v=perf-2026-07-19-3",
  "./styles/hud-redesign.css?v=influence-system-2026-07-30-07",
  "./assets-inline.js",
  "./js/asset-runtime.js?v=settings-popover-2026-07-27-1",
  "./js/world-map.js?v=influence-system-2026-07-30-1",
  "./js/app-shell.js?v=settings-popover-2026-07-27-1",
  "./game.js?v=influence-system-2026-07-30-16"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("maffia-assets-") && key !== CACHE_VERSION).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }
  const isImage = request.destination === "image";
  if (isImage) {
    event.respondWith(caches.match(request).then((cached) => {
      const refresh = fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()));
        return response;
      });
      return cached || refresh;
    }));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && url.searchParams.has("v")) {
      caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  })));
});
