"""Building exteriors in a Vietnamese countryside style, as single sprites
(3/4 top-down view: roof plane on top, front wall below).

Clay-tile roof in vertical rows with scalloped ends, a heavy ridge with
upturned ends, lime-washed yellow walls behind a porch of round wooden
columns, a raised brick terrace, panelled double doors and barred wooden
windows. Shops get a red signboard with a pictogram instead of text.

The sprite's bottom edge is the building's front at ground level; maps put an
invisible collision footprint under it and a door trigger on the door tile.
"""
from __future__ import annotations

import random
from dataclasses import dataclass

from PIL import Image

from .common import P, T, disc, new, outline, put, rect, save, shade, soft_shadow

MORTAR = (214, 204, 184)
BRICK = (158, 80, 54)
COLUMN = (120, 76, 44)
DOOR = (96, 56, 34)


@dataclass(frozen=True)
class Style:
    w: int                      # width in tiles
    h: int                      # sprite height in tiles
    door: int                   # door column (tiles from left)
    windows: tuple[int, ...]
    wall: tuple[int, int, int] = (222, 184, 104)
    roof: tuple[int, int, int] = (176, 84, 54)
    wall_h: int = 42
    sign: str | None = None     # seed | bowl | wheel


def _roof(im: Image.Image, st: Style, top: int, bottom: int) -> None:
    W = im.width
    for y in range(top, bottom + 1):
        light = 1.08 - 0.16 * (y - top) / max(1, bottom - top)
        course = (y - top) % 5
        for x in range(W):
            lane = x % 4
            f = light * (0.72 if lane == 0 else 1.16 if lane == 1 else 1.0)
            if course == 4 and lane in (1, 2):      # scalloped tile ends ("mũi hài")
                f *= 0.78
            put(im, x, y, shade(st.roof, f))
    # eave: a row of rounded tile ends and a shadow line
    for x in range(1, W - 1, 4):
        put(im, x, bottom, shade(st.roof, 1.3)); put(im, x + 1, bottom, shade(st.roof, 1.1))
    rect(im, 0, bottom + 1, W - 1, bottom + 2, shade(st.roof, 0.42))
    rect(im, 0, top, 1, bottom, shade(st.roof, 0.55)); rect(im, W - 2, top, W - 1, bottom, shade(st.roof, 0.5))
    # ridge with mortar line and upturned ends ("đầu đao")
    rect(im, 2, top - 4, W - 3, top, shade(st.roof, 0.6))
    rect(im, 2, top - 3, W - 3, top - 3, MORTAR)
    for i in range(5):
        for x in (2 - i // 2, W - 3 + i // 2):
            put(im, x, top - 4 - i, shade(st.roof, 0.6))
        put(im, 2 - i // 2 + 1, top - 4 - i, MORTAR) if i < 4 else None


def _walls(im: Image.Image, st: Style, top: int) -> None:
    W, H = im.width, im.height
    rnd = random.Random(W * 13 + top)
    rect(im, 3, top, W - 4, H - 6, st.wall)
    for _ in range(W // 2):                      # weathered lime-wash patches
        x, y = rnd.randrange(4, W - 5), rnd.randrange(top + 6, H - 8)
        rect(im, x, y, x + rnd.randint(1, 3), y, shade(st.wall, 0.92))
    rect(im, 3, H - 9, W - 4, H - 6, shade(st.wall, 0.8))   # damp band near the ground
    rect(im, 3, top, W - 4, top + 6, shade(st.wall, 0.55))  # deep porch shadow under the eave
    # raised brick terrace
    rect(im, 1, H - 5, W - 2, H - 1, BRICK)
    rect(im, 1, H - 5, W - 2, H - 5, shade(BRICK, 1.25))
    for y in (H - 3,):
        rect(im, 1, y, W - 2, y, MORTAR)
    for x in range(2, W - 2, 6):
        put(im, x, H - 4, MORTAR); put(im, x + 3, H - 2, MORTAR)


def _columns(im: Image.Image, top: int, xs: list[int]) -> None:
    H = im.height
    for x in xs:
        rect(im, x - 1, top + 2, x + 2, H - 6, COLUMN)
        rect(im, x - 1, top + 2, x - 1, H - 6, shade(COLUMN, 1.3))
        rect(im, x + 2, top + 2, x + 2, H - 6, shade(COLUMN, 0.7))
        rect(im, x - 2, H - 7, x + 3, H - 5, P["r2"])           # stone base


def _window(im: Image.Image, cx: int, top: int) -> None:
    x0, x1, y0, y1 = cx - 6, cx + 5, top + 12, top + 24
    rect(im, x0 - 1, y0 - 1, x1 + 1, y1 + 1, P["k0"])
    rect(im, x0, y0, x1, y1, (54, 42, 36))
    for x in range(x0 + 1, x1, 2):                            # wooden bars ("song cửa")
        rect(im, x, y0, x, y1, P["k2"])
    rect(im, x0, y0 + 4, x1, y0 + 4, P["k1"])


def _door(im: Image.Image, cx: int) -> None:
    H = im.height
    x0, x1, y0 = cx - 7, cx + 6, H - 30
    rect(im, x0 - 2, y0 - 2, x1 + 2, H - 5, P["k0"])
    rect(im, x0, y0, x1, H - 5, DOOR)
    rect(im, cx, y0, cx, H - 5, shade(DOOR, 0.6))                  # two leaves
    for y in (y0 + 6, y0 + 15):
        rect(im, x0 + 1, y, x1 - 1, y, shade(DOOR, 0.7))
        rect(im, x0 + 1, y + 1, x1 - 1, y + 1, shade(DOOR, 1.2))
    for x in range(x0 + 1, x1, 2):                                  # lattice transom
        put(im, x, y0 + 2, shade(DOOR, 1.35))
    put(im, cx - 2, y0 + 12, (210, 170, 80)); put(im, cx + 2, y0 + 12, (210, 170, 80))


def _sign(im: Image.Image, cx: int, y: int, kind: str) -> None:
    rect(im, cx - 10, y, cx + 9, y + 10, (190, 150, 60))
    rect(im, cx - 9, y + 1, cx + 8, y + 9, (168, 40, 34))
    if kind == "seed":      # a sack with a sprout
        disc(im, cx, y + 6, 3, (214, 190, 130)); rect(im, cx, y + 1, cx, y + 3, (120, 180, 80))
        put(im, cx - 1, y + 2, (120, 180, 80)); put(im, cx + 1, y + 1, (120, 180, 80))
    elif kind == "bowl":    # steaming rice bowl
        rect(im, cx - 4, y + 5, cx + 3, y + 6, (240, 236, 224)); rect(im, cx - 3, y + 7, cx + 2, y + 7, (240, 236, 224))
        put(im, cx - 2, y + 3, (240, 236, 224)); put(im, cx + 1, y + 2, (240, 236, 224))
    elif kind == "wheel":   # a wheel
        disc(im, cx, y + 5, 3.5, (40, 36, 36)); disc(im, cx, y + 5, 1.5, (200, 196, 190))


def building(st: Style) -> Image.Image:
    W, H = st.w * T, st.h * T
    im = new(W, H)
    wall_top = H - st.wall_h
    _walls(im, st, wall_top)
    for col in st.windows:
        _window(im, col * T + T // 2, wall_top)
    _door(im, st.door * T + T // 2)
    door_x = st.door * T + T // 2
    posts = [6] + [c * T for c in range(2, st.w - 1, 2)] + [W - 8]
    _columns(im, wall_top, [x for x in posts if abs(x - door_x) > 11])
    _roof(im, st, 9, wall_top + 2)
    if st.sign:
        _sign(im, st.door * T + T // 2, wall_top + 3, st.sign)
    outline(im, 0.4)
    shadowed = new(W, H)
    soft_shadow(shadowed, W / 2, H - 2, W / 2, 3, alpha=60)
    shadowed.alpha_composite(im)
    return shadowed


def warehouse() -> Image.Image:
    """Farm warehouse / vehicle shed: dark vertical boards, tiled roof and a
    wide double barn door with cross bracing (2 tiles wide, in the middle)."""
    st = Style(w=6, h=5, door=0, windows=(), wall=(110, 72, 46), roof=(150, 72, 50), wall_h=46)
    W, H = st.w * T, st.h * T
    im = new(W, H)
    top = H - st.wall_h
    for x in range(3, W - 3):                                   # vertical boards
        c = st.wall if x % 5 else shade(st.wall, 0.7)
        if x % 5 == 1:
            c = shade(st.wall, 1.18)
        rect(im, x, top, x, H - 6, c)
    rect(im, 3, top, W - 4, top + 5, shade(st.wall, 0.5))       # shadow under the eave
    rect(im, 1, H - 5, W - 2, H - 1, P["r1"]); rect(im, 1, H - 5, W - 2, H - 5, P["r2"])   # stone footing
    x0, x1, y0 = W // 2 - 15, W // 2 + 14, H - 36                # barn door
    rect(im, x0 - 2, y0 - 2, x1 + 2, H - 5, P["k0"])
    for half in ((x0, W // 2 - 1), (W // 2 + 1, x1)):
        a, b = half
        rect(im, a, y0, b, H - 6, (138, 92, 56))
        for x in range(a, b + 1, 4):
            rect(im, x, y0, x, H - 6, (112, 74, 44))
        rect(im, a, y0, b, y0 + 1, (164, 114, 72)); rect(im, a, H - 7, b, H - 6, (98, 62, 38))
        for i in range(b - a + 1):                                # X bracing
            yy = y0 + round(i * (H - 6 - y0) / (b - a))
            put(im, a + i, yy, (164, 114, 72)); put(im, b - i, yy, (164, 114, 72))
    rect(im, W // 2 - 1, y0, W // 2, H - 6, P["k0"])
    for cx in (14, W - 15):                                       # small high windows
        rect(im, cx - 4, top + 9, cx + 4, top + 15, P["k0"]); rect(im, cx - 3, top + 10, cx + 3, top + 14, (54, 42, 36))
        for x in range(cx - 2, cx + 3, 2):
            rect(im, x, top + 10, x, top + 14, P["k2"])
    _roof(im, st, 9, top + 2)
    outline(im, 0.4)
    shadowed = new(W, H)
    soft_shadow(shadowed, W / 2, H - 2, W / 2, 3, alpha=60)
    shadowed.alpha_composite(im)
    return shadowed


BUILDINGS = {
    "farmhouse": Style(w=7, h=6, door=3, windows=(1, 5), wall_h=46),
    "shop": Style(w=6, h=5, door=2, windows=(4,), wall=(230, 204, 140), roof=(156, 74, 50), sign="seed"),
    # Old tile-roofed village houses (nhà ngói): aged lime wash and weathered tiles, no signboard.
    "house_a": Style(w=5, h=5, door=2, windows=(1, 3), wall=(204, 170, 110), roof=(134, 72, 54)),
    "house_b": Style(w=5, h=5, door=2, windows=(1, 3), wall=(168, 112, 84), roof=(116, 66, 52)),  # bare brick
    # The two shops in Đồng Hới keep a signboard (house_c is the thatched cottage, old_village.py).
    "grocery_house": Style(w=5, h=5, door=2, windows=(1, 3), wall=(204, 170, 110), roof=(134, 72, 54), sign="bowl"),
    "vehicle_house": Style(w=5, h=5, door=2, windows=(1, 3), wall=(168, 112, 84), roof=(116, 66, 52), sign="wheel"),
}


def make_buildings() -> list[dict]:
    files = []
    for name, st in BUILDINGS.items():
        rel = f"sprites/props/{name}.png"
        save(building(st), rel)
        files.append({"type": "image", "key": f"prop_{name}", "url": rel})
    save(warehouse(), "sprites/props/warehouse.png")
    files.append({"type": "image", "key": "prop_warehouse", "url": "sprites/props/warehouse.png"})
    return files
