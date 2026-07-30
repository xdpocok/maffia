#!/usr/bin/env python3
"""Move large unreferenced production images into a reversible backup archive."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from datetime import datetime
from pathlib import Path

from audit_assets import IMAGE_SUFFIXES, ROOT, production_files, referenced_images


def inside(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def digest(path: Path) -> str:
    checksum = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--threshold-mb", type=float, default=1.0)
    parser.add_argument("--archive-name", default=f"performance-assets-{datetime.now():%Y-%m-%d}")
    args = parser.parse_args()
    threshold = int(args.threshold_mb * 1024 * 1024)
    referenced = set(referenced_images())
    candidates = sorted(
        path for path in production_files()
        if path.suffix.lower() in IMAGE_SUFFIXES and path.stat().st_size > threshold and path not in referenced
    )
    archive = (ROOT / "backups" / args.archive_name).resolve()
    if not inside(archive, ROOT / "backups"):
        raise SystemExit("Unsafe archive destination")
    entries: list[dict[str, object]] = []
    for source in candidates:
        destination = archive / "files" / source.relative_to(ROOT)
        if not inside(source, ROOT) or not inside(destination, archive):
            raise SystemExit(f"Unsafe move path: {source}")
        entry = {
            "source": source.relative_to(ROOT).as_posix(),
            "archive": destination.relative_to(ROOT).as_posix(),
            "bytes": source.stat().st_size,
        }
        if args.apply:
            entry["sha256"] = digest(source)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(destination))
        entries.append(entry)
    manifest = {
        "createdAt": datetime.now().astimezone().isoformat(),
        "applied": args.apply,
        "fileCount": len(entries),
        "totalBytes": sum(int(entry["bytes"]) for entry in entries),
        "files": entries,
    }
    output = ROOT / "performance" / ("asset-archive-manifest.json" if args.apply else "asset-archive-dry-run.json")
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in manifest.items() if key != "files"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
