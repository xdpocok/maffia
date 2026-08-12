// Optional Facebook Instant Games bridge. The normal web login remains available.
(() => {
  const API_ORIGIN = "https://maffiabirodalom.hu";
  const nativeFetch = window.fetch.bind(window);
  let bearerToken = "";

  function isApiPath(value) {
    return typeof value === "string" && value.startsWith("/api/");
  }

  function installApiBridge() {
    window.fetch = (input, init = {}) => {
      const requestUrl = isApiPath(input) ? `${API_ORIGIN}${input}` : input;
      if (!isApiPath(input)) return nativeFetch(requestUrl, init);
      const headers = new Headers(init.headers || {});
      if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);
      return nativeFetch(requestUrl, { ...init, headers, credentials: "omit" });
    };
  }

  async function startFacebookSession() {
    if (!window.FBInstant) return null;
    await window.FBInstant.initializeAsync();
    window.FBInstant.setLoadingProgress(20);

    const configResponse = await nativeFetch(`${API_ORIGIN}/api/facebook/config`, {
      headers: { Accept: "application/json" },
      credentials: "omit",
    });
    const config = await configResponse.json().catch(() => ({}));
    if (!configResponse.ok || !config.enabled) {
      throw new Error("A Facebook Instant Games belepes meg nincs bekapcsolva a szerveren.");
    }

    window.FBInstant.setLoadingProgress(45);
    const signedInfo = await window.FBInstant.player.getSignedPlayerInfoAsync(config.requestPayload);
    const response = await nativeFetch(`${API_ORIGIN}/api/facebook/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "omit",
      body: JSON.stringify({
        signedPlayerInfo: signedInfo.getSignature(),
        displayName: window.FBInstant.player.getName() || "",
      }),
    });
    const session = await response.json().catch(() => ({}));
    if (!response.ok || !session.sessionToken) {
      throw new Error(session.error || "A Facebook belepes nem sikerult.");
    }
    bearerToken = session.sessionToken;
    installApiBridge();
    window.FBInstant.setLoadingProgress(80);
    await window.FBInstant.startGameAsync();
    window.FBInstant.setLoadingProgress(100);
    return session;
  }

  window.maffiaFacebookSessionPromise = startFacebookSession().catch((error) => {
    console.warn("Facebook Instant Games inditas kihagyva:", error?.message || error);
    return null;
  });
})();
