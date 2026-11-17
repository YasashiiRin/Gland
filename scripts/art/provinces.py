"""Scenery sprites for the central-Vietnam province maps, drawn freehand in code:
coastal casuarinas, Phúc Trạch pomelo and rubber trees, a limestone mountain,
a hillside pagoda, a two-colour river bridge with a flag tower, and a basket boat.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow


def _trunk(im: Image.Image, x: int, top: int, bottom: int, c, w: int = 3) -> None:
    rect(im, x, top, x + w - 1, bottom, c)
    rect(im, x, top, x, bottom, shade(c, 1.2))
    rect(im, x + w - 1, top, x + w - 1, bottom, shade(c, 0.7))


def casuarina() -> Image.Image:
    """Phi lao: a tall, wispy, conical pine-like tree lining the beaches."""
    rnd = random.Random(41)
    im = new(48, 64)
    soft_shadow(im, 24, 60, 9, 2.5, alpha=75)
    _trunk(im, 23, 30, 60, (120, 92, 70))
    dark, mid, light = (52, 88, 70), (72, 112, 84), (106, 140, 100)
    for y in range(4, 50):
        half = 2 + (y - 4) * 0.3
        for x in range(int(24 - half), int(24 + half) + 1):
            if rnd.random() < 0.72:
                c = light if x < 24 - half * 0.3 and rnd.random() < 0.5 else mid
                put(im, x, y, dark if rnd.random() < 0.25 else c)
    for y in range(10, 50, 7):  # drooping needle tiers
        for x in range(int(24 - (y - 4) * 0.3), int(24 + (y - 4) * 0.3) + 1, 2):
            put(im, x, y + 1, dark)
    outline(im, 0.5)
    return im


def pomelo() -> Image.Image:
    """Bưởi Phúc Trạch (Hà Tĩnh): a round glossy crown hung with big green-yellow fruit."""
    rnd = random.Random(43)
    im = new(48, 64)
    soft_shadow(im, 24, 60, 14, 3.5, alpha=75)
    _trunk(im, 22, 34, 60, P["k1"], 4)
    for cx, cy, r in ((24, 24, 17), (14, 30, 10), (34, 30, 10)):
        disc(im, cx, cy, r, P["f1"]); disc(im, cx - 2, cy - 3, r - 3, P["f2"]); disc(im, cx - 5, cy - 6, r * 0.35, P["f3"])
    for _ in range(7):
        x, y = rnd.randint(12, 36), rnd.randint(18, 38)
        disc(im, x, y, 2.2, (196, 204, 84)); put(im, x - 1, y - 1, (230, 230, 140))
    outline(im, 0.5)
    return im


def rubber() -> Image.Image:
    """Cây cao su: a straight pale trunk with a tapping cup and a high oval crown."""
    im = new(48, 64)
    soft_shadow(im, 24, 60, 10, 3, alpha=75)
    _trunk(im, 22, 20, 60, (176, 168, 150), 4)
    for y in range(36, 52, 2):  # spiral tapping cut
        put(im, 22 + (y - 36) // 4, y, (110, 96, 80))
    rect(im, 26, 47, 28, 50, (120, 90, 60)); rect(im, 26, 47, 28, 47, (240, 236, 224))  # latex cup
    for cx, cy, r in ((24, 14, 13), (16, 20, 8), (32, 20, 8)):
        disc(im, cx, cy, r, (52, 96, 52), squash=0.8); disc(im, cx - 2, cy - 3, r - 3, (74, 122, 62), squash=0.8)
        disc(im, cx - 4, cy - 5, r * 0.3, (108, 150, 78))
    outline(im, 0.5)
    return im


def mountain() -> Image.Image:
    """A forested limestone ridge with several peaks (Hồng Lĩnh, "99 peaks")."""
    rnd = random.Random(47)
    im = new(128, 96)
    soft_shadow(im, 64, 92, 60, 5, alpha=70)
    peaks = [(22, 34, 26), (52, 8, 34), (82, 22, 30), (108, 40, 22)]
    for x in range(128):
        top = min(py + abs(x - px) * (64 - py) / pw * 0.9 for px, py, pw in peaks)
        top = max(top, 92 - min(x, 127 - x) * 1.8)  # slopes come down to the ground at both ends
        for y in range(int(top), 92):
            depth = (y - top) / max(1, 92 - top)
            c = (112, 116, 106) if depth < 0.12 else (78, 112, 70) if depth < 0.6 else (60, 92, 58)
            if x < 64 and depth < 0.6 and (x + y) % 9 == 0:
                c = shade(c, 1.15)
            put(im, x, y, c)
    for _ in range(80):  # tree clumps on the slopes
        x, y = rnd.randint(6, 121), rnd.randint(40, 86)
        if im.getpixel((x, y))[3]:
            disc(im, x, y, 2.5, (50, 86, 50)); put(im, x - 1, y - 1, (90, 130, 76))
    outline(im, 0.5)
    return im


def pagoda() -> Image.Image:
    """A small hillside pagoda: tiled roof with upturned eaves, ochre walls."""
    im = new(64, 64)
    soft_shadow(im, 32, 61, 28, 3)
    rect(im, 8, 36, 55, 60, (214, 176, 108)); rect(im, 8, 36, 55, 38, (176, 140, 80))
    for x in (10, 22, 40, 52):
        rect(im, x, 38, x + 1, 60, (150, 60, 44))
    rect(im, 28, 44, 35, 60, (120, 50, 36)); rect(im, 29, 45, 34, 46, (196, 150, 60))
    for i, (y0, x0, x1) in enumerate(((26, 2, 61), (10, 12, 51))):
        for y in range(y0, y0 + 11):
            inset = (y - y0) // 2
            rect(im, x0 + 4 - inset, y, x1 - 4 + inset, y, (130, 66, 50) if (y - y0) % 3 else (104, 50, 40))
        put(im, x0, y0 - 1, (130, 66, 50)); put(im, x1, y0 - 1, (130, 66, 50))   # upturned eaves
        put(im, x0 - 1, y0 - 2, (196, 150, 60)); put(im, x1 + 1, y0 - 2, (196, 150, 60))
        if i == 1:
            rect(im, 18, 21, 45, 25, (214, 176, 108))
    disc(im, 32, 6, 2.5, (210, 170, 70))
    outline(im, 0.45)
    return im


def river_bridge() -> Image.Image:
    """A 3-tile-wide bridge deck drawn over a river, rails painted half blue, half yellow."""
    im = new(48, 112)
    for y in range(112):
        c = P["k2"] if (y // 4) % 2 else P["k3"]
        rect(im, 3, y, 44, y, c)
        if y % 4 == 3:
            rect(im, 3, y, 44, y, P["k1"])
    blue, yellow = (70, 110, 170), (214, 182, 70)
    for x0 in (0, 45):
        for y in range(112):
            c = blue if y < 56 else yellow
            rect(im, x0, y, x0 + 2, y, c)
            if y % 14 == 0:
                rect(im, x0, y, x0 + 2, y + 2, shade(c, 0.7))
    return im


def flag_tower() -> Image.Image:
    """A tall flagpole on a stepped base with a red flag and a yellow star."""
    im = new(32, 96)
    soft_shadow(im, 16, 93, 14, 3)
    rect(im, 4, 84, 27, 93, P["r2"]); rect(im, 7, 78, 24, 84, P["r3"])
    rect(im, 4, 84, 27, 84, P["r3"])
    rect(im, 15, 4, 16, 78, (200, 200, 196)); rect(im, 16, 4, 16, 78, (150, 150, 146))
    for y in range(6, 20):  # the flag waves slightly
        wave = round(math.sin(y / 3) * 1)
        rect(im, 17, y + wave, 30, y + wave, (196, 40, 36))
    for x, y in ((23, 11), (22, 12), (23, 12), (24, 12), (23, 13), (22, 14), (24, 14)):
        put(im, x, y, (246, 214, 60))
    outline(im, 0.45)
    return im


def basket_boat() -> Image.Image:
    """Thuyền thúng: a round woven bamboo basket boat pulled up on the sand."""
    im = new(32, 24)
    soft_shadow(im, 16, 20, 14, 3)
    disc(im, 16, 14, 13, (120, 92, 54), squash=0.55)
    disc(im, 16, 13, 11, (60, 44, 30), squash=0.5)
    for a in range(0, 360, 30):
        x = 16 + math.cos(math.radians(a)) * 12
        y = 14 + math.sin(math.radians(a)) * 7
        put(im, round(x), round(y), (166, 132, 80))
    rect(im, 6, 12, 26, 12, (150, 116, 70))  # paddle across the rim
    outline(im, 0.45)
    return im


def red_cliff() -> Image.Image:
    """Cửa Tùng's red basalt headland: piled rounded boulders, lit from the top-left."""
    rnd = random.Random(53)
    im = new(96, 112)
    stones = [(rnd.randint(10, 86), rnd.randint(20, 104), rnd.randint(9, 16)) for _ in range(26)]
    for cx, cy, r in sorted(stones, key=lambda s: s[1]):
        disc(im, cx, cy, r, (122, 52, 40), squash=0.8)
        disc(im, cx - 2, cy - 2, r - 2, (154, 72, 52), squash=0.8)
        disc(im, cx - r * 0.35, cy - r * 0.4, r * 0.35, (190, 106, 76), squash=0.8)
    for _ in range(60):
        x, y = rnd.randint(4, 92), rnd.randint(10, 108)
        if im.getpixel((x, y))[3]:
            put(im, x, y, (96, 40, 32))
    outline(im, 0.5)
    return im


def make_province_art() -> list[dict]:
    files = []
    for key, draw, rel in [("tree_casuarina", casuarina, "trees/casuarina.png"), ("tree_pomelo", pomelo, "trees/pomelo.png"),
                           ("tree_rubber", rubber, "trees/rubber.png"), ("prop_mountain", mountain, "props/mountain.png"),
                           ("prop_pagoda", pagoda, "props/pagoda.png"), ("prop_river_bridge", river_bridge, "props/river_bridge.png"),
                           ("prop_flag_tower", flag_tower, "props/flag_tower.png"), ("prop_basket_boat", basket_boat, "props/basket_boat.png"),
                           ("prop_red_cliff", red_cliff, "props/red_cliff.png")]:
        save(draw(), f"sprites/{rel}")
        files.append({"type": "image", "key": key, "url": f"sprites/{rel}"})
    # beach windbreak trees are placed as props, so the sprite is also a prop
    files.append({"type": "image", "key": "prop_casuarina", "url": "sprites/trees/casuarina.png"})
    return files
