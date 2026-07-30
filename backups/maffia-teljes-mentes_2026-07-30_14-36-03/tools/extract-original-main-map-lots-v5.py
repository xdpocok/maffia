from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
PREVIEW_BASE = MAP_DIR / "map-background-clean-roadfix.png"
OUTPUT_DIR = MAP_DIR / "purchasable-houses-v5"
PREVIEW = OUTPUT_DIR / "placement-preview.png"

# Outer lot borders from game.js. The full plot surface, fence/outline, garden,
# and original building stay together so the cutout keeps the map perspective.
LOTS = {
    "market-row": [(806, 286), (950, 217), (1080, 278), (1052, 373), (924, 416), (832, 357)],
    "west-mid-block": [(268, 378), (395, 303), (522, 370), (500, 474), (376, 516), (288, 453)],
    "east-office": [(942, 423), (1080, 337), (1226, 404), (1203, 528), (1062, 568), (970, 496)],
    "central-bank": [(697, 578), (815, 493), (947, 561), (925, 700), (800, 739), (724, 672)],
    "southwest-tenement": [(239, 820), (388, 705), (532, 778), (510, 930), (358, 971), (266, 899)],
    "courthouse": [(962, 683), (1091, 591), (1237, 666), (1210, 805), (1081, 846), (990, 776)],
}


def make_antialiased_mask(size, polygon, offset):
    scale = 4
    mask = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    scaled_polygon = [
        ((x - offset[0]) * scale, (y - offset[1]) * scale)
        for x, y in polygon
    ]
    ImageDraw.Draw(mask).polygon(scaled_polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))
    return mask.resize(size, Image.Resampling.LANCZOS)


def extract_lot(source, polygon):
    padding = 2
    xs = [point[0] for point in polygon]
    ys = [point[1] for point in polygon]
    left = max(0, min(xs) - padding)
    top = max(0, min(ys) - padding)
    right = min(source.width, max(xs) + padding + 1)
    bottom = min(source.height, max(ys) + padding + 1)

    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    alpha = make_antialiased_mask(crop.size, polygon, (left, top))
    crop.putalpha(alpha)
    return crop, (left, top)


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not PREVIEW_BASE.exists():
        raise FileNotFoundError(PREVIEW_BASE)

    source = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(PREVIEW_BASE).convert("RGBA")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    metadata = {}

    for name, polygon in LOTS.items():
        cutout, (left, top) = extract_lot(source, polygon)
        output = OUTPUT_DIR / f"{name}.png"
        cutout.save(output, optimize=True)
        metadata[name] = {
            "x": left,
            "y": top,
            "width": cutout.width,
            "height": cutout.height,
        }
        preview.alpha_composite(cutout, (left, top))
        print(f"{name}: {left}, {top}, {cutout.width}, {cutout.height}")

    (OUTPUT_DIR / "placement.json").write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )
    preview.save(PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
