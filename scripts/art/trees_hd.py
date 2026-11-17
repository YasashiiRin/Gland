"""HD trees (graphics x2): 96x128 sprites shown at half size, so they keep the
same footprint (trunk base at y=120 of 128, like 60 of 64) with twice the
detail. Drawn freehand in code with the ink-outline style; marked "hd" in
the sprite pack (see HD_SPRITES).
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

W, H = 96, 128
BASE = 120
HD_SPRITES = {"tree_oak_0", "tree_oak_1", "tree_coconut", "prop_coconut", "tree_bamboo", "tree_areca", "tree_pine"}

LEAF = [(30, 84, 46), (46, 116, 54), (70, 146, 60), (104, 178, 72), (150, 206, 96), (196, 230, 130)]
BARK = [(60, 38, 28), (88, 58, 38), (118, 80, 52), (150, 106, 70)]


def trunk(im: Image.Image, cx: int, top: int, bottom: int, half: int, rnd: random.Random) -> None:
    for y in range(top, bottom + 1):
        flare = max(0, 4 - (bottom - y)) if y > bottom - 5 else 0
        for x in range(cx - half - flare, cx + half + flare + 1):
            rel = (x - (cx - half - flare)) / (2 * (half + flare) + 1)
            put(im, x, y, BARK[3] if rel < 0.22 else BARK[2] if rel < 0.5 else BARK[1] if rel < 0.82 else BARK[0])
    for _ in range((bottom - top) // 2):  # bark grain
        x, y = rnd.randint(cx - half + 1, cx + half - 1), rnd.randint(top, bottom - 2)
        put(im, x, y, BARK[0]); put(im, x, y + 1, BARK[0])
    for dx in (-half - 4, half + 4):  # roots
        put(im, cx + dx, bottom, BARK[1]); put(im, cx + dx // 2 * 1, bottom - 1, BARK[1])


def leaf_clump(im: Image.Image, cx: float, cy: float, r: float, rnd: random.Random) -> None:
    """One lit ball of leaves: dark underside, mid body, light top-left, bright leaf tips."""
    disc(im, cx, cy + 1, r, LEAF[1])
    disc(im, cx - r * 0.12, cy - r * 0.1, r * 0.86, LEAF[2])
    disc(im, cx - r * 0.3, cy - r * 0.32, r * 0.55, LEAF[3])
    disc(im, cx - r * 0.42, cy - r * 0.45, r * 0.25, LEAF[4])
    for _ in range(int(r * 1.6)):  # leaf notches and tips around the edge
        a = rnd.uniform(0, math.tau)
        x, y = cx + math.cos(a) * (r - 1), cy + math.sin(a) * (r - 1)
        put(im, round(x), round(y), LEAF[3] if math.sin(a) < 0 else LEAF[0])
    for _ in range(int(r)):
        x, y = cx + rnd.uniform(-r * 0.6, r * 0.2), cy + rnd.uniform(-r * 0.6, r * 0.1)
        put(im, round(x), round(y), LEAF[5] if rnd.random() < 0.3 else LEAF[4])


def oak(variant: int) -> Image.Image:
    rnd = random.Random(500 + variant)
    im = new(W, H)
    soft_shadow(im, 48, BASE, 32, 7, alpha=80)
    trunk(im, 48, 66, BASE, 6, rnd)
    for side in (-1, 1):  # two branches into the crown
        for t in range(16):
            put(im, 48 + side * (4 + t // 2), 72 - t, BARK[1]); put(im, 48 + side * (5 + t // 2), 72 - t, BARK[2])
    cy = 46 if variant == 0 else 50
    disc(im, 48, cy, 40, LEAF[0], squash=0.88)
    clumps = [(48, cy - 24, 17), (26, cy - 12, 15), (70, cy - 12, 15), (16, cy + 10, 12), (80, cy + 10, 12),
              (36, cy + 4, 17), (61, cy + 4, 17), (48, cy - 6, 17), (30, cy + 22, 12), (66, cy + 22, 12), (48, cy + 18, 13)]
    for x, y, r in sorted(clumps, key=lambda c: c[1]):
        leaf_clump(im, x + rnd.randint(-2, 2), y + rnd.randint(-2, 2), r, rnd)
    if variant == 1:  # fruit
        for _ in range(9):
            x, y = rnd.randint(18, 78), rnd.randint(cy - 10, cy + 28)
            if im.getpixel((x, y))[3]:
                disc(im, x, y, 1.6, (240, 196, 70)); put(im, x - 1, y - 1, (255, 236, 150)); put(im, x + 1, y + 1, (190, 130, 40))
    outline(im, inner=False)
    return im


def frond(im: Image.Image, x0: float, y0: float, ang: float, length: int, droop: float, leaflet: int) -> None:
    """A palm frond: a curved midrib with leaflets on both sides that hang down and
    shorten toward the tip; leaflets are lit on top, darker underneath."""
    a = math.radians(ang)
    pts = [(x0 + math.cos(a) * i, y0 + math.sin(a) * i * 0.7 + i * i * droop) for i in range(length + 1)]
    for i, (x, y) in enumerate(pts[2:-1], start=2):
        n = max(2, round(leaflet * (1 - i / length) + 2))
        nx, ny = pts[i + 1][0] - x, pts[i + 1][1] - y
        ln = math.hypot(nx, ny) or 1
        px, py = -ny / ln, nx / ln                    # perpendicular to the midrib
        for side in (-1, 1):
            for k in range(1, n + 1):
                lx = x + side * px * k * 0.8 - nx / ln * k * 0.35
                ly = y + side * py * k * 0.8 + k * 0.55  # leaflets droop
                c = LEAF[3] if k <= 1 else LEAF[2] if ly < y + 2 else LEAF[1]
                put(im, round(lx), round(ly), c)
    for i, (x, y) in enumerate(pts):
        put(im, round(x), round(y), LEAF[4] if i < length * 0.5 else LEAF[3])
        put(im, round(x), round(y) + 1, LEAF[2])


def coconut() -> Image.Image:
    """A tall, gently curving coconut palm: ringed trunk, arching feathery fronds, a cluster of nuts."""
    rnd = random.Random(520)
    im = new(W, H)
    soft_shadow(im, 54, BASE, 18, 4, alpha=80)
    top_x, top_y = 42, 34
    for y in range(top_y, BASE + 1):
        t = (BASE - y) / (BASE - top_y)
        x = 54 - round(12 * t ** 1.7)
        for dx, c in ((-2, (196, 168, 122)), (-1, (176, 146, 104)), (0, (156, 126, 90)), (1, (134, 106, 76)), (2, (110, 86, 62))):
            put(im, x + dx, y, c)
        if y % 4 == 0:
            for dx in (-2, -1, 0, 1):
                put(im, x + dx, y, (118, 92, 66))
    fronds = [(-175, 34), (-150, 30), (-125, 24), (-55, 24), (-30, 30), (-5, 34), (25, 26), (155, 26), (75, 16), (105, 16), (-90, 16)]
    for ang, length in sorted(fronds, key=lambda f: -math.sin(math.radians(f[0]))):
        frond(im, top_x, top_y, ang, length, 1 / 34, 6)
    for dx, dy in ((-4, 5), (2, 7), (5, 3), (-1, 2), (-5, 1)):
        disc(im, top_x + dx, top_y + dy, 3, (120, 144, 60))
        put(im, top_x + dx - 1, top_y + dy - 1, (180, 200, 110))
    outline(im, inner=False)
    return im


def bamboo() -> Image.Image:
    """A clump of bamboo: several jointed green culms with feathery leaf sprays."""
    rnd = random.Random(530)
    im = new(W, H)
    soft_shadow(im, 48, BASE, 26, 5, alpha=80)
    culms = [(30, 24, -0.18), (40, 10, -0.06), (50, 6, 0.04), (60, 14, 0.12), (68, 28, 0.22), (45, 30, 0.0)]
    for bx, top, lean in culms:
        for y in range(top, BASE + 1):
            x = round(bx + (BASE - y) * lean)
            for dx, c in ((-1, (150, 190, 90)), (0, (110, 160, 70)), (1, (80, 128, 56))):
                put(im, x + dx, y, c)
            if (y - top) % 11 == 0:  # joints
                for dx in (-2, -1, 0, 1, 2):
                    put(im, x + dx, y, (196, 210, 120) if dx < 0 else (64, 100, 44))
        for k in range(6):  # sprays of slim leaves along the upper culm, hanging outward
            y = top + 4 + k * 10
            x = round(bx + (BASE - y) * lean)
            side = 1 if (k + bx // 10) % 2 else -1
            for leaf in range(4):
                ang = math.radians(20 + leaf * 18)
                for i in range(10):
                    lx = x + side * math.cos(ang) * i
                    ly = y + math.sin(ang) * i * 0.6 + leaf
                    w = 1 if 2 < i < 8 else 0
                    for d in range(w + 1):
                        put(im, round(lx), round(ly) + d, LEAF[3] if d == 0 else LEAF[1])
                put(im, round(x + side * math.cos(ang) * 9), round(y + math.sin(ang) * 5.4 + leaf), LEAF[4])
    outline(im, inner=False)
    return im


def areca() -> Image.Image:
    """Cau: a thin, straight, ringed grey trunk with a small crown of arching fronds."""
    im = new(W, H)
    soft_shadow(im, 48, BASE, 12, 3, alpha=80)
    for y in range(30, BASE + 1):
        for dx, c in ((-1, (190, 184, 168)), (0, (160, 154, 140)), (1, (126, 120, 110))):
            put(im, 48 + dx, y, c)
        if y % 5 == 0:
            put(im, 47, y, (120, 114, 104)); put(im, 48, y, (120, 114, 104))
    rect(im, 46, 26, 50, 34, (96, 150, 70))                                # crownshaft
    for ang, length in ((-170, 26), (-140, 24), (-110, 18), (-70, 18), (-40, 24), (-10, 26), (160, 20), (20, 20)):
        frond(im, 48, 28, ang, length, 1 / 30, 5)
    for dx in (-2, 1, 3):  # betel nuts
        disc(im, 48 + dx, 37, 1.6, (230, 150, 50))
    outline(im, inner=False)
    return im


def pine() -> Image.Image:
    """A Huế-style pine: tiers of dark needles, lit on the left, on a reddish trunk."""
    rnd = random.Random(550)
    im = new(W, H)
    soft_shadow(im, 48, BASE, 24, 5, alpha=80)
    trunk(im, 48, 80, BASE, 4, rnd)
    needles = [(34, 82, 52), (46, 110, 60), (66, 140, 70), (104, 170, 86)]
    for top, half in ((8, 16), (26, 24), (44, 31), (62, 37)):
        for dy in range(26):
            w = half * (dy / 26) ** 0.8
            y = top + dy
            for x in range(round(48 - w), round(48 + w) + 1):
                rel = (x - (48 - w)) / (2 * w + 1)
                c = needles[3] if rel < 0.18 else needles[2] if rel < 0.45 else needles[1] if rel < 0.8 else needles[0]
                if dy > 22 and rnd.random() < 0.4:
                    c = needles[0]
                put(im, x, y, c)
        for _ in range(12):
            x, y = rnd.randint(48 - half + 4, 48 + half - 4), top + rnd.randint(8, 24)
            put(im, x, y, needles[0])
    outline(im, inner=False)
    return im


def make_trees_hd() -> None:
    """Overwrites the tree PNGs with their HD versions (pack entries flagged in gen_placeholders)."""
    for rel, draw in (("oak_0", lambda: oak(0)), ("oak_1", lambda: oak(1)), ("coconut", coconut),
                      ("bamboo", bamboo), ("areca", areca), ("pine", pine)):
        save(draw(), f"sprites/trees/{rel}.png")
