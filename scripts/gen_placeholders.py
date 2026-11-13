"""
Generate placeholder art (tileset + player spritesheet) and Tiled maps (.tmj).

Run:  python3 scripts/gen_placeholders.py   (needs: pip install pillow)

The generated files are already included in the project, so you only need to
run this again if you want to regenerate the placeholders. Real art can replace
the PNG files later as long as the tile order / frame layout stays the same.
Maps can be opened and edited in Tiled (https://www.mapeditor.org).
"""
import json
import random
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"
T = 16
COLS = 8

# ---------------------------------------------------------------- tiles
GRASS, GRASS2, FLOWERS, PATH, WATER, FENCE, TRUNK, CANOPY = range(0, 8)
ROCK, WALL, ROOF, DOOR, FLOOR, IWALL, BED_TOP, BED_BOTTOM = range(8, 16)
TABLE, RUG, WINDOW, BUSH, SOIL, SIGN, SHOPWALL, EMPTY = range(16, 24)

COLLIDES = [WATER, FENCE, TRUNK, ROCK, WALL, ROOF, IWALL, BED_TOP, BED_BOTTOM,
            TABLE, WINDOW, BUSH, SIGN, SHOPWALL]
TILE_NAMES = {
    GRASS: "grass", GRASS2: "grass_alt", FLOWERS: "flowers", PATH: "path",
    WATER: "water", FENCE: "fence", TRUNK: "tree_trunk", CANOPY: "tree_canopy",
    ROCK: "rock", WALL: "house_wall", ROOF: "roof", DOOR: "door",
    FLOOR: "wood_floor", IWALL: "interior_wall", BED_TOP: "bed_top",
    BED_BOTTOM: "bed_bottom", TABLE: "table", RUG: "rug", WINDOW: "window",
    BUSH: "bush", SOIL: "tilled_soil", SIGN: "sign", SHOPWALL: "shop_wall",
}

C = {
    "grass": (106, 176, 76), "grass_d": (84, 148, 62), "grass_l": (132, 196, 96),
    "path": (196, 160, 112), "path_d": (170, 134, 92),
    "water": (64, 132, 204), "water_l": (120, 180, 232),
    "wood": (150, 96, 56), "wood_d": (110, 68, 40), "wood_l": (184, 128, 80),
    "leaf": (52, 124, 60), "leaf_d": (36, 96, 48), "leaf_l": (80, 156, 80),
    "rock": (136, 136, 144), "rock_d": (96, 96, 108), "rock_l": (176, 176, 184),
    "wall": (232, 216, 184), "wall_d": (200, 180, 148),
    "roof": (180, 72, 64), "roof_d": (140, 52, 48),
    "floor": (176, 124, 76), "floor_d": (150, 100, 60),
    "iwall": (120, 92, 72), "iwall_l": (150, 116, 90),
    "sheet": (240, 240, 248), "blanket": (88, 120, 200),
    "rug": (176, 64, 84), "rug_l": (216, 120, 120),
    "glass": (160, 210, 240), "soil": (110, 76, 52), "soil_d": (86, 58, 40),
    "shop": (120, 168, 200), "shop_d": (90, 136, 170),
}


def tile_img(idx: int, rnd: random.Random) -> Image.Image:
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    def fill(c):
        d.rectangle([0, 0, T - 1, T - 1], fill=c)

    def speckle(c, n):
        for _ in range(n):
            d.point((rnd.randrange(T), rnd.randrange(T)), fill=c)

    if idx in (GRASS, GRASS2, FLOWERS, TRUNK, ROCK, BUSH, SIGN, FENCE):
        fill(C["grass"])
        speckle(C["grass_d"], 14 if idx != GRASS2 else 30)
        speckle(C["grass_l"], 6)
    if idx == FLOWERS:
        for (x, y, col) in [(3, 4, (240, 220, 80)), (10, 3, (240, 120, 160)),
                            (6, 11, (250, 250, 250)), (12, 12, (240, 220, 80))]:
            d.point((x, y), fill=col)
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                d.point((x + dx, y + dy), fill=col)
            d.point((x, y), fill=(200, 120, 40))
    elif idx == PATH:
        fill(C["path"]); speckle(C["path_d"], 18)
    elif idx == WATER:
        fill(C["water"])
        for y in (3, 9, 14):
            d.line([(2, y), (6, y)], fill=C["water_l"])
            d.line([(9, y - 2), (13, y - 2)], fill=C["water_l"])
    elif idx == FENCE:
        d.rectangle([0, 5, 15, 6], fill=C["wood"])
        d.rectangle([0, 10, 15, 11], fill=C["wood"])
        for x in (2, 12):
            d.rectangle([x, 2, x + 2, 14], fill=C["wood_l"])
            d.rectangle([x, 13, x + 2, 14], fill=C["wood_d"])
    elif idx == TRUNK:
        d.ellipse([1, 0, 14, 7], fill=C["leaf_d"])
        d.rectangle([6, 2, 9, 13], fill=C["wood"])
        d.line([(6, 2), (6, 13)], fill=C["wood_d"])
        d.ellipse([3, 12, 12, 15], fill=(60, 110, 50))
        d.rectangle([6, 9, 9, 13], fill=C["wood"])
    elif idx == CANOPY:
        d.ellipse([0, 1, 15, 15], fill=C["leaf"])
        d.ellipse([2, 2, 11, 9], fill=C["leaf_l"])
        d.ellipse([0, 9, 15, 15], fill=C["leaf_d"])
        d.ellipse([1, 4, 14, 13], fill=C["leaf"])
        d.ellipse([3, 3, 9, 8], fill=C["leaf_l"])
    elif idx == ROCK:
        d.ellipse([2, 4, 13, 14], fill=C["rock_d"])
        d.ellipse([2, 3, 13, 12], fill=C["rock"])
        d.ellipse([4, 4, 8, 7], fill=C["rock_l"])
    elif idx == WALL:
        fill(C["wall"])
        for y in (4, 9, 14):
            d.line([(0, y), (15, y)], fill=C["wall_d"])
    elif idx == WINDOW:
        fill(C["wall"])
        d.rectangle([3, 3, 12, 12], fill=C["wood_d"])
        d.rectangle([4, 4, 11, 11], fill=C["glass"])
        d.line([(7, 4), (7, 11)], fill=C["wood_d"])
        d.line([(4, 7), (11, 7)], fill=C["wood_d"])
    elif idx == ROOF:
        fill(C["roof"])
        for y in range(0, T, 4):
            d.line([(0, y + 3), (15, y + 3)], fill=C["roof_d"])
            off = 0 if (y // 4) % 2 == 0 else 4
            for x in range(off, T, 8):
                d.line([(x, y), (x, y + 3)], fill=C["roof_d"])
    elif idx == DOOR:
        fill(C["wall"])
        d.rectangle([3, 1, 12, 15], fill=C["wood_d"])
        d.rectangle([4, 2, 11, 15], fill=C["wood"])
        d.point((10, 9), fill=(240, 200, 80))
    elif idx == FLOOR:
        fill(C["floor"])
        for y in (3, 7, 11, 15):
            d.line([(0, y), (15, y)], fill=C["floor_d"])
        d.point((rnd.randrange(T), rnd.randrange(T)), fill=C["floor_d"])
    elif idx == IWALL:
        fill(C["iwall"])
        for x in (3, 8, 13):
            d.line([(x, 0), (x, 15)], fill=C["iwall_l"])
    elif idx == BED_TOP:
        fill(C["floor"])
        d.rectangle([1, 1, 14, 15], fill=C["wood_d"])
        d.rectangle([2, 2, 13, 15], fill=C["sheet"])
        d.rectangle([4, 3, 11, 7], fill=(255, 255, 255))
        d.rectangle([2, 10, 13, 15], fill=C["blanket"])
    elif idx == BED_BOTTOM:
        fill(C["floor"])
        d.rectangle([1, 0, 14, 14], fill=C["wood_d"])
        d.rectangle([2, 0, 13, 12], fill=C["blanket"])
        d.line([(2, 6), (13, 6)], fill=(70, 100, 180))
    elif idx == TABLE:
        fill(C["floor"])
        d.rectangle([1, 3, 14, 11], fill=C["wood_l"])
        d.rectangle([1, 11, 14, 12], fill=C["wood_d"])
        d.rectangle([2, 12, 3, 15], fill=C["wood_d"])
        d.rectangle([12, 12, 13, 15], fill=C["wood_d"])
    elif idx == RUG:
        fill(C["rug"])
        d.rectangle([2, 2, 13, 13], outline=C["rug_l"])
        d.rectangle([5, 5, 10, 10], outline=C["rug_l"])
    elif idx == BUSH:
        d.ellipse([1, 3, 14, 15], fill=C["leaf_d"])
        d.ellipse([2, 3, 13, 13], fill=C["leaf"])
        d.ellipse([4, 4, 8, 8], fill=C["leaf_l"])
    elif idx == SOIL:
        fill(C["soil"])
        for y in (3, 8, 13):
            d.line([(1, y), (14, y)], fill=C["soil_d"])
    elif idx == SIGN:
        d.rectangle([7, 8, 8, 15], fill=C["wood_d"])
        d.rectangle([2, 2, 13, 9], fill=C["wood_l"])
        d.rectangle([2, 2, 13, 9], outline=C["wood_d"])
        d.line([(4, 5), (11, 5)], fill=C["wood_d"])
    elif idx == SHOPWALL:
        fill(C["shop"])
        for y in (4, 9, 14):
            d.line([(0, y), (15, y)], fill=C["shop_d"])
    return im


def make_tileset() -> Path:
    rnd = random.Random(7)
    rows = 3
    sheet = Image.new("RGBA", (COLS * T, rows * T), (0, 0, 0, 0))
    for i in range(COLS * rows):
        if i == EMPTY:
            continue
        sheet.paste(tile_img(i, rnd), ((i % COLS) * T, (i // COLS) * T))
    out = ASSETS / "tilesets" / "farm_tiles.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    return out


# ---------------------------------------------------------------- player
# Spritesheet: 4 columns (walk frames) x 4 rows (down, left, right, up), 16x32 each.
SKIN, HAIR = (244, 200, 160), (110, 70, 40)
SHIRT, SHIRT_D = (220, 90, 70), (180, 66, 52)
PANTS, SHOE, EYE = (60, 80, 140), (60, 40, 30), (30, 30, 40)


def player_frame(direction: str, step: int) -> Image.Image:
    im = Image.new("RGBA", (16, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bob = 1 if step in (1, 3) else 0
    # shadow
    d.ellipse([3, 28, 12, 31], fill=(0, 0, 0, 70))
    # legs
    swing = {0: (0, 0), 1: (-1, 1), 2: (0, 0), 3: (1, -1)}[step]
    if direction in ("down", "up"):
        d.rectangle([5, 22, 7, 27 + swing[0]], fill=PANTS)
        d.rectangle([8, 22, 10, 27 + swing[1]], fill=PANTS)
        d.rectangle([5, 27 + swing[0], 7, 28 + swing[0]], fill=SHOE)
        d.rectangle([8, 27 + swing[1], 10, 28 + swing[1]], fill=SHOE)
    else:
        sx = 2 if step in (1, 3) else 0
        d.rectangle([6 - sx // 2, 22, 9 - sx // 2, 27], fill=PANTS)
        d.rectangle([6 + sx, 22, 9 + sx // 2, 27], fill=PANTS)
        d.rectangle([6 - sx // 2, 27, 9 - sx // 2, 28], fill=SHOE)
        d.rectangle([6 + sx, 27, 9 + sx // 2, 28], fill=SHOE)
    y0 = -bob
    # body
    d.rectangle([4, 14 + y0, 11, 22 + y0], fill=SHIRT)
    d.line([(4, 22 + y0), (11, 22 + y0)], fill=SHIRT_D)
    # arms
    if direction in ("down", "up"):
        d.rectangle([3, 15 + y0, 3, 20 + y0 + swing[1]], fill=SKIN)
        d.rectangle([12, 15 + y0, 12, 20 + y0 + swing[0]], fill=SKIN)
    else:
        ax = 7 + (swing[0] * 2)
        d.rectangle([ax, 15 + y0, ax + 1, 20 + y0], fill=SKIN)
    # head
    d.rectangle([4, 5 + y0, 11, 13 + y0], fill=SKIN)
    if direction == "down":
        d.rectangle([3, 3 + y0, 12, 6 + y0], fill=HAIR)
        d.rectangle([3, 6 + y0, 3, 9 + y0], fill=HAIR)
        d.rectangle([12, 6 + y0, 12, 9 + y0], fill=HAIR)
        d.point((6, 9 + y0), fill=EYE); d.point((9, 9 + y0), fill=EYE)
        d.line([(7, 11 + y0), (8, 11 + y0)], fill=(200, 120, 110))
    elif direction == "up":
        d.rectangle([3, 3 + y0, 12, 12 + y0], fill=HAIR)
    elif direction == "left":
        d.rectangle([3, 3 + y0, 12, 6 + y0], fill=HAIR)
        d.rectangle([9, 6 + y0, 12, 11 + y0], fill=HAIR)
        d.point((5, 9 + y0), fill=EYE)
    else:  # right
        d.rectangle([3, 3 + y0, 12, 6 + y0], fill=HAIR)
        d.rectangle([3, 6 + y0, 6, 11 + y0], fill=HAIR)
        d.point((10, 9 + y0), fill=EYE)
    return im


def make_player() -> Path:
    dirs = ["down", "left", "right", "up"]
    sheet = Image.new("RGBA", (16 * 4, 32 * 4), (0, 0, 0, 0))
    for r, dname in enumerate(dirs):
        for c in range(4):
            sheet.paste(player_frame(dname, c), (c * 16, r * 32))
    out = ASSETS / "sprites" / "player.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    return out


# ---------------------------------------------------------------- maps
class MapBuilder:
    def __init__(self, w: int, h: int, seed: int):
        self.w, self.h = w, h
        self.rnd = random.Random(seed)
        self.ground = [[GRASS] * w for _ in range(h)]
        self.decor = [[None] * w for _ in range(h)]
        self.above = [[None] * w for _ in range(h)]
        self.objects: list[dict] = []
        self._oid = 1

    def grass_variation(self):
        for y in range(self.h):
            for x in range(self.w):
                r = self.rnd.random()
                self.ground[y][x] = GRASS2 if r < 0.18 else FLOWERS if r < 0.23 else GRASS

    def fill_ground(self, x0, y0, x1, y1, tile):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.ground[y][x] = tile

    def put(self, x, y, tile):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.decor[y][x] = tile

    def tree(self, x, y):
        self.put(x, y, TRUNK)
        if y - 1 >= 0:
            self.above[y - 1][x] = CANOPY

    def border_trees(self, gaps: set[tuple[int, int]]):
        for x in range(self.w):
            for y in (0, self.h - 1):
                if (x, y) not in gaps:
                    self.tree(x, y)
        for y in range(1, self.h - 1):
            for x in (0, self.w - 1):
                if (x, y) not in gaps:
                    self.tree(x, y)

    def is_free(self, x, y):
        return self.decor[y][x] is None and self.ground[y][x] not in (PATH, WATER, SOIL, DOOR)

    def scatter(self, tile, count, area):
        x0, y0, x1, y1 = area
        placed = 0
        while placed < count:
            x, y = self.rnd.randint(x0, x1), self.rnd.randint(y0, y1)
            if self.is_free(x, y):
                if tile == TRUNK:
                    if y - 1 >= 0 and self.above[y - 1][x] is None:
                        self.tree(x, y)
                else:
                    self.put(x, y, tile)
                placed += 1

    def obj(self, name, x, y, w=0, h=0, props=None, point=False):
        o = {"id": self._oid, "name": name, "type": "", "x": x, "y": y,
             "width": w, "height": h, "rotation": 0, "visible": True}
        if point:
            o["point"] = True
        if props:
            o["properties"] = [{"name": k, "type": "string", "value": v} for k, v in props.items()]
        self.objects.append(o)
        self._oid += 1

    def door(self, tx, ty, tw, th, to, spawn):
        self.obj("door", tx * T, ty * T, tw * T, th * T, {"to": to, "spawn": spawn})

    def spawn(self, sid, tx, ty):
        self.obj(f"spawn_{sid}", tx * T + T / 2, ty * T + T / 2, point=True)

    def to_tmj(self) -> dict:
        def layer(lid, name, grid):
            data = [(t + 1) if t is not None else 0 for row in grid for t in row]
            return {"id": lid, "name": name, "type": "tilelayer", "width": self.w,
                    "height": self.h, "x": 0, "y": 0, "opacity": 1, "visible": True,
                    "data": data}
        tiles = [{"id": t, "properties": [{"name": "collides", "type": "bool", "value": True}]}
                 for t in COLLIDES]
        return {
            "type": "map", "version": "1.10", "tiledversion": "1.10.2",
            "orientation": "orthogonal", "renderorder": "right-down",
            "width": self.w, "height": self.h, "tilewidth": T, "tileheight": T,
            "infinite": False, "nextlayerid": 5, "nextobjectid": self._oid,
            "layers": [
                layer(1, "ground", self.ground),
                layer(2, "decor", self.decor),
                layer(3, "above", self.above),
                {"id": 4, "name": "objects", "type": "objectgroup", "x": 0, "y": 0,
                 "opacity": 1, "visible": True, "draworder": "topdown",
                 "objects": self.objects},
            ],
            "tilesets": [{
                "firstgid": 1, "name": "farm_tiles", "image": "../tilesets/farm_tiles.png",
                "imagewidth": COLS * T, "imageheight": 3 * T, "tilewidth": T, "tileheight": T,
                "columns": COLS, "tilecount": COLS * 3, "margin": 0, "spacing": 0,
                "tiles": tiles,
            }],
        }


def build_farm() -> MapBuilder:
    m = MapBuilder(40, 30, seed=11)
    m.grass_variation()
    exit_rows = {14, 15, 16}
    m.border_trees({(39, y) for y in exit_rows})
    # house exterior (x 8..13): roof rows 3..5, wall rows 6..7, door at (10,7)
    for x in range(8, 14):
        for y in (3, 4, 5):
            m.put(x, y, ROOF)
        for y in (6, 7):
            m.put(x, y, WALL)
    m.put(9, 6, WINDOW); m.put(12, 6, WINDOW)
    m.put(10, 7, None)
    m.ground[7][10] = DOOR
    # path from door down then east to exit
    m.fill_ground(10, 8, 10, 15, PATH)
    m.fill_ground(10, 15, 39, 15, PATH)
    # tillable field area (fenced) for later phases
    m.fill_ground(15, 18, 24, 25, SOIL)
    for x in range(14, 26):
        m.put(x, 17, FENCE); m.put(x, 26, FENCE)
    for y in range(17, 27):
        m.put(14, y, FENCE); m.put(25, y, FENCE)
    m.put(19, 17, None); m.put(20, 17, None)  # field gate
    # pond
    m.fill_ground(28, 20, 33, 24, WATER)
    m.fill_ground(29, 19, 32, 19, WATER)
    m.put(16, 9, SIGN)
    m.scatter(TRUNK, 14, (2, 2, 37, 27))
    m.scatter(ROCK, 12, (2, 2, 37, 27))
    m.scatter(BUSH, 10, (2, 2, 37, 27))
    m.door(10, 7, 1, 1, "House", "fromFarm")
    m.door(39, 14, 1, 3, "Town", "fromFarm")
    m.spawn("default", 10, 9)
    m.spawn("fromHouse", 10, 8)
    m.spawn("fromTown", 37, 15)
    return m


def build_town() -> MapBuilder:
    m = MapBuilder(40, 24, seed=23)
    m.grass_variation()
    exit_rows = {11, 12, 13}
    m.border_trees({(0, y) for y in exit_rows})
    m.fill_ground(0, 12, 39, 12, PATH)
    m.fill_ground(14, 6, 26, 18, PATH)
    # fountain
    m.fill_ground(19, 11, 21, 13, WATER)
    # shop (x 15..20, y 2..5) and two houses
    def building(x0, y0, w, wall, door_x):
        for x in range(x0, x0 + w):
            m.put(x, y0, ROOF); m.put(x, y0 + 1, ROOF)
            m.put(x, y0 + 2, wall); m.put(x, y0 + 3, wall)
        m.put(x0 + 1, y0 + 2, WINDOW); m.put(x0 + w - 2, y0 + 2, WINDOW)
        m.put(door_x, y0 + 3, None)
        m.ground[y0 + 3][door_x] = DOOR
    building(16, 1, 6, SHOPWALL, 18)
    building(5, 3, 5, WALL, 7)
    building(30, 3, 5, WALL, 32)
    building(29, 16, 5, WALL, 31)
    m.put(13, 11, SIGN)
    for x in range(14, 27, 3):
        m.put(x, 19, BUSH)
    m.scatter(TRUNK, 10, (2, 2, 37, 21))
    m.scatter(BUSH, 6, (2, 2, 37, 21))
    m.door(0, 11, 1, 3, "Farm", "fromTown")
    m.spawn("fromFarm", 2, 12)
    m.spawn("default", 2, 12)
    return m


def build_house() -> MapBuilder:
    m = MapBuilder(12, 10, seed=5)
    m.fill_ground(0, 0, 11, 9, FLOOR)
    for x in range(12):
        m.put(x, 0, IWALL); m.put(x, 1, IWALL); m.put(x, 9, IWALL)
    for y in range(10):
        m.put(0, y, IWALL); m.put(11, y, IWALL)
    m.put(6, 9, None); m.ground[9][6] = DOOR
    m.put(2, 2, BED_TOP); m.put(2, 3, BED_BOTTOM)
    m.put(8, 3, TABLE); m.put(9, 3, TABLE)
    m.fill_ground(5, 5, 7, 7, RUG)
    m.door(6, 9, 1, 1, "Farm", "fromHouse")
    m.obj("bed", 1 * T, 2 * T, 2 * T, 2 * T)
    m.spawn("fromFarm", 6, 8)
    m.spawn("default", 3, 4)
    return m


def main():
    make_tileset()
    make_player()
    maps_dir = ASSETS / "maps"
    maps_dir.mkdir(parents=True, exist_ok=True)
    for name, builder in (("farm", build_farm), ("town", build_town), ("house", build_house)):
        (maps_dir / f"{name}.tmj").write_text(json.dumps(builder().to_tmj(), indent=1))
    print("Generated tileset, player sprite and maps in", ASSETS)


if __name__ == "__main__":
    main()
