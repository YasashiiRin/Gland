"""Landmark sprites for Huế and Đà Nẵng, drawn freehand in code (simplified,
not traced from photos): the Ngọ Môn gate, the Thái Hòa hall, Thiên Mụ's
Phước Duyên tower, the Trường Tiền bridge, a dragon boat, the Dragon Bridge,
the Lady Buddha statue of Sơn Trà, a Marble Mountain and a city tower.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow

GOLD, GOLD_D, GOLD_L = (222, 176, 58), (168, 120, 36), (244, 214, 110)
RED, RED_D = (164, 46, 38), (110, 30, 26)
STONE, STONE_D, STONE_L = (128, 116, 104), (88, 80, 74), (160, 148, 132)
SILVER, SILVER_D = (206, 210, 214), (120, 126, 134)


def roof(im: Image.Image, x0: int, x1: int, y0: int, h: int, c, line=None) -> None:
    """A tiled roof that widens downward, with upturned eave tips at both ends."""
    line = line or shade(c, 0.72)
    for y in range(y0, y0 + h):
        inset = (y0 + h - 1 - y) // 2
        rect(im, x0 + inset, y, x1 - inset, y, line if (y - y0) % 3 == 2 else c)
    rect(im, x0 + h // 2, y0, x1 - h // 2, y0, shade(c, 1.25))   # ridge
    for x in (x0 - 1, x1 + 1):
        put(im, x, y0 + h - 2, c); put(im, x, y0 + h - 3, shade(c, 1.2))


def ngo_mon() -> Image.Image:
    """The citadel's south gate: a stone base with three arches and a gold-roofed pavilion."""
    im = new(128, 80)
    rect(im, 0, 36, 127, 79, STONE)
    rect(im, 0, 36, 127, 38, STONE_L)
    for y in range(42, 80, 6):  # brick courses
        rect(im, 0, y, 127, y, STONE_D)
    for cx, half, top in ((64, 14, 48), (24, 7, 58), (104, 7, 58)):   # the middle arch is the way through
        for y in range(top, 80):
            dy = max(0, top + half - y)
            w = int(math.sqrt(max(0, half * half - dy * dy)))
            rect(im, cx - w, y, cx + w - 1, y, (40, 32, 30))
    for x in (20, 36, 52, 76, 92, 108):  # pavilion columns
        rect(im, x, 18, x + 2, 36, RED); put(im, x, 18, RED_D)
    rect(im, 14, 30, 113, 31, RED_D)
    roof(im, 10, 117, 4, 12, GOLD, GOLD_D)
    roof(im, 4, 123, 20, 10, GOLD, GOLD_D)
    outline(im, 0.45)
    return im


def royal_hall() -> Image.Image:
    """Điện Thái Hòa: a long hall with red lacquered columns under double gold roofs."""
    im = new(112, 64)
    soft_shadow(im, 56, 61, 54, 3)
    rect(im, 2, 54, 109, 63, STONE_L); rect(im, 46, 54, 65, 63, STONE)       # terrace + steps
    for y in range(56, 64, 2):
        rect(im, 46, y, 65, y, STONE_D)
    rect(im, 8, 34, 103, 53, (120, 40, 34))
    for x in range(10, 102, 8):
        rect(im, x, 34, x + 2, 53, RED); put(im, x + 1, 36, GOLD)
    rect(im, 48, 40, 63, 53, (70, 24, 20))
    roof(im, 14, 97, 6, 10, GOLD, GOLD_D)
    roof(im, 2, 109, 20, 14, GOLD, GOLD_D)
    for x in (30, 56, 82):  # little dragon finials on the ridge
        rect(im, x - 1, 3, x + 1, 6, GOLD_L)
    outline(im, 0.45)
    return im


def thien_mu() -> Image.Image:
    """The seven-storey Phước Duyên tower of Thiên Mụ pagoda."""
    im = new(32, 112)
    soft_shadow(im, 16, 109, 14, 3)
    rect(im, 1, 102, 30, 110, STONE_L)
    y = 102
    for tier in range(7):
        half = 12 - tier
        h = 12 - tier // 2
        rect(im, 16 - half, y - h, 15 + half, y - 1, (214, 172, 140))
        rect(im, 16 - half, y - h, 16 - half + 1, y - 1, (236, 200, 168))
        rect(im, 14, y - h + 3, 17, y - 2, (60, 40, 34))                 # arched window
        rect(im, 16 - half - 2, y - h - 1, 15 + half + 2, y - h, (120, 70, 50))   # eave ledge
        y -= h + 1
    rect(im, 15, y - 8, 16, y, GOLD); disc(im, 15.5, y - 8, 1.6, GOLD_L)
    outline(im, 0.45)
    return im


def truong_tien() -> Image.Image:
    """Trường Tiền: a 3-tile road deck with silver steel arch trusses on both sides."""
    im = new(80, 112)
    for y in range(112):
        rect(im, 16, y, 63, y, (120, 116, 112) if (y // 2) % 9 else (150, 146, 140))
    rect(im, 16, 0, 17, 111, SILVER_D); rect(im, 62, 0, 63, 111, SILVER_D)
    spans = ((0, 37), (37, 75), (75, 112))
    for a, b in spans:
        for y in range(a, b):
            bulge = int(13 * math.sin(math.pi * (y - a) / (b - a)))
            for side, rail in ((-1, 15), (1, 64)):
                x = rail + side * bulge
                put(im, x, y, SILVER); put(im, x - side, y, SILVER_D)
                if (y - a) % 6 == 0:  # hangers between arch and rail
                    for k in range(min(rail, x), max(rail, x) + 1):
                        put(im, k, y, SILVER_D)
    return im


def dragon_boat() -> Image.Image:
    """A Perfume River dragon boat: red hull, gold canopy, a dragon head at the bow."""
    im = new(64, 32)
    for y in range(20, 29):
        half = 28 - (y - 20) * 2
        rect(im, 32 - half, y, 31 + half, y, RED if y < 25 else RED_D)
    rect(im, 4, 20, 59, 20, GOLD)
    rect(im, 18, 8, 47, 19, (250, 236, 200)); rect(im, 18, 8, 47, 9, GOLD_D)
    roof(im, 14, 51, 3, 6, GOLD, GOLD_D)
    for y in range(6, 22):  # dragon neck and head on the left
        put(im, 4 + (22 - y) // 4, y, GOLD); put(im, 5 + (22 - y) // 4, y, GOLD_D)
    disc(im, 8, 6, 3, GOLD); put(im, 7, 5, RED_D); put(im, 11, 2, GOLD_L)
    rect(im, 58, 14, 60, 20, GOLD)  # tail
    outline(im, 0.45)
    return im


def dragon_bridge() -> Image.Image:
    """Cầu Rồng: a golden dragon whose body arches over the road deck, head facing the sea (east)."""
    im = new(112, 88)
    for y in (42, 86):  # guard rails along the deck edges (the deck itself is paving tiles)
        rect(im, 0, y, 111, y + 1, (190, 186, 178))
    path = []
    for i in range(0, 980):  # trace the body finely so its thickness holds on the steep parts
        x = 2 + i * 0.1
        path.append((x, 66 - 50 * abs(math.sin(math.pi * x / 32)) ** 0.75))   # three arches
    for x, cy in path[::3]:
        disc(im, x, cy, 4.6, GOLD_D)
    for x, cy in path[::3]:
        disc(im, x - 0.8, cy - 1.2, 3.2, GOLD)
    for x, cy in path[::9]:
        put(im, round(x - 1), round(cy - 2), GOLD_L)             # glints / scales
    for x, cy in path[::40]:
        put(im, round(x), round(cy) - 6, (230, 120, 50))         # spines
    for y in range(18, 66):  # neck rising at the east end
        disc(im, 100 + (66 - y) / 8, y, 3.4, GOLD_D); disc(im, 99.4 + (66 - y) / 8, y - 0.6, 2.2, GOLD)
    disc(im, 104, 16, 6, GOLD); disc(im, 102, 14, 3, GOLD_L)
    put(im, 106, 14, RED_D); rect(im, 108, 18, 111, 19, (240, 110, 40))    # eye, fire
    rect(im, 101, 6, 102, 10, GOLD_D); rect(im, 105, 6, 106, 10, GOLD_D)   # horns
    for y in range(52, 66):  # tail curl at the west end
        put(im, 4 - (y - 52) // 5, y, GOLD)
    outline(im, 0.45)
    return im


def lady_buddha() -> Image.Image:
    """The white Quan Âm statue on Sơn Trà, standing on a lotus pedestal."""
    im = new(32, 96)
    soft_shadow(im, 16, 93, 13, 3)
    rect(im, 3, 82, 28, 93, STONE_L); rect(im, 3, 82, 28, 83, (196, 186, 170))
    for i, x in enumerate(range(5, 27, 4)):  # lotus petals
        disc(im, x + 1, 80, 2.5, (236, 226, 214) if i % 2 else (214, 204, 192))
    white, white_d = (242, 240, 234), (196, 194, 190)
    for y in range(26, 79):  # flowing robe, wider at the hem
        half = 5 + (y - 26) // 9
        rect(im, 16 - half, y, 15 + half, y, white)
        rect(im, 15 + half - 1, y, 15 + half, y, white_d)
    for y in range(34, 70, 7):
        put(im, 13, y, white_d); put(im, 18, y + 3, white_d)
    disc(im, 16, 19, 5, white); disc(im, 17, 20, 4, white_d); disc(im, 15, 18, 4, white)
    disc(im, 16, 12, 3, white)                                   # hair knot
    outline(im, 0.55)
    return im


def marble_mountain() -> Image.Image:
    """Ngũ Hành Sơn: steep pale marble crags with green ledges."""
    rnd = random.Random(61)
    im = new(96, 96)
    soft_shadow(im, 48, 92, 44, 4, alpha=70)
    peaks = [(22, 24, 12), (50, 6, 14), (76, 30, 11)]
    for x in range(96):
        top = min(py + abs(x - px) * 2.6 * 14 / pw for px, py, pw in peaks)
        top = max(top, 92 - min(x, 95 - x) * 3)
        for y in range(int(top), 92):
            c = (214, 210, 200) if (x + y // 3) % 7 else (180, 176, 168)
            if x > 50 and (y - top) > 6:
                c = shade(c, 0.85)
            put(im, x, y, c)
    for _ in range(40):
        x, y = rnd.randint(4, 91), rnd.randint(14, 88)
        if im.getpixel((x, y))[3]:
            disc(im, x, y, 2, (78, 120, 66)); put(im, x - 1, y - 1, (110, 150, 84))
    rect(im, 46, 80, 53, 91, (60, 52, 50))  # cave mouth
    outline(im, 0.5)
    return im


def city_tower() -> Image.Image:
    """A riverside tower block: pale concrete and blue glass."""
    im = new(48, 112)
    soft_shadow(im, 24, 109, 22, 3)
    rect(im, 4, 8, 43, 109, (206, 204, 198)); rect(im, 40, 8, 43, 109, (166, 164, 160))
    for y in range(14, 100, 8):
        for x in range(8, 38, 7):
            rect(im, x, y, x + 4, y + 4, (92, 140, 180)); put(im, x, y, (170, 210, 230))
    rect(im, 18, 98, 29, 109, (70, 80, 90))
    rect(im, 2, 4, 45, 8, (150, 148, 144))
    outline(im, 0.45)
    return im


def make_hue_danang_art() -> list[dict]:
    files = []
    for key, draw in [("ngo_mon", ngo_mon), ("royal_hall", royal_hall), ("thien_mu", thien_mu),
                      ("truong_tien", truong_tien), ("dragon_boat", dragon_boat), ("dragon_bridge", dragon_bridge),
                      ("lady_buddha", lady_buddha), ("marble_mountain", marble_mountain), ("city_tower", city_tower)]:
        save_rel = f"sprites/props/{key}.png"
        save(draw(), save_rel)
        files.append({"type": "image", "key": f"prop_{key}", "url": save_rel})
    return files
