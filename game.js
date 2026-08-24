const STORAGE_KEY = "maffia.birodalom.save.phaser.v3";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY, "maffia.birodalom.save.phaser.v2", "maffia.birodalom.save.phaser.v1"];
const LAST_PROFILE_KEY = "maffia.birodalom.lastProfile";
const SAVE_API_BASE = "/api/saves/current";
const PROFILE_API_BASE = "/api/profile/current";
const GAME_CONFIG_API = "/api/game-config";
const SERVER_STATE_SYNC_INTERVAL_MS = 8_000;
const PROTECTION_COOLDOWN_MS = 3 * 60 * 1000;
const RECOVERY_DURATION_MS = 20 * 60 * 1000;
const RECOVERY_AMOUNT = 50;
const NATURAL_RECOVERY_FULL_MS = 12 * 60 * 60 * 1000;
const NATURAL_RECOVERY_POINT_MS = NATURAL_RECOVERY_FULL_MS / 100;
const BUILDING_DIFFICULTY_CYCLE_MS = 4 * 60 * 60 * 1000;
const MIN_DANGER_BUILDINGS = 2;
const MIN_RISK_BUILDINGS = 3;
const BASE_REST_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const RECOVERY_USAGE_LIMIT = 3;
const RECOVERY_USAGE_RESET_MS = 3 * 60 * 60 * 1000;
const PROTECTION_REWARD_DELAY_MS = 3 * 60 * 1000;
const MAX_PROCESS_TASKS = 3;
const MAX_LOCAL_NOTIFICATIONS = 40;
const EARLY_GAME_WINDOW_MS = 30 * 60 * 1000;
const HEAT_GAIN_MULTIPLIER = 0.46;
const RIVAL_SPAWN_MIN_MS = 3 * 60 * 60 * 1000;
const RIVAL_SPAWN_MAX_MS = 5 * 60 * 60 * 1000;
const RIVAL_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;
const RIVAL_ACTION_DURATION_MS = 5 * 60 * 1000;
const WORLD_RIVAL_CITY_TRIBUTE_MS = 4 * 60 * 60 * 1000;
const WORLD_RIVAL_CITY_PROTECTION_MS = 48 * 60 * 60 * 1000;
const WORLD_RIVAL_STRUCTURE_REPAIR_MS = 35 * 60 * 1000;
const WORLD_RIVAL_ATTACK_FAILURE_COOLDOWN_MS = 15 * 60 * 1000;
const WORLD_RIVAL_CITY_BASE_COUNT = 30;
const WORLD_RIVAL_CITY_MAX_COUNT = 60;
const WORLD_RIVAL_CITY_NEAR_BASE_COUNT = 5;
const MARKET_REFRESH_MS = 6 * 60 * 60 * 1000;
const EQUIPMENT_CATALOG_VERSION = "equipment-catalog-21-per-slot-v3-market-8";
const MARKET_MAX_OFFERS = 8;
const GARAGE_RUN_WINDOW_MS = 12 * 60 * 60 * 1000;
const GARAGE_RUN_LIMIT = 4;
const HARBOR_BAR_USE_LIMIT = 3;
const HARBOR_BAR_USAGE_RESET_MS = 3 * 60 * 60 * 1000;
const districtDefs = [
  {
    id: "center",
    name: "Belvaros",
    kind: "Kozpont",
    description: "Suru utcazat, regi hazak es a varos szive.",
    value: 3,
    security: 55,
    gridX: 4.3,
    gridY: 4.2,
    palette: { main: "building-type-u", small: "building-type-c", side: "building-type-d" },
  },
  {
    id: "market",
    name: "Piac ter",
    kind: "Kereskedelem",
    description: "Uzletek, kirakatok es forgalmas sarkok.",
    value: 3,
    security: 48,
    gridX: 5.7,
    gridY: 2.0,
    palette: { main: "building-type-b", small: "building-type-a", side: "building-type-c" },
  },
  {
    id: "harbor",
    name: "Kikoto",
    kind: "Logisztika",
    description: "Rakparti raktar, teherautok es mozgas.",
    value: 4,
    security: 62,
    gridX: 7.9,
    gridY: 2.8,
    palette: { main: "building-type-o", small: "building-type-l", side: "building-type-n" },
  },
  {
    id: "industrial",
    name: "Gyarnegyed",
    kind: "Ipari zona",
    description: "Regi csarnokok, olcso celpontok es sok feny.",
    value: 2,
    security: 40,
    gridX: 1.9,
    gridY: 6.8,
    palette: { main: "building-type-r", small: "building-type-q", side: "building-type-s" },
  },
  {
    id: "luxury",
    name: "Villanegyed",
    kind: "Premium",
    description: "Elegans hazak, nagy penz, nagy kockazat.",
    value: 5,
    security: 72,
    gridX: 8.1,
    gridY: 5.2,
    palette: { main: "building-type-n", small: "building-type-m", side: "building-type-l" },
  },
  {
    id: "suburb",
    name: "Peremkerulet",
    kind: "Lakoovezet",
    description: "Kisebb hazak, kertek es konnyebb terjeszkedes.",
    value: 2,
    security: 36,
    gridX: 7.0,
    gridY: 7.8,
    palette: { main: "building-type-a", small: "building-type-b", side: "building-type-c" },
  },
];

const rankNames = [
  "Kezdo gengszter", "Utcai ember", "Kisfiu", "Sarokfonok", "Behajto",
  "Utcai fonok", "Raktarvezeto", "Keruleti ember", "Keruletvezeto", "Befolyasos figura",
  "Varosi kapcsolat", "Csaladi megbizott", "Maffia hadnagy", "Alvezeto", "Maffia kozepvezeto",
  "Kereskedelmi fonok", "Kikoto ura", "Varosi arnyek", "Csaladi tanacsado", "Birodalmi ember",
  "Sotet patronus", "Varosresz ura", "Maffia kapitany", "Csaladi jobbkez", "Szervezeti fonok",
  "Birodalmi fonok", "Nagyfonok", "Don helyettese", "Don", "Maffia legenda",
];

const earlyRankThresholds = [0, 10, 24, 42, 68, 100];
const rankTable = rankNames.map((name, index) => ({
  fame: earlyRankThresholds[index] ?? Math.round(100 + ((index - 5) * (index - 5) * 34)),
  name,
}));

// A vilagterkep rendszere a js/world-map.js modulban talalhato.

const equipmentSlotOrder = ["hat", "shirt", "pants", "weapon", "shoes", "watch"];
const equipmentSlotDefs = {
  hat: { label: "Kalap", stat: "defense", bonus: "Vedelem" },
  shirt: { label: "Ing", stat: "defense", bonus: "Vedelem" },
  pants: { label: "Nadrag", stat: "defense", bonus: "Vedelem" },
  weapon: { label: "Fegyver", stat: "attack", bonus: "Tamadas" },
  shoes: { label: "Cipo", stat: "attack", bonus: "Tamadas" },
  watch: { label: "Ora", stat: "attack", bonus: "Tamadas" },
};
const equipmentArtBySlot = {
  hat: "./assets/items/item-hat-gray.png",
  shirt: "./assets/items/item-shirt-gray.png",
  pants: "./assets/items/item-pants-gray.png",
  weapon: "./assets/items/item-weapon-gray.png",
  shoes: "./assets/items/item-shoes-gray.png",
  watch: "./assets/items/item-watch-gray.png",
};

function getEquipmentArt(slot) {
  return equipmentArtBySlot[slot] || equipmentArtBySlot.weapon;
}

function getEquipmentRarityImage(slot, rarity = "gray") {
  const normalizedRarity = ["gray", "yellow", "red"].includes(rarity) ? rarity : "gray";
  return `./assets/items/item-${slot}-${normalizedRarity}.png`;
}

const fallbackEquipmentCatalog = {
  hat: [
    { id: "hat-fedora-black", name: "Fekete fedora", power: 1, stat: "defense", rarity: "gray", image: getEquipmentRarityImage("hat", "gray") },
    { id: "hat-silk-band", name: "Selyemszalagos kalap", power: 3, stat: "defense", rarity: "yellow", image: getEquipmentRarityImage("hat", "yellow") },
    { id: "hat-don-fedora", name: "Don fedora", power: 5, stat: "defense", rarity: "red", image: getEquipmentRarityImage("hat", "red") },
  ],
  shirt: [
    { id: "shirt-white", name: "Feher ing", power: 2, stat: "defense", rarity: "gray", image: getEquipmentRarityImage("shirt", "gray") },
    { id: "shirt-silk", name: "Selyeming", power: 4, stat: "defense", rarity: "yellow", image: getEquipmentRarityImage("shirt", "yellow") },
    { id: "shirt-tailored", name: "Szabott ing", power: 6, stat: "defense", rarity: "red", image: getEquipmentRarityImage("shirt", "red") },
  ],
  pants: [
    { id: "pants-black", name: "Fekete szovet", power: 2, stat: "defense", rarity: "gray", image: getEquipmentRarityImage("pants", "gray") },
    { id: "pants-pressed", name: "Eltett nadrag", power: 3, stat: "defense", rarity: "yellow", image: getEquipmentRarityImage("pants", "yellow") },
    { id: "pants-don", name: "Fonoki nadrag", power: 5, stat: "defense", rarity: "red", image: getEquipmentRarityImage("pants", "red") },
  ],
  weapon: [
    { id: "weapon-colt", name: "Colt M1911", power: 4, stat: "attack", rarity: "gray", image: getEquipmentRarityImage("weapon", "gray") },
    { id: "weapon-thompson", name: "Tommy gepisztoly", power: 7, stat: "attack", rarity: "yellow", image: getEquipmentRarityImage("weapon", "yellow") },
    { id: "weapon-custom", name: "Egyedi automata", power: 10, stat: "attack", rarity: "red", image: getEquipmentRarityImage("weapon", "red") },
  ],
  shoes: [
    { id: "shoes-leather", name: "Bor felcipo", power: 1, stat: "attack", rarity: "gray", image: getEquipmentRarityImage("shoes", "gray") },
    { id: "shoes-lacquer", name: "Lakkcipo", power: 3, stat: "attack", rarity: "yellow", image: getEquipmentRarityImage("shoes", "yellow") },
    { id: "shoes-import", name: "Import borcipo", power: 5, stat: "attack", rarity: "red", image: getEquipmentRarityImage("shoes", "red") },
  ],
  watch: [
    { id: "watch-pocket", name: "Zsebora", power: 1, stat: "attack", rarity: "gray", image: getEquipmentRarityImage("watch", "gray") },
    { id: "watch-gold", name: "Arany ora", power: 2, stat: "attack", rarity: "yellow", image: getEquipmentRarityImage("watch", "yellow") },
    { id: "watch-family", name: "Csaladi kronometer", power: 4, stat: "attack", rarity: "red", image: getEquipmentRarityImage("watch", "red") },
  ],
};

function cloneEquipmentCatalog(source) {
  return Object.fromEntries(equipmentSlotOrder.map((slot) => {
    const items = Array.isArray(source?.[slot]) ? source[slot] : [];
    return [slot, items.map((item) => ({ ...item }))];
  }));
}

const equipmentCatalog = cloneEquipmentCatalog(
  typeof globalThis !== "undefined" && globalThis.MAFFIA_EQUIPMENT_CATALOG
    ? globalThis.MAFFIA_EQUIPMENT_CATALOG
    : fallbackEquipmentCatalog,
);

const crewMemberTemplates = [
  { id: "luca", name: "Luca Moretti", role: "Végrehajtó", baseAttack: 12, baseDefense: 9, baseHealth: 100 },
  { id: "marco", name: "Marco Bellini", role: "Fegyveres", baseAttack: 15, baseDefense: 8, baseHealth: 88 },
  { id: "enzo", name: "Enzo Romano", role: "Megfigyelő", baseAttack: 10, baseDefense: 12, baseHealth: 112 },
];
const crewPortraitAssets = {
  luca: "./assets/character/player-avatar-enforcer.webp",
  marco: "./assets/character/player-avatar-boss.webp",
  enzo: "./assets/character/gangster-character.webp",
};

function getCrewPortraitAsset(memberOrId) {
  const memberId = typeof memberOrId === "string" ? memberOrId : memberOrId?.id;
  return crewPortraitAssets[memberId] || "./assets/character/gangster-character.webp";
}
const crewHireCosts = {
  luca: 155,
  marco: 700,
  enzo: 1500,
};
const CREW_UPGRADE_COST_MULTIPLIER = 0.65;
const CREW_HEAL_COST_MULTIPLIER = 0.8;

function getCrewMaxHealth(template, level = 1, defenseLevel = 1) {
  const attackSteps = Math.max(0, Math.round(Number(level) || 1) - 1);
  const defenseSteps = Math.max(0, Math.round(Number(defenseLevel) || 1) - 1);
  const veteranBonus = Math.floor((attackSteps ** 2 + defenseSteps ** 2) / 18);
  return Math.max(1, Math.round(Number(template?.baseHealth) || 100) + attackSteps * 3 + defenseSteps * 2 + veteranBonus);
}

function makeCrewMembers() {
  return crewMemberTemplates.map((member) => ({
    ...member,
    hired: false,
    level: 1,
    defenseLevel: 1,
    attackBonus: 0,
    defenseBonus: 0,
    health: member.baseHealth,
    equipment: getEmptyEquipment(),
  }));
}

const playerAvatarDefs = [
  { id: "boss", image: "./assets/character/player-avatar-boss.webp" },
  { id: "lady", image: "./assets/character/player-avatar-lady.webp" },
  { id: "enforcer", image: "./assets/character/player-avatar-enforcer.webp" },
];
const legacyPlayerAvatarImage = "./assets/character/gangster-character.webp";

function normalizePlayerAvatarId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return playerAvatarDefs.some((avatar) => avatar.id === id) ? id : "";
}

function getPlayerAvatarImage() {
  return playerAvatarDefs.find((avatar) => avatar.id === state.avatarId)?.image || legacyPlayerAvatarImage;
}

const state = {
  profileName: "",
  avatarId: "",
  needsAvatarSelection: false,
  money: 120,
  fame: 0,
  underworldMoney: 0,
  underworldXp: 0,
  underworldLevel: 1,
  dungeonProgress: { easy: 1, medium: 1, hard: 1 },
  influence: 10,
  influenceSystemVersion: 1,
  crew: 0,
  heat: 0,
  health: 100,
  energy: 100,
  gearPower: 0,
  equipment: getDefaultEquipment(),
  itemInventory: getDefaultItemInventory(),
  crewMembers: makeCrewMembers(),
  activeCrewMemberId: null,
  mainBaseSpotId: null,
  worldBaseLotId: null,
  worldBaseLevel: 1,
  worldRivalCities: [],
  npcVillageVictories: 0,
  profileStartedAt: 0,
  needsWorldBaseSelection: false,
  territories: {},
  buildingDifficulties: {},
  buildingDifficultyCycle: null,
  marketStock: [],
  marketRefreshAt: 0,
  marketCatalogVersion: EQUIPMENT_CATALOG_VERSION,
  activeQuest: null,
  offeredQuests: [],
  activeQuests: [],
  selectedQuestSlot: 0,
  questNextSpawnAt: 0,
  questHistory: [],
  pendingProtectionRewards: [],
  processTasks: [],
  harborProcessTasks: [],
  localNotifications: [],
  smuggledGoods: { counterfeitMoney: 0, drugs: 0, weapons: 0, papers: 0 },
  smugglerFame: 0,
  harborGarage: {
    level: 1,
    wins: 0,
    losses: 0,
    activeVehicleId: "sedan",
    unlockedVehicleIds: ["sedan"],
  },
  harborBarUsage: {
    health: { uses: 0, resetAt: 0 },
    energy: { uses: 0, resetAt: 0 },
  },
  rivalEvent: null,
  rivalNextSpawnAt: 0,
  mentorStep: 0,
  mentorCompleted: false,
  mentorDismissedStep: "",
  mentorFlags: { equippedItem: false, sawWorld: false, enteredHarbor: false },
  protectionCooldowns: {},
  recoveryEffects: { health: null, energy: null },
  recoveryUsage: {
    health: { uses: 0, resetAt: 0 },
    energy: { uses: 0, resetAt: 0 },
  },
  naturalRecoveryAt: { health: Date.now(), energy: Date.now() },
  pvpNextAttackAt: 0,
  nextPolicePressureAt: 0,
  mainBaseClaimDay: 0,
  baseRestDay: 0,
  baseRestAvailableAt: 0,
  hideUsesToday: 0,
  hideUsesDay: 1,
  day: 1,
  lastDayEndedAt: 0,
  lastPassiveIncomeAt: 0,
  cityLevel: 1,
  districts: [],
  selectedDistrictIndex: 0,
  registered: false,
};

let sceneRef = null;
let pendingSaveTimer = null;
let saveRequestInFlight = null;
let latestQueuedSave = null;
let lastKnownServerUpdatedAt = 0;
let serverClockOffsetMs = 0;
let serverStateSyncTimer = null;
let serverStateSyncInFlight = false;
let pendingRewardModals = [];
let questCardQuestId = null;
let questCommandInFlight = false;
let empireCommandInFlight = false;
let recoveryCommandInFlight = false;
let activeEquipmentSlot = null;
let selectedCraftItemKeys = [];
let recentlyCraftedItemKey = "";
let mentorCardOpen = false;
let mentorDetailsOpen = false;
let mentorStepCompleting = false;
let garageMiniGameState = null;
let garageMiniGameTimer = null;
let harborMarketMode = "buy";
let selectedHarborCustomsMissionId = null;
let selectedHarborRailMissionId = null;
let pendingHarborSaleKey = "";
let harborOfficeTab = "overview";
let worldChatPollTimer = null;
let worldChatRequestInFlight = false;
const MAP_DRAG_ENABLED = false;
let mapPan = { x: 0, y: 0 };
let mapViewportResizeFrame = 0;
let mapDragState = {
  active: false,
  dragging: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  ignoreClicksUntil: 0,
};

const overlay = document.getElementById("bootOverlay");
const registerForm = document.getElementById("registerForm");
const playerNameInput = document.getElementById("playerName");
const loginPasswordInput = document.getElementById("loginPassword");
const rememberLoginInput = document.getElementById("rememberLogin");
const previewRegistrationForm = document.getElementById("previewRegistrationForm");
const registrationNameInput = document.getElementById("registrationName");
const registrationEmailInput = document.getElementById("registrationEmail");
const registrationPasswordInput = document.getElementById("registrationPassword");
const registrationPasswordAgainInput = document.getElementById("registrationPasswordAgain");
const avatarSelection = document.getElementById("avatarSelection");
const hudRoot = document.getElementById("hudRoot");
const mapBackgroundLayer = document.getElementById("mapBackgroundLayer");
const lotHouseLayer = document.getElementById("lotHouseLayer");
const mapSvgOverlay = document.getElementById("mapSvgOverlay");
const auxPanel = document.getElementById("auxPanel");
const auxPanelBackdrop = document.getElementById("auxPanelBackdrop");
const auxPanelTitle = document.getElementById("auxPanelTitle");
const auxPanelSubtitle = document.getElementById("auxPanelSubtitle");
const auxPanelHeaderTools = document.getElementById("auxPanelHeaderTools");
const auxPanelBody = document.getElementById("auxPanelBody");
const auxPanelClose = document.getElementById("auxPanelClose");
const messagesDialog = document.getElementById("messagesDialog");
const messagesDialogBackdrop = document.getElementById("messagesDialogBackdrop");
const messagesDialogTitle = document.getElementById("messagesDialogTitle");
const messagesDialogSubtitle = document.getElementById("messagesDialogSubtitle");
const messagesDialogBody = document.getElementById("messagesDialogBody");
const messagesDialogClose = document.getElementById("messagesDialogClose");
const publicProfileDialog = document.getElementById("publicProfileDialog");
const publicProfileDialogBackdrop = document.getElementById("publicProfileDialogBackdrop");
const publicProfileDialogTitle = document.getElementById("publicProfileDialogTitle");
const publicProfileDialogSubtitle = document.getElementById("publicProfileDialogSubtitle");
const publicProfileDialogBody = document.getElementById("publicProfileDialogBody");
const publicProfileDialogClose = document.getElementById("publicProfileDialogClose");
let activeWorldRivalCityProfileId = null;
let activeWorldRivalStructureId = null;
const hudAvatarCard = document.querySelector(".hud-avatar-card");
const hudMoney = document.getElementById("hudMoney");
const hudFame = document.getElementById("hudFame");
const hudInfluence = document.getElementById("hudInfluence");
const hudInfluencePill = document.getElementById("hudInfluencePill");
const hudInfluenceInfo = document.getElementById("hudInfluenceInfo");
const hudHeat = document.getElementById("hudHeat");
const hudPlayer = document.getElementById("hudPlayer");
const hudRank = document.getElementById("hudRank");
const hudAvatar = document.getElementById("hudAvatar");
const hudQuestTab1 = document.getElementById("hudQuestTab1");
const hudQuestTab2 = document.getElementById("hudQuestTab2");
const hudDistrict = document.getElementById("hudDistrict");
const hudSecurity = document.getElementById("hudSecurity");
const hudLoyalty = document.getElementById("hudLoyalty");
const hudIncome = document.getElementById("hudIncome");
const hudMessage = document.getElementById("hudMessage");
const hudQuestTitle = document.getElementById("hudQuestTitle");
const hudQuestText = document.getElementById("hudQuestText");
const hudObjective = document.getElementById("hudObjective");
const hudObjectiveOne = document.getElementById("hudObjectiveOne");
const hudObjectiveTwo = document.getElementById("hudObjectiveTwo");
const hudQuestCard = document.getElementById("hudQuestCard");
const hudQuestAction = document.getElementById("hudQuestAction");
const hudQuestClose = document.getElementById("hudQuestClose");
const hudQuestDelete = document.getElementById("hudQuestDelete");
const questOverview = document.getElementById("questOverview");
const questOverviewClose = document.getElementById("questOverviewClose");
const questOverviewList = document.getElementById("questOverviewList");
const hudMentorToggle = document.getElementById("hudMentorToggle");
const hudMentorCard = document.getElementById("hudMentorCard");
const hudMentorInfo = document.getElementById("hudMentorInfo");
const hudMentorClose = document.getElementById("hudMentorClose");
const hudMentorStepTitle = document.getElementById("hudMentorStepTitle");
const hudMentorStepText = document.getElementById("hudMentorStepText");
const hudMentorDetails = document.getElementById("hudMentorDetails");
const hudMentorStepReward = document.getElementById("hudMentorStepReward");
const hudMentorProgress = document.getElementById("hudMentorProgress");
const hudLog = document.getElementById("hudLog");
const hudChatForm = document.getElementById("hudChatForm");
const hudChatInput = document.getElementById("hudChatInput");
const hudChatStatus = document.getElementById("hudChatStatus");
const settingsDialog = document.getElementById("settingsDialog");
const settingsBackdrop = document.getElementById("settingsBackdrop");
const settingsClose = document.getElementById("settingsClose");
const settingsAnimations = document.getElementById("settingsAnimations");
const settingsFullscreen = document.getElementById("settingsFullscreen");
const settingsFullscreenState = document.getElementById("settingsFullscreenState");
const settingsLogout = document.getElementById("settingsLogout");
const helpDialog = document.getElementById("helpDialog");
const helpClose = document.getElementById("helpClose");
const hudQuickRank = document.getElementById("hudQuickRank");
const hudQuickMarket = document.getElementById("hudQuickMarket");
const hudQuickClan = document.getElementById("hudQuickClan");
const hudQuickWorld = document.getElementById("hudQuickWorld");
const hudQuickMessages = document.getElementById("hudQuickMessages");
const hudMessageBadge = document.getElementById("hudMessageBadge");
const hudProcessTasks = document.getElementById("hudProcessTasks");
const hudCrewToggle = document.getElementById("hudCrewToggle");
const hudCrewClose = document.getElementById("hudCrewClose");
const crewPanel = document.getElementById("crewPanel");
const harborMapView = document.getElementById("harborMapView");
const harborMapZones = document.getElementById("harborMapZones");
const harborOperationPanel = document.getElementById("harborOperationPanel");
const hudQuickDock = document.getElementById("hudQuickDock");
const hudQuickDockLabel = document.getElementById("hudQuickDockLabel");
const hudMainMapButton = document.getElementById("hudMainMapButton");
const hudAction1 = document.getElementById("hudAction1");
const hudAction2 = document.getElementById("hudAction2");
const hudAction3 = document.getElementById("hudAction3");
const hudAction4 = document.getElementById("hudAction4");
const hudAction5 = document.getElementById("hudAction5");
const hudAction6 = document.getElementById("hudAction6");
const hudReset = document.getElementById("hudReset");
const choiceWheel = document.getElementById("choiceWheel");
const choiceWheelBackdrop = document.getElementById("choiceWheelBackdrop");
const choiceWheelPanel = document.getElementById("choiceWheelPanel");
const choiceWheelTitle = document.getElementById("choiceWheelTitle");
const choiceWheelSubtitle = document.getElementById("choiceWheelSubtitle");
const choiceWheelCoreLabel = document.getElementById("choiceWheelCoreLabel");
const choiceWheelAction1 = document.getElementById("choiceWheelAction1");
const choiceWheelAction2 = document.getElementById("choiceWheelAction2");
const choiceWheelAction3 = document.getElementById("choiceWheelAction3");
const choiceWheelAction4 = document.getElementById("choiceWheelAction4");
const choiceWheelAction5 = document.getElementById("choiceWheelAction5");
const lotInfoModal = document.getElementById("lotInfoModal");
const lotInfoBackdrop = document.getElementById("lotInfoBackdrop");
const lotInfoTitle = document.getElementById("lotInfoTitle");
const lotInfoDescription = document.getElementById("lotInfoDescription");
const lotInfoLevel = document.getElementById("lotInfoLevel");
const lotInfoHourlyIncome = document.getElementById("lotInfoHourlyIncome");
const lotInfoDailyIncome = document.getElementById("lotInfoDailyIncome");
const lotInfoNextCost = document.getElementById("lotInfoNextCost");
const lotInfoClose = document.getElementById("lotInfoClose");
const underpassModal = document.getElementById("underpassModal");
const underpassBackdrop = document.getElementById("underpassBackdrop");
const underpassClose = document.getElementById("underpassClose");
const robberyGame = document.getElementById("robberyGame");
const robberyGameTitle = document.getElementById("robberyGameTitle");
const robberyGameSubtitle = document.getElementById("robberyGameSubtitle");
const robberyGameRetreat = document.getElementById("robberyGameRetreat");
const robberyHealthText = document.getElementById("robberyHealthText");
const robberyHealthFill = document.getElementById("robberyHealthFill");
const robberyControlText = document.getElementById("robberyControlText");
const robberyControlFill = document.getElementById("robberyControlFill");
const robberyAlertText = document.getElementById("robberyAlertText");
const robberyAlertFill = document.getElementById("robberyAlertFill");
const robberyEnemyPower = document.getElementById("robberyEnemyPower");
const robberyEnemyPowerFill = document.getElementById("robberyEnemyPowerFill");
const robberyRound = document.getElementById("robberyRound");
const robberyInstruction = document.getElementById("robberyInstruction");
const robberyLoot = document.getElementById("robberyLoot");
const robberyDefenders = document.getElementById("robberyDefenders");
const robberyAllies = document.getElementById("robberyAllies");
const robberyTeamPicker = document.getElementById("robberyTeamPicker");
const robberyCombatPreview = document.getElementById("robberyCombatPreview");
const robberyTeamPowerPreview = document.getElementById("robberyTeamPowerPreview");
const robberyEnemyPowerPreview = document.getElementById("robberyEnemyPowerPreview");
const robberyWinChancePreview = document.getElementById("robberyWinChancePreview");
const robberyCombatAdvice = document.getElementById("robberyCombatAdvice");
const robberyBattleLog = document.getElementById("robberyBattleLog");
const robberyAuto = document.getElementById("robberyAuto");
const robberyAttack = document.getElementById("robberyAttack");
const robberyTactics = [...document.querySelectorAll(".robbery-tactic")];
const robberyResult = document.getElementById("robberyResult");
const robberyResultStamp = document.getElementById("robberyResultStamp");
const robberyResultTitle = document.getElementById("robberyResultTitle");
const robberyResultText = document.getElementById("robberyResultText");
const robberyResultContinue = document.getElementById("robberyResultContinue");
const policeRaidPanel = document.getElementById("policeRaidPanel");
const policeRaidBackdrop = document.getElementById("policeRaidBackdrop");
const policeRaidTitle = document.getElementById("policeRaidTitle");
const policeRaidText = document.getElementById("policeRaidText");
const policeRaidLoss = document.getElementById("policeRaidLoss");
const policeRaidCargoMetric = document.getElementById("policeRaidCargoMetric");
const policeRaidCargo = document.getElementById("policeRaidCargo");
const policeRaidHeat = document.getElementById("policeRaidHeat");
const policeRaidClose = document.getElementById("policeRaidClose");
const rewardModal = document.getElementById("rewardModal");
const rewardModalBackdrop = document.getElementById("rewardModalBackdrop");
const rewardModalTitle = document.getElementById("rewardModalTitle");
const rewardModalText = document.getElementById("rewardModalText");
const rewardModalList = document.getElementById("rewardModalList");
const rewardModalClose = document.getElementById("rewardModalClose");
let lastRewardModalSignature = "";
let lastRewardModalQueuedAt = 0;
const characterPanel = document.getElementById("characterPanel");
const characterPanelBackdrop = document.getElementById("characterPanelBackdrop");
const characterPanelClose = document.getElementById("characterPanelClose");
const equipmentPicker = document.getElementById("equipmentPicker");
const equipmentPickerTitle = document.getElementById("equipmentPickerTitle");
const equipmentPickerList = document.getElementById("equipmentPickerList");
const equipmentPickerClose = document.getElementById("equipmentPickerClose");
const itemCraftPanel = document.getElementById("itemCraftPanel");
const itemCraftToggle = document.getElementById("itemCraftToggle");
const itemCraftBody = document.getElementById("itemCraftBody");
const itemCraftClose = document.getElementById("itemCraftClose");
const itemCraftGrid = document.getElementById("itemCraftGrid");
const itemCraftButton = document.getElementById("itemCraftButton");
const itemCraftStatus = document.getElementById("itemCraftStatus");
const characterName = document.getElementById("characterName");
const characterRank = document.getElementById("characterRank");
const characterPortrait = document.getElementById("characterPortrait");
const characterMoney = document.getElementById("characterMoney");
const characterLevel = document.getElementById("characterLevel");
const characterHealth = document.getElementById("characterHealth");
const characterAttack = document.getElementById("characterAttack");
const characterDefense = document.getElementById("characterDefense");
const characterFame = document.getElementById("characterFame");
const characterCrew = document.getElementById("characterCrew");
const characterHeat = document.getElementById("characterHeat");
const characterCityLevel = document.getElementById("characterCityLevel");
const characterXpSummary = document.getElementById("characterXpSummary");
const characterXpFill = document.getElementById("characterXpFill");
const crewMemberPanel = document.getElementById("crewMemberPanel");
const crewMemberPanelBackdrop = document.getElementById("crewMemberPanelBackdrop");
const crewMemberPanelClose = document.getElementById("crewMemberPanelClose");
const crewMemberPanelTitle = document.getElementById("crewMemberPanelTitle");
const crewMemberPanelImage = document.getElementById("crewMemberPanelImage");
const crewMemberPanelName = document.getElementById("crewMemberPanelName");
const crewMemberPanelRole = document.getElementById("crewMemberPanelRole");
const crewMemberPanelLevel = document.getElementById("crewMemberPanelLevel");
const crewMemberPanelHealth = document.getElementById("crewMemberPanelHealth");
const crewMemberPanelAttack = document.getElementById("crewMemberPanelAttack");
const crewMemberPanelDefense = document.getElementById("crewMemberPanelDefense");
const crewMemberEquipmentGrid = document.getElementById("crewMemberEquipmentGrid");
const crewEquipmentPicker = document.getElementById("crewEquipmentPicker");
const crewEquipmentPickerTitle = document.getElementById("crewEquipmentPickerTitle");
const crewEquipmentPickerList = document.getElementById("crewEquipmentPickerList");
const crewEquipmentPickerClose = document.getElementById("crewEquipmentPickerClose");
const crewCards = document.getElementById("crewCards");
const crewPowerTotal = document.getElementById("crewPowerTotal");
let crewPanelRenderKey = "";
let activeCrewSheetMemberId = null;
let activeCrewEquipmentSlot = null;
let devRefillButton = null;

let avatarNameEl = null;
let avatarLevelEl = null;
let avatarPortraitEl = null;
let avatarBar1TextEl = null;
let avatarBar2TextEl = null;
let avatarBar3TextEl = null;
let avatarBar1FillEl = null;
let avatarBar2FillEl = null;
let avatarBar3FillEl = null;
let avatarNoteEl = null;

function configureAvatarCard() {
  if (!hudAvatarCard) return;
  hudAvatarCard.setAttribute("role", "button");
  hudAvatarCard.setAttribute("tabindex", "0");
  hudAvatarCard.setAttribute("aria-label", "Karakterlap megnyitasa");
  hudAvatarCard.innerHTML = `
    <div class="hud-avatar-namebar" id="avatarName">Ismeretlen</div>
    <div class="hud-avatar-frame">
      <div class="hud-avatar-portrait">
        <img class="hud-avatar-image" id="avatarPortrait" src="./assets/character/gangster-character.webp" alt="Maffia karakter">
      </div>
      <div class="hud-avatar-level" id="avatarLevel">Kezdo gengszter</div>
    </div>
    <div class="hud-avatar-bars">
      <div class="hud-bar-row">
        <span class="hud-bar-icon hud-bar-icon--health" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21S3 15.5 3 8.5C3 5.5 5 4 7.5 4c2 0 3.5 1.2 4.5 2.7C13 5.2 14.5 4 16.5 4 19 4 21 5.5 21 8.5 21 15.5 12 21 12 21Z"/></svg></span>
        <div class="hud-bar-text" id="avatarBar1Text">138 / 140</div>
        <div class="hud-bar hud-bar--red"><div class="hud-bar__fill" id="avatarBar1Fill"></div></div>
      </div>
      <div class="hud-bar-row">
        <span class="hud-bar-icon hud-bar-icon--energy" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2 6 13h5l-1 9 8-12h-5z"/></svg></span>
        <div class="hud-bar-text" id="avatarBar2Text">99 / 100</div>
        <div class="hud-bar hud-bar--blue"><div class="hud-bar__fill" id="avatarBar2Fill"></div></div>
      </div>
      <div class="hud-bar-row hud-bar-row--xp">
        <span class="hud-bar-icon hud-bar-icon--xp" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 8h16v11H4zM8 8V5h8v3M4 12h16M10 11h4v3h-4z"/></svg></span>
        <div class="hud-bar-text" id="avatarBar3Text">0 / 20 XP</div>
        <div class="hud-bar hud-bar--gold"><div class="hud-bar__fill" id="avatarBar3Fill"></div></div>
      </div>
    </div>
    <div class="hud-note" id="avatarNote">Regisztralj, es indul a varosi felemelkedes.</div>
    <svg class="hud-avatar-ornament" viewBox="0 0 180 310" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 25V10h15M3 25l8-8M177 25V10h-15M177 25l-8-8M3 285v15h15M3 285l8 8M177 285v15h-15M177 285l-8 8"/>
      <path d="M22 5h136M22 305h136M5 42v226M175 42v226"/>
      <path d="M90 3l5 5-5 5-5-5zM90 297l5 5-5 5-5-5zM2 155l5-5 5 5-5 5zM178 155l-5-5-5 5 5 5z"/>
    </svg>
  `;
  avatarNameEl = document.getElementById("avatarName");
  avatarLevelEl = document.getElementById("avatarLevel");
  avatarPortraitEl = document.getElementById("avatarPortrait");
  avatarBar1TextEl = document.getElementById("avatarBar1Text");
  avatarBar2TextEl = document.getElementById("avatarBar2Text");
  avatarBar3TextEl = document.getElementById("avatarBar3Text");
  avatarBar1FillEl = document.getElementById("avatarBar1Fill");
  avatarBar2FillEl = document.getElementById("avatarBar2Fill");
  avatarBar3FillEl = document.getElementById("avatarBar3Fill");
  avatarNoteEl = document.getElementById("avatarNote");
}

function getRankLevel(fame) {
  let level = 0;
  for (let i = 0; i < rankTable.length; i += 1) {
    if (fame >= rankTable[i].fame) level = i + 1;
  }
  return Math.max(1, Math.min(level, rankTable.length));
}

function getElapsedProfileTime(now = Date.now()) {
  const startedAt = Number(state.profileStartedAt) || 0;
  if (!startedAt) return 0;
  return Math.max(0, now - startedAt);
}

function isEarlyGameAccelerated(now = Date.now()) {
  return Boolean(state.registered) && getElapsedProfileTime(now) < EARLY_GAME_WINDOW_MS;
}

function getEarlyGameActionBonus(now = Date.now()) {
  if (!isEarlyGameAccelerated(now)) return 0;
  const remainingRatio = 1 - clamp(getElapsedProfileTime(now) / EARLY_GAME_WINDOW_MS, 0, 1);
  return Math.round(12 + remainingRatio * 14);
}

function getHarborRequiredLevel() {
  return 5;
}

function canEnterHarbor() {
  return getRankLevel(state.fame) >= getHarborRequiredLevel();
}

function getNextRankFame(fame) {
  for (const entry of rankTable) {
    if (entry.fame > fame) return entry.fame;
  }
  return rankTable[rankTable.length - 1].fame;
}

function getCurrentRankEntry(fame) {
  let current = rankTable[0];
  for (const entry of rankTable) {
    if (fame >= entry.fame) current = entry;
  }
  return current;
}

function getWorldMapLotById(lotId) {
  return worldMapLotDefs.find((lot) => lot.id === lotId) || null;
}

function normalizeWorldBaseLotId(lotId) {
  return typeof lotId === "string" && getWorldMapLotById(lotId) ? lotId : null;
}

function parseWorldMapQuery(rawValue = "") {
  const normalized = String(rawValue).trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) return null;
  return worldMapLotDefs.find((lot) =>
    lot.code.toUpperCase() === normalized
    || lot.coord.toUpperCase() === normalized
    || `${lot.code}:${lot.coord}`.toUpperCase() === normalized)
    || null;
}

function buildWorldLotOccupancy(entries = []) {
  const occupied = {};
  for (const entry of entries || []) {
    const lotId = normalizeWorldBaseLotId(entry?.worldBaseLotId || entry?.lotId);
    if (!lotId) continue;
    occupied[lotId] = {
      profileName: entry.profileName || entry.ownerProfileName || "Ismeretlen",
      worldBaseLevel: clamp(Math.round(Number(entry?.worldBaseLevel || entry?.baseLevel) || 1), 1, 3),
      updatedAt: entry.updatedAt || 0,
    };
  }
  if (state.profileName && state.worldBaseLotId) {
    occupied[state.worldBaseLotId] = {
      profileName: state.profileName,
      worldBaseLevel: clamp(Math.round(Number(state.worldBaseLevel) || 1), 1, 3),
      updatedAt: Date.now(),
    };
  }
  return occupied;
}

function getDefaultEquipment() {
  return getEmptyEquipment();
}

function getEmptyEquipment() {
  return Object.fromEntries(equipmentSlotOrder.map((slot) => [slot, null]));
}

function getDefaultItemInventory() {
  return Object.fromEntries(equipmentSlotOrder.map((slot) => [
    slot,
    slot === "weapon" && equipmentCatalog.weapon?.[0] ? [{ ...equipmentCatalog.weapon[0] }] : [],
  ]));
}

function findEquipmentCatalogItem(slot, rawItem) {
  const list = equipmentCatalog[slot] || [];
  if (!list.length) return null;
  if (typeof rawItem?.templateId === "string") {
    const byTemplateId = list.find((item) => item.id === rawItem.templateId);
    if (byTemplateId) return byTemplateId;
  }
  if (typeof rawItem?.baseItemId === "string") {
    const byBaseId = list.find((item) => item.id === rawItem.baseItemId);
    if (byBaseId) return byBaseId;
  }
  if (typeof rawItem?.id === "string") {
    const byId = list.find((item) => item.id === rawItem.id);
    if (byId) return byId;
  }
  if (typeof rawItem?.name === "string") {
    const normalizedName = rawItem.name.trim().toLowerCase();
    const byName = list.find((item) => item.name.trim().toLowerCase() === normalizedName);
    if (byName) return byName;
  }
  return null;
}

function normalizeEquipmentItem(slot, rawItem, fallback = null) {
  const template = findEquipmentCatalogItem(slot, rawItem) || fallback || equipmentCatalog[slot]?.[0];
  if (!template) return null;
  const rarity = ["gray", "yellow", "red"].includes(rawItem?.rarity) ? rawItem.rarity : template.rarity;
  return {
    id: typeof rawItem?.id === "string" ? rawItem.id : template.id,
    templateId: typeof rawItem?.templateId === "string"
      ? rawItem.templateId
      : typeof rawItem?.baseItemId === "string"
        ? rawItem.baseItemId
        : template.id,
    name: typeof rawItem?.name === "string" ? rawItem.name : template.name,
    power: Number.isFinite(rawItem?.power) ? Math.max(0, rawItem.power) : template.power,
    stat: rawItem?.stat === "defense" || rawItem?.stat === "attack" ? rawItem.stat : template.stat,
    rarity,
    purchasePrice: Number.isFinite(Number(rawItem?.purchasePrice))
      ? Math.max(0, Math.round(Number(rawItem.purchasePrice)))
      : 0,
    image: typeof rawItem?.image === "string" && rawItem.image.trim()
      ? rawItem.image.trim()
      : template.image || getEquipmentRarityImage(slot, rarity) || getEquipmentArt(slot),
  };
}

function createOwnedEquipmentItem(slot, rawItem, source = "loot") {
  const item = normalizeEquipmentItem(slot, rawItem);
  if (!item) return null;
  const baseId = String(item.templateId || item.id || `${slot}-item`).replace(/[^a-z0-9_-]+/gi, "-").slice(0, 48);
  const keepOriginalId = typeof item.id === "string" && /^(market|crafted|owned)-/i.test(item.id);
  return {
    ...item,
    templateId: item.templateId || baseId,
    id: keepOriginalId
      ? item.id
      : `owned-${source}-${slot}-${baseId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function normalizeItemInventory(source, equipment = null) {
  const defaults = getDefaultItemInventory();
  const output = {};
  equipmentSlotOrder.forEach((slot) => {
    const hasSavedSlot = Array.isArray(source?.[slot]);
    const savedItems = hasSavedSlot ? source[slot] : [];
    const merged = new Map((hasSavedSlot ? [] : defaults[slot]).map((item) => [item.id, { ...item }]));
    savedItems.forEach((rawItem) => {
      const item = normalizeEquipmentItem(slot, rawItem);
      if (item) merged.set(item.id, item);
    });
    const equippedItem = equipment?.[slot];
    if (equippedItem) {
      const normalizedEquipped = normalizeEquipmentItem(slot, equippedItem);
      if (normalizedEquipped) merged.set(normalizedEquipped.id, normalizedEquipped);
    }
    output[slot] = [...merged.values()];
  });
  return output;
}

function getEquipmentBonusText(slot, power, stat = null) {
  const resolvedStat = stat || equipmentSlotDefs[slot]?.stat || "attack";
  const bonus = resolvedStat === "defense" ? "Vedelem" : "Tamadas";
  return `${bonus} +${power}`;
}

function getEquipmentRarityLabel(rarity = "gray") {
  if (rarity === "red") return "Piros";
  if (rarity === "yellow") return "Sarga";
  return "Szurke";
}

function getEquipmentRarityPrice(rarity = "gray", power = 1) {
  const base = rarity === "red" ? 260 : rarity === "yellow" ? 145 : 68;
  return Math.round(base + power * (rarity === "red" ? 26 : rarity === "yellow" ? 18 : 10));
}

function getEquipmentSellPrice(item = {}) {
  const purchasePrice = Number.isFinite(Number(item?.purchasePrice))
    ? Math.max(0, Math.round(Number(item.purchasePrice)))
    : 0;
  const referencePrice = purchasePrice || getEquipmentRarityPrice(item?.rarity, Number(item?.power) || 0);
  return Math.max(1, Math.floor(referencePrice * 0.4));
}

function getMarketOfferPrice(entry = {}) {
  const basePrice = Number.isFinite(Number(entry.price))
    ? Math.max(1, Math.round(Number(entry.price)))
    : getEquipmentRarityPrice(entry?.item?.rarity, Number(entry?.item?.power) || 0);
  return Math.max(1, Math.round(basePrice * (1 - getInfluenceBenefits().marketDiscountRate)));
}

function getMarketCompareDeltaText(slot, offerItem = {}, equippedItem = null) {
  if (!equippedItem) return "Nincs felvett item ebben a helyen.";
  const offerPower = Number(offerItem?.power) || 0;
  const equippedPower = Number(equippedItem?.power) || 0;
  const delta = offerPower - equippedPower;
  const offerStat = offerItem?.stat || equipmentSlotDefs[slot]?.stat || "attack";
  const equippedStat = equippedItem?.stat || equipmentSlotDefs[slot]?.stat || "attack";
  const statLabel = offerStat === "defense" ? "vedelem" : "tamadas";
  if (offerStat !== equippedStat) {
    return `Piaci: ${getEquipmentBonusText(slot, offerPower, offerStat)} · Rajtad: ${getEquipmentBonusText(slot, equippedPower, equippedStat)}`;
  }
  if (delta > 0) return `+${delta} ${statLabel} a mostanihoz kepest`;
  if (delta < 0) return `${delta} ${statLabel} a mostanihoz kepest`;
  return "Ugyanolyan eros, mint ami most rajtad van.";
}

function getMarketEquippedCompareHtml(slot, offerItem = {}) {
  const slotLabel = equipmentSlotDefs[slot]?.label || slot || "Item";
  const equippedItem = state.equipment?.[slot]
    ? normalizeEquipmentItem(slot, state.equipment[slot], state.equipment[slot])
    : null;
  if (!equippedItem) {
    return `
      <aside class="market-item__compare market-item__compare--empty" role="tooltip">
        <div class="market-item__compare-title">Most rajtad</div>
        <strong>${escapeHtml(slotLabel)}</strong>
        <span>Nincs felvett item.</span>
        <em>${escapeHtml(getMarketCompareDeltaText(slot, offerItem, null))}</em>
      </aside>
    `;
  }
  return `
    <aside class="market-item__compare" role="tooltip">
      <div class="market-item__compare-title">Most rajtad</div>
      <div class="market-item__compare-card">
        <img src="${equippedItem.image || getEquipmentArt(slot)}" alt="${escapeHtml(equippedItem.name)}">
        <div>
          <strong>${escapeHtml(equippedItem.name)}</strong>
          <span class="market-item__rarity market-item__rarity--${equippedItem.rarity}">${getEquipmentRarityLabel(equippedItem.rarity)}</span>
        </div>
      </div>
      <span>${escapeHtml(slotLabel)} · ${getEquipmentBonusText(slot, equippedItem.power, equippedItem.stat)}</span>
      <em>${escapeHtml(getMarketCompareDeltaText(slot, offerItem, equippedItem))}</em>
    </aside>
  `;
}

function getMarketOfferDeltaPower(slot, offerItem = {}) {
  const equippedItem = state.equipment?.[slot]
    ? normalizeEquipmentItem(slot, state.equipment[slot], state.equipment[slot])
    : null;
  if (!equippedItem) return Number(offerItem?.power) || 0;
  const offerStat = offerItem?.stat || equipmentSlotDefs[slot]?.stat || "attack";
  const equippedStat = equippedItem.stat || equipmentSlotDefs[slot]?.stat || "attack";
  if (offerStat !== equippedStat) return 0;
  return (Number(offerItem?.power) || 0) - (Number(equippedItem.power) || 0);
}

function normalizeMarketStock(source) {
  if (!Array.isArray(source)) return [];
  return source.map((entry) => {
    const slot = equipmentSlotOrder.includes(entry?.slot) ? entry.slot : null;
    if (!slot) return null;
    const rawItem = entry?.item && typeof entry.item === "object" ? entry.item : entry;
    const item = normalizeEquipmentItem(slot, rawItem);
    if (!item) return null;
    return {
      slot,
      stock: Number.isFinite(Number(entry?.stock))
        ? Math.max(0, Math.round(Number(entry.stock)))
        : 1,
      price: Number.isFinite(Number(entry?.price))
        ? Math.max(1, Math.round(Number(entry.price)))
        : getEquipmentRarityPrice(item.rarity, item.power),
      item,
    };
  }).filter(Boolean).slice(0, MARKET_MAX_OFFERS);
}

function getMarketRarityCounts(stock = []) {
  return stock.reduce((counts, entry) => {
    const rarity = ["gray", "yellow", "red"].includes(entry?.item?.rarity) ? entry.item.rarity : "gray";
    counts[rarity] = (counts[rarity] || 0) + 1;
    return counts;
  }, { gray: 0, yellow: 0, red: 0 });
}

function isMarketStockRuleCurrent(stock = []) {
  if (!Array.isArray(stock) || !stock.length || stock.length > MARKET_MAX_OFFERS) return false;
  const counts = getMarketRarityCounts(stock);
  return counts.red >= 1
    && counts.red <= 2
    && counts.yellow <= 2
    && counts.gray >= Math.max(1, stock.length - counts.red - counts.yellow);
}

function getMarketRarityPlan(seed = "market", cycle = 0, influenceBenefits = {}) {
  const redBonus = Number(influenceBenefits.marketRedChanceBonus) || 0;
  const yellowBonus = Number(influenceBenefits.marketYellowChanceBonus) || 0;
  const twoRedChance = clamp(0.18 + redBonus * 2.2, 0.18, 0.42);
  const twoYellowChance = clamp(0.35 + yellowBonus * 2.5, 0.35, 0.6);
  const redCount = 1 + (hash2(seed.length + cycle * 7, 91, state.day + 13) < twoRedChance ? 1 : 0);
  const yellowCount = 1 + (hash2(seed.length + cycle * 5, 47, state.day + 29) < twoYellowChance ? 1 : 0);
  const grayCount = Math.max(0, MARKET_MAX_OFFERS - redCount - yellowCount);
  const plan = [
    ...Array(grayCount).fill("gray"),
    ...Array(yellowCount).fill("yellow"),
    ...Array(redCount).fill("red"),
  ];
  return plan
    .map((rarity, index) => ({
      rarity,
      order: hash2(seed.length + cycle * 11 + index * 17, index + 31, state.day + 7),
    }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.rarity)
    .slice(0, MARKET_MAX_OFFERS);
}

function getMarketSlotPlan(seed = "market", cycle = 0) {
  const shuffledSlots = equipmentSlotOrder
    .map((slot, index) => ({
      slot,
      order: hash2(seed.length + cycle * 13 + index * 19, slot.charCodeAt(0), state.day + 41),
    }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.slot);
  const repeatSlots = shuffledSlots
    .map((slot, index) => ({
      slot,
      order: hash2(seed.length + cycle * 17 + index * 23, slot.charCodeAt(slot.length - 1), state.day + 53),
    }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.slot);
  return [...shuffledSlots, ...repeatSlots].slice(0, MARKET_MAX_OFFERS);
}

function generateMarketStock(seed = state.profileName || "market", refreshAt = Date.now()) {
  const stock = [];
  const cycle = Math.floor(refreshAt / MARKET_REFRESH_MS);
  const influenceBenefits = getInfluenceBenefits();
  const rarityPlan = getMarketRarityPlan(seed, cycle, influenceBenefits);
  const slotPlan = getMarketSlotPlan(seed, cycle);
  const usedTemplateIdsBySlot = new Map();
  slotPlan.forEach((slot, offerIndex) => {
    const slotIndex = equipmentSlotOrder.indexOf(slot);
    const catalog = equipmentCatalog[slot] || [];
    if (!catalog.length) return;
    const rarity = rarityPlan[offerIndex] || "gray";
    const rarityPool = catalog.filter((entry) => entry.rarity === rarity);
    const itemPool = rarityPool.length ? rarityPool : catalog;
    const usedTemplateIds = usedTemplateIdsBySlot.get(slot) || new Set();
    usedTemplateIdsBySlot.set(slot, usedTemplateIds);
    let choiceIndex = Math.floor(hash2(seed.length + cycle + slotIndex * 5, cycle + slot.charCodeAt(0) + offerIndex * 17, state.day + slotIndex) * itemPool.length);
    let baseItem = itemPool[clamp(choiceIndex, 0, itemPool.length - 1)] || catalog[0];
    for (let attempts = 0; attempts < itemPool.length && usedTemplateIds.has(baseItem.id); attempts += 1) {
      choiceIndex = (choiceIndex + 1) % itemPool.length;
      baseItem = itemPool[choiceIndex] || baseItem;
    }
    usedTemplateIds.add(baseItem.id);
    const bonusPower = rarity === "red" ? 2 : rarity === "yellow" ? 1 : 0;
    const item = normalizeEquipmentItem(slot, {
      ...baseItem,
      id: `market-${slot}-${cycle}-${slotIndex}-${offerIndex}-${baseItem.id || rarity}`,
      name: `${baseItem.name} (${rarity === "red" ? "piros" : rarity === "yellow" ? "sarga" : "szurke"} piac)`,
      power: baseItem.power + bonusPower,
      rarity,
      image: baseItem.image || getEquipmentRarityImage(slot, rarity),
    }, baseItem);
    if (!item) return;
    stock.push({
      slot,
      price: getEquipmentRarityPrice(rarity, item.power),
      item,
    });
  });
  return stock.slice(0, MARKET_MAX_OFFERS);
}

function ensureMarketStock(now = Date.now()) {
  const needsMigration = Array.isArray(state.marketStock) && state.marketStock.some((entry) => !String(entry?.item?.id || "").startsWith("market-"));
  const needsCatalogRefresh = state.marketCatalogVersion !== EQUIPMENT_CATALOG_VERSION;
  const needsMarketRuleRefresh = Array.isArray(state.marketStock) && !isMarketStockRuleCurrent(state.marketStock);
  if (!Array.isArray(state.marketStock) || !state.marketStock.length || !Number.isFinite(state.marketRefreshAt) || now >= state.marketRefreshAt || needsMigration || needsCatalogRefresh || needsMarketRuleRefresh) {
    state.marketStock = generateMarketStock(state.profileName || "market", now);
    state.marketRefreshAt = now + MARKET_REFRESH_MS;
    state.marketCatalogVersion = EQUIPMENT_CATALOG_VERSION;
  }
}

function recalculateGearPower() {
  state.gearPower = equipmentSlotOrder.reduce((sum, slot) => sum + (Number(state.equipment?.[slot]?.power) || 0), 0);
}

function getPlayerAttackStat() {
  return equipmentSlotOrder.reduce((sum, slot) => {
    const item = state.equipment?.[slot];
    return sum + ((item?.stat || equipmentSlotDefs[slot]?.stat) === "attack" ? (Number(item?.power) || 0) : 0);
  }, 0);
}

function getPlayerDefenseStat() {
  return equipmentSlotOrder.reduce((sum, slot) => {
    const item = state.equipment?.[slot];
    return sum + ((item?.stat || equipmentSlotDefs[slot]?.stat) === "defense" ? (Number(item?.power) || 0) : 0);
  }, 0);
}

function unlockEquipmentItem(slot, rawItem) {
  if (!slot || !state.itemInventory) return null;
  if (!Array.isArray(state.itemInventory[slot])) state.itemInventory[slot] = [];
  const item = createOwnedEquipmentItem(slot, rawItem, "inv");
  if (!item) return null;
  state.itemInventory[slot].push(item);
  return item;
}

function moveInventoryItemToFront(slot, itemId) {
  if (!slot || !itemId || !Array.isArray(state.itemInventory?.[slot])) return;
  const index = state.itemInventory[slot].findIndex((entry) => entry.id === itemId);
  if (index <= 0) return;
  const [item] = state.itemInventory[slot].splice(index, 1);
  state.itemInventory[slot].unshift(item);
}

function getEquipmentUseKey(slot, item) {
  if (!slot || !item) return "";
  return [
    slot,
    String(item.id || ""),
    String(item.name || "").trim().toLowerCase(),
    String(item.rarity || ""),
    String(item.stat || equipmentSlotDefs[slot]?.stat || ""),
    String(Math.round(Number(item.power) || 0)),
  ].join("|");
}

function isSameEquipmentItem(slot, left, right) {
  if (!left || !right) return false;
  if (left.id && right.id && left.id === right.id) return true;
  return getEquipmentUseKey(slot, left) === getEquipmentUseKey(slot, right);
}

function isInventoryItemInUse(slot, item) {
  if (!slot || !item) return false;
  if (isSameEquipmentItem(slot, state.equipment?.[slot], item)) return true;
  return (Array.isArray(state.crewMembers) ? state.crewMembers : []).some((member) =>
    isSameEquipmentItem(slot, member.equipment?.[slot], item));
}

function getFreeInventoryItemsForSlot(slot) {
  if (!equipmentSlotOrder.includes(slot)) return [];
  return (state.itemInventory?.[slot] || []).filter((item) => item?.id && !isInventoryItemInUse(slot, item));
}

function getInventoryCraftItems() {
  const items = [];
  equipmentSlotOrder.forEach((slot) => {
    (state.itemInventory?.[slot] || []).forEach((item) => {
      if (!item?.id) return;
      items.push({
        slot,
        item,
        key: `${slot}::${item.id}`,
        used: isInventoryItemInUse(slot, item),
      });
    });
  });
  return items;
}

function getCraftableInventoryItemsByRarity(rarity) {
  const normalizedRarity = ["gray", "yellow"].includes(rarity) ? rarity : "gray";
  return getInventoryCraftItems().filter((entry) => entry.item.rarity === normalizedRarity && !entry.used);
}

function createCraftedEquipmentItem(slot, rarity, ingredients = []) {
  const normalizedRarity = ["yellow", "red"].includes(rarity) ? rarity : "yellow";
  const rarityPool = (equipmentCatalog[slot] || []).filter((item) => item.rarity === normalizedRarity);
  const catalogItem = rarityPool.length
    ? rarityPool[Math.floor(Math.random() * rarityPool.length)]
    : equipmentCatalog[slot]?.[0];
  const ingredientPower = ingredients.reduce((sum, entry) => sum + (Number(entry.item?.power) || 0), 0);
  const averagePower = Math.max(1, Math.round(ingredientPower / Math.max(1, ingredients.length)));
  const rarityBonus = normalizedRarity === "red" ? 3 : 2;
  return normalizeEquipmentItem(slot, {
    ...(catalogItem || {}),
    id: `crafted-${slot}-${normalizedRarity}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: `${catalogItem?.name || equipmentSlotDefs[slot]?.label || "Item"} (craft)`,
    power: Math.max(Number(catalogItem?.power) || 1, averagePower + rarityBonus),
    stat: catalogItem?.stat || equipmentSlotDefs[slot]?.stat || "attack",
    rarity: normalizedRarity,
    image: catalogItem?.image || getEquipmentRarityImage(slot, normalizedRarity),
  }, catalogItem);
}

function ensureCraftedItemInInventory(craftedItem) {
  const slot = equipmentSlotOrder.includes(craftedItem?.slot) ? craftedItem.slot : null;
  if (!slot) return null;
  if (!state.itemInventory || typeof state.itemInventory !== "object") state.itemInventory = getDefaultItemInventory();
  if (!Array.isArray(state.itemInventory[slot])) state.itemInventory[slot] = [];
  const item = normalizeEquipmentItem(slot, craftedItem, craftedItem);
  if (!item?.id) return null;
  const existingIndex = state.itemInventory[slot].findIndex((entry) => String(entry?.id || "") === String(item.id));
  if (existingIndex >= 0) {
    state.itemInventory[slot][existingIndex] = { ...state.itemInventory[slot][existingIndex], ...item, slot };
    moveInventoryItemToFront(slot, item.id);
    return state.itemInventory[slot][0] || item;
  }
  state.itemInventory[slot].unshift({ ...item, slot });
  return state.itemInventory[slot][0];
}

function removeInventoryIngredients(ingredients = []) {
  ingredients.forEach(({ slot, item }) => {
    if (!slot || !item?.id || !Array.isArray(state.itemInventory?.[slot])) return;
    state.itemInventory[slot] = state.itemInventory[slot].filter((entry) => entry.id !== item.id);
  });
}

function getCraftState() {
  return {
    gray: getCraftableInventoryItemsByRarity("gray").length,
    yellow: getCraftableInventoryItemsByRarity("yellow").length,
  };
}

function getSelectedCraftItems() {
  const byKey = new Map(getInventoryCraftItems().map((entry) => [entry.key, entry]));
  selectedCraftItemKeys = selectedCraftItemKeys.filter((key) => {
    const entry = byKey.get(key);
    return entry && !entry.used && ["gray", "yellow"].includes(entry.item.rarity);
  });
  return selectedCraftItemKeys.map((key) => byKey.get(key)).filter(Boolean);
}

function getCraftSelectionResult(selectedItems = getSelectedCraftItems()) {
  if (selectedItems.length !== 3) return null;
  const rarity = selectedItems[0]?.item?.rarity;
  if (!rarity || !selectedItems.every((entry) => entry.item.rarity === rarity)) return null;
  if (rarity === "gray") return { fromRarity: "gray", toRarity: "yellow", label: "3 szurke -> 1 sarga" };
  if (rarity === "yellow") return { fromRarity: "yellow", toRarity: "red", label: "3 sarga -> piros esely" };
  return null;
}

function refreshItemCraftPanel(message = "") {
  if (!itemCraftPanel) return;
  const allItems = getInventoryCraftItems()
    .filter((entry) => !entry.used)
    .sort((left, right) => {
      if (left.key === recentlyCraftedItemKey) return -1;
      if (right.key === recentlyCraftedItemKey) return 1;
      return 0;
    });
  const selectedItems = getSelectedCraftItems();
  const selectedKeys = new Set(selectedCraftItemKeys);
  const selectedRarity = selectedItems[0]?.item?.rarity || null;
  const craftState = getCraftState();
  const result = getCraftSelectionResult(selectedItems);
  if (itemCraftGrid) {
    itemCraftGrid.innerHTML = allItems.length
      ? allItems.map(({ slot, item, key, used }) => {
        const rarity = ["gray", "yellow", "red"].includes(item.rarity) ? item.rarity : "gray";
        const selected = selectedKeys.has(key);
        const disabled = rarity === "red";
        const incompatible = !disabled && selectedRarity && rarity !== selectedRarity && selectedItems.length > 0;
        return `
          <button
            class="item-craft-tile item-craft-tile--${rarity}${selected ? " is-selected" : ""}${key === recentlyCraftedItemKey ? " is-new" : ""}${incompatible ? " is-incompatible" : ""}"
            type="button"
            data-craft-item="${escapeHtml(key)}"
            ${disabled ? "disabled" : ""}
            title="${escapeHtml(item.name)}">
            <img src="${item.image || getEquipmentArt(slot)}" alt="">
            <span>${escapeHtml(equipmentSlotDefs[slot]?.label || slot)}</span>
            <em>${getEquipmentRarityLabel(rarity)}</em>
          </button>
        `;
      }).join("")
      : `<div class="item-craft-panel__empty">Nincs szabad itemed a craft muhelyben.</div>`;
  }
  if (itemCraftButton) {
    itemCraftButton.disabled = !result;
    itemCraftButton.textContent = result ? `Craft: ${result.label}` : `Craft (${selectedItems.length}/3)`;
    itemCraftButton.classList.toggle("item-craft-panel__button--rare", result?.toRarity === "red");
  }
  if (itemCraftStatus) {
    itemCraftStatus.textContent = message || `Kijelolve: ${selectedItems.length}/3. Szabad alapanyag: ${craftState.gray} szurke, ${craftState.yellow} sarga. Piros craft eselye 35%.`;
  }
}

function toggleItemCraftPanel(forceOpen = null) {
  if (!itemCraftPanel) return;
  const shouldOpen = forceOpen === null
    ? itemCraftPanel.classList.contains("is-collapsed")
    : Boolean(forceOpen);
  itemCraftPanel.classList.toggle("is-collapsed", !shouldOpen);
  if (itemCraftBody) itemCraftBody.hidden = !shouldOpen;
  itemCraftToggle?.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  const label = itemCraftToggle?.querySelector("em");
  if (label) label.textContent = shouldOpen ? "Bezaras" : "Lenyitas";
  if (shouldOpen) refreshItemCraftPanel();
}

function toggleCraftItemSelection(itemKey) {
  const entry = getInventoryCraftItems().find((item) => item.key === itemKey);
  if (!entry || entry.used || !["gray", "yellow"].includes(entry.item.rarity)) return;
  if (selectedCraftItemKeys.includes(itemKey)) {
    selectedCraftItemKeys = selectedCraftItemKeys.filter((key) => key !== itemKey);
    refreshItemCraftPanel();
    return;
  }
  const selectedItems = getSelectedCraftItems();
  if (selectedItems.length && selectedItems[0].item.rarity !== entry.item.rarity) {
    selectedCraftItemKeys = [itemKey];
    refreshItemCraftPanel("Mas ritkasagot valasztottal, ezert uj kijeloles indult.");
    return;
  }
  if (selectedItems.length >= 3) {
    refreshItemCraftPanel("Mar 3 item ki van jelolve. Vegyel ki egyet, vagy nyomj Craftot.");
    return;
  }
  selectedCraftItemKeys.push(itemKey);
  refreshItemCraftPanel();
}

async function craftSelectedEquipment() {
  const ingredients = getSelectedCraftItems();
  const result = getCraftSelectionResult(ingredients);
  if (!result) {
    refreshItemCraftPanel("Pontosan 3 azonos ritkasagu szabad itemet jelolj ki.");
    return false;
  }
  const { toRarity } = result;
  try {
    const response = await requestServerEconomy("craft", {
      ingredients: ingredients.map((entry) => ({ slot: entry.slot, itemId: entry.item.id })),
    });
    selectedCraftItemKeys = [];
    const crafted = response.craftedItem;
    if (!response.success) {
      const text = "A piros craft nem sikerult. A 3 sarga item elveszett.";
      sceneRef?.setMessage(text);
      refreshCharacterPanel();
      refreshItemCraftPanel(text);
      return false;
    }
    const visibleCrafted = ensureCraftedItemInInventory(crafted) || crafted;
    if (visibleCrafted?.id) recentlyCraftedItemKey = `${visibleCrafted.slot}::${visibleCrafted.id}`;
    const text = `${visibleCrafted?.name || "Az uj targy"} elkeszult: ${getEquipmentRarityLabel(toRarity)} ${equipmentSlotDefs[visibleCrafted?.slot]?.label || "item"}.`;
    sceneRef?.setMessage(text);
    refreshCharacterPanel();
    refreshItemCraftPanel(text);
    return true;
  } catch (error) {
    const text = error.message || "A craft nem sikerult.";
    sceneRef?.setMessage(text);
    refreshItemCraftPanel(text);
    return false;
  }
}

function normalizeEquipment(source) {
  const defaults = getDefaultEquipment();
  const output = {};
  Object.entries(defaults).forEach(([slot, item]) => {
    let saved = source && typeof source === "object" ? source[slot] : null;
    if (!saved && slot === "pants") saved = source?.trousers || null;
    output[slot] = saved ? normalizeEquipmentItem(slot, saved, item) : null;
  });
  return output;
}

function syncEquipmentSheet() {
  const entries = equipmentSlotOrder.map((slot) => [slot, `.character-equipment__slot--${slot}`]);

  entries.forEach(([slot, selector]) => {
    const root = document.querySelector(selector);
    const item = state.equipment?.[slot];
    if (!root) return;
    const art = root.querySelector(".character-equipment__art");
    const strong = root.querySelector("strong");
    const small = root.querySelector("small");
    if (!item) {
      if (art) art.style.backgroundImage = "";
      if (strong) strong.textContent = "Ures";
      if (small) small.textContent = equipmentSlotDefs[slot]?.label || "Felszereles";
      root.classList.toggle("is-active", activeEquipmentSlot === slot);
      return;
    }
    if (art) {
      art.style.backgroundImage = `url("${item.image || getEquipmentArt(slot)}")`;
    }
    if (strong) strong.textContent = item.name;
    if (small) small.textContent = getEquipmentBonusText(slot, item.power, item.stat);
    root.classList.toggle("is-active", activeEquipmentSlot === slot);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBuildingDifficultyCycle(now = Date.now()) {
  return Math.floor(now / BUILDING_DIFFICULTY_CYCLE_MS);
}

function seededValueForSpot(spot, cycle) {
  return hash2(
    cycle + spot.id.length * 17,
    cycle + (spot.districtIndex ?? 0) * 91,
    spot.id.charCodeAt(0) + spot.id.charCodeAt(spot.id.length - 1),
  );
}

function createRandomBuildingDifficulties(cycle = getBuildingDifficultyCycle(), profileSeed = state.profileName || "") {
  const playerPower = getPlayerPower();
  const profileSalt = Array.from(profileSeed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const orderedSpots = [...clickableBuildingDefs].sort(
    (left, right) => seededValueForSpot(left, cycle + profileSalt) - seededValueForSpot(right, cycle + profileSalt),
  );
  const difficulties = {};
  orderedSpots.forEach((spot, index) => {
    const baseRoll = hash2(cycle + index * 11, profileSalt + spot.id.length * 17, spot.id.charCodeAt(0));
    if (index < MIN_DANGER_BUILDINGS) {
      difficulties[spot.id] = Math.max(1, Math.round(playerPower * (1.15 + baseRoll * 0.2)));
    } else if (index < MIN_DANGER_BUILDINGS + MIN_RISK_BUILDINGS) {
      difficulties[spot.id] = Math.max(1, Math.round(playerPower * (0.95 + baseRoll * 0.15)));
    } else {
      difficulties[spot.id] = Math.max(1, Math.round(playerPower * (0.75 + baseRoll * 0.15)));
    }
  });
  return difficulties;
}

function normalizeBuildingDifficulties(_source, cycle = getBuildingDifficultyCycle()) {
  return createRandomBuildingDifficulties(cycle, state.profileName);
}

function applyMapPanTransform() {
  const transform = `translate(${mapPan.x}px, ${mapPan.y}px)`;
  [mapBackgroundLayer, mapSvgOverlay, lotHouseLayer, document.querySelector("#gameRoot canvas")]
    .forEach((layer) => {
      if (!layer) return;
      layer.style.transform = transform;
      layer.style.willChange = "transform";
    });
}

function setMapPan(x, y) {
  mapPan.x = clamp(Math.round(x), -420, 420);
  mapPan.y = clamp(Math.round(y), -300, 300);
  applyMapPanTransform();
}

function resetMapPan() {
  setMapPan(0, 0);
}

function normalizeTerritories(source) {
  const territories = {};
  if (!source || typeof source !== "object") return territories;
  clickableLotDefs.forEach((lot) => {
    const level = Number(source[lot.id]?.level);
    if (Number.isFinite(level) && level > 0) {
      const rawOwnerType = typeof source[lot.id]?.ownerType === "string" ? source[lot.id].ownerType : "";
      const ownerType = rawOwnerType === "city"
        ? "city"
        : (lot?.restoredHouse ? "private" : "private");
      territories[lot.id] = {
        level: clamp(Math.floor(level), 1, getLotMaxLevel(lot)),
        ownerType,
      };
    }
  });
  return territories;
}

function mergeProtectedClientTerritories(existingSource, incomingSource) {
  const existing = normalizeTerritories(existingSource);
  const incoming = normalizeTerritories(incomingSource);
  const merged = { ...existing };
  Object.entries(incoming).forEach(([territoryId, territory]) => {
    const previous = existing[territoryId];
    merged[territoryId] = previous
      ? {
          ...territory,
          level: Math.max(previous.level || 1, territory.level || 1),
          ownerType: previous.ownerType || territory.ownerType || "private",
        }
      : territory;
  });
  return merged;
}

function getLotMaxLevel(lot) {
  return clamp(Math.floor(Number(lot?.maxLevel) || 3), 1, 3);
}

function getLotLevel(lot) {
  return state.territories?.[lot?.id]?.level || 0;
}

function getLotOwnerType(lot) {
  return state.territories?.[lot?.id]?.ownerType || "";
}

function isPrivateIncomeLot(lot) {
  return getLotOwnerType(lot) === "private";
}

function isCityOwnedLot(lot) {
  return getLotOwnerType(lot) === "city";
}

function getLotHouseDef(lot) {
  if (lot?.restoredHouse && getLotLevel(lot) > 0) {
    return {
      name: lot.restoredHouseName || "Eredeti haz",
      income: isPrivateIncomeLot(lot) ? (Number(lot.passiveIncome) || 24) : 0,
      restoredHouse: true,
    };
  }
  return lotHouseLevelDefs[getLotLevel(lot)] || null;
}

function getLotIncome(lot) {
  return getLotHouseDef(lot)?.income || 0;
}

function getLotHourlyIncome(lot) {
  return Math.round(getLotIncome(lot) / 24);
}

function getLotInvestmentCost(lot, targetOwnerType = "") {
  const level = getLotLevel(lot);
  if (lot?.restoredHouse) {
    if (level > 0) return 0;
    if (targetOwnerType === "private") return Number(lot.privatePurchaseCost) || Number(lot.purchaseCost) || 80;
    if (targetOwnerType === "city") return Number(lot.cityPurchaseCost) || Number(lot.purchaseCost) || 80;
    return Number(lot.purchaseCost) || 80;
  }
  if (level === 0) return 80;
  if (level === 1) return 180;
  return 320;
}

function getTerritoryIncome() {
  return clickableLotDefs.reduce((sum, lot) => sum + getLotIncome(lot), 0);
}

let activeAuxPanelKind = null;
let activeMessagesTab = "messages";
let messagesPanelData = { messages: [], notifications: [] };

function hideMentorPanel(markUserClosed = false) {
  mentorCardOpen = false;
  mentorDetailsOpen = false;
  if (hudMentorCard) {
    if (markUserClosed) hudMentorCard.dataset.userClosed = "true";
    else delete hudMentorCard.dataset.userClosed;
  }
  if (markUserClosed) {
    state.mentorDismissedStep = getCurrentMentorStep()?.id || "";
    saveGame();
  }
  updateMentorPanel();
}

function hideAuxPanel() {
  if (activeAuxPanelKind === "world" && state.needsWorldBaseSelection) {
    sceneRef?.setMessage("Elobb valassz egy ures telket a varosodnak.");
    return;
  }
  stopClanWarCountdownTimer();
  stopClanWarRefreshTimer();
  hideQuestCard();
  hideMentorPanel(false);
  document.body.classList.remove("is-world-map-open");
  activeAuxPanelKind = null;
  auxPanel?.removeAttribute("data-kind");
  auxPanel?.classList.add("hidden");
  auxPanel?.setAttribute("aria-hidden", "true");
}

function showPoliceRaidPanel(loss, summaryText, cargoLoss = {}) {
  if (policeRaidTitle) {
    policeRaidTitle.textContent = state.heat >= 60
      ? "A rendorok razziat tartottak"
      : "A rendorok szimatot fogtak";
  }
  if (policeRaidText) policeRaidText.textContent = summaryText;
  if (policeRaidLoss) policeRaidLoss.textContent = `${loss} $`;
  const cargoLossText = formatCargoLoss(cargoLoss);
  if (policeRaidCargoMetric) policeRaidCargoMetric.classList.toggle("hidden", !cargoLossText);
  if (policeRaidCargo) policeRaidCargo.textContent = cargoLossText || "Nem vittek el arut";
  if (policeRaidHeat) policeRaidHeat.textContent = `${state.heat}%`;
  policeRaidPanel?.classList.remove("hidden");
  policeRaidPanel?.setAttribute("aria-hidden", "false");
}

function hidePoliceRaidPanel() {
  policeRaidPanel?.classList.add("hidden");
  policeRaidPanel?.setAttribute("aria-hidden", "true");
}

function setAuxPanelContent(title, subtitle, bodyHtml) {
  document.body.classList.remove("is-world-map-open");
  stopClanWarCountdownTimer();
  stopClanWarRefreshTimer();
  if (auxPanel) delete auxPanel.dataset.worldSelection;
  if (auxPanelTitle) auxPanelTitle.textContent = title;
  if (auxPanelSubtitle) auxPanelSubtitle.textContent = subtitle;
  if (auxPanelHeaderTools) auxPanelHeaderTools.replaceChildren();
  if (auxPanelBody) auxPanelBody.innerHTML = bodyHtml;
  auxPanel?.classList.remove("hidden");
  auxPanel?.setAttribute("aria-hidden", "false");
}

function setSideDialogContent(dialog, titleEl, subtitleEl, bodyEl, title, subtitle, bodyHtml) {
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  dialog?.classList.remove("hidden");
  dialog?.setAttribute("aria-hidden", "false");
}

function hideMessagesDialog() {
  if (activeAuxPanelKind === "messages") activeAuxPanelKind = null;
  messagesDialog?.classList.add("hidden");
  messagesDialog?.setAttribute("aria-hidden", "true");
}

function hidePublicProfileDialog() {
  if (activeAuxPanelKind === "public-profile") activeAuxPanelKind = null;
  activeWorldRivalCityProfileId = null;
  activeWorldRivalStructureId = null;
  publicProfileDialog?.classList.add("hidden");
  publicProfileDialog?.setAttribute("aria-hidden", "true");
}

function setMessagesDialogContent(title, subtitle, bodyHtml) {
  setSideDialogContent(messagesDialog, messagesDialogTitle, messagesDialogSubtitle, messagesDialogBody, title, subtitle, bodyHtml);
}

function setPublicProfileDialogContent(title, subtitle, bodyHtml) {
  setSideDialogContent(publicProfileDialog, publicProfileDialogTitle, publicProfileDialogSubtitle, publicProfileDialogBody, title, subtitle, bodyHtml);
}

function updateMessageBadge(unreadCount = 0) {
  if (hudMessageBadge) {
    const count = Math.max(0, Math.round(Number(unreadCount) || 0));
    hudMessageBadge.textContent = count > 99 ? "99+" : String(count);
    hudMessageBadge.classList.toggle("hidden", count <= 0);
  }
}

function normalizeLocalNotifications(source) {
  return (Array.isArray(source) ? source : [])
    .map((entry, index) => ({
      id: String(entry?.id || `local-note-${Date.now()}-${index}`),
      title: String(entry?.title || "Ertesites"),
      body: String(entry?.body || ""),
      messageType: String(entry?.messageType || "event"),
      senderProfileName: entry?.senderProfileName ? String(entry.senderProfileName) : "",
      payload: entry?.payload && typeof entry.payload === "object" ? { ...entry.payload } : {},
      createdAt: Number.isFinite(Number(entry?.createdAt)) ? Number(entry.createdAt) : Date.now(),
      readAt: Number.isFinite(Number(entry?.readAt)) ? Number(entry.readAt) : 0,
      localOnly: true,
    }))
    .sort((left, right) => Number(right.createdAt) - Number(left.createdAt))
    .slice(0, MAX_LOCAL_NOTIFICATIONS);
}

function isImportantNotification(entry = {}) {
  const kind = String(entry?.payload?.kind || "").toLowerCase();
  if (kind === "pvp_attack_received" || kind.startsWith("rival_") || kind.startsWith("clan_war_")) return true;
  if (entry?.messageType === "pvp" && entry?.senderProfileName) return true;
  return /riv[aá]lis\s+banda/i.test(`${entry?.title || ""} ${entry?.body || ""}`);
}

function getLocalUnreadCount() {
  return normalizeLocalNotifications(state.localNotifications)
    .filter((entry) => isImportantNotification(entry) && !entry.readAt)
    .length;
}

function addLocalNotification(title, body, options = {}) {
  const entry = {
    id: options.id || `local-note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: String(title || "Ertesites"),
    body: String(body || ""),
    messageType: String(options.messageType || "event"),
    senderProfileName: options.senderProfileName ? String(options.senderProfileName) : "",
    payload: options.payload && typeof options.payload === "object" ? { ...options.payload } : {},
    createdAt: Number.isFinite(Number(options.createdAt)) ? Number(options.createdAt) : Date.now(),
    readAt: Number.isFinite(Number(options.readAt)) ? Number(options.readAt) : 0,
    localOnly: true,
  };
  state.localNotifications = normalizeLocalNotifications([entry, ...(state.localNotifications || [])]);
  updateMessageBadge(getLocalUnreadCount());
}

function markLocalNotificationsRead() {
  const now = Date.now();
  let changed = false;
  state.localNotifications = normalizeLocalNotifications(state.localNotifications).map((entry) => {
    if (entry.readAt) return entry;
    changed = true;
    return { ...entry, readAt: now };
  });
  if (changed) updateMessageBadge(0);
}

function mergeInboxMessages(messages = []) {
  const merged = [...normalizeLocalNotifications(state.localNotifications), ...(Array.isArray(messages) ? messages : [])]
    .sort((left, right) => Number(right?.createdAt || 0) - Number(left?.createdAt || 0));
  const seen = new Set();
  return merged.filter((entry) => {
    const key = String(entry?.id || `${entry?.title || ""}-${entry?.createdAt || 0}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRewardModalItem(icon, label, sublabel, value) {
  return `
    <div class="reward-modal__item">
      <div class="reward-modal__icon">${escapeHtml(icon)}</div>
      <div>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(sublabel)}</span>
      </div>
      <em>${escapeHtml(value)}</em>
    </div>
  `;
}

function renderRewardModal(payload = {}) {
  if (rewardModalTitle) rewardModalTitle.textContent = payload.title || "Jutalom";
  if (rewardModalText) rewardModalText.textContent = payload.text || "A jutalmad bekerult a kasszaba.";
  const items = [];
  const money = Math.round(Number(payload.money) || 0);
  const xp = Math.round(Number(payload.xp) || 0);
  const fame = Math.round(Number(payload.fame) || xp || 0);
  if (money || payload.showZeroValues) items.push(buildRewardModalItem("$", "Penz", "Azonnali bevetel", `${money >= 0 ? "+" : ""}${money} $`));
  if (xp || payload.showZeroValues) items.push(buildRewardModalItem("XP", "XP", "Tapasztalat", `${xp >= 0 ? "+" : ""}${xp}`));
  if (fame || payload.showZeroValues) items.push(buildRewardModalItem("H", "Hirnev", "Utcai hirnev", `${fame >= 0 ? "+" : ""}${fame}`));
  if (payload.itemName) items.push(buildRewardModalItem("I", "Item", "Uj targy", payload.itemName));
  if (rewardModalList) rewardModalList.innerHTML = items.join("");
  rewardModal?.classList.remove("hidden");
  rewardModal?.setAttribute("aria-hidden", "false");
}

function flushRewardModalQueue() {
  if (!rewardModal?.classList.contains("hidden")) return;
  const next = pendingRewardModals.shift();
  if (!next) return;
  renderRewardModal(next);
}

function hideRewardModal() {
  rewardModal?.classList.add("hidden");
  rewardModal?.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    flushRewardModalQueue();
  }, 0);
}

function getPlayerCombatAttackStat() {
  return Math.max(6, getPlayerAttackStat() + 5 + Math.floor(getRankLevel(state.fame) * 1.1));
}

function getPlayerCombatDefenseStat() {
  return Math.max(5, getPlayerDefenseStat() + 4 + Math.floor(getRankLevel(state.fame) * 0.9));
}

function queueRewardModal(payload = {}) {
  const normalizedPayload = {
    title: payload.title || "Jutalom",
    text: payload.text || "A jutalmad bekerult a kasszaba.",
    money: Math.round(Number(payload.money) || 0),
    xp: Math.round(Number(payload.xp) || 0),
    fame: Math.round(Number(payload.fame) || Number(payload.xp) || 0),
    itemName: payload.itemName ? String(payload.itemName) : "",
    showZeroValues: Boolean(payload.showZeroValues),
  };
  const signature = JSON.stringify(normalizedPayload);
  const now = Date.now();
  const alreadyQueued = pendingRewardModals.some((entry) => JSON.stringify(entry) === signature);
  if (alreadyQueued || (signature === lastRewardModalSignature && now - lastRewardModalQueuedAt < 1500)) return;
  lastRewardModalSignature = signature;
  lastRewardModalQueuedAt = now;
  pendingRewardModals.push(normalizedPayload);
  flushRewardModalQueue();
}

async function refreshMessageBadge() {
  if (!state.profileName) {
    updateMessageBadge(0);
    return;
  }
  try {
    const response = await fetch("/api/messages?limit=200", {
      headers: { Accept: "application/json" },
    });
    const payload = response.ok ? await response.json() : { unreadCount: 0 };
    updateMessageBadge(Number(payload.unreadCount) || 0);
  } catch {
    updateMessageBadge(0);
  }
}

function formatInboxDate(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return date.toLocaleString("hu-HU", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMessageTypeLabel(messageType, payload = {}) {
  if (payload?.kind === "clan_invitation") return "Klánmeghívó";
  if (String(payload?.kind || "").startsWith("clan_war_")) return "Klánháború";
  return ({
    player: "Játékos",
    pvp: "PvP",
    event: "Esemény",
    system: "Rendszer",
    clan: "Klán",
  })[messageType] || "Értesítés";
}

function getPlayerInboxMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.messageType === "player" && message.senderProfileName && message.senderProfileName !== state.profileName);
}

function getPvpCounterattackState(message = {}) {
  const attackerProfileName = String(message.payload?.attackerProfileName || message.senderProfileName || "").trim();
  const rawAttackerLevel = Number(message.payload?.attackerLevel);
  const hasAttackerLevel = Number.isFinite(rawAttackerLevel) && rawAttackerLevel > 0;
  const attackerLevel = hasAttackerLevel ? Math.max(1, Math.round(rawAttackerLevel)) : 0;
  const currentLevel = getRankLevel(state.fame);
  const levelProtected = hasAttackerLevel && Math.abs(currentLevel - attackerLevel) > 3;
  const cooldownRemaining = Math.max(0, Number(state.pvpNextAttackAt) - getSynchronizedNow());
  const exhausted = Number(state.health) <= 0 || Number(state.energy) < 12;
  const disabled = !attackerProfileName || attackerProfileName === state.profileName || levelProtected || cooldownRemaining > 0 || exhausted;
  const label = levelProtected
    ? "Szintvédelem aktív"
    : cooldownRemaining > 0
      ? `Visszatámadás (${formatCountdown(cooldownRemaining)})`
      : exhausted
        ? "Nincs elég HP vagy energia"
        : "Visszatámadás";
  return { attackerProfileName, disabled, label };
}

function renderInboxCards(entries = [], notificationMode = false) {
  return entries.length
    ? `
      <div class="messages-list">
          ${entries.map((message, messageIndex) => {
            const typeClass = String(message.messageType || (notificationMode ? "event" : "player")).replace(/[^a-z0-9_-]/gi, "");
            const deletableMessageId = Number(message.id) || 0;
            const isPvpAttackNotice = message.payload?.kind === "pvp_attack_received"
              || (message.messageType === "pvp" && message.senderProfileName);
            const pvpCounterattack = isPvpAttackNotice
              ? getPvpCounterattackState(message)
              : null;
            return `
            <article class="message-card message-card--${typeClass}${message.payload?.kind === "clan_invitation" ? " message-card--clan-invitation" : ""}${message.readAt ? " is-read" : " is-unread"}" data-message-index="${messageIndex}" tabindex="0">
              ${deletableMessageId > 0 ? `<button class="message-card__delete" type="button" data-message-delete="${deletableMessageId}" data-message-delete-kind="${notificationMode ? "notification" : "message"}" aria-label="${notificationMode ? "Értesítés" : "Üzenet"} törlése">×</button>` : ""}
              <div class="message-card__stamp">${getMessageTypeLabel(message.messageType, message.payload)}</div>
              <div class="message-card__copy">
                <div class="message-card__heading">
                  <strong>${escapeHtml(message.title || "Üzenet")}</strong>
                  <time>${formatInboxDate(message.createdAt)}</time>
                </div>
                ${message.senderProfileName ? `<span class="message-card__sender">Feladó: ${escapeHtml(message.senderProfileName)}</span>` : ""}
                <p class="message-card__preview">${escapeHtml(message.body || "")}</p>
                <div class="message-card__details">
                  <p>${escapeHtml(message.body || "")}</p>
                  ${!notificationMode && message.payload?.kind === "clan_invitation" ? `
                    <div class="clan-invitation-response" data-clan-invitation-actions="${Number(message.payload.invitationId) || 0}">
                      <div>
                        <small>A család ajánlata</small>
                        <strong>${escapeHtml(message.payload.clanName || "Ismeretlen család")}</strong>
                      </div>
                      ${message.payload.invitationStatus === "pending" ? `
                        <button type="button" data-clan-invite-decision="accept" data-invitation-id="${Number(message.payload.invitationId) || 0}">Elfogadom</button>
                        <button class="is-decline" type="button" data-clan-invite-decision="decline" data-invitation-id="${Number(message.payload.invitationId) || 0}">Elutasítom</button>
                      ` : `<span class="clan-invitation-response__status">${message.payload.invitationStatus === "accepted" ? "Elfogadva · A család tagja vagy" : message.payload.invitationStatus === "declined" ? "Elutasítva" : "A meghívó lejárt"}</span>`}
                    </div>
                  ` : ""}
                  ${notificationMode && pvpCounterattack ? `
                    <div class="pvp-counterattack-response">
                      <div>
                        <small>Támadó játékos</small>
                        <strong>${escapeHtml(pvpCounterattack.attackerProfileName)}</strong>
                      </div>
                      <button type="button" data-pvp-counterattack="${escapeHtml(pvpCounterattack.attackerProfileName)}"${pvpCounterattack.disabled ? " disabled" : ""}>${escapeHtml(pvpCounterattack.label)}</button>
                    </div>
                  ` : ""}
                  ${notificationMode ? "" : `<form class="message-reply-form" data-message-reply="${escapeHtml(message.senderProfileName || "")}">
                    <label>Valasz ${escapeHtml(message.senderProfileName || "a feladonak")} reszere</label>
                    <textarea maxlength="1200" placeholder="Ird ide a valaszodat..."></textarea>
                    <button type="submit">Valasz kuldese</button>
                    <span class="message-reply-form__status" aria-live="polite"></span>
                  </form>`}
                </div>
              </div>
            </article>
          `;}).join("")}
      </div>
    `
    : `
      <div class="messages-panel__empty">
        <strong>${notificationMode ? "Még nincs értesítésed." : "Még üres a postaláda."}</strong>
        <span>${notificationMode ? "Itt a PvP-támadások, a rivális banda és a klánháborúk fontos jelzései jelennek meg." : "Itt csak akkor jelenik meg valami, ha egy másik játékos ír neked."}</span>
      </div>
    `;
}

function renderMessagesPanel(payload = messagesPanelData) {
  const normalized = Array.isArray(payload) ? { messages: payload, notifications: [] } : (payload || {});
  messagesPanelData = {
    messages: getPlayerInboxMessages(normalized.messages),
    notifications: (Array.isArray(normalized.notifications) ? normalized.notifications : [])
      .filter(isImportantNotification),
  };
  const notificationMode = activeMessagesTab === "notifications";
  const entries = notificationMode ? messagesPanelData.notifications : messagesPanelData.messages;
  const body = `
    <section class="messages-panel">
      <nav class="messages-panel__tabs" aria-label="Üzenetek menüpontjai">
        <button type="button" class="${notificationMode ? "" : "is-active"}" data-messages-tab="messages">Üzenetek <span>${messagesPanelData.messages.length}</span></button>
        <button type="button" class="${notificationMode ? "is-active" : ""}" data-messages-tab="notifications">Értesítések <span>${messagesPanelData.notifications.length}</span></button>
      </nav>
      ${renderInboxCards(entries, notificationMode)}
    </section>
  `;
  hideAuxPanel();
  setMessagesDialogContent("Üzenetek", notificationMode ? "Játékértesítések" : "Privát üzenetek", body);
  activeAuxPanelKind = "messages";
  bindMessagesPanelActions();
}

function bindMessagesPanelActions() {
  if (!messagesDialogBody) return;
  messagesDialogBody.onclick = async (event) => {
    const tabButton = event.target.closest("[data-messages-tab]");
    if (tabButton) {
      activeMessagesTab = tabButton.dataset.messagesTab === "notifications" ? "notifications" : "messages";
      renderMessagesPanel(messagesPanelData);
      return;
    }
    const invitationButton = event.target.closest("[data-clan-invite-decision]");
    if (invitationButton) {
      event.preventDefault();
      event.stopPropagation();
      const invitationId = Number(invitationButton.dataset.invitationId) || 0;
      const decision = invitationButton.dataset.clanInviteDecision;
      const actions = invitationButton.closest("[data-clan-invitation-actions]");
      if (!invitationId || !["accept", "decline"].includes(decision)) return;
      actions?.querySelectorAll("button").forEach((button) => { button.disabled = true; });
      try {
        const response = await fetch(`/api/clans/invitations/${invitationId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ decision }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A válasz sikertelen.");
        if (actions) {
          actions.querySelectorAll("button").forEach((button) => button.remove());
          const status = document.createElement("span");
          status.className = "clan-invitation-response__status";
          status.textContent = decision === "accept" ? `Elfogadva · ${payload.clanName} tagja vagy` : "A meghívót elutasítottad";
          actions.append(status);
        }
        if (decision === "accept") {
          state.clanName = payload.clanName || state.clanName;
          saveGame(true);
        }
      } catch (error) {
        actions?.querySelectorAll("button").forEach((button) => { button.disabled = false; });
        const existingStatus = actions?.querySelector(".clan-invitation-response__status");
        if (existingStatus) existingStatus.textContent = error.message;
        else if (actions) {
          const status = document.createElement("span");
          status.className = "clan-invitation-response__status is-error";
          status.textContent = error.message;
          actions.append(status);
        }
      }
      return;
    }
    const counterattackButton = event.target.closest("[data-pvp-counterattack]");
    if (counterattackButton) {
      event.preventDefault();
      event.stopPropagation();
      const defenderProfileName = String(counterattackButton.dataset.pvpCounterattack || "").trim();
      if (!defenderProfileName || counterattackButton.disabled) return;
      counterattackButton.disabled = true;
      hideMessagesDialog();
      void runWorldPvpAttack(defenderProfileName);
      return;
    }
    const deleteButton = event.target.closest("[data-message-delete]");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      const messageId = Number(deleteButton.dataset.messageDelete) || 0;
      if (!messageId) return;
      deleteButton.disabled = true;
      try {
        const response = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("delete_failed");
        const deleteKind = deleteButton.dataset.messageDeleteKind === "notification" ? "notifications" : "messages";
        messagesPanelData[deleteKind] = messagesPanelData[deleteKind].filter((message) => Number(message.id) !== messageId);
        const unreadCount = [...messagesPanelData.messages, ...messagesPanelData.notifications]
          .filter((message) => !message.readAt)
          .length;
        updateMessageBadge(unreadCount);
        renderMessagesPanel(messagesPanelData);
      } catch {
        deleteButton.disabled = false;
      }
      return;
    }
    if (event.target.closest(".message-reply-form")) return;
    const card = event.target.closest(".message-card");
    if (!card) return;
    messagesDialogBody.querySelectorAll(".message-card.is-open").forEach((entry) => {
      if (entry !== card) entry.classList.remove("is-open");
    });
    const willOpen = !card.classList.contains("is-open");
    card.classList.toggle("is-open");
    if (willOpen && card.classList.contains("is-unread")) {
      const messageIndex = Math.max(0, Math.round(Number(card.dataset.messageIndex) || 0));
      const collection = activeMessagesTab === "notifications"
        ? messagesPanelData.notifications
        : messagesPanelData.messages;
      if (collection[messageIndex]) collection[messageIndex].readAt = Date.now();
      card.classList.remove("is-unread");
      card.classList.add("is-read");
      const messageId = Number(collection[messageIndex]?.id) || 0;
      if (messageId > 0) {
        void fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId }),
        });
      }
      const unreadCount = [...messagesPanelData.messages, ...messagesPanelData.notifications]
        .filter((message) => !message.readAt)
        .length;
      updateMessageBadge(unreadCount);
    }
  };
  messagesDialogBody.onkeydown = (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".message-card")) {
      event.preventDefault();
      event.target.click();
    }
  };
  messagesDialogBody.onsubmit = async (event) => {
    const form = event.target.closest("[data-message-reply]");
    if (!form) return;
    event.preventDefault();
    const recipientProfileName = form.dataset.messageReply || "";
    const textarea = form.querySelector("textarea");
    const status = form.querySelector(".message-reply-form__status");
    const body = textarea?.value.trim() || "";
    if (!body) {
      if (status) status.textContent = "Ird be a valaszodat.";
      return;
    }
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientProfileName, body }),
      });
      if (!response.ok) throw new Error("reply_failed");
      if (textarea) textarea.value = "";
      if (status) status.textContent = "A valasz elkuldve.";
    } catch {
      if (status) status.textContent = "A valaszt most nem sikerult elkuldeni.";
    }
  };
}

async function openMessagesPanel() {
  hideAuxPanel();
  setMessagesDialogContent("Üzenetek", "Privát üzenetek", `<div class="aux-panel__carditem"><strong>Üzenetek betöltése...</strong></div>`);
  activeAuxPanelKind = "messages";
  try {
    const response = await fetch("/api/messages?limit=80", {
      headers: { Accept: "application/json" },
    });
    const payload = response.ok ? await response.json() : { messages: [], notifications: [] };
    messagesPanelData = {
      messages: Array.isArray(payload.messages) ? payload.messages : [],
      notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
    };
    renderMessagesPanel(messagesPanelData);
    updateMessageBadge(Number(payload.unreadCount) || 0);
  } catch {
    setMessagesDialogContent("Üzenetek", "Privát üzenetek", `<div class="aux-panel__carditem"><strong>Az üzenetek most nem érhetők el.</strong><div class="aux-panel__muted">Próbáld meg néhány pillanat múlva.</div></div>`);
  }
}

function renderPublicPlayerProfile(profile, focusMessage = false) {
  const ownLevel = getRankLevel(state.fame);
  const levelDifference = Math.abs(ownLevel - Math.max(1, Number(profile.level) || 1));
  const levelProtected = levelDifference > 3;
  const pvpCooldownRemaining = Math.max(0, Number(state.pvpNextAttackAt) - getSynchronizedNow());
  const pvpBlocked = levelProtected || pvpCooldownRemaining > 0;
  const pvpButtonText = levelProtected
    ? "Szintkülönbség túl nagy"
    : pvpCooldownRemaining > 0
      ? `PvP pihenő: ${formatCountdown(pvpCooldownRemaining)}`
      : "PvP támadás";
  const body = `
    <section class="public-profile">
      <article class="public-profile__dossier">
        <div class="public-profile__monogram">${escapeHtml(profile.profileName.slice(0, 1).toUpperCase())}</div>
        <div>
          <span class="public-profile__eyebrow">Világtérképes akta</span>
          <h3>${escapeHtml(profile.profileName)}</h3>
          <p>${escapeHtml(profile.rankTitle || "Utcai figura")} · ${profile.level}. szint</p>
        </div>
      </article>
      <div class="public-profile__stats">
        <div><span>Befolyás</span><strong>${profile.influence}%</strong></div>
        <div><span>Bázis</span><strong>${profile.worldBaseLevel}. szint</strong></div>
        <div><span>Város</span><strong>${Math.max(0, Math.round(Number(profile.npcVillageVictories) || 0))} legyőzve</strong></div>
      </div>
      <div class="public-profile__actions">
        <button type="button" data-public-action="pvp" data-player="${escapeHtml(profile.profileName)}" ${pvpBlocked ? "disabled" : ""} title="${levelProtected ? "PvP csak legfeljebb 3 szint eltéréssel indítható." : pvpCooldownRemaining > 0 ? "A következő PvP-támadásig hátralévő idő." : "15 perces PvP pihenőt indít."}">${pvpButtonText}</button>
        <button type="button" data-public-action="world">Vissza a térképhez</button>
      </div>
      <form id="playerMessageForm" class="player-message-form" data-recipient="${escapeHtml(profile.profileName)}">
        <label for="playerMessageText">Titkos üzenet küldése</label>
        <textarea id="playerMessageText" maxlength="1200" placeholder="Írd ide az üzenetedet..."></textarea>
        <button type="submit">Üzenet elküldése</button>
        <div id="playerMessageStatus" class="player-message-form__status"></div>
      </form>
    </section>
  `;
  hideAuxPanel();
  setPublicProfileDialogContent(profile.profileName, "Játékos adatlap", body);
  activeAuxPanelKind = "public-profile";

  publicProfileDialogBody?.querySelector('[data-public-action="world"]')?.addEventListener("click", () => {
    hidePublicProfileDialog();
    openAuxPanel("world");
  });
  publicProfileDialogBody?.querySelector('[data-public-action="pvp"]')?.addEventListener("click", () => {
    hidePublicProfileDialog();
    runWorldPvpAttack(profile.profileName);
  });
  const form = document.getElementById("playerMessageForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const textarea = document.getElementById("playerMessageText");
    const status = document.getElementById("playerMessageStatus");
    const text = textarea?.value.trim() || "";
    if (!text) {
      if (status) status.textContent = "Írj be egy üzenetet.";
      return;
    }
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientProfileName: profile.profileName,
          body: text,
        }),
      });
      if (!response.ok) throw new Error("message_failed");
      if (textarea) textarea.value = "";
      if (status) status.textContent = "Az üzenetet átadták.";
    } catch {
      if (status) status.textContent = "Az üzenetet most nem sikerült elküldeni.";
    }
  });
  if (focusMessage) document.getElementById("playerMessageText")?.focus();
}

async function openPublicPlayerProfile(profileName, focusMessage = false) {
  hideAuxPanel();
  setPublicProfileDialogContent(profileName, "Játékos adatlap", `<div class="aux-panel__carditem"><strong>Akta betöltése...</strong></div>`);
  try {
    const response = await fetch(`/api/public-profile/${encodeURIComponent(profileName)}`, {
      headers: { Accept: "application/json" },
    });
    const payload = response.ok ? await response.json() : null;
    if (!payload?.found) throw new Error("profile_missing");
    renderPublicPlayerProfile(payload.profile, focusMessage);
  } catch {
    setPublicProfileDialogContent("Ismeretlen játékos", "Játékos adatlap", `<div class="aux-panel__carditem"><strong>Az akta nem található.</strong></div>`);
  }
}

function getWorldRivalStructureAttackChance(city, structure) {
  const mapPower = getActionPower("map");
  const targetPower = Math.round(
    city.power * 0.28
    + (Number(structure?.hp) || 0) * 0.24
    + (Number(structure?.attack) || 0) * 0.34
    + (Number(structure?.defense) || 0) * 0.76
    + city.level * 10
    + (city.weakened ? -20 : 0),
  );
  return clamp(0.34 + ((mapPower - targetPower) / 300), 0.24, 0.92);
}

function buildWorldRivalStructureTypeLabel(type = "") {
  switch (String(type || "")) {
    case "hq": return "Foepulet";
    case "vault": return "Penzes kozpont";
    case "watch": return "Vedett pont";
    case "garage": return "Jarmutelep";
    case "yard": return "Raktarudvar";
    default: return "Haz";
  }
}

function renderWorldRivalCityProfile(cityId, focusStructureId = "") {
  const city = getWorldRivalCityById(cityId);
  if (!city) {
    setPublicProfileDialogContent("Eltunt falu", "NPC profil", `<div class="aux-panel__carditem"><strong>Ez a rivalis falu mar nem erheto el.</strong></div>`);
    return;
  }
  activeWorldRivalCityProfileId = city.id;
  const structures = Array.isArray(city.structures) ? city.structures : [];
  const selected = getWorldRivalStructureById(city, focusStructureId)
    || getWorldRivalRemainingStructures(city)[0]
    || structures[0]
    || null;
  activeWorldRivalStructureId = selected?.id || null;
  const totalHp = getWorldRivalCityTotalHp(city);
  const currentHp = getWorldRivalCityCurrentHp(city);
  const integrityPercent = totalHp > 0 ? Math.round((currentHp / totalHp) * 100) : 0;
  const remainingCount = getWorldRivalRemainingStructures(city).length;
  const attackChance = selected ? Math.round(getWorldRivalStructureAttackChance(city, selected) * 100) : 0;
  const villageStats = getWorldRivalVillageStats(city);
  const repairCost = selected ? getWorldRivalStructureRepairCost(city, selected) : 0;
  const activeRepair = structures.find((structure) => isWorldRivalStructureRepairing(structure)) || null;
  const selectedRepairing = selected ? isWorldRivalStructureRepairing(selected) : false;
  const repairBlocked = Boolean(activeRepair && activeRepair.id !== selected?.id);
  const incomeState = getWorldRivalIncomeState(city);
  const attackCooldownUntil = Math.max(0, Number(city.attackCooldownUntil) || 0);
  const attackCooldownRemaining = Math.max(0, attackCooldownUntil - Date.now());
  const attackCooldownLabel = attackCooldownRemaining > 0
    ? `Varakozas ${formatCountdown(attackCooldownRemaining)}`
    : "Tamadas";
  setPublicProfileDialogContent(city.name, city.status === "captured" ? "Elfoglalt NPC falu" : "NPC falu profil", `
    <section class="npc-city-profile npc-city-profile--${escapeHtml(city.themeId || "uptown")}">
      <article class="npc-city-profile__hero">
        <div class="npc-city-profile__map" style="background-image:url('${escapeHtml(city.mapImage || WORLD_RIVAL_CITY_MAP_ASSETS[0])}')">
          <div class="npc-city-profile__map-shade"></div>
          ${structures.map((structure, index) => city.status === "captured" || Number(structure.hp) > 0 ? `
            <button
              type="button"
              class="npc-city-profile__marker npc-city-profile__marker--${escapeHtml(structure.specialization)}${Number(structure.hp) <= 0 ? " is-destroyed" : ""}${isWorldRivalStructureRepairing(structure) ? " is-repairing" : ""}${structure.id === activeWorldRivalStructureId ? " is-active" : ""}"
              data-rival-structure-focus="${escapeHtml(structure.id)}"
              style="left:${structure.x}%; top:${structure.y}%"
              aria-label="${escapeHtml(`${structure.name}, ${getWorldRivalStructureSpecializationLabel(structure.specialization)}`)}">
              <span class="npc-city-profile__marker-hitbox" aria-hidden="true"></span>
              <span class="npc-city-profile__marker-badge">${String(index + 1).padStart(2, "0")}</span>
              <span class="npc-city-profile__marker-role">${structure.specialization === "attack" ? "E" : "V"}</span>
              ${structure.id === activeWorldRivalStructureId ? `<span class="npc-city-profile__marker-hp"${isWorldRivalStructureRepairing(structure) ? ` data-rival-repair-ready-at="${structure.repairReadyAt}"` : ""}>${Number(structure.hp) > 0 ? `${structure.hp}/${structure.maxHp} HP` : isWorldRivalStructureRepairing(structure) ? formatCountdown(structure.repairReadyAt - Date.now()) : "ROM"}</span>` : ``}
            </button>
          ` : ``).join("")}
        </div>
        <div class="npc-city-profile__hero-stats">
          <div class="npc-city-profile__metric"><span>Szint</span><strong>${city.level}</strong></div>
          <div class="npc-city-profile__metric"><span>Tamado ero</span><strong>${city.status === "captured" ? villageStats.attack : city.power}</strong></div>
          <div class="npc-city-profile__metric"><span>Védelem</span><strong>${villageStats.defense}</strong></div>
          <div class="npc-city-profile__metric"><span>Állapot</span><strong>${integrityPercent}%</strong></div>
          <div class="npc-city-profile__metric"><span>${city.status === "captured" ? "Felújítva" : "Megmaradt"}</span><strong>${remainingCount}/${structures.length}</strong></div>
          ${city.status === "captured" ? `
            <div class="npc-city-profile__metric"><span>Foglalási védelem</span><strong data-rival-protection-until="${city.protectionUntil}">${formatWorldRivalProtectionTime(city.protectionUntil)}</strong></div>
            <div class="npc-city-profile__metric"><span>Felgyűlt bevétel</span><strong data-rival-income-money="${escapeHtml(city.id)}">${incomeState.money} $</strong></div>
            <div class="npc-city-profile__metric"><span>Beszedésig</span><strong data-rival-income-time="${escapeHtml(city.id)}">${incomeState.ready ? "most" : formatWorldRivalHoursMinutes(incomeState.remainingMs)}</strong></div>
          ` : ""}
        </div>
      </article>

      ${selected ? `
        <article class="npc-city-profile__focus">
          <div>
            <div class="npc-city-profile__eyebrow">${escapeHtml(buildWorldRivalStructureTypeLabel(selected.type))} · ${escapeHtml(getWorldRivalStructureSpecializationLabel(selected.specialization))}</div>
            <h3>${escapeHtml(selected.name)}</h3>
            <p>${city.status === "captured"
              ? Number(selected.hp) > 0
                ? `Felújított ház. Erő: ${selected.attack}, védelem: ${selected.defense}.`
                : selectedRepairing
                  ? `Felújítás folyamatban ${getWorldRivalStructureSpecializationLabel(selected.pendingSpecialization || selected.specialization).toLowerCase()} irányra. Hátralévő idő: <strong data-rival-repair-ready-at="${selected.repairReadyAt}">${formatCountdown(selected.repairReadyAt - Date.now())}</strong>.`
                  : repairBlocked
                    ? `${activeRepair.name} felújítása már folyamatban van. Egy faluban egyszerre csak egy ház fejleszthető. Hátralévő idő: <strong data-rival-repair-ready-at="${activeRepair.repairReadyAt}">${formatCountdown(activeRepair.repairReadyAt - Date.now())}</strong>.`
                  : `Romos haz. ${repairCost} $-ert, 35 perc alatt felujithatod, es kivalaszthatod az erosseget.`
              : Number(selected.hp) > 0
                ? attackCooldownRemaining > 0
                  ? `A legutobbi tamadast visszavertek. Ujra tamadhatsz <strong data-rival-attack-countdown="${attackCooldownUntil}">${formatCountdown(attackCooldownRemaining)}</strong> mulva.`
                  : `Tamadasi esely: ${attackChance}%. Ero: ${selected.attack}, vedelem: ${selected.defense}.`
                : "Ez az epulet mar romokban all."}</p>
          </div>
          <div class="npc-city-profile__focus-actions">
            <div class="npc-city-profile__hp"><span>HP</span><strong>${selected.hp}/${selected.maxHp}</strong></div>
            ${city.status !== "captured" && Number(selected.hp) > 0 ? `<button type="button" class="npc-city-profile__attack" data-rival-structure-attack="${escapeHtml(selected.id)}" data-rival-attack-ready-at="${attackCooldownUntil}" data-rival-attack-label="Tamadas"${attackCooldownRemaining > 0 ? " disabled" : ""}>${attackCooldownLabel}</button>` : ""}
            ${city.status === "captured" && Number(selected.hp) <= 0 && !selectedRepairing && !repairBlocked ? `
              <div class="npc-city-profile__repair-actions">
                <button type="button" data-rival-structure-repair="${escapeHtml(selected.id)}" data-rival-repair-specialization="attack">Erore · ${repairCost} $ · 35p</button>
                <button type="button" data-rival-structure-repair="${escapeHtml(selected.id)}" data-rival-repair-specialization="defense">Vedelemre · ${repairCost} $ · 35p</button>
              </div>
            ` : selectedRepairing ? `<div class="npc-city-profile__repair-progress">Felujitas <strong data-rival-repair-ready-at="${selected.repairReadyAt}">${formatCountdown(selected.repairReadyAt - Date.now())}</strong></div>` : repairBlocked ? `<div class="npc-city-profile__repair-progress">Varakozik <strong data-rival-repair-ready-at="${activeRepair.repairReadyAt}">${formatCountdown(activeRepair.repairReadyAt - Date.now())}</strong></div>` : ""}
          </div>
        </article>
      ` : ""}

      <footer class="npc-city-profile__footer">
        ${city.status !== "captured" ? `
          <div class="npc-city-profile__footcopy">
            ${areWorldRivalStructuresCleared(city)
              ? `Minden rivális ház elesett. Most már a falufőnököt kell legyőznöd, hogy tiéd legyen a zsákmány és a falu.`
              : `Válassz egy házat közvetlenül a térképen. Egy sikeres támadás egy teljes házat lerombol.`}
          </div>
        ` : ""}
        <div class="npc-city-profile__footer-actions">
          ${city.status === "captured"
            ? `<button type="button" data-rival-city-tribute="${escapeHtml(city.id)}"${incomeState.ready ? "" : " disabled"}>Bevetel beszedese</button>`
            : areWorldRivalStructuresCleared(city)
              ? `<button type="button" class="is-primary" data-rival-city-capture="${escapeHtml(city.id)}" data-rival-attack-ready-at="${attackCooldownUntil}" data-rival-attack-label="Falufőnök"${attackCooldownRemaining > 0 ? " disabled" : ""}>${attackCooldownRemaining > 0 ? attackCooldownLabel : "Falufőnök"}</button>`
              : ``}
        </div>
      </footer>
    </section>
  `);
}

function refreshWorldRivalRepairTimers(now = Date.now()) {
  let expired = false;
  document.querySelectorAll("[data-rival-repair-ready-at]").forEach((element) => {
    const readyAt = Number(element.getAttribute("data-rival-repair-ready-at")) || 0;
    const remaining = Math.max(0, readyAt - now);
    element.textContent = formatCountdown(remaining);
    if (readyAt > 0 && remaining <= 0) expired = true;
  });
  if (expired && activeWorldRivalCityProfileId) {
    renderWorldRivalCityProfile(activeWorldRivalCityProfileId, activeWorldRivalStructureId || "");
  }
  document.querySelectorAll("[data-rival-protection-until]").forEach((element) => {
    const protectionUntil = Number(element.getAttribute("data-rival-protection-until")) || 0;
    element.textContent = protectionUntil > now ? formatWorldRivalHoursMinutes(protectionUntil - now) : "lejart";
  });
  document.querySelectorAll("[data-rival-attack-countdown]").forEach((element) => {
    const readyAt = Number(element.getAttribute("data-rival-attack-countdown")) || 0;
    element.textContent = formatCountdown(Math.max(0, readyAt - now));
  });
  document.querySelectorAll("[data-rival-attack-ready-at]").forEach((button) => {
    const readyAt = Number(button.getAttribute("data-rival-attack-ready-at")) || 0;
    const remaining = Math.max(0, readyAt - now);
    button.disabled = remaining > 0;
    button.textContent = remaining > 0
      ? `Varakozas ${formatCountdown(remaining)}`
      : (button.getAttribute("data-rival-attack-label") || "Tamadas");
  });
  const incomeCache = new Map();
  const getIncome = (cityId) => {
    if (!incomeCache.has(cityId)) incomeCache.set(cityId, getWorldRivalIncomeState(getWorldRivalCityById(cityId), now));
    return incomeCache.get(cityId);
  };
  document.querySelectorAll("[data-rival-income-money]").forEach((element) => {
    const cityId = element.getAttribute("data-rival-income-money") || "";
    element.textContent = `${getIncome(cityId).money} $`;
  });
  document.querySelectorAll("[data-rival-income-time]").forEach((element) => {
    const cityId = element.getAttribute("data-rival-income-time") || "";
    const income = getIncome(cityId);
    element.textContent = income.ready ? "most" : formatWorldRivalHoursMinutes(income.remainingMs);
  });
  document.querySelectorAll("[data-rival-city-tribute]").forEach((button) => {
    const cityId = button.getAttribute("data-rival-city-tribute") || "";
    button.disabled = !getIncome(cityId).ready;
  });
}

function openWorldRivalCityProfile(cityId, focusStructureId = "") {
  hideAuxPanel();
  activeAuxPanelKind = "public-profile";
  renderWorldRivalCityProfile(cityId, focusStructureId);
}

function getWorldRivalAttackCooldownRemaining(city, now = Date.now()) {
  return Math.max(0, (Number(city?.attackCooldownUntil) || 0) - now);
}

function runWorldRivalStructureAttack(cityId, structureId) {
  const city = getWorldRivalCityById(cityId);
  const structure = getWorldRivalStructureById(city, structureId);
  if (!city || !structure || city.status !== "hostile" || Number(structure.hp) <= 0) return false;
  const now = Date.now();
  const cooldownRemaining = getWorldRivalAttackCooldownRemaining(city, now);
  if (cooldownRemaining > 0) {
    sceneRef?.setMessage(`${city.name}: ujabb tamadas ${formatCountdown(cooldownRemaining)} mulva indithato.`);
    renderWorldRivalCityProfile(cityId, structureId);
    return false;
  }
  if (!canStartCombat("Az epulettamadas")) return false;
  const successChance = getWorldRivalStructureAttackChance(city, structure);
  const success = Math.random() <= successChance;
  if (success) {
    const damage = structure.hp;
    const nextHp = 0;
    const destroyed = true;
    const moneyGain = 0;
    const xpGain = Math.max(1, Math.round(structure.rewardXp * 0.45));
    const heatGain = applyHeat(6 + city.level);
    const influenceGain = applyInfluenceGain(2);
    applyFame(xpGain);
    updateWorldRivalCity(cityId, (entry) => ({
      ...entry,
      weakened: true,
      power: Math.max(16, entry.power - Math.round(14 + city.level * 6)),
      structures: (entry.structures || []).map((item) => item.id === structureId
        ? { ...item, hp: nextHp, destroyedAt: destroyed ? now : 0, lastHitAt: now }
        : item),
      lastAttackAt: now,
      attackCooldownUntil: 0,
    }));
    const updatedCity = getWorldRivalCityById(cityId);
    const cityCleared = areWorldRivalStructuresCleared(updatedCity);
    queueRewardModal({
      title: "Gyozelem",
      text: `${structure.name} vedelmet attorted.`,
      xp: xpGain,
      fame: 0,
    });
    addLocalNotification(
      "Vilagterkep",
      `${city.name}: ${structure.name} vedelmet legyozted. +${xpGain} XP, +${influenceGain}% befolyas, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(cityCleared
      ? `${city.name}: minden haz romokban. Most mar johet az elfoglalas.`
      : `${structure.name} vedelmet legyozted.`);
  } else {
    const moneyLoss = Math.min(state.money, Math.max(24, Math.round(structure.rewardMoney * 0.34)));
    const healthLoss = clamp(7 + city.level * 5, 8, 26);
    const heatGain = applyHeat(5 + city.level);
    const influenceLoss = applyInfluenceLoss(2);
    state.money = Math.max(0, state.money - moneyLoss);
    state.health = clamp(state.health - healthLoss, 0, 100);
    state.naturalRecoveryAt.health = now;
    updateWorldRivalCity(cityId, (entry) => ({
      ...entry,
      power: entry.power + Math.round(4 + city.level * 2),
      lastAttackAt: now,
      attackCooldownUntil: now + WORLD_RIVAL_ATTACK_FAILURE_COOLDOWN_MS,
    }));
    addLocalNotification(
      "Vilagterkep",
      `${city.name}: ${structure.name} vedoi visszavertek. -${moneyLoss} $, -${healthLoss} HP, -${influenceLoss}% befolyas, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(`${structure.name} vedoi visszavertek az embereidet. -${influenceLoss}% befolyas. Ujabb tamadas 15:00 mulva.`);
  }
  saveGame(true);
  sceneRef?.refreshHUD();
  renderWorldRivalCityProfile(cityId, structureId);
  return success;
}

async function runWorldPvpAttack(defenderProfileName) {
  setAuxPanelContent("PvP támadás", defenderProfileName, `<div class="pvp-result"><strong>A banda úton van...</strong><p>A szerver kiszámolja a két család erejét és védelmét.</p></div>`);
  auxPanel?.setAttribute("data-kind", "pvp");
  activeAuxPanelKind = "pvp";
  try {
    const response = await fetch("/api/pvp/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defenderProfileName }),
    });
    const payload = await response.json();
    if (!response.ok) {
      const synchronizedNow = getSynchronizedNow();
      if (Number(payload.cooldownAt) > synchronizedNow) state.pvpNextAttackAt = Number(payload.cooldownAt);
      const cooldownText = Number(payload.cooldownAt) > synchronizedNow
        ? ` Hátralévő idő: ${formatCountdown(Number(payload.cooldownAt) - synchronizedNow)}.`
        : "";
      throw new Error(`${payload.error || "PvP hiba"}${cooldownText}`);
    }
    markServerMutation(response, payload);
    applyServerRobberyState(payload.state || payload.attackerState || {});
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    const resultText = payload.attackerWon
      ? `A támadás sikerült. ${payload.stolenMoney} $ zsákmányt és +${payload.influenceGain || 0}% befolyást szereztél.`
      : `A védők visszaverték a támadásodat. -${payload.influenceLoss || 0}% befolyás.`;
    setAuxPanelContent("PvP eredmény", defenderProfileName, `
      <section class="pvp-result ${payload.attackerWon ? "is-win" : "is-loss"}">
        <div class="pvp-result__stamp">${payload.attackerWon ? "GYŐZELEM" : "KUDARC"}</div>
        <h3>${resultText}</h3>
        <div class="pvp-result__stats">
          <span>Támadó erő <strong>${payload.attackerAttack}</strong></span>
          <span>Saját támadás <strong>${payload.attackerPlayerAttack}</strong></span>
          <span>${payload.attackerCrewCount} megvásárolt bandatag <strong>+${payload.attackerCrewAttack}</strong></span>
          <span>Védő erő <strong>${payload.defenderDefense}</strong></span>
          <span>Védő saját értéke <strong>${payload.defenderPlayerDefense}</strong></span>
          <span>${payload.defenderCrewCount} megvásárolt védő <strong>+${payload.defenderCrewDefense}</strong></span>
          <span>Sérülés <strong>-${payload.healthLoss} HP</strong></span>
          <span>Új PvP indítható <strong>15 perc múlva</strong></span>
          ${payload.influenceGain ? `<span>Befolyás <strong>+${payload.influenceGain}%</strong></span>` : ""}
          ${payload.influenceLoss ? `<span>Befolyás <strong>-${payload.influenceLoss}%</strong></span>` : ""}
        </div>
        <button type="button" id="pvpBackToWorld">Vissza a világtérképhez</button>
      </section>
    `);
    document.getElementById("pvpBackToWorld")?.addEventListener("click", () => openAuxPanel("world"));
  } catch (error) {
    setAuxPanelContent("PvP támadás", defenderProfileName, `
      <div class="pvp-result is-loss">
        <strong>A támadás nem indult el.</strong>
        <p>${escapeHtml(error.message || "Ismeretlen hiba.")}</p>
        <button type="button" id="pvpBackToWorld">Vissza a világtérképhez</button>
      </div>
    `);
    document.getElementById("pvpBackToWorld")?.addEventListener("click", () => openAuxPanel("world"));
  }
}

function updateWorldRivalCity(cityId, updater) {
  state.worldRivalCities = normalizeWorldRivalCities(state.worldRivalCities).map((city, index) => {
    if (city.id !== cityId) return city;
    const updated = typeof updater === "function" ? updater({ ...city }) : city;
    return normalizeWorldRivalCity(updated, index) || city;
  });
}

function runWorldRivalAttack(cityId) {
  const city = getWorldRivalCityById(cityId);
  if (!city || city.status !== "hostile") return false;
  const targetStructure = getWorldRivalRemainingStructures(city)[0]
    || (Array.isArray(city.structures) ? city.structures[0] : null);
  if (!targetStructure) {
    sceneRef?.setMessage("Ebben a faluban mar nincs mit rombolni.");
    return false;
  }
  hideWorldPlayerWheel();
  return runWorldRivalStructureAttack(cityId, targetStructure.id);
}

function runWorldRivalCapture(cityId) {
  const city = getWorldRivalCityById(cityId);
  if (!city || city.status !== "hostile") return false;
  if (city.protectionUntil > Date.now() && city.ownerProfileName && city.ownerProfileName !== state.profileName) {
    sceneRef?.setMessage(`${city.name}: a falu meg ${formatWorldRivalProtectionTime(city.protectionUntil)} ideig vedett.`);
    return false;
  }
  if (!areWorldRivalStructuresCleared(city)) {
    sceneRef?.setMessage("Elobb rombold le a rivalis hazakat a Profil nezetben.");
    openWorldRivalCityProfile(cityId);
    return false;
  }
  const now = Date.now();
  const cooldownRemaining = getWorldRivalAttackCooldownRemaining(city, now);
  if (cooldownRemaining > 0) {
    sceneRef?.setMessage(`${city.name}: a falufonokot ${formatCountdown(cooldownRemaining)} mulva tamadhatod ujra.`);
    renderWorldRivalCityProfile(cityId, activeWorldRivalStructureId || "");
    return false;
  }
  if (!canStartCombat("Az elfoglalast")) return false;
  const successChance = getWorldRivalCaptureChance(city);
  const success = Math.random() <= successChance;
  if (success) {
    const moneyGain = Math.round(city.rewardMoney * 1.35);
    const xpGain = Math.round(city.rewardXp * 1.25);
    const fameGain = Math.max(4, Math.round(city.level * 4 + city.rewardXp * 0.2));
    const heatGain = applyHeat(8 + city.level);
    state.money = Math.max(0, Math.round(Number(state.money) || 0) + moneyGain);
    applyFame(xpGain + fameGain);
    const influenceGain = applyInfluenceGain(5);
    state.npcVillageVictories = Math.max(0, Math.round(Number(state.npcVillageVictories) || 0)) + 1;
    updateWorldRivalCity(cityId, (entry) => ({
      ...entry,
      status: "captured",
      weakened: false,
      tributeMoney: 0,
      tributeTargetMoney: randomInt(500, 1000),
      tributeCycleStartedAt: now,
      tributeReadyAt: now + WORLD_RIVAL_CITY_TRIBUTE_MS,
      capturedAt: now,
      protectionUntil: now + WORLD_RIVAL_CITY_PROTECTION_MS,
      ownerProfileName: state.profileName,
      lastCaptureAt: now,
      attackCooldownUntil: 0,
    }));
    queueRewardModal({
      title: "Falufőnök legyőzve",
      text: `${city.name} fonoke elesett, a falu zsakmanya a tied.`,
      money: moneyGain,
      xp: xpGain,
      fame: fameGain,
    });
    addLocalNotification(
      "Vilagterkep",
      `${city.name}: a falufonokot legyozted. +${moneyGain} $, +${xpGain} XP, +${fameGain} hirnev, +${influenceGain}% befolyas, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    postGameEvent("world_rival_capture", "Falufonok legyozve", `${city.name} most mar a te befolyasod alatt all.`, {
      cityId,
      cityName: city.name,
      money: moneyGain,
      xp: xpGain,
      fame: fameGain,
    });
    sceneRef?.setMessage(`${city.name}: a falufonok elesett. A falu most mar tribute-et fizet neked.`);
  } else {
    const moneyLoss = Math.min(state.money, Math.max(40, Math.round(city.rewardMoney * 0.24)));
    const healthLoss = clamp(12 + city.level * 7, 10, 34);
    const heatGain = applyHeat(9 + city.level);
    const influenceLoss = applyInfluenceLoss(4);
    state.money = Math.max(0, state.money - moneyLoss);
    state.health = clamp(state.health - healthLoss, 0, 100);
    state.naturalRecoveryAt.health = now;
    updateWorldRivalCity(cityId, (entry) => ({
      ...entry,
      weakened: true,
      power: Math.max(20, entry.power - Math.round(8 + entry.level * 3)),
      lastCaptureAt: now,
      attackCooldownUntil: now + WORLD_RIVAL_ATTACK_FAILURE_COOLDOWN_MS,
    }));
    queueRewardModal({
      title: "Falufőnök",
      text: `${city.name} fonoke visszaverte a tamadasodat. -${influenceLoss}% befolyas.`,
      money: -moneyLoss,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    addLocalNotification(
      "Vilagterkep",
      `${city.name}: a falufonok visszavert. -${moneyLoss} $, -${healthLoss} eletero, -${influenceLoss}% befolyas, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(`${city.name}: a falufonok meg ellenall. -${influenceLoss}% befolyas. Ujabb tamadas 15:00 mulva.`);
  }
  saveGame(true);
  sceneRef?.refreshHUD();
  hideWorldPlayerWheel();
  if (activeWorldRivalCityProfileId === cityId) {
    renderWorldRivalCityProfile(cityId, activeWorldRivalStructureId || "");
  } else {
    void openAuxPanel("world");
  }
  return success;
}

function repairWorldRivalStructure(cityId, structureId, specialization) {
  const city = getWorldRivalCityById(cityId);
  const structure = getWorldRivalStructureById(city, structureId);
  const normalizedSpecialization = specialization === "attack" ? "attack" : "defense";
  if (!city || city.status !== "captured" || !structure || Number(structure.hp) > 0) return false;
  const activeRepair = (city.structures || []).find((item) => isWorldRivalStructureRepairing(item));
  if (activeRepair && activeRepair.id !== structure.id) {
    sceneRef?.setMessage(`${activeRepair.name} felujitasa mar folyamatban van. Egy faluban egyszerre csak egy haz fejlesztheto.`);
    renderWorldRivalCityProfile(cityId, structureId);
    return false;
  }
  if (isWorldRivalStructureRepairing(structure)) {
    sceneRef?.setMessage(`${structure.name} felujitasa mar folyamatban van: ${formatCountdown(structure.repairReadyAt - Date.now())}.`);
    return false;
  }
  const cost = getWorldRivalStructureRepairCost(city, structure);
  if (state.money < cost) {
    sceneRef?.setMessage(`A felujitashoz ${cost} $ kell.`);
    return false;
  }
  const now = Date.now();
  state.money = Math.max(0, state.money - cost);
  updateWorldRivalCity(cityId, (entry) => ({
    ...entry,
    structures: (entry.structures || []).map((item) => item.id === structureId
      ? {
          ...item,
          specialization: normalizedSpecialization,
          pendingSpecialization: normalizedSpecialization,
          repairStartedAt: now,
          repairReadyAt: now + WORLD_RIVAL_STRUCTURE_REPAIR_MS,
        }
      : item),
  }));
  saveGame(true);
  sceneRef?.refreshHUD();
  sceneRef?.setMessage(`${structure.name} felujitasa elindult ${getWorldRivalStructureSpecializationLabel(normalizedSpecialization).toLowerCase()} iranyra. Hatralevo ido: 35:00.`);
  renderWorldRivalCityProfile(cityId, structureId);
  return true;
}

function runWorldRivalTribute(cityId) {
  const city = getWorldRivalCityById(cityId);
  if (!city || city.status !== "captured") return false;
  const now = Date.now();
  const incomeState = getWorldRivalIncomeState(city, now);
  if (!incomeState.ready) {
    sceneRef?.setMessage(`${city.name}: a kovetkezo tribute ${formatWorldRivalTributeTime(city.tributeReadyAt)} mulva jon.`);
    return false;
  }
  const moneyGain = incomeState.money;
  state.money = Math.max(0, Math.round(Number(state.money) || 0) + moneyGain);
  updateWorldRivalCity(cityId, (entry) => ({
    ...entry,
    tributeMoney: 0,
    tributeTargetMoney: randomInt(500, 1000),
    tributeCycleStartedAt: now,
    tributeReadyAt: now + WORLD_RIVAL_CITY_TRIBUTE_MS,
  }));
  queueRewardModal({
    title: "Tribute",
    text: `${city.name} befizette a negyoras bevetelt.`,
    money: moneyGain,
    xp: 0,
    fame: 0,
  });
  addLocalNotification(
    "Vilagterkep",
    `${city.name}: bejott a falubevetel. +${moneyGain} $${incomeState.influenceBonus ? ` (ebből +${incomeState.influenceBonus} $ befolyásbónusz)` : ""}.`,
    { messageType: "event" },
  );
  saveGame(true);
  sceneRef?.refreshHUD();
  hideWorldPlayerWheel();
  if (activeWorldRivalCityProfileId === cityId) {
    renderWorldRivalCityProfile(cityId, activeWorldRivalStructureId || "");
  } else {
    void openAuxPanel("world");
  }
  return true;
}

function postGameEvent(eventType, title, body, payload = {}) {
  if (!state.profileName) return;
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, title, body, payload }),
  });
}

function renderLeaderboardPanel(saves) {
  const entries = [...(saves || [])]
    .map((entry) => ({
      ...entry,
      level: Number.isFinite(Number(entry.level)) ? Number(entry.level) : getRankLevel(entry.fame || 0),
      rankTitle: entry.rankTitle || getCurrentRankEntry(entry.fame || 0)?.name || "Utcai figura",
      clanName: String(entry.clanName || entry.clan_name || "").trim(),
    }))
    .sort((left, right) =>
      (right.level - left.level)
      || (right.fame - left.fame)
      || (right.cityLevel - left.cityLevel)
      || (right.updatedAt - left.updatedAt))
    .slice(0, 20);
  const body = entries.length
    ? `
      <section class="leaderboard">
        <div class="leaderboard__table" role="table" aria-label="Jatekos ranglista">
          <div class="leaderboard__head" role="row">
            <span>Hely</span>
            <span>Nev</span>
            <span>Szint</span>
            <span>Hirnev</span>
            <span>Varos</span>
          </div>
          ${entries.map((entry, index) => `
            <article class="leaderboard__row${entry.profileName === state.profileName ? " is-self" : ""}" role="row">
              <span class="leaderboard__place">#${index + 1}</span>
              <span class="leaderboard__name">
                <strong>${escapeHtml(entry.profileName)}</strong>
                ${entry.clanName ? `<span class="leaderboard__clan">Clan: ${escapeHtml(entry.clanName)}</span>` : ""}
              </span>
              <span class="leaderboard__value">${entry.level}</span>
              <span class="leaderboard__value">${entry.fame}</span>
              <span class="leaderboard__value">${Math.max(0, Math.round(Number(entry.npcVillageVictories) || 0))} város</span>
            </article>
          `).join("")}
        </div>
      </section>
    `
    : `<div class="aux-panel__carditem"><strong>Meg nincs ranglista.</strong><div class="aux-panel__muted">Ments el nehany jatekot, es itt megjelennek a regisztralt jatekosok.</div></div>`;
  setAuxPanelContent("Ranglista", "Csaladi dosszie", body);
  auxPanel?.setAttribute("data-kind", "rank");
  activeAuxPanelKind = "rank";
}

function getMarketPanelHtml() {
  const stock = Array.isArray(state.marketStock) ? state.marketStock : [];
  const availableCount = stock.filter((entry) => Number(entry?.stock) > 0).length;
  return `
    <section class="market-panel">
      <article class="market-panel__hero">
        <div>
          <h3>Varosi piac</h3>
          <p>Fust, selyem, vas es suttogva eladott aruk. Itt a bandadnak hasznos cuccokat szerezhetsz, amiket a profilodnal azonnal fel is tudsz venni.</p>
        </div>
        <div class="market-panel__ledger">
          <strong>Kassza: ${state.money} $</strong>
          <span>Friss keszlet: ${new Date(state.marketRefreshAt).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}</span>
          <em>A piacon most ${availableCount} elerheto aru var rad.</em>
        </div>
      </article>
      <div class="market-panel__tools" data-market-tools>
        <label>
          <span>Slot</span>
          <select data-market-filter-slot>
            <option value="all">Mind</option>
            ${equipmentSlotOrder.map((slot) => `<option value="${slot}">${escapeHtml(equipmentSlotDefs[slot]?.label || slot)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Ritkaság</span>
          <select data-market-filter-rarity>
            <option value="all">Mind</option>
            <option value="gray">Szürke</option>
            <option value="yellow">Sárga</option>
            <option value="red">Piros</option>
          </select>
        </label>
        <label>
          <span>Rendezés</span>
          <select data-market-sort>
            <option value="default">Alap</option>
            <option value="upgrade">Jobb elöl</option>
            <option value="power">Erő szerint</option>
            <option value="price">Ár szerint</option>
          </select>
        </label>
        <label class="market-panel__upgrade-toggle">
          <input type="checkbox" data-market-upgrades-only>
          <span>Csak ami jobb</span>
        </label>
      </div>
      <div class="market-panel__grid">
        ${stock.map((entry) => {
          const soldOut = Number(entry?.stock) <= 0;
          const alreadyOwned = Array.isArray(state.itemInventory?.[entry.slot])
            && state.itemInventory[entry.slot].some((ownedItem) => ownedItem.id === entry.item.id);
          const discountedPrice = getMarketOfferPrice(entry);
          const discountPercent = Math.round(getInfluenceBenefits().marketDiscountRate * 1000) / 10;
          const cannotAfford = state.money < discountedPrice;
          const disabled = soldOut || alreadyOwned || cannotAfford;
          const upgradeDelta = getMarketOfferDeltaPower(entry.slot, entry.item);
          const isUpgrade = upgradeDelta > 0;
          return `
          <article
            class="market-item market-item--buying${alreadyOwned ? " is-owned" : ""}${soldOut ? " is-sold-out" : ""}"
            tabindex="0"
            data-market-card
            data-market-slot="${entry.slot}"
            data-market-rarity="${entry.item.rarity}"
            data-market-price="${discountedPrice}"
            data-market-power="${Math.max(0, Math.round(Number(entry.item.power) || 0))}"
            data-market-upgrade="${isUpgrade ? "1" : "0"}">
            <img class="market-item__art" src="${entry.item.image || getEquipmentArt(entry.slot)}" alt="${escapeHtml(entry.item.name)}">
            <div class="market-item__meta">
              <strong>${escapeHtml(entry.item.name)}</strong>
              <span class="market-item__rarity market-item__rarity--${entry.item.rarity}">${getEquipmentRarityLabel(entry.item.rarity)}</span>
            </div>
            <div class="market-item__copy">${escapeHtml(equipmentSlotDefs[entry.slot]?.label || entry.slot)} · ${getEquipmentBonusText(entry.slot, entry.item.power, entry.item.stat)}</div>
            <div class="market-item__stats">
              <span>Ara: <strong>${discountedPrice} $</strong>${discountPercent > 0 ? ` <del>${entry.price} $</del>` : ""}</span>
              <span>${entry.item.stat === "defense" ? "Vedel" : "Tamad"} a harcban</span>
            </div>
            ${isUpgrade ? `<span class="market-item__upgrade">Jobb mint rajtad +${upgradeDelta}</span>` : ""}
            <button
              class="market-item__buy"
              type="button"
              data-market-buy="${escapeHtml(entry.item.id)}"
              ${disabled ? "disabled" : ""}>
              ${soldOut ? "Elfogyott" : alreadyOwned ? "Elkelt" : cannotAfford ? "Nincs eleg penz" : "Megveszem"}
            </button>
            ${getMarketEquippedCompareHtml(entry.slot, entry.item)}
          </article>
        `;
        }).join("")}
      </div>
      <div class="market-panel__footnote">A megvett item bekerul a felszereleseid koze, es a karakterlapodon tudod felvenni.</div>
    </section>
  `;
}

function applyMarketPanelFilters(rootElement) {
  const root = rootElement || auxPanelBody;
  const grid = root?.querySelector(".market-panel__grid");
  if (!grid) return;
  const slotFilter = root.querySelector("[data-market-filter-slot]")?.value || "all";
  const rarityFilter = root.querySelector("[data-market-filter-rarity]")?.value || "all";
  const sortMode = root.querySelector("[data-market-sort]")?.value || "default";
  const upgradesOnly = Boolean(root.querySelector("[data-market-upgrades-only]")?.checked);
  const cards = [...grid.querySelectorAll("[data-market-card]")];
  cards.forEach((card, index) => {
    if (!card.dataset.marketDefaultOrder) card.dataset.marketDefaultOrder = String(index);
    const visible = (slotFilter === "all" || card.dataset.marketSlot === slotFilter)
      && (rarityFilter === "all" || card.dataset.marketRarity === rarityFilter)
      && (!upgradesOnly || card.dataset.marketUpgrade === "1");
    card.classList.toggle("hidden", !visible);
  });
  const sorters = {
    default: (left, right) => Number(left.dataset.marketDefaultOrder || 0) - Number(right.dataset.marketDefaultOrder || 0),
    upgrade: (left, right) => (Number(right.dataset.marketUpgrade || 0) - Number(left.dataset.marketUpgrade || 0))
      || (Number(right.dataset.marketPower || 0) - Number(left.dataset.marketPower || 0)),
    power: (left, right) => Number(right.dataset.marketPower || 0) - Number(left.dataset.marketPower || 0),
    price: (left, right) => Number(left.dataset.marketPrice || 0) - Number(right.dataset.marketPrice || 0),
  };
  cards.sort(sorters[sortMode] || sorters.default).forEach((card) => grid.appendChild(card));
  const visibleCount = cards.filter((card) => !card.classList.contains("hidden")).length;
  let empty = grid.querySelector(".market-panel__empty-filter");
  if (!visibleCount) {
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "market-panel__empty-filter";
      empty.textContent = "Nincs ilyen aru a mostani keszletben.";
      grid.appendChild(empty);
    }
  } else {
    empty?.remove();
  }
}

function bindMarketPanelControls(rootElement) {
  const root = rootElement || auxPanelBody;
  root?.querySelectorAll("[data-market-filter-slot], [data-market-filter-rarity], [data-market-sort], [data-market-upgrades-only]").forEach((control) => {
    control.addEventListener("change", () => applyMarketPanelFilters(root));
  });
  applyMarketPanelFilters(root);
}

function bindMarketBuyButtons(rootElement, options = {}) {
  rootElement?.querySelectorAll("[data-market-buy]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (button.dataset.marketBusy === "1") return;
      button.dataset.marketBusy = "1";
      button.disabled = true;
      await buyMarketItem(button.dataset.marketBuy, options);
      if (button.isConnected) {
        delete button.dataset.marketBusy;
        button.disabled = false;
      }
    });
  });
  bindMarketPanelControls(rootElement);
}

function applyMarketApiItems(source) {
  const items = Array.isArray(source) ? source : [];
  state.marketStock = normalizeMarketStock(items.map((entry) => {
    const payload = entry?.payload && typeof entry.payload === "object" ? entry.payload : {};
    const payloadItem = payload?.item && typeof payload.item === "object" ? payload.item : {};
    return {
      ...payload,
      slot: entry?.slotKey || payload.slot,
      stock: Number.isFinite(Number(entry?.stock)) ? Number(entry.stock) : payload.stock,
      price: Number.isFinite(Number(entry?.price)) ? Number(entry.price) : payload.price,
      item: {
        ...payloadItem,
        id: String(entry?.itemId || payloadItem.id || ""),
        name: entry?.itemName || payloadItem.name,
        rarity: entry?.rarity || payloadItem.rarity,
        power: Number.isFinite(Number(entry?.statValue)) ? Number(entry.statValue) : payloadItem.power,
        stat: entry?.statKind === "defense" ? "defense" : (entry?.statKind === "attack" ? "attack" : payloadItem.stat),
      },
    };
  }));
  const expirations = items
    .map((entry) => Number(entry?.expiresAt))
    .filter((value) => Number.isFinite(value) && value > Date.now());
  state.marketRefreshAt = expirations.length ? Math.min(...expirations) : 0;
  state.marketCatalogVersion = EQUIPMENT_CATALOG_VERSION;
  return state.marketStock.length;
}

async function fetchMarketApiItems() {
  const response = await fetch(`/api/market-items?limit=${MARKET_MAX_OFFERS}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({ items: [] }));
  if (!response.ok) throw new Error(payload.error || "A piaci keszlet nem toltheto be.");
  return Array.isArray(payload.items) ? payload.items : [];
}

async function syncMarketStockFromServer() {
  if (!state.profileName) return false;
  const items = await fetchMarketApiItems();
  if (items.length >= MARKET_MAX_OFFERS) {
    applyMarketApiItems(items);
    return true;
  }

  // A megvett ajanlatok stock=0 allapotban a kozos lejaratig latszanak. A POST
  // csak akkor ker idozitett teljes cseret, ha a szerver egyetlen aktualis sort
  // sem adott vissza (uj profil vagy lejart teljes keszlet).
  const generatedStock = normalizeMarketStock(generateMarketStock(
    `${state.profileName}-server-refresh-${items.length}-${Date.now()}`,
    Date.now(),
  ));
  const response = await fetch("/api/market-items/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ marketStock: generatedStock }),
  });
  const payload = await response.json().catch(() => ({ items: [] }));
  if (!response.ok) {
    state.marketStock = [];
    state.marketRefreshAt = 0;
    throw new Error(payload.error || "Az uj piaci keszlet nem mentheto.");
  }
  if (!applyMarketApiItems(payload.items)) {
    state.marketStock = [];
    state.marketRefreshAt = 0;
    throw new Error("A szerver nem adott vissza vasarolhato piaci arut.");
  }
  return true;
}

function renderBlackMarketPanel() {
  const body = getMarketPanelHtml();
  setAuxPanelContent("Piac", "1930-as arucsarnok", body);
  auxPanel?.setAttribute("data-kind", "market");
  bindMarketBuyButtons(auxPanelBody);
  activeAuxPanelKind = "market";
}

let clanPanelData = null;
let clanActiveTab = "members";
let clanWarCountdownTimer = null;
let clanWarRefreshTimer = null;
let clanWarRefreshInFlight = false;

function getClanMemberName(member) {
  return member?.display_name || member?.profile_name || "Ismeretlen";
}

function formatClanLastSeen(timestamp) {
  const elapsed = Date.now() - Number(timestamp || 0);
  if (elapsed < 5 * 60 * 1000) return "Most aktív";
  if (elapsed < 60 * 60 * 1000) return `${Math.max(1, Math.floor(elapsed / 60000))} perce`;
  if (elapsed < 24 * 60 * 60 * 1000) return `${Math.floor(elapsed / 3600000)} órája`;
  return new Date(Number(timestamp || 0)).toLocaleDateString("hu-HU");
}

function getClanRoleLabel(role, data = clanPanelData) {
  const configuredRole = (Array.isArray(data?.roles) ? data.roles : []).find((entry) => entry.roleKey === role);
  if (configuredRole?.roleName) return configuredRole.roleName;
  if (role === "fonok") return "Családfő";
  if (role === "alvezeto") return "Alvezér";
  return "Katona";
}

function hasClanPermission(data, permission) {
  return Boolean(data?.isBoss || data?.permissions?.[permission]);
}

function getClanWarTimeLeft(endsAt) {
  const totalSeconds = Math.max(0, Math.ceil((Number(endsAt || 0) - getSynchronizedNow()) / 1000));
  if (!totalSeconds) return "Lezárult";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} óra ${minutes} perc ${seconds} mp`;
  if (minutes > 0) return `${minutes} perc ${seconds} mp`;
  return `${seconds} mp`;
}

function stopClanWarCountdownTimer() {
  if (!clanWarCountdownTimer) return;
  window.clearInterval(clanWarCountdownTimer);
  clanWarCountdownTimer = null;
}

function stopClanWarRefreshTimer() {
  if (!clanWarRefreshTimer) return;
  window.clearInterval(clanWarRefreshTimer);
  clanWarRefreshTimer = null;
}

function updateClanWarCountdowns() {
  const countdowns = [...(auxPanelBody?.querySelectorAll("[data-clan-war-countdown]") || [])];
  let activeCount = 0;
  countdowns.forEach((element) => {
    const endsAt = Number(element.dataset.clanWarCountdown) || 0;
    const isActive = endsAt > getSynchronizedNow();
    element.textContent = isActive ? getClanWarTimeLeft(endsAt) : "Lezárult";
    const card = element.closest(".clan-war-card");
    if (isActive) {
      activeCount += 1;
      card?.classList.add("is-active");
      return;
    }
    card?.classList.remove("is-active");
    element.removeAttribute("data-clan-war-countdown");
    const ribbon = card?.querySelector(".clan-war-card__ribbon");
    if (ribbon) ribbon.textContent = "Lezárt akta";
  });
  const activeCounter = auxPanelBody?.querySelector("[data-clan-war-active-count]");
  if (activeCounter) activeCounter.textContent = `${activeCount} aktív`;
  return activeCount;
}

function isClanWarCountdownViewOpen() {
  return activeAuxPanelKind === "clan-war-report"
    || (activeAuxPanelKind === "clan" && clanActiveTab === "wars");
}

function startClanWarCountdownTimer() {
  stopClanWarCountdownTimer();
  if (!isClanWarCountdownViewOpen()) return;
  const activeCount = updateClanWarCountdowns();
  if (!activeCount) return;
  clanWarCountdownTimer = window.setInterval(() => {
    if (!isClanWarCountdownViewOpen() || auxPanel?.classList.contains("hidden")) {
      stopClanWarCountdownTimer();
      return;
    }
    if (!updateClanWarCountdowns()) stopClanWarCountdownTimer();
  }, 1000);
}

function startClanWarRefreshTimer() {
  stopClanWarRefreshTimer();
  if (activeAuxPanelKind !== "clan" || clanActiveTab !== "wars") return;
  clanWarRefreshTimer = window.setInterval(async () => {
    if (activeAuxPanelKind !== "clan" || clanActiveTab !== "wars" || auxPanel?.classList.contains("hidden")) {
      stopClanWarRefreshTimer();
      return;
    }
    if (clanWarRefreshInFlight) return;
    clanWarRefreshInFlight = true;
    try {
      await loadClanPanel({ silent: true });
    } finally {
      clanWarRefreshInFlight = false;
    }
  }, 10000);
}

function getClanMembersHtml(data) {
  const members = Array.isArray(data.members) ? data.members : [];
  const roles = Array.isArray(data.roles) ? data.roles : [];
  const isBoss = Boolean(data.isBoss);
  return `
    <section class="clan-dossier">
      <div class="clan-section-heading">
        <div><span>A család emberei</span><h3>Klántagok</h3></div>
        <strong>${members.length} fő</strong>
      </div>
      <div class="clan-member-list">
        ${members.map((member, index) => {
          const isSelf = member.profile_name === state.profileName;
          const canManage = isBoss && !isSelf && member.member_role !== "fonok";
          const hasActions = isSelf || canManage;
          return `
          <article class="clan-member-card${isSelf ? " is-self" : ""}${hasActions ? " is-actionable" : ""}"${hasActions ? ` data-clan-member-card="${escapeHtml(member.profile_name)}" tabindex="0"` : ""}>
            <div class="clan-member-card__number">${String(index + 1).padStart(2, "0")}</div>
            <div class="clan-member-card__seal">${member.member_role === "fonok" ? "♛" : "M"}</div>
            <div class="clan-member-card__identity">
              <strong>${escapeHtml(getClanMemberName(member))}</strong>
              <span>${escapeHtml(member.rank_title || "Utcai figura")}</span>
            </div>
            <div class="clan-member-card__stat clan-member-card__role"><small>Rang</small><strong>${escapeHtml(getClanRoleLabel(member.member_role, data))}</strong></div>
            <div class="clan-member-card__stat"><small>Hírnév</small><strong>${Math.max(0, Number(member.fame) || 0)}</strong></div>
            <div class="clan-member-card__status${Date.now() - Number(member.last_seen_at || 0) < 5 * 60 * 1000 ? " is-online" : ""}">${hasActions ? "Műveletek ▾" : formatClanLastSeen(member.last_seen_at)}</div>
            ${hasActions ? `
              <div class="clan-member-actions">
                <div class="clan-member-actions__identity"><small>${isSelf ? "Saját tagságod" : "Kiválasztott ember"}</small><strong>${escapeHtml(getClanMemberName(member))}</strong></div>
                ${canManage ? `
                  <label><span>Új rang</span><select data-clan-member-role="${escapeHtml(member.profile_name)}" aria-label="${escapeHtml(getClanMemberName(member))} új rangja">
                    ${roles.filter((role) => role.roleKey !== "fonok").map((role) => `<option value="${escapeHtml(role.roleKey)}"${role.roleKey === member.member_role ? " selected" : ""}>${escapeHtml(role.roleName)}</option>`).join("")}
                  </select></label>
                  <button class="clan-member-action clan-member-action--kick" type="button" data-clan-kick="${escapeHtml(member.profile_name)}">Kirúgom a klánból</button>
                ` : `
                  <p>${member.member_role === "fonok" && members.length > 1 ? "Kilépéskor a vezetést a legmagasabb rangú megmaradt tag kapja." : "Kilépés után csak új meghívóval térhetsz vissza."}</p>
                  <button class="clan-member-action clan-member-action--leave" type="button" data-clan-leave>Kilépek a klánból</button>
                `}
                <span class="clan-member-actions__status" aria-live="polite"></span>
              </div>
            ` : ""}
          </article>
        `;
        }).join("") || `<div class="clan-empty-note">A családi névsor még üres.</div>`}
      </div>
      <div class="clan-panel__notice" id="clanPanelNotice" aria-live="polite"></div>
    </section>
  `;
}

function getClanRecruitHtml(data) {
  const canInvite = hasClanPermission(data, "inviteMembers");
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const pendingNames = new Set((Array.isArray(data.invitations) ? data.invitations : [])
    .filter((entry) => entry.status === "pending" && Number(entry.expiresAt) > getSynchronizedNow())
    .map((entry) => entry.profileName));
  return `
    <section class="clan-dossier">
      <div class="clan-section-heading">
        <div><span>Új emberek az utcáról</span><h3>Játékos felvétele</h3></div>
        <strong>${candidates.length} jelölt</strong>
      </div>
      ${canInvite ? `
        <label class="clan-player-search">
          <span>⌕</span>
          <input id="clanPlayerSearch" type="search" placeholder="Játékos keresése név alapján..." autocomplete="off">
        </label>
        <div class="clan-candidate-list" id="clanCandidateList">
          ${candidates.map((candidate) => `
            <article class="clan-candidate" data-clan-candidate="${escapeHtml(String(candidate.profile_name || "").toLowerCase())}">
              <div class="clan-candidate__avatar">${escapeHtml(String(getClanMemberName(candidate)).slice(0, 1).toUpperCase())}</div>
              <div class="clan-candidate__copy">
                <strong>${escapeHtml(getClanMemberName(candidate))}</strong>
                <span>${escapeHtml(candidate.rank_title || "Utcai figura")} · ${Math.max(0, Number(candidate.fame) || 0)} hírnév</span>
              </div>
              <div class="clan-candidate__seen">${formatClanLastSeen(candidate.last_seen_at)}</div>
              <button class="clan-action-button" type="button" data-clan-recruit="${escapeHtml(candidate.profile_name)}"${pendingNames.has(candidate.profile_name) ? " disabled" : ""}>${pendingNames.has(candidate.profile_name) ? "Meghívva" : "Meghívó"}</button>
            </article>
          `).join("") || `<div class="clan-empty-note">Jelenleg nincs szabad játékos, akit felvehetnél.</div>`}
        </div>
      ` : `<div class="clan-empty-note">A rangod nem küldhet játékosmeghívót.</div>`}
      <div class="clan-panel__notice" id="clanPanelNotice" aria-live="polite"></div>
    </section>
  `;
}

function getClanWarParticipantListHtml(war, side) {
  const participants = (Array.isArray(war?.participants) ? war.participants : [])
    .filter((entry) => entry.side === side)
    .sort((left, right) => Number(right.totalPower || 0) - Number(left.totalPower || 0));
  return participants.length
    ? participants.map((participant, index) => `
      <article class="clan-war-fighter">
        <div class="clan-war-fighter__rank">${String(index + 1).padStart(2, "0")}</div>
        <div class="clan-war-fighter__identity">
          <strong>${escapeHtml(participant.profileName || "Ismeretlen")}</strong>
          <span>${Math.max(0, Number(participant.crewCount) || 0)} megvásárolt bandatag</span>
        </div>
        <div><small>Saját karakter</small><strong>${Math.max(0, Number(participant.combat?.playerAttack) || 0)} T / ${Math.max(0, Number(participant.combat?.playerDefense) || 0)} V</strong></div>
        <div><small>Bandatagok</small><strong>${Math.max(0, Number(participant.combat?.crewAttack) || 0)} T / ${Math.max(0, Number(participant.combat?.crewDefense) || 0)} V</strong></div>
        <div class="clan-war-fighter__power"><small>Összerő</small><strong>${Math.max(0, Number(participant.totalPower) || 0)}</strong></div>
      </article>
    `).join("")
    : `<div class="clan-empty-note">Erről az oldalról még senki nem fogadta el a részvételt.</div>`;
}

function getClanWarReportHtml(data, war) {
  const active = war.status === "active" && Number(war.endsAt) > getSynchronizedNow();
  const attackerScore = Math.max(0, Number(war.attackerScore) || 0);
  const defenderScore = Math.max(0, Number(war.defenderScore) || 0);
  const winnerClanId = war.outcome?.winnerClanId || (attackerScore === defenderScore ? null : attackerScore > defenderScore ? war.attackerClanId : war.defenderClanId);
  const winnerName = winnerClanId === war.attackerClanId ? war.attackerClanName : winnerClanId === war.defenderClanId ? war.defenderClanName : "";
  const participants = Array.isArray(war.participants) ? war.participants : [];
  const strongest = [...participants].sort((left, right) => Number(right.totalPower || 0) - Number(left.totalPower || 0))[0] || null;
  const resultTitle = winnerName
    ? `${escapeHtml(winnerName)} ${active ? "jelenleg vezet" : "megnyerte a háborút"}`
    : (active ? "Jelenleg döntetlen" : "A háború döntetlennel zárult");
  return `
    <section class="clan-war-report">
      <header class="clan-war-report__hero ${active ? "is-active" : "is-finished"}">
        <span>${active ? "Élő hadijelentés" : "Lezárt csatajelentés"}</span>
        <h2>${resultTitle}</h2>
        <div class="clan-war-report__versus">
          <div><small>Támadó család</small><strong>${escapeHtml(war.attackerClanName || "Ismeretlen")}</strong><b>${attackerScore}</b></div>
          <i>VS</i>
          <div><small>Védekező család</small><strong>${escapeHtml(war.defenderClanName || "Ismeretlen")}</strong><b>${defenderScore}</b></div>
        </div>
        ${active ? `<time data-clan-war-countdown="${Math.max(0, Number(war.endsAt) || 0)}">${getClanWarTimeLeft(war.endsAt)}</time>` : `<time>${new Date(Number(war.endsAt) || Date.now()).toLocaleString("hu-HU")}</time>`}
      </header>
      <div class="clan-war-report__summary">
        <div><small>${escapeHtml(war.attackerClanName || "Támadók")}</small><strong>${Math.max(0, Number(war.attackerTeam?.participantCount) || 0)} fő</strong><span>${Math.max(0, Number(war.attackerTeam?.attack) || 0)} támadás · ${Math.max(0, Number(war.attackerTeam?.defense) || 0)} védelem</span></div>
        <div><small>${escapeHtml(war.defenderClanName || "Védők")}</small><strong>${Math.max(0, Number(war.defenderTeam?.participantCount) || 0)} fő</strong><span>${Math.max(0, Number(war.defenderTeam?.attack) || 0)} támadás · ${Math.max(0, Number(war.defenderTeam?.defense) || 0)} védelem</span></div>
        <div><small>Legerősebb harcos</small><strong>${escapeHtml(strongest?.profileName || "Nincs résztvevő")}</strong><span>${strongest ? `${Math.max(0, Number(strongest.totalPower) || 0)} összerő` : "–"}</span></div>
      </div>
      <section class="clan-war-report__side">
        <div class="clan-section-heading"><div><span>Támadó oldal</span><h3>${escapeHtml(war.attackerClanName || "Ismeretlen")}</h3></div><strong>${attackerScore} összerő</strong></div>
        <div class="clan-war-fighter-list">${getClanWarParticipantListHtml(war, "attacker")}</div>
      </section>
      <section class="clan-war-report__side">
        <div class="clan-section-heading"><div><span>Védekező oldal</span><h3>${escapeHtml(war.defenderClanName || "Ismeretlen")}</h3></div><strong>${defenderScore} összerő</strong></div>
        <div class="clan-war-fighter-list">${getClanWarParticipantListHtml(war, "defender")}</div>
      </section>
      <button class="clan-action-button clan-war-report__back" type="button" data-clan-war-report-back>Vissza a klánháborúkhoz</button>
    </section>
  `;
}

function renderClanWarReport(data, war) {
  if (!data?.clan || !war) return;
  setAuxPanelContent("Csatajelentés", `${war.attackerClanName || "Ismeretlen"} · ${war.defenderClanName || "Ismeretlen"}`, getClanWarReportHtml(data, war));
  auxPanel?.setAttribute("data-kind", "clan-war-report");
  activeAuxPanelKind = "clan-war-report";
  auxPanelBody?.querySelector("[data-clan-war-report-back]")?.addEventListener("click", () => renderClanPanel(data));
  if (war.status === "active" && Number(war.endsAt) > getSynchronizedNow()) startClanWarCountdownTimer();
}

function getClanWarsHtml(data) {
  const clan = data.clan;
  const canDeclareWar = hasClanPermission(data, "declareWar");
  const rivals = Array.isArray(data.rivals) ? data.rivals : [];
  const wars = Array.isArray(data.wars) ? data.wars : [];
  const activeWars = wars.filter((war) => war.status === "active" && Number(war.endsAt) > Date.now());
  return `
    <section class="clan-dossier clan-war-room">
      <div class="clan-section-heading">
        <div><span>Hadüzenetek és leszámolások</span><h3>Bandaháború</h3></div>
        <strong data-clan-war-active-count>${activeWars.length} aktív</strong>
      </div>
      ${canDeclareWar ? `
        <div class="clan-war-declare">
          <div><small>Rivális család kijelölése</small><strong>A háború 24 órán át tart</strong></div>
          <select id="clanWarTarget" ${rivals.length ? "" : "disabled"}>
            ${rivals.map((rival) => `<option value="${escapeHtml(rival.clanId)}">${escapeHtml(rival.clanName)} · ${Math.max(0, Number(rival.notoriety) || 0)} hírnév</option>`).join("") || `<option>Nincs elérhető rivális</option>`}
          </select>
          <button class="clan-action-button clan-action-button--war" id="clanDeclareWar" type="button" ${rivals.length ? "" : "disabled"}>Hadüzenet</button>
        </div>
      ` : `<div class="clan-empty-note">A rangod nem indíthat bandaháborút.</div>`}
      <div class="clan-war-list">
        ${wars.map((war) => {
          const ownIsAttacker = war.attackerClanId === clan.clanId;
          const opponent = ownIsAttacker ? war.defenderClanName : war.attackerClanName;
          const ownScore = ownIsAttacker ? war.attackerScore : war.defenderScore;
          const enemyScore = ownIsAttacker ? war.defenderScore : war.attackerScore;
          const ownTeam = ownIsAttacker ? war.attackerTeam : war.defenderTeam;
          const enemyTeam = ownIsAttacker ? war.defenderTeam : war.attackerTeam;
          const active = war.status === "active" && Number(war.endsAt) > Date.now();
          const endsAt = Math.max(0, Math.round(Number(war.endsAt) || 0));
          const ownAccepted = Boolean(war.accepted);
          const joiningPower = Math.max(0, Number(data.warCombat?.totalPower) || 0);
          return `
            <article class="clan-war-card${active ? " is-active" : ""}">
              <div class="clan-war-card__ribbon">${active ? "Háborúban" : "Lezárt akta"}</div>
              <div class="clan-war-card__families"><strong>${escapeHtml(clan.clanName)}</strong><span>VS</span><strong>${escapeHtml(opponent || "Ismeretlen")}</strong></div>
              <div class="clan-war-card__score"><small>Összerő</small>${Number(ownScore) || 0}<span>:</span>${Number(enemyScore) || 0}</div>
              <div class="clan-war-card__time"${active ? ` data-clan-war-countdown="${endsAt}"` : ""}>${active ? getClanWarTimeLeft(endsAt) : new Date(war.endsAt).toLocaleDateString("hu-HU")}</div>
              <div class="clan-war-card__teams">
                <span><strong>${Math.max(0, Number(ownTeam?.participantCount) || 0)} elfogadó</strong> · Támadás ${Math.max(0, Number(ownTeam?.attack) || 0)} · Védelem ${Math.max(0, Number(ownTeam?.defense) || 0)}</span>
                <span><strong>${Math.max(0, Number(enemyTeam?.participantCount) || 0)} ellenfél</strong> · Támadás ${Math.max(0, Number(enemyTeam?.attack) || 0)} · Védelem ${Math.max(0, Number(enemyTeam?.defense) || 0)}</span>
              </div>
              <div class="clan-war-card__join">
                <div>
                ${active ? `
                  ${ownAccepted
                    ? `<strong class="is-accepted">✓ Csatlakoztál a háborúhoz</strong>`
                    : `<button class="clan-action-button clan-action-button--war" type="button" data-clan-war-accept="${Number(war.warId) || 0}">Csatlakozom a háborúhoz</button>`}
                  <small>Saját összerőd: ${joiningPower} · Saját karakter és ${Math.max(0, Number(data.warCombat?.crewCount) || 0)} megvásárolt bandatag</small>
                ` : `<strong class="${war.outcome?.draw ? "" : war.outcome?.winnerClanId === clan.clanId ? "is-accepted" : ""}">${war.outcome?.draw ? "Döntetlen" : war.outcome?.winnerClanId === clan.clanId ? "✓ Győzelem" : "Vereség"}</strong>`}
                </div>
                <button class="clan-action-button clan-war-card__report-button" type="button" data-clan-war-report="${Number(war.warId) || 0}">${active ? "Erőlista" : "Csatajelentés"}</button>
              </div>
            </article>
          `;
        }).join("") || `<div class="clan-empty-note">Még egyetlen bandaháború sem került a családi krónikába.</div>`}
      </div>
      <div class="clan-panel__notice" id="clanPanelNotice" aria-live="polite"></div>
    </section>
  `;
}

function getClanRolesHtml(data) {
  const roles = Array.isArray(data.roles) ? data.roles : [];
  return `
    <section class="clan-dossier clan-roles-panel">
      <div class="clan-section-heading">
        <div><span>Hatalom és felelősség</span><h3>Rangok és jogok</h3></div>
        <strong>${roles.length} rang</strong>
      </div>
      <p class="clan-roles-panel__intro">A családfő kioszthatja a rangokat a taglistában. Itt meghatározhatja, melyik rang küldhet meghívót és indíthat bandaháborút.</p>
      <div class="clan-role-list">
        ${roles.map((role) => {
          const locked = role.roleKey === "fonok" || !data.isBoss;
          return `
            <form class="clan-role-card${locked ? " is-locked" : ""}" data-clan-role-form="${escapeHtml(role.roleKey)}">
              <div class="clan-role-card__crest">${role.roleKey === "fonok" ? "♛" : "M"}</div>
              <label class="clan-role-card__name"><small>Rang neve</small><input name="roleName" maxlength="64" minlength="2" value="${escapeHtml(role.roleName)}" ${locked ? "readonly" : ""}></label>
              <label class="clan-role-permission"><input name="inviteMembers" type="checkbox"${role.permissions?.inviteMembers ? " checked" : ""}${locked ? " disabled" : ""}><span>Játékosok meghívása</span></label>
              <label class="clan-role-permission"><input name="declareWar" type="checkbox"${role.permissions?.declareWar ? " checked" : ""}${locked ? " disabled" : ""}><span>Bandaháború indítása</span></label>
              ${locked ? `<span class="clan-role-card__locked">${role.roleKey === "fonok" ? "Teljes jogkör" : "Csak a családfő szerkesztheti"}</span>` : `<button class="clan-action-button" type="submit">Jogok mentése</button>`}
              <span class="clan-role-card__status" aria-live="polite"></span>
            </form>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function bindClanPanelActions(data) {
  auxPanelBody?.querySelectorAll("[data-clan-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      clanActiveTab = button.dataset.clanTab || "members";
      renderClanPanel(data);
    });
  });
  const createForm = document.getElementById("clanCreateForm");
  createForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const notice = document.getElementById("clanPanelNotice");
    const submit = createForm.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      const response = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ clanName: createForm.clanName.value, description: createForm.description.value }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Nem sikerült megalapítani a családot.");
      state.clanName = payload.clanName;
      state.clanDescription = createForm.description.value.trim();
      saveGame();
      await loadClanPanel();
    } catch (error) {
      if (notice) notice.textContent = error.message;
      submit.disabled = false;
    }
  });
  const search = document.getElementById("clanPlayerSearch");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    auxPanelBody.querySelectorAll("[data-clan-candidate]").forEach((row) => {
      row.classList.toggle("hidden", Boolean(query) && !row.dataset.clanCandidate.includes(query));
    });
  });
  auxPanelBody?.querySelectorAll("[data-clan-recruit]").forEach((button) => {
    button.addEventListener("click", async () => {
      const notice = document.getElementById("clanPanelNotice");
      button.disabled = true;
      try {
        const response = await fetch("/api/clans/members", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ profileName: button.dataset.clanRecruit }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A meghívó elküldése sikertelen.");
        await loadClanPanel();
      } catch (error) {
        if (notice) notice.textContent = error.message;
        button.disabled = false;
      }
    });
  });
  auxPanelBody?.querySelectorAll("[data-clan-member-card]").forEach((card) => {
    const toggleCard = () => {
      auxPanelBody.querySelectorAll("[data-clan-member-card].is-open").forEach((entry) => {
        if (entry !== card) entry.classList.remove("is-open");
      });
      card.classList.toggle("is-open");
    };
    card.addEventListener("click", (event) => {
      if (event.target.closest(".clan-member-actions")) return;
      toggleCard();
    });
    card.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === card) {
        event.preventDefault();
        toggleCard();
      }
    });
  });
  auxPanelBody?.querySelectorAll("[data-clan-kick]").forEach((button) => {
    button.addEventListener("click", async () => {
      const profileName = button.dataset.clanKick || "";
      const status = button.closest(".clan-member-actions")?.querySelector(".clan-member-actions__status");
      if (!window.confirm(`Biztosan kirúgod ${profileName} játékost a klánból?`)) return;
      button.disabled = true;
      try {
        const response = await fetch(`/api/clans/members/${encodeURIComponent(profileName)}`, { method: "DELETE", headers: { Accept: "application/json" } });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A kirúgás sikertelen.");
        await loadClanPanel();
      } catch (error) {
        if (status) status.textContent = error.message;
        button.disabled = false;
      }
    });
  });
  auxPanelBody?.querySelector("[data-clan-leave]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const status = button.closest(".clan-member-actions")?.querySelector(".clan-member-actions__status");
    if (!window.confirm("Biztosan kilépsz a klánból? A visszatéréshez új meghívóra lesz szükséged.")) return;
    button.disabled = true;
    try {
      const response = await fetch("/api/clans/leave", { method: "POST", headers: { Accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "A kilépés sikertelen.");
      state.clanName = "";
      state.clanDescription = "";
      state.clanTreasury = 0;
      saveGame(true);
      clanPanelData = null;
      clanActiveTab = "members";
      await loadClanPanel();
    } catch (error) {
      if (status) status.textContent = error.message;
      button.disabled = false;
    }
  });
  auxPanelBody?.querySelectorAll("[data-clan-member-role]").forEach((select) => {
    select.addEventListener("change", async () => {
      const previousRole = data.members?.find((member) => member.profile_name === select.dataset.clanMemberRole)?.member_role || "katona";
      select.disabled = true;
      try {
        const response = await fetch("/api/clans/member-role", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ profileName: select.dataset.clanMemberRole, roleKey: select.value }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A rang kiosztása sikertelen.");
        await loadClanPanel();
      } catch (error) {
        select.value = previousRole;
        select.disabled = false;
        const notice = document.getElementById("clanPanelNotice");
        if (notice) notice.textContent = error.message;
      }
    });
  });
  auxPanelBody?.querySelectorAll("[data-clan-role-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector(".clan-role-card__status");
      button.disabled = true;
      try {
        const response = await fetch("/api/clans/roles", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            roleKey: form.dataset.clanRoleForm,
            roleName: form.roleName.value,
            permissions: {
              inviteMembers: Boolean(form.inviteMembers?.checked),
              declareWar: Boolean(form.declareWar?.checked),
            },
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A rangjogok mentése sikertelen.");
        if (status) status.textContent = "A rang és a jogok elmentve.";
        window.setTimeout(() => loadClanPanel(), 500);
      } catch (error) {
        if (status) status.textContent = error.message;
        button.disabled = false;
      }
    });
  });
  document.getElementById("clanDeclareWar")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const target = document.getElementById("clanWarTarget");
    const notice = document.getElementById("clanPanelNotice");
    button.disabled = true;
    try {
      const response = await fetch("/api/clans/wars", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ targetClanId: target?.value }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "A hadüzenet sikertelen.");
      await loadClanPanel();
    } catch (error) {
      if (notice) notice.textContent = error.message;
      button.disabled = false;
    }
  });
  auxPanelBody?.querySelectorAll("[data-clan-war-accept]").forEach((button) => {
    button.addEventListener("click", async () => {
      const warId = Number(button.dataset.clanWarAccept) || 0;
      const notice = document.getElementById("clanPanelNotice");
      if (!warId) return;
      button.disabled = true;
      button.textContent = "Csatlakozás...";
      try {
        const response = await fetch(`/api/clans/wars/${warId}/accept`, {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "A csatlakozás sikertelen.");
        await loadClanPanel();
      } catch (error) {
        if (notice) notice.textContent = error.message;
        button.disabled = false;
        button.textContent = "Csatlakozom a háborúhoz";
      }
    });
  });
  auxPanelBody?.querySelectorAll("[data-clan-war-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const warId = Number(button.dataset.clanWarReport) || 0;
      const war = (Array.isArray(data?.wars) ? data.wars : []).find((entry) => Number(entry.warId) === warId);
      if (war) renderClanWarReport(data, war);
    });
  });
}

function renderClanPanel(data = clanPanelData) {
  if (!data) {
    setAuxPanelContent("Klán", "Családi ügyek", `<div class="clan-loading"><span>M</span><strong>A családi akták betöltése...</strong></div>`);
    auxPanel?.setAttribute("data-kind", "clan");
    activeAuxPanelKind = "clan";
    return;
  }
  if (!data.clan) {
    const suggestedName = `${state.profileName || "Új"} családja`;
    const body = `
      <section class="clan-foundation">
        <div class="clan-foundation__crest"><span>M</span></div>
        <div class="clan-foundation__copy"><span>New York · 1930</span><h2>Alapíts saját családot</h2><p>Adj nevet a családnak, gyűjts hűséges embereket, és írd be a neved az alvilág krónikájába.</p></div>
        <form class="clan-create-form" id="clanCreateForm">
          <label><span>A család neve</span><input name="clanName" maxlength="40" minlength="3" value="${escapeHtml(suggestedName)}" required></label>
          <label><span>A család jelmondata</span><textarea name="description" maxlength="220" placeholder="Hűség. Becsület. Hallgatás."></textarea></label>
          <button class="clan-action-button clan-action-button--found" type="submit">A család megalapítása</button>
        </form>
        <div class="clan-panel__notice" id="clanPanelNotice" aria-live="polite"></div>
      </section>
    `;
    setAuxPanelContent("Klán", "A család mindenek felett", body);
    auxPanel?.setAttribute("data-kind", "clan");
    activeAuxPanelKind = "clan";
    bindClanPanelActions(data);
    return;
  }
  const clan = data.clan;
  const tabBody = clanActiveTab === "recruit"
    ? getClanRecruitHtml(data)
    : clanActiveTab === "wars"
      ? getClanWarsHtml(data)
      : clanActiveTab === "roles"
        ? getClanRolesHtml(data)
        : getClanMembersHtml(data);
  const body = `
    <section class="clan-hq">
      <header class="clan-hq__masthead">
        <div class="clan-hq__crest"><span>M</span></div>
        <div class="clan-hq__identity"><span>A család</span><h2>${escapeHtml(clan.clanName)}</h2><p>${escapeHtml(clan.description || "Hűség. Becsület. Hallgatás.")}</p></div>
        <div class="clan-hq__ledger"><small>Családfő</small><strong>${escapeHtml(clan.bossProfileName || "Ismeretlen")}</strong><span>${Math.max(0, Number(clan.notoriety) || 0)} hírnév</span></div>
      </header>
      <nav class="clan-tabs" aria-label="Klán menüpontok">
        <button type="button" data-clan-tab="wars" class="${clanActiveTab === "wars" ? "is-active" : ""}"><span>⚔</span>Bandaháború</button>
        <button type="button" data-clan-tab="recruit" class="${clanActiveTab === "recruit" ? "is-active" : ""}"><span>✚</span>Játékos felvétele</button>
        <button type="button" data-clan-tab="members" class="${clanActiveTab === "members" ? "is-active" : ""}"><span>♟</span>Klántagok</button>
        <button type="button" data-clan-tab="roles" class="${clanActiveTab === "roles" ? "is-active" : ""}"><span>♛</span>Rangok és jogok</button>
      </nav>
      ${tabBody}
    </section>
  `;
  setAuxPanelContent("Klán", "Családi ügyek · 1930", body);
  auxPanel?.setAttribute("data-kind", "clan");
  activeAuxPanelKind = "clan";
  bindClanPanelActions(data);
  if (clanActiveTab === "wars") {
    startClanWarCountdownTimer();
    startClanWarRefreshTimer();
  } else {
    stopClanWarCountdownTimer();
    stopClanWarRefreshTimer();
  }
}

async function loadClanPanel(options = {}) {
  const silent = Boolean(options.silent);
  const previousScrollTop = silent ? Math.max(0, Number(auxPanelBody?.scrollTop) || 0) : 0;
  if (!silent) renderClanPanel(null);
  try {
    const response = await fetch("/api/clans/dashboard", { headers: { Accept: "application/json" } });
    observeServerClock(response);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "A klánadatok nem tölthetők be.");
    clanPanelData = payload;
    renderClanPanel(payload);
    if (silent && auxPanelBody) auxPanelBody.scrollTop = previousScrollTop;
  } catch (error) {
    if (silent) return;
    setAuxPanelContent("Klán", "Családi ügyek", `<div class="clan-empty-note">${escapeHtml(error.message)}</div>`);
    auxPanel?.setAttribute("data-kind", "clan");
    activeAuxPanelKind = "clan";
  }
}

async function buyMarketItem(itemId, options = {}) {
  const offer = (state.marketStock || []).find((entry) => entry.item.id === itemId);
  if (offer && state.money < getMarketOfferPrice(offer)) {
    sceneRef?.setMessage("Nincs eleg penzed ehhez az aruhoz.");
    return false;
  }
  const alreadyOwned = offer && Array.isArray(state.itemInventory?.[offer.slot])
    && state.itemInventory[offer.slot].some((entry) => entry.id === offer.item.id);
  if (alreadyOwned) {
    sceneRef?.setMessage("Ez a darab mar ott van a cuccaid kozott.");
    return false;
  }
  try {
    const result = await requestServerEconomy("market-buy", { itemId });
    const purchasedId = String(result.item?.id || itemId);
    const purchasedSlot = equipmentSlotOrder.includes(result.item?.slot) ? result.item.slot : offer?.slot;
    let inventoryContainsPurchase = Boolean(purchasedSlot)
      && Array.isArray(state.itemInventory?.[purchasedSlot])
      && state.itemInventory[purchasedSlot].some((item) => String(item?.id || "") === purchasedId);
    if (!inventoryContainsPurchase && state.profileName) {
      await loadGame(state.profileName);
      inventoryContainsPurchase = Boolean(purchasedSlot)
        && Array.isArray(state.itemInventory?.[purchasedSlot])
        && state.itemInventory[purchasedSlot].some((item) => String(item?.id || "") === purchasedId);
    }
    if (!inventoryContainsPurchase) throw new Error("A szerver nem igazolta vissza a targyat a leltarban.");
    // The bought offer is immediately replaced so the market keeps eight
    // purchasable items until the scheduled full rotation.
    try { await syncMarketStockFromServer(); } catch (refreshError) {
      console.warn("A feketepiac vasarlas utani feltoltese sikertelen:", refreshError);
    }
    if (options.rerender !== false) renderBlackMarketPanel();
    if (typeof options.afterBuy === "function") options.afterBuy();
    sceneRef?.refreshHUD();
    sceneRef?.setMessage(`${result.item?.name || offer?.item?.name || "Az aru"} megveve a piacrol. A szerver levonta: ${result.price} $.`);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A vasarlas nem sikerult.");
    try { await syncMarketStockFromServer(); } catch { /* Az eredeti szerverhiba mar lathato. */ }
    if (options.rerender !== false) renderBlackMarketPanel();
    if (typeof options.afterBuy === "function") options.afterBuy();
    return false;
  }
}

function renderWorldMapPanel() {
  renderWorldMapPanelWithSaves([]);
}

function renderWorldMapPanelWithSaves(saves = []) {
  const occupiedLots = buildWorldLotOccupancy(saves);
  const rivalSnapshotBefore = JSON.stringify(normalizeWorldRivalCities(state.worldRivalCities));
  const rivalCities = syncWorldRivalCities(occupiedLots);
  if (state.registered && rivalSnapshotBefore !== JSON.stringify(rivalCities)) {
    saveGame(true);
  }
  const ownLot = getWorldMapLotById(state.worldBaseLotId);
  const selectionMode = Boolean(state.needsWorldBaseSelection);
  const metrics = getWorldMapCanvasMetrics();
  const body = `
    <section class="worldmap">
      ${buildWorldMapSelectionBar(ownLot, selectionMode)}

      <div class="worldmap__stage" id="worldMapStage">
        <div class="worldmap__viewport">
          <div
            class="worldmap__canvas"
            id="worldMapCanvas"
            style="width:${metrics.width}px; height:${metrics.height}px;"
          >
            <img class="worldmap__canvas-art" src="${WORLD_MAP_CONTINUOUS_SRC}" srcset="${WORLD_MAP_CONTINUOUS_SRCSET}" sizes="100vw" alt="" aria-hidden="true" loading="lazy" decoding="async">
            ${worldMapLotDefs.map((lot) => buildWorldMapLotButton(lot, occupiedLots[lot.id], selectionMode)).join("")}
            ${selectionMode ? "" : rivalCities.map((city) => buildWorldRivalCityButton(city)).join("")}
          </div>
        </div>
        <div id="worldPlayerWheel" class="world-player-wheel hidden" aria-hidden="true"></div>
      </div>
    </section>
  `;
  setAuxPanelContent(selectionMode ? "Válaszd ki a városod helyét" : "Világtérkép", "", body);
  auxPanel?.setAttribute("data-kind", "world");
  if (selectionMode && auxPanel) auxPanel.dataset.worldSelection = "true";
  if (!selectionMode && auxPanelHeaderTools) {
    auxPanelHeaderTools.innerHTML = `
      <div class="worldmap__searchrow worldmap__searchrow--header">
        <input id="worldMapSearch" type="text" placeholder="Kereses: C2 vagy 46:28" autocomplete="off" aria-label="Telek keresese">
        <button id="worldMapSearchBtn" type="button">Kereses</button>
      </div>
    `;
  }
  document.body.classList.add("is-world-map-open");
  activeAuxPanelKind = "world";
  bindWorldMapInteractions(occupiedLots, rivalCities, selectionMode);
}

function selectWorldBaseLot(lotId) {
  const lot = getWorldMapLotById(lotId);
  if (!lot) return;
  state.worldBaseLotId = lot.id;
  state.worldBaseLevel = Math.max(1, Number(state.worldBaseLevel) || 1);
  state.needsWorldBaseSelection = false;
  sceneRef?.pushLog(`Varos helye kijelolve: ${lot.code} (${lot.coord}).`);
  sceneRef?.setMessage(`A varosod helye kijelolve: ${lot.code} / ${lot.coord}.`);
  saveGame(true);
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  hideAuxPanel();
  document.body.classList.remove("is-world-map-open");
  mentorCardOpen = true;
  if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
  updateMentorPanel();
}

function hideWorldPlayerWheel() {
  const wheel = document.getElementById("worldPlayerWheel");
  wheel?.classList.add("hidden");
  wheel?.setAttribute("aria-hidden", "true");
  if (wheel) wheel.replaceChildren();
}

function showWorldRivalCityWheel(city, clientX, clientY) {
  const wheel = document.getElementById("worldPlayerWheel");
  const stage = document.getElementById("worldMapStage");
  if (!wheel || !stage || !city?.id) return;
  const stageRect = stage.getBoundingClientRect();
  const x = clamp(clientX - stageRect.left, 112, stageRect.width - 112);
  const y = clamp(clientY - stageRect.top, 112, stageRect.height - 112);
  const remainingStructures = getWorldRivalRemainingStructures(city).length;
  const incomeState = getWorldRivalIncomeState(city);
  wheel.style.left = `${x}px`;
  wheel.style.top = `${y}px`;
  wheel.innerHTML = `
    <div class="world-player-wheel__ring world-player-wheel__ring--rival">
      <button type="button" class="world-player-wheel__action world-player-wheel__action--profile" data-world-rival-action="profile">Profil</button>
      ${city.status === "captured"
        ? `<button type="button" class="world-player-wheel__action world-player-wheel__action--message" data-world-rival-action="tribute">Beszedes</button>`
        : ``}
      <div class="world-player-wheel__core">
        <strong>${escapeHtml(city.name)}</strong>
        <span>${city.status === "captured" ? `Sajat falu | ${incomeState.money} $ | ${incomeState.ready ? "beszedheto" : formatWorldRivalHoursMinutes(incomeState.remainingMs)}` : `${remainingStructures} haz all`}</span>
      </div>
    </div>
  `;
  wheel.classList.remove("hidden");
  wheel.setAttribute("aria-hidden", "false");
  wheel.querySelectorAll("[data-world-rival-action]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const action = button.dataset.worldRivalAction;
      if (action === "profile") {
        hideWorldPlayerWheel();
        openWorldRivalCityProfile(city.id);
        return;
      }
      if (action === "tribute") {
        runWorldRivalTribute(city.id);
      }
    });
  });
}

function showWorldPlayerWheel(owner, clientX, clientY) {
  const wheel = document.getElementById("worldPlayerWheel");
  const stage = document.getElementById("worldMapStage");
  if (!wheel || !stage || !owner?.profileName || owner.profileName === state.profileName) return;
  const stageRect = stage.getBoundingClientRect();
  const x = clamp(clientX - stageRect.left, 112, stageRect.width - 112);
  const y = clamp(clientY - stageRect.top, 112, stageRect.height - 112);
  wheel.style.left = `${x}px`;
  wheel.style.top = `${y}px`;
  wheel.innerHTML = `
    <div class="world-player-wheel__ring">
      <button type="button" class="world-player-wheel__action world-player-wheel__action--profile" data-world-player-action="profile">Adatlap</button>
      <button type="button" class="world-player-wheel__action world-player-wheel__action--pvp" data-world-player-action="pvp">PvP</button>
      <button type="button" class="world-player-wheel__action world-player-wheel__action--message" data-world-player-action="message">Üzenet</button>
      <button type="button" class="world-player-wheel__action world-player-wheel__action--close" data-world-player-action="close">Bezárás</button>
      <div class="world-player-wheel__core">
        <strong>${escapeHtml(owner.profileName)}</strong>
        <span>${getWorldLotHouseLevel(owner)}. szintű bázis</span>
      </div>
    </div>
  `;
  wheel.classList.remove("hidden");
  wheel.setAttribute("aria-hidden", "false");
  wheel.querySelectorAll("[data-world-player-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const action = button.dataset.worldPlayerAction;
      if (action === "close") {
        hideWorldPlayerWheel();
      } else if (action === "profile") {
        void openPublicPlayerProfile(owner.profileName);
      } else if (action === "message") {
        void openPublicPlayerProfile(owner.profileName, true);
      } else if (action === "pvp") {
        void runWorldPvpAttack(owner.profileName);
      }
    });
  });
}

function bindWorldMapInteractions(occupiedLots, rivalCities, selectionMode) {
  const searchInput = document.getElementById("worldMapSearch");
  const searchButton = document.getElementById("worldMapSearchBtn");
  const chooseButton = document.getElementById("worldMapChooseBtn");
  const titleEl = document.getElementById("worldMapLotTitle");
  const textEl = document.getElementById("worldMapLotText");
  const metaEl = document.getElementById("worldMapLotMeta");
  const stageEl = document.getElementById("worldMapStage");
  const canvasEl = document.getElementById("worldMapCanvas");
  const lotButtons = [...document.querySelectorAll("[data-world-lot]")];
  const rivalButtons = [...document.querySelectorAll("[data-world-rival]")];
  let selectedLotId = state.worldBaseLotId;
  let suppressClickUntil = 0;
  const camera = {
    x: 0,
    y: 0,
  };
  const dragState = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  };

  const clampCamera = () => {
    if (!stageEl || !canvasEl) return;
    const minX = Math.min(0, stageEl.clientWidth - canvasEl.offsetWidth);
    const minY = Math.min(0, stageEl.clientHeight - canvasEl.offsetHeight);
    camera.x = clamp(camera.x, minX, 0);
    camera.y = clamp(camera.y, minY, 0);
  };

  const applyCamera = (smooth = false) => {
    if (!canvasEl) return;
    clampCamera();
    canvasEl.style.transition = smooth ? "transform 220ms ease" : "none";
    canvasEl.style.transform = `translate3d(${Math.round(camera.x)}px, ${Math.round(camera.y)}px, 0)`;
  };

  const centerLotInView = (button) => {
    if (!button || !stageEl) return;
    const lotX = Number(button.dataset.worldX || 0);
    const lotY = Number(button.dataset.worldY || 0);
    camera.x = (stageEl.clientWidth / 2) - lotX;
    camera.y = (stageEl.clientHeight / 2) - lotY;
    applyCamera(true);
  };

  const renderSelection = (lotId, options = {}) => {
    const { center = false } = options;
    selectedLotId = lotId;
    const lot = getWorldMapLotById(lotId);
    if (!lot) return;
    const owner = occupiedLots[lot.id];
    const isOwn = owner?.profileName === state.profileName;
    const isOccupied = Boolean(owner);
    let activeButton = null;
    lotButtons.forEach((button) => {
      const isMatch = button.dataset.worldLot === lot.id;
      button.classList.toggle("is-selected", isMatch);
      if (isMatch) activeButton = button;
    });
    if (titleEl) titleEl.textContent = owner?.profileName || `${lot.code} / ${lot.coord}`;
    if (textEl) {
      textEl.textContent = getWorldLotStatusText(owner, isOwn);
    }
    if (metaEl) {
      metaEl.textContent = getWorldLotMetaText(owner, isOwn);
    }
    if (chooseButton) {
      const canChoose = selectionMode && (!isOccupied || isOwn);
      chooseButton.disabled = !canChoose;
      chooseButton.textContent = canChoose ? "Ez lesz a varosom" : "Ez a telek most nem valaszthato";
      chooseButton.dataset.worldLot = lot.id;
    }
    if (center) centerLotInView(activeButton);
  };

  const endDrag = () => {
    if (!dragState.active) return;
    dragState.active = false;
    dragState.pointerId = null;
    stageEl?.classList.remove("is-dragging");
    if (dragState.moved) {
      suppressClickUntil = Date.now() + 180;
    }
  };

  stageEl?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest?.("[data-world-lot], [data-world-rival], .world-player-wheel")) return;
    hideWorldPlayerWheel();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.originX = camera.x;
    dragState.originY = camera.y;
    dragState.moved = false;
    stageEl.classList.add("is-dragging");
    stageEl.setPointerCapture?.(event.pointerId);
  }, true);

  stageEl?.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  stageEl?.addEventListener("pointermove", (event) => {
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(dx, dy) > 5) {
      dragState.moved = true;
    }
    if (!dragState.moved) return;
    camera.x = dragState.originX + dx;
    camera.y = dragState.originY + dy;
    applyCamera(false);
  });

  stageEl?.addEventListener("pointerup", endDrag);
  stageEl?.addEventListener("pointercancel", endDrag);
  stageEl?.addEventListener("pointerleave", (event) => {
    if (dragState.active && dragState.pointerId === event.pointerId) {
      endDrag();
    }
  });

  lotButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => renderSelection(button.dataset.worldLot));
    button.addEventListener("focus", () => renderSelection(button.dataset.worldLot));
    button.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) return;
      const lotId = button.dataset.worldLot;
      const owner = occupiedLots[lotId];
      const isOwn = owner?.profileName === state.profileName;
      renderSelection(lotId, { center: !owner || isOwn || selectionMode });
      if (owner && !isOwn && !selectionMode) {
        showWorldPlayerWheel(owner, event.clientX, event.clientY);
      } else {
        hideWorldPlayerWheel();
      }
    });
  });

  rivalButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      const city = rivalCities.find((entry) => entry.id === button.dataset.worldRival);
      if (textEl && city) textEl.textContent = getWorldRivalCityStatusText(city);
    });
    button.addEventListener("focus", () => {
      const city = rivalCities.find((entry) => entry.id === button.dataset.worldRival);
      if (textEl && city) textEl.textContent = getWorldRivalCityStatusText(city);
    });
    button.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) return;
      hideWorldPlayerWheel();
      const city = rivalCities.find((entry) => entry.id === button.dataset.worldRival);
      if (!city) return;
      if (titleEl) titleEl.textContent = city.name;
      if (textEl) textEl.textContent = getWorldRivalCityStatusText(city);
      if (metaEl) {
        const incomeState = getWorldRivalIncomeState(city);
        metaEl.textContent = city.status === "captured"
          ? `Allapot: elfoglalt | Bevetel: ${incomeState.money} $ | ${incomeState.ready ? "beszedheto" : formatWorldRivalHoursMinutes(incomeState.remainingMs)}`
          : `Allapot: rivalis | Szint: ${city.level} | Ero: ${city.power}`;
      }
      if (chooseButton) chooseButton.disabled = true;
      showWorldRivalCityWheel(city, event.clientX, event.clientY);
    });
  });

  chooseButton?.addEventListener("click", () => {
    const lotId = chooseButton.dataset.worldLot;
    if (!lotId) return;
    selectWorldBaseLot(lotId);
  });

  const runSearch = () => {
    const rawQuery = String(searchInput?.value || "").trim();
    const normalizedQuery = rawQuery.toLocaleLowerCase("hu-HU");
    let lot = parseWorldMapQuery(rawQuery);
    if (!lot && normalizedQuery) {
      const occupiedEntries = Object.entries(occupiedLots || {});
      const exactPlayer = occupiedEntries.find(([, owner]) =>
        String(owner?.profileName || "").trim().toLocaleLowerCase("hu-HU") === normalizedQuery,
      );
      const partialPlayers = exactPlayer ? [] : occupiedEntries.filter(([, owner]) =>
        String(owner?.profileName || "").trim().toLocaleLowerCase("hu-HU").includes(normalizedQuery),
      );
      const playerMatch = exactPlayer || (partialPlayers.length === 1 ? partialPlayers[0] : null);
      if (playerMatch) lot = getWorldMapLotById(playerMatch[0]);
      if (!lot && partialPlayers.length > 1) {
        sceneRef?.setMessage("Tobb jatekos neve is illik a keresesre. Irj be pontosabb nevet.");
        searchInput?.focus();
        return;
      }
    }
    if (!lot) {
      sceneRef?.setMessage("Nem talaltam ilyen jatekost, telekkodot vagy koordinatat a terkepen.");
      searchInput?.focus();
      return;
    }
    renderSelection(lot.id, { center: true });
    const owner = occupiedLots?.[lot.id];
    sceneRef?.setMessage(owner?.profileName
      ? `${owner.profileName} haza a terkep kozepe kerult.`
      : `${lot.code} / ${lot.coord} telek a terkep kozepe kerult.`);
  };

  searchButton?.addEventListener("click", runSearch);
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    runSearch();
  });

  if (selectedLotId) {
    renderSelection(selectedLotId, { center: true });
  } else if (lotButtons.length) {
    const fallbackButton = lotButtons[Math.floor(lotButtons.length / 2)];
    renderSelection(fallbackButton.dataset.worldLot, { center: true });
  }
  applyCamera(false);
}

async function openAuxPanel(kind) {
  hideChoiceWheel();
  hideQuestCard();
  if (kind === "rank") {
    setAuxPanelContent("Ranglista", "Csaladi dosszie", `<div class="aux-panel__carditem"><strong>Betoltes...</strong><div class="aux-panel__muted">A regisztralt jatekosok aktait kerem le a szerverrol.</div></div>`);
    activeAuxPanelKind = "rank";
    try {
      const response = await fetch(`/api/leaderboard?season=global&limit=20`, { headers: { Accept: "application/json" } });
      const payload = response.ok ? await response.json() : { entries: [] };
      renderLeaderboardPanel(Array.isArray(payload.entries) ? payload.entries : []);
    } catch {
      setAuxPanelContent("Ranglista", "Csaladi dosszie", `<div class="aux-panel__carditem"><strong>Nem sikerult betolteni.</strong><div class="aux-panel__muted">A szerver most nem ad vissza ranglistat.</div></div>`);
      activeAuxPanelKind = "rank";
    }
    return;
  }
  if (kind === "market") {
    try {
      await syncMarketStockFromServer();
    } catch (error) {
      // A stale local offer can never be purchased safely. Fail closed and
      // show no offers until the authoritative server stock is available.
      state.marketStock = [];
      state.marketRefreshAt = 0;
      sceneRef?.setMessage(error.message || "A piaci keszlet nem toltheto be.");
    }
    renderBlackMarketPanel();
    return;
  }
  if (kind === "clan") {
    await loadClanPanel();
    return;
  }
  if (kind === "messages") {
    await openMessagesPanel();
    return;
  }
  if (kind === "world") {
    state.mentorFlags.sawWorld = true;
    completeMentorStep("world");
    try {
      const response = await fetch(`/api/world-lots`, { headers: { Accept: "application/json" } });
      const payload = response.ok ? await response.json() : { lots: [] };
      renderWorldMapPanelWithSaves(Array.isArray(payload.lots) ? payload.lots : []);
    } catch {
      renderWorldMapPanelWithSaves([]);
    }
    return;
  }
  if (kind === "harbor") {
    showHarborMapView();
    return;
  }
}

function isHudOrDialogTarget(target) {
  return Boolean(
    target?.closest?.(
      ".hud-root, .choice-wheel, .lot-info-modal, .robbery-game, .character-panel, .aux-panel",
    ),
  );
}

function startMapDrag(event) {
  if (!MAP_DRAG_ENABLED) return false;
  if (!state.registered) return false;
  if (event.button !== undefined && event.button !== 0) return false;
  if (!event.isPrimary) return false;
  if (isHudOrDialogTarget(event.target)) return false;
  const canvas = document.querySelector("#gameRoot canvas");
  const mapTarget = Boolean(
    event.target?.closest?.("#mapSvgOverlay, #mapBackgroundLayer, #gameRoot canvas") || event.target === canvas,
  );
  if (!mapTarget && event.target !== document.body && event.target !== document.documentElement) return false;

  mapDragState.active = true;
  mapDragState.dragging = false;
  mapDragState.pointerId = event.pointerId ?? "mouse";
  mapDragState.startX = event.clientX;
  mapDragState.startY = event.clientY;
  mapDragState.originX = mapPan.x;
  mapDragState.originY = mapPan.y;
  event.target?.setPointerCapture?.(event.pointerId);
  return true;
}

function updateMapDrag(event) {
  if (!mapDragState.active || (event.pointerId ?? "mouse") !== mapDragState.pointerId) return;
  const deltaX = event.clientX - mapDragState.startX;
  const deltaY = event.clientY - mapDragState.startY;
  if (!mapDragState.dragging) {
    if (Math.abs(deltaX) < 4 && Math.abs(deltaY) < 4) return;
    mapDragState.dragging = true;
    document.body.classList.add("is-dragging-map");
  }
  setMapPan(mapDragState.originX + deltaX, mapDragState.originY + deltaY);
  mapDragState.ignoreClicksUntil = Date.now() + 220;
  event.preventDefault();
}

function endMapDrag(event) {
  if (!mapDragState.active || (event.pointerId ?? "mouse") !== mapDragState.pointerId) return;
  const wasDragging = mapDragState.dragging;
  event.target?.releasePointerCapture?.(event.pointerId);
  mapDragState.active = false;
  mapDragState.dragging = false;
  mapDragState.pointerId = null;
  document.body.classList.remove("is-dragging-map");
  if (wasDragging) {
    mapDragState.ignoreClicksUntil = Date.now() + 250;
    event.preventDefault();
  }
}

function suppressClickAfterMapDrag(event) {
  if (Date.now() <= mapDragState.ignoreClicksUntil) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

const QUEST_MONEY_REWARD_MAX = 666;
const questRewardActionWeights = {
  robbery: 56,
  protection: 52,
  harbor_job: 64,
  cargo_spend: 62,
  cargo_acquire: 56,
  market_buy: 54,
  garage_run: 72,
};

function hashQuestRewardSeed(value) {
  let hash = 2166136261;
  const text = String(value || "quest");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function calculateQuestMoneyReward(quest = {}, difficulty = 50) {
  const normalizedDifficulty = clamp(Math.round(Number(difficulty) || 0), 0, 100);
  const goals = Array.isArray(quest.steps) && quest.steps.length ? quest.steps : [quest.goal || quest];
  const complexity = goals.reduce((sum, goal) => {
    const action = String(goal?.action || quest.type || "robbery");
    const target = clamp(Math.round(Number(goal?.target) || 1), 1, 12);
    return sum + (questRewardActionWeights[action] || 50) + target * 14;
  }, 0);
  const center = clamp(Math.round(
    55
    + normalizedDifficulty * 1.3
    + complexity * 0.82
    + Math.max(0, goals.length - 1) * 22,
  ), 60, 620);
  const spread = clamp(Math.round(center * 0.16), 22, 90);
  const minimum = Math.max(45, center - spread);
  const maximum = Math.min(QUEST_MONEY_REWARD_MAX, center + spread);
  const seed = [
    quest.id,
    quest.signature,
    quest.createdAt,
    normalizedDifficulty,
    goals.map((goal) => `${goal?.action || ""}:${goal?.mode || ""}:${goal?.target || 1}`).join("|"),
  ].join("#");
  return minimum + (hashQuestRewardSeed(seed) % (maximum - minimum + 1));
}

configureAvatarCard();

const BUILDING_KEYS = [
  "building-type-a",
  "building-type-b",
  "building-type-c",
  "building-type-d",
  "building-type-e",
  "building-type-f",
  "building-type-g",
  "building-type-h",
  "building-type-i",
  "building-type-j",
  "building-type-k",
  "building-type-l",
  "building-type-m",
  "building-type-n",
  "building-type-o",
  "building-type-p",
  "building-type-q",
  "building-type-r",
  "building-type-s",
  "building-type-t",
  "building-type-u",
];

const ROAD_KEYS = [
  "road-asphalt-straight",
  "road-asphalt-side",
  "road-asphalt-corner",
  "road-asphalt-corner-inner",
  "road-asphalt-corner-outer",
  "road-asphalt-pavement",
  "road-asphalt-center",
  "road-dirt-straight",
  "road-dirt-side",
  "road-dirt-corner",
  "road-dirt-pavement",
];

const DECOR_KEYS = [
  "tree-a",
  "tree-b",
  "detail-light-single",
  "detail-light-double",
  "detail-awning-small",
  "detail-awning-wide",
  "detail-bench",
  "detail-barrier-type-a",
  "detail-barrier-type-b",
  "detail-dumpster-closed",
  "detail-dumpster-open",
  "grass-corner",
  "grass-corner-inner",
  "fence",
  "fence-low",
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCountdown(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60);
  if (hours > 0) {
    return `${hours}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function getProtectionCooldownRemaining(spotId, now = getSynchronizedNow()) {
  const expiresAt = Number(state.protectionCooldowns?.[spotId]) || 0;
  return Math.max(0, expiresAt - now);
}

function normalizeRecoveryEffect(effect) {
  if (!effect || typeof effect !== "object") return null;
  const startedAt = Number(effect.startedAt);
  const endsAt = Number(effect.endsAt);
  const appliedAmount = Number(effect.appliedAmount);
  if (!Number.isFinite(startedAt) || !Number.isFinite(endsAt) || endsAt <= startedAt) return null;
  return {
    startedAt,
    endsAt,
    appliedAmount: clamp(Number.isFinite(appliedAmount) ? Math.floor(appliedAmount) : 0, 0, RECOVERY_AMOUNT),
    spotId: String(effect.spotId || "").trim().slice(0, 80),
    spotName: String(effect.spotName || "").trim().slice(0, 80),
  };
}

function normalizeRecoveryUsage(source = {}, now = getSynchronizedNow()) {
  const normalize = (entry) => {
    const uses = clamp(Math.floor(Number(entry?.uses) || 0), 0, RECOVERY_USAGE_LIMIT);
    const resetAt = Number(entry?.resetAt);
    if (Number.isFinite(resetAt) && resetAt > now) return { uses, resetAt };
    if (uses > 0 && !Number.isFinite(resetAt)) return { uses, resetAt: now + RECOVERY_USAGE_RESET_MS };
    return {
      uses: 0,
      resetAt: 0,
    };
  };
  return {
    health: normalize(source?.health),
    energy: normalize(source?.energy),
  };
}

function getRecoveryUsageState(stat, now = getSynchronizedNow()) {
  state.recoveryUsage = normalizeRecoveryUsage(state.recoveryUsage, now);
  return state.recoveryUsage[stat === "energy" ? "energy" : "health"];
}

function getRecoveryActionLabel(stat) {
  return stat === "energy" ? "A Találkozó" : "A Lapulás";
}

function normalizeTimedActions() {
  const now = getSynchronizedNow();
  const cooldowns = {};
  if (state.protectionCooldowns && typeof state.protectionCooldowns === "object") {
    Object.entries(state.protectionCooldowns).forEach(([spotId, expiresAt]) => {
      if (getSpotById(spotId) && Number.isFinite(Number(expiresAt)) && Number(expiresAt) > now) {
        cooldowns[spotId] = Number(expiresAt);
      }
    });
  }
  state.protectionCooldowns = cooldowns;
  state.recoveryEffects = {
    health: normalizeRecoveryEffect(state.recoveryEffects?.health),
    energy: normalizeRecoveryEffect(state.recoveryEffects?.energy),
  };
  state.recoveryUsage = normalizeRecoveryUsage(state.recoveryUsage, now);
  state.naturalRecoveryAt = {
    health: Number.isFinite(Number(state.naturalRecoveryAt?.health)) ? Number(state.naturalRecoveryAt.health) : now,
    energy: Number.isFinite(Number(state.naturalRecoveryAt?.energy)) ? Number(state.naturalRecoveryAt.energy) : now,
  };
  state.nextPolicePressureAt = Number.isFinite(Number(state.nextPolicePressureAt))
    ? Number(state.nextPolicePressureAt)
    : 0;
  state.pendingProtectionRewards = normalizePendingProtectionRewards(state.pendingProtectionRewards);
  state.processTasks = normalizeProcessTasks(state.processTasks);
  state.harborProcessTasks = normalizeProcessTasks(state.harborProcessTasks);
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0));
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent, now);
  state.rivalNextSpawnAt = normalizeRivalNextSpawnAt(state.rivalNextSpawnAt, now);
  state.baseRestDay = Number.isFinite(Number(state.baseRestDay)) ? Math.floor(Number(state.baseRestDay)) : 0;
  state.baseRestAvailableAt = Number.isFinite(Number(state.baseRestAvailableAt))
    ? Math.max(0, Number(state.baseRestAvailableAt))
    : state.baseRestDay === state.day
      ? now + BASE_REST_COOLDOWN_MS
      : 0;
  state.buildingDifficultyCycle = Number.isFinite(Number(state.buildingDifficultyCycle))
    ? Math.floor(Number(state.buildingDifficultyCycle))
    : getBuildingDifficultyCycle(now);
  state.hideUsesToday = clamp(Number.isFinite(Number(state.hideUsesToday)) ? Math.floor(Number(state.hideUsesToday)) : 0, 0, RECOVERY_USAGE_LIMIT);
  state.hideUsesDay = Number.isFinite(Number(state.hideUsesDay)) ? Math.floor(Number(state.hideUsesDay)) : state.day;
}

let policeRaidSyncInFlight = false;

function processPolicePressure() {
  if (state.registered) void syncPoliceRaidFromServer();
  return false;
}

async function syncPoliceRaidFromServer() {
  if (!state.registered || policeRaidSyncInFlight) return false;
  policeRaidSyncInFlight = true;
  try {
    const response = await fetch("/api/actions/police-raid", {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "A razzia mentese sikertelen.");
    markServerMutation(response, payload);
    if (payload.state && typeof payload.state === "object") {
      if (Number.isFinite(Number(payload.state.money))) state.money = Number(payload.state.money);
      if (Number.isFinite(Number(payload.state.heat))) state.heat = Number(payload.state.heat);
      if (payload.state.smuggledGoods) state.smuggledGoods = normalizeSmuggledGoods(payload.state.smuggledGoods);
      if (Number.isFinite(Number(payload.state.nextPolicePressureAt))) {
        state.nextPolicePressureAt = Number(payload.state.nextPolicePressureAt);
      }
      sceneRef?.refreshHUD();
    }
    if (payload.triggered) {
      const cargoLoss = normalizeSmuggledGoods(payload.cargoLoss);
      const cargoLossText = formatCargoLoss(cargoLoss);
      const loss = Math.max(0, Number(payload.moneyLoss) || 0);
      const lossPercent = Math.max(0, Number(payload.moneyLossPercent) || 0);
      const heatBefore = Math.max(0, Number(payload.heatBefore) || 0);
      const heatLoss = Math.max(0, Number(payload.heatLoss) || 0);
      const summaryText = `A ${heatBefore}%-os körözés miatt a nyomozók a kasszád ${lossPercent}%-át vitték el.${cargoLossText ? ` Csempészárut is elkoboztak: ${cargoLossText}.` : ""}`;
      sceneRef?.pushLog(`Rendőri razzia: -${loss} $${cargoLossText ? `, elkobzott áru: ${cargoLossText}` : ""}, -${heatLoss}% körözés.`);
      sceneRef?.setMessage(cargoLossText ? `Razzia: -${loss} $, elkobzott áru: ${cargoLossText}.` : `Razzia: -${loss} $.`);
      showPoliceRaidPanel(loss, summaryText, cargoLoss);
    }
    return Boolean(payload.triggered);
  } catch (error) {
    sceneRef?.setMessage(error.message || "A razzia szerveres mentese nem sikerult.");
    return false;
  } finally {
    policeRaidSyncInFlight = false;
  }
}

function syncNaturalRecovery(now = Date.now()) {
  let changed = false;
  ["health", "energy"].forEach((stat) => {
    if (state[stat] >= 100) {
      state.naturalRecoveryAt[stat] = now;
      return;
    }
    const lastRecoveryAt = Math.min(now, state.naturalRecoveryAt[stat]);
    const recoveredPoints = Math.floor((now - lastRecoveryAt) / NATURAL_RECOVERY_POINT_MS);
    if (recoveredPoints <= 0) return;
    state[stat] = clamp(state[stat] + recoveredPoints, 0, 100);
    state.naturalRecoveryAt[stat] = state[stat] >= 100
      ? now
      : lastRecoveryAt + recoveredPoints * NATURAL_RECOVERY_POINT_MS;
    changed = true;
  });
  return changed;
}

function normalizePendingProtectionRewards(source) {
  return (Array.isArray(source) ? source : [])
    .map((entry) => ({
      id: String(entry?.id || `protection-${Date.now()}-${Math.random()}`),
      spotId: typeof entry?.spotId === "string" ? entry.spotId : null,
      buildingName: String(entry?.buildingName || "Haz"),
      districtIndex: Number.isFinite(Number(entry?.districtIndex)) ? Math.round(Number(entry.districtIndex)) : 0,
      gain: Math.max(0, Math.round(Number(entry?.gain) || 0)),
      fameGain: Math.max(0, Math.round(Number(entry?.fameGain) || 0)),
      heatGain: Math.max(0, Math.round(Number(entry?.heatGain) || 0)),
      successChance: clamp(Number(entry?.successChance) || 0.7, 0.05, 0.98),
      failHealthLossMin: Math.max(0, Math.round(Number(entry?.failHealthLossMin) || 4)),
      failHealthLossMax: Math.max(0, Math.round(Number(entry?.failHealthLossMax) || 11)),
      failHeatGain: Math.max(0, Math.round(Number(entry?.failHeatGain) || 5)),
      completesQuest: Boolean(entry?.completesQuest),
      readyAt: Number(entry?.readyAt) || 0,
    }))
    .filter((entry) => entry.readyAt > 0);
}

function normalizeProcessTasks(source) {
  return (Array.isArray(source) ? source : [])
    .map((entry, index) => {
      const durationMs = Math.max(5000, Math.round(Number(entry?.durationMs) || PROTECTION_REWARD_DELAY_MS));
      const startedAt = Number.isFinite(Number(entry?.startedAt)) ? Math.max(0, Number(entry.startedAt)) : 0;
      return {
        id: String(entry?.id || `process-${Date.now()}-${index}`),
        type: String(entry?.type || "generic"),
        title: String(entry?.title || "Munka"),
        icon: String(entry?.icon || "•").slice(0, 3),
        durationMs,
        startedAt,
        payload: entry?.payload && typeof entry.payload === "object" ? entry.payload : {},
      };
    })
    .filter((entry) => entry.durationMs > 0)
    .slice(0, MAX_PROCESS_TASKS);
}

function getProcessTaskQueue(kind = "main") {
  return kind === "harbor" ? state.harborProcessTasks : state.processTasks;
}

function setProcessTaskQueue(kind = "main", tasks = []) {
  if (kind === "harbor") {
    state.harborProcessTasks = normalizeProcessTasks(tasks);
    return state.harborProcessTasks;
  }
  state.processTasks = normalizeProcessTasks(tasks);
  return state.processTasks;
}

function getProcessTaskLabel(kind = "main") {
  return kind === "harbor" ? "Kikötő" : "Fő map";
}

function hasProcessTaskSlot(kind = "main") {
  const tasks = setProcessTaskQueue(kind, getProcessTaskQueue(kind));
  return tasks.length < MAX_PROCESS_TASKS;
}

function ensureProcessQueueStarted(kind = "main", now = Date.now()) {
  const tasks = setProcessTaskQueue(kind, getProcessTaskQueue(kind));
  if (tasks[0] && !tasks[0].startedAt) {
    tasks[0].startedAt = now;
    setProcessTaskQueue(kind, tasks);
    return true;
  }
  return false;
}

function getRivalAttackProcessTask(now = getSynchronizedNow()) {
  const rival = state.rivalEvent;
  if (!rival) return null;
  const action = rival?.pendingAction;
  const spot = getSpotById(rival.spotId);
  if (action?.type === "attack") {
    const readyAt = Number(action.readyAt);
    const startedAt = Number.isFinite(Number(action.startedAt))
      ? Number(action.startedAt)
      : readyAt - RIVAL_ACTION_DURATION_MS;
    if (!Number.isFinite(readyAt) || readyAt <= now) return null;
    return {
      id: `rival-attack-${rival.id || rival.spotId}`,
      type: "rival-attack",
      title: spot ? `Rivalis tamadas: ${spot.name}` : "Rivalis tamadas",
      icon: "R",
      durationMs: Math.max(5000, readyAt - startedAt || RIVAL_ACTION_DURATION_MS),
      startedAt: Math.max(0, startedAt),
      readyAt,
      spotId: rival.spotId,
    };
  }
  if (action) return null;
  const readyAt = Number(rival?.expiresAt);
  const startedAt = Number.isFinite(Number(rival?.createdAt))
    ? Number(rival.createdAt)
    : readyAt - RIVAL_EVENT_DURATION_MS;
  if (!Number.isFinite(readyAt) || readyAt <= now) return null;
  return {
    id: `rival-ambush-${rival.id || rival.spotId}`,
    type: "rival-ambush",
    title: spot ? `Rivalis rajtautesig: ${spot.name}` : "Rivalis rajtautesig",
    icon: "R",
    durationMs: Math.max(5000, readyAt - startedAt || RIVAL_EVENT_DURATION_MS),
    startedAt: Math.max(0, startedAt),
    readyAt,
    spotId: rival.spotId,
  };
}

function renderProcessTasks(now = Date.now()) {
  if (!hudProcessTasks) return;
  const kind = "harbor";
  ensureProcessQueueStarted(kind, now);
  const harborTasks = normalizeProcessTasks(getProcessTaskQueue(kind));
  const rivalTask = getRivalAttackProcessTask(now);
  const tasks = [
    ...(rivalTask ? [{ task: rivalTask, kind: "rival", sourceIndex: -1 }] : []),
    ...harborTasks.map((task, sourceIndex) => ({ task, kind, sourceIndex })),
  ].slice(0, MAX_PROCESS_TASKS);
  const slots = Array.from({ length: MAX_PROCESS_TASKS }, (_, index) => {
    const entry = tasks[index];
    if (!entry) {
      return `<button class="hud-process-task hud-process-task--empty" type="button" title="Szabad folyamathely" aria-label="Szabad folyamathely"><span>+</span><strong>ures</strong></button>`;
    }
    const { task, sourceIndex } = entry;
    const isRival = entry.kind === "rival";
    const isActive = isRival || sourceIndex === 0;
    const elapsed = isActive && task.startedAt ? Math.max(0, now - task.startedAt) : 0;
    const progress = isActive ? clamp((elapsed / task.durationMs) * 100, 0, 100) : 0;
    const remaining = isRival
      ? Math.max(0, task.readyAt - now)
      : (isActive ? Math.max(0, task.durationMs - elapsed) : task.durationMs);
    const interactionAttributes = isRival
      ? `data-rival-process-spot="${escapeHtml(task.spotId)}"`
      : `data-process-kind="${kind}" data-process-index="${sourceIndex}"`;
    const title = isRival
      ? `${task.title} - kattintasra reszletek`
      : `${getProcessTaskLabel(kind)}: ${task.title} - kattintasra torles`;
    return `
      <button
        class="hud-process-task${isRival ? " hud-process-task--rival" : ""}${isActive ? "" : " hud-process-task--waiting"}"
        type="button"
        ${interactionAttributes}
        title="${escapeHtml(title)}"
        aria-label="${escapeHtml(title)}"
        style="--process:${progress}%">
        <span>${escapeHtml(task.icon)}</span>
        <strong>${isActive ? formatCountdown(remaining) : "var"}</strong>
        <em>${escapeHtml(task.title)}</em>
      </button>
    `;
  }).join("");
  hudProcessTasks.innerHTML = `
    <div class="hud-process-group hud-process-group--${kind}">
      <b><svg class="hud-process-anchor" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="5" r="3"/><path d="M17 8v18M11 12h12M14 15h6M7 17c0 8 3.5 12 10 15 6.5-3 10-7 10-15M3 21l4-4 4 5M31 21l-4-4-4 5M13 10c-3 2-4 5-4 8M21 10c3 2 4 5 4 8"/></svg><span>Folyamat</span></b>
      <div class="hud-process-group__bubbles">${slots}</div>
    </div>
  `;
}

async function cancelProcessTask(kind = "harbor", index = 0) {
  const normalizedKind = kind === "main" ? "main" : "harbor";
  const taskIndex = Math.max(0, Math.round(Number(index) || 0));
  const tasks = normalizeProcessTasks(getProcessTaskQueue(normalizedKind));
  const removed = tasks[taskIndex];
  if (!removed) return false;
  if (normalizedKind === "harbor") {
    try {
      await requestServerHarbor({ operation: "cancel", taskId: removed.id });
      renderProcessTasks();
      sceneRef?.setMessage(`${removed.title} törölve. A feladat helye felszabadult.`);
      sceneRef?.pushLog(`Kikötői feladat törölve: ${removed.title}.`);
      return true;
    } catch (error) {
      sceneRef?.setMessage(error.message);
      return false;
    }
  }
  tasks.splice(taskIndex, 1);
  if (tasks[0] && !tasks[0].startedAt) {
    tasks[0].startedAt = Date.now();
  }
  setProcessTaskQueue(normalizedKind, tasks);
  renderProcessTasks();
  saveGame();
  sceneRef?.setMessage(`${removed.title} törölve. A feladat helye felszabadult.`);
  sceneRef?.pushLog(`${getProcessTaskLabel(normalizedKind)} feladat törölve: ${removed.title}.`);
  return true;
}

function enqueueProcessTask(task, kind = task?.type === "harbor" ? "harbor" : "main") {
  syncProcessTasks(Date.now(), { skipRender: true });
  if (!hasProcessTaskSlot(kind)) {
    const label = kind === "harbor" ? "kikötői" : "főtérképes";
    sceneRef?.setMessage(`Nincs szabad ${label} feladatkör. Várj, amíg az egyik munka lejár.`);
    renderProcessTasks();
    return false;
  }
  const normalized = normalizeProcessTasks([{
    id: task.id || `process-${task.type || "task"}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: task.type || "generic",
    title: task.title || "Munka",
    icon: task.icon || "•",
    durationMs: task.durationMs || PROTECTION_REWARD_DELAY_MS,
    startedAt: 0,
    payload: task.payload || {},
  }])[0];
  const tasks = getProcessTaskQueue(kind);
  tasks.push(normalized);
  setProcessTaskQueue(kind, tasks);
  ensureProcessQueueStarted(kind);
  renderProcessTasks();
  return true;
}

function applyProtectionReward(reward) {
  const successChance = clamp(Number(reward?.successChance) || 0.7, 0.05, 0.98);
  const success = Math.random() <= successChance;
  if (!success) {
    const healthLoss = applyActionDamage(
      Math.max(0, Math.round(Number(reward?.failHealthLossMin) || 4)),
      Math.max(0, Math.round(Number(reward?.failHealthLossMax) || 11)),
    );
    const heatGain = applyHeat(Math.max(0, Math.round(Number(reward?.failHeatGain) || 5)));
    sceneRef?.pushLog(`${reward.buildingName}: a vedelmi penz beszedese nem sikerult. -${healthLoss} eletero, +${heatGain}% korozes.`);
    sceneRef?.setMessage(`${reward.buildingName}: a beszedes lejart, de nem fizettek. A reszletek az ertesitesben vannak.`);
    addLocalNotification(
      "Feladat vege",
      `${reward.buildingName}: a vedelmi penz beszedese nem sikerult. Veszteseg: -${healthLoss} eletero.`,
      { messageType: "event" },
    );
    queueRewardModal({
      title: "Feladat vege",
      text: `${reward.buildingName}: a beszedes nem sikerult.`,
      money: 0,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    return;
  }
  state.money += reward.gain;
  applyFame(reward.fameGain);
  const appliedHeat = applyHeat(reward.heatGain);
  const district = state.districts[reward.districtIndex];
  if (district) {
    district.loyalty = clamp(district.loyalty + 6, 0, 100);
    if (!district.controlled && district.loyalty >= 65) {
      district.controlled = true;
      sceneRef?.pushLog(`${district.name} most mar a bandadhoz tartozik.`);
    }
  }
  if (reward.completesQuest && reward.spotId) completeQuest("protection", getSpotById(reward.spotId));
  completeMentorStep("protection");
  sceneRef?.pushLog(`${reward.buildingName}: vedelmi penz befolyt. +${reward.gain} $, +${reward.fameGain} XP, +${appliedHeat}% korozes.`);
  sceneRef?.setMessage(`${reward.buildingName}: a vedelmi penz megjott a kasszaba.`);
  queueRewardModal({
    title: "Feladat vege",
    text: `${reward.buildingName}: vedelmi penz megerkezett.`,
    money: reward.gain,
    xp: reward.fameGain,
    fame: reward.fameGain,
  });
  addLocalNotification(
    "Feladat vege",
    `${reward.buildingName}: a vedelmi penz megerkezett. Jutalom: +${reward.gain} $, +${reward.fameGain} XP.`,
    { messageType: "event" },
  );
}

function completeProcessTask(task) {
  if (task.type === "protection") {
    applyProtectionReward(task.payload);
    return true;
  }
  if (task.type === "harbor") {
    applyHarborTaskReward(task.payload);
    return true;
  }
  return false;
}

function syncProcessQueue(kind = "main", now = Date.now()) {
  let tasks = setProcessTaskQueue(kind, getProcessTaskQueue(kind));
  let changed = ensureProcessQueueStarted(kind, now);
  tasks = getProcessTaskQueue(kind);
  while (tasks.length) {
    const current = tasks[0];
    if (!current.startedAt || now - current.startedAt < current.durationMs) break;
    tasks.shift();
    completeProcessTask(current);
    changed = true;
    if (tasks[0] && !tasks[0].startedAt) {
      tasks[0].startedAt = now;
    }
  }
  setProcessTaskQueue(kind, tasks);
  return changed;
}

function syncProcessTasks(now = Date.now(), options = {}) {
  if (!options.skipRender) renderProcessTasks(now);
  void syncServerHarborTasksIfNeeded();
  return false;
}

function queueProtectionReward(payload) {
  const reward = {
    id: `protection-${payload?.spotId || "district"}-${Date.now()}`,
    spotId: payload?.spotId || null,
    buildingName: payload?.buildingName || "Haz",
    districtIndex: Number.isFinite(Number(payload?.districtIndex)) ? Number(payload.districtIndex) : state.selectedDistrictIndex,
    gain: Math.max(0, Math.round(Number(payload?.gain) || 0)),
    fameGain: Math.max(0, Math.round(Number(payload?.fameGain) || 0)),
    heatGain: Math.max(0, Math.round(Number(payload?.heatGain) || 0)),
    successChance: clamp(Number(payload?.successChance) || 0.7, 0.05, 0.98),
    failHealthLossMin: Math.max(0, Math.round(Number(payload?.failHealthLossMin) || 4)),
    failHealthLossMax: Math.max(0, Math.round(Number(payload?.failHealthLossMax) || 11)),
    failHeatGain: Math.max(0, Math.round(Number(payload?.failHeatGain) || 5)),
    completesQuest: Boolean(payload?.completesQuest),
  };
  return enqueueProcessTask({
    type: "protection",
    title: "Vedelmi penz",
    icon: "$",
    durationMs: PROTECTION_REWARD_DELAY_MS,
    payload: reward,
  });
}

function resolvePendingProtectionRewards(now = Date.now()) {
  const pending = normalizePendingProtectionRewards(state.pendingProtectionRewards);
  let changed = pending.length !== (state.pendingProtectionRewards || []).length;
  const dueRewards = pending.filter((reward) => reward.readyAt <= now);
  const remaining = pending.filter((reward) => reward.readyAt > now);
  state.pendingProtectionRewards = remaining;
  dueRewards.forEach((reward) => {
    applyProtectionReward(reward);
    changed = true;
  });
  return changed;
}

function normalizeRivalEvent(event, now = Date.now()) {
  if (!event || typeof event !== "object") return null;
  const spotId = typeof event.spotId === "string" ? event.spotId : "";
  if (!getSpotById(spotId)) return null;
  const expiresAt = Number(event.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return null;
  const createdAt = Number.isFinite(Number(event.createdAt))
    ? Number(event.createdAt)
    : Math.max(0, expiresAt - RIVAL_EVENT_DURATION_MS);
  const pendingType = ["scout", "intimidate", "attack"].includes(event.pendingAction?.type)
    ? event.pendingAction.type
    : "";
  const pendingReadyAt = Number(event.pendingAction?.readyAt);
  const pendingStartedAt = Number(event.pendingAction?.startedAt);
  const pendingAction = pendingType && Number.isFinite(pendingReadyAt) && pendingReadyAt > 0
    ? {
        type: pendingType,
        startedAt: Number.isFinite(pendingStartedAt) ? pendingStartedAt : Math.max(0, pendingReadyAt - RIVAL_ACTION_DURATION_MS),
        readyAt: pendingReadyAt,
      }
    : null;
  return {
    id: String(event.id || `rival-${spotId}-${Math.round(expiresAt)}`),
    spotId,
    strength: clamp(Math.round(Number(event.strength) || 30), 8, 160),
    rewardMoney: Math.max(60, Math.round(Number(event.rewardMoney) || 160)),
    rewardXp: Math.max(10, Math.round(Number(event.rewardXp) || 20)),
    scouted: Boolean(event.scouted),
    intimidationStacks: clamp(Math.round(Number(event.intimidationStacks) || 0), 0, 3),
    pendingAction,
    createdAt,
    expiresAt,
  };
}

function getActiveRivalEvent(now = getSynchronizedNow()) {
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent, now);
  return state.rivalEvent;
}

function getRivalEventAtSpot(spotId) {
  const rival = getActiveRivalEvent();
  return rival?.spotId === spotId ? rival : null;
}

function getRivalEffectiveStrength(rival) {
  if (!rival) return 0;
  const intimidated = clamp(Math.round(Number(rival.intimidationStacks) || 0), 0, 3);
  return Math.max(8, Math.round(rival.strength * (1 - intimidated * 0.12)));
}

function getRivalScoutChance(rival) {
  if (!rival) return 0;
  return 1;
}

function getRivalIntimidateChance(rival) {
  if (!rival) return 0;
  const playerPower = getActionPower("map");
  return clamp(0.42 + (playerPower - rival.strength * 1.35) / 180, 0.18, 0.82);
}

function getRivalAttackChance(rival) {
  if (!rival) return 0;
  const playerPower = getActionPower("map");
  const targetPower = getRivalEffectiveStrength(rival) * 2.1;
  return clamp(0.46 + (playerPower - targetPower) / 220, 0.24, 0.86);
}

function buildRivalRewardItem(rival) {
  const pool = getRankLevel(state.fame) >= 5
    ? [["weapon", equipmentCatalog.weapon[1]], ["watch", equipmentCatalog.watch[1]], ["shoes", equipmentCatalog.shoes[1]]]
    : [["hat", equipmentCatalog.hat[0]], ["shirt", equipmentCatalog.shirt[1]], ["weapon", equipmentCatalog.weapon[0]]];
  const [slot, template] = pool[randomInt(0, pool.length - 1)];
  return {
    slot,
    item: {
      ...template,
      id: `rival-${slot}-${Date.now()}-${randomInt(100, 999)}`,
    },
  };
}

function renderRivalActionPanel(spot) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!spot || !rival) {
    hideAuxPanel();
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  const effectiveStrength = getRivalEffectiveStrength(rival);
  const scoutChance = Math.round(getRivalScoutChance(rival) * 100);
  const intimidateChance = Math.round(getRivalIntimidateChance(rival) * 100);
  const attackChance = Math.round(getRivalAttackChance(rival) * 100);
  const pendingAction = rival.pendingAction;
  const attackRemaining = Math.max(0, Number(rival.expiresAt) - getSynchronizedNow());
  const pendingLabels = {
    scout: "Felderites",
    intimidate: "Megfelemlites",
    attack: "Tamadas",
  };
  const body = `
    <section class="rival-panel">
      <div class="rival-panel__summary aux-panel__carditem">
        <strong>${escapeHtml(spot.name)}</strong>
        <div class="aux-panel__muted">
          Rivalis nyomas a kornyeken. ${rival.scouted ? `Felderitett ero: ${effectiveStrength}.` : "A pontos ero meg ismeretlen."}
          Ha nem foglalkozol veluk, <strong data-rival-ambush-countdown="${rival.expiresAt}">${formatCountdown(attackRemaining)}</strong> mulva megtamadnak.
          ${rival.intimidationStacks ? ` Megfelemlites: ${rival.intimidationStacks}/3.` : ""}
        </div>
      </div>
      ${pendingAction ? `
        <div class="rival-panel__progress">
          <span>${escapeHtml(pendingLabels[pendingAction.type] || "Muvelet")} folyamatban</span>
          <strong data-rival-action-countdown="${pendingAction.readyAt}">${formatCountdown(pendingAction.readyAt - getSynchronizedNow())}</strong>
          <small>Az informaciok es az eredmeny az ido lejartakor jelennek meg.</small>
        </div>
      ` : ""}
      <div class="rival-panel__actions">
        <button type="button" class="rival-panel__action${pendingAction?.type === "scout" ? " is-running" : ""}" data-rival-action="scout" data-rival-spot="${escapeHtml(spot.id)}" ${pendingAction ? "disabled" : ""}>
          <strong>Felderites</strong>
          <span>5 perc · Siker esely: ${scoutChance}%. Az eredmeny utan lathatod a pontos erejuket.</span>
        </button>
        <button type="button" class="rival-panel__action${pendingAction?.type === "intimidate" ? " is-running" : ""}" data-rival-action="intimidate" data-rival-spot="${escapeHtml(spot.id)}" ${pendingAction ? "disabled" : ""}>
          <strong>Megfelemlites</strong>
          <span>5 perc · Siker esely: ${intimidateChance}%. Siker eseten gyengulnek, vagy akar teljesen tavozhatnak.</span>
        </button>
        <button type="button" class="rival-panel__action${pendingAction?.type === "attack" ? " is-running" : ""}" data-rival-action="attack" data-rival-spot="${escapeHtml(spot.id)}" ${pendingAction ? "disabled" : ""}>
          <strong>Tamadas</strong>
          <span>5 perc · Gyozelmi esely: ${attackChance}%. Az eredmeny es a jutalom a visszaszamlalas utan jelenik meg.</span>
        </button>
        <button type="button" class="rival-panel__action" data-rival-action="retreat" data-rival-spot="${escapeHtml(spot.id)}">
          <strong>Elvonulas</strong>
          <span>Most nem vallalod be az osszecsapast.</span>
        </button>
      </div>
    </section>
  `;
  hideChoiceWheel();
  activeAuxPanelKind = "rival";
  auxPanel?.setAttribute("data-kind", "rival");
  setAuxPanelContent("Rivalis banda", spot.name, body);
  return true;
}

async function startRivalTimedAction(spot, actionType) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  if (rival.pendingAction) {
    sceneRef?.setMessage(`Mar folyamatban van egy rivalis muvelet: ${formatCountdown(rival.pendingAction.readyAt - getSynchronizedNow())}.`);
    renderRivalActionPanel(spot);
    return false;
  }
  const labels = { scout: "Felderites", intimidate: "Megfelemlites", attack: "Tamadas" };
  if (!Object.hasOwn(labels, actionType)) return false;
  try {
    const response = await requestServerProgression("rival", {
      operation: "start",
      actionType,
      spotId: spot.id,
    });
    const readyAt = Number(response.result?.readyAt) || (getSynchronizedNow() + RIVAL_ACTION_DURATION_MS);
    sceneRef?.setMessage(`${labels[actionType]} elindult. Eredmeny: ${formatCountdown(readyAt - getSynchronizedNow())} mulva.`);
    sceneRef?.pushLog(`${spot.name}: ${labels[actionType].toLowerCase()} elindult, ido 5 perc.`);
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    renderRivalActionPanel(spot);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A rivalis muvelet nem indithato el.");
    sceneRef?.refreshHUD();
    return false;
  }
}

function handleRivalScout(spot) {
  return startRivalTimedAction(spot, "scout");
}

function handleRivalIntimidate(spot) {
  return startRivalTimedAction(spot, "intimidate");
}

function refreshRivalActionCountdown(now = getSynchronizedNow()) {
  document.querySelectorAll("[data-rival-action-countdown]").forEach((element) => {
    const readyAt = Number(element.getAttribute("data-rival-action-countdown")) || 0;
    element.textContent = formatCountdown(Math.max(0, readyAt - now));
  });
  document.querySelectorAll("[data-rival-ambush-countdown]").forEach((element) => {
    const readyAt = Number(element.getAttribute("data-rival-ambush-countdown")) || 0;
    element.textContent = formatCountdown(Math.max(0, readyAt - now));
  });
}

function handleServerRivalEvents(events = []) {
  const normalizedEvents = Array.isArray(events) ? events : [];
  normalizedEvents.forEach((event) => {
    const title = String(event?.title || "Rivalis banda");
    const body = String(event?.body || "A rivalis banda allapota megvaltozott.");
    sceneRef?.pushLog(body);
    sceneRef?.setMessage(body);
    void refreshMessageBadge();
    if (event.kind === "rival_attack_finished" || event.kind === "rival_ambush") {
      queueRewardModal({
        title,
        text: body,
        money: event.success ? Math.max(0, Number(event.moneyGain) || 0) : -Math.max(0, Number(event.moneyLoss) || 0),
        xp: event.success ? Math.max(0, Number(event.fameGain) || 0) : 0,
        fame: event.success ? Math.max(0, Number(event.fameGain) || 0) : 0,
        itemName: event.rewardItem?.name || "",
        showZeroValues: !event.success,
      });
    }
  });
  if (normalizedEvents.length) {
    void refreshMessageBadge();
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    if (activeAuxPanelKind === "rival") {
      const rival = getActiveRivalEvent();
      const spot = rival ? getSpotById(rival.spotId) : null;
      if (spot) renderRivalActionPanel(spot);
      else hideAuxPanel();
    }
  }
}

function completeRivalPendingAction(rival, now = Date.now()) {
  const action = rival?.pendingAction;
  const spot = getSpotById(rival?.spotId);
  if (!action || !spot) return false;
  state.rivalEvent = normalizeRivalEvent({ ...rival, pendingAction: null }, now);

  if (action.type === "scout") {
    state.rivalEvent = normalizeRivalEvent({ ...state.rivalEvent, scouted: true }, now);
    const strength = getRivalEffectiveStrength(state.rivalEvent);
    sceneRef?.pushLog(`${spot.name}: a felderites befejezodott. Rivalis ero: ${strength}.`);
    sceneRef?.setMessage(`${spot.name}: felderítés kész. Rivális erő ${strength}, támadási esély ${Math.round(getRivalAttackChance(state.rivalEvent) * 100)}%.`);
    addLocalNotification("Felderítés kész", `${spot.name}: a rivális banda ereje ${strength}.`, { messageType: "event" });
    if (activeAuxPanelKind === "rival") renderRivalActionPanel(spot);
    return true;
  }

  if (action.type === "intimidate") {
    const successChance = getRivalIntimidateChance(state.rivalEvent);
    if (Math.random() <= successChance) {
      const intimidationStacks = clamp((state.rivalEvent.intimidationStacks || 0) + 1, 0, 3);
      const leaveChance = clamp(0.2 + intimidationStacks * 0.1, 0.3, 0.5);
      if (Math.random() <= leaveChance) {
        state.rivalEvent = null;
        scheduleNextRivalEvent(now);
        applyFame(8);
        sceneRef?.pushLog(`${spot.name}: a megfélemlített rivális banda elhagyta a környéket.`);
        sceneRef?.setMessage(`${spot.name}: a megfélemlítés sikerült, a rivális banda távozott.`);
        addLocalNotification("Rivális banda távozott", `${spot.name}: a megfélemlítés hatására elhagyták a környéket.`, { messageType: "event" });
        if (activeAuxPanelKind === "rival") hideAuxPanel();
        sceneRef?.refreshMap();
        return true;
      }
      state.rivalEvent = normalizeRivalEvent({
        ...state.rivalEvent,
        scouted: true,
        intimidationStacks,
      }, now);
      applyFame(4);
      const strength = getRivalEffectiveStrength(state.rivalEvent);
      sceneRef?.pushLog(`${spot.name}: a megfelemlites sikerult. Rivalis ero most ${strength}.`);
      sceneRef?.setMessage(`${spot.name}: megingott a rivalis banda. Ero ${strength}, tamadasi esely ${Math.round(getRivalAttackChance(state.rivalEvent) * 100)}%.`);
      addLocalNotification("Megfélemlítés sikeres", `${spot.name}: a rivális banda meggyengült. Aktuális erő: ${strength}.`, { messageType: "event" });
    } else {
      const hpLoss = applyActionDamage(4, 10);
      const heatGain = applyHeat(4);
      sceneRef?.pushLog(`${spot.name}: a megfelemlites nem sikerult. -${hpLoss} eletero, +${heatGain}% korozes.`);
      sceneRef?.setMessage(`${spot.name}: nem ijedtek meg. -${hpLoss} eletero, +${heatGain}% korozes.`);
      addLocalNotification("Megfélemlítés sikertelen", `${spot.name}: a riválisok ellenálltak. -${hpLoss} életerő.`, { messageType: "event" });
    }
    if (activeAuxPanelKind === "rival") renderRivalActionPanel(spot);
    sceneRef?.refreshHUD();
    return true;
  }

  if (action.type === "attack") {
    resolveRivalBattle(spot, { skipCost: true });
    return true;
  }
  return false;
}

async function handleRivalRetreat(spot) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  try {
    const response = await requestServerProgression("rival", { operation: "retreat", spotId: spot.id });
    hideAuxPanel();
    if (response.result?.abandonedAttack) {
      const crewCount = Array.isArray(response.result.crewDamage) ? response.result.crewDamage.length : 0;
      sceneRef?.setMessage(
        `${spot.name}: visszavonultal a harcbol. -${Math.max(0, Number(response.result.healthLoss) || 0)} eletero${crewCount ? `, ${crewCount} bandatag is megserult` : ""}.`,
      );
    } else {
      sceneRef?.setMessage(`${spot.name}: a banda most elvonult. Kesobb visszaterhetsz.`);
    }
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A visszavonulas nem sikerult.");
    return false;
  }
}

function normalizeRivalNextSpawnAt(value, now = Date.now()) {
  const next = Number(value);
  if (!Number.isFinite(next) || next <= 0) {
    return now + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
  }
  return next;
}

function scheduleNextRivalEvent(now = Date.now()) {
  state.rivalNextSpawnAt = now + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
}

function spawnRivalEvent(now = Date.now()) {
  const candidates = clickableBuildingDefs.filter((spot) => spot.id !== state.mainBaseSpotId && !getQuestAtSpot(spot.id));
  if (!candidates.length) {
    scheduleNextRivalEvent(now);
    return false;
  }
  const spot = candidates[randomInt(0, candidates.length - 1)];
  const difficulty = getBuildingDifficulty(spot);
  const strength = clamp(Math.round(difficulty * 0.75 + getRankLevel(state.fame) * 4 + randomInt(8, 22)), 10, 160);
  state.rivalEvent = {
    id: `rival-${spot.id}-${now}`,
    spotId: spot.id,
    strength,
    rewardMoney: 120 + strength * 3 + randomInt(20, 80),
    rewardXp: 14 + Math.round(strength / 7),
    createdAt: now,
    expiresAt: now + RIVAL_EVENT_DURATION_MS,
  };
  sceneRef?.pushLog(`Rivalis banda jelent meg: ${spot.name}.`);
  sceneRef?.setMessage(`${spot.name} korul rivalis banda mozgolodik. 3 ora mulva tamadnak, ha nem lepsz.`);
  addLocalNotification(
    "Rivalis banda",
    `${spot.name} kornyeken rivalis banda jelent meg. Lepj kozbe 3 oran belul, kulonben megtamadnak.`,
    { messageType: "event" },
  );
  sceneRef?.refreshMap();
  return true;
}

function syncRivalEvent(now = getSynchronizedNow()) {
  // A rivalis esemenyeket a szerver oldja fel. A kliens csak a szerver idobelyegeit jeleniti meg.
  return false;
}

function syncTimedActions(now = getSynchronizedNow()) {
  const previousRecoveryUsage = JSON.stringify(state.recoveryUsage || {});
  state.recoveryUsage = normalizeRecoveryUsage(state.recoveryUsage, now);
  let changed = previousRecoveryUsage !== JSON.stringify(state.recoveryUsage);
  const currentCycle = getBuildingDifficultyCycle(now);
  if (state.registered && state.buildingDifficultyCycle !== currentCycle) {
    state.buildingDifficultyCycle = currentCycle;
    state.buildingDifficulties = createRandomBuildingDifficulties(currentCycle, state.profileName);
    changed = true;
  }

  Object.entries(state.protectionCooldowns || {}).forEach(([spotId, expiresAt]) => {
    if (Number(expiresAt) <= now) {
      delete state.protectionCooldowns[spotId];
      changed = true;
    }
  });

  if (syncWorldRivalStructureRepairs(now)) changed = true;
  if (syncProcessTasks(now)) changed = true;
  if (resolvePendingProtectionRewards(now)) changed = true;
  if (syncRivalEvent(now)) changed = true;
  if (processPolicePressure(now)) changed = true;

  return changed;
}

function canStartCombat(actionLabel = "Ezt a harcot") {
  syncTimedActions();
  if (state.health > 0) return true;
  sceneRef?.setMessage(`${actionLabel} nem indithatod el 0 eleterovel.`);
  return false;
}

function getEncounterEnemyPower(encounter = activeRobberyGame) {
  if (!encounter?.defenders?.length) return 0;
  return encounter.defenders.reduce(
    (sum, defender) => sum + Math.max(0, (defender.attack || 0) + (defender.defense || 0) + (defender.level || 1) * 3),
    0,
  );
}

async function startRecovery(stat, options = {}) {
  syncTimedActions();
  if (recoveryCommandInFlight) {
    sceneRef?.setMessage("A Lapulás vagy Találkozó indítása már folyamatban van.");
    return false;
  }
  const usage = getRecoveryUsageState(stat);
  if (usage.uses >= RECOVERY_USAGE_LIMIT) {
    sceneRef?.setMessage(`${getRecoveryActionLabel(stat)} ${formatCountdown(usage.resetAt - Date.now())} múlva használható újra.`);
    return false;
  }
  const activeRecovery = state.recoveryEffects?.health || state.recoveryEffects?.energy;
  if (activeRecovery) {
    const remaining = activeRecovery.endsAt - Date.now();
    const activeName = state.recoveryEffects?.health ? "Lapulás" : "Találkozó";
    const location = activeRecovery.spotName ? ` (${activeRecovery.spotName})` : "";
    sceneRef?.setMessage(`A ${activeName}${location} már folyamatban van. Hátralévő idő: ${formatCountdown(remaining)}.`);
    return false;
  }
  if (state[stat] >= 100) {
    sceneRef?.setMessage(stat === "health" ? "Az életerőd már maximumon van." : "Az energiád már maximumon van.");
    return false;
  }
  recoveryCommandInFlight = true;
  try {
    const response = await requestServerProgression("recovery", {
      operation: "start",
      stat,
      layLow: Boolean(options.layLow),
      spotId: String(options.spotId || ""),
      spotName: String(options.spotName || ""),
    });
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    return response;
  } catch (error) {
    const resetAt = Number(error.resetAt);
    if (Number.isFinite(resetAt) && resetAt > Date.now()) {
      sceneRef?.setMessage(`${getRecoveryActionLabel(stat)} ${formatCountdown(resetAt - Date.now())} múlva használható újra.`);
    } else {
      sceneRef?.setMessage(error.message || "A töltés nem indítható el.");
    }
    return false;
  } finally {
    recoveryCommandInFlight = false;
  }
}

function getAreaPolygon(area) {
  if (Array.isArray(area.polygon)) return area.polygon;
  const outline = Array.isArray(area.outline) ? area.outline : [];
  return outline.map(([x, y]) => [area.x + area.w * x, area.y + area.h * y]);
}

function getAreaBounds(area) {
  const polygon = getAreaPolygon(area);
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    x: (left + right) * 0.5,
    y: (top + bottom) * 0.5,
    w: right - left,
    h: bottom - top,
  };
}

function getAreaScreenPolygon(area, mapRect) {
  return getAreaPolygon(area).map(([x, y]) => ({
    x: mapRect.left + mapRect.width * x,
    y: mapRect.top + mapRect.height * y,
  }));
}

function getAreaScreenMetrics(area, mapRect) {
  const points = getAreaScreenPolygon(area, mapRect);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const centerX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const centerY = ys.reduce((sum, value) => sum + value, 0) / ys.length;

  return {
    points,
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
    centerX,
    centerY,
  };
}

function getPlotDifficultyClass(area) {
  const label = getDifficultyInfo(getBuildingDifficulty(area)).label;
  if (label === "Konnyu") return "map-svg-plot--easy";
  if (label === "Kockazatos") return "map-svg-plot--risk";
  return "map-svg-plot--danger";
}

function getPlotDifficultyOutline(area) {
  const difficultyClass = getPlotDifficultyClass(area);
  if (difficultyClass === "map-svg-plot--easy") return "./assets/map/overlays/map-outline-easy.png";
  if (difficultyClass === "map-svg-plot--risk") return "./assets/map/overlays/map-outline-risk.png";
  return "./assets/map/overlays/map-outline-danger.png";
}

function getBuildingHoverDifficultyOutline(area) {
  const difficultyClass = getPlotDifficultyClass(area);
  if (difficultyClass === "map-svg-plot--easy") return "./assets/map/overlays/house-outline-hover-easy.png";
  if (difficultyClass === "map-svg-plot--risk") return "./assets/map/overlays/house-outline-hover-risk.png";
  return "./assets/map/overlays/house-outline-hover-danger.png";
}

function getLotDifficultyClass(area) {
  const level = getLotLevel(area);
  if (level <= 0) return "map-svg-lot--easy";
  if (level === 1) return "map-svg-lot--risk";
  return "map-svg-lot--danger";
}

function difficultyColorToCss(color) {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function svgPoints(area) {
  return getAreaPolygon(area)
    .map(([x, y]) => `${(x * backgroundMapFrame.width).toFixed(1)},${(y * backgroundMapFrame.height).toFixed(1)}`)
    .join(" ");
}

function createSvgPolygon(area, classes) {
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", svgPoints(area));
  polygon.classList.add(...classes);
  return polygon;
}

function createSvgAreaLabel(area, kind = "territory") {
  const bounds = getAreaBounds(area);
  const centerX = bounds.x * backgroundMapFrame.width;
  const topY = (bounds.y - bounds.h * 0.5) * backgroundMapFrame.height;
  const centerY = bounds.y * backgroundMapFrame.height;
  const labelY = clamp(kind === "building" ? topY - 13 : centerY, 20, backgroundMapFrame.height - 20);
  const labelWidth = Math.max(96, Math.min(210, area.name.length * 8 + 30));

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.classList.add("map-svg-name-label", `map-svg-name-label--${kind}`);

  const plate = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  plate.setAttribute("x", String(centerX - labelWidth * 0.5));
  plate.setAttribute("y", String(labelY - 14));
  plate.setAttribute("width", String(labelWidth));
  plate.setAttribute("height", "28");
  plate.setAttribute("rx", "4");
  group.appendChild(plate);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(centerX));
  text.setAttribute("y", String(labelY + 1));
  text.textContent = area.name;
  group.appendChild(text);

  return group;
}

function createBuildingOutlineOverlay(area, index, defs) {
  const clipId = `building-hover-clip-${index}`;
  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  const clipPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const polygon = getAreaPolygon(area).map(([x, y]) => [
    x * backgroundMapFrame.width,
    y * backgroundMapFrame.height,
  ]);
  const centerX = polygon.reduce((sum, [x]) => sum + x, 0) / polygon.length;
  const centerY = polygon.reduce((sum, [, y]) => sum + y, 0) / polygon.length;
  const adjustment = buildingHoverAdjustments[area.id] ?? {
    dx: 0,
    dy: 0,
    scale: 1,
    clipScale: 0.995,
  };
  const clipScale = adjustment.clipScale ?? 0.995;
  const clipPoints = polygon
    .map(([x, y]) => `${(centerX + (x - centerX) * clipScale).toFixed(1)},${(centerY + (y - centerY) * clipScale).toFixed(1)}`)
    .join(" ");
  clipPath.id = clipId;
  clipPolygon.setAttribute("points", clipPoints);
  clipPath.appendChild(clipPolygon);
  defs.appendChild(clipPath);

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttribute("href", getBuildingHoverDifficultyOutline(area));
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(backgroundMapFrame.width));
  image.setAttribute("height", String(backgroundMapFrame.height));
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("clip-path", `url(#${clipId})`);
  image.setAttribute(
    "transform",
    `translate(${centerX + adjustment.dx} ${centerY + adjustment.dy}) scale(${adjustment.scale}) translate(${-centerX} ${-centerY})`,
  );
  image.classList.add("map-svg-building-outline", getPlotDifficultyClass(area));
  return image;
}

function createBuildingDifficultyOverlay(area, index, defs) {
  const clipId = `building-difficulty-clip-${index}`;
  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  const clipPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const polygon = area.plot.map(([x, y]) => [
    x * backgroundMapFrame.width,
    y * backgroundMapFrame.height,
  ]);
  const centerX = polygon.reduce((sum, [x]) => sum + x, 0) / polygon.length;
  const centerY = polygon.reduce((sum, [, y]) => sum + y, 0) / polygon.length;
  const clipPoints = polygon
    .map(([x, y]) => `${(centerX + (x - centerX) * 1.08).toFixed(1)},${(centerY + (y - centerY) * 1.08).toFixed(1)}`)
    .join(" ");

  clipPath.id = clipId;
  clipPolygon.setAttribute("points", clipPoints);
  clipPath.appendChild(clipPolygon);
  defs.appendChild(clipPath);

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttribute("href", getPlotDifficultyOutline(area));
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(backgroundMapFrame.width));
  image.setAttribute("height", String(backgroundMapFrame.height));
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("clip-path", `url(#${clipId})`);
  image.classList.add("map-svg-building-difficulty", getPlotDifficultyClass(area));
  return image;
}

function createTerritoryHoverOverlay(area, index, defs) {
  const clipId = `territory-hover-clip-${index}`;
  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  const clipPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const polygon = getAreaPolygon(area).map(([x, y]) => [
    x * backgroundMapFrame.width,
    y * backgroundMapFrame.height,
  ]);
  const centerX = polygon.reduce((sum, [x]) => sum + x, 0) / polygon.length;
  const centerY = polygon.reduce((sum, [, y]) => sum + y, 0) / polygon.length;
  const clipPoints = polygon
    .map(([x, y]) => `${(centerX + (x - centerX) * 1.025).toFixed(1)},${(centerY + (y - centerY) * 1.025).toFixed(1)}`)
    .join(" ");

  clipPath.id = clipId;
  clipPolygon.setAttribute("points", clipPoints);
  clipPath.appendChild(clipPolygon);
  defs.appendChild(clipPath);

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttribute("href", "./assets/map/overlays/territory-outline-hover-base.png");
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", String(backgroundMapFrame.width));
  image.setAttribute("height", String(backgroundMapFrame.height));
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("clip-path", `url(#${clipId})`);
  image.classList.add("map-svg-territory-hover");
  return image;
}

function createRestoredBuildingOverlay(area) {
  const visual = area?.restoredVisual;
  if (!area?.restoredHouse || getLotLevel(area) <= 0 || !visual) return null;
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  const assetHref = new URL(visual.asset, window.location.href).href;
  image.setAttribute("href", assetHref);
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", assetHref);
  image.setAttribute("x", String(visual.x));
  image.setAttribute("y", String(visual.y));
  image.setAttribute("width", String(visual.width));
  image.setAttribute("height", String(visual.height));
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("aria-hidden", "true");
  image.classList.add("map-svg-restored-building");
  return image;
}

function createLotNumberMarker(area) {
  if (!area?.overlayNumberMarker || getLotLevel(area) > 0) return null;
  const bounds = getAreaBounds(area);
  const x = bounds.x * backgroundMapFrame.width;
  const y = (bounds.y - bounds.h * 0.02) * backgroundMapFrame.height;
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.classList.add("map-svg-lot-number-marker");
  group.setAttribute("transform", `translate(${x} ${y})`);

  const shield = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shield.setAttribute("d", "M -20 -31 L 20 -31 L 20 17 L 0 30 L -20 17 Z");
  group.appendChild(shield);

  const number = document.createElementNS("http://www.w3.org/2000/svg", "text");
  number.setAttribute("x", "0");
  number.setAttribute("y", "-8");
  number.textContent = area.number;
  group.appendChild(number);

  const building = document.createElementNS("http://www.w3.org/2000/svg", "g");
  building.classList.add("map-svg-lot-number-marker__building");
  building.setAttribute("transform", "translate(-8 2)");
  const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  body.setAttribute("x", "0");
  body.setAttribute("y", "4");
  body.setAttribute("width", "16");
  body.setAttribute("height", "13");
  const roof = document.createElementNS("http://www.w3.org/2000/svg", "path");
  roof.setAttribute("d", "M -1 5 L 8 -1 L 17 5 Z");
  building.append(roof, body);
  group.appendChild(building);
  return group;
}

function createLotHouseOverlay(area) {
  if (!LOT_HOUSE_VISUALS_ENABLED) return null;
  const level = getLotLevel(area);
  const houseDef = lotHouseLevelDefs[level];
  if (!houseDef) return null;

  const bounds = getAreaBounds(area);
  const drawWidth = bounds.w * backgroundMapFrame.width * houseDef.scale;
  const drawHeight = drawWidth * 1.46;
  const centerX = bounds.x * backgroundMapFrame.width;
  const baseY = (bounds.y + bounds.h * 0.72) * backgroundMapFrame.height;

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  const assetHref = new URL(houseDef.asset, window.location.href).href;
  image.setAttribute("href", assetHref);
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", assetHref);
  image.setAttribute("x", String(centerX - drawWidth * 0.5));
  image.setAttribute("y", String(baseY - drawHeight + houseDef.yOffset));
  image.setAttribute("width", String(drawWidth));
  image.setAttribute("height", String(drawHeight));
  image.setAttribute("preserveAspectRatio", "xMidYMax meet");
  image.setAttribute("aria-hidden", "true");
  image.setAttribute("overflow", "visible");
  image.classList.add("map-svg-lot-house", `map-svg-lot-house--level-${level}`);
  return image;
}

function renderLotHouseLayer(frameLeft, frameTop, frameWidth, frameHeight) {
  if (!LOT_HOUSE_VISUALS_ENABLED) {
    lotHouseLayer?.classList.add("hidden");
    lotHouseLayer?.replaceChildren();
    return;
  }
  if (!lotHouseLayer) return;
  lotHouseLayer.replaceChildren();
  lotHouseLayer.classList.toggle("hidden", !state.registered);

  clickableLotDefs.forEach((area) => {
    const level = getLotLevel(area);
    const houseDef = lotHouseLevelDefs[level];
    if (!houseDef) return;

    const bounds = getAreaBounds(area);
    const baseX = frameLeft + frameWidth * bounds.x;
    const baseY = frameTop + frameHeight * (bounds.y + bounds.h * 0.72);
    const drawWidth = frameWidth * bounds.w * houseDef.scale;

    const wrapper = document.createElement("div");
    wrapper.className = `lot-house-layer__item lot-house-layer__item--level-${level}`;
    wrapper.style.left = `${baseX}px`;
    wrapper.style.top = `${baseY + houseDef.yOffset}px`;
    wrapper.style.width = `${drawWidth}px`;

    const card = document.createElement("div");
    card.className = "lot-house-layer__card";
    wrapper.appendChild(card);

    const image = document.createElement("img");
    image.src = houseDef.asset;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("error", () => {
      card.style.background = "rgba(220, 70, 40, 0.55)";
      card.style.border = "3px solid rgba(255, 230, 180, 0.9)";
    });
    wrapper.appendChild(image);
    lotHouseLayer.appendChild(wrapper);
  });
}

function getLayoutViewportSize() {
  const viewport = window.visualViewport;
  const width = Math.round(
    Number(viewport?.width)
    || Number(window.innerWidth)
    || Number(document.documentElement?.clientWidth)
    || backgroundMapFrame.width,
  );
  const height = Math.round(
    Number(viewport?.height)
    || Number(window.innerHeight)
    || Number(document.documentElement?.clientHeight)
    || backgroundMapFrame.height,
  );
  return {
    width: Math.max(320, width),
    height: Math.max(240, height),
  };
}

function getBackgroundMapRect(width = null, height = null) {
  const viewport = getLayoutViewportSize();
  width = Number.isFinite(Number(width)) && Number(width) > 0 ? Number(width) : viewport.width;
  height = Number.isFinite(Number(height)) && Number(height) > 0 ? Number(height) : viewport.height;
  const compactLandscape = width <= 1000 && height <= 600 && width > height;
  const desktopHud = width >= 900 && !compactLandscape;
  const topInset = desktopHud ? 68 : 58;
  const leftInset = compactLandscape
    ? 130
    : (desktopHud ? 8 + clamp(Math.round(width * 0.122), 168, 180) : 0);
  const rightInset = compactLandscape
    ? 148
    : (desktopHud ? clamp(Math.round(width * 0.161), 218, 233) : 0);
  const availableWidth = Math.max(320, width - leftInset - rightInset);
  const availableHeight = Math.max(240, height - topInset);
  const mapAspectRatio = 1534 / 1025;
  let mapWidth = availableWidth;
  let mapHeight = mapWidth / mapAspectRatio;
  if (mapHeight > availableHeight) {
    mapHeight = availableHeight;
    mapWidth = mapHeight * mapAspectRatio;
  }
  return {
    width: Math.round(mapWidth),
    height: Math.round(mapHeight),
    left: Math.round(leftInset + (availableWidth - mapWidth) / 2),
    top: Math.round(topInset + (availableHeight - mapHeight) / 2),
  };
}

function createMapLandmarkOverlay(area) {
  if (!area?.landmarkAsset) return null;
  const bounds = getAreaBounds(area);
  const frameWidth = backgroundMapFrame.width;
  const frameHeight = backgroundMapFrame.height;
  const plotWidth = bounds.w * frameWidth;
  const plotHeight = bounds.h * frameHeight;
  const landmarkSize = Math.max(1, Math.min(plotWidth * 0.98, plotHeight * 1.3));
  const widthScale = Number(area.landmarkWidthScale);
  const heightScale = Number(area.landmarkHeightScale);
  const offsetX = Number(area.landmarkOffsetX) || 0;
  const offsetY = Number(area.landmarkOffsetY) || 0;
  const drawWidth = Number.isFinite(widthScale)
    ? Math.max(1, plotWidth * widthScale)
    : area.landmarkSquare
      ? landmarkSize
      : Math.max(1, plotWidth * 0.76);
  const drawHeight = Number.isFinite(heightScale)
    ? Math.max(1, plotHeight * heightScale)
    : area.landmarkSquare
      ? landmarkSize
      : Math.max(1, plotHeight * 0.76);
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  const assetHref = new URL(area.landmarkAsset, window.location.href).href;
  image.setAttribute("href", assetHref);
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", assetHref);
  image.setAttribute("x", String(bounds.x * frameWidth - drawWidth * 0.5 + offsetX));
  image.setAttribute("y", String((bounds.y + bounds.h * 0.03) * frameHeight - drawHeight * 0.5 + offsetY));
  image.setAttribute("width", String(drawWidth));
  image.setAttribute("height", String(drawHeight));
  image.setAttribute("preserveAspectRatio", area.landmarkStretch ? "none" : "xMidYMid meet");
  image.setAttribute("pointer-events", "none");
  image.setAttribute("aria-hidden", "true");
  image.classList.add("map-svg-landmark", "map-svg-landmark--underpass");
  return image;
}

function scheduleResponsiveMapLayout() {
  if (mapViewportResizeFrame) cancelAnimationFrame(mapViewportResizeFrame);
  mapViewportResizeFrame = requestAnimationFrame(() => {
    mapViewportResizeFrame = 0;
    if (sceneRef?.refreshMap) {
      sceneRef.refreshMap();
      sceneRef.layoutUI?.();
    } else {
      renderSvgMapOverlay();
    }
    if (!harborMapView?.classList.contains("hidden")) renderHarborMapZones();
  });
}

function clearSvgMapSelection() {
  mapSvgOverlay?.querySelectorAll(".is-selected").forEach((area) => {
    area.classList.remove("is-selected");
  });
}

function selectSvgMapArea(areaId) {
  clearSvgMapSelection();
  mapSvgOverlay?.querySelectorAll(`[data-area-id="${areaId}"]`).forEach((area) => {
    area.classList.add("is-selected");
  });
}

function getScreenMapArea(area, frameLeft, frameTop, frameWidth, frameHeight) {
  const bounds = area.w && area.h ? area : getAreaBounds(area);
  return {
    ...area,
    x: frameLeft + frameWidth * bounds.x,
    y: frameTop + frameHeight * bounds.y,
    w: frameWidth * bounds.w,
    h: frameHeight * bounds.h,
    mapX: bounds.x,
    mapY: bounds.y,
  };
}

function handleSvgMapAreaClick(area, frameLeft, frameTop, frameWidth, frameHeight) {
  if (!state.registered) return;
  if (Date.now() <= mapDragState.ignoreClicksUntil) return;
  selectSvgMapArea(area.id);
  const screenArea = getScreenMapArea(area, frameLeft, frameTop, frameWidth, frameHeight);

  if (area.kind === "underground") {
    showUnderpassModal();
    return;
  }

  if (area.kind === "park" || area.kind === "lot") {
    showChoiceWheel(screenArea);
    return;
  }

  state.selectedDistrictIndex = clamp(area.districtIndex, 0, state.districts.length - 1);
  sceneRef?.refreshHUD();
  const quest = getQuestAtSpot(area.id);
  if (quest?.status === "offered") {
    sceneRef?.setMessage(`Új küldetés érhető el itt: ${area.name}.`);
  }
  showChoiceWheel(screenArea);
  saveGame();
}

function renderSvgMapOverlay() {
  if (!mapSvgOverlay) return;
  if (!MAP_DRAG_ENABLED && (mapPan.x !== 0 || mapPan.y !== 0)) resetMapPan();
  const mapRect = getBackgroundMapRect();
  const frameWidth = mapRect.width;
  const frameHeight = mapRect.height;
  const frameLeft = mapRect.left;
  const frameTop = mapRect.top;

  if (mapBackgroundLayer) {
    mapBackgroundLayer.style.left = `${frameLeft}px`;
    mapBackgroundLayer.style.top = `${frameTop}px`;
    mapBackgroundLayer.style.width = `${frameWidth}px`;
    mapBackgroundLayer.style.height = `${frameHeight}px`;
  }
  mapSvgOverlay.style.left = `${frameLeft}px`;
  mapSvgOverlay.style.top = `${frameTop}px`;
  mapSvgOverlay.style.width = `${frameWidth}px`;
  mapSvgOverlay.style.height = `${frameHeight}px`;
  mapSvgOverlay.classList.toggle("hidden", !state.registered);
  mapSvgOverlay.replaceChildren();
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const landmarkLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  landmarkLayer.classList.add("map-svg-landmark-layer");
  mapSvgOverlay.appendChild(defs);
  [...clickableParkDefs, ...clickableLotDefs].forEach((area, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("map-svg-territory-group");
    const restoredBuilding = createRestoredBuildingOverlay(area);
    if (restoredBuilding) group.appendChild(restoredBuilding);
    const landmark = createMapLandmarkOverlay(area);
    const numberMarker = createLotNumberMarker(area);

    const territoryClasses = [
      "map-svg-territory",
      area.kind === "park" ? "map-svg-territory--park" : area.kind === "underground" ? "map-svg-territory--underground" : "map-svg-territory--lot",
    ];
    if (area.kind === "lot") territoryClasses.push(getLotDifficultyClass(area));
    const polygon = createSvgPolygon(area, territoryClasses);
    polygon.setAttribute("aria-label", area.name);
    polygon.dataset.areaId = area.id;
    if (area.kind === "lot" && getLotLevel(area) > 0) {
      polygon.classList.add("is-owned");
      polygon.setAttribute("aria-label", `${area.name}, ${getLotLevel(area)}. szintu haz`);
    }
    polygon.addEventListener("click", () => handleSvgMapAreaClick(area, frameLeft, frameTop, frameWidth, frameHeight));
    group.appendChild(polygon);
    group.appendChild(createTerritoryHoverOverlay(area, index, defs));
    if (landmark) landmarkLayer.appendChild(landmark);
    if (numberMarker) group.appendChild(numberMarker);
    group.appendChild(createSvgAreaLabel(area));
    mapSvgOverlay.appendChild(group);
  });

  clickableBuildingDefs.forEach((area, index) => {
    const quest = getQuestAtSpot(area.id);
    const rival = getRivalEventAtSpot(area.id);
    const plot = createSvgPolygon(
      { polygon: area.plot },
      ["map-svg-plot", "map-svg-plot--building", getPlotDifficultyClass(area)],
    );
    plot.dataset.areaId = area.id;
    plot.addEventListener("click", () => handleSvgMapAreaClick(area, frameLeft, frameTop, frameWidth, frameHeight));

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("map-svg-building-group");
    group.appendChild(createBuildingOutlineOverlay(area, index, defs));
    group.appendChild(plot);

    const polygon = createSvgPolygon(area, ["map-svg-area", "map-svg-area--building"]);
    polygon.setAttribute("aria-label", area.name);
    polygon.dataset.areaId = area.id;
    if (quest) {
      polygon.classList.add("map-svg-area--quest");
    }
    if (rival) {
      polygon.classList.add("map-svg-area--rival");
    }
    if (activeChoiceSpot?.id === area.id) {
      polygon.classList.add("is-selected");
    }
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = area.name;
    polygon.appendChild(title);
    polygon.addEventListener("click", () => handleSvgMapAreaClick(area, frameLeft, frameTop, frameWidth, frameHeight));
    group.appendChild(polygon);
    group.appendChild(createSvgAreaLabel(area, "building"));
    if (quest) {
      group.appendChild(createQuestMarker(area));
    }
    if (rival) {
      group.appendChild(createRivalMarker(area));
    }
    mapSvgOverlay.appendChild(group);
  });
  // A térképi landmarkok külön, legfelső vizuális rétegen maradnak.
  // Így a később kirajzolt telek- és épület-overlayek nem sötétítik el őket.
  if (landmarkLayer.childNodes.length) mapSvgOverlay.appendChild(landmarkLayer);
  applyMapPanTransform();
}

function formatMoney(value) {
  return `${value} $`;
}

function normalizeCrewMembers(members, storedCrewCount = 0) {
  const savedMembers = Array.isArray(members) ? members : [];
  const hasExplicitHireState = savedMembers.some((member) => (
    member && Object.prototype.hasOwnProperty.call(member, "hired")
  ));
  const legacyCrewCount = hasExplicitHireState
    ? 0
    : clamp(Math.round(Number(storedCrewCount) || 0), 0, crewMemberTemplates.length);
  return crewMemberTemplates.map((template, index) => {
    const saved = savedMembers.find((member) => member?.id === template.id) || {};
    const hasSavedMember = Boolean(savedMembers.find((member) => member?.id === template.id));
    const level = clamp(Number.isFinite(saved.level) ? Math.round(saved.level) : 1, 1, 20);
    const defenseLevel = clamp(Number.isFinite(saved.defenseLevel) ? Math.round(saved.defenseLevel) : 1, 1, 20);
    const maxHealth = getCrewMaxHealth(template, level, defenseLevel);
    const savedMaxHealth = Math.max(1, Number(saved.baseHealth) || template.baseHealth);
    const savedHealth = clamp(Number.isFinite(saved.health) ? saved.health : savedMaxHealth, 0, savedMaxHealth);
    const hasEquipment = saved.equipment && typeof saved.equipment === "object"
      && Object.values(saved.equipment).some((item) => item && typeof item === "object");
    const legacyOwned = saved.hired === true
      || (!hasExplicitHireState && index < legacyCrewCount)
      || (hasSavedMember && (
        level > 1
        || defenseLevel > 1
        || Number(saved.attackBonus) > 0
        || Number(saved.defenseBonus) > 0
        || hasEquipment
      ));
    return {
      ...template,
      baseHealth: maxHealth,
      hired: Boolean(legacyOwned),
      level,
      defenseLevel,
      attackBonus: Math.max(0, Math.round(Number(saved.attackBonus) || 0)),
      defenseBonus: Math.max(0, Math.round(Number(saved.defenseBonus) || 0)),
      health: clamp(Math.round(maxHealth * (savedHealth / savedMaxHealth)), 0, maxHealth),
      equipment: normalizeCrewEquipment(saved.equipment),
    };
  });
}

function mergeProtectedClientCrewMembers(existingSource, incomingSource, existingCrewCount = 0, incomingCrewCount = 0) {
  const existing = normalizeCrewMembers(existingSource, existingCrewCount);
  const incoming = normalizeCrewMembers(incomingSource, incomingCrewCount);
  const existingById = new Map(existing.map((member) => [member.id, member]));
  return incoming.map((member) => {
    const previous = existingById.get(member.id);
    if (!previous?.hired) return member;
    const isRegression = !member.hired
      || member.level < previous.level
      || member.defenseLevel < previous.defenseLevel
      || member.baseHealth < previous.baseHealth;
    const equipment = isRegression
      ? Object.fromEntries(equipmentSlotOrder.map((slot) => [
          slot,
          member.equipment?.[slot] || previous.equipment?.[slot] || null,
        ]))
      : member.equipment;
    return {
      ...previous,
      ...member,
      hired: true,
      level: Math.max(previous.level, member.level),
      defenseLevel: Math.max(previous.defenseLevel, member.defenseLevel),
      baseHealth: Math.max(previous.baseHealth, member.baseHealth),
      attackBonus: Math.max(previous.attackBonus || 0, member.attackBonus || 0),
      defenseBonus: Math.max(previous.defenseBonus || 0, member.defenseBonus || 0),
      health: isRegression ? previous.health : member.health,
      equipment,
    };
  });
}

function protectClientPersistentProgress(saved) {
  if (!saved || typeof saved !== "object") return saved;
  const savedProfileName = String(saved.profileName || "");
  const isSameLoadedProfile = Boolean(
    state.registered
    && state.profileName
    && savedProfileName
    && savedProfileName === state.profileName,
  );
  if (!isSameLoadedProfile) return saved;
  const crewMembers = mergeProtectedClientCrewMembers(
    state.crewMembers,
    saved.crewMembers,
    state.crew,
    saved.crew,
  );
  const hiredCrewCount = crewMembers.filter((member) => member.hired).length;
  const activeCrewMemberId = crewMembers.some((member) => member.hired && member.id === saved.activeCrewMemberId)
    ? saved.activeCrewMemberId
    : crewMembers.some((member) => member.hired && member.id === state.activeCrewMemberId)
      ? state.activeCrewMemberId
      : (crewMembers.find((member) => member.hired)?.id || null);
  const currentDungeonProgress = state.dungeonProgress && typeof state.dungeonProgress === "object" ? state.dungeonProgress : {};
  const savedDungeonProgress = saved.dungeonProgress && typeof saved.dungeonProgress === "object" ? saved.dungeonProgress : {};
  const dungeonProgress = Object.fromEntries(["easy", "medium", "hard"].map((key) => [
    key,
    clamp(Math.max(Number(currentDungeonProgress[key]) || 1, Number(savedDungeonProgress[key]) || 1), 1, 88),
  ]));
  return {
    ...saved,
    territories: mergeProtectedClientTerritories(state.territories, saved.territories),
    crewMembers,
    crew: Math.max(hiredCrewCount, Number(state.crew) || 0, Number(saved.crew) || 0),
    activeCrewMemberId,
    dungeonProgress,
    underworldMoney: Math.max(0, Number(state.underworldMoney) || 0),
    underworldXp: Math.max(0, Number(state.underworldXp) || 0, Number(saved.underworldXp) || 0),
  };
}

function normalizeCrewEquipment(source) {
  const output = getEmptyEquipment();
  equipmentSlotOrder.forEach((slot) => {
    const item = source && typeof source === "object" ? source[slot] : null;
    output[slot] = item ? normalizeEquipmentItem(slot, item) : null;
  });
  return output;
}

function getHiredCrewMembers() {
  return (Array.isArray(state.crewMembers) ? state.crewMembers : []).filter((member) => member.hired);
}

function getCrewHireCost(member) {
  if (!member) return 0;
  return Math.max(0, Math.round(Number(crewHireCosts[member.id]) || 0));
}

function getCrewEquipmentPower(member, stat = null) {
  if (!member?.equipment) return 0;
  return equipmentSlotOrder.reduce((sum, slot) => {
    const item = member.equipment?.[slot];
    if (!item) return sum;
    const itemStat = item.stat || equipmentSlotDefs[slot]?.stat;
    if (stat && itemStat !== stat) return sum;
    return sum + (Number(item.power) || 0);
  }, 0);
}

function isItemEquippedAnywhere(itemId, except = {}) {
  if (!itemId) return false;
  const playerUses = Object.values(state.equipment || {}).some((item) => item?.id === itemId);
  if (playerUses && except.owner !== "player") return true;
  return (Array.isArray(state.crewMembers) ? state.crewMembers : []).some((member) => {
    if (except.owner === "crew" && except.memberId === member.id) return false;
    return Object.values(member.equipment || {}).some((item) => item?.id === itemId);
  });
}

function getCrewMemberAttack(member) {
  return member
    ? member.baseAttack
      + (member.attackBonus || 0)
      + getCrewEquipmentPower(member, "attack")
      + Math.floor((Math.max(1, Number(member.level) || 1) - 1) * 0.65)
    : 0;
}

function getCrewMemberDefense(member) {
  return member
    ? member.baseDefense
      + (member.defenseBonus || 0)
      + getCrewEquipmentPower(member, "defense")
      + Math.floor((Math.max(1, Number(member.defenseLevel) || 1) - 1) * 0.55)
    : 0;
}

function getCrewMemberUpgradeCost(member) {
  if (!member) return 0;
  const level = clamp(Math.round(Number(member.level) || 1), 1, 20);
  return Math.round((115 + level * 58 + level ** 2 * 7) * CREW_UPGRADE_COST_MULTIPLIER);
}

function getCrewMemberDefenseUpgradeCost(member) {
  if (!member) return 0;
  const level = clamp(Math.round(Number(member.defenseLevel) || 1), 1, 20);
  return Math.round((95 + level * 52 + level ** 2 * 6) * CREW_UPGRADE_COST_MULTIPLIER);
}

function getCrewMemberHealCost(member) {
  if (!member) return 0;
  const missingHealth = Math.max(0, member.baseHealth - member.health);
  if (!missingHealth) return 0;
  const missingRatio = clamp(missingHealth / Math.max(1, Number(member.baseHealth) || 1), 0, 1);
  const levelWeight = Math.max(1, Number(member.level) || 1) + Math.max(1, Number(member.defenseLevel) || 1);
  const combatStrength = getCrewMemberAttack(member) + getCrewMemberDefense(member);
  const treatmentFee = (60 + levelWeight * 12 + levelWeight ** 2 * 0.22) * missingRatio ** 0.75;
  const healthPointPrice = 2.2 + levelWeight * 0.09 + combatStrength * 0.012;
  return Math.max(20, Math.ceil(
    (treatmentFee + missingHealth * healthPointPrice) * 0.5 * CREW_HEAL_COST_MULTIPLIER,
  ));
}

function getActiveCrewMember() {
  const hired = getHiredCrewMembers();
  return hired.find((member) => member.id === state.activeCrewMemberId) || hired[0] || null;
}

function getCrewReadiness(member) {
  if (!member || !member.baseHealth) return 0;
  return clamp(member.health / member.baseHealth, 0, 1);
}

function getBandPowerProfile() {
  const members = getHiredCrewMembers();
  const activeMember = getActiveCrewMember();
  const crewAttackTotal = members.reduce((sum, member) => sum + getCrewMemberAttack(member), 0);
  const crewDefenseTotal = members.reduce((sum, member) => sum + getCrewMemberDefense(member), 0);
  const crewLevelTotal = members.reduce((sum, member) => sum + Math.max(1, Number(member?.level) || 1), 0);
  const crewReadinessAverage = members.length
    ? members.reduce((sum, member) => sum + getCrewReadiness(member), 0) / members.length
    : 1;
  const activeAttack = activeMember ? getCrewMemberAttack(activeMember) : 0;
  const activeDefense = activeMember ? getCrewMemberDefense(activeMember) : 0;
  const rankLevel = getRankLevel(state.fame);
  const baseProfilePower = (
    state.gearPower
    + rankLevel * 6
    + state.cityLevel * 4
    + members.length * 3
    + getEarlyGameActionBonus()
  );
  const assault = Math.round(
    baseProfilePower
      + activeAttack
      + crewAttackTotal * 0.75
      + crewDefenseTotal * 0.2
      + crewLevelTotal * 0.4
      + crewReadinessAverage * 10,
  );
  const pressure = Math.round(
    baseProfilePower
      + activeAttack * 0.5
      + activeDefense * 0.65
      + crewAttackTotal * 0.4
      + crewDefenseTotal * 0.52
      + crewLevelTotal * 0.35
      + crewReadinessAverage * 12,
  );
  const resilience = Math.round(
    baseProfilePower
      + activeDefense
      + crewDefenseTotal * 0.76
      + crewAttackTotal * 0.16
      + crewLevelTotal * 0.38
      + crewReadinessAverage * 16,
  );
  return {
    assault,
    pressure,
    resilience,
    readiness: crewReadinessAverage,
  };
}

function getActionPower(actionType = "robbery") {
  const profile = getBandPowerProfile();
  if (actionType === "protection") {
    return Math.round(profile.pressure * 0.68 + profile.resilience * 0.32);
  }
  if (actionType === "map") {
    return Math.round(profile.assault * 0.6 + profile.pressure * 0.25 + profile.resilience * 0.15);
  }
  return profile.assault;
}

function renderCrewPanel() {
  if (!crewCards) return;
  if (!Array.isArray(state.crewMembers) || state.crewMembers.length === 0) {
    state.crewMembers = makeCrewMembers();
  }
  const sourceMembers = Array.isArray(state.crewMembers) ? state.crewMembers : makeCrewMembers();
  const members = crewMemberTemplates
    .map((template) => sourceMembers.find((member) => member?.id === template.id))
    .filter(Boolean);
  state.crewMembers = members;
  const hiredMembers = getHiredCrewMembers();
  const totalPower = hiredMembers.reduce((sum, member) => sum + getCrewMemberAttack(member), 0);
  const renderKey = `${state.money}|${state.activeCrewMemberId}|${members.map((member) => `${member.id}:${member.hired ? 1 : 0}:${member.level}:${member.defenseLevel}:${member.health}:${equipmentSlotOrder.map((slot) => member.equipment?.[slot]?.id || "-").join(",")}`).join("|")}`;
  if (renderKey === crewPanelRenderKey) return;
  crewPanelRenderKey = renderKey;
  if (crewPowerTotal) crewPowerTotal.textContent = `${totalPower} ero`;

  crewCards.innerHTML = members.map((member) => {
    const attack = getCrewMemberAttack(member);
    const defense = getCrewMemberDefense(member);
    const cost = getCrewMemberUpgradeCost(member);
    const defenseCost = getCrewMemberDefenseUpgradeCost(member);
    const healCost = getCrewMemberHealCost(member);
    const isActive = member.id === state.activeCrewMemberId;
    const hired = Boolean(member.hired);
    const hireCost = getCrewHireCost(member);
    return `
      <article class="crew-card${isActive ? " is-active" : ""}${hired ? "" : " is-locked"}" data-member-id="${member.id}">
        <div class="crew-card__portrait">
          <img src="${getCrewPortraitAsset(member)}" alt="${member.name}">
          <div class="crew-card__level">${hired ? `${member.level}. szint` : "Nincs felbérelve"}</div>
        </div>
        <div class="crew-card__body">
          <div class="crew-card__header">
            <strong class="crew-card__name">${member.name}</strong>
            <div class="crew-card__role">${member.role}</div>
          </div>
          ${hired ? `<div class="crew-card__stats">
            <div class="crew-card__stat">
              <div class="crew-card__stat-copy">
                <small>Ero</small>
                <strong>${attack}</strong>
              </div>
              <button class="crew-card__mini-action" data-crew-action="upgrade" type="button"${state.money < cost || member.level >= 20 ? " disabled" : ""}>${member.level >= 20 ? "Max" : `${cost}$`}</button>
            </div>
            <div class="crew-card__stat">
              <div class="crew-card__stat-copy">
                <small>HP</small>
                <strong>${member.health}/${member.baseHealth}</strong>
              </div>
              <button class="crew-card__mini-action" data-crew-action="heal" type="button"${state.money < healCost || healCost <= 0 ? " disabled" : ""}>${healCost > 0 ? `${healCost}$` : "Max"}</button>
            </div>
            <div class="crew-card__stat">
              <div class="crew-card__stat-copy">
                <small>Vedelem</small>
                <strong>${defense}</strong>
              </div>
              <button class="crew-card__mini-action" data-crew-action="defense" type="button"${state.money < defenseCost || member.defenseLevel >= 20 ? " disabled" : ""}>${member.defenseLevel >= 20 ? "Max" : `${defenseCost}$`}</button>
            </div>
          </div>` : `<div class="crew-card__stats">
            <div class="crew-card__stat crew-card__stat--hire">
              <div class="crew-card__stat-copy">
                <small>Felbérlés</small>
                <strong>${hireCost} $</strong>
              </div>
              <button class="crew-card__mini-action" data-crew-action="hire" type="button"${state.money < hireCost ? " disabled" : ""}>Vétel</button>
            </div>
          </div>`}
        </div>
      </article>
    `;
  }).join("");
}

async function hireCrewMember(memberId) {
  const member = state.crewMembers.find((entry) => entry.id === memberId);
  if (!member) return;
  if (member.hired) {
    state.activeCrewMemberId = member.id;
    sceneRef?.setMessage(`${member.name} mar a bandad tagja.`);
    return;
  }
  const cost = getCrewHireCost(member);
  if (!canAfford(cost)) {
    sceneRef?.setMessage(`Nincs eleg penz ${member.name} felberlesere.`);
    return;
  }
  try {
    const result = await requestServerEconomy("crew", { operation: "hire", memberId });
    completeMentorStep("crew");
    crewPanelRenderKey = "";
    sceneRef?.pushLog(`${member.name} csatlakozott a bandahoz. -${result.cost} $.`);
    sceneRef?.setMessage(`${member.name} mostantol bevetheto.`);
    sceneRef?.refreshHUD();
    renderCrewPanel();
  } catch (error) {
    sceneRef?.setMessage(error.message || "A felberles nem sikerult.");
  }
}

async function upgradeCrewMember(memberId) {
  const member = state.crewMembers.find((entry) => entry.id === memberId);
  if (!member) return;
  if (!member.hired) {
    sceneRef?.setMessage("Elobb fel kell berelned ezt az embert.");
    return;
  }
  if (member.level >= 20) {
    sceneRef?.setMessage(`${member.name} elerte a maximalis szintet.`);
    return;
  }
  const cost = getCrewMemberUpgradeCost(member);
  if (!canAfford(cost)) {
    sceneRef?.setMessage(`Nincs eleg penz ${member.name} fejlesztesere.`);
    return;
  }

  try {
    const result = await requestServerEconomy("crew", { operation: "upgrade", memberId });
    const updatedMember = getCrewMemberById(memberId);
    completeMentorStep("crew");
    sceneRef?.pushLog(`${member.name} fejlodott. +${result.gainedPoints} ero, most ${updatedMember?.level || member.level + 1}. szintu.`);
    sceneRef?.setMessage(`${member.name} ereje +${result.gainedPoints} ponttal nott.`);
    sceneRef?.refreshHUD();
    renderCrewPanel();
  } catch (error) {
    sceneRef?.setMessage(error.message || "A fejlesztes nem sikerult.");
  }
}

async function upgradeCrewMemberDefense(memberId) {
  const member = state.crewMembers.find((entry) => entry.id === memberId);
  if (!member) return;
  if (!member.hired) {
    sceneRef?.setMessage("Elobb fel kell berelned ezt az embert.");
    return;
  }
  if (member.defenseLevel >= 20) {
    sceneRef?.setMessage(`${member.name} elerte a maximalis vedelmi szintet.`);
    return;
  }
  const cost = getCrewMemberDefenseUpgradeCost(member);
  if (!canAfford(cost)) {
    sceneRef?.setMessage(`Nincs eleg penz ${member.name} vedelmenek fejlesztesere.`);
    return;
  }

  try {
    const result = await requestServerEconomy("crew", { operation: "defense", memberId });
    completeMentorStep("crew");
    sceneRef?.pushLog(`${member.name} vedelme megerosodott. +${result.gainedPoints} pajzs.`);
    sceneRef?.setMessage(`${member.name} vedelme +${result.gainedPoints} ponttal nott.`);
    sceneRef?.refreshHUD();
    renderCrewPanel();
  } catch (error) {
    sceneRef?.setMessage(error.message || "A vedelmi fejlesztes nem sikerult.");
  }
}

async function healCrewMember(memberId) {
  const member = state.crewMembers.find((entry) => entry.id === memberId);
  if (!member) return;
  if (!member.hired) {
    sceneRef?.setMessage("Elobb fel kell berelned ezt az embert.");
    return;
  }
  const healCost = getCrewMemberHealCost(member);
  if (!healCost) {
    sceneRef?.setMessage(`${member.name} mar maximum eleteroen van.`);
    return;
  }
  if (!canAfford(healCost)) {
    sceneRef?.setMessage(`Nincs eleg penz ${member.name} gyogyitasara.`);
    return;
  }
  try {
    const result = await requestServerEconomy("crew", { operation: "heal", memberId });
    sceneRef?.pushLog(`${member.name} teljesen meggyogyult. -${result.cost} $.`);
    sceneRef?.setMessage(`${member.name} ujra maximum eleteron van.`);
    sceneRef?.refreshHUD();
    renderCrewPanel();
    refreshCrewMemberPanel();
  } catch (error) {
    sceneRef?.setMessage(error.message || "A gyogyitas nem sikerult.");
  }
}

function hideCrewEquipmentPicker() {
  activeCrewEquipmentSlot = null;
  crewEquipmentPicker?.classList.add("hidden");
  crewEquipmentPicker?.setAttribute("aria-hidden", "true");
  resetEquipmentPickerPosition(crewEquipmentPicker);
  refreshCrewMemberPanel();
}

function getCrewMemberById(memberId) {
  return (Array.isArray(state.crewMembers) ? state.crewMembers : []).find((member) => member.id === memberId) || null;
}

async function equipCrewInventoryItem(memberId, slot, itemId) {
  const member = getCrewMemberById(memberId);
  if (!member?.hired) return;
  const item = state.itemInventory?.[slot]?.find((entry) => entry.id === itemId);
  if (!item) return;
  if (isItemEquippedAnywhere(item.id, { owner: "crew", memberId })) {
    sceneRef?.setMessage("Ezt a targyat mar mas viseli.");
    return;
  }
  try {
    const result = await requestServerEconomy("equip", { owner: "crew", memberId, slot, itemId });
    crewPanelRenderKey = "";
    sceneRef?.setMessage(result.equipped
      ? `${member.name} felszerelte: ${item.name}.`
      : `${member.name} levette: ${item.name}.`);
    refreshCrewMemberPanel();
    showCrewEquipmentPicker(slot);
    sceneRef?.refreshHUD();
  } catch (error) {
    sceneRef?.setMessage(error.message || "A felszereles nem sikerult.");
  }
}

function getEquipmentPickerAnchorSlot(slot) {
  if (!equipmentSlotOrder.includes(slot)) return null;
  return document.querySelector(`.character-equipment__slot[data-slot="${slot}"]`);
}

function getCrewEquipmentPickerAnchorSlot(slot) {
  if (!equipmentSlotOrder.includes(slot) || !crewEquipmentGrid) return null;
  return crewEquipmentGrid.querySelector(`[data-crew-slot="${slot}"]`);
}

function resetEquipmentPickerPosition(picker) {
  if (!picker) return;
  picker.style.left = "";
  picker.style.top = "";
  picker.style.right = "";
  picker.style.bottom = "";
}

function positionEquipmentPickerNearAnchor(picker, anchor) {
  if (!picker || !anchor) {
    resetEquipmentPickerPosition(picker);
    return;
  }
  const container = picker.offsetParent || picker.parentElement;
  if (!container) return;
  const gap = 10;
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();
  const pickerWidth = Math.max(240, pickerRect.width || 286);
  const pickerHeight = Math.max(120, pickerRect.height || 220);
  const rightSpace = containerRect.right - anchorRect.right - gap;
  const leftSpace = anchorRect.left - containerRect.left - gap;
  let left = rightSpace >= pickerWidth || rightSpace >= leftSpace
    ? anchorRect.right - containerRect.left + gap
    : anchorRect.left - containerRect.left - pickerWidth - gap;
  let top = anchorRect.top - containerRect.top;
  left = Math.max(gap, Math.min(left, containerRect.width - pickerWidth - gap));
  top = Math.max(gap, Math.min(top, containerRect.height - pickerHeight - gap));
  picker.style.left = `${Math.round(left)}px`;
  picker.style.top = `${Math.round(top)}px`;
  picker.style.right = "auto";
  picker.style.bottom = "auto";
}

function showCrewEquipmentPicker(slot, anchor = null) {
  const member = getCrewMemberById(activeCrewSheetMemberId);
  const slotDef = equipmentSlotDefs[slot];
  if (!member?.hired || !slotDef || !crewEquipmentPicker || !crewEquipmentPickerList) return;
  const availableItems = getFreeInventoryItemsForSlot(slot);
  activeCrewEquipmentSlot = slot;
  if (crewEquipmentPickerTitle) crewEquipmentPickerTitle.textContent = `${member.name}: ${slotDef.label}`;
  const listHtml = availableItems.length ? availableItems.map((item) => {
    return `
      <button class="equipment-picker__item" type="button" data-crew-equip-slot="${slot}" data-item-id="${escapeHtml(item.id)}">
        <img class="equipment-picker__art equipment-picker__art--${slot}" src="${item.image || getEquipmentArt(slot)}" alt="">
        <span class="equipment-picker__copy">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${getEquipmentBonusText(slot, item.power, item.stat)}</small>
        </span>
        <em>Felveszem</em>
      </button>
    `;
  }).join("") : `<div class="equipment-picker__empty">Nincs szabad ${escapeHtml(slotDef.label.toLowerCase())} itemed. A viselt tárgyak nem jelennek meg a listában.</div>`;
  crewEquipmentPickerList.innerHTML = listHtml;
  crewEquipmentPicker.classList.remove("hidden");
  crewEquipmentPicker.setAttribute("aria-hidden", "false");
  positionEquipmentPickerNearAnchor(crewEquipmentPicker, anchor || getCrewEquipmentPickerAnchorSlot(slot));
  refreshCrewMemberPanel();
}

function refreshCrewMemberPanel() {
  const member = getCrewMemberById(activeCrewSheetMemberId);
  if (!member?.hired || !crewMemberPanel) return;
  member.equipment = normalizeCrewEquipment(member.equipment);
  if (crewMemberPanelTitle) crewMemberPanelTitle.textContent = member.name;
  if (crewMemberPanelImage) crewMemberPanelImage.src = getCrewPortraitAsset(member);
  if (crewMemberPanelName) crewMemberPanelName.textContent = member.name;
  if (crewMemberPanelRole) crewMemberPanelRole.textContent = member.role;
  if (crewMemberPanelLevel) crewMemberPanelLevel.textContent = String(member.level);
  if (crewMemberPanelHealth) crewMemberPanelHealth.textContent = `${member.health} / ${member.baseHealth}`;
  if (crewMemberPanelAttack) crewMemberPanelAttack.textContent = String(getCrewMemberAttack(member));
  if (crewMemberPanelDefense) crewMemberPanelDefense.textContent = String(getCrewMemberDefense(member));
  if (crewMemberEquipmentGrid) {
    crewMemberEquipmentGrid.innerHTML = equipmentSlotOrder.map((slot) => {
      const item = member.equipment?.[slot];
      const active = activeCrewEquipmentSlot === slot;
      return `
        <button class="crew-member-equipment-slot${active ? " is-active" : ""}" type="button" data-crew-slot="${slot}">
          <img src="${item?.image || getEquipmentArt(slot)}" alt="">
          <span class="crew-member-equipment-copy">
            <span>${equipmentSlotDefs[slot]?.label || slot}</span>
            <strong>${item?.name || "Ures"}</strong>
            <small>${item ? getEquipmentBonusText(slot, item.power, item.stat) : "Valassz targyat"}</small>
          </span>
        </button>
      `;
    }).join("");
  }
}

function showCrewMemberPanel(memberId) {
  const member = getCrewMemberById(memberId);
  if (!member?.hired || !crewMemberPanel) return;
  activeCrewSheetMemberId = member.id;
  activeCrewEquipmentSlot = null;
  hideChoiceWheel();
  crewMemberPanel.classList.remove("hidden");
  crewMemberPanel.setAttribute("aria-hidden", "false");
  refreshCrewMemberPanel();
}

function hideCrewMemberPanel() {
  hideCrewEquipmentPicker();
  activeCrewSheetMemberId = null;
  crewMemberPanel?.classList.add("hidden");
  crewMemberPanel?.setAttribute("aria-hidden", "true");
}

function hash2(x, y, salt = 0) {
  let n = x * 374761393 + y * 668265263 + salt * 1442695041;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function makeDistricts() {
  return districtDefs.map((district) => ({
    ...district,
    controlled: false,
    loyalty: 0,
  }));
}

function setHudVisible(visible) {
  hudRoot?.classList.toggle("hidden", !visible);
  mapSvgOverlay?.classList.toggle("hidden", !visible);
  devRefillButton?.classList.toggle("hidden", !visible);
  devRefillButton?.setAttribute("aria-hidden", visible ? "false" : "true");
  if (!visible) {
    clearRobberyAutoPlay();
    hideCharacterPanel();
    hideCrewMemberPanel();
    robberyGame?.classList.add("hidden");
    robberyGame?.setAttribute("aria-hidden", "true");
    activeRobberyGame = null;
  }
}

function showAvatarSelection() {
  if (!state.registered || !state.needsAvatarSelection) return;
  overlay?.classList.add("hidden");
  setHudVisible(false);
  hideChoiceWheel();
  avatarSelection?.classList.remove("hidden");
  avatarSelection?.setAttribute("aria-hidden", "false");
}

function hideAvatarSelection() {
  avatarSelection?.classList.add("hidden");
  avatarSelection?.setAttribute("aria-hidden", "true");
}

function selectPlayerAvatar(avatarId) {
  const normalizedId = normalizePlayerAvatarId(avatarId);
  if (!state.registered || !state.needsAvatarSelection || !normalizedId) return false;
  state.avatarId = normalizedId;
  state.needsAvatarSelection = false;
  hideAvatarSelection();
  setHudVisible(true);
  saveGame(true);
  void refreshMessageBadge();
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Valaszd ki a vilagterkepen, hol legyen a varosod.");
  void openAuxPanel("world");
  return true;
}

let activeChoiceSpot = null;
const robberyTacticDefs = {
  stealth: {
    name: "Lopakodás",
    strongAgainst: "watcher",
    damage: 17,
    alert: 7,
  },
  force: {
    name: "Fegyveres roham",
    strongAgainst: "bodyguard",
    damage: 26,
    alert: 18,
  },
  intimidation: {
    name: "Megfélemlítés",
    strongAgainst: "boss",
    damage: 21,
    alert: 11,
  },
};

const robberyDefenderTemplates = {
  watcher: { role: "Megfigyelő", icon: "O" },
  bodyguard: { role: "Testőr", icon: "T" },
  boss: { role: "Helyi főnök", icon: "B" },
};

function getRobberyEnemyCountForSpot(spot, difficulty) {
  const spotId = String(spot?.id || "robbery");
  const seed = [...spotId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const label = getDifficultyInfo(difficulty)?.label;
  const roll = hash2(seed, Math.round(Number(difficulty) || 1), state.buildingDifficultyCycle || state.day || 0);
  const twoEnemyThreshold = label === "Veszelyes"
    ? 0.38
    : label === "Kockazatos"
      ? 0.5
      : 0.62;
  return roll < twoEnemyThreshold ? 2 : 3;
}

function createRobberyDefenders(spot, difficulty, forcedCount = null) {
  const roles = [
    { name: "Vincent", type: "boss" },
    { name: "Salvatore", type: "watcher" },
    { name: "Tommy", type: "bodyguard" },
  ];
  const count = clamp(
    Number.isFinite(Number(forcedCount)) ? Math.round(Number(forcedCount)) : getRobberyEnemyCountForSpot(spot, difficulty),
    2,
    roles.length,
  );

  return Array.from({ length: count }, (_, index) => {
    const role = roles[index];
    const maxHealth = Math.round(28 + difficulty * 0.42 + index * 4);
    return {
      id: `${spot.id}-guard-${index}`,
      name: role.name,
      type: role.type,
      maxHealth,
      health: maxHealth,
    };
  });
}

function getRobberyControl(encounter = activeRobberyGame) {
  if (!encounter?.defenders?.length) return 0;
  const total = encounter.defenders.reduce((sum, defender) => sum + defender.maxHealth, 0);
  const remaining = encounter.defenders.reduce((sum, defender) => sum + Math.max(0, defender.health), 0);
  return clamp(Math.round(((total - remaining) / total) * 100), 0, 100);
}

function refreshRobberyGame() {
  const encounter = activeRobberyGame;
  if (!encounter || !robberyGame) return;

  const control = getRobberyControl(encounter);
  if (robberyGameTitle) robberyGameTitle.textContent = encounter.spot.name;
  if (robberyGameSubtitle) {
    robberyGameSubtitle.textContent = `${encounter.difficultyInfo.label} célpont · erő ${encounter.difficulty}`;
  }
  if (robberyHealthText) robberyHealthText.textContent = `${state.health}%`;
  if (robberyHealthFill) robberyHealthFill.style.width = `${state.health}%`;
  if (robberyControlText) robberyControlText.textContent = `${control}%`;
  if (robberyControlFill) robberyControlFill.style.width = `${control}%`;
  if (robberyAlertText) robberyAlertText.textContent = `${Math.round(encounter.alert)}%`;
  if (robberyAlertFill) robberyAlertFill.style.width = `${encounter.alert}%`;
  if (robberyRound) robberyRound.textContent = `${encounter.round}. kör`;
  if (robberyLoot) robberyLoot.textContent = `Jutalom: ${getRobberyProjectedMoney(encounter)} $`;
  if (robberyInstruction) {
    const selected = encounter.defenders.find((defender) => defender.id === encounter.selectedDefenderId);
    robberyInstruction.textContent = selected?.health > 0
      ? `Célpont: ${selected.name}`
      : "Válassz egy őrt!";
  }
  if (robberyBattleLog) robberyBattleLog.textContent = encounter.message;

  robberyTactics.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.tactic === encounter.selectedTactic);
  });

  if (robberyDefenders) {
    robberyDefenders.replaceChildren();
    encounter.defenders.forEach((defender, index) => {
      const template = robberyDefenderTemplates[defender.type];
      const healthPercent = clamp(Math.round((defender.health / defender.maxHealth) * 100), 0, 100);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `robbery-defender robbery-defender--${index + 1}`;
      button.classList.toggle("is-selected", encounter.selectedDefenderId === defender.id);
      button.classList.toggle("is-defeated", defender.health <= 0);
      button.disabled = encounter.ended || defender.health <= 0;
      button.innerHTML = `
        <span class="robbery-defender__portrait">${template.icon}</span>
        <span class="robbery-defender__copy">
          <strong>${defender.name}</strong>
          <small>${template.role}</small>
          <span class="robbery-defender__health"><i style="width:${healthPercent}%"></i></span>
          <em>${healthPercent}%</em>
        </span>
      `;
      button.addEventListener("click", () => {
        if (!activeRobberyGame || defender.health <= 0) return;
        activeRobberyGame.selectedDefenderId = defender.id;
        activeRobberyGame.message = `${defender.name} kijelölve. Válassz módszert, majd támadj.`;
        refreshRobberyGame();
      });
      robberyDefenders.appendChild(button);
    });
  }

  if (robberyAttack) robberyAttack.disabled = encounter.ended;
}

function showRobberyResult(success, title, text) {
  if (!activeRobberyGame) return;
  activeRobberyGame.ended = true;
  activeRobberyGame.autoPlay = false;
  clearRobberyAutoPlay();
  robberyResult?.classList.remove("hidden");
  robberyResult?.classList.toggle("is-failure", !success);
  if (robberyResultStamp) robberyResultStamp.textContent = success ? "Siker" : "Kudarc";
  if (robberyResultTitle) robberyResultTitle.textContent = title;
  if (robberyResultText) robberyResultText.textContent = text;
  if (robberyAttack) robberyAttack.disabled = true;
}

function getRobberyProjectedMoney(encounter) {
  if (!encounter) return 0;
  const baseGain = encounter.mode === "shop" ? 30 : 18;
  const rewardMultiplier = Number.isFinite(Number(encounter.rewardMultiplier)) ? Number(encounter.rewardMultiplier) : 1;
  const difficultyRewardMultiplier = Number.isFinite(Number(encounter.difficultyRewardMultiplier))
    ? Number(encounter.difficultyRewardMultiplier)
    : getRobberyDifficultyRewardMultiplier(encounter.difficultyInfo?.label);
  return Math.max(
    5,
    Math.round(
      (baseGain + (Number(encounter.loot) || 0) + state.cityLevel * 4 + encounter.difficulty * 0.16)
      * rewardMultiplier
      * difficultyRewardMultiplier,
    ),
  );
}

function finishRobberySuccess() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;

  const target = encounter.targetDistrict;
  const gain = getRobberyProjectedMoney(encounter);
  const fameGain = Math.max(
    1,
    Math.round(
      (encounter.mode === "shop" ? 8 : 5)
      * getRobberyDifficultyFameMultiplier(encounter.difficultyInfo?.label),
    ),
  );
  const heatGain = Math.round(7 + encounter.alert * 0.15);
  state.health = clamp(encounter.healthAtStart, 1, 100);

  state.money += gain;
  applyFame(fameGain);
  const appliedHeat = applyHeat(heatGain);
  if (target) {
    target.loyalty = clamp(target.loyalty + (encounter.mode === "shop" ? 9 : 5), 0, 100);
    if (!target.controlled && target.loyalty >= 65) {
      target.controlled = true;
      sceneRef?.pushLog(`${target.name} most mar a bandadhoz tartozik.`);
    }
  }
  completeQuest("robbery", encounter.spot);
  completeMentorStep("robbery");
  sceneRef?.pushLog(`${encounter.spot.name} kirabolva a mini-játékban: +${gain} $.`);
  sceneRef?.setMessage(`${encounter.spot.name} kirablása sikerült.`);
  queueRewardModal({
    title: "Akcio vege",
    text: `${encounter.spot.name} kirablasa sikerult.`,
    money: gain,
    xp: fameGain,
    fame: fameGain,
  });
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  encounter.ended = true;
  encounter.autoPlay = false;
  clearRobberyAutoPlay();
  closeRobberyGame();
}

function getRobberyFailureHealthLossCap(encounter, reason = "") {
  const label = encounter?.difficultyInfo?.label || getDifficultyInfo(encounter?.difficulty || 0).label;
  if (String(reason).toLowerCase().includes("visszavonult")) return 2;
  if (label === "Veszelyes") return 5;
  if (label === "Kockazatos") return 4;
  return 3;
}

function finishRobberyFailure(reason) {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  const heatGain = encounter.alert >= 100 ? 18 : 8;
  const healthLossCap = getRobberyFailureHealthLossCap(encounter, reason);
  state.health = clamp(encounter.healthAtStart - healthLossCap, 1, 100);
  state.naturalRecoveryAt.health = Date.now();
  const healthLost = Math.max(0, encounter.healthAtStart - state.health);
  const appliedHeat = applyHeat(heatGain);
  sceneRef?.pushLog(`${encounter.spot.name}: a rablás kudarcba fulladt.`);
  sceneRef?.setMessage(reason);
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  showRobberyResult(
    false,
    "A rajtaütés kudarcba fulladt",
    `${reason} Sérülés: -${healthLost} · Körözés: +${appliedHeat}%`,
  );
}

function startRobberyMinigame(spot) {
  if (!state.registered || !spot || !robberyGame) return;
  if (!canStartCombat("A rajtautest")) return;
  const energyCost = spot.mode === "shop" ? 18 : 12;
  if (!spendEnergy(energyCost)) return;

  const difficulty = getBuildingDifficulty(spot);
  const defenders = createRobberyDefenders(spot, difficulty);
  activeRobberyGame = {
    spot,
    targetDistrict: getSelectedDistrict(),
    mode: spot.mode === "shop" ? "shop" : "street",
    difficulty,
    difficultyInfo: getDifficultyInfo(difficulty),
    defenders,
    selectedDefenderId: defenders[0].id,
    selectedTactic: "stealth",
    alert: clamp(Math.round((difficulty - getPlayerPower()) * 0.45), 0, 24),
    loot: 0,
    round: 1,
    healthAtStart: state.health,
    message: "A banda elfoglalta a bejáratot. Válaszd ki az első őrt!",
    ended: false,
  };

  hideChoiceWheel();
  document.body.classList.add("is-robbery-open");
  robberyResult?.classList.add("hidden");
  robberyResult?.classList.remove("is-failure");
  robberyGame.classList.remove("hidden");
  robberyGame.setAttribute("aria-hidden", "false");
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(getDifficultyInfo(difficulty).color));
  saveGame();
  refreshRobberyGame();
  sceneRef?.refreshHUD();
}

function playRobberyTurn() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  const defender = encounter.defenders.find((entry) => entry.id === encounter.selectedDefenderId && entry.health > 0)
    || encounter.defenders.find((entry) => entry.health > 0);
  if (!defender) {
    finishRobberySuccess();
    return;
  }

  encounter.selectedDefenderId = defender.id;
  const tactic = robberyTacticDefs[encounter.selectedTactic] || robberyTacticDefs.stealth;
  const isStrong = tactic.strongAgainst === defender.type;
  const powerBonus = Math.round(getPlayerPower() * 0.16);
  const damage = clamp(
    Math.round((tactic.damage + powerBonus + randomInt(-4, 7)) * (isStrong ? 1.5 : 1) - encounter.difficulty * 0.08),
    7,
    58,
  );
  defender.health = Math.max(0, defender.health - damage);
  const defeated = defender.health <= 0;
  const lootGain = randomInt(4, 9) + (defeated ? randomInt(7, 15) : 0);
  encounter.loot += lootGain;
  encounter.alert = clamp(
    encounter.alert + tactic.alert + Math.round(encounter.difficulty / 22) + randomInt(0, 5) - (isStrong ? 4 : 0),
    0,
    100,
  );

  const remainingDefender = encounter.defenders.find((entry) => entry.health > 0);
  if (remainingDefender) {
    const retaliation = clamp(
      Math.round(2 + encounter.difficulty / 18 + randomInt(0, 6) - (encounter.selectedTactic === "stealth" ? 2 : 0)),
      2,
      14,
    );
    state.health = clamp(state.health - retaliation, 0, 100);
    encounter.message = defeated
      ? `${defender.name} kiesett. +${lootGain} $ zsákmány, az őrök visszavágtak: -${retaliation} életerő.`
      : `${tactic.name}: ${damage} sebzés. +${lootGain} $ zsákmány, visszavágás: -${retaliation} életerő.`;
    encounter.selectedDefenderId = remainingDefender.id;
  } else {
    encounter.message = `${defender.name} kiesett. Az épület védelme összeomlott.`;
  }
  encounter.round += 1;
  sceneRef?.refreshHUD();

  if (!remainingDefender) {
    finishRobberySuccess();
    return;
  }
  if (state.health <= 1) {
    finishRobberyFailure("A bandád túl súlyosan megsérült.");
    return;
  }
  if (encounter.alert >= 100) {
    finishRobberyFailure("Megérkezett a rendőrség.");
    return;
  }
  refreshRobberyGame();
}

function retreatFromRobbery() {
  if (!activeRobberyGame) return;
  if (activeRobberyGame.ended) {
    closeRobberyGame();
    return;
  }
  activeRobberyGame.autoPlay = false;
  clearRobberyAutoPlay();
  activeRobberyGame.alert = clamp(activeRobberyGame.alert + 10, 0, 100);
  finishRobberyFailure("A banda zsákmány nélkül visszavonult.");
}

function closeRobberyGame() {
  clearRobberyAutoPlay();
  robberyGame?.classList.add("hidden");
  robberyGame?.classList.remove("is-solo-battle");
  robberyGame?.classList.remove("is-team-selection");
  robberyGame?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-robbery-open");
  robberyResult?.classList.add("hidden");
  activeRobberyGame = null;
  if (state.heat >= 100) triggerBust();
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
}

function hideEquipmentPicker() {
  activeEquipmentSlot = null;
  equipmentPicker?.classList.add("hidden");
  equipmentPicker?.setAttribute("aria-hidden", "true");
  resetEquipmentPickerPosition(equipmentPicker);
  syncEquipmentSheet();
}

async function equipInventoryItem(slot, itemId) {
  const item = state.itemInventory?.[slot]?.find((entry) => entry.id === itemId);
  if (!item) return;
  const wasEquipped = state.equipment?.[slot]?.id === itemId;
  if (isItemEquippedAnywhere(item.id, { owner: "player" })) {
    sceneRef?.setMessage("Ezt a targyat mar mas viseli.");
    return;
  }
  try {
    const result = await requestServerEconomy("equip", { owner: "player", slot, itemId });
    if (slot === "weapon" && result.equipped) completeMentorStep("equip");
    sceneRef?.setMessage(result.equipped
      ? `${item.name} felveve a(z) ${equipmentSlotDefs[slot]?.label?.toLowerCase() || "felszereles"} helyere.`
      : `${item.name} leveve a karakteredrol.`);
    refreshCharacterPanel();
    if (activeEquipmentSlot === slot) showEquipmentPicker(slot);
    sceneRef?.refreshHUD();
  } catch (error) {
    sceneRef?.setMessage(error.message || (wasEquipped ? "A targy levetele nem sikerult." : "A targy felvetele nem sikerult."));
  }
}

function showEquipmentPicker(slot, anchor = null) {
  const slotDef = equipmentSlotDefs[slot];
  if (!slotDef || !equipmentPicker || !equipmentPickerList) return;
  const availableItems = getFreeInventoryItemsForSlot(slot);
  activeEquipmentSlot = slot;
  if (equipmentPickerTitle) equipmentPickerTitle.textContent = slotDef.label;
  const listHtml = availableItems.length ? availableItems.map((item) => {
    return `
      <button class="equipment-picker__item" type="button" data-equip-slot="${slot}" data-item-id="${escapeHtml(item.id)}">
        <img class="equipment-picker__art equipment-picker__art--${slot}" src="${item.image || getEquipmentArt(slot)}" alt="">
        <span class="equipment-picker__copy">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${getEquipmentBonusText(slot, item.power, item.stat)}</small>
        </span>
        <em>Felveszem</em>
      </button>
    `;
  }).join("") : `<div class="equipment-picker__empty">Nincs szabad ${escapeHtml(slotDef.label.toLowerCase())} itemed. A viselt tárgyak nem jelennek meg a listában.</div>`;
  equipmentPickerList.innerHTML = listHtml;
  equipmentPicker.classList.remove("hidden");
  equipmentPicker.setAttribute("aria-hidden", "false");
  positionEquipmentPickerNearAnchor(equipmentPicker, anchor || getEquipmentPickerAnchorSlot(slot));
  syncEquipmentSheet();
}

function refreshCharacterPanel() {
  const level = getRankLevel(state.fame);
  const currentRank = getCurrentRankEntry(state.fame);
  const nextRankFame = getNextRankFame(state.fame);
  const currentThreshold = currentRank.fame;
  const xpSpan = Math.max(1, nextRankFame - currentThreshold);
  const xpProgress = clamp(Math.round(((state.fame - currentThreshold) / xpSpan) * 100), 0, 100);
  if (characterName) characterName.textContent = state.profileName || "Ismeretlen";
  if (characterRank) characterRank.textContent = rankForFame(state.fame);
  if (characterPortrait) characterPortrait.src = getPlayerAvatarImage();
  if (characterMoney) characterMoney.textContent = String(state.money);
  if (characterLevel) characterLevel.textContent = String(level);
  if (characterHealth) characterHealth.textContent = `${state.health} / 100`;
  if (characterAttack) characterAttack.textContent = String(getPlayerCombatAttackStat());
  if (characterDefense) characterDefense.textContent = String(getPlayerCombatDefenseStat());
  if (characterFame) characterFame.textContent = String(state.fame);
  if (characterHeat) characterHeat.textContent = `${state.heat}%`;
  if (characterCrew) characterCrew.textContent = String(getHiredCrewMembers().length);
  if (characterCityLevel) characterCityLevel.textContent = String(state.cityLevel || 1);
  if (characterXpSummary) {
    characterXpSummary.textContent = nextRankFame > state.fame
      ? `${state.fame - currentThreshold} / ${xpSpan} XP a kovetkezo szinthez`
      : "Maximum szint elerve";
  }
  if (characterXpFill) characterXpFill.style.width = `${nextRankFame > state.fame ? xpProgress : 100}%`;
  if (activeEquipmentSlot) showEquipmentPicker(activeEquipmentSlot);
  refreshItemCraftPanel();
  syncEquipmentSheet();
}

function showCharacterPanel() {
  if (!state.registered || !characterPanel) return;
  hideChoiceWheel();
  refreshCharacterPanel();
  document.body.classList.add("is-character-open");
  characterPanel.classList.remove("hidden");
  characterPanel.setAttribute("aria-hidden", "false");
}

function hideCharacterPanel() {
  hideEquipmentPicker();
  if (characterPanel?.contains(document.activeElement)) document.activeElement?.blur();
  document.body.classList.remove("is-character-open");
  characterPanel?.classList.add("hidden");
  characterPanel?.setAttribute("aria-hidden", "true");
}

async function runTerritoryAction(actionId, territory) {
  if (territory.kind === "park") {
    if (actionId === "robbery") {
      const previousHeat = state.heat;
      const recoveryResult = await startRecovery("health", { layLow: true, spotId: territory.id, spotName: territory.name });
      if (!recoveryResult) return;
      const heatLoss = Math.max(0, previousHeat - state.heat);
      sceneRef?.pushLog(`${territory.name}: lapulás, -${heatLoss}% körözés, -${recoveryResult.influenceLoss || 0}% befolyás.`);
      sceneRef?.setMessage("A Lapulás elindult: 20 perc alatt legfeljebb +50 életerő.");
    } else if (actionId === "protection") {
      if (!await startRecovery("energy", { spotId: territory.id, spotName: territory.name })) return;
      sceneRef?.pushLog(`${territory.name}: találkozó indult.`);
      sceneRef?.setMessage("A Találkozó elindult: 20 perc alatt legfeljebb +50 energia.");
    } else if (actionId === "baseRest") {
      sceneRef?.setMessage("A park semleges terület: lapuláshoz és találkozókhoz használható.");
    }
    return;
  }

  if (territory.kind === "lot") {
    const level = getLotLevel(territory);
    const ownerType = getLotOwnerType(territory);
    if (territory.restoredHouse) {
      if (level <= 0) {
        const targetOwnerType = actionId === "robbery" ? "private" : actionId === "protection" ? "city" : "";
        if (actionId === "lotInfo") {
          showLotInfoModal(territory);
          return;
        }
        if (!targetOwnerType) return;
        const cost = getLotInvestmentCost(territory, targetOwnerType);
        if (!canAfford(cost)) {
          sceneRef?.setMessage(`Nincs eleg penz. Szükséges: ${cost} $.`);
          return;
        }
        if (empireCommandInFlight) return;
        empireCommandInFlight = true;
        let response;
        try {
          response = await requestServerProgression("empire", {
            operation: "lot-invest",
            lotId: territory.id,
            ownerType: targetOwnerType,
          });
        } catch (error) {
          sceneRef?.setMessage(error.message || "Az epulet helyreallitasa nem sikerult.");
          return;
        } finally {
          empireCommandInFlight = false;
        }
        const result = response.result;
        if (targetOwnerType === "private") {
          sceneRef?.pushLog(`${territory.restoredHouseName}: saját házként megvásárolva, -${result.cost} $.`);
          sceneRef?.setMessage(`${territory.restoredHouseName}: mostantól kis napi bevételt ad, és védelmi pénzt is szedhetsz belőle.`);
        } else {
          sceneRef?.pushLog(`${territory.restoredHouseName}: városi házként helyreállítva, -${result.cost} $.`);
          sceneRef?.setMessage(`${territory.restoredHouseName}: mostantól kirabolható, és védelmi pénzt is szedhetsz belőle.`);
        }
        return;
      }
      if (actionId === "lotInfo") {
        showLotInfoModal(territory);
        return;
      }
      if (actionId === "protection") {
        await collectProtectionMoney(getSelectedDistrict(), territory.restoredHouseName || territory.name, territory);
        return;
      }
      if (ownerType === "private") {
        sceneRef?.setMessage("Ez a haz a tied: innen csak vedelmi penzt szedhetsz, kirabolni nem lehet.");
        return;
      }
      if (actionId === "robbery" || actionId === "lotRobbery") {
        startRobberyMinigame({
          ...territory,
          name: territory.restoredHouseName || territory.name,
          districtIndex: Number.isFinite(Number(territory.districtIndex)) ? territory.districtIndex : state.selectedDistrictIndex,
        });
      }
      return;
    }
    if (actionId === "robbery") {
      const maxLevel = getLotMaxLevel(territory);
      if (level >= maxLevel) {
        sceneRef?.setMessage(territory.restoredHouse
          ? "Ezt a telket mar megvasaroltad, az eredeti haz ujra all rajta."
          : "Ez a haz mar a legdiszesebb szinten all.");
        return;
      }
      const cost = getLotInvestmentCost(territory);
      if (!canAfford(cost)) {
        sceneRef?.setMessage(`Nincs eleg penz. Szükséges: ${cost} $.`);
        return;
      }
      if (state.energy < 15) {
        sceneRef?.setMessage("Ehhez az akciohoz 15 energia kell.");
        return;
      }
      if (empireCommandInFlight) return;
      empireCommandInFlight = true;
      let response;
      try {
        response = await requestServerProgression("empire", { operation: "lot-invest", lotId: territory.id });
      } catch (error) {
        sceneRef?.setMessage(error.message || "A telek fejlesztese nem sikerult.");
        return;
      } finally {
        empireCommandInFlight = false;
      }
      const result = response.result;
      sceneRef?.pushLog(territory.restoredHouse
        ? `${territory.restoredHouseName}: telek megvasarolva, -${result.cost} $.`
        : `${territory.name}: haz ${result.level}. szint, -${result.cost} $.`);
      sceneRef?.setMessage(`${territory.name}: ${getLotHouseDef(territory)?.name || "Haz"} - ${getLotIncome(territory)} $ napi bevetel.`);
    } else if (actionId === "protection") {
      if (passiveIncomeOnlyLotIds.has(territory.id)) {
        sceneRef?.setMessage("Az ures telek csak passziv napi bevetelt termel, vedelmi penz nem szedheto belole.");
        return;
      }
      if (level <= 0) {
        showLotInfoModal(territory);
        return;
      }
      await collectProtectionMoney(getSelectedDistrict(), territory.name, territory);
    } else if (actionId === "lotInfo") {
      showLotInfoModal(territory);
    } else if (actionId === "lotRobbery") {
      if (passiveIncomeOnlyLotIds.has(territory.id)) {
        sceneRef?.setMessage("Az ures telek csak passziv napi bevetelt termel, nem rabolhato ki.");
        return;
      }
      if (level <= 0) {
        sceneRef?.setMessage("Ezt a telket elobb meg kell vasarolni.");
        return;
      }
      startRobberyMinigame({
        ...territory,
        mode: "shop",
        districtIndex: Number.isFinite(Number(territory.districtIndex)) ? territory.districtIndex : state.selectedDistrictIndex,
      });
    }
  }
}

function rankForFame(fame) {
  let current = rankTable[0].name;
  for (const entry of rankTable) {
    if (fame >= entry.fame) current = entry.name;
  }
  return current;
}

function getSelectedDistrict() {
  return state.districts[state.selectedDistrictIndex];
}

function applyHeat(amount) {
  const previousHeat = state.heat;
  const rawAmount = Number(amount) || 0;
  const effectiveAmount = rawAmount > 0
    ? Math.max(1, Math.round(rawAmount * HEAT_GAIN_MULTIPLIER))
    : rawAmount;
  state.heat = clamp(state.heat + effectiveAmount, 0, 100);
  return Math.max(0, state.heat - previousHeat);
}

function applyFame(amount) {
  state.fame = Math.max(0, state.fame + amount);
  maybeCompleteMentorLevelGoal();
}

const INFLUENCE_SYSTEM_VERSION = 1;
const STARTING_INFLUENCE = 10;

function normalizeInfluence(value, fallback = STARTING_INFLUENCE) {
  const numericValue = Number(value);
  return clamp(Number.isFinite(numericValue) ? Math.round(numericValue) : fallback, 0, 100);
}

function ensureInfluenceState() {
  const version = Math.max(0, Math.round(Number(state.influenceSystemVersion) || 0));
  state.influence = version < INFLUENCE_SYSTEM_VERSION
    ? Math.max(STARTING_INFLUENCE, normalizeInfluence(state.influence, STARTING_INFLUENCE))
    : normalizeInfluence(state.influence, STARTING_INFLUENCE);
  state.influenceSystemVersion = INFLUENCE_SYSTEM_VERSION;
  return state.influence;
}

function applyInfluenceGain(amount) {
  const previousInfluence = ensureInfluenceState();
  state.influence = normalizeInfluence(previousInfluence + Math.max(0, Math.round(Number(amount) || 0)), previousInfluence);
  return state.influence - previousInfluence;
}

function applyInfluenceLoss(amount) {
  const previousInfluence = ensureInfluenceState();
  const requestedLoss = Math.max(0, Math.round(Number(amount) || 0));
  const influenceLoss = Math.min(previousInfluence, requestedLoss);
  state.influence = normalizeInfluence(previousInfluence - influenceLoss, previousInfluence);
  return influenceLoss;
}

function getInfluenceBenefits(value = state.influence) {
  const influence = normalizeInfluence(value);
  const progress = clamp((influence - STARTING_INFLUENCE) / (100 - STARTING_INFLUENCE), 0, 1);
  return {
    influence,
    progress,
    marketDiscountRate: 0.08 * progress,
    dailyIncomeRate: 0.1 * progress,
    protectionChanceBonus: 0.04 * progress,
    worldTributeRate: 0.1 * progress,
    harborPenaltyReductionRate: 0.1 * progress,
    marketYellowChanceBonus: 0.06 * progress,
    marketRedChanceBonus: 0.1 * progress,
  };
}

function formatInfluenceRate(rate) {
  const percent = Math.round(Math.max(0, Number(rate) || 0) * 1000) / 10;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}

function formatInfluencePoints(rate) {
  return formatInfluenceRate(rate).replace("%", "");
}

function formatInfluenceCurrentRate(rate, prefix = "+") {
  const formattedRate = formatInfluenceRate(rate);
  return formattedRate === "0%" ? "0%" : `${prefix}${formattedRate}`;
}

function renderInfluenceInfo() {
  if (!hudInfluenceInfo) return;
  const benefits = getInfluenceBenefits();
  const currentBenefits = [
    ["Feketepiaci kedvezmény", `${formatInfluenceRate(benefits.marketDiscountRate)} olcsóbb`],
    ["Napi ház- és kerületbevétel", formatInfluenceCurrentRate(benefits.dailyIncomeRate)],
    ["Védelmipénz-sikeresély", `${formatInfluenceCurrentRate(benefits.protectionChanceBonus).replace("%", "")} százalékpont`],
    ["Világtérképes sarcbevétel", formatInfluenceCurrentRate(benefits.worldTributeRate)],
    ["Kikötői büntetés", `${formatInfluenceRate(benefits.harborPenaltyReductionRate)} kevesebb`],
    ["Sárga / piros piaci esély", `${formatInfluenceCurrentRate(benefits.marketYellowChanceBonus)} / ${formatInfluenceCurrentRate(benefits.marketRedChanceBonus)}`],
  ];
  hudInfluenceInfo.innerHTML = `
    <div class="hud-influence-info__head">
      <div><span>Jelenlegi befolyás</span><strong>${benefits.influence}%</strong></div>
    </div>
    <section class="hud-influence-info__section">
      <strong>Most aktív előnyök</strong>
      <div class="hud-influence-info__benefits">
        ${currentBenefits.map(([label, value]) => `
          <div><span>${label}</span><b>${value}</b></div>
        `).join("")}
      </div>
    </section>
  `;
}

function setInfluenceInfoOpen(open) {
  if (!hudInfluenceInfo || !hudInfluencePill) return;
  const shouldOpen = Boolean(open);
  if (shouldOpen) renderInfluenceInfo();
  hudInfluenceInfo.classList.toggle("hidden", !shouldOpen);
  hudInfluenceInfo.classList.toggle("is-open", shouldOpen);
  hudInfluenceInfo.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
  hudInfluencePill.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function applyActionDamage(min = 3, max = 15) {
  syncTimedActions();
  const healthLoss = Math.floor(Math.random() * (max - min + 1)) + min;
  state.health = clamp(state.health - healthLoss, 0, 100);
  state.naturalRecoveryAt.health = Date.now();
  return healthLoss;
}

function getPlayerPower() {
  return getActionPower("robbery");
}

function getBuildingDifficulty(spot) {
  const savedDifficulty = Number(state.buildingDifficulties?.[spot?.id]);
  if (Number.isFinite(savedDifficulty)) return savedDifficulty;
  const district = state.districts[spot?.districtIndex] || districtDefs[spot?.districtIndex] || {};
  const baseSecurity = district.security ?? 50;
  const seedX = Math.round((spot?.mapX ?? spot?.x ?? 0) * 1000) + (spot?.districtIndex ?? 0) * 37;
  const seedY = Math.round((spot?.mapY ?? spot?.y ?? 0) * 1000) + (spot?.id?.length ?? 0) * 29;
  const seedSalt = (spot?.id?.charCodeAt(0) ?? 0) + (spot?.id?.charCodeAt((spot?.id?.length ?? 1) - 1) ?? 0);
  const randomFactor = hash2(seedX, seedY, seedSalt);
  const modeBias = spot?.mode === "shop" ? 10 : -4;
  return Math.round(baseSecurity * 0.45 + randomFactor * 42 + modeBias);
}

function getDifficultyInfo(difficulty, actionType = "robbery") {
  const actionPower = getActionPower(actionType);
  const powerRatio = Math.max(0.01, Number(difficulty) / Math.max(1, actionPower));
  const enemyAttackShare = actionType === "protection" ? 0.52 : 0.58;
  const enemyAttack = Math.max(1, Math.round(difficulty * enemyAttackShare));
  const enemyDefense = Math.max(1, Math.round(difficulty - enemyAttack));
  if (powerRatio <= 0.9) {
    const progress = clamp((powerRatio - 0.75) / 0.15, 0, 1);
    return {
      label: "Konnyu",
      color: 0x62c878,
      successChance: clamp(0.96 - progress * 0.12, 0.84, 0.96),
      enemyAttack,
      enemyDefense,
      actionPower,
      powerRatio,
      recommendedMin: 0.75,
      recommendedMax: 0.9,
    };
  }
  if (powerRatio <= 1.1) {
    const progress = clamp((powerRatio - 0.95) / 0.15, 0, 1);
    return {
      label: "Kockazatos",
      color: 0xd6ad42,
      successChance: clamp(0.72 - progress * 0.2, 0.5, 0.72),
      enemyAttack,
      enemyDefense,
      actionPower,
      powerRatio,
      recommendedMin: 0.95,
      recommendedMax: 1.1,
    };
  }
  const progress = clamp((powerRatio - 1.15) / 0.2, 0, 1);
  return {
    label: "Veszelyes",
    color: 0xc84f42,
    successChance: clamp(0.44 - progress * 0.22, 0.18, 0.44),
    enemyAttack,
    enemyDefense,
    actionPower,
    powerRatio,
    recommendedMin: 1.15,
    recommendedMax: 1.35,
  };
}

function spendEnergy(cost) {
  syncTimedActions();
  if (state.energy < cost) {
    sceneRef?.setMessage(`Nincs eleg akciopont. Szükséges: ${cost}.`);
    return false;
  }
  state.energy = clamp(state.energy - cost, 0, 100);
  state.naturalRecoveryAt.energy = Date.now();
  return true;
}

function canAfford(cost) {
  return state.money >= cost;
}

function getSpotById(spotId) {
  return clickableBuildingDefs.find((spot) => spot.id === spotId) || null;
}

function setMainBase(spot) {
  if (!spot) return;
  if (state.mainBaseSpotId !== spot.id && state.mainBaseClaimDay === state.day) {
    sceneRef?.setMessage("Fő bázist naponta csak egyszer foglalhatsz le.");
    return;
  }
  state.mainBaseSpotId = spot.id;
  state.mainBaseClaimDay = state.day;
  state.selectedDistrictIndex = clamp(spot.districtIndex, 0, state.districts.length - 1);
  completeMentorStep("base");
  sceneRef?.pushLog(`${spot.name} lett a fo bazisod.`);
  sceneRef?.setMessage(`Fő bázis beállítva: ${spot.name}.`);
  saveGame();
}

function restAtBase(spot) {
  if (!state.mainBaseSpotId || spot.id !== state.mainBaseSpotId) {
    sceneRef?.setMessage("Ez nem a fő bázisod.");
    return;
  }
  // A mentor feladat a Pihenés gomb használatát kéri. Ezt a valódi fő
  // bázison akkor is fogadjuk el, ha a játékos már magasabb szintű, tele
  // van az élete/energiája, vagy az ingyenes pihenés még töltődik.
  const completedMentorRest = completeMentorStep("rest");
  const remaining = Math.max(0, Number(state.baseRestAvailableAt) - Date.now());
  if (remaining > 0) {
    sceneRef?.setMessage(completedMentorRest
      ? `A mentor pihenési feladata teljesült. A következő ingyenes pihenésig ${formatCountdown(remaining)} van hátra.`
      : `A bázison ${formatCountdown(remaining)} múlva pihenhetsz újra ingyen.`);
    return;
  }

  const healthGain = Math.min(100 - state.health, 28);
  const energyGain = Math.min(100 - state.energy, 100);
  const heatLoss = Math.min(state.heat, 35);
  state.health = clamp(state.health + healthGain, 0, 100);
  state.energy = clamp(state.energy + energyGain, 0, 100);
  state.heat = clamp(state.heat - heatLoss, 0, 100);
  state.baseRestDay = state.day;
  state.baseRestAvailableAt = Date.now() + BASE_REST_COOLDOWN_MS;
  if (!completedMentorRest) completeMentorStep("rest");
  sceneRef?.pushLog(`Pihenés a bázison. +${healthGain} életerő, +${energyGain} akciópont, -${heatLoss} körözés.`);
  sceneRef?.setMessage("A banda elbújt a bázison. Hat óra múlva pihenhetsz itt újra ingyen.");
  saveGame();
}

function getDistrictRobberySpot(targetDistrict, mode = "street", targetSpot = null) {
  if (targetSpot) return targetSpot;
  const selectedDistrictIndex = Number.isFinite(Number(targetDistrict?.index))
    ? Number(targetDistrict.index)
    : Number.isFinite(Number(state.selectedDistrictIndex))
      ? Number(state.selectedDistrictIndex)
      : 0;
  const candidates = clickableBuildingDefs.filter((spot) =>
    Number(spot.districtIndex) === selectedDistrictIndex && String(spot.mode || "street") === String(mode || "street"),
  );
  if (!candidates.length) return null;
  const exact = candidates.find((spot) => spot.id === state.lastRobberySpotId);
  if (exact) return exact;
  return candidates[randomInt(0, candidates.length - 1)];
}

function raidDistrict(targetDistrict, mode = "street", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return;
  }
  const target = targetDistrict || getSelectedDistrict();
  const robberySpot = getDistrictRobberySpot(target, mode, targetSpot);
  if (!robberySpot) {
    sceneRef?.setMessage("Ebben a kerületben most nincs megfelelő ház a kirabláshoz.");
    return;
  }
  state.lastRobberySpotId = robberySpot.id;
  startRobberyMinigame({
    ...robberySpot,
    districtIndex: Number.isFinite(Number(robberySpot.districtIndex)) ? Number(robberySpot.districtIndex) : state.selectedDistrictIndex,
  });
}

async function collectProtectionMoney(targetDistrict, buildingName = "Haz", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return false;
  }
  if (targetSpot && passiveIncomeOnlyLotIds.has(targetSpot.id)) {
    sceneRef?.setMessage("Az ures telek csak passziv napi bevetelt termel, vedelmi penz nem szedheto belole.");
    return false;
  }
  if (!canStartCombat("A vedelmi penz beszedest")) return false;
  if (targetSpot && getProtectionCooldownRemaining(targetSpot.id) > 0) {
    sceneRef?.setMessage(`Innen meg nem szedhetsz vedelmi penzt. Hatralevo ido: ${formatCountdown(getProtectionCooldownRemaining(targetSpot.id))}.`);
    return false;
  }
  const target = targetDistrict || getSelectedDistrict();
  const spotId = targetSpot?.id || `district-${state.selectedDistrictIndex}-protection`;
  try {
    const response = await requestServerProgression("protection", {
      spotId,
      name: buildingName,
      mode: targetSpot?.mode === "shop" ? "shop" : "street",
      districtIndex: Number.isFinite(Number(targetSpot?.districtIndex)) ? Number(targetSpot.districtIndex) : state.selectedDistrictIndex,
    });
    const result = response.result;
    if (result.success) {
      completeMentorStep("protection");
      sceneRef?.pushLog(`${buildingName}: vedelmi penz befolyt. +${result.moneyGain} $, +${result.fameGain} XP, +${result.influenceGain || 0}% befolyas, +${result.heatGain}% korozes.`);
      sceneRef?.setMessage(`${buildingName}: a vedelmi penz megjott a kasszaba.`);
      queueRewardModal({ title: "Feladat vege", text: `${buildingName}: vedelmi penz megerkezett.`, money: result.moneyGain, xp: result.fameGain, fame: result.fameGain });
      addLocalNotification("Feladat vege", `${buildingName}: a vedelmi penz megerkezett. Jutalom: +${result.moneyGain} $, +${result.fameGain} XP.`, { messageType: "event" });
    } else {
      sceneRef?.pushLog(`${buildingName}: a vedelmi penz beszedese nem sikerult. -${result.healthLoss} eletero, +${result.heatGain}% korozes.`);
      sceneRef?.setMessage(`${buildingName}: nem fizettek. Serules: -${result.healthLoss} HP.`);
      queueRewardModal({ title: "Feladat vege", text: `${buildingName}: a beszedes nem sikerult.`, money: 0, xp: 0, fame: 0, showZeroValues: true });
      addLocalNotification("Feladat vege", `${buildingName}: a vedelmi penz beszedese nem sikerult. Veszteseg: -${result.healthLoss} eletero.`, { messageType: "event" });
    }
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A vedelmi penz beszedese nem indithato.");
    sceneRef?.refreshHUD();
    return false;
  }
}

function resolveRivalBattle(spot, options = {}) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  if (!options.skipCost && !canStartCombat("A rivalis banda elleni harcot")) return false;
  if (!options.skipCost && !spendEnergy(14)) return false;

  const successChance = getRivalAttackChance(rival);
  const success = Math.random() <= successChance;
  const healthLoss = applyActionDamage(success ? 5 : 12, success ? 18 : 28);

  if (success) {
    state.money += rival.rewardMoney;
    applyFame(rival.rewardXp);
    const influenceGain = applyInfluenceGain(3);
    const heatGain = applyHeat(5);
    let rewardItemName = "";
    if (Math.random() <= 0.32) {
      const rivalReward = buildRivalRewardItem(rival);
      const unlocked = unlockEquipmentItem(rivalReward.slot, rivalReward.item);
      rewardItemName = unlocked?.name || rivalReward.item.name;
    }
    state.rivalEvent = null;
    scheduleNextRivalEvent();
    sceneRef?.pushLog(`${spot.name}: rivalis banda leverve. +${rival.rewardMoney} $, +${rival.rewardXp} XP, +${influenceGain}% befolyas.${rewardItemName ? ` Targy: ${rewardItemName}.` : ""}`);
    sceneRef?.setMessage(`Rivalis banda leverve. Jutalom: +${rival.rewardMoney} $, +${rival.rewardXp} XP, +${influenceGain}% befolyas, korozes +${heatGain}%.`);
    queueRewardModal({
      title: "Rivalis banda legyozve",
      text: spot.name,
      money: rival.rewardMoney,
      xp: rival.rewardXp,
      fame: rival.rewardXp,
      itemName: rewardItemName,
    });
    addLocalNotification(
      "Rivalis banda",
      `${spot.name}: legyozted a rivalis bandat. Jutalom: +${rival.rewardMoney} $, +${rival.rewardXp} XP.${rewardItemName ? ` Targy: ${rewardItemName}.` : ""}`,
      { messageType: "event" },
    );
  } else {
    const loss = Math.min(state.money, Math.max(20, Math.round(rival.rewardMoney * 0.22)));
    state.money = Math.max(0, state.money - loss);
    const heatGain = applyHeat(6);
    const influenceLoss = applyInfluenceLoss(3);
    const now = getSynchronizedNow();
    state.rivalEvent = { ...rival, expiresAt: now + Math.max(2 * 60 * 1000, Math.round((rival.expiresAt - now) * 0.55)) };
    sceneRef?.pushLog(`${spot.name}: a rivalis banda visszavert. -${loss} $, -${healthLoss} eletero, -${influenceLoss}% befolyas.`);
    sceneRef?.setMessage(`A rivalis banda tul eros volt. -${loss} $, -${healthLoss} eletero, -${influenceLoss}% befolyas.`);
    queueRewardModal({
      title: "Rivalis banda",
      text: `${spot.name}: a tamadas nem sikerult. -${influenceLoss}% befolyas.`,
      money: -loss,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    addLocalNotification(
      "Rivalis banda",
      `${spot.name}: a rivalis banda visszavert. Veszteseg: -${loss} $, -${healthLoss} eletero, -${influenceLoss}% befolyas, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
  }
  hideAuxPanel();
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  return success;
}

function advanceDistrictLoyalty() {
  state.districts.forEach((district) => {
    district.loyalty = clamp(
      district.loyalty + (district.controlled ? 5 + state.cityLevel : 1),
      0,
      100,
    );
  });
}

function triggerBust() {
  void syncPoliceRaidFromServer();
}

function handleStreetRobbery() {
  raidDistrict(getSelectedDistrict(), "street");
}

function handleShopRaid() {
  raidDistrict(getSelectedDistrict(), "shop");
}

function handleRecruit() {
  const nextMember = (Array.isArray(state.crewMembers) ? state.crewMembers : []).find((member) => !member.hired);
  if (!nextMember) {
    sceneRef?.setMessage("Minden elerheto bandatag mar csatlakozott.");
    return;
  }
  const cost = getCrewHireCost(nextMember);
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz uj emberek toborzasahoz.");
    return;
  }
  if (!spendEnergy(10)) return;
  hireCrewMember(nextMember.id);
  applyFame(6);
  completeMentorStep("crew");
  sceneRef?.pushLog(`${nextMember.name} csatlakozott. -${cost} $.`);
  sceneRef?.setMessage("A banda erosodik.");
}

async function handleExpand() {
  const target = getSelectedDistrict();
  const requiredCrew = Math.max(2, Math.ceil(target.security / 25));
  const requiredFame = target.security + 10;

  if (target.controlled) {
    sceneRef?.setMessage("Ez a kerulet mar a tied.");
    return;
  }

  if (state.crew < requiredCrew || state.fame < requiredFame) {
    sceneRef?.setMessage("Meg nem eleg eros a bandad ehhez a kerulethez.");
    return;
  }
  if (state.energy < 25) {
    sceneRef?.setMessage("A kerulet atvetelehez 25 energia kell.");
    return false;
  }
  if (empireCommandInFlight) return false;
  empireCommandInFlight = true;
  try {
    const response = await requestServerProgression("empire", {
      operation: "district-takeover",
      districtIndex: state.selectedDistrictIndex,
    });
    const result = response.result;
    sceneRef?.pushLog(`${target.name} a birodalom resze lett. +${result.influenceGain || 0}% befolyas, -${result.healthLoss} eletero.`);
    if (result.bust) {
      const cargoLossText = formatCargoLoss(result.bust.cargoLoss);
      sceneRef?.pushLog(`Rendőrségi rajtaütés: -${result.bust.moneyLoss} $ (${result.bust.moneyLossPercent}%)${cargoLossText ? `, elkobzott áru: ${cargoLossText}` : ""}, -${result.bust.heatLoss}% körözés.`);
    }
    sceneRef?.setMessage(`Atvetted ezt a teruletet: ${target.name}. Serules: -${result.healthLoss} eletero.`);
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A kerulet atvetele nem sikerult.");
    return false;
  } finally {
    empireCommandInFlight = false;
  }
}

async function handleUpgradeCity() {
  const cost = 140 + state.cityLevel * 70;
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz a varos fejlesztesere.");
    return;
  }
  if (state.energy < 15) {
    sceneRef?.setMessage("A varos fejlesztesehez 15 energia kell.");
    return false;
  }
  if (empireCommandInFlight) return false;
  empireCommandInFlight = true;
  try {
    const response = await requestServerProgression("empire", { operation: "city-upgrade" });
    sceneRef?.pushLog(`A varos szintje nott. -${response.result.cost} $, varos szint +1.`);
    sceneRef?.setMessage("Erosebb infrastruktura, tobb beveteled lesz.");
    return true;
  } catch (error) {
    sceneRef?.setMessage(error.message || "A varos fejlesztese nem sikerult.");
    return false;
  } finally {
    empireCommandInFlight = false;
  }
}

async function handleLayLow() {
  const response = await startRecovery("health", { layLow: true });
  if (!response) return;
  sceneRef?.pushLog(`A banda lapulni kezdett. -${response.heatLoss || 0}% körözés, -${response.influenceLoss || 0}% befolyás.`);
  sceneRef?.setMessage("A Lapulás elindult: 20 perc alatt legfeljebb +50 életerő.");
}

function startNewGame(name) {
  closeRobberyGame();
  resetMapPan();
  hideAuxPanel();
  state.profileName = name.trim().slice(0, 18);
  state.profileStartedAt = Date.now();
  state.avatarId = "";
  state.needsAvatarSelection = true;
  state.money = 120;
  state.fame = 0;
  state.underworldMoney = 0;
  state.underworldXp = 0;
  state.underworldLevel = 1;
  state.dungeonProgress = { easy: 1, medium: 1, hard: 1 };
  state.influence = STARTING_INFLUENCE;
  state.influenceSystemVersion = INFLUENCE_SYSTEM_VERSION;
  state.crew = 0;
  state.heat = 0;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 0;
  state.equipment = getDefaultEquipment();
  state.itemInventory = getDefaultItemInventory();
  recalculateGearPower();
  state.crewMembers = makeCrewMembers();
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = null;
  state.mainBaseSpotId = null;
  state.worldBaseLotId = null;
  state.worldBaseLevel = 1;
  state.worldRivalCities = [];
  state.npcVillageVictories = 0;
  state.needsWorldBaseSelection = true;
  state.territories = {};
  state.activeQuest = null;
  state.offeredQuests = [];
  state.activeQuests = [];
  state.selectedQuestSlot = 0;
  state.questNextSpawnAt = 0;
  state.questHistory = [];
  state.pendingProtectionRewards = [];
  state.processTasks = [];
  state.harborProcessTasks = [];
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
  state.harborGarage = normalizeHarborGarage();
  state.harborBarUsage = normalizeHarborBarUsage();
  state.rivalEvent = null;
  state.rivalNextSpawnAt = Date.now() + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
  state.mentorStep = 0;
  state.mentorCompleted = false;
  state.mentorFlags = { equippedItem: false, sawWorld: false, enteredHarbor: false };
  state.protectionCooldowns = {};
  state.recoveryEffects = { health: null, energy: null };
  state.recoveryUsage = normalizeRecoveryUsage({}, Date.now());
  state.naturalRecoveryAt = { health: Date.now(), energy: Date.now() };
  state.nextPolicePressureAt = 0;
  state.mainBaseClaimDay = 0;
  state.baseRestDay = 0;
  state.baseRestAvailableAt = 0;
  state.hideUsesToday = 0;
  state.hideUsesDay = 1;
  state.day = 1;
  state.lastDayEndedAt = 0;
  state.lastPassiveIncomeAt = 0;
  state.cityLevel = 1;
  state.districts = makeDistricts();
  state.selectedDistrictIndex = 0;
  state.registered = true;
  state.buildingDifficultyCycle = getBuildingDifficultyCycle();
  state.buildingDifficulties = createRandomBuildingDifficulties(state.buildingDifficultyCycle, state.profileName);
  state.worldRivalCities = syncWorldRivalCities({}, Date.now());
  rememberLastProfileName(state.profileName);
  saveGame(true);
  overlay.classList.add("hidden");
  setHudVisible(false);
  hideChoiceWheel();
  hideQuestCard();
  mentorCardOpen = false;
  sceneRef?.resetLogs();
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Valaszd ki az avatarodat.");
  showAvatarSelection();
}

function resetGame() {
  const profileNameToDelete = state.profileName;
  const pendingSaveRequest = saveRequestInFlight;
  state.registered = false;
  hideAvatarSelection();
  latestQueuedSave = null;
  if (pendingSaveTimer) {
    window.clearTimeout(pendingSaveTimer);
    pendingSaveTimer = null;
  }
  closeRobberyGame();
  resetMapPan();
  hideAuxPanel();
  [LAST_PROFILE_KEY].forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore unavailable local storage and continue resetting the game.
    }
  });
  void (async () => {
    if (pendingSaveRequest) {
      try {
        await pendingSaveRequest;
      } catch {
        // The delete below remains authoritative even if the preceding save failed.
      }
    }
    await deleteRemoteSave(profileNameToDelete);
    await clearActiveProfileSession();
  })();
  state.profileName = "";
  state.avatarId = "";
  state.needsAvatarSelection = false;
  state.money = 120;
  state.fame = 0;
  state.underworldMoney = 0;
  state.underworldXp = 0;
  state.underworldLevel = 1;
  state.dungeonProgress = { easy: 1, medium: 1, hard: 1 };
  state.crew = 0;
  state.heat = 0;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 0;
  state.equipment = getDefaultEquipment();
  state.itemInventory = getDefaultItemInventory();
  recalculateGearPower();
  state.crewMembers = makeCrewMembers();
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = null;
  state.mainBaseSpotId = null;
  state.worldBaseLotId = null;
  state.worldBaseLevel = 1;
  state.worldRivalCities = [];
  state.npcVillageVictories = 0;
  state.needsWorldBaseSelection = false;
  state.territories = {};
  state.buildingDifficulties = {};
  state.activeQuest = null;
  state.offeredQuests = [];
  state.activeQuests = [];
  state.selectedQuestSlot = 0;
  state.questNextSpawnAt = 0;
  state.questHistory = [];
  state.pendingProtectionRewards = [];
  state.processTasks = [];
  state.harborProcessTasks = [];
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
  state.harborGarage = normalizeHarborGarage();
  state.harborBarUsage = normalizeHarborBarUsage();
  state.rivalEvent = null;
  state.rivalNextSpawnAt = 0;
  state.mentorStep = 0;
  state.mentorCompleted = false;
  state.mentorFlags = { equippedItem: false, sawWorld: false, enteredHarbor: false };
  state.protectionCooldowns = {};
  state.recoveryEffects = { health: null, energy: null };
  state.recoveryUsage = normalizeRecoveryUsage({}, Date.now());
  state.naturalRecoveryAt = { health: Date.now(), energy: Date.now() };
  state.nextPolicePressureAt = 0;
  state.mainBaseClaimDay = 0;
  state.baseRestDay = 0;
  state.baseRestAvailableAt = 0;
  state.hideUsesToday = 0;
  state.hideUsesDay = 1;
  state.day = 1;
  state.cityLevel = 1;
  state.districts = makeDistricts();
  state.selectedDistrictIndex = 0;
  state.buildingDifficultyCycle = null;
  state.registered = false;
  overlay.classList.remove("hidden");
  setHudVisible(false);
  hideChoiceWheel();
  hideQuestCard();
  mentorCardOpen = false;
  if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
  updateMentorPanel();
  playerNameInput.value = "";
  sceneRef?.resetLogs();
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Regisztralj, es indul a varosi felemelkedes.");
}

function gridToScreen(originX, originY, tileW, tileH, gx, gy) {
  return {
    x: originX + (gx - gy) * (tileW * 0.5),
    y: originY + (gx + gy) * (tileH * 0.5),
  };
}

let cityEnginePromise = null;

function loadClassicScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Nem toltheto be: ${source}`)), { once: true });
    document.head.append(script);
  });
}

function loadStylesheet(source) {
  if (document.querySelector(`link[href="${source}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = source;
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", () => reject(new Error(`Nem toltheto be: ${source}`)), { once: true });
    document.head.append(link);
  });
}

function ensureCityEngine() {
  if (cityEnginePromise) return cityEnginePromise;
  window.MaffiaAssetRuntime?.loadImage?.(mapBackgroundLayer);
  const featureStyles = Promise.all([
    loadStylesheet("./styles/combat.css?v=mobile-robbery-selection-2026-08-11-15"),
    loadStylesheet("./styles/features.css?v=market-soldout-cycle-2026-08-24-2"),
  ]).then(() => loadStylesheet("./styles/hud-redesign.css?v=nexforge-harbor-link-2026-08-24-4"));
  const phaserEngine = loadClassicScript("https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js");
  cityEnginePromise = Promise.all([featureStyles, phaserEngine])
    .then(() => loadClassicScript("./js/city-scene.js?v=fast-city-startup-2026-08-09-1"))
    .catch((error) => { cityEnginePromise = null; throw error; });
  return cityEnginePromise;
}

createRobberyDefenders = function createTwoOrThreeDefenders(spot, difficulty, count = null) {
  const roles = [
    { name: "Vincent", type: "boss" },
    { name: "Salvatore", type: "watcher" },
    { name: "Tommy", type: "bodyguard" },
  ];
  const defenderCount = clamp(
    Number.isFinite(Number(count)) ? Math.round(Number(count)) : getRobberyEnemyCountForSpot(spot, difficulty),
    2,
    roles.length,
  );
  const defenderLevel = clamp(Math.round(difficulty / 12), 1, 18);
  return roles.slice(0, defenderCount).map((role, index) => {
    const maxHealth = Math.round(34 + defenderLevel * 4 + difficulty * 0.06 + index * 4);
    return {
      id: `${spot.id}-guard-${index}`,
      name: role.name,
      type: role.type,
      level: defenderLevel + index,
      maxHealth,
      health: maxHealth,
      attack: Math.round(6 + defenderLevel * 1.55 + index * 2),
      defense: Math.round(4 + defenderLevel * 1.3 + index),
    };
  });
};

function getCrewCombatPassive(memberId) {
  if (memberId === "luca") {
    return { id: "boss_hunter", label: "Fonokvadasz: +28% sebzes a fonok ellen" };
  }
  if (memberId === "marco") {
    return { id: "marksman", label: "Mesterlovesz: 22% kritikus esely" };
  }
  if (memberId === "enzo") {
    return { id: "guardian", label: "Testor: 22% sebzescsokkentes es magara vonja a tuzet" };
  }
  return { id: "", label: "" };
}

function createBattleAllies(selectedMemberIds) {
  const members = selectedMemberIds
    .map((memberId) => state.crewMembers.find((member) => member.id === memberId))
    .filter((member) => member?.hired && Number(member.health) > 0)
    .slice(0, 2)
    .map((member) => {
      const passive = getCrewCombatPassive(member.id);
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        level: Math.max(1, Math.round(Number(member.level) || 1)),
        maxHealth: member.baseHealth,
        health: member.health,
        attack: getCrewMemberAttack(member),
        defense: getCrewMemberDefense(member),
        passiveId: passive.id,
        passiveLabel: passive.label,
        isPlayer: false,
      };
    });
  const playerLevel = getRankLevel(state.fame);
  const player = {
    id: "player",
    name: state.profileName || "Fonok",
    role: "Te",
    level: playerLevel,
    maxHealth: 100,
    health: state.health,
    attack: getPlayerCombatAttackStat(),
    defense: getPlayerCombatDefenseStat(),
    passiveId: "",
    passiveLabel: "",
    isPlayer: true,
  };
  return [members[0], player, members[1]].filter(Boolean);
}

function getRobberyUnitPower(unit, useCurrentHealth = true) {
  const maxHealth = Math.max(1, Number(unit?.maxHealth) || 1);
  const readiness = useCurrentHealth
    ? clamp((Number(unit?.health) || 0) / maxHealth, 0, 1)
    : 1;
  const attack = Math.max(0, Number(unit?.attack) || 0) * (0.68 + readiness * 0.32);
  const defense = Math.max(0, Number(unit?.defense) || 0) * (0.64 + readiness * 0.36);
  const health = maxHealth * readiness;
  const level = Math.max(1, Number(unit?.level) || 1);
  return attack * 1.2 + defense + health * 0.15 + level * 0.5;
}

function getRobberyTeamPower(units = [], useCurrentHealth = true) {
  return Math.max(1, Math.round(
    units.reduce((sum, unit) => sum + getRobberyUnitPower(unit, useCurrentHealth), 0),
  ));
}

function getRobberyPreviewTier(label) {
  if (label === "Veszelyes") return { threatScale: 1.08, maximumTeamRatio: 1.35 };
  if (label === "Kockazatos") return { threatScale: 1.06, maximumTeamRatio: 1.1 };
  return { threatScale: 1, maximumTeamRatio: 0.9 };
}

function getRobberyCombatProfile(units = []) {
  const validUnits = units.filter(Boolean);
  const count = Math.max(1, validUnits.length);
  return {
    averageAttack: validUnits.reduce((sum, unit) => sum + Math.max(0, Number(unit.attack) || 0), 0) / count,
    averageDefense: validUnits.reduce((sum, unit) => sum + Math.max(0, Number(unit.defense) || 0), 0) / count,
    averageLevel: validUnits.reduce((sum, unit) => sum + Math.max(1, Number(unit.level) || 1), 0) / count,
    totalHealth: validUnits.reduce((sum, unit) => sum + Math.max(1, Number(unit.maxHealth) || 1), 0),
  };
}

function getRobberyCombatPreview(encounter) {
  if (!encounter) return { teamPower: 0, enemyPower: 0, winChance: 0, enemyCount: 0 };
  const allies = encounter.battleStarted && encounter.allies?.length
    ? encounter.allies
    : createBattleAllies(encounter.selectedMemberIds || []);
  const currentTeamPower = getRobberyTeamPower(allies, true);
  const selectedProfile = getRobberyCombatProfile(allies);
  const referenceProfile = encounter.referenceCombatProfile || selectedProfile;
  const fixedEnemyPower = Math.max(0, Math.round(Number(encounter.enemyPowerTarget) || Number(encounter.enemyPower) || 0));
  const actionPower = Math.max(
    1,
    Number(encounter.difficultyInfo?.actionPower) || getPlayerPower(),
  );
  const tier = getRobberyPreviewTier(encounter.difficultyInfo?.label);
  const storedRatio = clamp(
    Math.max(1, Number(encounter.difficulty) || 1) / actionPower,
    0.45,
    1.65,
  );
  const scaleReference = (referenceValue) => referenceValue * storedRatio;
  const averageAttack = Math.max(5, Math.min(
    scaleReference(referenceProfile.averageAttack),
    referenceProfile.averageAttack * tier.maximumTeamRatio,
  ));
  const averageDefense = Math.max(4, Math.min(
    scaleReference(referenceProfile.averageDefense),
    referenceProfile.averageDefense * tier.maximumTeamRatio,
  ));
  const averageLevel = clamp(
    scaleReference(referenceProfile.averageLevel),
    1,
    30,
  );
  const healthScale = encounter.difficultyInfo?.label === "Veszelyes"
    ? 1.05
    : encounter.difficultyInfo?.label === "Kockazatos"
      ? 1.02
      : 1;
  const totalHealth = Math.max(40, Math.min(
    scaleReference(referenceProfile.totalHealth) * healthScale,
    referenceProfile.totalHealth * tier.maximumTeamRatio,
  ));
  const enemyCount = clamp(Math.round(Number(encounter.enemyCount) || 2), 2, 3);
  const roleProfiles = [
    { attack: 1.08, defense: 1.02, health: 1.05, level: 1 },
    { attack: 1.04, defense: 0.92, health: 0.9, level: 0 },
    { attack: 0.9, defense: 1.1, health: 1.05, level: 0 },
  ].slice(0, enemyCount);
  const healthWeightTotal = roleProfiles.reduce((sum, profile) => sum + profile.health, 0);
  const estimatedEnemies = roleProfiles.map((profile) => ({
    attack: averageAttack * profile.attack,
    defense: averageDefense * profile.defense,
    level: averageLevel + profile.level,
    maxHealth: totalHealth * (profile.health / healthWeightTotal),
    health: totalHealth * (profile.health / healthWeightTotal),
  }));
  const calculatedEnemyPower = getRobberyTeamPower(estimatedEnemies, false);
  const enemyPower = fixedEnemyPower > 0
    ? fixedEnemyPower
    : calculatedEnemyPower;
  const passiveBonus = Math.min(
    0.1,
    allies.reduce((sum, ally) => sum + (ally.passiveId ? (ally.passiveId === "guardian" ? 0.03 : 0.035) : 0), 0),
  );
  const previewBattleMode = encounter.battleStarted
    ? encounter.battleMode
    : getRobberyBattleMode(allies.length);
  const underdogBonus = getRobberyUnderdogBonus({ battleMode: previewBattleMode });
  const adjustedTeamPower = currentTeamPower
    * underdogBonus.playerDamageBoost
    / underdogBonus.enemyDamageReduction
    * (1 + underdogBonus.defenseIgnore * 0.35);
  const maximumPower = Math.max(adjustedTeamPower, enemyPower, 1);
  const calculatedWinChance = clamp(
    0.5 + ((adjustedTeamPower - enemyPower) / maximumPower) * 0.9 + passiveBonus,
    0.08,
    0.95,
  );
  return {
    teamPower: currentTeamPower,
    enemyPower: Math.round(enemyPower),
    winChance: encounter.battleStarted && Number(encounter.estimatedWinChance) > 0
      ? Number(encounter.estimatedWinChance)
      : calculatedWinChance,
    enemyCount,
  };
}

function getRobberyBattleMode(allyCount) {
  if (allyCount <= 1) return "lone";
  if (allyCount === 2) return "solo";
  return "full";
}

function getRobberyRewardMultiplier(battleMode) {
  if (battleMode === "lone") return 0.52;
  if (battleMode === "solo") return 0.76;
  return 1;
}

function getRobberyDifficultyRewardMultiplier(label) {
  if (label === "Veszelyes") return 1.35;
  if (label === "Kockazatos") return 1.15;
  return 1;
}

function getRobberyDifficultyFameMultiplier(label) {
  if (label === "Veszelyes") return 1.5;
  if (label === "Kockazatos") return 1.25;
  return 1;
}

function canStartRobberySelection(encounter) {
  return Boolean(encounter)
    && !encounter.battleStarted
    && Array.isArray(encounter.selectedMemberIds)
    && encounter.selectedMemberIds.length >= 1;
}

function getRobberyTierProfile(difficultyInfo, battleMode = "full") {
  const modeProfile = battleMode === "lone"
    ? { stat: 0.97, health: 0.97, enemyDamage: 0.95 }
    : battleMode === "solo"
      ? { stat: 0.99, health: 0.99, enemyDamage: 0.98 }
      : { stat: 1, health: 1, enemyDamage: 1 };
  if (difficultyInfo?.label === "Veszelyes") {
    return {
      color: "red",
      attack: 0.84 * modeProfile.stat,
      defense: 0.78 * modeProfile.stat,
      health: 0.86 * modeProfile.health,
      enemyDamage: 0.84 * modeProfile.enemyDamage,
      levelOffset: 0,
    };
  }
  if (difficultyInfo?.label === "Kockazatos") {
    return {
      color: "yellow",
      attack: 0.82 * modeProfile.stat,
      defense: 0.78 * modeProfile.stat,
      health: 0.84 * modeProfile.health,
      enemyDamage: 0.82 * modeProfile.enemyDamage,
      levelOffset: 0,
    };
  }
  return {
    color: "green",
    attack: 0.83 * modeProfile.stat,
    defense: 0.79 * modeProfile.stat,
    health: 0.85 * modeProfile.health,
    enemyDamage: 0.83 * modeProfile.enemyDamage,
    levelOffset: -1,
  };
}

function getRobberyUnderdogBonus(encounter) {
  const battleMode = encounter?.battleMode || "full";
  if (battleMode === "lone") {
    return { playerDamageBoost: 1.08, enemyDamageReduction: 0.94, defenseIgnore: 0.08 };
  }
  if (battleMode === "solo") {
    return { playerDamageBoost: 1.04, enemyDamageReduction: 0.97, defenseIgnore: 0.04 };
  }
  return {
    playerDamageBoost: 1,
    enemyDamageReduction: 1,
    defenseIgnore: 0,
  };
}

function getBattleUnitReadiness(unit) {
  if (!unit?.maxHealth) return 1;
  return clamp((Number(unit.health) || 0) / Math.max(1, Number(unit.maxHealth) || 1), 0, 1);
}

function getBattleUnitEffectiveAttack(unit) {
  const readiness = getBattleUnitReadiness(unit);
  return Math.max(1, Math.round((Number(unit?.attack) || 0) * (0.65 + readiness * 0.35)));
}

function getBattleUnitEffectiveDefense(unit) {
  const readiness = getBattleUnitReadiness(unit);
  return Math.max(1, Math.round((Number(unit?.defense) || 0) * (0.6 + readiness * 0.4)));
}

function rebalanceDefendersForEncounter(encounter) {
  if (!encounter?.allies?.length || !encounter?.defenders?.length) return;
  const averageAttack = encounter.allies.reduce((sum, ally) => sum + getBattleUnitEffectiveAttack(ally), 0) / encounter.allies.length;
  const averageDefense = encounter.allies.reduce((sum, ally) => sum + getBattleUnitEffectiveDefense(ally), 0) / encounter.allies.length;
  const averageHealth = encounter.allies.reduce((sum, ally) => sum + ally.maxHealth, 0) / encounter.allies.length;
  const averageLevel = encounter.allies.reduce((sum, ally) => sum + Math.max(1, Number(ally.level) || 1), 0) / encounter.allies.length;
  const difficultyInfo = getDifficultyInfo(encounter.difficulty);
  const tierProfile = getRobberyTierProfile(difficultyInfo, encounter.battleMode);
  const roleWeights = {
    watcher: { attack: 0.94, defense: 0.92, health: 0.92, level: 0 },
    boss: { attack: 1.06, defense: 1.02, health: 1.04, level: 1 },
    bodyguard: { attack: 1, defense: 1.04, health: 1, level: 1 },
  };

  encounter.defenders = encounter.defenders.map((defender, index) => {
    const weights = roleWeights[defender.type] || roleWeights.watcher;
    const attackVariance = 0.95 + hash2(index + 1, encounter.spot.id.length, state.day) * 0.1;
    const defenseVariance = 0.95 + hash2(index + 4, encounter.spot.id.length, state.day) * 0.1;
    const healthVariance = 0.95 + hash2(index + 7, encounter.spot.id.charCodeAt(0), state.fame) * 0.1;
    const enemyLevelBase = averageLevel + tierProfile.levelOffset + weights.level + (index * 0.5);
    const enemyLevel = clamp(
      Math.round(enemyLevelBase),
      1,
      25,
    );
    const maxHealth = Math.max(24, Math.round(
      averageHealth * tierProfile.health * weights.health * healthVariance + enemyLevel * 2,
    ));
    return {
      ...defender,
      level: enemyLevel,
      maxHealth,
      health: maxHealth,
      attack: Math.max(4, Math.round(
        averageAttack * tierProfile.attack * weights.attack * attackVariance + enemyLevel * 0.7,
      )),
      defense: Math.max(3, Math.round(
        averageDefense * tierProfile.defense * weights.defense * defenseVariance + enemyLevel * 0.5,
      )),
    };
  });
  encounter.difficultyInfo = difficultyInfo;
  encounter.enemyDamageScale = tierProfile.enemyDamage;
}

function chooseEnemyTarget(livingAllies) {
  if (!livingAllies.length) return null;
  if (livingAllies.length === 1) return livingAllies[0];

  const mostWounded = [...livingAllies].sort(
    (left, right) => (left.health / left.maxHealth) - (right.health / right.maxHealth),
  )[0];
  const player = livingAllies.find((ally) => ally.isPlayer);
  const roll = Math.random();

  if (player && player.health > 0 && roll < 0.34) return player;
  if (roll < 0.78) return mostWounded;
  return livingAllies[randomInt(0, livingAllies.length - 1)];
}

function clearRobberyAutoPlay() {
  if (robberyAutoPlayTimer) {
    window.clearTimeout(robberyAutoPlayTimer);
    robberyAutoPlayTimer = null;
  }
}

function pickAutoRobberyTarget(encounter) {
  const livingEnemies = (encounter?.defenders || []).filter((defender) => defender.health > 0);
  if (!livingEnemies.length) return null;
  const tactic = robberyTacticDefs[encounter.selectedTactic] || robberyTacticDefs.stealth;
  return [...livingEnemies].sort((left, right) => {
    const leftStrong = tactic.strongAgainst === left.type ? 1 : 0;
    const rightStrong = tactic.strongAgainst === right.type ? 1 : 0;
    if (leftStrong !== rightStrong) return rightStrong - leftStrong;
    const leftPressure = left.health + (left.defense || 0) * 1.4;
    const rightPressure = right.health + (right.defense || 0) * 1.4;
    return leftPressure - rightPressure;
  })[0];
}

function selectAutoRobberyTactic(encounter, target) {
  if (!encounter || !target) return;
  const matchingEntry = Object.entries(robberyTacticDefs).find(([, tactic]) => tactic.strongAgainst === target.type);
  if (matchingEntry) encounter.selectedTactic = matchingEntry[0];
}

const ROBBERY_AUTO_DELAY = Object.freeze({
  default: 360,
  selection: 220,
  turn: 360,
  nextAction: 520,
  inputChange: 180,
});

function queueRobberyAutoPlay(encounter, delay = ROBBERY_AUTO_DELAY.default) {
  clearRobberyAutoPlay();
  if (!encounter || activeRobberyGame !== encounter || encounter.ended || !encounter.autoPlay) return;
  robberyAutoPlayTimer = window.setTimeout(() => {
    robberyAutoPlayTimer = null;
    if (!encounter || activeRobberyGame !== encounter || encounter.ended || !encounter.autoPlay) return;
    if (encounter.turnLocked || encounter.finalizing) return;
    if (!encounter.battleStarted) {
      if (canStartRobberySelection(encounter)) playRobberyTurn();
      return;
    }
    const target = pickAutoRobberyTarget(encounter);
    if (!target) {
      finishRobberySuccess();
      return;
    }
    encounter.selectedDefenderId = target.id;
    selectAutoRobberyTactic(encounter, target);
    encounter.message = `${target.name} lett az automata célpont. ${robberyTacticDefs[encounter.selectedTactic].name} következik.`;
    refreshRobberyGame();
    playRobberyTurn();
  }, delay);
}

function clearBattleAnimation(encounter) {
  if (!encounter || activeRobberyGame !== encounter || encounter.ended) return;
  encounter.actionAnimation = null;
  refreshRobberyGame();
}

function resolveEnemyCounterattack(encounter, enemyAttackerId, allyTargetId) {
  if (!encounter || activeRobberyGame !== encounter || encounter.ended) return;
  const enemyAttacker = encounter.defenders.find((defender) => defender.id === enemyAttackerId && defender.health > 0);
  const allyTarget = encounter.allies.find((ally) => ally.id === allyTargetId && ally.health > 0);
  if (!enemyAttacker || !allyTarget) {
    encounter.turnLocked = false;
    clearBattleAnimation(encounter);
    return;
  }

  const underdogBonus = getRobberyUnderdogBonus(encounter);
  const effectiveEnemyAttack = getBattleUnitEffectiveAttack(enemyAttacker);
  const effectiveAllyDefense = getBattleUnitEffectiveDefense(allyTarget);
  const rawRetaliation = clamp(
    Math.round(effectiveEnemyAttack + (enemyAttacker.level || 1) * 0.8 + encounter.alert * 0.015 + randomInt(-3, 4)),
    Math.max(2, Math.round(effectiveEnemyAttack * 0.62)),
    Math.round(effectiveEnemyAttack * 1.08 + (enemyAttacker.level || 1) * 0.7),
  );
  const mitigatedDamage = Math.max(
    encounter.difficultyInfo?.label === "Konnyu" ? 2 : 1,
    Math.round(rawRetaliation * (encounter.enemyDamageScale || 1) * underdogBonus.enemyDamageReduction)
      - Math.round(effectiveAllyDefense * 0.34)
      - Math.round((allyTarget.level || 1) * 0.12),
  );
  allyTarget.health = Math.max(0, allyTarget.health - mitigatedDamage);
  encounter.actionAnimation = {
    actorId: enemyAttacker.id,
    targetId: allyTarget.id,
    side: "enemy",
    type: "attack",
  };
  encounter.message = `${enemyAttacker.name} ralott ${allyTarget.name} karakterere: -${mitigatedDamage} HP.`;
  encounter.round += 1;
  encounter.allyTurnIndex += 1;
  encounter.alert = clamp(encounter.alert + randomInt(2, 5), 0, 100);
  syncBattleHealth(encounter);
  refreshRobberyGame();
  sceneRef?.refreshHUD();

  if (!encounter.allies.some((ally) => ally.health > 0)) {
    window.setTimeout(() => {
      if (activeRobberyGame === encounter && !encounter.ended) {
        finishRobberyFailure("A teljes csapatod elesett.");
      }
    }, 700);
    return;
  }

  encounter.turnLocked = false;
  window.setTimeout(() => clearBattleAnimation(encounter), 420);
  queueRobberyAutoPlay(encounter, ROBBERY_AUTO_DELAY.nextAction);
}

function scheduleEnemyCounterattack(encounter) {
  if (!encounter || activeRobberyGame !== encounter || encounter.ended) return;
  const livingEnemies = encounter.defenders.filter((defender) => defender.health > 0);
  const livingAllies = encounter.allies.filter((ally) => ally.health > 0);
  if (!livingEnemies.length) {
    finishRobberySuccess();
    return;
  }
  if (!livingAllies.length) {
    finishRobberyFailure("A teljes csapatod elesett.");
    return;
  }

  const enemyAttacker = livingEnemies[randomInt(0, livingEnemies.length - 1)];
  encounter.actionAnimation = {
    actorId: enemyAttacker.id,
    targetId: null,
    side: "enemy",
    type: "thinking",
  };
  encounter.message = `${enemyAttacker.name} felmeri a helyzetet...`;
  refreshRobberyGame();

  window.setTimeout(() => {
    if (activeRobberyGame !== encounter || encounter.ended) return;
    const freshTargets = encounter.allies.filter((ally) => ally.health > 0);
    const allyTarget = chooseEnemyTarget(freshTargets);
    if (!allyTarget) {
      finishRobberyFailure("A teljes csapatod elesett.");
      return;
    }
    encounter.actionAnimation = {
      actorId: enemyAttacker.id,
      targetId: allyTarget.id,
      side: "enemy",
      type: "aim",
    };
    encounter.message = `${enemyAttacker.name} kivalasztotta ${allyTarget.name} karakteret celpontnak.`;
    refreshRobberyGame();

    window.setTimeout(() => {
      resolveEnemyCounterattack(encounter, enemyAttacker.id, allyTarget.id);
    }, 650);
  }, 520);
}

function getBattleBackground(encounter) {
  const defenders = encounter?.defenders || [];
  if (encounter?.battleMode === "lone") return "./assets/battle/solo-raid.webp";
  // The scene must follow the visible enemy health bars. A one-crew attack can
  // still face three defenders, so battleMode alone cannot select the duo art.
  if (defenders.length <= 2) return "./assets/battle/battle-duo.webp";
  const defeatedKey = defenders.map((defender) => defender.health <= 0 ? "1" : "0").join("");
  const backgroundsByDefeatedEnemy = {
    "000": "./assets/battle/battle.webp",
    "100": "./assets/battle/battle1.webp",
    "010": "./assets/battle/battle-dead-center.webp",
    "001": "./assets/battle/battle-dead-right.webp",
    "110": "./assets/battle/battle-dead-left-center.webp",
    "101": "./assets/battle/battle-2.webp",
    "011": "./assets/battle/battle-dead-center-right.webp",
    "111": "./assets/battle/battle3.webp",
  };
  return backgroundsByDefeatedEnemy[defeatedKey] || "./assets/battle/battle.webp";
}

function syncBattleHealth(encounter) {
  const player = encounter?.allies?.find((ally) => ally.isPlayer);
  if (player) state.health = clamp(player.health, 0, 100);
  encounter?.allies?.forEach((ally) => {
    if (ally.isPlayer) return;
    const member = state.crewMembers.find((entry) => entry.id === ally.id);
    if (member) member.health = clamp(ally.health, 0, member.baseHealth);
  });
}

refreshRobberyGame = function refreshThreeVsThreeBattle() {
  const encounter = activeRobberyGame;
  if (!encounter || !robberyGame) return;
  const liveHiredMembers = getHiredCrewMembers();
  if (!Array.isArray(encounter.teamPickerOrder) || !encounter.teamPickerOrder.length) {
    encounter.teamPickerOrder = liveHiredMembers.map((member) => String(member.id));
  }
  const teamOrder = new Map(encounter.teamPickerOrder.map((memberId, index) => [String(memberId), index]));
  const hiredMembers = [...liveHiredMembers].sort((left, right) => (
    (teamOrder.get(String(left.id)) ?? Number.MAX_SAFE_INTEGER)
    - (teamOrder.get(String(right.id)) ?? Number.MAX_SAFE_INTEGER)
  ));
  const teamPickerScrollLeft = robberyTeamPicker?.scrollLeft || 0;
  const teamPickerScrollTop = robberyTeamPicker?.scrollTop || 0;
  const readyMembers = hiredMembers.filter((member) => Number(member.health) > 0);
  encounter.selectedMemberIds = encounter.selectedMemberIds.map(String).filter((memberId) => (
    readyMembers.some((member) => String(member.id) === memberId)
  ));
  const selectedDefender = encounter.defenders.find((defender) => defender.id === encounter.selectedDefenderId && defender.health > 0);
  const arena = robberyGame.querySelector(".robbery-game__arena");
  const control = getRobberyControl(encounter);
  const enemyPower = getEncounterEnemyPower(encounter);
  const animation = encounter.actionAnimation || {};
  const combatPreview = getRobberyCombatPreview(encounter);
  const difficultyRewardBonus = Math.max(
    0,
    Math.round((getRobberyDifficultyRewardMultiplier(encounter.difficultyInfo?.label) - 1) * 100),
  );

  if (arena) {
    arena.style.backgroundImage = `linear-gradient(180deg, rgba(4, 3, 2, 0.08), rgba(4, 3, 2, 0.34)), url("${getBattleBackground(encounter)}")`;
    arena.style.backgroundPosition = "center center";
    arena.style.backgroundSize = (encounter.battleMode === "solo" || encounter.battleMode === "lone") ? "cover" : "contain";
    arena.classList.toggle("is-enemy-thinking", animation.side === "enemy" && animation.type === "thinking");
  }
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(encounter.difficultyInfo?.color || 0xd6ad42));
  robberyGame.classList.toggle("is-team-selection", !encounter.battleStarted);
  robberyGame.classList.toggle("is-solo-battle", encounter.battleMode === "solo" || encounter.battleMode === "lone");
  if (robberyCombatPreview) {
    robberyCombatPreview.classList.toggle("is-favorable", combatPreview.winChance >= 0.7);
    robberyCombatPreview.classList.toggle("is-balanced", combatPreview.winChance >= 0.45 && combatPreview.winChance < 0.7);
    robberyCombatPreview.classList.toggle("is-dangerous", combatPreview.winChance < 0.45);
  }
  if (robberyTeamPowerPreview) robberyTeamPowerPreview.textContent = `${combatPreview.teamPower} ero`;
  if (robberyEnemyPowerPreview) {
    robberyEnemyPowerPreview.textContent = `${combatPreview.enemyPower} ero / ${combatPreview.enemyCount} ember`;
  }
  if (robberyWinChancePreview) robberyWinChancePreview.textContent = `${Math.round(combatPreview.winChance * 100)}%`;
  if (robberyCombatAdvice) {
    robberyCombatAdvice.textContent = encounter.selectedMemberIds.length === 0
      ? "A kirablashoz valassz legalabb egy harckepes bandatagot."
      : combatPreview.winChance >= 0.7
        ? "Jo esely: a csapatod felkeszult erre a celpontra."
        : combatPreview.winChance >= 0.45
          ? "Kiegyenlitett harc: a taktika es a szerepkepessegek dontenek."
          : "Nagy kockazat: gyogyits, fejlessz vagy valassz erossebb csapatot.";
  }
  if (robberyGameTitle) robberyGameTitle.textContent = encounter.spot.name;
  if (robberyGameSubtitle) robberyGameSubtitle.textContent = encounter.battleStarted
    ? `${encounter.difficultyInfo.label} harc - ${
      encounter.battleMode === "solo"
          ? "kisebb csapat, kisebb zsakmany"
          : "teljes csapat"
    }${difficultyRewardBonus ? ` · kockazati jutalom +${difficultyRewardBonus}%` : ""}`
    : (readyMembers.length
      ? "Valassz 1 vagy 2 harckepes embert magad melle"
      : (hiredMembers.length ? "Minden embered harckeptelen - elobb gyogyitsd meg oket" : "Nincs felvett bandatagod - elobb fogadj fel valakit"));
  if (robberyHealthText) robberyHealthText.textContent = `${state.health}%`;
  if (robberyHealthFill) robberyHealthFill.style.width = `${state.health}%`;
  if (robberyControlText) robberyControlText.textContent = `${control}%`;
  if (robberyControlFill) robberyControlFill.style.width = `${control}%`;
  if (robberyAlertText) robberyAlertText.textContent = `${Math.round(encounter.alert)}%`;
  if (robberyAlertFill) robberyAlertFill.style.width = `${encounter.alert}%`;
  if (robberyEnemyPower) robberyEnemyPower.textContent = String(enemyPower);
  if (robberyEnemyPowerFill) robberyEnemyPowerFill.style.width = `${clamp(Math.round((enemyPower / Math.max(1, enemyPower + getPlayerPower() * 2)) * 100), 12, 100)}%`;
  if (robberyRound) robberyRound.textContent = `${encounter.round}. kor`;
  if (robberyInstruction) robberyInstruction.textContent = encounter.battleStarted
    ? `Celpont: ${selectedDefender?.name || "valassz ellenseget"}`
    : (readyMembers.length
      ? `Csapattarsak: ${encounter.selectedMemberIds.length}/2 - legalabb 1 ember kotelezo`
      : (hiredMembers.length
        ? "A 0 HP-s embereket elobb meg kell gyogyitani"
        : "Nincs felvett embered: kirablas nem indithato"));
  if (robberyLoot) robberyLoot.textContent = `Jutalom: ${getRobberyProjectedMoney(encounter)} $`;
  if (robberyBattleLog) robberyBattleLog.textContent = encounter.message;

  robberyDefenders?.replaceChildren();
  encounter.defenders.forEach((defender, index) => {
    const healthPercent = clamp(Math.round((defender.health / defender.maxHealth) * 100), 0, 100);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `battle-unit battle-unit--enemy battle-unit--enemy-count-${encounter.defenders.length} battle-unit--enemy-${index + 1}`;
    button.dataset.unitId = defender.id;
    button.classList.toggle("is-selected", encounter.selectedDefenderId === defender.id);
    button.classList.toggle("is-defeated", defender.health <= 0);
    button.classList.toggle("is-attacking", animation.actorId === defender.id && animation.type === "attack");
    button.classList.toggle("is-targeted", animation.targetId === defender.id);
    button.classList.toggle("is-thinking", animation.actorId === defender.id && (animation.type === "thinking" || animation.type === "aim"));
    button.disabled = encounter.ended || encounter.turnLocked || !encounter.battleStarted || defender.health <= 0;
    button.innerHTML = `
      <span class="battle-unit__name">${defender.name}</span>
      <span class="battle-unit__role">${robberyDefenderTemplates[defender.type].role}</span>
      <span class="battle-unit__combat">Szint ${defender.level || 1} · Ero ${defender.attack} · Vedelem ${defender.defense}</span>
      <span class="battle-unit__health"><i style="width:${healthPercent}%"></i></span>
      <em>${healthPercent}%</em>
    `;
    button.addEventListener("click", () => {
      if (!activeRobberyGame || defender.health <= 0) return;
      activeRobberyGame.selectedDefenderId = defender.id;
      activeRobberyGame.message = `${defender.name} kijelolve celpontnak.`;
      refreshRobberyGame();
    });
    robberyDefenders?.appendChild(button);
  });

  robberyAllies?.replaceChildren();
  (encounter.allies || []).forEach((ally, index) => {
    const healthPercent = clamp(Math.round((ally.health / ally.maxHealth) * 100), 0, 100);
    const passiveShort = ally.passiveId === "boss_hunter"
      ? "Fonokvadasz"
      : ally.passiveId === "marksman"
        ? "Mesterlovesz"
        : ally.passiveId === "guardian"
          ? "Testor"
          : "";
    const unit = document.createElement("div");
    unit.className = `battle-unit battle-unit--ally battle-unit--ally-count-${encounter.allies.length} battle-unit--ally-${index + 1}${ally.health <= 0 ? " is-defeated" : ""}${ally.isPlayer ? " is-player" : ""}`;
    unit.dataset.unitId = ally.id;
    unit.classList.toggle("is-attacking", animation.actorId === ally.id && animation.type === "attack");
    unit.classList.toggle("is-targeted", animation.targetId === ally.id);
    unit.classList.toggle("is-thinking", animation.actorId === ally.id && (animation.type === "thinking" || animation.type === "aim"));
    unit.innerHTML = `
      <span class="battle-unit__name">${ally.name}</span>
      <span class="battle-unit__role" title="${ally.passiveLabel || ""}">${ally.role}${passiveShort ? ` · ${passiveShort}` : ""}</span>
      <span class="battle-unit__combat">Szint ${ally.level || 1} · Ero ${ally.attack} · Vedelem ${ally.defense}</span>
      <span class="battle-unit__health"><i style="width:${healthPercent}%"></i></span>
      <em>${healthPercent}%</em>
    `;
    robberyAllies?.appendChild(unit);
  });

  robberyTeamPicker?.classList.toggle("is-hidden", encounter.battleStarted);
  robberyTeamPicker?.replaceChildren();
  hiredMembers.forEach((member) => {
    const memberId = String(member.id);
    const selected = encounter.selectedMemberIds.includes(memberId);
    const incapacitated = Number(member.health) <= 0;
    const locked = encounter.battleStarted || incapacitated || (!selected && encounter.selectedMemberIds.length >= 2);
    const attack = getCrewMemberAttack(member);
    const defense = getCrewMemberDefense(member);
    const passive = getCrewCombatPassive(member.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `robbery-team-choice${selected ? " is-selected" : ""}${incapacitated ? " is-incapacitated" : ""}`;
    button.dataset.memberId = memberId;
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.classList.toggle("is-disabled", locked);
    button.disabled = locked;
    button.innerHTML = `
      <div class="robbery-team-choice__portrait">
        <img src="${getCrewPortraitAsset(member)}" alt="${member.name}">
        <div class="robbery-team-choice__level">${member.level}. szint</div>
        <div class="robbery-team-choice__selected">KIVALASZTVA</div>
      </div>
      <div class="robbery-team-choice__body">
        <div class="robbery-team-choice__header">
          <strong>${member.name}</strong>
          <small>${incapacitated ? "Harckeptelen - gyogyitsd meg" : member.role}</small>
          ${incapacitated ? "" : `<em class="robbery-team-choice__passive">${passive.label}</em>`}
        </div>
        <div class="robbery-team-choice__stats">
          <div class="robbery-team-choice__stat">
            <small>Ero</small>
            <strong>${attack}</strong>
          </div>
          <div class="robbery-team-choice__stat">
            <small>HP</small>
            <strong>${member.health}/${member.baseHealth}</strong>
          </div>
          <div class="robbery-team-choice__stat">
            <small>Vedelem</small>
            <strong>${defense}</strong>
          </div>
        </div>
      </div>
    `;
    button.addEventListener("click", () => {
      if (!activeRobberyGame || activeRobberyGame.battleStarted || incapacitated) return;
      activeRobberyGame.selectedMemberIds = selected
        ? activeRobberyGame.selectedMemberIds.filter((id) => String(id) !== memberId)
        : [...activeRobberyGame.selectedMemberIds, memberId];
      activeRobberyGame.message = activeRobberyGame.selectedMemberIds.length
        ? `${activeRobberyGame.selectedMemberIds.length}/2 csapattars kivalasztva. Egy emberrel kisebb jutalom jar.`
        : "Valassz legalabb egy harckepes bandatagot a kirablashoz.";
      refreshRobberyGame();
      clearRobberyAutoPlay();
    });
    robberyTeamPicker?.appendChild(button);
  });
  if (!readyMembers.length && !encounter.battleStarted) {
    const note = document.createElement("div");
    note.className = "robbery-team-empty";
    note.textContent = hiredMembers.length
      ? "Minden embered 0 HP-n van. Gyogyitsd meg oket a banda panelen a kirablas elott."
      : "Nincs felvett embered. Kirablashoz elobb fogadj fel legalabb egy bandatagot.";
    robberyTeamPicker?.appendChild(note);
  }
  if (robberyTeamPicker) {
    robberyTeamPicker.scrollLeft = teamPickerScrollLeft;
    robberyTeamPicker.scrollTop = teamPickerScrollTop;
  }

  robberyTactics.forEach((button) => button.classList.remove("is-selected"));
  robberyTactics.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.tactic === encounter.selectedTactic);
    button.disabled = encounter.ended || encounter.turnLocked || !encounter.battleStarted;
  });
  if (robberyAuto) {
    robberyAuto.disabled = encounter.ended || encounter.finalizing || (encounter.turnLocked && !encounter.autoPlay);
    robberyAuto.classList.toggle("is-active", Boolean(encounter.autoPlay));
    robberyAuto.textContent = encounter.autoPlay ? "Automata: BE" : "Automata: KI";
  }
  if (robberyAttack) {
    robberyAttack.disabled = encounter.ended || encounter.finalizing || encounter.turnLocked || (!encounter.battleStarted && !canStartRobberySelection(encounter));
    robberyAttack.textContent = !encounter.battleStarted
      ? (encounter.selectedMemberIds.length === 0
        ? "Valassz bandatagot"
        : (encounter.selectedMemberIds.length === 1 ? "Kis csapat inditasa" : "Harc inditasa"))
      : encounter.turnLocked
        ? "Ellenseg lep..."
        : encounter.autoPlay
          ? "Automata harc fut"
          : "Tamadas";
  }
};

function applyServerRobberyState(serverState = {}) {
  const previousOfferedQuests = normalizeOfferedQuestList(state.offeredQuests);
  const scalarKeys = ["money", "fame", "heat", "influence", "health", "energy"];
  scalarKeys.forEach((key) => {
    if (Number.isFinite(Number(serverState[key]))) state[key] = Number(serverState[key]);
  });
  if (Number.isFinite(Number(serverState.influenceSystemVersion))) {
    state.influenceSystemVersion = Number(serverState.influenceSystemVersion);
  }
  if (Number.isFinite(Number(serverState.pvpNextAttackAt))) {
    state.pvpNextAttackAt = Math.max(0, Number(serverState.pvpNextAttackAt));
  }
  ensureInfluenceState();
  if (Array.isArray(serverState.crewMembers)) {
    state.crewMembers = mergeProtectedClientCrewMembers(
      state.crewMembers,
      serverState.crewMembers,
      state.crew,
      serverState.crew,
    );
  }
  if (Array.isArray(serverState.activeQuests)) state.activeQuests = normalizeQuestList(serverState.activeQuests);
  if (Array.isArray(serverState.offeredQuests)) {
    state.offeredQuests = mergeStableOfferedQuestList(previousOfferedQuests, serverState.offeredQuests, state.activeQuests);
  }
  if (Object.prototype.hasOwnProperty.call(serverState, "activeQuest")) {
    state.activeQuest = normalizeQuest(serverState.activeQuest);
    if (getRankLevel(state.fame) < getHarborRequiredLevel() && questRequiresHarbor(state.activeQuest)) state.activeQuest = null;
  }
  if (Array.isArray(serverState.districts)) state.districts = serverState.districts;
  if (serverState.territories && typeof serverState.territories === "object") {
    state.territories = mergeProtectedClientTerritories(state.territories, serverState.territories);
  }
  if (serverState.equipment && typeof serverState.equipment === "object") state.equipment = normalizeEquipment(serverState.equipment);
  if (serverState.itemInventory && typeof serverState.itemInventory === "object") {
    state.itemInventory = normalizeItemInventory(serverState.itemInventory, state.equipment);
  }
  if (Array.isArray(serverState.marketStock)) state.marketStock = normalizeMarketStock(serverState.marketStock);
  if (Number.isFinite(Number(serverState.marketRefreshAt))) state.marketRefreshAt = Number(serverState.marketRefreshAt);
  if (typeof serverState.marketCatalogVersion === "string") state.marketCatalogVersion = serverState.marketCatalogVersion;
  if (Number.isFinite(Number(serverState.crew))) {
    state.crew = Math.max(
      Number(serverState.crew),
      (Array.isArray(state.crewMembers) ? state.crewMembers : []).filter((member) => member.hired).length,
    );
  }
  if (Object.prototype.hasOwnProperty.call(serverState, "activeCrewMemberId")) state.activeCrewMemberId = serverState.activeCrewMemberId;
  if (serverState.mentorFlags && typeof serverState.mentorFlags === "object") state.mentorFlags = serverState.mentorFlags;
  if (serverState.recoveryEffects && typeof serverState.recoveryEffects === "object") {
    state.recoveryEffects = {
      health: normalizeRecoveryEffect(serverState.recoveryEffects.health),
      energy: normalizeRecoveryEffect(serverState.recoveryEffects.energy),
    };
  }
  if (serverState.recoveryUsage && typeof serverState.recoveryUsage === "object") {
    state.recoveryUsage = normalizeRecoveryUsage(serverState.recoveryUsage);
  }
  if (serverState.protectionCooldowns && typeof serverState.protectionCooldowns === "object") {
    state.protectionCooldowns = serverState.protectionCooldowns;
  }
  if (Number.isFinite(Number(serverState.hideUsesToday))) state.hideUsesToday = Number(serverState.hideUsesToday);
  if (Number.isFinite(Number(serverState.hideUsesDay))) state.hideUsesDay = Number(serverState.hideUsesDay);
  if (Number.isFinite(Number(serverState.day))) state.day = Number(serverState.day);
  if (Number.isFinite(Number(serverState.cityLevel))) state.cityLevel = Number(serverState.cityLevel);
  if (Number.isFinite(Number(serverState.lastDayEndedAt))) state.lastDayEndedAt = Number(serverState.lastDayEndedAt);
  if (Number.isFinite(Number(serverState.lastPassiveIncomeAt))) state.lastPassiveIncomeAt = Number(serverState.lastPassiveIncomeAt);
  if (Number.isFinite(Number(serverState.selectedQuestSlot))) state.selectedQuestSlot = Number(serverState.selectedQuestSlot);
  if (Number.isFinite(Number(serverState.questNextSpawnAt))) state.questNextSpawnAt = Number(serverState.questNextSpawnAt);
  if (Array.isArray(serverState.questHistory)) state.questHistory = serverState.questHistory.slice(-40);
  state.offeredQuests = mergeStableOfferedQuestList(
    previousOfferedQuests,
    [state.activeQuest, ...state.offeredQuests],
    state.activeQuests,
  );
  state.activeQuest = state.offeredQuests[0] || null;
  stabilizeOfferedQuestPool();
  if (Number.isFinite(Number(serverState.mentorStep))) state.mentorStep = Number(serverState.mentorStep);
  if (typeof serverState.mentorCompleted === "boolean") state.mentorCompleted = serverState.mentorCompleted;
  if (serverState.smuggledGoods && typeof serverState.smuggledGoods === "object") {
    state.smuggledGoods = normalizeSmuggledGoods(serverState.smuggledGoods);
  }
  if (Number.isFinite(Number(serverState.smugglerFame))) state.smugglerFame = Number(serverState.smugglerFame);
  if (Array.isArray(serverState.harborProcessTasks)) {
    state.harborProcessTasks = normalizeProcessTasks(serverState.harborProcessTasks);
  }
  if (serverState.harborGarage && typeof serverState.harborGarage === "object") {
    state.harborGarage = normalizeHarborGarage(serverState.harborGarage);
  }
  if (serverState.harborBarUsage && typeof serverState.harborBarUsage === "object") {
    state.harborBarUsage = normalizeHarborBarUsage(serverState.harborBarUsage);
  }
  if (serverState.naturalRecoveryAt && typeof serverState.naturalRecoveryAt === "object") {
    state.naturalRecoveryAt = serverState.naturalRecoveryAt;
  }
  if (Object.prototype.hasOwnProperty.call(serverState, "rivalEvent")) {
    state.rivalEvent = normalizeRivalEvent(serverState.rivalEvent, getSynchronizedNow());
  }
  if (Number.isFinite(Number(serverState.rivalNextSpawnAt))) {
    state.rivalNextSpawnAt = Math.max(0, Number(serverState.rivalNextSpawnAt));
  }
  normalizeClientStateAfterServerUpdate(previousOfferedQuests);
  if (state.registered && state.offeredQuests.length < MAX_OFFERED_QUESTS) {
    ensureQuestOfferPool({ silent: true, persist: true, refresh: true });
  }
  recalculateGearPower();
  crewPanelRenderKey = "";
  syncEquipmentSheet();
}

async function requestServerEconomy(command, payload = {}) {
  const response = await fetch(`/api/actions/economy/${command}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "A szerver nem tudta vegrehajtani a muveletet.");
    if (Number.isFinite(Number(data.resetAt))) error.resetAt = Number(data.resetAt);
    if (Number.isFinite(Number(data.cooldownAt))) error.cooldownAt = Number(data.cooldownAt);
    throw error;
  }
  markServerMutation(response, data);
  applyServerRobberyState(data.state || {});
  return data;
}

async function requestServerProgression(command, payload = {}) {
  const response = await fetch(`/api/actions/progression/${command}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "A szerver nem tudta vegrehajtani a muveletet.");
    if (Number.isFinite(Number(data.resetAt))) error.resetAt = Number(data.resetAt);
    if (Number.isFinite(Number(data.cooldownAt))) error.cooldownAt = Number(data.cooldownAt);
    throw error;
  }
  markServerMutation(response, data);
  applyServerRobberyState(data.state || {});
  if (command === "rival") handleServerRivalEvents(data.events);
  return data;
}

function formatWorldChatTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
}

function renderWorldChat(messages = []) {
  if (!hudLog) return;
  const wasNearBottom = hudLog.scrollHeight - hudLog.scrollTop - hudLog.clientHeight < 36;
  const normalized = Array.isArray(messages) ? messages : [];
  hudLog.innerHTML = normalized.length
    ? normalized.map((message) => `
        <div class="hud-chat-line${message.senderProfileName === state.profileName ? " is-own" : ""}">
          <span class="hud-chat-line__time">${escapeHtml(formatWorldChatTime(message.createdAt))}</span>
          <strong>${escapeHtml(message.senderProfileName || "Ismeretlen")}</strong>
          <span class="hud-chat-line__body">${escapeHtml(message.body || "")}</span>
        </div>
      `).join("")
    : `<div class="hud-chat-empty">Még nincs üzenet. Írj elsőként a világnak.</div>`;
  if (wasNearBottom || !hudLog.dataset.chatLoaded) hudLog.scrollTop = hudLog.scrollHeight;
  hudLog.dataset.chatLoaded = "true";
}

async function refreshWorldChat(force = false) {
  if (!state.registered || worldChatRequestInFlight || document.hidden) return false;
  if (!force && !hudLog) return false;
  worldChatRequestInFlight = true;
  try {
    const response = await fetch("/api/world-chat?limit=50", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "A világchat nem érhető el.");
    renderWorldChat(payload.messages);
    if (hudChatStatus) hudChatStatus.textContent = "";
    return true;
  } catch (error) {
    if (hudChatStatus) hudChatStatus.textContent = error.message || "Kapcsolódási hiba";
    return false;
  } finally {
    worldChatRequestInFlight = false;
  }
}

async function sendWorldChatMessage(text) {
  const message = String(text || "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!message || !state.registered) return false;
  const submitButton = hudChatForm?.querySelector("button[type='submit']");
  if (submitButton) submitButton.disabled = true;
  if (hudChatInput) hudChatInput.disabled = true;
  if (hudChatStatus) hudChatStatus.textContent = "Küldés...";
  try {
    const response = await fetch("/api/world-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Az üzenet nem küldhető el.");
    if (hudChatInput) hudChatInput.value = "";
    await refreshWorldChat(true);
    return true;
  } catch (error) {
    if (hudChatStatus) hudChatStatus.textContent = error.message || "Küldési hiba";
    return false;
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (hudChatInput) {
      hudChatInput.disabled = false;
      hudChatInput.focus();
    }
  }
}

function startWorldChatPolling() {
  if (worldChatPollTimer) window.clearInterval(worldChatPollTimer);
  void refreshWorldChat(true);
  worldChatPollTimer = window.setInterval(() => void refreshWorldChat(), 2000);
}

const SETTINGS_ANIMATIONS_KEY = "maffia_settings_animations";

function applyAnimationSetting(enabled) {
  document.documentElement.classList.toggle("reduce-game-motion", !enabled);
  if (settingsAnimations) settingsAnimations.checked = enabled;
  try {
    window.localStorage.setItem(SETTINGS_ANIMATIONS_KEY, enabled ? "1" : "0");
  } catch {
    // A beallitas az aktualis munkamenetben ettol meg ervenyes.
  }
}

function loadInterfaceSettings() {
  let animationsEnabled = true;
  try {
    animationsEnabled = window.localStorage.getItem(SETTINGS_ANIMATIONS_KEY) !== "0";
  } catch {
    // Az alapertelmezett beallitas marad.
  }
  applyAnimationSetting(animationsEnabled);
}

function updateFullscreenSettingLabel() {
  if (settingsFullscreenState) {
    settingsFullscreenState.textContent = document.fullscreenElement ? "Kikapcsolas" : "Bekapcsolas";
  }
}

function openSettingsDialog() {
  if (!settingsDialog) return;
  closeHelpDialog();
  const trigger = document.querySelector('[data-hud-top-action="settings"]');
  const triggerRect = trigger?.getBoundingClientRect();
  if (triggerRect) {
    settingsDialog.style.setProperty("--settings-anchor-right", `${Math.max(8, window.innerWidth - triggerRect.right)}px`);
    settingsDialog.style.setProperty("--settings-anchor-top", `${Math.min(window.innerHeight - 16, triggerRect.bottom + 8)}px`);
  }
  updateFullscreenSettingLabel();
  settingsDialog.classList.remove("hidden");
  settingsDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-settings-open");
}

function closeSettingsDialog() {
  if (!settingsDialog) return;
  if (settingsDialog.contains(document.activeElement)) document.activeElement?.blur();
  settingsDialog.classList.add("hidden");
  settingsDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-settings-open");
}

function openHelpDialog() {
  if (!helpDialog) return;
  closeSettingsDialog();
  closeQuestOverview();
  const trigger = document.querySelector('[data-hud-top-action="help"]');
  const triggerRect = trigger?.getBoundingClientRect();
  if (triggerRect) {
    helpDialog.style.setProperty("--settings-anchor-right", `${Math.max(8, window.innerWidth - triggerRect.right)}px`);
    helpDialog.style.setProperty("--settings-anchor-top", `${Math.min(window.innerHeight - 16, triggerRect.bottom + 8)}px`);
  }
  helpDialog.classList.remove("hidden");
  helpDialog.setAttribute("aria-hidden", "false");
  helpDialog.querySelector(".help-dialog__panel")?.scrollTo({ top: 0 });
}

function closeHelpDialog() {
  if (!helpDialog) return;
  if (helpDialog.contains(document.activeElement)) document.activeElement?.blur();
  helpDialog.classList.add("hidden");
  helpDialog.setAttribute("aria-hidden", "true");
}

async function toggleGameFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    sceneRef?.setMessage("A bongeszo nem engedelyezte a teljes kepernyot.");
  }
  updateFullscreenSettingLabel();
}

async function logoutCurrentProfile() {
  if (settingsLogout) settingsLogout.disabled = true;
  try {
    await saveGame(true);
    await clearActiveProfileSession();
    try {
      window.localStorage.removeItem(LAST_PROFILE_KEY);
    } catch {
      // A szerveres kijelentkezes ettol meg sikeres.
    }
    window.location.reload();
  } catch {
    if (settingsLogout) settingsLogout.disabled = false;
    sceneRef?.setMessage("A kijelentkezes nem sikerult. Probald ujra.");
  }
}

let lastServerProgressionSyncAt = 0;
let serverProgressionSyncInFlight = false;

async function syncServerProgressionIfNeeded(force = false) {
  if (!state.registered || serverProgressionSyncInFlight) return false;
  const now = Date.now();
  const needsRecoverySync = Boolean(state.recoveryEffects?.health || state.recoveryEffects?.energy || state.health < 100 || state.energy < 100);
  if (!force && (!needsRecoverySync || now - lastServerProgressionSyncAt < 5000)) return false;
  serverProgressionSyncInFlight = true;
  lastServerProgressionSyncAt = now;
  try {
    await requestServerProgression("recovery", { operation: "sync" });
    sceneRef?.refreshHUD();
    return true;
  } catch {
    return false;
  } finally {
    serverProgressionSyncInFlight = false;
  }
}

async function requestServerRobbery(path, payload = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "A szerver nem tudta feldolgozni a kirablást.");
    error.serverAction = data.action || null;
    throw error;
  }
  markServerMutation(response, data);
  return data;
}

function mergeServerRobberyAction(action, spot = null) {
  const existing = activeRobberyGame || {};
  const target = action?.target || {};
  const difficultyInfo = action?.difficultyInfo || getDifficultyInfo(action?.difficulty || target.difficulty || 1);
  const defenders = Array.isArray(action.defenders) ? action.defenders : [];
  const selectedDefenderId = defenders.some((defender) => (
    defender.id === existing.selectedDefenderId && Number(defender.health) > 0
  ))
    ? existing.selectedDefenderId
    : (defenders.find((defender) => Number(defender.health) > 0)?.id || null);
  return {
    ...existing,
    serverActionId: action.actionId,
    serverAuthoritative: true,
    spot: spot || existing.spot || {
      id: target.spotId,
      name: target.name,
      mode: target.mode,
      districtIndex: target.districtIndex,
    },
    targetDistrict: state.districts[target.districtIndex] || getSelectedDistrict(),
    mode: target.mode === "shop" ? "shop" : "street",
    difficulty: Number(action.difficulty || target.difficulty) || 1,
    difficultyInfo: {
      ...difficultyInfo,
      color: difficultyInfo.label === "Veszelyes" ? 0xc84f42 : difficultyInfo.label === "Kockazatos" ? 0xd6ad42 : 0x62c878,
    },
    defenders,
    allies: Array.isArray(action.allies) ? action.allies : [],
    selectedMemberIds: Array.isArray(action.selectedMemberIds) ? action.selectedMemberIds.map(String) : [],
    selectedDefenderId,
    battleStarted: Boolean(action.battleStarted),
    battleMode: action.battleMode || "full",
    rewardMultiplier: Number(action.rewardMultiplier) || 1,
    difficultyRewardMultiplier: Number(action.difficultyRewardMultiplier)
      || getRobberyDifficultyRewardMultiplier(difficultyInfo.label),
    difficultyFameMultiplier: Number(action.difficultyFameMultiplier)
      || getRobberyDifficultyFameMultiplier(difficultyInfo.label),
    enemyCount: clamp(Math.round(Number(action.enemyCount) || defenders.length || 2), 2, 3),
    teamPower: Math.max(0, Math.round(Number(action.teamPower) || 0)),
    enemyPower: Math.max(0, Math.round(Number(action.enemyPower) || 0)),
    enemyPowerTarget: Math.max(0, Math.round(
      Number(action.enemyPowerTarget)
      || Number(existing.enemyPowerTarget)
      || Number(action.enemyPower)
      || 0,
    )),
    referenceTeamPower: Math.max(0, Math.round(Number(action.referenceTeamPower) || 0)),
    referenceCombatProfile: action.referenceCombatProfile || existing.referenceCombatProfile || null,
    estimatedWinChance: clamp(Number(action.estimatedWinChance) || 0, 0, 1),
    combatVersion: Math.max(1, Math.round(Number(action.combatVersion) || 1)),
    allyTurnIndex: Number(action.allyTurnIndex) || 0,
    alert: Number(action.alert) || 0,
    loot: Number(action.loot) || 0,
    round: Number(action.round) || 1,
    healthAtStart: Number.isFinite(Number(action.playerHealthAtStart))
      ? clamp(Number(action.playerHealthAtStart), 1, 100)
      : (existing.healthAtStart ?? state.health),
    message: action.message || existing.message || "A szerver elokesziti a rajtautest.",
    result: action.result || null,
    turnLocked: false,
    actionAnimation: null,
    ended: Boolean(action.result),
    autoPlay: Boolean(existing.autoPlay) && !action.result,
  };
}

function showServerRobberyResult(action) {
  const result = action?.result;
  if (!result || !activeRobberyGame) return;
  applyServerRobberyState(action.state || {});
  const success = Boolean(result.success);
  const lootItem = result.lootItem && typeof result.lootItem === "object" ? result.lootItem : null;
  const lootText = lootItem?.name
    ? ` · Targy: ${lootItem.name} (${getEquipmentRarityLabel(lootItem.rarity)})`
    : "";
  const lootSentence = lootItem?.name
    ? ` Targy: ${lootItem.name} (${getEquipmentRarityLabel(lootItem.rarity)}).`
    : "";
  const healthText = success
    ? `Eletero: valtozatlan (${result.healthAfter ?? state.health}/100)`
    : `Eletero: -${result.healthLoss || 0}% (${result.healthAfter ?? state.health}/100)`;
  const crewRetreatText = !success && Number(result.retreatCrewHealthLoss) > 0
    ? ` · Bandatag sérülés: -${result.retreatCrewHealthLoss} HP (${result.retreatInjuredCrew || 0} ember)`
    : "";
  const text = success
    ? `Zsakmany: +${result.moneyGain || 0} $ · Hirnev: +${result.fameGain || 0} · Befolyas: +${result.influenceGain || 0}%${lootText} · ${healthText} · Korozes: +${result.heatGain || 0}%`
    : `${result.reason || "A rajtautes kudarcba fulladt."} ${healthText}${crewRetreatText} · Befolyas: -${result.influenceLoss || 0}% · Korozes: +${result.heatGain || 0}%`;
  if (success) {
    completeMentorStep("robbery");
    queueRewardModal({
      title: "Akcio vege",
      text: `${activeRobberyGame.spot?.name || "Kirablas"} · Eletero valtozatlan${lootText}`,
      money: result.moneyGain || 0,
      xp: result.fameGain || 0,
      fame: result.fameGain || 0,
    });
  }
  sceneRef?.pushLog(success
    ? `${activeRobberyGame.spot?.name || "A celpont"} kirabolva. +${result.influenceGain || 0}% befolyas, az eleterod valtozatlan.${lootSentence}`
    : `${result.reason || "A kirablas kudarcba fulladt."} Eletero: -${result.healthLoss || 0}%${crewRetreatText ? `, bandatag serules: -${result.retreatCrewHealthLoss || 0} HP` : ""}, befolyas: -${result.influenceLoss || 0}%.`);
  sceneRef?.setMessage(result.reason || (success ? "A kirablas sikerult." : "A kirablas nem sikerult."));
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  if (success) {
    closeRobberyGame();
    return;
  }
  showRobberyResult(false, "A rajtautes kudarcba fulladt", text);
}

startRobberyMinigame = async function startThreeVsThreeBattle(spot) {
  if (!state.registered || !spot || !robberyGame) return;
  if (!canStartCombat("A rajtautest")) return;
  const readyCrewMembers = getHiredCrewMembers().filter((member) => Number(member.health) > 0);
  if (!readyCrewMembers.length) {
    const hiredCrewMembers = getHiredCrewMembers();
    sceneRef?.setMessage(hiredCrewMembers.length
      ? "Minden bandatagod harckeptelen. Gyogyitsd meg legalabb az egyikuket a kirablas elott."
      : "Kirablashoz elobb fel kell fogadnod legalabb egy bandatagot.");
    return;
  }
  const energyCost = spot.mode === "shop" ? 18 : 12;
  if (state.energy < energyCost) {
    sceneRef?.setMessage(`Nincs eleg akciopont. Szükséges: ${energyCost}.`);
    return;
  }
  sceneRef?.setMessage("A szerver ellenorzi a celpontot es a csapatodat...");
  try {
    const response = await requestServerRobbery("/api/actions/robbery/start", {
      spotId: spot.id,
      name: spot.name,
      mode: spot.mode,
      districtIndex: spot.districtIndex,
    });
    applyServerRobberyState(response.state);
    activeRobberyGame = mergeServerRobberyAction(response.action, spot);
  } catch (error) {
    sceneRef?.setMessage(error.message || "A kirablas most nem indithato.");
    sceneRef?.refreshHUD();
    return;
  }
  clearRobberyAutoPlay();
  hideChoiceWheel();
  document.body.classList.add("is-robbery-open");
  robberyResult?.classList.add("hidden");
  robberyResult?.classList.remove("is-failure");
  robberyGame.classList.remove("hidden");
  robberyGame.setAttribute("aria-hidden", "false");
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(activeRobberyGame.difficultyInfo.color));
  refreshRobberyGame();
  sceneRef?.refreshHUD();
};

playRobberyTurn = async function playThreeVsThreeTurn() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  if (encounter.turnLocked) return;
  encounter.turnLocked = true;
  encounter.message = encounter.battleStarted ? "A szerver szamolja a harci kort..." : "A szerver ellenorzi a kivalasztott csapatot...";
  refreshRobberyGame();
  try {
    const operation = encounter.battleStarted ? "turn" : "engage";
    const payload = encounter.battleStarted
      ? {
        expectedRound: encounter.round,
        tactic: encounter.selectedTactic || "stealth",
        targetId: encounter.selectedDefenderId,
      }
      : { selectedMemberIds: encounter.selectedMemberIds };
    const response = await requestServerRobbery(
      `/api/actions/robbery/${encodeURIComponent(encounter.serverActionId)}/${operation}`,
      payload,
    );
    applyServerRobberyState(response.state);
    activeRobberyGame = mergeServerRobberyAction(response.action, encounter.spot);
    refreshRobberyGame();
    sceneRef?.refreshHUD();
    if (response.action.result) {
      showServerRobberyResult(response.action);
      return;
    }
    if (activeRobberyGame.autoPlay) queueRobberyAutoPlay(activeRobberyGame, ROBBERY_AUTO_DELAY.turn);
  } catch (error) {
    if (activeRobberyGame) {
      activeRobberyGame.turnLocked = false;
      activeRobberyGame.message = error.message || "A harci kor nem dolgozhato fel.";
      if (error.serverAction) activeRobberyGame = mergeServerRobberyAction(error.serverAction, encounter.spot);
      refreshRobberyGame();
    }
    sceneRef?.setMessage(error.message || "A harci kor nem dolgozhato fel.");
  }
};

retreatFromRobbery = async function retreatFromServerRobbery() {
  const encounter = activeRobberyGame;
  if (!encounter) return;
  if (encounter.ended) {
    closeRobberyGame();
    return;
  }
  encounter.autoPlay = false;
  encounter.turnLocked = true;
  clearRobberyAutoPlay();
  encounter.message = "A szerver lezárja a visszavonulast...";
  refreshRobberyGame();
  try {
    const response = await requestServerRobbery(
      `/api/actions/robbery/${encodeURIComponent(encounter.serverActionId)}/retreat`,
      {},
    );
    applyServerRobberyState(response.state);
    activeRobberyGame = mergeServerRobberyAction(response.action, encounter.spot);
    showServerRobberyResult(response.action);
  } catch (error) {
    encounter.turnLocked = false;
    encounter.message = error.message || "A visszavonulas nem sikerult.";
    sceneRef?.setMessage(encounter.message);
    refreshRobberyGame();
  }
};

function bindHudActions() {
  const map = [
    [hudAction1, handleStreetRobbery],
    [hudAction2, handleShopRaid],
    [hudAction3, handleRecruit],
    [hudAction4, handleExpand],
    [hudAction5, handleUpgradeCity],
    [hudAction6, handleLayLow],
  ];

  avatarSelection?.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-avatar-id]");
    if (!choice) return;
    selectPlayerAvatar(choice.dataset.avatarId);
  });

  map.forEach(([button, action]) => {
    button?.addEventListener("click", async () => {
      if (!state.registered) return;
      await action();
      if (state.heat >= 100) triggerBust();
      saveGame();
      sceneRef?.refreshHUD();
      sceneRef?.refreshMap();
    });
  });

  hudReset?.addEventListener("click", () => {
    resetGame();
  });

  hudAvatarCard?.addEventListener("click", showCharacterPanel);
  hudAvatarCard?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showCharacterPanel();
    }
  });

  hudQuickRank?.addEventListener("click", () => openAuxPanel("rank"));
  hudQuickMarket?.addEventListener("click", () => openAuxPanel("market"));
  hudQuickClan?.addEventListener("click", () => openAuxPanel("clan"));
  hudQuickWorld?.addEventListener("click", () => openAuxPanel("world"));
  hudQuickMessages?.addEventListener("click", () => openAuxPanel("messages"));
  hudQuickDock?.addEventListener("click", () => openAuxPanel("harbor"));
  hudMainMapButton?.addEventListener("click", hideHarborMapView);
  window.addEventListener("resize", scheduleResponsiveMapLayout, { passive: true });
  window.addEventListener("orientationchange", scheduleResponsiveMapLayout, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleResponsiveMapLayout, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleResponsiveMapLayout, { passive: true });
  hudProcessTasks?.addEventListener("click", (event) => {
    const rivalButton = event.target.closest("[data-rival-process-spot]");
    if (rivalButton) {
      event.preventDefault();
      event.stopPropagation();
      const spot = getSpotById(rivalButton.dataset.rivalProcessSpot || "");
      if (spot) renderRivalActionPanel(spot);
      return;
    }
    const button = event.target.closest("[data-process-index]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    cancelProcessTask(button.dataset.processKind || "harbor", button.dataset.processIndex);
  });
  harborMapZones?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-harbor-zone]");
    if (!button) {
      if (garageMiniGameState) return;
      hideHarborOperationPanel();
      return;
    }
    if (garageMiniGameState) return;
    const zone = harborZoneDefs.find((entry) => entry.id === button.dataset.harborZone);
    if (zone) renderHarborZonePanel(zone);
  });
  harborMapView?.addEventListener("click", (event) => {
    if (garageMiniGameState) return;
    if (event.target.closest?.(".harbor-operation-panel, [data-harbor-zone]")) return;
    hideHarborOperationPanel();
  });
  harborOperationPanel?.addEventListener("click", handleHarborPanelClick);

  auxPanelClose?.addEventListener("click", hideAuxPanel);
  auxPanelBackdrop?.addEventListener("click", hideAuxPanel);
  messagesDialogClose?.addEventListener("click", hideMessagesDialog);
  messagesDialogBackdrop?.addEventListener("click", hideMessagesDialog);
  publicProfileDialogClose?.addEventListener("click", hidePublicProfileDialog);
  publicProfileDialogBackdrop?.addEventListener("click", hidePublicProfileDialog);
  publicProfileDialogBody?.addEventListener("click", (event) => {
    const focusButton = event.target.closest("[data-rival-structure-focus]");
    if (focusButton && activeWorldRivalCityProfileId) {
      renderWorldRivalCityProfile(activeWorldRivalCityProfileId, focusButton.dataset.rivalStructureFocus || "");
      return;
    }
    const attackButton = event.target.closest("[data-rival-structure-attack]");
    if (attackButton && activeWorldRivalCityProfileId) {
      runWorldRivalStructureAttack(activeWorldRivalCityProfileId, attackButton.dataset.rivalStructureAttack || "");
      return;
    }
    const repairButton = event.target.closest("[data-rival-structure-repair]");
    if (repairButton && activeWorldRivalCityProfileId) {
      repairWorldRivalStructure(
        activeWorldRivalCityProfileId,
        repairButton.dataset.rivalStructureRepair || "",
        repairButton.dataset.rivalRepairSpecialization || "defense",
      );
      return;
    }
    const captureButton = event.target.closest("[data-rival-city-capture]");
    if (captureButton) {
      runWorldRivalCapture(captureButton.dataset.rivalCityCapture || "");
      return;
    }
    const tributeButton = event.target.closest("[data-rival-city-tribute]");
    if (tributeButton) {
      runWorldRivalTribute(tributeButton.dataset.rivalCityTribute || "");
      return;
    }
    const cityAttackButton = event.target.closest("[data-rival-city-attack]");
    if (cityAttackButton) {
      runWorldRivalAttack(cityAttackButton.dataset.rivalCityAttack || "");
      return;
    }
  });
  policeRaidClose?.addEventListener("click", hidePoliceRaidPanel);
  policeRaidBackdrop?.addEventListener("click", hidePoliceRaidPanel);
  rewardModalClose?.addEventListener("click", hideRewardModal);
  rewardModalBackdrop?.addEventListener("click", hideRewardModal);
  auxPanelBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rival-action][data-rival-spot]");
    if (!button) return;
    const spot = getSpotById(button.dataset.rivalSpot);
    if (!spot) return;
    const action = button.dataset.rivalAction;
    if (action === "scout") {
      handleRivalScout(spot);
    } else if (action === "intimidate") {
      handleRivalIntimidate(spot);
    } else if (action === "attack") {
      startRivalTimedAction(spot, "attack");
    } else if (action === "retreat") {
      handleRivalRetreat(spot);
    }
  });

  hudQuestTab1?.addEventListener("click", () => {
    const quest = getQuestSlot(0);
    state.selectedQuestSlot = 0;
    if (quest) {
      showQuestCard(quest);
    } else {
      sceneRef?.setMessage("Az I. sávban nincs felvett küldetés.");
    }
  });
  hudQuestTab2?.addEventListener("click", () => {
    const quest = getQuestSlot(1);
    state.selectedQuestSlot = 1;
    if (quest) {
      showQuestCard(quest);
    } else {
      sceneRef?.setMessage("A II. sávban nincs felvett küldetés.");
    }
  });
  hudQuestAction?.addEventListener("click", handleQuestCardAction);
  hudQuestDelete?.addEventListener("click", () => {
    const quest = state.activeQuest?.id === questCardQuestId
      ? state.activeQuest
      : (normalizeQuestList(state.activeQuests).find((entry) => entry.id === questCardQuestId) || null);
    deleteQuest(quest);
  });
  hudQuestClose?.addEventListener("click", hideQuestCard);
  hudMentorToggle?.addEventListener("click", () => {
    mentorCardOpen = true;
    state.mentorDismissedStep = "";
    if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
    saveGame();
    updateMentorPanel();
  });
  hudMentorInfo?.addEventListener("click", (event) => {
    event.stopPropagation();
    mentorDetailsOpen = !mentorDetailsOpen;
    updateMentorPanel();
  });
  hudMentorClose?.addEventListener("click", (event) => {
    event.stopPropagation();
    hideMentorPanel(true);
  });
  characterPanelClose?.addEventListener("click", hideCharacterPanel);
  characterPanelBackdrop?.addEventListener("click", hideCharacterPanel);
  equipmentPickerClose?.addEventListener("click", hideEquipmentPicker);
  itemCraftToggle?.addEventListener("click", () => toggleItemCraftPanel());
  itemCraftClose?.addEventListener("click", () => toggleItemCraftPanel(false));
  itemCraftButton?.addEventListener("click", craftSelectedEquipment);
  characterPanel?.addEventListener("click", (event) => {
    const craftTile = event.target.closest("[data-craft-item]");
    if (craftTile) {
      toggleCraftItemSelection(craftTile.dataset.craftItem);
      return;
    }
    const pickerButton = event.target.closest("[data-equip-slot][data-item-id]");
    if (pickerButton) {
      equipInventoryItem(pickerButton.dataset.equipSlot, pickerButton.dataset.itemId);
      return;
    }
    const slot = event.target.closest(".character-equipment__slot[data-slot]");
    if (slot) {
      const slotId = slot.dataset.slot;
      if (activeEquipmentSlot === slotId) hideEquipmentPicker();
      else showEquipmentPicker(slotId, slot);
      return;
    }
    if (!event.target.closest(".equipment-picker, .item-craft-panel")) hideEquipmentPicker();
  });
  characterPanel?.addEventListener("keydown", (event) => {
    const slot = event.target.closest(".character-equipment__slot[data-slot]");
    if (!slot) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const slotId = slot.dataset.slot;
      if (activeEquipmentSlot === slotId) hideEquipmentPicker();
      else showEquipmentPicker(slotId, slot);
    }
  });
  crewCards?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-crew-action]");
    const card = event.target.closest("[data-member-id]");
    if (!card) return;
    const memberId = card.dataset.memberId;
    if (!button) {
      const member = getCrewMemberById(memberId);
      if (member?.hired) {
        showCrewMemberPanel(memberId);
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled || button.dataset.busy === "true") return;
    button.dataset.busy = "true";
    button.disabled = true;
    try {
      if (button.dataset.crewAction === "hire") {
        await hireCrewMember(memberId);
      } else if (button.dataset.crewAction === "upgrade") {
        await upgradeCrewMember(memberId);
      } else if (button.dataset.crewAction === "heal") {
        await healCrewMember(memberId);
      } else if (button.dataset.crewAction === "defense") {
        await upgradeCrewMemberDefense(memberId);
      }
    } finally {
      if (button.isConnected) {
        button.dataset.busy = "false";
        button.disabled = false;
      }
    }
  });
  crewMemberPanelClose?.addEventListener("click", hideCrewMemberPanel);
  crewMemberPanelBackdrop?.addEventListener("click", hideCrewMemberPanel);
  crewMemberEquipmentGrid?.addEventListener("click", (event) => {
    const slot = event.target.closest("[data-crew-slot]");
    if (!slot) return;
    const slotId = slot.dataset.crewSlot;
    if (activeCrewEquipmentSlot === slotId) hideCrewEquipmentPicker();
    else showCrewEquipmentPicker(slotId, slot);
  });
  crewEquipmentPickerClose?.addEventListener("click", hideCrewEquipmentPicker);
  crewEquipmentPickerList?.addEventListener("click", (event) => {
    const itemButton = event.target.closest("[data-crew-equip-slot][data-item-id]");
    if (!itemButton || itemButton.disabled) return;
    equipCrewInventoryItem(activeCrewSheetMemberId, itemButton.dataset.crewEquipSlot, itemButton.dataset.itemId);
  });

  choiceWheelBackdrop?.addEventListener("click", () => {
    hideChoiceWheel();
  });
  [mapBackgroundLayer, mapSvgOverlay, lotHouseLayer, document.querySelector("#gameRoot canvas")]
    .filter(Boolean)
    .forEach((layer) => {
      layer.addEventListener("click", () => {
        hideQuestCard();
        hideMentorPanel(true);
      });
    });

  choiceWheelAction1?.addEventListener("click", () => runChoiceAction("robbery"));
  choiceWheelAction2?.addEventListener("click", () => runChoiceAction("protection"));
  choiceWheelAction3?.addEventListener("click", () => runChoiceAction(choiceWheelAction3.dataset.choiceAction || "baseRest"));
  choiceWheelAction4?.addEventListener("click", () => runChoiceAction("close"));
  choiceWheelAction5?.addEventListener("click", () => runChoiceAction(choiceWheelAction5.dataset.choiceAction || "quest"));
  lotInfoClose?.addEventListener("click", hideLotInfoModal);
  lotInfoBackdrop?.addEventListener("click", hideLotInfoModal);
  underpassClose?.addEventListener("click", hideUnderpassModal);
  underpassBackdrop?.addEventListener("click", hideUnderpassModal);

  robberyTactics.forEach((button) => {
    button.addEventListener("click", () => {
      if (!activeRobberyGame || activeRobberyGame.ended) return;
      activeRobberyGame.selectedTactic = button.dataset.tactic || "stealth";
      activeRobberyGame.message = `${robberyTacticDefs[activeRobberyGame.selectedTactic].name} kiválasztva.`;
      refreshRobberyGame();
      if (activeRobberyGame.autoPlay && activeRobberyGame.battleStarted && !activeRobberyGame.turnLocked) {
        queueRobberyAutoPlay(activeRobberyGame, ROBBERY_AUTO_DELAY.inputChange);
      }
    });
  });
  robberyAuto?.addEventListener("click", () => {
    if (!activeRobberyGame || activeRobberyGame.ended) return;
    activeRobberyGame.autoPlay = !activeRobberyGame.autoPlay;
    activeRobberyGame.message = activeRobberyGame.autoPlay
      ? "Automata harc bekapcsolva."
      : "Automata harc kikapcsolva.";
    refreshRobberyGame();
    if (activeRobberyGame.autoPlay) {
      queueRobberyAutoPlay(
        activeRobberyGame,
        activeRobberyGame.battleStarted ? ROBBERY_AUTO_DELAY.inputChange : ROBBERY_AUTO_DELAY.selection,
      );
    } else {
      clearRobberyAutoPlay();
    }
  });
  robberyAttack?.addEventListener("click", playRobberyTurn);
  robberyGameRetreat?.addEventListener("click", retreatFromRobbery);
  robberyResultContinue?.addEventListener("click", closeRobberyGame);

  document.querySelectorAll("[data-hud-top-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.hudTopAction;
      if (action === "messages") openAuxPanel("messages");
      else if (action === "rank") openAuxPanel("rank");
      else if (action === "quests") openQuestOverview();
      else if (action === "settings") openSettingsDialog();
      else if (action === "help") openHelpDialog();
    });
  });
  let influenceInfoHoverCloseTimer = null;
  const clearInfluenceInfoHoverClose = () => {
    if (influenceInfoHoverCloseTimer) {
      window.clearTimeout(influenceInfoHoverCloseTimer);
      influenceInfoHoverCloseTimer = null;
    }
  };
  const openInfluenceInfoFromHover = () => {
    clearInfluenceInfoHoverClose();
    setInfluenceInfoOpen(true);
  };
  const queueInfluenceInfoHoverClose = () => {
    clearInfluenceInfoHoverClose();
    influenceInfoHoverCloseTimer = window.setTimeout(() => {
      influenceInfoHoverCloseTimer = null;
      const hovered = Boolean(
        hudInfluencePill?.matches(":hover")
        || hudInfluenceInfo?.matches(":hover"),
      );
      const focused = Boolean(
        hudInfluencePill?.contains(document.activeElement)
        || hudInfluenceInfo?.contains(document.activeElement),
      );
      if (!hovered && !focused) setInfluenceInfoOpen(false);
    }, 170);
  };
  hudInfluencePill?.addEventListener("pointerenter", openInfluenceInfoFromHover);
  hudInfluencePill?.addEventListener("pointerleave", queueInfluenceInfoHoverClose);
  hudInfluencePill?.addEventListener("focus", openInfluenceInfoFromHover);
  hudInfluencePill?.addEventListener("blur", queueInfluenceInfoHoverClose);
  hudInfluenceInfo?.addEventListener("pointerenter", clearInfluenceInfoHoverClose);
  hudInfluenceInfo?.addEventListener("pointerleave", queueInfluenceInfoHoverClose);
  hudInfluencePill?.addEventListener("click", (event) => {
    event.stopPropagation();
    setInfluenceInfoOpen(hudInfluencePill.getAttribute("aria-expanded") !== "true");
  });

  hudChatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = String(hudChatInput?.value || "").trim();
    if (!text) return;
    await sendWorldChatMessage(text);
  });
  settingsBackdrop?.addEventListener("click", closeSettingsDialog);
  questOverviewClose?.addEventListener("click", closeQuestOverview);
  settingsClose?.addEventListener("click", closeSettingsDialog);
  helpClose?.addEventListener("click", closeHelpDialog);
  const setMobileCrewOpen = (open) => {
    document.body.classList.toggle("is-mobile-crew-open", open);
    hudCrewToggle?.setAttribute("aria-expanded", String(open));
    if (open) {
      crewPanelRenderKey = "";
      renderCrewPanel();
      window.requestAnimationFrame(() => hudCrewClose?.focus());
    } else {
      if (crewPanel?.contains(document.activeElement)) document.activeElement?.blur();
    }
  };
  hudCrewToggle?.addEventListener("click", () => {
    setMobileCrewOpen(!document.body.classList.contains("is-mobile-crew-open"));
  });
  hudCrewClose?.addEventListener("click", () => setMobileCrewOpen(false));
  settingsAnimations?.addEventListener("change", () => applyAnimationSetting(settingsAnimations.checked));
  settingsFullscreen?.addEventListener("click", toggleGameFullscreen);
  settingsLogout?.addEventListener("click", logoutCurrentProfile);
  document.addEventListener("fullscreenchange", updateFullscreenSettingLabel);
  document.addEventListener("pointerdown", (event) => {
    if (!settingsDialog || settingsDialog.classList.contains("hidden")) return;
    const panel = settingsDialog.querySelector(".settings-dialog__panel");
    const trigger = event.target.closest?.('[data-hud-top-action="settings"]');
    if (!trigger && panel && !panel.contains(event.target)) closeSettingsDialog();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!questOverview || questOverview.classList.contains("hidden")) return;
    const panel = questOverview.querySelector(".quest-overview__panel");
    const trigger = event.target.closest?.('[data-hud-top-action="quests"]');
    if (!trigger && panel && !panel.contains(event.target)) closeQuestOverview();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!helpDialog || helpDialog.classList.contains("hidden")) return;
    const panel = helpDialog.querySelector(".help-dialog__panel");
    const trigger = event.target.closest?.('[data-hud-top-action="help"]');
    if (!trigger && panel && !panel.contains(event.target)) closeHelpDialog();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!hudInfluenceInfo || hudInfluenceInfo.classList.contains("hidden")) return;
    if (!hudInfluenceInfo.contains(event.target) && !hudInfluencePill?.contains(event.target)) {
      setInfluenceInfoOpen(false);
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setInfluenceInfoOpen(false);
    closeHelpDialog();
    closeQuestOverview();
    closeSettingsDialog();
    if (document.body.classList.contains("is-mobile-crew-open")) {
      document.body.classList.remove("is-mobile-crew-open");
      hudCrewToggle?.setAttribute("aria-expanded", "false");
    }
    hideLotInfoModal();
    hideAuxPanel();
    hideMessagesDialog();
    hidePublicProfileDialog();
    if (activeRobberyGame) {
      retreatFromRobbery();
      return;
    }
    hideCharacterPanel();
    hideCrewMemberPanel();
    hideChoiceWheel();
  }
});

window.addEventListener("pointerdown", startMapDrag, true);
window.addEventListener("pointermove", updateMapDrag, true);
window.addEventListener("pointerup", endMapDrag, true);
window.addEventListener("pointercancel", endMapDrag, true);
window.addEventListener("click", suppressClickAfterMapDrag, true);
document.documentElement.dataset.gameReady = "true";
loadInterfaceSettings();
startWorldChatPolling();
startServerStateSync();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    void refreshWorldChat(true);
    void syncCurrentServerState(true);
  }
});
window.addEventListener("online", () => void syncCurrentServerState(true));

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const login = playerNameInput.value.trim();
  const password = loginPasswordInput?.value || "";
  const loginStatus = document.getElementById("loginStatus");
  if (!login) {
    if (loginStatus) loginStatus.textContent = "Írd be a felhasználónevedet vagy az e-mail címedet.";
    playerNameInput.focus();
    return;
  }
  if (!password) {
    if (loginStatus) loginStatus.textContent = "Írd be a jelszavadat.";
    loginPasswordInput?.focus();
    return;
  }

  registerForm.querySelector('button[type="submit"]')?.setAttribute("disabled", "disabled");
  try {
    await ensureCityEngine();
    const session = await loginAccount(login, password);
    const name = session.profileName;
    if (rememberLoginInput?.checked) rememberLastProfileName(name);
    else rememberLastProfileName("");
    const saved = await loadGame(name);
    if (saved && state.profileName === name) {
      overlay.classList.add("hidden");
      if (state.needsAvatarSelection) {
        setHudVisible(false);
        sceneRef?.refreshScene();
        showAvatarSelection();
        return;
      }
      hideAvatarSelection();
      setHudVisible(true);
      void refreshMessageBadge();
      sceneRef?.refreshScene();
      if (state.needsWorldBaseSelection) {
        void openAuxPanel("world");
      }
      return;
    }
    startNewGame(name);
  } catch (error) {
    if (loginStatus) loginStatus.textContent = `Betoltesi hiba: ${error?.message || "ismeretlen hiba"}`;
    console.error("A jatek betoltese sikertelen.", error);
    sceneRef?.setMessage("A szerver most nem elérhető. Próbáld meg újra.");
  }
  registerForm.querySelector('button[type="submit"]')?.removeAttribute("disabled");
});

playerNameInput.value = getRememberedProfileName();

window.maffiaFacebookSessionPromise?.then(async (session) => {
  if (!session?.profileName) return;
  const loginStatus = document.getElementById("loginStatus");
  try {
    if (loginStatus) loginStatus.textContent = "Facebook-belepes sikerult. A jatek betoltese folyamatban...";
    await ensureCityEngine();
    const saved = session.exists ? await loadGame(session.profileName) : false;
    if (!saved) {
      startNewGame(session.profileName);
      return;
    }
    overlay.classList.add("hidden");
    if (state.needsAvatarSelection) {
      setHudVisible(false);
      sceneRef?.refreshScene();
      showAvatarSelection();
      return;
    }
    hideAvatarSelection();
    setHudVisible(true);
    void refreshMessageBadge();
    sceneRef?.refreshScene();
    if (state.needsWorldBaseSelection) void openAuxPanel("world");
  } catch (error) {
    if (loginStatus) loginStatus.textContent = error?.message || "A Facebook-profil betoltese nem sikerult.";
  }
});

document.querySelectorAll("[data-password-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordTarget || "");
    if (!input) return;
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    const label = reveal ? "Jelszó elrejtése" : "Jelszó megjelenítése";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(reveal));
    button.textContent = reveal ? "🙈" : "👁";
    button.classList.toggle("is-active", reveal);
  });
});

previewRegistrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("registrationStatus");
  const name = registrationNameInput?.value.trim() || "";
  const email = registrationEmailInput?.value.trim() || "";
  const password = registrationPasswordInput?.value || "";
  if (!/^[\p{L}\p{N}_-]{3,18}$/u.test(name)) {
    if (status) status.textContent = "A felhasználónév 3–18 karakter legyen; betűt, számot, _ vagy - jelet használhatsz.";
    registrationNameInput?.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (status) status.textContent = "Adj meg egy érvényes e-mail címet.";
    registrationEmailInput?.focus();
    return;
  }
  if (password.length < 8 || password.length > 128) {
    if (status) status.textContent = "A jelszó legalább 8 karakter hosszú legyen.";
    registrationPasswordInput?.focus();
    return;
  }
  if (!/[A-Za-z\p{L}]/u.test(password) || !/\d/.test(password)) {
    if (status) status.textContent = "A jelszóban legyen legalább egy betű és egy szám.";
    registrationPasswordInput?.focus();
    return;
  }
  if (password !== (registrationPasswordAgainInput?.value || "")) {
    if (status) status.textContent = "A két jelszó nem egyezik.";
    registrationPasswordAgainInput?.focus();
    return;
  }
  const submit = previewRegistrationForm.querySelector('button[type="submit"]');
  submit?.setAttribute("disabled", "disabled");
  if (status) status.textContent = "A fiók létrehozása folyamatban…";
  try {
    await ensureCityEngine();
    const session = await registerAccount(name, email, password);
    const saved = session.exists ? await loadGame(session.profileName) : false;
    if (!saved) startNewGame(session.profileName);
    rememberLastProfileName(session.profileName);
    if (status) status.textContent = "A regisztráció sikerült.";
  } catch (error) {
    if (status) status.textContent = error?.message || "A regisztráció nem sikerült.";
    submit?.removeAttribute("disabled");
  }
});

document.getElementById("forgotPasswordButton")?.addEventListener("click", () => {
  const status = document.getElementById("loginStatus");
  if (status) status.textContent = "A jelszó-visszaállítás még készül. Egyelőre kérd az üzemeltető segítségét.";
  playerNameInput.focus();
});

bindHudActions();
setHudVisible(false);
void loadGameConfigFromDatabase();

window.addEventListener("beforeunload", () => {
  const snapshot = state.registered ? createSaveSnapshot() : null;
  if (!snapshot?.profileName) return;
  try {
    navigator.sendBeacon(
      SAVE_API_BASE,
      new Blob([JSON.stringify({ state: snapshot })], { type: "application/json" }),
    );
  } catch {
    saveGame(true);
  }
});

function addDevRefillButton() {
  const isLocalGame = ["127.0.0.1", "localhost", "::1"].includes(window.location.hostname);
  if (!isLocalGame || devRefillButton) return;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "DEV: Élet + Energia";
  button.setAttribute("aria-label", "Életerő, energia és a teljes banda feltöltése");
  button.className = "hidden";
  button.style.position = "fixed";
  button.style.right = "20px";
  button.style.bottom = "20px";
  button.style.zIndex = "99999";
  button.style.padding = "12px";
  button.style.border = "1px solid #ffb2a8";
  button.style.background = "#d71919";
  button.style.color = "white";
  button.style.fontWeight = "700";
  button.style.cursor = "pointer";

  button.addEventListener("click", async () => {
    if (!state.registered) return;
    if (activeRobberyGame && !activeRobberyGame.ended) {
      sceneRef?.setMessage("A teljes feltöltést a folyamatban lévő harc lezárása után használd.");
      return;
    }
    button.disabled = true;
    try {
      const response = await fetch("/api/dev/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "A szerver nem tudta feltolteni a bandat.");
      markServerMutation(response, data);
      applyServerRobberyState(data.state || {});
      crewPanelRenderKey = "";
      sceneRef?.refreshHUD();
      sceneRef?.refreshMap();
      renderCrewPanel();
      if (activeCrewSheetMemberId) refreshCrewMemberPanel();
      sceneRef?.setMessage("DEV: az életerő, az energia és a teljes banda tartósan feltöltve.");
    } catch (error) {
      sceneRef?.setMessage(error.message || "A DEV feltoltes nem sikerult.");
    } finally {
      button.disabled = false;
    }
  });

  document.body.appendChild(button);
  devRefillButton = button;
  setHudVisible(Boolean(state.registered && !state.needsAvatarSelection));
}

addDevRefillButton();
