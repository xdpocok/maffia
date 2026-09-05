const CACHE_VERSION = "maffia-assets-2026-09-05-218-world-rival-balance-v2";
const CORE_ASSETS = [
  "./style.css?v=rail-mission-fit-2026-09-03-22",
  "./styles/hud-redesign.css?v=world-chat-rows-2026-09-01-9",
  "./assets-inline.js",
  "./js/facebook-instant.js?v=facebook-instant-base-2026-08-11-1",
  "./js/asset-runtime.js?v=cache-refresh-2026-08-01-1",
  "./js/world-map.js?v=world-rival-balance-v2-2026-09-05-11",
  "./js/equipment-catalog-data.js?v=item-crop-fix-2026-08-24-2",
  "./js/map-config.js?v=hide-lot-13-marker-2026-09-03-24",
  "./js/save-sync.js?v=world-base-selection-fix-2026-09-03-5",
  "./js/quests.js?v=mentor-dismiss-step-2026-08-10-5",
  "./js/ui-choice-wheel.js?v=choice-wheel-module-2026-08-09-1",
  "./js/shell-game.js?v=shell-game-random-final-2026-08-23-9",
  "./js/dungeon.js?v=dungeon-wave-balance-2026-08-23-14",
  "./js/underworld-exchange.js?v=underworld-exchange-2026-08-22-1",
  "./assets/character/dungeon-fighter-player-v1.webp",
  "./assets/character/dungeon-fighter-enemy-v1.webp",
  "./assets/map/dungeon-corridor-v1.webp",
  "./assets/map/dungeon-guard-room-v1.webp",
  "./assets/map/dungeon-vault-v1.webp",
  "./assets/map/dungeon-hideout-mafia-v1.webp",
  "./js/harbor.js?v=garage-faster-meter-2026-09-01-5",
  "./js/app-shell.js?v=cache-refresh-2026-08-01-1",
  "./game.js?v=world-rival-balance-v2-2026-09-05-43"
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
