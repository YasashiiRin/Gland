"""Landmark sprites for Phong Nha, Quảng Trị, Huế, Thanh Hóa and Nghệ An, drawn
freehand in code (simplified, not traced): limestone karst towers and the
Phong Nha cave mouth, the Quảng Trị citadel memorial, a Nguyễn royal tomb,
the Hồ dynasty citadel gate, the Trống Mái rocks, a Thái stilt house, a
thatched village house and a river sampan.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow
from .landmarks_hue_danang import GOLD, GOLD_D, STONE, STONE_D, STONE_L, roof

KARST, KARST_D, KARST_L = (120, 128, 112), (86, 92, 82), (160, 166, 148)
JUNGLE, JUNGLE_D, JUNGLE_L = (58, 104, 56), (40, 78, 44), (96, 140, 72)
THATCH, THATCH_D = (196, 164, 96), (150, 120, 64)


def karst_peak(seed: int) -> Image.Image:
    """A steep limestone tower draped in jungle, as around Phong Nha – Kẻ Bàng."""
    rnd = random.Random(seed)
    im = new(64, 96)
    soft_shadow(im, 32, 92, 28, 4, alpha=70)
    for x in range(64):
        top = 8 + abs(x - 32) ** 1.55 * 0.32 + rnd.random() * 2
        for y in range(int(top), 92):
            put(im, x, y, KARST_L if x < 26 else KARST if x < 44 else KARST_D)
    for _ in range(70):  # jungle clinging to ledges
        x, y = rnd.randint(4, 59), rnd.randint(10, 88)
        if im.getpixel((x, y))[3]:
            disc(im, x, y, rnd.choice((2, 2.5, 3)), JUNGLE_D); put(im, x - 1, y - 1, JUNGLE_L)
    for _ in range(10):  # rain streaks on the rock
        x = rnd.randint(14, 50)
        for y in range(rnd.randint(20, 50), rnd.randint(55, 85)):
            if im.getpixel((x, y))[3] and im.getpixel((x, y))[:3] != JUNGLE_D:
                put(im, x, y, KARST_D)
    outline(im, 0.5)
    return im


def phong_nha_cave() -> Image.Image:
    """The cave mouth at the foot of a karst wall, the river flowing in under hanging stalactites."""
    rnd = random.Random(83)
    im = new(128, 96)
    for x in range(128):
        top = 4 + abs(x - 64) * 0.22 + rnd.random() * 3
        for y in range(int(top), 96):
            put(im, x, y, KARST_L if x < 50 else KARST if x < 90 else KARST_D)
    for y in range(40, 96):  # the dark arch
        half = int(math.sqrt(max(0, 1 - ((96 - y) / 58) ** 2)) * 34)
        rect(im, 64 - half, y, 63 + half, y, (24, 22, 26))
    for x in range(34, 96, 5):  # stalactites hanging in the mouth
        ln = rnd.randint(4, 12)
        for k in range(ln):
            put(im, x, 44 + k, KARST if k < ln - 2 else KARST_L)
    for _ in range(90):
        x, y = rnd.randint(2, 125), rnd.randint(6, 92)
        c = im.getpixel((x, y))
        if c[3] and c[:3] != (24, 22, 26):
            disc(im, x, y, rnd.choice((2, 3)), JUNGLE_D); put(im, x - 1, y - 1, JUNGLE_L)
    outline(im, 0.5)
    return im


def memorial() -> Image.Image:
    """A white memorial tower like the one in the Quảng Trị citadel."""
    im = new(48, 96)
    soft_shadow(im, 24, 93, 20, 3)
    rect(im, 2, 84, 45, 93, STONE_L); rect(im, 8, 78, 39, 84, (214, 210, 200))
    white, white_d = (240, 238, 230), (198, 196, 188)
    for y in range(14, 78):
        half = 5 + (y - 14) // 13          # tapers toward the top
        rect(im, 24 - half, y, 23 + half, y, white)
        rect(im, 22 + half, y, 23 + half, y, white_d)
    rect(im, 18, 8, 29, 14, white); rect(im, 22, 2, 25, 8, white_d)
    disc(im, 24, 46, 3, (196, 60, 48))  # a red emblem
    outline(im, 0.45)
    return im


def royal_tomb() -> Image.Image:
    """A Nguyễn emperor's tomb: a stele pavilion on a terrace with stone guardians."""
    im = new(96, 80)
    soft_shadow(im, 48, 77, 46, 3)
    rect(im, 0, 58, 95, 77, STONE); rect(im, 0, 58, 95, 60, STONE_L)
    for y in range(62, 78, 4):
        rect(im, 30, y, 65, y + 1, STONE_D)                     # steps
    rect(im, 22, 30, 73, 57, (206, 196, 172)); rect(im, 22, 30, 24, 57, (230, 222, 200))
    rect(im, 40, 38, 55, 57, (60, 56, 52)); rect(im, 44, 34, 51, 48, (236, 230, 214))  # stele
    roof(im, 16, 79, 16, 14, (120, 116, 108), (84, 80, 76))
    rect(im, 44, 10, 51, 16, GOLD); put(im, 47, 9, GOLD_D)
    for x in (6, 84):  # stone mandarins
        rect(im, x, 44, x + 6, 57, (150, 144, 134)); disc(im, x + 3, 41, 3, (166, 160, 150))
    outline(im, 0.45)
    return im


def ho_gate() -> Image.Image:
    """The south gate of the Hồ dynasty citadel: huge fitted stone blocks, three vaulted passages."""
    rnd = random.Random(89)
    im = new(128, 72)
    soft_shadow(im, 64, 69, 62, 3)
    for y in range(4, 70, 8):  # big blocks, offset each course
        off = 0 if (y // 8) % 2 else 10
        for x in range(-off, 128, 20):
            c = rnd.choice([(150, 156, 136), (138, 146, 126), (162, 166, 146)])
            rect(im, max(0, x), y, min(127, x + 18), y + 6, c)
            rect(im, max(0, x), y + 7, min(127, x + 19), y + 7, (96, 102, 88))
    for cx, half in ((64, 14), (30, 10), (98, 10)):
        for y in range(30, 70):
            dy = max(0, 30 + half - y)
            w = int(math.sqrt(max(0, half * half - dy * dy)))
            rect(im, cx - w, y, cx + w - 1, y, (36, 34, 30))
    for _ in range(30):  # moss on the old stone
        x, y = rnd.randint(0, 127), rnd.randint(4, 30)
        put(im, x, y, (92, 120, 70))
    outline(im, 0.45)
    return im


def trong_mai() -> Image.Image:
    """Hòn Trống Mái at Sầm Sơn: two rounded rocks leaning together like a pair of birds."""
    im = new(56, 56)
    soft_shadow(im, 28, 53, 24, 3)
    disc(im, 28, 44, 14, (120, 116, 108), squash=0.6)                 # base rock
    disc(im, 20, 22, 9, (150, 146, 136), squash=1.3); disc(im, 18, 19, 5, (176, 172, 160))
    disc(im, 36, 26, 8, (134, 130, 122), squash=1.2); disc(im, 34, 23, 4, (164, 160, 150))
    outline(im, 0.45)
    return im


def stilt_house() -> Image.Image:
    """A Thái stilt house (nhà sàn) of Pù Luông: wooden floor on posts, steep thatched roof."""
    im = new(80, 72)
    soft_shadow(im, 40, 69, 36, 3)
    for x in (8, 26, 52, 70):
        rect(im, x, 44, x + 2, 69, P["k1"])
    rect(im, 4, 40, 75, 44, P["k2"]); rect(im, 4, 40, 75, 40, P["k3"])
    rect(im, 8, 26, 71, 39, (150, 104, 66))
    for x in range(10, 70, 4):
        put(im, x, 30, (120, 82, 52)); put(im, x + 1, 34, (120, 82, 52))
    rect(im, 34, 28, 45, 39, (90, 60, 40))
    for i, y in enumerate(range(54, 70, 3)):  # ladder
        rect(im, 30, y, 37, y, P["k2"])
    roof(im, 0, 79, 2, 24, THATCH, THATCH_D)
    outline(im, 0.45)
    return im


def thatched_house() -> Image.Image:
    """A Nghệ An village house with a thick thatched roof and bamboo walls (as at Kim Liên)."""
    im = new(80, 64)
    soft_shadow(im, 40, 61, 38, 3)
    rect(im, 6, 30, 73, 61, (176, 146, 96))
    for x in range(6, 74, 3):
        rect(im, x, 30, x, 61, (150, 120, 76))
    for x in (12, 60):
        rect(im, x, 38, x + 8, 50, (96, 68, 44))
    rect(im, 32, 40, 47, 61, (86, 60, 40))
    for y in range(4, 32):
        inset = (31 - y) // 2
        rect(im, 1 + inset, y, 78 - inset, y, THATCH if (y + inset) % 4 else THATCH_D)
    rect(im, 12, 4, 67, 5, shade(THATCH, 0.8))
    outline(im, 0.45)
    return im


def sampan() -> Image.Image:
    """A small river sampan with a curved woven canopy."""
    im = new(48, 24)
    for y in range(13, 21):
        half = 22 - (y - 13) * 2
        rect(im, 24 - half, y, 23 + half, y, P["k2"] if y < 17 else P["k1"])
    for x in range(14, 34):
        h = int(5 * math.sin(math.pi * (x - 14) / 20))
        rect(im, x, 12 - h, x, 12, (110, 84, 52) if x % 3 else (90, 66, 40))
    outline(im, 0.45)
    return im


def make_north_landmarks() -> list[dict]:
    files = []
    sprites = [("karst_a", lambda: karst_peak(91)), ("karst_b", lambda: karst_peak(92)),
               ("phong_nha_cave", phong_nha_cave), ("memorial", memorial), ("royal_tomb", royal_tomb),
               ("ho_gate", ho_gate), ("trong_mai", trong_mai), ("stilt_house", stilt_house),
               ("thatched_house", thatched_house), ("sampan", sampan)]
    for key, draw in sprites:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
