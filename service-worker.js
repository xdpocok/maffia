const CACHE_VERSION = "maffia-assets-2026-08-23-179-login-url-security";
const CORE_ASSETS = [
  "./style.css?v=shell-cup-betting-2026-08-23-16",
  "./styles/hud-redesign.css?v=harbor-scrollbars-2026-08-23-3",
  "./assets-inline.js",
  "./js/facebook-instant.js?v=facebook-instant-base-2026-08-11-1",
  "./js/asset-runtime.js?v=cache-refresh-2026-08-01-1",
  "./js/world-map.js?v=influence-system-2026-07-30-1",
  "./js/equipment-catalog-data.js?v=item-catalog-2026-08-01-1",
  "./js/map-config.js?v=underpass-name-modal-2026-08-10-22",
  "./js/save-sync.js?v=dungeon-progress-sync-2026-08-22-3",
  "./js/quests.js?v=mentor-dismiss-step-2026-08-10-5",
  "./js/ui-choice-wheel.js?v=choice-wheel-module-2026-08-09-1",
  "./js/shell-game.js?v=shell-game-random-final-2026-08-23-9",
  "./js/dungeon.js?v=dungeon-persistent-health-2026-08-23-13",
  "./js/underworld-exchange.js?v=underworld-exchange-2026-08-22-1",
  "./assets/character/dungeon-fighter-player-v1.webp",
  "./assets/character/dungeon-fighter-enemy-v1.webp",
  "./assets/map/dungeon-corridor-v1.webp",
  "./assets/map/dungeon-guard-room-v1.webp",
  "./assets/map/dungeon-vault-v1.webp",
  "./assets/map/dungeon-hideout-mafia-v1.webp",
  "./js/harbor.js?v=harbor-module-2026-08-09-1",
  "./js/app-shell.js?v=cache-refresh-2026-08-01-1",
  "./game.js?v=harbor-scrollbars-2026-08-23-22"
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
        if (response.ok) {
          const cacheCopy = response.clone();
          event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(request, cacheCopy)));
        }
        return response;
      });
      return cached || refresh;
    }));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && url.searchParams.has("v")) {
      const cacheCopy = response.clone();
      event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(request, cacheCopy)));
    }
    return response;
  })));
});
