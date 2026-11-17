"""Draw existing 1x art at double resolution (graphics x2, batch 3).

The building and landmark modules lay out their shapes on the 1x pixel grid
with a handful of primitives (new, put, rect, disc, soft_shadow, outline,
save). `hd_modules()` swaps those primitives, inside the given modules only,
for versions that draw on a canvas twice the size:

* circles and ellipses are rasterised at full HD resolution (rounder curves),
* the ink outline is one HD pixel, i.e. half as thick as before,
* large painted rectangles get a thin lit top edge,
* soft shadows are smoother.

So every existing building keeps its layout and footprint and only needs
`"hd": true` in the sprite pack. Code that reads pixels back (getpixel) or
composites images still works on the 1x grid through `HdImage`.
"""
from __future__ import annotations

from contextlib import contextmanager
from types import ModuleType
from typing import Iterator

from PIL import Image

from . import common
from .common import shade

S = 2


class HdImage:
    """A 1x-sized canvas backed by a 2x RGBA image."""

    def __init__(self, w: int, h: int, raw: Image.Image | None = None) -> None:
        self.width, self.height = w, h
        self.raw = raw if raw is not None else Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))

    @property
    def size(self) -> tuple[int, int]:
        return self.width, self.height

    def getpixel(self, xy: tuple[int, int]):
        return self.raw.getpixel((int(xy[0]) * S, int(xy[1]) * S))

    def putpixel(self, xy: tuple[int, int], c) -> None:
        _put(self, int(xy[0]), int(xy[1]), c)

    def copy(self) -> "HdImage":
        return HdImage(self.width, self.height, self.raw.copy())

    def _hd(self, other) -> Image.Image:
        if isinstance(other, HdImage):
            return other.raw
        return other.resize((other.width * S, other.height * S), Image.NEAREST)

    def alpha_composite(self, other, dest: tuple[int, int] = (0, 0), source: tuple[int, int] = (0, 0)) -> None:
        self.raw.alpha_composite(self._hd(other), (dest[0] * S, dest[1] * S), (source[0] * S, source[1] * S))

    def paste(self, other, box: tuple[int, int] = (0, 0), mask=None) -> None:
        src = self._hd(other)
        self.raw.paste(src, (box[0] * S, box[1] * S), self._hd(mask) if mask is not None else None)


def _raw(im) -> Image.Image:
    return im.raw if isinstance(im, HdImage) else im


def _new(w: int, h: int) -> HdImage:
    return HdImage(w, h)


def _put(im, x: int, y: int, c) -> None:
    if not isinstance(im, HdImage):
        common.put(im, x, y, c)
        return
    x, y = int(x), int(y)
    common.rect(im.raw, x * S, y * S, x * S + S - 1, y * S + S - 1, c)


def _rect(im, x0: int, y0: int, x1: int, y1: int, c) -> None:
    if not isinstance(im, HdImage):
        common.rect(im, x0, y0, x1, y1, c)
        return
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    common.rect(im.raw, x0 * S, y0 * S, x1 * S + S - 1, y1 * S + S - 1, c)
    rgb = common.rgba(c)
    if x1 - x0 >= 4 and y1 - y0 >= 3 and rgb[3] == 255 and sum(rgb[:3]) > 210:  # lit top edge
        common.rect(im.raw, x0 * S + 1, y0 * S, x1 * S + S - 2, y0 * S, shade(rgb, 1.12))


def _disc(im, cx: float, cy: float, r: float, c, squash: float = 1.0) -> None:
    if not isinstance(im, HdImage):
        common.disc(im, cx, cy, r, c, squash)
        return
    common.disc(im.raw, cx * S + 0.5, cy * S + 0.5, r * S + 0.5, c, squash)


def _blend(im, x: int, y: int, c) -> None:
    if not isinstance(im, HdImage):
        common.blend(im, x, y, c)
        return
    for dy in range(S):
        for dx in range(S):
            common.blend(im.raw, int(x) * S + dx, int(y) * S + dy, c)


def _soft_shadow(im, cx: float, cy: float, rx: float, ry: float, alpha: int = 70) -> None:
    common.soft_shadow(_raw(im), cx * S + 0.5, cy * S + 0.5, rx * S, ry * S, alpha) if isinstance(im, HdImage) \
        else common.soft_shadow(im, cx, cy, rx, ry, alpha)


def _outline(im, darken: float = 0.42, skip_below: int | None = None, inner: bool = True) -> None:
    if isinstance(im, HdImage):
        common.outline(im.raw, darken, None if skip_below is None else skip_below * S, inner)
    else:
        common.outline(im, darken, skip_below, inner)


def _save(im, rel: str):
    return common.save(_raw(im), rel)


PRIMITIVES = {"new": _new, "put": _put, "rect": _rect, "disc": _disc, "blend": _blend,
              "soft_shadow": _soft_shadow, "outline": _outline, "save": _save}


@contextmanager
def hd_modules(*modules: ModuleType, extra: dict[str, object] | None = None) -> Iterator[None]:
    """Inside the block, the given modules draw at x2. `extra` swaps more names (e.g. a 1x helper for its HD twin)."""
    swaps = {**PRIMITIVES, **(extra or {})}
    saved: list[tuple[ModuleType, str, object]] = []
    for m in modules:
        for name, f in swaps.items():
            if hasattr(m, name):
                saved.append((m, name, getattr(m, name)))
                setattr(m, name, f)
    try:
        yield
    finally:
        for m, name, f in saved:
            setattr(m, name, f)


def mark_hd(files: list[dict]) -> list[dict]:
    """Flags pack entries as HD art (spritesheet frames are twice as big)."""
    for f in files:
        f["hd"] = True
        fc = f.get("frameConfig")
        if fc:
            fc["frameWidth"] *= S
            fc["frameHeight"] *= S
    return files
