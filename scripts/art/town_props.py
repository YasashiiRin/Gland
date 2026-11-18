"""Graphics step 3, smaller town pieces (same 3/4 view and ink line style as
town_buildings.py): market stalls under big straw umbrellas (fruit,
vegetables, fish, flowers), a three-gate pagoda entrance (tam quan), a
thatched ferry shelter, a park bench and a street lamp.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow
from .town_buildings import STAR, tile_roof

STRAW, STRAW_D = (232, 200, 120), (184, 146, 80)
GOODS = {
    "fruit": [(232, 120, 50), (246, 206, 70), (210, 60, 50), (140, 190, 70)],
    "veg": [(96, 170, 70), (60, 136, 60), (170, 210, 100), (236, 140, 60)],
    "fish": [(196, 210, 220), (160, 176, 190), (230, 236, 240), (120, 150, 170)],
    "flower": [(236, 92, 120), (250, 214, 92), (246, 246, 236), (190, 120, 214)],
}


def umbrella_stall(kind: str) -> Image.Image:
    """A wooden table heaped with goods in round baskets, under a wide straw umbrella."""
    rnd = random.Random(sum(map(ord, kind)))
    pal = GOODS[kind]
    im = new(48, 48)
    soft_shadow(im, 24, 45, 21, 3)
    rect(im, 23, 10, 24, 40, (120, 84, 50))                              # pole
    rect(im, 5, 30, 42, 34, (170, 116, 70)); rect(im, 5, 30, 42, 30, (206, 150, 96))   # table top
    rect(im, 5, 35, 42, 36, (120, 80, 48))
    for x in (6, 40):
        rect(im, x, 35, x + 1, 43, (110, 74, 44))
    for cx in (11, 22, 33):                                               # baskets of goods
        disc(im, cx, 31, 4.5, (176, 130, 70), squash=0.6); disc(im, cx, 30, 3.5, (206, 160, 96), squash=0.6)
        for _ in range(9):
            x, y = cx + rnd.randint(-3, 3), 29 + rnd.randint(-2, 1)
            c = rnd.choice(pal)
            put(im, x, y, c); put(im, x, y - 1, shade(c, 1.25))
    for cx in (8, 38):                                                    # a basket on the ground
        disc(im, cx, 42, 3.5, (176, 130, 70), squash=0.6)
        for dx in (-1, 0, 1):
            put(im, cx + dx, 41, pal[(dx + 1) % len(pal)])
    for y in range(4, 22):                                                # the umbrella
        half = 2 + (y - 4) * 1.25
        for x in range(round(24 - half), round(24 + half)):
            spoke = int(math.degrees(math.atan2(y - 3, x - 24 + 0.01))) % 20 < 3
            put(im, x, y, STRAW_D if spoke else (STRAW if y % 4 else shade(STRAW, 1.12)))
    rect(im, 2, 22, 45, 22, STRAW_D)
    for x in range(3, 45, 4):
        put(im, x, 23, STRAW_D)
    outline(im)
    return im


def pagoda_gate() -> Image.Image:
    """Tam quan: a red three-opening gate with two tiers of curled roofs and a gold name board."""
    im = new(80, 80)
    soft_shadow(im, 40, 77, 38, 3)
    red, red_d = (184, 52, 40), (126, 34, 28)
    rect(im, 4, 44, 75, 76, (232, 214, 176))                              # plastered piers
    for x0, x1 in ((12, 25), (32, 47), (54, 67)):                         # openings
        rect(im, x0, 52, x1, 76, (60, 40, 32))
        rect(im, x0, 52, x1, 53, (40, 26, 22))
    for x in (8, 28, 50, 70):                                             # red columns
        rect(im, x, 46, x + 2, 76, red); rect(im, x + 2, 46, x + 2, 76, red_d)
    tile_roof(im, 2, 77, 32, 10, (150, 70, 52))
    for x in (1, 78):                                                     # curled eave tips
        put(im, x, 30, (150, 70, 52)); put(im, x, 29, (200, 110, 70))
    rect(im, 20, 22, 59, 31, (232, 214, 176))
    rect(im, 26, 24, 53, 29, (196, 150, 50)); rect(im, 27, 25, 52, 28, (240, 200, 80))
    for x in range(29, 51, 3):
        put(im, x, 26, (140, 60, 30))
    tile_roof(im, 14, 65, 10, 10, (150, 70, 52))
    put(im, 40, 8, STAR); put(im, 39, 9, STAR); put(im, 41, 9, STAR)    # pearl on the ridge
    outline(im)
    return im


def ferry_shelter() -> Image.Image:
    """Bến phà: a thatched waiting shelter on four posts with a bench."""
    im = new(48, 48)
    soft_shadow(im, 24, 45, 21, 3)
    for x in (6, 40):
        rect(im, x, 18, x + 1, 44, (120, 84, 50))
    rect(im, 10, 36, 37, 38, (170, 116, 70)); rect(im, 12, 39, 13, 43, (110, 74, 44)); rect(im, 34, 39, 35, 43, (110, 74, 44))
    for y in range(4, 20):
        half = 12 + (y - 4) * 0.8
        rect(im, round(24 - half), y, round(23 + half), y, STRAW if y % 3 else STRAW_D)
    for x in range(10, 40, 3):
        put(im, x, 20, STRAW_D)
    outline(im)
    return im


def bench() -> Image.Image:
    im = new(32, 16)
    soft_shadow(im, 16, 14, 13, 2)
    rect(im, 3, 6, 28, 9, (196, 190, 178)); rect(im, 3, 6, 28, 6, (230, 226, 216))
    rect(im, 5, 10, 7, 13, (140, 134, 126)); rect(im, 24, 10, 26, 13, (140, 134, 126))
    outline(im)
    return im


def street_lamp() -> Image.Image:
    im = new(16, 40)
    soft_shadow(im, 8, 38, 4, 1.5)
    rect(im, 7, 10, 8, 38, (60, 66, 74)); rect(im, 5, 36, 10, 38, (60, 66, 74))
    rect(im, 4, 4, 11, 10, (60, 66, 74)); rect(im, 5, 5, 10, 9, (250, 228, 150)); rect(im, 5, 5, 6, 9, (255, 246, 210))
    rect(im, 3, 3, 12, 3, (60, 66, 74))
    outline(im)
    return im


def make_town_props() -> list[dict]:
    files = []
    sprites = [(f"umbrella_{k}", lambda k=k: umbrella_stall(k)) for k in GOODS]
    sprites += [("pagoda_gate", pagoda_gate), ("ferry_shelter", ferry_shelter), ("bench", bench)]  # street_lamp: old_village.py
    for key, draw in sprites:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
