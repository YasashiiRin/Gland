"""Large outdoor sprites: trees, the mine's cave mouth, the shipping bin.

Trees are drawn as clusters of leaf "clumps", each lit from the top-left
(dark base, mid tone, light and a small highlight), which gives a rounder,
more painterly canopy than a single flat blob.
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

TREE_W, TREE_H = 48, 64


def _trunk(im: Image.Image, cx: int, top: int, bottom: int, half: int = 3) -> None:
    for y in range(top, bottom + 1):
        flare = 2 if y > bottom - 3 else (1 if y > bottom - 6 else 0)
        for x in range(cx - half - flare, cx + half + flare + 1):
            rel = (x - (cx - half - flare)) / (2 * (half + flare) + 1)
            c = P["k2"] if rel < 0.3 else P["k1"] if rel < 0.75 else P["k0"]
            put(im, x, y, c)
    for y in range(top + 3, bottom - 2, 5):  # bark marks
        put(im, cx - 1, y, P["k0"]); put(im, cx + 1, y + 2, P["k0"])


def _clump(im: Image.Image, cx: float, cy: float, r: float, pal: list) -> None:
    disc(im, cx, cy, r, pal[0])
    disc(im, cx - 1, cy - 1.5, r - 1.6, pal[1])
    disc(im, cx - 2, cy - 2.5, r * 0.55, pal[2])
    disc(im, cx - 3, cy - 3.5, max(1.0, r * 0.22), pal[3])


def oak(variant: int) -> Image.Image:
    rnd = random.Random(100 + variant)
    im = new(TREE_W, TREE_H)
    soft_shadow(im, 24, 60, 15, 4, alpha=75)
    _trunk(im, 24, 34, 60)
    pal = [P["f1"], P["f2"], P["f3"], P["f4"]]
    clumps = [(24, 12, 9), (14, 18, 9), (34, 17, 9), (8, 29, 7), (40, 29, 7),
              (20, 26, 10), (31, 27, 10), (24, 36, 8), (13, 35, 7), (36, 36, 7)]
    for (cx, cy, r) in sorted(clumps, key=lambda c: c[1]):
        _clump(im, cx + rnd.randint(-1, 1), cy + rnd.randint(-1, 1), r + rnd.choice((0, 0, 1)), pal)
    for _ in range(26):  # darker leaf gaps for texture
        x, y = rnd.randrange(6, 42), rnd.randrange(6, 42)
        if im.getpixel((x, y))[3] and im.getpixel((x, y))[:3] == P["f2"]:
            put(im, x, y, P["f1"])
    outline(im, 0.55)
    return im


def pine() -> Image.Image:
    im = new(TREE_W, TREE_H)
    soft_shadow(im, 24, 60, 12, 3.5, alpha=75)
    _trunk(im, 24, 44, 60, half=2)
    tiers = [(6, 10), (16, 14), (26, 17), (36, 19)]
    for top, half in tiers:
        for dy in range(16):
            w = int(half * (dy + 2) / 17)
            for x in range(24 - w, 24 + w + 1):
                rel = (x - (24 - w)) / max(1, 2 * w)
                c = P["f3"] if rel < 0.25 else P["f2"] if rel < 0.65 else P["f1"]
                if dy == 15 or (dy > 12 and (x + dy) % 3 == 0):
                    c = P["f0"]
                put(im, x, top + dy, c)
    put(im, 24, 5, P["f3"])
    outline(im, 0.5)
    return im


def cave() -> Image.Image:
    """A rocky outcrop with a timber-framed mine mouth (3x3 tiles)."""
    rnd = random.Random(5)
    im = new(48, 48)
    soft_shadow(im, 24, 45, 23, 3, alpha=70)
    for (cx, cy, r) in [(12, 26, 12), (36, 26, 12), (24, 16, 14), (8, 38, 8), (40, 38, 8), (24, 34, 14)]:
        disc(im, cx, cy, r, P["r1"])
        disc(im, cx - 1, cy - 2, r - 2.5, P["r2"])
        disc(im, cx - 3, cy - 4, r * 0.4, P["r3"])
    for _ in range(40):
        x, y = rnd.randrange(2, 46), rnd.randrange(4, 44)
        if im.getpixel((x, y))[3]:
            put(im, x, y, P["r0"] if rnd.random() < 0.5 else P["r1"])
    # mouth
    rect(im, 17, 30, 30, 46, (18, 14, 14))
    for y in range(26, 30):
        rect(im, 17 + (29 - y) // 2, y, 30 - (29 - y) // 2, y, (18, 14, 14))
    rect(im, 15, 28, 16, 46, P["k1"]); rect(im, 31, 28, 32, 46, P["k0"])
    rect(im, 14, 26, 33, 28, P["k2"]); rect(im, 14, 26, 33, 26, P["k3"])
    rect(im, 19, 41, 28, 41, P["k1"]); rect(im, 19, 44, 28, 44, P["k1"])  # rails
    put(im, 34, 30, (250, 200, 90)); put(im, 34, 31, (220, 140, 60))       # lantern
    outline(im, 0.45)
    return im


def shipping_bin() -> Image.Image:
    im = new(32, 24)
    soft_shadow(im, 16, 22, 15, 2.5)
    rect(im, 2, 8, 29, 21, P["k2"])
    for y in (11, 15, 19):
        rect(im, 2, y, 29, y, P["k1"])
    rect(im, 2, 8, 3, 21, P["k3"]); rect(im, 28, 8, 29, 21, P["k0"])
    rect(im, 1, 3, 30, 8, P["k1"]); rect(im, 1, 3, 30, 4, P["k3"])           # open lid
    for x in (2, 28):
        rect(im, x, 9, x + 1, 10, P["r3"]); rect(im, x, 19, x + 1, 20, P["r3"])
    rect(im, 13, 5, 18, 6, (214, 176, 80))                                   # brass plate
    outline(im, 0.45)
    return im


def make_nature() -> list[dict]:
    files = []
    for i in range(2):
        save(oak(i), f"sprites/trees/oak_{i}.png")
        files.append({"type": "image", "key": f"tree_oak_{i}", "url": f"sprites/trees/oak_{i}.png"})
    save(pine(), "sprites/trees/pine.png")
    files.append({"type": "image", "key": "tree_pine", "url": "sprites/trees/pine.png"})
    save(cave(), "sprites/props/cave.png")
    files.append({"type": "image", "key": "prop_cave", "url": "sprites/props/cave.png"})
    save(shipping_bin(), "sprites/props/shipping_bin.png")
    files.append({"type": "image", "key": "prop_shipping_bin", "url": "sprites/props/shipping_bin.png"})
    return files
