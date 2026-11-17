"""Graphics step 3: town buildings, drawn freehand in code in a 3/4 top-down view
(lit from the top-left, selective dark outlines). Only the general look of
the player's style picture is learnt (warm saturated colours, tiled roofs,
lots of small detail); nothing is traced or copied.

- shophouse_0..5: narrow two-storey tube houses (nhà phố) with tiled roofs,
  shuttered windows, a balcony with potted plants and an open shop below.
- ubnd: the People's Committee hall: ochre facade, white portico, pediment
  with a star, red flag.
- post_office: a small yellow post office with white trim and arched openings.
- school: a long two-storey school with rows of blue windows and a flagpole.
"""
from __future__ import annotations

import random

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow

INK = (52, 36, 30)
WHITE = (244, 238, 222)
FLAG = (214, 40, 36)
STAR = (250, 220, 70)
GLASS = (126, 184, 210)
WALLS = [(236, 192, 98), (240, 224, 184), (156, 198, 214), (228, 164, 150), (176, 208, 162), (232, 206, 120)]
ROOFS = [(186, 82, 52), (160, 72, 52), (120, 92, 80), (196, 104, 60), (150, 62, 48), (176, 90, 60)]
SHUTTERS = [(66, 124, 92), (60, 104, 150), (126, 78, 50), (66, 124, 92), (156, 70, 56), (60, 104, 150)]


def tile_roof(im: Image.Image, x0: int, x1: int, y0: int, h: int, c, ridge: bool = True) -> None:
    """A clay-tile roof seen from the front: rows of half-round tiles (light top,
    dark scallop underneath), a capped ridge and a shadow under the eave."""
    hi, lo, dk = shade(c, 1.22), shade(c, 0.78), shade(c, 0.58)
    for y in range(y0, y0 + h):
        row = (y - y0) % 4
        for x in range(x0, x1 + 1):
            col = (x - x0 + (2 if ((y - y0) // 4) % 2 else 0)) % 4
            px = hi if row == 0 else c if row < 3 else lo
            if col == 3 and row > 0:
                px = lo if row < 3 else dk
            put(im, x, y, px)
    if ridge:
        rect(im, x0, y0, x1, y0 + 1, shade(c, 0.66)); rect(im, x0, y0, x1, y0, shade(c, 1.35))
    rect(im, x0, y0 + h, x1, y0 + h, dk)
    for x in (x0 - 1, x1 + 1):  # upturned eave tips
        put(im, x, y0 + h - 2, c); put(im, x, y0 + h - 3, hi)


def wall(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c, rnd: random.Random) -> None:
    """Rendered wall with a lit left edge, faint stains and a darker plinth."""
    rect(im, x0, y0, x1, y1, c)
    rect(im, x0, y0, x0 + 1, y1, shade(c, 1.12)); rect(im, x1, y0, x1, y1, shade(c, 0.85))
    for _ in range((x1 - x0) * (y1 - y0) // 40):
        put(im, rnd.randint(x0 + 2, x1 - 1), rnd.randint(y0, y1), shade(c, 0.93))
    rect(im, x0, y1 - 1, x1, y1, shade(c, 0.7))


def window(im: Image.Image, x: int, y: int, w: int, h: int, shutter, arched: bool = False) -> None:
    """A glazed window with a white frame and open shutters on both sides."""
    rect(im, x - 1, y - 1, x + w, y + h, WHITE)
    rect(im, x, y, x + w - 1, y + h - 1, GLASS)
    rect(im, x, y, x + w - 1, y, shade(GLASS, 0.7)); put(im, x + 1, y + 2, (220, 240, 246))
    rect(im, x + w // 2, y, x + w // 2, y + h - 1, WHITE)
    if arched:
        put(im, x - 1, y - 1, (0, 0, 0, 0)); put(im, x + w, y - 1, (0, 0, 0, 0))
        rect(im, x + 1, y - 2, x + w - 2, y - 2, WHITE)
    for sx in (x - 3, x + w + 1):
        rect(im, sx, y, sx + 1, y + h - 1, shutter)
        for yy in range(y + 1, y + h, 2):
            put(im, sx, yy, shade(shutter, 0.75))


def plant_pot(im: Image.Image, x: int, y: int, flower) -> None:
    rect(im, x, y + 2, x + 2, y + 4, (176, 92, 60)); rect(im, x, y + 2, x + 2, y + 2, (206, 120, 80))
    disc(im, x + 1, y, 2, (70, 140, 60)); put(im, x, y - 1, (110, 180, 80)); put(im, x + 2, y, flower)


def flag(im: Image.Image, x: int, top: int, bottom: int) -> None:
    rect(im, x, top, x, bottom, (210, 210, 214)); put(im, x, top - 1, STAR)
    rect(im, x + 1, top + 1, x + 10, top + 7, FLAG); rect(im, x + 1, top + 7, x + 10, top + 7, shade(FLAG, 0.7))
    for dx, dy in ((5, 3), (4, 4), (6, 4), (5, 4), (5, 5)):
        put(im, x + dx, top + dy, STAR)


def shophouse(v: int) -> Image.Image:
    """Nhà phố: a 3-tile-wide, two-storey tube house with an open shop downstairs."""
    rnd = random.Random(300 + v)
    c, roof, sh = WALLS[v % 6], ROOFS[v % 6], SHUTTERS[v % 6]
    im = new(48, 80)
    soft_shadow(im, 24, 77, 23, 3)
    wall(im, 3, 18, 44, 76, c, rnd)
    tile_roof(im, 1, 46, 4, 14, roof)
    window(im, 12, 23, 8, 11, sh)                                     # upstairs
    window(im, 29, 23, 8, 11, sh)
    rect(im, 4, 37, 43, 37, shade(c, 0.6))                             # balcony slab
    rect(im, 4, 38, 43, 39, WHITE)
    for x in range(5, 43, 3):                                          # balcony rail
        rect(im, x, 34, x, 37, WHITE)
    rect(im, 4, 33, 43, 33, WHITE)
    for i, x in enumerate((6, 21, 38)):
        plant_pot(im, x, 29, [(236, 92, 110), (250, 214, 92), (246, 246, 236)][(i + v) % 3])
    tile_roof(im, 2, 45, 42, 5, roof, ridge=False)                     # awning roof over the shop
    rect(im, 8, 49, 39, 53, shade(roof, 0.55) if v % 2 else (40, 92, 140))   # shop sign
    for x in range(11, 37, 3):
        put(im, x, 51, (250, 236, 180))
    rect(im, 6, 55, 41, 75, (62, 46, 38))                              # open shop front
    rect(im, 6, 55, 41, 56, (40, 30, 26))
    for y in (60, 66):                                                 # shelves of goods
        rect(im, 8, y, 39, y, (120, 84, 56))
        for x in range(9, 39, 2):
            put(im, x, y - 1, rnd.choice([(230, 196, 90), (206, 80, 60), (110, 170, 90), (230, 230, 220), (90, 140, 200)]))
    for x in (5, 42):
        rect(im, x, 55, x, 75, shade(c, 0.8))
    rect(im, 10, 71, 37, 72, (150, 106, 66)); rect(im, 10, 73, 11, 75, (110, 76, 48)); rect(im, 36, 73, 37, 75, (110, 76, 48))
    for x in range(12, 36, 4):                                         # goods on the counter
        disc(im, x + 1, 70, 1.6, rnd.choice([(232, 120, 60), (240, 200, 80), (120, 180, 80), (200, 60, 60)]))
    outline(im, 0.45)
    return im


def ubnd() -> Image.Image:
    """UBND: an ochre two-storey hall with a white columned portico, a pediment
    with a gold star, a hip roof and a red flag."""
    rnd = random.Random(331)
    im = new(128, 96)
    soft_shadow(im, 64, 93, 62, 3)
    ochre = (226, 148, 82)
    wall(im, 4, 34, 123, 90, ochre, rnd)
    tile_roof(im, 2, 125, 20, 14, (176, 70, 48))
    for x in list(range(10, 44, 12)) + list(range(84, 118, 12)):
        window(im, x, 42, 7, 12, (66, 124, 92), arched=True)
        window(im, x, 64, 7, 12, (66, 124, 92))
    rect(im, 44, 30, 83, 90, (240, 226, 196))                           # portico
    for y in range(16, 31):                                             # pediment
        half = (y - 16) * 1.4
        rect(im, round(64 - half), y, round(63 + half), y, (244, 232, 206))
    rect(im, 42, 30, 85, 31, shade(ochre, 0.7))
    disc(im, 64, 25, 3.5, FLAG); put(im, 64, 25, STAR); put(im, 63, 25, STAR); put(im, 65, 25, STAR); put(im, 64, 24, STAR)
    for x in (47, 56, 69, 78):                                          # columns
        rect(im, x, 34, x + 3, 82, WHITE); rect(im, x + 3, 34, x + 3, 82, (200, 192, 176))
    rect(im, 52, 34, 75, 38, FLAG)                                      # red banner
    for x in range(54, 74, 2):
        put(im, x, 36, STAR)
    rect(im, 58, 58, 69, 82, (120, 74, 46)); rect(im, 63, 58, 63, 82, (90, 54, 34))   # door
    for i, y in enumerate((83, 86, 89)):                                # steps
        rect(im, 44 - i * 2, y, 83 + i * 2, y + 2, (210, 204, 192)); rect(im, 44 - i * 2, y, 83 + i * 2, y, (236, 232, 222))
    for x in (8, 30, 92, 114):
        plant_pot(im, x, 84, (236, 92, 110))
    flag(im, 63, 0, 18)
    outline(im, 0.45)
    return im


def post_office() -> Image.Image:
    """Bưu điện: a yellow building with white trim, an arched door, a blue sign and a post box."""
    rnd = random.Random(341)
    im = new(64, 80)
    soft_shadow(im, 32, 77, 30, 3)
    yellow = (240, 196, 84)
    wall(im, 4, 26, 59, 76, yellow, rnd)
    tile_roof(im, 2, 61, 12, 14, (186, 82, 52))
    rect(im, 4, 26, 59, 28, WHITE); rect(im, 4, 50, 59, 51, WHITE)
    rect(im, 14, 31, 49, 38, (40, 92, 160)); rect(im, 14, 31, 49, 31, (90, 140, 200))   # sign
    for x in range(17, 47, 3):
        put(im, x, 34, (250, 250, 240)); put(im, x + 1, 35, (250, 250, 240))
    for x in (9, 47):
        window(im, x, 40, 7, 8, (60, 104, 150), arched=True)
        window(im, x, 56, 7, 11, (60, 104, 150), arched=True)
    for y in range(54, 76):                                             # arched door
        w = 6 if y > 58 else 6 - (58 - y)
        rect(im, 32 - w, y, 31 + w, y, (96, 62, 40))
    rect(im, 31, 58, 32, 75, (70, 44, 28))
    rect(im, 52, 64, 56, 75, (220, 60, 50)); rect(im, 52, 64, 56, 65, (250, 120, 100))   # post box
    outline(im, 0.45)
    return im


def school() -> Image.Image:
    """Trường học: a long cream two-storey school with blue windows, a red roof and a flagpole."""
    rnd = random.Random(351)
    im = new(144, 88)
    soft_shadow(im, 72, 85, 70, 3)
    wall(im, 4, 28, 139, 82, (238, 228, 196), rnd)
    tile_roof(im, 2, 141, 14, 14, (176, 70, 48))
    rect(im, 4, 54, 139, 56, (226, 148, 82))                            # corridor band
    for x in range(10, 136, 14):
        if 62 <= x <= 78:
            continue
        window(im, x, 33, 8, 12, (60, 104, 150))
        window(im, x, 62, 8, 12, (60, 104, 150))
    rect(im, 60, 24, 83, 82, (226, 148, 82)); tile_roof(im, 58, 85, 12, 12, (176, 70, 48))   # stair tower
    rect(im, 63, 30, 80, 35, (40, 92, 160))
    for x in range(65, 79, 2):
        put(im, x, 32, (250, 250, 240))
    rect(im, 66, 62, 77, 82, (96, 62, 40)); rect(im, 71, 62, 72, 82, (70, 44, 28))
    flag(im, 140, 2, 40)
    outline(im, 0.45)
    return im


def make_town_buildings() -> list[dict]:
    files = []
    sprites = [(f"shophouse_{v}", lambda v=v: shophouse(v)) for v in range(6)]
    sprites += [("ubnd", ubnd), ("post_office", post_office), ("school", school)]
    for key, draw in sprites:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
