"""Shared helpers for the procedural pixel-art generator.

Everything here is drawn freehand in code: colors are chosen by hand for a
warm, natural, slightly muted farm look (earthy greens and browns, soft
light from the top-left). Nothing is sampled or traced from existing art.
"""
from __future__ import annotations

import random
from pathlib import Path
from typing import Iterable

from PIL import Image

T = 16
ROOT = Path(__file__).resolve().parent.parent.parent
ASSETS = ROOT / "public" / "assets"

Color = tuple[int, int, int] | tuple[int, int, int, int]

# ------------------------------------------------------------------ palette
P = {
    # grass: a bright, sunny green family (the vivid look of the reference art)
    "g0": (66, 132, 54), "g1": (86, 160, 62), "g2": (108, 182, 70), "g3": (148, 206, 92),
    # dirt / path: warm orange-tan earth
    "d0": (138, 90, 54), "d1": (176, 122, 72), "d2": (204, 152, 96), "d3": (226, 184, 126),
    # tilled soil
    "s0": (72, 50, 36), "s1": (96, 68, 46), "s2": (120, 88, 60), "s3": (142, 108, 76),
    # water
    "w0": (30, 118, 160), "w1": (44, 152, 194), "w2": (82, 190, 218), "w3": (196, 238, 242),
    # stone
    "r0": (70, 68, 72), "r1": (104, 100, 102), "r2": (136, 130, 128), "r3": (170, 164, 156),
    # wood
    "k0": (66, 42, 30), "k1": (98, 64, 42), "k2": (132, 90, 58), "k3": (170, 124, 82),
    # foliage
    "f0": (34, 92, 50), "f1": (52, 126, 58), "f2": (78, 156, 64), "f3": (118, 188, 78), "f4": (176, 218, 110),
    # misc
    "shadow": (20, 26, 18, 80), "white": (236, 228, 210), "ink": (34, 26, 24),
}


def new(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def rgba(c: Color, a: int | None = None) -> tuple[int, int, int, int]:
    if len(c) == 4:
        return c if a is None else (c[0], c[1], c[2], a)  # type: ignore[return-value]
    return (c[0], c[1], c[2], 255 if a is None else a)


def shade(c: Color, f: float) -> tuple[int, int, int, int]:
    """f < 1 darkens, f > 1 lightens (toward a warm white)."""
    r, g, b = c[0], c[1], c[2]
    if f <= 1:
        return (int(r * f), int(g * f), int(b * f * 0.95 + 4), 255)
    t = f - 1
    return (int(r + (255 - r) * t), int(g + (246 - g) * t), int(b + (226 - b) * t), 255)


def put(im: Image.Image, x: int, y: int, c: Color) -> None:
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), rgba(c))


def blend(im: Image.Image, x: int, y: int, c: Color) -> None:
    """Alpha-composite one pixel (for soft shadows)."""
    if not (0 <= x < im.width and 0 <= y < im.height):
        return
    src = rgba(c)
    dst = im.getpixel((x, y))
    a = src[3] / 255
    out_a = a + dst[3] / 255 * (1 - a)
    if out_a == 0:
        return
    mix = [int((src[i] * a + dst[i] * dst[3] / 255 * (1 - a)) / out_a) for i in range(3)]
    im.putpixel((x, y), (mix[0], mix[1], mix[2], int(out_a * 255)))


def rect(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c: Color) -> None:
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(im, x, y, c)


def disc(im: Image.Image, cx: float, cy: float, r: float, c: Color, squash: float = 1.0) -> None:
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if ((x - cx) ** 2 + ((y - cy) / squash) ** 2) <= r * r:
                put(im, x, y, c)


def soft_shadow(im: Image.Image, cx: float, cy: float, rx: float, ry: float, alpha: int = 70) -> None:
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                blend(im, x, y, (18, 24, 16, alpha))


INK = (46, 30, 26)


def _lum(c) -> float:
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]


def _toward_ink(c, t: float) -> tuple[int, int, int, int]:
    return (int(c[0] + (INK[0] - c[0]) * t), int(c[1] + (INK[1] - c[1]) * t), int(c[2] + (INK[2] - c[2]) * t), 255)


def outline(im: Image.Image, darken: float = 0.42, skip_below: int | None = None, inner: bool = True) -> None:
    """The house line style: a crisp 1px outline in a very dark warm brown
    (barely tinted by the fill next to it) around every opaque shape, plus thin
    inner lines wherever two strongly different colours meet, so each part
    (window frame, column, roof edge) reads on its own. `darken` is kept for
    old callers; the outline is always near-ink now."""
    src = im.copy()
    w, h = im.size
    if inner:
        for y in range(h - 1):
            for x in range(w - 1):
                a = src.getpixel((x, y))
                if a[3] < 200:
                    continue
                for nx, ny in ((x + 1, y), (x, y + 1)):
                    b = src.getpixel((nx, ny))
                    if b[3] < 200 or abs(_lum(a) - _lum(b)) < 62:
                        continue
                    if _lum(a) < _lum(b):
                        im.putpixel((x, y), _toward_ink(a, 0.55))
                    else:
                        im.putpixel((nx, ny), _toward_ink(b, 0.55))
    for y in range(h):
        if skip_below is not None and y >= skip_below:
            continue
        for x in range(w):
            if src.getpixel((x, y))[3] != 0:
                continue
            for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    n = src.getpixel((nx, ny))
                    if n[3] > 200:
                        im.putpixel((x, y), _toward_ink(n, 0.82))
                        break


def sprinkle(im: Image.Image, rnd: random.Random, n: int, colors: Iterable[Color],
             area: tuple[int, int, int, int] | None = None, wrap: bool = True) -> None:
    cols = list(colors)
    x0, y0, x1, y1 = area or (0, 0, im.width - 1, im.height - 1)
    for _ in range(n):
        x, y = rnd.randint(x0, x1), rnd.randint(y0, y1)
        if wrap:
            x, y = x % im.width, y % im.height
        put(im, x, y, rnd.choice(cols))


def save(im: Image.Image, rel: str) -> Path:
    out = ASSETS / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out)
    return out
