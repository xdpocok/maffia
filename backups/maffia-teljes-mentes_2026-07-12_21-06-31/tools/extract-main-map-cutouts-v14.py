from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
OUT_DIR = MAP_DIR / "purchasable-houses-cutouts-v14"


BUILDINGS = {
    "market-row": [(837, 281), (861, 253), (875, 253), (876, 237), (915, 229), (930, 240), (967, 247), (984, 266), (984, 321), (965, 341), (921, 357), (878, 345), (845, 326)],
    "west-mid-block": [(299, 361), (328, 333), (343, 334), (344, 314), (386, 319), (398, 332), (430, 338), (443, 357), (443, 420), (421, 442), (369, 453), (331, 438), (303, 419)],
    "east-office": [(982, 405), (1011, 375), (1027, 376), (1028, 357), (1072, 363), (1084, 375), (1124, 383), (1142, 403), (1143, 463), (1122, 485), (1074, 500), (1030, 487), (991, 468)],
    "central-bank": [(680, 574), (711, 536), (729, 535), (730, 512), (785, 493), (813, 501), (817, 518), (855, 529), (878, 554), (886, 629), (866, 658), (813, 681), (760, 669), (716, 642), (690, 614)],
    "southwest-tenement": [(302, 742), (329, 713), (344, 714), (345, 696), (388, 686), (403, 697), (439, 704), (456, 724), (459, 811), (438, 833), (392, 850), (349, 838), (311, 817)],
    "courthouse": [(997, 665), (1026, 632), (1043, 633), (1044, 615), (1086, 606), (1102, 617), (1138, 624), (1156, 644), (1158, 709), (1137, 731), (1091, 748), (1048, 736), (1008, 716)],
}

# Hand-traced inner estate surfaces. These follow the visible green lot border
# and keep yard/vegetation while excluding surrounding roads.
LOTS = {
    "market-row": [(838, 287), (858, 268), (949, 226), (1056, 279), (1030, 357), (924, 395), (844, 350)],
    "west-mid-block": [(294, 379), (316, 354), (395, 314), (499, 370), (480, 450), (376, 492), (298, 438)],
    "east-office": [(968, 425), (995, 398), (1080, 354), (1187, 410), (1165, 496), (1062, 536), (990, 484)],
    "central-bank": [(708, 580), (730, 554), (815, 506), (925, 562), (904, 682), (800, 716), (732, 660)],
    "southwest-tenement": [(266, 822), (294, 794), (388, 720), (506, 782), (486, 908), (358, 948), (282, 886)],
    "courthouse": [(978, 684), (1002, 656), (1092, 604), (1210, 668), (1188, 785), (1081, 824), (1000, 760)],
}

EXTRA_KEEP = {
    # These keep small roof/chimney/fence details that rise outside the estate
    # surface without letting road surfaces into the alpha.
    "market-row": [[(873, 238), (916, 222), (968, 246), (984, 268), (962, 289), (898, 284), (842, 283), (838, 266)]],
    "west-mid-block": [[(337, 315), (386, 312), (432, 339), (446, 359), (422, 380), (357, 376), (300, 364), (309, 342)]],
    "east-office": [[(1023, 358), (1074, 356), (1132, 386), (1145, 414), (1122, 437), (1054, 430), (984, 410), (1002, 378)]],
    "central-bank": [[(730, 512), (786, 490), (852, 528), (883, 560), (871, 624), (813, 682), (720, 642), (680, 575)]],
    "southwest-tenement": [[(346, 696), (404, 690), (456, 724), (462, 813), (438, 835), (349, 842), (304, 817), (306, 742)]],
    "courthouse": [[(1042, 615), (1090, 606), (1154, 644), (1160, 709), (1136, 732), (1048, 740), (1000, 714), (1026, 632)]],
}

ERASE_ROADS = {
    "market-row": [[(826, 348), (924, 398), (1080, 360), (1080, 420), (826, 420)], [(1028, 270), (1080, 270), (1080, 420), (1018, 354)]],
    "west-mid-block": [[(280, 438), (376, 500), (525, 462), (525, 520), (280, 520)], [(280, 382), (306, 438), (280, 470)]],
    "east-office": [[(952, 484), (1064, 546), (1213, 506), (1213, 562), (952, 562)], [(952, 420), (992, 486), (952, 530)]],
    "central-bank": [[(674, 656), (800, 723), (951, 688), (951, 740), (674, 740)], [(898, 558), (951, 558), (951, 740), (900, 682)]],
    "southwest-tenement": [[(244, 872), (358, 953), (527, 908), (527, 969), (244, 969)], [(244, 808), (284, 888), (244, 935)]],
    "courthouse": [[(960, 758), (1081, 832), (1233, 788), (1233, 850), (960, 850)], [(1182, 660), (1233, 660), (1233, 850), (1184, 786)]],
}


def draw_scaled_polygon(mask, polygon, offset, scale, fill=255):
    shifted = [((x - offset[0]) * scale, (y - offset[1]) * scale) for x, y in polygon]
    ImageDraw.Draw(mask).polygon(shifted, fill=fill)


def make_mask(size, polygons, offset):
    scale = 4
    big = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    for polygon in polygons:
        draw_scaled_polygon(big, polygon, offset, scale)
    big = big.filter(ImageFilter.GaussianBlur(0.45))
    return big.resize(size, Image.Resampling.LANCZOS)


def subtract_mask(alpha, polygons, offset):
    if not polygons:
        return alpha
    scale = 4
    big = Image.new("L", (alpha.width * scale, alpha.height * scale), 0)
    for polygon in polygons:
        draw_scaled_polygon(big, polygon, offset, scale)
    big = big.filter(ImageFilter.GaussianBlur(0.45))
    erase = big.resize(alpha.size, Image.Resampling.LANCZOS)
    keep = Image.eval(erase, lambda value: 255 - value)
    return Image.composite(Image.new("L", alpha.size, 0), alpha, erase)


def bbox_for(polygons, padding=6):
    points = [point for polygon in polygons for point in polygon]
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    return min(xs) - padding, min(ys) - padding, max(xs) + padding + 1, max(ys) + padding + 1


def crop_cutout(source, name):
    polygons = [LOTS[name], BUILDINGS[name], *EXTRA_KEEP.get(name, [])]
    left, top, right, bottom = bbox_for(polygons)
    left = max(0, left)
    top = max(0, top)
    right = min(source.width, right)
    bottom = min(source.height, bottom)
    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    alpha = make_mask(crop.size, polygons, (left, top))
    alpha = subtract_mask(alpha, ERASE_ROADS.get(name, []), (left, top))
    crop.putalpha(alpha)
    return crop, {"x": left, "y": top, "width": crop.width, "height": crop.height}


def make_checker(size, cell=16):
    a = (36, 32, 27, 255)
    b = (66, 58, 48, 255)
    image = Image.new("RGBA", size, a)
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if ((x // cell) + (y // cell)) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=b)
    return image


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not CLEAN.exists():
        raise FileNotFoundError(CLEAN)

    source = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(CLEAN).convert("RGBA")
    debug = Image.open(CLEAN).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {}
    sheet_cells = []
    for name in LOTS:
        cutout, placement = crop_cutout(source, name)
        cutout.save(OUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (placement["x"], placement["y"]))
        metadata[name] = placement

        # Debug red contour on top of the final preview.
        d = ImageDraw.Draw(debug)
        d.line(LOTS[name] + [LOTS[name][0]], fill=(255, 64, 64, 255), width=3)
        d.line(BUILDINGS[name] + [BUILDINGS[name][0]], fill=(255, 210, 64, 255), width=2)
        debug.alpha_composite(cutout, (placement["x"], placement["y"]))

        cell = make_checker((cutout.width + 24, cutout.height + 24))
        cell.alpha_composite(cutout, (12, 12))
        sheet_cells.append((name, cell))
        print(f"{name}: {placement}")

    (OUT_DIR / "placement.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    preview.save(OUT_DIR / "placement-preview.png", optimize=True)
    debug.save(OUT_DIR / "placement-debug.png", optimize=True)

    columns = 3
    gap = 18
    widths = [cell.width for _, cell in sheet_cells]
    heights = [cell.height for _, cell in sheet_cells]
    cell_w = max(widths)
    cell_h = max(heights)
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, (_, cell) in enumerate(sheet_cells):
        col = index % columns
        row = index // columns
        x = gap + col * (cell_w + gap)
        y = gap + row * (cell_h + gap)
        sheet.alpha_composite(cell, (x, y))
    sheet.save(OUT_DIR / "cutout-sheet.png", optimize=True)


if __name__ == "__main__":
    main()
