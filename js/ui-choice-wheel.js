// Choice wheel buttons, panels, countdowns and action routing.

function setChoiceWheelButtons(visibleIds) {
  const map = {
    robbery: choiceWheelAction1,
    protection: choiceWheelAction2,
    close: choiceWheelAction4,
  };
  Object.entries(map).forEach(([id, button]) => {
    if (!button) return;
    button.classList.toggle("hidden", !visibleIds.includes(id));
    button.disabled = false;
    button.removeAttribute("title");
    if (visibleIds.includes(id)) button.dataset.choiceAction = id;
  });
  if (choiceWheelAction5) {
    const fifthAction = visibleIds.includes("quest")
      ? "quest"
      : visibleIds.includes("lotRobbery")
        ? "lotRobbery"
        : "";
    choiceWheelAction5.classList.toggle("hidden", !fifthAction);
    choiceWheelAction5.disabled = false;
    choiceWheelAction5.removeAttribute("title");
    choiceWheelAction5.dataset.choiceAction = fifthAction;
  }
  if (choiceWheelAction3) {
    const thirdAction = visibleIds.includes("rival")
      ? "rival"
      : visibleIds.includes("baseRest")
        ? "baseRest"
        : visibleIds.includes("lotInfo")
          ? "lotInfo"
          : "";
    choiceWheelAction3.classList.toggle("hidden", !thirdAction);
    choiceWheelAction3.disabled = false;
    choiceWheelAction3.dataset.choiceAction = thirdAction;
  }
}

let choiceWheelCountdownTimer = null;
let activeRobberyGame = null;
let robberyAutoPlayTimer = null;

function hideChoiceWheel() {
  if (choiceWheelCountdownTimer) {
    window.clearInterval(choiceWheelCountdownTimer);
    choiceWheelCountdownTimer = null;
  }
  activeChoiceSpot = null;
  choiceWheel?.classList.add("hidden");
  choiceWheel?.setAttribute("aria-hidden", "true");
  sceneRef?.spotGraphics?.clear();
  clearSvgMapSelection();
}

function refreshChoiceWheelProtectionCountdown() {
  const spot = activeChoiceSpot;
  if (!spot || spot.kind === "park" || !choiceWheelAction2 || choiceWheel?.classList.contains("hidden")) return;
  if (choiceWheelAction2.dataset.choiceAction !== "protection") return;
  if (spot.kind === "lot") {
    if (getLotLevel(spot) <= 0 || passiveIncomeOnlyLotIds.has(spot.id)) return;
  }
  const protectionCost = 8;
  const cooldown = getProtectionCooldownRemaining(spot.id);
  const canProtect = state.health > 0 && state.energy >= protectionCost;
  choiceWheelAction2.textContent = cooldown > 0
    ? `Védelmi pénz (${formatCountdown(cooldown)})`
    : canProtect
      ? `Védelmi pénz (-${protectionCost} energia)`
      : `Védelmi pénz (${protectionCost} energia kell)`;
  choiceWheelAction2.disabled = cooldown > 0 || !canProtect;
}

function startChoiceWheelCountdown() {
  if (choiceWheelCountdownTimer) window.clearInterval(choiceWheelCountdownTimer);
  choiceWheelCountdownTimer = window.setInterval(refreshChoiceWheelProtectionCountdown, 1000);
}

function showLotInfoModal(lot) {
  if (!lotInfoModal || !lot) return;
  const level = getLotLevel(lot);
  const houseDef = getLotHouseDef(lot);
  const ownerType = getLotOwnerType(lot);
  const nextCost = level >= 3 ? null : getLotInvestmentCost(lot);
  const privateCost = getLotInvestmentCost(lot, "private");
  const cityCost = getLotInvestmentCost(lot, "city");
  if (lotInfoTitle) lotInfoTitle.textContent = lot.name;
  if (lotInfoDescription) {
    if (lot.restoredHouse && level <= 0) {
      lotInfoDescription.textContent = "Ezt a házat kétféleképpen veheted meg: saját házként kis napi bevételért, vagy városi házként, amit utána kirabolhatsz és védelmi pénzt is szedhetsz belőle.";
    } else if (lot.restoredHouse && ownerType === "private") {
      lotInfoDescription.textContent = `${houseDef?.name || "Ház"}. Saját házként működik: naponta kis passzív pénzt ad, és csak védelmi pénzt szedhetsz belőle.`;
    } else if (lot.restoredHouse && ownerType === "city") {
      lotInfoDescription.textContent = `${houseDef?.name || "Ház"}. Városi házként működik: kirabolható, és védelmi pénzt is szedhetsz belőle.`;
    } else {
      lotInfoDescription.textContent = houseDef
        ? `${houseDef.name}. A ház jelenleg stabil passzív bevételt termel a birodalmadnak.`
        : "A telek még üres. Vásárlás után megjelenik rajta a 1930-as stílusú ház.";
    }
  }
  if (lotInfoLevel) {
    if (lot.restoredHouse && level > 0) {
      lotInfoLevel.textContent = ownerType === "city" ? "Varosi haz" : "Sajat haz";
    } else {
      lotInfoLevel.textContent = houseDef ? `${level}. szint` : "Nincs megveve";
    }
  }
  if (lotInfoHourlyIncome) {
    if (lot.restoredHouse && level <= 0) {
      lotInfoHourlyIncome.textContent = `Sajat: ${Math.round((Number(lot.passiveIncome) || 24) / 24)} $`;
    } else {
      lotInfoHourlyIncome.textContent = `${getLotHourlyIncome(lot)} $`;
    }
  }
  if (lotInfoDailyIncome) {
    if (lot.restoredHouse && level <= 0) {
      lotInfoDailyIncome.textContent = `Sajat: ${Number(lot.passiveIncome) || 24} $ / Varos: 0 $`;
    } else {
      lotInfoDailyIncome.textContent = `${getLotIncome(lot)} $`;
    }
  }
  if (lotInfoNextCost) {
    if (lot.restoredHouse && level <= 0) {
      lotInfoNextCost.textContent = `Sajat ${privateCost} $ / Varos ${cityCost} $`;
    } else {
      lotInfoNextCost.textContent = nextCost ? `${nextCost} $` : "Maximum";
    }
  }
  lotInfoModal.classList.remove("hidden");
  lotInfoModal.setAttribute("aria-hidden", "false");
}

function hideLotInfoModal() {
  lotInfoModal?.classList.add("hidden");
  lotInfoModal?.setAttribute("aria-hidden", "true");
}

function showUnderpassModal() {
  hideChoiceWheel();
  const underworldMoney = Math.max(0, Math.round(Number(state?.underworldMoney) || 0));
  const underworldXp = Math.max(0, Math.round(Number(state?.underworldXp) || 0));
  const underworldLevel = Math.min(88, Math.max(1, Math.floor(Math.sqrt(underworldXp / 50)) + 1));
  const nextLevelXp = 50 * underworldLevel * underworldLevel;
  const moneyEl = document.getElementById("dungeonUnderworldMoney");
  const xpEl = document.getElementById("dungeonUnderworldXp");
  const levelEl = document.getElementById("dungeonUnderworldLevel");
  if (moneyEl) moneyEl.textContent = String(underworldMoney);
  if (xpEl) xpEl.textContent = underworldLevel >= 88 ? `${underworldXp} / MAX` : `${underworldXp} / ${nextLevelXp}`;
  if (levelEl) levelEl.textContent = String(underworldLevel);
  underpassModal?.classList.remove("hidden");
  underpassModal?.setAttribute("aria-hidden", "false");
}

function hideUnderpassModal() {
  underpassModal?.classList.add("hidden");
  underpassModal?.setAttribute("aria-hidden", "true");
}

function getRobberyChoiceDetails(spot = {}) {
  const mode = spot.mode === "shop" ? "shop" : "street";
  return mode === "shop"
    ? { mode, energyCost: 18, label: "Üzletkirablás – 18 energia" }
    : { mode, energyCost: 12, label: "Utcai támadás – 12 energia" };
}

function setRobberyChoiceButton(button, spot = {}) {
  if (!button) return;
  const details = getRobberyChoiceDetails(spot);
  const available = state.health > 0 && state.energy >= details.energyCost;
  button.textContent = details.label;
  button.disabled = !available;
  if (!available) {
    button.title = state.health <= 0
      ? "A támadáshoz legalább 1 életerő kell."
      : `Nincs elég energia. Szükséges: ${details.energyCost}.`;
  } else {
    button.removeAttribute("title");
  }
  return details;
}

function showChoiceWheel(spot) {
  activeChoiceSpot = spot;
  if (!choiceWheel || !choiceWheelPanel) return;
  syncTimedActions();
  hideQuestCard();
  const spotQuest = getQuestAtSpot(spot.id);

  const panelWidth = 188;
  const panelHeight = 224;
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const inwardOffsetX = spot.x >= viewportCenterX ? -(panelWidth * 0.42) : panelWidth * 0.42;
  const inwardOffsetY = spot.y >= viewportCenterY ? -(panelHeight * 0.18) : panelHeight * 0.18;
  const x = clamp(spot.x + inwardOffsetX, panelWidth / 2 + 16, window.innerWidth - panelWidth / 2 - 16);
  const y = clamp(spot.y + inwardOffsetY, panelHeight / 2 + 16, window.innerHeight - panelHeight / 2 - 16);

  choiceWheel.classList.remove("hidden");
  choiceWheel.setAttribute("aria-hidden", "false");
  startChoiceWheelCountdown();
  choiceWheelPanel.style.left = `${x}px`;
  choiceWheelPanel.style.top = `${y}px`;
  if (spot.kind === "park") {
    setChoiceWheelButtons(["robbery", "protection", "baseRest", "close"]);
    const healthRecovery = state.recoveryEffects.health;
    const energyRecovery = state.recoveryEffects.energy;
    const activeRecovery = healthRecovery || energyRecovery;
    const activeRecoveryLocation = activeRecovery?.spotName || "másik helyszín";
    const healthUsage = getRecoveryUsageState("health");
    const energyUsage = getRecoveryUsageState("energy");
    const hideUsesLeft = Math.max(0, RECOVERY_USAGE_LIMIT - healthUsage.uses);
    const meetingUsesLeft = Math.max(0, RECOVERY_USAGE_LIMIT - energyUsage.uses);
    if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
    if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Semleges terület · 3 órás keret";
    if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Park";
    if (choiceWheelAction1) {
      choiceWheelAction1.textContent = healthRecovery
        ? `Lapulás: ${activeRecoveryLocation} (${formatCountdown(healthRecovery.endsAt - Date.now())})`
        : energyRecovery
          ? `Foglalt: ${activeRecoveryLocation}`
          : hideUsesLeft <= 0
            ? `Lapulás (újra: ${formatCountdown(healthUsage.resetAt - Date.now())})`
            : `Lapulás (+50 HP, ${hideUsesLeft}/3)`;
      choiceWheelAction1.disabled = Boolean(healthRecovery) || Boolean(energyRecovery) || hideUsesLeft <= 0;
    }
    if (choiceWheelAction2) {
      choiceWheelAction2.textContent = energyRecovery
        ? `Találkozó: ${activeRecoveryLocation} (${formatCountdown(energyRecovery.endsAt - Date.now())})`
        : healthRecovery
          ? `Foglalt: ${activeRecoveryLocation}`
          : meetingUsesLeft <= 0
            ? `Találkozó (újra: ${formatCountdown(energyUsage.resetAt - Date.now())})`
            : `Találkozó (+50 energia, ${meetingUsesLeft}/3)`;
      choiceWheelAction2.disabled = Boolean(energyRecovery) || Boolean(healthRecovery) || meetingUsesLeft <= 0;
    }
    if (choiceWheelAction3) choiceWheelAction3.textContent = "Terület info";
    if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
    return;
  }
  if (spot.kind === "lot") {
    const level = getLotLevel(spot);
    const houseDef = getLotHouseDef(spot);
    const ownerType = getLotOwnerType(spot);
    if (spot.restoredHouse) {
      const ownCost = getLotInvestmentCost(spot, "private");
      const cityCost = getLotInvestmentCost(spot, "city");
      if (level <= 0) {
        setChoiceWheelButtons(["robbery", "protection", "lotInfo", "close"]);
        if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
        if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Két módon vásárolható ház";
        if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Üres ház";
        if (choiceWheelAction1) {
          choiceWheelAction1.textContent = `Sajátnak (${ownCost} $)`;
          choiceWheelAction1.disabled = !canAfford(ownCost);
        }
        if (choiceWheelAction2) {
          choiceWheelAction2.textContent = `Városnak (${cityCost} $)`;
          choiceWheelAction2.disabled = !canAfford(cityCost);
        }
        if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
        if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
        if (choiceWheelAction5) choiceWheelAction5.textContent = "";
        return;
      }
      if (ownerType === "private") {
        setChoiceWheelButtons(["protection", "lotInfo", "close", ...(spotQuest ? ["quest"] : [])]);
        if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
        if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = `Saját ház - ${getLotIncome(spot)} $ / nap`;
        if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Saját ház";
        refreshChoiceWheelProtectionCountdown();
        if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
        if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
        if (choiceWheelAction5) choiceWheelAction5.textContent = spotQuest ? "Küldetés" : "";
        return;
      }
      const protectionCost = 8;
      const cooldown = getProtectionCooldownRemaining(spot.id);
      const canProtect = state.health > 0 && state.energy >= protectionCost;
      setChoiceWheelButtons(["robbery", "protection", "lotInfo", "close", ...(spotQuest ? ["quest"] : [])]);
      if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
      if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Városi ház - kirabolható";
      if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Városi ház";
      if (choiceWheelAction1) {
        setRobberyChoiceButton(choiceWheelAction1, spot);
      }
      if (choiceWheelAction2) {
        choiceWheelAction2.textContent = cooldown > 0
          ? `Védelmi pénz (${formatCountdown(cooldown)})`
          : canProtect
            ? `Védelmi pénz (-${protectionCost})`
            : `Védelmi pénz (${protectionCost} energia kell)`;
        choiceWheelAction2.disabled = cooldown > 0 || !canProtect;
      }
      if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
      if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
      if (choiceWheelAction5) choiceWheelAction5.textContent = spotQuest ? "Küldetés" : "";
      return;
    }
    const cost = getLotInvestmentCost(spot);
    const isMaxLevel = level >= getLotMaxLevel(spot);
    const isPassiveIncomeOnlyLot = passiveIncomeOnlyLotIds.has(spot.id);
    setChoiceWheelButtons(level > 0
      ? [
          ...(isMaxLevel ? [] : ["robbery"]),
          ...(isPassiveIncomeOnlyLot ? [] : ["protection"]),
          "lotInfo",
          "close",
          ...(spotQuest ? ["quest"] : []),
        ]
      : ["robbery", "protection", "close"]);
    if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
    if (choiceWheelSubtitle) {
      choiceWheelSubtitle.textContent = houseDef
        ? `${houseDef.name} - ${getLotIncome(spot)} $ / nap`
        : "Megvásárolható terület";
    }
    if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = houseDef ? `Ház ${level}` : "Üres telek";
    if (choiceWheelAction1) choiceWheelAction1.textContent = level ? `Fejlesztés (${cost} $)` : `Vásárlás (${cost} $)`;
    if (choiceWheelAction2) {
      choiceWheelAction2.textContent = level
        ? (isPassiveIncomeOnlyLot ? "" : "Védelmi pénz")
        : "Telek info";
      if (level && !isPassiveIncomeOnlyLot) refreshChoiceWheelProtectionCountdown();
    }
    if (choiceWheelAction3) {
      choiceWheelAction3.textContent = level ? "Telek info" : "";
    }
    if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
    if (choiceWheelAction5) choiceWheelAction5.textContent = spotQuest ? "Küldetés" : "";
    return;
  }
  const quest = spotQuest;
  const rival = getRivalEventAtSpot(spot.id);
  if (state.mainBaseSpotId === spot.id) {
    const baseRestRemaining = Math.max(0, Number(state.baseRestAvailableAt) - Date.now());
    const baseRestUsed = baseRestRemaining > 0;
    setChoiceWheelButtons(["baseRest", "close", ...(quest ? ["quest"] : [])]);
    if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
    if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Saját fő bázis";
    if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Fő bázis";
    if (choiceWheelAction3) {
      choiceWheelAction3.textContent = baseRestUsed
        ? `Pihenés (${formatCountdown(baseRestRemaining)})`
        : "Pihenés (ingyen)";
      choiceWheelAction3.disabled = baseRestUsed;
    }
    if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
    if (choiceWheelAction5) choiceWheelAction5.textContent = quest ? "Küldetés" : "";
    return;
  }
  const difficulty = getBuildingDifficulty(spot);
  const difficultyInfo = getDifficultyInfo(difficulty);
  const protectionCost = 8;
  const baseActionAvailable = !state.mainBaseSpotId || state.mainBaseSpotId === spot.id;
  const thirdAction = rival ? "rival" : (baseActionAvailable ? "baseRest" : null);
  const visibleActions = [
    "robbery",
    "protection",
    ...(thirdAction ? [thirdAction] : []),
    "close",
    ...(quest ? ["quest"] : []),
  ];
  setChoiceWheelButtons(visibleActions);
  if (choiceWheelTitle) choiceWheelTitle.textContent = `${spot.name} - ${difficultyInfo.label}`;
  if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = rival ? `Rivalis banda: ero ${rival.strength}` : "";
  if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = spot.name;
  if (choiceWheelAction1) {
    setRobberyChoiceButton(choiceWheelAction1, spot);
  }
  if (choiceWheelAction2) {
    const cooldown = getProtectionCooldownRemaining(spot.id);
    const canProtect = state.health > 0 && state.energy >= protectionCost;
    choiceWheelAction2.textContent = cooldown > 0
      ? `Vedelmi penz (${formatCountdown(cooldown)})`
      : canProtect
        ? `Vedelmi penz (-${protectionCost})`
        : `Vedelmi penz (${protectionCost} energia kell)`;
    choiceWheelAction2.disabled = cooldown > 0 || !canProtect;
  }
  if (choiceWheelAction3) {
    if (rival) {
      choiceWheelAction3.textContent = "Rivalis banda";
      choiceWheelAction3.disabled = state.health <= 0 || state.energy < 14;
    } else {
      const baseRestRemaining = Math.max(0, Number(state.baseRestAvailableAt) - Date.now());
      const baseRestUsed = state.mainBaseSpotId === spot.id && baseRestRemaining > 0;
      choiceWheelAction3.textContent = state.mainBaseSpotId === spot.id
        ? (baseRestUsed ? `Pihenés (${formatCountdown(baseRestRemaining)})` : "Pihenés (ingyen)")
        : "Fő bázis";
      choiceWheelAction3.disabled = baseRestUsed;
    }
  }
  if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
  if (choiceWheelAction5) choiceWheelAction5.textContent = quest ? "Küldetés" : "";
}

async function runChoiceAction(actionId) {
  const spot = activeChoiceSpot;
  if (!spot) return;

  if (actionId === "close") {
    hideChoiceWheel();
    return;
  }

  if (actionId === "quest") {
    const quest = getQuestAtSpot(spot.id);
    if (!quest) {
      sceneRef?.setMessage("Itt most nincs elérhető küldetés.");
      return;
    }
    hideChoiceWheel();
    showQuestCard(quest);
    return;
  }

  if (spot.kind === "park" || spot.kind === "lot") {
    await runTerritoryAction(actionId, spot);
    saveGame();
    sceneRef?.refreshHUD();
    sceneRef?.refreshScene();
    if (spot.kind !== "lot" || !["protection", "lotInfo", "lotRobbery"].includes(actionId)) {
      hideChoiceWheel();
    } else if (actionId === "protection") {
      showChoiceWheel(spot);
    }
    return;
  }

  state.selectedDistrictIndex = clamp(spot.districtIndex, 0, state.districts.length - 1);
  if (actionId === "rival") {
    renderRivalActionPanel(spot);
  } else if (actionId === "robbery") {
    startRobberyMinigame(spot);
    return;
  } else if (actionId === "protection") {
    if (getProtectionCooldownRemaining(spot.id) > 0) {
      sceneRef?.setMessage(`Innen meg nem szedhetsz vedelmi penzt. Hatralevo ido: ${formatCountdown(getProtectionCooldownRemaining(spot.id))}.`);
      showChoiceWheel(spot);
      return;
    }
    await collectProtectionMoney(getSelectedDistrict(), spot.name, spot);
  } else if (actionId === "baseRest") {
    if (state.mainBaseSpotId === spot.id) {
      restAtBase(spot);
    } else {
      setMainBase(spot);
    }
  }

  if (state.heat >= 100) triggerBust();
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  sceneRef?.drawDistrictHighlight?.();
  hideChoiceWheel();
}
