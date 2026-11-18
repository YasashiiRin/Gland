"""Old Vietnamese village buildings (the game is set in Vietnam of the old days).

Every ordinary building that is not a landmark is drawn in the style of an
old village: thatched cottages with mud walls, and tile-roofed houses of
wood and lime. Each keeps the sprite size and footprint of the building it
replaces, so the maps don't change:

- house_c: nhà tranh vách đất, a thatched cottage with mud walls and a bamboo porch.
- shophouse_0..5: nhà phố cổ, single-storey wooden shopfronts under heavy tile roofs.
- ubnd: the đình làng (village communal house): a huge roof with curled eaves.
- post_office: a quán nước (roadside tea house) under thatch.
- school: the trường làng, a long thatched classroom with lattice windows.
- street_lamp: a wooden post with an oil lantern.

Window and door positions match src/data/houseLights.json (oil-lamp glow at night).
"""
from __future__ import annotations

import random

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

THATCH = (196, 164, 96)
THATCH_D = (156, 124, 70)
MUD = (172, 132, 90)
BAMBOO = (170, 150, 80)
WOOD = (112, 72, 44)
DARK = (46, 34, 28)
TILE_OLD = (128, 70, 52)
LANTERN = (204, 50, 40)


def thatch(im: Image.Image, x0: int, x1: int, y0: int, y1: int, rnd: random.Random, slope: int = 2) -> None:
    """A thick straw roof: a trapezoid narrowing to the ridge, combed straw strands, a heavy eave."""
    h = y1 - y0
    for y in range(y0, y1 + 1):
        inset = (y1 - y) // slope
        a, b = x0 + inset, x1 - inset
        if a > b:
            continue
        rect(im, a, y, b, y, THATCH)
        for x in range(a, b + 1):
            r = rnd.random()
            if r < 0.22:
                put(im, x, y, THATCH_D)
            elif r < 0.3:
                put(im, x, y, shade(THATCH, 1.15))
        put(im, a, y, shade(THATCH, 0.7)); put(im, b, y, shade(THATCH, 0.7))
    top_inset = h // slope
    rect(im, x0 + top_inset - 1, y0 - 1, x1 - top_inset + 1, y0 + 1, shade(THATCH_D, 0.8))     # ridge bundle
    rect(im, x0, y1 - 1, x1, y1 + 1, THATCH_D)                                                # eave edge
    for x in range(x0, x1 + 1, 2):
        put(im, x, y1 + 2, THATCH_D)                                                          # ragged straw ends


def mud_wall(im: Image.Image, x0: int, y0: int, x1: int, y1: int, rnd: random.Random) -> None:
    """Wattle and daub: earthy wall with straw flecks, a crack or two and a darker footing."""
    rect(im, x0, y0, x1, y1, MUD)
    for _ in range((x1 - x0) * (y1 - y0) // 12):
        put(im, rnd.randint(x0, x1), rnd.randint(y0, y1), rnd.choice([shade(MUD, 0.88), shade(MUD, 1.1), THATCH]))
    for _ in range(2):
        x, y = rnd.randint(x0 + 3, x1 - 3), rnd.randint(y0 + 3, y1 - 6)
        for i in range(4):
            put(im, x + (i % 2), y + i, shade(MUD, 0.7))
    rect(im, x0, y0, x1, y0 + 3, shade(MUD, 0.55))                                            # shadow under the eave
    rect(im, x0, y1 - 2, x1, y1, shade(MUD, 0.75))


def lattice(im: Image.Image, cx: int, cy: int, w: int = 10, h: int = 8) -> None:
    """A small window with bamboo bars, dark inside (lit by the oil lamp at night in the game)."""
    x0, y0 = cx - w // 2, cy - h // 2
    rect(im, x0 - 1, y0 - 1, x0 + w, y0 + h, WOOD)
    rect(im, x0, y0, x0 + w - 1, y0 + h - 1, DARK)
    for x in range(x0 + 1, x0 + w - 1, 2):
        rect(im, x, y0, x, y0 + h - 1, BAMBOO)


def plank_door(im: Image.Image, cx: int, top: int, bottom: int, w: int = 12) -> None:
    x0 = cx - w // 2
    rect(im, x0 - 1, top - 1, x0 + w, bottom, DARK)
    rect(im, x0, top, x0 + w - 1, bottom, (98, 64, 40))
    for x in range(x0 + 2, x0 + w - 1, 3):
        rect(im, x, top, x, bottom, (78, 50, 32))
    rect(im, cx, top, cx, bottom, DARK)


def post(im: Image.Image, x: int, top: int, bottom: int, c=BAMBOO) -> None:
    rect(im, x, top, x + 1, bottom, c); rect(im, x, top, x, bottom, shade(c, 1.25))
    for y in range(top + 4, bottom, 6):
        put(im, x, y, shade(c, 0.7)); put(im, x + 1, y, shade(c, 0.7))                         # bamboo nodes


def hanging_lantern(im: Image.Image, x: int, y: int) -> None:
    rect(im, x, y - 3, x, y - 1, DARK)
    disc(im, x, y + 2, 2.5, LANTERN, squash=1.3)
    put(im, x, y + 6, (230, 190, 70))


def tile_roof(im: Image.Image, x0: int, x1: int, y0: int, y1: int, c=TILE_OLD, curl: int = 3, moss: float = 0.05,
              rnd: random.Random | None = None) -> None:
    """Old yin-yang clay tiles in vertical lanes, darkened with age and a little moss, ridge and curled corners."""
    rnd = rnd or random.Random(x0 * 7 + y0)
    for y in range(y0, y1 + 1):
        light = 1.06 - 0.18 * (y - y0) / max(1, y1 - y0)
        for x in range(x0, x1 + 1):
            lane = (x - x0) % 4
            f = light * (0.7 if lane == 0 else 1.14 if lane == 1 else 1.0)
            put(im, x, y, shade(c, f))
            if rnd.random() < moss:
                put(im, x, y, (96, 112, 64))
    for x in range(x0 + 1, x1, 4):
        put(im, x, y1, shade(c, 1.3))
    rect(im, x0, y1 + 1, x1, y1 + 2, shade(c, 0.4))
    rect(im, x0 + 2, y0 - 3, x1 - 2, y0, shade(c, 0.55)); rect(im, x0 + 2, y0 - 2, x1 - 2, y0 - 2, (200, 190, 170))
    for i in range(curl):                                                                    # upturned ridge ends
        put(im, x0 + 2 - i // 2, y0 - 3 - i, shade(c, 0.55)); put(im, x1 - 2 + i // 2, y0 - 3 - i, shade(c, 0.55))
        put(im, x0 - i, y1 - i, shade(c, 0.8)); put(im, x1 + i, y1 - i, shade(c, 0.8))       # curled eave corners


def _finish(im: Image.Image) -> Image.Image:
    outline(im, 0.42)
    out = new(im.width, im.height)
    soft_shadow(out, im.width / 2, im.height - 2, im.width / 2, 3, alpha=60)
    out.alpha_composite(im)
    return out


# ------------------------------------------------------------------ buildings
def thatched_cottage() -> Image.Image:
    """house_c (80x80): nhà tranh vách đất with a bamboo porch."""
    rnd = random.Random(501)
    im = new(80, 80)
    rect(im, 2, 75, 77, 79, (150, 116, 78)); rect(im, 2, 75, 77, 75, (176, 140, 98))         # beaten earth terrace
    mud_wall(im, 6, 44, 73, 75, rnd)
    lattice(im, 18, 56); lattice(im, 62, 56)
    plank_door(im, 40, 50, 74, 14)
    for x in (4, 28, 50, 74):
        post(im, x, 42, 75)
    thatch(im, 0, 79, 8, 44, rnd)
    return _finish(im)


def shophouse(v: int) -> Image.Image:
    """shophouse_v (48x80): one storey, wooden front, open shop, old tile roof, a red lantern."""
    rnd = random.Random(600 + v)
    roofs = [TILE_OLD, (112, 66, 50), (140, 82, 56), (120, 76, 60), (134, 70, 48), (104, 70, 56)]
    im = new(48, 80)
    rect(im, 3, 44, 44, 77, WOOD)
    for x in range(3, 45, 3):
        rect(im, x, 44, x, 77, shade(WOOD, 0.8))                                              # plank wall
    rect(im, 3, 44, 44, 47, shade(WOOD, 0.5))
    rect(im, 7, 52, 40, 76, DARK)                                                            # open shop front
    for y in (59, 66):
        rect(im, 8, y, 39, y, (120, 84, 56))
        for x in range(9, 39, 2):
            put(im, x, y - 1, rnd.choice([(220, 190, 110), (180, 70, 50), (110, 150, 80), (226, 220, 200), (150, 110, 70)]))
    rect(im, 9, 71, 38, 72, (150, 106, 66))                                                 # counter
    for x in range(11, 37, 4):
        disc(im, x + 1, 70, 1.5, rnd.choice([(214, 120, 60), (230, 196, 90), (120, 160, 80)]))
    rect(im, 1, 77, 46, 79, (150, 140, 128))                                                 # stone step
    rect(im, 12, 48, 35, 51, (60, 40, 30)); rect(im, 13, 49, 34, 50, (160, 120, 60))        # carved name board
    tile_roof(im, 0, 47, 26, 43, roofs[v % 6], rnd=rnd)
    hanging_lantern(im, 9, 46)
    if v % 2:
        hanging_lantern(im, 38, 46)
    return _finish(im)


def dinh_lang() -> Image.Image:
    """ubnd (128x96): the đình làng - a huge dark tile roof with curled corners over an open hall of columns."""
    rnd = random.Random(700)
    im = new(128, 96)
    for i, y in enumerate((89, 92)):                                                         # stone steps
        rect(im, 4 + i * 4, y, 123 - i * 4, y + 3, (168, 160, 146)); rect(im, 4 + i * 4, y, 123 - i * 4, y, (196, 190, 178))
    rect(im, 2, 84, 125, 89, (150, 142, 128)); rect(im, 2, 84, 125, 84, (186, 178, 164))   # raised stone floor
    rect(im, 10, 56, 117, 84, DARK)                                                          # deep open hall
    rect(im, 52, 66, 75, 84, (120, 40, 30)); rect(im, 56, 70, 71, 74, (220, 170, 70))       # altar with gilt
    for x in (60, 67):
        rect(im, x, 64, x, 69, (230, 200, 110))                                              # candles
    for x in (10, 30, 50, 76, 96, 116):
        rect(im, x, 56, x + 2, 84, (126, 52, 36)); rect(im, x, 56, x, 84, (160, 76, 52))     # lim-wood columns
    tile_roof(im, 0, 127, 16, 55, (104, 64, 52), curl=6, moss=0.08, rnd=rnd)
    for i in range(8):                                                                       # big curled roof corners (đầu đao)
        put(im, 2 - i // 2, 55 - i * 2, (104, 64, 52)); put(im, 125 + i // 2, 55 - i * 2, (104, 64, 52))
        put(im, 3 - i // 2, 55 - i * 2, (130, 82, 64)); put(im, 124 + i // 2, 55 - i * 2, (130, 82, 64))
    disc(im, 64, 11, 3, (216, 190, 120))                                                     # moon pearl on the ridge
    for i in range(10):
        put(im, 56 - i, 12 - i // 3, (160, 150, 120)); put(im, 72 + i, 12 - i // 3, (160, 150, 120))  # two dragons
    hanging_lantern(im, 30, 58); hanging_lantern(im, 98, 58)
    return _finish(im)


def tea_house() -> Image.Image:
    """post_office (64x80): a quán nước - thatch on bamboo posts, a low table, a teapot, a lantern."""
    rnd = random.Random(800)
    im = new(64, 80)
    rect(im, 2, 74, 61, 79, (160, 126, 86)); rect(im, 2, 74, 61, 74, (186, 150, 106))
    mud_wall(im, 6, 48, 57, 60, rnd)                                                         # back wall seen under the eave
    rect(im, 6, 60, 57, 74, (130, 98, 66))
    for x in (4, 58):
        post(im, x, 46, 74)
    rect(im, 16, 64, 47, 66, WOOD); rect(im, 18, 67, 19, 73, WOOD); rect(im, 44, 67, 45, 73, WOOD)   # low table
    disc(im, 26, 62, 2.5, (90, 110, 120)); put(im, 29, 61, (90, 110, 120))                  # teapot
    for x in (34, 38):
        rect(im, x, 62, x + 1, 63, (230, 226, 210))                                           # cups
    rect(im, 10, 70, 14, 71, BAMBOO); rect(im, 50, 70, 54, 71, BAMBOO)                      # stools
    thatch(im, 0, 63, 26, 46, rnd, slope=3)
    hanging_lantern(im, 14, 50)
    return _finish(im)


def village_school() -> Image.Image:
    """school (144x88): a long thatched classroom with lattice windows and a bell by the door."""
    rnd = random.Random(900)
    im = new(144, 88)
    rect(im, 2, 82, 141, 87, (150, 116, 78)); rect(im, 2, 82, 141, 82, (176, 140, 98))
    mud_wall(im, 6, 52, 137, 82, rnd)
    for cx in (20, 44, 100, 124):
        lattice(im, cx, 66, 14, 10)
    plank_door(im, 72, 58, 81, 16)
    for x in (4, 32, 58, 86, 112, 138):
        post(im, x, 50, 82)
    rect(im, 88, 60, 89, 64, DARK); disc(im, 88, 66, 2.5, (176, 140, 60))                   # school bell (kẻng)
    thatch(im, 0, 143, 12, 52, rnd)
    return _finish(im)


def oil_lamp_post() -> Image.Image:
    """street_lamp (16x40): a wooden post with a crossbar and a hanging glass oil lantern."""
    im = new(16, 40)
    soft_shadow(im, 8, 38, 4, 1.5)
    rect(im, 4, 4, 5, 38, WOOD); rect(im, 4, 4, 4, 38, shade(WOOD, 1.3))
    rect(im, 4, 4, 12, 5, WOOD)
    rect(im, 10, 6, 10, 7, DARK)
    rect(im, 8, 8, 12, 14, (70, 60, 50)); rect(im, 9, 9, 11, 13, (240, 210, 140))            # glass box with the wick
    rect(im, 8, 7, 12, 7, (60, 50, 40))
    outline(im)
    return im


def make_old_village() -> list[dict]:
    files = []
    sprites = [("house_c", thatched_cottage), ("ubnd", dinh_lang), ("post_office", tea_house),
               ("school", village_school), ("street_lamp", oil_lamp_post)]
    sprites += [(f"shophouse_{v}", lambda v=v: shophouse(v)) for v in range(6)]
    for key, draw in sprites:
        rel = f"sprites/props/{key}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": rel})
    return files
