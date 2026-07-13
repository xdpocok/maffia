from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
OUTPUT_DIR = MAP_DIR / "purchasable-houses-v7"
PREVIEW = OUTPUT_DIR / "placement-preview.png"
DEBUG_PREVIEW = OUTPUT_DIR / "placement-debug.png"

# Inner lot borders: these follow the green in-map lot outline more tightly than
# the clickable polygons. The goal is to keep the building, courtyard, vegetation
# and lot outline, while leaving the surrounding roads on the clean base map.
LOTS = {
    "market-row": [(842, 278), (948, 226), (1041, 276), (1017, 361), (923, 397), (848, 352)],
    "west-mid-block": [(291, 372), (394, 317), (494, 369), (476, 452), (376, 492), (306, 438)],
    "east-office": [(974, 415), (1080, 354), (1183, 408), (1157, 492), (1063, 528), (1008, 472)],
    "central-bank": [(708, 575), (815, 506), (925, 564), (904, 681), (800, 716), (731, 660)],
    "southwest-tenement": [(270, 815), (388, 720), (509, 783), (489, 913), (358, 950), (285, 887)],
    "courthouse": [(978, 681), (1092, 600), (1215, 667), (1190, 788), (1080, 825), (1000, 758)],
}


def make_mask(size, polygon, offset):
    scale = 4
    mask = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    shifted = [((x - offset[0]) * scale, (y - offset[1]) * scale) for x, y in polygon]
    ImageDraw.Draw(mask).polygon(shifted, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))
    return mask.resize(size, Image.Resampling.LANCZOS)


def extract_lot(source, polygon):
    padding = 3
    xs = [x for x, _ in polygon]
    ys = [y for _, y in polygon]
    left = max(0, min(xs) - padding)
    top = max(0, min(ys) - padding)
    right = min(source.width, max(xs) + padding + 1)
    bottom = min(source.height, max(ys) + padding + 1)
    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    alpha = make_mask(crop.size, polygon, (left, top))
    crop.putalpha(alpha)
    return crop, (left, top)


def draw_debug_polygon(image, polygon, color):
    draw = ImageDraw.Draw(image)
    draw.line(polygon + [polygon[0]], fill=color, width=4)


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not CLEAN.exists():
        raise FileNotFoundError(CLEAN)

    source = Image.open(SOURCE).convert("RGBA")
    clean = Image.open(CLEAN).convert("RGBA")
    preview = clean.copy()
    debug = clean.copy()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    placement = {}

    for name, polygon in LOTS.items():
        cutout, (x, y) = extract_lot(source, polygon)
        cutout.save(OUTPUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (x, y))
        debug.alpha_composite(cutout, (x, y))
        draw_debug_polygon(debug, polygon, (255, 60, 60, 255))
        placement[name] = {"x": x, "y": y, "width": cutout.width, "height": cutout.height}
        print(f"{name}: {x}, {y}, {cutout.width}, {cutout.height}")

    (OUTPUT_DIR / "placement.json").write_text(json.dumps(placement, indent=2), encoding="utf-8")
    preview.save(PREVIEW, optimize=True)
    debug.save(DEBUG_PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
