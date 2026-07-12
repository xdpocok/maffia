from pathlib import Path
import json

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE_DIR = MAP_DIR / "purchasable-houses-v3"
CLEAN_MAP = MAP_DIR / "map-background-clean-roadfix.png"
OUT_DIR = MAP_DIR / "purchasable-houses-v3-green-fit-trial-v21"

TARGET_BOXES = {
    "market-row": {"x": 803, "y": 214, "width": 281, "height": 206},
    "west-mid-block": {"x": 265, "y": 300, "width": 261, "height": 220},
    "east-office": {"x": 944, "y": 338, "width": 275, "height": 228},
    "central-bank": {"x": 694, "y": 490, "width": 257, "height": 253},
    "southwest-tenement": {"x": 236, "y": 702, "width": 300, "height": 273},
    "courthouse": {"x": 959, "y": 588, "width": 282, "height": 262},
}

# Keep the v3 shape, only scale it inward so its own green edge does not pass
# beyond the map lot's green boundary. These are trial variants only.
VARIANTS = {
    "inside-98": 0.98,
    "inside-95": 0.95,
    "inside-92": 0.92,
}


def checker(size, cell=16):
    image = Image.new("RGBA", size, (36, 32, 27, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if ((x // cell) + (y // cell)) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(66, 58, 48, 255))
    return image


def save_sheet(images, out_path):
    columns = 3
    gap = 18
    cell_w = max(image.width for image in images) + 24
    cell_h = max(image.height for image in images) + 24
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, image in enumerate(images):
        cell = checker((cell_w, cell_h))
        cell.alpha_composite(image, ((cell_w - image.width) // 2, (cell_h - image.height) // 2))
        x = gap + (index % columns) * (cell_w + gap)
        y = gap + (index // columns) * (cell_h + gap)
        sheet.alpha_composite(cell, (x, y))
    sheet.save(out_path, optimize=True)


def proportional_size(source, target, inset_scale):
    sx = target["width"] / source.width
    sy = target["height"] / source.height
    scale = ((sx + sy) / 2) * inset_scale
    return round(source.width * scale), round(source.height * scale)


def build_variant(name, inset_scale):
    variant_dir = OUT_DIR / name
    variant_dir.mkdir(parents=True, exist_ok=True)
    preview = Image.open(CLEAN_MAP).convert("RGBA")
    placements = {}
    sheet_images = []

    for house_name, target in TARGET_BOXES.items():
        source = Image.open(SOURCE_DIR / f"{house_name}.png").convert("RGBA")
        width, height = proportional_size(source, target, inset_scale)
        x = round(target["x"] + (target["width"] - width) / 2)
        y = round(target["y"] + (target["height"] - height) / 2)

        resized = source.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(variant_dir / f"{house_name}.png", optimize=True)
        preview.alpha_composite(resized, (x, y))
        placements[house_name] = {"x": x, "y": y, "width": width, "height": height}
        sheet_images.append(resized)
        print(name, house_name, placements[house_name])

    (variant_dir / "placement.json").write_text(json.dumps(placements, indent=2), encoding="utf-8")
    preview.save(variant_dir / "placement-preview.png", optimize=True)
    save_sheet(sheet_images, variant_dir / "cutout-sheet.png")


def main():
    for name, inset_scale in VARIANTS.items():
        build_variant(name, inset_scale)


if __name__ == "__main__":
    main()
