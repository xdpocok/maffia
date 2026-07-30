"""Import-friendly alias for the hyphenated asset audit script."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

_path = Path(__file__).with_name("audit-assets.py")
_spec = spec_from_file_location("maffia_asset_audit", _path)
if _spec is None or _spec.loader is None:
    raise ImportError(f"Cannot load {_path}")
_module = module_from_spec(_spec)
_spec.loader.exec_module(_module)

IMAGE_SUFFIXES = _module.IMAGE_SUFFIXES
ROOT = _module.ROOT
production_files = _module.production_files
referenced_images = _module.referenced_images
