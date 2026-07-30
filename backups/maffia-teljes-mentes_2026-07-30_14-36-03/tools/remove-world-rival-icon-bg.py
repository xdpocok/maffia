from collections import deque
from pathlib import Path

from PIL import Image


TARGETS = [
    Path("assets/world/world-rival-village-1.png"),
    Path("assets/world/world-rival-village-2.png"),
    Path("assets/world/world-rival-village-3.png"),
]
OUTPUT_DIR = Path("tools/world-rival-clean")


def color_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def is_bg_like(pixel, bg_samples):
    if pixel[3] == 0:
        return True
    rgb = pixel[:3]
    if rgb[0] > 238 and rgb[1] > 238 and rgb[2] > 238:
        return True
    return any(color_distance(rgb, bg) <= 54 for bg in bg_samples)


def clean_icon(path: Path):
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    sample_points = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
        (width // 2, 0),
        (width // 2, height - 1),
        (0, height // 2),
        (width - 1, height // 2),
    ]
    bg_samples = [pixels[x, y][:3] for x, y in sample_points]

    queue = deque(sample_points)
    visited = set(sample_points)

    while queue:
        x, y = queue.popleft()
        pixel = pixels[x, y]
        if not is_bg_like(pixel, bg_samples):
            continue
        pixels[x, y] = (pixel[0], pixel[1], pixel[2], 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            if (nx, ny) in visited:
                continue
            visited.add((nx, ny))
            queue.append((nx, ny))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / path.name
    image.save(output_path)
    return output_path


def main():
    for target in TARGETS:
        cleaned = clean_icon(target)
        print(f"CLEANED {cleaned}")


if __name__ == "__main__":
    main()
