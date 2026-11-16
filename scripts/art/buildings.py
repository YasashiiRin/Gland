"""Building exteriors as single sprites (3/4 top-down view: roof plane on top,
front wall below). One parametric drawing routine makes the farmhouse, the
village houses and the seed shop, so they share one consistent style.

The sprite's bottom edge is the building's front at ground level; maps put an
invisible collision footprint under it and a door trigger on the door tile.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field

from PIL import Image

from .common import P, T, new, outline, put, rect, save, shade, soft_shadow


@dataclass(frozen=True)
class Style:
    w: int                      # width in tiles
    h: int                      # sprite height in tiles
    door: int                   # door column (tiles from left)
    windows: tuple[int, ...]
    wall: tuple[int, int, int] = (150, 102, 66)
    roof: tuple[int, int, int] = (138, 62, 50)
    shutters: tuple[int, int, int] = (72, 104, 96)
    wall_h: int = 40
    siding: bool = True         # wooden planks; False = plaster with timber frame
    chimney: bool = False
    dormer: bool = False
    awning: tuple[int, int, int] | None = None
    flowers: tuple[tuple[int, int, int], ...] = field(default=((206, 92, 96), (232, 196, 92)))


def _roof(im: Image.Image, st: Style, top: int, bottom: int) -> None:
    W = im.width
    base = st.roof
    for y in range(top, bottom + 1):
        row = (y - top) // 5
        within = (y - top) % 5
        light = 1.06 - 0.12 * (y - top) / max(1, bottom - top)
        c = shade(base, light)
        if within == 0:
            c = shade(base, light * 1.18)
        elif within == 4:
            c = shade(base, light * 0.72)
        for x in range(0, W):
            put(im, x, y, c)
        if within in (1, 2, 3):
            off = 0 if row % 2 == 0 else 4
            for x in range(off, W, 8):
                put(im, x, y, shade(base, light * 0.8))
    rect(im, 0, top, W - 1, top + 2, shade(base, 0.6))           # ridge cap
    rect(im, 0, top, W - 1, top, shade(base, 1.25))
    rect(im, 0, top, 1, bottom, shade(base, 0.55))                 # barge boards
    rect(im, W - 2, top, W - 1, bottom, shade(base, 0.5))
    rect(im, 0, bottom, W - 1, bottom + 1, shade(base, 0.45))      # eave


def _walls(im: Image.Image, st: Style, top: int) -> None:
    W, H = im.width, im.height
    x0, x1 = 3, W - 4
    if st.siding:
        for y in range(top, H - 5):
            within = (y - top) % 4
            c = st.wall if within else shade(st.wall, 1.15)
            if within == 3:
                c = shade(st.wall, 0.78)
            rect(im, x0, y, x1, y, c)
    else:
        rect(im, x0, top, x1, H - 6, st.wall)
        rect(im, x0, top + 1, x1, top + 2, P["k1"])
        for x in range(x0, x1 + 1, T * 2):
            rect(im, x, top, x + 1, H - 6, P["k1"])
    rect(im, x0, top, x1, top + 3, shade(st.wall, 0.6))          # shadow under the eave
    rect(im, x0, top, x0 + 2, H - 6, P["k1"]); rect(im, x1 - 2, top, x1, H - 6, P["k0"])
    rnd = random.Random(W * 7 + top)
    rect(im, x0 - 1, H - 6, x1 + 1, H - 1, P["r1"])               # stone foundation
    for y in (H - 6, H - 3):
        for x in range(x0 - 1 + rnd.randint(0, 3), x1, 6):
            rect(im, x, y + 1, x + 4, y + 2, P["r2"]); put(im, x, y + 1, P["r3"])


def _window(im: Image.Image, st: Style, cx: int, top: int) -> None:
    x0, x1, y0, y1 = cx - 6, cx + 5, top + 7, top + 19
    rect(im, x0 - 3, y0, x0 - 1, y1, st.shutters); rect(im, x1 + 1, y0, x1 + 3, y1, shade(st.shutters, 0.8))
    rect(im, x0, y0, x1, y1, P["k3"])
    for y in range(y0 + 1, y1):
        t = (y - y0) / (y1 - y0)
        rect(im, x0 + 1, y, x1 - 1, y, (int(96 + 60 * t), int(140 + 40 * t), int(160 + 20 * t)))
    rect(im, cx, y0 + 1, cx, y1 - 1, P["k2"]); rect(im, x0 + 1, (y0 + y1) // 2, x1 - 1, (y0 + y1) // 2, P["k2"])
    for d in range(3):
        put(im, x0 + 2 + d, y0 + 4 - d, (214, 236, 236))
    rect(im, x0 - 2, y1 + 1, x1 + 2, y1 + 3, P["k1"])              # flower box
    for i, x in enumerate(range(x0 - 1, x1 + 2, 2)):
        put(im, x, y1, st.flowers[i % len(st.flowers)]); put(im, x + 1, y1, P["f2"])


def _door(im: Image.Image, st: Style, cx: int) -> None:
    H = im.height
    x0, x1, y0 = cx - 6, cx + 5, H - 26
    rect(im, x0 - 2, y0 - 2, x1 + 2, H - 4, P["k0"])
    rect(im, x0, y0, x1, H - 4, P["k2"])
    for x in range(x0 + 2, x1, 3):
        rect(im, x, y0 + 1, x, H - 5, P["k1"])
    put(im, x1 - 2, y0 + 12, (220, 186, 90))
    rect(im, x0 - 3, H - 3, x1 + 3, H - 1, P["r2"]); rect(im, x0 - 3, H - 3, x1 + 3, H - 3, P["r3"])  # step


def _chimney(im: Image.Image, x: int, bottom: int) -> None:
    rect(im, x, 0, x + 9, bottom, P["r1"])
    for y in range(1, bottom, 3):
        off = 0 if (y // 3) % 2 else 2
        for bx in range(x + off, x + 9, 4):
            put(im, bx, y, P["r2"]); put(im, bx + 1, y, P["r2"])
    rect(im, x - 1, 0, x + 10, 1, P["r0"])


def _dormer(im: Image.Image, st: Style, cx: int, y: int) -> None:
    rect(im, cx - 9, y + 6, cx + 9, y + 18, st.wall)
    for i in range(10):
        rect(im, cx - 10 + i, y + 6 - i // 2 + 0, cx + 10 - i, y + 6 - i // 2, shade(st.roof, 0.9))
    rect(im, cx - 4, y + 8, cx + 4, y + 16, P["k3"]); rect(im, cx - 3, y + 9, cx + 3, y + 15, (110, 150, 168))
    rect(im, cx, y + 9, cx, y + 15, P["k2"])
    rect(im, cx - 10, y + 18, cx + 10, y + 19, shade(st.roof, 0.5))


def _awning(im: Image.Image, color: tuple[int, int, int], top: int) -> None:
    W = im.width
    for y in range(top, top + 7):
        for x in range(2, W - 2):
            put(im, x, y, color if (x // 5) % 2 == 0 else P["white"])
    for x in range(2, W - 2, 5):
        put(im, x + 2, top + 7, color if (x // 5) % 2 == 0 else P["white"])
    rect(im, 2, top + 7, W - 3, top + 7, shade(color, 0.6))


def building(st: Style) -> Image.Image:
    W, H = st.w * T, st.h * T
    im = new(W, H)
    wall_top = H - st.wall_h
    roof_top = 10 if st.chimney else 3
    _walls(im, st, wall_top)
    _roof(im, st, roof_top, wall_top + 1)
    if st.dormer:
        _dormer(im, st, W // 2, roof_top + (wall_top - roof_top) // 3)
    if st.chimney:
        _chimney(im, W - 26, roof_top + 8)
    for col in st.windows:
        _window(im, st, col * T + T // 2, wall_top)
    if st.awning:
        _awning(im, st.awning, wall_top + 2)
    _door(im, st, st.door * T + T // 2)
    outline(im, 0.4)
    shadowed = new(W, H)
    soft_shadow(shadowed, W / 2, H - 2, W / 2, 3, alpha=60)
    shadowed.alpha_composite(im)
    return shadowed


BUILDINGS = {
    "farmhouse": Style(w=7, h=6, door=3, windows=(1, 5), chimney=True, dormer=True, wall_h=44),
    "shop": Style(w=6, h=5, door=2, windows=(4,), wall=(196, 178, 140), roof=(66, 92, 112), siding=False,
                  awning=(170, 70, 64), wall_h=38),
    "house_a": Style(w=5, h=5, door=2, windows=(0, 4), wall=(206, 190, 156), roof=(150, 82, 52), siding=False),
    "house_b": Style(w=5, h=5, door=2, windows=(0, 4), wall=(132, 112, 92), roof=(84, 98, 72), shutters=(140, 70, 60)),
    "house_c": Style(w=5, h=5, door=2, windows=(0, 4), wall=(176, 132, 96), roof=(108, 70, 96), shutters=(70, 90, 120)),
}


def make_buildings() -> list[dict]:
    files = []
    for name, st in BUILDINGS.items():
        rel = f"sprites/props/{name}.png"
        save(building(st), rel)
        files.append({"type": "image", "key": f"prop_{name}", "url": rel})
    return files
