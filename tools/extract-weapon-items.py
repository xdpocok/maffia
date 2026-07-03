from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "d87678c6-dbbc-42b3-8b45-8a409b9b09d5.png"
OUT_DIR = ROOT / "assets" / "items" / "weapons"


RARITIES = {
    "gray": {
        "outer": (236, 236, 236, 255),
        "inner": (178, 178, 178, 255),
        "glow": (255, 255, 255, 42),
    },
    "yellow": {
        "outer": (235, 191, 82, 255),
        "inner": (180, 132, 34, 255),
        "glow": (255, 214, 102, 42),
    },
    "red": {
        "outer": (226, 86, 78, 255),
        "inner": (170, 54, 48, 255),
        "glow": (255, 96, 88, 42),
    },
}


WEAPONS = [
    {
        "id": "tommy-drum",
        "name": "Tommy dobtaras",
        "box": (18, 120, 432, 375),
    },
    {
        "id": "luger-p08",
        "name": "Luger P08",
        "box": (435, 120, 850, 375),
    },
    {
        "id": "colt-m1911",
        "name": "Colt M1911",
        "box": (853, 120, 1268, 375),
    },
    {
        "id": "service-revolver",
        "name": "Szolgalati revolver",
        "box": (1271, 120, 1670, 375),
    },
    {
        "id": "mauser-c96",
        "name": "Mauser C96",
        "box": (18, 385, 432, 640),
    },
    {
        "id": "karabiner-98k",
        "name": "Karabiner 98k",
        "box": (435, 385, 850, 640),
    },
    {
        "id": "springfield-rifle",
        "name": "Springfield puska",
        "box": (853, 385, 1268, 640),
    },
    {
        "id": "double-barrel",
        "name": "Duplacsovu puska",
        "box": (1271, 385, 1670, 640),
    },
    {
        "id": "coach-shotgun",
        "name": "Rovid csovu shotgun",
        "box": (18, 647, 432, 922),
    },
    {
        "id": "lever-rifle",
        "name": "Karos ismetlo",
        "box": (435, 647, 850, 922),
    },
    {
        "id": "combat-knife",
        "name": "Harci kes",
        "box": (853, 647, 1268, 922),
    },
    {
        "id": "stun-club",
        "name": "Olmos bot",
        "box": (1271, 647, 1670, 922),
    },
]


TARGET_SIZE = (392, 255)
RADIUS = 18


def add_rarity_frame(base: Image.Image, rarity: str) -> Image.Image:
    colors = RARITIES[rarity]
    framed = base.copy()
    glow = Image.new("RGBA", framed.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle(
        (4, 4, framed.width - 5, framed.height - 5),
        radius=RADIUS + 2,
        outline=colors["glow"],
        width=10,
    )
    framed = Image.alpha_composite(framed, glow)

    draw = ImageDraw.Draw(framed)
    draw.rounded_rectangle(
        (8, 8, framed.width - 9, framed.height - 9),
        radius=RADIUS,
        outline=colors["outer"],
        width=4,
    )
    draw.rounded_rectangle(
        (17, 17, framed.width - 18, framed.height - 18),
        radius=RADIUS - 4,
        outline=colors["inner"],
        width=2,
    )
    return framed


def prepare_crop(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = image.crop(box).convert("RGBA")
    resized = crop.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    overlay = Image.new("RGBA", TARGET_SIZE, (8, 6, 4, 12))
    return Image.alpha_composite(resized, overlay)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGB")

    for weapon in WEAPONS:
        base = prepare_crop(image, weapon["box"])
        for rarity in RARITIES:
            output = add_rarity_frame(base, rarity)
            output.save(OUT_DIR / f"{weapon['id']}-{rarity}.png")

    print(f"Generated {len(WEAPONS) * len(RARITIES)} weapon item images in {OUT_DIR}")


if __name__ == "__main__":
    main()
