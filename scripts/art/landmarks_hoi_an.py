"""Quảng Nam scenery, drawn freehand in code: Hội An's yellow shophouses with
lanterns, the covered Japanese bridge, a lantern boat, Mỹ Sơn's brick towers,
plus two trees used further south: the coconut palm and the flame tree.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow
from .landmarks_hue_danang import roof

WALL, WALL_D, WALL_L = (228, 190, 84), (186, 146, 60), (244, 214, 120)
TILE_ROOF = (128, 70, 52)
WOOD, WOOD_D = (110, 70, 44), (72, 44, 30)
LANTERNS = [(214, 48, 40), (236, 150, 40), (200, 60, 120), (236, 200, 60)]


def lantern(im: Image.Image, x: int, y: int, c) -> None:
    put(im, x, y - 2, (60, 40, 30))
    disc(im, x, y + 1, 2.2, c); put(im, x - 1, y, shade(c, 1.3))
    put(im, x, y + 4, (236, 200, 80))


def hoian_house(variant: int) -> Image.Image:
    """A two-storey ochre shophouse: tile roof, wooden shutters, lanterns under the eaves."""
    rnd = random.Random(70 + variant)
    im = new(64, 64)
    soft_shadow(im, 32, 61, 30, 3)
    wall = WALL if variant == 0 else (222, 176, 76)
    rect(im, 3, 24, 60, 61, wall); rect(im, 3, 24, 5, 61, WALL_L); rect(im, 58, 24, 60, 61, WALL_D)
    sprinkle_stain = [(rnd.randint(6, 56), rnd.randint(26, 58)) for _ in range(18)]
    for x, y in sprinkle_stain:  # weathered patches on the old plaster
        put(im, x, y, WALL_D)
    rect(im, 3, 40, 60, 42, TILE_ROOF)                           # small eave between the storeys
    rect(im, 24, 46, 39, 61, WOOD); rect(im, 31, 46, 32, 61, WOOD_D)  # shop doors
    for x in (8, 46):
        rect(im, x, 47, x + 9, 56, WOOD_D); rect(im, x + 1, 48, x + 8, 55, WOOD)
    for x in (10, 26, 42):
        rect(im, x, 28, x + 11, 36, WOOD_D); rect(im, x + 1, 29, x + 10, 35, (150, 100, 60))
    roof(im, 2, 61, 6, 18, TILE_ROOF, (96, 50, 38))
    for i, x in enumerate((8, 20, 32, 44, 56)):
        lantern(im, x, 26, LANTERNS[(i + variant) % len(LANTERNS)])
    outline(im, 0.45)
    return im


def japanese_bridge() -> Image.Image:
    """Chùa Cầu: a covered wooden bridge with a small shrine roof, crossing a canal east-west."""
    im = new(64, 48)
    rect(im, 0, 30, 63, 47, (150, 96, 60))
    for x in range(0, 64, 4):
        rect(im, x, 30, x, 47, (120, 74, 46))
    rect(im, 0, 30, 63, 31, (196, 140, 84))
    for x in (2, 20, 42, 60):  # posts at the front
        rect(im, x, 18, x + 1, 30, (150, 40, 34))
    rect(im, 0, 26, 63, 27, (200, 150, 70))                      # lattice rail
    for x in range(1, 63, 3):
        put(im, x, 28, (120, 74, 46))
    roof(im, 1, 62, 4, 14, TILE_ROOF, (96, 50, 38))
    rect(im, 28, 0, 35, 4, (214, 172, 70))                       # shrine on the ridge
    outline(im, 0.45)
    return im


def lantern_boat() -> Image.Image:
    """A little sampan strung with lanterns, as on the Hoài river at night."""
    im = new(48, 24)
    for y in range(13, 21):
        half = 22 - (y - 13) * 2
        rect(im, 24 - half, y, 23 + half, y, WOOD if y < 17 else WOOD_D)
    rect(im, 14, 6, 33, 12, (90, 62, 40)); rect(im, 12, 5, 35, 6, (60, 42, 30))   # woven canopy
    for i, x in enumerate((6, 14, 24, 34, 42)):
        lantern(im, x, 8 if 12 < x < 36 else 10, LANTERNS[i % len(LANTERNS)])
    outline(im, 0.45)
    return im


def cham_tower(variant: int) -> Image.Image:
    """A Mỹ Sơn red-brick Cham tower with a stepped top and carved pilasters."""
    rnd = random.Random(80 + variant)
    im = new(48, 80)
    soft_shadow(im, 24, 77, 20, 3)
    brick, brick_d, brick_l = (168, 86, 58), (120, 58, 42), (196, 116, 80)
    rect(im, 8, 30, 39, 77, brick); rect(im, 8, 30, 10, 77, brick_l); rect(im, 37, 30, 39, 77, brick_d)
    for x in (13, 23, 33):
        rect(im, x, 34, x + 1, 74, brick_d)
    for y in range(36, 76, 5):
        rect(im, 8, y, 39, y, brick_d)
    rect(im, 19, 54, 28, 77, (50, 34, 30)); disc(im, 23.5, 54, 4.5, (50, 34, 30))   # doorway
    y, half = 30, 18
    for _ in range(3 + variant):  # stepped, shrinking upper storeys
        rect(im, 24 - half, y - 8, 23 + half, y - 1, brick)
        rect(im, 24 - half, y - 8, 23 + half, y - 8, brick_l)
        y -= 8; half -= 4
    disc(im, 24, y - 2, 3, brick_l)
    for _ in range(14):  # moss and missing bricks: these towers are ruins
        x, yy = rnd.randint(9, 38), rnd.randint(20, 74)
        put(im, x, yy, (88, 120, 66) if yy % 2 else brick_d)
    outline(im, 0.45)
    return im


def coconut() -> Image.Image:
    """A leaning coconut palm with drooping fronds and a cluster of nuts."""
    im = new(48, 64)
    soft_shadow(im, 26, 60, 9, 2.5, alpha=75)
    for y in range(16, 61):
        x = 26 - round(6 * ((60 - y) / 44) ** 1.6)
        put(im, x, y, (156, 128, 92)); put(im, x + 1, y, (122, 98, 70)); put(im, x - 1, y, (176, 150, 110))
        if y % 3 == 0:
            put(im, x, y, (120, 96, 68))
    cx, cy = 20, 15
    for ang in range(-180, 181, 36):
        a = math.radians(ang)
        for t in range(17):
            x = cx + math.cos(a) * t
            y = cy + math.sin(a) * t * 0.55 + t * t / 26
            put(im, round(x), round(y), (86, 140, 62))
            if t > 2 and t % 2 == 0:
                put(im, round(x), round(y) + 1, (60, 108, 50))
    for dx, dy in ((-2, 2), (1, 3), (3, 1)):
        disc(im, cx + dx, cy + dy, 1.8, (120, 110, 50))
    outline(im, 0.5)
    return im


def flame_tree() -> Image.Image:
    """Phượng vĩ: a wide umbrella crown of fine leaves covered in red-orange blossom."""
    rnd = random.Random(67)
    im = new(48, 64)
    soft_shadow(im, 24, 60, 17, 4, alpha=75)
    rect(im, 22, 30, 25, 60, P["k1"]); rect(im, 22, 30, 22, 60, P["k2"])
    for x0, x1 in ((24, 10), (24, 38)):  # spreading branches
        for t in range(10):
            put(im, round(x0 + (x1 - x0) * t / 10), 31 - t, P["k1"])
    for cx, cy, r in ((24, 20, 13), (11, 24, 9), (37, 24, 9), (24, 12, 9)):
        disc(im, cx, cy, r, (62, 112, 54), squash=0.7); disc(im, cx - 1, cy - 2, r - 3, (84, 136, 62), squash=0.7)
    for _ in range(70):
        x, y = rnd.randint(4, 44), rnd.randint(6, 32)
        if im.getpixel((x, y))[3]:
            put(im, x, y, rnd.choice([(214, 58, 40), (236, 100, 48), (190, 40, 34)]))
    outline(im, 0.5)
    return im


def make_hoi_an_art() -> list[dict]:
    files = []
    sprites = [("prop_hoian_house_a", lambda: hoian_house(0), "props/hoian_house_a.png"),
               ("prop_hoian_house_b", lambda: hoian_house(1), "props/hoian_house_b.png"),
               ("prop_japanese_bridge", japanese_bridge, "props/japanese_bridge.png"),
               ("prop_lantern_boat", lantern_boat, "props/lantern_boat.png"),
               ("prop_cham_tower_a", lambda: cham_tower(0), "props/cham_tower_a.png"),
               ("prop_cham_tower_b", lambda: cham_tower(1), "props/cham_tower_b.png"),
               ("tree_coconut", coconut, "trees/coconut.png"),
               ("tree_flame", flame_tree, "trees/flame.png")]
    for key, draw, rel in sprites:
        save(draw(), f"sprites/{rel}")
        files.append({"type": "image", "key": key, "url": f"sprites/{rel}"})
    files.append({"type": "image", "key": "prop_coconut", "url": "sprites/trees/coconut.png"})  # beach palms are props
    return files
