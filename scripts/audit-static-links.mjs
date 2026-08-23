import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (value) => fs.existsSync(path.join(root, value));
const jsFiles = [
  "game.js",
  ...fs.readdirSync(path.join(root, "js"))
    .filter((name) => name.endsWith(".js"))
    .map((name) => `js/${name}`),
];

const apiRoots = new Set();
for (const file of jsFiles) {
  const source = read(file);
  for (const match of source.matchAll(/fetch\s*\(\s*[`"'](\/api\/[^`"'?${}]*)/g)) {
    apiRoots.add(match[1]);
  }
}

const server = read("server.js");
const dynamicServerRoots = [
  "/api/actions/economy/",
  "/api/clans/wars/",
];
const missingRoutes = [...apiRoots]
  .filter((route) => !server.includes(route) && !dynamicServerRoots.includes(route))
  .sort();

const missingFiles = [];
const checkLocalReference = (owner, rawValue) => {
  if (!rawValue || /^(?:https?:|data:|mailto:|#)/i.test(rawValue)) return;
  const clean = rawValue.split("?")[0].split("#")[0].replace(/^\.\//, "");
  if (clean && !exists(clean)) missingFiles.push({ owner, value: rawValue });
};

for (const match of read("index.html").matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  checkLocalReference("index.html", match[1]);
}
for (const match of read("service-worker.js").matchAll(/["'](\.\/[^"']+)["']/g)) {
  checkLocalReference("service-worker.js", match[1]);
}

console.log(`Kliens API-törzsek: ${apiRoots.size}`);
console.log(`Hiányzó szerverútvonalak: ${missingRoutes.length}`);
missingRoutes.forEach((route) => console.log(`  - ${route}`));
console.log(`Hiányzó statikus fájlok: ${missingFiles.length}`);
missingFiles.forEach(({ owner, value }) => console.log(`  - ${owner}: ${value}`));

if (missingRoutes.length || missingFiles.length) process.exitCode = 1;
