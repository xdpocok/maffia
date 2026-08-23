// Harbor map, missions, customs, rail, garage, office and black market.

const harborZoneDefs = [
  { id: "docks", title: "Dokkok", x: 1.5, y: 4.5, w: 29, h: 28, clip: "polygon(2% 48%, 18% 18%, 55% 4%, 91% 22%, 100% 58%, 75% 86%, 28% 96%, 0 72%)", note: "Csempesz fuvarok es hajos megbizasok." },
  { id: "warehouse", title: "Csempeszraktar", x: 76.5, y: 45, w: 20, h: 20, clip: "polygon(12% 24%, 58% 4%, 96% 25%, 100% 76%, 66% 100%, 13% 84%, 0 48%)", note: "Arukeszlet: hamis penz, drog, fegyver, papirok." },
  { id: "bar", title: "Kocsma", x: 27, y: 69, w: 20, h: 18, clip: "polygon(8% 32%, 42% 5%, 88% 14%, 100% 55%, 74% 95%, 20% 88%, 0 58%)", note: "Italok, eletero es energia toltes." },
  { id: "office", title: "Kikotoi iroda", x: 36.5, y: 5, w: 18, h: 22, clip: "polygon(10% 28%, 43% 2%, 84% 8%, 100% 48%, 79% 87%, 28% 100%, 0 68%)", note: "Kapcsolatok es rendori lefizetes." },
  { id: "market", title: "Feketepiac", x: 82, y: 20, w: 17, h: 19, clip: "polygon(12% 30%, 48% 5%, 91% 12%, 100% 54%, 76% 92%, 24% 100%, 0 64%)", note: "Ritka aruk es csempesz cuccok." },
  { id: "customs", title: "Vam", x: 32, y: 26, w: 16, h: 18, clip: "polygon(7% 43%, 35% 10%, 76% 0, 100% 36%, 88% 78%, 42% 100%, 0 73%)", note: "Hamis penz es hamis papirok beszerzese." },
  { id: "rail", title: "Vasuti rakodo", x: 52, y: 31, w: 30, h: 15, clip: "polygon(3% 44%, 25% 14%, 86% 2%, 100% 38%, 86% 78%, 24% 100%, 0 72%)", note: "Drog es fegyver csempeszet." },
  { id: "garage", title: "Garazs", x: 63.1, y: 53, w: 18, h: 15, clip: "polygon(9% 32%, 38% 6%, 84% 7%, 100% 48%, 78% 91%, 22% 100%, 0 66%)", note: "Jarmuvek kesobb." },
  { id: "fish", title: "Halpiac", x: 3.5, y: 35, w: 22, h: 20, clip: "polygon(2% 45%, 28% 12%, 78% 4%, 100% 43%, 83% 84%, 30% 100%, 0 74%)", note: "Halaskuldetesek: penz, XP, pihenes." },
];

const harborCargoDefs = {
  counterfeitMoney: { label: "Hamis penz", image: "./csempészet/34d87e7a-d0ec-42bc-891e-eff98067be29.webp" },
  drugs: { label: "Drog", image: "./csempészet/0391ff3c-7e67-4b77-91e0-cdb7ac0f0a9a.webp" },
  weapons: { label: "Fegyver", image: "./csempészet/dd25759f-f94a-42dc-8df6-d9fab6211903.webp" },
  papers: { label: "Hamis papirok", image: "./csempészet/f5b63510-d9c7-469c-ac33-71343b294ab1.webp" },
};

const harborGarageVehicleDefs = [
  {
    id: "sedan",
    title: "Utcai sedan",
    cost: 0,
    requiredLevel: 1,
    speed: 2,
    stealth: 2,
    load: 1,
    accent: "Sedan",
    image: "./garage-assets/sedan-1930.webp",
    description: "Kompakt menekuloauto. Kisebb utcai atjatszasokra jo, mindenbol keveset hoz.",
    rewardProfile: "balanced",
    lootText: "Kisebb penz, hamis papir es hamis penz.",
  },
  {
    id: "van",
    title: "Csempesz furgon",
    cost: 754,
    requiredLevel: 2,
    speed: 1,
    stealth: 2,
    load: 3,
    accent: "Furgon",
    image: "./garage-assets/smuggler-van-1930.webp",
    description: "Megerositett rakteru furgon. Csempesz aruhoz kell, drogot, fegyvert es papirokat hoz jobban.",
    rewardProfile: "cargo",
    lootText: "Csempesz aru: drog, fegyver, hamis papirok.",
  },
  {
    id: "armor",
    title: "Pancelkocsi",
    cost: 1421,
    requiredLevel: 3,
    speed: 2,
    stealth: 1,
    load: 4,
    accent: "Pancel",
    image: "./garage-assets/armored-money-car-1930.webp",
    description: "Nehez pancelkocsi. Nagy penzes korokhoz kell, foleg hamis penzt es nagyobb kasszat hoz.",
    rewardProfile: "cash",
    lootText: "Nagy penz, hamis penz es vedettebb rakomany.",
  },
];

const harborGarageMissionDefs = [
  {
    id: "alley-run",
    title: "Sikatori atjatszas",
    vehicleId: "sedan",
    description: "Utcai sedan kell hozza. Kis csomag, kevesebb penz, de stabil kezdo fuvar.",
    requiredLevel: 1,
    rewardMoney: 140,
    rewardXp: 18,
    heatSuccess: 2,
    heatFail: 7,
    failurePenalty: 55,
    cargoReward: { papers: 1, counterfeitMoney: 1 },
    rounds: 3,
    requiredHits: 2,
    baseSafeWidth: 0.3,
    baseSpeed: 0.02,
  },
  {
    id: "night-convoy",
    title: "Ejjeli konvoj",
    vehicleId: "van",
    description: "Csempesz furgon kell hozza. Rakteres fuvar, ahol a csempesz aru a fo jutalom.",
    requiredLevel: 2,
    rewardMoney: 240,
    rewardXp: 31,
    heatSuccess: 3,
    heatFail: 10,
    failurePenalty: 95,
    cargoReward: { drugs: 2, papers: 1 },
    rounds: 4,
    requiredHits: 3,
    baseSafeWidth: 0.26,
    baseSpeed: 0.023,
  },
  {
    id: "vault-route",
    title: "Pancelkocsis kor",
    vehicleId: "armor",
    description: "Pancelkocsi kell hozza. Nagy penzes kor, nehezebb utvonallal es komolyabb kasszaval.",
    requiredLevel: 3,
    rewardMoney: 410,
    rewardXp: 46,
    heatSuccess: 4,
    heatFail: 14,
    failurePenalty: 155,
    cargoReward: { weapons: 2, counterfeitMoney: 2, papers: 1 },
    rounds: 5,
    requiredHits: 4,
    baseSafeWidth: 0.23,
    baseSpeed: 0.026,
  },
];

const harborMissionCatalog = Array.from({ length: 50 }, (_, index) => {
  const batch = Math.floor(index / 4);
  const dockVariants = [
    { title: "Rakparti atadas", requires: { counterfeitMoney: 7 + (batch % 4), weapons: 5 + (batch % 2) }, rewardMoney: 165 + batch * 8, rewardXp: 27 + (batch % 8), durationMs: 30 * 60 * 1000, successChance: 0.9 },
    { title: "Kodos kontenercsere", requires: { drugs: 6 + (batch % 4), papers: 5 + (batch % 3) }, rewardMoney: 152 + batch * 7, rewardXp: 26 + (batch % 7), durationMs: 28 * 60 * 1000, successChance: 0.92 },
    { title: "Pecsetelt rakparti lada", requires: { papers: 6 + (batch % 4), counterfeitMoney: 5 + (batch % 3) }, rewardMoney: 158 + batch * 7, rewardXp: 25 + (batch % 7), durationMs: 32 * 60 * 1000, successChance: 0.89 },
    { title: "Csendes hajoraktar", requires: { weapons: 5 + (batch % 3), drugs: 5 + (batch % 4) }, rewardMoney: 178 + batch * 9, rewardXp: 30 + (batch % 8), durationMs: 34 * 60 * 1000, successChance: 0.84 },
    { title: "Vegyes csempesz boritek", requires: { papers: 5 + (batch % 3), drugs: 5 + (batch % 3), counterfeitMoney: 5 + (batch % 3) }, rewardMoney: 188 + batch * 9, rewardXp: 32 + (batch % 8), durationMs: 36 * 60 * 1000, successChance: 0.82 },
    { title: "Kapitanyi tartozas", requires: { papers: 5 + (batch % 2), weapons: 5 + (batch % 2), counterfeitMoney: 6 + (batch % 4) }, rewardMoney: 198 + batch * 10, rewardXp: 34 + (batch % 9), durationMs: 38 * 60 * 1000, successChance: 0.8 },
  ];
  const customsVariants = [
    { title: "Gyors vami boritek", gives: { papers: 4 + (batch % 3), counterfeitMoney: 2 + (batch % 2) }, rewardMoney: 45 + batch * 3, rewardXp: 14 + (batch % 4), durationMs: 35 * 60 * 1000, successChance: 0.94 },
    { title: "Hamis papiros csere", gives: { papers: 8 + (batch % 4) }, rewardMoney: 72 + batch * 4, rewardXp: 20 + (batch % 5), durationMs: 35 * 60 * 1000, successChance: 0.88 },
    { title: "Penzmoso pecset", gives: { counterfeitMoney: 9 + (batch % 5), papers: 2 + (batch % 2) }, rewardMoney: 96 + batch * 5, rewardXp: 24 + (batch % 6), durationMs: 35 * 60 * 1000, successChance: 0.8 },
    { title: "Kockazatos vami atiras", gives: { counterfeitMoney: 13 + (batch % 6), papers: 6 + (batch % 3) }, rewardMoney: 142 + batch * 6, rewardXp: 32 + (batch % 7), durationMs: 35 * 60 * 1000, successChance: 0.68 },
  ];
  const railVariants = [
    { title: "Kis rakomanyu vagon", gives: { drugs: 3 + (batch % 3), weapons: 1 }, rewardMoney: 62 + batch * 3, rewardXp: 17 + (batch % 4), durationMs: 35 * 60 * 1000, successChance: 0.92 },
    { title: "Fegyveres lada", gives: { weapons: 5 + (batch % 4), papers: 1 + (batch % 2) }, rewardMoney: 105 + batch * 4, rewardXp: 25 + (batch % 5), durationMs: 35 * 60 * 1000, successChance: 0.84 },
    { title: "Drogos tehervagon", gives: { drugs: 9 + (batch % 5), weapons: 2 + (batch % 2) }, rewardMoney: 128 + batch * 5, rewardXp: 30 + (batch % 6), durationMs: 35 * 60 * 1000, successChance: 0.77 },
    { title: "Ejfeli vonatrablas", gives: { drugs: 12 + (batch % 6), weapons: 6 + (batch % 3), counterfeitMoney: 2 }, rewardMoney: 190 + batch * 7, rewardXp: 42 + (batch % 8), durationMs: 35 * 60 * 1000, successChance: 0.64 },
  ];
  const profiles = [
    { zone: "docks", ...dockVariants[batch % dockVariants.length] },
    { zone: "customs", ...customsVariants[batch % customsVariants.length] },
    { zone: "rail", ...railVariants[batch % railVariants.length] },
    {
      zone: "fish",
      title: "Hajnali halaszat",
      gives: {},
      rewardMoney: [330, 660, 990][index % 3],
      rewardXp: [18, 34, 58][index % 3],
      heal: [20, 50, 100][index % 3],
      energy: [20, 50, 100][index % 3],
      durationMs: [60, 180, 360][index % 3] * 60 * 1000,
    },
  ];
  const profile = profiles[index % profiles.length];
  return {
    id: `harbor-${index + 1}`,
    ...profile,
    title: `${profile.title} ${Math.floor(index / profiles.length) + 1}`,
  };
});

const harborFishMissionDefs = [
  { id: "fish-1h", zone: "fish", title: "Hajnali halaszat - 1 ora", gives: {}, rewardMoney: 330, rewardXp: 18, heal: 20, energy: 20, durationMs: 60 * 60 * 1000 },
  { id: "fish-3h", zone: "fish", title: "Part menti halaszat - 3 ora", gives: {}, rewardMoney: 660, rewardXp: 34, heal: 50, energy: 50, durationMs: 180 * 60 * 1000 },
  { id: "fish-6h", zone: "fish", title: "Ejszakai halaszat - 6 ora", gives: {}, rewardMoney: 990, rewardXp: 58, heal: 100, energy: 100, durationMs: 360 * 60 * 1000 },
];

function replaceConfigArray(target, incoming, requiredKeys = ["id"]) {
  if (!Array.isArray(incoming) || incoming.length === 0) return false;
  const cleaned = incoming.filter((entry) =>
    entry
    && typeof entry === "object"
    && requiredKeys.every((key) => typeof entry[key] === "string" && entry[key].trim()),
  );
  if (!cleaned.length) return false;
  target.splice(0, target.length, ...cleaned.map((entry) => ({
    ...entry,
    ...(typeof entry.image === "string" ? { image: optimizedAssetPath(entry.image) } : {}),
  })));
  return true;
}

function replaceQuestTemplateConfig(incoming) {
  if (!incoming || typeof incoming !== "object") return false;
  const nextEarly = Array.isArray(incoming.early) ? incoming.early.filter((entry) => normalizeQuestTemplate(entry, null, "early")) : [];
  const nextStandard = Array.isArray(incoming.standard) ? incoming.standard.filter((entry) => normalizeQuestTemplate(entry, null, "standard")) : [];
  if (!nextEarly.length || !nextStandard.length) return false;
  mainQuestTemplateDefs.early.splice(0, mainQuestTemplateDefs.early.length, ...nextEarly.map((entry) => ({ ...entry, goal: { ...entry.goal } })));
  mainQuestTemplateDefs.standard.splice(0, mainQuestTemplateDefs.standard.length, ...nextStandard.map((entry) => ({ ...entry, goal: { ...entry.goal } })));
  return true;
}

function normalizeEquipmentCatalogItem(slot, item) {
  if (!equipmentSlotOrder.includes(slot) || !item || typeof item !== "object") return null;
  const rarity = ["gray", "yellow", "red"].includes(item.rarity) ? item.rarity : "gray";
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `${slot}-${rarity}-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : (equipmentSlotDefs[slot]?.label || "Item"),
    power: Math.max(0, Math.round(Number(item.power) || 0)),
    stat: item.stat === "defense" || item.stat === "attack" ? item.stat : (equipmentSlotDefs[slot]?.stat || "attack"),
    rarity,
    image: optimizedAssetPath(typeof item.image === "string" && item.image.trim() ? item.image.trim() : getEquipmentRarityImage(slot, rarity)),
  };
}

function replaceEquipmentCatalogConfig(incoming) {
  if (!incoming || typeof incoming !== "object") return false;
  let changed = false;
  equipmentSlotOrder.forEach((slot) => {
    const list = Array.isArray(incoming[slot]) ? incoming[slot] : [];
    const normalized = list.map((item) => normalizeEquipmentCatalogItem(slot, item)).filter(Boolean);
    if (!normalized.length) return;
    equipmentCatalog[slot].splice(0, equipmentCatalog[slot].length, ...normalized);
    changed = true;
  });
  return changed;
}

function replaceRankTableConfig(incoming) {
  if (!Array.isArray(incoming)) return false;
  const normalized = incoming
    .map((entry) => ({
      fame: Math.max(0, Math.round(Number(entry?.fame) || 0)),
      name: typeof entry?.name === "string" && entry.name.trim() ? entry.name.trim() : "",
    }))
    .filter((entry) => entry.name)
    .sort((a, b) => a.fame - b.fame);
  if (!normalized.length || normalized[0].fame !== 0) return false;
  rankTable.splice(0, rankTable.length, ...normalized);
  return true;
}

function normalizeMentorStepConfig(step) {
  if (!step || typeof step !== "object" || typeof step.id !== "string" || !step.id.trim()) return null;
  const reward = step.reward && typeof step.reward === "object" ? step.reward : {};
  const stepId = step.id.trim();
  const rawText = typeof step.text === "string" && step.text.trim() ? step.text.trim() : "";
  const mentorTextOverrides = {
    base: rawText.includes("fo bazis") ? "Válaszd ki a lakóházadat." : rawText,
    equip: "Szereld fel a fegyvert a karakteredre.",
    quest: "Vegyél fel és adj le egy küldetést.",
  };
  const mentorXpOverrides = {
    base: 2,
    crew: 2,
    equip: 2,
    robbery: 2,
    protection: 2,
    quest: 2,
    rest: 1,
    world: 2,
    level5: 8,
    harbor: 10,
  };
  return {
    id: stepId,
    title: typeof step.title === "string" && step.title.trim() ? step.title.trim() : "Mentor feladat",
    text: mentorTextOverrides[stepId] || rawText,
    reward: {
      money: Math.max(0, Math.round(Number(reward.money) || 0)),
      xp: mentorXpOverrides[stepId] ?? Math.max(0, Math.round(Number(reward.xp) || 0)),
      item: false,
    },
  };
}

function replaceMentorStepsConfig(incoming) {
  if (!Array.isArray(incoming)) return false;
  const normalized = incoming.map(normalizeMentorStepConfig).filter(Boolean);
  if (!normalized.length) return false;
  mentorSteps.splice(0, mentorSteps.length, ...normalized);
  return true;
}

function applyGameConfigPayload(configs = {}) {
  replaceConfigArray(harborZoneDefs, configs.harbor_zones?.payload, ["id", "title"]);
  replaceConfigArray(harborGarageVehicleDefs, configs.harbor_garage_vehicles?.payload, ["id", "title"]);
  replaceConfigArray(harborGarageMissionDefs, configs.harbor_garage_missions?.payload, ["id", "title", "vehicleId"]);
  replaceConfigArray(harborMissionCatalog, configs.harbor_missions?.payload, ["id", "title", "zone"]);
  replaceConfigArray(harborFishMissionDefs, configs.harbor_fish_missions?.payload, ["id", "title", "zone"]);
  replaceQuestTemplateConfig(configs.main_quest_templates?.payload);
  replaceEquipmentCatalogConfig(configs.equipment_catalog?.payload);
  replaceRankTableConfig(configs.rank_table?.payload);
  replaceMentorStepsConfig(configs.mentor_steps?.payload);
}

async function loadGameConfigFromDatabase() {
  try {
    const response = await fetch(GAME_CONFIG_API, { cache: "no-store" });
    if (!response.ok) return false;
    const payload = await response.json();
    if (!payload?.configs || typeof payload.configs !== "object") return false;
    applyGameConfigPayload(payload.configs);
    return true;
  } catch (error) {
    console.warn("Game config API unavailable, using bundled defaults.", error);
    return false;
  }
}

function normalizeSmuggledGoods(goods) {
  return Object.fromEntries(Object.keys(harborCargoDefs).map((key) => [
    key,
    Math.max(0, Math.round(Number(goods?.[key]) || 0)),
  ]));
}

function formatCargoLoss(cargo = {}) {
  return Object.entries(normalizeSmuggledGoods(cargo))
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => `${harborCargoDefs[key]?.label || key}: ${amount}`)
    .join(", ");
}

function normalizeHarborGarage(saved) {
  const unlockedSet = new Set(
    Array.isArray(saved?.unlockedVehicleIds)
      ? saved.unlockedVehicleIds.map((entry) => String(entry || "").trim()).filter(Boolean)
      : ["sedan"],
  );
  unlockedSet.add("sedan");
  const unlockedVehicleIds = harborGarageVehicleDefs
    .map((vehicle) => vehicle.id)
    .filter((id) => unlockedSet.has(id));
  const activeVehicleId = unlockedVehicleIds.includes(saved?.activeVehicleId)
    ? saved.activeVehicleId
    : (unlockedVehicleIds[0] || "sedan");
  const now = Date.now();
  const runTimestamps = (Array.isArray(saved?.runTimestamps) ? saved.runTimestamps : [])
    .map(Number)
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now - GARAGE_RUN_WINDOW_MS && timestamp <= now + 60000)
    .sort((left, right) => left - right)
    .slice(-GARAGE_RUN_LIMIT);
  return {
    level: clamp(Math.round(Number(saved?.level) || 1), 1, 3),
    wins: Math.max(0, Math.round(Number(saved?.wins) || 0)),
    losses: Math.max(0, Math.round(Number(saved?.losses) || 0)),
    activeVehicleId,
    unlockedVehicleIds,
    runTimestamps,
  };
}

function getGarageRunLimitState(now = Date.now()) {
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  const runs = state.harborGarage.runTimestamps;
  const used = runs.length;
  const resetAt = used >= GARAGE_RUN_LIMIT ? runs[0] + GARAGE_RUN_WINDOW_MS : 0;
  return {
    used,
    remaining: Math.max(0, GARAGE_RUN_LIMIT - used),
    resetAt,
    resetIn: Math.max(0, resetAt - now),
  };
}

function getGarageVehicleById(vehicleId) {
  return harborGarageVehicleDefs.find((vehicle) => vehicle.id === vehicleId) || harborGarageVehicleDefs[0];
}

function getActiveGarageVehicle() {
  return getGarageVehicleById(state.harborGarage?.activeVehicleId || "sedan");
}

function getHarborGarageStats() {
  const garage = normalizeHarborGarage(state.harborGarage);
  state.harborGarage = garage;
  const vehicle = getGarageVehicleById(garage.activeVehicleId);
  return {
    speed: vehicle.speed,
    stealth: vehicle.stealth,
    load: vehicle.load,
    quantityBonus: Math.max(0, garage.level - 1),
  };
}

function getHarborGarageUpgradeCost() {
  const baseCost = 360 + (Math.max(1, state.harborGarage?.level || 1) - 1) * 290;
  return Math.round(baseCost * 1.45);
}

function normalizeHarborBarUsage(source = {}, now = getSynchronizedNow()) {
  const normalizeEntry = (entry) => {
    const resetAt = Math.max(0, Number(entry?.resetAt) || 0);
    if (!resetAt || resetAt <= now) return { uses: 0, resetAt: 0 };
    return {
      uses: clamp(Math.round(Number(entry?.uses) || 0), 0, HARBOR_BAR_USE_LIMIT),
      resetAt,
    };
  };
  return {
    health: normalizeEntry(source?.health),
    energy: normalizeEntry(source?.energy),
  };
}

function getHarborBarLimitState(kind, now = getSynchronizedNow()) {
  state.harborBarUsage = normalizeHarborBarUsage(state.harborBarUsage, now);
  const usage = state.harborBarUsage[kind] || { uses: 0, resetAt: 0 };
  return {
    uses: usage.uses,
    remaining: Math.max(0, HARBOR_BAR_USE_LIMIT - usage.uses),
    resetAt: usage.resetAt,
    resetIn: Math.max(0, usage.resetAt - now),
  };
}

function scaleGarageCargoReward(cargo = {}, load = 1, quantityBonus = 0) {
  const cargoBonus = Math.max(0, Math.round(Number(load) || 1) - 1)
    + Math.max(0, Math.round(Number(quantityBonus) || 0));
  return Object.fromEntries(Object.entries(cargo).map(([key, amount]) => [
    key,
    Math.max(0, Math.round(Number(amount) || 0) + cargoBonus),
  ]));
}

function tuneCargoForVehicle(cargo = {}, vehicle) {
  const tuned = { counterfeitMoney: 0, drugs: 0, weapons: 0, papers: 0 };
  const normalizedCargo = normalizeSmuggledGoods(cargo);
  const randomizeCargo = (maxPerType = 3, fallbackKeys = []) => {
    const activeKeys = Object.keys(normalizedCargo).filter((key) => normalizedCargo[key] > 0);
    const keys = activeKeys.length ? activeKeys : fallbackKeys;
    keys.forEach((key) => {
      tuned[key] = randomInt(1, Math.max(1, maxPerType));
    });
    return tuned;
  };
  if (!vehicle || vehicle.rewardProfile === "balanced") {
    return randomizeCargo(3, ["papers", "counterfeitMoney"]);
  }
  if (vehicle.rewardProfile === "cargo") {
    return randomizeCargo(6, ["drugs", "papers"]);
  }
  if (vehicle.rewardProfile === "cash") {
    return randomizeCargo(3, ["counterfeitMoney", "papers"]);
  }
  return normalizedCargo;
}

function getGarageMissionRunConfig(mission, stats, vehicle = getActiveGarageVehicle()) {
  const load = Math.max(1, Math.round(Number(stats?.load) || 1));
  const quantityBonus = Math.max(0, Math.round(Number(stats?.quantityBonus) || 0));
  const cargoRewardBase = scaleGarageCargoReward(mission.cargoReward, load, quantityBonus);
  const cargoReward = tuneCargoForVehicle(cargoRewardBase, vehicle);
  const moneyBase = mission.rewardMoney + Math.max(0, load - 1) * 20;
  const xpBase = mission.rewardXp + Math.max(0, load - 1) * 3;
  let rewardMoney = vehicle?.rewardProfile === "cash"
    ? moneyBase + 160 + load * 20
    : vehicle?.rewardProfile === "cargo"
      ? moneyBase - 30
      : moneyBase;
  let rewardXp = vehicle?.rewardProfile === "cargo"
    ? xpBase + 8
    : xpBase;
  if (mission.id === "night-convoy") {
    rewardMoney = Math.round(rewardMoney * 0.5);
    rewardXp = Math.round(rewardXp * 0.5);
  }
  if (vehicle?.id === "armor") {
    rewardMoney = Math.min(666, rewardMoney);
  }
  return {
    totalRounds: mission.rounds + Math.max(0, load - 1),
    requiredHits: mission.requiredHits + Math.max(0, Math.min(2, load - 1)),
    rewardMoney: Math.max(40, rewardMoney),
    rewardXp: Math.max(10, rewardXp),
    cargoReward,
  };
}

function getGarageMissPenaltyFactor(misses = 0) {
  return clamp(1 - Math.max(0, Math.round(Number(misses) || 0)) * 0.15, 0.45, 1);
}

function scaleGarageRewardCargoForMisses(cargo = {}, misses = 0) {
  const factor = getGarageMissPenaltyFactor(misses);
  return Object.fromEntries(Object.entries(normalizeSmuggledGoods(cargo)).map(([key, amount]) => [
    key,
    amount > 0 ? Math.max(1, Math.round(amount * factor)) : 0,
  ]));
}

function formatCargoList(cargo = {}) {
  const entries = Object.entries(cargo)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([key, amount]) => `${Math.round(amount)} ${harborCargoDefs[key]?.label || key}`);
  return entries.length ? entries.join(", ") : "-";
}

function stopGarageMiniGame(resetState = false) {
  if (garageMiniGameTimer) {
    window.clearInterval(garageMiniGameTimer);
    garageMiniGameTimer = null;
  }
  if (resetState) {
    garageMiniGameState = null;
  }
}

function rollGarageCheckpoint(gameState) {
  gameState.safeCenter = 0.22 + Math.random() * 0.56;
  gameState.pointer = gameState.direction > 0 ? 0.08 : 0.92;
}

function getGarageRoundSafeWidth(gameState, mission) {
  const baseWidth = Number(gameState?.baseSafeWidth) || Number(mission?.baseSafeWidth) || 0.2;
  const clickCount = Math.max(0, Math.round(Number(gameState?.attempts) || 0));
  return clamp(baseWidth - clickCount * 0.01, 0.14, 0.36);
}

function getGarageAttemptSpeed(gameState, mission) {
  const baseSpeed = Number(gameState?.baseSpeed) || Number(mission?.baseSpeed) || 0.022;
  const clickCount = Math.max(0, Math.round(Number(gameState?.attempts) || 0));
  return clamp(baseSpeed + clickCount * 0.0012, 0.014, 0.034);
}

function getGarageMissionById(missionId) {
  return harborGarageMissionDefs.find((mission) => mission.id === missionId) || null;
}

function startGarageMiniGameLoop() {
  stopGarageMiniGame(false);
  if (!garageMiniGameState) return;
  garageMiniGameTimer = window.setInterval(() => {
    if (!garageMiniGameState) {
      stopGarageMiniGame(false);
      return;
    }
    garageMiniGameState.pointer += garageMiniGameState.direction * garageMiniGameState.speed;
    if (garageMiniGameState.pointer >= 0.96) {
      garageMiniGameState.pointer = 0.96;
      garageMiniGameState.direction = -1;
    } else if (garageMiniGameState.pointer <= 0.04) {
      garageMiniGameState.pointer = 0.04;
      garageMiniGameState.direction = 1;
    }
    const needle = harborOperationPanel?.querySelector(".garage-minigame__needle");
    if (needle) needle.style.left = `${garageMiniGameState.pointer * 100}%`;
  }, 40);
}

function syncGarageNeedleFromDom(gameState) {
  if (!gameState || !harborOperationPanel) return;
  const meter = harborOperationPanel.querySelector(".garage-minigame__meter");
  const needle = harborOperationPanel.querySelector(".garage-minigame__needle");
  if (!meter || !needle) return;
  const meterRect = meter.getBoundingClientRect();
  const needleRect = needle.getBoundingClientRect();
  if (!meterRect.width) return;
  const visualCenter = ((needleRect.left + needleRect.width / 2) - meterRect.left) / meterRect.width;
  gameState.pointer = clamp(visualCenter, 0, 1);
}

function isGarageCheckpointHit(gameState) {
  syncGarageNeedleFromDom(gameState);
  const safeLeft = gameState.safeCenter - gameState.safeWidth / 2;
  const safeRight = gameState.safeCenter + gameState.safeWidth / 2;
  const visualTolerance = 0.018;
  return gameState.pointer >= safeLeft - visualTolerance && gameState.pointer <= safeRight + visualTolerance;
}

function canPayCargo(cargo = {}) {
  const goods = normalizeSmuggledGoods(state.smuggledGoods);
  return Object.entries(cargo).every(([key, amount]) => goods[key] >= Number(amount));
}

function takeCargo(cargo = {}) {
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  Object.entries(cargo).forEach(([key, amount]) => {
    state.smuggledGoods[key] = Math.max(0, (state.smuggledGoods[key] || 0) - Math.max(0, Math.round(Number(amount) || 0)));
  });
}

function addCargo(cargo = {}) {
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  Object.entries(cargo).forEach(([key, amount]) => {
    state.smuggledGoods[key] = Math.max(0, (state.smuggledGoods[key] || 0) + Math.max(0, Math.round(Number(amount) || 0)));
  });
}

function getHarborMissionsForZone(zoneId) {
  if (zoneId === "fish") return harborFishMissionDefs.map((mission) => ({ ...mission }));
  const matching = harborMissionCatalog.filter((mission) => mission.zone === zoneId);
  const offset = Math.abs((state.day * 7 + zoneId.length * 11) % Math.max(1, matching.length));
  return Array.from({ length: Math.min(6, matching.length) }, (_, index) => matching[(offset + index) % matching.length]);
}

function setHarborPanelContent(zone, bodyHtml) {
  if (!harborOperationPanel) return;
  const lockClose = zone?.id === "garage" && Boolean(garageMiniGameState);
  harborOperationPanel.classList.toggle("harbor-operation-panel--customs", zone?.id === "customs");
  harborOperationPanel.classList.toggle("harbor-operation-panel--rail", zone?.id === "rail");
  harborOperationPanel.classList.toggle("harbor-operation-panel--office", zone?.id === "office");
  harborOperationPanel.innerHTML = `
    <header class="harbor-operation-panel__header">
      <div>
        <span>Kikoto negyed</span>
        <strong>${escapeHtml(zone.title)}</strong>
      </div>
      <button class="harbor-operation-panel__close${lockClose ? " hidden" : ""}" type="button" aria-label="Bezaras"${lockClose ? " disabled" : ""}>x</button>
    </header>
    ${bodyHtml}
  `;
  harborOperationPanel.classList.remove("hidden");
  harborOperationPanel.setAttribute("aria-hidden", "false");
  harborOperationPanel.querySelector(".harbor-operation-panel__close")?.addEventListener("click", hideHarborOperationPanel);
}

function hideHarborOperationPanel() {
  if (garageMiniGameState) return;
  stopGarageMiniGame(true);
  harborOperationPanel?.classList.add("hidden");
  harborOperationPanel?.setAttribute("aria-hidden", "true");
}

function renderHarborBar(zone) {
  const healthLimit = getHarborBarLimitState("health");
  const energyLimit = getHarborBarLimitState("energy");
  const getLimitHtml = (limit) => `
    <aside class="harbor-service-card__limit${limit.remaining <= 0 ? " is-empty" : ""}" aria-label="Felhasználható: ${limit.remaining}/${HARBOR_BAR_USE_LIMIT}">
      <strong>${limit.remaining}/${HARBOR_BAR_USE_LIMIT}</strong>
    </aside>
  `;
  setHarborPanelContent(zone, `
    <section class="harbor-place">
      <div class="harbor-hero harbor-hero--bar" aria-hidden="true">
        <img class="harbor-hero__image" src="./assets/harbor/speakeasy-harbor.webp" alt="">
        <div class="harbor-hero__overlay">
          <span>Esos estek, whisky, pihenes</span>
          <strong>Kikotoi kocsma</strong>
        </div>
      </div>
      <div class="harbor-service-grid">
        <article class="harbor-service-card harbor-service-card--limited">
          ${getLimitHtml(healthLimit)}
          <strong>Orvosi whiskey</strong>
          <span>+35 eletero</span>
          <small>Ersebb ital a kikoto embereitol. Gyors foltozas, dragabb aron.</small>
          <button type="button" data-harbor-buy="health" ${healthLimit.remaining <= 0 || state.health >= 100 || state.money < 75 ? "disabled" : ""}>${healthLimit.remaining <= 0 ? "Limit elerve" : state.health >= 100 ? "Teljes eletero" : "Megveszem - 75 $"}</button>
        </article>
        <article class="harbor-service-card harbor-service-card--limited">
          ${getLimitHtml(energyLimit)}
          <strong>Fekete kave</strong>
          <span>+35 energia</span>
          <small>Forro, eros fekete. Osszerantja az embert egy ujabb akciohoz.</small>
          <button type="button" data-harbor-buy="energy" ${energyLimit.remaining <= 0 || state.energy >= 100 || state.money < 75 ? "disabled" : ""}>${energyLimit.remaining <= 0 ? "Limit elerve" : state.energy >= 100 ? "Teljes energia" : "Megveszem - 75 $"}</button>
        </article>
        <article class="harbor-service-card harbor-service-card--locked">
          <strong>Mentor ital</strong>
          <span>XP boost kesobb</span>
          <button type="button" disabled>Hamarosan</button>
        </article>
      </div>
    </section>
  `);
}

function renderHarborWarehouse(zone) {
  const goods = state.smuggledGoods || {};
  setHarborPanelContent(zone, `
    <section class="harbor-warehouse harbor-warehouse--minimal">
      <div class="harbor-warehouse__header harbor-warehouse__header--compact">
        <span>Csempesz raktar</span>
        <strong>Osszegyujtott aru</strong>
      </div>
      <div class="harbor-warehouse__bubble-grid">
        ${Object.entries(harborCargoDefs).map(([key, cargo]) => `
          <article class="harbor-cargo-bubble">
            <span class="harbor-cargo-bubble__frame"><img class="harbor-cargo-bubble__image" src="${cargo.image}" alt=""></span>
            <strong>${cargo.label}</strong>
            <em>${Math.max(0, Math.round(Number(goods[key]) || 0))} db</em>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function renderHarborOrders(zone, kind = "mixed") {
  const orders = getHarborMissionsForZone(zone.id);
  if (zone.id === "rail") {
    const selectedMission = orders.find((mission) => mission.id === selectedHarborRailMissionId) || orders[0];
    if (!selectedMission) {
      setHarborPanelContent(zone, `<p class="harbor-operation-panel__muted">Jelenleg nincs elérhető vasúti küldetés.</p>`);
      return;
    }
    selectedHarborRailMissionId = selectedMission.id;
    const difficulty = getHarborCustomsDifficulty(selectedMission);
    const selectedQueued = isHarborMissionQueued(selectedMission);
    const cargoTotal = Object.values(normalizeSmuggledGoods(state.smuggledGoods)).reduce((sum, amount) => sum + Math.max(0, Number(amount) || 0), 0);
    const activeRailJobs = normalizeProcessTasks(state.harborProcessTasks).filter((task) => task.type === "harbor" && task.payload?.zone === "rail").length;

    setHarborPanelContent(zone, `
      <section class="rail-hub">
        <p class="customs-hub__intro">A vasúti rakodó a kikötő szárazföldi kapuja. Válassz vasúti küldetést, majd indítsd útnak a nehéz árut a város felé.</p>
        <div class="customs-hub__layout">
          <section class="customs-board rail-board" aria-label="Elérhető vasúti küldetések">
            <div class="customs-board__head">
              <span>Küldetés</span><span>Rakomány</span><span>Idő</span><span>Jutalom</span><span>Esély</span>
            </div>
            <div class="customs-board__list">
              ${orders.map((mission, index) => {
                const chance = Math.round(clamp(Number(mission.successChance) || 1, 0, 1) * 100);
                const missionDifficulty = getHarborCustomsDifficulty(mission);
                const queued = isHarborMissionQueued(mission);
                const selected = mission.id === selectedMission.id;
                return `
                  <div class="customs-mission-row rail-mission-row${selected ? " is-selected" : ""}${queued ? " is-queued" : ""}" data-rail-select="${mission.id}" role="button" tabindex="0" aria-pressed="${selected}">
                    <span class="customs-mission-row__title"><strong>Vasúti küldetés ${index + 1}</strong><em>${"★".repeat(missionDifficulty)}</em></span>
                    <span class="customs-mission-row__cargo">${renderHarborCustomsCargo(mission.gives || mission.requires, true)}</span>
                    <span class="customs-mission-row__time">${formatCountdown(mission.durationMs)}</span>
                    <span class="customs-mission-row__reward"><strong>${Math.max(0, Math.round(Number(mission.rewardMoney) || 0))} $</strong><small>+${Math.max(0, Math.round(Number(mission.rewardXp) || 0))} XP</small></span>
                    <span class="customs-mission-row__chance">${chance}%</span>
                  </div>
                `;
              }).join("")}
            </div>
            <footer class="customs-board__footer">
              <span>A vasúti menetrend a napi körrel együtt frissül.</span>
              <strong>${activeRailJobs ? `${activeRailJobs} vasúti küldetés folyamatban` : "Nincs futó vasúti küldetés"}</strong>
            </footer>
          </section>

          <aside class="customs-detail rail-detail" aria-label="Kiválasztott vasúti küldetés">
            <span class="customs-detail__eyebrow">Kiválasztott küldetés</span>
          <img class="customs-detail__image rail-detail__image" src="./assets/harbor/rail-depot-detail-v3.webp" alt="Vasúti rakodó éjszakai pályaudvarral és teherkocsikkal">
            <div class="customs-detail__body">
              <h3>${escapeHtml(selectedMission.title)} <span>${"★".repeat(difficulty)}</span></h3>
              <p>A pályaudvari rakodóban a nehéz árut kocsiról kocsira mozgatják. A jutalom csak a folyamat végén érkezik meg.</p>
              <section class="customs-detail__cargo">
                <span>Rakomány</span>
                <div>${renderHarborCustomsCargo(selectedMission.gives || selectedMission.requires, false)}</div>
              </section>
              <div class="customs-detail__stats">
                <article><span>Idő</span><strong>${formatCountdown(selectedMission.durationMs)}</strong></article>
                <article><span>Jutalom</span><strong>${Math.max(0, Math.round(Number(selectedMission.rewardMoney) || 0))} $</strong><small>+${Math.max(0, Math.round(Number(selectedMission.rewardXp) || 0))} XP</small></article>
                <article><span>Siker esélye</span><strong>${Math.round(clamp(Number(selectedMission.successChance) || 1, 0, 1) * 100)}%</strong></article>
              </div>
              <section class="customs-detail__requirements">
                <span>Rakodási állapot</span>
                <div><strong>Rakomány</strong><small>${cargoTotal} db</small></div>
                <div><strong>Folyamat</strong><small>${selectedQueued ? "Soron" : "Szabad"}</small></div>
              </section>
              <button class="customs-detail__start" type="button" data-harbor-mission="${selectedMission.id}" ${selectedQueued ? "disabled" : ""}>${selectedQueued ? "Már folyamatban" : "Küldetés indítása"}</button>
            </div>
          </aside>
        </div>
        <footer class="customs-status-grid">
          <article><span class="customs-status-grid__icon">▣</span><div><small>Raktárkészlet</small><strong>${cargoTotal} db áru</strong></div></article>
          <article><span class="customs-status-grid__icon">♢</span><div><small>Nehézségi szint</small><strong>${"◆".repeat(Math.max(1, Math.min(3, difficulty)))}${"◇".repeat(Math.max(0, 3 - difficulty))}</strong></div></article>
          <article><span class="customs-status-grid__icon">♟</span><div><small>Rakodói kapcsolatok</small><strong>VASÚTI CSATORNA</strong></div></article>
        </footer>
      </section>
    `);
    return;
  }
  setHarborPanelContent(zone, `
    <section class="harbor-orders${kind === "fish" ? " harbor-orders--fish" : ""}">
      ${kind === "fish" ? `
        <div class="harbor-hero harbor-hero--fish" aria-hidden="true">
          <img class="harbor-hero__image" src="./assets/harbor/fish-market-harbor.webp" alt="">
          <div class="harbor-hero__overlay">
            <span>Friss aru, gyors alku, nedves rakpart</span>
            <strong>Halpiaci megbizasok</strong>
          </div>
        </div>
      ` : ""}
      <div class="harbor-orders__header">
        <span>${kind === "fish" ? "Halpiaci megbizasok" : "Csempesz megbizasok"}</span>
        <strong>${escapeHtml(zone.title)}</strong>
      </div>
      ${kind === "fish" ? "" : `<p class="harbor-orders__intro">A munka a felso folyamat korbe kerul. Jutalom csak akkor jar, amikor lejar.</p>`}
      <div class="harbor-orders__table">
        <div class="harbor-orders__row harbor-orders__row--head"><span>Munka</span><span>Igeny / aru</span><span>Ido</span><span>Jutalom</span><span></span></div>
        ${orders.map((mission) => {
          const affordable = canPayCargo(mission.requires);
          const alreadyQueued = normalizeProcessTasks(state.harborProcessTasks).some((task) =>
            task.type === "harbor" && (task.payload?.missionId === mission.id || (!task.payload?.missionId && task.payload?.title === mission.title)),
          );
          const needs = mission.requires ? formatCargoList(mission.requires) : `Szerez: ${formatCargoList(mission.gives)}`;
          const chanceText = Number.isFinite(Number(mission.successChance)) && mission.successChance < 1
            ? `, ${Math.round(Number(mission.successChance) * 100)}% esely`
            : "";
          const recoveryText = mission.heal || mission.energy
            ? `, +${Math.max(0, Number(mission.heal) || 0)}% elet, +${Math.max(0, Number(mission.energy) || 0)}% energia`
            : "";
          const reward = `+${mission.rewardMoney} $, +${mission.rewardXp} XP${recoveryText}${chanceText}`;
          return `
          <div class="harbor-orders__row">
            <strong>${escapeHtml(mission.title)}</strong>
            <small>${escapeHtml(needs)}</small>
            <span>${formatCountdown(mission.durationMs)}</span>
            <span>${escapeHtml(reward)}</span>
            <button type="button" data-harbor-mission="${mission.id}" ${affordable && !alreadyQueued ? "" : "disabled"}>${alreadyQueued ? "Mar folyamatban" : affordable ? "Inditas" : "Nincs aru"}</button>
          </div>
        `; }).join("")}
      </div>
    </section>
  `);
}

function isHarborMissionQueued(mission) {
  return normalizeProcessTasks(state.harborProcessTasks).some((task) =>
    task.type === "harbor"
    && (task.payload?.missionId === mission.id || (!task.payload?.missionId && task.payload?.title === mission.title)),
  );
}

function getHarborCustomsDifficulty(mission) {
  const chance = clamp(Number(mission?.successChance) || 1, 0, 1);
  if (chance >= 0.9) return 1;
  if (chance >= 0.76) return 2;
  return 3;
}

function getHarborCustomsRelationshipLabel() {
  const influence = clamp(Math.round(Number(state.influence) || 0), 0, 100);
  if (influence >= 75) return "Nagyon jó";
  if (influence >= 50) return "Erős";
  if (influence >= 25) return "Megbízható";
  return "Kezdő";
}

function renderHarborCustomsCargo(cargo = {}, compact = false) {
  const entries = Object.entries(cargo).filter(([, amount]) => Number(amount) > 0);
  if (!entries.length) return `<span class="customs-cargo-empty">Nincs külön rakomány</span>`;
  return entries.map(([key, amount]) => {
    const definition = harborCargoDefs[key] || { label: key, image: "" };
    return `
      <span class="customs-cargo-item${compact ? " customs-cargo-item--compact" : ""}">
        ${definition.image ? `<img src="${definition.image}" alt="">` : ""}
        <span><strong>${Math.max(0, Math.round(Number(amount) || 0))}</strong> ${escapeHtml(definition.label)}</span>
      </span>
    `;
  }).join("");
}

function renderHarborCustoms(zone) {
  const missions = getHarborMissionsForZone("customs");
  if (!missions.length) {
    setHarborPanelContent(zone, `<p class="harbor-operation-panel__muted">Jelenleg nincs elérhető vámmegbízás.</p>`);
    return;
  }
  const selectedMission = missions.find((mission) => mission.id === selectedHarborCustomsMissionId) || missions[0];
  selectedHarborCustomsMissionId = selectedMission.id;
  const difficulty = getHarborCustomsDifficulty(selectedMission);
  const successChance = Math.round(clamp(Number(selectedMission.successChance) || 1, 0, 1) * 100);
  const selectedQueued = isHarborMissionQueued(selectedMission);
  const cargoTotal = Object.values(normalizeSmuggledGoods(state.smuggledGoods)).reduce((sum, amount) => sum + Math.max(0, Number(amount) || 0), 0);
  const activeCustomsJobs = normalizeProcessTasks(state.harborProcessTasks).filter((task) => task.type === "harbor" && task.payload?.zone === "customs").length;

  setHarborPanelContent(zone, `
    <section class="customs-hub">
      <p class="customs-hub__intro">Válassz vámmegbízást, majd indítsd útnak az árut. A jutalom és a rakomány csak a folyamat lejártakor kerül jóváírásra.</p>
      <div class="customs-hub__layout">
        <section class="customs-board" aria-label="Elérhető vámmegbízások">
          <div class="customs-board__head">
            <span>Megbízás</span><span>Árucsomag</span><span>Idő</span><span>Jutalom</span><span>Esély</span>
          </div>
          <div class="customs-board__list">
            ${missions.map((mission, index) => {
              const chance = Math.round(clamp(Number(mission.successChance) || 1, 0, 1) * 100);
              const missionDifficulty = getHarborCustomsDifficulty(mission);
              const queued = isHarborMissionQueued(mission);
              const selected = mission.id === selectedMission.id;
              return `
                <div class="customs-mission-row${selected ? " is-selected" : ""}${queued ? " is-queued" : ""}" data-customs-select="${mission.id}" role="button" tabindex="0" aria-pressed="${selected}">
                  <span class="customs-mission-row__title"><strong>Vám megbízás ${index + 1}</strong><em>${"★".repeat(missionDifficulty)}</em></span>
                  <span class="customs-mission-row__cargo">${renderHarborCustomsCargo(mission.gives || mission.requires, true)}</span>
                  <span class="customs-mission-row__time">${formatCountdown(mission.durationMs)}</span>
                  <span class="customs-mission-row__reward"><strong>${Math.max(0, Math.round(Number(mission.rewardMoney) || 0))} $</strong><small>+${Math.max(0, Math.round(Number(mission.rewardXp) || 0))} XP</small></span>
                  <span class="customs-mission-row__chance">${chance}%</span>
                </div>
              `;
            }).join("")}
          </div>
          <footer class="customs-board__footer">
            <span>A kínálat a kikötői nap váltásakor frissül.</span>
            <strong>${activeCustomsJobs ? `${activeCustomsJobs} vámmunka folyamatban` : "Nincs futó vámmunka"}</strong>
          </footer>
        </section>

        <aside class="customs-detail" aria-label="Kiválasztott vámmegbízás">
          <span class="customs-detail__eyebrow">Kiválasztott megbízás</span>
          <img class="customs-detail__image" src="./assets/harbor/customs-office-detail-v1.webp" alt="Éjszakai vámhivatal iratokkal és kikötői rakománnyal">
          <div class="customs-detail__body">
            <h3>${escapeHtml(selectedMission.title)} <span>${"★".repeat(difficulty)}</span></h3>
            <p>A hivatal emberei előkészítik a papírokat, az áru pedig ellenőrzött útvonalon jut át a kikötőn.</p>
            <section class="customs-detail__cargo">
              <span>Árucsomag</span>
              <div>${renderHarborCustomsCargo(selectedMission.gives || selectedMission.requires)}</div>
            </section>
            <div class="customs-detail__stats">
              <div><span>Idő</span><strong>${formatCountdown(selectedMission.durationMs)}</strong></div>
              <div><span>Jutalom</span><strong>${Math.max(0, Math.round(Number(selectedMission.rewardMoney) || 0))} $</strong><small>+${Math.max(0, Math.round(Number(selectedMission.rewardXp) || 0))} XP</small></div>
              <div><span>Siker esélye</span><strong>${successChance}%</strong></div>
            </div>
            <section class="customs-detail__requirements">
              <span>Műveleti állapot</span>
              <div><strong>Kapcsolat</strong><em>${getHarborCustomsRelationshipLabel()}</em></div>
              <div><strong>Körözés</strong><em>${clamp(Math.round(Number(state.heat) || 0), 0, 100)}%</em></div>
            </section>
            <button class="customs-detail__start" type="button" data-harbor-mission="${selectedMission.id}" ${selectedQueued ? "disabled" : ""}>${selectedQueued ? "Már folyamatban" : "Megbízás indítása"}</button>
          </div>
        </aside>
      </div>
      <footer class="customs-status-grid">
        <article><span class="customs-status-grid__icon">▣</span><div><small>Raktárkészlet</small><strong>${Math.round(cargoTotal)} db áru</strong></div></article>
        <article><span class="customs-status-grid__icon">♢</span><div><small>Nehézségi szint</small><strong>${"◆".repeat(difficulty)}${"◇".repeat(3 - difficulty)}</strong></div></article>
        <article><span class="customs-status-grid__icon">♟</span><div><small>Kikötői kapcsolatok</small><strong>${getHarborCustomsRelationshipLabel()}</strong></div></article>
      </footer>
    </section>
  `);
}

function getHarborOfficeRelationship(influence = state.influence) {
  const normalizedInfluence = clamp(Math.round(Number(influence) || 0), 0, 100);
  if (normalizedInfluence >= 75) return { label: "Tekintélyes", tone: "excellent" };
  if (normalizedInfluence >= 50) return { label: "Nagyon jó", tone: "good" };
  if (normalizedInfluence >= 25) return { label: "Stabil", tone: "steady" };
  return { label: "Óvatos", tone: "cautious" };
}

function getHarborOfficeLogEntries() {
  const entries = Array.isArray(state.localNotifications) ? state.localNotifications : [];
  const harborPattern = /kiköt|kikoto|vám|vam|csempész|csempesz|rakpart|dok|halpiac|garázs|garazs/i;
  return entries
    .filter((entry) => harborPattern.test(`${entry?.title || ""} ${entry?.body || ""}`))
    .sort((left, right) => Number(right?.createdAt || 0) - Number(left?.createdAt || 0))
    .slice(0, 8);
}

function renderHarborOfficeOverview({ smallBribeCost, largeBribeCost, relationship, benefits, cargoTotal, activeJobs }) {
  const officeCards = [
    { art: "routes", icon: "✥", title: "Csempészeti útvonalak", copy: "Útvonalak kezelése, kockázat felmérése és haszon maximalizálása." },
    { art: "contacts", icon: "◆", title: "Kapcsolatok", copy: "Befolyás építése a dokkmunkások, vámosok és kapitányok között." },
    { art: "warehouse", icon: "▣", title: "Raktár és szállítmány", copy: "Árukészlet, lefoglalt rakomány és csempészcsomagok áttekintése." },
    { art: "upgrades", icon: "⬆", title: "Fejlesztések", copy: "A kikötői járművek és műveleti háttér fejlesztése." },
  ];
  const discountText = benefits.harborPenaltyReductionRate > 0
    ? `${formatInfluenceRate(benefits.harborPenaltyReductionRate)} kedvezmény aktív`
    : "Nincs befolyáskedvezmény";
  return `
    <div class="harbor-office-overview-grid">
      ${officeCards.map((card) => `
        <article class="harbor-office-feature-card is-coming-soon">
          <div class="harbor-office-feature-card__art harbor-office-feature-card__art--${card.art}" aria-hidden="true"><span>${card.icon}</span></div>
          <div class="harbor-office-feature-card__body">
            <strong>${card.title}</strong>
            <p>${card.copy}</p>
            <button type="button" disabled aria-disabled="true">Majd később</button>
          </div>
        </article>
      `).join("")}
    </div>
    <div class="harbor-office-dashboard">
      <article class="harbor-office-status-card">
        <span>Hivatal állapota</span>
        <div><small>Befolyás</small><i><b style="width:${clamp(Number(state.influence) || 0, 0, 100)}%"></b></i><strong>${clamp(Math.round(Number(state.influence) || 0), 0, 100)}%</strong></div>
        <div><small>Körözés</small><i class="is-heat"><b style="width:${clamp(Number(state.heat) || 0, 0, 100)}%"></b></i><strong>${clamp(Math.round(Number(state.heat) || 0), 0, 100)}%</strong></div>
        <footer><em>${cargoTotal} áru raktáron</em><em>${activeJobs} aktív munka</em></footer>
      </article>
      <article class="harbor-office-bribe-card">
        <span>Kis lefizetés</span><p>Gyors megoldás kisebb gondokra.</p><strong>${smallBribeCost} $</strong>
        <button type="button" data-harbor-bribe="small" ${state.money < smallBribeCost || state.heat <= 0 ? "disabled" : ""}>Lefizetés · −10% körözés</button>
      </article>
      <article class="harbor-office-bribe-card harbor-office-bribe-card--large">
        <span>Nagy lefizetés</span><p>Nagyobb gondok, nagyobb hatás.</p><strong>${largeBribeCost} $</strong>
        <button type="button" data-harbor-bribe="large" ${state.money < largeBribeCost || state.heat <= 0 ? "disabled" : ""}>Lefizetés · −25% körözés</button>
      </article>
      <article class="harbor-office-bonus-card">
        <span>Aktuális bónuszok</span>
        <div><small>Kapcsolat</small><strong class="is-positive">${relationship.label}</strong></div>
        <div><small>Kikötői büntetés</small><strong class="is-positive">−${formatInfluenceRate(benefits.harborPenaltyReductionRate)}</strong></div>
        <div><small>Feketepiaci kedvezmény</small><strong class="is-positive">${formatInfluenceRate(benefits.marketDiscountRate)}</strong></div>
        <footer>${discountText}</footer>
      </article>
    </div>
  `;
}

function renderHarborOfficeOperations({ smallBribeCost, largeBribeCost }) {
  const operations = [
    { zone: "docks", icon: "⚓", title: "Dokkok", copy: "Hajós csempészmunkák és rakparti útvonalak." },
    { zone: "customs", icon: "▤", title: "Vám", copy: "Ellenőrzött rakományok és vámpapírok." },
    { zone: "rail", icon: "▥", title: "Vasúti rakodó", copy: "Nehéz áru gyors mozgatása a városba." },
    { zone: "fish", icon: "◈", title: "Halpiac", copy: "Pihenés, gyógyulás és kisebb kikötői munkák." },
  ];
  return `
    <div class="harbor-office-operation-grid">
      ${operations.map((entry) => `<button type="button" data-harbor-office-zone="${entry.zone}"><b>${entry.icon}</b><strong>${entry.title}</strong><span>${entry.copy}</span></button>`).join("")}
    </div>
    <div class="harbor-office-bribe-strip">
      <div><span>Rendőrségi kapcsolat</span><strong>A lefizetés azonnal csökkenti a körözést.</strong></div>
      <button type="button" data-harbor-bribe="small" ${state.money < smallBribeCost || state.heat <= 0 ? "disabled" : ""}>Kis boríték · ${smallBribeCost} $</button>
      <button type="button" data-harbor-bribe="large" ${state.money < largeBribeCost || state.heat <= 0 ? "disabled" : ""}>Nagy boríték · ${largeBribeCost} $</button>
    </div>
  `;
}

function renderHarborOfficeNetwork(benefits, relationship) {
  const rows = [
    ["Feketepiaci kedvezmény", formatInfluenceRate(benefits.marketDiscountRate)],
    ["Védelmipénz esélybónusz", formatInfluenceRate(benefits.protectionChanceBonus)],
    ["Világtérképes sarcbónusz", formatInfluenceRate(benefits.worldTributeBonusRate)],
    ["Kikötői büntetéscsökkentés", formatInfluenceRate(benefits.harborPenaltyReductionRate)],
    ["Sárga felszerelés esély", formatInfluenceRate(benefits.marketYellowChanceBonus)],
    ["Piros felszerelés esély", formatInfluenceRate(benefits.marketRedChanceBonus)],
  ];
  return `
    <div class="harbor-office-network">
      <section class="harbor-office-network__summary">
        <span>Kikötői kapcsolatok</span><strong>${relationship.label}</strong>
        <i><b style="width:${clamp(Number(state.influence) || 0, 0, 100)}%"></b></i>
        <p>A kapcsolati háló a jelenlegi ${clamp(Math.round(Number(state.influence) || 0), 0, 100)}% befolyásod alapján biztosít előnyöket.</p>
      </section>
      <section class="harbor-office-network__benefits">
        ${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}
      </section>
    </div>
  `;
}

function renderHarborOfficeLog() {
  const entries = getHarborOfficeLogEntries();
  return `
    <div class="harbor-office-log">
      ${entries.length ? entries.map((entry) => `
        <article><time>${entry.createdAt ? new Date(Number(entry.createdAt)).toLocaleString("hu-HU", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Most"}</time><div><strong>${escapeHtml(entry.title || "Kikötői esemény")}</strong><p>${escapeHtml(entry.body || "")}</p></div></article>
      `).join("") : `<div class="harbor-office-log__empty"><strong>Még nincs kikötői bejegyzés</strong><span>Az elindított és befejezett műveletek itt jelennek meg.</span></div>`}
    </div>
  `;
}

function renderHarborOffice(zone, requestedTab = harborOfficeTab) {
  harborOfficeTab = "overview";
  const benefits = getInfluenceBenefits();
  const relationship = getHarborOfficeRelationship();
  const smallBribeCost = Math.max(1, Math.round(100 * (1 - benefits.harborPenaltyReductionRate)));
  const largeBribeCost = Math.max(1, Math.round(350 * (1 - benefits.harborPenaltyReductionRate)));
  const cargoTotal = Object.values(normalizeSmuggledGoods(state.smuggledGoods)).reduce((sum, amount) => sum + amount, 0);
  const activeJobs = normalizeProcessTasks(state.harborProcessTasks).length;
  const content = renderHarborOfficeOverview({ smallBribeCost, largeBribeCost, relationship, benefits, cargoTotal, activeJobs });
  const tabs = [
    ["overview", "Áttekintés", true],
    ["operations", "Műveletek · később", false],
    ["network", "Hálózat · később", false],
    ["log", "Napló · később", false],
  ];
  setHarborPanelContent(zone, `
    <section class="harbor-office-hub">
      <header class="harbor-office-hub__brand">
        <span class="harbor-office-hub__crest" aria-hidden="true"><img src="./assets/harbor/harbor-office-crest-v2.webp" alt=""></span>
        <div><strong>Kikötői iroda</strong><small>A kikötői műveletek központja</small></div>
      </header>
      <nav class="harbor-office-tabs" aria-label="Kikötői iroda menü">
        ${tabs.map(([id, label, enabled]) => `<button type="button" ${enabled ? `data-harbor-office-tab="${id}"` : "disabled aria-disabled=\"true\""} class="${enabled ? "is-active" : "is-coming-soon"}">${label}</button>`).join("")}
      </nav>
      <div class="harbor-office-content harbor-office-content--${harborOfficeTab}">${content}</div>
    </section>
  `);
}

function getHarborMarketSellItems() {
  const rarityOrder = { red: 0, yellow: 1, gray: 2 };
  return getInventoryCraftItems().filter((entry) => !entry.used).sort((left, right) => {
    const rarityDifference = (rarityOrder[left.item.rarity] ?? 3) - (rarityOrder[right.item.rarity] ?? 3);
    if (rarityDifference) return rarityDifference;
    const powerDifference = (Number(right.item.power) || 0) - (Number(left.item.power) || 0);
    if (powerDifference) return powerDifference;
    return String(left.item.name || "").localeCompare(String(right.item.name || ""), "hu");
  });
}

function getHarborMarketSellPanelHtml() {
  const items = getHarborMarketSellItems();
  if (!items.length) {
    const equippedCount = getInventoryCraftItems().filter((entry) => entry.used).length;
    return `
      <section class="market-sell-empty">
        <strong>${equippedCount ? "Nincs szabadon eladható felszerelésed" : "Nincs eladható felszerelésed"}</strong>
        <span>${equippedCount
          ? "A saját karaktereden vagy bandatagon lévő tárgyakat előbb le kell venni, ezért itt nem jelennek meg."
          : "A megszerzett vagy megvásárolt tárgyaid itt jelennek meg."}</span>
      </section>
    `;
  }
  return `
    <section class="market-panel market-panel--sell">
      <div class="market-sell-summary">
        <strong>Kassza: ${state.money} $</strong>
        <span>${items.length} sajat item</span>
        <em>Eladasi ar: az eredeti vagy becsult piaci ertek 40%-a.</em>
      </div>
      <div class="market-panel__grid">
        ${items.map(({ slot, item, key }) => {
          const price = getEquipmentSellPrice(item);
          const armed = pendingHarborSaleKey === key;
          return `
            <article class="market-item market-item--selling">
              <img class="market-item__art" src="${item.image || getEquipmentArt(slot)}" alt="${escapeHtml(item.name)}">
              <div class="market-item__meta">
                <strong>${escapeHtml(item.name)}</strong>
                <span class="market-item__rarity market-item__rarity--${item.rarity}">${getEquipmentRarityLabel(item.rarity)}</span>
              </div>
              <div class="market-item__copy">${escapeHtml(equipmentSlotDefs[slot]?.label || slot)} · ${getEquipmentBonusText(slot, item.power, item.stat)}</div>
              <div class="market-item__stats">
                <span>Eladasi ar: <strong>${price} $</strong></span>
                <span>Azonnali kifizetes</span>
              </div>
              <button
                class="market-item__buy market-item__sell${armed ? " is-confirming" : ""}"
                type="button"
                data-market-sell-slot="${escapeHtml(slot)}"
                data-market-sell-item="${escapeHtml(item.id)}">
                ${armed ? `Megerosites: +${price} $` : `Eladas +${price} $`}
              </button>
            </article>
          `;
        }).join("")}
      </div>
      <div class="market-panel__footnote">A sajat karaktered vagy egy bandatag altal viselt targyak nem jelennek meg ebben a listaban. Az eladas vegleges.</div>
    </section>
  `;
}

async function sellHarborMarketItem(slot, itemId, zone) {
  const item = state.itemInventory?.[slot]?.find((entry) => String(entry.id) === String(itemId));
  if (!item) {
    pendingHarborSaleKey = "";
    sceneRef?.setMessage("Ez a targy mar nincs a leltaradban.");
    renderHarborMarket(zone, "sell");
    return false;
  }
  const key = `${slot}::${item.id}`;
  if (pendingHarborSaleKey !== key) {
    pendingHarborSaleKey = key;
    renderHarborMarket(zone, "sell");
    sceneRef?.setMessage(`Nyomd meg meg egyszer az eladast: ${item.name}.`);
    return false;
  }
  pendingHarborSaleKey = "";
  try {
    const result = await requestServerEconomy("market-sell", { slot, itemId: item.id });
    sceneRef?.refreshHUD();
    sceneRef?.pushLog(`${result.item?.name || item.name} eladva a kikotoi feketepiacon. +${result.price} $.`);
    sceneRef?.setMessage(`${result.item?.name || item.name} eladva. A kereskedo ${result.price} $-t fizetett.`);
    renderHarborMarket(zone, "sell");
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A targy eladasa nem sikerult.");
    renderHarborMarket(zone, "sell");
    return false;
  }
}

function bindHarborMarketControls(zone) {
  harborOperationPanel?.querySelectorAll("[data-harbor-market-mode]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      pendingHarborSaleKey = "";
      const nextMode = button.dataset.harborMarketMode === "sell" ? "sell" : "buy";
      if (nextMode === "buy") await openHarborMarket(zone, nextMode);
      else renderHarborMarket(zone, nextMode);
    });
  });
  harborOperationPanel?.querySelectorAll("[data-market-sell-item]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await sellHarborMarketItem(
        button.dataset.marketSellSlot,
        button.dataset.marketSellItem,
        zone,
      );
    });
  });
}

async function openHarborMarket(zone, mode = harborMarketMode) {
  if (mode !== "sell") {
    try {
      await syncMarketStockFromServer();
    } catch (error) {
      state.marketStock = [];
      state.marketRefreshAt = 0;
      sceneRef?.setMessage(error.message || "A feketepiaci keszlet nem toltheto be.");
    }
  }
  renderHarborMarket(zone, mode);
}

function renderHarborMarket(zone, mode = harborMarketMode) {
  harborMarketMode = mode === "sell" ? "sell" : "buy";
  setHarborPanelContent(zone, `
    <section class="harbor-black-market">
      <div class="harbor-black-market__header">
        <div>
          <span>Kikötői piac</span>
          <h4>Feketepiaci áruk</h4>
        </div>
        <div class="harbor-market-tabs" role="tablist" aria-label="Feketepiaci műveletek">
          <button type="button" role="tab" data-harbor-market-mode="buy" aria-selected="${harborMarketMode === "buy"}" class="${harborMarketMode === "buy" ? "is-active" : ""}">Vásárlás</button>
          <button type="button" role="tab" data-harbor-market-mode="sell" aria-selected="${harborMarketMode === "sell"}" class="${harborMarketMode === "sell" ? "is-active" : ""}">Eladás</button>
        </div>
      </div>
      <p class="harbor-market-mode-note">${harborMarketMode === "sell"
        ? "Válassz a saját tárgyaid közül. A kereskedő a piaci érték 40%-át fizeti."
        : "A megvett tárgy azonnal bekerül a felszereléseid közé."}</p>
      ${harborMarketMode === "sell" ? getHarborMarketSellPanelHtml() : getMarketPanelHtml()}
    </section>
  `);
  if (harborMarketMode === "buy") {
    bindMarketBuyButtons(harborOperationPanel, {
      rerender: false,
      afterBuy: () => renderHarborMarket(zone, "buy"),
    });
  }
  bindHarborMarketControls(zone);
}

async function upgradeHarborGarage() {
  try {
    const data = await requestServerGarage({ operation: "upgrade" });
    sceneRef?.refreshHUD();
    sceneRef?.pushLog(`Garazs fejlesztve. Uj szint: ${data.result?.level || state.harborGarage.level}.`);
    sceneRef?.setMessage("A garazs muhelye fejlesztve lett.");
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message);
    return false;
  }
}

async function activateGarageVehicle(vehicleId) {
  const vehicle = getGarageVehicleById(vehicleId);
  if (!vehicle) return false;
  try {
    const data = await requestServerGarage({ operation: "vehicle", vehicleId: vehicle.id });
    if (data.result?.cost) sceneRef?.pushLog(`${vehicle.title} bekerult a garazsba.`);
    sceneRef?.refreshHUD();
    sceneRef?.setMessage(`${vehicle.title} lett az aktiv menekuloauto.`);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message);
    return false;
  }
}

function getHarborGarageSceneHtml(vehicle, stats) {
  const image = vehicle.image || "./garage-assets/sedan-1930.webp";
  return `
    <div class="harbor-garage-scene" aria-hidden="true">
      <img class="harbor-garage-scene__main-image" src="${escapeHtml(image)}" alt="${escapeHtml(vehicle.title)}">
      <div class="harbor-garage-scene__glow"></div>
      <div class="harbor-garage-scene__smoke harbor-garage-scene__smoke--one"></div>
      <div class="harbor-garage-scene__smoke harbor-garage-scene__smoke--two"></div>
      <div class="harbor-garage-scene__hud">
        <strong>${escapeHtml(vehicle.title)}</strong>
        <span>Sebesseg ${stats.speed} | Rejtettseg ${stats.stealth} | Teher ${stats.load} | Muhely mennyiseg +${stats.quantityBonus}</span>
      </div>
    </div>
  `;
}

function renderGarageMissionList(stats) {
  const activeVehicle = getActiveGarageVehicle();
  const limitState = getGarageRunLimitState();
  return harborGarageMissionDefs.map((mission) => {
    const requiredVehicle = getGarageVehicleById(mission.vehicleId);
    const hasRequiredVehicle = activeVehicle.id === requiredVehicle.id;
    const canRun = hasRequiredVehicle && limitState.remaining > 0;
    const missionStats = {
      ...stats,
      speed: requiredVehicle.speed,
      stealth: requiredVehicle.stealth,
      load: requiredVehicle.load,
    };
    const runConfig = getGarageMissionRunConfig(mission, missionStats, requiredVehicle);
    const rewardText = `+${runConfig.rewardMoney} $, +${runConfig.rewardXp} XP, rakomany: ${formatCargoList(runConfig.cargoReward)}`;
    return `
      <article class="harbor-garage-mission${canRun ? "" : " is-locked"}">
        <span>${escapeHtml(requiredVehicle.title)} kell</span>
        <strong>${escapeHtml(mission.title)}</strong>
        <small>${escapeHtml(mission.description)}</small>
        <div class="harbor-garage-mission__meta">
          <em>${runConfig.requiredHits}/${runConfig.totalRounds} tiszta atjutas</em>
          <em>Muhely bonusz: +${stats.quantityBonus} mennyiseg minden jutalomra</em>
          <em>${escapeHtml(rewardText)}</em>
        </div>
        <button type="button" data-garage-mission="${mission.id}" ${canRun ? "" : "disabled"}>
          ${limitState.remaining <= 0 ? `Limit elerve (${formatCountdown(limitState.resetIn)})` : canRun ? "Mini-jatek inditasa" : `${requiredVehicle.title} kell`}
        </button>
      </article>
    `;
  }).join("");
}

function renderGarageVehicleList() {
  return harborGarageVehicleDefs.map((vehicle) => {
    const unlocked = state.harborGarage.unlockedVehicleIds.includes(vehicle.id);
    const active = state.harborGarage.activeVehicleId === vehicle.id;
    const levelLocked = state.harborGarage.level < vehicle.requiredLevel;
    let buttonLabel = active ? "Aktiv" : (unlocked ? "Hasznalom" : `${vehicle.cost} $`);
    if (levelLocked && !unlocked) buttonLabel = `${vehicle.requiredLevel}. szint kell`;
    return `
      <article class="harbor-garage-vehicle${active ? " is-active" : ""}${unlocked ? "" : " is-locked"}">
        <img class="harbor-garage-vehicle__image" src="${escapeHtml(vehicle.image || "./garage-assets/sedan-1930.webp")}" alt="${escapeHtml(vehicle.title)}">
        <span>${escapeHtml(vehicle.accent)}</span>
        <strong>${escapeHtml(vehicle.title)}</strong>
        <small>${escapeHtml(vehicle.description)}</small>
        <small>${escapeHtml(vehicle.lootText || "")}</small>
        <small>Seb. ${vehicle.speed} | Rejt. ${vehicle.stealth} | Teher ${vehicle.load} | Muhely: csak mennyiseg bonusz</small>
        <button type="button" data-garage-vehicle="${vehicle.id}" ${active || levelLocked ? "disabled" : ""}>${escapeHtml(buttonLabel)}</button>
      </article>
    `;
  }).join("");
}

function bindHarborGarageControls(zone) {
  if (!harborOperationPanel) return;
  harborOperationPanel.querySelectorAll("[data-garage-vehicle]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (await activateGarageVehicle(button.dataset.garageVehicle)) {
        renderHarborGarage(zone);
      }
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-upgrade]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (await upgradeHarborGarage()) {
        renderHarborGarage(zone);
      }
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-mission]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await startGarageMission(button.dataset.garageMission);
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-hit]").forEach((control) => {
    const submitCheckpoint = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const gameState = garageMiniGameState;
      if (!gameState || gameState.inputLocked) return;
      syncGarageNeedleFromDom(gameState);
      gameState.lockedPointer = gameState.pointer;
      gameState.inputLocked = true;
      stopGarageMiniGame(false);
      harborOperationPanel.querySelectorAll("[data-garage-hit]").forEach((entry) => {
        entry.setAttribute("aria-disabled", "true");
        if (entry instanceof HTMLButtonElement) entry.disabled = true;
      });
      await resolveGarageCheckpoint(gameState.lockedPointer);
    };
    control.addEventListener("pointerdown", submitCheckpoint);
    control.addEventListener("click", (event) => {
      if (event.detail === 0) submitCheckpoint(event);
      else {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    control.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !(control instanceof HTMLButtonElement)) submitCheckpoint(event);
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-abort]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const actionId = garageMiniGameState?.serverActionId;
      if (actionId) {
        try { await requestServerGarage({ operation: "abort", actionId }); } catch (error) { sceneRef?.setMessage(error.message); return; }
      }
      stopGarageMiniGame(true);
      renderHarborGarage(zone);
      sceneRef?.setMessage("A fuvar megszakadt, visszafordultal a garazsba.");
    });
  });
}

function renderGarageMiniGame(zone, mission) {
  const vehicle = getActiveGarageVehicle();
  const stats = getHarborGarageStats();
  const gameState = garageMiniGameState;
  const checkpointLabel = `${Math.min(gameState.round, gameState.totalRounds)}/${gameState.totalRounds}`;
  const penaltyPercent = Math.round((1 - getGarageMissPenaltyFactor(gameState.misses)) * 100);
  setHarborPanelContent(zone, `
    <section class="harbor-garage">
      ${getHarborGarageSceneHtml(vehicle, stats)}
      <div class="harbor-operation-panel__stats">
        <div><span>Mission</span><strong>${escapeHtml(mission.title)}</strong></div>
        <div><span>Tiszta pont</span><strong>${gameState.hits}/${gameState.requiredHits}</strong></div>
        <div><span>Ellenorzes</span><strong>${checkpointLabel}</strong></div>
        <div><span>Felrenyomas</span><strong>${gameState.misses}</strong></div>
      </div>
      <div class="garage-minigame">
        <p class="harbor-operation-panel__muted">Akkor nyomj ra, amikor a jelolo a zold savban van. Minden kattintas utan szukul a zold sav, a felrenyomas pedig csokkenti a jutalmat.</p>
        <div class="garage-minigame__meter" data-garage-hit role="button" tabindex="0" aria-label="Átcsúszás időzítése">
          <div class="garage-minigame__safe-zone" style="left:${(gameState.safeCenter - gameState.safeWidth / 2) * 100}%; width:${gameState.safeWidth * 100}%"></div>
          <div class="garage-minigame__needle" style="left:${gameState.pointer * 100}%"></div>
        </div>
        <div class="garage-minigame__status">
          <strong>${escapeHtml(gameState.statusText)}</strong>
          <span>${escapeHtml(gameState.logText)}${penaltyPercent > 0 ? ` Jutalomlevonas: ${penaltyPercent}%.` : ""}</span>
        </div>
        <div class="garage-minigame__actions">
          <button type="button" data-garage-hit${gameState.inputLocked ? " disabled" : ""}>Atcsuszas</button>
        </div>
      </div>
    </section>
  `);
  bindHarborGarageControls(zone);
  startGarageMiniGameLoop();
}

function finishGarageMissionFromServer(result = {}) {
  const gameState = garageMiniGameState;
  if (!gameState) return false;
  const mission = getGarageMissionById(gameState.missionId);
  const zone = harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." };
  stopGarageMiniGame(true);
  if (!mission) {
    renderHarborGarage(zone);
    return false;
  }
  if (result.success) {
    const finalRewardMoney = Math.max(0, Math.round(Number(result.moneyGain) || 0));
    const finalRewardXp = Math.max(0, Math.round(Number(result.xpGain) || 0));
    const finalCargoReward = result.cargo || {};
    sceneRef?.pushLog(`${mission.title} sikeres auto-csempeszet volt. +${finalRewardMoney} $, +${finalRewardXp} XP, +${result.influenceGain || 0}% befolyas, felrenyomas: ${gameState.misses}.`);
    sceneRef?.setMessage(`${mission.title} sikerult. A jutalmat a szerver kiosztotta.`);
    queueRewardModal({
      title: "Auto csempeszet sikeres",
      text: `${mission.title} lefutott. Felrenyomas: ${gameState.misses}. Zsakmany: ${formatCargoList(finalCargoReward)}.`,
      money: finalRewardMoney,
      xp: finalRewardXp,
      fame: finalRewardXp,
    });
    addLocalNotification(
      "Feladat vege",
      `${mission.title} sikerult. Felrenyomas: ${gameState.misses}. Jutalom: +${finalRewardMoney} $, +${finalRewardXp} XP, rakomany: ${formatCargoList(finalCargoReward)}.`,
      { messageType: "event" },
    );
  } else {
    const penalty = Math.max(0, Math.round(Number(result.penalty) || 0));
    sceneRef?.pushLog(`${mission.title} megbukott. -${penalty} $${result.penaltyReductionPercent ? ` (${result.penaltyReductionPercent}% befolyasvedelem)` : ""}.`);
    sceneRef?.setMessage("A csempeszut balul sult el, a rendorseg rajtad maradt.");
    queueRewardModal({
      title: "Auto csempeszet elbukott",
      text: mission.title,
      money: -penalty,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    addLocalNotification(
      "Feladat vege",
      `${mission.title} elbukott. Veszteseg: -${penalty} $.`,
      { messageType: "event" },
    );
  }
  sceneRef?.refreshHUD();
  renderHarborGarage(zone);
  return Boolean(result.success);
}

function applyServerGarageAction(action = {}) {
  garageMiniGameState = {
    missionId: action.missionId,
    serverActionId: action.actionId,
    round: action.round,
    hits: action.hits,
    misses: action.misses,
    attempts: action.attempts,
    totalRounds: action.totalRounds,
    requiredHits: action.requiredHits,
    rewardMoney: action.rewardMoney,
    rewardXp: action.rewardXp,
    cargoReward: action.cargo || {},
    direction: action.direction || 1,
    pointer: action.direction === -1 ? 0.92 : 0.08,
    safeCenter: action.safeCenter,
    baseSafeWidth: action.baseSafeWidth,
    safeWidth: action.safeWidth,
    baseSpeed: action.baseSpeed,
    speed: action.speed,
    statusText: action.attempts ? "Kovetkezo ellenorzes" : "Motorok indulnak",
    logText: "Vidd at a jelolot a zold savon a megfelelo pillanatban.",
    inputLocked: false,
    lockedPointer: null,
  };
}

async function resolveGarageCheckpoint(capturedPointer = null) {
  const gameState = garageMiniGameState;
  const mission = gameState ? getGarageMissionById(gameState.missionId) : null;
  if (!gameState || !mission) return false;
  const needle = harborOperationPanel?.querySelector(".garage-minigame__needle");
  const visualPointer = needle ? clamp(parseFloat(needle.style.left) / 100, 0, 1) : gameState.pointer;
  const pointer = Number.isFinite(Number(capturedPointer)) ? clamp(Number(capturedPointer), 0, 1) : visualPointer;
  try {
    const data = await requestServerGarage({ operation: "checkpoint", actionId: gameState.serverActionId, pointer });
    if (data.action?.status === "completed") return finishGarageMissionFromServer(data.result || data.action.result || {});
    const hit = Boolean(data.result?.hit);
    applyServerGarageAction(data.action);
    garageMiniGameState.statusText = hit ? "Tiszta atjutas" : "Tul kozel voltal";
    garageMiniGameState.logText = hit ? "A rendorseg nem vette eszre a valtast." : "A konvoj megakadt, ez levon a jutalombol.";
    renderGarageMiniGame(harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs" }, mission);
    return hit;
  } catch (error) {
    if (garageMiniGameState) {
      garageMiniGameState.inputLocked = false;
      garageMiniGameState.lockedPointer = null;
      startGarageMiniGameLoop();
      harborOperationPanel?.querySelectorAll("[data-garage-hit]").forEach((entry) => {
        entry.removeAttribute("aria-disabled");
        if (entry instanceof HTMLButtonElement) entry.disabled = false;
      });
    }
    sceneRef?.setMessage(error.message);
    return false;
  }
}

async function startGarageMission(missionId) {
  const mission = getGarageMissionById(missionId);
  if (!mission) return false;
  try {
    const data = await requestServerGarage({ operation: "start", missionId });
    applyServerGarageAction(data.action);
    renderGarageMiniGame(harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs" }, mission);
    sceneRef?.setMessage(`${mission.title} elindult. A szerver rogzitette a fuvart.`);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message);
    return false;
  }
}

function renderHarborGarage(zone) {
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  const vehicle = getActiveGarageVehicle();
  const stats = getHarborGarageStats();
  const upgradeCost = getHarborGarageUpgradeCost();
  const limitState = getGarageRunLimitState();
  if (garageMiniGameState) {
    const mission = getGarageMissionById(garageMiniGameState.missionId);
    if (mission) {
      renderGarageMiniGame(zone, mission);
      return;
    }
  }
  setHarborPanelContent(zone, `
    <section class="harbor-garage">
      ${getHarborGarageSceneHtml(vehicle, stats)}
      <div class="harbor-operation-panel__stats">
        <div><span>Muhely</span><strong>${state.harborGarage.level}. szint</strong></div>
        <div><span>Sikeres utak</span><strong>${state.harborGarage.wins}</strong></div>
        <div><span>Bukott utak</span><strong>${state.harborGarage.losses}</strong></div>
        <div><span>12 oras fuvarlimit</span><strong>${limitState.remaining} / ${GARAGE_RUN_LIMIT} maradt${limitState.remaining <= 0 ? ` (${formatCountdown(limitState.resetIn)})` : ""}</strong></div>
      </div>
      <div class="harbor-garage-workshop">
        <div>
          <span>Muhely fejlesztes</span>
          <strong>${state.harborGarage.level >= 3 ? "A garazs teljesen ki van epitve." : `Kovetkezo fejlesztes: ${upgradeCost} $`}</strong>
          <small>A muhely nem nyit uj fuvar tipust, csak a jutalmak mennyiseget noveli: jelenleg +${stats.quantityBonus}.</small>
        </div>
        <button type="button" data-garage-upgrade ${state.harborGarage.level >= 3 ? "disabled" : ""}>${state.harborGarage.level >= 3 ? "Max" : "Muhely fejlesztese"}</button>
      </div>
      <div class="harbor-garage-grid">
        <section class="harbor-garage-section">
          <header><span>Autok</span><strong>Aktiv menekulojarmuvek</strong></header>
          <div class="harbor-garage-vehicles">${renderGarageVehicleList()}</div>
        </section>
        <section class="harbor-garage-section">
          <header><span>Fuvarok</span><strong>Auto-csempesz mini-jatekok</strong></header>
          <div class="harbor-garage-missions">${renderGarageMissionList(stats)}</div>
        </section>
      </div>
    </section>
  `);
  bindHarborGarageControls(zone);
}

function renderHarborZonePanel(zone) {
  if (zone.id !== "garage") stopGarageMiniGame(true);
  if (zone.id === "bar") return renderHarborBar(zone);
  if (zone.id === "warehouse") return renderHarborWarehouse(zone);
  if (zone.id === "office") return renderHarborOffice(zone);
  if (zone.id === "market") return openHarborMarket(zone);
  if (zone.id === "garage") return renderHarborGarage(zone);
  if (zone.id === "customs") return renderHarborCustoms(zone);
  if (["docks", "rail", "fish"].includes(zone.id)) return renderHarborOrders(zone, zone.id === "fish" ? "fish" : "mixed");
  setHarborPanelContent(zone, `
    <section class="harbor-place">
      <p class="harbor-operation-panel__muted">${escapeHtml(zone.note)}</p>
      <div class="harbor-garage-card">
        <strong>Megnyitva</strong>
        <span>Ez a terulet mar kattinthato, a reszletes funkcio kovetkezo korben finomithato.</span>
      </div>
    </section>
  `);
}

async function startHarborMission(missionId) {
  const mission = [...harborMissionCatalog, ...harborFishMissionDefs].find((entry) => entry.id === missionId);
  if (!mission) return false;
  try {
    await requestServerHarbor({ operation: "start", missionId: mission.id });
    sceneRef?.setMessage(`${mission.title} elindult. A jutalmat lejáratkor a szerver osztja ki.`);
    sceneRef?.pushLog(`Kikoto: ${mission.title} elindult (${formatCountdown(mission.durationMs)}).`);
    renderProcessTasks();
    renderHarborZonePanel(harborZoneDefs.find((zone) => zone.id === mission.zone) || harborZoneDefs[0]);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message);
    return false;
  }
}

async function handleHarborPanelClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const officeTabButton = event.target.closest("[data-harbor-office-tab], [data-harbor-office-tab-target]");
  if (officeTabButton) {
    renderHarborOffice(
      harborZoneDefs.find((zone) => zone.id === "office") || { id: "office", title: "Kikötői iroda" },
      officeTabButton.dataset.harborOfficeTab || officeTabButton.dataset.harborOfficeTabTarget,
    );
    return;
  }
  const officeZoneButton = event.target.closest("[data-harbor-office-zone]");
  if (officeZoneButton) {
    const targetZone = harborZoneDefs.find((zone) => zone.id === officeZoneButton.dataset.harborOfficeZone);
    if (targetZone) renderHarborZonePanel(targetZone);
    return;
  }
  const garageHitButton = event.target.closest("[data-garage-hit]");
  if (garageHitButton) {
    await resolveGarageCheckpoint();
    return;
  }
  const garageVehicleButton = event.target.closest("[data-garage-vehicle]");
  if (garageVehicleButton) {
    if (await activateGarageVehicle(garageVehicleButton.dataset.garageVehicle)) {
      renderHarborGarage(harborZoneDefs.find((zone) => zone.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." });
    }
    return;
  }
  const garageUpgradeButton = event.target.closest("[data-garage-upgrade]");
  if (garageUpgradeButton) {
    if (await upgradeHarborGarage()) {
      renderHarborGarage(harborZoneDefs.find((zone) => zone.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." });
    }
    return;
  }
  const garageMissionButton = event.target.closest("[data-garage-mission]");
  if (garageMissionButton) {
    await startGarageMission(garageMissionButton.dataset.garageMission);
    return;
  }
  const missionButton = event.target.closest("[data-harbor-mission]");
  if (missionButton) {
    await startHarborMission(missionButton.dataset.harborMission);
    return;
  }
  const railSelection = event.target.closest("[data-rail-select]");
  if (railSelection) {
    selectedHarborRailMissionId = railSelection.dataset.railSelect;
    renderHarborOrders(harborZoneDefs.find((zone) => zone.id === "rail") || { id: "rail", title: "Vasúti rakodó" });
    return;
  }
  const customsSelection = event.target.closest("[data-customs-select]");
  if (customsSelection) {
    selectedHarborCustomsMissionId = customsSelection.dataset.customsSelect;
    renderHarborCustoms(harborZoneDefs.find((zone) => zone.id === "customs") || { id: "customs", title: "Vám" });
    return;
  }

  const buyButton = event.target.closest("[data-harbor-buy]");
  if (buyButton) {
    const kind = buyButton.dataset.harborBuy;
    try {
      const response = await requestServerHarbor({ operation: "bar", kind });
      const result = response.result || {};
      sceneRef?.refreshHUD();
      renderHarborBar(harborZoneDefs.find((entry) => entry.id === "bar") || { id: "bar", title: "Kocsma" });
      sceneRef?.setMessage(kind === "health"
        ? `Az ital visszahozott egy kis eletet. Meg ${result.remaining ?? 0} hasznalat maradt.`
        : `A fekete kave felrazta a bandat. Meg ${result.remaining ?? 0} hasznalat maradt.`);
    } catch (error) {
      sceneRef?.setMessage(error.message || "A kocsmai vasarlas sikertelen.");
    }
    return;
  }
  const bribeButton = event.target.closest("[data-harbor-bribe]");
  if (bribeButton) {
    const large = bribeButton.dataset.harborBribe === "large";
    try {
      const response = await requestServerHarbor({ operation: "bribe", size: large ? "large" : "small" });
      const result = response.result || {};
      sceneRef?.refreshHUD();
      renderHarborOffice(harborZoneDefs.find((zone) => zone.id === "office") || { title: "Kikotoi iroda" });
      const discountText = result.discountPercent ? ` (${result.discountPercent}% befolyas kedvezmeny)` : "";
      sceneRef?.pushLog(`Kikotoi lefizetes: -${result.cost || 0} $${discountText}, -${result.heatLoss || 0}% korozes.`);
      sceneRef?.setMessage(`A boritek celba ert. Korozes -${result.heatLoss || 0}%.`);
    } catch (error) {
      sceneRef?.setMessage(error.message || "A lefizetes nem sikerult.");
    }
  }
}

function renderHarborMapZones() {
  if (!harborMapZones) return;
  harborMapZones.replaceChildren();
  harborZoneDefs.forEach((zone) => {
    const wrapper = document.createElement("div");
    wrapper.className = "harbor-map-zone";
    wrapper.style.left = `${zone.x}%`;
    wrapper.style.top = `${zone.y}%`;
    wrapper.style.width = `${zone.w}%`;
    wrapper.style.height = `${zone.h}%`;
    if (zone.clip) wrapper.style.setProperty("--harbor-clip-path", zone.clip);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "harbor-map-zone__hit";
    button.dataset.harborZone = zone.id;
    button.setAttribute("aria-label", zone.title);
    const label = document.createElement("span");
    label.className = `harbor-map-zone__label${zone.title.length > 12 ? " harbor-map-zone__label--long" : ""}`;
    label.textContent = zone.title;
    const note = document.createElement("span");
    note.className = "harbor-map-zone__note";
    note.textContent = zone.note;
    wrapper.append(button, label, note);
    harborMapZones.appendChild(wrapper);
  });
}

function showHarborMapView() {
  if (!state.registered || !harborMapView) return;
  if (!canEnterHarbor()) {
    const requiredLevel = getHarborRequiredLevel();
    sceneRef?.setMessage(`A kikoto negyed az ${requiredLevel}. szinttol erheto el.`);
    if (hudQuickDockLabel) hudQuickDockLabel.textContent = `${requiredLevel}. szint`;
    return;
  }
  hideAuxPanel();
  hideQuestCard();
  hideChoiceWheel();
  hideLotInfoModal();
  hideCharacterPanel();
  hideHarborOperationPanel();
  document.body.classList.add("is-harbor-map-open");
  document.getElementById("gameRoot")?.classList.add("is-hidden-by-harbor");
  harborMapView.classList.remove("hidden");
  harborMapView.setAttribute("aria-hidden", "false");
  hudMainMapButton?.classList.remove("hidden");
  hudMainMapButton?.setAttribute("aria-hidden", "false");
  if (hudQuickDockLabel) hudQuickDockLabel.textContent = "";
  renderHarborMapZones();
  state.mentorFlags.enteredHarbor = true;
  completeMentorStep("harbor");
  sceneRef?.setMessage("Kikoto negyed megnyitva.");
}

function hideHarborMapView() {
  stopGarageMiniGame(true);
  hideQuestCard();
  hideHarborOperationPanel();
  hideAuxPanel();
  hideMessagesDialog();
  hidePublicProfileDialog();
  hideCharacterPanel();
  hideCrewMemberPanel();
  harborMapView?.classList.add("hidden");
  harborMapView?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-harbor-map-open");
  document.getElementById("gameRoot")?.classList.remove("is-hidden-by-harbor");
  hudMainMapButton?.classList.add("hidden");
  hudMainMapButton?.setAttribute("aria-hidden", "true");
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Vissza a varosba.");
}

function applyHarborTaskReward(payload = {}) {
  const successChance = Number.isFinite(Number(payload.successChance)) ? Number(payload.successChance) : 0.88;
  const success = Math.random() <= successChance;
  if (!success) {
    const fine = Math.min(state.money, Math.max(12, Math.round(Number(payload.rewardMoney || 0) * 0.18)));
    state.money = Math.max(0, state.money - fine);
    applyHeat(1);
    sceneRef?.pushLog(`${payload.title || "Kikotoi munka"} elbukott. -${fine} $ buntetes.`);
    sceneRef?.setMessage("A kikotoi munka balul sult el. Az aru elveszett, es buntetest fizettel.");
    addLocalNotification(
      "Feladat vege",
      `${payload.title || "Kikotoi munka"} nem sikerult. Buntetes: -${fine} $.`,
      { messageType: "event" },
    );
    return;
  }
  addCargo(payload.gives);
  state.money += Math.max(0, Math.round(Number(payload.rewardMoney) || 0));
  applyFame(Math.max(0, Math.round(Number(payload.rewardXp) || 0)));
  state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0) + Math.max(1, Math.round((Number(payload.rewardXp) || 0) / 5)));
  if (payload.heal) state.health = clamp(state.health + Number(payload.heal), 0, 100);
  if (payload.energy) state.energy = clamp(state.energy + Number(payload.energy), 0, 100);
  sceneRef?.pushLog(`${payload.title || "Kikotoi munka"} kesz. +${payload.rewardMoney || 0} $, +${payload.rewardXp || 0} XP.`);
  sceneRef?.setMessage(`${payload.title || "Kikotoi munka"} sikerult. A jutalom bekerult a kasszaba.`);
  queueRewardModal({
    title: "Feladat vege",
    text: `${payload.title || "Kikotoi munka"} befejezodott.`,
    money: payload.rewardMoney || 0,
    xp: payload.rewardXp || 0,
    fame: payload.rewardXp || 0,
  });
  addLocalNotification(
    "Feladat vege",
    `${payload.title || "Kikotoi munka"} befejezodott. Jutalom: +${payload.rewardMoney || 0} $, +${payload.rewardXp || 0} XP.`,
    { messageType: "event" },
  );
}

let lastServerHarborSyncAt = 0;
let serverHarborSyncInFlight = false;

function showCompletedHarborResult(result = {}) {
  if (result.success) {
    const recoveryText = result.heal || result.energy
      ? `, +${result.heal || 0}% elet, +${result.energy || 0}% energia`
      : "";
    sceneRef?.pushLog(`${result.title || "Kikotoi munka"} kesz. +${result.moneyGain || 0} $, +${result.xpGain || 0} XP${recoveryText}, +${result.influenceGain || 0}% befolyas.`);
    sceneRef?.setMessage(`${result.title || "Kikotoi munka"} sikerult. A szerver kiosztotta a jutalmat.`);
    queueRewardModal({
      title: "Feladat vege",
      text: `${result.title || "Kikotoi munka"} befejezodott.${recoveryText ? ` Feltoltes:${recoveryText}.` : ""}`,
      money: result.moneyGain || 0,
      xp: result.xpGain || 0,
      fame: result.xpGain || 0,
    });
  } else {
    sceneRef?.pushLog(`${result.title || "Kikotoi munka"} elbukott. -${result.fine || 0} $ buntetes${result.penaltyReductionPercent ? ` (${result.penaltyReductionPercent}% befolyasvedelem)` : ""}.`);
    sceneRef?.setMessage("A kikotoi munka balul sult el.");
    queueRewardModal({ title: "Feladat vege", text: `${result.title || "Kikotoi munka"} nem sikerult.`, money: -(result.fine || 0), xp: 0, fame: 0, showZeroValues: true });
  }
}

async function syncServerHarborTasksIfNeeded(force = false) {
  if (!state.registered || serverHarborSyncInFlight) return false;
  const now = Date.now();
  if (!force && now - lastServerHarborSyncAt < 5000) return false;
  serverHarborSyncInFlight = true;
  lastServerHarborSyncAt = now;
  try {
    const data = await requestServerHarbor({ operation: "sync" });
    (data.completed || []).forEach(showCompletedHarborResult);
    sceneRef?.refreshHUD();
    renderProcessTasks();
    return true;
  } catch {
    return false;
  } finally {
    serverHarborSyncInFlight = false;
  }
}

async function requestServerHarbor(payload = {}) {
  const response = await fetch("/api/actions/harbor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "A szerver nem tudta vegrehajtani a kikotoi muveletet.");
  markServerMutation(response, data);
  applyServerRobberyState(data.state || {});
  return data;
}

async function requestServerGarage(payload = {}) {
  const response = await fetch("/api/actions/garage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "A szerver nem tudta vegrehajtani a garazsmuveletet.");
  markServerMutation(response, data);
  applyServerRobberyState(data.state || {});
  return data;
}
