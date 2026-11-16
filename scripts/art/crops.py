"""Crop growth spritesheets: one 16x32 frame per stage, 5 stages per crop
(seeded, sprout, young, grown, ready to harvest). The plant is rooted at the
bottom tile of the frame, so tall plants can overlap the tile above.

The game maps a crop's growth to these frames (see FarmScene), so adding a
new crop only needs a new sheet named sprites/crops/<cropId>.png.
"""
from __future__ import annotations

from typing import Callable

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade

ROOT_X, ROOT_Y = 8, 26
FRAMES = 5
Leaf = tuple[int, int, int]


def stalk(im: Image.Image, x0: int, y0: int, dx: int, dy: int, c: Leaf, tip: Leaf | None = None) -> None:
    steps = max(abs(dx), abs(dy), 1)
    for s in range(steps + 1):
        put(im, x0 + round(dx * s / steps), y0 + round(dy * s / steps), c)
    if tip:
        put(im, x0 + dx, y0 + dy, tip)


def seeded(im: Image.Image) -> None:
    disc(im, ROOT_X, ROOT_Y + 1, 2.5, P["s0"], squash=0.6)
    for x in (6, 8, 10):
        put(im, x, ROOT_Y, (198, 176, 120))


def sprout(im: Image.Image, c: Leaf = P["f3"]) -> None:
    stalk(im, ROOT_X, ROOT_Y, 0, -3, P["f2"])
    rect(im, 5, ROOT_Y - 4, 7, ROOT_Y - 3, c); rect(im, 9, ROOT_Y - 4, 11, ROOT_Y - 3, c)


def leafy(im: Image.Image, height: int, spread: int, dark: Leaf, light: Leaf) -> None:
    for dx in range(-spread, spread + 1, 2):
        stalk(im, ROOT_X, ROOT_Y, dx, -height + abs(dx) // 2, dark, light)
        stalk(im, ROOT_X + (1 if dx >= 0 else -1), ROOT_Y, dx, -height + abs(dx) // 2 + 1, light)


def parsnip(im: Image.Image, stage: int) -> None:
    if stage >= 2:
        leafy(im, 4 + stage * 2, 2 + stage, P["f2"], P["f4"])
    if stage == 4:
        disc(im, ROOT_X, ROOT_Y, 3, (232, 220, 186)); put(im, ROOT_X - 1, ROOT_Y - 1, (250, 244, 224))


def potato(im: Image.Image, stage: int) -> None:
    if stage >= 2:
        for (cx, cy, r) in [(5, -5, 3), (11, -5, 3), (8, -8, 3.5), (8, -3, 3)][: stage]:
            disc(im, ROOT_X + cx - 8, ROOT_Y + cy, r, P["f2"]); disc(im, ROOT_X + cx - 9, ROOT_Y + cy - 1, r * 0.5, P["f3"])
    if stage >= 3:
        for x, y in ((6, -10), (10, -9)):
            put(im, x, ROOT_Y + y, (236, 230, 240)); put(im, x, ROOT_Y + y + 1, (220, 196, 90))
    if stage == 4:
        for x in (4, 11):
            disc(im, x, ROOT_Y + 1, 2, (176, 132, 82)); put(im, x - 1, ROOT_Y, (206, 166, 112))


def cauliflower(im: Image.Image, stage: int) -> None:
    if stage >= 2:
        for dx in (-5, -2, 2, 5)[: stage + 1]:
            disc(im, ROOT_X + dx, ROOT_Y - 3, 3, (70, 120, 106)); put(im, ROOT_X + dx - 1, ROOT_Y - 5, (120, 170, 150))
    if stage >= 3:
        disc(im, ROOT_X, ROOT_Y - 7, 4, (82, 136, 116))
    if stage == 4:
        disc(im, ROOT_X, ROOT_Y - 6, 4, (236, 230, 206)); disc(im, ROOT_X - 1, ROOT_Y - 7, 2, (252, 250, 236))
        for x in (5, 8, 11):
            put(im, x, ROOT_Y - 5, (210, 200, 170))


def strawberry(im: Image.Image, stage: int) -> None:
    if stage >= 2:
        for (dx, dy) in [(-4, -2), (4, -2), (0, -5), (-2, -7), (3, -7)][: stage + 1]:
            disc(im, ROOT_X + dx, ROOT_Y + dy, 2.5, P["f2"]); put(im, ROOT_X + dx - 1, ROOT_Y + dy - 1, P["f4"])
    if stage >= 3:
        put(im, 5, ROOT_Y - 8, (250, 250, 240)); put(im, 11, ROOT_Y - 6, (250, 250, 240))
    if stage == 4:
        for (x, y) in ((4, -1), (11, -2), (7, -4)):
            disc(im, x, ROOT_Y + y, 1.6, (200, 56, 60)); put(im, x - 1, ROOT_Y + y - 1, (240, 120, 110))


def green_bean(im: Image.Image, stage: int) -> None:
    if stage >= 2:
        rect(im, ROOT_X, ROOT_Y - 6 - stage * 4, ROOT_X, ROOT_Y, P["k2"])  # stake
        for y in range(ROOT_Y - 2, ROOT_Y - 6 - stage * 4, -3):
            side = 1 if (y // 3) % 2 else -1
            stalk(im, ROOT_X, y, side * 3, -1, P["f2"], P["f3"])
            disc(im, ROOT_X + side * 3, y - 1, 1.5, P["f3"])
    if stage == 4:
        for (x, y) in ((5, -10), (11, -14), (5, -18)):
            rect(im, x, ROOT_Y + y, x, ROOT_Y + y + 4, (110, 168, 72)); put(im, x, ROOT_Y + y, (150, 200, 96))


CROPS: dict[str, Callable[[Image.Image, int], None]] = {
    "parsnip": parsnip, "potato": potato, "cauliflower": cauliflower,
    "strawberry": strawberry, "green_bean": green_bean,
}


def crop_sheet(draw: Callable[[Image.Image, int], None]) -> Image.Image:
    out = new(16 * FRAMES, 32)
    for stage in range(FRAMES):
        im = new(16, 32)
        if stage == 0:
            seeded(im)
        else:
            if stage == 1:
                sprout(im)
            draw(im, stage)
            outline(im, 0.45)
        out.paste(im, (stage * 16, 0))
    return out


def make_crops() -> list[dict]:
    files = []
    for crop_id, draw in CROPS.items():
        rel = f"sprites/crops/{crop_id}.png"
        save(crop_sheet(draw), rel)
        files.append({"type": "spritesheet", "key": f"crop_{crop_id}", "url": rel,
                      "frameConfig": {"frameWidth": 16, "frameHeight": 32}})
    return files
