"""Open-air market stalls ("sạp chợ"): a striped square parasol on a pole,
a low wooden table of goods, and the vendor sitting behind it on a red
plastic stool — like a Vietnamese village morning market.
"""
from __future__ import annotations

from typing import Callable

from PIL import Image

from .characters import Look, frame
from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

VENDORS = {
    "fish": Look(skin=(222, 172, 138), hair=(40, 30, 28), shirt=(70, 120, 150), legs=(46, 42, 48), hair_style="bun"),
    "veg": Look(skin=(214, 164, 130), hair=(150, 146, 140), shirt=(120, 76, 110), legs=(46, 42, 48), hair_style="bun", hat=True),
    "rice": Look(skin=(206, 158, 122), hair=(36, 30, 28), shirt=(150, 110, 70), legs=(60, 56, 50)),
}
UMBRELLAS = {"fish": ((60, 110, 170), (232, 232, 224)), "veg": ((80, 140, 70), (236, 196, 70)), "rice": ((176, 50, 44), (240, 220, 160))}


def _umbrella(im: Image.Image, a, b) -> None:
    for y in range(2, 18):
        inset = max(0, 6 - y) if y < 6 else 0
        for x in range(1 + inset, 47 - inset):
            c = a if (x // 6) % 2 == 0 else b
            put(im, x, y, shade(c, 1.1 if y < 8 else 0.92))
    for x in range(1, 47, 6):                                 # scalloped hem
        for dx in range(6):
            put(im, x + dx, 18 + (1 if dx in (2, 3) else 0), a if (x // 6) % 2 == 0 else b)
    rect(im, 23, 18, 24, 30, (110, 110, 112))                  # pole


def _table(im: Image.Image) -> None:
    rect(im, 3, 31, 44, 38, P["k2"]); rect(im, 3, 31, 44, 32, P["k3"]); rect(im, 3, 38, 44, 38, P["k0"])
    for x in (5, 41):
        rect(im, x, 39, x + 1, 46, P["k1"])


def fish_goods(im: Image.Image) -> None:
    for cx in (12, 24, 36):
        rect(im, cx - 6, 27, cx + 5, 32, (40, 110, 190)); rect(im, cx - 6, 27, cx + 5, 27, (90, 160, 220))  # plastic tubs
        for i, dx in enumerate((-4, -1, 2)):
            rect(im, cx + dx, 26 - (i % 2), cx + dx + 3, 26 - (i % 2), (200, 206, 214))
            put(im, cx + dx + 3, 26 - (i % 2), (140, 150, 160))


def veg_goods(im: Image.Image) -> None:
    for cx, items in ((11, [(60, 140, 60), (90, 170, 70)]), (24, [(220, 120, 40), (230, 140, 50)]), (37, [(200, 50, 40), (220, 70, 50)])):
        disc(im, cx, 30, 6.5, (190, 160, 100), squash=0.45)   # woven "nia" tray
        for i in range(6):
            disc(im, cx - 4 + (i % 3) * 3, 28 + (i // 3) * 2, 1.6, items[i % 2])


def rice_goods(im: Image.Image) -> None:
    for cx in (12, 24, 36):
        rect(im, cx - 5, 22, cx + 4, 31, (214, 196, 156)); rect(im, cx - 5, 22, cx + 4, 23, (196, 176, 136))  # sack
        disc(im, cx - 0.5, 22, 4.5, (246, 244, 236), squash=0.45)                                               # open top
    rect(im, 30, 18, 33, 21, (170, 170, 176))                                                                   # tin scoop


GOODS: dict[str, Callable[[Image.Image], None]] = {"fish": fish_goods, "veg": veg_goods, "rice": rice_goods}


def stall(kind: str) -> Image.Image:
    im = new(48, 48)
    soft_shadow(im, 24, 45, 22, 3, alpha=70)
    _umbrella(im, *UMBRELLAS[kind])
    vendor = frame(VENDORS[kind], "down", 0)
    im.alpha_composite(vendor, (16, 6))                         # seated behind the table
    rect(im, 30, 30, 35, 32, (200, 40, 36))                     # red plastic stool peeking out
    _table(im)
    GOODS[kind](im)
    outline(im, 0.45)
    return im


def make_market() -> list[dict]:
    files = []
    for kind in GOODS:
        save(stall(kind), f"sprites/props/stall_{kind}.png")
        files.append({"type": "image", "key": f"prop_stall_{kind}", "url": f"sprites/props/stall_{kind}.png"})
        save(frame(VENDORS[kind], "down", 0), f"sprites/npcs/vendor_{kind}.png")
        files.append({"type": "image", "key": f"vendor_{kind}", "url": f"sprites/npcs/vendor_{kind}.png"})
    return files
