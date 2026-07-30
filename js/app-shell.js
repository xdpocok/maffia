(function initializeAppShell(global) {
  const version = global.MaffiaAssetRuntime?.VERSION || "2026-07-19-2";
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    global.addEventListener("load", () => {
      navigator.serviceWorker.register(`./service-worker.js?v=${version}`).catch((error) => {
        console.warn("Az offline gyorsitotar nem indult el.", error);
      });
    }, { once: true });
  }

  const metrics = { longTasks: 0, largestLongTaskMs: 0 };
  if ("PerformanceObserver" in global) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          metrics.longTasks += 1;
          metrics.largestLongTaskMs = Math.max(metrics.largestLongTaskMs, Math.round(entry.duration));
        });
      });
      observer.observe({ type: "longtask", buffered: true });
    } catch {
      // A bongeszo nem tamogatja a long task merest.
    }
  }
  global.MaffiaPerformance = { version, metrics };
})(window);
