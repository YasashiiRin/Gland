"""Landmark sprites for Đà Nẵng, Quảng Ngãi and Bình Định, drawn freehand in
code (simplified, not traced): the Golden Bridge held up by two stone hands,
a Trà Khúc water wheel, salt heaps, the Thới Lới crater and the Hang Câu sea
arch of Lý Sơn, the Twin Cham Towers, Ghềnh Ráng granite boulders and a
Tây Sơn martial-arts yard.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, soft_shadow
from .landmarks_hue_danang import GOLD, GOLD_D, GOLD_L, RED, RED_D

MOSS, MOSS_D, MOSS_L = (118, 124, 104), (84, 90, 76), (150, 154, 132)
GRANITE, GRANITE_D, GRANITE_L = (150, 140, 128), (108, 100, 92), (190, 180, 166)
BRICK, BRICK_D, BRICK_L = (168, 86, 58), (120, 58, 42), (196, 116, 80)


def golden_bridge() -> Image.Image:
    """Cầu Vàng on Bà Nà: a golden walkway curving through the air, held by two mossy stone hands."""
    im = new(128, 80)
    for side in (-1, 1):  # the hands rise from below, fingers cupped around the deck
        cx = 64 + side * 30
        rect(im, cx - 7, 46, cx + 6, 79, MOSS)
        rect(im, cx - 7, 46, cx - 5, 79, MOSS_L); rect(im, cx + 4, 46, cx + 6, 79, MOSS_D)
        for f in range(4):
            fx = cx - 9 + f * 5
            rect(im, fx, 30 + int(abs(f - 1.5) * 2), fx + 3, 46, MOSS if f % 2 else MOSS_L)
            put(im, fx + 1, 30 + int(abs(f - 1.5) * 2), MOSS_L)
        rect(im, cx + side * 9, 38, cx + side * 9 + 3 * side, 50, MOSS_D)   # thumb
    for x in range(128):
        y = 28 + 10 * math.sin(math.pi * x / 127)              # a gentle sag
        for d in range(5):
            put(im, x, round(y) + d, GOLD_L if d == 0 else GOLD if d < 4 else GOLD_D)
        if x % 6 == 0:
            rect(im, x, round(y) - 4, x, round(y), GOLD_D)     # railing posts
        put(im, x, round(y) - 4, GOLD)
    outline(im, 0.5)
    return im


def water_wheel() -> Image.Image:
    """Guồng nước: a big bamboo water wheel lifting river water into a trough."""
    im = new(64, 72)
    cx, cy, r = 32, 34, 28
    for a in range(0, 360, 2):
        x, y = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
        put(im, round(x), round(y), (176, 156, 96)); put(im, round(x * 0.97 + cx * 0.03), round(y * 0.97 + cy * 0.03), (140, 120, 70))
    for a in range(0, 360, 30):  # spokes and the little bamboo buckets on the rim
        for t in range(r):
            put(im, round(cx + math.cos(math.radians(a)) * t), round(cy + math.sin(math.radians(a)) * t), (150, 128, 76))
        bx, by = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
        rect(im, round(bx) - 1, round(by) - 2, round(bx) + 1, round(by) + 1, (196, 176, 110))
    disc(im, cx, cy, 3, P["k1"])
    rect(im, 28, 34, 35, 71, P["k1"])                          # axle post
    rect(im, 0, 4, 30, 7, (150, 120, 72))                      # trough carrying water away
    rect(im, 0, 5, 26, 6, (110, 160, 190))
    outline(im, 0.45)
    return im


def salt_pile() -> Image.Image:
    """A conical heap of fresh white salt."""
    im = new(32, 24)
    soft_shadow(im, 16, 21, 13, 2.5)
    for y in range(4, 21):
        half = (y - 3) * 0.8
        rect(im, round(16 - half), y, round(15 + half), y, (244, 244, 240))
        rect(im, round(15 + half) - 2, y, round(15 + half), y, (206, 210, 214))
    outline(im, 0.6)
    return im


def crater() -> Image.Image:
    """Thới Lới: a grassy volcanic crater ring on Lý Sơn."""
    im = new(96, 64)
    soft_shadow(im, 48, 60, 46, 4, alpha=60)
    disc(im, 48, 38, 44, (92, 120, 64), squash=0.5)
    disc(im, 46, 35, 40, (118, 144, 76), squash=0.48)
    disc(im, 48, 38, 26, (88, 96, 60), squash=0.45)               # the inner hollow
    disc(im, 50, 40, 20, (110, 124, 70), squash=0.4)
    for x in range(10, 86, 7):
        put(im, x, 37 + (x % 3), (150, 120, 80))
    outline(im, 0.5)
    return im


def sea_arch() -> Image.Image:
    """Hang Câu / Cổng Tò Vò: a dark volcanic rock arch standing in the surf."""
    rnd = random.Random(97)
    im = new(64, 64)
    for x in range(64):
        top = 6 + abs(x - 32) * 0.35 + rnd.random() * 2
        for y in range(int(top), 64):
            put(im, x, y, (70, 66, 64) if x < 30 else (56, 52, 52))
    for y in range(26, 64):  # the opening
        half = int(math.sqrt(max(0, 1 - ((64 - y) / 38) ** 2)) * 14)
        rect(im, 32 - half, y, 31 + half, y, (0, 0, 0, 0))
    for _ in range(40):
        x, y = rnd.randint(0, 63), rnd.randint(6, 63)
        if im.getpixel((x, y))[3]:
            put(im, x, y, (96, 92, 88))
    outline(im, 0.5)
    return im


def twin_towers() -> Image.Image:
    """Tháp Đôi in Quy Nhơn: two Cham brick towers with curved, stepped tops."""
    im = new(96, 96)
    soft_shadow(im, 48, 93, 44, 3)
    for cx, top in ((28, 18), (68, 26)):
        rect(im, cx - 16, top + 26, cx + 15, 93, BRICK)
        rect(im, cx - 16, top + 26, cx - 14, 93, BRICK_L); rect(im, cx + 13, top + 26, cx + 15, 93, BRICK_D)
        for x in (cx - 9, cx, cx + 9):
            rect(im, x, top + 30, x + 1, 90, BRICK_D)
        rect(im, cx - 5, 70, cx + 4, 93, (52, 34, 30)); disc(im, cx - 0.5, 70, 5, (52, 34, 30))
        for y in range(top, top + 26):  # a rounded, tiered crown
            half = int(16 * math.sqrt(max(0, 1 - ((top + 26 - y) / 26) ** 2)))
            rect(im, cx - half, y, cx + half - 1, y, BRICK if (y - top) % 6 else BRICK_D)
        disc(im, cx, top - 1, 2.5, BRICK_L)
    outline(im, 0.45)
    return im


def granite_rocks() -> Image.Image:
    """Ghềnh Ráng: smooth granite boulders piled along the shore."""
    rnd = random.Random(101)
    im = new(96, 64)
    for _ in range(14):
        cx, cy, r = rnd.randint(10, 86), rnd.randint(22, 56), rnd.randint(8, 15)
        disc(im, cx, cy, r, GRANITE_D, squash=0.75)
        disc(im, cx - 2, cy - 2, r - 2, GRANITE, squash=0.75)
        disc(im, cx - r * 0.35, cy - r * 0.35, r * 0.35, GRANITE_L, squash=0.75)
    outline(im, 0.5)
    return im


def martial_yard() -> Image.Image:
    """A Tây Sơn martial-arts yard: a weapon rack, wooden practice posts and a big drum."""
    im = new(96, 64)
    soft_shadow(im, 48, 61, 46, 3)
    rect(im, 4, 22, 40, 24, P["k2"]); rect(im, 4, 22, 5, 60, P["k1"]); rect(im, 39, 22, 40, 60, P["k1"])
    for i, x in enumerate(range(9, 37, 6)):  # spears and staffs on the rack
        rect(im, x, 10, x, 58, P["k3"])
        put(im, x, 9, (200, 200, 206)); put(im, x, 8, (200, 200, 206))
        if i % 2:
            rect(im, x - 1, 12, x + 1, 14, RED)
    for x in (50, 62):  # practice posts
        rect(im, x, 26, x + 4, 60, P["k1"]); rect(im, x - 3, 34, x + 7, 35, P["k2"])
    disc(im, 82, 44, 12, RED_D, squash=0.95); disc(im, 82, 43, 10, (200, 170, 120), squash=0.95)   # drum
    rect(im, 72, 54, 92, 60, P["k1"])
    rect(im, 44, 4, 46, 26, P["k1"])  # a red banner
    rect(im, 47, 4, 60, 16, RED); rect(im, 50, 8, 56, 11, GOLD)
    outline(im, 0.45)
    return im


def make_south_landmarks() -> list[dict]:
    files = []
    sprites = [("golden_bridge", golden_bridge), ("water_wheel", water_wheel), ("salt_pile", salt_pile),
               ("crater", crater), ("sea_arch", sea_arch), ("twin_towers", twin_towers),
               ("granite_rocks", granite_rocks), ("martial_yard", martial_yard)]
    for key, draw in sprites:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
