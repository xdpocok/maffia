import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("C:/Users/Montech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "assets", "world", "generated", "world-map-mafia-v2-source.png");
const fullPath = path.join(root, "assets", "world", "world-map-mafia-v2-9516.webp");
const previewPath = path.join(root, "assets", "world", "world-map-mafia-v2-preview.webp");

const targetWidth = 9516;
const targetHeight = 4960;

await sharp(sourcePath, { limitInputPixels: false })
  .resize({
    width: targetWidth,
    height: targetHeight,
    fit: "fill",
    kernel: sharp.kernel.lanczos3,
  })
  .sharpen({ sigma: 1.1, m1: 0.7, m2: 1.4, x1: 2, y2: 10, y3: 10 })
  .webp({ quality: 90, effort: 6, smartSubsample: true })
  .toFile(fullPath);

await sharp(sourcePath)
  .resize({ width: 1920, height: 1001, fit: "fill", kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 0.7 })
  .webp({ quality: 90, effort: 6, smartSubsample: true })
  .toFile(previewPath);

const fullMeta = await sharp(fullPath, { limitInputPixels: false }).metadata();
const previewMeta = await sharp(previewPath).metadata();
console.log(`World map built: ${fullMeta.width}x${fullMeta.height} (${fullPath})`);
console.log(`Preview built: ${previewMeta.width}x${previewMeta.height} (${previewPath})`);
