"""Extra ground/decor tiles for the central-Vietnam province maps (tileset rows 8+).

Indices continue after the original 64 tiles, so existing maps keep their gids.
Mirrored in src/config/tileGids.ts (gid = index + 1).
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, T, new, put, rect, sprinkle

# 64.. : beach sand, sand with shells, open sea, surf (sea meeting sand on its west side),
# a tea-bush row, bridge planks, red basalt cliff, an orchard tree (sprite per map).
SAND, SAND2, SEA, SURF, TEA, BRIDGE, CLIFF, ORCHARD = range(64, 72)
# 72.. : Huế citadel brick wall, a lotus pond, stone paving (old-town streets, courtyards).
CITADEL, LOTUS, PAVING = range(72, 75)
LAST_PROVINCE_TILE = PAVING
PROVINCE_COLLIDES = [SEA, SURF, TEA, CLIFF, ORCHARD, CITADEL, LOTUS]

SAND_C = [(206, 186, 140), (222, 204, 160), (236, 222, 184), (184, 162, 118)]
SEA_C = [(36, 96, 128), (46, 116, 150), (66, 140, 170), (170, 214, 220)]


def sand(im: Image.Image, rnd: random.Random, shells: bool) -> None:
    rect(im, 0, 0, T - 1, T - 1, SAND_C[1])
    sprinkle(im, rnd, 18, [SAND_C[0]])
    sprinkle(im, rnd, 12, [SAND_C[2]])
    sprinkle(im, rnd, 4, [SAND_C[3]])
    if shells:
        for x, y in ((4, 5), (11, 10)):
            put(im, x, y, (244, 232, 216)); put(im, x + 1, y, (226, 196, 180)); put(im, x, y + 1, SAND_C[3])


def sea(im: Image.Image, rnd: random.Random) -> None:
    rect(im, 0, 0, T - 1, T - 1, SEA_C[1])
    sprinkle(im, rnd, 10, [SEA_C[0]])
    for _ in range(4):  # little wave crests
        x, y = rnd.randrange(T - 3), rnd.randrange(1, T)
        put(im, x, y, SEA_C[2]); put(im, x + 1, y - 1, SEA_C[3]); put(im, x + 2, y, SEA_C[2])


def surf(im: Image.Image, rnd: random.Random) -> None:
    sea(im, rnd)
    for y in range(T):  # wet sand on the left, then a band of white foam
        edge = 3 + (1 if (y // 3) % 2 else 0)
        rect(im, 0, y, edge - 1, y, SAND_C[0])
        put(im, edge, y, SEA_C[3]); put(im, edge + 1, y, (236, 244, 240))
        if rnd.random() < 0.5:
            put(im, edge + 2, y, SEA_C[3])


def tea(im: Image.Image, rnd: random.Random) -> None:
    """A clipped tea hedge seen from above: a rounded green row on red-brown hill soil."""
    rect(im, 0, 0, T - 1, T - 1, (138, 92, 62))
    for y in range(1, 15):
        for x in range(T):
            bump = 1 if (x // 3 + y) % 5 == 0 else 0      # leafy, uneven top edge
            if y == 1 and not bump:
                continue
            c = P["f3"] if y < 6 else P["f2"] if y < 11 else P["f1"]
            put(im, x, y, c)
    sprinkle(im, rnd, 18, [P["f4"]], area=(0, 2, T - 1, 6))
    sprinkle(im, rnd, 10, [P["f1"]], area=(0, 7, T - 1, 12))
    rect(im, 0, 14, T - 1, 15, (84, 56, 38))            # shadow under the hedge


def bridge(im: Image.Image) -> None:
    """Planks running across a north-south bridge deck."""
    for y in range(T):
        c = P["k2"] if (y // 4) % 2 else P["k3"]
        rect(im, 0, y, T - 1, y, c)
        if y % 4 == 3:
            rect(im, 0, y, T - 1, y, P["k1"])
    for y in (1, 9):
        put(im, 3, y, P["k0"]); put(im, 12, y + 2, P["k0"])


def cliff(im: Image.Image, rnd: random.Random) -> None:
    """Red basalt rock, as on the coast of Quảng Trị."""
    rect(im, 0, 0, T - 1, T - 1, (150, 70, 52))
    sprinkle(im, rnd, 20, [(120, 52, 40)])
    sprinkle(im, rnd, 10, [(184, 98, 70)])
    for x0 in (2, 9):
        rect(im, x0, 3, x0 + 4, 3, (196, 120, 88))
        rect(im, x0, 4, x0, 9, (98, 42, 34))
    rect(im, 0, T - 1, T - 1, T - 1, (80, 36, 30))


def citadel(im: Image.Image, rnd: random.Random) -> None:
    """Weathered dark brick of the Huế citadel wall, with moss in the joints."""
    rect(im, 0, 0, T - 1, T - 1, (92, 84, 78))
    for row in range(4):
        y = row * 4
        rect(im, 0, y, T - 1, y, (58, 54, 52))
        off = 0 if row % 2 else 4
        for x in range(off, T, 8):
            rect(im, x, y, x, y + 3, (58, 54, 52))
    sprinkle(im, rnd, 14, [(112, 102, 92)])
    sprinkle(im, rnd, 8, [(70, 96, 58), (84, 112, 66)])
    rect(im, 0, 0, T - 1, 1, (130, 120, 108))


def lotus(im: Image.Image, rnd: random.Random) -> None:
    """Still pond water covered with round lotus pads and a pink flower."""
    rect(im, 0, 0, T - 1, T - 1, (52, 96, 110))
    sprinkle(im, rnd, 8, [(40, 80, 96)])
    for cx, cy, r in ((4, 4, 3), (11, 6, 3.4), (6, 12, 2.6), (13, 13, 2.2)):
        for y in range(T):
            for x in range(T):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    put(im, x, y, P["f2"] if x < cx else P["f1"])
        put(im, int(cx), int(cy), P["f0"])
    for x, y, c in ((11, 5, (236, 150, 176)), (12, 5, (250, 196, 210)), (11, 4, (250, 196, 210)), (12, 6, (214, 110, 140))):
        put(im, x, y, c)


def paving(im: Image.Image, rnd: random.Random) -> None:
    """Worn grey-ochre paving stones."""
    rect(im, 0, 0, T - 1, T - 1, (176, 164, 140))
    for y0, x0s in ((0, (0, 9)), (8, (4, 12))):
        rect(im, 0, y0, T - 1, y0, (130, 120, 104))
        for x0 in x0s:
            rect(im, x0, y0, x0, y0 + 7, (130, 120, 104))
    sprinkle(im, rnd, 14, [(196, 184, 160), (158, 146, 124)])


def province_tile(idx: int, rnd: random.Random) -> Image.Image | None:
    """Draws one of the province tiles, or returns None if idx isn't one."""
    if not SAND <= idx <= LAST_PROVINCE_TILE:
        return None
    im = new(T, T)
    if idx in (SAND, SAND2):
        sand(im, rnd, idx == SAND2)
    elif idx == SEA:
        sea(im, rnd)
    elif idx == SURF:
        surf(im, rnd)
    elif idx == TEA:
        tea(im, rnd)
    elif idx == BRIDGE:
        bridge(im)
    elif idx == CLIFF:
        cliff(im, rnd)
    elif idx == CITADEL:
        citadel(im, rnd)
    elif idx == LOTUS:
        lotus(im, rnd)
    elif idx == PAVING:
        paving(im, rnd)
    # ORCHARD stays transparent: the tree is a sprite (chosen per map).
    return im
