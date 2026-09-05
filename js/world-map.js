// Vilagterkep, rivalis varosok es vilagterkepi megjelenites.
const WORLD_MAP_CONTINUOUS_SRC = "./assets/world/world-map-mafia-v2-9516.webp?v=world-map-mafia-v2-2026-08-27-5";
const WORLD_MAP_CONTINUOUS_SRCSET = "./assets/world/world-map-mafia-v2-9516.webp?v=world-map-mafia-v2-2026-08-27-5 9516w";
const WORLD_MAP_TILE_WIDTH = 1586;
const WORLD_MAP_TILE_HEIGHT = 992;
const WORLD_MAP_TILE_COLS = 6;
const WORLD_MAP_TILE_ROWS = 5;
// A 9516x4960-as forraskep teljes reszletesseggel toltodik be, de kisebb
// CSS-meretben jelenik meg. Igy egyszerre nagyobb terulet latszik, mikozben
// a terkep eles marad es a telekjelolok nem zsugorodnak ossze.
const WORLD_MAP_DISPLAY_SCALE = 0.28;
const WORLD_MAP_LOT_ROWS = [
  { y: 16, xs: [18, 31, 44, 57, 70, 83] },
  { y: 28, xs: [12, 25, 38, 51, 64, 77, 89] },
  { y: 42, xs: [18, 31, 44, 57, 70, 83] },
  { y: 57, xs: [12, 25, 38, 51, 64, 77, 89] },
  { y: 73, xs: [18, 31, 44, 57, 70, 83] },
  { y: 87, xs: [24, 40, 56, 72, 86] },
];
// Normalizalt, kezzel ellenorzott zold teruletek a 9516x4960-as terkepen.
// A telekjelolok es az elfoglalt telkek hazai csak ezeken a tisztasokon jelennek meg.
const WORLD_MAP_BUILDABLE_ZONES = [
  [0.13, 0.13, 0.095, 0.06],
  [0.05, 0.23, 0.035, 0.05],
  [0.32, 0.27, 0.055, 0.05],
  [0.39, 0.25, 0.035, 0.04],
  [0.52, 0.18, 0.06, 0.05],
  [0.58, 0.17, 0.035, 0.04],
  [0.69, 0.04, 0.055, 0.035],
  [0.80, 0.22, 0.05, 0.05],
  [0.94, 0.32, 0.045, 0.055],
  [0.08, 0.43, 0.05, 0.05],
  [0.15, 0.61, 0.045, 0.045],
  [0.29, 0.43, 0.04, 0.05],
  [0.34, 0.60, 0.04, 0.05],
  [0.46, 0.59, 0.045, 0.05],
  [0.51, 0.63, 0.03, 0.04],
  [0.66, 0.55, 0.045, 0.05],
  [0.75, 0.55, 0.045, 0.05],
  [0.87, 0.58, 0.045, 0.045],
  [0.97, 0.63, 0.025, 0.045],
  [0.035, 0.70, 0.035, 0.045],
  [0.16, 0.64, 0.035, 0.04],
  [0.12, 0.91, 0.05, 0.05],
  [0.27, 0.83, 0.045, 0.05],
  [0.59, 0.84, 0.045, 0.05],
  [0.76, 0.84, 0.045, 0.05],
  [0.88, 0.83, 0.045, 0.05],
];
const WORLD_MAP_BUILDABLE_SITE_OFFSETS = [
  [0, 0],
  [-0.36, -0.30],
  [0, -0.36],
  [0.36, -0.30],
  [-0.52, 0],
  [-0.20, 0],
  [0.20, 0],
  [0.52, 0],
  [-0.36, 0.30],
  [0, 0.36],
  [0.36, 0.30],
];
const WORLD_MAP_BUILDABLE_SPREAD = 2.35;
const WORLD_MAP_CODE_COLUMNS_PER_TILE = Math.max(...WORLD_MAP_LOT_ROWS.map((row) => row.xs.length));

// Ez a fajl a fo game.js elott toltodik be, ezert az inditaskor futó
// telekgeneralas nem tamaszkodhat a game.js kesobb letrejovo clamp fuggvenyere.
function clampWorldMapBootstrap(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}
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
  "./assets/world/world-rival-castle-1.webp?v=2026-07-12-1",
  "./assets/world/world-rival-castle-2.webp?v=2026-07-12-1",
  "./assets/world/world-rival-castle-3.webp?v=2026-07-12-1",
];
const WORLD_RIVAL_CITY_MAP_ASSETS = [
  "./assets/world/npc-city-map-1.webp",
  "./assets/world/npc-city-map-2.webp",
  "./assets/world/npc-city-map-3.webp",
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

function buildWorldMapBuildableSites(targetCount) {
  const fullWidth = WORLD_MAP_TILE_WIDTH * WORLD_MAP_TILE_COLS;
  const fullHeight = WORLD_MAP_TILE_HEIGHT * WORLD_MAP_TILE_ROWS;
  const safeCount = Math.max(1, Math.round(Number(targetCount) || 1));
  const aspectRatio = fullWidth / fullHeight;
  const columns = Math.ceil(Math.sqrt(safeCount * aspectRatio));
  const rows = Math.ceil(safeCount / columns);
  const cells = [];
  let seed = 0x6d2b79f5;
  const nextRandom = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) >>> 0;
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const jitterX = (nextRandom() - 0.5) * 0.34;
      const jitterY = (nextRandom() - 0.5) * 0.34;
      cells.push({
        x: ((column + 0.5 + jitterX) / columns) * fullWidth,
        y: ((row + 0.5 + jitterY) / rows) * fullHeight,
      });
    }
  }
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
  }
  return cells.slice(0, safeCount);
}

function getWorldMapCanvasMetrics() {
  return {
    width: Math.round(WORLD_MAP_TILE_WIDTH * WORLD_MAP_TILE_COLS * WORLD_MAP_DISPLAY_SCALE),
    height: Math.round(WORLD_MAP_TILE_HEIGHT * WORLD_MAP_TILE_ROWS * WORLD_MAP_DISPLAY_SCALE),
  };
}

function getWorldMapDisplayCoordinate(value) {
  return Math.round((Number(value) || 0) * WORLD_MAP_DISPLAY_SCALE * 100) / 100;
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
  const visualPosition = getWorldMapLotVisualPosition(lot);
  const displayX = getWorldMapDisplayCoordinate(visualPosition.x);
  const displayY = getWorldMapDisplayCoordinate(visualPosition.y);
  return `
    <button
      class="worldmap__lot${isOccupied ? " is-occupied" : " is-free"}${isOwn ? " is-own" : ""}"
      type="button"
      data-world-lot="${lot.id}"
      data-world-code="${lot.code}"
      data-world-coord="${lot.coord}"
      data-world-label="${escapeHtml(label)}"
      data-world-x="${displayX}"
      data-world-y="${displayY}"
      style="left:${displayX}px; top:${displayY}px"
      ${selectionMode && isOccupied && !isOwn ? "disabled" : ""}
      title="${escapeHtml(label)}"
      aria-label="${escapeHtml(owner?.profileName || `${lot.code} ${lot.coord} - ures telek`)}">
      ${isOccupied ? `<img class="worldmap__house worldmap__house--level-${level}" src="${houseAsset}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : ""}
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
const worldMapLotIndexById = new Map(worldMapLotDefs.map((lot, index) => [lot.id, index]));
const worldMapBuildableSites = buildWorldMapBuildableSites(worldMapLotDefs.length);

function getWorldMapLotVisualPosition(lot) {
  const lotIndex = worldMapLotIndexById.get(lot?.id);
  if (!Number.isInteger(lotIndex) || !worldMapBuildableSites.length) {
    return { x: Number(lot?.x) || 0, y: Number(lot?.y) || 0 };
  }
  return worldMapBuildableSites[lotIndex] || { x: Number(lot?.x) || 0, y: Number(lot?.y) || 0 };
}

function getWorldMapVisualDistance(leftLot, rightLot) {
  const left = getWorldMapLotVisualPosition(leftLot);
  const right = getWorldMapLotVisualPosition(rightLot);
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function isWorldRivalLotFarEnough(lot, cities, minimumDistance = WORLD_MAP_TILE_WIDTH * 0.48) {
  if (!lot) return false;
  return !(Array.isArray(cities) ? cities : []).some((city) => {
    const cityLot = getWorldMapLotById(city?.lotId);
    return cityLot && getWorldMapVisualDistance(lot, cityLot) < minimumDistance;
  });
}

function getVisibleWorldMapLotDefs(occupiedLots = {}, requiredLotIds = []) {
  const requiredIds = new Set(
    [
      ...Object.keys(occupiedLots || {}),
      ...(Array.isArray(requiredLotIds) ? requiredLotIds : []),
    ].filter(Boolean),
  );
  const selectedIds = new Set();
  for (let groupStart = 0; groupStart < worldMapLotDefs.length; groupStart += 4) {
    const group = worldMapLotDefs.slice(groupStart, groupStart + 4);
    const requiredLots = group.filter((lot) => requiredIds.has(lot.id));
    if (requiredLots.length) {
      requiredLots.forEach((lot) => selectedIds.add(lot.id));
    } else if (group[0]) {
      selectedIds.add(group[0].id);
    }
  }

  return worldMapLotDefs.filter((lot) => selectedIds.has(lot.id));
}

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
  const storedPower = Math.max(24, Math.round(Number(entry?.power) || (68 + level * 24)));
  const balanceVersion = Math.max(0, Math.round(Number(entry?.balanceVersion) || 0));
  const playerMapPower = typeof getActionPower === "function"
    ? Math.max(1, Math.round(Number(getActionPower("map")) || 0))
    : 0;
  const levelPowerRatio = level === 1 ? 0.72 : level === 2 ? 0.9 : 1.08;
  const progressionFloor = 86 + level * 30 + Math.max(1, Number(state.cityLevel) || 1) * 8;
  const matchedPower = playerMapPower > 0
    ? Math.round(playerMapPower * levelPowerRatio + level * 10)
    : 0;
  // A regi mentesekben a rivalisok tul alacsony erovel maradtak meg.
  // Csak egyszer emeljuk fel oket; utana a jatekos felszerelessel folejuk nohet.
  const power = status === "hostile" && balanceVersion < 2
    ? Math.max(storedPower, progressionFloor, matchedPower)
    : storedPower;
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
    balanceVersion: 2,
    assetIndex,
    themeId: String(entry?.themeId || theme.id),
    districtLabel: String(entry?.districtLabel || theme.label),
    bossTitle: String(entry?.bossTitle || theme.bossTitle),
    mapImage: optimizedAssetPath(String(entry?.mapImage || theme.mapImage || WORLD_RIVAL_CITY_MAP_ASSETS[0])),
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
  const playerMapPower = typeof getActionPower === "function"
    ? Math.max(1, Math.round(Number(getActionPower("map")) || 0))
    : 0;
  const levelPowerRatio = level === 1 ? 0.72 : level === 2 ? 0.9 : 1.08;
  const randomPowerOffset = (baseSeed % 25) - 12;
  const progressionFloor = 86 + level * 30 + Math.max(1, Number(state.cityLevel) || 1) * 8;
  const matchedPower = playerMapPower > 0
    ? Math.round(playerMapPower * levelPowerRatio + level * 10 + randomPowerOffset)
    : 0;
  return normalizeWorldRivalCity({
    id: `world-rival-${lot.id}-${baseSeed.toString(36).slice(0, 6)}`,
    lotId: lot.id,
    name: buildWorldRivalCityName(`${lot.id}-${baseSeed}`),
    status: "hostile",
    level,
    power: Math.max(progressionFloor, matchedPower),
    balanceVersion: 2,
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
    if (city.status !== "captured" && !isWorldRivalLotFarEnough(lot, output)) return;
    output.push(city);
    usedLots.add(city.lotId);
  });
  const desiredHostiles = getDesiredWorldRivalCityCount();
  let hostileCount = output.filter((city) => city.status === "hostile").length;
  const availableLots = worldMapLotDefs.filter((lot) => !blockedLots.has(lot.id) && !usedLots.has(lot.id));
  const baseLot = getWorldMapLotById(state.worldBaseLotId) || worldMapLotDefs[Math.floor(worldMapLotDefs.length / 2)];
  const playerBaseLots = Array.from(new Set([
    ...Object.keys(occupiedLots || {}),
    ...(state.worldBaseLotId ? [state.worldBaseLotId] : []),
  ])).map(getWorldMapLotById).filter(Boolean);
  const coverageRadius = WORLD_MAP_TILE_WIDTH * 0.9;
  playerBaseLots.forEach((playerBase, playerIndex) => {
    const alreadyCovered = output.some((city) => {
      if (city.status !== "hostile") return false;
      const cityLot = getWorldMapLotById(city.lotId);
      return cityLot && Math.hypot(cityLot.x - playerBase.x, cityLot.y - playerBase.y) <= coverageRadius;
    });
    if (alreadyCovered || hostileCount >= WORLD_RIVAL_CITY_MAX_COUNT || !availableLots.length) return;
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    availableLots.forEach((lot, index) => {
      if (!isWorldRivalLotFarEnough(lot, output)) return;
      const distance = Math.hypot(lot.x - playerBase.x, lot.y - playerBase.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    if (nearestIndex < 0) return;
    const [lot] = availableLots.splice(nearestIndex, 1);
    if (!lot) return;
    const city = createWorldRivalCityForLot(lot, output.length + playerIndex, now);
    output.push(city);
    usedLots.add(lot.id);
    hostileCount += 1;
  });
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
      if (!isWorldRivalLotFarEnough(lot, output)) continue;
      const city = createWorldRivalCityForLot(lot, output.length, now);
      output.push(city);
      usedLots.add(lot.id);
      hostileCount += 1;
      missingNear -= 1;
    }
  }
  while (hostileCount < desiredHostiles && availableLots.length) {
    let nextIndex = -1;
    let bestCoverageDistance = -1;
    availableLots.forEach((candidate, index) => {
      if (!isWorldRivalLotFarEnough(candidate, output)) return;
      const nearestCityDistance = output.reduce((nearest, city) => {
        if (city.status !== "hostile") return nearest;
        const cityLot = getWorldMapLotById(city.lotId);
        if (!cityLot) return nearest;
        return Math.min(nearest, Math.hypot(candidate.x - cityLot.x, candidate.y - cityLot.y));
      }, Infinity);
      if (nearestCityDistance > bestCoverageDistance) {
        bestCoverageDistance = nearestCityDistance;
        nextIndex = index;
      }
    });
    if (nextIndex < 0) break;
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
  const baseMoney = Math.round(targetMoney * progress);
  const influenceRate = typeof getInfluenceBenefits === "function"
    ? getInfluenceBenefits().worldTributeRate
    : 0;
  const influenceBonus = Math.max(0, Math.round(baseMoney * influenceRate));
  return {
    money: baseMoney + influenceBonus,
    baseMoney,
    influenceBonus,
    influenceBonusPercent: Math.round(influenceRate * 1000) / 10,
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
  const clearedBonus = areWorldRivalStructuresCleared(city) ? 12 : 0;
  const targetPower = Math.max(1, city.power + city.level * 20 + structurePenalty - (city.weakened ? 28 : 0) - clearedBonus);
  return clamp(0.36 + ((mapPower - targetPower) / 320), 0.14, 0.84);
}

function buildWorldRivalCityButton(city) {
  const lot = getWorldMapLotById(city?.lotId);
  if (!lot || !city) return "";
  const remaining = getWorldRivalRemainingStructures(city).length;
  const label = `${city.name} | ${city.status === "captured" ? "elfoglalt" : "rivalis"} falu | ${remaining} haz`;
  const visualPosition = getWorldMapLotVisualPosition(lot);
  const displayX = getWorldMapDisplayCoordinate(visualPosition.x);
  const displayY = getWorldMapDisplayCoordinate(visualPosition.y);
  return `
    <button
      class="worldmap__rival-city worldmap__rival-city--${city.status}${city.weakened ? " is-weakened" : ""}"
      type="button"
      data-world-rival="${city.id}"
      data-world-rival-lot="${lot.id}"
      data-world-label="${escapeHtml(city.name)}"
      data-world-x="${displayX}"
      data-world-y="${displayY}"
      style="left:${displayX}px; top:${displayY}px"
      aria-label="${escapeHtml(label)}">
      <img class="worldmap__rival-city-art worldmap__rival-city-art--level-${city.level}" src="${getWorldRivalCityAsset(city.assetIndex)}" alt="" aria-hidden="true" loading="lazy" decoding="async">
      <span class="worldmap__rival-city-badge">${city.status === "captured" ? "S" : "R"}</span>
    </button>
  `;
}
