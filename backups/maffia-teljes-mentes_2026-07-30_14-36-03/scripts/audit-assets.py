#!/usr/bin/env python3
"""Audit production assets and optionally create/rewrite optimized WebP files."""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from urllib.parse import unquote

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SUFFIXES = {".html", ".css", ".js", ".mjs", ".cjs"}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
IMAGE_PATTERN = re.compile(r"(?:\.\.?/|/)[^\"'`\s)<>]+\.(?:png|jpe?g|webp|gif|avif)(?:\?[^\"'`\s)<>]*)?", re.I)
IGNORED_PARTS = {".git", "node_modules", "backups", "tmp"}


def production_files() -> list[Path]:
    files: list[Path] = []
    for directory, child_dirs, names in os.walk(ROOT):
        child_dirs[:] = [name for name in child_dirs if name not in IGNORED_PARTS]
        files.extend(Path(directory) / name for name in names)
    return files


def source_files() -> list[Path]:
    roots = [ROOT / name for name in ("index.html", "style.css", "game.js", "server.js", "assets-inline.js", "service-worker.js")]
    nested = [
        path
        for directory in (ROOT / "js", ROOT / "styles")
        if directory.is_dir()
        for path in directory.rglob("*")
        if path.is_file() and path.suffix.lower() in SOURCE_SUFFIXES
    ]
    return [path for path in roots if path.is_file()] + nested


def image_references() -> tuple[set[Path], set[str]]:
    references: set[Path] = set()
    missing: set[str] = set()
    for source in source_files():
        text = source.read_text(encoding="utf-8", errors="ignore")
        for match in IMAGE_PATTERN.finditer(text):
            # An asset-runtime mapping key is a legacy database path, not a browser request.
            if text[match.end():match.end() + 2] == '\":':
                continue
            raw_match = match.group(0)
            if raw_match.startswith("//") or "${" in raw_match:
                continue
            clean_match = unquote(raw_match.split("?", 1)[0]).removeprefix("./").lstrip("/")
            candidate = (ROOT / clean_match).resolve()
            if candidate.is_file() and ROOT in candidate.parents:
                references.add(candidate)
            elif ROOT in candidate.parents:
                missing.add(clean_match.replace("\\", "/"))
    return references, missing


def referenced_images() -> list[Path]:
    references, _ = image_references()
    return sorted(references)


def image_info(path: Path) -> dict[str, object]:
    with Image.open(path) as image:
        width, height = image.size
        mode = image.mode
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "bytes": path.stat().st_size,
        "width": width,
        "height": height,
        "mode": mode,
    }


def build_report() -> dict[str, object]:
    files = production_files()
    images = [path for path in files if path.suffix.lower() in IMAGE_SUFFIXES]
    referenced_set, missing = image_references()
    referenced = sorted(referenced_set)
    return {
        "projectBytes": sum(path.stat().st_size for path in files),
        "imageBytes": sum(path.stat().st_size for path in images),
        "imageCount": len(images),
        "imagesOver1MB": sum(path.stat().st_size > 1024 * 1024 for path in images),
        "referencedImageBytes": sum(path.stat().st_size for path in referenced),
        "missingImageReferences": sorted(missing),
        "referencedImages": [image_info(path) for path in referenced],
    }


def optimize(referenced: list[Path], threshold: int, max_width: int, quality: int) -> dict[str, str]:
    manifest: dict[str, str] = {}
    for source in referenced:
        if source.stat().st_size < threshold:
            continue
        destination = source.with_name(f"{source.stem}-optimized.webp") if source.suffix.lower() == ".webp" else source.with_suffix(".webp")
        with Image.open(source) as image:
            image.load()
            if image.width > max_width:
                height = max(1, round(image.height * max_width / image.width))
                image = image.resize((max_width, height), Image.Resampling.LANCZOS)
            save_options: dict[str, object] = {"format": "WEBP", "method": 6, "quality": quality}
            if "A" in image.getbands():
                save_options["alpha_quality"] = 90
            image.save(destination, **save_options)
        manifest[source.relative_to(ROOT).as_posix()] = destination.relative_to(ROOT).as_posix()
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--optimize", action="store_true")
    parser.add_argument("--threshold-kb", type=int, default=500)
    parser.add_argument("--max-width", type=int, default=1920)
    parser.add_argument("--quality", type=int, default=82)
    parser.add_argument("--rewrite", action="store_true")
    parser.add_argument("--output", default="performance/asset-report.json")
    args = parser.parse_args()
    report = build_report()
    if args.optimize:
        manifest = optimize(referenced_images(), args.threshold_kb * 1024, args.max_width, args.quality)
        report["optimizedManifest"] = manifest
        if args.rewrite:
            for source in source_files():
                text = source.read_text(encoding="utf-8")
                for original, optimized in manifest.items():
                    text = text.replace(f"./{original}", f"./{optimized}")
                source.write_text(text, encoding="utf-8", newline="\n")
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "referencedImages"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
