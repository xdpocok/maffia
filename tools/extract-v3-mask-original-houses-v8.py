from pathlib import Path
import json

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
MASK_DIR = MAP_DIR / "purchasable-houses-v3"
OUTPUT_DIR = MAP_DIR / "purchasable-houses-v8"
PREVIEW = OUTPUT_DIR / "placement-preview.png"

PLACEMENT = {
    "market-row": {"x": 830, "y": 237, "width": 226, "height": 159},
    "west-mid-block": {"x": 286, "y": 320, "width": 219, "height": 179},
    "east-office": {"x": 967, "y": 369, "width": 229, "height": 166},
    "central-bank": {"x": 704, "y": 520, "width": 236, "height": 193},
    "southwest-tenement": {"x": 256, "y": 728, "width": 260, "height": 220},
    "courthouse": {"x": 975, "y": 610, "width": 249, "height": 217},
}


def extract_with_v3_mask(name, source):
    p = PLACEMENT[name]
    mask_source = Image.open(MASK_DIR / f"{name}.png").convert("RGBA")
    mask = mask_source.getchannel("A")
    if mask.size != (p["width"], p["height"]):
        mask = mask.resize((p["width"], p["height"]), Image.Resampling.LANCZOS)
    mask = mask.filter(ImageFilter.GaussianBlur(0.25))

    crop = source.crop((p["x"], p["y"], p["x"] + p["width"], p["y"] + p["height"])).convert("RGBA")
    crop.putalpha(mask)
    return crop, p


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not CLEAN.exists():
        raise FileNotFoundError(CLEAN)

    source = Image.open(SOURCE).convert("RGBA")
    preview = Image.open(CLEAN).convert("RGBA")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    metadata = {}

    for name in PLACEMENT:
        cutout, p = extract_with_v3_mask(name, source)
        cutout.save(OUTPUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(cutout, (p["x"], p["y"]))
        metadata[name] = dict(p)
        print(f"{name}: {p['x']}, {p['y']}, {p['width']}, {p['height']}")

    (OUTPUT_DIR / "placement.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    preview.save(PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
