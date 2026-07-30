(function initializeAssetRuntime(global) {
  const VERSION = "2026-07-27-1";
  const optimizedAssets = {
    "./assets/character/gangster-character.png": "./assets/character/gangster-character.webp",
    "./assets/character/player-avatar-boss.png": "./assets/character/player-avatar-boss.webp",
    "./assets/character/player-avatar-lady.png": "./assets/character/player-avatar-lady.webp",
    "./assets/character/player-avatar-enforcer.png": "./assets/character/player-avatar-enforcer.webp",
    "./assets/world/harbor-button.png": "./assets/world/harbor-button.webp",
    "./assets/world/harbor-map-clean-v3.png": "./assets/world/harbor-map-clean-v3.webp",
    "./assets/world/npc-city-map-1.png": "./assets/world/npc-city-map-1.webp",
    "./assets/world/npc-city-map-2.png": "./assets/world/npc-city-map-2.webp",
    "./assets/world/npc-city-map-3.png": "./assets/world/npc-city-map-3.webp",
    "./garage-assets/sedan-1930.png": "./garage-assets/sedan-1930.webp",
    "./garage-assets/smuggler-van-1930.png": "./garage-assets/smuggler-van-1930.webp",
    "./garage-assets/armored-money-car-1930.png": "./garage-assets/armored-money-car-1930.webp"
  };
  const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  function optimizedPath(rawPath = "") {
    const path = String(rawPath || "");
    const [pathname, query = ""] = path.split("?", 2);
    const upgraded = optimizedAssets[pathname] || pathname;
    return query ? `${upgraded}?${query}` : upgraded;
  }

  function loadImage(image) {
    if (!(image instanceof HTMLImageElement)) return;
    const pendingSource = image.dataset.src;
    if (pendingSource) {
      image.src = optimizedPath(pendingSource);
      delete image.dataset.src;
    } else if (image.src && !image.src.startsWith("data:")) {
      const upgraded = optimizedPath(image.getAttribute("src") || "");
      if (upgraded && upgraded !== image.getAttribute("src")) image.src = upgraded;
    }
    if (image.dataset.srcset) {
      image.srcset = image.dataset.srcset;
      delete image.dataset.srcset;
    }
    image.decoding = "async";
  }

  const observer = "IntersectionObserver" in global
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "320px" })
    : null;

  function observe(root = document) {
    root.querySelectorAll?.("img").forEach((image) => {
      if (image.dataset.deferUntilLogin) return;
      if (image.dataset.src && observer) observer.observe(image);
      else loadImage(image);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    observe(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node instanceof HTMLImageElement) {
          if (node.dataset.src && observer) observer.observe(node);
          else loadImage(node);
        }
        observe(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });
  }, { once: true });

  global.MaffiaAssetRuntime = { VERSION, optimizedPath, observe, loadImage, transparentPixel };
  global.optimizedAssetPath = optimizedPath;
})(window);
