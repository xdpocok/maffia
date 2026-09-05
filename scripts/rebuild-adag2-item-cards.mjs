import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("C:/Users/Montech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const root = path.resolve(import.meta.dirname, "..");
const atlasPath = path.join(root, "assets", "items", "generated", "equipment-icon-sheet-2026-08-01.png");
const accessorySourceDir = path.join(root, "assets", "items", "generated", "clean-accessories-v2");
const itemRoot = path.join(root, "assets", "items", "adag2");
const backupRoot = path.join(root, "backups", "item-crops-before-fix-2026-08-24");

const cardWidth = 164;
const cardHeight = 186;
const rarities = {
  gray: { main: "#c4c5c4", glow: "#747777" },
  yellow: { main: "#e1b32f", glow: "#80631b" },
  red: { main: "#e34b43", glow: "#862c28" },
};

const accessoryNames = [
  "pocket-square-white",
  "ring-onyx",
  "tie-charcoal",
  "tie-clip-gold",
  "tie-crimson",
  "tie-navy",
];

const pantsCells = {
  "pants-brown": [280, 330, 66, 154],
  "pants-charcoal": [348, 330, 64, 154],
  "pants-pinstripe": [135, 330, 70, 154],
  "pants-sand": [414, 330, 66, 154],
  "pants-wool-dark": [482, 330, 62, 154],
  "pants-wool-light": [547, 330, 62, 154],
};

const weaponCells = {
  "patrol-revolver": [135, 511, 70, 142],
  "steel-pistol": [411, 511, 58, 142],
  "sawn-off": [785, 511, 54, 142],
  "long-shotgun": [842, 511, 56, 142],
  "smg-drum": [1073, 511, 53, 142],
};

function backgroundSvg() {
  return Buffer.from(`<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="bg" cx="50%" cy="43%" r="72%"><stop offset="0" stop-color="#19140d"/><stop offset=".58" stop-color="#090806"/><stop offset="1" stop-color="#020202"/></radialGradient></defs>
    <rect width="164" height="186" fill="transparent"/>
    <rect x="5" y="5" width="154" height="176" rx="19" fill="url(#bg)"/>
  </svg>`);
}

function frameSvg(rarity) {
  const { main, glow } = rarities[rarity];
  return Buffer.from(`<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="156" height="178" rx="21" fill="none" stroke="#817d73" stroke-width="2"/>
    <rect x="8" y="8" width="148" height="170" rx="18" fill="none" stroke="${main}" stroke-width="4"/>
    <rect x="14" y="14" width="136" height="158" rx="13" fill="none" stroke="${glow}" stroke-width="2"/>
    <rect x="19" y="19" width="126" height="148" rx="9" fill="none" stroke="#5c4828" stroke-width="1"/>
  </svg>`);
}

async function makeCard(objectBuffer, outputPath, rarity) {
  const fitted = await sharp(objectBuffer)
    .resize({ width: 118, height: 140, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(backgroundSvg())
    .composite([
      { input: fitted, left: 23, top: 23 },
      { input: frameSvg(rarity), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath);
}

async function backupDirectory(name) {
  const source = path.join(itemRoot, name);
  const target = path.join(backupRoot, name);
  await fs.mkdir(target, { recursive: true });
  for (const entry of await fs.readdir(source)) {
    if (!entry.endsWith(".png")) continue;
    await fs.copyFile(path.join(source, entry), path.join(target, entry));
  }
}

async function atlasCell(rect) {
  const [left, top, width, height] = rect;
  return sharp(atlasPath).extract({ left, top, width, height }).png().toBuffer();
}

await Promise.all(["accessories", "pants", "weapons"].map(backupDirectory));

for (const name of accessoryNames) {
  const sourcePath = path.join(accessorySourceDir, `${name}.png`);
  const object = await sharp(sourcePath)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  for (const rarity of Object.keys(rarities)) {
    await makeCard(object, path.join(itemRoot, "accessories", `${name}-${rarity}.png`), rarity);
  }
}

for (const [name, rect] of Object.entries(pantsCells)) {
  const object = await atlasCell(rect);
  for (const rarity of Object.keys(rarities)) {
    await makeCard(object, path.join(itemRoot, "pants", `${name}-${rarity}.png`), rarity);
  }
}

for (const [name, rect] of Object.entries(weaponCells)) {
  const object = await atlasCell(rect);
  for (const rarity of Object.keys(rarities)) {
    await makeCard(object, path.join(itemRoot, "weapons", `${name}-${rarity}.png`), rarity);
  }
}

const stilettoSource = await sharp(path.join(itemRoot, "weapons", "stiletto-knife-red.png"))
  .extract({ left: 142, top: 61, width: 108, height: 134 })
  .png()
  .toBuffer();
for (const rarity of Object.keys(rarities)) {
  await makeCard(stilettoSource, path.join(itemRoot, "weapons", `stiletto-knife-${rarity}.png`), rarity);
}

console.log("Adag2 item cards rebuilt: 18 accessories, 18 pants, 18 weapons.");
