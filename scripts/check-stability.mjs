import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = String(process.env.QA_BASE_URL || "http://127.0.0.1:8766").replace(/\/$/, "");
const failures = [];
const checks = [];

function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

async function get(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, { cache: "no-store" });
  return { response, text: await response.text() };
}

const health = await get("/api/health");
check("szerver health", health.response.ok && JSON.parse(health.text).ok === true, `HTTP ${health.response.status}`);

const page = await get("/");
const styleSource = fs.readFileSync(path.join(root, "style.css"), "utf8");
check("login felulet", page.response.ok && page.text.includes('id="registerForm"') && page.text.includes('id="previewRegistrationForm"'));
check("kozossegi megosztasi kep", page.text.includes('property="og:image" content="https://maffiabirodalom.hu/register.webp"') && page.text.includes('name="twitter:card" content="summary_large_image"'));
check("belepesi adatok nem kerulnek URL-be", page.text.includes('id="registerForm" class="login-panel login-panel--signin" method="post"') && page.text.includes("window.history.replaceState"));
check("kormenu", page.text.includes('id="choiceWheel"') && page.text.includes('id="choiceWheelAction5"'));
check("27-es telek", page.text.includes('id="underpassModal"') && page.text.includes('id="underpassTitle"') && page.text.includes('id="shellGameHotspot"'));
check("kikoto kontenerek", ["harborMapView", "harborMapZones", "harborOperationPanel", "hudQuickDock"].every((id) => page.text.includes(`id="${id}"`)));
check(
  "nexforge studio link",
  page.text.includes('href="https://nexforge.hu/"')
    && page.text.includes('rel="noopener noreferrer"')
    && styleSource.includes("pointer-events: auto;")
    && styleSource.includes("body.is-harbor-map-open .studio-hub")
    && !styleSource.includes("body.is-harbor-map-open .studio-hub {\n  display: none;"),
);

const gameSource = fs.readFileSync(path.join(root, "game.js"), "utf8");
const mapConfigSource = fs.readFileSync(path.join(root, "js", "map-config.js"), "utf8");
const saveSyncSource = fs.readFileSync(path.join(root, "js", "save-sync.js"), "utf8");
const questSource = fs.readFileSync(path.join(root, "js", "quests.js"), "utf8");
const choiceWheelSource = fs.readFileSync(path.join(root, "js", "ui-choice-wheel.js"), "utf8");
const harborSource = fs.readFileSync(path.join(root, "js", "harbor.js"), "utf8");
const dungeonSource = fs.readFileSync(path.join(root, "js", "dungeon.js"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
check("terkepmodul betoltese", page.text.includes("js/map-config.js") && mapConfigSource.includes("clickableLotDefs"));
check("mentes es betoltes", page.text.includes("js/save-sync.js") && ["flushQueuedSave", "loadGame", "requestSaveApi"].every((name) => saveSyncSource.includes(name)));
check("kuldetesjelolok", page.text.includes("js/quests.js") && questSource.includes("MAX_OFFERED_QUESTS = 3") && questSource.includes("createQuestMarker") && questSource.includes("mergeStableOfferedQuestList"));
check("kormenu logika", page.text.includes("js/ui-choice-wheel.js") && choiceWheelSource.includes("showChoiceWheel") && choiceWheelSource.includes("runChoiceAction"));
check("ertesites torles", gameSource.includes('data-message-delete-kind="${notificationMode ? "notification" : "message"}') && gameSource.includes("messagesPanelData[deleteKind]"));
check("27-es telek logika", mapConfigSource.includes('number: "27"') && gameSource.includes('area.kind === "underground"') && choiceWheelSource.includes("showUnderpassModal"));
check("kikoto hubok", page.text.includes("js/harbor.js") && ["rail-hub", "customs-hub", "harbor-office-hub"].every((marker) => harborSource.includes(marker)));
check("garazs minijatek kattintas", harborSource.includes('control.addEventListener("pointerdown", submitCheckpoint)') && harborSource.includes("gameState.lockedPointer = gameState.pointer") && harborSource.includes("stopGarageMiniGame(false)"));
check("dungeon", page.text.includes('id="dungeonHotspot"') && page.text.includes('id="dungeonModal"') && page.text.includes("js/dungeon.js") && ["easy", "medium", "hard", "rollRound"].every((marker) => dungeonSource.includes(marker)));
check("dungeon tartos eletero", dungeonSource.includes("if (!playerCombat || index === 0) playerCombat = buildPlayerCombatStats()"));
check("dungeon hullam-egyensuly", dungeonSource.includes("const waveScale") && dungeonSource.includes("Math.round(playerCombat.maxHealth * .15)"));
check("alvilagi mentes", ["underworldMoney", "underworldXp", "dungeonProgress"].every((field) => saveSyncSource.includes(field)));
check("kozos normalizalo", saveSyncSource.includes("normalizeClientStateAfterServerUpdate"));
const market = await get("/api/market-items?limit=100");
const marketPayload = market.response.ok ? JSON.parse(market.text) : { items: [] };
const marketNow = Date.now();
check(
  "piaci ajanlatok ervenyesek",
  Array.isArray(marketPayload.items)
    && marketPayload.items.every((item) => Number(item.stock) >= 0 && (!item.expiresAt || Number(item.expiresAt) > marketNow))
    && serverSource.includes("AND (expires_at IS NULL OR expires_at > ?)")
    && gameSource.includes('fetch("/api/market-items/refresh"'),
);
check("feketepiaci vasarlas szinkron", gameSource.includes("async function syncMarketStockFromServer") && gameSource.includes("applyMarketApiItems") && gameSource.includes("await buyMarketItem(button.dataset.marketBuy, options)") && harborSource.includes("await syncMarketStockFromServer()") && harborSource.includes('if (zone.id === "market") return openHarborMarket(zone)'));
check("feketepiaci szerveres azonosito", serverSource.includes("canonicalPayload") && gameSource.includes("entry?.itemId || payloadItem.id"));
check("feketepiaci leltarba iras", serverSource.includes("state.itemInventory[slot].push(item)") && serverSource.includes("committedInventory[slot]") && serverSource.includes("await persistPvpState(profileName, state, now)") && serverSource.includes("runMarketRefreshCommand"));
check("ures leltarslot nem kap szellemtargyat", gameSource.includes("const hasSavedSlot = Array.isArray(source?.[slot])") && gameSource.includes("hasSavedSlot ? [] : defaults[slot]"));
check(
  "nyolc feketepiaci aru es teljes idozitett csere",
  gameSource.includes("if (items.length >= MARKET_MAX_OFFERS)")
    && gameSource.includes("Math.floor(refreshAt / MARKET_REFRESH_MS)")
    && serverSource.includes("if (existingRows.length > 0)")
    && serverSource.includes("entry?.item?.id === itemId ? { ...entry, stock: 0 } : entry")
    && serverSource.includes("items.length !== SERVER_MARKET_MAX_OFFERS")
    && !serverSource.includes("await renewExpiredMarketItemsByOwnerStmt.run"),
);
check(
  "feketepiac szerveres automatikus ujratoltes",
  serverSource.includes("function createServerMarketStock")
    && serverSource.includes("rows.length === 0")
    && serverSource.includes("const refreshResult = await runMarketRefreshCommand(ownerFilter)")
    && serverSource.includes("const marketStock = createServerMarketStock(profileName, now)")
    && serverSource.includes('source: "black-market"'),
);

console.table(checks);
if (failures.length) {
  throw new Error(`Stabilitasi ellenorzes sikertelen:\n- ${failures.join("\n- ")}`);
}
console.log(`Stabilitasi ellenorzes: ${checks.length}/${checks.length} rendben.`);
