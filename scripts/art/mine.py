"""Small separate tileset for the procedurally generated mine (floor/wall/ore/ladder)."""
import random
from pathlib import Path

from PIL import Image, ImageDraw

from .common import ASSETS, P, T

INK = P["ink"]

MINE_FLOOR, MINE_WALL, MINE_ORE_COPPER, MINE_ORE_IRON, MINE_ORE_GOLD, MINE_LADDER = range(6)

MC = {
    "floor": (74, 66, 60), "floor_d": (58, 52, 46), "floor_l": (92, 82, 74),
    "wall": (48, 44, 42), "wall_l": (66, 60, 56), "wall_d": (32, 28, 26),
    "copper": (196, 120, 70), "iron": (176, 168, 156), "gold": (230, 192, 48),
    "ladder": (150, 110, 64),
}


def mine_tile_img(idx: int, rnd: random.Random) -> Image.Image:
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if idx == MINE_FLOOR:
        d.rectangle([0, 0, T - 1, T - 1], fill=MC["floor"])
        for _ in range(3):
            x, y = rnd.randrange(T), rnd.randrange(T)
            d.point((x, y), fill=MC["floor_d"])
        d.point((rnd.randrange(T), rnd.randrange(T)), fill=MC["floor_l"])
    elif idx == MINE_WALL:
        d.rectangle([0, 0, T - 1, T - 1], fill=MC["wall"])
        d.rectangle([0, 0, T - 1, 2], fill=MC["wall_l"])
        for y in (6, 11):
            d.line([(0, y), (15, y)], fill=MC["wall_d"])
    elif idx in (MINE_ORE_COPPER, MINE_ORE_IRON, MINE_ORE_GOLD):
        d.rectangle([0, 0, T - 1, T - 1], fill=MC["wall"])
        d.rectangle([0, 0, T - 1, 2], fill=MC["wall_l"])
        color = {MINE_ORE_COPPER: MC["copper"], MINE_ORE_IRON: MC["iron"], MINE_ORE_GOLD: MC["gold"]}[idx]
        for (x, y) in [(5, 6), (10, 5), (7, 10), (11, 11)]:
            d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=color, outline=INK)
    elif idx == MINE_LADDER:
        d.rectangle([0, 0, T - 1, T - 1], fill=MC["floor"])
        for x in (4, 11):
            d.rectangle([x, 1, x + 1, 14], fill=MC["ladder"])
        for y in (3, 7, 11):
            d.rectangle([4, y, 12, y + 1], fill=MC["ladder"])
    return im


def make_mine_tileset() -> Path:
    rnd = random.Random(21)
    cols = 6
    sheet = Image.new("RGBA", (cols * T, T), (0, 0, 0, 0))
    for i in range(cols):
        sheet.paste(mine_tile_img(i, rnd), (i * T, 0))
    out = ASSETS / "tilesets" / "mine_tiles.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    return out




# ------------------------------------------------------------------ graphics x2 (HD)
S2 = T * 2


def _speckle(d: ImageDraw.ImageDraw, rnd: random.Random, n: int, colors: list) -> None:
    for _ in range(n):
        x, y = rnd.randrange(S2), rnd.randrange(S2)
        d.point((x, y), fill=rnd.choice(colors))


def _rock_wall(d: ImageDraw.ImageDraw, rnd: random.Random) -> None:
    """Rough cave rock: stacked stones with lit tops and dark seams."""
    d.rectangle([0, 0, S2 - 1, S2 - 1], fill=MC["wall"])
    for row, y0 in enumerate((0, 11, 22)):
        x = -rnd.randrange(8) if row % 2 else 0
        while x < S2:
            w = rnd.randint(9, 14)
            d.rectangle([x + 1, y0 + 1, x + w - 1, y0 + 9], fill=rnd.choice([MC["wall"], (54, 50, 47), (44, 40, 38)]))
            d.line([(x + 1, y0 + 1), (x + w - 2, y0 + 1)], fill=MC["wall_l"])
            d.line([(x + w, y0), (x + w, y0 + 10)], fill=MC["wall_d"])
            x += w + 1
        d.line([(0, y0 + 10), (S2, y0 + 10)], fill=MC["wall_d"])
    d.rectangle([0, 0, S2 - 1, 3], fill=MC["wall_l"])
    _speckle(d, rnd, 14, [MC["wall_d"], MC["wall_l"]])


def mine_tile_hd(idx: int, rnd: random.Random) -> Image.Image:
    """The mine tiles drawn at 32 px: pebbly cave floor, stone walls, glinting ore veins, a wooden ladder."""
    im = Image.new("RGBA", (S2, S2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if idx in (MINE_FLOOR, MINE_LADDER):
        d.rectangle([0, 0, S2 - 1, S2 - 1], fill=MC["floor"])
        _speckle(d, rnd, 40, [MC["floor_d"], MC["floor_l"], (66, 58, 52)])
        for _ in range(3):                                            # pebbles
            x, y = rnd.randrange(3, S2 - 4), rnd.randrange(3, S2 - 4)
            d.ellipse([x - 2, y - 1, x + 2, y + 1], fill=MC["floor_l"], outline=MC["floor_d"])
        if idx == MINE_LADDER:
            d.rectangle([7, 0, 26, S2 - 1], fill=(30, 26, 24))       # the shaft going down
            for x in (8, 23):
                d.rectangle([x, 1, x + 2, 30], fill=MC["ladder"])
                d.line([(x, 1), (x, 30)], fill=(186, 146, 92))
            for y in (5, 13, 21, 28):
                d.rectangle([8, y, 25, y + 2], fill=MC["ladder"])
                d.line([(8, y), (25, y)], fill=(186, 146, 92))
    else:
        _rock_wall(d, rnd)
        if idx in (MINE_ORE_COPPER, MINE_ORE_IRON, MINE_ORE_GOLD):
            color = {MINE_ORE_COPPER: MC["copper"], MINE_ORE_IRON: MC["iron"], MINE_ORE_GOLD: MC["gold"]}[idx]
            light = tuple(min(255, c + 60) for c in color)
            for (x, y) in [(9, 12), (21, 9), (14, 21), (24, 23), (6, 25)]:
                d.polygon([(x, y - 4), (x + 3, y), (x, y + 4), (x - 3, y)], fill=color, outline=INK)
                d.point((x - 1, y - 2), fill=light)
                d.point((x, y - 3), fill=(255, 255, 240))
    return im


def make_mine_tileset_hd() -> Path:
    rnd = random.Random(22)
    cols = 6
    sheet = Image.new("RGBA", (cols * S2, S2), (0, 0, 0, 0))
    for i in range(cols):
        sheet.paste(mine_tile_hd(i, rnd), (i * S2, 0))
    out = ASSETS / "tilesets" / "mine_tiles_hd.png"
    sheet.save(out)
    return out
