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
check("login felulet", page.response.ok && page.text.includes('id="registerForm"') && page.text.includes('id="previewRegistrationForm"'));
check("kormenu", page.text.includes('id="choiceWheel"') && page.text.includes('id="choiceWheelAction5"'));
check("27-es telek", page.text.includes('id="underpassModal"') && page.text.includes("27-es telek"));
check("kikoto kontenerek", ["harborMapView", "harborMapZones", "harborOperationPanel", "hudQuickDock"].every((id) => page.text.includes(`id="${id}"`)));

const gameSource = fs.readFileSync(path.join(root, "game.js"), "utf8");
const mapConfigSource = fs.readFileSync(path.join(root, "js", "map-config.js"), "utf8");
const saveSyncSource = fs.readFileSync(path.join(root, "js", "save-sync.js"), "utf8");
const questSource = fs.readFileSync(path.join(root, "js", "quests.js"), "utf8");
const choiceWheelSource = fs.readFileSync(path.join(root, "js", "ui-choice-wheel.js"), "utf8");
const harborSource = fs.readFileSync(path.join(root, "js", "harbor.js"), "utf8");
check("terkepmodul betoltese", page.text.includes("js/map-config.js") && mapConfigSource.includes("clickableLotDefs"));
check("mentes es betoltes", page.text.includes("js/save-sync.js") && ["flushQueuedSave", "loadGame", "requestSaveApi"].every((name) => saveSyncSource.includes(name)));
check("kuldetesjelolok", page.text.includes("js/quests.js") && questSource.includes("MAX_OFFERED_QUESTS = 3") && questSource.includes("createQuestMarker") && questSource.includes("mergeStableOfferedQuestList"));
check("kormenu logika", page.text.includes("js/ui-choice-wheel.js") && choiceWheelSource.includes("showChoiceWheel") && choiceWheelSource.includes("runChoiceAction"));
check("27-es telek logika", mapConfigSource.includes('number: "27"') && gameSource.includes('area.kind === "underground"') && choiceWheelSource.includes("showUnderpassModal"));
check("kikoto hubok", page.text.includes("js/harbor.js") && ["rail-hub", "customs-hub", "harbor-office-hub"].every((marker) => harborSource.includes(marker)));
check("kozos normalizalo", saveSyncSource.includes("normalizeClientStateAfterServerUpdate"));

console.table(checks);
if (failures.length) {
  throw new Error(`Stabilitasi ellenorzes sikertelen:\n- ${failures.join("\n- ")}`);
}
console.log(`Stabilitasi ellenorzes: ${checks.length}/${checks.length} rendben.`);
