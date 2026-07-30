from pathlib import Path
import json

import numpy as np
import cv2
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "map" / "sources" / "main-map-house-model-sheet.png"
OUTPUT_DIR = ROOT / "assets" / "map" / "purchasable-houses-v3"
MAP_SIZE = (1536, 1024)

# The selected models match the six purchasable lots on the main city map.
CROPS = {
    "market-row": (900, 55, 1166, 260),
    "west-mid-block": (300, 20, 595, 270),
    "east-office": (580, 300, 860, 535),
    "central-bank": (880, 540, 1175, 800),
    "southwest-tenement": (0, 520, 305, 795),
    "courthouse": (620, 785, 900, 1075),
}

# Four corners of each model's garden base: top, right, bottom, left.
SOURCE_BASE_CORNERS = {
    "market-row": [(127, 37), (252, 106), (126, 174), (5, 105)],
    "west-mid-block": [(143, 55), (281, 132), (142, 210), (5, 134)],
    "east-office": [(131, 42), (257, 108), (130, 184), (5, 112)],
    "central-bank": [(142, 68), (278, 147), (141, 226), (5, 151)],
    "southwest-tenement": [(142, 72), (279, 151), (142, 234), (5, 156)],
    "courthouse": [(133, 62), (261, 143), (132, 225), (1, 147)],
}

# Four corners of the inner garden rectangles on the reference city map.
TARGET_LOT_CORNERS = {
    "market-row": [(919, 216), (1027, 274), (917, 374), (812, 313)],
    "west-mid-block": [(370, 302), (480, 363), (369, 476), (271, 416)],
    "east-office": [(1070, 340), (1182, 404), (1070, 516), (968, 455)],
    "central-bank": [(799, 490), (918, 555), (800, 690), (690, 630)],
    "southwest-tenement": [(385, 690), (500, 752), (385, 903), (270, 838)],
    "courthouse": [(1090, 590), (1210, 655), (1090, 792), (978, 730)],
}


def make_alpha(rgb_image):
    pixels = np.asarray(rgb_image, dtype=np.int16)
    brightest = pixels.max(axis=2)
    darkest = pixels.min(axis=2)
    chroma = brightest - darkest
    luminance = pixels.mean(axis=2)

    # The source has a baked-in light checkerboard. The buildings are dark,
    # while their warm highlights have enough chroma to remain foreground.
    darkness_alpha = np.clip((238.0 - luminance) / 20.0, 0.0, 1.0)
    chroma_alpha = np.clip((chroma - 5.0) / 16.0, 0.0, 1.0)
    alpha = np.maximum(darkness_alpha, chroma_alpha)
    alpha[luminance >= 239.0] = np.minimum(alpha[luminance >= 239.0], chroma_alpha[luminance >= 239.0])
    light_neutral_edge = (luminance > 185.0) & (chroma < 18.0)
    alpha[light_neutral_edge] = 0.0
    alpha = (alpha * 255).astype(np.uint8)

    matte = Image.fromarray(alpha, mode="L")
    matte = matte.filter(ImageFilter.MinFilter(3))
    matte = matte.filter(ImageFilter.GaussianBlur(0.4))
    return matte


def keep_main_component(matte):
    pixels = np.asarray(matte)
    binary = (pixels >= 24).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if count <= 2:
        return matte
    largest_label = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    keep = labels == largest_label
    cleaned = np.where(keep, pixels, 0).astype(np.uint8)
    return Image.fromarray(cleaned, mode="L")


def trim_transparent(image, padding=5):
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    box = (
        max(0, left - padding),
        max(0, top - padding),
        min(image.width, right + padding),
        min(image.height, bottom + padding),
    )
    return image.crop(box)


def fit_without_distortion(image, source_corners, target_corners):
    source = np.asarray(source_corners, dtype=np.float32)
    target = np.asarray(target_corners, dtype=np.float32)

    source_width = np.linalg.norm(source[1] - source[3])
    target_width = np.linalg.norm(target[1] - target[3])
    scale = target_width / source_width

    source_center = source.mean(axis=0)
    target_center = target.mean(axis=0)
    resized = image.resize(
        (
            max(1, round(image.width * scale)),
            max(1, round(image.height * scale)),
        ),
        Image.Resampling.LANCZOS,
    )
    scaled_source_center = source_center * scale
    left = round(target_center[0] - scaled_source_center[0])
    top = round(target_center[1] - scaled_source_center[1])
    return resized, (left, top)


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    source = Image.open(SOURCE).convert("RGB")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {}
    for name, box in CROPS.items():
        crop = source.crop(box)
        crop.putalpha(keep_main_component(make_alpha(crop)))
        crop = trim_transparent(crop)
        crop, (left, top) = fit_without_distortion(
            crop,
            SOURCE_BASE_CORNERS[name],
            TARGET_LOT_CORNERS[name],
        )
        output = OUTPUT_DIR / f"{name}.png"
        crop.save(output, optimize=True)
        metadata[name] = {
            "x": left,
            "y": top,
            "width": crop.width,
            "height": crop.height,
        }
        print(f"{name}: ({left}, {top}, {crop.width}, {crop.height}) -> {output}")

    (OUTPUT_DIR / "placement.json").write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
