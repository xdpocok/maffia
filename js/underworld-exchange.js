(() => {
  const byId = (id) => document.getElementById(id);
  const hotspot = byId("underworldExchangeHotspot");
  const modal = byId("underworldExchangeModal");
  const backdrop = byId("underworldExchangeBackdrop");
  const closeButton = byId("underworldExchangeClose");
  const amountInput = byId("underworldExchangeAmount");
  const toBlackButton = byId("exchangeToBlack");
  const toNormalButton = byId("exchangeToNormal");
  const normalBalance = byId("exchangeNormalBalance");
  const blackBalance = byId("exchangeBlackBalance");
  const status = byId("underworldExchangeStatus");
  if (!hotspot || !modal || !amountInput) return;

  const NORMAL_TO_BLACK_RATE = 0.7;
  const BLACK_TO_NORMAL_RATE = 0.6;

  function normalizeBalances() {
    state.money = Math.max(0, Math.round(Number(state.money) || 0));
    state.underworldMoney = Math.max(0, Math.round(Number(state.underworldMoney) || 0));
  }

  function refreshBalances() {
    normalizeBalances();
    if (normalBalance) normalBalance.textContent = `${state.money} $`;
    if (blackBalance) blackBalance.textContent = String(state.underworldMoney);
    const titleMoney = byId("dungeonUnderworldMoney");
    if (titleMoney) titleMoney.textContent = String(state.underworldMoney);
  }

  function openExchange() {
    refreshBalances();
    status.textContent = "A pénzváltó minden üzletből részesedést tart meg.";
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => amountInput.focus(), 40);
  }

  function closeExchange() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function exchange(direction) {
    normalizeBalances();
    const amount = Math.max(0, Math.floor(Number(amountInput.value) || 0));
    if (amount < 1) {
      status.textContent = "Adj meg legalább 1 egységet.";
      return;
    }
    const toBlack = direction === "black";
    const available = toBlack ? state.money : state.underworldMoney;
    if (amount > available) {
      status.textContent = toBlack ? "Nincs ennyi rendes pénzed." : "Nincs ennyi fekete pénzed.";
      return;
    }
    const received = Math.floor(amount * (toBlack ? NORMAL_TO_BLACK_RATE : BLACK_TO_NORMAL_RATE));
    if (received < 1) {
      status.textContent = "Ez az összeg túl kevés a váltáshoz.";
      return;
    }
    if (toBlack) {
      state.money -= amount;
      state.underworldMoney += received;
      status.textContent = `${amount} $ beváltva: +${received} fekete pénz.`;
    } else {
      state.underworldMoney -= amount;
      state.money += received;
      status.textContent = `${amount} fekete pénz beváltva: +${received} $.`;
    }
    refreshBalances();
    sceneRef?.refreshHUD?.();
    if (typeof saveGame === "function") void saveGame(true);
  }

  hotspot.addEventListener("click", openExchange);
  backdrop?.addEventListener("click", closeExchange);
  closeButton?.addEventListener("click", closeExchange);
  toBlackButton?.addEventListener("click", () => exchange("black"));
  toNormalButton?.addEventListener("click", () => exchange("normal"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeExchange();
  });
})();
