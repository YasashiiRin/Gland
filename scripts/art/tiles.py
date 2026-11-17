"""The 16x16 ground/decor tileset (public/assets/tilesets/farm_tiles.png).

Tile indices are part of the map format and mirrored in src/config/tileGids.ts
(gid = index + 1). Water and path come in 16 "autotile" variants each: the
variant is chosen from which of the 4 neighbours (N=1, E=2, S=4, W=8) are
*not* the same terrain, so banks and grass fringes line up automatically.
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, T, disc, new, outline, put, rect, save, shade, soft_shadow, sprinkle
from .province_tiles import PROVINCE_COLLIDES, province_tile

COLS = 8
ROWS = 10

(GRASS, GRASS2, FLOWERS, PATH, WATER, FENCE, TRUNK, CANOPY,
 ROCK, WALL, ROOF, DOOR, FLOOR, IWALL, BED_TOP, BED_BOTTOM,
 TABLE, RUG, WINDOW, BUSH, SOIL, SIGN, SHOPWALL, EMPTY) = range(24)
WATER_EDGE = 24          # 24..39 = water variant per neighbour mask (24 == plain water)
PATH_EDGE = 40           # 40..55 = path variant per neighbour mask (40 == plain path)
BLOCK, DIRT, WALLPAPER, WAINSCOT, FOREST, FLOOR2, GRASS3, STONE_FLOOR = range(56, 64)

COLLIDES = ([WATER, FENCE, TRUNK, ROCK, WALL, ROOF, IWALL, BED_TOP, BED_BOTTOM, TABLE, WINDOW,
             BUSH, SIGN, SHOPWALL, BLOCK, WALLPAPER, WAINSCOT, FOREST]
            + list(range(WATER_EDGE, WATER_EDGE + 16)) + PROVINCE_COLLIDES)

N, E, S, W = 1, 2, 4, 8


# ------------------------------------------------------------------ ground
def grass(im: Image.Image, rnd: random.Random, blades: int = 26) -> None:
    rect(im, 0, 0, T - 1, T - 1, P["g1"])
    sprinkle(im, rnd, 10, [P["g0"]])
    for _ in range(blades):
        x, y = rnd.randrange(T), rnd.randrange(T)
        put(im, x, y, P["g2"])
        put(im, x, (y + 1) % T, P["g0"])
        if rnd.random() < 0.25:
            put(im, x, (y - 1) % T, P["g3"])


def dirt(im: Image.Image, rnd: random.Random, base=None) -> None:
    rect(im, 0, 0, T - 1, T - 1, base or P["d2"])
    sprinkle(im, rnd, 14, [P["d1"]])
    sprinkle(im, rnd, 6, [P["d3"]])
    for _ in range(2):  # little pebbles
        x, y = rnd.randrange(1, T - 2), rnd.randrange(1, T - 2)
        put(im, x, y, P["r2"]); put(im, x + 1, y, P["r3"]); put(im, x, y + 1, P["d0"]); put(im, x + 1, y + 1, P["d0"])


def grass_fringe(im: Image.Image, rnd: random.Random, side: int, edge_color) -> None:
    """Irregular grass overhang on one side of a non-grass tile, with a dark lip."""
    for i in range(T):
        depth = 2 + (1 if rnd.random() < 0.45 else 0) + (1 if rnd.random() < 0.15 else 0)
        for d in range(depth + 1):
            c = P["g1"] if d < depth else edge_color
            if d < depth and rnd.random() < 0.3:
                c = P["g2"]
            if d == depth - 1 and rnd.random() < 0.4:
                c = P["g3"]
            x, y = {N: (i, d), S: (i, T - 1 - d), W: (d, i), E: (T - 1 - d, i)}[side]
            put(im, x, y, c)


def path_tile(mask: int, rnd: random.Random) -> Image.Image:
    im = new(T, T)
    dirt(im, rnd)
    for side in (N, E, S, W):
        if mask & side:
            grass_fringe(im, rnd, side, P["d0"])
    return im


def water_tile(mask: int, rnd: random.Random) -> Image.Image:
    im = new(T, T)
    rect(im, 0, 0, T - 1, T - 1, P["w1"])
    for _ in range(5):  # soft ripple lines
        x, y = rnd.randrange(T), rnd.randrange(T)
        for d in range(rnd.randint(2, 4)):
            put(im, (x + d) % T, y, P["w2"])
    sprinkle(im, rnd, 3, [P["w3"]])
    sprinkle(im, rnd, 6, [P["w0"]])
    # Banks: grass lip, earthy bank face, then a dark wet line and a foam glint.
    if mask & N:
        rect(im, 0, 0, T - 1, 4, P["d1"])
        for x in range(T):
            put(im, x, 3, P["d0"]); put(im, x, 4, P["s0"]); put(im, x, 5, P["w0"])
            if rnd.random() < 0.3:
                put(im, x, 6, P["w3"])
        grass_fringe(im, rnd, N, P["d2"])
    if mask & S:
        for x in range(T):
            put(im, x, T - 3, P["w3"] if rnd.random() < 0.5 else P["w2"])
        grass_fringe(im, rnd, S, P["d1"])
    for side, xs in ((W, range(0, 4)), (E, range(T - 4, T))):
        if not mask & side:
            continue
        inner = 3 if side == W else T - 4
        for y in range(T):
            for x in xs:
                put(im, x, y, P["d1"])
            put(im, inner, y, P["s0"])
            put(im, inner + (1 if side == W else -1), y, P["w0"])
        grass_fringe(im, rnd, side, P["d1"])
    return im


def soil(im: Image.Image, rnd: random.Random) -> None:
    rect(im, 0, 0, T - 1, T - 1, P["s1"])
    for y in (2, 6, 10, 14):  # furrows: lit ridge above, shadow below
        for x in range(1, T - 1):
            if rnd.random() < 0.88:
                put(im, x, y - 1, P["s2"])
                put(im, x, y + 1, P["s0"])
    sprinkle(im, rnd, 5, [P["s3"]], area=(1, 1, T - 2, T - 2), wrap=False)
    for i in range(T):  # dark rim so each plot reads as a soft raised bed
        for x, y in ((i, 0), (i, T - 1), (0, i), (T - 1, i)):
            put(im, x, y, P["s0"])
    for x, y in ((0, 0), (T - 1, 0), (0, T - 1), (T - 1, T - 1)):
        put(im, x, y, P["g1"])


# ------------------------------------------------------------------ decor (transparent background)
def rock(im: Image.Image, rnd: random.Random) -> None:
    soft_shadow(im, 8, 13, 7, 2.5)
    disc(im, 8, 9, 6, P["r1"], squash=0.8)
    disc(im, 7, 8, 4.5, P["r2"], squash=0.8)
    disc(im, 6, 7, 2.2, P["r3"])
    for x in range(9, 14):
        put(im, x, 12, P["r0"])
    put(im, 9, 8, P["r0"]); put(im, 10, 9, P["r0"]); put(im, 10, 10, P["r1"])
    outline(im, 0.35)


def weed(im: Image.Image, rnd: random.Random) -> None:
    soft_shadow(im, 8, 13, 6, 2)
    blades = [(-5, -6), (-3, -9), (0, -10), (3, -9), (5, -6), (-1, -7), (2, -6)]
    for bx, by in blades:
        steps = max(abs(bx), abs(by))
        for s in range(steps + 1):
            x = 8 + round(bx * s / steps)
            y = 13 + round(by * s / steps)
            put(im, x, y, P["f2"] if s < steps * 0.6 else P["f3"])
        put(im, 8 + bx, 13 + by, P["f4"])
    put(im, 8, 12, P["f1"]); put(im, 7, 12, P["f1"]); put(im, 9, 12, P["f1"])
    outline(im, 0.4)


def fence(im: Image.Image, rnd: random.Random) -> None:
    """Woven bamboo fence: two rails and slanted split-bamboo slats."""
    bam, bam_d, bam_l = (176, 168, 90), (128, 120, 60), (206, 198, 124)
    for y in range(13, 15):
        for x in range(T):
            put(im, x, y, (18, 24, 16, 60))
    for x in range(0, T, 3):
        for y in range(3, 13):
            put(im, x + (y - 3) // 5, y, bam if y > 4 else bam_l)
            put(im, x + 1 + (y - 3) // 5, y, bam_d)
    rect(im, 0, 5, T - 1, 5, bam_l); rect(im, 0, 6, T - 1, 6, bam_d)
    rect(im, 0, 10, T - 1, 10, bam_l); rect(im, 0, 11, T - 1, 11, bam_d)
    outline(im, 0.45)


def sign(im: Image.Image, rnd: random.Random) -> None:
    soft_shadow(im, 8, 14, 4, 1.5)
    rect(im, 7, 8, 8, 14, P["k1"])
    rect(im, 2, 2, 13, 9, P["k2"]); rect(im, 2, 2, 13, 2, P["k3"]); rect(im, 2, 9, 13, 9, P["k1"])
    for y in (4, 6):
        rect(im, 4, y, 11 if y == 4 else 9, y, P["k0"])
    outline(im, 0.4)


# ------------------------------------------------------------------ interior
def wallpaper(im: Image.Image, rnd: random.Random) -> None:
    """Yellow lime-washed plaster wall."""
    base = (222, 186, 110)
    rect(im, 0, 0, T - 1, T - 1, base)
    sprinkle(im, rnd, 10, [shade(base, 0.93)])
    sprinkle(im, rnd, 4, [shade(base, 1.06)])


def terracotta(im: Image.Image, rnd: random.Random, base=(168, 84, 58)) -> None:
    """Square fired-clay floor tiles ("gạch bát") with pale grout."""
    rect(im, 0, 0, T - 1, T - 1, base)
    for i in range(T):
        put(im, i, 0, (196, 170, 140)); put(im, 0, i, (196, 170, 140))
        put(im, i, 8, (196, 170, 140)); put(im, 8, i, (196, 170, 140))
    for x0, y0 in ((1, 1), (9, 1), (1, 9), (9, 9)):
        rect(im, x0, y0, x0 + 6, y0, shade(base, 1.12))
        rect(im, x0 + 6, y0 + 1, x0 + 6, y0 + 6, shade(base, 0.86))
        if rnd.random() < 0.5:
            put(im, x0 + rnd.randint(1, 5), y0 + rnd.randint(2, 5), shade(base, 0.9))


def wainscot(im: Image.Image, rnd: random.Random) -> None:
    rect(im, 0, 0, T - 1, T - 1, P["k2"])
    rect(im, 0, 0, T - 1, 1, P["k3"]); rect(im, 0, 2, T - 1, 2, P["k1"])
    rect(im, 2, 4, 13, 11, shade(P["k2"], 0.9)); rect(im, 2, 4, 13, 4, P["k1"]); rect(im, 2, 11, 13, 11, P["k3"])
    rect(im, 0, 13, T - 1, T - 1, P["k0"])


def iwall(im: Image.Image, rnd: random.Random) -> None:
    rect(im, 0, 0, T - 1, T - 1, (58, 40, 32))
    rect(im, 0, 0, T - 1, 0, (88, 62, 46))
    for y in (5, 10):
        rect(im, 0, y, T - 1, y, (46, 32, 26))


def doormat(im: Image.Image, rnd: random.Random) -> None:
    terracotta(im, rnd)
    rect(im, 2, 3, 13, 13, (128, 70, 56)); rect(im, 3, 4, 12, 12, (156, 94, 70))
    for x in range(3, 13, 2):
        put(im, x, 13, (200, 170, 120))


def tile_img(idx: int, rnd: random.Random) -> Image.Image:
    extra = province_tile(idx, rnd)
    if extra is not None:
        return extra
    im = new(T, T)
    if idx in (GRASS, GRASS2, FLOWERS, GRASS3):
        grass(im, rnd)
        if idx == GRASS2:
            for x, y in ((5, 6), (6, 5), (6, 7), (7, 6)):
                put(im, x, y, P["g3"])
        if idx == FLOWERS:
            for (x, y, c) in [(3, 4, (236, 226, 200)), (11, 3, (222, 196, 98)), (7, 11, (196, 160, 206)), (13, 12, (236, 226, 200))]:
                put(im, x, y, c); put(im, x - 1, y, shade(c, 0.8)); put(im, x, y + 1, P["g0"])
        if idx == GRASS3:
            for bx in (5, 7, 9, 11):
                for d in range(4):
                    put(im, bx + (d // 3), 12 - d, P["g3"] if d == 3 else P["g2"])
    elif idx == PATH:
        return path_tile(0, rnd)
    elif idx == WATER:
        return water_tile(0, rnd)
    elif WATER_EDGE <= idx < WATER_EDGE + 16:
        return water_tile(idx - WATER_EDGE, rnd)
    elif PATH_EDGE <= idx < PATH_EDGE + 16:
        return path_tile(idx - PATH_EDGE, rnd)
    elif idx == SOIL:
        soil(im, rnd)
    elif idx == ROCK:
        rock(im, rnd)
    elif idx == BUSH:
        weed(im, rnd)
    elif idx == FENCE:
        fence(im, rnd)
    elif idx == SIGN:
        sign(im, rnd)
    elif idx in (FLOOR, FLOOR2, TABLE, BED_TOP, BED_BOTTOM, RUG):
        terracotta(im, rnd, (168, 84, 58) if idx != FLOOR2 else (158, 78, 54))
    elif idx == DOOR:
        doormat(im, rnd)
    elif idx == IWALL:
        iwall(im, rnd)
    elif idx == WALLPAPER:
        wallpaper(im, rnd)
    elif idx == WAINSCOT:
        wainscot(im, rnd)
    elif idx == DIRT:
        dirt(im, rnd, P["d1"])
    elif idx == STONE_FLOOR:
        rect(im, 0, 0, T - 1, T - 1, P["r2"])
        for y in (0, 8):
            rect(im, 0, y, T - 1, y, P["r1"])
            put(im, (y // 8) * 8 + 3, y + 4, P["r1"])
        for x0 in (0, 8):
            rect(im, x0, 0, x0, 7, P["r1"]); rect(im, x0 + 4, 8, x0 + 4, T - 1, P["r1"])
    elif idx in (WALL, SHOPWALL, WINDOW, ROOF):
        # Legacy building tiles (buildings are sprites now); kept so old maps still render.
        rect(im, 0, 0, T - 1, T - 1, (174, 120, 80) if idx != ROOF else (130, 60, 50))
        rect(im, 0, T - 1, T - 1, T - 1, P["k0"])
    # TRUNK, CANOPY, FOREST, BLOCK, EMPTY stay transparent: trees are sprites,
    # BLOCK is an invisible collider under building/furniture sprites.
    return im


def make_tileset() -> None:
    rnd = random.Random(7)
    sheet = new(COLS * T, ROWS * T)
    for i in range(COLS * ROWS):
        sheet.paste(tile_img(i, rnd), ((i % COLS) * T, (i // COLS) * T))
    save(sheet, "tilesets/farm_tiles.png")
