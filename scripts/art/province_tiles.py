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
# 75.. : flooded paddy mud, ripe rice (decor, reapable), stubble after reaping,
# Sa Huỳnh salt pans, Lý Sơn garlic rows (decor).
PADDY, RICE, STUBBLE, SALT, GARLIC = range(75, 80)
# 80.. : biome trees (each always drawn with one species' sprite: pine, bamboo, coconut,
# mangrove), marsh mud, rocky ground, dry grass, reeds (decor, walkable).
PINE_TREE, BAMBOO_TREE, PALM_TREE, MANGROVE_TREE, MARSH, ROCKY, DRY_GRASS, REEDS = range(80, 88)
BIOME_TREES = [PINE_TREE, BAMBOO_TREE, PALM_TREE, MANGROVE_TREE]
LAST_PROVINCE_TILE = REEDS
PROVINCE_COLLIDES = [SEA, SURF, TEA, CLIFF, ORCHARD, CITADEL, LOTUS, *BIOME_TREES]

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
    sprinkle(im, rnd, 5, [SEA_C[2]])
    for _ in range(3):  # curling wave crests with a white tip
        x, y = rnd.randrange(T - 5), rnd.randrange(2, T - 1)
        for i, dy in enumerate((0, -1, -1, -1, 0)):
            put(im, x + i, y + dy, SEA_C[2])
        put(im, x + 1, y - 2, SEA_C[3]); put(im, x + 2, y - 2, SEA_C[3]); put(im, x + 3, y - 1, (240, 248, 246))
        put(im, x + 1, y + 1, SEA_C[0]); put(im, x + 2, y + 1, SEA_C[0])


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
    """Cobblestones: rounded stones of slightly different greys, lit from the top-left, with dark joints."""
    rect(im, 0, 0, T - 1, T - 1, (138, 130, 120))
    stones = [(2, 2, 4, 3), (8, 1, 6, 4), (0, 7, 5, 4), (6, 6, 5, 4), (12, 6, 4, 4), (2, 12, 6, 4), (9, 11, 6, 4)]
    for x, y, w, h in stones:
        base = rnd.choice([(196, 188, 174), (186, 180, 170), (204, 194, 178), (180, 176, 172)])
        for yy in range(y, y + h - 1):
            for xx in range(x, x + w - 1):
                corner = (xx in (x, x + w - 2)) and (yy in (y, y + h - 2))
                if not corner:
                    put(im, xx % T, yy % T, base)
        put(im, (x + 1) % T, y % T, tuple(min(255, c + 30) for c in base))      # highlight
        rect(im, x + 1, y + h - 2, x + w - 3, y + h - 2, tuple(int(c * 0.88) for c in base))


def paddy(im: Image.Image, rnd: random.Random) -> None:
    """Wet field mud with a sheen of water."""
    rect(im, 0, 0, T - 1, T - 1, (104, 92, 62))
    sprinkle(im, rnd, 16, [(88, 78, 52)])
    sprinkle(im, rnd, 10, [(120, 138, 128), (140, 160, 150)])


def rice(im: Image.Image, rnd: random.Random) -> None:
    """Ripe rice: dense golden stalks with heavy, nodding grain heads."""
    for i in range(14):
        x = 1 + i + rnd.choice((-1, 0, 0))
        top = 1 + rnd.randint(0, 4)
        for y in range(top + 2, T):
            put(im, x, y, (150, 156, 70) if y > 11 else (196, 176, 72))
        for k in range(3):  # the drooping head
            put(im, x + (k // 2), top + k, (232, 196, 88) if k < 2 else (204, 160, 60))
        if rnd.random() < 0.5:
            put(im, x - 1, top + 1, (244, 214, 110))
    rect(im, 0, T - 1, T - 1, T - 1, (110, 116, 52))


def stubble(im: Image.Image, rnd: random.Random) -> None:
    """Cut stubble in short rows: the field was reaped."""
    for y in (3, 8, 13):
        for x in range(1, T - 1, 3):
            xx = x + rnd.choice((0, 1))
            put(im, xx, y, (196, 170, 96)); put(im, xx, y + 1, (150, 128, 70))


def salt(im: Image.Image, rnd: random.Random) -> None:
    """A shallow salt pan: white crystals drying on grey-blue clay."""
    rect(im, 0, 0, T - 1, T - 1, (196, 204, 206))
    sprinkle(im, rnd, 40, [(236, 240, 238), (250, 252, 250)])
    sprinkle(im, rnd, 8, [(160, 172, 178)])
    rect(im, 0, 0, T - 1, 0, (140, 128, 104)); rect(im, 0, 0, 0, T - 1, (140, 128, 104))


def garlic(im: Image.Image, rnd: random.Random) -> None:
    """Rows of young garlic leaves on sandy soil (Lý Sơn)."""
    for x in range(2, T, 4):
        for _ in range(4):
            y = rnd.randint(4, 13)
            for d in range(4):
                put(im, x + (d % 2), y - d, P["f3"] if d < 3 else P["f4"])
        put(im, x, 14, (230, 226, 210))


def marsh(im: Image.Image, rnd: random.Random) -> None:
    """Soggy dark mud with puddles."""
    rect(im, 0, 0, T - 1, T - 1, (82, 92, 60))
    sprinkle(im, rnd, 14, [(66, 76, 50)])
    for _ in range(2):
        x, y = rnd.randint(2, 11), rnd.randint(2, 12)
        rect(im, x, y, x + 3, y + 1, (88, 116, 118)); put(im, x + 1, y, (140, 170, 168))


def rocky(im: Image.Image, rnd: random.Random) -> None:
    """Bare stony ground of the mountains."""
    rect(im, 0, 0, T - 1, T - 1, (134, 126, 112))
    sprinkle(im, rnd, 20, [(112, 106, 96), (156, 148, 132)])
    for _ in range(3):
        x, y = rnd.randint(1, 13), rnd.randint(1, 13)
        put(im, x, y, (176, 168, 152)); put(im, x + 1, y, (150, 142, 128)); put(im, x, y + 1, (96, 90, 82))


def dry_grass(im: Image.Image, rnd: random.Random) -> None:
    """Sun-bleached grass of the dry hills and dunes."""
    rect(im, 0, 0, T - 1, T - 1, (168, 156, 92))
    sprinkle(im, rnd, 16, [(144, 132, 76)])
    for _ in range(14):
        x, y = rnd.randrange(T), rnd.randrange(T)
        put(im, x, y, (196, 182, 112)); put(im, x, (y + 1) % T, (130, 120, 70))


def reeds(im: Image.Image, rnd: random.Random) -> None:
    """A clump of reeds with brown seed heads (decor)."""
    for _ in range(9):
        x = rnd.randint(2, 13)
        top = rnd.randint(1, 6)
        for y in range(top, T - 1):
            put(im, x, y, (96, 132, 70) if y > top + 2 else (120, 150, 80))
        put(im, x, top, (130, 96, 60)); put(im, x, top + 1, (130, 96, 60))


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
    elif idx == PADDY:
        paddy(im, rnd)
    elif idx == RICE:
        rice(im, rnd)
    elif idx == STUBBLE:
        stubble(im, rnd)
    elif idx == SALT:
        salt(im, rnd)
    elif idx == GARLIC:
        garlic(im, rnd)
    elif idx == MARSH:
        marsh(im, rnd)
    elif idx == ROCKY:
        rocky(im, rnd)
    elif idx == DRY_GRASS:
        dry_grass(im, rnd)
    elif idx == REEDS:
        reeds(im, rnd)
    # ORCHARD and the biome trees stay transparent: the tree is a sprite (chosen per map).
    return im
