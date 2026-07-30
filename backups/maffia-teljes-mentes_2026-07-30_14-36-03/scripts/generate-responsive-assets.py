#!/usr/bin/env python3
"""Generate the small/medium WebP variants used by responsive browser markup."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    Path("register.webp"),
    Path("assets/map/map-background-clean-roadfix.webp"),
    Path("assets/world/harbor-map-clean-v3.webp"),
    Path("assets/world/world-map-browser-optimized.webp"),
]
WIDTHS = (960, 1440)


def main() -> None:
    generated: list[dict[str, object]] = []
    for relative in TARGETS:
        source = ROOT / relative
        if not source.is_file():
            continue
        with Image.open(source) as image:
            image.load()
            for width in WIDTHS:
                if width >= image.width:
                    continue
                height = max(1, round(image.height * width / image.width))
                output = source.with_name(f"{source.stem}-{width}.webp")
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                resized.save(output, "WEBP", quality=80, method=6)
                generated.append({
                    "source": relative.as_posix(),
                    "output": output.relative_to(ROOT).as_posix(),
                    "width": width,
                    "height": height,
                    "bytes": output.stat().st_size,
                })
    report = ROOT / "performance" / "responsive-assets.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(generated, indent=2), encoding="utf-8")
    print(f"Generated {len(generated)} responsive images. Report: {report}")


if __name__ == "__main__":
    main()
