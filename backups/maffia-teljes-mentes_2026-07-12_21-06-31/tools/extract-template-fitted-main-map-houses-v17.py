from pathlib import Path
import json

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
TEMPLATE_DIR = MAP_DIR / "purchasable-houses-v3"
OUT_DIR = MAP_DIR / "purchasable-houses-cutouts-v17"

SEARCH_WINDOWS = {
    "market-row": (760, 180, 1130, 450),
    "west-mid-block": (230, 260, 550, 535),
    "east-office": (900, 300, 1245, 580),
    "central-bank": (620, 440, 980, 750),
    "southwest-tenement": (210, 640, 570, 980),
    "courthouse": (920, 550, 1265, 865),
}

SCALES = [round(0.92 + i * 0.01, 2) for i in range(31)]


def read_rgb(path):
    return cv2.cvtColor(cv2.imread(str(path), cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)


def read_rgba(path):
    return cv2.cvtColor(cv2.imread(str(path), cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA)


def resize_template(template, scale):
    h, w = template.shape[:2]
    size = (max(8, round(w * scale)), max(8, round(h * scale)))
    rgb = cv2.resize(template[:, :, :3], size, interpolation=cv2.INTER_LANCZOS4)
    alpha = cv2.resize(template[:, :, 3], size, interpolation=cv2.INTER_LANCZOS4)
    mask = np.where(alpha > 32, 255, 0).astype(np.uint8)
    return rgb, alpha, mask


def masked_template_score(source_crop, template_rgb, mask):
    masked_pixels = int(np.count_nonzero(mask))
    if masked_pixels < 500:
        return None
    result = cv2.matchTemplate(source_crop, template_rgb, cv2.TM_CCORR_NORMED, mask=mask)
    _, max_value, _, max_location = cv2.minMaxLoc(result)
    if not np.isfinite(max_value):
        return None
    return float(max_value), max_location


def fit_one(source_rgb, name):
    template = read_rgba(TEMPLATE_DIR / f"{name}.png")
    sx1, sy1, sx2, sy2 = SEARCH_WINDOWS[name]
    search = source_rgb[sy1:sy2, sx1:sx2]
    best = None

    for scale in SCALES:
        template_rgb, alpha, mask = resize_template(template, scale)
        th, tw = template_rgb.shape[:2]
        if th >= search.shape[0] or tw >= search.shape[1]:
            continue
        score = masked_template_score(search, template_rgb, mask)
        if score is None:
            continue
        value, (lx, ly) = score
        candidate = {
            "score": value,
            "scale": scale,
            "x": sx1 + lx,
            "y": sy1 + ly,
            "width": tw,
            "height": th,
            "alpha": alpha,
        }
        if best is None or candidate["score"] > best["score"]:
            best = candidate

    if best is None:
        raise RuntimeError(f"No match found for {name}")
    return best


def checker(size, cell=16):
    a = np.zeros((size[1], size[0], 4), dtype=np.uint8)
    for y in range(size[1]):
        for x in range(size[0]):
            color = (66, 58, 48, 255) if ((x // cell) + (y // cell)) % 2 else (36, 32, 27, 255)
            a[y, x] = color
    return Image.fromarray(a, "RGBA")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source_rgb = read_rgb(SOURCE)
    source_rgba = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(CLEAN).convert("RGBA")
    metadata = {}
    cells = []

    for name in SEARCH_WINDOWS:
        fit = fit_one(source_rgb, name)
        x, y, w, h = fit["x"], fit["y"], fit["width"], fit["height"]
        cutout = source_rgba.crop((x, y, x + w, y + h)).convert("RGBA")
        alpha = Image.fromarray(fit["alpha"], "L")
        cutout.putalpha(alpha)
        cutout.save(OUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (x, y))

        metadata[name] = {
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "scale": fit["scale"],
            "score": round(fit["score"], 5),
        }
        print(f"{name}: {metadata[name]}")

        cell = checker((w + 24, h + 24))
        cell.alpha_composite(cutout, (12, 12))
        cells.append(cell)

    (OUT_DIR / "placement.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    preview.save(OUT_DIR / "placement-preview.png", optimize=True)

    columns = 3
    gap = 18
    cell_w = max(cell.width for cell in cells)
    cell_h = max(cell.height for cell in cells)
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, cell in enumerate(cells):
        x = gap + (index % columns) * (cell_w + gap)
        y = gap + (index // columns) * (cell_h + gap)
        sheet.alpha_composite(cell, (x, y))
    sheet.save(OUT_DIR / "cutout-sheet.png", optimize=True)


if __name__ == "__main__":
    main()
