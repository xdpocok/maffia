const CACHE_VERSION = "maffia-assets-2026-08-10-126-underpass-large-scene";
const CORE_ASSETS = [
  "./style.css?v=underpass-large-scene-2026-08-10-15",
  "./styles/hud-redesign.css?v=nexforge-topbar-join-2026-08-09-2",
  "./assets-inline.js",
  "./js/asset-runtime.js?v=cache-refresh-2026-08-01-1",
  "./js/world-map.js?v=influence-system-2026-07-30-1",
  "./js/equipment-catalog-data.js?v=item-catalog-2026-08-01-1",
  "./js/map-config.js?v=underpass-name-modal-2026-08-10-22",
  "./js/save-sync.js?v=mentor-dismiss-step-2026-08-10-2",
  "./js/quests.js?v=mentor-dismiss-step-2026-08-10-5",
  "./js/ui-choice-wheel.js?v=choice-wheel-module-2026-08-09-1",
  "./js/harbor.js?v=harbor-module-2026-08-09-1",
  "./js/app-shell.js?v=cache-refresh-2026-08-01-1",
  "./game.js?v=underpass-top-layer-2026-08-10-22"
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
