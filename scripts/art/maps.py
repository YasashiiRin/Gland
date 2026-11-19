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
from .facing import set_facings
from .real_scale import FRONT_ROWS, LANDMARKS, scale_box
from .province_tiles import BIOME_TREES, ORCHARD
from .water_tiles import DEEP, QUAY_EDGE
from .tiles import (BLOCK, COLLIDES, COLS, DIRT, DOOR, FLOWERS, FOREST, GRASS, GRASS2, GRASS3, PATH, PATH_EDGE, ROWS, TRUNK, WATER, WATER_EDGE)

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
             layer: str = "", door: tuple[int, int] | None = None, base: int | None = None,
             facing: str = "") -> None:
        """A sprite drawn bottom-aligned on a tw x th footprint. Rows from
        `solid_from` down are blocked (None = walk-through), except `door`.
        `facing`: the way a building fronts (else worked out from the roads, facing.py)."""
        tx, ty, tw, th = scale_box(sprite, tx, ty, tw, th)  # true size next to a person (real_scale.py)
        props = {"sprite": sprite, "layer": layer}
        if facing:
            props["facing"] = facing
        self.obj("prop", tx * T, ty * T, tw * T, th * T, props)
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
        """Bank/edge variants for water, stone-embanked (quay) water and paths, then
        deep water wherever a water tile has water all around it two tiles deep."""
        g = self.ground
        def same(x: int, y: int, group: set[int]) -> bool:
            return not (0 <= x < self.w and 0 <= y < self.h) or g[y][x] in group
        water = {WATER, DEEP} | set(range(WATER_EDGE, WATER_EDGE + 16)) | set(range(QUAY_EDGE, QUAY_EDGE + 16))
        path = PATHLIKE | set(range(PATH_EDGE, PATH_EDGE + 16))
        out = [row[:] for row in g]
        for y in range(self.h):
            for x in range(self.w):
                for group, base, edge in ((water, WATER, WATER_EDGE), (water, QUAY_EDGE, QUAY_EDGE),
                                          (path, PATH, PATH_EDGE)):
                    if g[y][x] != base:
                        continue
                    mask = ((not same(x, y - 1, group)) * 1 | (not same(x + 1, y, group)) * 2
                            | (not same(x, y + 1, group)) * 4 | (not same(x - 1, y, group)) * 8)
                    out[y][x] = base if mask == 0 else edge + mask
                if g[y][x] == WATER and all(same(x + dx, y + dy, water) for dy in range(-2, 3) for dx in range(-2, 3)):
                    out[y][x] = DEEP
        self.ground = out

    def thin_trees(self) -> None:
        """Trees are drawn at true size, several tiles across: at most one tree per 2 x 2 tiles, so
        each tree you see is one you can walk up to and fell (no invisible tree tiles between)."""
        trees = {TRUNK, FOREST, ORCHARD, *BIOME_TREES}
        seen: set[tuple[int, int]] = set()
        for y in range(self.h):
            for x in range(self.w):
                if self.decor[y][x] not in trees:
                    continue
                cell = (x // 2, y // 2)
                if cell in seen:
                    self.decor[y][x] = None
                else:
                    seen.add(cell)

    def clear_fronts(self) -> None:
        """Takes away the trees standing just in front of (below) a landmark, which would hide it."""
        trees = {TRUNK, FOREST, ORCHARD, *BIOME_TREES}
        for o in self.objects:
            props = {p["name"]: p["value"] for p in o.get("properties", [])}
            if o["name"] != "prop" or props.get("sprite") not in LANDMARKS:
                continue
            x0, x1 = int(o["x"] // T) - 2, int((o["x"] + o["width"]) // T) + 2
            bottom = int((o["y"] + o["height"]) // T)
            for y in range(bottom, min(self.h, bottom + FRONT_ROWS)):
                for x in range(max(0, x0), min(self.w, x1)):
                    if self.decor[y][x] in trees:
                        self.decor[y][x] = None

    def to_tmj(self) -> dict:
        set_facings(self)  # before autotile: it reads the plain road tiles
        self.clear_fronts()
        self.thin_trees()
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


def make_maps() -> None:
    out = ASSETS / "maps"
    out.mkdir(parents=True, exist_ok=True)
    from .world_maps import WORLD_MAPS
    for name, builder in WORLD_MAPS:
        # compact JSON: the world maps are 425x425 tiles
        (out / f"{name}.tmj").write_text(json.dumps(builder().to_tmj(), separators=(",", ":")))
    # The village paddies: packed around the families' plots, paths joined up (shrink_paddies.py).
    from .shrink_paddies import main as lay_out_paddies
    lay_out_paddies()
