"""HD tileset (32x32 tiles, shown at half size in the game: graphics x2).

The most visible ground is redrawn at double resolution with much finer
detail: grass with blade clumps and flowers, dirt paths with pebbles and a
ragged grass fringe, water with ripples, shallows and earthy banks, deep
water, sand, sea, surf and cobblestones. Every other tile is the 16 px tile
scaled up 2x (same look as before) until it gets its own HD drawing.
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, ASSETS, disc, new, outline, put, rect, shade, soft_shadow
from .province_tiles import PAVING, SAND, SAND2, SEA, SEA_C, SAND_C, SURF
from .tiles import BUSH, COLS, DIRT, FLOWERS, GRASS, GRASS2, GRASS3, PATH, PATH_EDGE, ROWS, T, WATER, WATER_EDGE
from .water_tiles import DEEP, DEEP_C, SEA_DEEP, SEA_DEEP_C

S = 32
N, E, Sd, W = 1, 2, 4, 8


# ------------------------------------------------------------------ grass
def grass(im: Image.Image, rnd: random.Random, kind: int) -> None:
    rect(im, 0, 0, S - 1, S - 1, P["g1"])
    for _ in range(26):  # soft darker and lighter patches
        x, y = rnd.randrange(S), rnd.randrange(S)
        c = P["g0"] if rnd.random() < 0.45 else P["g2"]
        for dx, dy in ((0, 0), (1, 0), (0, 1)):
            put(im, (x + dx) % S, (y + dy) % S, c)
    for _ in range(22 if kind != GRASS3 else 30):  # blade clumps: a dark root, a mid blade, a lit tip
        x, y = rnd.randrange(S), rnd.randrange(2, S)
        h = rnd.randint(2, 4) + (2 if kind == GRASS3 else 0)
        lean = rnd.choice((-1, 0, 1))
        put(im, x, y, P["g0"])
        for i in range(1, h):
            put(im, (x + (lean if i > h // 2 else 0)) % S, (y - i) % S, P["g2"] if i < h - 1 else P["g3"])
    if kind == GRASS2:  # clover
        for _ in range(3):
            x, y = rnd.randrange(2, S - 3), rnd.randrange(2, S - 3)
            for dx, dy in ((0, 0), (2, 0), (1, -1), (1, 1)):
                put(im, x + dx, y + dy, P["g3"])
            put(im, x + 1, y, P["g2"])
    if kind == FLOWERS:
        for c in ((246, 240, 226), (250, 214, 92), (236, 130, 160), (190, 150, 230), (246, 240, 226)):
            x, y = rnd.randrange(2, S - 3), rnd.randrange(2, S - 3)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                put(im, x + dx, y + dy, c)
            put(im, x, y, (240, 190, 60))
            put(im, x + 1, y + 2, P["g0"])


def fringe(im: Image.Image, rnd: random.Random, side: int, depth: tuple[int, int] = (3, 6)) -> None:
    """A ragged edge of grass hanging over the tile along `side`, with a dark rim and lit tips."""
    d = rnd.randint(*depth)
    for i in range(S):
        if i % 3 == 0:  # the edge steps every few pixels, so it looks clumpy rather than noisy
            d = rnd.randint(*depth)
        for k in range(d + 1):
            c = P["g1"] if k < d - 1 else P["g0"] if k == d else P["g2"]
            if k == 0 and rnd.random() < 0.3:
                c = P["g2"]
            x, y = {N: (i, k), Sd: (i, S - 1 - k), W: (k, i), E: (S - 1 - k, i)}[side]
            put(im, x, y, c)
        if rnd.random() < 0.25:  # a blade tip poking past the rim
            k = d + 1
            x, y = {N: (i, k), Sd: (i, S - 1 - k), W: (k, i), E: (S - 1 - k, i)}[side]
            put(im, x, y, P["g3"])


# ------------------------------------------------------------------ dirt / paths
def dirt(im: Image.Image, rnd: random.Random, base=None) -> None:
    base = base or P["d2"]
    rect(im, 0, 0, S - 1, S - 1, base)
    for _ in range(40):
        x, y = rnd.randrange(S), rnd.randrange(S)
        put(im, x, y, shade(base, 0.86 if rnd.random() < 0.6 else 1.1))
    for _ in range(5):  # pebbles: shadow, body, highlight
        x, y = rnd.randrange(1, S - 3), rnd.randrange(1, S - 3)
        rect(im, x, y + 1, x + 2, y + 2, P["d0"])
        rect(im, x, y, x + 1, y + 1, P["r2"])
        put(im, x, y, P["r3"])
    for _ in range(2):  # little cracks
        x, y = rnd.randrange(S - 5), rnd.randrange(S)
        for i in range(rnd.randint(3, 5)):
            put(im, x + i, y + (i // 2) % 2, shade(base, 0.78))


def path(mask: int, rnd: random.Random) -> Image.Image:
    im = new(S, S)
    dirt(im, rnd)
    for side in (N, E, Sd, W):
        if mask & side:
            fringe(im, rnd, side)
    return im


# ------------------------------------------------------------------ water
def ripples(im: Image.Image, rnd: random.Random, pal: list, n: int = 5) -> None:
    for _ in range(n):  # short curved wave crests with a bright tip
        x, y = rnd.randrange(S - 6), rnd.randrange(3, S - 2)
        w = rnd.randint(4, 6)
        for i in range(w):
            put(im, x + i, y - (1 if 0 < i < w - 1 else 0), pal[2])
        put(im, x + w // 2, y - 2, pal[3])
        put(im, x + 1, y + 1, pal[0])


def water(mask: int, rnd: random.Random) -> Image.Image:
    im = new(S, S)
    pal = [P["w0"], P["w1"], P["w2"], P["w3"]]
    rect(im, 0, 0, S - 1, S - 1, pal[1])
    for _ in range(18):
        put(im, rnd.randrange(S), rnd.randrange(S), pal[0])
    ripples(im, rnd, pal, 3)
    # Shallows: a lighter band of water along each bank.
    for side in (N, E, Sd, W):
        if not mask & side:
            continue
        for i in range(S):
            for d in range(4):
                if d < 3 or rnd.random() < 0.5:
                    x, y = {N: (i, 10 + d), Sd: (i, S - 8 - d), W: (8 + d, i), E: (S - 9 - d, i)}[side]
                    put(im, x, y, pal[2])
    if mask & N:  # we look at the bank face: grass lip, earth, a dark wet line, a foam glint
        rect(im, 0, 0, S - 1, 9, P["d1"])
        for x in range(S):
            put(im, x, 7, P["d0"]); put(im, x, 8, P["s0"]); put(im, x, 9, pal[0])
            if rnd.random() < 0.3:
                put(im, x, 10, pal[3])
            if rnd.random() < 0.15:
                put(im, x, 5, P["d2"])
        fringe(im, rnd, N, (3, 5))
    if mask & Sd:  # only the near bank top shows
        for x in range(S):
            put(im, x, S - 6, pal[3] if rnd.random() < 0.4 else pal[2])
            put(im, x, S - 5, P["s0"])
        fringe(im, rnd, Sd, (3, 4))
    for side in (W, E):
        if not mask & side:
            continue
        for y in range(S):
            for k in range(7):
                x = k if side == W else S - 1 - k
                put(im, x, y, P["d1"] if k < 5 else P["s0"] if k == 5 else pal[0])
        fringe(im, rnd, side, (3, 4))
    return im


def deep(rnd: random.Random, pal: list) -> Image.Image:
    im = new(S, S)
    rect(im, 0, 0, S - 1, S - 1, pal[1])
    for _ in range(30):
        put(im, rnd.randrange(S), rnd.randrange(S), pal[0])
    ripples(im, rnd, pal, 2)
    return im


# ------------------------------------------------------------------ coast and town
def sand(rnd: random.Random, shells: bool) -> Image.Image:
    im = new(S, S)
    rect(im, 0, 0, S - 1, S - 1, SAND_C[1])
    for _ in range(70):
        put(im, rnd.randrange(S), rnd.randrange(S), rnd.choice([SAND_C[0], SAND_C[2], SAND_C[2]]))
    for _ in range(3):  # wind ripples
        x, y = rnd.randrange(S - 8), rnd.randrange(2, S - 2)
        for i in range(rnd.randint(5, 8)):
            put(im, x + i, y + (1 if i % 4 == 2 else 0), SAND_C[0])
    if shells:
        for x, y in ((8, 10), (22, 21)):
            put(im, x, y, (246, 236, 222)); put(im, x + 1, y, (230, 200, 186)); put(im, x, y + 1, SAND_C[3])
            put(im, x + 1, y + 1, (214, 170, 160))
    return im


def sea(rnd: random.Random, pal: list) -> Image.Image:
    im = new(S, S)
    rect(im, 0, 0, S - 1, S - 1, pal[1])
    for _ in range(26):
        put(im, rnd.randrange(S), rnd.randrange(S), pal[0])
    for _ in range(3):  # curling crests with white tips
        x, y = rnd.randrange(S - 8), rnd.randrange(4, S - 2)
        for i, dy in enumerate((0, -1, -1, -2, -2, -1, 0)):
            put(im, x + i, y + dy, pal[2])
        put(im, x + 3, y - 3, pal[3]); put(im, x + 4, y - 3, (246, 250, 248))
        put(im, x + 2, y + 1, pal[0]); put(im, x + 3, y + 1, pal[0])
    return im


def surf(rnd: random.Random) -> Image.Image:
    im = sea(rnd, SEA_C)
    for y in range(S):  # wet sand, then a band of foam that laps in and out
        edge = 6 + (2 if (y // 6) % 2 else 0) + (1 if (y // 3) % 2 else 0)
        rect(im, 0, y, edge - 1, y, SAND_C[0])
        if y % 5 == 0:
            put(im, edge - 2, y, SAND_C[3])
        put(im, edge, y, SEA_C[3]); put(im, edge + 1, y, (240, 248, 244)); put(im, edge + 2, y, (240, 248, 244))
        if rnd.random() < 0.5:
            put(im, edge + 3, y, SEA_C[3])
    return im


def cobbles(rnd: random.Random) -> Image.Image:
    """Rounded cobblestones in staggered rows, each lit on top and shadowed below."""
    im = new(S, S)
    mortar = (150, 136, 118)
    rect(im, 0, 0, S - 1, S - 1, mortar)
    stones = [(222, 210, 188), (206, 194, 172), (232, 220, 198), (196, 184, 164)]
    for row in range(4):
        y0 = row * 8
        off = 4 if row % 2 else 0
        for col in range(-1, 4):
            x0 = col * 8 + off
            c = rnd.choice(stones)
            for y in range(y0 + 1, y0 + 7):
                for x in range(x0 + 1, x0 + 7):
                    corner = (x in (x0 + 1, x0 + 6)) and (y in (y0 + 1, y0 + 6))
                    if not corner:
                        put(im, x % S, y, c)
            for x in range(x0 + 2, x0 + 6):
                put(im, x % S, y0 + 1, shade(c, 1.12))
                put(im, x % S, y0 + 6, shade(c, 0.8))
            put(im, (x0 + 2) % S, y0 + 2, shade(c, 1.2))
    return im


def bush(rnd: random.Random) -> Image.Image:
    """A round leafy shrub (decor tile), lit from the top-left, with a few tiny blossoms."""
    im = new(S, S)
    soft_shadow(im, 16, 27, 13, 3)
    leaf = [(36, 96, 50), (52, 128, 58), (78, 156, 64), (112, 186, 78), (164, 214, 104)]
    for cx, cy, r in ((9, 19, 7.5), (23, 19, 7.5), (16, 13, 8.5), (16, 21, 8)):
        disc(im, cx, cy, r, leaf[1])
    for cx, cy, r in ((9, 17, 5), (21, 17, 5), (15, 11, 6)):
        disc(im, cx, cy, r, leaf[2])
    for cx, cy, r in ((8, 15, 2.5), (19, 14, 2.5), (13, 8, 3)):
        disc(im, cx, cy, r, leaf[3])
    for _ in range(14):
        put(im, rnd.randint(6, 26), rnd.randint(6, 25), leaf[4] if rnd.random() < 0.5 else leaf[0])
    for x, y in rnd.sample([(8, 20), (22, 13), (16, 23), (25, 21), (11, 12)], 3):
        put(im, x, y, (250, 246, 236)); put(im, x + 1, y, (250, 200, 210)); put(im, x, y + 1, (250, 200, 210))
    outline(im, inner=False)
    return im


# ------------------------------------------------------------------ the sheet
def hd_tile(idx: int, rnd: random.Random) -> Image.Image | None:
    if idx in (GRASS, GRASS2, GRASS3, FLOWERS):
        im = new(S, S)
        grass(im, rnd, idx)
        return im
    if idx == PATH or PATH_EDGE <= idx < PATH_EDGE + 16:
        return path(0 if idx == PATH else idx - PATH_EDGE, rnd)
    if idx == WATER or WATER_EDGE <= idx < WATER_EDGE + 16:
        return water(0 if idx == WATER else idx - WATER_EDGE, rnd)
    if idx == DIRT:
        im = new(S, S)
        dirt(im, rnd, P["d1"])
        return im
    if idx == DEEP:
        return deep(rnd, DEEP_C)
    if idx == SEA_DEEP:
        return deep(rnd, SEA_DEEP_C)
    if idx == SEA:
        return sea(rnd, SEA_C)
    if idx == SURF:
        return surf(rnd)
    if idx in (SAND, SAND2):
        return sand(rnd, idx == SAND2)
    if idx == PAVING:
        return cobbles(rnd)
    if idx == BUSH:
        return bush(rnd)
    return None


def make_tileset_hd(sheet16: Image.Image) -> None:
    """The 32 px tileset: HD drawings where they exist, else each 16 px tile scaled 2x."""
    rnd = random.Random(17)
    sheet = new(COLS * S, ROWS * S)
    for i in range(COLS * ROWS):
        tile = hd_tile(i, rnd)
        if tile is None:
            sx, sy = (i % COLS) * T, (i // COLS) * T
            tile = sheet16.crop((sx, sy, sx + T, sy + T)).resize((S, S), Image.NEAREST)
        sheet.paste(tile, ((i % COLS) * S, (i // COLS) * S))
    out = ASSETS / "tilesets" / "farm_tiles_hd.png"
    sheet.save(out)
