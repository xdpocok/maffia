from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
OUT_DIR = MAP_DIR / "purchasable-houses-cutouts-v19"

# Dense point-to-point traces. These are intentionally lot-border shaped:
# they keep the full building, yard, green curb line and vegetation, while
# avoiding the surrounding asphalt as much as the source art allows.
CONTOURS = {
    "market-row": [
        (832, 286), (840, 278), (849, 270), (858, 262), (868, 255),
        (876, 248), (876, 238), (887, 235), (900, 232), (915, 230),
        (928, 238), (941, 244), (956, 247), (970, 252), (981, 264),
        (987, 277), (1001, 282), (1018, 288), (1035, 296), (1049, 306),
        (1055, 321), (1050, 335), (1037, 347), (1019, 356), (997, 363),
        (974, 371), (951, 382), (928, 393), (908, 387), (888, 377),
        (868, 365), (849, 353), (836, 342), (828, 326), (825, 310),
        (826, 298),
    ],
    "west-mid-block": [
        (292, 379), (302, 367), (315, 356), (327, 347), (337, 337),
        (337, 324), (350, 320), (367, 318), (386, 319), (399, 330),
        (417, 335), (432, 342), (443, 356), (446, 373), (462, 378),
        (480, 385), (494, 397), (501, 412), (497, 428), (489, 444),
        (474, 457), (452, 466), (427, 476), (401, 485), (377, 494),
        (355, 484), (333, 470), (314, 456), (298, 441), (289, 423),
        (286, 403),
    ],
    "east-office": [
        (966, 425), (979, 412), (993, 400), (1008, 390), (1009, 377),
        (1023, 371), (1024, 359), (1043, 358), (1073, 363), (1087, 375),
        (1106, 380), (1125, 386), (1141, 402), (1146, 419), (1163, 425),
        (1182, 434), (1193, 449), (1191, 467), (1183, 484), (1168, 497),
        (1146, 507), (1120, 517), (1092, 527), (1064, 537), (1041, 524),
        (1020, 507), (1000, 493), (982, 481), (970, 463), (963, 444),
    ],
    "central-bank": [
        (676, 574), (688, 560), (703, 546), (718, 536), (730, 536),
        (731, 520), (746, 512), (764, 504), (786, 493), (804, 498),
        (814, 504), (818, 518), (837, 524), (856, 531), (873, 548),
        (887, 563), (905, 568), (920, 579), (930, 597), (928, 620),
        (922, 645), (912, 674), (899, 690), (878, 700), (852, 708),
        (827, 715), (802, 720), (777, 706), (752, 686), (728, 666),
        (707, 647), (690, 625), (678, 601),
    ],
    "southwest-tenement": [
        (264, 822), (279, 806), (293, 795), (307, 787), (304, 762),
        (304, 743), (316, 731), (329, 717), (345, 717), (346, 700),
        (365, 694), (389, 688), (404, 698), (424, 702), (441, 708),
        (456, 725), (460, 749), (477, 760), (499, 776), (511, 798),
        (506, 824), (499, 849), (489, 875), (471, 887), (448, 896),
        (421, 904), (391, 912), (361, 918), (338, 899), (316, 884),
        (294, 869), (275, 851), (262, 836),
    ],
    "courthouse": [
        (977, 684), (989, 671), (1002, 658), (1016, 646), (1027, 635),
        (1043, 635), (1044, 618), (1062, 613), (1088, 608), (1103, 618),
        (1123, 622), (1140, 628), (1155, 645), (1159, 666), (1178, 672),
        (1200, 681), (1214, 696), (1210, 717), (1201, 742), (1189, 772),
        (1176, 790), (1154, 799), (1129, 806), (1105, 813), (1082, 818),
        (1060, 802), (1039, 786), (1019, 770), (1001, 756), (986, 736),
        (975, 714),
    ],
}


def bbox_for(contour, padding=6):
    xs = [x for x, _ in contour]
    ys = [y for _, y in contour]
    return min(xs) - padding, min(ys) - padding, max(xs) + padding + 1, max(ys) + padding + 1


def mask_for(size, contour, offset):
    scale = 5
    big = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    points = [((x - offset[0]) * scale, (y - offset[1]) * scale) for x, y in contour]
    ImageDraw.Draw(big).polygon(points, fill=255)
    big = big.filter(ImageFilter.GaussianBlur(0.3))
    return big.resize(size, Image.Resampling.LANCZOS)


def checker(size, cell=16):
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

    placements = {}
    cells = []
    for name, contour in CONTOURS.items():
        left, top, right, bottom = bbox_for(contour)
        crop = source.crop((left, top, right, bottom)).convert("RGBA")
        crop.putalpha(mask_for(crop.size, contour, (left, top)))
        crop.save(OUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(crop, (left, top))
        placements[name] = {"x": left, "y": top, "width": crop.width, "height": crop.height}

        draw = ImageDraw.Draw(debug)
        draw.line(contour + [contour[0]], fill=(255, 70, 55, 255), width=3)
        for x, y in contour:
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(255, 215, 80, 255))
        debug.alpha_composite(crop, (left, top))

        cell = checker((crop.width + 24, crop.height + 24))
        cell.alpha_composite(crop, (12, 12))
        cells.append(cell)
        print(name, placements[name])

    (OUT_DIR / "placement.json").write_text(json.dumps(placements, indent=2), encoding="utf-8")
    preview.save(OUT_DIR / "placement-preview.png", optimize=True)
    debug.save(OUT_DIR / "placement-debug.png", optimize=True)

    columns = 3
    gap = 18
    cell_w = max(cell.width for cell in cells)
    cell_h = max(cell.height for cell in cells)
    sheet = Image.new("RGBA", (columns * cell_w + (columns + 1) * gap, 2 * cell_h + 3 * gap), (18, 15, 13, 255))
    for index, cell in enumerate(cells):
        sheet.alpha_composite(cell, (gap + (index % columns) * (cell_w + gap), gap + (index // columns) * (cell_h + gap)))
    sheet.save(OUT_DIR / "cutout-sheet.png", optimize=True)


if __name__ == "__main__":
    main()
