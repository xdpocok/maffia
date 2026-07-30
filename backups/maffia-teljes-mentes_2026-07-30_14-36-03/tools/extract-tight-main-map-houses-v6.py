from pathlib import Path
import json

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
OUTPUT_DIR = MAP_DIR / "purchasable-houses-v6"
PREVIEW = OUTPUT_DIR / "placement-preview.png"

PLOTS = {
    "market-row": [(806, 286), (950, 217), (1080, 278), (1052, 373), (924, 416), (832, 357)],
    "west-mid-block": [(268, 378), (395, 303), (522, 370), (500, 474), (376, 516), (288, 453)],
    "east-office": [(947, 426), (1080, 341), (1215, 410), (1190, 517), (1062, 562), (978, 492)],
    "central-bank": [(697, 578), (815, 493), (947, 561), (925, 700), (800, 739), (724, 672)],
    "southwest-tenement": [(239, 820), (388, 705), (532, 778), (510, 930), (358, 971), (266, 899)],
    "courthouse": [(962, 683), (1091, 591), (1237, 666), (1210, 805), (1081, 846), (990, 776)],
}

BUILDINGS = {
    "market-row": [(837, 281), (861, 253), (875, 253), (876, 237), (915, 229), (930, 240), (967, 247), (984, 266), (984, 321), (965, 341), (921, 357), (878, 345), (845, 326)],
    "west-mid-block": [(299, 361), (328, 333), (343, 334), (344, 314), (386, 319), (398, 332), (430, 338), (443, 357), (443, 420), (421, 442), (369, 453), (331, 438), (303, 419)],
    "east-office": [(982, 405), (1011, 375), (1027, 376), (1028, 357), (1072, 363), (1084, 375), (1124, 383), (1142, 403), (1143, 463), (1122, 485), (1074, 500), (1030, 487), (991, 468)],
    "central-bank": [(680, 574), (711, 536), (729, 535), (730, 512), (785, 493), (813, 501), (817, 518), (855, 529), (878, 554), (886, 629), (866, 658), (813, 681), (760, 669), (716, 642), (690, 614)],
    "southwest-tenement": [(302, 742), (329, 713), (344, 714), (345, 696), (388, 686), (403, 697), (439, 704), (456, 724), (459, 811), (438, 833), (392, 850), (349, 838), (311, 817)],
    "courthouse": [(997, 665), (1026, 632), (1043, 633), (1044, 615), (1086, 606), (1102, 617), (1138, 624), (1156, 644), (1158, 709), (1137, 731), (1091, 748), (1048, 736), (1008, 716)],
}

EXTRA = {
    "market-row": (18, 18, 28, 20),
    "west-mid-block": (18, 18, 28, 20),
    "east-office": (18, 20, 38, 28),
    "central-bank": (26, 22, 34, 28),
    "southwest-tenement": (20, 24, 34, 26),
    "courthouse": (24, 22, 40, 30),
}


def local(points, left, top):
    return [(x - left, y - top) for x, y in points]


def polygon_mask(size, points):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask


def tighten_alpha(alpha):
    alpha = alpha.filter(ImageFilter.MaxFilter(5))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    return alpha.point(lambda value: 255 if value > 30 else 0).filter(ImageFilter.GaussianBlur(0.45))


def extract(name, source, clean):
    building = BUILDINGS[name]
    plot = PLOTS[name]
    extra_left, extra_top, extra_right, extra_bottom = EXTRA[name]
    xs = [x for x, _ in building]
    ys = [y for _, y in building]
    left = max(0, min(xs) - extra_left)
    top = max(0, min(ys) - extra_top)
    right = min(source.width, max(xs) + extra_right)
    bottom = min(source.height, max(ys) + extra_bottom)

    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    clean_crop = clean.crop((left, top, right, bottom)).convert("RGBA")

    diff = ImageChops.difference(crop.convert("RGB"), clean_crop.convert("RGB"))
    diff_mask = ImageChops.lighter(ImageChops.lighter(*diff.split()[:2]), diff.split()[2])
    diff_mask = diff_mask.point(lambda value: 255 if value >= 18 else 0)

    building_mask = polygon_mask(crop.size, local(building, left, top)).filter(ImageFilter.MaxFilter(15))
    plot_mask = polygon_mask(crop.size, local(plot, left, top)).filter(ImageFilter.MaxFilter(7))

    alpha = ImageChops.multiply(diff_mask.filter(ImageFilter.MaxFilter(7)), plot_mask)
    alpha = ImageChops.lighter(alpha, polygon_mask(crop.size, local(building, left, top)).filter(ImageFilter.MaxFilter(5)))
    alpha = ImageChops.multiply(alpha, building_mask)
    alpha = tighten_alpha(alpha)

    box = alpha.getbbox()
    if box:
        pad = 3
        box = (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(crop.width, box[2] + pad),
            min(crop.height, box[3] + pad),
        )
        crop = crop.crop(box)
        alpha = alpha.crop(box)
        left += box[0]
        top += box[1]

    crop.putalpha(alpha)
    return crop, left, top


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not CLEAN.exists():
        raise FileNotFoundError(CLEAN)

    source = Image.open(SOURCE).convert("RGBA")
    clean = Image.open(CLEAN).convert("RGBA")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    preview = clean.copy()
    placement = {}

    for name in BUILDINGS:
        cutout, x, y = extract(name, source, clean)
        cutout.save(OUTPUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (x, y))
        placement[name] = {"x": x, "y": y, "width": cutout.width, "height": cutout.height}
        print(f"{name}: {x}, {y}, {cutout.width}, {cutout.height}")

    (OUTPUT_DIR / "placement.json").write_text(json.dumps(placement, indent=2), encoding="utf-8")
    preview.save(PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
