from pathlib import Path
import json

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "assets" / "map"
SOURCE = MAP_DIR / "map-background-buildings-original.png"
CLEAN = MAP_DIR / "map-background-clean-roadfix.png"
MASK_DIR = MAP_DIR / "purchasable-houses-v3"
OUTPUT_DIR = MAP_DIR / "purchasable-houses-v9"
PREVIEW = OUTPUT_DIR / "placement-preview.png"

# v3 contour, but fitted to the original house positions.
PLACEMENT = {
    "market-row": {"x": 816, "y": 219, "width": 226, "height": 159},
    "west-mid-block": {"x": 294, "y": 288, "width": 219, "height": 179},
    "east-office": {"x": 969, "y": 343, "width": 229, "height": 166},
    "central-bank": {"x": 726, "y": 504, "width": 236, "height": 193},
    "southwest-tenement": {"x": 304, "y": 724, "width": 260, "height": 220},
    "courthouse": {"x": 979, "y": 574, "width": 249, "height": 217},
}


def alpha_from_difference(source_crop, clean_crop, v3_alpha):
    diff = ImageChops.difference(source_crop.convert("RGB"), clean_crop.convert("RGB"))
    r, g, b = diff.split()
    diff_mask = ImageChops.lighter(ImageChops.lighter(r, g), b)
    # Keep changed edges/vegetation/buildings, but remove roads that are identical
    # on both maps. Morphology joins the natural outline so it does not look cut up.
    changed = diff_mask.point(lambda value: 255 if value >= 10 else 0)
    changed = changed.filter(ImageFilter.MaxFilter(13))
    changed = changed.filter(ImageFilter.GaussianBlur(1.1))
    changed = changed.point(lambda value: 255 if value >= 24 else 0)
    alpha = ImageChops.multiply(v3_alpha, changed)
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.35))
    return alpha


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not CLEAN.exists():
        raise FileNotFoundError(CLEAN)

    source = Image.open(SOURCE).convert("RGBA")
    clean = Image.open(CLEAN).convert("RGBA")
    preview = clean.copy()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    metadata = {}

    for name, p in PLACEMENT.items():
        v3 = Image.open(MASK_DIR / f"{name}.png").convert("RGBA")
        if v3.size != (p["width"], p["height"]):
            v3 = v3.resize((p["width"], p["height"]), Image.Resampling.LANCZOS)
        v3_alpha = v3.getchannel("A")
        crop_box = (p["x"], p["y"], p["x"] + p["width"], p["y"] + p["height"])
        source_crop = source.crop(crop_box).convert("RGBA")
        clean_crop = clean.crop(crop_box).convert("RGBA")
        alpha = alpha_from_difference(source_crop, clean_crop, v3_alpha)
        source_crop.putalpha(alpha)
        source_crop.save(OUTPUT_DIR / f"{name}.png", optimize=True)
        preview.alpha_composite(source_crop, (p["x"], p["y"]))
        metadata[name] = dict(p)
        print(f"{name}: {p['x']}, {p['y']}, {p['width']}, {p['height']}")

    (OUTPUT_DIR / "placement.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    preview.save(PREVIEW, optimize=True)


if __name__ == "__main__":
    main()
