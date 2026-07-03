from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "map-background-roadfill-preview.png"
EMPTY_MAP = ROOT / "assets" / "map" / "map-background-clean.png"
OUTPUT_DIR = ROOT / "assets" / "map" / "purchasable-houses-v4"
PREVIEW = OUTPUT_DIR / "placement-preview.png"

# Exact outer lot borders from the city map. The full garden, fence, building
# and original number marker remain inside the cutout.
LOTS = {
    "market-row": [(806, 286), (950, 217), (1080, 278), (1052, 373), (924, 416), (832, 357)],
    "west-mid-block": [(268, 378), (395, 303), (522, 370), (500, 474), (376, 516), (288, 453)],
    "east-office": [(947, 426), (1080, 341), (1215, 410), (1190, 517), (1062, 562), (978, 492)],
    "central-bank": [(697, 578), (815, 493), (947, 561), (925, 700), (800, 739), (724, 672)],
    "southwest-tenement": [(239, 820), (388, 705), (532, 778), (510, 930), (358, 971), (266, 899)],
    "courthouse": [(962, 683), (1091, 591), (1237, 666), (1210, 805), (1081, 846), (990, 776)],
}


def extract_lot(source, polygon):
    padding = 3
    xs = [point[0] for point in polygon]
    ys = [point[1] for point in polygon]
    left = max(0, min(xs) - padding)
    top = max(0, min(ys) - padding)
    right = min(source.width, max(xs) + padding + 1)
    bottom = min(source.height, max(ys) + padding + 1)

    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    local_polygon = [(x - left, y - top) for x, y in polygon]
    alpha = Image.new("L", crop.size, 0)
    ImageDraw.Draw(alpha).polygon(local_polygon, fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.45))
    crop.putalpha(alpha)
    return crop, (left, top)


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    source = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(EMPTY_MAP).convert("RGBA") if EMPTY_MAP.exists() else source.copy()
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
        print(f"{name}: ({left}, {top}, {cutout.width}, {cutout.height})")

    (OUTPUT_DIR / "placement.json").write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )
    preview.save(PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
