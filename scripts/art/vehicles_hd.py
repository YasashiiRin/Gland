"""HD vehicles (graphics x2): the vehicle drawings of vehicles.py redrawn on a
64x64 frame. Shapes are laid out on the 32-px grid of the 1x art, but every
primitive is re-drawn at double resolution (so circles are rounder and the
ink outline is half as thick), wheels get tyres, rims, spokes and a lit hub,
and painted bodies get a thin highlight and a chrome glint.
"""
from __future__ import annotations

import math
from contextlib import contextmanager
from typing import Iterator

from PIL import Image, ImageOps

from . import common
from . import vehicles as v1
from .common import new, outline, save, shade, soft_shadow

S = 2
W = H = v1.W * S


def _rect(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c) -> None:
    common.rect(im, x0 * S, y0 * S, x1 * S + S - 1, y1 * S + S - 1, c)
    if x1 - x0 >= 3 and y1 - y0 >= 2 and len(c) == 3 and sum(c) > 240:  # a painted panel: lit top edge
        common.rect(im, x0 * S + 1, y0 * S, x1 * S + S - 2, y0 * S, shade(c, 1.18))


def _put(im: Image.Image, x: int, y: int, c) -> None:
    common.rect(im, x * S, y * S, x * S + S - 1, y * S + S - 1, c)


def _disc(im: Image.Image, cx: float, cy: float, r: float, c, squash: float = 1.0) -> None:
    common.disc(im, cx * S + 0.5, cy * S + 0.5, r * S, c, squash)


def _wheel(im: Image.Image, cx: float, cy: float, r: float) -> None:
    x, y, R = cx * S + 0.5, cy * S + 0.5, r * S
    common.disc(im, x, y, R, (36, 32, 32))                      # tyre
    common.disc(im, x - 0.6, y - 0.6, R - 1.4, (58, 54, 54))
    common.disc(im, x, y, R * 0.62, (150, 146, 140))            # rim
    common.disc(im, x, y, R * 0.62 - 1, (112, 108, 104))
    for k in range(6):                                          # spokes
        a = k * math.pi / 3 + 0.3
        for t in range(1, int(R * 0.6)):
            common.put(im, round(x + math.cos(a) * t), round(y + math.sin(a) * t), (176, 172, 166))
    common.disc(im, x, y, 1.6, (70, 66, 66))
    common.put(im, round(x - 1), round(y - 1), (230, 226, 220))  # hub glint


def _wheel_front(im: Image.Image, cx: int, top: int, bottom: int, w: int = 3) -> None:
    x0, x1 = (cx - w // 2) * S, (cx + w // 2) * S + S - 1
    common.rect(im, x0, top * S, x1, bottom * S + S - 1, (36, 32, 32))
    common.rect(im, x0 + 1, top * S, x0 + 1, bottom * S + S - 1, (84, 80, 78))
    for y in range(top * S + 1, bottom * S + S, 3):              # tread
        common.rect(im, x0 + 2, y, x1 - 1, y, (24, 22, 22))


@contextmanager
def _hd_primitives() -> Iterator[None]:
    names = ("rect", "put", "disc", "wheel", "wheel_front")
    saved = {n: getattr(v1, n) for n in names}
    for n, f in zip(names, (_rect, _put, _disc, _wheel, _wheel_front)):
        setattr(v1, n, f)
    try:
        yield
    finally:
        for n, f in saved.items():
            setattr(v1, n, f)


def _glints(im: Image.Image) -> None:
    """A one-pixel specular dot on the top-left of bright, saturated paint."""
    px = im.load()
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            r, g, b, a = px[x, y]
            if a < 255 or px[x - 1, y][3] or px[x, y - 1][3] == 0 or (y + x) % 9:
                continue
            if max(r, g, b) - min(r, g, b) > 70:
                px[x, y] = (*[min(255, c + 60) for c in (r, g, b)], 255)


def vehicle_sheet_hd(side, front) -> Image.Image:
    frames = []
    for kind in ("down", "left", "right", "up"):
        im = new(W, H)
        with _hd_primitives():
            if kind in ("left", "right"):
                side(im)
            else:
                front(im, kind == "up")
        _glints(im)
        outline(im)
        base = new(W, H)
        soft_shadow(base, 32, 60, 28, 5, alpha=80)
        base.alpha_composite(im)
        frames.append(ImageOps.mirror(base) if kind == "left" else base)
    out = new(W * 4, H)
    for i, f in enumerate(frames):
        out.paste(f, (i * W, 0))
    return out


def make_vehicles_hd() -> list[dict]:
    files = []
    for vid, (side, front) in v1.VEHICLES.items():
        rel = f"sprites/vehicles/{vid}.png"
        save(vehicle_sheet_hd(side, front), rel)
        files.append({"type": "spritesheet", "key": f"vehicle_{vid}", "url": rel,
                      "frameConfig": {"frameWidth": W, "frameHeight": H}, "hd": True})
    return files
