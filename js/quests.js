// Quest state, generation, markers, HUD and quest actions.

function normalizeQuest(quest) {
  if (!quest || typeof quest !== "object") return null;
  const spot = getSpotById(quest.spotId);
  if (!spot) return null;
  const reward = quest.reward && typeof quest.reward === "object" ? quest.reward : null;
  const goal = quest.goal && typeof quest.goal === "object" ? quest.goal : {};
  const normalizedRewardSlot = reward?.slot === "trousers"
    ? "pants"
    : (reward?.slot === "suit" || reward?.slot === "vest")
      ? "shirt"
      : (typeof reward?.slot === "string" ? reward.slot : "weapon");
  const allowedStatuses = new Set(["offered", "accepted", "completed"]);
  const target = clamp(Number.isFinite(goal.target) ? Math.round(goal.target) : 1, 1, 12);
  const progress = clamp(Number.isFinite(goal.progress) ? Math.round(goal.progress) : 0, 0, target);
  const allowedActions = new Set(["robbery", "protection", "harbor_job", "cargo_spend", "cargo_acquire", "market_buy", "garage_run"]);
  const requestedAction = String(goal.action || quest.type || "robbery");
  const action = allowedActions.has(requestedAction) ? requestedAction : "robbery";
  const allowedModes = new Set(["any", "shop", "street", "docks", "customs", "rail", "warehouse", "fish", "garage", "counterfeitMoney", "drugs", "weapons", "papers"]);
  const mode = allowedModes.has(goal.mode) ? goal.mode : "any";
  const steps = (Array.isArray(quest.steps) ? quest.steps : []).slice(0, 3).map((step, index) => {
    if (!allowedActions.has(step?.action)) return null;
    const stepTarget = clamp(Number.isFinite(step.target) ? Math.round(step.target) : 1, 1, 12);
    return {
      id: typeof step.id === "string" ? step.id : `step-${index + 1}`,
      action: step.action,
      mode: allowedModes.has(step.mode) ? step.mode : "any",
      target: stepTarget,
      progress: clamp(Number.isFinite(step.progress) ? Math.round(step.progress) : 0, 0, stepTarget),
      label: typeof step.label === "string" ? step.label : "Teljesítsd a részfeladatot.",
    };
  }).filter(Boolean);
  const aggregateTarget = steps.length ? steps.reduce((sum, step) => sum + step.target, 0) : target;
  const aggregateProgress = steps.length ? steps.reduce((sum, step) => sum + step.progress, 0) : progress;
  const primaryAction = steps.length > 1 ? "mixed" : (steps[0]?.action || action);
  const rawRewardDifficulty = Number(quest.rewardDifficulty);
  const rewardDifficulty = clamp(Number.isFinite(rawRewardDifficulty) ? Math.round(rawRewardDifficulty) : 50, 0, 100);
  const rewardQuest = {
    ...quest,
    goal: { action: primaryAction, mode: steps.length > 1 ? "any" : (steps[0]?.mode || mode), target: aggregateTarget },
    steps,
  };
  return {
    id: typeof quest.id === "string" ? quest.id : `quest-${Date.now()}`,
    spotId: spot.id,
    spotName: typeof quest.spotName === "string" ? quest.spotName : spot.name,
    districtName: typeof quest.districtName === "string" ? quest.districtName : (districtDefs[spot.districtIndex]?.name || "Kerület"),
    type: primaryAction,
    status: allowedStatuses.has(quest.status) ? quest.status : "offered",
    title: typeof quest.title === "string" ? quest.title : "Küldetés",
    signature: typeof quest.signature === "string" ? quest.signature : "",
    description: typeof quest.description === "string" ? quest.description : "",
    objective: typeof quest.objective === "string" ? quest.objective : "",
    reward: reward
      ? {
        slot: normalizedRewardSlot,
        name: typeof reward.name === "string" ? reward.name : "Ismeretlen felszerelés",
        power: Number.isFinite(reward.power) ? Math.max(0, reward.power) : 0,
        stat: reward?.stat === "defense" || reward?.stat === "attack" ? reward.stat : (equipmentSlotDefs[normalizedRewardSlot]?.stat || "attack"),
        rarity: ["gray", "yellow", "red"].includes(reward?.rarity) ? reward.rarity : "gray",
        id: typeof reward.id === "string" ? reward.id : undefined,
        image: typeof reward.image === "string" ? reward.image : getEquipmentArt(normalizedRewardSlot),
      }
      : null,
    moneyReward: calculateQuestMoneyReward(rewardQuest, rewardDifficulty),
    rewardDifficulty,
    rewardVersion: 2,
    xpReward: Number.isFinite(quest.xpReward) ? Math.max(0, Math.round(quest.xpReward)) : 18,
    goal: {
      action: primaryAction,
      mode: steps.length > 1 ? "any" : (steps[0]?.mode || mode),
      target: aggregateTarget,
      progress: aggregateProgress,
    },
    steps,
    createdAt: Number.isFinite(quest.createdAt) ? quest.createdAt : Date.now(),
  };
}

const harborQuestActions = new Set(["harbor_job", "cargo_spend", "cargo_acquire", "garage_run", "market_buy"]);
const harborQuestModes = new Set(["docks", "customs", "rail", "warehouse", "fish", "garage", "counterfeitMoney", "drugs", "weapons", "papers"]);
const MAX_OFFERED_QUESTS = 3;

function questRequiresHarbor(quest) {
  if (!quest || typeof quest !== "object") return false;
  const goals = Array.isArray(quest.steps) && quest.steps.length ? quest.steps : [quest.goal || quest];
  return goals.some((goal) => harborQuestActions.has(goal?.action) || harborQuestModes.has(goal?.mode));
}

function normalizeQuestList(quests) {
  const normalized = Array.isArray(quests) ? quests.map(normalizeQuest).filter(Boolean) : [];
  const harborUnlocked = getRankLevel(state.fame) >= getHarborRequiredLevel();
  return normalized
    .filter((quest) => (quest.status === "accepted" || quest.status === "completed") && (harborUnlocked || !questRequiresHarbor(quest)))
    .slice(0, 2);
}

function normalizeOfferedQuestList(quests) {
  const normalized = Array.isArray(quests) ? quests.map(normalizeQuest).filter(Boolean) : [];
  const harborUnlocked = getRankLevel(state.fame) >= getHarborRequiredLevel();
  return normalized
    .filter((quest) => quest.status === "offered" && (harborUnlocked || !questRequiresHarbor(quest)))
    .slice(0, MAX_OFFERED_QUESTS);
}

function mergeStableOfferedQuestList(previousQuests, incomingQuests, activeQuests = []) {
  const activeQuestIds = new Set(normalizeQuestList(activeQuests).map((quest) => quest.id).filter(Boolean));
  const merged = [];
  const usedQuestIds = new Set(activeQuestIds);
  const usedSpotIds = new Set();

  // A mar kirakott ajanlatok elveznek elsobbseget. A hatterszinkron nem
  // cserelheti le sem a kuldetest, sem az epületet, amig fel nem veszik.
  [...normalizeOfferedQuestList(previousQuests), ...normalizeOfferedQuestList(incomingQuests)].forEach((quest) => {
    if (!quest?.id || !quest?.spotId || usedQuestIds.has(quest.id) || usedSpotIds.has(quest.spotId)) return;
    usedQuestIds.add(quest.id);
    usedSpotIds.add(quest.spotId);
    merged.push(quest);
  });

  return merged.slice(0, MAX_OFFERED_QUESTS);
}

function stabilizeOfferedQuestPool() {
  const activeQuests = normalizeQuestList(state.activeQuests);
  const legacyFeaturedQuest = normalizeQuest(state.activeQuest);
  const offeredCandidates = [
    ...(legacyFeaturedQuest?.status === "offered" ? [legacyFeaturedQuest] : []),
    ...normalizeOfferedQuestList(state.offeredQuests),
  ];
  const usedQuestIds = new Set(activeQuests.map((quest) => quest.id).filter(Boolean));
  const usedSpotIds = new Set(activeQuests.map((quest) => quest.spotId).filter(Boolean));
  const offeredQuests = [];

  offeredCandidates.forEach((quest) => {
    if (!quest?.id || !quest?.spotId) return;
    if (usedQuestIds.has(quest.id) || usedSpotIds.has(quest.spotId)) return;
    usedQuestIds.add(quest.id);
    usedSpotIds.add(quest.spotId);
    offeredQuests.push(quest);
  });

  state.activeQuests = activeQuests;
  state.offeredQuests = offeredQuests.slice(0, MAX_OFFERED_QUESTS);
  state.activeQuest = state.offeredQuests[0] || null;
  return { usedQuestIds, usedSpotIds };
}

function removeQuestFromActiveList(targetQuest) {
  const quests = Array.isArray(state.activeQuests)
    ? state.activeQuests.map(normalizeQuest).filter(Boolean)
    : [];
  if (!targetQuest) {
    state.activeQuests = quests;
    return;
  }

  const exactIndex = quests.findIndex((entry) =>
    entry.id === targetQuest.id
    && entry.spotId === targetQuest.spotId
    && entry.createdAt === targetQuest.createdAt,
  );

  const fallbackIndex = exactIndex >= 0
    ? exactIndex
    : quests.findIndex((entry) => entry.id === targetQuest.id);

  if (fallbackIndex >= 0) {
    quests.splice(fallbackIndex, 1);
  }

  state.activeQuests = quests.slice(0, 2);
  if (state.activeQuest?.id === targetQuest.id) {
    state.activeQuest = null;
  }
}


function buildQuestReward(questType, difficulty) {
  if (isEarlyGameAccelerated()) {
    if (questType === "robbery") {
      return { ...equipmentCatalog.weapon[1], slot: "weapon" };
    }
    return { ...equipmentCatalog.shirt[1], slot: "shirt" };
  }
  const tier = clamp(Math.floor(difficulty / 18) + 1, 1, 5);
  const modernRewardPools = {
    robbery: ["weapon", "hat", "watch", "shoes"],
    protection: ["shirt", "pants", "watch", "weapon"],
  };
  const modernPool = modernRewardPools[questType] || modernRewardPools.robbery;
  const modernSlot = modernPool[randomInt(0, modernPool.length - 1)];
  const modernList = equipmentCatalog[modernSlot] || [];
  const modernItemIndex = clamp(tier - 1 + randomInt(0, 1), 1, modernList.length - 1);
  const modernItem = modernList[modernItemIndex] || modernList[modernList.length - 1] || equipmentCatalog.weapon[0];
  return { ...modernItem, slot: modernSlot };
}

function getQuestActionLabel(quest) {
  const labels = {
    protection: "Védelmi pénz",
    robbery: "Kirablás",
    harbor_job: "Kikötői munka",
    cargo_spend: "Áru leadása",
    cargo_acquire: "Áru beszerzése",
    market_buy: "Piaci vásárlás",
    garage_run: "Garázsfuvar",
    mixed: "Összetett megbízás",
  };
  return labels[quest?.goal?.action || quest?.type] || "Küldetés";
}

function getQuestRewardText(quest) {
  if (!quest) return "Jutalom: -";
  if (!quest.reward) return `Jutalom: ${quest.xpReward} XP, ${quest.moneyReward} $`;
  return `Jutalom: ${quest.xpReward} XP, ${quest.moneyReward} $, ${quest.reward.name} (${getEquipmentBonusText(quest.reward.slot, quest.reward.power, quest.reward.stat)})`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function getQuestRewardMarkup(quest) {
  if (!quest) return "Jutalom: -";
  if (!quest.reward) return escapeHtml(getQuestRewardText(quest));
  const image = quest.reward.image || getEquipmentArt(quest.reward.slot);
  return `
    <span class="hud-quest-reward">
      <img class="hud-quest-reward__art" src="${escapeHtml(image)}" alt="${escapeHtml(quest.reward.name)}">
      <span class="hud-quest-reward__copy">Jutalom: ${escapeHtml(`${quest.xpReward} XP, ${quest.moneyReward} $, ${quest.reward.name} (${getEquipmentBonusText(quest.reward.slot, quest.reward.power, quest.reward.stat)})`)}</span>
    </span>
  `;
}

function getQuestFlavorText(quest) {
  if (!quest) return "Várj a házak felett megjelenő felkiáltójelre.";
  if (quest.type === "mixed" || (Array.isArray(quest.steps) && quest.steps.length > 1)) {
    return "A család összetett megbízást adott: az utcai és kikötői részfeladatokat is le kell zárnod az átadás előtt.";
  }
  if (quest.goal?.action?.startsWith("harbor_") || quest.goal?.action?.startsWith("cargo_") || quest.goal?.action === "garage_run") {
    return `A kikötői kapcsolatok munkát adtak. Menj a Kikötő negyedbe, válaszd ki a megfelelő helyszínt, és teljesítsd a megbízást.`;
  }
  const intro = quest.type === "protection"
    ? `${quest.spotName} környékén kezd forrósodni a levegő, a helyiek már csak halkan mernek beszélni.`
    : `${quest.spotName} ma este tele lesz pénzzel és ideges őrökkel, pont ettől jó fogás.`;
  const followUp = quest.type === "protection"
    ? `Lépj be ${quest.districtName} negyedébe, és tedd egyértelművé, hogy ezen az utcán te diktálod a szabályokat.`
    : `Ha gyors vagy ${quest.districtName} negyedében, egyszerre szerzel zsákmányt, hírnevet és tiszteletet.`;
  return `${intro} ${followUp}`;
}

function getQuestStatusText(quest) {
  if (!quest) return "Nincs aktív küldetés";
  if (quest.status === "offered") return "Felajánlva";
  if (quest.status === "accepted") return `Elfogadva (${quest.goal.progress}/${quest.goal.target})`;
  if (quest.status === "completed") return `Kész (${quest.goal.progress}/${quest.goal.target})`;
  return "Átadva";
}

function getQuestLocationText(quest) {
  const actions = new Set(Array.isArray(quest?.steps) && quest.steps.length
    ? quest.steps.map((step) => step.action)
    : [quest?.goal?.action || quest?.type]);
  const hasMain = actions.has("robbery") || actions.has("protection") || actions.has("market_buy");
  const hasHarbor = ["harbor_job", "cargo_spend", "cargo_acquire", "garage_run"].some((action) => actions.has(action));
  if (hasMain && hasHarbor) return "Főtérkép + Kikötő negyed";
  const action = [...actions][0];
  if (["harbor_job", "cargo_spend", "cargo_acquire", "garage_run"].includes(action)) {
    return action === "garage_run" ? "Kikötő negyed · Garázs" : "Kikötő negyed";
  }
  if (action === "market_buy") return "Feketepiac · Főtérkép vagy Kikötő";
  return `${quest?.spotName || "Ismeretlen hely"}, ${quest?.districtName || "Kerület"}`;
}

function getQuestStepsMarkup(quest) {
  const steps = Array.isArray(quest?.steps) && quest.steps.length
    ? quest.steps
    : [{ label: quest?.objective || "Teljesítsd a megbízást.", progress: quest?.goal?.progress || 0, target: quest?.goal?.target || 1 }];
  return `<ol class="quest-overview__steps">${steps.map((step) => `
    <li class="${step.progress >= step.target ? "is-completed" : ""}">
      <span>${escapeHtml(step.label)}</span>
      <strong>${step.progress}/${step.target}</strong>
    </li>
  `).join("")}</ol>`;
}

function getQuestSlot(slotIndex = state.selectedQuestSlot) {
  return normalizeQuestList(state.activeQuests)[slotIndex] || null;
}

function getQuestAtSpot(spotId) {
  const offeredQuest = normalizeOfferedQuestList(state.offeredQuests).find((quest) => quest.spotId === spotId);
  if (offeredQuest) return offeredQuest;
  return state.activeQuest?.status === "offered" && state.activeQuest?.spotId === spotId ? state.activeQuest : null;
}

const mentorSteps = [
  { id: "base", title: "Első munka", text: "Válaszd ki a lakóházadat.", reward: { money: 80, xp: 2 } },
  { id: "crew", title: "Ember a bandába", text: "Vegyél fel vagy fejlessz egy bandatagot.", reward: { money: 90, xp: 2 } },
  { id: "equip", title: "Öltözz munkához", text: "Szereld fel a fegyvert a karakteredre.", reward: { money: 70, xp: 2 } },
  { id: "robbery", title: "Zöld célpont", text: "Rabolj ki egy könnyű házat.", reward: { money: 110, xp: 2 } },
  { id: "protection", title: "Utcai adó", text: "Szedj védelmi pénzt egy házból.", reward: { money: 120, xp: 2 } },
  { id: "quest", title: "Átadás", text: "Vegyél fel és adj le egy küldetést.", reward: { money: 130, xp: 2 } },
  { id: "rest", title: "Biztos hely", text: "Pihenj a fő bázisodon.", reward: { money: 90, xp: 1 } },
  { id: "world", title: "Nagyvilág", text: "Nézd meg a világtérképet.", reward: { money: 100, xp: 2 } },
  { id: "level5", title: "Nevet szerzel", text: "Érd el az 5. szintet.", reward: { money: 180, xp: 8 } },
  { id: "harbor", title: "Kikötői kapu", text: "Lépj be a Kikötő negyedbe.", reward: { money: 220, xp: 10 } },
];

const mentorStepInstructions = {
  base: "1. Kattints egy városi házra a főtérképen. 2. A megjelenő körmenüben válaszd a Fő bázis gombot. 3. Erősítsd meg a választást; ez lesz a pihenőhelyed.",
  crew: "1. Keresd meg jobb oldalon az A BANDA panelt. 2. Válassz egy még fel nem bérelt bandatagot. 3. Nyomd meg a Vétel gombot. Ha már van embered, egy támadás- vagy védelemfejlesztés is teljesíti a feladatot.",
  equip: "1. Kattints bal oldalon a saját karaktered képére. 2. A karakterablak alján válassz egy fegyvert a szabad itemek közül. 3. Kattints a fegyverre, majd a Felveszem gombra.",
  robbery: "1. A főtérképen keress zöld jelölésű, könnyű célpontot. 2. Kattints rá, majd válaszd az Utcai támadás vagy Üzletkirablás gombot. 3. Jelölj ki 1–2 felbérelt bandatagot, és indítsd el a támadást.",
  protection: "1. Kattints egy olyan városi házra, amelynél elérhető a beszedés. 2. A körmenüben nyomd meg a Védelmi pénz gombot. 3. Sikeres beszedés után a gombon megjelenik az újabb beszedésig hátralévő idő.",
  quest: "1. Nyisd meg felül a Küldetések menüt, vagy kattints egy térképen megjelenő küldetésjelölőre. 2. Válaszd az Elfogadás gombot. 3. Teljesítsd a felsorolt feladatokat. 4. A bal oldali I. vagy II. küldetéssávban nyomd meg az Átadás gombot.",
  rest: "1. Kattints arra a házra, amelyet Fő bázisnak választottál. 2. A körmenüben válaszd a Pihenés gombot. A pihenés akkor is számít, ha csak részben hiányzik az életerőd vagy energiád.",
  world: "1. Keresd meg alul a Világtérkép gombot. 2. Kattints rá, és várd meg, amíg megnyílik a teljes világtérkép.",
  level5: "A feladat kezdetekor a 4. szint felénél jársz. Szerezz még XP-t sikeres kirablásokkal, védelmipénz-beszedéssel és városi küldetések átadásával. A pontos szintedet és az XP-sávot bal oldalon, a karaktered alatt látod. A kikötő az 5. szint eléréséig zárva marad.",
  harbor: "1. Az 5. szint elérése után keresd meg a Kikötő gombot a HUD-on. 2. Kattints a horgonyos kikötőikonra. 3. A feladat akkor teljesül, amikor megnyílik a Kikötő negyed térképe.",
};

function getCurrentMentorStep() {
  if (state.mentorCompleted) return null;
  return mentorSteps[clamp(Math.round(Number(state.mentorStep) || 0), 0, mentorSteps.length - 1)] || null;
}

function shouldShowMentorHud() {
  return Boolean(state.registered)
    && !state.mentorCompleted
    && Boolean(getCurrentMentorStep());
}

function getMentorRewardText(step) {
  if (!step?.reward) return "Jutalom: -";
  const parts = [];
  if (step.reward.money) parts.push(`+${step.reward.money} $`);
  if (step.reward.xp) parts.push(`+${step.reward.xp} XP`);
  return `Jutalom: ${parts.join(", ")}`;
}

function getMentorLevel5StartingFame() {
  const level4Threshold = Math.max(0, Number(rankTable[3]?.fame) || 0);
  const level5Threshold = Math.max(level4Threshold, Number(rankTable[4]?.fame) || level4Threshold);
  return Math.round(level4Threshold + ((level5Threshold - level4Threshold) * 0.5));
}

function updateMentorPanel() {
  const visible = shouldShowMentorHud();
  const step = getCurrentMentorStep();
  if (visible && step?.id === "level5" && getRankLevel(state.fame) >= 5 && !mentorStepCompleting) {
    completeMentorStep("level5");
    return;
  }
  if (visible && step && hudMentorCard?.dataset.userClosed !== "true") {
    mentorCardOpen = true;
  }
  hudMentorToggle?.classList.toggle("hidden", !visible);
  hudMentorToggle?.classList.toggle("is-attention", visible && !mentorCardOpen);
  hudMentorCard?.classList.toggle("hidden", !(visible && mentorCardOpen));
  hudMentorCard?.setAttribute("aria-hidden", visible && mentorCardOpen ? "false" : "true");
  hudMentorInfo?.setAttribute("aria-expanded", mentorDetailsOpen ? "true" : "false");
  hudMentorInfo?.classList.toggle("is-active", mentorDetailsOpen);
  hudMentorDetails?.classList.toggle("hidden", !mentorDetailsOpen);
  if (!visible || !step) return;
  if (hudMentorStepTitle) hudMentorStepTitle.textContent = step.title;
  if (hudMentorStepText) hudMentorStepText.textContent = step.text;
  if (hudMentorDetails) hudMentorDetails.textContent = mentorStepInstructions[step.id] || "Kövesd az aktuális küldetés rövid leírását. A szükséges gomb a fő HUD-on vagy a kijelölt térképi hely körmenüjében található.";
  if (hudMentorStepReward) hudMentorStepReward.textContent = getMentorRewardText(step);
  if (hudMentorProgress) hudMentorProgress.textContent = `${Math.min(mentorSteps.length, (Number(state.mentorStep) || 0) + 1)} / ${mentorSteps.length}`;
}

function grantMentorReward(step) {
  if (!step?.reward) return;
  if (step.reward.money) state.money += step.reward.money;
  if (step.reward.xp) applyFame(step.reward.xp);
  queueRewardModal({
    title: "Mentor jutalom",
    text: `${step.title} teljesitve.`,
    money: step.reward.money || 0,
    xp: step.reward.xp || 0,
    fame: step.reward.xp || 0,
  });
}

function completeMentorStep(stepId) {
  const step = getCurrentMentorStep();
  if (!step || step.id !== stepId) return false;
  mentorStepCompleting = true;
  mentorDetailsOpen = false;
  try {
    grantMentorReward(step);
    state.mentorStep = Math.round(Number(state.mentorStep) || 0) + 1;
    if (mentorSteps[state.mentorStep]?.id === "level5") {
      state.fame = getMentorLevel5StartingFame();
    }
  } finally {
    mentorStepCompleting = false;
  }
  if (state.mentorStep >= mentorSteps.length) {
    state.mentorCompleted = true;
    mentorCardOpen = false;
  } else {
    mentorCardOpen = true;
    if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
  }
  sceneRef?.pushLog(`Mentor feladat teljesitve: ${step.title}.`);
  updateMentorPanel();
  saveGame();
  sceneRef?.refreshHUD();
  return true;
}

function maybeCompleteMentorLevelGoal() {
  if (mentorStepCompleting) return;
  if (getRankLevel(state.fame) >= 5) completeMentorStep("level5");
}

function createQuestMarker(area) {
  const bounds = getAreaBounds(area);
  const quest = getQuestAtSpot(area.id);
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "g");
  marker.classList.add("map-svg-quest-marker");
  marker.setAttribute("aria-hidden", "true");
  // Ujrarajzolaskor is ugyanott folytatodik a lebeges, ezert nem rant egyet
  // minden altalanos terkepfrissitesnel.
  const animationDurationMs = 1350;
  const animationOrigin = Number(quest?.createdAt) || 0;
  const animationPhaseMs = ((Date.now() - animationOrigin) % animationDurationMs + animationDurationMs) % animationDurationMs;
  marker.style.animationDelay = `${-animationPhaseMs}ms`;
  const x = (bounds.x + bounds.w * 0.5) * backgroundMapFrame.width;
  const y = (bounds.y - bounds.h * 0.16) * backgroundMapFrame.height;

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.classList.add("map-svg-quest-marker__text");
  text.textContent = "!";

  marker.appendChild(text);
  return marker;
}

function createRivalMarker(area) {
  const bounds = getAreaBounds(area);
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "g");
  marker.classList.add("map-svg-rival-marker");
  marker.setAttribute("aria-hidden", "true");
  const x = (bounds.x + bounds.w * 0.5) * backgroundMapFrame.width;
  const y = (bounds.y - bounds.h * 0.2) * backgroundMapFrame.height;

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.classList.add("map-svg-rival-marker__text");
  text.textContent = "R";

  marker.appendChild(text);
  return marker;
}

function setQuestCardVisible(visible) {
  hudQuestCard?.classList.toggle("hidden", !visible);
  hudQuestCard?.setAttribute("aria-hidden", visible ? "false" : "true");
}

function showQuestCard(quest = normalizeOfferedQuestList(state.offeredQuests)[0] || state.activeQuest || getQuestSlot()) {
  if (!quest) return;
  hideChoiceWheel();
  questCardQuestId = quest.id;
  if (hudQuestTitle) hudQuestTitle.textContent = quest.title || quest.spotName || "Küldetés";
  if (hudQuestText) {
    hudQuestText.textContent = quest.objective || quest.description || "Teljesítsd a kijelölt feladatot.";
  }
  if (hudObjective) hudObjective.textContent = getQuestLocationText(quest);
  if (hudObjectiveOne) hudObjectiveOne.innerHTML = getQuestRewardMarkup(quest);
  if (hudObjectiveTwo) hudObjectiveTwo.textContent = `Állapot: ${getQuestStatusText(quest)}`;
  if (hudQuestAction) {
    const locked = questCommandInFlight;
    hudQuestAction.disabled = locked;
    hudQuestAction.classList.toggle("is-disabled", locked);
    hudQuestAction.textContent =
      quest.status === "offered"
        ? "Elfogad"
        : quest.status === "accepted"
          ? "Folyamatban"
          : quest.status === "completed"
            ? "Átadás"
            : "Átadva";
  }
  if (hudQuestDelete) {
    const canDelete = !questCommandInFlight && (quest.status === "accepted" || quest.status === "completed");
    hudQuestDelete.classList.toggle("hidden", !canDelete);
    hudQuestDelete.disabled = !canDelete;
  }
  setQuestCardVisible(true);
}

function renderQuestOverview() {
  if (!questOverviewList) return;
  const quests = normalizeQuestList(state.activeQuests);
  if (!quests.length) {
    questOverviewList.innerHTML = `
      <div class="quest-overview__empty">
        <strong>Nincs aktuális küldetésed</strong>
        <p>A városban megjelenő felkiáltójeleknél vehetsz fel új megbízást.</p>
      </div>
    `;
    return;
  }
  questOverviewList.innerHTML = quests.map((quest, index) => `
    <article class="quest-overview__quest${quest.status === "completed" ? " is-completed" : ""}">
      <header>
        <span>${index === 0 ? "I." : "II."} küldetés</span>
        <em>${escapeHtml(getQuestStatusText(quest))}</em>
      </header>
      <h3>${escapeHtml(quest.title || quest.spotName)}</h3>
      <p class="quest-overview__description">${escapeHtml(quest.description || getQuestFlavorText(quest))}</p>
      <dl>
        <div><dt>Helyszín</dt><dd>${escapeHtml(getQuestLocationText(quest))}</dd></div>
        <div><dt>Részfeladatok</dt><dd>${getQuestStepsMarkup(quest)}</dd></div>
        <div><dt>Haladás</dt><dd>${quest.goal.progress}/${quest.goal.target}</dd></div>
      </dl>
      <div class="quest-overview__reward">${getQuestRewardMarkup(quest)}</div>
    </article>
  `).join("");
}

function openQuestOverview() {
  if (!questOverview) return;
  closeHelpDialog();
  closeSettingsDialog();
  hideQuestCard();
  const trigger = document.querySelector('[data-hud-top-action="quests"]');
  const triggerRect = trigger?.getBoundingClientRect();
  if (triggerRect) {
    questOverview.style.setProperty("--quest-anchor-right", `${Math.max(8, window.innerWidth - triggerRect.right)}px`);
    questOverview.style.setProperty("--quest-anchor-top", `${Math.min(window.innerHeight - 16, triggerRect.bottom + 8)}px`);
  }
  renderQuestOverview();
  questOverview.classList.remove("hidden");
  questOverview.setAttribute("aria-hidden", "false");
}

function closeQuestOverview() {
  questOverview?.classList.add("hidden");
  questOverview?.setAttribute("aria-hidden", "true");
}

function hideQuestCard() {
  questCardQuestId = null;
  setQuestCardVisible(false);
}

function refreshOpenQuestCard() {
  if (!questCardQuestId) return;
  const quest =
    normalizeOfferedQuestList(state.offeredQuests).find((entry) => entry.id === questCardQuestId)
    || normalizeQuestList(state.activeQuests).find((entry) => entry.id === questCardQuestId)
    || (state.activeQuest?.id === questCardQuestId ? normalizeQuest(state.activeQuest) : null);
  if (!quest) {
    hideQuestCard();
    return;
  }
  showQuestCard(quest);
}

function updateQuestHud() {
  state.activeQuests = normalizeQuestList(state.activeQuests);
  const quests = state.activeQuests;
  if (hudQuestTab1) {
    hudQuestTab1.classList.toggle("is-ready", quests[0]?.status === "completed");
    const label = quests[0]
      ? `I: ${quests[0].title}${quests[0].status === "completed" ? " [Kész]" : ` (${quests[0].goal.progress}/${quests[0].goal.target})`}`
      : "I: nincs felvett küldetés";
    hudQuestTab1.textContent = label;
    hudQuestTab1.dataset.label = label;
    hudQuestTab1.setAttribute("aria-label", label);
  }
  if (hudQuestTab2) {
    hudQuestTab2.classList.toggle("is-ready", quests[1]?.status === "completed");
    const label = quests[1]
      ? `II: ${quests[1].title}${quests[1].status === "completed" ? " [Kész]" : ` (${quests[1].goal.progress}/${quests[1].goal.target})`}`
      : "II: nincs felvett küldetés";
    hudQuestTab2.textContent = label;
    hudQuestTab2.dataset.label = label;
    hudQuestTab2.setAttribute("aria-label", label);
  }
  if (questOverview && !questOverview.classList.contains("hidden")) renderQuestOverview();
  refreshOpenQuestCard();
}

async function acceptActiveQuest() {
  state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  const quest = state.offeredQuests.find((entry) => entry.id === questCardQuestId) || state.activeQuest;
  if (!quest) {
    sceneRef?.setMessage("Nincs elfogadható küldetés.");
    return;
  }
  if (quest.status !== "offered") {
    showQuestCard(quest);
    sceneRef?.setMessage(
      quest.status === "accepted"
        ? `A küldetés már el van fogadva: ${quest.spotName}.`
        : "Ez a küldetés már lezárult.",
    );
    return;
  }

  state.activeQuests = normalizeQuestList(state.activeQuests);
  if (state.activeQuests.length >= 2) {
    sceneRef?.setMessage("Már két felvett küldetésed van. Fejezz be egyet az I/II. sávból.");
    return;
  }

  questCommandInFlight = true;
  const previousQuestState = {
    offeredQuests: state.offeredQuests,
    activeQuests: state.activeQuests,
    activeQuest: state.activeQuest,
    selectedQuestSlot: state.selectedQuestSlot,
  };
  const optimisticQuest = normalizeQuest({
    ...quest,
    status: "accepted",
    goal: { ...quest.goal, progress: 0 },
    steps: Array.isArray(quest.steps) ? quest.steps.map((step) => ({ ...step, progress: 0 })) : [],
  });
  state.offeredQuests = state.offeredQuests.filter((entry) => entry.id !== quest.id);
  state.activeQuests = [...state.activeQuests, optimisticQuest].filter(Boolean).slice(0, 2);
  state.selectedQuestSlot = Math.max(0, state.activeQuests.length - 1);
  if (state.activeQuest?.id === quest.id) state.activeQuest = null;
  sceneRef?.setMessage("Küldetés elfogadása...");
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  if (optimisticQuest) showQuestCard(optimisticQuest);
  try {
    // The server can validate and restore this exact offered quest from the
    // request itself. Do not block acceptance behind the general save queue:
    // that queue can contain several unrelated HUD/state updates.
    const data = await requestServerProgression("quest", { operation: "accept", questId: quest.id, quest });
    const acceptedQuest = normalizeQuest(data.quest) || normalizeQuestList(state.activeQuests).find((entry) => entry.id === quest.id);
    ensureQuestOfferPool({ silent: true, persist: true, refresh: false });
    sceneRef?.pushLog(`Küldetés elfogadva: ${acceptedQuest?.spotName || quest.spotName}.`);
    sceneRef?.setMessage(`Küldetés felvéve az ${state.selectedQuestSlot === 0 ? "I" : "II"}. sávba.`);
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    if (acceptedQuest) showQuestCard(acceptedQuest);
    return true;
  } catch (error) {
    state.offeredQuests = previousQuestState.offeredQuests;
    state.activeQuests = previousQuestState.activeQuests;
    state.activeQuest = previousQuestState.activeQuest;
    state.selectedQuestSlot = previousQuestState.selectedQuestSlot;
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    showQuestCard(quest);
    sceneRef?.setMessage(error.message || "A küldetést nem sikerült elfogadni.");
    return false;
  } finally {
    questCommandInFlight = false;
    refreshOpenQuestCard();
  }
}

async function grantQuestReward(quest) {
  if (!quest || quest.status !== "completed") {
    sceneRef?.setMessage("Ez a küldetés még nem kész az átadásra.");
    return false;
  }

  questCommandInFlight = true;
  showQuestCard(quest);
  try {
    const data = await requestServerProgression("quest", { operation: "claim", questId: quest.id });
    const reward = data.reward || {};
    const modernUnlockedItem = reward.item || null;
    sceneRef?.pushLog(
      modernUnlockedItem
        ? `Küldetés átadva: ${quest.title} – +${reward.xp || 0} XP, +${reward.money || 0} $, ${modernUnlockedItem.name}.`
        : `Küldetés átadva: ${quest.title} – +${reward.xp || 0} XP, +${reward.money || 0} $.`,
    );
    sceneRef?.setMessage(
      modernUnlockedItem
        ? `Átadás sikeres: ${quest.title}. +${reward.xp || 0} XP, új tárgy: ${modernUnlockedItem.name}.`
        : `Átadás sikeres: ${quest.title}. +${reward.xp || 0} XP, +${reward.money || 0} $.`,
    );
    if (data.mentorReward) {
      queueRewardModal({
        title: "Mentor jutalom",
        text: "Átadás teljesítve.",
        money: data.mentorReward.money || 0,
        xp: data.mentorReward.xp || 0,
        fame: data.mentorReward.xp || 0,
      });
      sceneRef?.pushLog("Mentor feladat teljesítve: átadás.");
    }
    queueRewardModal({
      title: "Küldetés teljesítve",
      text: quest.title,
      money: reward.money || 0,
      xp: reward.xp || 0,
      fame: reward.xp || 0,
      itemName: modernUnlockedItem?.name || "",
    });
    syncEquipmentSheet();
    updateMentorPanel();
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    hideQuestCard();
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A küldetést nem sikerült átadni.");
    return false;
  } finally {
    questCommandInFlight = false;
  }

}

async function deleteQuest(quest) {
  if (questCommandInFlight) return false;
  if (!quest || (quest.status !== "accepted" && quest.status !== "completed")) {
    sceneRef?.setMessage("Ezt a küldetést most nem lehet törölni.");
    return false;
  }
  questCommandInFlight = true;
  const previousQuestState = {
    activeQuests: state.activeQuests,
    activeQuest: state.activeQuest,
    selectedQuestSlot: state.selectedQuestSlot,
  };
  state.activeQuests = normalizeQuestList(state.activeQuests).filter((entry) => entry.id !== quest.id);
  if (state.activeQuest?.id === quest.id) state.activeQuest = null;
  state.selectedQuestSlot = Math.min(state.selectedQuestSlot, Math.max(0, state.activeQuests.length - 1));
  sceneRef?.setMessage(`${quest.spotName} küldetésének törlése...`);
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  hideQuestCard();
  try {
    await requestServerProgression("quest", { operation: "abandon", questId: quest.id });
    sceneRef?.pushLog(`Küldetés törölve: ${quest.spotName}.`);
    sceneRef?.setMessage(`${quest.spotName} küldetése törölve lett.`);
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    hideQuestCard();
    return true;
  } catch (error) {
    state.activeQuests = previousQuestState.activeQuests;
    state.activeQuest = previousQuestState.activeQuest;
    state.selectedQuestSlot = previousQuestState.selectedQuestSlot;
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    showQuestCard(quest);
    sceneRef?.setMessage(error.message || "A küldetést nem sikerült törölni.");
    return false;
  } finally {
    questCommandInFlight = false;
  }
}

async function handleQuestCardAction() {
  if (questCommandInFlight) return;
  const quest = state.activeQuest?.id === questCardQuestId
    ? state.activeQuest
    : (normalizeOfferedQuestList(state.offeredQuests).find((entry) => entry.id === questCardQuestId) || null)
      || (normalizeQuestList(state.activeQuests).find((entry) => entry.id === questCardQuestId) || null);

  if (quest?.status === "offered") {
    await acceptActiveQuest();
    return;
  }
  if (!quest) {
    sceneRef?.setMessage("Nincs itt felvehető vagy átadható küldetés.");
    return;
  }
  if (quest.status === "completed") {
    await grantQuestReward(quest);
    return;
  }
  sceneRef?.setMessage("Előbb teljesítsd a feladatot.");
}

const mainQuestTemplateDefs = {
  early: [
    {
      type: "robbery",
      title: "Gyors kassza",
      description: "Rabolj ki 1 boltot a városban.",
      objective: "1 sikeres bolti kirablás.",
      goal: { action: "robbery", mode: "shop", target: 1, progress: 0 },
      xp: 5,
      money: 150,
    },
    {
      type: "robbery",
      title: "Utcai villanás",
      description: "Hajts végre 2 sikeres kirablást.",
      objective: "2 sikeres kirablás bármelyik épületnél.",
      goal: { action: "robbery", mode: "any", target: 2, progress: 0 },
      xp: 5,
      money: 165,
    },
    {
      type: "protection",
      title: "Első boríték",
      description: "Szedj be védelmi pénzt 1 helyről.",
      objective: "1 sikeres védelmi pénz beszedése.",
      goal: { action: "protection", mode: "any", target: 1, progress: 0 },
      xp: 5,
      money: 145,
    },
    {
      type: "robbery",
      title: "Sikátori próba",
      description: "Hajts végre 1 sikeres utcai támadást a főtérképen.",
      objective: "1 sikeres utcai támadás.",
      goal: { action: "robbery", mode: "street", target: 1, progress: 0 },
      xp: 5,
      money: 155,
    },
    {
      type: "protection",
      title: "Biztos borítékok",
      description: "Szedj be védelmi pénzt 2 helyről a főtérképen.",
      objective: "2 sikeres védelmi pénz beszedése.",
      goal: { action: "protection", mode: "any", target: 2, progress: 0 },
      xp: 5,
      money: 160,
    },
  ],
  standard: [
    {
      type: "robbery",
      title: "Bolti szüret",
      description: "Rabolj ki 2 boltot a városban.",
      objective: "Sikeres kirablás 2 üzlet típusú házon.",
      goal: { action: "robbery", mode: "shop", target: 2, progress: 0 },
      xp: 32,
      money: 140,
    },
    {
      type: "robbery",
      title: "Négy utcai meló",
      description: "Hajts végre 4 sikeres kirablást bármelyik házon.",
      objective: "4 sikeres kirablás bármelyik épületnél.",
      goal: { action: "robbery", mode: "any", target: 4, progress: 0 },
      xp: 46,
      money: 210,
    },
    {
      type: "protection",
      title: "Védett kirakatok",
      description: "Szedj be védelmi pénzt 3 helyről.",
      objective: "3 sikeres védelmi pénz beszedése.",
      goal: { action: "protection", mode: "any", target: 3, progress: 0 },
      xp: 36,
      money: 170,
    },
    {
      type: "robbery",
      title: "Gazdag célpont",
      description: "Rabolj ki egy boltot a(z) {district} környékén.",
      objective: "1 sikeres bolti kirablás.",
      goal: { action: "robbery", mode: "shop", target: 1, progress: 0 },
      xp: 24,
      money: 110,
    },
    {
      type: "harbor_job",
      title: "Rakparti műszak",
      description: "Teljesíts {target} kikötői megbízást bármelyik kikötői helyszínen.",
      objective: "Fejezz be {target} sikeres kikötői munkát.",
      goal: { action: "harbor_job", mode: "any", targetMin: 1, targetMax: 3, progress: 0 },
      xp: 38,
      money: 190,
    },
    {
      type: "cargo_acquire",
      title: "Hiányzó rakomány",
      description: "Szerezz {target} darab {cargo} árut a Kikötő negyedben.",
      objective: "Szerezz összesen {target} darab {cargo} árut.",
      goal: { action: "cargo_acquire", mode: "randomCargo", targetMin: 2, targetMax: 6, progress: 0 },
      xp: 34,
      money: 175,
    },
    {
      type: "cargo_spend",
      title: "Titkos átadás",
      description: "Adj le {target} darab {cargo} árut lejárt kikötői megbízásokkal.",
      objective: "Várj, amíg a rakományt felhasználó kikötői munka befejeződik.",
      goal: { action: "cargo_spend", mode: "randomCargo", targetMin: 2, targetMax: 7, progress: 0 },
      xp: 42,
      money: 225,
    },
    {
      type: "garage_run",
      title: "Menekülőautó próbája",
      description: "Teljesíts {target} sikeres fuvaros minijátékot a kikötői garázsban.",
      objective: "Nyerj meg {target} garázsfuvart.",
      goal: { action: "garage_run", mode: "garage", targetMin: 1, targetMax: 2, progress: 0 },
      xp: 46,
      money: 245,
    },
    {
      type: "market_buy",
      title: "Piaci beszerzés",
      description: "Vásárolj {target} felszerelést a feketepiacon.",
      objective: "Vegyél meg {target} piaci felszerelést.",
      goal: { action: "market_buy", mode: "any", targetMin: 1, targetMax: 2, progress: 0 },
      xp: 30,
      money: 165,
    },
  ],
};

function normalizeQuestTemplate(template, spot, phase = "standard") {
  if (!template || typeof template !== "object") return null;
  const districtName = districtDefs[spot?.districtIndex]?.name || "kerület";
  const goal = template.goal && typeof template.goal === "object" ? template.goal : null;
  if (!goal || !goal.action || !goal.mode) return null;
  const cargoKeys = ["counterfeitMoney", "drugs", "weapons", "papers"];
  const cargoLabels = { counterfeitMoney: "hamis pénz", drugs: "drog", weapons: "fegyver", papers: "hamis papír" };
  const cargoMode = goal.mode === "randomCargo" ? cargoKeys[randomInt(0, cargoKeys.length - 1)] : goal.mode;
  const target = goal.targetMin || goal.targetMax
    ? randomInt(Math.max(1, Number(goal.targetMin) || 1), Math.max(1, Number(goal.targetMax) || Number(goal.targetMin) || 1))
    : Math.max(1, Math.round(Number(goal.target) || 1));
  const cargoLabel = cargoLabels[cargoMode] || "csempesz";
  return {
    type: goal.action,
    title: typeof template.title === "string" ? template.title : "Küldetés",
    description: String(template.description || "").replaceAll("{district}", districtName).replaceAll("{target}", String(target)).replaceAll("{cargo}", cargoLabel),
    objective: String(template.objective || "").replaceAll("{target}", String(target)).replaceAll("{cargo}", cargoLabel),
    goal: {
      action: goal.action,
      mode: cargoMode === "shop" ? "shop" : cargoMode,
      target,
      progress: 0,
    },
    xp: phase === "early"
      ? Math.min(5, Math.max(0, Math.round(Number(template.xp) || 0)))
      : Math.max(0, Math.round(Number(template.xp) || 0)),
    money: Math.max(0, Math.round(Number(template.money) || 0)),
  };
}

function getMainQuestTemplates(spot) {
  const phase = isEarlyGameAccelerated() ? "early" : "standard";
  const templates = Array.isArray(mainQuestTemplateDefs[phase]) ? mainQuestTemplateDefs[phase] : [];
  const harborUnlocked = getRankLevel(state.fame) >= getHarborRequiredLevel();
  const allowed = (template) => harborUnlocked || !questRequiresHarbor({ goal: template?.goal });
  const normalized = templates.filter(allowed).map((template) => normalizeQuestTemplate(template, spot, phase)).filter(Boolean);
  return normalized.length
    ? normalized
    : mainQuestTemplateDefs.standard.filter(allowed).map((template) => normalizeQuestTemplate(template, spot, "standard")).filter(Boolean);
}

const proceduralQuestBlueprints = [
  { id: "rob-shop", group: "main", action: "robbery", mode: "shop", min: 1, max: 4, money: 72, xp: 13, label: (target) => `Rabolj ki ${target} boltot a főtérképen.` },
  { id: "rob-street", group: "main", action: "robbery", mode: "street", min: 1, max: 4, money: 66, xp: 12, label: (target) => `Hajts végre ${target} utcai kirablást.` },
  { id: "protect", group: "main", action: "protection", mode: "any", min: 1, max: 4, money: 76, xp: 13, label: (target) => `Szedj be védelmi pénzt ${target} helyről.` },
  { id: "market", group: "harbor", action: "market_buy", mode: "any", min: 1, max: 2, money: 58, xp: 10, label: (target) => `Vásárolj ${target} felszerelést a feketepiacon.` },
  { id: "dock-job", group: "harbor", action: "harbor_job", mode: "docks", min: 1, max: 3, money: 92, xp: 17, label: (target) => `Fejezz be ${target} rakparti átadást a dokkoknál.` },
  { id: "customs-job", group: "harbor", action: "harbor_job", mode: "customs", min: 1, max: 3, money: 88, xp: 16, label: (target) => `Teljesíts ${target} vámos megbízást a kikötőben.` },
  { id: "rail-job", group: "harbor", action: "harbor_job", mode: "rail", min: 1, max: 3, money: 94, xp: 18, label: (target) => `Teljesíts ${target} vasúti csempészfuvar-megbízást.` },
  { id: "fish-job", group: "harbor", action: "harbor_job", mode: "fish", min: 1, max: 2, money: 70, xp: 14, label: (target) => `Fejezz be ${target} halpiaci vagy halászati munkát.` },
  { id: "cargo-get", group: "harbor", action: "cargo_acquire", mode: "randomCargo", min: 2, max: 9, money: 42, xp: 12, label: (target, cargo) => `Szerezz ${target} darab ${cargo} árut a kikötőben.` },
  { id: "cargo-sell", group: "harbor", action: "cargo_spend", mode: "randomSpendCargo", min: 1, max: 8, money: 54, xp: 14, label: (target, cargo) => `Fejezz be olyan kikötői megbízást, amely ${target} darab ${cargo} árut használ fel.` },
  { id: "garage", group: "harbor", action: "garage_run", mode: "garage", min: 1, max: 2, money: 105, xp: 20, label: (target) => `Nyerj meg ${target} fuvaros minijátékot a kikötői garázsban.` },
];

const proceduralQuestTitlePrefixes = ["Arany", "Fekete", "Éjféli", "Titkos", "Családi", "Rakparti", "Füstölgő", "Néma", "Viharos", "Vörös", "Rejtett", "Szigorú"];
const proceduralQuestTitleNouns = ["boríték", "alku", "útvonal", "parancs", "tartozás", "szállítás", "hadművelet", "egyezség", "megbízás", "láncolat", "forduló", "üzlet"];
const proceduralCargoLabels = { counterfeitMoney: "hamis pénz", drugs: "drog", weapons: "fegyver", papers: "hamis papír" };

function instantiateProceduralQuestStep(blueprint, earlyGame = false) {
  const acquireCargo = ["counterfeitMoney", "drugs", "weapons", "papers"];
  const spendCargo = ["counterfeitMoney", "drugs", "weapons", "papers"];
  const mode = blueprint.mode === "randomCargo"
    ? acquireCargo[randomInt(0, acquireCargo.length - 1)]
    : blueprint.mode === "randomSpendCargo"
      ? spendCargo[randomInt(0, spendCargo.length - 1)]
      : blueprint.mode;
  const maximum = earlyGame ? Math.min(blueprint.max, blueprint.min + 1) : blueprint.max;
  const target = randomInt(blueprint.min, Math.max(blueprint.min, maximum));
  const cargoLabel = proceduralCargoLabels[mode] || "";
  return {
    id: `${blueprint.id}-${mode}`,
    group: blueprint.group,
    action: blueprint.action,
    mode,
    target,
    progress: 0,
    label: blueprint.label(target, cargoLabel),
    money: blueprint.money + target * 18,
    xp: blueprint.xp + target * 3,
  };
}

function buildProceduralQuestPlan(existingQuests = []) {
  const earlyGame = isEarlyGameAccelerated();
  const harborUnlocked = getRankLevel(state.fame) >= getHarborRequiredLevel();
  const availableBlueprints = harborUnlocked
    ? proceduralQuestBlueprints
    : proceduralQuestBlueprints.filter((entry) => entry.group === "main");
  const usedSignatures = new Set(existingQuests.map((quest) => quest.signature).filter(Boolean));
  const usedTitles = new Set(existingQuests.map((quest) => quest.title).filter(Boolean));
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const roll = Math.random();
    const stepCount = earlyGame ? (roll < 0.68 ? 1 : 2) : (roll < 0.22 ? 1 : roll < 0.74 ? 2 : 3);
    const picked = [];
    const needsMixedMap = harborUnlocked && stepCount >= 2 && Math.random() < 0.72;
    if (needsMixedMap) {
      const mainPool = proceduralQuestBlueprints.filter((entry) => entry.group === "main");
      const harborPool = proceduralQuestBlueprints.filter((entry) => entry.group === "harbor");
      picked.push(mainPool[randomInt(0, mainPool.length - 1)], harborPool[randomInt(0, harborPool.length - 1)]);
    }
    while (picked.length < stepCount) {
      const candidate = availableBlueprints[randomInt(0, availableBlueprints.length - 1)];
      if (!picked.some((entry) => entry.id === candidate.id)) picked.push(candidate);
    }
    const steps = picked.slice(0, stepCount).map((entry) => instantiateProceduralQuestStep(entry, earlyGame));
    const signature = steps.map((step) => `${step.action}:${step.mode}:${step.target}`).sort().join("|");
    const title = `${proceduralQuestTitlePrefixes[randomInt(0, proceduralQuestTitlePrefixes.length - 1)]} ${proceduralQuestTitleNouns[randomInt(0, proceduralQuestTitleNouns.length - 1)]}`;
    if (usedSignatures.has(signature) || usedTitles.has(title)) continue;
    const groups = new Set(steps.map((step) => step.group));
    const target = steps.reduce((sum, step) => sum + step.target, 0);
    return {
      signature,
      title,
      type: steps.length > 1 ? "mixed" : steps[0].action,
      description: groups.size > 1
        ? "Összetett családi megbízás: dolgozz a főtérképen, majd zárd le a kikötői részt is."
        : groups.has("harbor")
          ? "A kikötői kapcsolatok többlépcsős munkát adtak."
          : "A városi hálózat új, véletlenszerű megbízást küldött.",
      objective: steps.map((step) => step.label).join(" / "),
      steps,
      goal: { action: steps.length > 1 ? "mixed" : steps[0].action, mode: steps.length > 1 ? "any" : steps[0].mode, target, progress: 0 },
      money: Math.min(480, steps.reduce((sum, step) => sum + step.money, 0)),
      xp: Math.min(94, steps.reduce((sum, step) => sum + step.xp, 0)),
      harborOnly: groups.size === 1 && groups.has("harbor"),
    };
  }
  return null;
}

function scheduleNextQuestSpawn(baseDelay = null) {
  const delay = Number.isFinite(baseDelay)
    ? baseDelay
    : (isEarlyGameAccelerated() ? randomInt(15000, 32000) : randomInt(35000, 70000));
  state.questNextSpawnAt = Date.now() + delay;
}

function spawnRandomQuest(options = {}) {
  const {
    silent = false,
    persist = true,
    refresh = true,
    schedule = true,
  } = options;
  const { usedSpotIds } = stabilizeOfferedQuestPool();
  if (!state.registered || state.offeredQuests.length >= MAX_OFFERED_QUESTS) return false;
  const spots = clickableBuildingDefs.filter((spot) => spot.id !== state.mainBaseSpotId && !usedSpotIds.has(spot.id));
  if (!spots.length) return false;
  let spot = spots[randomInt(0, spots.length - 1)];
  const questHistory = Array.isArray(state.questHistory) ? state.questHistory : [];
  const plan = buildProceduralQuestPlan([...state.activeQuests, ...state.offeredQuests, ...questHistory]);
  if (!plan) return false;
  if (plan.harborOnly) {
    const harborSpots = spots.filter((entry) => entry.districtIndex === 2);
    if (harborSpots.length) spot = harborSpots[randomInt(0, harborSpots.length - 1)];
  }
  const questType = plan.type;
  const difficulty = getBuildingDifficulty(spot);
  const reward = Math.random() < (isEarlyGameAccelerated() ? 0.78 : 0.45) ? buildQuestReward(questType, difficulty) : null;
  const offeredQuest = {
    id: typeof crypto?.randomUUID === "function"
      ? `quest-${crypto.randomUUID()}`
      : `quest-${Date.now()}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
    spotId: spot.id,
    spotName: spot.name,
    districtName: districtDefs[spot.districtIndex]?.name || "Kerület",
    type: questType,
    status: "offered",
    signature: plan.signature,
    title: plan.title,
    description: `${spot.name} közvetítette a melót. ${plan.description}`,
    objective: plan.objective,
    reward,
    moneyReward: 0,
    rewardDifficulty: difficulty,
    rewardVersion: 2,
    xpReward: Math.min(100, plan.xp + Math.floor(difficulty / (isEarlyGameAccelerated() ? 22 : 8))),
    goal: plan.goal,
    steps: plan.steps,
    createdAt: Date.now(),
  };
  offeredQuest.moneyReward = calculateQuestMoneyReward(offeredQuest, difficulty);
  state.offeredQuests.push(offeredQuest);
  stabilizeOfferedQuestPool();
  state.questHistory = [...questHistory, { signature: plan.signature, title: plan.title }].slice(-40);
  if (schedule) scheduleNextQuestSpawn();
  if (!silent) {
  sceneRef?.pushLog(`Új küldetés jelent meg a(z) ${spot.name} felett.`);
  sceneRef?.setMessage(`Küldetés érkezett: ${spot.name}.`);
  }
  if (persist) saveGame();
  if (refresh) {
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
  }
  return true;
}

function ensureQuestOfferPool(options = {}) {
  const { silent = true, persist = true, refresh = true } = options;
  if (!state.registered) return false;
  const previousQuestState = JSON.stringify({
    activeQuest: state.activeQuest,
    offeredQuests: state.offeredQuests,
    activeQuests: state.activeQuests,
  });
  stabilizeOfferedQuestPool();
  let changed = false;
  let guard = 0;
  while (state.offeredQuests.length < MAX_OFFERED_QUESTS && guard < MAX_OFFERED_QUESTS) {
    guard += 1;
    if (!spawnRandomQuest({ silent: true, persist: false, refresh: false, schedule: false })) break;
    changed = true;
  }
  stabilizeOfferedQuestPool();
  state.questNextSpawnAt = 0;
  const normalizedChanged = previousQuestState !== JSON.stringify({
    activeQuest: state.activeQuest,
    offeredQuests: state.offeredQuests,
    activeQuests: state.activeQuests,
  });
  if (changed || normalizedChanged) {
    if (!silent) sceneRef?.setMessage("A városban 3 felvehető küldetés vár.");
    if (persist) saveGame();
    if (refresh) {
      sceneRef?.refreshHUD();
      sceneRef?.refreshMap();
    }
  } else if (state.offeredQuests.length || state.activeQuests.length) {
    updateQuestHud();
  }
  return changed || normalizedChanged;
}

function maybeSpawnQuest(force = false) {
  return ensureQuestOfferPool({ silent: !force });
}

function completeQuest(actionType, spot) {
  const mode = spot?.mode === "shop" ? "shop" : "street";
  let reachedCompletion = false;
  const quests = normalizeQuestList(state.activeQuests);
  state.activeQuests = quests.map((quest) => {
    if (quest.status !== "accepted") return quest;
    if (Array.isArray(quest.steps) && quest.steps.length) {
      let changed = false;
      const steps = quest.steps.map((step) => {
        if (step.action !== actionType || (step.mode !== "any" && step.mode !== mode)) return step;
        changed = true;
        return { ...step, progress: clamp(step.progress + 1, 0, step.target) };
      });
      if (!changed) return quest;
      const target = steps.reduce((sum, step) => sum + step.target, 0);
      const progress = steps.reduce((sum, step) => sum + step.progress, 0);
      const completed = steps.every((step) => step.progress >= step.target);
      sceneRef?.pushLog(`Küldetés haladása: ${quest.title} (${progress}/${target}).`);
      if (completed) {
        reachedCompletion = true;
        sceneRef?.pushLog(`Küldetés kész: ${quest.title}. Átadásra vár.`);
        sceneRef?.setMessage(`Kész: ${quest.title}. Nyomj az Átadás gombra az I/II. sávban.`);
      }
      return { ...quest, steps, status: completed ? "completed" : quest.status, goal: { ...quest.goal, target, progress } };
    }
    if (quest.goal.action !== actionType) return quest;
    if (quest.goal.mode !== "any" && quest.goal.mode !== mode) return quest;

    quest.goal.progress = clamp(quest.goal.progress + 1, 0, quest.goal.target);
    sceneRef?.pushLog(`Küldetés haladása: ${quest.title} (${quest.goal.progress}/${quest.goal.target}).`);
    if (quest.goal.progress < quest.goal.target) return quest;
    quest.status = "completed";
    reachedCompletion = true;
    sceneRef?.pushLog(`Küldetés kész: ${quest.title}. Átadásra vár.`);
    sceneRef?.setMessage(`Kész: ${quest.title}. Nyomj az Átadás gombra az I/II. sávban.`);
    return quest;
  });
  state.selectedQuestSlot = clamp(state.selectedQuestSlot, 0, Math.max(0, state.activeQuests.length - 1));
  if (reachedCompletion) {
    scheduleNextQuestSpawn(randomInt(18000, 36000));
    updateQuestHud();
  }
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
}
