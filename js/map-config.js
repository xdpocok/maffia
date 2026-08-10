// Static city map configuration. Keep runtime behavior in game.js.

function mapPolygon(points) {
  return points.map(([x, y]) => [x / 1534, y / 1025]);
}

const cityBuildingDefs = [
  { id: "north-estate", number: "02", districtIndex: 4, name: "Foepulet", mode: "shop", polygon: mapPolygon([[795,39],[827,18],[850,20],[851,1],[901,13],[916,29],[949,38],[964,57],[970,108],[944,134],[896,148],[850,131],[811,108],[798,82]]), plot: mapPolygon([[716,55],[895,0],[1031,70],[1012,142],[870,176],[742,127]]) },
  { id: "west-tenement", number: "04", districtIndex: 0, name: "Belvarosi berhaz", mode: "street", polygon: mapPolygon([[133,256],[155,239],[171,241],[171,225],[198,230],[207,242],[239,249],[254,265],[254,316],[235,335],[188,346],[158,333],[135,313]]), plot: mapPolygon([[57,289],[184,226],[316,289],[307,356],[180,400],[79,352]]) },
  { id: "northwest-block", number: "05", districtIndex: 0, name: "Szurke sarokhaz", mode: "street", polygon: mapPolygon([[312,185],[342,159],[367,162],[369,145],[416,151],[425,164],[466,173],[482,190],[489,249],[465,272],[405,282],[363,269],[324,254]]), plot: mapPolygon([[287,192],[431,128],[573,192],[551,282],[419,328],[311,275]]) },
  { id: "dome-hall", number: "05", districtIndex: 1, name: "Kupolas csarnok", mode: "shop", polygon: mapPolygon([[464,252],[496,208],[519,203],[519,187],[570,170],[603,180],[608,195],[647,207],[663,230],[665,282],[646,317],[620,339],[568,362],[526,351],[487,328],[468,297]]), plot: mapPolygon([[430,273],[590,179],[732,246],[704,371],[566,430],[459,356]]) },
  { id: "market-row", number: "06", districtIndex: 1, name: "Piac sori uzlethaz", mode: "shop", polygon: mapPolygon([[837,281],[861,253],[875,253],[876,237],[915,229],[930,240],[967,247],[984,266],[984,321],[965,341],[921,357],[878,345],[845,326]]), plot: mapPolygon([[806,286],[920,230],[965,280],[1020,350],[930,400],[832,357]]) },
  { id: "sale-block", number: "07", districtIndex: 4, name: "Villanegyedi tomb", mode: "shop", polygon: mapPolygon([[963,185],[990,164],[1005,165],[1006,146],[1050,151],[1060,164],[1097,173],[1110,191],[1110,253],[1093,274],[1045,289],[1000,277],[969,257]]), plot: mapPolygon([[944,213],[1070,146],[1194,208],[1170,291],[1051,336],[968,277]]) },
  { id: "east-small-block", number: "08", districtIndex: 1, name: "Keleti kis uzlethaz", mode: "shop", polygon: mapPolygon([[1116,259],[1138,242],[1150,244],[1150,229],[1173,232],[1180,241],[1195,248],[1205,260],[1205,314],[1190,330],[1161,341],[1133,332],[1119,315]]), plot: mapPolygon([[1083,276],[1160,238],[1230,275],[1215,335],[1148,360],[1095,325]]) },
  { id: "billboard-tower", number: "09", districtIndex: 2, name: "Luchese torony", mode: "shop", polygon: mapPolygon([[1228,204],[1254,178],[1270,180],[1271,154],[1310,142],[1331,151],[1334,165],[1368,177],[1385,197],[1398,285],[1391,359],[1371,401],[1335,428],[1292,414],[1253,389],[1235,350]]), plot: mapPolygon([[1172,260],[1330,157],[1470,226],[1433,454],[1301,497],[1201,414]]) },
  { id: "west-mid-block", number: "11", districtIndex: 0, name: "Nyugati sarokhaz", mode: "street", polygon: mapPolygon([[299,361],[328,333],[343,334],[344,314],[386,319],[398,332],[430,338],[443,357],[443,420],[421,442],[369,453],[331,438],[303,419]]), plot: mapPolygon([[268,378],[395,303],[522,370],[500,474],[376,516],[288,453]]) },
  { id: "mid-office", number: "12", districtIndex: 2, name: "Rakparti iroda", mode: "shop", polygon: mapPolygon([[655,370],[684,340],[700,339],[700,321],[738,311],[752,320],[785,327],[801,345],[806,410],[785,434],[744,450],[700,438],[663,417]]), plot: mapPolygon([[604,390],[746,302],[875,373],[852,482],[731,523],[632,455]]) },
  { id: "east-office", number: "13", districtIndex: 2, name: "Keleti uzlethaz", mode: "shop", polygon: mapPolygon([[982,405],[1011,375],[1027,376],[1028,357],[1072,363],[1084,375],[1124,383],[1142,403],[1143,463],[1122,485],[1074,500],[1030,487],[991,468]]), plot: mapPolygon([[947,426],[1080,341],[1215,410],[1190,517],[1062,562],[978,492]]) },
  { id: "central-bank", number: "16", districtIndex: 5, name: "Perem bankhaz", mode: "street", polygon: mapPolygon([[680,574],[711,536],[729,535],[730,512],[785,493],[813,501],[817,518],[855,529],[878,554],[886,629],[866,658],[813,681],[760,669],[716,642],[690,614]]), plot: mapPolygon([[697,578],[815,493],[947,561],[925,700],[800,739],[724,672]]) },
  { id: "southeast-block", number: "19", districtIndex: 2, name: "Delkeleti berhaz", mode: "shop", polygon: mapPolygon([[1359,574],[1387,541],[1404,542],[1405,522],[1448,512],[1464,523],[1501,531],[1519,551],[1521,634],[1500,657],[1454,674],[1410,661],[1370,640]]), plot: mapPolygon([[1265,626],[1397,525],[1534,592],[1501,752],[1403,787],[1298,721]]) },
  { id: "moretti-import", number: "20", districtIndex: 3, name: "Moretti import", mode: "street", polygon: mapPolygon([[96,615],[125,576],[147,575],[148,552],[215,531],[246,541],[249,558],[293,572],[325,604],[346,693],[334,743],[302,777],[239,800],[174,782],[123,751],[102,705]]), plot: mapPolygon([[82,646],[242,533],[396,614],[335,740],[225,820],[111,765]]) },
  { id: "southwest-tenement", number: "21", districtIndex: 3, name: "Gyarnegyedi haz", mode: "street", polygon: mapPolygon([[302,742],[329,713],[344,714],[345,696],[388,686],[403,697],[439,704],[456,724],[459,811],[438,833],[392,850],[349,838],[311,817]]), plot: mapPolygon([[239,820],[388,705],[532,778],[510,930],[358,971],[266,899]]) },
  { id: "courthouse", number: "23", districtIndex: 5, name: "Feher portikusz", mode: "street", polygon: mapPolygon([[997,665],[1026,632],[1043,633],[1044,615],[1086,606],[1102,617],[1138,624],[1156,644],[1158,709],[1137,731],[1091,748],[1048,736],[1008,716]]), plot: mapPolygon([[962,683],[1091,591],[1237,666],[1164,756],[1081,820],[990,776]]) },
];

const purchasableBuildingNumbers = new Set(["06", "11", "13", "16", "21"]);
const clickableBuildingDefs = cityBuildingDefs.filter((building) => !purchasableBuildingNumbers.has(building.number));
const purchasableBuildingRestoreDefs = {
  "market-row": { asset: "./assets/map/purchasable-houses-v4/market-row.png", x: 809, y: 225, width: 205, height: 151 },
  "west-mid-block": { asset: "./assets/map/purchasable-houses-v4/west-mid-block.png", x: 265, y: 300, width: 261, height: 220 },
  "east-office": { asset: "./assets/map/purchasable-houses-v4/east-office.png", x: 944, y: 338, width: 275, height: 228 },
  "central-bank": { asset: "./assets/map/purchasable-houses-v4/central-bank.png", x: 694, y: 490, width: 257, height: 253 },
  "southwest-tenement": { asset: "./assets/map/purchasable-houses-v4/southwest-tenement.png", x: 236, y: 702, width: 300, height: 273 },
  "courthouse": { asset: "./assets/map/purchasable-houses-v4/courthouse.png", x: 953, y: 582, width: 274, height: 254 },
};

const clickableParkDefs = [
  { id: "northwest-park", number: "01", name: "Eszaknyugati park", kind: "park", polygon: mapPolygon([[557,116],[743,15],[897,94],[863,188],[710,231],[586,174]]) },
  { id: "northeast-park", number: "03", name: "Eszakkeleti park", kind: "park", polygon: mapPolygon([[1026,149],[1208,52],[1350,130],[1320,150],[1180,240],[1054,207]]) },
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
  { id: "southeast-underpass", number: "27", name: "Aluljáró", kind: "underground", landmarkAsset: "./assets/map/underpass-mafia-green-lot27-hires-v11.webp", landmarkWidthScale: 1, landmarkHeightScale: 1, landmarkOffsetX: 0, landmarkOffsetY: -6, landmarkStretch: true, polygon: mapPolygon([[1276,708],[1384,788],[1232,898],[1125,810]]) },
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
const passiveIncomeOnlyLotIds = new Set([
  "east-empty-lot",
  "central-empty-lot",
]);

const lotHouseLevelDefs = {
  1: {
    name: "Kisbolti telekhaz",
    asset: "./assets/lot-house-level-1.webp",
    income: 80,
    widthFactor: 0.56,
    heightFactor: 0.58,
    yOffset: 0.08,
  },
  2: {
    name: "Kavezos telekhaz",
    asset: "./assets/lot-house-level-2.webp",
    income: 190,
    widthFactor: 0.62,
    heightFactor: 0.62,
    yOffset: 0.085,
  },
  3: {
    name: "Diszes viragboltos telekhaz",
    asset: "./assets/lot-house-level-3.webp",
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

buildingHoverAdjustments.courthouse = {
  dx: 10,
  dy: 8,
  scale: 0.97,
  clipScale: 0.99,
};
