import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const budget = JSON.parse(fs.readFileSync(path.join(root, "performance", "budget.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(root, "performance", "asset-report-after.json"), "utf8"));
const files = [
  "assets-inline.js", "game.js", "js/asset-runtime.js", "js/world-map.js", "js/city-scene.js", "js/app-shell.js",
  "style.css", "styles/combat.css", "styles/features.css",
].filter((file) => fs.existsSync(path.join(root, file)));
const scriptBytes = files.filter((file) => file.endsWith(".js")).reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
const stylesheetBytes = files.filter((file) => file.endsWith(".css")).reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
const referencedLargeImages = (report.referencedImages || []).filter((entry) => entry.bytes > 1_000_000);
const checks = [
  ["Helyi JavaScript", scriptBytes, budget.maxScriptBytes],
  ["CSS", stylesheetBytes, budget.maxStylesheetBytes],
  ["1 MB feletti hivatkozott kep", referencedLargeImages.length, budget.maxReferencedImagesOver1MB],
  ["Hianyzo kep-hivatkozas", (report.missingImageReferences || []).length, 0],
];
let failed = false;
for (const [label, actual, limit] of checks) {
  const ok = actual <= limit;
  failed ||= !ok;
  console.log(`${ok ? "OK" : "HIBA"} ${label}: ${actual} / ${limit}`);
}
if (failed) process.exitCode = 1;
