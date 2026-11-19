"""
Sizes from real_scale.py applied to the imported art: animal and vehicle
frames, the sprite pack's frame sizes, and code-drawn pictures resized.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image

from .real_scale import SIZES, canvas

PUB = Path(__file__).resolve().parents[2] / "public" / "assets" / "sprites"


def real_frame(name: str) -> tuple[tuple[int, int], tuple[int, int]]:
    """(size to fit the drawings in, frame size) for an animal or vehicle at its true size."""
    w, h = canvas(name)
    return (w, h), (w + 4, h + 4)


def set_frame_size(key: str, size: tuple[int, int]) -> None:
    """Writes a sprite sheet's frame size into the sprite pack."""
    path = PUB / "pack.json"
    pack = json.loads(path.read_text())
    for f in pack["generated"]["files"]:
        if f["key"] == key:
            f["frameConfig"] = {"frameWidth": size[0], "frameHeight": size[1]}
    path.write_text(json.dumps(pack, indent=1))


def resize_drawn() -> list[str]:
    """Pictures still drawn by code (no painting in assets/): shrunk or grown to their true size,
    kept whole and standing on the bottom (pixel-doubled, so redraw them for a sharper look)."""
    done = []
    for name in SIZES:
        if name.startswith(("animals/", "vehicles/")):
            continue
        path = PUB / f"{name}.png"
        if not path.exists():
            continue
        target = canvas(name)
        im = Image.open(path).convert("RGBA")
        if im.size == target:
            continue
        box = im.getbbox()
        if not box:
            continue
        part = im.crop(box)
        # The old drawing's shape may not be the real one (a gate drawn too narrow): match the area,
        # so it is as big as it should be without being stretched; the canvas follows the drawing.
        k = math.sqrt(target[0] * target[1] / (part.width * part.height))
        size = (max(1, round(part.width * k)), max(1, round(part.height * k)))
        if im.size == size:
            continue
        part = part.resize(size, Image.NEAREST)
        out = Image.new("RGBA", size, (0, 0, 0, 0))
        out.alpha_composite(part, (0, 0))
        out.save(path)
        done.append(f"resized/{name}")
    return done
