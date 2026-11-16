"""Tiled (.tmj) maps for the farm, village and farmhouse interior.

Layers: ground / decor / above (tiles) + objects. Buildings and furniture are
"prop" objects (a sprite drawn over a footprint); solid ones get invisible
BLOCK tiles underneath so collision stays tile-based. Water and path tiles are
auto-tiled at the end so their banks/edges match their neighbours.
"""
from __future__ import annotations

import json
import random

from .common import ASSETS, T
from .tiles import (BLOCK, BUSH, COLLIDES, COLS, DIRT, DOOR, FENCE, FLOOR, FLOOR2, FLOWERS, FOREST, GRASS,
                    GRASS2, GRASS3, IWALL, PATH, PATH_EDGE, ROCK, ROWS, SIGN, TRUNK, WAINSCOT, WALLPAPER,
                    WATER, WATER_EDGE)

PATHLIKE = {PATH, DIRT, DOOR}


class MapBuilder:
    def __init__(self, w: int, h: int, seed: int):
        self.w, self.h = w, h
        self.rnd = random.Random(seed)
        self.ground = [[GRASS] * w for _ in range(h)]
        self.decor: list[list[int | None]] = [[None] * w for _ in range(h)]
        self.above: list[list[int | None]] = [[None] * w for _ in range(h)]
        self.objects: list[dict] = []
        self._oid = 1

    # -------------------------------------------------------------- terrain
    def grass_variation(self) -> None:
        for y in range(self.h):
            for x in range(self.w):
                r = self.rnd.random()
                self.ground[y][x] = GRASS2 if r < 0.1 else FLOWERS if r < 0.14 else GRASS3 if r < 0.18 else GRASS

    def fill(self, x0: int, y0: int, x1: int, y1: int, tile: int) -> None:
        for y in range(max(0, y0), min(self.h, y1 + 1)):
            for x in range(max(0, x0), min(self.w, x1 + 1)):
                self.ground[y][x] = tile

    def blob(self, cx: float, cy: float, rx: float, ry: float, tile: int) -> None:
        for y in range(self.h):
            for x in range(self.w):
                wobble = 0.12 * self.rnd.random()
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 - wobble:
                    self.ground[y][x] = tile

    def put(self, x: int, y: int, tile: int | None) -> None:
        if 0 <= x < self.w and 0 <= y < self.h:
            self.decor[y][x] = tile

    def is_free(self, x: int, y: int) -> bool:
        return (0 <= x < self.w and 0 <= y < self.h and self.decor[y][x] is None
                and self.ground[y][x] in (GRASS, GRASS2, FLOWERS, GRASS3))

    def forest_border(self, gaps: set[tuple[int, int]], depth: int = 2) -> None:
        for y in range(self.h):
            for x in range(self.w):
                ring = min(x, y, self.w - 1 - x, self.h - 1 - y)
                if ring >= depth or (x, y) in gaps:
                    continue
                # Outer ring: a tree sprite on every tile; inner ring alternates so the
                # forest looks dense without drawing hundreds of overlapping sprites.
                self.put(x, y, FOREST if ring == 0 or (x + y) % 2 == 0 else BLOCK)

    def scatter(self, tile: int, count: int, area: tuple[int, int, int, int],
                avoid: tuple[int, int, int, int] | None = None) -> None:
        x0, y0, x1, y1 = area
        placed = tries = 0
        while placed < count and tries < count * 40:
            tries += 1
            x, y = self.rnd.randint(x0, x1), self.rnd.randint(y0, y1)
            if avoid and avoid[0] <= x <= avoid[2] and avoid[1] <= y <= avoid[3]:
                continue
            if tile == TRUNK and not all(self.is_free(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-2, -1, 0, 1)):
                continue
            if self.is_free(x, y):
                self.put(x, y, tile)
                placed += 1

    # -------------------------------------------------------------- objects
    def obj(self, name: str, x: float, y: float, w: float = 0, h: float = 0,
            props: dict[str, str] | None = None, point: bool = False) -> None:
        o: dict = {"id": self._oid, "name": name, "type": "", "x": x, "y": y,
                   "width": w, "height": h, "rotation": 0, "visible": True}
        if point:
            o["point"] = True
        if props:
            o["properties"] = [{"name": k, "type": "string", "value": v} for k, v in props.items()]
        self.objects.append(o)
        self._oid += 1

    def prop(self, sprite: str, tx: int, ty: int, tw: int, th: int, solid_from: int | None = 0,
             layer: str = "", door: tuple[int, int] | None = None, base: int | None = None) -> None:
        """A sprite drawn bottom-aligned on a tw x th footprint. Rows from
        `solid_from` down are blocked (None = walk-through), except `door`."""
        self.obj("prop", tx * T, ty * T, tw * T, th * T, {"sprite": sprite, "layer": layer})
        for y in range(ty, ty + th):
            for x in range(tx, tx + tw):
                solid = solid_from is not None and y >= ty + solid_from
                if base is not None and solid:  # bare earth only where the building stands
                    self.ground[y][x] = base
                if solid and (x, y) != door:
                    self.put(x, y, BLOCK)

    def door(self, tx: int, ty: int, tw: int, th: int, to: str, spawn: str) -> None:
        self.obj("door", tx * T, ty * T, tw * T, th * T, {"to": to, "spawn": spawn})

    def spawn(self, sid: str, tx: int, ty: int) -> None:
        self.obj(f"spawn_{sid}", tx * T + T / 2, ty * T + T / 2, point=True)

    # -------------------------------------------------------------- output
    def autotile(self) -> None:
        g = self.ground
        def same(x: int, y: int, group: set[int]) -> bool:
            return not (0 <= x < self.w and 0 <= y < self.h) or g[y][x] in group
        water = {WATER} | set(range(WATER_EDGE, WATER_EDGE + 16))
        path = PATHLIKE | set(range(PATH_EDGE, PATH_EDGE + 16))
        out = [row[:] for row in g]
        for y in range(self.h):
            for x in range(self.w):
                for group, base, edge in ((water, WATER, WATER_EDGE), (path, PATH, PATH_EDGE)):
                    if g[y][x] != base:
                        continue
                    mask = ((not same(x, y - 1, group)) * 1 | (not same(x + 1, y, group)) * 2
                            | (not same(x, y + 1, group)) * 4 | (not same(x - 1, y, group)) * 8)
                    out[y][x] = base if mask == 0 else edge + mask
        self.ground = out

    def to_tmj(self) -> dict:
        self.autotile()

        def layer(lid: int, name: str, grid: list) -> dict:
            data = [(t + 1) if t is not None else 0 for row in grid for t in row]
            return {"id": lid, "name": name, "type": "tilelayer", "width": self.w, "height": self.h,
                    "x": 0, "y": 0, "opacity": 1, "visible": True, "data": data}
        tiles = [{"id": t, "properties": [{"name": "collides", "type": "bool", "value": True}]} for t in COLLIDES]
        return {
            "type": "map", "version": "1.10", "tiledversion": "1.10.2", "orientation": "orthogonal",
            "renderorder": "right-down", "width": self.w, "height": self.h, "tilewidth": T, "tileheight": T,
            "infinite": False, "nextlayerid": 5, "nextobjectid": self._oid,
            "layers": [layer(1, "ground", self.ground), layer(2, "decor", self.decor), layer(3, "above", self.above),
                       {"id": 4, "name": "objects", "type": "objectgroup", "x": 0, "y": 0, "opacity": 1,
                        "visible": True, "draworder": "topdown", "objects": self.objects}],
            "tilesets": [{"firstgid": 1, "name": "farm_tiles", "image": "../tilesets/farm_tiles.png",
                          "imagewidth": COLS * T, "imageheight": ROWS * T, "tilewidth": T, "tileheight": T,
                          "columns": COLS, "tilecount": COLS * ROWS, "margin": 0, "spacing": 0, "tiles": tiles}],
        }


def build_farm() -> MapBuilder:
    m = MapBuilder(64, 48, seed=11)
    m.grass_variation()
    m.forest_border({(x, y) for x in (62, 63) for y in range(23, 27)})
    # farmhouse (7x6 sprite at 8,4), door at (11,9)
    m.prop("farmhouse", 8, 4, 7, 6, solid_from=1, door=(11, 9), base=DIRT)
    m.door(11, 9, 1, 1, "House", "fromFarm")
    m.fill(9, 10, 14, 11, PATH)                     # front yard
    m.fill(11, 12, 11, 25, PATH)
    m.fill(11, 24, 63, 25, PATH)                    # road to the village
    m.prop("shipping_bin", 13, 10, 2, 1)
    m.obj("shipping_bin", 13 * T, 10 * T, 2 * T, T)
    m.put(16, 11, SIGN)
    # warehouse / vehicle shed with a dirt yard of 4 parking bays in front
    # (bay columns 17, 20, 23, 26 on row 10 — keep in sync with src/data/garage.ts)
    m.fill(17, 8, 28, 11, PATH)
    m.fill(15, 10, 16, 10, PATH)
    m.prop("warehouse", 19, 3, 6, 5, solid_from=1, base=DIRT)
    m.obj("warehouse", 21 * T, 7 * T, 2 * T, T)
    for x in range(4, 8):                           # little bamboo fence by the house
        m.put(x, 10, FENCE)
    m.prop("haystack", 4, 7, 2, 2, solid_from=1)    # haystacks and water jars by the house
    m.prop("haystack", 2, 8, 2, 2, solid_from=1)
    m.prop("jar", 15, 9, 1, 1)
    m.prop("jar", 16, 9, 1, 1)
    # mine: cave in a rocky corner (north-east), path down to the road
    m.prop("cave", 50, 3, 3, 3, door=None)
    m.obj("mine_entrance", 51 * T, 5 * T, T, T)
    m.fill(51, 6, 51, 23, PATH)
    m.scatter(ROCK, 14, (44, 2, 59, 10))
    # water: big pond (south-east) and a small one (south-west)
    m.blob(50, 37, 7, 4.5, WATER)
    m.blob(8, 40, 3.5, 2.5, WATER)
    # woods on the west side, then debris to clear across the open field
    m.scatter(TRUNK, 16, (2, 13, 8, 44))
    starter = (8, 12, 24, 22)                       # keep a cleared patch near the house
    m.scatter(TRUNK, 10, (16, 12, 60, 44), avoid=starter)
    m.scatter(ROCK, 26, (12, 12, 60, 44), avoid=starter)
    m.scatter(BUSH, 70, (10, 12, 60, 44), avoid=starter)
    m.scatter(BUSH, 4, starter)
    m.door(63, 23, 1, 4, "Town", "fromFarm")
    m.spawn("default", 11, 11)
    m.spawn("fromHouse", 11, 10)
    m.spawn("fromTown", 61, 24)
    m.spawn("fromMine", 51, 6)
    return m


def build_town() -> MapBuilder:
    m = MapBuilder(40, 24, seed=23)
    m.grass_variation()
    m.forest_border({(0, y) for y in (11, 12, 13)}, depth=1)
    m.fill(0, 12, 39, 12, PATH)
    m.fill(14, 6, 26, 18, PATH)
    m.prop("well", 19, 11, 2, 2, solid_from=1)      # village well in the square
    m.prop("banyan", 5, 15, 3, 2)                   # the old banyan tree
    # morning market: three stalls in the square, customers stand in front of each
    for x, kind, shop in ((14, "fish", "market_fish"), (18, "veg", "market_veg"), (22, "rice", "market_rice")):
        m.prop(f"stall_{kind}", x, 14, 3, 3, solid_from=1)
        m.obj("shop", (x + 1) * T, 17 * T, T, T, {"shopId": shop})

    def building(x0: int, y0: int, w: int, sprite: str, door_x: int) -> None:
        m.prop(sprite, x0, y0 - 1, w, 5, solid_from=1, door=(door_x, y0 + 3), base=DIRT)
        m.fill(door_x, y0 + 4, door_x, y0 + 4, PATH)
        for x in range(x0, x0 + w):  # no border trees poking through the roof
            m.put(x, y0 - 1, None)
    building(16, 1, 6, "shop", 18)
    m.obj("shop", 18 * T, 4 * T, T, T, {"shopId": "seed_shop"})
    building(5, 3, 5, "house_a", 7)
    m.obj("shop", 7 * T, 6 * T, T, T, {"shopId": "grocery"})
    m.prop("jar", 9, 7, 1, 1)
    building(30, 3, 5, "house_b", 32)
    m.obj("shop", 32 * T, 6 * T, T, T, {"shopId": "vehicle_shop"})
    building(29, 16, 5, "house_c", 31)
    m.put(13, 11, SIGN)
    m.obj("quest_board", 13 * T, 11 * T, T, T)
    for x in range(14, 27, 3):
        m.put(x, 19, BUSH)
    m.scatter(TRUNK, 10, (2, 2, 37, 21))
    m.scatter(BUSH, 6, (2, 2, 37, 21))
    m.door(0, 11, 1, 3, "Farm", "fromTown")
    m.spawn("fromFarm", 2, 12)
    m.spawn("default", 2, 12)
    return m


def build_house() -> MapBuilder:
    m = MapBuilder(16, 12, seed=5)
    for y in range(12):
        for x in range(16):
            m.ground[y][x] = FLOOR if (x + y // 2) % 5 else FLOOR2
    for x in range(16):
        m.put(x, 0, IWALL); m.put(x, 1, WALLPAPER); m.put(x, 2, WAINSCOT); m.put(x, 11, IWALL)
    for y in range(12):
        m.put(0, y, IWALL); m.put(15, y, IWALL)
    m.put(8, 11, None); m.ground[11][8] = DOOR
    m.prop("window", 2, 1, 2, 1, solid_from=None, layer="wall")
    m.prop("painting", 11, 1, 1, 1, solid_from=None, layer="wall")
    m.prop("window", 12, 1, 2, 1, solid_from=None, layer="wall")
    m.prop("bed", 1, 3, 2, 2)
    m.obj("bed", 1 * T, 3 * T, 2 * T, 2 * T)
    m.prop("plant", 3, 3, 1, 1)
    m.prop("bookshelf", 5, 3, 2, 1)
    m.prop("tea_cabinet", 8, 3, 2, 1)
    m.prop("dish_cabinet", 12, 3, 2, 1)
    m.prop("kitchen_stove", 14, 3, 1, 1)
    m.prop("rug", 5, 6, 3, 2, solid_from=None, layer="floor")
    m.prop("table", 10, 7, 2, 1)
    m.prop("chair", 9, 7, 1, 1)
    m.prop("chair", 12, 7, 1, 1)
    m.prop("plant", 14, 10, 1, 1)
    m.prop("plant", 1, 10, 1, 1)
    m.door(8, 11, 1, 1, "Farm", "fromHouse")
    m.spawn("fromFarm", 8, 10)
    m.spawn("default", 3, 5)
    return m


def make_maps() -> None:
    out = ASSETS / "maps"
    out.mkdir(parents=True, exist_ok=True)
    for name, builder in (("farm", build_farm), ("town", build_town), ("house", build_house)):
        (out / f"{name}.tmj").write_text(json.dumps(builder().to_tmj(), indent=1))
