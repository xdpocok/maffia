from pathlib import Path
import json

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE_DIR = MAP_DIR / "purchasable-houses-v3"
CLEAN_MAP = MAP_DIR / "map-background-clean-roadfix.png"
OUT_DIR = MAP_DIR / "purchasable-houses-v3-per-house-fit-trial-v22"

TARGET_BOXES = {
    "market-row": {"x": 803, "y": 214, "width": 281, "height": 206},
    "west-mid-block": {"x": 265, "y": 300, "width": 261, "height": 220},
    "east-office": {"x": 944, "y": 338, "width": 275, "height": 228},
    "central-bank": {"x": 694, "y": 490, "width": 257, "height": 253},
    "southwest-tenement": {"x": 236, "y": 702, "width": 300, "height": 273},
    "courthouse": {"x": 959, "y": 588, "width": 282, "height": 262},
}

# Per-house manual fit. Start from proportional v3 scaling and tune each house
# separately so the lot edge stays inside the green boundary on the clean map.
PER_HOUSE = {
    "market-row": {"scale": 0.950, "dx": 1, "dy": 5},
    "west-mid-block": {"scale": 0.940, "dx": 2, "dy": 7},
    "east-office": {"scale": 0.920, "dx": 0, "dy": 9},
    "central-bank": {"scale": 0.935, "dx": -1, "dy": 10},
    "southwest-tenement": {"scale": 0.920, "dx": 10, "dy": 12},
    "courthouse": {"scale": 0.925, "dx": 2, "dy": 14},
}

CROP_WINDOWS = {
    "market-row": (735, 150, 1135, 455),
    "west-mid-block": (205, 235, 565, 555),
    "east-office": (880, 280, 1260, 600),
    "central-bank": (620, 425, 1010, 775),
    "southwest-tenement": (170, 625, 590, 1015),
    "courthouse": (890, 525, 1280, 890),
}


def checker(size, cell=16):
    image = Image.new("RGBA", size, (36, 32, 27, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if ((x // cell) + (y // cell)) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(66, 58, 48, 255))
    return image


def base_scale(source, target):
    sx = target["width"] / source.width
    sy = target["height"] / source.height
    return (sx + sy) / 2


def build():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    preview = Image.open(CLEAN_MAP).convert("RGBA")
    debug = preview.copy()
    placements = {}
    rendered = {}

    for name, target in TARGET_BOXES.items():
        source = Image.open(SOURCE_DIR / f"{name}.png").convert("RGBA")
        tune = PER_HOUSE[name]
        scale = base_scale(source, target) * tune["scale"]
        width = round(source.width * scale)
        height = round(source.height * scale)
        x = round(target["x"] + (target["width"] - width) / 2 + tune["dx"])
        y = round(target["y"] + (target["height"] - height) / 2 + tune["dy"])

        resized = source.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(OUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(resized, (x, y))
        debug.alpha_composite(resized, (x, y))
        ImageDraw.Draw(debug).rectangle((x, y, x + width, y + height), outline=(235, 72, 54, 255), width=2)

        placements[name] = {"x": x, "y": y, "width": width, "height": height}
        rendered[name] = resized
        print(name, placements[name])

    (OUT_DIR / "placement.json").write_text(json.dumps(placements, indent=2), encoding="utf-8")
    preview.save(OUT_DIR / "placement-preview.png", optimize=True)
    debug.save(OUT_DIR / "placement-debug.png", optimize=True)

    cells = []
    for name in TARGET_BOXES:
        image = rendered[name]
        cell = checker((image.width + 24, image.height + 24))
        cell.alpha_composite(image, (12, 12))
        cells.append(cell)
    columns = 3
    gap = 18
    cell_w = max(cell.width for cell in cells)
    cell_h = max(cell.height for cell in cells)
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, cell in enumerate(cells):
        sheet.alpha_composite(cell, (gap + (index % columns) * (cell_w + gap), gap + (index // columns) * (cell_h + gap)))
    sheet.save(OUT_DIR / "cutout-sheet.png", optimize=True)

    crop_dir = OUT_DIR / "house-checks"
    crop_dir.mkdir(exist_ok=True)
    for name, window in CROP_WINDOWS.items():
        crop = preview.crop(window)
        crop.save(crop_dir / f"{name}.png", optimize=True)


if __name__ == "__main__":
    build()
