"""Graphics step 2 tiles: deep river water, the open sea further out, flower beds
and stone-embanked (quay) water for canals and rivers running through a town.

Indices continue after the province tiles (see province_tiles.py); mirrored in
src/config/tileGids.ts (gid = index + 1).
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, T, new, put, rect, shade, sprinkle

# 88.. : deep water (the middle of wide rivers and lakes), deep sea, a flower bed (decor, walkable)
DEEP, SEA_DEEP, FLOWERBED = range(88, 91)
# 96..111 : water with stone embankments, one per neighbour mask like WATER_EDGE (96 = no edge)
QUAY_EDGE = 96
LAST_WATER_TILE = QUAY_EDGE + 15
WATER_COLLIDES = [DEEP, SEA_DEEP, *range(QUAY_EDGE, QUAY_EDGE + 16)]

N, E, S, W = 1, 2, 4, 8
DEEP_C = [(22, 92, 136), (30, 112, 156), (52, 140, 182), (150, 214, 232)]
SEA_DEEP_C = [(24, 78, 116), (32, 96, 136), (52, 124, 160), (160, 206, 222)]
STONE = [(98, 94, 96), (138, 132, 126), (170, 164, 152), (204, 198, 184)]
FLOWER_C = [(236, 92, 110), (250, 214, 92), (246, 246, 236), (186, 120, 214), (244, 150, 60)]


def wave(im: Image.Image, x: int, y: int, light, crest) -> None:
    """A small curved wave crest: ‿ shaped highlight with a bright top pixel."""
    put(im, x, y, light); put(im, x + 1, y + 1, light); put(im, x + 2, y + 1, light); put(im, x + 3, y, light)
    put(im, x + 1, y, crest); put(im, x + 2, y, crest)


def deep_water(im: Image.Image, rnd: random.Random, pal: list) -> None:
    rect(im, 0, 0, T - 1, T - 1, pal[1])
    sprinkle(im, rnd, 14, [pal[0]])
    for _ in range(2):
        wave(im, rnd.randrange(T - 4), rnd.randrange(2, T - 2), pal[2], pal[3])


def flower_bed(im: Image.Image, rnd: random.Random) -> None:
    """A low mound of leaves covered with bright blossoms (walk-through decor)."""
    for y in range(3, 15):
        for x in range(1, 15):
            if ((x - 7.5) / 7) ** 2 + ((y - 9) / 6) ** 2 <= 1 - 0.15 * rnd.random():
                put(im, x, y, P["f1"] if y > 11 else P["f2"])
    sprinkle(im, rnd, 10, [P["f3"]], (2, 4, 13, 10), wrap=False)
    sprinkle(im, rnd, 8, [P["f0"]], (2, 10, 13, 14), wrap=False)
    colors = rnd.sample(FLOWER_C, 2)
    for i in range(9):
        x, y = rnd.randint(2, 12), rnd.randint(4, 12)
        c = colors[i % 2]
        put(im, x, y, c); put(im, x + 1, y, c); put(im, x, y + 1, c); put(im, x + 1, y + 1, shade(c, 0.75))
        put(im, x, y, shade(c, 1.3))


def _blocks(im: Image.Image, x0: int, y0: int, x1: int, y1: int, horizontal: bool) -> None:
    """Dressed stone blocks with mortar lines, lit from the top-left."""
    rect(im, x0, y0, x1, y1, STONE[1])
    if horizontal:
        for y in range(y0, y1 + 1, 3):
            rect(im, x0, y, x1, y, STONE[0])
        for y in range(y0 + 1, y1 + 1, 3):
            off = 0 if (y // 3) % 2 else 3
            for x in range(x0 + off, x1 + 1, 6):
                put(im, x, y, STONE[0]); put(im, x, y + 1, STONE[0]); put(im, x + 1, y, STONE[2])
    else:
        for x in range(x0, x1 + 1, 3):
            rect(im, x, y0, x, y1, STONE[0])
        for y in range(y0, y1 + 1, 5):
            rect(im, x0, y, x1, y, STONE[0]); put(im, x0 + 1, y + 1, STONE[2])


def quay_tile(mask: int, rnd: random.Random) -> Image.Image:
    """Water held by stone embankments on the sides in `mask` (a bank where the
    neighbour is not water): a light kerb on top, the wall face, a dark wet line."""
    im = new(T, T)
    rect(im, 0, 0, T - 1, T - 1, P["w1"])
    sprinkle(im, rnd, 6, [P["w0"]])
    wave(im, rnd.randrange(T - 4), rnd.randrange(5, T - 4), P["w2"], P["w3"])
    if mask & N:  # we see the wall face: kerb, three courses of stone, shadow on the water
        rect(im, 0, 0, T - 1, 1, STONE[3]); rect(im, 0, 2, T - 1, 2, STONE[2])
        _blocks(im, 0, 3, T - 1, 8, True)
        rect(im, 0, 9, T - 1, 9, (26, 74, 102)); rect(im, 0, 10, T - 1, 10, P["w0"])
    if mask & S:  # only the kerb top shows
        rect(im, 0, T - 4, T - 1, T - 4, STONE[0]); rect(im, 0, T - 3, T - 1, T - 1, STONE[3])
        for x in range(2, T, 5):
            put(im, x, T - 2, STONE[1])
    for side in (W, E):
        if not mask & side:
            continue
        x0, x1 = (0, 3) if side == W else (T - 4, T - 1)
        _blocks(im, x0, 0, x1, T - 1, False)
        rect(im, x0 if side == W else x1, 0, x0 if side == W else x1, T - 1, STONE[3])
        shadow_x = x1 + 1 if side == W else x0 - 1
        rect(im, shadow_x, 0, shadow_x, T - 1, (26, 74, 102))
    return im


def water_tile_v2(idx: int, rnd: random.Random) -> Image.Image | None:
    """Draws one of the tiles of this module, or None if idx isn't one."""
    if DEEP <= idx <= FLOWERBED:
        im = new(T, T)
        if idx == DEEP:
            deep_water(im, rnd, DEEP_C)
        elif idx == SEA_DEEP:
            deep_water(im, rnd, SEA_DEEP_C)
        else:
            flower_bed(im, rnd)
        return im
    if QUAY_EDGE <= idx <= LAST_WATER_TILE:
        return quay_tile(idx - QUAY_EDGE, rnd)
    return None
