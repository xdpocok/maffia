// Authentication, persistence, normalization and server synchronization.

function rememberLastProfileName(name) {
  try {
    if (name) {
      window.localStorage.setItem(LAST_PROFILE_KEY, name);
    } else {
      window.localStorage.removeItem(LAST_PROFILE_KEY);
    }
  } catch {
    // Ignore local convenience storage issues and keep the game running.
  }
}

async function readAuthResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Szerverhiba (${response.status})`);
  return payload;
}

async function loginAccount(login, password) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: String(login || "").trim(), password }),
  });
  return readAuthResponse(response);
}

async function registerAccount(profileName, email, password) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileName: String(profileName || "").trim(), email: String(email || "").trim(), password }),
  });
  return readAuthResponse(response);
}

async function clearActiveProfileSession() {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {
    // Ignore session cleanup issues during reset.
  }
}

function getRememberedProfileName() {
  try {
    return window.localStorage.getItem(LAST_PROFILE_KEY) || "";
  } catch {
    return "";
  }
}

function createSaveSnapshot() {
  syncTimedActions();
  ensureMarketStock();
  syncWorldRivalCities();
  return {
    profileName: state.profileName,
    profileStartedAt: state.profileStartedAt,
    avatarId: state.avatarId,
    needsAvatarSelection: state.needsAvatarSelection,
    money: state.money,
    fame: state.fame,
    influence: normalizeInfluence(state.influence),
    influenceSystemVersion: INFLUENCE_SYSTEM_VERSION,
    crew: state.crew,
    heat: state.heat,
    health: state.health,
    energy: state.energy,
    gearPower: state.gearPower,
    equipment: state.equipment,
    itemInventory: state.itemInventory,
    crewMembers: state.crewMembers,
    activeCrewMemberId: state.activeCrewMemberId,
    mainBaseSpotId: state.mainBaseSpotId,
    worldBaseLotId: state.worldBaseLotId,
    worldBaseLevel: state.worldBaseLevel,
    worldRivalCities: state.worldRivalCities,
    npcVillageVictories: state.npcVillageVictories,
    needsWorldBaseSelection: state.needsWorldBaseSelection,
    territories: state.territories,
    buildingDifficulties: state.buildingDifficulties,
    buildingDifficultyCycle: state.buildingDifficultyCycle,
    marketStock: state.marketStock,
    marketRefreshAt: state.marketRefreshAt,
    marketCatalogVersion: state.marketCatalogVersion,
    activeQuest: state.activeQuest,
    offeredQuests: state.offeredQuests,
    activeQuests: state.activeQuests,
    selectedQuestSlot: state.selectedQuestSlot,
    questNextSpawnAt: state.questNextSpawnAt,
    questHistory: state.questHistory,
    pendingProtectionRewards: state.pendingProtectionRewards,
    processTasks: state.processTasks,
    harborProcessTasks: state.harborProcessTasks,
    localNotifications: state.localNotifications,
    smuggledGoods: state.smuggledGoods,
    smugglerFame: state.smugglerFame,
    harborGarage: state.harborGarage,
    harborBarUsage: state.harborBarUsage,
    rivalEvent: state.rivalEvent,
    rivalNextSpawnAt: state.rivalNextSpawnAt,
    mentorStep: state.mentorStep,
    mentorCompleted: state.mentorCompleted,
    mentorFlags: state.mentorFlags,
    protectionCooldowns: state.protectionCooldowns,
    recoveryEffects: state.recoveryEffects,
    recoveryUsage: state.recoveryUsage,
    naturalRecoveryAt: state.naturalRecoveryAt,
    nextPolicePressureAt: state.nextPolicePressureAt,
    mainBaseClaimDay: state.mainBaseClaimDay,
    baseRestDay: state.baseRestDay,
    baseRestAvailableAt: state.baseRestAvailableAt,
    hideUsesToday: state.hideUsesToday,
    hideUsesDay: state.hideUsesDay,
    day: state.day,
    lastDayEndedAt: state.lastDayEndedAt,
    lastPassiveIncomeAt: state.lastPassiveIncomeAt,
    cityLevel: state.cityLevel,
    districts: state.districts,
    selectedDistrictIndex: state.selectedDistrictIndex,
    registered: state.registered,
  };
}

function normalizeClientStateAfterServerUpdate(previousOfferedQuests = state.offeredQuests) {
  state.money = Math.max(0, Math.round(Number(state.money) || 0));
  state.fame = Math.max(0, Math.round(Number(state.fame) || 0));
  state.health = clamp(Number(state.health) || 0, 0, 100);
  state.energy = clamp(Number(state.energy) || 0, 0, 100);
  state.heat = clamp(Number(state.heat) || 0, 0, 100);
  ensureInfluenceState();
  state.territories = normalizeTerritories(state.territories);
  state.equipment = normalizeEquipment(state.equipment);
  state.itemInventory = normalizeItemInventory(state.itemInventory, state.equipment);
  state.crewMembers = normalizeCrewMembers(state.crewMembers, state.crew);
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = state.crewMembers.some((member) => member.hired && member.id === state.activeCrewMemberId)
    ? state.activeCrewMemberId
    : (getHiredCrewMembers()[0]?.id || null);
  state.activeQuests = normalizeQuestList(state.activeQuests);
  state.offeredQuests = mergeStableOfferedQuestList(previousOfferedQuests, state.offeredQuests, state.activeQuests);
  state.activeQuest = state.offeredQuests[0] || null;
  stabilizeOfferedQuestPool();
  state.selectedQuestSlot = clamp(
    Number.isInteger(state.selectedQuestSlot) ? state.selectedQuestSlot : 0,
    0,
    Math.max(0, state.activeQuests.length - 1),
  );
  state.pendingProtectionRewards = normalizePendingProtectionRewards(state.pendingProtectionRewards);
  state.localNotifications = normalizeLocalNotifications(state.localNotifications);
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  state.harborBarUsage = normalizeHarborBarUsage(state.harborBarUsage);
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent);
  state.rivalNextSpawnAt = normalizeRivalNextSpawnAt(state.rivalNextSpawnAt);
  normalizeTimedActions();
  recalculateGearPower();
  return state;
}

function hydrateState(saved) {
  if (!saved || typeof saved !== "object") return false;
  const previousOfferedQuests = normalizeOfferedQuestList(state.offeredQuests);
  Object.assign(state, protectClientPersistentProgress(saved));
  ensureInfluenceState();
  state.profileStartedAt = Number.isFinite(Number(state.profileStartedAt)) ? Number(state.profileStartedAt) : Date.now();
  state.avatarId = normalizePlayerAvatarId(state.avatarId);
  state.needsAvatarSelection = Boolean(state.needsAvatarSelection && !state.avatarId);
  state.npcVillageVictories = Math.max(0, Math.round(Number(state.npcVillageVictories) || 0));
  if (!Array.isArray(state.districts) || state.districts.length === 0) {
    state.districts = makeDistricts();
  }
  state.day = Number.isFinite(state.day) ? state.day : 1;
  state.lastDayEndedAt = Number.isFinite(Number(state.lastDayEndedAt)) ? Number(state.lastDayEndedAt) : 0;
  state.lastPassiveIncomeAt = Number.isFinite(Number(state.lastPassiveIncomeAt)) ? Number(state.lastPassiveIncomeAt) : 0;
  state.health = Number.isFinite(state.health) ? clamp(state.health, 0, 100) : 100;
  state.energy = Number.isFinite(state.energy) ? clamp(state.energy, 0, 100) : 100;
  state.gearPower = Number.isFinite(state.gearPower) ? Math.max(0, state.gearPower) : 0;
  state.equipment = normalizeEquipment(state.equipment);
  state.itemInventory = normalizeItemInventory(state.itemInventory, state.equipment);
  recalculateGearPower();
  state.crewMembers = normalizeCrewMembers(state.crewMembers, state.crew);
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = state.crewMembers.some((member) => member.hired && member.id === state.activeCrewMemberId)
    ? state.activeCrewMemberId
    : (getHiredCrewMembers()[0]?.id || null);
  state.territories = normalizeTerritories(state.territories);
  state.buildingDifficulties = normalizeBuildingDifficulties(state.buildingDifficulties, state.buildingDifficultyCycle);
  state.marketStock = normalizeMarketStock(state.marketStock);
  state.marketRefreshAt = Number.isFinite(Number(state.marketRefreshAt)) ? Number(state.marketRefreshAt) : 0;
  state.marketCatalogVersion = typeof state.marketCatalogVersion === "string" ? state.marketCatalogVersion : "";
  ensureMarketStock();
  state.mainBaseSpotId = typeof state.mainBaseSpotId === "string" ? state.mainBaseSpotId : null;
  state.worldBaseLotId = normalizeWorldBaseLotId(state.worldBaseLotId);
  state.worldBaseLevel = Math.max(1, Math.round(Number(state.worldBaseLevel) || 1));
  state.worldRivalCities = normalizeWorldRivalCities(state.worldRivalCities);
  state.npcVillageVictories = Math.max(
    state.npcVillageVictories,
    state.worldRivalCities.filter((city) => city.status === "captured").length,
  );
  state.needsWorldBaseSelection = Boolean(state.needsWorldBaseSelection);
  if (state.mainBaseSpotId && !getSpotById(state.mainBaseSpotId)) {
    state.mainBaseSpotId = null;
  }
  state.activeQuest = normalizeQuest(state.activeQuest);
  state.offeredQuests = mergeStableOfferedQuestList(
    previousOfferedQuests,
    [state.activeQuest, ...(Array.isArray(state.offeredQuests) ? state.offeredQuests : [])],
    state.activeQuests,
  );
  if (getRankLevel(state.fame) < getHarborRequiredLevel() && questRequiresHarbor(state.activeQuest)) {
    state.activeQuest = null;
  }
  state.activeQuests = normalizeQuestList(state.activeQuests);
  if (!state.activeQuests.length && state.activeQuest?.status === "accepted") {
    state.activeQuests = [state.activeQuest];
    state.activeQuest = null;
  }
  state.offeredQuests = mergeStableOfferedQuestList(previousOfferedQuests, state.offeredQuests, state.activeQuests);
  state.activeQuest = state.offeredQuests[0] || null;
  stabilizeOfferedQuestPool();
  state.selectedQuestSlot = clamp(
    Number.isInteger(state.selectedQuestSlot) ? state.selectedQuestSlot : 0,
    0,
    Math.max(0, state.activeQuests.length - 1),
  );
  state.questNextSpawnAt = 0;
  state.questHistory = (Array.isArray(state.questHistory) ? state.questHistory : [])
    .filter((entry) => entry && typeof entry.signature === "string" && typeof entry.title === "string")
    .slice(-40);
  state.pendingProtectionRewards = normalizePendingProtectionRewards(state.pendingProtectionRewards);
  const loadedMainTasks = normalizeProcessTasks(state.processTasks);
  const loadedHarborTasks = normalizeProcessTasks(state.harborProcessTasks);
  state.processTasks = [];
  state.harborProcessTasks = [
    ...loadedHarborTasks,
    ...loadedMainTasks.filter((task) => task.type === "harbor"),
  ].slice(0, MAX_PROCESS_TASKS);
  state.localNotifications = normalizeLocalNotifications(state.localNotifications);
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0));
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  state.harborBarUsage = normalizeHarborBarUsage(state.harborBarUsage);
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent);
  state.rivalNextSpawnAt = normalizeRivalNextSpawnAt(state.rivalNextSpawnAt);
  state.mentorStep = clamp(Math.round(Number(state.mentorStep) || 0), 0, mentorSteps.length);
  state.mentorCompleted = Boolean(state.mentorCompleted || state.mentorStep >= mentorSteps.length);
  state.mentorFlags = {
    equippedItem: Boolean(state.mentorFlags?.equippedItem),
    sawWorld: Boolean(state.mentorFlags?.sawWorld),
    enteredHarbor: Boolean(state.mentorFlags?.enteredHarbor),
  };
  state.selectedDistrictIndex = clamp(
    Number.isInteger(state.selectedDistrictIndex) ? state.selectedDistrictIndex : 0,
    0,
    state.districts.length - 1,
  );
  normalizeTimedActions();
  syncTimedActions();
  syncWorldRivalCities();
  state.mainBaseClaimDay = Number.isFinite(Number(state.mainBaseClaimDay)) ? Math.floor(Number(state.mainBaseClaimDay)) : 0;
  state.registered = Boolean(state.profileName);
  normalizeClientStateAfterServerUpdate(previousOfferedQuests);
  if (shouldShowMentorHud()) {
    mentorCardOpen = true;
    if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
  }
  return state.registered;
}

async function requestSaveApi(method = "GET", body = null, keepalive = false) {
  const response = await fetch(SAVE_API_BASE, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    keepalive,
  });
  observeServerClock(response);
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || `Save API error: ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function flushQueuedSave(forceKeepalive = false) {
  if (saveRequestInFlight || !latestQueuedSave?.profileName) return saveRequestInFlight;
  const snapshot = latestQueuedSave;
  latestQueuedSave = null;
  saveRequestInFlight = requestSaveApi("PUT", {
    state: snapshot,
    baseUpdatedAt: lastKnownServerUpdatedAt,
  }, forceKeepalive)
    .then((payload) => {
      if (Number.isFinite(Number(payload?.updatedAt))) {
        lastKnownServerUpdatedAt = Math.max(lastKnownServerUpdatedAt, Number(payload.updatedAt));
      }
      if (payload?.state && typeof payload.state === "object") {
        applyServerRobberyState(payload.state);
        sceneRef?.refreshHUD();
      }
    })
    .catch((error) => {
      if (error?.status === 409 && error.payload?.state && typeof error.payload.state === "object") {
        const previousTerritories = JSON.stringify(state.territories);
        hydrateState(error.payload.state);
        lastKnownServerUpdatedAt = Math.max(0, Number(error.payload.updatedAt) || 0);
        sceneRef?.refreshHUD();
        if (previousTerritories !== JSON.stringify(state.territories)) sceneRef?.refreshMap();
        sceneRef?.setMessage("A szerver frissebb allapotot kuldott, a jatek szinkronizalva lett.");
        return;
      }
      // The live game continues even if the remote save endpoint is temporarily unavailable.
    })
    .finally(async () => {
      saveRequestInFlight = null;
      if (latestQueuedSave?.profileName) {
        await flushQueuedSave();
      }
    });
  return saveRequestInFlight;
}

function queueSaveSnapshot(snapshot, immediate = false) {
  latestQueuedSave = snapshot;
  rememberLastProfileName(snapshot.profileName);
  if (pendingSaveTimer) {
    window.clearTimeout(pendingSaveTimer);
    pendingSaveTimer = null;
  }
  if (immediate) {
    return flushQueuedSave();
  }
  pendingSaveTimer = window.setTimeout(() => {
    pendingSaveTimer = null;
    void flushQueuedSave();
  }, 180);
  return null;
}

async function deleteRemoteSave(profileName) {
  if (!profileName) return;
  try {
    await requestSaveApi("DELETE");
  } catch {
    // Ignore delete failures so the UI reset can still complete locally.
  }
}

async function loadGame(profileName = "") {
  const normalizedProfileName = profileName.trim().slice(0, 18);
  if (!normalizedProfileName) return false;
  try {
    if (state.registered && state.profileName && state.profileName !== normalizedProfileName) {
      await saveGame(true);
    }
    lastKnownServerUpdatedAt = 0;
    const response = await fetch(PROFILE_API_BASE, {
      headers: { Accept: "application/json" },
    });
    observeServerClock(response);
    const remoteSave = response.ok ? await response.json() : { found: false };
    if (remoteSave?.found && hydrateState(remoteSave.state)) {
      lastKnownServerUpdatedAt = Math.max(0, Number(remoteSave.updatedAt) || 0);
      handleServerRivalEvents(remoteSave.rivalEvents);
      rememberLastProfileName(state.profileName);
      return true;
    }
  } catch {
    // The game now loads exclusively from the server-managed database state.
  }
  return false;
}

function saveGame(immediate = false) {
  if (!state.registered || !state.profileName) return null;
  return queueSaveSnapshot(createSaveSnapshot(), immediate);
}

function observeServerClock(response, explicitServerTime = 0) {
  const receivedAt = Date.now();
  const headerTime = Number(response?.headers?.get?.("X-Server-Time")) || 0;
  const serverTime = Number(explicitServerTime) || headerTime;
  if (serverTime > 0) {
    const measuredOffset = serverTime - receivedAt;
    serverClockOffsetMs = Math.round(serverClockOffsetMs * 0.75 + measuredOffset * 0.25);
  }
  return serverTime;
}

function getSynchronizedNow() {
  return Date.now() + serverClockOffsetMs;
}

function markServerMutation(response, payload = {}) {
  const serverTime = observeServerClock(response, payload.serverTime || payload.serverNow);
  const revision = Number(payload.updatedAt) || serverTime;
  if (revision > 0) lastKnownServerUpdatedAt = Math.max(lastKnownServerUpdatedAt, revision);
}

async function syncCurrentServerState(force = false) {
  if (!state.registered || !state.profileName || serverStateSyncInFlight) return false;
  if (!force && document.hidden) return false;
  if (activeRobberyGame?.turnLocked) return false;
  serverStateSyncInFlight = true;
  try {
    if (latestQueuedSave?.profileName || saveRequestInFlight) await flushQueuedSave();
    const response = await fetch(`/api/sync/current?since=${encodeURIComponent(lastKnownServerUpdatedAt)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    observeServerClock(response);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "A szinkronizalas sikertelen.");
    if (Number.isFinite(Number(payload.updatedAt))) {
      lastKnownServerUpdatedAt = Math.max(lastKnownServerUpdatedAt, Number(payload.updatedAt));
    }
    if (!payload.changed || !payload.state || typeof payload.state !== "object") return false;
    const previousMapState = JSON.stringify({
      territories: state.territories,
      mainBaseSpotId: state.mainBaseSpotId,
      rivalEvent: state.rivalEvent,
      activeQuest: state.activeQuest,
      offeredQuests: state.offeredQuests,
      activeQuests: state.activeQuests,
    });
    hydrateState(payload.state);
    handleServerRivalEvents(payload.rivalEvents);
    const nextMapState = JSON.stringify({
      territories: state.territories,
      mainBaseSpotId: state.mainBaseSpotId,
      rivalEvent: state.rivalEvent,
      activeQuest: state.activeQuest,
      offeredQuests: state.offeredQuests,
      activeQuests: state.activeQuests,
    });
    sceneRef?.refreshHUD();
    if (previousMapState !== nextMapState) sceneRef?.refreshMap();
    return true;
  } catch {
    return false;
  } finally {
    serverStateSyncInFlight = false;
  }
}

function startServerStateSync() {
  if (serverStateSyncTimer) window.clearInterval(serverStateSyncTimer);
  serverStateSyncTimer = window.setInterval(() => {
    void syncCurrentServerState();
    void syncPoliceRaidFromServer();
  }, SERVER_STATE_SYNC_INTERVAL_MS);
  void syncPoliceRaidFromServer();
}


