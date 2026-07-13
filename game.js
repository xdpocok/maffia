const STORAGE_KEY = "maffia.birodalom.save.phaser.v3";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY, "maffia.birodalom.save.phaser.v2", "maffia.birodalom.save.phaser.v1"];
const LAST_PROFILE_KEY = "maffia.birodalom.lastProfile";
const SAVE_API_BASE = "/api/saves/current";
const PROFILE_API_BASE = "/api/profile/current";
const GAME_CONFIG_API = "/api/game-config";
const PROTECTION_COOLDOWN_MS = 3 * 60 * 1000;
const RECOVERY_DURATION_MS = 20 * 60 * 1000;
const RECOVERY_AMOUNT = 50;
const NATURAL_RECOVERY_FULL_MS = 12 * 60 * 60 * 1000;
const NATURAL_RECOVERY_POINT_MS = NATURAL_RECOVERY_FULL_MS / 100;
const BUILDING_DIFFICULTY_CYCLE_MS = 4 * 60 * 60 * 1000;
const BASE_REST_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const DAILY_HIDE_LIMIT = 3;
const PROTECTION_REWARD_DELAY_MS = 3 * 60 * 1000;
const MAX_PROCESS_TASKS = 3;
const MAX_LOCAL_NOTIFICATIONS = 40;
const EARLY_GAME_WINDOW_MS = 30 * 60 * 1000;
const HEAT_GAIN_MULTIPLIER = 0.46;
const RIVAL_SPAWN_MIN_MS = 4 * 60 * 60 * 1000;
const RIVAL_SPAWN_MAX_MS = 5 * 60 * 60 * 1000;
const RIVAL_EVENT_DURATION_MS = 5 * 60 * 60 * 1000;
const RIVAL_ACTION_DURATION_MS = 5 * 60 * 1000;
const WORLD_RIVAL_CITY_TRIBUTE_MS = 4 * 60 * 60 * 1000;
const WORLD_RIVAL_CITY_PROTECTION_MS = 48 * 60 * 60 * 1000;
const WORLD_RIVAL_STRUCTURE_REPAIR_MS = 35 * 60 * 1000;
const WORLD_RIVAL_ATTACK_FAILURE_COOLDOWN_MS = 15 * 60 * 1000;
const WORLD_RIVAL_CITY_BASE_COUNT = 18;
const WORLD_RIVAL_CITY_MAX_COUNT = 34;
const WORLD_RIVAL_CITY_NEAR_BASE_COUNT = 5;
const MARKET_REFRESH_MS = 6 * 60 * 60 * 1000;
const GARAGE_RUN_WINDOW_MS = 12 * 60 * 60 * 1000;
const GARAGE_RUN_LIMIT = 4;
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

const WORLD_MAP_EMPTY_SRC = "./t%C3%A9k%C3%A9p/7fe4a123-f5d0-4381-b12f-6b208bff958c.png";
const WORLD_MAP_SETTLED_SRC = "./t%C3%A9k%C3%A9p/26414562-afef-4966-9f34-1a8eb9fe0a0e.png";
const WORLD_MAP_CONTINUOUS_SRC = "./assets/world/world-map-browser.webp";
const WORLD_MAP_TILE_WIDTH = 1586;
const WORLD_MAP_TILE_HEIGHT = 992;
const WORLD_MAP_TILE_COLS = 6;
const WORLD_MAP_TILE_ROWS = 5;
const WORLD_MAP_LOT_ROWS = [
  { y: 16, xs: [18, 31, 44, 57, 70, 83] },
  { y: 28, xs: [12, 25, 38, 51, 64, 77, 89] },
  { y: 42, xs: [18, 31, 44, 57, 70, 83] },
  { y: 57, xs: [12, 25, 38, 51, 64, 77, 89] },
  { y: 73, xs: [18, 31, 44, 57, 70, 83] },
  { y: 87, xs: [24, 40, 56, 72, 86] },
];
const WORLD_MAP_CODE_COLUMNS_PER_TILE = Math.max(...WORLD_MAP_LOT_ROWS.map((row) => row.xs.length));
const WORLD_BASE_HOUSE_VARIANTS = {
  1: [
    "./assets/world/world-base-house-l1-1.png",
    "./assets/world/world-base-house-l1-2.png",
    "./assets/world/world-base-house-l1-3.png",
  ],
  2: [
    "./assets/world/world-base-house-l2-1.png",
    "./assets/world/world-base-house-l2-2.png",
    "./assets/world/world-base-house-l2-3.png",
  ],
  3: [
    "./assets/world/world-base-house-l3-1.png",
    "./assets/world/world-base-house-l3-2.png",
    "./assets/world/world-base-house-l3-3.png",
  ],
};
const WORLD_RIVAL_CITY_ASSETS = [
  "./assets/world/world-rival-castle-1.png?v=2026-07-12-1",
  "./assets/world/world-rival-castle-2.png?v=2026-07-12-1",
  "./assets/world/world-rival-castle-3.png?v=2026-07-12-1",
];
const WORLD_RIVAL_CITY_MAP_ASSETS = [
  "./assets/world/npc-city-map-1.png",
  "./assets/world/npc-city-map-2.png",
  "./assets/world/npc-city-map-3.png",
];
const WORLD_RIVAL_CITY_PREFIXES = ["Moretti", "Falcone", "Barzini", "Luchese", "Costello", "Romano", "Vespucci", "Belladonna"];
const WORLD_RIVAL_CITY_SUFFIXES = ["rakpart", "telep", "negyed", "erod", "tanya", "kapu", "sarok", "udvar"];
const WORLD_RIVAL_CITY_THEME_DEFS = [
  {
    id: "uptown",
    label: "Poros utca",
    bossTitle: "Falusi fonok",
    mapImage: WORLD_RIVAL_CITY_MAP_ASSETS[0],
    structures: [
      { id: "hall", name: "Fonoki haz", type: "hq", x: 73, y: 27, maxHp: 150, rewardMoney: 72, rewardXp: 7 },
      { id: "store", name: "Kis bolt", type: "vault", x: 24, y: 28, maxHp: 98, rewardMoney: 42, rewardXp: 4 },
      { id: "tower", name: "Figyelohaz", type: "watch", x: 14, y: 28, maxHp: 92, rewardMoney: 38, rewardXp: 4 },
      { id: "safehouse", name: "Menedekhaz", type: "safe", x: 15, y: 56, maxHp: 102, rewardMoney: 44, rewardXp: 4 },
      { id: "garage", name: "Kocsiudvar", type: "garage", x: 82, y: 56, maxHp: 96, rewardMoney: 40, rewardXp: 4 },
      { id: "barn", name: "Magtar", type: "yard", x: 42, y: 80, maxHp: 88, rewardMoney: 36, rewardXp: 3 },
      { id: "shed", name: "Hatso sufnisor", type: "safe", x: 43, y: 19, maxHp: 84, rewardMoney: 34, rewardXp: 3 },
      { id: "mill", name: "Malomudvar", type: "yard", x: 79, y: 68, maxHp: 94, rewardMoney: 39, rewardXp: 4 },
    ],
  },
  {
    id: "docklands",
    label: "Kis rakparti falu",
    bossTitle: "Rakparti fonok",
    mapImage: WORLD_RIVAL_CITY_MAP_ASSETS[1],
    structures: [
      { id: "dock-office", name: "Rakparti haz", type: "hq", x: 51, y: 22, maxHp: 148, rewardMoney: 70, rewardXp: 7 },
      { id: "fish-yard", name: "Haludvar", type: "yard", x: 18, y: 30, maxHp: 92, rewardMoney: 38, rewardXp: 4 },
      { id: "customs", name: "Parti figyelo", type: "watch", x: 11, y: 62, maxHp: 102, rewardMoney: 42, rewardXp: 4 },
      { id: "warehouse", name: "Kis raktar", type: "vault", x: 84, y: 30, maxHp: 110, rewardMoney: 46, rewardXp: 5 },
      { id: "speak", name: "Parti kocsma", type: "safe", x: 34, y: 65, maxHp: 94, rewardMoney: 36, rewardXp: 4 },
      { id: "garage", name: "Csónakbeallo", type: "garage", x: 72, y: 80, maxHp: 90, rewardMoney: 34, rewardXp: 4 },
      { id: "hut", name: "Halaszkunyho", type: "safe", x: 86, y: 56, maxHp: 82, rewardMoney: 30, rewardXp: 3 },
      { id: "shed", name: "Nettarolo", type: "yard", x: 7, y: 70, maxHp: 86, rewardMoney: 32, rewardXp: 3 },
    ],
  },
  {
    id: "industrial",
    label: "Poros szeli telep",
    bossTitle: "Telepi fonok",
    mapImage: WORLD_RIVAL_CITY_MAP_ASSETS[2],
    structures: [
      { id: "factory", name: "Fonoki udvar", type: "hq", x: 74, y: 20, maxHp: 154, rewardMoney: 72, rewardXp: 7 },
      { id: "foundry", name: "Szenraktar", type: "vault", x: 18, y: 24, maxHp: 100, rewardMoney: 44, rewardXp: 4 },
      { id: "checkpoint", name: "Sorompohaz", type: "watch", x: 43, y: 16, maxHp: 96, rewardMoney: 40, rewardXp: 4 },
      { id: "barracks", name: "Munkashaz", type: "safe", x: 13, y: 50, maxHp: 98, rewardMoney: 42, rewardXp: 4 },
      { id: "depot", name: "Udvari depo", type: "yard", x: 49, y: 69, maxHp: 94, rewardMoney: 40, rewardXp: 4 },
      { id: "motorpool", name: "Kocsiol", type: "garage", x: 77, y: 53, maxHp: 88, rewardMoney: 36, rewardXp: 3 },
      { id: "hut", name: "Kis kunyho", type: "safe", x: 21, y: 79, maxHp: 80, rewardMoney: 30, rewardXp: 3 },
      { id: "yard", name: "Faszin", type: "yard", x: 66, y: 82, maxHp: 84, rewardMoney: 32, rewardXp: 3 },
    ],
  },
];

function toWorldMapColumnLabel(index) {
  let current = Math.max(1, Math.round(index));
  let label = "";
  while (current > 0) {
    current -= 1;
    label = String.fromCharCode(65 + (current % 26)) + label;
    current = Math.floor(current / 26);
  }
  return label;
}

function buildWorldMapLotDefs() {
  const defs = [];
  for (let tileRow = 0; tileRow < WORLD_MAP_TILE_ROWS; tileRow += 1) {
    for (let tileCol = 0; tileCol < WORLD_MAP_TILE_COLS; tileCol += 1) {
      WORLD_MAP_LOT_ROWS.forEach((row, rowIndex) => {
        row.xs.forEach((x, colIndex) => {
          const globalCol = tileCol * WORLD_MAP_CODE_COLUMNS_PER_TILE + colIndex + 1;
          const globalRow = tileRow * WORLD_MAP_LOT_ROWS.length + rowIndex + 1;
          const code = `${toWorldMapColumnLabel(globalCol)}${globalRow}`;
          const coordX = String(tileCol * 100 + Math.round(x)).padStart(3, "0");
          const coordY = String(tileRow * 100 + Math.round(row.y)).padStart(3, "0");
          defs.push({
            id: `world-lot-${code.toLowerCase()}`,
            code,
            coord: `${coordX}:${coordY}`,
            x: tileCol * WORLD_MAP_TILE_WIDTH + ((x / 100) * WORLD_MAP_TILE_WIDTH),
            y: tileRow * WORLD_MAP_TILE_HEIGHT + ((row.y / 100) * WORLD_MAP_TILE_HEIGHT),
          });
        });
      });
    }
  }
  return defs;
}

function getWorldMapCanvasMetrics() {
  return {
    width: WORLD_MAP_TILE_WIDTH * WORLD_MAP_TILE_COLS,
    height: WORLD_MAP_TILE_HEIGHT * WORLD_MAP_TILE_ROWS,
  };
}

function getWorldLotHouseAsset(level = 1, seed = "") {
  const normalizedLevel = clamp(Math.round(Number(level) || 1), 1, 3);
  const variants = WORLD_BASE_HOUSE_VARIANTS[normalizedLevel] || WORLD_BASE_HOUSE_VARIANTS[1];
  if (!variants?.length) return lotHouseLevelDefs[normalizedLevel]?.asset || lotHouseLevelDefs[1].asset;
  const key = String(seed || normalizedLevel);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = ((hash * 31) + key.charCodeAt(index)) >>> 0;
  }
  return variants[hash % variants.length];
}

function getWorldLotHouseLevel(owner = null) {
  if (!owner) return 1;
  return clamp(Math.round(Number(owner.worldBaseLevel) || 1), 1, 3);
}

function getWorldLotStatusText(owner, isOwn) {
  if (owner && !isOwn) return `${owner.profileName} mar lefoglalta ezt a telket.`;
  if (isOwn) return "Ez a sajat varosod helye.";
  return "Szabad telek. Innen indulhat egy uj jatekos birodalma.";
}

function getWorldLotMetaText(owner, isOwn) {
  if (owner && !isOwn) return `Allapot: foglalt${owner.worldBaseLevel ? ` | Bazisszint: ${owner.worldBaseLevel}` : ""}`;
  if (isOwn) return `Allapot: a tied | Bazisszint: ${clamp(Math.round(Number(state.worldBaseLevel) || 1), 1, 3)}`;
  return "Allapot: ures telek";
}

function buildWorldMapLotButton(lot, owner, selectionMode) {
  const isOwn = owner?.profileName === state.profileName;
  const isOccupied = Boolean(owner);
  const level = getWorldLotHouseLevel(owner);
  const houseAsset = getWorldLotHouseAsset(level, `${owner?.profileName || lot.id}-${lot.id}`);
  const label = owner?.profileName || `${lot.code} / ${lot.coord}`;
  return `
    <button
      class="worldmap__lot${isOccupied ? " is-occupied" : " is-free"}${isOwn ? " is-own" : ""}"
      type="button"
      data-world-lot="${lot.id}"
      data-world-code="${lot.code}"
      data-world-coord="${lot.coord}"
      data-world-label="${escapeHtml(label)}"
      data-world-x="${lot.x}"
      data-world-y="${lot.y}"
      style="left:${lot.x}px; top:${lot.y}px"
      ${selectionMode && isOccupied && !isOwn ? "disabled" : ""}
      title="${escapeHtml(label)}"
      aria-label="${escapeHtml(owner?.profileName || `${lot.code} ${lot.coord} - ures telek`)}">
      ${isOccupied ? `<img class="worldmap__house worldmap__house--level-${level}" src="${houseAsset}" alt="" aria-hidden="true">` : ""}
      <i></i>
    </button>
  `;
}

function buildWorldMapSelectionBar(ownLot, selectionMode) {
  if (!selectionMode) return "";
  return `
    <div class="worldmap__selectionbar">
      <div class="worldmap__selectioncopy">
        <strong id="worldMapLotTitle">${ownLot ? `${ownLot.code} / ${ownLot.coord}` : "Nincs kijelolt telek"}</strong>
        <div id="worldMapLotMeta" class="worldmap__meta">${ownLot ? `Allapot: a tied | Bazisszint: ${clamp(Math.round(Number(state.worldBaseLevel) || 1), 1, 3)}` : "Allapot: ures telek"}</div>
      </div>
      <div class="worldmap__searchrow worldmap__searchrow--selection">
        <input id="worldMapSearch" type="text" placeholder="Jatekosnev, C2 vagy 46:28" autocomplete="off" aria-label="Jatekos vagy telek keresese">
        <button id="worldMapSearchBtn" type="button">Kereses</button>
      </div>
      <button id="worldMapChooseBtn" class="worldmap__choose" type="button" disabled>Ez lesz a falum</button>
    </div>
  `;
}

const worldMapLotDefs = buildWorldMapLotDefs();

function worldRivalSeedFromText(value = "") {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash * 33) + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getWorldRivalCityAsset(index = 0) {
  return WORLD_RIVAL_CITY_ASSETS[Math.abs(Math.round(index)) % WORLD_RIVAL_CITY_ASSETS.length] || WORLD_RIVAL_CITY_ASSETS[0];
}

function getWorldRivalCityTheme(index = 0) {
  return WORLD_RIVAL_CITY_THEME_DEFS[Math.abs(Math.round(index)) % WORLD_RIVAL_CITY_THEME_DEFS.length] || WORLD_RIVAL_CITY_THEME_DEFS[0];
}

function buildWorldRivalCityName(seed = "") {
  const numericSeed = worldRivalSeedFromText(seed || state.profileName || "rival-city");
  const prefix = WORLD_RIVAL_CITY_PREFIXES[numericSeed % WORLD_RIVAL_CITY_PREFIXES.length];
  const suffix = WORLD_RIVAL_CITY_SUFFIXES[Math.floor(numericSeed / 7) % WORLD_RIVAL_CITY_SUFFIXES.length];
  return `${prefix} ${suffix}`;
}

function buildWorldRivalCityStructures(assetIndex = 0, level = 1, seed = "") {
  const theme = getWorldRivalCityTheme(assetIndex);
  const baseSeed = worldRivalSeedFromText(`${seed}-${theme.id}-${level}`);
  const structureCount = level <= 1 ? 4 : level === 2 ? 6 : 8;
  return (theme.structures || []).slice(0, structureCount).map((entry, index) => {
    const variance = ((baseSeed >> (index % 8)) % 17) - 8;
    const specialization = ((baseSeed >> ((index + 3) % 12)) & 1) === 0 ? "attack" : "defense";
    const baseMaxHp = Math.max(72, Math.round((Number(entry.maxHp) || 100) + level * 18 + variance));
    const baseAttack = Math.max(18, Math.round(24 + level * 10 + Math.abs(variance) * 0.7));
    const baseDefense = Math.max(18, Math.round(22 + level * 11 + Math.abs(variance) * 0.6));
    const maxHp = Math.round(baseMaxHp * (specialization === "attack" ? 0.84 : 1.12));
    return {
      id: `${theme.id}-${entry.id}`,
      name: entry.name,
      type: entry.type || "safe",
      x: Number(entry.x) || 50,
      y: Number(entry.y) || 50,
      maxHp,
      hp: maxHp,
      baseMaxHp,
      specialization,
      attack: Math.round(baseAttack * (specialization === "attack" ? 1.28 : 0.88)),
      defense: Math.round(baseDefense * (specialization === "defense" ? 1.3 : 0.84)),
      rewardMoney: Math.max(26, Math.round((Number(entry.rewardMoney) || 40) + level * 10 + Math.abs(variance))),
      rewardXp: Math.max(3, Math.round((Number(entry.rewardXp) || 4) + level * 2)),
      destroyedAt: 0,
      lastHitAt: 0,
    };
  });
}

function normalizeWorldRivalStructure(structure, city, index = 0) {
  if (!structure || typeof structure !== "object") return null;
  const citySeed = `${city?.id || "city"}-${city?.assetIndex || 0}`;
  const fallback = buildWorldRivalCityStructures(city?.assetIndex || 0, city?.level || 1, citySeed)[index];
  const specialization = structure.specialization === "attack" || structure.specialization === "defense"
    ? structure.specialization
    : (worldRivalSeedFromText(`${citySeed}-${structure.id || index}`) % 2 === 0 ? "attack" : "defense");
  const baseMaxHp = Math.max(60, Math.round(Number(structure.baseMaxHp) || Number(fallback?.baseMaxHp) || Number(structure.maxHp) || 100));
  const maxHp = Math.max(60, Math.round(Number(structure.maxHp) || Number(fallback?.maxHp) || baseMaxHp));
  const rawHp = Number(structure.hp);
  const hp = clamp(Math.round(Number.isFinite(rawHp) ? rawHp : maxHp), 0, maxHp);
  return {
    id: String(structure.id || fallback?.id || `structure-${index}`),
    name: String(structure.name || fallback?.name || `Haz ${index + 1}`),
    type: String(structure.type || fallback?.type || "safe"),
    x: clamp(Number(structure.x) || Number(fallback?.x) || 50, 4, 96),
    y: clamp(Number(structure.y) || Number(fallback?.y) || 50, 6, 94),
    maxHp,
    hp,
    baseMaxHp,
    specialization,
    attack: Math.max(8, Math.round(Number(structure.attack) || Number(fallback?.attack) || (22 + (city?.level || 1) * 10))),
    defense: Math.max(8, Math.round(Number(structure.defense) || Number(fallback?.defense) || (22 + (city?.level || 1) * 10))),
    rewardMoney: Math.max(20, Math.round(Number(structure.rewardMoney) || Number(fallback?.rewardMoney) || 40)),
    rewardXp: Math.max(2, Math.round(Number(structure.rewardXp) || Number(fallback?.rewardXp) || 4)),
    destroyedAt: Number.isFinite(Number(structure.destroyedAt)) ? Number(structure.destroyedAt) : (hp <= 0 ? Date.now() : 0),
    lastHitAt: Number.isFinite(Number(structure.lastHitAt)) ? Number(structure.lastHitAt) : 0,
    repairStartedAt: Number.isFinite(Number(structure.repairStartedAt)) ? Number(structure.repairStartedAt) : 0,
    repairReadyAt: Number.isFinite(Number(structure.repairReadyAt)) ? Number(structure.repairReadyAt) : 0,
    pendingSpecialization: structure.pendingSpecialization === "attack" || structure.pendingSpecialization === "defense"
      ? structure.pendingSpecialization
      : "",
  };
}

function normalizeWorldRivalCity(entry, index = 0) {
  const lot = getWorldMapLotById(entry?.lotId);
  if (!lot) return null;
  const status = entry?.status === "captured" ? "captured" : "hostile";
  const level = clamp(Math.round(Number(entry?.level) || 1), 1, 3);
  const assetIndex = Math.abs(Math.round(Number(entry?.assetIndex) || index)) % WORLD_RIVAL_CITY_ASSETS.length;
  const theme = getWorldRivalCityTheme(assetIndex);
  const power = Math.max(24, Math.round(Number(entry?.power) || (68 + level * 24)));
  const rewardMoney = Math.max(80, Math.round(Number(entry?.rewardMoney) || (150 + level * 95)));
  const rewardXp = Math.max(12, Math.round(Number(entry?.rewardXp) || (20 + level * 11)));
  const rawTributeMoney = Number(entry?.tributeMoney);
  const tributeMoney = clamp(Math.round(Number.isFinite(rawTributeMoney) ? rawTributeMoney : 0), 0, 1000);
  const tributeTargetMoney = clamp(Math.round(Number(entry?.tributeTargetMoney) || rawTributeMoney || randomInt(500, 1000)), 500, 1000);
  const structuresSource = Array.isArray(entry?.structures) && entry.structures.length
    ? entry.structures
    : buildWorldRivalCityStructures(assetIndex, level, `${lot.id}-${index}`);
  const skeletonCity = {
    id: typeof entry?.id === "string" ? entry.id : `world-rival-${lot.id}-${index}`,
    assetIndex,
    level,
  };
  const structures = structuresSource
    .map((structure, structureIndex) => normalizeWorldRivalStructure(structure, skeletonCity, structureIndex))
    .filter(Boolean);
  const capturedAt = Number.isFinite(Number(entry?.capturedAt)) ? Number(entry.capturedAt) : 0;
  const tributeReadyAt = Number.isFinite(Number(entry?.tributeReadyAt)) ? Number(entry.tributeReadyAt) : 0;
  const tributeCycleStartedAt = Number.isFinite(Number(entry?.tributeCycleStartedAt)) && Number(entry.tributeCycleStartedAt) > 0
    ? Number(entry.tributeCycleStartedAt)
    : (tributeReadyAt > 0 ? tributeReadyAt - WORLD_RIVAL_CITY_TRIBUTE_MS : capturedAt);
  const protectionUntil = Number.isFinite(Number(entry?.protectionUntil)) && Number(entry.protectionUntil) > 0
    ? Number(entry.protectionUntil)
    : (status === "captured" && capturedAt > 0 ? capturedAt + WORLD_RIVAL_CITY_PROTECTION_MS : 0);
  return {
    id: typeof entry?.id === "string" ? entry.id : `world-rival-${lot.id}-${index}`,
    lotId: lot.id,
    name: typeof entry?.name === "string" && entry.name.trim() ? entry.name.trim() : buildWorldRivalCityName(`${lot.id}-${index}`),
    status,
    level,
    power,
    rewardMoney,
    rewardXp,
    tributeMoney,
    tributeTargetMoney,
    weakened: Boolean(entry?.weakened),
    assetIndex,
    themeId: String(entry?.themeId || theme.id),
    districtLabel: String(entry?.districtLabel || theme.label),
    bossTitle: String(entry?.bossTitle || theme.bossTitle),
    mapImage: String(entry?.mapImage || theme.mapImage || WORLD_RIVAL_CITY_MAP_ASSETS[0]),
    structures,
    createdAt: Number.isFinite(Number(entry?.createdAt)) ? Number(entry.createdAt) : Date.now(),
    tributeReadyAt,
    tributeCycleStartedAt,
    capturedAt,
    protectionUntil,
    ownerProfileName: typeof entry?.ownerProfileName === "string" && entry.ownerProfileName
      ? entry.ownerProfileName
      : (status === "captured" ? state.profileName : ""),
    lastAttackAt: Number.isFinite(Number(entry?.lastAttackAt)) ? Number(entry.lastAttackAt) : 0,
    attackCooldownUntil: Number.isFinite(Number(entry?.attackCooldownUntil)) ? Number(entry.attackCooldownUntil) : 0,
    lastCaptureAt: Number.isFinite(Number(entry?.lastCaptureAt)) ? Number(entry.lastCaptureAt) : 0,
  };
}

function normalizeWorldRivalCities(source) {
  const normalized = (Array.isArray(source) ? source : [])
    .map((entry, index) => normalizeWorldRivalCity(entry, index))
    .filter(Boolean);
  const seenIds = new Set();
  const seenLots = new Set();
  return normalized.filter((entry) => {
    if (seenIds.has(entry.id) || seenLots.has(entry.lotId)) return false;
    seenIds.add(entry.id);
    seenLots.add(entry.lotId);
    return true;
  });
}

function createWorldRivalCityForLot(lot, usedCount = 0, now = Date.now()) {
  const baseSeed = worldRivalSeedFromText(`${state.profileName}-${lot.id}-${usedCount}-${state.cityLevel}`);
  const level = clamp(1 + (baseSeed % 3), 1, 3);
  const assetIndex = baseSeed % WORLD_RIVAL_CITY_ASSETS.length;
  const theme = getWorldRivalCityTheme(assetIndex);
  return normalizeWorldRivalCity({
    id: `world-rival-${lot.id}-${baseSeed.toString(36).slice(0, 6)}`,
    lotId: lot.id,
    name: buildWorldRivalCityName(`${lot.id}-${baseSeed}`),
    status: "hostile",
    level,
    power: 64 + level * 24 + Math.round((baseSeed % 31) * 1.7) + state.cityLevel * 6,
    rewardMoney: 140 + level * 110 + (baseSeed % 60),
    rewardXp: 18 + level * 14 + (baseSeed % 10),
    tributeMoney: 0,
    tributeTargetMoney: 500 + (baseSeed % 501),
    weakened: false,
    assetIndex,
    themeId: theme.id,
    districtLabel: theme.label,
    bossTitle: theme.bossTitle,
    mapImage: theme.mapImage,
    structures: buildWorldRivalCityStructures(assetIndex, level, `${lot.id}-${baseSeed}`),
    createdAt: now,
    tributeReadyAt: 0,
    tributeCycleStartedAt: 0,
    capturedAt: 0,
    protectionUntil: 0,
    ownerProfileName: "",
    lastAttackAt: 0,
    attackCooldownUntil: 0,
    lastCaptureAt: 0,
  }, usedCount);
}

function getDesiredWorldRivalCityCount() {
  return clamp(
    WORLD_RIVAL_CITY_BASE_COUNT + Math.max(0, state.cityLevel - 1) * 2,
    WORLD_RIVAL_CITY_BASE_COUNT,
    WORLD_RIVAL_CITY_MAX_COUNT,
  );
}

function syncWorldRivalCities(occupiedLots = {}, now = Date.now()) {
  const cities = normalizeWorldRivalCities(state.worldRivalCities);
  const blockedLots = new Set([
    ...Object.keys(occupiedLots || {}),
    ...(state.worldBaseLotId ? [state.worldBaseLotId] : []),
  ]);
  const output = [];
  const usedLots = new Set();
  cities.forEach((city) => {
    const lot = getWorldMapLotById(city.lotId);
    if (!lot) return;
    if (city.status !== "captured" && blockedLots.has(city.lotId)) return;
    if (usedLots.has(city.lotId)) return;
    output.push(city);
    usedLots.add(city.lotId);
  });
  const desiredHostiles = getDesiredWorldRivalCityCount();
  let hostileCount = output.filter((city) => city.status === "hostile").length;
  const availableLots = worldMapLotDefs.filter((lot) => !blockedLots.has(lot.id) && !usedLots.has(lot.id));
  const baseLot = getWorldMapLotById(state.worldBaseLotId) || worldMapLotDefs[Math.floor(worldMapLotDefs.length / 2)];
  if (baseLot && availableLots.length) {
    const nearbyLots = [...availableLots].sort((left, right) => {
      const leftDistance = Math.hypot(left.x - baseLot.x, left.y - baseLot.y);
      const rightDistance = Math.hypot(right.x - baseLot.x, right.y - baseLot.y);
      return leftDistance - rightDistance;
    });
    const nearHostileCount = output.filter((city) => {
      if (city.status !== "hostile") return false;
      const lot = getWorldMapLotById(city.lotId);
      if (!lot) return false;
      return Math.hypot(lot.x - baseLot.x, lot.y - baseLot.y) <= WORLD_MAP_TILE_WIDTH * 1.35;
    }).length;
    let missingNear = Math.max(0, WORLD_RIVAL_CITY_NEAR_BASE_COUNT - nearHostileCount);
    while (missingNear > 0 && hostileCount >= WORLD_RIVAL_CITY_MAX_COUNT) {
      let farthestIndex = -1;
      let farthestDistance = WORLD_MAP_TILE_WIDTH * 1.35;
      output.forEach((city, index) => {
        if (city.status !== "hostile") return;
        const lot = getWorldMapLotById(city.lotId);
        if (!lot) return;
        const distance = Math.hypot(lot.x - baseLot.x, lot.y - baseLot.y);
        if (distance > farthestDistance) {
          farthestDistance = distance;
          farthestIndex = index;
        }
      });
      if (farthestIndex < 0) break;
      const [removedCity] = output.splice(farthestIndex, 1);
      usedLots.delete(removedCity.lotId);
      hostileCount -= 1;
    }
    while (missingNear > 0 && hostileCount < WORLD_RIVAL_CITY_MAX_COUNT && nearbyLots.length) {
      const lot = nearbyLots.shift();
      const availableIndex = availableLots.findIndex((entry) => entry.id === lot.id);
      if (availableIndex >= 0) availableLots.splice(availableIndex, 1);
      if (!lot || usedLots.has(lot.id) || blockedLots.has(lot.id)) continue;
      const city = createWorldRivalCityForLot(lot, output.length, now);
      output.push(city);
      usedLots.add(lot.id);
      hostileCount += 1;
      missingNear -= 1;
    }
  }
  while (hostileCount < desiredHostiles && availableLots.length) {
    const nextIndex = worldRivalSeedFromText(`${state.profileName}-${hostileCount}-${now}-${availableLots.length}`) % availableLots.length;
    const [lot] = availableLots.splice(nextIndex, 1);
    if (!lot) break;
    const city = createWorldRivalCityForLot(lot, output.length, now);
    output.push(city);
    usedLots.add(lot.id);
    hostileCount += 1;
  }
  state.worldRivalCities = output;
  return output;
}

function getWorldRivalCityById(cityId) {
  return normalizeWorldRivalCities(state.worldRivalCities).find((city) => city.id === cityId) || null;
}

function getWorldRivalRemainingStructures(city) {
  return (Array.isArray(city?.structures) ? city.structures : []).filter((structure) => Number(structure.hp) > 0);
}

function areWorldRivalStructuresCleared(city) {
  return getWorldRivalRemainingStructures(city).length === 0;
}

function getWorldRivalStructureById(city, structureId) {
  return (Array.isArray(city?.structures) ? city.structures : []).find((structure) => structure.id === structureId) || null;
}

function getWorldRivalCityTotalHp(city) {
  return (Array.isArray(city?.structures) ? city.structures : []).reduce((sum, structure) => sum + Math.max(0, Number(structure.maxHp) || 0), 0);
}

function getWorldRivalCityCurrentHp(city) {
  return (Array.isArray(city?.structures) ? city.structures : []).reduce((sum, structure) => sum + Math.max(0, Number(structure.hp) || 0), 0);
}

function getWorldRivalCityStatusText(city) {
  if (!city) return "";
  const remaining = getWorldRivalRemainingStructures(city).length;
  if (city.status === "captured") {
    const incomeState = getWorldRivalIncomeState(city);
    return `Elfoglalt falud. Bevetel: ${incomeState.money} $. Beszedes: ${incomeState.ready ? "most" : formatWorldRivalHoursMinutes(incomeState.remainingMs)}. Vedelem: ${formatWorldRivalProtectionTime(city.protectionUntil)}. Felujitott hazak: ${remaining}.`;
  }
  if (remaining === 0) return "A rivalis falu vedelme osszeomlott. Most mar megnyithatod az elfoglalast.";
  if (city.weakened) return `Megroppant rivalis falu. Meg ${remaining} epulete all.`;
  return `Rivalis banda faluja. Meg ${remaining} haz all benne, ezeket le kell bontanod az elfoglalas elott.`;
}

function formatWorldRivalTributeTime(timestamp) {
  if (!timestamp || timestamp <= Date.now()) return "most";
  return formatWorldRivalHoursMinutes(timestamp - Date.now());
}

function formatWorldRivalProtectionTime(timestamp) {
  if (!timestamp || timestamp <= Date.now()) return "lejart";
  return formatWorldRivalHoursMinutes(timestamp - Date.now());
}

function formatWorldRivalHoursMinutes(milliseconds) {
  const totalMinutes = Math.max(0, Math.ceil(Number(milliseconds) / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ora ${minutes} perc`;
}

function getWorldRivalIncomeState(city, now = Date.now()) {
  const targetMoney = clamp(Math.round(Number(city?.tributeTargetMoney) || 500), 500, 1000);
  const readyAt = Number(city?.tributeReadyAt) || 0;
  const startedAt = Number(city?.tributeCycleStartedAt) || Math.max(0, readyAt - WORLD_RIVAL_CITY_TRIBUTE_MS);
  const duration = Math.max(1, readyAt - startedAt || WORLD_RIVAL_CITY_TRIBUTE_MS);
  const progress = readyAt > 0 ? clamp((now - startedAt) / duration, 0, 1) : 0;
  return {
    money: Math.round(targetMoney * progress),
    targetMoney,
    readyAt,
    remainingMs: Math.max(0, readyAt - now),
    ready: readyAt > 0 && readyAt <= now,
  };
}

function getWorldRivalStructureSpecializationLabel(specialization = "") {
  return specialization === "attack" ? "Ero" : "Vedelem";
}

function getWorldRivalStructureRepairCost(city, structure) {
  const baseCost = 24 + Math.max(1, Number(city?.level) || 1) * 12;
  return Math.max(30, Math.round(baseCost + (Number(structure?.baseMaxHp) || 80) * 0.08));
}

function getWorldRivalStructureRepairStats(city, structure, specialization) {
  const normalizedSpecialization = specialization === "attack" ? "attack" : "defense";
  const baseMaxHp = Math.max(60, Math.round(Number(structure?.baseMaxHp) || Number(structure?.maxHp) || 90));
  const baseAttack = Math.max(18, Math.round(24 + (Number(city?.level) || 1) * 11 + baseMaxHp * 0.08));
  const baseDefense = Math.max(18, Math.round(23 + (Number(city?.level) || 1) * 11 + baseMaxHp * 0.08));
  return {
    baseMaxHp,
    maxHp: Math.round(baseMaxHp * (normalizedSpecialization === "attack" ? 0.82 : 1.14)),
    attack: Math.round(baseAttack * (normalizedSpecialization === "attack" ? 1.3 : 0.86)),
    defense: Math.round(baseDefense * (normalizedSpecialization === "defense" ? 1.32 : 0.82)),
    specialization: normalizedSpecialization,
  };
}

function isWorldRivalStructureRepairing(structure, now = Date.now()) {
  return Number(structure?.hp) <= 0 && Number(structure?.repairReadyAt) > now;
}

function syncWorldRivalStructureRepairs(now = Date.now()) {
  let changed = false;
  const completedNames = [];
  state.worldRivalCities = normalizeWorldRivalCities(state.worldRivalCities).map((city, cityIndex) => {
    if (city.status !== "captured") return city;
    let cityChanged = false;
    const structures = (city.structures || []).map((structure) => {
      if (Number(structure.hp) > 0 || !Number(structure.repairReadyAt) || Number(structure.repairReadyAt) > now) return structure;
      const stats = getWorldRivalStructureRepairStats(city, structure, structure.pendingSpecialization || structure.specialization);
      cityChanged = true;
      changed = true;
      completedNames.push(`${city.name}: ${structure.name}`);
      return {
        ...structure,
        ...stats,
        hp: stats.maxHp,
        destroyedAt: 0,
        repairStartedAt: 0,
        repairReadyAt: 0,
        pendingSpecialization: "",
      };
    });
    return cityChanged ? (normalizeWorldRivalCity({ ...city, structures }, cityIndex) || city) : city;
  });
  completedNames.forEach((name) => addLocalNotification(
    "Falufelujitas kesz",
    `${name} felujitasa befejezodott.`,
    { messageType: "event" },
  ));
  if (completedNames.length) sceneRef?.setMessage(`${completedNames[completedNames.length - 1]} felujitasa elkeszult.`);
  return changed;
}

function getWorldRivalVillageStats(city) {
  return (Array.isArray(city?.structures) ? city.structures : []).reduce((totals, structure) => {
    if (Number(structure.hp) <= 0) return totals;
    totals.attack += Math.max(0, Math.round(Number(structure.attack) || 0));
    totals.defense += Math.max(0, Math.round(Number(structure.defense) || 0));
    return totals;
  }, { attack: 0, defense: 0 });
}

function getWorldRivalAttackChance(city) {
  const mapPower = getActionPower("map");
  const structurePressure = Math.round(getWorldRivalRemainingStructures(city).length * 7);
  const targetPower = Math.max(1, city.power + structurePressure - (city.weakened ? 18 : 0));
  return clamp(0.24 + ((mapPower - targetPower) / 260), 0.16, 0.93);
}

function getWorldRivalCaptureChance(city) {
  const mapPower = getActionPower("map");
  const structurePenalty = getWorldRivalRemainingStructures(city).length * 18;
  const clearedBonus = areWorldRivalStructuresCleared(city) ? 34 : 0;
  const targetPower = Math.max(1, city.power + city.level * 20 + structurePenalty - (city.weakened ? 28 : 0) - clearedBonus);
  return clamp(0.16 + ((mapPower - targetPower) / 280), 0.08, 0.88);
}

function buildWorldRivalCityButton(city) {
  const lot = getWorldMapLotById(city?.lotId);
  if (!lot || !city) return "";
  const remaining = getWorldRivalRemainingStructures(city).length;
  const label = `${city.name} | ${city.status === "captured" ? "elfoglalt" : "rivalis"} falu | ${remaining} haz`;
  return `
    <button
      class="worldmap__rival-city worldmap__rival-city--${city.status}${city.weakened ? " is-weakened" : ""}"
      type="button"
      data-world-rival="${city.id}"
      data-world-rival-lot="${lot.id}"
      data-world-label="${escapeHtml(city.name)}"
      data-world-x="${lot.x}"
      data-world-y="${lot.y}"
      style="left:${lot.x}px; top:${lot.y}px"
      aria-label="${escapeHtml(label)}">
      <img class="worldmap__rival-city-art worldmap__rival-city-art--level-${city.level}" src="${getWorldRivalCityAsset(city.assetIndex)}" alt="" aria-hidden="true">
      <span class="worldmap__rival-city-badge">${city.status === "captured" ? "S" : "R"}</span>
    </button>
  `;
}

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

const equipmentCatalog = {
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

function mapPolygon(points) {
  return points.map(([x, y]) => [x / 1534, y / 1025]);
}

const cityBuildingDefs = [
  { id: "north-estate", number: "02", districtIndex: 4, name: "Foepulet", mode: "shop", polygon: mapPolygon([[795,39],[827,18],[850,20],[851,1],[901,13],[916,29],[949,38],[964,57],[970,108],[944,134],[896,148],[850,131],[811,108],[798,82]]), plot: mapPolygon([[716,55],[895,0],[1031,70],[1012,142],[870,176],[742,127]]) },
  { id: "west-tenement", number: "04", districtIndex: 0, name: "Belvarosi berhaz", mode: "street", polygon: mapPolygon([[133,256],[155,239],[171,241],[171,225],[198,230],[207,242],[239,249],[254,265],[254,316],[235,335],[188,346],[158,333],[135,313]]), plot: mapPolygon([[57,289],[184,226],[316,289],[307,356],[180,400],[79,352]]) },
  { id: "northwest-block", number: "05", districtIndex: 0, name: "Szurke sarokhaz", mode: "street", polygon: mapPolygon([[312,185],[342,159],[367,162],[369,145],[416,151],[425,164],[466,173],[482,190],[489,249],[465,272],[405,282],[363,269],[324,254]]), plot: mapPolygon([[287,192],[431,128],[573,192],[551,282],[419,328],[311,275]]) },
  { id: "dome-hall", number: "05", districtIndex: 1, name: "Kupolas csarnok", mode: "shop", polygon: mapPolygon([[464,252],[496,208],[519,203],[519,187],[570,170],[603,180],[608,195],[647,207],[663,230],[665,282],[646,317],[620,339],[568,362],[526,351],[487,328],[468,297]]), plot: mapPolygon([[430,273],[590,179],[732,246],[704,371],[566,430],[459,356]]) },
  { id: "market-row", number: "06", districtIndex: 1, name: "Piac sori uzlethaz", mode: "shop", polygon: mapPolygon([[837,281],[861,253],[875,253],[876,237],[915,229],[930,240],[967,247],[984,266],[984,321],[965,341],[921,357],[878,345],[845,326]]), plot: mapPolygon([[806,286],[950,217],[1080,278],[1052,373],[924,416],[832,357]]) },
  { id: "sale-block", number: "07", districtIndex: 4, name: "Villanegyedi tomb", mode: "shop", polygon: mapPolygon([[963,185],[990,164],[1005,165],[1006,146],[1050,151],[1060,164],[1097,173],[1110,191],[1110,253],[1093,274],[1045,289],[1000,277],[969,257]]), plot: mapPolygon([[944,213],[1070,146],[1194,208],[1170,291],[1051,336],[968,277]]) },
  { id: "east-small-block", number: "08", districtIndex: 1, name: "Keleti kis uzlethaz", mode: "shop", polygon: mapPolygon([[1116,259],[1138,242],[1150,244],[1150,229],[1173,232],[1180,241],[1195,248],[1205,260],[1205,314],[1190,330],[1161,341],[1133,332],[1119,315]]), plot: mapPolygon([[1083,276],[1160,238],[1230,275],[1215,335],[1148,360],[1095,325]]) },
  { id: "billboard-tower", number: "09", districtIndex: 2, name: "Luchese torony", mode: "shop", polygon: mapPolygon([[1228,204],[1254,178],[1270,180],[1271,154],[1310,142],[1331,151],[1334,165],[1368,177],[1385,197],[1398,285],[1391,359],[1371,401],[1335,428],[1292,414],[1253,389],[1235,350]]), plot: mapPolygon([[1172,260],[1330,157],[1470,226],[1433,454],[1301,497],[1201,414]]) },
  { id: "west-mid-block", number: "11", districtIndex: 0, name: "Nyugati sarokhaz", mode: "street", polygon: mapPolygon([[299,361],[328,333],[343,334],[344,314],[386,319],[398,332],[430,338],[443,357],[443,420],[421,442],[369,453],[331,438],[303,419]]), plot: mapPolygon([[268,378],[395,303],[522,370],[500,474],[376,516],[288,453]]) },
  { id: "mid-office", number: "12", districtIndex: 2, name: "Rakparti iroda", mode: "shop", polygon: mapPolygon([[655,370],[684,340],[700,339],[700,321],[738,311],[752,320],[785,327],[801,345],[806,410],[785,434],[744,450],[700,438],[663,417]]), plot: mapPolygon([[604,390],[746,302],[875,373],[852,482],[731,523],[632,455]]) },
  { id: "east-office", number: "13", districtIndex: 2, name: "Keleti uzlethaz", mode: "shop", polygon: mapPolygon([[982,405],[1011,375],[1027,376],[1028,357],[1072,363],[1084,375],[1124,383],[1142,403],[1143,463],[1122,485],[1074,500],[1030,487],[991,468]]), plot: mapPolygon([[947,426],[1080,341],[1215,410],[1190,517],[1062,562],[978,492]]) },
  { id: "central-bank", number: "16", districtIndex: 5, name: "Perem bankhaz", mode: "street", polygon: mapPolygon([[680,574],[711,536],[729,535],[730,512],[785,493],[813,501],[817,518],[855,529],[878,554],[886,629],[866,658],[813,681],[760,669],[716,642],[690,614]]), plot: mapPolygon([[697,578],[815,493],[947,561],[925,700],[800,739],[724,672]]) },
  { id: "southeast-block", number: "19", districtIndex: 2, name: "Delkeleti berhaz", mode: "shop", polygon: mapPolygon([[1359,574],[1387,541],[1404,542],[1405,522],[1448,512],[1464,523],[1501,531],[1519,551],[1521,634],[1500,657],[1454,674],[1410,661],[1370,640]]), plot: mapPolygon([[1265,626],[1397,525],[1534,592],[1501,752],[1403,787],[1298,721]]) },
  { id: "moretti-import", number: "20", districtIndex: 3, name: "Moretti import", mode: "street", polygon: mapPolygon([[96,615],[125,576],[147,575],[148,552],[215,531],[246,541],[249,558],[293,572],[325,604],[346,693],[334,743],[302,777],[239,800],[174,782],[123,751],[102,705]]), plot: mapPolygon([[82,646],[242,533],[396,614],[375,793],[219,841],[111,765]]) },
  { id: "southwest-tenement", number: "21", districtIndex: 3, name: "Gyarnegyedi haz", mode: "street", polygon: mapPolygon([[302,742],[329,713],[344,714],[345,696],[388,686],[403,697],[439,704],[456,724],[459,811],[438,833],[392,850],[349,838],[311,817]]), plot: mapPolygon([[239,820],[388,705],[532,778],[510,930],[358,971],[266,899]]) },
  { id: "courthouse", number: "23", districtIndex: 5, name: "Feher portikusz", mode: "street", polygon: mapPolygon([[997,665],[1026,632],[1043,633],[1044,615],[1086,606],[1102,617],[1138,624],[1156,644],[1158,709],[1137,731],[1091,748],[1048,736],[1008,716]]), plot: mapPolygon([[962,683],[1091,591],[1237,666],[1210,805],[1081,846],[990,776]]) },
];

const purchasableBuildingNumbers = new Set(["06", "11", "13", "16", "21", "23"]);
const clickableBuildingDefs = cityBuildingDefs.filter((building) => !purchasableBuildingNumbers.has(building.number));
const purchasableBuildingRestoreDefs = {
  "market-row": { asset: "./assets/map/purchasable-houses-v4/market-row.png", x: 803, y: 214, width: 281, height: 206 },
  "west-mid-block": { asset: "./assets/map/purchasable-houses-v4/west-mid-block.png", x: 265, y: 300, width: 261, height: 220 },
  "east-office": { asset: "./assets/map/purchasable-houses-v4/east-office.png", x: 944, y: 338, width: 275, height: 228 },
  "central-bank": { asset: "./assets/map/purchasable-houses-v4/central-bank.png", x: 694, y: 490, width: 257, height: 253 },
  "southwest-tenement": { asset: "./assets/map/purchasable-houses-v4/southwest-tenement.png", x: 236, y: 702, width: 300, height: 273 },
  "courthouse": { asset: "./assets/map/purchasable-houses-v4/courthouse.png", x: 959, y: 588, width: 282, height: 262 },
};

const clickableParkDefs = [
  { id: "northwest-park", number: "01", name: "Eszaknyugati park", kind: "park", polygon: mapPolygon([[557,116],[743,15],[897,94],[863,188],[710,231],[586,174]]) },
  { id: "northeast-park", number: "03", name: "Eszakkeleti park", kind: "park", polygon: mapPolygon([[1026,149],[1208,52],[1370,130],[1341,223],[1180,270],[1054,207]]) },
  { id: "west-park", number: "10", name: "Nyugati kozkert", kind: "park", polygon: mapPolygon([[0,435],[104,371],[247,443],[222,553],[92,596],[0,542]]) },
  { id: "central-west-park", number: "15", name: "Moretti ter", kind: "park", polygon: mapPolygon([[350,519],[506,431],[657,509],[624,606],[478,651],[379,587]]) },
  { id: "central-east-park", number: "17", name: "Kozponti diszkert", kind: "park", polygon: mapPolygon([[821,509],[971,422],[1125,500],[1092,600],[946,645],[847,579]]) },
  { id: "southwest-park", number: "25", name: "Deli haromszog park", kind: "park", polygon: mapPolygon([[373,974],[536,846],[714,948],[687,1011],[414,1010]]) },
  { id: "south-center-park", number: "26", name: "Deli szokokut park", kind: "park", polygon: mapPolygon([[693,832],[866,718],[1023,808],[988,914],[831,957],[723,893]]) },
  { id: "southeast-park", number: "26", name: "Keleti haromszog park", kind: "park", polygon: mapPolygon([[870,966],[1015,855],[1165,946],[1135,1008],[908,1009]]) },
];

const clickableLotDefs = [
  { id: "east-empty-lot", number: "14", name: "Keleti ures telek", kind: "lot", polygon: mapPolygon([[1162,554],[1250,488],[1340,540],[1315,616],[1232,641],[1175,603]]) },
  { id: "central-empty-lot", number: "22", name: "Kozponti ures telek", kind: "lot", polygon: mapPolygon([[477,675],[626,578],[776,659],[745,769],[607,812],[507,744]]) },
  { id: "southeast-empty-lot", number: "27", name: "Delkeleti ures telek", kind: "lot", polygon: mapPolygon([[1116,803],[1252,702],[1393,781],[1363,884],[1237,925],[1145,865]]) },
  ...cityBuildingDefs
    .filter((building) => purchasableBuildingNumbers.has(building.number))
    .map((building) => ({
      ...building,
      kind: "lot",
      name: `${building.name} telek`,
      polygon: building.plot,
      restoredHouseName: building.name,
      restoredHouse: true,
      restoredVisual: purchasableBuildingRestoreDefs[building.id],
      maxLevel: 1,
      purchaseCost: 80,
      privatePurchaseCost: 120,
      cityPurchaseCost: 80,
      passiveIncome: 24,
      income: 80,
      overlayNumberMarker: building.number === "13",
    })),
];

const lotHouseLevelDefs = {
  1: {
    name: "Kisbolti telekhaz",
    asset: "./assets/lot-house-level-1.png",
    income: 80,
    widthFactor: 0.56,
    heightFactor: 0.58,
    yOffset: 0.08,
  },
  2: {
    name: "Kavezos telekhaz",
    asset: "./assets/lot-house-level-2.png",
    income: 190,
    widthFactor: 0.62,
    heightFactor: 0.62,
    yOffset: 0.085,
  },
  3: {
    name: "Diszes viragboltos telekhaz",
    asset: "./assets/lot-house-level-3.png",
    income: 360,
    widthFactor: 0.66,
    heightFactor: 0.66,
    yOffset: 0.09,
  },
};

const LOT_HOUSE_TEXTURE_KEYS = {
  1: "lot-house-level-1",
  2: "lot-house-level-2",
  3: "lot-house-level-3",
};

const LOT_HOUSE_VISUALS_ENABLED = false;

const crewMemberTemplates = [
  { id: "luca", name: "Luca Moretti", role: "Végrehajtó", baseAttack: 12, baseDefense: 9, baseHealth: 100 },
  { id: "marco", name: "Marco Bellini", role: "Fegyveres", baseAttack: 15, baseDefense: 8, baseHealth: 88 },
  { id: "enzo", name: "Enzo Romano", role: "Megfigyelő", baseAttack: 10, baseDefense: 12, baseHealth: 112 },
];
const crewHireCosts = {
  luca: 155,
  marco: 700,
  enzo: 1500,
};

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

const backgroundMapFrame = {
  width: 1534,
  height: 1025,
  positionX: 0.5,
  positionY: 0.5,
};

const buildingHoverAdjustments = Object.fromEntries(
  clickableBuildingDefs.map((area) => [area.id, {
    dx: 0,
    dy: 0,
    scale: 1,
    clipScale: 0.995,
  }]),
);

const playerAvatarDefs = [
  { id: "boss", image: "./assets/character/player-avatar-boss.png" },
  { id: "lady", image: "./assets/character/player-avatar-lady.png" },
  { id: "enforcer", image: "./assets/character/player-avatar-enforcer.png" },
];
const legacyPlayerAvatarImage = "./assets/character/gangster-character.png";

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
  activeQuest: null,
  offeredQuests: [],
  activeQuests: [],
  selectedQuestSlot: 0,
  questNextSpawnAt: 0,
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
  rivalEvent: null,
  rivalNextSpawnAt: 0,
  mentorStep: 0,
  mentorCompleted: false,
  mentorFlags: { equippedItem: false, sawWorld: false, enteredHarbor: false },
  protectionCooldowns: {},
  recoveryEffects: { health: null, energy: null },
  naturalRecoveryAt: { health: Date.now(), energy: Date.now() },
  nextPolicePressureAt: 0,
  mainBaseClaimDay: 0,
  baseRestDay: 0,
  baseRestAvailableAt: 0,
  hideUsesToday: 0,
  hideUsesDay: 1,
  day: 1,
  cityLevel: 1,
  districts: [],
  selectedDistrictIndex: 0,
  registered: false,
};

let sceneRef = null;
let pendingSaveTimer = null;
let saveRequestInFlight = null;
let latestQueuedSave = null;
let pendingRewardModals = [];
let questCardQuestId = null;
let activeEquipmentSlot = null;
let selectedCraftItemKeys = [];
let recentlyCraftedItemKey = "";
let mentorCardOpen = false;
let mentorStepCompleting = false;
let garageMiniGameState = null;
let garageMiniGameTimer = null;
let mapPan = { x: 0, y: 0 };
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
const hudMentorToggle = document.getElementById("hudMentorToggle");
const hudMentorCard = document.getElementById("hudMentorCard");
const hudMentorClose = document.getElementById("hudMentorClose");
const hudMentorStepTitle = document.getElementById("hudMentorStepTitle");
const hudMentorStepText = document.getElementById("hudMentorStepText");
const hudMentorStepReward = document.getElementById("hudMentorStepReward");
const hudMentorProgress = document.getElementById("hudMentorProgress");
const hudLog = document.getElementById("hudLog");
const hudQuickRank = document.getElementById("hudQuickRank");
const hudQuickMarket = document.getElementById("hudQuickMarket");
const hudQuickClan = document.getElementById("hudQuickClan");
const hudQuickWorld = document.getElementById("hudQuickWorld");
const hudQuickMessages = document.getElementById("hudQuickMessages");
const hudMessageBadge = document.getElementById("hudMessageBadge");
const hudProcessTasks = document.getElementById("hudProcessTasks");
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
      <div class="hud-bar-row hud-bar-row--xp">
        <div class="hud-bar-text" id="avatarBar3Text">0 / 20 XP</div>
        <div class="hud-bar hud-bar--gold"><div class="hud-bar__fill" id="avatarBar3Fill"></div></div>
      </div>
    </div>
    <div class="hud-note" id="avatarNote">Regisztralj, es indul a varosi felemelkedes.</div>
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
    // A regi mentesekben megmaradt kep-utvonalak helyett mindig a jelenlegi ritkasagi assetet hasznaljuk.
    image: getEquipmentRarityImage(slot, rarity) || template.image || getEquipmentArt(slot),
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
    const savedItems = Array.isArray(source?.[slot]) ? source[slot] : [];
    const merged = new Map((savedItems.length ? [] : defaults[slot]).map((item) => [item.id, { ...item }]));
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

function normalizeMarketStock(source) {
  if (!Array.isArray(source)) return [];
  return source.map((entry) => {
    const slot = equipmentSlotOrder.includes(entry?.slot) ? entry.slot : null;
    if (!slot) return null;
    const item = normalizeEquipmentItem(slot, entry);
    if (!item) return null;
    return {
      slot,
      price: Number.isFinite(entry?.price) ? Math.max(1, Math.round(entry.price)) : getEquipmentRarityPrice(item.rarity, item.power),
      item,
    };
  }).filter(Boolean);
}

function generateMarketStock(seed = state.profileName || "market", refreshAt = Date.now()) {
  const stock = [];
  const cycle = Math.floor(refreshAt / (4 * 60 * 60 * 1000));
  equipmentSlotOrder.forEach((slot, slotIndex) => {
    const catalog = equipmentCatalog[slot] || [];
    if (!catalog.length) return;
    const choiceIndex = Math.floor(hash2(seed.length + cycle + slotIndex * 5, cycle + slot.charCodeAt(0), state.day + slotIndex) * catalog.length);
    const baseItem = catalog[clamp(choiceIndex, 0, catalog.length - 1)] || catalog[0];
    const rarityRoll = hash2(seed.length + cycle * 3, slot.charCodeAt(slot.length - 1), slotIndex + 19);
    const rarity = rarityRoll > 0.86 ? "red" : rarityRoll > 0.5 ? "yellow" : "gray";
    const bonusPower = rarity === "red" ? 2 : rarity === "yellow" ? 1 : 0;
    const item = normalizeEquipmentItem(slot, {
      ...baseItem,
      id: `market-${slot}-${cycle}-${slotIndex}-${rarity}`,
      name: `${baseItem.name} (${rarity === "red" ? "piros" : rarity === "yellow" ? "sarga" : "szurke"} piac)`,
      power: baseItem.power + bonusPower,
      rarity,
      image: getEquipmentRarityImage(slot, rarity),
    }, baseItem);
    if (!item) return;
    stock.push({
      slot,
      price: getEquipmentRarityPrice(rarity, item.power),
      item,
    });
  });
  return stock;
}

function ensureMarketStock(now = Date.now()) {
  const needsMigration = Array.isArray(state.marketStock) && state.marketStock.some((entry) => !String(entry?.item?.id || "").startsWith("market-"));
  if (!Array.isArray(state.marketStock) || !state.marketStock.length || !Number.isFinite(state.marketRefreshAt) || now >= state.marketRefreshAt || needsMigration) {
    state.marketStock = generateMarketStock(state.profileName || "market", now);
    state.marketRefreshAt = now + MARKET_REFRESH_MS;
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
  const catalogItem = (equipmentCatalog[slot] || []).find((item) => item.rarity === normalizedRarity)
    || equipmentCatalog[slot]?.[0];
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
    image: getEquipmentRarityImage(slot, normalizedRarity),
  }, catalogItem);
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

function craftSelectedEquipment() {
  const ingredients = getSelectedCraftItems();
  const result = getCraftSelectionResult(ingredients);
  if (!result) {
    refreshItemCraftPanel("Pontosan 3 azonos ritkasagu szabad itemet jelolj ki.");
    return false;
  }
  const { fromRarity, toRarity } = result;
  if (ingredients.length < 3) {
    const text = `Nincs eleg szabad ${getEquipmentRarityLabel(fromRarity).toLowerCase()} item a crafthoz.`;
    sceneRef?.setMessage(text);
    refreshItemCraftPanel(text);
    return false;
  }
  if (toRarity === "red" && Math.random() > 0.35) {
    removeInventoryIngredients(ingredients);
    selectedCraftItemKeys = [];
    const text = "A piros craft nem sikerult. A 3 sarga item elveszett.";
    sceneRef?.setMessage(text);
    refreshCharacterPanel();
    saveGame();
    refreshItemCraftPanel(text);
    return false;
  }
  const targetSlot = ingredients[Math.floor(Math.random() * ingredients.length)]?.slot || ingredients[0].slot;
  const crafted = createCraftedEquipmentItem(targetSlot, toRarity, ingredients);
  if (!crafted) return false;
  removeInventoryIngredients(ingredients);
  const unlockedCrafted = unlockEquipmentItem(targetSlot, crafted);
  if (unlockedCrafted?.id) {
    moveInventoryItemToFront(targetSlot, unlockedCrafted.id);
    recentlyCraftedItemKey = `${targetSlot}::${unlockedCrafted.id}`;
  }
  selectedCraftItemKeys = [];
  const text = `${unlockedCrafted?.name || crafted.name} elkeszult: ${getEquipmentRarityLabel(toRarity)} ${equipmentSlotDefs[targetSlot]?.label || "item"}.`;
  sceneRef?.setMessage(text);
  refreshCharacterPanel();
  saveGame();
  refreshItemCraftPanel(text);
  return true;
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
  const guaranteedRiskSpot = orderedSpots[Math.max(1, Math.floor(orderedSpots.length * 0.4))] || orderedSpots[0];
  const guaranteedDangerSpot = orderedSpots[orderedSpots.length - 1] || orderedSpots[0];
  orderedSpots.forEach((spot, index) => {
    const baseRoll = hash2(cycle + index * 11, profileSalt + spot.id.length * 17, spot.id.charCodeAt(0));
    const tier = baseRoll < 0.56 ? "easy" : baseRoll < 0.84 ? "risk" : "danger";
    if (tier === "easy") difficulties[spot.id] = Math.max(1, playerPower + Math.round(baseRoll * 14) - 8);
    else if (tier === "risk") difficulties[spot.id] = playerPower + 8 + Math.round(baseRoll * 12);
    else difficulties[spot.id] = playerPower + 24 + Math.round(baseRoll * 16);
  });
  if (guaranteedRiskSpot) {
    const riskRoll = hash2(cycle + 301, profileSalt + guaranteedRiskSpot.id.length, guaranteedRiskSpot.id.charCodeAt(0));
    difficulties[guaranteedRiskSpot.id] = playerPower + 8 + Math.round(riskRoll * 12);
  }
  if (guaranteedDangerSpot) {
    const dangerRoll = hash2(cycle + 707, profileSalt + guaranteedDangerSpot.id.length, guaranteedDangerSpot.id.charCodeAt(0));
    difficulties[guaranteedDangerSpot.id] = playerPower + 24 + Math.round(dangerRoll * 16);
  }
  return difficulties;
}

function normalizeBuildingDifficulties(source, cycle = getBuildingDifficultyCycle()) {
  const generated = createRandomBuildingDifficulties(cycle);
  const difficulties = {};
  clickableBuildingDefs.forEach((spot) => {
    const savedDifficulty = Number(source?.[spot.id]);
    difficulties[spot.id] = Number.isFinite(savedDifficulty)
      ? clamp(Math.round(savedDifficulty), 1, 200)
      : generated[spot.id];
  });
  return difficulties;
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

function setChoiceWheelButtons(visibleIds) {
  const map = {
    robbery: choiceWheelAction1,
    protection: choiceWheelAction2,
    close: choiceWheelAction4,
    quest: choiceWheelAction5,
  };
  Object.entries(map).forEach(([id, button]) => {
    if (!button) return;
    button.classList.toggle("hidden", !visibleIds.includes(id));
    button.disabled = false;
    if (visibleIds.includes(id)) button.dataset.choiceAction = id;
  });
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

let activeAuxPanelKind = null;

function hideMentorPanel(markUserClosed = false) {
  mentorCardOpen = false;
  if (hudMentorCard) {
    if (markUserClosed) hudMentorCard.dataset.userClosed = "true";
    else delete hudMentorCard.dataset.userClosed;
  }
  updateMentorPanel();
}

function hideAuxPanel() {
  if (activeAuxPanelKind === "world" && state.needsWorldBaseSelection) {
    sceneRef?.setMessage("Elobb valassz egy ures telket a varosodnak.");
    return;
  }
  hideQuestCard();
  hideMentorPanel(true);
  document.body.classList.remove("is-world-map-open");
  activeAuxPanelKind = null;
  auxPanel?.removeAttribute("data-kind");
  auxPanel?.classList.add("hidden");
  auxPanel?.setAttribute("aria-hidden", "true");
}

function showPoliceRaidPanel(loss, summaryText) {
  if (policeRaidTitle) {
    policeRaidTitle.textContent = state.heat >= 60
      ? "A rendorok razziat tartottak"
      : "A rendorok szimatot fogtak";
  }
  if (policeRaidText) policeRaidText.textContent = summaryText;
  if (policeRaidLoss) policeRaidLoss.textContent = `${loss} $`;
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
    hudMessageBadge.textContent = "";
    hudMessageBadge.classList.add("hidden");
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
      createdAt: Number.isFinite(Number(entry?.createdAt)) ? Number(entry.createdAt) : Date.now(),
      readAt: Number.isFinite(Number(entry?.readAt)) ? Number(entry.readAt) : 0,
      localOnly: true,
    }))
    .sort((left, right) => Number(right.createdAt) - Number(left.createdAt))
    .slice(0, MAX_LOCAL_NOTIFICATIONS);
}

function getLocalUnreadCount() {
  return normalizeLocalNotifications(state.localNotifications).filter((entry) => !entry.readAt).length;
}

function addLocalNotification(title, body, options = {}) {
  const entry = {
    id: options.id || `local-note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: String(title || "Ertesites"),
    body: String(body || ""),
    messageType: String(options.messageType || "event"),
    senderProfileName: options.senderProfileName ? String(options.senderProfileName) : "",
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
  return Math.max(1, getPlayerAttackStat() + getRankLevel(state.fame));
}

function getPlayerCombatDefenseStat() {
  return Math.max(1, getPlayerDefenseStat() + getRankLevel(state.fame));
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
    const response = await fetch("/api/messages?limit=1", {
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
  return payload?.kind === "clan_invitation" ? "Klánmeghívó" : "Játékos";
}

function getPlayerInboxMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.messageType === "player" && message.senderProfileName && message.senderProfileName !== state.profileName);
}

function renderMessagesPanel(messages = []) {
  const playerMessages = getPlayerInboxMessages(messages);
  const body = playerMessages.length
    ? `
      <section class="messages-panel">
        <div class="messages-list">
          ${playerMessages.map((message) => `
            <article class="message-card message-card--${escapeHtml(message.messageType || "player")}${message.readAt ? "" : " is-unread"}" data-message-id="${Number(message.id) || 0}" tabindex="0">
              <button class="message-card__delete" type="button" data-message-delete="${Number(message.id) || 0}" aria-label="Uzenet torlese">x</button>
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
                  ${message.payload?.kind === "clan_invitation" ? `
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
                  <form class="message-reply-form" data-message-reply="${escapeHtml(message.senderProfileName || "")}">
                    <label>Valasz ${escapeHtml(message.senderProfileName || "a feladonak")} reszere</label>
                    <textarea maxlength="1200" placeholder="Ird ide a valaszodat..."></textarea>
                    <button type="submit">Valasz kuldese</button>
                    <span class="message-reply-form__status" aria-live="polite"></span>
                  </form>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `
    : `
      <div class="messages-panel__empty">
        <strong>Még üres a postaláda.</strong>
        <span>Itt csak akkor jelenik meg valami, ha egy másik játékos ír neked.</span>
      </div>
    `;
  hideAuxPanel();
  setMessagesDialogContent("Üzenetek", "Privát üzenetek", body);
  activeAuxPanelKind = "messages";
  bindMessagesPanelActions();
}

function bindMessagesPanelActions() {
  if (!messagesDialogBody) return;
  messagesDialogBody.onclick = async (event) => {
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
        deleteButton.closest(".message-card")?.remove();
        if (!messagesDialogBody.querySelector(".message-card")) openMessagesPanel();
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
    card.classList.toggle("is-open");
    card.classList.remove("is-unread");
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
    const payload = response.ok ? await response.json() : { messages: [] };
    renderMessagesPanel(payload.messages);
    updateMessageBadge(0);
    void fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  } catch {
    setMessagesDialogContent("Üzenetek", "Privát üzenetek", `<div class="aux-panel__carditem"><strong>Az üzenetek most nem érhetők el.</strong><div class="aux-panel__muted">Próbáld meg néhány pillanat múlva.</div></div>`);
  }
}

function renderPublicPlayerProfile(profile, focusMessage = false) {
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
        <button type="button" data-public-action="pvp" data-player="${escapeHtml(profile.profileName)}">PvP támadás</button>
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
          <div class="npc-city-profile__metric"><span>Vedelem</span><strong>${villageStats.defense}</strong></div>
          <div class="npc-city-profile__metric"><span>Allapot</span><strong>${integrityPercent}%</strong></div>
          <div class="npc-city-profile__metric"><span>${city.status === "captured" ? "Felujitva" : "Megmaradt"}</span><strong>${remainingCount}/${structures.length}</strong></div>
          ${city.status === "captured" ? `
            <div class="npc-city-profile__metric"><span>Foglalasi vedelem</span><strong data-rival-protection-until="${city.protectionUntil}">${formatWorldRivalProtectionTime(city.protectionUntil)}</strong></div>
            <div class="npc-city-profile__metric"><span>Felgyult bevetel</span><strong data-rival-income-money="${escapeHtml(city.id)}">${incomeState.money} $</strong></div>
            <div class="npc-city-profile__metric"><span>Beszedesig</span><strong data-rival-income-time="${escapeHtml(city.id)}">${incomeState.ready ? "most" : formatWorldRivalHoursMinutes(incomeState.remainingMs)}</strong></div>
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
                ? `Felujitott haz. Ero: ${selected.attack}, vedelem: ${selected.defense}.`
                : selectedRepairing
                  ? `Felujitas folyamatban ${getWorldRivalStructureSpecializationLabel(selected.pendingSpecialization || selected.specialization).toLowerCase()} iranyra. Hatralevo ido: <strong data-rival-repair-ready-at="${selected.repairReadyAt}">${formatCountdown(selected.repairReadyAt - Date.now())}</strong>.`
                  : repairBlocked
                    ? `${activeRepair.name} felujitasa mar folyamatban van. Egy faluban egyszerre csak egy haz fejlesztheto. Hatralevo ido: <strong data-rival-repair-ready-at="${activeRepair.repairReadyAt}">${formatCountdown(activeRepair.repairReadyAt - Date.now())}</strong>.`
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
              ? `Minden rivalis haz elesett. Most mar a falufonokot kell legyoznod, hogy tied legyen a zsakmany es a falu.`
              : `Valassz egy hazat kozvetlenul a terkepen. Egy sikeres tamadas egy teljes hazat lerombol.`}
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
      `${city.name}: ${structure.name} vedelmet legyozted. +${xpGain} XP, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(cityCleared
      ? `${city.name}: minden haz romokban. Most mar johet az elfoglalas.`
      : `${structure.name} vedelmet legyozted.`);
  } else {
    const moneyLoss = Math.min(state.money, Math.max(24, Math.round(structure.rewardMoney * 0.34)));
    const healthLoss = clamp(7 + city.level * 5, 8, 26);
    const heatGain = applyHeat(5 + city.level);
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
      `${city.name}: ${structure.name} vedoi visszavertek. -${moneyLoss} $, -${healthLoss} HP, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(`${structure.name} vedoi visszavertek az embereidet. Ujabb tamadas 15:00 mulva.`);
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
    if (!response.ok) throw new Error(payload.error || "PvP hiba");
    hydrateState(payload.attackerState);
    sceneRef?.refreshHUD();
    sceneRef?.refreshMap();
    const resultText = payload.attackerWon
      ? `A támadás sikerült. ${payload.stolenMoney} $ zsákmányt szereztél.`
      : "A védők visszaverték a támadásodat.";
    setAuxPanelContent("PvP eredmény", defenderProfileName, `
      <section class="pvp-result ${payload.attackerWon ? "is-win" : "is-loss"}">
        <div class="pvp-result__stamp">${payload.attackerWon ? "GYŐZELEM" : "KUDARC"}</div>
        <h3>${resultText}</h3>
        <div class="pvp-result__stats">
          <span>Támadó erő <strong>${payload.attackerAttack}</strong></span>
          <span>Védő erő <strong>${payload.defenderDefense}</strong></span>
          <span>Sérülés <strong>-${payload.healthLoss} HP</strong></span>
        </div>
        <button type="button" id="pvpBackToWorld">Vissza a világtérképhez</button>
      </section>
    `);
    document.getElementById("pvpBackToWorld")?.addEventListener("click", () => openAuxPanel("world"));
    void refreshMessageBadge();
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
    state.influence = Math.max(0, Math.round((state.influence || 0) + 3 + city.level));
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
      `${city.name}: a falufonokot legyozted. +${moneyGain} $, +${xpGain} XP, +${fameGain} hirnev, +${heatGain}% korozes.`,
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
      text: `${city.name} fonoke visszaverte a tamadasodat.`,
      money: -moneyLoss,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    addLocalNotification(
      "Vilagterkep",
      `${city.name}: a falufonok visszavert. -${moneyLoss} $, -${healthLoss} eletero, +${heatGain}% korozes.`,
      { messageType: "event" },
    );
    sceneRef?.setMessage(`${city.name}: a falufonok meg ellenall, de meggyengult. Ujabb tamadas 15:00 mulva.`);
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
    `${city.name}: bejott a falubevetel. +${moneyGain} $.`,
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
                <em>${escapeHtml(entry.rankTitle)}</em>
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
  ensureMarketStock();
  const stock = Array.isArray(state.marketStock) ? state.marketStock : [];
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
          <em>A piacon most ${stock.length} elerheto aru var rad.</em>
        </div>
      </article>
      <div class="market-panel__grid">
        ${stock.map((entry) => {
          const alreadyOwned = Array.isArray(state.itemInventory?.[entry.slot])
            && state.itemInventory[entry.slot].some((ownedItem) => ownedItem.id === entry.item.id);
          const cannotAfford = state.money < entry.price;
          const disabled = alreadyOwned || cannotAfford;
          return `
          <article class="market-item${alreadyOwned ? " is-owned" : ""}">
            <img class="market-item__art" src="${entry.item.image || getEquipmentArt(entry.slot)}" alt="${escapeHtml(entry.item.name)}">
            <div class="market-item__meta">
              <strong>${escapeHtml(entry.item.name)}</strong>
              <span class="market-item__rarity market-item__rarity--${entry.item.rarity}">${getEquipmentRarityLabel(entry.item.rarity)}</span>
            </div>
            <div class="market-item__copy">${escapeHtml(equipmentSlotDefs[entry.slot]?.label || entry.slot)} · ${getEquipmentBonusText(entry.slot, entry.item.power, entry.item.stat)}</div>
            <div class="market-item__stats">
              <span>Ara: <strong>${entry.price} $</strong></span>
              <span>${entry.item.stat === "defense" ? "Vedel" : "Tamad"} a harcban</span>
            </div>
            <button
              class="market-item__buy"
              type="button"
              data-market-buy="${entry.item.id}"
              ${disabled ? "disabled" : ""}>
              ${alreadyOwned ? "Elkelt" : cannotAfford ? "Nincs eleg penz" : "Megveszem"}
            </button>
          </article>
        `;
        }).join("")}
      </div>
      <div class="market-panel__footnote">A megvett item bekerul a felszereleseid koze, es a karakterlapodon tudod felvenni.</div>
    </section>
  `;
}

function bindMarketBuyButtons(rootElement, options = {}) {
  rootElement?.querySelectorAll("[data-market-buy]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      buyMarketItem(button.dataset.marketBuy, options);
    });
  });
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
  const remaining = Math.max(0, Number(endsAt || 0) - Date.now());
  if (!remaining) return "Lezárult";
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.ceil((remaining % 3600000) / 60000);
  return `${hours} óra ${minutes} perc`;
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
    .filter((entry) => entry.status === "pending" && Number(entry.expiresAt) > Date.now())
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
        <strong>${activeWars.length} aktív</strong>
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
          const active = war.status === "active" && Number(war.endsAt) > Date.now();
          return `
            <article class="clan-war-card${active ? " is-active" : ""}">
              <div class="clan-war-card__ribbon">${active ? "Háborúban" : "Lezárt akta"}</div>
              <div class="clan-war-card__families"><strong>${escapeHtml(clan.clanName)}</strong><span>VS</span><strong>${escapeHtml(opponent || "Ismeretlen")}</strong></div>
              <div class="clan-war-card__score">${Number(ownScore) || 0}<span>:</span>${Number(enemyScore) || 0}</div>
              <div class="clan-war-card__time">${active ? getClanWarTimeLeft(war.endsAt) : new Date(war.endsAt).toLocaleDateString("hu-HU")}</div>
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
}

async function loadClanPanel() {
  renderClanPanel(null);
  try {
    const response = await fetch("/api/clans/dashboard", { headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "A klánadatok nem tölthetők be.");
    clanPanelData = payload;
    renderClanPanel(payload);
  } catch (error) {
    setAuxPanelContent("Klán", "Családi ügyek", `<div class="clan-empty-note">${escapeHtml(error.message)}</div>`);
    auxPanel?.setAttribute("data-kind", "clan");
    activeAuxPanelKind = "clan";
  }
}

function buyMarketItem(itemId, options = {}) {
  ensureMarketStock();
  const offer = (state.marketStock || []).find((entry) => entry.item.id === itemId);
  if (!offer) {
    sceneRef?.setMessage("Ez az aru mar lekerult a piacrol.");
    return false;
  }
  if (state.money < offer.price) {
    sceneRef?.setMessage("Nincs eleg penzed ehhez az aruhoz.");
    return false;
  }
  const alreadyOwned = Array.isArray(state.itemInventory?.[offer.slot])
    && state.itemInventory[offer.slot].some((entry) => entry.id === offer.item.id);
  if (alreadyOwned) {
    sceneRef?.setMessage("Ez a darab mar ott van a cuccaid kozott.");
    return false;
  }
  state.money -= offer.price;
  unlockEquipmentItem(offer.slot, offer.item);
  if (options.rerender !== false) renderBlackMarketPanel();
  if (typeof options.afterBuy === "function") options.afterBuy();
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.setMessage(`${offer.item.name} megveve a piacrol.`);
  return true;
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
            <img class="worldmap__canvas-art" src="${WORLD_MAP_CONTINUOUS_SRC}" alt="" aria-hidden="true">
            ${worldMapLotDefs.map((lot) => buildWorldMapLotButton(lot, occupiedLots[lot.id], selectionMode)).join("")}
            ${selectionMode ? "" : rivalCities.map((city) => buildWorldRivalCityButton(city)).join("")}
          </div>
        </div>
        <div id="worldPlayerWheel" class="world-player-wheel hidden" aria-hidden="true"></div>
      </div>
    </section>
  `;
  setAuxPanelContent("Vilagterkep", selectionMode ? "Valaszd ki a varosod helyet" : "", body);
  auxPanel?.setAttribute("data-kind", "world");
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
    button.addEventListener("click", (event) => {
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
  counterfeitMoney: { label: "Hamis penz", image: "./csempészet/34d87e7a-d0ec-42bc-891e-eff98067be29.png" },
  drugs: { label: "Drog", image: "./csempészet/0391ff3c-7e67-4b77-91e0-cdb7ac0f0a9a.png" },
  weapons: { label: "Fegyver", image: "./csempészet/dd25759f-f94a-42dc-8df6-d9fab6211903.png" },
  papers: { label: "Hamis papirok", image: "./csempészet/f5b63510-d9c7-469c-ac33-71343b294ab1.png" },
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
    image: "./garage-assets/sedan-1930.png",
    description: "Kompakt menekuloauto. Kisebb utcai atjatszasokra jo, mindenbol keveset hoz.",
    rewardProfile: "balanced",
    lootText: "Kisebb penz, hamis papir es hamis penz.",
  },
  {
    id: "van",
    title: "Csempesz furgon",
    cost: 520,
    requiredLevel: 2,
    speed: 1,
    stealth: 2,
    load: 3,
    accent: "Furgon",
    image: "./garage-assets/smuggler-van-1930.png",
    description: "Megerositett rakteru furgon. Csempesz aruhoz kell, drogot, fegyvert es papirokat hoz jobban.",
    rewardProfile: "cargo",
    lootText: "Csempesz aru: drog, fegyver, hamis papirok.",
  },
  {
    id: "armor",
    title: "Pancelkocsi",
    cost: 980,
    requiredLevel: 3,
    speed: 2,
    stealth: 1,
    load: 4,
    accent: "Pancel",
    image: "./garage-assets/armored-money-car-1930.png",
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
    baseSafeWidth: 0.24,
    baseSpeed: 0.032,
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
    baseSafeWidth: 0.2,
    baseSpeed: 0.037,
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
    baseSafeWidth: 0.17,
    baseSpeed: 0.043,
  },
];

const harborMissionCatalog = Array.from({ length: 50 }, (_, index) => {
  const batch = Math.floor(index / 4);
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
    { zone: "docks", title: "Rakparti atadas", requires: { counterfeitMoney: 6 + (index % 4), weapons: 1 + (index % 3) }, rewardMoney: 170 + index * 5, rewardXp: 28 + (index % 8), durationMs: 30 * 60 * 1000 },
    { zone: "customs", ...customsVariants[batch % customsVariants.length] },
    { zone: "rail", ...railVariants[batch % railVariants.length] },
    { zone: "fish", title: "Hajnali halaszat", gives: {}, rewardMoney: 90 + index * 3, rewardXp: 18 + (index % 10), heal: 20, energy: 20, durationMs: [60, 180, 360][index % 3] * 60 * 1000 },
  ];
  const profile = profiles[index % profiles.length];
  return {
    id: `harbor-${index + 1}`,
    ...profile,
    title: `${profile.title} ${Math.floor(index / profiles.length) + 1}`,
  };
});

const harborFishMissionDefs = [
  { id: "fish-1h", zone: "fish", title: "Hajnali halaszat - 1 ora", gives: {}, rewardMoney: 90, rewardXp: 18, heal: 20, energy: 20, durationMs: 60 * 60 * 1000 },
  { id: "fish-3h", zone: "fish", title: "Part menti halaszat - 3 ora", gives: {}, rewardMoney: 180, rewardXp: 34, heal: 28, energy: 28, durationMs: 180 * 60 * 1000 },
  { id: "fish-6h", zone: "fish", title: "Ejszakai halaszat - 6 ora", gives: {}, rewardMoney: 330, rewardXp: 58, heal: 40, energy: 40, durationMs: 360 * 60 * 1000 },
];

function replaceConfigArray(target, incoming, requiredKeys = ["id"]) {
  if (!Array.isArray(incoming) || incoming.length === 0) return false;
  const cleaned = incoming.filter((entry) =>
    entry
    && typeof entry === "object"
    && requiredKeys.every((key) => typeof entry[key] === "string" && entry[key].trim()),
  );
  if (!cleaned.length) return false;
  target.splice(0, target.length, ...cleaned.map((entry) => ({ ...entry })));
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
    image: typeof item.image === "string" && item.image.trim() ? item.image.trim() : getEquipmentRarityImage(slot, rarity),
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
    base: rawText.includes("fo bazis") ? "Valaszd ki a lakohazadat." : rawText,
    equip: "Szereld fel a fegyvert a karakteredre.",
    quest: "Vegyel fel es adj le egy kuldetest.",
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
  return 360 + (Math.max(1, state.harborGarage?.level || 1) - 1) * 290;
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
  return clamp(baseWidth - clickCount * 0.026, 0.075, 0.34);
}

function getGarageAttemptSpeed(gameState, mission) {
  const baseSpeed = Number(gameState?.baseSpeed) || Number(mission?.baseSpeed) || 0.032;
  const clickCount = Math.max(0, Math.round(Number(gameState?.attempts) || 0));
  return clamp(baseSpeed + clickCount * 0.0038, 0.018, 0.068);
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
  }, 28);
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
  setHarborPanelContent(zone, `
    <section class="harbor-place">
      <div class="harbor-hero harbor-hero--bar" aria-hidden="true">
        <img class="harbor-hero__image" src="./assets/harbor/speakeasy-harbor.png" alt="">
        <div class="harbor-hero__overlay">
          <span>Esos estek, whisky, pihenes</span>
          <strong>Kikotoi kocsma</strong>
        </div>
      </div>
      <div class="harbor-service-grid">
        <article class="harbor-service-card">
          <strong>Orvosi whiskey</strong>
          <span>+35 eletero</span>
          <small>Ersebb ital a kikoto embereitol. Gyors foltozas, dragabb aron.</small>
          <button type="button" data-harbor-buy="health">Megveszem - 75 $</button>
        </article>
        <article class="harbor-service-card">
          <strong>Fekete kave</strong>
          <span>+35 energia</span>
          <small>Forro, eros fekete. Osszerantja az embert egy ujabb akciohoz.</small>
          <button type="button" data-harbor-buy="energy">Megveszem - 75 $</button>
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
  setHarborPanelContent(zone, `
    <section class="harbor-orders${kind === "fish" ? " harbor-orders--fish" : ""}">
      ${kind === "fish" ? `
        <div class="harbor-hero harbor-hero--fish" aria-hidden="true">
          <img class="harbor-hero__image" src="./assets/harbor/fish-market-harbor.png" alt="">
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
          const reward = `+${mission.rewardMoney} $, +${mission.rewardXp} XP${mission.heal ? ", pihenes" : ""}${chanceText}`;
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

function renderHarborOffice(zone) {
  setHarborPanelContent(zone, `
    <section class="harbor-place">
      <p class="harbor-operation-panel__muted">Egy boritek a megfelelo asztalra neha tobbet er, mint egy pisztoly az utcan.</p>
      <div class="harbor-service-grid">
        <article class="harbor-service-card">
          <strong>Kis lefizetes</strong>
          <span>Korozes -10%</span>
          <button type="button" data-harbor-bribe="small">100 $</button>
        </article>
        <article class="harbor-service-card">
          <strong>Nagy lefizetes</strong>
          <span>Korozes -25%</span>
          <button type="button" data-harbor-bribe="large">350 $</button>
        </article>
        <article class="harbor-service-card harbor-service-card--locked">
          <strong>Kapcsolat epites</strong>
          <span>Kesobb uj opciok</span>
          <button type="button" disabled>Hamarosan</button>
        </article>
      </div>
    </section>
  `);
}

function renderHarborMarket(zone) {
  setHarborPanelContent(zone, `
    <section class="harbor-black-market">
      <div class="harbor-black-market__header">
        <div>
          <span>Kikötői piac</span>
          <h4>Feketepiaci áruk</h4>
        </div>
        <span>A megvett item azonnal bekerül a felszereléseid közé.</span>
      </div>
      ${getMarketPanelHtml()}
    </section>
  `);
  bindMarketBuyButtons(harborOperationPanel, {
    rerender: false,
    afterBuy: () => renderHarborMarket(zone),
  });
}

function upgradeHarborGarage() {
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  if (state.harborGarage.level >= 3) {
    sceneRef?.setMessage("A muhely mar a legjobb szinten van.");
    return false;
  }
  const cost = getHarborGarageUpgradeCost();
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz a muhely fejlesztesere.");
    return false;
  }
  state.money -= cost;
  state.harborGarage.level += 1;
  sceneRef?.refreshHUD();
  sceneRef?.pushLog(`Garazs fejlesztve. Uj szint: ${state.harborGarage.level}.`);
  sceneRef?.setMessage("A garazs muhelye fejlesztve lett.");
  saveGame();
  return true;
}

function activateGarageVehicle(vehicleId) {
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  const vehicle = getGarageVehicleById(vehicleId);
  if (!vehicle) return false;
  if (!state.harborGarage.unlockedVehicleIds.includes(vehicle.id)) {
    if (state.harborGarage.level < vehicle.requiredLevel) {
      sceneRef?.setMessage(`Ehhez a jarmuhhoz ${vehicle.requiredLevel}. szintu garazs kell.`);
      return false;
    }
    if (!canAfford(vehicle.cost)) {
      sceneRef?.setMessage("Nincs eleg penz a jarmuhoz.");
      return false;
    }
    state.money -= vehicle.cost;
    state.harborGarage.unlockedVehicleIds.push(vehicle.id);
    state.harborGarage.unlockedVehicleIds = Array.from(new Set(state.harborGarage.unlockedVehicleIds));
    sceneRef?.pushLog(`${vehicle.title} bekerult a garazsba.`);
  }
  state.harborGarage.activeVehicleId = vehicle.id;
  sceneRef?.refreshHUD();
  sceneRef?.setMessage(`${vehicle.title} lett az aktiv menekuloauto.`);
  saveGame();
  return true;
}

function getHarborGarageSceneHtml(vehicle, stats) {
  const image = vehicle.image || "./garage-assets/sedan-1930.png";
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
        <img class="harbor-garage-vehicle__image" src="${escapeHtml(vehicle.image || "./garage-assets/sedan-1930.png")}" alt="${escapeHtml(vehicle.title)}">
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
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (activateGarageVehicle(button.dataset.garageVehicle)) {
        renderHarborGarage(zone);
      }
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-upgrade]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (upgradeHarborGarage()) {
        renderHarborGarage(zone);
      }
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-mission]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startGarageMission(button.dataset.garageMission);
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-hit]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      resolveGarageCheckpoint();
    });
  });
  harborOperationPanel.querySelectorAll("[data-garage-abort]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
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
        <div class="garage-minigame__meter">
          <div class="garage-minigame__safe-zone" style="left:${(gameState.safeCenter - gameState.safeWidth / 2) * 100}%; width:${gameState.safeWidth * 100}%"></div>
          <div class="garage-minigame__needle" style="left:${gameState.pointer * 100}%"></div>
        </div>
        <div class="garage-minigame__status">
          <strong>${escapeHtml(gameState.statusText)}</strong>
          <span>${escapeHtml(gameState.logText)}${penaltyPercent > 0 ? ` Jutalomlevonas: ${penaltyPercent}%.` : ""}</span>
        </div>
        <div class="garage-minigame__actions">
          <button type="button" data-garage-hit>Atcsuszas</button>
        </div>
      </div>
    </section>
  `);
  bindHarborGarageControls(zone);
  startGarageMiniGameLoop();
}

function finishGarageMission(success, reason = "") {
  const gameState = garageMiniGameState;
  if (!gameState) return false;
  const mission = getGarageMissionById(gameState.missionId);
  const zone = harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." };
  stopGarageMiniGame(true);
  if (!mission) {
    renderHarborGarage(zone);
    return false;
  }
  if (success) {
    const penaltyFactor = getGarageMissPenaltyFactor(gameState.misses);
    const finalRewardMoney = Math.max(20, Math.round(gameState.rewardMoney * penaltyFactor));
    const finalRewardXp = Math.max(6, Math.round(gameState.rewardXp * penaltyFactor));
    const finalCargoReward = scaleGarageRewardCargoForMisses(gameState.cargoReward, gameState.misses);
    state.money += finalRewardMoney;
    applyFame(finalRewardXp);
    const heatGain = applyHeat(mission.heatSuccess);
    addCargo(finalCargoReward);
    state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0) + Math.max(2, Math.round(finalRewardXp / 4)));
    state.harborGarage.wins = Math.max(0, Math.round(Number(state.harborGarage.wins) || 0)) + 1;
    sceneRef?.pushLog(`${mission.title} sikeres auto-csempeszet volt. +${finalRewardMoney} $, +${finalRewardXp} XP, felrenyomas: ${gameState.misses}.`);
    sceneRef?.setMessage(`${mission.title} sikerult. Felrenyomas: ${gameState.misses}, a jutalom ehhez igazodott.`);
    queueRewardModal({
      title: "Auto csempeszet sikeres",
      text: `${mission.title} lefutott. Felrenyomas: ${gameState.misses}. Zsakmany: ${formatCargoList(finalCargoReward)}.`,
      money: finalRewardMoney,
      xp: finalRewardXp,
      fame: finalRewardXp,
    });
    addLocalNotification(
      "Feladat vege",
      `${mission.title} sikerult. Felrenyomas: ${gameState.misses}. Jutalom: +${finalRewardMoney} $, +${finalRewardXp} XP, rakomany: ${formatCargoList(finalCargoReward)}. Korozes +${heatGain}%.`,
      { messageType: "event" },
    );
  } else {
    const penalty = Math.min(state.money, mission.failurePenalty);
    state.money = Math.max(0, state.money - penalty);
    const heatGain = applyHeat(mission.heatFail);
    state.harborGarage.losses = Math.max(0, Math.round(Number(state.harborGarage.losses) || 0)) + 1;
    sceneRef?.pushLog(`${mission.title} megbukott. -${penalty} $, +${heatGain}% korozes.`);
    sceneRef?.setMessage(reason || "A csempeszut balul sult el, a rendorseg rajtad maradt.");
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
      `${mission.title} elbukott. Veszteseg: -${penalty} $, korozes +${heatGain}%.`,
      { messageType: "event" },
    );
  }
  sceneRef?.refreshHUD();
  saveGame();
  renderHarborGarage(zone);
  return success;
}

function resolveGarageCheckpoint() {
  const gameState = garageMiniGameState;
  const mission = gameState ? getGarageMissionById(gameState.missionId) : null;
  if (!gameState || !mission) return false;
  const success = isGarageCheckpointHit(gameState);
  gameState.attempts = Math.max(0, Math.round(Number(gameState.attempts) || 0)) + 1;
  if (success) {
    gameState.hits += 1;
    gameState.statusText = "Tiszta atjutas";
    gameState.logText = "A rendororseg nem vette eszre a valtast, de a kovetkezo sav mar szukebb es gyorsabb.";
  } else {
    gameState.misses = Math.max(0, Math.round(Number(gameState.misses) || 0)) + 1;
    gameState.statusText = "Tul kozel voltal";
    gameState.logText = "A konvoj megakadt, ez levon a jutalombol, es a kovetkezo kor gyorsabb lesz.";
  }
  gameState.round += 1;
  if (gameState.round > gameState.totalRounds) {
    return finishGarageMission(gameState.hits >= gameState.requiredHits, "A konvoj lebukott az utolso ellenorzesnel.");
  }
  gameState.direction = Math.random() > 0.5 ? 1 : -1;
  gameState.safeWidth = getGarageRoundSafeWidth(gameState, mission);
  gameState.speed = getGarageAttemptSpeed(gameState, mission);
  rollGarageCheckpoint(gameState);
  renderGarageMiniGame(harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs" }, mission);
  return success;
}

function startGarageMission(missionId) {
  state.harborGarage = normalizeHarborGarage(state.harborGarage);
  const limitState = getGarageRunLimitState();
  if (limitState.remaining <= 0) {
    sceneRef?.setMessage(`Tizenkét órán belül csak ${GARAGE_RUN_LIMIT} fuvar indítható. Következő fuvar: ${formatCountdown(limitState.resetIn)} múlva.`);
    renderHarborGarage(harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs" });
    return false;
  }
  const mission = getGarageMissionById(missionId);
  if (!mission) return false;
  const vehicle = getActiveGarageVehicle();
  const requiredVehicle = getGarageVehicleById(mission.vehicleId);
  if (vehicle.id !== requiredVehicle.id) {
    sceneRef?.setMessage(`${mission.title} csak ezzel indulhat: ${requiredVehicle.title}.`);
    return false;
  }
  const stats = getHarborGarageStats();
  const runConfig = getGarageMissionRunConfig(mission, stats, vehicle);
  state.harborGarage.runTimestamps.push(Date.now());
  state.harborGarage.runTimestamps = state.harborGarage.runTimestamps.slice(-GARAGE_RUN_LIMIT);
  saveGame(true);
  garageMiniGameState = {
    missionId: mission.id,
    round: 1,
    hits: 0,
    misses: 0,
    attempts: 0,
    totalRounds: runConfig.totalRounds,
    requiredHits: runConfig.requiredHits,
    rewardMoney: runConfig.rewardMoney,
    rewardXp: runConfig.rewardXp,
    cargoReward: runConfig.cargoReward,
    direction: 1,
    pointer: 0.08,
    safeCenter: 0.5,
    baseSafeWidth: clamp(mission.baseSafeWidth + stats.stealth * 0.018, 0.14, 0.34),
    safeWidth: clamp(mission.baseSafeWidth + stats.stealth * 0.018, 0.14, 0.34),
    baseSpeed: Math.max(0.018, mission.baseSpeed - stats.speed * 0.0022),
    speed: Math.max(0.018, mission.baseSpeed - stats.speed * 0.0022),
    statusText: "Motorok indulnak",
    logText: "Vidd at a jelolot a zold savon a megfelelo pillanatban.",
  };
  rollGarageCheckpoint(garageMiniGameState);
  renderGarageMiniGame(harborZoneDefs.find((entry) => entry.id === "garage") || { id: "garage", title: "Garazs" }, mission);
  sceneRef?.setMessage(`${mission.title} elindult. Most a menekuloauto reakcioja dont.`);
  return true;
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
  if (zone.id === "market") return renderHarborMarket(zone);
  if (zone.id === "garage") return renderHarborGarage(zone);
  if (["docks", "customs", "rail", "fish"].includes(zone.id)) return renderHarborOrders(zone, zone.id === "fish" ? "fish" : "mixed");
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

function startHarborMission(missionId) {
  const mission = [...harborMissionCatalog, ...harborFishMissionDefs].find((entry) => entry.id === missionId);
  if (!mission) return false;
  const duplicate = normalizeProcessTasks(state.harborProcessTasks).some((task) =>
    task.type === "harbor" && (task.payload?.missionId === mission.id || (!task.payload?.missionId && task.payload?.title === mission.title)),
  );
  if (duplicate) {
    sceneRef?.setMessage(`${mission.title} mar folyamatban van, ugyanazt nem indithatod el ujra.`);
    return false;
  }
  if (!hasProcessTaskSlot("harbor")) {
    sceneRef?.setMessage("Nincs szabad feladat kor a kikotoi munkahoz.");
    renderProcessTasks();
    return false;
  }
  if (mission.requires && !canPayCargo(mission.requires)) {
    sceneRef?.setMessage("Nincs eleg csempesz aru ehhez a munkahoz.");
    return false;
  }
  if (mission.requires) takeCargo(mission.requires);
  const queued = enqueueProcessTask({
    type: "harbor",
    title: mission.zone === "fish" ? "Halaszat" : "Csempeszet",
    icon: mission.zone === "fish" ? "H" : "C",
    durationMs: mission.durationMs,
    payload: {
      missionId: mission.id,
      title: mission.title,
      zone: mission.zone,
      gives: mission.gives || {},
      rewardMoney: mission.rewardMoney,
      rewardXp: mission.rewardXp,
      heal: mission.heal || 0,
      energy: mission.energy || 0,
      successChance: Number.isFinite(Number(mission.successChance)) ? Number(mission.successChance) : (mission.zone === "fish" ? 1 : 0.86),
    },
  }, "harbor");
  if (!queued) return false;
  sceneRef?.setMessage(`${mission.title} elindult. A jutalom a folyamat lejarata utan jar.`);
  sceneRef?.pushLog(`Kikoto: ${mission.title} elindult (${formatCountdown(mission.durationMs)}).`);
  renderHarborZonePanel(harborZoneDefs.find((zone) => zone.id === mission.zone) || harborZoneDefs[0]);
  saveGame();
  return true;
}

function handleHarborPanelClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const garageHitButton = event.target.closest("[data-garage-hit]");
  if (garageHitButton) {
    resolveGarageCheckpoint();
    return;
  }
  const garageVehicleButton = event.target.closest("[data-garage-vehicle]");
  if (garageVehicleButton) {
    if (activateGarageVehicle(garageVehicleButton.dataset.garageVehicle)) {
      renderHarborGarage(harborZoneDefs.find((zone) => zone.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." });
    }
    return;
  }
  const garageUpgradeButton = event.target.closest("[data-garage-upgrade]");
  if (garageUpgradeButton) {
    if (upgradeHarborGarage()) {
      renderHarborGarage(harborZoneDefs.find((zone) => zone.id === "garage") || { id: "garage", title: "Garazs", note: "Jarmuvek kesobb." });
    }
    return;
  }
  const garageMissionButton = event.target.closest("[data-garage-mission]");
  if (garageMissionButton) {
    startGarageMission(garageMissionButton.dataset.garageMission);
    return;
  }
  const missionButton = event.target.closest("[data-harbor-mission]");
  if (missionButton) {
    startHarborMission(missionButton.dataset.harborMission);
    return;
  }

  const buyButton = event.target.closest("[data-harbor-buy]");
  if (buyButton) {
    const kind = buyButton.dataset.harborBuy;
    const cost = 75;
    if (!canAfford(cost)) {
      sceneRef?.setMessage("Nincs eleg penz az italra.");
      return;
    }
    state.money -= cost;
    if (kind === "health") state.health = clamp(state.health + 35, 0, 100);
    if (kind === "energy") state.energy = clamp(state.energy + 35, 0, 100);
    saveGame();
    sceneRef?.refreshHUD();
    sceneRef?.setMessage(kind === "health" ? "Az ital visszahozott egy kis eletet." : "A fekete kave felrazta a bandat.");
    return;
  }
  const bribeButton = event.target.closest("[data-harbor-bribe]");
  if (bribeButton) {
    const large = bribeButton.dataset.harborBribe === "large";
    const cost = large ? 350 : 100;
    if (!canAfford(cost)) {
      sceneRef?.setMessage("Nincs eleg penz a boritekra.");
      return;
    }
    state.money -= cost;
    const heatLoss = Math.min(state.heat, large ? 25 : 10);
    state.heat = clamp(state.heat - heatLoss, 0, 100);
    saveGame();
    sceneRef?.refreshHUD();
    renderHarborOffice(harborZoneDefs.find((zone) => zone.id === "office") || { title: "Kikotoi iroda" });
    sceneRef?.pushLog(`Kikotoi lefizetes: -${cost} $, -${heatLoss}% korozes.`);
    sceneRef?.setMessage(`A boritek celba ert. Korozes -${heatLoss}%.`);
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
      if (state.profileName) {
        const response = await fetch("/api/market-items?limit=50", {
          headers: { Accept: "application/json" },
        });
        const payload = response.ok ? await response.json() : { items: [] };
        if (Array.isArray(payload.items)) {
          state.marketStock = normalizeMarketStock(payload.items.map((entry) => entry?.payload || {
            slot: entry.slotKey,
            price: entry.price,
            item: {
              id: entry.itemId,
              name: entry.itemName,
              rarity: entry.rarity,
              power: entry.statValue,
              stat: entry.statKind === "defense" ? "defense" : "attack",
              image: entry.payload?.item?.image,
            },
          }));
        }
      }
    } catch {
      // Fall back to local stock if the market endpoint is temporarily unavailable.
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
  return {
    id: typeof quest.id === "string" ? quest.id : `quest-${Date.now()}`,
    spotId: spot.id,
    spotName: typeof quest.spotName === "string" ? quest.spotName : spot.name,
    districtName: typeof quest.districtName === "string" ? quest.districtName : (districtDefs[spot.districtIndex]?.name || "Kerulet"),
    type: quest.type === "protection" ? "protection" : "robbery",
    status: allowedStatuses.has(quest.status) ? quest.status : "offered",
    title: typeof quest.title === "string" ? quest.title : "Kuldetes",
    description: typeof quest.description === "string" ? quest.description : "",
    objective: typeof quest.objective === "string" ? quest.objective : "",
    reward: reward
      ? {
        slot: normalizedRewardSlot,
        name: typeof reward.name === "string" ? reward.name : "Ismeretlen felszereles",
        power: Number.isFinite(reward.power) ? Math.max(0, reward.power) : 0,
        stat: reward?.stat === "defense" || reward?.stat === "attack" ? reward.stat : (equipmentSlotDefs[normalizedRewardSlot]?.stat || "attack"),
        rarity: ["gray", "yellow", "red"].includes(reward?.rarity) ? reward.rarity : "gray",
        id: typeof reward.id === "string" ? reward.id : undefined,
        image: typeof reward.image === "string" ? reward.image : getEquipmentArt(normalizedRewardSlot),
      }
      : null,
    moneyReward: Number.isFinite(quest.moneyReward) ? Math.max(0, Math.round(quest.moneyReward)) : 80,
    xpReward: Number.isFinite(quest.xpReward) ? Math.max(0, Math.round(quest.xpReward)) : 18,
    goal: {
      action: goal.action === "protection" || quest.type === "protection" ? "protection" : "robbery",
      mode: goal.mode === "shop" || goal.mode === "street" ? goal.mode : "any",
      target,
      progress,
    },
    createdAt: Number.isFinite(quest.createdAt) ? quest.createdAt : Date.now(),
  };
}

function normalizeQuestList(quests) {
  const normalized = Array.isArray(quests) ? quests.map(normalizeQuest).filter(Boolean) : [];
  return normalized.filter((quest) => quest.status === "accepted" || quest.status === "completed").slice(0, 2);
}

function normalizeOfferedQuestList(quests) {
  const normalized = Array.isArray(quests) ? quests.map(normalizeQuest).filter(Boolean) : [];
  return normalized.filter((quest) => quest.status === "offered").slice(0, 3);
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
  return quest?.type === "protection" ? "Vedelmi penz" : "Kirabalas";
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
  if (!quest) return "Varj a hazak felett megjeleno felkialtojelre.";
  const intro = quest.type === "protection"
    ? `${quest.spotName} kornyeken kezd forrosodni a levego, a helyiek mar csak halkan mernek beszelni.`
    : `${quest.spotName} ma este tele lesz penzzel es ideges orokkel, pont ettol jo fogas.`;
  const followUp = quest.type === "protection"
    ? `Lepj be ${quest.districtName} negyedebe, es tedd egyertelmuve, hogy ezen az utcan te diktalod a szabalyokat.`
    : `Ha gyors vagy ${quest.districtName} negyedeben, egyszerre szerzel zsakmanyt, hirmevet es tiszteletet.`;
  return `${intro} ${followUp}`;
}

function getQuestStatusText(quest) {
  if (!quest) return "Nincs aktiv kuldetes";
  if (quest.status === "offered") return "Felajanlva";
  if (quest.status === "accepted") return `Elfogadva (${quest.goal.progress}/${quest.goal.target})`;
  if (quest.status === "completed") return `Kesz (${quest.goal.progress}/${quest.goal.target})`;
  return "Atadva";
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
  { id: "base", title: "Elso munka", text: "Valaszd ki a lakohazadat.", reward: { money: 80, xp: 2 } },
  { id: "crew", title: "Ember a bandaba", text: "Vegyel fel vagy fejlessz egy bandatagot.", reward: { money: 90, xp: 2 } },
  { id: "equip", title: "Oltozz munkahoz", text: "Szereld fel a fegyvert a karakteredre.", reward: { money: 70, xp: 2 } },
  { id: "robbery", title: "Zold celpont", text: "Rabolj ki egy konnyu hazat.", reward: { money: 110, xp: 2 } },
  { id: "protection", title: "Utcai ado", text: "Szedj vedelmi penzt egy hazbol.", reward: { money: 120, xp: 2 } },
  { id: "quest", title: "Atadas", text: "Vegyel fel es adj le egy kuldetest.", reward: { money: 130, xp: 2 } },
  { id: "rest", title: "Biztos hely", text: "Pihenj a fo bazisodon.", reward: { money: 90, xp: 1 } },
  { id: "world", title: "Nagyvilag", text: "Nezd meg a vilagterkepet.", reward: { money: 100, xp: 2 } },
  { id: "level5", title: "Nevet szerzel", text: "Erd el az 5. szintet.", reward: { money: 180, xp: 8 } },
  { id: "harbor", title: "Kikotoi kapu", text: "Lepj be a kikoto negyedbe.", reward: { money: 220, xp: 10 } },
];

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

function updateMentorPanel() {
  const visible = shouldShowMentorHud();
  const step = getCurrentMentorStep();
  if (visible && step && hudMentorCard?.dataset.userClosed !== "true") {
    mentorCardOpen = true;
  }
  hudMentorToggle?.classList.toggle("hidden", !visible);
  hudMentorToggle?.classList.toggle("is-attention", visible && !mentorCardOpen);
  hudMentorCard?.classList.toggle("hidden", !(visible && mentorCardOpen));
  hudMentorCard?.setAttribute("aria-hidden", visible && mentorCardOpen ? "false" : "true");
  if (!visible || !step) return;
  if (hudMentorStepTitle) hudMentorStepTitle.textContent = step.title;
  if (hudMentorStepText) hudMentorStepText.textContent = step.text;
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
  try {
    grantMentorReward(step);
    state.mentorStep = Math.round(Number(state.mentorStep) || 0) + 1;
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
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "g");
  marker.classList.add("map-svg-quest-marker");
  marker.setAttribute("aria-hidden", "true");
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
  questCardQuestId = quest.id;
  if (hudQuestTitle) hudQuestTitle.textContent = "";
  if (hudQuestText) {
    hudQuestText.textContent = getQuestFlavorText(quest);
  }
  if (hudObjective) hudObjective.textContent = `Feladat: ${quest.objective}`;
  if (hudObjectiveOne) hudObjectiveOne.innerHTML = getQuestRewardMarkup(quest);
  if (hudObjectiveTwo) hudObjectiveTwo.textContent = `Allapot: ${getQuestStatusText(quest)}`;
  if (hudQuestAction) {
    const locked = false;
    hudQuestAction.disabled = locked;
    hudQuestAction.classList.toggle("is-disabled", locked);
    hudQuestAction.textContent =
      quest.status === "offered"
        ? "Elfogad"
        : quest.status === "accepted"
          ? "Folyamatban"
          : quest.status === "completed"
            ? "Atadas"
            : "Atadva";
  }
  if (hudQuestDelete) {
    const canDelete = quest.status === "accepted" || quest.status === "completed";
    hudQuestDelete.classList.toggle("hidden", !canDelete);
    hudQuestDelete.disabled = !canDelete;
  }
  setQuestCardVisible(true);
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
      ? `I: ${quests[0].title}${quests[0].status === "completed" ? " [Kesz]" : ` (${quests[0].goal.progress}/${quests[0].goal.target})`}`
      : "I: nincs felvett kuldetes";
    hudQuestTab1.textContent = label;
    hudQuestTab1.dataset.label = label;
    hudQuestTab1.setAttribute("aria-label", label);
  }
  if (hudQuestTab2) {
    hudQuestTab2.classList.toggle("is-ready", quests[1]?.status === "completed");
    const label = quests[1]
      ? `II: ${quests[1].title}${quests[1].status === "completed" ? " [Kesz]" : ` (${quests[1].goal.progress}/${quests[1].goal.target})`}`
      : "II: nincs felvett kuldetes";
    hudQuestTab2.textContent = label;
    hudQuestTab2.dataset.label = label;
    hudQuestTab2.setAttribute("aria-label", label);
  }
  refreshOpenQuestCard();
}

function acceptActiveQuest() {
  state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  const quest = state.offeredQuests.find((entry) => entry.id === questCardQuestId) || state.activeQuest;
  if (!quest) {
    sceneRef?.setMessage("Nincs elfogadhato kuldetes.");
    return;
  }
  if (quest.status !== "offered") {
    showQuestCard(quest);
    sceneRef?.setMessage(
      quest.status === "accepted"
        ? `A kuldetes mar el van fogadva: ${quest.spotName}.`
        : "Ez a kuldetes mar lezarult.",
    );
    return;
  }

  state.activeQuests = normalizeQuestList(state.activeQuests);
  if (state.activeQuests.length >= 2) {
    sceneRef?.setMessage("Mar ket felvett kuldetesed van. Fejezz be egyet az I/II slotbol.");
    return;
  }

  quest.status = "accepted";
  quest.goal.progress = 0;
  state.activeQuests.push(quest);
  state.offeredQuests = state.offeredQuests.filter((entry) => entry.id !== quest.id);
  state.selectedQuestSlot = state.activeQuests.length - 1;
  if (state.activeQuest?.id === quest.id) state.activeQuest = null;
  sceneRef?.pushLog(`Kuldetes elfogadva: ${quest.spotName}.`);
  sceneRef?.setMessage(`Kuldetes felveve az ${state.selectedQuestSlot === 0 ? "I" : "II"}. slotba.`);
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  showQuestCard(quest);
}

function grantQuestReward(quest) {
  if (!quest || quest.status !== "completed") {
    sceneRef?.setMessage("Ez a küldetés még nem kész az átadásra.");
    return false;
  }

  const modernReward = quest.reward || null;
  const modernUnlockedItem = modernReward ? unlockEquipmentItem(modernReward.slot, modernReward) : null;
  state.money += quest.moneyReward;
  applyFame(quest.xpReward);
  applyHeat(4);
  completeMentorStep("quest");
  removeQuestFromActiveList(quest);
  state.selectedQuestSlot = clamp(state.selectedQuestSlot, 0, Math.max(0, state.activeQuests.length - 1));
  sceneRef?.pushLog(
    modernReward
      ? `Kuldetes atadva: ${quest.title} - +${quest.xpReward} XP, +${quest.moneyReward} $, ${modernReward.name}.`
      : `Kuldetes atadva: ${quest.title} - +${quest.xpReward} XP, +${quest.moneyReward} $.`,
  );
  sceneRef?.setMessage(
    modernReward
      ? `Atadas sikeres: ${quest.title}. +${quest.xpReward} XP, uj targy: ${modernUnlockedItem?.name || modernReward.name}.`
      : `Atadas sikeres: ${quest.title}. +${quest.xpReward} XP, +${quest.moneyReward} $.`,
  );
  queueRewardModal({
    title: "Kuldetes teljesitve",
    text: quest.title,
    money: quest.moneyReward,
    xp: quest.xpReward,
    fame: quest.xpReward,
    itemName: modernUnlockedItem?.name || modernReward?.name || "",
  });
  syncEquipmentSheet();
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  return true;

}

function deleteQuest(quest) {
  if (!quest || (quest.status !== "accepted" && quest.status !== "completed")) {
    sceneRef?.setMessage("Ezt a kuldetest most nem lehet torolni.");
    return false;
  }
  removeQuestFromActiveList(quest);
  state.selectedQuestSlot = clamp(state.selectedQuestSlot, 0, Math.max(0, state.activeQuests.length - 1));
  sceneRef?.pushLog(`Kuldetes torolve: ${quest.spotName}.`);
  sceneRef?.setMessage(`${quest.spotName} kuldetese torolve lett.`);
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  hideQuestCard();
  return true;
}

function handleQuestCardAction() {
  const quest = state.activeQuest?.id === questCardQuestId
    ? state.activeQuest
    : (normalizeOfferedQuestList(state.offeredQuests).find((entry) => entry.id === questCardQuestId) || null)
      || (normalizeQuestList(state.activeQuests).find((entry) => entry.id === questCardQuestId) || null);

  if (quest?.status === "offered") {
    acceptActiveQuest();
    return;
  }
  if (!quest) {
    sceneRef?.setMessage("Nincs itt felveheto vagy atadhato kuldetes.");
    return;
  }
  if (quest.status === "completed") {
    grantQuestReward(quest);
    hideQuestCard();
    return;
  }
  sceneRef?.setMessage("Elobb teljesitsd a feladatot.");
}

const mainQuestTemplateDefs = {
  early: [
    {
      type: "robbery",
      title: "Gyors kassza",
      description: "Rabolj ki 1 boltot a varosban.",
      objective: "1 sikeres bolti kirablas.",
      goal: { action: "robbery", mode: "shop", target: 1, progress: 0 },
      xp: 5,
      money: 150,
    },
    {
      type: "robbery",
      title: "Utcai villanas",
      description: "Hajts vegre 2 sikeres kirablast.",
      objective: "2 sikeres kirablas barmelyik epuletnel.",
      goal: { action: "robbery", mode: "any", target: 2, progress: 0 },
      xp: 5,
      money: 165,
    },
    {
      type: "protection",
      title: "Elso boritek",
      description: "Szedj be vedelmi penzt 1 helyrol.",
      objective: "1 sikeres vedelmi penz beszedese.",
      goal: { action: "protection", mode: "any", target: 1, progress: 0 },
      xp: 5,
      money: 145,
    },
  ],
  standard: [
    {
      type: "robbery",
      title: "Bolti szuret",
      description: "Rabolj ki 2 boltot a varosban.",
      objective: "Sikeres kirablas 2 shop/bolt tipusu hazon.",
      goal: { action: "robbery", mode: "shop", target: 2, progress: 0 },
      xp: 32,
      money: 140,
    },
    {
      type: "robbery",
      title: "Negy utcai meló",
      description: "Hajts vegre 4 sikeres kirablast barmelyik hazon.",
      objective: "4 sikeres kirablas barmelyik epuletnel.",
      goal: { action: "robbery", mode: "any", target: 4, progress: 0 },
      xp: 46,
      money: 210,
    },
    {
      type: "protection",
      title: "Vedett kirakatok",
      description: "Szedj be vedelmi penzt 3 helyrol.",
      objective: "3 sikeres vedelmi penz beszedese.",
      goal: { action: "protection", mode: "any", target: 3, progress: 0 },
      xp: 36,
      money: 170,
    },
    {
      type: "robbery",
      title: "Gazdag celpont",
      description: "Rabolj ki egy boltot a(z) {district} kornyeken.",
      objective: "1 sikeres bolti kirablas.",
      goal: { action: "robbery", mode: "shop", target: 1, progress: 0 },
      xp: 24,
      money: 110,
    },
  ],
};

function normalizeQuestTemplate(template, spot, phase = "standard") {
  if (!template || typeof template !== "object") return null;
  const districtName = districtDefs[spot?.districtIndex]?.name || "kerulet";
  const goal = template.goal && typeof template.goal === "object" ? template.goal : null;
  if (!goal || !goal.action || !goal.mode) return null;
  return {
    type: template.type === "protection" ? "protection" : "robbery",
    title: typeof template.title === "string" ? template.title : "Kuldetes",
    description: String(template.description || "").replaceAll("{district}", districtName),
    objective: typeof template.objective === "string" ? template.objective : "",
    goal: {
      action: goal.action === "protection" ? "protection" : "robbery",
      mode: goal.mode === "shop" ? "shop" : "any",
      target: Math.max(1, Math.round(Number(goal.target) || 1)),
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
  const normalized = templates.map((template) => normalizeQuestTemplate(template, spot, phase)).filter(Boolean);
  return normalized.length ? normalized : mainQuestTemplateDefs.standard.map((template) => normalizeQuestTemplate(template, spot, "standard")).filter(Boolean);
}

function scheduleNextQuestSpawn(baseDelay = null) {
  const delay = Number.isFinite(baseDelay)
    ? baseDelay
    : (isEarlyGameAccelerated() ? randomInt(15000, 32000) : randomInt(35000, 70000));
  state.questNextSpawnAt = Date.now() + delay;
}

function spawnRandomQuest() {
  state.activeQuests = normalizeQuestList(state.activeQuests);
  state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  if (!state.registered || state.offeredQuests.length >= 3) return false;
  const occupiedSpotIds = new Set([
    ...state.activeQuests.map((quest) => quest.spotId),
    ...state.offeredQuests.map((quest) => quest.spotId),
  ]);
  const spots = clickableBuildingDefs.filter((spot) => spot.id !== state.mainBaseSpotId && !occupiedSpotIds.has(spot.id));
  if (!spots.length) return false;
  const spot = spots[randomInt(0, spots.length - 1)];
  const questTemplates = getMainQuestTemplates(spot);
  if (!questTemplates.length) return false;
  const template = questTemplates[randomInt(0, questTemplates.length - 1)];
  const questType = template.type;
  const difficulty = getBuildingDifficulty(spot);
  const reward = Math.random() < (isEarlyGameAccelerated() ? 0.78 : 0.45) ? buildQuestReward(questType, difficulty) : null;
  const offeredQuest = {
    id: typeof crypto?.randomUUID === "function"
      ? `quest-${crypto.randomUUID()}`
      : `quest-${Date.now()}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
    spotId: spot.id,
    spotName: spot.name,
    districtName: districtDefs[spot.districtIndex]?.name || "Kerulet",
    type: questType,
    status: "offered",
    title: template.title,
    description: `${spot.name} adta a melot. ${template.description}`,
    objective: template.objective,
    reward,
    moneyReward: template.money + Math.round(difficulty * 1.4),
    xpReward: template.xp + Math.floor(difficulty / (isEarlyGameAccelerated() ? 18 : 5)),
    goal: template.goal,
    createdAt: Date.now(),
  };
  state.offeredQuests.push(offeredQuest);
  state.activeQuest = offeredQuest;
  scheduleNextQuestSpawn();
  sceneRef?.pushLog(`Uj kuldetes jelent meg a(z) ${spot.name} felett.`);
  sceneRef?.setMessage(`Kuldetes erkezett: ${spot.name}.`);
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  return true;
}

function maybeSpawnQuest(force = false) {
  state.activeQuests = normalizeQuestList(state.activeQuests);
  state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  if (!state.registered || state.offeredQuests.length >= 3) {
    if (state.offeredQuests.length || state.activeQuests.length) updateQuestHud();
    return false;
  }
  if (!state.questNextSpawnAt) {
    scheduleNextQuestSpawn(randomInt(12000, 24000));
    saveGame();
    return false;
  }
  if (!force && Date.now() < state.questNextSpawnAt) return false;
  return spawnRandomQuest();
}

function completeQuest(actionType, spot) {
  const mode = spot?.mode === "shop" ? "shop" : "street";
  let reachedCompletion = false;
  const quests = normalizeQuestList(state.activeQuests);
  state.activeQuests = quests.map((quest) => {
    if (quest.status !== "accepted") return quest;
    if (quest.goal.action !== actionType) return quest;
    if (quest.goal.mode !== "any" && quest.goal.mode !== mode) return quest;

    quest.goal.progress = clamp(quest.goal.progress + 1, 0, quest.goal.target);
    sceneRef?.pushLog(`Kuldetes haladas: ${quest.title} (${quest.goal.progress}/${quest.goal.target}).`);
    if (quest.goal.progress < quest.goal.target) return quest;
    quest.status = "completed";
    reachedCompletion = true;
    sceneRef?.pushLog(`Kuldetes kesz: ${quest.title}. Atadasra var.`);
    sceneRef?.setMessage(`Keszen van: ${quest.title}. Nyomj az Atadas gombra az I/II slotban.`);
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

function getProtectionCooldownRemaining(spotId, now = Date.now()) {
  const expiresAt = Number(state.protectionCooldowns?.[spotId]) || 0;
  return Math.max(0, expiresAt - now);
}

function resetDailyHideUsesIfNeeded() {
  if (state.hideUsesDay === state.day) return false;
  state.hideUsesDay = state.day;
  state.hideUsesToday = 0;
  return true;
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
  };
}

function normalizeTimedActions() {
  const now = Date.now();
  const cooldowns = {};
  if (state.protectionCooldowns && typeof state.protectionCooldowns === "object") {
    Object.entries(state.protectionCooldowns).forEach(([spotId, expiresAt]) => {
      if (getSpotById(spotId) && Number.isFinite(Number(expiresAt)) && Number(expiresAt) > Date.now()) {
        cooldowns[spotId] = Number(expiresAt);
      }
    });
  }
  state.protectionCooldowns = cooldowns;
  state.recoveryEffects = {
    health: normalizeRecoveryEffect(state.recoveryEffects?.health),
    energy: normalizeRecoveryEffect(state.recoveryEffects?.energy),
  };
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
  state.hideUsesToday = clamp(Number.isFinite(Number(state.hideUsesToday)) ? Math.floor(Number(state.hideUsesToday)) : 0, 0, DAILY_HIDE_LIMIT);
  state.hideUsesDay = Number.isFinite(Number(state.hideUsesDay)) ? Math.floor(Number(state.hideUsesDay)) : state.day;
  resetDailyHideUsesIfNeeded();
}

function getPolicePressureInterval(heat = state.heat) {
  if (heat >= 90) return 75 * 1000;
  if (heat >= 75) return 2 * 60 * 1000;
  if (heat >= 60) return 3.5 * 60 * 1000;
  if (heat >= 45) return 8 * 60 * 1000;
  if (heat >= 25) return 14 * 60 * 1000;
  return 0;
}

function processPolicePressure(now = Date.now()) {
  if (!state.registered) return false;
  const baseInterval = getPolicePressureInterval(state.heat);
  if (!baseInterval) {
    state.nextPolicePressureAt = 0;
    return false;
  }
  const interval = Math.max(baseInterval, 15 * 60 * 1000);
  if (!state.nextPolicePressureAt) {
    state.nextPolicePressureAt = now + interval;
    return false;
  }
  if (now < state.nextPolicePressureAt) return false;

  let shouldStrike = true;
  if (state.heat < 60) {
    const pressureRoll = Math.abs(Math.sin((state.day + now / 60000) * 12.9898));
    shouldStrike = pressureRoll < (state.heat >= 45 ? 0.58 : 0.28);
  }

  state.nextPolicePressureAt = now + interval;
  if (!shouldStrike) {
    return false;
  }

  const heatSeverity = state.heat >= 90 ? 1.18 : state.heat >= 75 ? 1.08 : state.heat >= 60 ? 1 : 0.72;
  const loss = Math.max(1, Math.floor(state.money * 0.05 * heatSeverity));
  state.money = Math.max(0, state.money - loss);
  state.heat = clamp(state.heat - 13, 0, 100);
  sceneRef?.pushLog(`A rendorok razziat tartottak. -${loss} $ sarc a korozes miatt.`);
  const summaryText = state.heat >= 60
    ? "Magas korozes mellett a nyomozok egyre surubben utik rajtad a vasat. Most is sarcot vittek el a kasszabol."
    : "A korzet jarorei kiszurtak a mozgasodat, es penzzel tomted be a szajukat.";
  sceneRef?.setMessage(
    state.heat >= 60
      ? "Magas korozes: a rendorok egyre surubben szedik a sarcot."
      : "A rendorok gyanut fogtak, es egy kisebb sarcot vittek el.",
  );
  showPoliceRaidPanel(loss, summaryText);
  postGameEvent(
    "police_raid",
    "Rendőri razzia",
    `A rendőrök ${loss} $-t vittek el. A körözésed 13%-kal csökkent.`,
    { loss, heat: state.heat },
  );
  return true;
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
  return kind === "harbor" ? "Kikoto" : "Fo map";
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

function renderProcessTasks(now = Date.now()) {
  if (!hudProcessTasks) return;
  const kind = "harbor";
  ensureProcessQueueStarted(kind, now);
  const tasks = normalizeProcessTasks(getProcessTaskQueue(kind));
  const slots = Array.from({ length: MAX_PROCESS_TASKS }, (_, index) => {
    const task = tasks[index];
    if (!task) {
      return `<button class="hud-process-task hud-process-task--empty" type="button" title="${escapeHtml(getProcessTaskLabel(kind))}: szabad feladat hely"><span>+</span><strong>ures</strong></button>`;
    }
    const isActive = index === 0;
    const elapsed = isActive && task.startedAt ? Math.max(0, now - task.startedAt) : 0;
    const progress = isActive ? clamp((elapsed / task.durationMs) * 100, 0, 100) : 0;
    const remaining = isActive ? Math.max(0, task.durationMs - elapsed) : task.durationMs;
    return `
      <button
        class="hud-process-task${isActive ? "" : " hud-process-task--waiting"}"
        type="button"
        data-process-kind="${kind}"
        data-process-index="${index}"
        title="${escapeHtml(getProcessTaskLabel(kind))}: ${escapeHtml(task.title)} - kattintasra torles"
        style="--process:${progress}%">
        <span>${escapeHtml(task.icon)}</span>
        <strong>${isActive ? formatCountdown(remaining) : "var"}</strong>
        <em>${escapeHtml(task.title)}</em>
      </button>
    `;
  }).join("");
  hudProcessTasks.innerHTML = `
    <div class="hud-process-group hud-process-group--${kind}">
      <b>${escapeHtml(getProcessTaskLabel(kind))}</b>
      <div class="hud-process-group__bubbles">${slots}</div>
    </div>
  `;
}

function cancelProcessTask(kind = "harbor", index = 0) {
  const normalizedKind = kind === "main" ? "main" : "harbor";
  const taskIndex = Math.max(0, Math.round(Number(index) || 0));
  const tasks = normalizeProcessTasks(getProcessTaskQueue(normalizedKind));
  const [removed] = tasks.splice(taskIndex, 1);
  if (!removed) return false;
  if (tasks[0] && !tasks[0].startedAt) {
    tasks[0].startedAt = Date.now();
  }
  setProcessTaskQueue(normalizedKind, tasks);
  renderProcessTasks();
  saveGame();
  sceneRef?.setMessage(`${removed.title} torolve. A feladat helye felszabadult.`);
  sceneRef?.pushLog(`${getProcessTaskLabel(normalizedKind)} feladat torolve: ${removed.title}.`);
  return true;
}

function enqueueProcessTask(task, kind = task?.type === "harbor" ? "harbor" : "main") {
  syncProcessTasks(Date.now(), { skipRender: true });
  if (!hasProcessTaskSlot(kind)) {
    const label = kind === "harbor" ? "kikotoi" : "fo mapos";
    sceneRef?.setMessage(`Nincs szabad ${label} feladat kor. Varj, amig az egyik munka lejar.`);
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
  const changed = syncProcessQueue("harbor", now);
  if (!options.skipRender) renderProcessTasks(now);
  return changed;
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
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;
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
    expiresAt,
  };
}

function getActiveRivalEvent(now = Date.now()) {
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
          ${rival.intimidationStacks ? ` Megfelemlites: ${rival.intimidationStacks}/3.` : ""}
        </div>
      </div>
      ${pendingAction ? `
        <div class="rival-panel__progress">
          <span>${escapeHtml(pendingLabels[pendingAction.type] || "Muvelet")} folyamatban</span>
          <strong data-rival-action-countdown="${pendingAction.readyAt}">${formatCountdown(pendingAction.readyAt - Date.now())}</strong>
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

function startRivalTimedAction(spot, actionType) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  if (rival.pendingAction) {
    sceneRef?.setMessage(`Mar folyamatban van egy rivalis muvelet: ${formatCountdown(rival.pendingAction.readyAt - Date.now())}.`);
    renderRivalActionPanel(spot);
    return false;
  }
  const costs = { scout: 4, intimidate: 8, attack: 14 };
  const labels = { scout: "Felderites", intimidate: "Megfelemlites", attack: "Tamadas" };
  if (!Object.hasOwn(costs, actionType)) return false;
  if (actionType !== "scout" && !canStartCombat(`A ${labels[actionType].toLowerCase()} akciot`)) return false;
  if (!spendEnergy(costs[actionType])) return false;
  const now = Date.now();
  const readyAt = now + RIVAL_ACTION_DURATION_MS;
  state.rivalEvent = normalizeRivalEvent({
    ...rival,
    pendingAction: { type: actionType, startedAt: now, readyAt },
    expiresAt: Math.max(rival.expiresAt, readyAt + 60 * 1000),
  }, now);
  sceneRef?.setMessage(`${labels[actionType]} elindult. Eredmeny: ${formatCountdown(RIVAL_ACTION_DURATION_MS)} mulva.`);
  sceneRef?.pushLog(`${spot.name}: ${labels[actionType].toLowerCase()} elindult, ido 5 perc.`);
  saveGame(true);
  sceneRef?.refreshHUD();
  renderRivalActionPanel(spot);
  return true;
}

function handleRivalScout(spot) {
  return startRivalTimedAction(spot, "scout");
}

function handleRivalIntimidate(spot) {
  return startRivalTimedAction(spot, "intimidate");
}

function refreshRivalActionCountdown(now = Date.now()) {
  document.querySelectorAll("[data-rival-action-countdown]").forEach((element) => {
    const readyAt = Number(element.getAttribute("data-rival-action-countdown")) || 0;
    element.textContent = formatCountdown(Math.max(0, readyAt - now));
  });
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
    sceneRef?.setMessage(`${spot.name}: felderites kesz. Rivalis ero ${strength}, tamadasi esely ${Math.round(getRivalAttackChance(state.rivalEvent) * 100)}%.`);
    addLocalNotification("Felderites kesz", `${spot.name}: a rivalis banda ereje ${strength}.`, { messageType: "event" });
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

function handleRivalRetreat(spot) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  hideAuxPanel();
  sceneRef?.setMessage(`${spot.name}: a banda most elvonult. Kesobb visszaterhetsz.`);
  return true;
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
    expiresAt: now + RIVAL_EVENT_DURATION_MS,
  };
  sceneRef?.pushLog(`Rivalis banda jelent meg: ${spot.name}.`);
  sceneRef?.setMessage(`${spot.name} korul rivalis banda mozgolodik.`);
  addLocalNotification(
    "Rivalis banda",
    `${spot.name} kornyeken rivalis banda jelent meg. Lepj kozbe 5 oran belul.`,
    { messageType: "event" },
  );
  sceneRef?.refreshMap();
  return true;
}

function syncRivalEvent(now = Date.now()) {
  if (!state.registered) return false;
  const hadRival = Boolean(state.rivalEvent);
  const active = getActiveRivalEvent(now);
  if (hadRival && !active) {
    const loss = Math.min(state.money, Math.max(15, Math.round(state.money * 0.04)));
    state.money = Math.max(0, state.money - loss);
    state.districts.forEach((district) => {
      district.loyalty = clamp(district.loyalty - 2, 0, 100);
    });
    scheduleNextRivalEvent(now);
    sceneRef?.pushLog(`A rivalis banda elvitt ${loss} $-t, mert tul sokaig vartal.`);
    sceneRef?.setMessage(`Rivalis banda eltunt: -${loss} $, -2% befolyas.`);
    addLocalNotification(
      "Rivalis banda",
      `A rivalis banda eltunt, mire odaertel. Veszteseg: -${loss} $, -2% befolyas.`,
      { messageType: "event" },
    );
    sceneRef?.refreshMap();
    return true;
  }
  if (active) {
    if (active.pendingAction?.readyAt <= now) return completeRivalPendingAction(active, now);
    return false;
  }
  if (!Number.isFinite(Number(state.rivalNextSpawnAt)) || Number(state.rivalNextSpawnAt) <= 0) {
    scheduleNextRivalEvent(now);
    return true;
  }
  if (now >= Number(state.rivalNextSpawnAt)) return spawnRivalEvent(now);
  return false;
}

function syncTimedActions(now = Date.now()) {
  let changed = resetDailyHideUsesIfNeeded();
  if (syncNaturalRecovery(now)) changed = true;
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

  ["health", "energy"].forEach((stat) => {
    const effect = state.recoveryEffects?.[stat];
    if (!effect) return;
    const progress = clamp((now - effect.startedAt) / (effect.endsAt - effect.startedAt), 0, 1);
    const shouldBeApplied = Math.floor(RECOVERY_AMOUNT * progress);
    const delta = Math.max(0, shouldBeApplied - effect.appliedAmount);
    if (delta > 0) {
      state[stat] = clamp(state[stat] + delta, 0, 100);
      effect.appliedAmount += delta;
      changed = true;
    }
    if (progress >= 1 || effect.appliedAmount >= RECOVERY_AMOUNT || state[stat] >= 100) {
      state.recoveryEffects[stat] = null;
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

function startRecovery(stat) {
  syncTimedActions();
  const otherStat = stat === "health" ? "energy" : "health";
  if (state.recoveryEffects?.[otherStat]) {
    const remaining = state.recoveryEffects[otherStat].endsAt - Date.now();
    sceneRef?.setMessage(
      otherStat === "health"
        ? `A Lapulas mar folyamatban van. Hatralevo ido: ${formatCountdown(remaining)}.`
        : `A Talalkozo mar folyamatban van. Hatralevo ido: ${formatCountdown(remaining)}.`,
    );
    return false;
  }
  if (state[stat] >= 100) {
    sceneRef?.setMessage(stat === "health" ? "Az eleterod mar maximumon van." : "Az energiad mar maximumon van.");
    return false;
  }
  if (state.recoveryEffects?.[stat]) {
    const remaining = state.recoveryEffects[stat].endsAt - Date.now();
    sceneRef?.setMessage(`Ez a toltes mar folyamatban van. Hatralevo ido: ${formatCountdown(remaining)}.`);
    return false;
  }
  const now = Date.now();
  state.recoveryEffects[stat] = {
    startedAt: now,
    endsAt: now + RECOVERY_DURATION_MS,
    appliedAmount: 0,
  };
  return true;
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

function getBackgroundMapRect(width = window.innerWidth, height = window.innerHeight) {
  const scale = Math.min(width / backgroundMapFrame.width, height / backgroundMapFrame.height);
  const frameWidth = backgroundMapFrame.width * scale;
  const frameHeight = backgroundMapFrame.height * scale;
  return {
    width: frameWidth,
    height: frameHeight,
    left: (width - frameWidth) * backgroundMapFrame.positionX,
    top: (height - frameHeight) * backgroundMapFrame.positionY,
  };
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

  if (area.kind === "park" || area.kind === "lot") {
    showChoiceWheel(screenArea);
    return;
  }

  state.selectedDistrictIndex = clamp(area.districtIndex, 0, state.districts.length - 1);
  sceneRef?.refreshHUD();
  const quest = getQuestAtSpot(area.id);
  if (quest?.status === "offered") {
    sceneRef?.setMessage(`Uj kuldetes erheto el itt: ${area.name}.`);
  }
  showChoiceWheel(screenArea);
  saveGame();
}

function renderSvgMapOverlay() {
  if (!mapSvgOverlay) return;
  const mapRect = getBackgroundMapRect(window.innerWidth, window.innerHeight);
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
  mapSvgOverlay.appendChild(defs);
  [...clickableParkDefs, ...clickableLotDefs].forEach((area, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("map-svg-territory-group");
    const restoredBuilding = createRestoredBuildingOverlay(area);
    if (restoredBuilding) group.appendChild(restoredBuilding);
    group.appendChild(createTerritoryHoverOverlay(area, index, defs));
    const numberMarker = createLotNumberMarker(area);
    if (numberMarker) group.appendChild(numberMarker);

    const territoryClasses = [
      "map-svg-territory",
      area.kind === "park" ? "map-svg-territory--park" : "map-svg-territory--lot",
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
      hired: Boolean(legacyOwned),
      level,
      defenseLevel,
      attackBonus: Math.max(0, Math.round(Number(saved.attackBonus) || 0)),
      defenseBonus: Math.max(0, Math.round(Number(saved.defenseBonus) || 0)),
      health: clamp(Number.isFinite(saved.health) ? saved.health : template.baseHealth, 0, template.baseHealth),
      equipment: normalizeCrewEquipment(saved.equipment),
    };
  });
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
  return member ? member.baseAttack + (member.attackBonus || 0) + getCrewEquipmentPower(member, "attack") : 0;
}

function getCrewMemberDefense(member) {
  return member ? member.baseDefense + (member.defenseBonus || 0) + getCrewEquipmentPower(member, "defense") : 0;
}

function getCrewMemberUpgradeCost(member) {
  return member ? 45 + member.level * 35 : 0;
}

function getCrewMemberDefenseUpgradeCost(member) {
  return member ? 35 + member.defenseLevel * 30 : 0;
}

function getCrewMemberHealCost(member) {
  if (!member) return 0;
  const missingHealth = Math.max(0, member.baseHealth - member.health);
  if (!missingHealth) return 0;
  return 4 + Math.ceil(missingHealth * 0.55);
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
  const crewReadinessAverage = members.length
    ? members.reduce((sum, member) => sum + getCrewReadiness(member), 0) / members.length
    : 1;
  const activeAttack = getCrewMemberAttack(activeMember);
  const activeDefense = getCrewMemberDefense(activeMember);
  const rankLevel = getRankLevel(state.fame);
  const baseProfilePower = (
    state.gearPower
    + rankLevel * 8
    + state.cityLevel * 5
    + state.fame * 0.1
    + state.crew * 4
    + getEarlyGameActionBonus()
  );
  const assault = Math.round(
    baseProfilePower
      + activeAttack
      + crewAttackTotal * 0.72
      + crewDefenseTotal * 0.18
      + crewReadinessAverage * 14,
  );
  const pressure = Math.round(
    baseProfilePower
      + activeAttack * 0.55
      + activeDefense * 0.6
      + crewAttackTotal * 0.42
      + crewDefenseTotal * 0.48
      + crewReadinessAverage * 18,
  );
  const resilience = Math.round(
    baseProfilePower
      + activeDefense
      + crewDefenseTotal * 0.72
      + crewAttackTotal * 0.16
      + crewReadinessAverage * 22,
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
  const members = Array.isArray(state.crewMembers) ? state.crewMembers : makeCrewMembers();
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
          <img src="./assets/character/gangster-character.png" alt="${member.name}">
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

function hireCrewMember(memberId) {
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
  state.money -= cost;
  member.hired = true;
  member.level = 1;
  member.defenseLevel = 1;
  member.attackBonus = 0;
  member.defenseBonus = 0;
  member.health = member.baseHealth;
  member.equipment = normalizeCrewEquipment(member.equipment);
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = member.id;
  completeMentorStep("crew");
  crewPanelRenderKey = "";
  sceneRef?.pushLog(`${member.name} csatlakozott a bandahoz. -${cost} $.`);
  sceneRef?.setMessage(`${member.name} mostantol bevetheto.`);
  saveGame();
  sceneRef?.refreshHUD();
}

function upgradeCrewMember(memberId) {
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

  state.money -= cost;
  const gainedPoints = randomInt(1, 3);
  member.level += 1;
  member.attackBonus = Math.max(0, Math.round(Number(member.attackBonus) || 0)) + gainedPoints;
  state.activeCrewMemberId = member.id;
  completeMentorStep("crew");
  sceneRef?.pushLog(`${member.name} fejlodott. +${gainedPoints} ero, most ${member.level}. szintu.`);
  sceneRef?.setMessage(`${member.name} ereje +${gainedPoints} ponttal nott.`);
  saveGame();
  sceneRef?.refreshHUD();
}

function upgradeCrewMemberDefense(memberId) {
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

  state.money -= cost;
  const gainedPoints = randomInt(1, 3);
  member.defenseLevel += 1;
  member.defenseBonus = Math.max(0, Math.round(Number(member.defenseBonus) || 0)) + gainedPoints;
  state.activeCrewMemberId = member.id;
  completeMentorStep("crew");
  sceneRef?.pushLog(`${member.name} vedelme megerosodott. +${gainedPoints} pajzs.`);
  sceneRef?.setMessage(`${member.name} vedelme +${gainedPoints} ponttal nott.`);
  saveGame();
  sceneRef?.refreshHUD();
}

function healCrewMember(memberId) {
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
  state.money -= healCost;
  member.health = member.baseHealth;
  sceneRef?.pushLog(`${member.name} teljesen meggyogyult. -${healCost} $.`);
  sceneRef?.setMessage(`${member.name} ujra maximum eleteron van.`);
  saveGame();
  sceneRef?.refreshHUD();
}

function hideCrewEquipmentPicker() {
  activeCrewEquipmentSlot = null;
  crewEquipmentPicker?.classList.add("hidden");
  crewEquipmentPicker?.setAttribute("aria-hidden", "true");
  refreshCrewMemberPanel();
}

function getCrewMemberById(memberId) {
  return (Array.isArray(state.crewMembers) ? state.crewMembers : []).find((member) => member.id === memberId) || null;
}

function equipCrewInventoryItem(memberId, slot, itemId) {
  const member = getCrewMemberById(memberId);
  if (!member?.hired) return;
  const item = state.itemInventory?.[slot]?.find((entry) => entry.id === itemId);
  if (!item) return;
  if (isItemEquippedAnywhere(item.id, { owner: "crew", memberId })) {
    sceneRef?.setMessage("Ezt a targyat mar mas viseli.");
    return;
  }
  member.equipment = normalizeCrewEquipment(member.equipment);
  member.equipment[slot] = { ...item };
  state.activeCrewMemberId = member.id;
  crewPanelRenderKey = "";
  sceneRef?.setMessage(`${member.name} felszerelte: ${item.name}.`);
  refreshCrewMemberPanel();
  saveGame();
  sceneRef?.refreshHUD();
}

function showCrewEquipmentPicker(slot) {
  const member = getCrewMemberById(activeCrewSheetMemberId);
  const slotDef = equipmentSlotDefs[slot];
  const items = state.itemInventory?.[slot] || [];
  if (!member?.hired || !slotDef || !crewEquipmentPicker || !crewEquipmentPickerList) return;
  activeCrewEquipmentSlot = slot;
  if (crewEquipmentPickerTitle) crewEquipmentPickerTitle.textContent = `${member.name}: ${slotDef.label}`;
  crewEquipmentPickerList.innerHTML = items.map((item) => {
    const equipped = member.equipment?.[slot]?.id === item.id;
    const used = !equipped && isItemEquippedAnywhere(item.id, { owner: "crew", memberId: member.id });
    return `
      <button class="equipment-picker__item${equipped ? " is-equipped" : ""}" type="button" data-crew-equip-slot="${slot}" data-item-id="${item.id}"${used ? " disabled" : ""}>
        <img class="equipment-picker__art equipment-picker__art--${slot}" src="${item.image || getEquipmentArt(slot)}" alt="">
        <span class="equipment-picker__copy">
          <strong>${item.name}</strong>
          <small>${used ? "Mar hasznalatban" : getEquipmentBonusText(slot, item.power, item.stat)}</small>
        </span>
        <em>${equipped ? "Felveve" : used ? "Foglalt" : "Felveszem"}</em>
      </button>
    `;
  }).join("");
  crewEquipmentPicker.classList.remove("hidden");
  crewEquipmentPicker.setAttribute("aria-hidden", "false");
  refreshCrewMemberPanel();
}

function refreshCrewMemberPanel() {
  const member = getCrewMemberById(activeCrewSheetMemberId);
  if (!member?.hired || !crewMemberPanel) return;
  member.equipment = normalizeCrewEquipment(member.equipment);
  if (crewMemberPanelTitle) crewMemberPanelTitle.textContent = member.name;
  if (crewMemberPanelImage) crewMemberPanelImage.src = "./assets/character/gangster-character.png";
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
let activeRobberyGame = null;
let robberyAutoPlayTimer = null;

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

function createRobberyDefenders(spot, difficulty, forcedCount = null) {
  const count = clamp(
    Number.isFinite(Number(forcedCount)) ? Math.round(Number(forcedCount)) : (difficulty >= 72 ? 4 : difficulty >= 44 ? 3 : 2),
    1,
    4,
  );
  const types = ["watcher", "bodyguard", "boss", "bodyguard"];
  const names = ["Salvatore", "Tommy", "Vincent", "Giovanni"];

  return Array.from({ length: count }, (_, index) => {
    const type = types[index];
    const maxHealth = Math.round(28 + difficulty * 0.42 + index * 4);
    return {
      id: `${spot.id}-guard-${index}`,
      name: names[index],
      type,
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
  return Math.max(
    5,
    Math.round((baseGain + (Number(encounter.loot) || 0) + state.cityLevel * 4 + encounter.difficulty * 0.16) * rewardMultiplier),
  );
}

function finishRobberySuccess() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;

  const target = encounter.targetDistrict;
  const gain = getRobberyProjectedMoney(encounter);
  const fameGain = encounter.mode === "shop" ? 8 : 5;
  const heatGain = Math.round(7 + encounter.alert * 0.15);
  const actualHealthLost = Math.max(0, encounter.healthAtStart - state.health);
  const difficultyHealthFloor = clamp(Math.round(4 + encounter.difficulty * 0.16), 4, 25);
  const healthLost = clamp(Math.max(actualHealthLost, difficultyHealthFloor), 4, 25);
  state.health = clamp(encounter.healthAtStart - healthLost, 0, 100);
  state.naturalRecoveryAt.health = Date.now();

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
  const baseCap = label === "Veszelyes" ? 34 : label === "Kockazatos" ? 26 : 18;
  return String(reason).toLowerCase().includes("visszavonult") ? Math.max(8, Math.round(baseCap * 0.55)) : baseCap;
}

function finishRobberyFailure(reason) {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  const heatGain = encounter.alert >= 100 ? 18 : 8;
  const healthLossCap = getRobberyFailureHealthLossCap(encounter, reason);
  const minimumHealth = Math.max(1, encounter.healthAtStart - healthLossCap);
  state.health = clamp(Math.max(state.health, minimumHealth), 1, 100);
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
  syncEquipmentSheet();
}

function equipInventoryItem(slot, itemId) {
  const item = state.itemInventory?.[slot]?.find((entry) => entry.id === itemId);
  if (!item) return;
  if (state.equipment?.[slot]?.id === itemId) {
    state.equipment[slot] = null;
    recalculateGearPower();
    sceneRef?.setMessage(`${item.name} leveve a karakteredrol.`);
    refreshCharacterPanel();
    saveGame();
    if (activeEquipmentSlot === slot) showEquipmentPicker(slot);
    return;
  }
  if (isItemEquippedAnywhere(item.id, { owner: "player" })) {
    sceneRef?.setMessage("Ezt a targyat mar mas viseli.");
    return;
  }
  state.equipment[slot] = { ...item };
  recalculateGearPower();
  if (slot === "weapon") {
    state.mentorFlags.equippedItem = true;
    completeMentorStep("equip");
  }
  sceneRef?.setMessage(`${item.name} felveve a(z) ${equipmentSlotDefs[slot]?.label?.toLowerCase() || "felszereles"} helyere.`);
  refreshCharacterPanel();
  saveGame();
  if (activeEquipmentSlot === slot) showEquipmentPicker(slot);
}

function showEquipmentPicker(slot) {
  const slotDef = equipmentSlotDefs[slot];
  const items = state.itemInventory?.[slot];
  if (!slotDef || !Array.isArray(items) || !items.length || !equipmentPicker || !equipmentPickerList) return;
  activeEquipmentSlot = slot;
  if (equipmentPickerTitle) equipmentPickerTitle.textContent = slotDef.label;
  equipmentPickerList.innerHTML = items.map((item) => {
    const equipped = state.equipment?.[slot]?.id === item.id;
    const used = !equipped && isItemEquippedAnywhere(item.id, { owner: "player" });
    return `
      <button class="equipment-picker__item${equipped ? " is-equipped" : ""}" type="button" data-equip-slot="${slot}" data-item-id="${item.id}"${used ? " disabled" : ""}>
        <img class="equipment-picker__art equipment-picker__art--${slot}" src="${item.image || getEquipmentArt(slot)}" alt="">
        <span class="equipment-picker__copy">
          <strong>${item.name}</strong>
          <small>${used ? "Mar hasznalatban" : getEquipmentBonusText(slot, item.power, item.stat)}</small>
        </span>
        <em>${equipped ? "Felveve" : used ? "Foglalt" : "Felveszem"}</em>
      </button>
    `;
  }).join("");
  equipmentPicker.classList.remove("hidden");
  equipmentPicker.setAttribute("aria-hidden", "false");
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
  document.body.classList.remove("is-character-open");
  characterPanel?.classList.add("hidden");
  characterPanel?.setAttribute("aria-hidden", "true");
}

function hideChoiceWheel() {
  activeChoiceSpot = null;
  choiceWheel?.classList.add("hidden");
  choiceWheel?.setAttribute("aria-hidden", "true");
  sceneRef?.spotGraphics?.clear();
  clearSvgMapSelection();
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
      lotInfoDescription.textContent = "Ezt a hazat ketfelekeppen veheted meg: sajat hazkent kis napi bevetelert, vagy varosi hazkent, amit utana kirabolhatsz es vedelmi penzt is szedhetsz belole.";
    } else if (lot.restoredHouse && ownerType === "private") {
      lotInfoDescription.textContent = `${houseDef?.name || "Haz"}. Saját hazkent mukodik: naponta kis passziv penzt ad, es csak vedelmi penzt szedhetsz belole.`;
    } else if (lot.restoredHouse && ownerType === "city") {
      lotInfoDescription.textContent = `${houseDef?.name || "Haz"}. Varosi hazkent mukodik: kirabolhato, es vedelmi penzt is szedhetsz belole.`;
    } else {
      lotInfoDescription.textContent = houseDef
        ? `${houseDef.name}. A haz jelenleg stabil passziv bevetelt termel a birodalmadnak.`
        : "A telek meg ures. Vasarlas utan megjelenik rajta a 1930-as stilusu haz.";
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

function showChoiceWheel(spot) {
  activeChoiceSpot = spot;
  if (!choiceWheel || !choiceWheelPanel) return;
  syncTimedActions();
  hideQuestCard();

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
  choiceWheelPanel.style.left = `${x}px`;
  choiceWheelPanel.style.top = `${y}px`;
  if (spot.kind === "park") {
    setChoiceWheelButtons(["robbery", "protection", "baseRest", "close"]);
    const healthRecovery = state.recoveryEffects.health;
    const energyRecovery = state.recoveryEffects.energy;
    const hideUsesLeft = Math.max(0, DAILY_HIDE_LIMIT - state.hideUsesToday);
    if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
    if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Semleges terulet";
    if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Park";
    if (choiceWheelAction1) {
      choiceWheelAction1.textContent = healthRecovery
        ? `Lapulas (${formatCountdown(healthRecovery.endsAt - Date.now())})`
        : energyRecovery
          ? "Lapulas (varakozik)"
        : `Lapulas (+50 HP, ${hideUsesLeft}/3)`;
      choiceWheelAction1.disabled = Boolean(healthRecovery) || Boolean(energyRecovery) || hideUsesLeft <= 0;
    }
    if (choiceWheelAction2) {
      choiceWheelAction2.textContent = energyRecovery
        ? `Talalkozo (${formatCountdown(energyRecovery.endsAt - Date.now())})`
        : healthRecovery
          ? "Talalkozo (varakozik)"
        : "Talalkozo (+50 energia)";
      choiceWheelAction2.disabled = Boolean(energyRecovery) || Boolean(healthRecovery);
    }
    if (choiceWheelAction3) choiceWheelAction3.textContent = "Terulet info";
    if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
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
        if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Ketto modon vasarolhato haz";
        if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Ures haz";
        if (choiceWheelAction1) {
          choiceWheelAction1.textContent = `Sajatnak (${ownCost} $)`;
          choiceWheelAction1.disabled = !canAfford(ownCost);
        }
        if (choiceWheelAction2) {
          choiceWheelAction2.textContent = `Varosnak (${cityCost} $)`;
          choiceWheelAction2.disabled = !canAfford(cityCost);
        }
        if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
        if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
        if (choiceWheelAction5) choiceWheelAction5.textContent = "";
        return;
      }
      if (ownerType === "private") {
        setChoiceWheelButtons(["protection", "lotInfo", "close"]);
        if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
        if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = `Sajat haz - ${getLotIncome(spot)} $ / nap`;
        if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Sajat haz";
        if (choiceWheelAction2) choiceWheelAction2.textContent = "Vedelmi penz";
        if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
        if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
        if (choiceWheelAction5) choiceWheelAction5.textContent = "";
        return;
      }
      const robberyCost = spot.mode === "shop" ? 18 : 12;
      const protectionCost = 8;
      const canRob = state.health > 0 && state.energy >= robberyCost;
      const cooldown = getProtectionCooldownRemaining(spot.id);
      const canProtect = state.health > 0 && state.energy >= protectionCost;
      setChoiceWheelButtons(["robbery", "protection", "lotInfo", "close"]);
      if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
      if (choiceWheelSubtitle) choiceWheelSubtitle.textContent = "Varosi haz - kirabolhato";
      if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = "Varosi haz";
      if (choiceWheelAction1) {
        choiceWheelAction1.textContent = canRob ? `Kirablas (-${robberyCost})` : `Kirablas (${robberyCost} energia kell)`;
        choiceWheelAction1.disabled = !canRob;
      }
      if (choiceWheelAction2) {
        choiceWheelAction2.textContent = cooldown > 0
          ? `Vedelmi penz (${formatCountdown(cooldown)})`
          : canProtect
            ? `Vedelmi penz (-${protectionCost})`
            : `Vedelmi penz (${protectionCost} energia kell)`;
        choiceWheelAction2.disabled = cooldown > 0 || !canProtect;
      }
      if (choiceWheelAction3) choiceWheelAction3.textContent = "Telek info";
      if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
      if (choiceWheelAction5) choiceWheelAction5.textContent = "";
      return;
    }
    const cost = getLotInvestmentCost(spot);
    const isMaxLevel = level >= getLotMaxLevel(spot);
    setChoiceWheelButtons(level > 0
      ? [
          ...(isMaxLevel ? [] : ["robbery"]),
          "protection",
          "lotInfo",
          "close",
          "quest",
        ]
      : ["robbery", "protection", "close"]);
    if (choiceWheelTitle) choiceWheelTitle.textContent = spot.name;
    if (choiceWheelSubtitle) {
      choiceWheelSubtitle.textContent = houseDef
        ? `${houseDef.name} - ${getLotIncome(spot)} $ / nap`
        : "Megvasarolhato terulet";
    }
    if (choiceWheelCoreLabel) choiceWheelCoreLabel.textContent = houseDef ? `Haz ${level}` : "Ures telek";
    if (choiceWheelAction1) choiceWheelAction1.textContent = level ? `Fejlesztes (${cost} $)` : `Vasarlas (${cost} $)`;
    if (choiceWheelAction2) choiceWheelAction2.textContent = level ? "Vedelmi penz" : "Telek info";
    if (choiceWheelAction3) {
      choiceWheelAction3.textContent = level ? "Telek info" : "";
    }
    if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
    if (choiceWheelAction5) {
      choiceWheelAction5.textContent = level ? "Kirablas" : "";
      choiceWheelAction5.dataset.choiceAction = "lotRobbery";
    }
    return;
  }
  const quest = getQuestAtSpot(spot.id);
  const rival = getRivalEventAtSpot(spot.id);
  const difficulty = getBuildingDifficulty(spot);
  const difficultyInfo = getDifficultyInfo(difficulty);
  const robberyCost = spot.mode === "shop" ? 18 : 12;
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
    const canRob = state.health > 0 && state.energy >= robberyCost;
    choiceWheelAction1.textContent = canRob ? `Kirablas (-${robberyCost})` : `Kirablas (${robberyCost} energia kell)`;
    choiceWheelAction1.disabled = !canRob;
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
  if (choiceWheelAction4) choiceWheelAction4.textContent = "Bezaras";
  if (choiceWheelAction5) choiceWheelAction5.textContent = quest ? "Kuldetes" : "";
}

function runTerritoryAction(actionId, territory) {
  if (territory.kind === "park") {
    if (actionId === "robbery") {
      resetDailyHideUsesIfNeeded();
      if (state.hideUsesToday >= DAILY_HIDE_LIMIT) {
        sceneRef?.setMessage("A Lapulast ma mar haromszor hasznaltad.");
        return;
      }
      if (!startRecovery("health")) return;
      state.hideUsesToday += 1;
      const heatLoss = Math.min(state.heat, 10);
      state.heat -= heatLoss;
      state.districts.forEach((district) => {
        district.loyalty = clamp(district.loyalty - 3, 0, 100);
      });
      sceneRef?.pushLog(`${territory.name}: lapulas, -${heatLoss}% korozes, -3% befolyas.`);
      sceneRef?.setMessage("A Lapulas elindult: 20 perc alatt legfeljebb +50 eletero.");
    } else if (actionId === "protection") {
      if (!startRecovery("energy")) return;
      sceneRef?.pushLog(`${territory.name}: talalkozo indult.`);
      sceneRef?.setMessage("A Talalkozo elindult: 20 perc alatt legfeljebb +50 energia.");
    } else if (actionId === "baseRest") {
      sceneRef?.setMessage("A park semleges terulet: lapulashoz es talalkozokhoz hasznalhato.");
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
        state.money -= cost;
        state.territories[territory.id] = { level: 1, ownerType: targetOwnerType };
        applyFame(targetOwnerType === "private" ? 6 : 4);
        if (targetOwnerType === "private") {
          sceneRef?.pushLog(`${territory.restoredHouseName}: sajat hazkent megvasarolva, -${cost} $.`);
          sceneRef?.setMessage(`${territory.restoredHouseName}: mostantol kis napi bevetelt ad, es vedelmi penzt is szedhetsz belole.`);
        } else {
          sceneRef?.pushLog(`${territory.restoredHouseName}: varosi hazkent helyreallitva, -${cost} $.`);
          sceneRef?.setMessage(`${territory.restoredHouseName}: mostantol kirabolhato, es vedelmi penzt is szedhetsz belole.`);
        }
        return;
      }
      if (actionId === "lotInfo") {
        showLotInfoModal(territory);
        return;
      }
      if (actionId === "protection") {
        collectProtectionMoney(getSelectedDistrict(), territory.restoredHouseName || territory.name, territory);
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
      if (!spendEnergy(15)) return;
      state.money -= cost;
      state.territories[territory.id] = { level: level + 1 };
      applyFame(level === 0 ? 6 : 4);
      sceneRef?.pushLog(territory.restoredHouse
        ? `${territory.restoredHouseName}: telek megvasarolva, -${cost} $.`
        : `${territory.name}: haz ${level + 1}. szint, -${cost} $.`);
      sceneRef?.setMessage(`${territory.name}: ${getLotHouseDef(territory)?.name || "Haz"} - ${getLotIncome(territory)} $ napi bevetel.`);
    } else if (actionId === "protection") {
      if (level <= 0) {
        showLotInfoModal(territory);
        return;
      }
      collectProtectionMoney(getSelectedDistrict(), territory.name, territory);
    } else if (actionId === "lotInfo") {
      showLotInfoModal(territory);
    } else if (actionId === "lotRobbery") {
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

function runChoiceAction(actionId) {
  const spot = activeChoiceSpot;
  if (!spot) return;

  if (actionId === "close") {
    hideChoiceWheel();
    return;
  }

  if (actionId === "quest") {
    const quest = getQuestAtSpot(spot.id);
    if (!quest) {
      sceneRef?.setMessage("Itt most nincs elerheto kuldetes.");
      return;
    }
    hideChoiceWheel();
    showQuestCard(quest);
    return;
  }

  if (spot.kind === "park" || spot.kind === "lot") {
    runTerritoryAction(actionId, spot);
    saveGame();
    sceneRef?.refreshHUD();
    sceneRef?.refreshScene();
    if (spot.kind !== "lot" || !["protection", "lotInfo", "lotRobbery"].includes(actionId)) {
      hideChoiceWheel();
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
    collectProtectionMoney(getSelectedDistrict(), spot.name, spot);
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

async function setActiveProfileSession(profileName) {
  const normalizedProfileName = String(profileName || "").trim().slice(0, 18);
  if (!normalizedProfileName) throw new Error("missing_profile");
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileName: normalizedProfileName }),
  });
  if (!response.ok) {
    throw new Error(`Session API error: ${response.status}`);
  }
  return response.json();
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
    activeQuest: state.activeQuest,
    offeredQuests: state.offeredQuests,
    activeQuests: state.activeQuests,
    selectedQuestSlot: state.selectedQuestSlot,
    questNextSpawnAt: state.questNextSpawnAt,
    pendingProtectionRewards: state.pendingProtectionRewards,
    processTasks: state.processTasks,
    harborProcessTasks: state.harborProcessTasks,
    localNotifications: state.localNotifications,
    smuggledGoods: state.smuggledGoods,
    smugglerFame: state.smugglerFame,
    harborGarage: state.harborGarage,
    rivalEvent: state.rivalEvent,
    rivalNextSpawnAt: state.rivalNextSpawnAt,
    mentorStep: state.mentorStep,
    mentorCompleted: state.mentorCompleted,
    mentorFlags: state.mentorFlags,
    protectionCooldowns: state.protectionCooldowns,
    recoveryEffects: state.recoveryEffects,
    naturalRecoveryAt: state.naturalRecoveryAt,
    nextPolicePressureAt: state.nextPolicePressureAt,
    mainBaseClaimDay: state.mainBaseClaimDay,
    baseRestDay: state.baseRestDay,
    baseRestAvailableAt: state.baseRestAvailableAt,
    hideUsesToday: state.hideUsesToday,
    hideUsesDay: state.hideUsesDay,
    day: state.day,
    cityLevel: state.cityLevel,
    districts: state.districts,
    selectedDistrictIndex: state.selectedDistrictIndex,
    registered: state.registered,
  };
}

function hydrateState(saved) {
  if (!saved || typeof saved !== "object") return false;
  Object.assign(state, saved);
  state.profileStartedAt = Number.isFinite(Number(state.profileStartedAt)) ? Number(state.profileStartedAt) : Date.now();
  state.avatarId = normalizePlayerAvatarId(state.avatarId);
  state.needsAvatarSelection = Boolean(state.needsAvatarSelection && !state.avatarId);
  state.npcVillageVictories = Math.max(0, Math.round(Number(state.npcVillageVictories) || 0));
  if (!Array.isArray(state.districts) || state.districts.length === 0) {
    state.districts = makeDistricts();
  }
  state.day = Number.isFinite(state.day) ? state.day : 1;
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
  state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  if (state.activeQuest?.status === "offered" && !state.offeredQuests.some((quest) => quest.id === state.activeQuest.id)) {
    state.offeredQuests.unshift(state.activeQuest);
    state.offeredQuests = normalizeOfferedQuestList(state.offeredQuests);
  }
  state.activeQuests = normalizeQuestList(state.activeQuests);
  if (!state.activeQuests.length && state.activeQuest?.status === "accepted") {
    state.activeQuests = [state.activeQuest];
    state.activeQuest = null;
  }
  state.selectedQuestSlot = clamp(
    Number.isInteger(state.selectedQuestSlot) ? state.selectedQuestSlot : 0,
    0,
    1,
  );
  state.questNextSpawnAt = Number.isFinite(state.questNextSpawnAt)
    ? state.questNextSpawnAt
    : Date.now() + randomInt(12000, 24000);
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
  if (!response.ok) {
    throw new Error(`Save API error: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function flushQueuedSave(forceKeepalive = false) {
  if (saveRequestInFlight || !latestQueuedSave?.profileName) return saveRequestInFlight;
  const snapshot = latestQueuedSave;
  latestQueuedSave = null;
  saveRequestInFlight = requestSaveApi("PUT", { state: snapshot }, forceKeepalive)
    .catch(() => {
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
    void flushQueuedSave();
    return;
  }
  pendingSaveTimer = window.setTimeout(() => {
    pendingSaveTimer = null;
    void flushQueuedSave();
  }, 180);
}

async function deleteRemoteSave(profileName) {
  if (!profileName) return;
  try {
    await setActiveProfileSession(profileName);
    await requestSaveApi("DELETE");
  } catch {
    // Ignore delete failures so the UI reset can still complete locally.
  }
}

async function loadGame(profileName = "") {
  const normalizedProfileName = profileName.trim().slice(0, 18);
  if (!normalizedProfileName) return false;
  try {
    await setActiveProfileSession(normalizedProfileName);
    const response = await fetch(PROFILE_API_BASE, {
      headers: { Accept: "application/json" },
    });
    const remoteSave = response.ok ? await response.json() : { found: false };
    if (remoteSave?.found && hydrateState(remoteSave.state)) {
      rememberLastProfileName(state.profileName);
      queueSaveSnapshot(createSaveSnapshot(), true);
      return true;
    }
  } catch {
    // The game now loads exclusively from the server-managed database state.
  }
  return false;
}

function saveGame(immediate = false) {
  if (!state.registered || !state.profileName) return;
  queueSaveSnapshot(createSaveSnapshot(), immediate);
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
  const difference = difficulty - getActionPower(actionType);
  const enemyAttackShare = actionType === "protection" ? 0.52 : 0.58;
  const enemyAttack = Math.max(1, Math.round(difficulty * enemyAttackShare));
  const enemyDefense = Math.max(1, Math.round(difficulty - enemyAttack));
  if (difference <= 5) {
    return {
      label: "Konnyu",
      color: 0x62c878,
      successChance: clamp(0.86 - difference * 0.012, 0.78, 0.96),
      enemyAttack,
      enemyDefense,
    };
  }
  if (difference <= 20) {
    return {
      label: "Kockazatos",
      color: 0xd6ad42,
      successChance: clamp(0.68 - difference * 0.018, 0.38, 0.7),
      enemyAttack,
      enemyDefense,
    };
  }
  return {
    label: "Veszelyes",
    color: 0xc84f42,
    successChance: clamp(0.42 - difference * 0.012, 0.12, 0.38),
    enemyAttack,
    enemyDefense,
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
  const remaining = Math.max(0, Number(state.baseRestAvailableAt) - Date.now());
  if (remaining > 0) {
    sceneRef?.setMessage(`A bázison ${formatCountdown(remaining)} múlva pihenhetsz újra ingyen.`);
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
  completeMentorStep("rest");
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
    sceneRef?.setMessage("Ebben a keruletben most nincs megfelelo haz a kirablashoz.");
    return;
  }
  state.lastRobberySpotId = robberySpot.id;
  startRobberyMinigame({
    ...robberySpot,
    districtIndex: Number.isFinite(Number(robberySpot.districtIndex)) ? Number(robberySpot.districtIndex) : state.selectedDistrictIndex,
  });
}

function collectProtectionMoney(targetDistrict, buildingName = "Haz", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return false;
  }
  if (!canStartCombat("A vedelmi penz beszedest")) return false;
  if (targetSpot && getProtectionCooldownRemaining(targetSpot.id) > 0) {
    sceneRef?.setMessage(`Innen meg nem szedhetsz vedelmi penzt. Hatralevo ido: ${formatCountdown(getProtectionCooldownRemaining(targetSpot.id))}.`);
    return false;
  }
  if (!spendEnergy(8)) return false;

  const target = targetDistrict || getSelectedDistrict();
  const difficulty = targetSpot ? getBuildingDifficulty(targetSpot) : Math.round((target?.security ?? 50) * 0.82);
  const difficultyInfo = getDifficultyInfo(difficulty, "protection");
  const bandProfile = getBandPowerProfile();
  const adjustedProtectionChance = clamp(
    difficultyInfo.successChance * (0.74 + bandProfile.readiness * 0.2),
    0.18,
    0.88,
  );
  const gainBase = 14 + Math.round(difficulty * 0.16) + state.cityLevel * 4 + randomInt(0, 14);
  const lowReadinessPenalty = bandProfile.readiness < 0.6 ? Math.round((0.6 - bandProfile.readiness) * 16) : 0;

  const gain = Math.max(
    10,
    Math.round(gainBase * (0.84 + difficultyInfo.successChance * 0.42) - lowReadinessPenalty),
  );

  const fameGain = difficultyInfo.label === "Veszelyes" ? 5 : difficultyInfo.label === "Kockazatos" ? 4 : 3;
  const heatGain = difficultyInfo.label === "Veszelyes" ? 8 : difficultyInfo.label === "Kockazatos" ? 6 : 4;

  const reward = {
    spotId: targetSpot?.id || null,
    buildingName,
    districtIndex: state.selectedDistrictIndex,
    gain,
    fameGain,
    heatGain,
    successChance: adjustedProtectionChance,
    failHealthLossMin: difficultyInfo.label === "Veszelyes" ? 8 : 4,
    failHealthLossMax: difficultyInfo.label === "Veszelyes" ? 18 : 11,
    failHeatGain: difficultyInfo.label === "Veszelyes" ? 10 : difficultyInfo.label === "Kockazatos" ? 7 : 5,
    completesQuest: Boolean(targetSpot),
  };
  if (targetSpot) {
    state.protectionCooldowns[targetSpot.id] = Date.now() + PROTECTION_COOLDOWN_MS;
  }
  applyProtectionReward(reward);
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  return true;
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
    const heatGain = applyHeat(5);
    let rewardItemName = "";
    if (Math.random() <= 0.32) {
      const rivalReward = buildRivalRewardItem(rival);
      const unlocked = unlockEquipmentItem(rivalReward.slot, rivalReward.item);
      rewardItemName = unlocked?.name || rivalReward.item.name;
    }
    state.rivalEvent = null;
    scheduleNextRivalEvent();
    sceneRef?.pushLog(`${spot.name}: rivalis banda leverve. +${rival.rewardMoney} $, +${rival.rewardXp} XP.${rewardItemName ? ` Targy: ${rewardItemName}.` : ""}`);
    sceneRef?.setMessage(`Rivalis banda leverve. Jutalom: +${rival.rewardMoney} $, +${rival.rewardXp} XP, korozes +${heatGain}%.`);
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
    state.rivalEvent = { ...rival, expiresAt: Date.now() + Math.max(2 * 60 * 1000, Math.round((rival.expiresAt - Date.now()) * 0.55)) };
    sceneRef?.pushLog(`${spot.name}: a rivalis banda visszavert. -${loss} $, -${healthLoss} eletero.`);
    sceneRef?.setMessage(`A rivalis banda tul eros volt. -${loss} $, -${healthLoss} eletero.`);
    queueRewardModal({
      title: "Rivalis banda",
      text: `${spot.name}: a tamadas nem sikerult.`,
      money: -loss,
      xp: 0,
      fame: 0,
      showZeroValues: true,
    });
    addLocalNotification(
      "Rivalis banda",
      `${spot.name}: a rivalis banda visszavert. Veszteseg: -${loss} $, -${healthLoss} eletero, +${heatGain}% korozes.`,
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
  const loss = Math.floor(state.money * 0.22);
  state.money = Math.max(0, state.money - loss);
  state.crew = getHiredCrewMembers().length;
  state.heat = clamp(state.heat - 15, 0, 100);
  sceneRef?.pushLog(`Rajtaütés történt. -${loss} $, a banda fele kiesett, -15% körözés.`);
  sceneRef?.setMessage("A rendőrök elkaptak, de a körözésed 15%-kal csökkent.");
  postGameEvent(
    "police_bust",
    "Elkapott a rendőrség",
    `A rendőrök ${loss} $-t vittek el, a bandád megfeleződött, a körözésed pedig 15%-kal csökkent.`,
    { loss, heat: state.heat },
  );
  saveGame();
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
  resetDailyHideUsesIfNeeded();
  if (state.hideUsesToday >= DAILY_HIDE_LIMIT) {
    sceneRef?.setMessage("A Lapulast ma mar haromszor hasznaltad.");
    return;
  }
  if (!startRecovery("health")) return;
  state.hideUsesToday += 1;
  state.heat = clamp(state.heat - 10, 0, 100);
  state.districts.forEach((district) => {
    district.loyalty = clamp(district.loyalty - 3, 0, 100);
  });
  sceneRef?.pushLog("A banda lapulni kezdett. -10% korozes, -3% befolyas.");
  sceneRef?.setMessage("A Lapulas elindult: 20 perc alatt legfeljebb +50 eletero.");
  saveGame();
}

function endDay() {
  const controlled = state.districts.filter((district) => district.controlled);
  const districtIncome = controlled.reduce((sum, district) => sum + district.value * 20 + district.loyalty, 0);
  const territoryIncome = getTerritoryIncome();
  const income = districtIncome + territoryIncome;
  const fameBonus = controlled.length * 2 + state.cityLevel;

  state.money += income;
  applyFame(fameBonus);
  state.day += 1;
  state.hideUsesToday = 0;
  state.hideUsesDay = state.day;
  state.health = clamp(state.health + 10, 0, 100);
  state.energy = 100;
  advanceDistrictLoyalty();
  state.heat = clamp(state.heat - 6, 0, 100);
  sceneRef?.pushLog(`Nap vege: +${income} $ (${territoryIncome} $ hazbevetel), +${fameBonus} hirnev.`);

  if (state.heat >= 100) {
    triggerBust();
  }

  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  sceneRef?.setMessage(`Uj nap kezdodik. A birodalom most mar ${controlled.length} keruletet tart.`);
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
  state.questNextSpawnAt = Date.now() + randomInt(12000, 24000);
  state.pendingProtectionRewards = [];
  state.processTasks = [];
  state.harborProcessTasks = [];
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
  state.harborGarage = normalizeHarborGarage();
  state.rivalEvent = null;
  state.rivalNextSpawnAt = Date.now() + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
  state.mentorStep = 0;
  state.mentorCompleted = false;
  state.mentorFlags = { equippedItem: false, sawWorld: false, enteredHarbor: false };
  state.protectionCooldowns = {};
  state.recoveryEffects = { health: null, energy: null };
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
  state.buildingDifficultyCycle = getBuildingDifficultyCycle();
  state.buildingDifficulties = createRandomBuildingDifficulties(state.buildingDifficultyCycle, state.profileName);
  state.registered = true;
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
  state.questNextSpawnAt = Date.now() + randomInt(12000, 24000);
  state.pendingProtectionRewards = [];
  state.processTasks = [];
  state.harborProcessTasks = [];
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
  state.harborGarage = normalizeHarborGarage();
  state.rivalEvent = null;
  state.rivalNextSpawnAt = 0;
  state.mentorStep = 0;
  state.mentorCompleted = false;
  state.mentorFlags = { equippedItem: false, sawWorld: false, enteredHarbor: false };
  state.protectionCooldowns = {};
  state.recoveryEffects = { health: null, energy: null };
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
    this.actionButtons = [];
    this.logLines = [];
    this.clanChatLines = [];
    this.currentMessage = "";
    this.mapLayout = { originX: 0, originY: 0, tileW: 64, tileH: 32 };
    this.resizeRefreshTimer = null;
  }

  create() {
    sceneRef = this;
    this.mapGraphics = this.add.graphics();
    this.mapGraphics.setDepth(-100);
    this.highlightGraphics = this.add.graphics().setScrollFactor(0).setDepth(900);
    this.spotGraphics = this.add.graphics().setScrollFactor(0).setDepth(850);
    this.createUI();
    this.scale.on("resize", this.onResize, this);
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => maybeSpawnQuest(),
    });
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const changed = syncTimedActions();
        if (changed) {
          saveGame();
          this.refreshHUD();
        }
        refreshWorldRivalRepairTimers();
        refreshRivalActionCountdown();
        if (activeChoiceSpot) showChoiceWheel(activeChoiceSpot);
      },
    });
    this.assetsReady = false;
    this.setMessage("A varos betoltese folyamatban...");
    this.loadInlineAssets()
      .catch(() => {
        this.setMessage("Nehany regi modell nem toltodott be, a terkep tovabbra is hasznalhato.");
      })
      .finally(() => {
        this.assetsReady = true;
        this.refreshScene();
        maybeSpawnQuest();
        if (state.registered) {
          this.setMessage("A mentett birodalom betoltve.");
        }
      });
  }

  resetLogs() {
    this.clanChatLines = [];
    crewPanelRenderKey = "";
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
    const nextRankFame = getNextRankFame(state.fame);
    const currentRank = getCurrentRankEntry(state.fame);
    const currentThreshold = currentRank.fame;
    const xpSpan = Math.max(1, nextRankFame - currentThreshold);
    const xpProgress = clamp(Math.round(((state.fame - currentThreshold) / xpSpan) * 100), 0, 100);

    if (avatarNameEl) avatarNameEl.textContent = profileName;
    if (avatarLevelEl) avatarLevelEl.textContent = String(avatarLevel);
    if (avatarPortraitEl) avatarPortraitEl.src = getPlayerAvatarImage();
    if (avatarBar1TextEl) avatarBar1TextEl.textContent = `${healthValue} / ${healthMax}`;
    if (avatarBar2TextEl) avatarBar2TextEl.textContent = `${energyValue} / ${energyMax}`;
    if (avatarBar1FillEl) avatarBar1FillEl.style.width = `${(healthValue / healthMax) * 100}%`;
    if (avatarBar2FillEl) avatarBar2FillEl.style.width = `${(energyValue / energyMax) * 100}%`;
    if (avatarBar3TextEl) {
      avatarBar3TextEl.textContent = nextRankFame > state.fame
        ? `${state.fame - currentThreshold} / ${xpSpan} XP`
        : "Maximum XP";
    }
    if (avatarBar3FillEl) avatarBar3FillEl.style.width = `${nextRankFame > state.fame ? xpProgress : 100}%`;
    if (avatarNoteEl) {
      avatarNoteEl.textContent = this.currentMessage || (
        selected
          ? `${selected.name} - ${selected.kind}`
          : "Regisztralj, es indul a varosi felemelkedes."
      );
    }
    if (hudQuickDock) {
      const harborUnlocked = canEnterHarbor();
      const requiredLevel = getHarborRequiredLevel();
      hudQuickDock.disabled = !harborUnlocked;
      hudQuickDock.classList.toggle("is-locked", !harborUnlocked);
      hudQuickDock.title = harborUnlocked ? "Kikoto negyed" : `Kikoto negyed: ${requiredLevel}. szinttol`;
      hudQuickDock.setAttribute("aria-label", hudQuickDock.title);
      if (hudQuickDockLabel && !document.body.classList.contains("is-harbor-map-open")) {
        hudQuickDockLabel.textContent = harborUnlocked ? "" : `${requiredLevel}. szint`;
      }
    }
    refreshCharacterPanel();
    renderCrewPanel();

    updateQuestHud();
    updateMentorPanel();
    renderProcessTasks();
    if (hudQuestTab1) hudQuestTab1.classList.toggle("is-active", Boolean(state.activeQuests?.[0]));
    if (hudQuestTab2) hudQuestTab2.classList.toggle("is-active", Boolean(state.activeQuests?.[1]));

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
      ...DECOR_KEYS.slice(3).map((key) => [key, assets[key]]),
      [LOT_HOUSE_TEXTURE_KEYS[1], "./assets/lot-house-level-1.png"],
      [LOT_HOUSE_TEXTURE_KEYS[2], "./assets/lot-house-level-2.png"],
      [LOT_HOUSE_TEXTURE_KEYS[3], "./assets/lot-house-level-3.png"],
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
      zone.on("pointerup", () => {
        if (Date.now() <= mapDragState.ignoreClicksUntil) return;
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
  }

  refreshMap() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.resetSceneObjects();
    this.mapGraphics.clear();
    lotHouseLayer?.classList.add("hidden");
    renderSvgMapOverlay();
    if (!this.assetsReady) {
      return;
    }
    this.buildInteractiveMap(width, height);
    if (LOT_HOUSE_VISUALS_ENABLED) {
      this.renderOwnedLotHouses(width, height);
    }
    this.drawDistrictHighlight();
  }

  buildInteractiveMap(width, height) {
    const mapRect = getBackgroundMapRect(width, height);
    this.hotspotLayout = clickableBuildingDefs.map((spot) => {
      const bounds = getAreaBounds(spot);
      return {
        ...spot,
        x: mapRect.left + mapRect.width * bounds.x,
        y: mapRect.top + mapRect.height * bounds.y,
        w: mapRect.width * bounds.w,
        h: mapRect.height * bounds.h,
      };
    });
  }

  renderOwnedLotHouses(width, height) {
    if (!LOT_HOUSE_VISUALS_ENABLED) return;
    const mapRect = getBackgroundMapRect(width, height);
    clickableLotDefs.forEach((lot) => {
      const level = getLotLevel(lot);
      const textureKey = LOT_HOUSE_TEXTURE_KEYS[level];
      if (!textureKey || !this.textures.exists(textureKey)) return;

      const levelDef = lotHouseLevelDefs[level] || lotHouseLevelDefs[1];
      const metrics = getAreaScreenMetrics(lot, mapRect);
      const texture = this.textures.get(textureKey);
      const source = texture?.getSourceImage?.();
      const aspectRatio = source && source.width && source.height
        ? source.height / source.width
        : 1;
      const lotPixelWidth = metrics.width;
      const lotPixelHeight = metrics.height;
      const groundInset = 9;

      this.mapGraphics.fillStyle(0x766548, 0.18);
      this.mapGraphics.lineStyle(1, 0xb89a64, 0.18);
      this.mapGraphics.beginPath();
      metrics.points.forEach((point, index) => {
        if (index === 0) {
          this.mapGraphics.moveTo(point.x, point.y);
          return;
        }
        this.mapGraphics.lineTo(point.x, point.y);
      });
      this.mapGraphics.closePath();
      this.mapGraphics.fillPath();
      this.mapGraphics.strokePath();

      let drawWidth = lotPixelWidth * levelDef.widthFactor;
      let drawHeight = drawWidth * aspectRatio;
      const maxHeight = lotPixelHeight * levelDef.heightFactor;
      if (drawHeight > maxHeight) {
        drawHeight = maxHeight;
        drawWidth = drawHeight / aspectRatio;
      }

      const anchorX = metrics.centerX;
      const anchorY = metrics.bottom - groundInset - lotPixelHeight * levelDef.yOffset;
      const sprite = this.add.image(anchorX, anchorY, textureKey);
      sprite.setOrigin(0.5, 1);
      sprite.setDisplaySize(drawWidth, drawHeight);
      sprite.setAngle(0);
      sprite.setAlpha(0.99);
      sprite.setDepth(anchorY + 20);
      this.mapSprites.push(sprite);
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
    if (this.resizeRefreshTimer) {
      window.clearTimeout(this.resizeRefreshTimer);
    }
    this.resizeRefreshTimer = window.setTimeout(() => {
      this.resizeRefreshTimer = null;
      this.refreshMap();
      this.layoutUI();
    }, 100);
  }

  update() {
    // The city map is event-driven; no per-frame redraw is needed.
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

createRobberyDefenders = function createThreeDefenders(spot, difficulty, count = 3) {
  const names = ["Salvatore", "Vincent", "Tommy"];
  const types = ["watcher", "boss", "bodyguard"];
  const defenderCount = clamp(Math.round(Number(count) || 3), 1, names.length);
  const defenderLevel = clamp(Math.round(difficulty / 12), 1, 18);
  return names.slice(0, defenderCount).map((name, index) => {
    const maxHealth = Math.round(34 + defenderLevel * 4 + difficulty * 0.06 + index * 4);
    return {
      id: `${spot.id}-guard-${index}`,
      name,
      type: types[index],
      level: defenderLevel + index,
      maxHealth,
      health: maxHealth,
      attack: Math.round(6 + defenderLevel * 1.55 + index * 2),
      defense: Math.round(4 + defenderLevel * 1.3 + index),
    };
  });
};

function createBattleAllies(selectedMemberIds) {
  const members = selectedMemberIds
    .map((memberId) => state.crewMembers.find((member) => member.id === memberId))
    .filter((member) => member?.hired && Number(member.health) > 0)
    .slice(0, 2)
    .map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      level: Math.max(1, Math.round(Number(member.level) || 1)),
      maxHealth: member.baseHealth,
      health: member.health,
      attack: getCrewMemberAttack(member),
      defense: getCrewMemberDefense(member),
      isPlayer: false,
    }));
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
    isPlayer: true,
  };
  return [members[0], player, members[1]].filter(Boolean);
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

function canStartRobberySelection(encounter) {
  return Boolean(encounter) && !encounter.battleStarted;
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

function queueRobberyAutoPlay(encounter, delay = 420) {
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
  queueRobberyAutoPlay(encounter, 680);
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
  if (encounter?.battleMode === "lone") return "./assets/battle/solo-raid.png";
  if (encounter?.battleMode === "solo") return "./assets/battle/battle-duo.png";
  const defeatedKey = defenders.map((defender) => defender.health <= 0 ? "1" : "0").join("");
  const backgroundsByDefeatedEnemy = {
    "000": "./assets/battle/battle.png",
    "100": "./assets/battle/battle1.png",
    "010": "./assets/battle/battle-dead-center.png",
    "001": "./assets/battle/battle-dead-right.png",
    "110": "./assets/battle/battle-dead-left-center.png",
    "101": "./assets/battle/battle-2.png",
    "011": "./assets/battle/battle-dead-center-right.png",
    "111": "./assets/battle/battle3.png",
  };
  return backgroundsByDefeatedEnemy[defeatedKey] || "./assets/battle/battle.png";
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
  const hiredMembers = getHiredCrewMembers();
  const readyMembers = hiredMembers.filter((member) => Number(member.health) > 0);
  encounter.selectedMemberIds = encounter.selectedMemberIds.filter((memberId) => (
    readyMembers.some((member) => member.id === memberId)
  ));
  const selectedDefender = encounter.defenders.find((defender) => defender.id === encounter.selectedDefenderId && defender.health > 0);
  const arena = robberyGame.querySelector(".robbery-game__arena");
  const control = getRobberyControl(encounter);
  const enemyPower = getEncounterEnemyPower(encounter);
  const animation = encounter.actionAnimation || {};

  if (arena) {
    arena.style.backgroundImage = `linear-gradient(180deg, rgba(4, 3, 2, 0.08), rgba(4, 3, 2, 0.34)), url("${getBattleBackground(encounter)}")`;
    arena.style.backgroundPosition = "center center";
    arena.style.backgroundSize = (encounter.battleMode === "solo" || encounter.battleMode === "lone") ? "cover" : "contain";
    arena.classList.toggle("is-enemy-thinking", animation.side === "enemy" && animation.type === "thinking");
  }
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(encounter.difficultyInfo?.color || 0xd6ad42));
  robberyGame.classList.toggle("is-team-selection", !encounter.battleStarted);
  robberyGame.classList.toggle("is-solo-battle", encounter.battleMode === "solo" || encounter.battleMode === "lone");
  if (robberyGameTitle) robberyGameTitle.textContent = encounter.spot.name;
  if (robberyGameSubtitle) robberyGameSubtitle.textContent = encounter.battleStarted
    ? `${encounter.difficultyInfo.label} harc - ${
      encounter.battleMode === "lone"
        ? "egyedul, nagyon kis zsakmany"
        : encounter.battleMode === "solo"
          ? "kisebb csapat, kisebb zsakmany"
          : "teljes csapat"
    }`
    : (readyMembers.length
      ? "Valassz 1 vagy 2 harckepes embert magad melle"
      : (hiredMembers.length ? "Minden embered harckeptelen - egyedul indulhatsz" : "Nincs felvett embered, egyedul indulsz"));
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
      ? `Csapattarsak: ${encounter.selectedMemberIds.length}/2 - 1 emberrel is indithato`
      : (hiredMembers.length
        ? "A 0 HP-s embereket elobb meg kell gyogyitani"
        : "Nincs felvett embered: egyedul indulsz, kisebb jutalommal"));
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
    const unit = document.createElement("div");
    unit.className = `battle-unit battle-unit--ally battle-unit--ally-count-${encounter.allies.length} battle-unit--ally-${index + 1}${ally.health <= 0 ? " is-defeated" : ""}${ally.isPlayer ? " is-player" : ""}`;
    unit.dataset.unitId = ally.id;
    unit.classList.toggle("is-attacking", animation.actorId === ally.id && animation.type === "attack");
    unit.classList.toggle("is-targeted", animation.targetId === ally.id);
    unit.classList.toggle("is-thinking", animation.actorId === ally.id && (animation.type === "thinking" || animation.type === "aim"));
    unit.innerHTML = `
      <span class="battle-unit__name">${ally.name}</span>
      <span class="battle-unit__role">${ally.role}</span>
      <span class="battle-unit__combat">Szint ${ally.level || 1} · Ero ${ally.attack} · Vedelem ${ally.defense}</span>
      <span class="battle-unit__health"><i style="width:${healthPercent}%"></i></span>
      <em>${healthPercent}%</em>
    `;
    robberyAllies?.appendChild(unit);
  });

  robberyTeamPicker?.classList.toggle("is-hidden", encounter.battleStarted);
  robberyTeamPicker?.replaceChildren();
  hiredMembers.forEach((member) => {
    const selected = encounter.selectedMemberIds.includes(member.id);
    const incapacitated = Number(member.health) <= 0;
    const locked = encounter.battleStarted || incapacitated || (!selected && encounter.selectedMemberIds.length >= 2);
    const attack = getCrewMemberAttack(member);
    const defense = getCrewMemberDefense(member);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `robbery-team-choice${selected ? " is-selected" : ""}${incapacitated ? " is-incapacitated" : ""}`;
    button.classList.toggle("is-disabled", locked);
    button.disabled = locked;
    button.innerHTML = `
      <div class="robbery-team-choice__portrait">
        <img src="./assets/character/gangster-character.png" alt="${member.name}">
        <div class="robbery-team-choice__level">${member.level}. szint</div>
      </div>
      <div class="robbery-team-choice__body">
        <div class="robbery-team-choice__header">
          <strong>${member.name}</strong>
          <small>${incapacitated ? "Harckeptelen - gyogyitsd meg" : member.role}</small>
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
        ? activeRobberyGame.selectedMemberIds.filter((id) => id !== member.id)
        : [...activeRobberyGame.selectedMemberIds, member.id];
      activeRobberyGame.message = `${activeRobberyGame.selectedMemberIds.length}/2 csapattars kivalasztva. Egy emberrel kisebb jutalom jar.`;
      refreshRobberyGame();
      if (activeRobberyGame.autoPlay && canStartRobberySelection(activeRobberyGame)) {
        queueRobberyAutoPlay(activeRobberyGame, 260);
      } else if (activeRobberyGame.selectedMemberIds.length < 1) {
        clearRobberyAutoPlay();
      }
    });
    robberyTeamPicker?.appendChild(button);
  });
  if (!readyMembers.length && !encounter.battleStarted) {
    const note = document.createElement("div");
    note.className = "robbery-team-empty";
    note.textContent = hiredMembers.length
      ? "Minden embered 0 HP-n van. Gyogyitsd meg oket a banda panelen, vagy indulj egyedul csokkentett jutalomert."
      : "Nincs felvett embered. A fonok egyedul megy be, a jutalom erosen csokkentett.";
    robberyTeamPicker?.appendChild(note);
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
      ? (!readyMembers.length || encounter.selectedMemberIds.length === 0
        ? "Egyeduli rajtautes"
        : (encounter.selectedMemberIds.length === 1 ? "Kis csapat inditasa" : "Harc inditasa"))
      : encounter.turnLocked
        ? "Ellenseg lep..."
        : encounter.autoPlay
          ? "Automata harc fut"
          : "Tamadas";
  }
};

startRobberyMinigame = function startThreeVsThreeBattle(spot) {
  if (!state.registered || !spot || !robberyGame) return;
  if (!canStartCombat("A rajtautest")) return;
  const energyCost = spot.mode === "shop" ? 18 : 12;
  if (!spendEnergy(energyCost)) return;
  const difficulty = getBuildingDifficulty(spot);
  const defenders = createRobberyDefenders(spot, difficulty, 1);
  const hiredMembers = getHiredCrewMembers();
  const readyMembers = hiredMembers.filter((member) => Number(member.health) > 0);
  activeRobberyGame = {
    spot,
    targetDistrict: state.districts[spot.districtIndex] || getSelectedDistrict(),
    mode: spot.mode === "shop" ? "shop" : "street",
    difficulty,
    difficultyInfo: getDifficultyInfo(difficulty),
    defenders,
    allies: [],
    selectedMemberIds: [],
    selectedDefenderId: defenders[0].id,
    battleStarted: false,
    battleMode: readyMembers.length ? "full" : "lone",
    rewardMultiplier: 1,
    allyTurnIndex: 0,
    alert: 0,
    loot: 0,
    round: 1,
    healthAtStart: state.health,
    message: readyMembers.length
      ? "Valassz 1 vagy 2 embert a harc megkezdesehez. Egy emberrel kevesebb jutalom jar."
      : (hiredMembers.length
        ? "Minden embered 0 HP-n van. Gyogyitsd meg oket, vagy indulj egyedul csokkentett jutalomert."
        : "Nincs felberelt embered, egyedul mesz be. A jutalom erosen csokkentett."),
    turnLocked: false,
    actionAnimation: null,
    ended: false,
    autoPlay: false,
  };
  clearRobberyAutoPlay();
  hideChoiceWheel();
  document.body.classList.add("is-robbery-open");
  robberyResult?.classList.add("hidden");
  robberyResult?.classList.remove("is-failure");
  robberyGame.classList.remove("hidden");
  robberyGame.setAttribute("aria-hidden", "false");
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(getDifficultyInfo(difficulty).color));
  refreshRobberyGame();
  sceneRef?.refreshHUD();
};

playRobberyTurn = function playThreeVsThreeTurn() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  if (!encounter.battleStarted) {
    if (!canStartRobberySelection(encounter)) return;
    encounter.allies = createBattleAllies(encounter.selectedMemberIds);
    encounter.battleMode = getRobberyBattleMode(encounter.allies.length);
    encounter.rewardMultiplier = getRobberyRewardMultiplier(encounter.battleMode);
    const defenderCount = clamp(encounter.allies.length, 1, 3);
    encounter.defenders = createRobberyDefenders(encounter.spot, encounter.difficulty, defenderCount);
    encounter.selectedDefenderId = encounter.defenders[0]?.id || null;
    rebalanceDefendersForEncounter(encounter);
    encounter.battleStarted = true;
    encounter.message = encounter.battleMode === "lone"
      ? "Egyedul indultal. Az ellenfel is egyedul van, de a jutalom nagyon kicsi."
      : encounter.battleMode === "solo"
        ? "Kis csapat indult. Ketten vagytok ket ellenfel ellen, a jutalom joval kisebb."
        : "A harc elkezdodott. Valassz ellenseget, majd tamadj!";
    refreshRobberyGame();
    queueRobberyAutoPlay(encounter, 520);
    return;
  }
  if (encounter.turnLocked) return;

  const livingAllies = encounter.allies.filter((ally) => ally.health > 0);
  const livingEnemies = encounter.defenders.filter((defender) => defender.health > 0);
  if (!livingAllies.length) {
    finishRobberyFailure("A teljes csapatod elesett.");
    return;
  }
  if (!livingEnemies.length) {
    finishRobberySuccess();
    return;
  }
  const attacker = livingAllies[encounter.allyTurnIndex % livingAllies.length];
  const target = encounter.defenders.find((defender) => defender.id === encounter.selectedDefenderId && defender.health > 0) || livingEnemies[0];
  if (!attacker || !target) return;

  const tactic = robberyTacticDefs[encounter.selectedTactic] || robberyTacticDefs.stealth;
  const underdogBonus = getRobberyUnderdogBonus(encounter);
  const tacticBonus = tactic.strongAgainst === target.type ? 1.16 : 1;
  const effectiveAttack = getBattleUnitEffectiveAttack(attacker);
  const targetDefense = getBattleUnitEffectiveDefense(target);
  const rawDamage = Math.round(
    (effectiveAttack + (attacker.level || 1) * 1.05 + randomInt(-4, 5)) * tacticBonus * underdogBonus.playerDamageBoost,
  );
  const damage = clamp(
    rawDamage
      - Math.round(targetDefense * Math.max(0.4, 0.62 - underdogBonus.defenseIgnore))
      - Math.round((target.level || 1) * 0.46),
    3,
    Math.max(4, Math.round(effectiveAttack * 0.94 + (attacker.level || 1) * 0.8)),
  );
  target.health = Math.max(0, target.health - damage);
  encounter.loot += randomInt(3, 7) + (target.health <= 0 ? randomInt(6, 12) : 0);
  encounter.alert = clamp(encounter.alert + Math.round(tactic.alert * 0.45) + randomInt(1, 4), 0, 100);
  encounter.turnLocked = true;
  encounter.actionAnimation = {
    actorId: attacker.id,
    targetId: target.id,
    side: "ally",
    type: "attack",
  };
  encounter.message = `${attacker.name} ${damage} sebzest okozott ${target.name} ellen.`;
  refreshRobberyGame();
  sceneRef?.refreshHUD();

  const enemiesAfterAttack = encounter.defenders.filter((defender) => defender.health > 0);
  if (!enemiesAfterAttack.length) {
    syncBattleHealth(encounter);
    encounter.finalizing = true;
    encounter.message = `${target.name} is kiesett. Az ellenseges csapat legyozve.`;
    refreshRobberyGame();
    window.setTimeout(() => {
      if (activeRobberyGame === encounter && !encounter.ended) {
        finishRobberySuccess();
      }
    }, 760);
    return;
  }

  encounter.selectedDefenderId = target.health > 0 ? target.id : enemiesAfterAttack[0].id;
  window.setTimeout(() => {
    scheduleEnemyCounterattack(encounter);
  }, 500);
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

  hudQuickRank?.addEventListener("click", () => openAuxPanel("rank"));
  hudQuickMarket?.addEventListener("click", () => openAuxPanel("market"));
  hudQuickClan?.addEventListener("click", () => openAuxPanel("clan"));
  hudQuickWorld?.addEventListener("click", () => openAuxPanel("world"));
  hudQuickMessages?.addEventListener("click", () => openAuxPanel("messages"));
  hudQuickDock?.addEventListener("click", () => openAuxPanel("harbor"));
  hudMainMapButton?.addEventListener("click", hideHarborMapView);
  hudProcessTasks?.addEventListener("click", (event) => {
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
      sceneRef?.setMessage("Az I. slotban nincs felvett kuldetes.");
    }
  });
  hudQuestTab2?.addEventListener("click", () => {
    const quest = getQuestSlot(1);
    state.selectedQuestSlot = 1;
    if (quest) {
      showQuestCard(quest);
    } else {
      sceneRef?.setMessage("A II. slotban nincs felvett kuldetes.");
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
    if (hudMentorCard) delete hudMentorCard.dataset.userClosed;
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
      else showEquipmentPicker(slotId);
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
      else showEquipmentPicker(slotId);
    }
  });
  crewCards?.addEventListener("click", (event) => {
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
    if (button.dataset.crewAction === "hire") {
      hireCrewMember(memberId);
    } else if (button.dataset.crewAction === "upgrade") {
      upgradeCrewMember(memberId);
    } else if (button.dataset.crewAction === "heal") {
      healCrewMember(memberId);
    } else if (button.dataset.crewAction === "defense") {
      upgradeCrewMemberDefense(memberId);
    }
  });
  crewMemberPanelClose?.addEventListener("click", hideCrewMemberPanel);
  crewMemberPanelBackdrop?.addEventListener("click", hideCrewMemberPanel);
  crewMemberEquipmentGrid?.addEventListener("click", (event) => {
    const slot = event.target.closest("[data-crew-slot]");
    if (!slot) return;
    const slotId = slot.dataset.crewSlot;
    if (activeCrewEquipmentSlot === slotId) hideCrewEquipmentPicker();
    else showCrewEquipmentPicker(slotId);
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

  robberyTactics.forEach((button) => {
    button.addEventListener("click", () => {
      if (!activeRobberyGame || activeRobberyGame.ended) return;
      activeRobberyGame.selectedTactic = button.dataset.tactic || "stealth";
      activeRobberyGame.message = `${robberyTacticDefs[activeRobberyGame.selectedTactic].name} kiválasztva.`;
      refreshRobberyGame();
      if (activeRobberyGame.autoPlay && activeRobberyGame.battleStarted && !activeRobberyGame.turnLocked) {
        queueRobberyAutoPlay(activeRobberyGame, 220);
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
      queueRobberyAutoPlay(activeRobberyGame, activeRobberyGame.battleStarted ? 220 : 260);
    } else {
      clearRobberyAutoPlay();
    }
  });
  robberyAttack?.addEventListener("click", playRobberyTurn);
  robberyGameRetreat?.addEventListener("click", retreatFromRobbery);
  robberyResultContinue?.addEventListener("click", closeRobberyGame);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
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

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }

  registerForm.querySelector('button[type="submit"]')?.setAttribute("disabled", "disabled");
  try {
    await setActiveProfileSession(name);
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
  } catch {
    sceneRef?.setMessage("A szerver most nem elérhető. Próbáld meg újra.");
  }
  registerForm.querySelector('button[type="submit"]')?.removeAttribute("disabled");
});

playerNameInput.value = getRememberedProfileName();

document.querySelectorAll("[data-password-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordTarget || "");
    if (!input) return;
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.setAttribute("aria-label", reveal ? "Jelszó elrejtése" : "Jelszó megjelenítése");
    button.classList.toggle("is-active", reveal);
  });
});

document.getElementById("previewRegistrationForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.getElementById("registrationStatus");
  if (status) status.textContent = "A regisztráció még nincs bekapcsolva. A bal oldalon egy névvel már beléphetsz.";
});

document.getElementById("forgotPasswordButton")?.addEventListener("click", () => {
  const status = document.getElementById("loginStatus");
  if (status) status.textContent = "Még nincs szükség jelszóra: írj be egy nevet, majd kattints a Belépés gombra.";
  playerNameInput.focus();
});

bindHudActions();
setHudVisible(false);
loadGameConfigFromDatabase().finally(() => {
  new Phaser.Game(config);
});

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
function addDevButton() {
  const btn = document.createElement("button");
  btn.textContent = "DEV: Élet + Energia";
  btn.style.position = "fixed";
  btn.style.right = "20px";
  btn.style.bottom = "20px";
  btn.style.zIndex = "99999";
  btn.style.padding = "12px";
  btn.style.background = "red";
  btn.style.color = "white";

 btn.onclick = () => {
  state.health = 100;
  state.energy = 100;

  if (Array.isArray(state.crewMembers)) {
    state.crewMembers.forEach(member => {
      member.health = member.baseHealth;
    });
  }

    saveGame();
    sceneRef?.refreshHUD();
    sceneRef?.setMessage("DEV: teljes gyógyítás.");
  };

  document.body.appendChild(btn);
}

addDevButton();
