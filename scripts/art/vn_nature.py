"""Vietnamese countryside scenery: bamboo clumps, banana and areca palms, the
village banyan, a well, haystacks and glazed water jars. Drawn freehand in code.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

CULM, CULM_D, CULM_L = (150, 168, 74), (104, 122, 52), (190, 200, 110)
BLEAF, BLEAF_D, BLEAF_L = (86, 136, 60), (56, 98, 48), (130, 172, 80)


def _line(im: Image.Image, x0: float, y0: float, x1: float, y1: float, c, width: int = 1) -> None:
    steps = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(steps + 1):
        t = i / steps
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        for w in range(width):
            put(im, round(x) + w, round(y), c)


def bamboo() -> Image.Image:
    """A clump of tall culms fanning out, with feathery leaf sprays."""
    rnd = random.Random(31)
    im = new(48, 64)
    soft_shadow(im, 24, 60, 14, 3.5, alpha=75)
    culms = [(-9, -0.18), (-5, -0.1), (-2, -0.03), (1, 0.02), (4, 0.09), (8, 0.16), (-1, 0.0)]
    for base_dx, lean in culms:
        x0, y0 = 24 + base_dx * 0.4, 60
        top = 4 + rnd.randint(0, 8)
        for y in range(y0, top, -1):
            x = x0 + base_dx * 0.6 * (y0 - y) / 56 + lean * (y0 - y) * 0.5
            put(im, round(x), y, CULM); put(im, round(x) + 1, y, CULM_D)
            if (y0 - y) % 9 == 0:
                put(im, round(x) - 1, y, CULM_D); put(im, round(x) + 2, y, CULM_D)
            if y < 42 and (y0 - y) % 7 == 3:             # leaf sprays from the upper nodes
                side = 1 if rnd.random() < 0.5 else -1
                for k in range(3):
                    lx = x + side * (2 + k * 2)
                    ly = y + k * 1.2
                    _line(im, lx, ly, lx + side * 5, ly + 2.5, BLEAF if k else BLEAF_L)
                    put(im, round(lx + side * 5), round(ly + 3), BLEAF_D)
    outline(im, 0.5)
    return im


def banana() -> Image.Image:
    im = new(48, 64)
    soft_shadow(im, 24, 60, 11, 3, alpha=75)
    rect(im, 22, 30, 26, 60, (138, 150, 86)); rect(im, 22, 30, 22, 60, (170, 180, 110)); rect(im, 26, 30, 26, 60, (100, 110, 60))
    for (ang, ln) in [(-160, 22), (-130, 24), (-95, 20), (-60, 24), (-25, 22), (-180, 16), (0, 16)]:
        a = math.radians(ang)
        for t in range(ln):
            cx = 24 + math.cos(a) * t
            cy = 30 + math.sin(a) * t + (t * t) / 45            # leaves droop at the tips
            wdt = 3.4 * math.sin(math.pi * t / ln) + 0.6
            for s in range(-int(wdt), int(wdt) + 1):
                c = (98, 160, 70) if s < 0 else (74, 132, 58)
                if t % 6 == 5 and s > 0:                         # torn edges
                    continue
                put(im, round(cx - math.sin(a) * s), round(cy + math.cos(a) * s), c)
            put(im, round(cx), round(cy), (150, 190, 100))       # midrib
    for (x, y) in [(27, 33), (28, 35), (26, 36), (28, 38)]:      # a small hanging bunch
        disc(im, x, y, 1.5, (190, 196, 80))
    outline(im, 0.5)
    return im


def areca() -> Image.Image:
    im = new(48, 64)
    soft_shadow(im, 24, 60, 7, 2.5, alpha=75)
    for y in range(14, 61):
        x = 24 + round(1.5 * math.sin((60 - y) / 18))
        put(im, x, y, (150, 146, 132)); put(im, x + 1, y, (116, 112, 100))
        if y % 4 == 0:
            put(im, x, y, (120, 116, 104))
    for ang in range(-180, 1, 22):
        a = math.radians(ang)
        for t in range(16):
            cx, cy = 24 + math.cos(a) * t, 13 + math.sin(a) * t * 0.7 + t * t / 30
            put(im, round(cx), round(cy), BLEAF)
            if t % 2 == 0 and t > 3:                         # feathery leaflets
                put(im, round(cx), round(cy) + 1, BLEAF_D); put(im, round(cx), round(cy) + 2, BLEAF_D)
    disc(im, 24, 15, 2, (196, 150, 60))                      # areca nuts
    outline(im, 0.5)
    return im


def banyan() -> Image.Image:
    """The old village banyan ("cây đa"): huge canopy, thick trunk, aerial roots."""
    rnd = random.Random(9)
    im = new(96, 96)
    soft_shadow(im, 48, 90, 34, 6, alpha=80)
    rect(im, 40, 50, 56, 90, P["k1"]); rect(im, 40, 50, 43, 90, P["k2"]); rect(im, 53, 50, 56, 90, P["k0"])
    for x in (34, 37, 59, 62, 46, 51):
        rect(im, x, 46 + rnd.randint(0, 6), x, 88, shade(P["k1"], 0.9))   # aerial roots
    for (cx, cy, r) in sorted([(48, 18, 18), (26, 28, 16), (70, 28, 16), (14, 44, 12), (82, 44, 12),
                               (36, 38, 18), (60, 38, 18), (48, 50, 14)], key=lambda c: c[1]):
        disc(im, cx, cy, r, P["f1"]); disc(im, cx - 2, cy - 3, r - 3, P["f2"])
        disc(im, cx - 5, cy - 6, r * 0.45, P["f3"]); disc(im, cx - 7, cy - 8, r * 0.18, P["f4"])
    outline(im, 0.5)
    return im


def well() -> Image.Image:
    im = new(32, 32)
    soft_shadow(im, 16, 29, 14, 3)
    disc(im, 16, 20, 11, P["r1"], squash=0.6)
    disc(im, 16, 18, 10, P["r2"], squash=0.55)
    disc(im, 16, 18, 7, (30, 44, 56), squash=0.5)
    for x in range(6, 27, 4):
        put(im, x, 23, P["r0"])
    rect(im, 5, 2, 6, 18, P["k1"]); rect(im, 26, 2, 27, 18, P["k1"])      # posts + crossbar
    rect(im, 4, 2, 28, 3, P["k2"])
    rect(im, 15, 4, 15, 12, (200, 190, 160)); rect(im, 13, 12, 17, 15, P["k2"])  # rope + bucket
    outline(im, 0.45)
    return im


def haystack() -> Image.Image:
    im = new(32, 32)
    soft_shadow(im, 16, 29, 13, 3)
    for r, c in ((12, (176, 140, 60)), (10, (206, 170, 80)), (5, (226, 196, 110))):
        disc(im, 16, 20 - (12 - r), r, c, squash=0.95)
    rect(im, 15, 2, 16, 8, P["k1"])                                       # centre pole
    for x in range(6, 27, 3):
        put(im, x, 22, (150, 116, 48)); put(im, x + 1, 26, (150, 116, 48))
    outline(im, 0.45)
    return im


def jar() -> Image.Image:
    im = new(16, 24)
    soft_shadow(im, 8, 22, 6, 1.5)
    disc(im, 8, 14, 6.5, (110, 64, 40), squash=1.05)
    disc(im, 6, 11, 2.5, (150, 96, 64))
    rect(im, 4, 5, 11, 7, (96, 56, 36)); rect(im, 4, 5, 11, 5, (140, 92, 62))
    outline(im, 0.45)
    return im


def make_vn_nature() -> list[dict]:
    files = []
    for key, draw, rel in [("tree_bamboo", bamboo, "trees/bamboo.png"), ("tree_banana", banana, "trees/banana.png"),
                           ("tree_areca", areca, "trees/areca.png"), ("prop_banyan", banyan, "props/banyan.png"),
                           ("prop_well", well, "props/well.png"), ("prop_haystack", haystack, "props/haystack.png"),
                           ("prop_jar", jar, "props/jar.png")]:
        save(draw(), f"sprites/{rel}")
        files.append({"type": "image", "key": key, "url": f"sprites/{rel}"})
    return files
