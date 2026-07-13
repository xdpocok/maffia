from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "02ce0e80-a622-473f-ae01-5bb6551fdd78.png"
OUT_ROOT = ROOT / "assets" / "items" / "adag2"
PREVIEW = ROOT / "assets" / "items" / "adag2-preview.png"


RARITIES = {
    "gray": {
        "outer": (236, 236, 236, 255),
        "inner": (178, 178, 178, 255),
        "glow": (255, 255, 255, 38),
    },
    "yellow": {
        "outer": (235, 191, 82, 255),
        "inner": (180, 132, 34, 255),
        "glow": (255, 214, 102, 42),
    },
    "red": {
        "outer": (226, 86, 78, 255),
        "inner": (170, 54, 48, 255),
        "glow": (255, 96, 88, 44),
    },
}


CANVAS_BY_CATEGORY = {
    "hats": (164, 186),
    "shirts": (164, 186),
    "pants": (164, 186),
    "shoes": (164, 186),
    "accessories": (164, 186),
    "watches": (164, 186),
    "weapons": (392, 255),
}


RADIUS_BY_CATEGORY = {
    "weapons": 18,
}


ITEMS = [
    ("hats", "newsboy-charcoal", (25, 110, 142, 245)),
    ("hats", "newsboy-tweed", (149, 110, 266, 245)),
    ("hats", "bowler-black", (273, 110, 390, 245)),
    ("hats", "fedora-ivory", (397, 110, 514, 245)),
    ("hats", "fedora-pinstripe", (521, 110, 638, 245)),
    ("hats", "fedora-burgundy", (645, 110, 762, 245)),
    ("weapons", "smg-drum", (858, 111, 968, 246)),
    ("weapons", "long-shotgun", (968, 111, 1078, 246)),
    ("weapons", "patrol-revolver", (1078, 111, 1188, 246)),
    ("weapons", "steel-pistol", (1188, 111, 1298, 246)),
    ("weapons", "sawn-off", (1298, 111, 1408, 246)),
    ("weapons", "stiletto-knife", (1408, 111, 1518, 246)),
    ("shirts", "shirt-black-suspenders", (26, 301, 142, 467)),
    ("shirts", "shirt-white", (149, 301, 265, 467)),
    ("shirts", "shirt-gray-stripe", (272, 301, 388, 467)),
    ("shirts", "shirt-cream-suspenders", (395, 301, 511, 467)),
    ("shirts", "shirt-burgundy", (518, 301, 634, 467)),
    ("shirts", "shirt-blue", (641, 301, 757, 467)),
    ("pants", "pants-charcoal", (858, 301, 968, 467)),
    ("pants", "pants-pinstripe", (968, 301, 1078, 467)),
    ("pants", "pants-brown", (1078, 301, 1188, 467)),
    ("pants", "pants-sand", (1188, 301, 1298, 467)),
    ("pants", "pants-wool-dark", (1298, 301, 1408, 467)),
    ("pants", "pants-wool-light", (1408, 301, 1518, 467)),
    ("shoes", "oxford-black", (26, 540, 142, 706)),
    ("shoes", "oxford-brown", (149, 540, 265, 706)),
    ("shoes", "spectator-black", (272, 540, 388, 706)),
    ("shoes", "spectator-brown", (395, 540, 511, 706)),
    ("shoes", "loafer-black", (518, 540, 634, 706)),
    ("shoes", "loafer-tan", (641, 540, 757, 706)),
    ("accessories", "tie-charcoal", (858, 540, 968, 706)),
    ("accessories", "tie-crimson", (968, 540, 1078, 706)),
    ("accessories", "tie-navy", (1078, 540, 1188, 706)),
    ("accessories", "pocket-square-white", (1188, 540, 1298, 706)),
    ("accessories", "tie-clip-gold", (1298, 540, 1408, 706)),
    ("accessories", "ring-onyx", (1408, 540, 1518, 706)),
    ("watches", "pocket-watch-ornate-gold", (25, 772, 171, 958)),
    ("watches", "pocket-watch-classic-silver", (172, 772, 318, 958)),
    ("watches", "pocket-watch-skeleton-gold", (319, 772, 465, 958)),
    ("watches", "pocket-watch-midnight-silver", (466, 772, 612, 958)),
    ("watches", "pocket-watch-engraved-silver", (613, 772, 759, 958)),
    ("watches", "pocket-watch-ivory-gold", (760, 772, 906, 958)),
]


def fit_into_canvas(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    canvas = Image.new("RGBA", size, (8, 6, 4, 0))
    inner_w = size[0] - 24
    inner_h = size[1] - 24
    scaled = image.copy()
    scaled.thumbnail((inner_w, inner_h), Image.Resampling.LANCZOS)
    offset_x = (size[0] - scaled.width) // 2
    offset_y = (size[1] - scaled.height) // 2
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (6, 6, size[0] - 7, size[1] - 7),
        radius=20,
        fill=(7, 5, 4, 228),
    )
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.alpha_composite(scaled, (offset_x, offset_y))
    vignette = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(vignette).rounded_rectangle(
        (10, 10, size[0] - 11, size[1] - 11),
        radius=18,
        outline=(255, 216, 148, 22),
        width=2,
    )
    return Image.alpha_composite(canvas, vignette)


def add_rarity_frame(base: Image.Image, rarity: str, radius: int) -> Image.Image:
    colors = RARITIES[rarity]
    framed = base.copy()
    glow = Image.new("RGBA", framed.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle(
        (4, 4, framed.width - 5, framed.height - 5),
        radius=radius + 3,
        outline=colors["glow"],
        width=10,
    )
    framed = Image.alpha_composite(framed, glow)
    draw = ImageDraw.Draw(framed)
    draw.rounded_rectangle(
        (8, 8, framed.width - 9, framed.height - 9),
        radius=radius,
        outline=colors["outer"],
        width=4,
    )
    draw.rounded_rectangle(
        (17, 17, framed.width - 18, framed.height - 18),
        radius=max(8, radius - 5),
        outline=colors["inner"],
        width=2,
    )
    return framed


def prepare_crop(image: Image.Image, box: tuple[int, int, int, int], category: str) -> Image.Image:
    crop = image.crop(box).convert("RGBA")
    canvas_size = CANVAS_BY_CATEGORY[category]
    return fit_into_canvas(crop, canvas_size)


def build_preview(generated: list[Path]) -> None:
    thumbs = [Image.open(path).convert("RGBA") for path in generated[:18]]
    if not thumbs:
        return
    cols = 6
    rows = (len(thumbs) + cols - 1) // cols
    cell_w = max(img.width for img in thumbs)
    cell_h = max(img.height for img in thumbs)
    preview = Image.new("RGBA", (cols * cell_w + (cols - 1) * 12, rows * cell_h + (rows - 1) * 12), (11, 8, 6, 255))
    for index, thumb in enumerate(thumbs):
        col = index % cols
        row = index // cols
        x = col * (cell_w + 12)
        y = row * (cell_h + 12)
        preview.alpha_composite(thumb, (x, y))
    preview.save(PREVIEW)


def main() -> None:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGB")
    generated_paths: list[Path] = []

    for category, item_id, box in ITEMS:
        category_dir = OUT_ROOT / category
        category_dir.mkdir(parents=True, exist_ok=True)
        base = prepare_crop(image, box, category)
        radius = RADIUS_BY_CATEGORY.get(category, 16)
        for rarity in RARITIES:
            output = add_rarity_frame(base, rarity, radius)
            out_path = category_dir / f"{item_id}-{rarity}.png"
            output.save(out_path)
            generated_paths.append(out_path)

    build_preview(generated_paths)
    print(f"Generated {len(generated_paths)} item variants in {OUT_ROOT}")


if __name__ == "__main__":
    main()
