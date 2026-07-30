#!/usr/bin/env python3
"""Restore files moved by archive-unused-assets.py after checksum verification."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def checksum(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", default="performance/asset-archive-manifest.json")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    manifest = json.loads((ROOT / args.manifest).read_text(encoding="utf-8"))
    restored = 0
    for entry in manifest.get("files", []):
        archived = (ROOT / entry["archive"]).resolve()
        destination = (ROOT / entry["source"]).resolve()
        if ROOT not in archived.parents or ROOT not in destination.parents:
            raise SystemExit("Unsafe restore path")
        if not archived.is_file():
            raise SystemExit(f"Missing archive file: {archived}")
        if entry.get("sha256") and checksum(archived) != entry["sha256"]:
            raise SystemExit(f"Checksum mismatch: {archived}")
        if args.apply:
            if destination.exists():
                raise SystemExit(f"Destination already exists: {destination}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(archived), str(destination))
        restored += 1
    print(json.dumps({"verified": restored, "restored": restored if args.apply else 0}))


if __name__ == "__main__":
    main()
