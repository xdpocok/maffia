from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
OUT_DIR = MAP_DIR / "purchasable-houses-cutouts-v15"

# Point-by-point hand traces from the original map. Each contour follows the
# visible lot edge and the building silhouette so surrounding roads stay out.
TRACE_CONTOURS = {
    "market-row": [
        (835, 285), (845, 275), (856, 266), (866, 258), (875, 249),
        (876, 239), (894, 234), (914, 230), (929, 239), (947, 246),
        (965, 250), (980, 264), (986, 279), (1003, 284), (1024, 292),
        (1044, 303), (1053, 318), (1046, 334), (1028, 346), (1005, 354),
        (981, 358), (961, 366), (938, 374), (916, 376), (896, 369),
        (875, 360), (856, 350), (841, 341), (831, 328), (827, 309),
        (828, 296),
    ],
    "west-mid-block": [
        (294, 379), (305, 367), (317, 356), (329, 347), (338, 338),
        (338, 324), (352, 320), (369, 318), (386, 319), (399, 330),
        (418, 336), (431, 341), (443, 356), (446, 373), (463, 378),
        (481, 385), (494, 398), (490, 416), (482, 438), (467, 450),
        (446, 459), (423, 468), (400, 477), (378, 486), (356, 475),
        (335, 462), (316, 449), (301, 437), (292, 419), (290, 400),
    ],
    "east-office": [
        (968, 424), (981, 411), (995, 399), (1009, 390), (1010, 377),
        (1024, 371), (1025, 360), (1044, 359), (1072, 364), (1086, 376),
        (1106, 381), (1124, 386), (1139, 402), (1144, 418), (1162, 424),
        (1182, 434), (1190, 449), (1182, 472), (1167, 492), (1144, 501),
        (1115, 504), (1089, 512), (1066, 515), (1044, 505), (1025, 493),
        (1006, 482), (990, 472), (976, 458), (968, 442),
    ],
    "central-bank": [
        (682, 573), (693, 560), (706, 547), (720, 537), (731, 537),
        (732, 521), (747, 513), (764, 505), (786, 494), (802, 498),
        (814, 504), (818, 518), (836, 524), (854, 530), (871, 547),
        (884, 563), (900, 567), (914, 579), (918, 596), (914, 619),
        (906, 642), (894, 670), (875, 680), (850, 686), (825, 692),
        (802, 694), (779, 688), (756, 674), (734, 658), (713, 641),
        (695, 622), (685, 599),
    ],
    "southwest-tenement": [
        (266, 820), (281, 804), (294, 794), (307, 786), (304, 762),
        (304, 743), (316, 731), (329, 717), (345, 717), (346, 700),
        (365, 694), (389, 688), (404, 698), (423, 702), (440, 707),
        (455, 725), (459, 749), (476, 759), (497, 775), (506, 796),
        (501, 818), (492, 848), (481, 888), (458, 897), (430, 902),
        (397, 908), (361, 895), (341, 889), (320, 884), (297, 877),
        (276, 867), (262, 847),
    ],
    "courthouse": [
        (980, 684), (991, 670), (1004, 658), (1017, 646), (1028, 635),
        (1043, 635), (1044, 618), (1062, 613), (1088, 608), (1103, 618),
        (1122, 622), (1139, 627), (1154, 645), (1158, 665), (1177, 671),
        (1198, 680), (1211, 696), (1207, 719), (1198, 747), (1185, 782),
        (1160, 790), (1133, 798), (1106, 806), (1082, 812), (1061, 799),
        (1040, 781), (1021, 766), (1005, 753), (990, 734), (979, 711),
    ],
}


def make_mask(size, contour, offset):
    scale = 4
    big = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    shifted = [((x - offset[0]) * scale, (y - offset[1]) * scale) for x, y in contour]
    ImageDraw.Draw(big).polygon(shifted, fill=255)
    big = big.filter(ImageFilter.GaussianBlur(0.35))
    return big.resize(size, Image.Resampling.LANCZOS)


def bbox_for(contour, padding=6):
    xs = [x for x, _ in contour]
    ys = [y for _, y in contour]
    return min(xs) - padding, min(ys) - padding, max(xs) + padding + 1, max(ys) + padding + 1


def crop_cutout(source, name):
    contour = TRACE_CONTOURS[name]
    left, top, right, bottom = bbox_for(contour)
    left = max(0, left)
    top = max(0, top)
    right = min(source.width, right)
    bottom = min(source.height, bottom)
    crop = source.crop((left, top, right, bottom)).convert("RGBA")
    crop.putalpha(make_mask(crop.size, contour, (left, top)))
    return crop, {"x": left, "y": top, "width": crop.width, "height": crop.height}


def make_checker(size, cell=16):
    image = Image.new("RGBA", size, (36, 32, 27, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if ((x // cell) + (y // cell)) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(66, 58, 48, 255))
    return image


def main():
    source = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(CLEAN).convert("RGBA")
    debug = Image.open(CLEAN).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {}
    sheet_cells = []
    for name, contour in TRACE_CONTOURS.items():
        cutout, placement = crop_cutout(source, name)
        cutout.save(OUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (placement["x"], placement["y"]))
        metadata[name] = placement

        draw = ImageDraw.Draw(debug)
        draw.line(contour + [contour[0]], fill=(255, 74, 58, 255), width=3)
        for x, y in contour:
            draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(255, 210, 64, 255))
        debug.alpha_composite(cutout, (placement["x"], placement["y"]))

        cell = make_checker((cutout.width + 24, cutout.height + 24))
        cell.alpha_composite(cutout, (12, 12))
        sheet_cells.append(cell)
        print(f"{name}: {placement}")

    (OUT_DIR / "placement.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    preview.save(OUT_DIR / "placement-preview.png", optimize=True)
    debug.save(OUT_DIR / "placement-debug.png", optimize=True)

    columns = 3
    gap = 18
    cell_w = max(cell.width for cell in sheet_cells)
    cell_h = max(cell.height for cell in sheet_cells)
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, cell in enumerate(sheet_cells):
        x = gap + (index % columns) * (cell_w + gap)
        y = gap + (index // columns) * (cell_h + gap)
        sheet.alpha_composite(cell, (x, y))
    sheet.save(OUT_DIR / "cutout-sheet.png", optimize=True)


if __name__ == "__main__":
    main()
