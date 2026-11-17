"""More Quảng Bình landmarks for the Đồng Hới and Phong Nha – Kẻ Bàng close-ups,
drawn freehand in code (simplified, not traced): Đồng Hới railway station, the
carved stone entrance of Thiên Đường (Paradise) cave with its wooden stairway,
a wooden signpost, a thatched beach parasol, a scenic lookout platform and the
Tam Lu waterfall.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow
from .landmarks_hue_danang import roof

TILE_ROOF = (176, 84, 56)
CREAM = (238, 214, 150)
THATCH = (206, 170, 100)


def station() -> Image.Image:
    """Ga Đồng Hới: a long cream station hall with a tiled roof, a clock gable and a platform canopy."""
    im = new(112, 72)
    soft_shadow(im, 56, 69, 54, 3)
    rect(im, 4, 34, 107, 66, CREAM); rect(im, 4, 34, 6, 66, shade(CREAM, 1.15))
    rect(im, 4, 64, 107, 66, (170, 150, 110))
    for x in range(10, 104, 12):  # tall green-shuttered windows
        if 46 <= x <= 58:
            continue
        rect(im, x, 42, x + 5, 56, (70, 120, 90)); rect(im, x + 1, 43, x + 4, 55, (120, 176, 200))
    rect(im, 48, 44, 63, 66, (110, 70, 44)); rect(im, 50, 46, 61, 66, (80, 50, 32))   # main door
    roof(im, 0, 111, 18, 16, TILE_ROOF)
    rect(im, 42, 10, 69, 34, CREAM); roof(im, 40, 71, 2, 10, TILE_ROOF)               # clock gable
    disc(im, 55, 23, 5, (246, 244, 236)); disc(im, 55, 23, 5.5, (60, 50, 40), squash=1)
    disc(im, 55, 23, 4.5, (246, 244, 236))
    rect(im, 55, 19, 55, 23, (40, 34, 30)); rect(im, 55, 23, 58, 23, (40, 34, 30))
    rect(im, 36, 36, 75, 39, (200, 60, 48))                                           # name board
    for x in range(40, 72, 3):
        put(im, x, 37, (250, 230, 160))
    outline(im, 0.45)
    return im


def paradise_cave() -> Image.Image:
    """Động Thiên Đường: a dark cave mouth in a mossy limestone cliff, framed by a carved
    wooden gateway, with a wooden stairway coming down from it."""
    rnd = random.Random(141)
    im = new(80, 96)
    rock = [(96, 102, 96), (124, 130, 118), (152, 156, 140), (182, 184, 166)]
    for y in range(4, 72):  # the cliff, narrowing toward the top
        half = 20 + (y - 4) * 0.28 + 3 * math.sin(y / 5)
        for x in range(int(40 - half), int(40 + half)):
            c = rock[1] if (x + y // 3) % 9 else rock[0]
            if x < 40 - half + 4:
                c = rock[2]
            put(im, x, y, c)
    for _ in range(90):  # moss and hanging plants
        x, y = rnd.randint(14, 66), rnd.randint(4, 70)
        if im.getpixel((x, y))[3]:
            put(im, x, y, rnd.choice([P["f1"], P["f2"], P["f0"]]))
    for y in range(36, 66):  # the arched dark mouth with a warm glow inside
        dy = max(0, 46 - y)
        w = int(math.sqrt(max(0, 144 - dy * dy)))
        rect(im, 40 - w, y, 39 + w, y, (28, 22, 20))
    disc(im, 40, 56, 4, (120, 80, 40)); disc(im, 40, 56, 2, (220, 170, 90))
    wood, wood_d = (150, 96, 56), (98, 60, 36)
    for x in (24, 54):  # carved gate posts and a lintel with an upturned roof
        rect(im, x, 32, x + 3, 66, wood); rect(im, x + 3, 32, x + 3, 66, wood_d)
    rect(im, 22, 28, 59, 33, wood); rect(im, 22, 33, 59, 33, wood_d)
    roof(im, 18, 63, 20, 8, (150, 64, 44))
    rect(im, 34, 29, 47, 31, (232, 196, 110))
    for i, y in enumerate(range(66, 95, 3)):  # the wooden stairway
        x0 = 30 + i
        rect(im, x0, y, x0 + 18, y + 1, wood); rect(im, x0, y + 2, x0 + 18, y + 2, wood_d)
        put(im, x0, y - 2, wood_d); put(im, x0 + 18, y - 2, wood_d)
    outline(im, 0.45)
    return im


def signpost() -> Image.Image:
    """A wooden signpost with two arrow boards."""
    im = new(16, 32)
    soft_shadow(im, 8, 30, 4, 1.5)
    rect(im, 7, 6, 8, 30, P["k1"]); rect(im, 7, 6, 7, 30, P["k2"])
    for y, right in ((7, True), (14, False)):
        x0, x1 = (3, 13) if right else (2, 12)
        rect(im, x0, y, x1, y + 4, P["k3"]); rect(im, x0, y + 4, x1, y + 4, P["k2"])
        tip = x1 + 1 if right else x0 - 1
        rect(im, tip, y + 1, tip, y + 3, P["k3"])
        for x in range(x0 + 2, x1 - 1, 2):
            put(im, x, y + 2, P["k0"])
    outline(im, 0.45)
    return im


def beach_parasol() -> Image.Image:
    """A thatched beach parasol on a bamboo pole, with a deck chair."""
    im = new(32, 32)
    soft_shadow(im, 16, 28, 12, 3, alpha=60)
    rect(im, 15, 10, 16, 29, (160, 120, 70))
    for y in range(3, 13):
        half = (y - 2) * 1.4
        rect(im, round(16 - half), y, round(15 + half), y, THATCH if y % 3 else shade(THATCH, 0.8))
    for x in range(3, 30, 3):
        put(im, x, 13, shade(THATCH, 0.7))
    rect(im, 20, 24, 29, 25, (240, 240, 236)); rect(im, 20, 26, 20, 28, (150, 150, 150)); rect(im, 29, 26, 29, 28, (150, 150, 150))
    outline(im, 0.5)
    return im


def lookout() -> Image.Image:
    """Điểm ngắm cảnh: a small wooden lookout platform with a railing and a fan-palm roof."""
    im = new(40, 40)
    soft_shadow(im, 20, 37, 18, 2.5)
    wood, wood_d = (156, 106, 64), (104, 68, 40)
    for x in (5, 33):
        rect(im, x, 14, x + 2, 37, wood_d)
    rect(im, 3, 28, 36, 31, wood); rect(im, 3, 31, 36, 31, wood_d)
    rect(im, 3, 22, 36, 22, wood)
    for x in range(5, 36, 4):
        rect(im, x, 22, x, 28, wood)
    for y in range(3, 14):
        half = 4 + (y - 3) * 1.6
        rect(im, round(20 - half), y, round(19 + half), y, (120, 150, 70) if y % 3 else (92, 124, 56))
    outline(im, 0.45)
    return im


def waterfall() -> Image.Image:
    """Thác Tam Lu: white water tumbling down a mossy rock face into a round pool."""
    rnd = random.Random(151)
    im = new(64, 80)
    rock = [(92, 96, 92), (122, 126, 116), (150, 152, 138)]
    for y in range(2, 56):
        half = 26 - abs(y - 30) * 0.12
        for x in range(int(32 - half), int(32 + half)):
            put(im, x, y, rock[(x // 5 + y // 7) % 3])
    for _ in range(70):
        x, y = rnd.randint(6, 58), rnd.randint(2, 55)
        if im.getpixel((x, y))[3]:
            put(im, x, y, rnd.choice([P["f0"], P["f1"], P["f2"]]))
    for y in range(4, 62):  # the falls, two streams with foam stripes
        for x0, x1 in ((22, 30), (34, 40)):
            for x in range(x0, x1):
                put(im, x, y, (236, 246, 250) if (x + y // 2) % 4 else (150, 210, 236))
    disc(im, 32, 66, 22, (52, 150, 192), squash=0.45)
    disc(im, 32, 64, 13, (120, 200, 226), squash=0.4)
    for _ in range(24):  # spray
        disc(im, rnd.randint(16, 48), rnd.randint(56, 66), rnd.uniform(1, 2.5), (246, 250, 252, 200))
    outline(im, 0.5)
    return im


def make_qb2_landmarks() -> list[dict]:
    files = []
    for key, draw in [("station", station), ("paradise_cave", paradise_cave), ("signpost", signpost),
                      ("beach_parasol", beach_parasol), ("lookout", lookout), ("waterfall", waterfall)]:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
