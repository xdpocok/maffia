const STORAGE_KEY = "maffia.birodalom.save.phaser.v3";
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

const rankTable = [
  { fame: 0, name: "Kezdo gengszter" },
  { fame: 20, name: "Utcai fonok" },
  { fame: 50, name: "Keruletvezeto" },
  { fame: 90, name: "Befolyasos figura" },
  { fame: 150, name: "Maffia kozepvezeto" },
  { fame: 240, name: "Maffia fonok" },
];

const houseSpotDefs = [
  { id: "dome", districtIndex: 0, name: "Kozponti haz", mode: "street", x: 0.36, y: 0.28, w: 0.12, h: 0.12 },
  { id: "brick-mid", districtIndex: 0, name: "Belvarosi bérhaz", mode: "street", x: 0.24, y: 0.20, w: 0.10, h: 0.11 },
  { id: "glass-tower", districtIndex: 4, name: "Üvegtorony", mode: "shop", x: 0.83, y: 0.17, w: 0.12, h: 0.22 },
  { id: "red-roof", districtIndex: 1, name: "Piacteri haz", mode: "shop", x: 0.54, y: 0.34, w: 0.11, h: 0.12 },
  { id: "brown-block", districtIndex: 3, name: "Ipari haz", mode: "street", x: 0.16, y: 0.61, w: 0.14, h: 0.17 },
  { id: "glass-low", districtIndex: 4, name: "Elegans villa", mode: "shop", x: 0.49, y: 0.57, w: 0.14, h: 0.13 },
  { id: "white-villa", districtIndex: 5, name: "Peremkeruleti haz", mode: "street", x: 0.77, y: 0.63, w: 0.12, h: 0.13 },
  { id: "cream-office", districtIndex: 2, name: "Rakparti iroda", mode: "shop", x: 0.13, y: 0.70, w: 0.11, h: 0.14 },
  { id: "mid-rise", districtIndex: 2, name: "Kikotoi magasepulet", mode: "shop", x: 0.45, y: 0.41, w: 0.11, h: 0.16 },
];

const clickableBuildingDefs = [
  { id: "west-tenement", districtIndex: 0, name: "Belvarosi berhaz", mode: "street", x: 0.106, y: 0.270, w: 0.070, h: 0.128 },
  { id: "northwest-block", districtIndex: 0, name: "Szurke sarokhaz", mode: "street", x: 0.258, y: 0.192, w: 0.087, h: 0.116 },
  { id: "west-mid-block", districtIndex: 0, name: "Nyugati sarokhaz", mode: "street", x: 0.234, y: 0.363, w: 0.078, h: 0.125 },
  { id: "dome-hall", districtIndex: 1, name: "Kupolas csarnok", mode: "shop", x: 0.377, y: 0.253, w: 0.103, h: 0.145 },
  { id: "north-estate", districtIndex: 4, name: "Foepulet", mode: "shop", x: 0.586, y: 0.070, w: 0.100, h: 0.120 },
  { id: "sale-block", districtIndex: 4, name: "Villanegyedi tomb", mode: "shop", x: 0.696, y: 0.205, w: 0.082, h: 0.125 },
  { id: "billboard-tower", districtIndex: 2, name: "Luchese torony", mode: "shop", x: 0.865, y: 0.257, w: 0.105, h: 0.250 },
  { id: "market-row", districtIndex: 1, name: "Piac sori uzlethaz", mode: "shop", x: 0.617, y: 0.273, w: 0.105, h: 0.125 },
  { id: "mid-office", districtIndex: 2, name: "Rakparti iroda", mode: "shop", x: 0.500, y: 0.376, w: 0.075, h: 0.130 },
  { id: "east-office", districtIndex: 2, name: "Keleti uzlethaz", mode: "shop", x: 0.715, y: 0.400, w: 0.090, h: 0.120 },
  { id: "moretti-import", districtIndex: 3, name: "Moretti import", mode: "street", x: 0.156, y: 0.621, w: 0.100, h: 0.185 },
  { id: "southwest-tenement", districtIndex: 3, name: "Gyarnegyedi haz", mode: "street", x: 0.237, y: 0.766, w: 0.090, h: 0.160 },
  { id: "central-bank", districtIndex: 5, name: "Perem bankhaz", mode: "street", x: 0.549, y: 0.585, w: 0.110, h: 0.145 },
  { id: "courthouse", districtIndex: 5, name: "Feher portikusz", mode: "street", x: 0.716, y: 0.660, w: 0.070, h: 0.115 },
  { id: "southeast-block", districtIndex: 2, name: "Delkeleti berhaz", mode: "shop", x: 0.941, y: 0.592, w: 0.090, h: 0.145 },
];

const backgroundMapFrame = {
  width: 1535,
  height: 1025,
  scaleX: 0.92,
  centerX: 0.5,
  centerY: 0.52,
};

const state = {
  profileName: "",
  money: 120,
  fame: 0,
  crew: 1,
  heat: 12,
  health: 100,
  energy: 100,
  gearPower: 12,
  mainBaseSpotId: null,
  day: 1,
  cityLevel: 1,
  districts: [],
  selectedDistrictIndex: 0,
  registered: false,
};

let sceneRef = null;

const overlay = document.getElementById("bootOverlay");
const registerForm = document.getElementById("registerForm");
const playerNameInput = document.getElementById("playerName");
const hudRoot = document.getElementById("hudRoot");
const hudAvatarCard = document.querySelector(".hud-avatar-card");
const hudMoney = document.getElementById("hudMoney");
const hudFame = document.getElementById("hudFame");
const hudInfluence = document.getElementById("hudInfluence");
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
const hudLog = document.getElementById("hudLog");
const hudAction1 = document.getElementById("hudAction1");
const hudAction2 = document.getElementById("hudAction2");
const hudAction3 = document.getElementById("hudAction3");
const hudAction4 = document.getElementById("hudAction4");
const hudAction5 = document.getElementById("hudAction5");
const hudAction6 = document.getElementById("hudAction6");
const hudReset = document.getElementById("hudReset");
const hudEndDayInline = document.getElementById("hudEndDayInline");
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
const characterPanel = document.getElementById("characterPanel");
const characterPanelBackdrop = document.getElementById("characterPanelBackdrop");
const characterPanelClose = document.getElementById("characterPanelClose");
const characterName = document.getElementById("characterName");
const characterRank = document.getElementById("characterRank");
const characterMoney = document.getElementById("characterMoney");
const characterLevel = document.getElementById("characterLevel");
const characterHealth = document.getElementById("characterHealth");
const characterAttack = document.getElementById("characterAttack");
const characterDefense = document.getElementById("characterDefense");
const characterFame = document.getElementById("characterFame");
const characterCrew = document.getElementById("characterCrew");
const characterHeat = document.getElementById("characterHeat");
const characterCityLevel = document.getElementById("characterCityLevel");

let avatarNameEl = null;git status
let avatarLevelEl = null;
let avatarPortraitEl = null;
let avatarBar1TextEl = null;
let avatarBar2TextEl = null;
let avatarBar1FillEl = null;
let avatarBar2FillEl = null;
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
        <img class="hud-avatar-image" id="avatarPortrait" src="./assets/character/gangster-character.png" alt="Maffia karakter">
      </div>
      <div class="hud-avatar-level" id="avatarLevel">Kezdo gengszter</div>
    </div>
    <div class="hud-avatar-bars">
      <div class="hud-bar-row">
        <div class="hud-bar-text" id="avatarBar1Text">138 / 140</div>
        <div class="hud-bar hud-bar--red"><div class="hud-bar__fill" id="avatarBar1Fill"></div></div>
      </div>
      <div class="hud-bar-row">
        <div class="hud-bar-text" id="avatarBar2Text">99 / 100</div>
        <div class="hud-bar hud-bar--blue"><div class="hud-bar__fill" id="avatarBar2Fill"></div></div>
      </div>
    </div>
    <div class="hud-note" id="avatarNote">Regisztralj, es indul a varosi felemelkedes.</div>
  `;
  avatarNameEl = document.getElementById("avatarName");
  avatarLevelEl = document.getElementById("avatarLevel");
  avatarPortraitEl = document.getElementById("avatarPortrait");
  avatarBar1TextEl = document.getElementById("avatarBar1Text");
  avatarBar2TextEl = document.getElementById("avatarBar2Text");
  avatarBar1FillEl = document.getElementById("avatarBar1Fill");
  avatarBar2FillEl = document.getElementById("avatarBar2Fill");
  avatarNoteEl = document.getElementById("avatarNote");
}

function getRankLevel(fame) {
  let level = 0;
  for (let i = 0; i < rankTable.length; i += 1) {
    if (fame >= rankTable[i].fame) level = i + 1;
  }
  return Math.max(1, Math.min(level, rankTable.length));
}

function getNextRankFame(fame) {
  for (const entry of rankTable) {
    if (entry.fame > fame) return entry.fame;
  }
  return rankTable[rankTable.length - 1].fame;
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
  "truck",
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

function formatMoney(value) {
  return `${value} $`;
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
  if (!visible) hideCharacterPanel();
}

let activeChoiceSpot = null;

function refreshCharacterPanel() {
  const level = getRankLevel(state.fame);
  if (characterName) characterName.textContent = state.profileName || "Ismeretlen";
  if (characterRank) characterRank.textContent = rankForFame(state.fame);
  if (characterMoney) characterMoney.textContent = String(state.money);
  if (characterLevel) characterLevel.textContent = String(level);
  if (characterHealth) characterHealth.textContent = `${state.health} / 100`;
  if (characterAttack) characterAttack.textContent = String(getPlayerPower());
  if (characterDefense) characterDefense.textContent = String(10 + level * 2 + state.cityLevel);
  if (characterFame) characterFame.textContent = String(state.fame);
  if (characterCrew) characterCrew.textContent = String(state.crew);
  if (characterHeat) characterHeat.textContent = `${state.heat}%`;
  if (characterCityLevel) characterCityLevel.textContent = String(state.cityLevel);
}

function showCharacterPanel() {
  if (!state.registered || !characterPanel) return;
  hideChoiceWheel();
  refreshCharacterPanel();
  characterPanel.classList.remove("hidden");
  characterPanel.setAttribute("aria-hidden", "false");
}

function hideCharacterPanel() {
  characterPanel?.classList.add("hidden");
  characterPanel?.setAttribute("aria-hidden", "true");
}

function hideChoiceWheel() {
  activeChoiceSpot = null;
  choiceWheel?.classList.add("hidden");
}

function showChoiceWheel(spot) {
  activeChoiceSpot = spot;
  if (!choiceWheel || !choiceWheelPanel) return;

  const panelWidth = 188;
  const panelHeight = 188;
  const x = clamp(spot.x, panelWidth / 2 + 16, window.innerWidth - panelWidth / 2 - 16);
  const y = clamp(spot.y, panelHeight / 2 + 16, window.innerHeight - panelHeight / 2 - 16);

  choiceWheel.classList.remove("hidden");
  choiceWheelPanel.style.left = `${x}px`;
  choiceWheelPanel.style.top = `${y}px`;
  const difficulty = getBuildingDifficulty(spot);
  const difficultyInfo = getDifficultyInfo(difficulty);
  if (choiceWheelTitle) choiceWheelTitle.textContent = `${spot.name} - ${difficultyInfo.label}`;
  if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "";
  if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = spot.name;
  if (choiceWheelAction1) choiceWheelAction1.textContent = `Kirablás (-${spot.mode === "shop" ? 18 : 12})`;
  if (choiceWheelAction2) choiceWheelAction2.textContent = "Védelmi pénz (-8)";
  if (choiceWheelAction3) {
    choiceWheelAction3.textContent = state.mainBaseSpotId === spot.id ? "Pihenés" : "Fő bázis";
  }
  if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezárás";
}

function runChoiceAction(actionId) {
  const spot = activeChoiceSpot;
  if (!spot) return;

  if (actionId === "close") {
    hideChoiceWheel();
    return;
  }

  state.selectedDistrictIndex = clamp(spot.districtIndex, 0, state.districts.length - 1);
  if (actionId === "robbery") {
    raidDistrict(getSelectedDistrict(), spot.mode === "shop" ? "shop" : "street", spot);
  } else if (actionId === "protection") {
    collectProtectionMoney(getSelectedDistrict(), spot.name);
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

function loadGame() {
  const storageKeys = [STORAGE_KEY, "maffia.birodalom.save.phaser.v2", "maffia.birodalom.save.phaser.v1"];
  try {
    const raw = storageKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    if (!Array.isArray(state.districts) || state.districts.length === 0) {
      state.districts = makeDistricts();
    }
    state.day = Number.isFinite(state.day) ? state.day : 1;
    state.health = Number.isFinite(state.health) ? clamp(state.health, 1, 100) : 100;
    state.energy = Number.isFinite(state.energy) ? clamp(state.energy, 0, 100) : 100;
    state.gearPower = Number.isFinite(state.gearPower) ? Math.max(0, state.gearPower) : 12;
    state.mainBaseSpotId = typeof state.mainBaseSpotId === "string" ? state.mainBaseSpotId : null;
    if (state.mainBaseSpotId && !getSpotById(state.mainBaseSpotId)) {
      state.mainBaseSpotId = null;
    }
    state.selectedDistrictIndex = clamp(
      Number.isInteger(state.selectedDistrictIndex) ? state.selectedDistrictIndex : 0,
      0,
      state.districts.length - 1,
    );
    state.registered = Boolean(state.profileName);
    return state.registered;
  } catch {
    return false;
  }
}

function saveGame() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profileName: state.profileName,
        money: state.money,
        fame: state.fame,
        crew: state.crew,
        heat: state.heat,
        health: state.health,
        energy: state.energy,
        gearPower: state.gearPower,
        mainBaseSpotId: state.mainBaseSpotId,
        day: state.day,
        cityLevel: state.cityLevel,
        districts: state.districts,
        selectedDistrictIndex: state.selectedDistrictIndex,
        registered: state.registered,
      }),
    );
  } catch {
    // The game remains playable when local file storage is unavailable.
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
  state.heat = clamp(state.heat + amount, 0, 100);
}

function applyFame(amount) {
  state.fame = Math.max(0, state.fame + amount);
}

function applyActionDamage(min = 3, max = 15) {
  const healthLoss = Math.floor(Math.random() * (max - min + 1)) + min;
  state.health = clamp(state.health - healthLoss, 1, 100);
  return healthLoss;
}

function getPlayerPower() {
  const level = getRankLevel(state.fame);
  return Math.round(
    state.gearPower
      + level * 8
      + state.crew * 5
      + state.cityLevel * 5
      + state.fame * 0.1,
  );
}

function getBuildingDifficulty(spot) {
  const district = state.districts[spot?.districtIndex] || districtDefs[spot?.districtIndex] || {};
  const baseSecurity = district.security ?? 50;
  const seedX = Math.round((spot?.x ?? 0) * 1000) + (spot?.districtIndex ?? 0) * 37;
  const seedY = Math.round((spot?.y ?? 0) * 1000) + (spot?.id?.length ?? 0) * 29;
  const seedSalt = (spot?.id?.charCodeAt(0) ?? 0) + (spot?.id?.charCodeAt((spot?.id?.length ?? 1) - 1) ?? 0);
  const randomFactor = hash2(seedX, seedY, seedSalt);
  const modeBias = spot?.mode === "shop" ? 10 : -4;
  return Math.round(baseSecurity * 0.45 + randomFactor * 42 + modeBias);
}

function getDifficultyInfo(difficulty) {
  const difference = difficulty - getPlayerPower();
  if (difference <= 5) {
    return { label: "Konnyu", color: 0x62c878, successChance: clamp(0.86 - difference * 0.012, 0.78, 0.96) };
  }
  if (difference <= 20) {
    return { label: "Kockazatos", color: 0xd6ad42, successChance: clamp(0.68 - difference * 0.018, 0.38, 0.7) };
  }
  return { label: "Veszelyes", color: 0xc84f42, successChance: clamp(0.42 - difference * 0.012, 0.12, 0.38) };
}

function spendEnergy(cost) {
  if (state.energy < cost) {
    sceneRef?.setMessage(`Nincs eleg akciopont. Szükséges: ${cost}.`);
    return false;
  }
  state.energy = clamp(state.energy - cost, 0, 100);
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
  state.mainBaseSpotId = spot.id;
  state.selectedDistrictIndex = clamp(spot.districtIndex, 0, state.districts.length - 1);
  sceneRef?.pushLog(`${spot.name} lett a fo bazisod.`);
  sceneRef?.setMessage(`Fo bazis beallitva: ${spot.name}.`);
  saveGame();
}

function restAtBase(spot) {
  if (!state.mainBaseSpotId || spot.id !== state.mainBaseSpotId) {
    sceneRef?.setMessage("Ez nem a fo bazisod.");
    return;
  }

  const healthGain = Math.min(100 - state.health, 28);
  const energyGain = Math.min(100 - state.energy, 100);
  const heatLoss = Math.min(state.heat, 35);
  state.health = clamp(state.health + healthGain, 1, 100);
  state.energy = clamp(state.energy + energyGain, 0, 100);
  state.heat = clamp(state.heat - heatLoss, 0, 100);
  sceneRef?.pushLog(`Pihenes a bazison. +${healthGain} eletero, +${energyGain} akciopont, -${heatLoss} korozes.`);
  sceneRef?.setMessage("A banda elbujt a bazison.");
  saveGame();
}

function raidDistrict(targetDistrict, mode = "street", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return;
  }
  if (!spendEnergy(mode === "shop" ? 18 : 12)) return;

  const target = targetDistrict || getSelectedDistrict();
  const difficulty = targetSpot ? getBuildingDifficulty(targetSpot) : Math.round((target?.security ?? 50) * 0.8);
  const difficultyInfo = getDifficultyInfo(difficulty);
  const label = targetSpot?.name || target?.name || "Utcai celpont";
  if (Math.random() > difficultyInfo.successChance) {
    const healthLoss = applyActionDamage(difficultyInfo.label === "Veszelyes" ? 12 : 7, difficultyInfo.label === "Veszelyes" ? 25 : 18);
    applyHeat(mode === "shop" ? 14 : 9);
    sceneRef?.pushLog(`${label}: a buntett nem sikerult. -${healthLoss} eletero.`);
    sceneRef?.setMessage(`${label} tul eros volt. A tamadas sikertelen.`);
    saveGame();
    return;
  }
  const security = target?.security ?? 50;
  const controlled = Boolean(target?.controlled);
  const securityFactor = clamp((100 - security) / 100, 0.35, 1);
  const controlFactor = controlled ? 0.78 : 1.08;
  const baseGain = mode === "shop" ? 72 : 38;
  const cityGain = state.cityLevel * (mode === "shop" ? 12 : 7);
  const variance = Math.random() * (mode === "shop" ? 28 : 16);
  const gain = Math.max(
    mode === "shop" ? 45 : 22,
    Math.round((baseGain + cityGain + variance) * (0.85 + securityFactor * 0.45) * controlFactor),
  );

  state.money += gain;
  applyFame(mode === "shop" ? 8 : 4);
  applyHeat(mode === "shop" ? 18 : 10);
  const healthLoss = applyActionDamage();

  if (target) {
    target.loyalty = clamp(target.loyalty + (mode === "shop" ? 9 : 5), 0, 100);
    if (!target.controlled && target.loyalty >= 65) {
      target.controlled = true;
      sceneRef?.pushLog(`${target.name} most mar a bandadhoz tartozik.`);
    }
  }

  sceneRef?.pushLog(`${label} kirabolva: +${gain} $, -${healthLoss} eletero.`);
  sceneRef?.setMessage(`${label} kirabolva. Serules: -${healthLoss} eletero.`);
  saveGame();
}

function collectProtectionMoney(targetDistrict, buildingName = "Haz") {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return;
  }
  if (!spendEnergy(8)) return;

  const target = targetDistrict || getSelectedDistrict();
  const gain = Math.floor(Math.random() * 21) + 10;

  state.money += gain;
  applyFame(3);
  applyHeat(5);

  if (target) {
    target.loyalty = clamp(target.loyalty + 8, 0, 100);
    if (!target.controlled && target.loyalty >= 65) {
      target.controlled = true;
      sceneRef?.pushLog(`${target.name} most mar a bandadhoz tartozik.`);
    }
  }

  sceneRef?.pushLog(`${buildingName}: +${gain} $ vedelmi penz.`);
  sceneRef?.setMessage(`${buildingName} kifizette a vedelmi penzt.`);
  saveGame();
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
  const loss = Math.floor(state.money * 0.22);
  state.money = Math.max(0, state.money - loss);
  state.crew = Math.max(1, Math.ceil(state.crew / 2));
  state.heat = 30;
  sceneRef?.pushLog(`Rajtautes tortent. -${loss} $, a crew fele lecsokkent.`);
  sceneRef?.setMessage("A rendorok belekoccoltak az ugybe.");
  saveGame();
}

function handleStreetRobbery() {
  raidDistrict(getSelectedDistrict(), "street");
}

function handleShopRaid() {
  raidDistrict(getSelectedDistrict(), "shop");
}

function handleRecruit() {
  const cost = 60 + state.crew * 15;
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz uj emberek toborzasahoz.");
    return;
  }
  if (!spendEnergy(10)) return;
  state.money -= cost;
  state.crew += 1;
  applyFame(6);
  applyHeat(4);
  sceneRef?.pushLog(`Uj ember csatlakozott. -${cost} $, crew +1.`);
  sceneRef?.setMessage("A banda erosodik.");
}

function handleExpand() {
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
  if (!spendEnergy(25)) return;

  target.controlled = true;
  target.loyalty = 35;
  applyFame(12);
  applyHeat(8);
  const healthLoss = applyActionDamage(5, 18);
  sceneRef?.pushLog(`${target.name} a birodalom resze lett. -${healthLoss} eletero.`);
  sceneRef?.setMessage(`Atvetted ezt a teruletet: ${target.name}. Serules: -${healthLoss} eletero.`);
}

function handleUpgradeCity() {
  const cost = 140 + state.cityLevel * 70;
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz a varos fejlesztesere.");
    return;
  }
  if (!spendEnergy(15)) return;
  state.money -= cost;
  state.cityLevel += 1;
  state.districts.forEach((district) => {
    if (district.controlled) district.loyalty = clamp(district.loyalty + 10, 0, 100);
  });
  applyFame(10);
  sceneRef?.pushLog(`A varos szintje nott. -${cost} $, varos szint +1.`);
  sceneRef?.setMessage("Erosebb infrastruktura, tobb beveteled lesz.");
}

function handleLayLow() {
  if (!spendEnergy(5)) return;
  state.heat = clamp(state.heat - 22, 0, 100);
  const healing = Math.min(20, 100 - state.health);
  state.health = clamp(state.health + healing, 1, 100);
  sceneRef?.pushLog(`A banda lapult egy napot. Korozes csokkent, +${healing} eletero.`);
  sceneRef?.setMessage(`A helyzet lehult. Gyogyulas: +${healing} eletero.`);
}

function endDay() {
  const controlled = state.districts.filter((district) => district.controlled);
  const income = controlled.reduce((sum, district) => sum + district.value * 20 + district.loyalty, 0);
  const fameBonus = controlled.length * 2 + state.cityLevel;

  state.money += income;
  applyFame(fameBonus);
  state.day += 1;
  state.health = clamp(state.health + 10, 1, 100);
  state.energy = 100;
  advanceDistrictLoyalty();
  state.heat = clamp(state.heat - 6, 0, 100);
  sceneRef?.pushLog(`Nap vege: +${income} $, +${fameBonus} hirnev.`);

  if (state.heat >= 100) {
    triggerBust();
  }

  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  sceneRef?.setMessage(`Uj nap kezdodik. A birodalom most mar ${controlled.length} keruletet tart.`);
}

function startNewGame(name) {
  state.profileName = name.trim().slice(0, 18);
  state.money = 120;
  state.fame = 0;
  state.crew = 1;
  state.heat = 12;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 12;
  state.mainBaseSpotId = null;
  state.day = 1;
  state.cityLevel = 1;
  state.districts = makeDistricts();
  state.selectedDistrictIndex = 0;
  state.registered = true;
  saveGame();
  overlay.classList.add("hidden");
  setHudVisible(true);
  hideChoiceWheel();
  sceneRef?.resetLogs();
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Valassz egy hazat, es allitsd fo bazissá.");
}

function resetGame() {
  [
    STORAGE_KEY,
    "maffia.birodalom.save.phaser.v2",
    "maffia.birodalom.save.phaser.v1",
  ].forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore unavailable local storage and continue resetting the game.
    }
  });
  state.profileName = "";
  state.money = 120;
  state.fame = 0;
  state.crew = 1;
  state.heat = 12;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 12;
  state.mainBaseSpotId = null;
  state.day = 1;
  state.cityLevel = 1;
  state.districts = makeDistricts();
  state.selectedDistrictIndex = 0;
  state.registered = false;
  overlay.classList.remove("hidden");
  setHudVisible(false);
  hideChoiceWheel();
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

class CityScene extends Phaser.Scene {
  constructor() {
    super("CityScene");
    this.showMapModels = false;
    this.mapGraphics = null;
    this.highlightGraphics = null;
    this.spotGraphics = null;
    this.uiTexts = {};
    this.districtZones = [];
    this.districtHotspots = [];
    this.hotspotLayout = [];
    this.meshZones = [];
    this.spotMarkers = [];
    this.spotLabels = [];
    this.mapLabels = [];
    this.mapSprites = [];
    this.carSprites = [];
    this.actionButtons = [];
    this.logLines = [];
    this.clanChatLines = [];
    this.currentMessage = "";
    this.mapLayout = { originX: 0, originY: 0, tileW: 64, tileH: 32 };
  }

  create() {
    sceneRef = this;
    this.mapGraphics = this.add.graphics();
    this.mapGraphics.setDepth(-100);
    this.highlightGraphics = this.add.graphics().setScrollFactor(0).setDepth(900);
    this.spotGraphics = this.add.graphics().setScrollFactor(0).setDepth(850);
    this.createUI();
    this.scale.on("resize", this.onResize, this);
    this.assetsReady = false;
    this.setMessage("A varos betoltese folyamatban...");
    this.loadInlineAssets()
      .catch(() => {
        this.setMessage("Nehany regi modell nem toltodott be, a terkep tovabbra is hasznalhato.");
      })
      .finally(() => {
        this.assetsReady = true;
        this.refreshScene();
        if (state.registered) {
          this.setMessage("A mentett birodalom betoltve.");
        }
      });
  }

  resetLogs() {
    this.clanChatLines = [];
    this.refreshHUD();
  }

  setMessage(text) {
    this.currentMessage = text;
    if (this.uiTexts.message) {
      this.uiTexts.message.setText(text);
    }
    if (avatarNoteEl) {
      avatarNoteEl.textContent = text;
    }
  }

  pushLog(text) {
    this.logLines.unshift(text);
    this.logLines = this.logLines.slice(0, 5);
    this.refreshHUD();
    saveGame();
  }

  pushClanChat(text) {
    this.clanChatLines.unshift(text);
    this.clanChatLines = this.clanChatLines.slice(0, 6);
    this.refreshHUD();
  }

  refreshHUD() {
    if (hudMoney) hudMoney.textContent = formatMoney(state.money);
    if (hudFame) hudFame.textContent = String(state.fame);
    const influence = state.districts.length
      ? Math.round(state.districts.reduce((sum, district) => sum + district.loyalty, 0) / state.districts.length)
      : 0;
    if (hudInfluence) hudInfluence.textContent = `${influence}%`;
    if (hudHeat) hudHeat.textContent = `${state.heat}%`;

    const profileName = (state.profileName || "Ismeretlen").trim();
    const avatarInitial = profileName.charAt(0).toUpperCase() || "M";
    const avatarLevel = getRankLevel(state.fame);
    const healthMax = 100;
    const energyMax = 100;
    const healthValue = Math.max(0, Math.min(healthMax, state.health));
    const energyValue = Math.max(0, Math.min(energyMax, state.energy));
    const selected = getSelectedDistrict();

    if (avatarNameEl) avatarNameEl.textContent = profileName;
    if (avatarLevelEl) avatarLevelEl.textContent = String(avatarLevel);
    if (avatarPortraitEl) avatarPortraitEl.src = "./assets/character/gangster-character.png";
    if (avatarBar1TextEl) avatarBar1TextEl.textContent = `${healthValue} / ${healthMax}`;
    if (avatarBar2TextEl) avatarBar2TextEl.textContent = `${energyValue} / ${energyMax}`;
    if (avatarBar1FillEl) avatarBar1FillEl.style.width = `${(healthValue / healthMax) * 100}%`;
    if (avatarBar2FillEl) avatarBar2FillEl.style.width = `${(energyValue / energyMax) * 100}%`;
    if (avatarNoteEl) {
      avatarNoteEl.textContent = this.currentMessage || (
        selected
          ? `${selected.name} - ${selected.kind}`
          : "Regisztralj, es indul a varosi felemelkedes."
      );
    }
    refreshCharacterPanel();

    if (hudQuestTab1) {
      const mainQuest = `Fo: ${selected?.name || "Terjeszkedes"}`;
      hudQuestTab1.textContent = mainQuest;
      hudQuestTab1.dataset.label = mainQuest;
      hudQuestTab1.setAttribute("aria-label", mainQuest);
    }
    if (hudQuestTab2) {
      const sideQuest = state.heat > 50 ? "Mellek: Lapulj" : "Mellek: Penzszerzes";
      hudQuestTab2.textContent = sideQuest;
      hudQuestTab2.dataset.label = sideQuest;
      hudQuestTab2.setAttribute("aria-label", sideQuest);
    }
    if (hudQuestTab1) hudQuestTab1.classList.toggle("is-active", true);
    if (hudQuestTab2) hudQuestTab2.classList.toggle("is-active", false);

    if (this.uiTexts.profile) {
      this.uiTexts.profile.setText(state.profileName || "Ismeretlen");
      this.uiTexts.rank.setText(rankForFame(state.fame));
      this.uiTexts.day.setText(`Nap ${state.day}`);
      this.uiTexts.money.setText(`Penz ${formatMoney(state.money)}`);
      this.uiTexts.fame.setText(`Hirnev ${state.fame}`);
      this.uiTexts.crew.setText(`Crew ${state.crew}`);
      this.uiTexts.heat.setText(`Korozes ${state.heat}%`);
      this.uiTexts.profile.setAlpha(0);
      this.uiTexts.rank.setAlpha(0);
      this.uiTexts.day.setAlpha(0);
      this.uiTexts.money.setAlpha(0);
      this.uiTexts.fame.setAlpha(0);
      this.uiTexts.crew.setAlpha(0);
      this.uiTexts.heat.setAlpha(0);
    }

    if (selected && this.uiTexts.selectedName) {
      this.uiTexts.selectedName.setText(selected.name);
      this.uiTexts.selectedMeta.setText(
        `${selected.kind} - ${selected.controlled ? "Sajat" : "Semleges"} kerulet`,
      );
      this.uiTexts.selectedDetail.setText(selected.description);
      this.uiTexts.selectedStats.setText(
        `Biztonsag ${selected.security}   Huseg ${selected.loyalty}%   Bevetel ${selected.value * 20 + selected.loyalty} $`,
      );
    }

    if (this.uiTexts.log) {
      this.uiTexts.log.setText(
        this.clanChatLines.length ? this.clanChatLines.join("\n") : "Nincs klanbeszelgetes.",
      );
    }
  }

  createUI() {

    const titleText = { fontFamily: "Georgia, 'Times New Roman', serif", color: "#232427" };
    const hudText = { fontFamily: "Inter, system-ui, sans-serif", color: "#59616f" };
    const whiteText = { fontFamily: "Inter, system-ui, sans-serif", color: "#f5f3ee" };

    this.uiTexts.profile = this.add.text(18, 16, "", { ...titleText, fontSize: "22px", fontStyle: "bold" }).setScrollFactor(0);
    this.uiTexts.profile.setAlpha(0);
    this.uiTexts.rank = this.add.text(18, 44, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.rank.setAlpha(0);
    this.uiTexts.day = this.add.text(18, 66, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.day.setAlpha(0);
    this.uiTexts.money = this.add.text(18, 88, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.money.setAlpha(0);
    this.uiTexts.fame = this.add.text(18, 110, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.fame.setAlpha(0);
    this.uiTexts.crew = this.add.text(18, 132, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.crew.setAlpha(0);
    this.uiTexts.heat = this.add.text(18, 154, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.heat.setAlpha(0);

    this.selectedBox = this.add.rectangle(0, 0, 248, 180, 0xf5f1e7, 0.84).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    this.uiTexts.selectedName = this.add.text(0, 0, "", { ...titleText, fontSize: "20px", fontStyle: "bold" }).setScrollFactor(0);
    this.uiTexts.selectedMeta = this.add.text(0, 0, "", { ...hudText, fontSize: "13px" }).setScrollFactor(0);
    this.uiTexts.selectedDetail = this.add.text(0, 0, "", { ...hudText, fontSize: "13px", wordWrap: { width: 208 } }).setScrollFactor(0);
    this.uiTexts.selectedStats = this.add.text(0, 0, "", { ...hudText, fontSize: "12px", wordWrap: { width: 208 } }).setScrollFactor(0);
    this.uiTexts.message = this.add.text(0, 0, "Regisztralj, es indul a varosi felemelkedes.", {
      ...hudText,
      fontSize: "13px",
      wordWrap: { width: 208 },
    }).setScrollFactor(0);

    this.actionPanel = this.add.rectangle(0, 0, 252, 306, 0xf5f1e7, 0.8).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    const actions = [
      ["1 Utcai rablas", handleStreetRobbery],
      ["2 Bolt kifosztasa", handleShopRaid],
      ["3 Toborzas", handleRecruit],
      ["4 Kerulet atvetele", handleExpand],
      ["5 Varos fejlesztese", handleUpgradeCity],
      ["6 Lapulas", handleLayLow],
    ];
    this.actionButtons = actions.map(([label, fn]) => {
      const zone = this.add.zone(0, 0, 204, 36).setInteractive({ useHandCursor: true });
      const bg = this.add.rectangle(0, 0, 204, 36, 0xffffff, 0.42).setStrokeStyle(1, 0x8c8377, 0.14);
      const txt = this.add.text(0, 0, label, { ...whiteText, fontSize: "13px", fontStyle: "bold" }).setOrigin(0.5);
      const container = this.add.container(0, 0, [bg, txt]).setScrollFactor(0);
      zone.on("pointerdown", () => {
        if (!state.registered) {
          this.setMessage("Elobb regisztralj.");
          return;
        }
        fn();
        if (state.heat >= 100) triggerBust();
        this.refreshHUD();
        this.refreshMap();
      });
      return { zone, container };
    });

    this.endDayBg = this.add.rectangle(0, 0, 100, 34, 0xd86254, 1).setScrollFactor(0);
    this.endDayText = this.add.text(0, 0, "Nap", { ...whiteText, fontSize: "16px", fontStyle: "bold" }).setOrigin(0.5);
    this.endDayZone = this.add.zone(0, 0, 100, 34).setInteractive({ useHandCursor: true });
    this.endDayZone.on("pointerdown", () => {
      if (!state.registered) return;
      endDay();
    });
    this.endDayContainer = this.add.container(0, 0, [this.endDayBg, this.endDayText]).setScrollFactor(0);

    this.resetBg = this.add.rectangle(0, 0, 100, 34, 0xffffff, 0.44).setStrokeStyle(1, 0x8c8377, 0.14).setScrollFactor(0);
    this.resetText = this.add.text(0, 0, "Uj jatek", { ...whiteText, fontSize: "16px", fontStyle: "bold" }).setOrigin(0.5);
    this.resetZone = this.add.zone(0, 0, 100, 34).setInteractive({ useHandCursor: true });
    this.resetZone.on("pointerdown", () => resetGame());
    this.resetContainer = this.add.container(0, 0, [this.resetBg, this.resetText]).setScrollFactor(0);

    this.logBg = this.add.rectangle(0, 0, 300, 112, 0xf5f1e7, 0.82).setStrokeStyle(1, 0x7f7a70, 0.16).setScrollFactor(0);
    this.uiTexts.log = this.add.text(0, 0, "", { ...hudText, fontSize: "12px", wordWrap: { width: 256 } }).setScrollFactor(0);

    this.setUiDepth();
    this.refreshHUD();
    this.uiTexts.message?.destroy();
    this.uiTexts.message = null;
    this.selectedBox?.destroy();
    this.selectedBox = null;
    this.uiTexts.selectedName = null;
    this.uiTexts.selectedMeta = null;
    this.uiTexts.selectedDetail = null;
    this.uiTexts.selectedStats = null;
    this.actionPanel?.destroy();
    this.actionPanel = null;
    this.actionButtons.forEach((entry) => {
      entry.container?.destroy();
      entry.zone?.destroy();
    });
    this.actionButtons = [];
    this.endDayBg?.destroy();
    this.endDayText?.destroy();
    this.endDayContainer?.destroy();
    this.endDayZone?.destroy();
    this.resetBg?.destroy();
    this.resetText?.destroy();
    this.resetContainer?.destroy();
    this.resetZone?.destroy();
    this.logBg?.destroy();
    this.logBg = null;
    this.uiTexts.log = null;
    this.uiTexts.profile?.destroy();
    this.uiTexts.rank?.destroy();
    this.uiTexts.day?.destroy();
    this.uiTexts.money?.destroy();
    this.uiTexts.fame?.destroy();
    this.uiTexts.crew?.destroy();
    this.uiTexts.heat?.destroy();
    this.uiTexts.profile = null;
    this.uiTexts.rank = null;
    this.uiTexts.day = null;
    this.uiTexts.money = null;
    this.uiTexts.fame = null;
    this.uiTexts.crew = null;
    this.uiTexts.heat = null;
  }

  setUiDepth() {
    const objects = [
      this.selectedBox,
      this.actionPanel,
      this.endDayBg,
      this.endDayText,
      this.endDayContainer,
      this.resetBg,
      this.resetText,
      this.resetContainer,
      this.logBg,
      ...Object.values(this.uiTexts),
      ...this.actionButtons.flatMap((entry) => [entry.container, entry.zone]),
      this.endDayZone,
      this.resetZone,
    ];

    objects.filter(Boolean).forEach((object) => {
      if (typeof object.setDepth === "function") {
        object.setDepth(1000);
      }
    });
  }

  async loadInlineAssets() {
    const assets = window.MAFFIA_ASSETS || {};
    const entries = [
      ...BUILDING_KEYS.map((key) => [key, assets[key]]),
      ...ROAD_KEYS.map((key) => [key, assets[key]]),
      ["tree-a", assets.treeA],
      ["tree-b", assets.treeB],
      ["truck", assets.truck],
      ...DECOR_KEYS.slice(3).map((key) => [key, assets[key]]),
    ].filter(([, src]) => Boolean(src));

    const loadOne = (key, src) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (!this.textures.exists(key)) {
            this.textures.addImage(key, image);
          }
          resolve();
        };
        image.onerror = () => reject(new Error(`Nem sikerult betolteni a beagyazott assetet: ${key}`));
        image.src = src;
      });

    await Promise.all(entries.map(([key, src]) => loadOne(key, src)));
  }

  resetSceneObjects() {
    this.districtZones.forEach((zone) => zone.destroy());
    this.districtZones = [];
    this.districtHotspots.forEach((zone) => zone.destroy());
    this.districtHotspots = [];
    this.hotspotLayout = [];
    this.meshZones.forEach((zone) => zone.destroy());
    this.meshZones = [];
    this.spotMarkers.forEach((marker) => marker.destroy());
    this.spotMarkers = [];
    this.spotLabels.forEach((label) => label.destroy());
    this.spotLabels = [];
    this.mapLabels.forEach((label) => label.destroy());
    this.mapLabels = [];
    this.mapSprites.forEach((sprite) => sprite.destroy());
    this.mapSprites = [];
    this.carSprites.forEach((sprite) => sprite.destroy());
    this.carSprites = [];
    this.spotGraphics?.clear();
    this.highlightGraphics.clear();
  }

  refreshScene() {
    this.refreshHUD();
    this.refreshMap();
    this.layoutUI();
  }

  addMapSprite(key, x, y, scale = 1, depthBoost = 0, angle = 0) {
    const sprite = this.add.image(x, y, key);
    sprite.setOrigin(0.5, 0.5);
    sprite.setScale(scale);
    sprite.setAngle(angle);
    sprite.setDepth(y + depthBoost);
    this.mapSprites.push(sprite);
    return sprite;
  }

  drawDistrictHighlight() {
    this.highlightGraphics.clear();
  }

  buildMap(width, height) {
    const originX = width * 0.43;
    const originY = height * 0.14;
    const tileW = 58;
    const tileH = 29;
    const cols = 15;
    const rows = 15;
    const roadCols = new Set([1, 4, 7, 10, 13]);
    const roadRows = new Set([1, 4, 7, 10, 13]);

    this.mapLayout = { originX, originY, tileW, tileH };

    const neighborhoodStyles = [
      ["building-type-a", "building-type-b", "building-type-c"],
      ["building-type-d", "building-type-e", "building-type-f"],
      ["building-type-g", "building-type-h", "building-type-i"],
      ["building-type-j", "building-type-k", "building-type-l"],
      ["building-type-m", "building-type-n", "building-type-o"],
      ["building-type-p", "building-type-q", "building-type-r"],
      ["building-type-s", "building-type-t", "building-type-u"],
    ];

    const placeHouse = (key, x, y, scale, depth, angle = 0) => {
      this.addMapSprite(key, x, y, scale, depth, angle);
    };

    for (let gy = 0; gy < rows; gy += 1) {
      for (let gx = 0; gx < cols; gx += 1) {
        const pos = gridToScreen(originX, originY, tileW, tileH, gx, gy);
        const isRoad = roadCols.has(gx) || roadRows.has(gy);
        const intersection = roadCols.has(gx) && roadRows.has(gy);

        if (isRoad) {
          const roadKey = intersection
            ? "road-asphalt-center"
            : hash2(gx, gy, 31) > 0.7
              ? "road-asphalt-pavement"
              : "road-asphalt-straight";
          this.addMapSprite(roadKey, pos.x, pos.y, 1.22, -30);
          if (!intersection && hash2(gx, gy, 47) > 0.62) {
            this.addMapSprite("road-asphalt-side", pos.x + 9, pos.y + 1, 1.08, -28);
          }
          continue;
        }

        const lotSeed = hash2(gx, gy, 19);
        if (lotSeed < 0.03) {
          this.addMapSprite("grass-corner", pos.x, pos.y + 2, 1.02, 0);
          this.addMapSprite("grass-corner-inner", pos.x + 2, pos.y + 1, 0.94, 1);
          this.addMapSprite(hash2(gx, gy, 23) > 0.5 ? "tree-a" : "tree-b", pos.x - 11, pos.y + 5, 0.62, 24);
          this.addMapSprite(hash2(gx, gy, 27) > 0.5 ? "tree-a" : "tree-b", pos.x + 13, pos.y + 6, 0.62, 24);
          continue;
        }

        const blockX = Math.floor(gx / 3);
        const blockY = Math.floor(gy / 3);
        const style = neighborhoodStyles[
          Math.floor(hash2(blockX, blockY, 41) * neighborhoodStyles.length)
        ];
        const buildingKey = style[Math.floor(hash2(gx, gy, 43) * style.length)];
        const accentKey = style[Math.floor(hash2(gx, gy, 71) * style.length)];
        const scale = 0.96 + hash2(gx, gy, 53) * 0.22;
        const shiftX = (hash2(gx, gy, 59) - 0.5) * 12;
        const shiftY = (hash2(gx, gy, 61) - 0.5) * 8;
        placeHouse(buildingKey, pos.x + shiftX, pos.y + shiftY, scale, 14);

        if (hash2(gx, gy, 67) > 0.42) {
          placeHouse(accentKey, pos.x - 14 - shiftX * 0.3, pos.y + 10 + shiftY * 0.25, scale * 0.82, 16);
        }
        if (hash2(gx, gy, 73) > 0.64) {
          this.addMapSprite(hash2(gx, gy, 79) > 0.5 ? "detail-light-single" : "detail-light-double", pos.x - 13, pos.y + 8, 0.62, 20);
        }
        if (hash2(gx, gy, 81) > 0.82) {
          this.addMapSprite(hash2(gx, gy, 83) > 0.5 ? "tree-a" : "tree-b", pos.x + 18, pos.y + 12, 0.54, 21);
        }
      }
    }

    districtDefs.forEach((district, index) => {
      const pos = gridToScreen(originX, originY, tileW, tileH, district.gridX, district.gridY);
      const baseKey = district.palette.main;
      const sideKey = district.palette.side;
      const smallKey = district.palette.small;

      this.addMapSprite(baseKey, pos.x, pos.y, 1.08 + index * 0.02, 40);
      this.addMapSprite(smallKey, pos.x - 28, pos.y + 18, 0.72, 34);
      this.addMapSprite(sideKey, pos.x + 28, pos.y + 16, 0.7, 34);

      if (district.id === "center") {
        this.addMapSprite("detail-awning-wide", pos.x - 8, pos.y + 22, 0.84, 34);
        this.addMapSprite("detail-bench", pos.x + 22, pos.y + 18, 0.68, 34);
        this.addMapSprite("detail-light-double", pos.x - 38, pos.y + 18, 0.68, 34);
      } else if (district.id === "market") {
        this.addMapSprite("detail-awning-wide", pos.x - 18, pos.y + 18, 0.9, 34);
        this.addMapSprite("detail-awning-small", pos.x + 20, pos.y + 16, 0.76, 34);
        this.addMapSprite("detail-light-single", pos.x - 40, pos.y + 22, 0.68, 34);
      } else if (district.id === "harbor") {
        this.addMapSprite("truck", pos.x + 32, pos.y + 18, 0.4, 40);
        this.addMapSprite("detail-barrier-type-b", pos.x - 32, pos.y + 18, 0.8, 34);
      } else if (district.id === "industrial") {
        this.addMapSprite("detail-barrier-type-a", pos.x - 18, pos.y + 22, 0.78, 32);
        this.addMapSprite("detail-dumpster-closed", pos.x + 22, pos.y + 20, 0.72, 32);
        this.addMapSprite("detail-light-single", pos.x - 40, pos.y + 18, 0.66, 32);
      } else if (district.id === "luxury") {
        this.addMapSprite("detail-light-single", pos.x - 18, pos.y + 18, 0.72, 32);
        this.addMapSprite("detail-light-single", pos.x + 20, pos.y + 18, 0.72, 32);
        this.addMapSprite("detail-bench", pos.x - 40, pos.y + 22, 0.64, 32);
      } else if (district.id === "suburb") {
        this.addMapSprite("fence-low", pos.x - 34, pos.y + 18, 0.84, 28);
        this.addMapSprite("fence-low", pos.x + 20, pos.y + 18, 0.84, 28);
        this.addMapSprite(hash2(index, 3, 5) > 0.5 ? "tree-a" : "tree-b", pos.x - 52, pos.y + 16, 0.58, 30);
      }

      const zone = this.add.zone(pos.x, pos.y + 10, 140, 110).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => {
        state.selectedDistrictIndex = index;
        this.refreshHUD();
        this.drawDistrictHighlight();
        if (state.registered) {
          raidDistrict(district, district.id === "market" ? "shop" : "street");
        }
        this.refreshHUD();
        this.drawDistrictHighlight();
        saveGame();
      });
      this.districtZones.push(zone);

      const label = this.add.text(pos.x - 56, pos.y - 62, district.name.toUpperCase(), {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "11px",
        color: "#6d7177",
        letterSpacing: "0.1em",
      });
      label.setAlpha(0.92);
      label.setDepth(pos.y + 60);
      this.mapLabels.push(label);
    });

    const streetCars = [
      { x: 2.2, y: 2.2, dx: 40 },
      { x: 4.6, y: 1.9, dx: -30 },
      { x: 7.9, y: 3.1, dx: 38 },
      { x: 6.1, y: 6.8, dx: -30 },
      { x: 3.0, y: 8.2, dx: 28 },
      { x: 9.2, y: 5.8, dx: -24 },
    ];
    streetCars.forEach((car) => {
      const pos = gridToScreen(originX, originY, tileW, tileH, car.x, car.y);
      const sprite = this.addMapSprite("truck", pos.x, pos.y + 10, 0.42, 48, -22);
      this.tweens.add({
        targets: sprite,
        x: pos.x + car.dx,
        duration: 3800 + Math.random() * 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.carSprites.push(sprite);
    });
  }

  refreshMap() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.resetSceneObjects();
    this.mapGraphics.clear();
    if (!this.assetsReady) {
      return;
    }
    this.buildInteractiveMap(width, height);
    this.drawDistrictHighlight();
  }

  buildInteractiveMap(width, height) {
    const frameWidth = width * backgroundMapFrame.scaleX;
    const frameHeight = frameWidth * (backgroundMapFrame.height / backgroundMapFrame.width);
    const frameLeft = width * backgroundMapFrame.centerX - frameWidth * 0.5;
    const frameTop = height * backgroundMapFrame.centerY - frameHeight * 0.5;

    this.hotspotLayout = clickableBuildingDefs.map((spot) => ({
      ...spot,
      x: frameLeft + frameWidth * spot.x,
      y: frameTop + frameHeight * spot.y,
      w: frameWidth * spot.w,
      h: frameHeight * spot.h,
    }));

    this.hotspotLayout.forEach((spot) => {
      const difficulty = getBuildingDifficulty(spot);
      const difficultyInfo = getDifficultyInfo(difficulty);
      const markerColor = difficultyInfo.color;
      const isBaseSpot = state.mainBaseSpotId === spot.id;
      const halo = this.add.ellipse(
        spot.x,
        spot.y + spot.h * 0.28,
        spot.w * 0.72,
        spot.h * 0.24,
        markerColor,
        0.08,
      ).setStrokeStyle(2, markerColor, 0.7).setDepth(830);
      halo.setBlendMode(Phaser.BlendModes.ADD);
      const labelText = `${spot.name.toUpperCase()} · ${difficultyInfo.label.toUpperCase()}${isBaseSpot ? " · BÁZIS" : ""}`;
      const label = this.add.text(spot.x, spot.y - spot.h * 0.6, labelText, {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11px",
        color: "#f5e9cc",
        stroke: "#24170f",
        strokeThickness: 3,
        align: "center",
      }).setOrigin(0.5, 1).setAlpha(0.86).setDepth(832);
      if (isBaseSpot) {
        this.add.text(spot.x + spot.w * 0.28, spot.y - spot.h * 0.3, "★", {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "16px",
          color: "#f0d08c",
          stroke: "#24170f",
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(833);
      }
      this.tweens.add({
        targets: halo,
        scaleX: 1.12,
        scaleY: 1.12,
        alpha: 0.18,
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.spotMarkers.push(halo);
      this.spotLabels.push(label);

      const zone = this.add.zone(spot.x, spot.y, spot.w, spot.h).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => {
        state.selectedDistrictIndex = clamp(spot.districtIndex, 0, state.districts.length - 1);
        this.refreshHUD();
        this.drawDistrictHighlight();
        showChoiceWheel(spot);
        saveGame();
      });
      zone.on("pointerover", () => {
        this.spotGraphics.clear();
        this.spotGraphics.fillStyle(markerColor, 0.18);
        this.spotGraphics.fillRoundedRect(
          spot.x - spot.w * 0.5,
          spot.y - spot.h * 0.5,
          spot.w,
          spot.h,
          12,
        );
        this.spotGraphics.lineStyle(2, markerColor, 0.9);
        this.spotGraphics.strokeRoundedRect(
          spot.x - spot.w * 0.5,
          spot.y - spot.h * 0.5,
          spot.w,
          spot.h,
          12,
        );
        label.setAlpha(1);
      });
      zone.on("pointerout", () => {
        this.spotGraphics.clear();
        label.setAlpha(0.86);
      });
      this.districtHotspots.push(zone);
    });
  }

  layoutUI() {
    if (this.uiTexts.message) {
      this.uiTexts.message.setPosition(18, 180);
    }
  }

  onResize(gameSize) {
    const width = gameSize.width || this.scale.width;
    const height = gameSize.height || this.scale.height;
    this.cameras.main.setViewport(0, 0, width, height);
    this.refreshMap();
    this.layoutUI();
  }

  update() {
    if (!this.assetsReady) return;
    this.drawDistrictHighlight();
  }
}

const config = {
  type: Phaser.CANVAS,
  parent: "gameRoot",
  transparent: true,
  backgroundColor: "rgba(0,0,0,0)",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [CityScene],
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

  map.forEach(([button, action]) => {
    button?.addEventListener("click", () => {
      if (!state.registered) return;
      action();
      if (state.heat >= 100) triggerBust();
      saveGame();
      sceneRef?.refreshHUD();
      sceneRef?.refreshMap();
    });
  });

  hudEndDayInline?.addEventListener("click", () => {
    if (!state.registered) return;
    endDay();
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
  characterPanelClose?.addEventListener("click", hideCharacterPanel);
  characterPanelBackdrop?.addEventListener("click", hideCharacterPanel);

  choiceWheelBackdrop?.addEventListener("click", () => {
    hideChoiceWheel();
  });

  choiceWheelAction1?.addEventListener("click", () => runChoiceAction("robbery"));
  choiceWheelAction2?.addEventListener("click", () => runChoiceAction("protection"));
  choiceWheelAction3?.addEventListener("click", () => runChoiceAction("baseRest"));
  choiceWheelAction4?.addEventListener("click", () => runChoiceAction("close"));
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideCharacterPanel();
    hideChoiceWheel();
  }
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }

  const saved = loadGame();
  if (saved && state.profileName === name) {
    overlay.classList.add("hidden");
    setHudVisible(true);
    sceneRef?.refreshScene();
    return;
  }

  startNewGame(name);
});

if (loadGame()) {
  playerNameInput.value = state.profileName;
}

bindHudActions();
setHudVisible(false);
new Phaser.Game(config);

window.addEventListener("beforeunload", () => {
  saveGame();
});
