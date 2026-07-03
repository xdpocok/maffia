const STORAGE_KEY = "maffia.birodalom.save.phaser.v3";
const LEGACY_STORAGE_KEYS = [STORAGE_KEY, "maffia.birodalom.save.phaser.v2", "maffia.birodalom.save.phaser.v1"];
const LAST_PROFILE_KEY = "maffia.birodalom.lastProfile";
const SAVE_API_BASE = "/api/saves";
const PROFILE_API_BASE = "/api/profile";
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
const HEAT_GAIN_MULTIPLIER = 0.58;
const RIVAL_SPAWN_MIN_MS = 6 * 60 * 1000;
const RIVAL_SPAWN_MAX_MS = 11 * 60 * 1000;
const RIVAL_EVENT_DURATION_MS = 12 * 60 * 1000;
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

const rankTable = rankNames.map((name, index) => ({
  fame: 30 * index * index,
  name,
}));

const WORLD_MAP_EMPTY_SRC = "./t%C3%A9k%C3%A9p/7fe4a123-f5d0-4381-b12f-6b208bff958c.png";
const WORLD_MAP_SETTLED_SRC = "./t%C3%A9k%C3%A9p/26414562-afef-4966-9f34-1a8eb9fe0a0e.png";
const WORLD_MAP_CONTINUOUS_SRC = "./assets/world/world-map-expanded-optimized.webp";
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
  if (isOwn) return "Ez a sajat kulso bazisod helye.";
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
  return `
    <button
      class="worldmap__lot${isOccupied ? " is-occupied" : " is-free"}${isOwn ? " is-own" : ""}"
      type="button"
      data-world-lot="${lot.id}"
      data-world-code="${lot.code}"
      data-world-coord="${lot.coord}"
      data-world-label="${lot.code} / ${lot.coord}"
      data-world-x="${lot.x}"
      data-world-y="${lot.y}"
      style="left:${lot.x}px; top:${lot.y}px"
      ${selectionMode && isOccupied && !isOwn ? "disabled" : ""}
      aria-label="${lot.code} ${lot.coord}${owner ? ` - ${owner.profileName}` : " - ures telek"}">
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
        <p id="worldMapLotText">Kattints egy szabad telekre, vagy keresd meg koordinata alapjan a kezdo bazisod helyet.</p>
        <div id="worldMapLotMeta" class="worldmap__meta">${ownLot ? `Allapot: a tied | Bazisszint: ${clamp(Math.round(Number(state.worldBaseLevel) || 1), 1, 3)}` : "Allapot: ures telek"}</div>
      </div>
      ${selectionMode ? `<button id="worldMapChooseBtn" class="worldmap__choose" type="button" disabled>Ez lesz a bazisom</button>` : ``}
    </div>
  `;
}

const worldMapLotDefs = buildWorldMapLotDefs();

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
  "market-row": { asset: "./assets/map/purchasable-houses/market-row.png", x: 794, y: 205, width: 298, height: 223 },
  "west-mid-block": { asset: "./assets/map/purchasable-houses/west-mid-block.png", x: 256, y: 291, width: 278, height: 237 },
  "east-office": { asset: "./assets/map/purchasable-houses/east-office.png", x: 935, y: 329, width: 292, height: 245 },
  "central-bank": { asset: "./assets/map/purchasable-houses/central-bank.png", x: 685, y: 481, width: 274, height: 270 },
  "southwest-tenement": { asset: "./assets/map/purchasable-houses/southwest-tenement.png", x: 227, y: 693, width: 317, height: 290 },
  "courthouse": { asset: "./assets/map/purchasable-houses/courthouse.png", x: 950, y: 579, width: 299, height: 279 },
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
      income: 80,
      overlayNumberMarker: building.number === "13",
    })),
];

const lotHouseLevelDefs = {
  1: {
    name: "Kisbolti telekhaz",
    asset: "./lot-house-shop-level-1.png",
    income: 80,
    widthFactor: 0.56,
    heightFactor: 0.58,
    yOffset: 0.08,
  },
  2: {
    name: "Kavezos telekhaz",
    asset: "./lot-house-shop-level-2.png",
    income: 190,
    widthFactor: 0.62,
    heightFactor: 0.62,
    yOffset: 0.085,
  },
  3: {
    name: "Diszes viragboltos telekhaz",
    asset: "./lot-house-shop-level-3.png",
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
  luca: 0,
  marco: 350,
  enzo: 700,
};

function makeCrewMembers() {
  return crewMemberTemplates.map((member, index) => ({
    ...member,
    hired: index === 0,
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

const state = {
  profileName: "",
  money: 120,
  fame: 0,
  crew: 1,
  heat: 0,
  health: 100,
  energy: 100,
  gearPower: 0,
  equipment: getDefaultEquipment(),
  itemInventory: getDefaultItemInventory(),
  crewMembers: makeCrewMembers(),
  activeCrewMemberId: "luca",
  mainBaseSpotId: null,
  worldBaseLotId: null,
  worldBaseLevel: 1,
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
  smuggledGoods: { counterfeitMoney: 0, drugs: 0, weapons: 0, papers: 0 },
  smugglerFame: 0,
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
let questCardQuestId = null;
let activeEquipmentSlot = null;
let mentorCardOpen = false;
let mentorStepCompleting = false;
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
const hudRoot = document.getElementById("hudRoot");
const mapBackgroundLayer = document.getElementById("mapBackgroundLayer");
const lotHouseLayer = document.getElementById("lotHouseLayer");
const mapSvgOverlay = document.getElementById("mapSvgOverlay");
const auxPanel = document.getElementById("auxPanel");
const auxPanelBackdrop = document.getElementById("auxPanelBackdrop");
const auxPanelTitle = document.getElementById("auxPanelTitle");
const auxPanelSubtitle = document.getElementById("auxPanelSubtitle");
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
const characterPanel = document.getElementById("characterPanel");
const characterPanelBackdrop = document.getElementById("characterPanelBackdrop");
const characterPanelClose = document.getElementById("characterPanelClose");
const equipmentPicker = document.getElementById("equipmentPicker");
const equipmentPickerTitle = document.getElementById("equipmentPickerTitle");
const equipmentPickerList = document.getElementById("equipmentPickerList");
const equipmentPickerClose = document.getElementById("equipmentPickerClose");
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
  return Object.fromEntries(
    equipmentSlotOrder.map((slot) => [slot, { ...equipmentCatalog[slot][0] }]),
  );
}

function getEmptyEquipment() {
  return Object.fromEntries(equipmentSlotOrder.map((slot) => [slot, null]));
}

function getDefaultItemInventory() {
  return Object.fromEntries(
    equipmentSlotOrder.map((slot) => [slot, equipmentCatalog[slot].map((item) => ({ ...item }))]),
  );
}

function findEquipmentCatalogItem(slot, rawItem) {
  const list = equipmentCatalog[slot] || [];
  if (!list.length) return null;
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
    name: typeof rawItem?.name === "string" ? rawItem.name : template.name,
    power: Number.isFinite(rawItem?.power) ? Math.max(0, rawItem.power) : template.power,
    stat: rawItem?.stat === "defense" || rawItem?.stat === "attack" ? rawItem.stat : template.stat,
    rarity,
    // A regi mentesekben megmaradt kep-utvonalak helyett mindig a jelenlegi assetet hasznaljuk.
    image: template.image || getEquipmentRarityImage(slot, rarity) || getEquipmentArt(slot),
  };
}

function normalizeItemInventory(source, equipment = null) {
  const defaults = getDefaultItemInventory();
  const output = {};
  equipmentSlotOrder.forEach((slot) => {
    const savedItems = Array.isArray(source?.[slot]) ? source[slot] : [];
    const merged = new Map(defaults[slot].map((item) => [item.id, { ...item }]));
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
  const refreshEveryMs = 4 * 60 * 60 * 1000;
  const needsMigration = Array.isArray(state.marketStock) && state.marketStock.some((entry) => !String(entry?.item?.id || "").startsWith("market-"));
  if (!Array.isArray(state.marketStock) || !state.marketStock.length || !Number.isFinite(state.marketRefreshAt) || now >= state.marketRefreshAt || needsMigration) {
    state.marketStock = generateMarketStock(state.profileName || "market", now);
    state.marketRefreshAt = now + refreshEveryMs;
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
  if (!slot || !state.itemInventory?.[slot]) return null;
  const item = normalizeEquipmentItem(slot, rawItem);
  if (!item) return null;
  if (!state.itemInventory[slot].some((entry) => entry.id === item.id)) {
    state.itemInventory[slot].push(item);
  }
  return item;
}

function normalizeEquipment(source) {
  const defaults = getDefaultEquipment();
  const output = {};
  Object.entries(defaults).forEach(([slot, item]) => {
    let saved = source && typeof source === "object" ? source[slot] : null;
    if (!saved && slot === "pants") saved = source?.trousers || null;
    output[slot] = normalizeEquipmentItem(slot, saved, item);
  });
  return output;
}

function syncEquipmentSheet() {
  const entries = equipmentSlotOrder.map((slot) => [slot, `.character-equipment__slot--${slot}`]);

  entries.forEach(([slot, selector]) => {
    const root = document.querySelector(selector);
    const item = state.equipment?.[slot];
    if (!root || !item) return;
    const art = root.querySelector(".character-equipment__art");
    const strong = root.querySelector("strong");
    const small = root.querySelector("small");
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
      territories[lot.id] = { level: clamp(Math.floor(level), 1, getLotMaxLevel(lot)) };
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

function getLotHouseDef(lot) {
  if (lot?.restoredHouse && getLotLevel(lot) > 0) {
    return {
      name: lot.restoredHouseName || "Eredeti haz",
      income: Number(lot.income) || 80,
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

function getLotInvestmentCost(lot) {
  const level = getLotLevel(lot);
  if (lot?.restoredHouse) return level === 0 ? (Number(lot.purchaseCost) || 80) : 0;
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
    const thirdAction = visibleIds.includes("rival") ? "rival" : visibleIds.includes("baseRest") ? "baseRest" : "";
    choiceWheelAction3.classList.toggle("hidden", !thirdAction);
    choiceWheelAction3.disabled = false;
    choiceWheelAction3.dataset.choiceAction = thirdAction;
  }
}

let activeAuxPanelKind = null;

function hideAuxPanel() {
  if (activeAuxPanelKind === "world" && state.needsWorldBaseSelection) {
    sceneRef?.setMessage("Elobb valassz egy ures telket a kezdo bazisodnak.");
    return;
  }
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
  if (auxPanelTitle) auxPanelTitle.textContent = title;
  if (auxPanelSubtitle) auxPanelSubtitle.textContent = subtitle;
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
  const count = Math.max(0, Math.round(Number(unreadCount) || 0));
  if (hudMessageBadge) {
    hudMessageBadge.textContent = count > 99 ? "99+" : String(count);
    hudMessageBadge.classList.toggle("hidden", count <= 0);
  }
}

async function refreshMessageBadge() {
  if (!state.profileName) {
    updateMessageBadge(0);
    return;
  }
  try {
    const response = await fetch(`/api/messages?profileName=${encodeURIComponent(state.profileName)}&limit=1`, {
      headers: { Accept: "application/json" },
    });
    const payload = response.ok ? await response.json() : { unreadCount: 0 };
    updateMessageBadge(payload.unreadCount);
  } catch {
    // The badge is optional while the server is temporarily unavailable.
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

function getMessageTypeLabel(messageType) {
  if (messageType === "pvp") return "PvP";
  if (messageType === "event") return "Esemény";
  if (messageType === "system") return "Rendszer";
  return "Játékos";
}

function renderMessagesPanel(messages = []) {
  const body = messages.length
    ? `
      <section class="messages-panel">
        <div class="messages-panel__intro">
          <strong>Családi posta</strong>
          <span>Játékosüzenetek, események és a bázisodat ért támadások egy helyen.</span>
        </div>
        <div class="messages-list">
          ${messages.map((message) => `
            <article class="message-card message-card--${escapeHtml(message.messageType || "player")}${message.readAt ? "" : " is-unread"}">
              <div class="message-card__stamp">${getMessageTypeLabel(message.messageType)}</div>
              <div class="message-card__copy">
                <div class="message-card__heading">
                  <strong>${escapeHtml(message.title || "Üzenet")}</strong>
                  <time>${formatInboxDate(message.createdAt)}</time>
                </div>
                ${message.senderProfileName ? `<span class="message-card__sender">Feladó: ${escapeHtml(message.senderProfileName)}</span>` : ""}
                <p>${escapeHtml(message.body || "")}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `
    : `
      <div class="messages-panel__empty">
        <strong>Még üres a postaláda.</strong>
        <span>Az események, játékosüzenetek és PvP támadások itt fognak megjelenni.</span>
      </div>
    `;
  hideAuxPanel();
  setMessagesDialogContent("Üzenetek", "Családi posta", body);
  activeAuxPanelKind = "messages";
}

async function openMessagesPanel() {
  hideAuxPanel();
  setMessagesDialogContent("Üzenetek", "Családi posta", `<div class="aux-panel__carditem"><strong>Posta betöltése...</strong></div>`);
  activeAuxPanelKind = "messages";
  try {
    const response = await fetch(`/api/messages?profileName=${encodeURIComponent(state.profileName)}&limit=80`, {
      headers: { Accept: "application/json" },
    });
    const payload = response.ok ? await response.json() : { messages: [] };
    renderMessagesPanel(Array.isArray(payload.messages) ? payload.messages : []);
    updateMessageBadge(0);
    void fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileName: state.profileName }),
    });
  } catch {
    setMessagesDialogContent("Üzenetek", "Családi posta", `<div class="aux-panel__carditem"><strong>A posta most nem elérhető.</strong><div class="aux-panel__muted">Próbáld meg néhány pillanat múlva.</div></div>`);
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
        <div><span>Hírnév</span><strong>${profile.fame}</strong></div>
        <div><span>Befolyás</span><strong>${profile.influence}%</strong></div>
        <div><span>Támadás</span><strong>${profile.attack}</strong></div>
        <div><span>Védelem</span><strong>${profile.defense}</strong></div>
        <div><span>Bázis</span><strong>${profile.worldBaseLevel}. szint</strong></div>
        <div><span>Banda</span><strong>${profile.crewCount} fő</strong></div>
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
          senderProfileName: state.profileName,
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

async function runWorldPvpAttack(defenderProfileName) {
  setAuxPanelContent("PvP támadás", defenderProfileName, `<div class="pvp-result"><strong>A banda úton van...</strong><p>A szerver kiszámolja a két család erejét és védelmét.</p></div>`);
  auxPanel?.setAttribute("data-kind", "pvp");
  activeAuxPanelKind = "pvp";
  try {
    const response = await fetch("/api/pvp/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attackerProfileName: state.profileName,
        defenderProfileName,
      }),
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

function postGameEvent(eventType, title, body, payload = {}) {
  if (!state.profileName) return;
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileName: state.profileName, eventType, title, body, payload }),
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
              <span class="leaderboard__value">${entry.cityLevel}</span>
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
        ${stock.map((entry) => `
          <article class="market-item">
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
              ${state.money < entry.price ? "disabled" : ""}>
              ${state.money < entry.price ? "Nincs eleg penz" : "Megveszem"}
            </button>
          </article>
        `).join("")}
      </div>
      <div class="market-panel__footnote">A megvett item bekerul a felszereleseid koze, es a karakterlapodon tudod felvenni.</div>
    </section>
  `;
}

function bindMarketBuyButtons(rootElement, options = {}) {
  rootElement?.querySelectorAll("[data-market-buy]").forEach((button) => {
    button.addEventListener("click", () => {
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

function renderClanPanel() {
  const body = `
    <div class="aux-panel__cardlist">
      <article class="aux-panel__carditem">
        <strong>Klánközpont</strong>
        <div class="aux-panel__muted">Ide kerül majd a családok közötti szövetség, tagfelvétel, közös kassza és klánüzenetek felülete.</div>
      </article>
      <article class="aux-panel__carditem">
        <strong>Állapot</strong>
        <div>Nincs aktív klánod.</div>
        <div class="aux-panel__muted">A saját embereid kezelése továbbra is a jobb oldali Banda panelen marad.</div>
      </article>
    </div>
  `;
  setAuxPanelContent("Klán", "Családi ügyek", body);
  auxPanel?.setAttribute("data-kind", "clan");
  activeAuxPanelKind = "clan";
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
  state.marketStock = state.marketStock.filter((entry) => entry.item.id !== offer.item.id);
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
  const ownLot = getWorldMapLotById(state.worldBaseLotId);
  const selectionMode = Boolean(state.needsWorldBaseSelection);
  const metrics = getWorldMapCanvasMetrics();
  const body = `
    <section class="worldmap">
      <div class="worldmap__toolbar">
        <div class="worldmap__search">
          <span class="worldmap__card-eyebrow">Koordinata vagy telek kod</span>
          <div class="worldmap__searchrow">
            <input id="worldMapSearch" type="text" placeholder="Pelda: C2 vagy 46:28" autocomplete="off">
            <button id="worldMapSearchBtn" type="button">Kereses</button>
          </div>
        </div>
      </div>

      ${buildWorldMapSelectionBar(ownLot, selectionMode)}

      <div class="worldmap__stage" id="worldMapStage">
        <div class="worldmap__viewport">
          <div
            class="worldmap__canvas"
            id="worldMapCanvas"
            style="width:${metrics.width}px; height:${metrics.height}px; background-image:url('${WORLD_MAP_CONTINUOUS_SRC}'); background-size:${metrics.width}px ${metrics.height}px;"
          >
            ${worldMapLotDefs.map((lot) => buildWorldMapLotButton(lot, occupiedLots[lot.id], selectionMode)).join("")}
          </div>
        </div>
        <div id="worldPlayerWheel" class="world-player-wheel hidden" aria-hidden="true"></div>
      </div>
    </section>
  `;
  setAuxPanelContent("Vilagterkep", selectionMode ? "Kezdo bazis" : "", body);
  auxPanel?.setAttribute("data-kind", "world");
  activeAuxPanelKind = "world";
  bindWorldMapInteractions(occupiedLots, selectionMode);
}

function selectWorldBaseLot(lotId) {
  const lot = getWorldMapLotById(lotId);
  if (!lot) return;
  state.worldBaseLotId = lot.id;
  state.worldBaseLevel = Math.max(1, Number(state.worldBaseLevel) || 1);
  state.needsWorldBaseSelection = false;
  sceneRef?.pushLog(`Kulso bazis kijelolve: ${lot.code} (${lot.coord}).`);
  sceneRef?.setMessage(`Kezdo bazis kijelolve: ${lot.code} / ${lot.coord}.`);
  saveGame(true);
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  void openAuxPanel("world");
}

function hideWorldPlayerWheel() {
  const wheel = document.getElementById("worldPlayerWheel");
  wheel?.classList.add("hidden");
  wheel?.setAttribute("aria-hidden", "true");
  if (wheel) wheel.replaceChildren();
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

function bindWorldMapInteractions(occupiedLots, selectionMode) {
  const searchInput = document.getElementById("worldMapSearch");
  const searchButton = document.getElementById("worldMapSearchBtn");
  const chooseButton = document.getElementById("worldMapChooseBtn");
  const titleEl = document.getElementById("worldMapLotTitle");
  const textEl = document.getElementById("worldMapLotText");
  const metaEl = document.getElementById("worldMapLotMeta");
  const stageEl = document.getElementById("worldMapStage");
  const canvasEl = document.getElementById("worldMapCanvas");
  const lotButtons = [...document.querySelectorAll("[data-world-lot]")];
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
    if (titleEl) titleEl.textContent = `${lot.code} / ${lot.coord}`;
    if (textEl) {
      textEl.textContent = getWorldLotStatusText(owner, isOwn);
    }
    if (metaEl) {
      metaEl.textContent = getWorldLotMetaText(owner, isOwn);
    }
    if (chooseButton) {
      const canChoose = selectionMode && (!isOccupied || isOwn);
      chooseButton.disabled = !canChoose;
      chooseButton.textContent = canChoose ? "Ez lesz a bazisom" : "Ez a telek most nem valaszthato";
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
    if (event.target.closest?.("[data-world-lot], .world-player-wheel")) return;
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

  chooseButton?.addEventListener("click", () => {
    const lotId = chooseButton.dataset.worldLot;
    if (!lotId) return;
    selectWorldBaseLot(lotId);
  });

  const runSearch = () => {
    const lot = parseWorldMapQuery(searchInput?.value || "");
    if (!lot) {
      sceneRef?.setMessage("Nem talaltam ilyen koordinatat a terkepen.");
      searchInput?.focus();
      return;
    }
    renderSelection(lot.id, { center: true });
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
  { id: "docks", title: "Dokkok", x: 33.5, y: 34.5, w: 21, h: 17, clip: "polygon(9% 35%, 35% 10%, 83% 5%, 98% 37%, 79% 76%, 28% 92%, 0 66%)", note: "Csempesz fuvarok es hajos megbizasok." },
  { id: "warehouse", title: "Csempeszraktar", x: 75.5, y: 55, w: 20, h: 17, clip: "polygon(18% 22%, 70% 0, 100% 28%, 87% 83%, 32% 100%, 0 70%)", note: "Arukeszlet: hamis penz, drog, fegyver, papirok." },
  { id: "bar", title: "Speakeasy", x: 41, y: 78.5, w: 20, h: 17, clip: "polygon(9% 38%, 35% 9%, 83% 5%, 100% 43%, 74% 86%, 22% 100%, 0 69%)", note: "Italok, eletero es energia toltes." },
  { id: "office", title: "Kikotoi iroda", x: 62.5, y: 79, w: 18, h: 15, clip: "polygon(12% 33%, 39% 5%, 86% 15%, 100% 62%, 70% 96%, 18% 82%, 0 52%)", note: "Kapcsolatok es rendori lefizetes." },
  { id: "market", title: "Feketepiac", x: 75, y: 25.5, w: 19, h: 15, clip: "polygon(16% 29%, 52% 3%, 98% 21%, 88% 78%, 38% 100%, 0 66%)", note: "Ritka aruk es csempesz cuccok." },
  { id: "customs", title: "Vam", x: 38, y: 59, w: 17, h: 13, clip: "polygon(10% 32%, 44% 5%, 92% 22%, 100% 66%, 59% 96%, 9% 78%, 0 50%)", note: "Hamis penz es hamis papirok beszerzese." },
  { id: "rail", title: "Vasuti rakodo", x: 59, y: 52.5, w: 22, h: 14, clip: "polygon(6% 39%, 31% 8%, 91% 3%, 100% 47%, 78% 86%, 19% 100%, 0 70%)", note: "Drog es fegyver csempeszet." },
  { id: "garage", title: "Garazs", x: 51, y: 61.5, w: 18, h: 15, clip: "polygon(7% 34%, 40% 5%, 86% 13%, 100% 54%, 73% 94%, 19% 88%, 0 61%)", note: "Jarmuvek kesobb." },
  { id: "fish", title: "Halpiac", x: 12, y: 61, w: 22, h: 17, clip: "polygon(4% 42%, 37% 9%, 89% 7%, 100% 53%, 77% 89%, 21% 100%, 0 70%)", note: "Halaskuldetesek: penz, XP, pihenes." },
  { id: "storage", title: "Raktarsor", x: 55, y: 21.5, w: 22, h: 15, clip: "polygon(6% 39%, 31% 8%, 88% 5%, 100% 46%, 80% 87%, 22% 100%, 0 68%)", note: "Raktar es atadasi pontok." },
];

const harborCargoDefs = {
  counterfeitMoney: { label: "Hamis penz", image: "./csempészet/34d87e7a-d0ec-42bc-891e-eff98067be29.png" },
  drugs: { label: "Drog", image: "./csempészet/0391ff3c-7e67-4b77-91e0-cdb7ac0f0a9a.png" },
  weapons: { label: "Fegyver", image: "./csempészet/dd25759f-f94a-42dc-8df6-d9fab6211903.png" },
  papers: { label: "Hamis papirok", image: "./csempészet/f5b63510-d9c7-469c-ac33-71343b294ab1.png" },
};

const harborMissionCatalog = Array.from({ length: 50 }, (_, index) => {
  const profiles = [
    { zone: "docks", title: "Rakparti atadas", requires: { counterfeitMoney: 6 + (index % 4), weapons: 1 + (index % 3) }, rewardMoney: 170 + index * 5, rewardXp: 28 + (index % 8), durationMs: 30 * 60 * 1000 },
    { zone: "storage", title: "Raktari csere", requires: { papers: 5 + (index % 5), drugs: 2 + (index % 3) }, rewardMoney: 190 + index * 6, rewardXp: 30 + (index % 9), durationMs: 35 * 60 * 1000 },
    { zone: "customs", title: "Vami boritek", gives: { counterfeitMoney: 6 + (index % 5), papers: 3 + (index % 4) }, rewardMoney: 45 + index, rewardXp: 16 + (index % 5), durationMs: 30 * 60 * 1000 },
    { zone: "rail", title: "Kodos vagon", gives: { drugs: 4 + (index % 5), weapons: 2 + (index % 4) }, rewardMoney: 60 + index, rewardXp: 18 + (index % 6), durationMs: 45 * 60 * 1000 },
    { zone: "fish", title: "Hajnali halaszat", gives: {}, rewardMoney: 90 + index * 3, rewardXp: 18 + (index % 10), heal: 20, energy: 20, durationMs: [60, 180, 360][index % 3] * 60 * 1000 },
  ];
  const profile = profiles[index % profiles.length];
  return {
    id: `harbor-${index + 1}`,
    ...profile,
    title: `${profile.title} ${Math.floor(index / profiles.length) + 1}`,
  };
});

function normalizeSmuggledGoods(goods) {
  return Object.fromEntries(Object.keys(harborCargoDefs).map((key) => [
    key,
    Math.max(0, Math.round(Number(goods?.[key]) || 0)),
  ]));
}

function formatCargoList(cargo = {}) {
  const entries = Object.entries(cargo)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([key, amount]) => `${Math.round(amount)} ${harborCargoDefs[key]?.label || key}`);
  return entries.length ? entries.join(", ") : "-";
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
  const matching = harborMissionCatalog.filter((mission) => mission.zone === zoneId || (zoneId === "docks" && mission.zone === "storage"));
  const offset = Math.abs((state.day * 7 + zoneId.length * 11) % Math.max(1, matching.length));
  return Array.from({ length: Math.min(6, matching.length) }, (_, index) => matching[(offset + index) % matching.length]);
}

function setHarborPanelContent(zone, bodyHtml) {
  if (!harborOperationPanel) return;
  harborOperationPanel.innerHTML = `
    <header class="harbor-operation-panel__header">
      <div>
        <span>Kikoto negyed</span>
        <strong>${escapeHtml(zone.title)}</strong>
      </div>
      <button class="harbor-operation-panel__close" type="button" aria-label="Bezaras">x</button>
    </header>
    ${bodyHtml}
  `;
  harborOperationPanel.classList.remove("hidden");
  harborOperationPanel.setAttribute("aria-hidden", "false");
  harborOperationPanel.querySelector(".harbor-operation-panel__close")?.addEventListener("click", hideHarborOperationPanel);
}

function hideHarborOperationPanel() {
  harborOperationPanel?.classList.add("hidden");
  harborOperationPanel?.setAttribute("aria-hidden", "true");
}

function renderHarborBar(zone) {
  setHarborPanelContent(zone, `
    <section class="harbor-place">
      <div class="harbor-bar-scene" aria-hidden="true">
        <div class="harbor-bar-scene__shelves">
          ${Array.from({ length: 18 }, (_, index) => `<i style="--bottle:${(index % 5) + 1}"></i>`).join("")}
        </div>
        <div class="harbor-bar-scene__counter"></div>
      </div>
      <div class="harbor-service-grid">
        <article class="harbor-service-card">
          <strong>Orvosi whiskey</strong>
          <span>+35 eletero</span>
          <button type="button" data-harbor-buy="health">Megveszem - 45 $</button>
        </article>
        <article class="harbor-service-card">
          <strong>Fekete kave</strong>
          <span>+35 energia</span>
          <button type="button" data-harbor-buy="energy">Megveszem - 45 $</button>
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
    <section class="harbor-orders">
      <div class="harbor-orders__header">
        <span>${kind === "fish" ? "Halpiaci megbizasok" : "Csempesz megbizasok"}</span>
        <strong>${escapeHtml(zone.title)}</strong>
      </div>
      <p class="harbor-orders__intro">A munka a felso folyamat korbe kerul. Jutalom csak akkor jar, amikor lejar.</p>
      <div class="harbor-orders__table">
        <div class="harbor-orders__row harbor-orders__row--head"><span>Munka</span><span>Igeny / aru</span><span>Ido</span><span>Jutalom</span><span></span></div>
        ${orders.map((mission) => {
          const affordable = canPayCargo(mission.requires);
          const needs = mission.requires ? formatCargoList(mission.requires) : `Szerez: ${formatCargoList(mission.gives)}`;
          const reward = `+${mission.rewardMoney} $, +${mission.rewardXp} XP${mission.heal ? ", pihenes" : ""}`;
          return `
          <div class="harbor-orders__row">
            <strong>${escapeHtml(mission.title)}</strong>
            <small>${escapeHtml(needs)}</small>
            <span>${formatCountdown(mission.durationMs)}</span>
            <span>${escapeHtml(reward)}</span>
            <button type="button" data-harbor-mission="${mission.id}" ${affordable ? "" : "disabled"}>${affordable ? "Inditas" : "Nincs aru"}</button>
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
          <span>Esely: 65%, korozes -5%</span>
          <button type="button" data-harbor-bribe="small">150 $</button>
        </article>
        <article class="harbor-service-card">
          <strong>Nagy lefizetes</strong>
          <span>Esely: 80%, korozes -10%</span>
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

function renderHarborZonePanel(zone) {
  if (zone.id === "bar") return renderHarborBar(zone);
  if (zone.id === "warehouse") return renderHarborWarehouse(zone);
  if (zone.id === "office") return renderHarborOffice(zone);
  if (zone.id === "market") return renderHarborMarket(zone);
  if (["docks", "customs", "rail", "fish", "storage"].includes(zone.id)) return renderHarborOrders(zone, zone.id === "fish" ? "fish" : "mixed");
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
  const mission = harborMissionCatalog.find((entry) => entry.id === missionId);
  if (!mission) return false;
  if (!hasProcessTaskSlot()) {
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
      title: mission.title,
      zone: mission.zone,
      gives: mission.gives || {},
      rewardMoney: mission.rewardMoney,
      rewardXp: mission.rewardXp,
      heal: mission.heal || 0,
      energy: mission.energy || 0,
      successChance: mission.zone === "fish" ? 1 : 0.86,
    },
  });
  if (!queued) return false;
  sceneRef?.setMessage(`${mission.title} elindult. A jutalom a folyamat lejarata utan jar.`);
  sceneRef?.pushLog(`Kikoto: ${mission.title} elindult (${formatCountdown(mission.durationMs)}).`);
  renderHarborZonePanel(harborZoneDefs.find((zone) => zone.id === mission.zone) || harborZoneDefs[0]);
  saveGame();
  return true;
}

function handleHarborPanelClick(event) {
  const missionButton = event.target.closest("[data-harbor-mission]");
  if (missionButton) {
    startHarborMission(missionButton.dataset.harborMission);
    return;
  }

  const buyButton = event.target.closest("[data-harbor-buy]");
  if (buyButton) {
    const kind = buyButton.dataset.harborBuy;
    const cost = 45;
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
    const cost = large ? 350 : 150;
    if (!canAfford(cost)) {
      sceneRef?.setMessage("Nincs eleg penz a boritekra.");
      return;
    }
    state.money -= cost;
    const success = Math.random() <= (large ? 0.8 : 0.65);
    if (success) {
      state.heat = clamp(state.heat - (large ? 10 : 5), 0, 100);
      sceneRef?.setMessage("A boritek celba ert, a korozes csokkent.");
    } else {
      sceneRef?.setMessage("A rendor nem vette at a boritekot.");
    }
    saveGame();
    sceneRef?.refreshHUD();
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
        const response = await fetch(`/api/market-items?profileName=${encodeURIComponent(state.profileName)}&limit=50`, {
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
    renderClanPanel();
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


function buildQuestReward(questType, difficulty) {
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
  { id: "base", title: "Elso munka", text: "Valaszd ki a fo bazisod.", reward: { money: 80, xp: 10 } },
  { id: "crew", title: "Ember a bandaba", text: "Vegyel fel vagy fejlessz egy bandatagot.", reward: { money: 90, xp: 12 } },
  { id: "equip", title: "Oltozz munkahoz", text: "Szerelj fel egy targyat a karakteredre.", reward: { money: 70, xp: 12, item: true } },
  { id: "robbery", title: "Zold celpont", text: "Rabolj ki egy konnyu hazat.", reward: { money: 110, xp: 16 } },
  { id: "protection", title: "Utcai ado", text: "Szedj vedelmi penzt egy hazbol.", reward: { money: 120, xp: 16 } },
  { id: "quest", title: "Atadas", text: "Fejezz be es adj at egy kuldetest.", reward: { money: 130, xp: 20 } },
  { id: "rest", title: "Biztos hely", text: "Pihenj a fo bazisodon.", reward: { money: 90, xp: 14 } },
  { id: "world", title: "Nagyvilag", text: "Nezd meg a vilagterkepet.", reward: { money: 100, xp: 15 } },
  { id: "level5", title: "Nevet szerzel", text: "Erd el az 5. szintet.", reward: { money: 180, xp: 30, item: true } },
  { id: "harbor", title: "Kikotoi kapu", text: "Lepj be a kikoto negyedbe.", reward: { money: 220, xp: 35 } },
];

function getCurrentMentorStep() {
  if (state.mentorCompleted) return null;
  return mentorSteps[clamp(Math.round(Number(state.mentorStep) || 0), 0, mentorSteps.length - 1)] || null;
}

function shouldShowMentorHud() {
  return Boolean(state.registered)
    && !state.mentorCompleted
    && getRankLevel(state.fame) <= 1
    && Boolean(getCurrentMentorStep());
}

function getMentorRewardText(step) {
  if (!step?.reward) return "Jutalom: -";
  const parts = [];
  if (step.reward.money) parts.push(`+${step.reward.money} $`);
  if (step.reward.xp) parts.push(`+${step.reward.xp} XP`);
  if (step.reward.item) parts.push("szurke targy");
  return `Jutalom: ${parts.join(", ")}`;
}

function updateMentorPanel() {
  const visible = shouldShowMentorHud();
  const step = getCurrentMentorStep();
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
  if (step.reward.item) {
    unlockEquipmentItem("hat", {
      id: `mentor-fedora-${Date.now()}`,
      name: "Mentor fedora",
      power: 2,
      stat: "defense",
      rarity: "common",
      image: "./assets/items/item-hat-gray.png",
    });
  }
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

  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ring.setAttribute("cx", x);
  ring.setAttribute("cy", y - 4);
  ring.setAttribute("r", 13);
  ring.classList.add("map-svg-rival-marker__ring");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.classList.add("map-svg-rival-marker__text");
  text.textContent = "R";

  marker.appendChild(ring);
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

function updateQuestHud() {
  state.activeQuests = normalizeQuestList(state.activeQuests);
  const quests = state.activeQuests;
  if (hudQuestTab1) {
    const label = quests[0]
      ? `I: ${quests[0].title}${quests[0].status === "completed" ? " [Kesz]" : ` (${quests[0].goal.progress}/${quests[0].goal.target})`}`
      : "I: nincs felvett kuldetes";
    hudQuestTab1.textContent = label;
    hudQuestTab1.dataset.label = label;
    hudQuestTab1.setAttribute("aria-label", label);
  }
  if (hudQuestTab2) {
    const label = quests[1]
      ? `II: ${quests[1].title}${quests[1].status === "completed" ? " [Kesz]" : ` (${quests[1].goal.progress}/${quests[1].goal.target})`}`
      : "II: nincs felvett kuldetes";
    hudQuestTab2.textContent = label;
    hudQuestTab2.dataset.label = label;
    hudQuestTab2.setAttribute("aria-label", label);
  }
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
  state.activeQuests = normalizeQuestList(state.activeQuests).filter((entry) => entry.id !== quest.id);
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
  state.activeQuests = normalizeQuestList(state.activeQuests).filter((entry) => entry.id !== quest.id);
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

function scheduleNextQuestSpawn(baseDelay = null) {
  const delay = Number.isFinite(baseDelay) ? baseDelay : randomInt(35000, 70000);
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
  const questTemplates = [
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
      description: `Rabolj ki egy boltot a(z) ${districtDefs[spot.districtIndex]?.name || "kerulet"} kornyeken.`,
      objective: "1 sikeres bolti kirablas.",
      goal: { action: "robbery", mode: "shop", target: 1, progress: 0 },
      xp: 24,
      money: 110,
    },
  ];
  const template = questTemplates[randomInt(0, questTemplates.length - 1)];
  const questType = template.type;
  const difficulty = getBuildingDifficulty(spot);
  const reward = Math.random() < 0.45 ? buildQuestReward(questType, difficulty) : null;
  const offeredQuest = {
    id: `quest-${Date.now()}-${randomInt(1000, 9999)}`,
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
    xpReward: template.xp + Math.floor(difficulty / 5),
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
  showQuestCard(offeredQuest);
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
    const currentQuest = getQuestSlot();
    if (currentQuest?.status === "completed") {
      showQuestCard(currentQuest);
    } else {
      updateQuestHud();
    }
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
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0));
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent, now);
  state.rivalNextSpawnAt = Number.isFinite(Number(state.rivalNextSpawnAt))
    ? Number(state.rivalNextSpawnAt)
    : now + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
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

function hasProcessTaskSlot() {
  state.processTasks = normalizeProcessTasks(state.processTasks);
  return state.processTasks.length < MAX_PROCESS_TASKS;
}

function ensureProcessQueueStarted(now = Date.now()) {
  state.processTasks = normalizeProcessTasks(state.processTasks);
  if (state.processTasks[0] && !state.processTasks[0].startedAt) {
    state.processTasks[0].startedAt = now;
    return true;
  }
  return false;
}

function renderProcessTasks(now = Date.now()) {
  if (!hudProcessTasks) return;
  ensureProcessQueueStarted(now);
  const tasks = normalizeProcessTasks(state.processTasks);
  const slots = Array.from({ length: MAX_PROCESS_TASKS }, (_, index) => {
    const task = tasks[index];
    if (!task) {
      return `<button class="hud-process-task hud-process-task--empty" type="button" title="Szabad feladat hely"><span>+</span><strong>ures</strong></button>`;
    }
    const isActive = index === 0;
    const elapsed = isActive && task.startedAt ? Math.max(0, now - task.startedAt) : 0;
    const progress = isActive ? clamp((elapsed / task.durationMs) * 100, 0, 100) : 0;
    const remaining = isActive ? Math.max(0, task.durationMs - elapsed) : task.durationMs;
    return `
      <button class="hud-process-task${isActive ? "" : " hud-process-task--waiting"}" type="button" title="${escapeHtml(task.title)}" style="--process:${progress}%">
        <span>${escapeHtml(task.icon)}</span>
        <strong>${isActive ? formatCountdown(remaining) : "var"}</strong>
        <em>${escapeHtml(task.title)}</em>
      </button>
    `;
  }).join("");
  hudProcessTasks.innerHTML = `
    <div class="hud-process-group">
      <b>Folyamat</b>
      <div class="hud-process-group__bubbles">${slots}</div>
    </div>
  `;
}

function enqueueProcessTask(task) {
  syncProcessTasks(Date.now(), { skipRender: true });
  if (!hasProcessTaskSlot()) {
    sceneRef?.setMessage("Nincs szabad feladat kor. Varj, amig az egyik munka lejar.");
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
  state.processTasks.push(normalized);
  ensureProcessQueueStarted();
  renderProcessTasks();
  return true;
}

function applyProtectionReward(reward) {
  state.money += reward.gain;
  applyFame(reward.fameGain);
  const appliedHeat = applyHeat(reward.heatGain);
  const district = state.districts[reward.districtIndex];
  if (district) district.loyalty = clamp(district.loyalty + 6, 0, 100);
  if (reward.completesQuest && reward.spotId) completeQuest("protection", getSpotById(reward.spotId));
  completeMentorStep("protection");
  sceneRef?.pushLog(`${reward.buildingName}: vedelmi penz befolyt. +${reward.gain} $, +${reward.fameGain} XP, +${appliedHeat}% korozes.`);
  sceneRef?.setMessage(`${reward.buildingName}: a vedelmi penz megjott a kasszaba.`);
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

function syncProcessTasks(now = Date.now(), options = {}) {
  state.processTasks = normalizeProcessTasks(state.processTasks);
  let changed = ensureProcessQueueStarted(now);
  while (state.processTasks.length) {
    const current = state.processTasks[0];
    if (!current.startedAt || now - current.startedAt < current.durationMs) break;
    state.processTasks.shift();
    completeProcessTask(current);
    changed = true;
    if (state.processTasks[0] && !state.processTasks[0].startedAt) {
      state.processTasks[0].startedAt = now;
    }
  }
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
  return {
    id: String(event.id || `rival-${spotId}-${Math.round(expiresAt)}`),
    spotId,
    strength: clamp(Math.round(Number(event.strength) || 30), 8, 160),
    rewardMoney: Math.max(60, Math.round(Number(event.rewardMoney) || 160)),
    rewardXp: Math.max(10, Math.round(Number(event.rewardXp) || 20)),
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
    return true;
  }
  if (active) return false;
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
  return encounter.defenders.reduce((sum, defender) => sum + Math.max(0, defender.attack || Math.round(defender.maxHealth * 0.4)), 0);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeCrewMembers(members) {
  const savedMembers = Array.isArray(members) ? members : [];
  return crewMemberTemplates.map((template, index) => {
    const saved = savedMembers.find((member) => member?.id === template.id) || {};
    const level = clamp(Number.isFinite(saved.level) ? Math.round(saved.level) : 1, 1, 20);
    const defenseLevel = clamp(Number.isFinite(saved.defenseLevel) ? Math.round(saved.defenseLevel) : 1, 1, 20);
    const legacyOwned = index === 0
      || saved.hired === true
      || level > 1
      || defenseLevel > 1
      || Number(saved.attackBonus) > 0
      || Number(saved.defenseBonus) > 0
      || Number.isFinite(saved.health);
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
              <button class="crew-card__mini-action" data-crew-action="hire" type="button"${state.money < hireCost ? " disabled" : ""}>Felbérel</button>
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
          <span>${equipmentSlotDefs[slot]?.label || slot}</span>
          <strong>${item?.name || "Ures"}</strong>
          <small>${item ? getEquipmentBonusText(slot, item.power, item.stat) : "Valassz targyat"}</small>
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

function createRobberyDefenders(spot, difficulty) {
  const count = difficulty >= 72 ? 4 : difficulty >= 44 ? 3 : 2;
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
  if (robberyLoot) robberyLoot.textContent = `Zsákmány: ${encounter.loot} $`;
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

function finishRobberySuccess() {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;

  const target = encounter.targetDistrict;
  const baseGain = encounter.mode === "shop" ? 52 : 30;
  const gain = Math.round(baseGain + encounter.loot + state.cityLevel * 8 + encounter.difficulty * 0.35);
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
  saveGame();
  sceneRef?.refreshHUD();
  sceneRef?.refreshMap();
  showRobberyResult(
    true,
    "A rajtaütés sikerült",
    `Zsákmány: +${gain} $ · Hírnév: +${fameGain} · Sérülés: -${healthLost} · Körözés: +${appliedHeat}%`,
  );
}

function finishRobberyFailure(reason) {
  const encounter = activeRobberyGame;
  if (!encounter || encounter.ended) return;
  const heatGain = encounter.alert >= 100 ? 18 : 8;
  state.health = Math.max(state.health, 12);
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
  const lootGain = randomInt(7, 16) + (defeated ? randomInt(12, 24) : 0);
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
  robberyGame?.setAttribute("aria-hidden", "true");
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
  if (isItemEquippedAnywhere(item.id, { owner: "player" })) {
    sceneRef?.setMessage("Ezt a targyat mar mas viseli.");
    return;
  }
  state.equipment[slot] = { ...item };
  recalculateGearPower();
  state.mentorFlags.equippedItem = true;
  completeMentorStep("equip");
  sceneRef?.setMessage(`${item.name} felveve a(z) ${equipmentSlotDefs[slot]?.label?.toLowerCase() || "felszereles"} helyere.`);
  refreshCharacterPanel();
  saveGame();
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
  if (characterMoney) characterMoney.textContent = String(state.money);
  if (characterLevel) characterLevel.textContent = String(level);
  if (characterHealth) characterHealth.textContent = `${state.health} / 100`;
  if (characterAttack) characterAttack.textContent = String(getPlayerAttackStat());
  if (characterDefense) characterDefense.textContent = String(getPlayerDefenseStat());
  if (characterFame) characterFame.textContent = String(state.fame);
  if (characterHeat) characterHeat.textContent = `${state.heat}%`;
  if (characterXpSummary) {
    characterXpSummary.textContent = nextRankFame > state.fame
      ? `${state.fame - currentThreshold} / ${xpSpan} XP a kovetkezo szinthez`
      : "Maximum szint elerve";
  }
  if (characterXpFill) characterXpFill.style.width = `${nextRankFame > state.fame ? xpProgress : 100}%`;
  if (activeEquipmentSlot) showEquipmentPicker(activeEquipmentSlot);
  syncEquipmentSheet();
}

function showCharacterPanel() {
  if (!state.registered || !characterPanel) return;
  hideChoiceWheel();
  refreshCharacterPanel();
  characterPanel.classList.remove("hidden");
  characterPanel.setAttribute("aria-hidden", "false");
}

function hideCharacterPanel() {
  hideEquipmentPicker();
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
  const nextCost = level >= 3 ? null : getLotInvestmentCost(lot);
  if (lotInfoTitle) lotInfoTitle.textContent = lot.name;
  if (lotInfoDescription) {
    lotInfoDescription.textContent = houseDef
      ? `${houseDef.name}. A haz jelenleg stabil passziv bevetelt termel a birodalmadnak.`
      : "A telek meg ures. Vasarlas utan megjelenik rajta a 1930-as stilusu haz.";
  }
  if (lotInfoLevel) lotInfoLevel.textContent = houseDef ? `${level}. szint` : "Nincs megveve";
  if (lotInfoHourlyIncome) lotInfoHourlyIncome.textContent = `${getLotHourlyIncome(lot)} $`;
  if (lotInfoDailyIncome) lotInfoDailyIncome.textContent = `${getLotIncome(lot)} $`;
  if (lotInfoNextCost) lotInfoNextCost.textContent = nextCost ? `${nextCost} $` : "Maximum";
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

  const panelWidth = 188;
  const panelHeight = 224;
  const x = clamp(spot.x, panelWidth / 2 + 16, window.innerWidth - panelWidth / 2 - 16);
  const y = clamp(spot.y, panelHeight / 2 + 16, window.innerHeight - panelHeight / 2 - 16);

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
    const cost = getLotInvestmentCost(spot);
    const houseDef = getLotHouseDef(spot);
    const isMaxLevel = level >= getLotMaxLevel(spot);
    setChoiceWheelButtons(level > 0
      ? [
          ...(isMaxLevel ? [] : ["robbery"]),
          "protection",
          "baseRest",
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
      choiceWheelAction3.dataset.choiceAction = "lotInfo";
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
    resolveRivalBattle(spot);
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

function getRememberedProfileName() {
  try {
    return window.localStorage.getItem(LAST_PROFILE_KEY) || "";
  } catch {
    return "";
  }
}

function getLegacyLocalSave() {
  try {
    const raw = LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function createSaveSnapshot() {
  syncTimedActions();
  ensureMarketStock();
  return {
    profileName: state.profileName,
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
    smuggledGoods: state.smuggledGoods,
    smugglerFame: state.smugglerFame,
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
  state.crewMembers = normalizeCrewMembers(state.crewMembers);
  state.crew = getHiredCrewMembers().length;
  state.activeCrewMemberId = state.crewMembers.some((member) => member.hired && member.id === state.activeCrewMemberId)
    ? state.activeCrewMemberId
    : (getHiredCrewMembers()[0]?.id || state.crewMembers[0]?.id || "luca");
  state.territories = normalizeTerritories(state.territories);
  state.buildingDifficulties = normalizeBuildingDifficulties(state.buildingDifficulties, state.buildingDifficultyCycle);
  state.marketStock = normalizeMarketStock(state.marketStock);
  state.marketRefreshAt = Number.isFinite(Number(state.marketRefreshAt)) ? Number(state.marketRefreshAt) : 0;
  ensureMarketStock();
  state.mainBaseSpotId = typeof state.mainBaseSpotId === "string" ? state.mainBaseSpotId : null;
  state.worldBaseLotId = normalizeWorldBaseLotId(state.worldBaseLotId);
  state.worldBaseLevel = Math.max(1, Math.round(Number(state.worldBaseLevel) || 1));
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
  state.processTasks = normalizeProcessTasks(state.processTasks);
  state.smuggledGoods = normalizeSmuggledGoods(state.smuggledGoods);
  state.smugglerFame = Math.max(0, Math.round(Number(state.smugglerFame) || 0));
  state.rivalEvent = normalizeRivalEvent(state.rivalEvent);
  state.rivalNextSpawnAt = Number.isFinite(Number(state.rivalNextSpawnAt))
    ? Number(state.rivalNextSpawnAt)
    : Date.now() + randomInt(RIVAL_SPAWN_MIN_MS, RIVAL_SPAWN_MAX_MS);
  state.mentorStep = clamp(Math.round(Number(state.mentorStep) || 0), 0, mentorSteps.length);
  state.mentorCompleted = Boolean(state.mentorCompleted || state.mentorStep >= mentorSteps.length);
  if (getRankLevel(state.fame) > 1) {
    state.mentorCompleted = true;
  }
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
  state.mainBaseClaimDay = Number.isFinite(Number(state.mainBaseClaimDay)) ? Math.floor(Number(state.mainBaseClaimDay)) : 0;
  state.registered = Boolean(state.profileName);
  return state.registered;
}

async function requestSaveApi(profileName, method = "GET", body = null, keepalive = false) {
  const response = await fetch(`${SAVE_API_BASE}/${encodeURIComponent(profileName)}`, {
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
  saveRequestInFlight = requestSaveApi(snapshot.profileName, "PUT", { state: snapshot }, forceKeepalive)
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
    await requestSaveApi(profileName, "DELETE");
  } catch {
    // Ignore delete failures so the UI reset can still complete locally.
  }
}

async function loadGame(profileName = "") {
  const normalizedProfileName = profileName.trim().slice(0, 18);
  if (!normalizedProfileName) return false;
  try {
    const response = await fetch(`${PROFILE_API_BASE}/${encodeURIComponent(normalizedProfileName)}`, {
      headers: { Accept: "application/json" },
    });
    const remoteSave = response.ok ? await response.json() : { found: false };
    if (remoteSave?.found && hydrateState(remoteSave.state)) {
      rememberLastProfileName(state.profileName);
      queueSaveSnapshot(createSaveSnapshot(), true);
      return true;
    }
  } catch {
    // Fall back to legacy local data if the database is not reachable yet.
  }

  const legacySave = getLegacyLocalSave();
  if (legacySave?.profileName === normalizedProfileName && hydrateState(legacySave)) {
    queueSaveSnapshot(createSaveSnapshot(), true);
    return true;
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

function raidDistrict(targetDistrict, mode = "street", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return;
  }
  if (!canStartCombat("A tamadast")) return;
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
  if (targetSpot) {
    completeQuest("robbery", targetSpot);
  }
  completeMentorStep("robbery");
  saveGame();
}

function collectProtectionMoney(targetDistrict, buildingName = "Haz", targetSpot = null) {
  if (!state.registered) {
    sceneRef?.setMessage("Elobb regisztralj.");
    return false;
  }
  if (!canStartCombat("A vedelmi penz beszedest")) return false;
  if (!hasProcessTaskSlot()) {
    sceneRef?.setMessage("Nincs szabad feladat kor a vedelmi penzhez.");
    renderProcessTasks();
    return false;
  }
  if (targetSpot && getProtectionCooldownRemaining(targetSpot.id) > 0) {
    sceneRef?.setMessage(`Innen meg nem szedhetsz vedelmi penzt. Hatralevo ido: ${formatCountdown(getProtectionCooldownRemaining(targetSpot.id))}.`);
    return false;
  }
  if (!spendEnergy(8)) return false;

  const target = targetDistrict || getSelectedDistrict();
  const difficulty = targetSpot ? getBuildingDifficulty(targetSpot) : Math.round((target?.security ?? 50) * 0.82);
  const difficultyInfo = getDifficultyInfo(difficulty, "protection");
  const bandProfile = getBandPowerProfile();
  const gainBase = 14 + Math.round(difficulty * 0.16) + state.cityLevel * 4 + randomInt(0, 14);
  const lowReadinessPenalty = bandProfile.readiness < 0.6 ? Math.round((0.6 - bandProfile.readiness) * 16) : 0;

  if (Math.random() > difficultyInfo.successChance) {
    const healthLoss = applyActionDamage(
      difficultyInfo.label === "Veszelyes" ? 8 : 4,
      difficultyInfo.label === "Veszelyes" ? 18 : 11,
    );
    applyHeat(difficultyInfo.label === "Veszelyes" ? 10 : difficultyInfo.label === "Kockazatos" ? 7 : 5);
    sceneRef?.pushLog(`${buildingName}: a vedelmi penz beszedese nem sikerult. -${healthLoss} eletero.`);
    sceneRef?.setMessage(`${buildingName} nem fizetett. Tobb ero, jobb pajzs es jobb felszereles kell.`);
    saveGame();
    return false;
  }

  const gain = Math.max(
    10,
    Math.round(gainBase * (0.84 + difficultyInfo.successChance * 0.42) - lowReadinessPenalty),
  );

  const fameGain = difficultyInfo.label === "Veszelyes" ? 5 : difficultyInfo.label === "Kockazatos" ? 4 : 3;
  const heatGain = difficultyInfo.label === "Veszelyes" ? 8 : difficultyInfo.label === "Kockazatos" ? 6 : 4;

  if (target) {
    target.loyalty = clamp(target.loyalty + (difficultyInfo.label === "Veszelyes" ? 10 : 8), 0, 100);
    if (!target.controlled && target.loyalty >= 65) {
      target.controlled = true;
      sceneRef?.pushLog(`${target.name} most mar a bandadhoz tartozik.`);
    }
  }

  const queued = queueProtectionReward({
    spotId: targetSpot?.id || null,
    buildingName,
    districtIndex: state.selectedDistrictIndex,
    gain,
    fameGain,
    heatGain,
    completesQuest: Boolean(targetSpot),
  });
  if (!queued) return false;
  sceneRef?.pushLog(`${buildingName}: vedelmi penz beszedese elindult, ${formatCountdown(PROTECTION_REWARD_DELAY_MS)} mulva erkezik.`);
  sceneRef?.setMessage(`${buildingName}: a vedelmi penz utban van. Nehezseg: ${difficultyInfo.label}.`);
  if (targetSpot) {
    state.protectionCooldowns[targetSpot.id] = Date.now() + PROTECTION_COOLDOWN_MS;
  }
  saveGame();
  return true;
}

function resolveRivalBattle(spot) {
  const rival = getRivalEventAtSpot(spot?.id);
  if (!rival) {
    sceneRef?.setMessage("Itt most nincs rivalis banda.");
    return false;
  }
  if (!canStartCombat("A rivalis banda elleni harcot")) return false;
  if (!spendEnergy(14)) return false;

  const playerPower = getActionPower("map");
  const targetPower = rival.strength * 2.1;
  const successChance = clamp(0.46 + (playerPower - targetPower) / 220, 0.24, 0.86);
  const success = Math.random() <= successChance;
  const healthLoss = applyActionDamage(success ? 5 : 12, success ? 18 : 28);

  if (success) {
    state.money += rival.rewardMoney;
    applyFame(rival.rewardXp);
    const heatGain = applyHeat(5);
    state.rivalEvent = null;
    scheduleNextRivalEvent();
    sceneRef?.pushLog(`${spot.name}: rivalis banda leverve. +${rival.rewardMoney} $, +${rival.rewardXp} XP.`);
    sceneRef?.setMessage(`Rivalis banda leverve. Jutalom: +${rival.rewardMoney} $, +${rival.rewardXp} XP, korozes +${heatGain}%.`);
  } else {
    const loss = Math.min(state.money, Math.max(20, Math.round(rival.rewardMoney * 0.22)));
    state.money = Math.max(0, state.money - loss);
    applyHeat(6);
    state.rivalEvent = { ...rival, expiresAt: Date.now() + Math.max(2 * 60 * 1000, Math.round((rival.expiresAt - Date.now()) * 0.55)) };
    sceneRef?.pushLog(`${spot.name}: a rivalis banda visszavert. -${loss} $, -${healthLoss} eletero.`);
    sceneRef?.setMessage(`A rivalis banda tul eros volt. -${loss} $, -${healthLoss} eletero.`);
  }
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
  state.crew = Math.max(1, Math.ceil(state.crew / 2));
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
  const cost = 60 + state.crew * 15;
  if (!canAfford(cost)) {
    sceneRef?.setMessage("Nincs eleg penz uj emberek toborzasahoz.");
    return;
  }
  if (!spendEnergy(10)) return;
  state.money -= cost;
  state.crew += 1;
  applyFame(6);
  completeMentorStep("crew");
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
  state.money = 120;
  state.fame = 0;
  state.crew = 1;
  state.heat = 0;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 0;
  state.equipment = getDefaultEquipment();
  state.itemInventory = getDefaultItemInventory();
  recalculateGearPower();
  state.crewMembers = makeCrewMembers();
  state.crew = getHiredCrewMembers().length || 1;
  state.activeCrewMemberId = "luca";
  state.mainBaseSpotId = null;
  state.worldBaseLotId = null;
  state.worldBaseLevel = 1;
  state.needsWorldBaseSelection = true;
  state.territories = {};
  state.activeQuest = null;
  state.offeredQuests = [];
  state.activeQuests = [];
  state.selectedQuestSlot = 0;
  state.questNextSpawnAt = Date.now() + randomInt(12000, 24000);
  state.pendingProtectionRewards = [];
  state.processTasks = [];
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
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
  setHudVisible(true);
  void refreshMessageBadge();
  hideChoiceWheel();
  hideQuestCard();
  mentorCardOpen = true;
  updateMentorPanel();
  sceneRef?.resetLogs();
  sceneRef?.refreshScene();
  sceneRef?.setMessage("Valaszd ki a vilagterkepen, hol induljon a bazisod.");
  void openAuxPanel("world");
}

function resetGame() {
  const profileNameToDelete = state.profileName;
  const pendingSaveRequest = saveRequestInFlight;
  state.registered = false;
  latestQueuedSave = null;
  if (pendingSaveTimer) {
    window.clearTimeout(pendingSaveTimer);
    pendingSaveTimer = null;
  }
  closeRobberyGame();
  resetMapPan();
  hideAuxPanel();
  [...LEGACY_STORAGE_KEYS, LAST_PROFILE_KEY].forEach((key) => {
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
  })();
  state.profileName = "";
  state.money = 120;
  state.fame = 0;
  state.crew = 1;
  state.heat = 0;
  state.health = 100;
  state.energy = 100;
  state.gearPower = 0;
  state.equipment = getDefaultEquipment();
  state.itemInventory = getDefaultItemInventory();
  recalculateGearPower();
  state.crewMembers = makeCrewMembers();
  state.crew = getHiredCrewMembers().length || 1;
  state.activeCrewMemberId = "luca";
  state.mainBaseSpotId = null;
  state.worldBaseLotId = null;
  state.worldBaseLevel = 1;
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
  state.smuggledGoods = normalizeSmuggledGoods();
  state.smugglerFame = 0;
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
    if (avatarPortraitEl) avatarPortraitEl.src = "./assets/character/gangster-character.png";
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
      [LOT_HOUSE_TEXTURE_KEYS[1], "./lot-house-shop-level-1.png"],
      [LOT_HOUSE_TEXTURE_KEYS[2], "./lot-house-shop-level-2.png"],
      [LOT_HOUSE_TEXTURE_KEYS[3], "./lot-house-shop-level-3.png"],
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

createRobberyDefenders = function createThreeDefenders(spot, difficulty) {
  const names = ["Salvatore", "Vincent", "Tommy"];
  const types = ["watcher", "boss", "bodyguard"];
  return names.map((name, index) => {
    const maxHealth = Math.round(42 + difficulty * 0.28 + index * 6);
    return {
      id: `${spot.id}-guard-${index}`,
      name,
      type: types[index],
      maxHealth,
      health: maxHealth,
      attack: Math.round(5 + difficulty * 0.08 + index),
      defense: Math.round(3 + difficulty * 0.055 + index),
    };
  });
};

function createBattleAllies(selectedMemberIds) {
  const members = selectedMemberIds
    .map((memberId) => state.crewMembers.find((member) => member.id === memberId))
    .filter(Boolean)
    .slice(0, 2)
    .map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      maxHealth: member.baseHealth,
      health: member.health,
      attack: getCrewMemberAttack(member),
      defense: getCrewMemberDefense(member),
      isPlayer: false,
    }));
  const player = {
    id: "player",
    name: state.profileName || "Fonok",
    role: "Te",
    maxHealth: 100,
    health: state.health,
    attack: Math.max(6, getPlayerAttackStat()),
    defense: Math.max(4, getPlayerDefenseStat()),
    isPlayer: true,
  };
  return [members[0], player, members[1]];
}

function rebalanceDefendersForEncounter(encounter) {
  if (!encounter?.allies?.length || !encounter?.defenders?.length) return;
  const averageAttack = encounter.allies.reduce((sum, ally) => sum + ally.attack, 0) / encounter.allies.length;
  const averageDefense = encounter.allies.reduce((sum, ally) => sum + ally.defense, 0) / encounter.allies.length;
  const averageHealth = encounter.allies.reduce((sum, ally) => sum + ally.maxHealth, 0) / encounter.allies.length;
  const difficultyInfo = getDifficultyInfo(encounter.difficulty);
  const tierMultiplier = difficultyInfo.label === "Veszelyes"
    ? { attack: 1.2, defense: 1.16, health: 1.14 }
    : difficultyInfo.label === "Kockazatos"
      ? { attack: 0.98, defense: 0.96, health: 1 }
      : { attack: 0.76, defense: 0.72, health: 0.86 };
  const attackWeights = [0.92, 1.01, 0.92];
  const defenseWeights = [0.9, 1.08, 0.94];
  const healthWeights = [0.89, 1.08, 0.89];

  encounter.defenders = encounter.defenders.map((defender, index) => {
    const attackVariance = 0.93 + hash2(index + 1, encounter.spot.id.length, state.day) * 0.1;
    const defenseVariance = 0.94 + hash2(index + 4, encounter.spot.id.length, state.day) * 0.09;
    const healthVariance = 0.94 + hash2(index + 7, encounter.spot.id.charCodeAt(0), state.fame) * 0.09;
    const maxHealth = Math.max(38, Math.round(
      averageHealth * tierMultiplier.health * (healthWeights[index] || 1) * healthVariance,
    ));
    return {
      ...defender,
      maxHealth,
      health: maxHealth,
      attack: Math.max(5, Math.round(
        averageAttack * tierMultiplier.attack * (attackWeights[index] || 1) * attackVariance,
      )),
      defense: Math.max(3, Math.round(
        averageDefense * tierMultiplier.defense * (defenseWeights[index] || 1) * defenseVariance,
      )),
    };
  });
  encounter.difficultyInfo = difficultyInfo;
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

function queueRobberyAutoPlay(encounter, delay = 420) {
  clearRobberyAutoPlay();
  if (!encounter || activeRobberyGame !== encounter || encounter.ended || !encounter.autoPlay) return;
  robberyAutoPlayTimer = window.setTimeout(() => {
    robberyAutoPlayTimer = null;
    if (!encounter || activeRobberyGame !== encounter || encounter.ended || !encounter.autoPlay) return;
    if (encounter.turnLocked || encounter.finalizing) return;
    if (!encounter.battleStarted) {
      if (encounter.selectedMemberIds.length === 2) playRobberyTurn();
      return;
    }
    const target = pickAutoRobberyTarget(encounter);
    if (!target) {
      finishRobberySuccess();
      return;
    }
    encounter.selectedDefenderId = target.id;
    encounter.message = `${target.name} lett az automata célpont.`;
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

  const rawRetaliation = clamp(
    Math.round(enemyAttacker.attack + randomInt(-4, 5)),
    Math.max(4, Math.round(enemyAttacker.attack * 0.7)),
    Math.round(enemyAttacker.attack * 1.34),
  );
  const mitigatedDamage = Math.max(2, rawRetaliation - Math.round((allyTarget.defense || 0) * 0.55));
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

function getBattleBackground(defenders = []) {
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
  const selectedDefender = encounter.defenders.find((defender) => defender.id === encounter.selectedDefenderId && defender.health > 0);
  const arena = robberyGame.querySelector(".robbery-game__arena");
  const control = getRobberyControl(encounter);
  const enemyPower = getEncounterEnemyPower(encounter);
  const animation = encounter.actionAnimation || {};

  if (arena) {
    arena.style.backgroundImage = `linear-gradient(180deg, rgba(4, 3, 2, 0.08), rgba(4, 3, 2, 0.34)), url("${getBattleBackground(encounter.defenders)}")`;
    arena.style.backgroundPosition = "center center";
    arena.style.backgroundSize = "contain";
    arena.classList.toggle("is-enemy-thinking", animation.side === "enemy" && animation.type === "thinking");
  }
  robberyGame.style.setProperty("--encounter-accent", difficultyColorToCss(encounter.difficultyInfo?.color || 0xd6ad42));
  if (robberyGameTitle) robberyGameTitle.textContent = encounter.spot.name;
  if (robberyGameSubtitle) robberyGameSubtitle.textContent = encounter.battleStarted
    ? `${encounter.difficultyInfo.label} 3v3 harc - az ero es a vedelem is szamit`
    : "Valassz ket embert magad melle";
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
    : `Csapattarsak: ${encounter.selectedMemberIds.length}/2`;
  if (robberyLoot) robberyLoot.textContent = `Zsakmany: ${encounter.loot} $`;
  if (robberyBattleLog) robberyBattleLog.textContent = encounter.message;

  robberyDefenders?.replaceChildren();
  encounter.defenders.forEach((defender, index) => {
    const healthPercent = clamp(Math.round((defender.health / defender.maxHealth) * 100), 0, 100);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `battle-unit battle-unit--enemy battle-unit--enemy-${index + 1}`;
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
      <span class="battle-unit__combat">Ero ${defender.attack} · Vedelem ${defender.defense}</span>
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
    unit.className = `battle-unit battle-unit--ally battle-unit--ally-${index + 1}${ally.health <= 0 ? " is-defeated" : ""}${ally.isPlayer ? " is-player" : ""}`;
    unit.dataset.unitId = ally.id;
    unit.classList.toggle("is-attacking", animation.actorId === ally.id && animation.type === "attack");
    unit.classList.toggle("is-targeted", animation.targetId === ally.id);
    unit.classList.toggle("is-thinking", animation.actorId === ally.id && (animation.type === "thinking" || animation.type === "aim"));
    unit.innerHTML = `
      <span class="battle-unit__name">${ally.name}</span>
      <span class="battle-unit__role">${ally.role}</span>
      <span class="battle-unit__combat">Ero ${ally.attack} · Vedelem ${ally.defense}</span>
      <span class="battle-unit__health"><i style="width:${healthPercent}%"></i></span>
      <em>${healthPercent}%</em>
    `;
    robberyAllies?.appendChild(unit);
  });

  robberyTeamPicker?.classList.toggle("is-hidden", encounter.battleStarted);
  robberyTeamPicker?.replaceChildren();
  getHiredCrewMembers().forEach((member) => {
    const selected = encounter.selectedMemberIds.includes(member.id);
    const locked = encounter.battleStarted || (!selected && encounter.selectedMemberIds.length >= 2);
    const attack = getCrewMemberAttack(member);
    const defense = getCrewMemberDefense(member);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `robbery-team-choice${selected ? " is-selected" : ""}`;
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
          <small>${member.role}</small>
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
      if (!activeRobberyGame || activeRobberyGame.battleStarted) return;
      activeRobberyGame.selectedMemberIds = selected
        ? activeRobberyGame.selectedMemberIds.filter((id) => id !== member.id)
        : [...activeRobberyGame.selectedMemberIds, member.id];
      activeRobberyGame.message = `${activeRobberyGame.selectedMemberIds.length}/2 csapattars kivalasztva.`;
      refreshRobberyGame();
      if (activeRobberyGame.autoPlay && activeRobberyGame.selectedMemberIds.length === 2) {
        queueRobberyAutoPlay(activeRobberyGame, 260);
      } else if (activeRobberyGame.selectedMemberIds.length !== 2) {
        clearRobberyAutoPlay();
      }
    });
    robberyTeamPicker?.appendChild(button);
  });

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
    robberyAttack.disabled = encounter.ended || encounter.finalizing || encounter.turnLocked || (!encounter.battleStarted && encounter.selectedMemberIds.length !== 2);
    robberyAttack.textContent = !encounter.battleStarted
      ? "Harc inditasa"
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
  const defenders = createRobberyDefenders(spot, difficulty);
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
    allyTurnIndex: 0,
    alert: 0,
    loot: 0,
    round: 1,
    healthAtStart: state.health,
    message: "Valassz ket embert a harc megkezdesehez.",
    turnLocked: false,
    actionAnimation: null,
    ended: false,
    autoPlay: false,
  };
  clearRobberyAutoPlay();
  hideChoiceWheel();
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
    if (encounter.selectedMemberIds.length !== 2) return;
    encounter.allies = createBattleAllies(encounter.selectedMemberIds);
    rebalanceDefendersForEncounter(encounter);
    encounter.battleStarted = true;
    encounter.message = "A harc elkezdodott. Valassz ellenseget, majd tamadj!";
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
  const tacticBonus = tactic.strongAgainst === target.type ? 1.16 : 1;
  const rawDamage = Math.round((attacker.attack + randomInt(-3, 4)) * tacticBonus);
  const damage = clamp(
    rawDamage - Math.round((target.defense || 0) * 0.55),
    2,
    Math.max(3, Math.round(attacker.attack * 1.28)),
  );
  target.health = Math.max(0, target.health - damage);
  encounter.loot += randomInt(5, 12) + (target.health <= 0 ? randomInt(12, 22) : 0);
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
  harborMapZones?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-harbor-zone]");
    if (!button) {
      hideHarborOperationPanel();
      return;
    }
    const zone = harborZoneDefs.find((entry) => entry.id === button.dataset.harborZone);
    if (zone) renderHarborZonePanel(zone);
  });
  harborMapView?.addEventListener("click", (event) => {
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
  policeRaidClose?.addEventListener("click", hidePoliceRaidPanel);
  policeRaidBackdrop?.addEventListener("click", hidePoliceRaidPanel);

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
    updateMentorPanel();
  });
  hudMentorClose?.addEventListener("click", (event) => {
    event.stopPropagation();
    mentorCardOpen = false;
    updateMentorPanel();
  });
  characterPanelClose?.addEventListener("click", hideCharacterPanel);
  characterPanelBackdrop?.addEventListener("click", hideCharacterPanel);
  equipmentPickerClose?.addEventListener("click", hideEquipmentPicker);
  characterPanel?.addEventListener("click", (event) => {
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
    if (!event.target.closest(".equipment-picker")) hideEquipmentPicker();
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
  const saved = await loadGame(name);
  if (saved && state.profileName === name) {
    overlay.classList.add("hidden");
    setHudVisible(true);
    void refreshMessageBadge();
    sceneRef?.refreshScene();
    if (state.needsWorldBaseSelection) {
      void openAuxPanel("world");
    }
    registerForm.querySelector('button[type="submit"]')?.removeAttribute("disabled");
    return;
  }

  startNewGame(name);
  registerForm.querySelector('button[type="submit"]')?.removeAttribute("disabled");
});

playerNameInput.value = getRememberedProfileName();

bindHudActions();
setHudVisible(false);
new Phaser.Game(config);

window.addEventListener("beforeunload", () => {
  const snapshot = state.registered ? createSaveSnapshot() : null;
  if (!snapshot?.profileName) return;
  try {
    navigator.sendBeacon(
      `${SAVE_API_BASE}/${encodeURIComponent(snapshot.profileName)}`,
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
