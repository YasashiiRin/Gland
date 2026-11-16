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


