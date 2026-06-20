from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
CURRENT_MAP = MAP_DIR / "map-background-clean.png"
ORIGINAL_MAP = MAP_DIR / "map-background-buildings-original.png"
INPAINT_SOURCE = MAP_DIR / "map-empty-lots-inpaint-source.png"
HOUSE_DIR = MAP_DIR / "purchasable-houses"

TARGET_PLOTS = {
    "market-row": [(806, 286), (950, 217), (1080, 278), (1052, 373), (924, 416), (832, 357)],
    "west-mid-block": [(268, 378), (395, 303), (522, 370), (500, 474), (376, 516), (288, 453)],
    "east-office": [(947, 426), (1080, 341), (1215, 410), (1190, 517), (1062, 562), (978, 492)],
    "central-bank": [(697, 578), (815, 493), (947, 561), (925, 700), (800, 739), (724, 672)],
    "southwest-tenement": [(239, 820), (388, 705), (532, 778), (510, 930), (358, 971), (266, 899)],
    "courthouse": [(962, 683), (1091, 591), (1237, 666), (1210, 805), (1081, 846), (990, 776)],
}


def build_house_cutout(original, lot_id, polygon):
    padding = 12
    xs = [point[0] for point in polygon]
    ys = [point[1] for point in polygon]
    left = max(0, min(xs) - padding)
    top = max(0, min(ys) - padding)
    right = min(original.width, max(xs) + padding)
    bottom = min(original.height, max(ys) + padding)

    alpha = Image.new("L", (right - left, bottom - top), 0)
    local_polygon = [(x - left, y - top) for x, y in polygon]
    ImageDraw.Draw(alpha).polygon(local_polygon, fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(4))

    cutout = original.crop((left, top, right, bottom))
    cutout.putalpha(alpha)
    cutout.save(HOUSE_DIR / f"{lot_id}.png", optimize=True)
    return left, top, right - left, bottom - top


def main():
    if not ORIGINAL_MAP.exists():
        ORIGINAL_MAP.write_bytes(CURRENT_MAP.read_bytes())

    original = Image.open(ORIGINAL_MAP).convert("RGBA")
    source = Image.open(INPAINT_SOURCE).convert("RGBA").resize(original.size, Image.Resampling.LANCZOS)

    mask = Image.new("L", original.size, 0)
    draw = ImageDraw.Draw(mask)
    for polygon in TARGET_PLOTS.values():
        draw.polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5))

    result = Image.composite(source, original, mask)

    # The cleanup source reads the 13 marker as 03. Remove that marker from
    # the bitmap; the game draws a clean 13 marker until the lot is purchased.
    marker_box = (1065, 375, 1110, 437)
    pavement = result.crop((1112, 383, 1157, 445))
    marker_mask = Image.new("L", (45, 62), 255).filter(ImageFilter.GaussianBlur(5))
    result.paste(pavement, marker_box, marker_mask)

    HOUSE_DIR.mkdir(parents=True, exist_ok=True)
    for lot_id, polygon in TARGET_PLOTS.items():
        box = build_house_cutout(original, lot_id, polygon)
        print(f"{lot_id}: {box}")

    result.save(CURRENT_MAP, optimize=True)
    print(f"Built {CURRENT_MAP} from {ORIGINAL_MAP.name} and {INPAINT_SOURCE.name}")


if __name__ == "__main__":
    main()
