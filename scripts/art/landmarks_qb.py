"""Quảng Bình and Huế landmarks for the big maps, drawn freehand in code
(simplified, not traced): the Quảng Bình Quan gate, the Nhật Lệ cable-stayed
bridge, a water buffalo, the steaming Bang hot spring, General Võ Nguyên
Giáp's childhood home, a racing boat for the Kiến Giang boat festival and a
conical-hat (nón lá) stall.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, soft_shadow
from .landmarks_hue_danang import RED, RED_D, STONE, STONE_D, STONE_L, roof

TILE_ROOF = (128, 70, 52)


def quang_binh_quan() -> Image.Image:
    """Quảng Bình Quan: a brick gateway with one arched passage and a small two-tier tower on top."""
    im = new(80, 80)
    soft_shadow(im, 40, 77, 38, 3)
    rect(im, 4, 40, 75, 77, STONE); rect(im, 4, 40, 75, 42, STONE_L)
    for y in range(46, 78, 5):
        rect(im, 4, y, 75, y, STONE_D)
    for y in range(52, 78):  # the arch
        dy = max(0, 52 + 10 - y)
        w = int(math.sqrt(max(0, 100 - dy * dy)))
        rect(im, 40 - w, y, 39 + w, y, (40, 32, 30))
    rect(im, 22, 22, 57, 40, (196, 160, 110))
    for x in (24, 38, 52):
        rect(im, x, 26, x + 3, 40, RED)
    roof(im, 14, 65, 14, 9, TILE_ROOF, (96, 50, 38))
    roof(im, 24, 55, 4, 8, TILE_ROOF, (96, 50, 38))
    rect(im, 26, 30, 53, 34, (240, 220, 160))                   # name board
    outline(im, 0.45)
    return im


def cable_bridge() -> Image.Image:
    """The Nhật Lệ bridge: a white deck running east-west, held by fans of cables from two pylons."""
    im = new(160, 72)
    deck_y = 56
    rect(im, 0, deck_y, 159, deck_y + 12, (150, 150, 156)); rect(im, 0, deck_y, 159, deck_y + 1, (220, 220, 226))
    for x in range(0, 160, 6):
        put(im, x, deck_y + 6, (236, 236, 236))                    # lane marks
    rect(im, 0, deck_y + 13, 159, deck_y + 15, (110, 110, 118))
    for px in (48, 112):
        rect(im, px - 2, 4, px + 2, deck_y + 12, (236, 236, 240)); rect(im, px + 1, 4, px + 2, deck_y + 12, (190, 190, 198))
        for k in range(1, 7):  # cables fanning down to the deck
            for side in (-1, 1):
                x1 = px + side * k * 7
                steps = deck_y - 8
                for i in range(steps):
                    t = i / steps
                    put(im, round(px + (x1 - px) * t), round(8 + k * 2 + (deck_y - 8 - k * 2) * t), (210, 214, 220))
    outline(im, 0.5)
    return im


def buffalo() -> Image.Image:
    """A grey water buffalo grazing, seen from the side, with swept-back horns."""
    im = new(32, 24)
    soft_shadow(im, 16, 21, 13, 2.5)
    body, dark = (84, 84, 92), (60, 60, 68)
    disc(im, 15, 12, 8, body, squash=0.6)
    for x in (9, 12, 18, 21):
        rect(im, x, 14, x + 1, 21, dark)
    disc(im, 25, 13, 4, body); disc(im, 27, 15, 2.5, (110, 106, 110))
    for i in range(6):  # horns
        put(im, 23 - i, 9 - i // 2, (220, 210, 190)); put(im, 26 + i // 2, 8 - i // 3, (220, 210, 190))
    rect(im, 5, 10, 6, 15, dark)                                 # tail
    outline(im, 0.5)
    return im


def hot_spring() -> Image.Image:
    """Suối Bang: a steaming turquoise pool ringed by pale rock."""
    rnd = random.Random(121)
    im = new(64, 48)
    disc(im, 32, 30, 28, (176, 170, 156), squash=0.55)
    disc(im, 32, 30, 23, (90, 196, 200), squash=0.5)
    disc(im, 28, 28, 12, (150, 226, 226), squash=0.45)
    for _ in range(26):  # steam puffs rising
        x, y = rnd.randint(14, 50), rnd.randint(2, 26)
        disc(im, x, y, rnd.uniform(1.5, 3), (240, 244, 244, 150))
    outline(im, 0.6)
    return im


def memorial_house() -> Image.Image:
    """A modest tiled village house with a flag, as at General Võ Nguyên Giáp's birthplace."""
    im = new(80, 64)
    soft_shadow(im, 40, 61, 38, 3)
    rect(im, 6, 32, 73, 61, (214, 190, 140)); rect(im, 6, 32, 8, 61, (236, 214, 166))
    for x in (12, 30, 46, 62):
        rect(im, x, 38, x + 6, 52, (96, 66, 44))
    rect(im, 34, 40, 45, 61, (96, 66, 44))
    roof(im, 2, 77, 12, 20, TILE_ROOF, (96, 50, 38))
    rect(im, 72, 4, 72, 34, (200, 200, 200))                     # flagpole
    rect(im, 73, 4, 79, 9, RED); put(im, 76, 6, (246, 214, 60))
    outline(im, 0.45)
    return im


def race_boat() -> Image.Image:
    """A long racing boat full of rowers with paddles, for the boat festival."""
    im = new(96, 24)
    for y in range(12, 19):
        half = 46 - (y - 12) * 3
        rect(im, 48 - half, y, 47 + half, y, RED if y < 16 else RED_D)
    rect(im, 2, 12, 93, 12, (230, 190, 70))
    for i, x in enumerate(range(10, 88, 6)):  # rowers in coloured shirts with paddles
        c = (240, 220, 80) if i % 2 else (240, 240, 240)
        rect(im, x, 7, x + 2, 11, c); disc(im, x + 1, 5, 1.6, (60, 40, 30))
        put(im, x - 1, 13, (120, 90, 60)); put(im, x - 2, 15, (120, 90, 60))
    rect(im, 92, 4, 95, 12, (230, 190, 70))                      # dragon-head prow
    outline(im, 0.45)
    return im


def hat_stall() -> Image.Image:
    """A nón lá stall: conical palm-leaf hats stacked on a bamboo rack."""
    im = new(48, 40)
    soft_shadow(im, 24, 37, 22, 2.5)
    rect(im, 4, 18, 43, 37, P["k2"]); rect(im, 4, 18, 43, 19, P["k3"])
    for row, y in enumerate((26, 14)):
        for x in range(8 + row * 5, 42, 10):
            for k in range(7):  # a cone of hat
                rect(im, x - k, y - 6 + k, x + k, y - 6 + k, (232, 216, 168) if k < 5 else (206, 188, 140))
    rect(im, 2, 6, 45, 8, (196, 60, 48))                         # awning
    outline(im, 0.45)
    return im


def make_qb_landmarks() -> list[dict]:
    files = []
    for key, draw in [("quang_binh_quan", quang_binh_quan), ("cable_bridge", cable_bridge), ("buffalo", buffalo),
                      ("hot_spring", hot_spring), ("memorial_house", memorial_house), ("race_boat", race_boat),
                      ("hat_stall", hat_stall)]:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files

