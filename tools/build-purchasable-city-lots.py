from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
CURRENT_MAP = MAP_DIR / "map-background-clean.png"
ORIGINAL_MAP = MAP_DIR / "map-background-buildings-original.png"
INPAINT_SOURCE = MAP_DIR / "map-empty-lots-inpaint-source.png"
HOUSE_DIR = MAP_DIR / "purchasable-houses-v2"

TARGET_PLOTS = {
    "market-row": [(806, 286), (950, 217), (1080, 278), (1052, 373), (924, 416), (832, 357)],
    "west-mid-block": [(268, 378), (395, 303), (522, 370), (500, 474), (376, 516), (288, 453)],
    "east-office": [(947, 426), (1080, 341), (1215, 410), (1190, 517), (1062, 562), (978, 492)],
    "central-bank": [(697, 578), (815, 493), (947, 561), (925, 700), (800, 739), (724, 672)],
    "southwest-tenement": [(239, 820), (388, 705), (532, 778), (510, 930), (358, 971), (266, 899)],
    "courthouse": [(962, 683), (1091, 591), (1237, 666), (1210, 805), (1081, 846), (990, 776)],
}

TARGET_BUILDINGS = {
    "market-row": [(837, 281), (861, 253), (875, 253), (876, 237), (915, 229), (930, 240), (967, 247), (984, 266), (984, 321), (965, 341), (921, 357), (878, 345), (845, 326)],
    "west-mid-block": [(299, 361), (328, 333), (343, 334), (344, 314), (386, 319), (398, 332), (430, 338), (443, 357), (443, 420), (421, 442), (369, 453), (331, 438), (303, 419)],
    "east-office": [(982, 405), (1011, 375), (1027, 376), (1028, 357), (1072, 363), (1084, 375), (1124, 383), (1142, 403), (1143, 463), (1122, 485), (1074, 500), (1030, 487), (991, 468)],
    "central-bank": [(680, 574), (711, 536), (729, 535), (730, 512), (785, 493), (813, 501), (817, 518), (855, 529), (878, 554), (886, 629), (866, 658), (813, 681), (760, 669), (716, 642), (690, 614)],
    "southwest-tenement": [(302, 742), (329, 713), (344, 714), (345, 696), (388, 686), (403, 697), (439, 704), (456, 724), (459, 811), (438, 833), (392, 850), (349, 838), (311, 817)],
    "courthouse": [(997, 665), (1026, 632), (1043, 633), (1044, 615), (1086, 606), (1102, 617), (1138, 624), (1156, 644), (1158, 709), (1137, 731), (1091, 748), (1048, 736), (1008, 716)],
}

EXTRA_VISIBLE_PADDING = {
    "east-office": (24, 20, 42, 34),
    "southwest-tenement": (34, 24, 46, 40),
}


def build_house_cutout(original, empty_map, lot_id, plot_polygon, building_polygon):
    padding = 10
    xs = [point[0] for point in building_polygon]
    ys = [point[1] for point in building_polygon]
    left = max(0, min(xs) - padding)
    top = max(0, min(ys) - padding)
    right = min(original.width, max(xs) + padding)
    bottom = min(original.height, max(ys) + padding)

    cutout = original.crop((left, top, right, bottom))
    empty_crop = empty_map.crop((left, top, right, bottom))
    difference = ImageChops.difference(cutout.convert("RGB"), empty_crop.convert("RGB"))
    red, green, blue = difference.split()
    difference_mask = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    difference_mask = difference_mask.point(lambda value: 255 if value >= 14 else 0)

    building_mask = Image.new("L", cutout.size, 0)
    local_building = [(x - left, y - top) for x, y in building_polygon]
    ImageDraw.Draw(building_mask).polygon(local_building, fill=255)
    expanded_building_mask = building_mask.filter(ImageFilter.MaxFilter(9))

    plot_mask = Image.new("L", cutout.size, 0)
    local_plot = [(x - left, y - top) for x, y in plot_polygon]
    ImageDraw.Draw(plot_mask).polygon(local_plot, fill=255)

    grabcut_mask = np.full((cutout.height, cutout.width), cv2.GC_BGD, dtype=np.uint8)
    expanded_pixels = np.asarray(expanded_building_mask)
    building_pixels = np.asarray(building_mask)
    difference_pixels = np.asarray(difference_mask)
    plot_pixels = np.asarray(plot_mask)
    grabcut_mask[(expanded_pixels > 0) & (plot_pixels > 0)] = cv2.GC_PR_BGD
    grabcut_mask[(building_pixels > 0) & (difference_pixels > 0)] = cv2.GC_PR_FGD

    strong_difference = difference_pixels >= 128
    eroded_building = cv2.erode((building_pixels > 0).astype(np.uint8), np.ones((7, 7), np.uint8))
    grabcut_mask[(eroded_building > 0) & strong_difference] = cv2.GC_FGD

    rgb = cv2.cvtColor(np.asarray(cutout.convert("RGB")), cv2.COLOR_RGB2BGR)
    background_model = np.zeros((1, 65), np.float64)
    foreground_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(
        rgb,
        grabcut_mask,
        None,
        background_model,
        foreground_model,
        6,
        cv2.GC_INIT_WITH_MASK,
    )
    alpha_pixels = np.where(
        (grabcut_mask == cv2.GC_FGD) | (grabcut_mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype(np.uint8)
    alpha = Image.fromarray(alpha_pixels, mode="L").filter(ImageFilter.GaussianBlur(0.65))
    cutout.putalpha(alpha)
    visible_box = alpha.getbbox()
    if visible_box:
        extra_left, extra_top, extra_right, extra_bottom = EXTRA_VISIBLE_PADDING.get(lot_id, (3, 3, 3, 3))
        visible_box = (
            max(0, visible_box[0] - extra_left),
            max(0, visible_box[1] - extra_top),
            min(cutout.width, visible_box[2] + extra_right),
            min(cutout.height, visible_box[3] + extra_bottom),
        )
        cutout = cutout.crop(visible_box)
        left += visible_box[0]
        top += visible_box[1]
    cutout.save(HOUSE_DIR / f"{lot_id}.png", optimize=True)
    return left, top, cutout.width, cutout.height


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
        box = build_house_cutout(original, result, lot_id, polygon, TARGET_BUILDINGS[lot_id])
        print(f"{lot_id}: {box}")

    result.save(CURRENT_MAP, optimize=True)
    print(f"Built {CURRENT_MAP} from {ORIGINAL_MAP.name} and {INPAINT_SOURCE.name}")


if __name__ == "__main__":
    main()
