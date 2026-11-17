"""Don't Starve-style regions for the 425x425 province maps.

The land is split into irregular regions (a Voronoi diagram whose distances
are bent by smooth noise, so borders wiggle naturally). Each region gets a
biome; the biome paints its ground first, and its plants, rocks and houses
last, after rivers, trails and landmarks have claimed their tiles. Trails
join the region centres (a spanning tree plus a few loops).
"""
from __future__ import annotations

import math
from typing import Callable

import numpy as np

from .province_tiles import (BAMBOO_TREE, DRY_GRASS, LOTUS, MANGROVE_TREE, MARSH, ORCHARD, PADDY, PINE_TREE, REEDS,
                             RICE, ROCKY, SAND, SAND2, SEA, SURF)
from .region import Province, _pave, place
from .water_tiles import SEA_DEEP
from .tiles import BUSH, DIRT, FLOWERS, FOREST, GRASS, GRASS2, GRASS3, PATH, ROCK, TRUNK, WATER

GRASSY = {GRASS, GRASS2, GRASS3, FLOWERS}
Score = Callable[[float, float], float]


def smooth_noise(w: int, h: int, cell: int, rng: np.random.Generator) -> np.ndarray:
    """Value noise in [0, 1]: random values on a coarse grid, smoothly interpolated."""
    gw, gh = w // cell + 2, h // cell + 2
    grid = rng.random((gh, gw))
    ys, xs = np.mgrid[0:h, 0:w] / cell
    x0, y0 = xs.astype(int), ys.astype(int)
    tx, ty = xs - x0, ys - y0
    tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
    a, b = grid[y0, x0], grid[y0, x0 + 1]
    c, d = grid[y0 + 1, x0], grid[y0 + 1, x0 + 1]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


class Regions:
    def __init__(self, m: Province, count: int, warp: float = 26):
        self.m = m
        rng = np.random.default_rng(m.rnd.randint(0, 2 ** 31))
        land = np.array([[g not in (SEA, SURF, SEA_DEEP) for g in row] for row in m.ground])
        side = int(math.sqrt(count))
        seeds = []
        for gy in range(side):
            for gx in range(side):
                x = int((gx + 0.15 + 0.7 * rng.random()) * m.w / side)
                y = int((gy + 0.15 + 0.7 * rng.random()) * m.h / side)
                if land[min(y, m.h - 1), min(x, m.w - 1)]:
                    seeds.append((x, y))
        ys, xs = np.mgrid[0:m.h, 0:m.w]
        wx = xs + (smooth_noise(m.w, m.h, 40, rng) - 0.5) * 2 * warp
        wy = ys + (smooth_noise(m.w, m.h, 40, rng) - 0.5) * 2 * warp
        dist = np.stack([(wx - sx) ** 2 + (wy - sy) ** 2 for sx, sy in seeds])
        self.id = np.where(land, np.argmin(dist, axis=0), -1)
        self.count = len(seeds)
        self.centers: list[tuple[int, int]] = []
        for r in range(self.count):
            yy, xx = np.nonzero(self.id == r)
            self.centers.append((int(xx.mean()), int(yy.mean())) if len(xx) else seeds[r])
        self.biome: dict[int, str] = {}
        # Smooth patches for ground variety inside a biome (rock outcrops, dry grass, wet spots).
        self.patches = smooth_noise(m.w, m.h, 7, rng)

    def at(self, x: int, y: int) -> int:
        return int(self.id[y, x])

    def tiles(self, r: int) -> list[tuple[int, int]]:
        yy, xx = np.nonzero(self.id == r)
        return list(zip(xx.tolist(), yy.tolist()))

    def force(self, x: int, y: int, biome: str) -> int:
        r = self.at(x, y)
        if r >= 0:
            self.biome[r] = biome
        return r

    def force_area(self, area: tuple[int, int, int, int], biome: str) -> None:
        """Every region whose centre lies in the rectangle (and isn't set yet) gets this biome."""
        x0, y0, x1, y1 = area
        for r, (cx, cy) in enumerate(self.centers):
            if r not in self.biome and x0 <= cx <= x1 and y0 <= cy <= y1:
                self.biome[r] = biome

    def assign(self, recipe: list[tuple[str, int, Score]], default: str = "grass") -> None:
        """Gives each biome its count of the free regions that score best for it."""
        for biome, n, score in recipe:
            free = [r for r in range(self.count) if r not in self.biome]
            for r in sorted(free, key=lambda r: -score(*self.centers[r]))[:n]:
                self.biome[r] = biome
        for r in range(self.count):
            self.biome.setdefault(r, default)

    def regions_of(self, biome: str) -> list[int]:
        return [r for r, b in self.biome.items() if b == biome]


# ------------------------------------------------------------------ ground
# Ground per biome: (tile where the patch noise is above the threshold, threshold).
# Patches come from smooth noise, so rock and dry grass form natural clumps.
GROUND: dict[str, tuple[int, float]] = {
    "meadow": (FLOWERS, 0.72),
    "mountain": (ROCKY, 0.3),
    "karst": (ROCKY, 0.55),
    "pine": (DRY_GRASS, 0.6),
    "dunes": (SAND, -1),
    "dry": (DRY_GRASS, 0.2),
    "marsh": (MARSH, -1),
    "mangrove": (MARSH, -1),
}


def paint_ground(m: Province, regions: Regions) -> None:
    for r, biome in regions.biome.items():
        ground = GROUND.get(biome)
        if ground:
            tile, threshold = ground
            for x, y in regions.tiles(r):
                if m.ground[y][x] in GRASSY and regions.patches[y, x] > threshold:  # never over water or beach
                    m.ground[y][x] = SAND2 if tile == SAND and m.rnd.random() < 0.06 else tile
    for r in regions.regions_of("mangrove"):  # tidal channels among the mangroves
        for x, y in regions.tiles(r):
            if 0.48 < regions.patches[y, x] < 0.52:
                m.ground[y][x] = WATER
    for r in regions.regions_of("marsh"):  # lotus ponds in the marshes
        cx, cy = regions.centers[r]
        for _ in range(4):
            px, py = cx + m.rnd.randint(-18, 18), cy + m.rnd.randint(-14, 14)
            rx, ry = m.rnd.uniform(4, 9), m.rnd.uniform(3, 6)
            for y in range(int(py - ry), int(py + ry) + 1):
                for x in range(int(px - rx), int(px + rx) + 1):
                    if (0 <= x < m.w and 0 <= y < m.h and regions.at(x, y) == r and m.ground[y][x] == MARSH
                            and ((x - px) / rx) ** 2 + ((y - py) / ry) ** 2 <= 1):
                        m.ground[y][x] = LOTUS


# ------------------------------------------------------------------ trails
def trail(m: Province, a: tuple[int, int], b: tuple[int, int], width: int = 2) -> None:
    """A straight-ish dirt trail (a thick staircase line) from a to b; water becomes bridge."""
    (x0, y0), (x1, y1) = a, b
    steps = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(steps + 1):
        x = round(x0 + (x1 - x0) * i / steps)
        y = round(y0 + (y1 - y0) * i / steps)
        for dy in range(width):
            for dx in range(width):
                _pave(m, x + dx, y + dy, PATH)


def connect(m: Province, regions: Regions, extra_points: list[tuple[int, int]], loops: int = 6) -> None:
    """Trails along a minimum spanning tree of the region centres (and the exits), plus a few loops."""
    pts = [regions.centers[r] for r in range(regions.count)] + extra_points
    n = len(pts)
    d = lambda i, j: math.dist(pts[i], pts[j])  # noqa: E731
    used, edges = {0}, []
    while len(used) < n:
        i, j = min(((i, j) for i in used for j in range(n) if j not in used), key=lambda e: d(*e))
        used.add(j)
        edges.append((i, j))
    pairs = sorted(((d(i, j), i, j) for i in range(n) for j in range(i + 1, n)), key=lambda e: e[0])
    for _, i, j in pairs:
        if loops <= 0:
            break
        if (i, j) not in edges and (j, i) not in edges and d(i, j) < 110:
            edges.append((i, j))
            loops -= 1
    for i, j in edges:
        trail(m, pts[i], pts[j])


# ------------------------------------------------------------------ contents
def _spaced(m: Province, x: int, y: int, tile: int) -> None:
    """Puts a tree unless another tree is right next to it (keeps room to walk). Any
    unclaimed land will do (grass, rock, marsh mud, dry grass), never water or sand."""
    if (x, y) in m.taken or m.decor[y][x] is not None or m.ground[y][x] in (WATER, LOTUS, SEA, SURF, SAND, SAND2):
        return
    for yy in (y - 1, y):
        for xx in (x - 1, x, x + 1):
            if (xx, yy) != (x, y) and 0 <= xx < m.w and 0 <= yy < m.h and m.decor[yy][xx] in TREES:
                return
    m.put(x, y, tile)


TREES = {FOREST, TRUNK, ORCHARD, PINE_TREE, BAMBOO_TREE, MANGROVE_TREE}


def _sprinkle(m: Province, tiles: list[tuple[int, int]], picks: list[tuple[int, float]], spaced: bool = True,
              grounds: set[int] | None = None) -> None:
    for x, y in tiles:
        if grounds is not None and m.ground[y][x] not in grounds:
            continue
        roll = m.rnd.random()
        for tile, p in picks:
            if roll < p:
                if tile in TREES and spaced:
                    _spaced(m, x, y, tile)
                elif m.free(x, y) or (grounds is not None and (x, y) not in m.taken and m.decor[y][x] is None):
                    m.put(x, y, tile)
                break
            roll -= p


def fill_contents(m: Province, regions: Regions, mountains: list[tuple[str, int, int]],
                  houses: list[tuple[str, int, int]]) -> None:
    for r, biome in regions.biome.items():
        tiles = regions.tiles(r)
        if biome in ("mountain", "karst"):
            for _ in range(len(tiles) // 200):
                s, w, h = mountains[m.rnd.randrange(len(mountains))]
                x, y = tiles[m.rnd.randrange(len(tiles))]
                if all(regions.at(min(m.w - 1, xx), min(m.h - 1, yy)) == r for xx in (x, x + w) for yy in (y, y + h)):
                    place(m, s, x, y, w, h, solid_from=h // 3, pad=0)
            stony = {ROCKY, GRASS, GRASS2, GRASS3, FLOWERS}
            picks = [(PINE_TREE, 0.05), (ROCK, 0.03), (BUSH, 0.02)] if biome == "mountain" else [(FOREST, 0.16), (ROCK, 0.02), (BUSH, 0.02)]
            _sprinkle(m, tiles, picks, grounds=stony)
        elif biome == "forest":
            _sprinkle(m, tiles, [(FOREST, 0.34), (TRUNK, 0.02), (BUSH, 0.04)])
        elif biome == "pine":
            _sprinkle(m, tiles, [(PINE_TREE, 0.3), (ROCK, 0.01)], grounds={GRASS, GRASS2, GRASS3, FLOWERS, DRY_GRASS})
        elif biome == "bamboo":
            _sprinkle(m, tiles, [(BAMBOO_TREE, 0.4), (BUSH, 0.03)])
        elif biome == "mangrove":
            _sprinkle(m, tiles, [(MANGROVE_TREE, 0.35), (REEDS, 0.1)], grounds={MARSH})
        elif biome == "marsh":
            _sprinkle(m, tiles, [(REEDS, 0.14), (BAMBOO_TREE, 0.02)], grounds={MARSH})
        elif biome == "dunes":
            _sprinkle(m, tiles, [(REEDS, 0.01)], grounds={SAND, SAND2})
            for x, y in tiles[:: 97]:
                if (x, y) not in m.taken and m.decor[y][x] is None and m.ground[y][x] in (SAND, SAND2):
                    m.prop("casuarina", x, y, 1, 1)
                    m.taken.add((x, y))
        elif biome == "dry":
            _sprinkle(m, tiles, [(BUSH, 0.05), (TRUNK, 0.006)], grounds={DRY_GRASS, GRASS3})
        elif biome == "orchard":
            for x, y in tiles:
                if x % 3 == 0 and y % 3 == 0 and m.free(x, y):
                    m.put(x, y, ORCHARD)
        elif biome == "rice":
            rice(m, tiles)
        elif biome in ("village", "hamlet"):
            settlement(m, regions, r, houses, dense=biome == "village")
        elif biome != "none":  # grass / meadow
            _sprinkle(m, tiles, [(BUSH, 0.012), (TRUNK, 0.006), (FOREST, 0.004)])


def rice(m: Province, tiles: list[tuple[int, int]]) -> None:
    """Village rice in plots on a fixed grid (dikes every 10 x 7 tiles)."""
    for x, y in tiles:
        if not m.free(x, y):
            continue
        dike = x % 10 == 9 or y % 7 == 6
        m.ground[y][x] = DIRT if dike else PADDY
        if not dike:
            m.decor[y][x] = RICE
        m.taken.add((x, y))


def settlement(m: Province, regions: Regions, r: int, houses: list[tuple[str, int, int]], dense: bool) -> None:
    """Houses on lots along a grid of lanes, inside the region; yards with haystacks, jars, wells, fruit trees."""
    tiles = regions.tiles(r)
    xs = [x for x, _ in tiles]
    ys = [y for _, y in tiles]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    lot_w, lot_h = 9, 8
    inside = lambda x, y: 0 <= x < m.w and 0 <= y < m.h and regions.at(x, y) == r  # noqa: E731
    for ly in range(y0 - y0 % lot_h, y1, lot_h):
        for x in range(x0, x1 + 1):  # lane along the bottom of each row of lots
            if inside(x, ly + lot_h - 1) and inside(x, ly + lot_h - 2):
                _pave(m, x, ly + lot_h - 1, PATH)
        for lx in range(x0 - x0 % lot_w, x1, lot_w):
            if (lx // lot_w) % 3 == 0:
                for y in range(ly, ly + lot_h):
                    if inside(lx, y):
                        _pave(m, lx, y, PATH)
                        _pave(m, lx + 1, y, PATH)
            if not dense and m.rnd.random() < 0.55:
                continue
            s, w, h = houses[m.rnd.randrange(len(houses))]
            hx, hy = lx + 2 + m.rnd.randint(0, lot_w - w - 2), ly + lot_h - 1 - h
            if all(inside(x, y) for x in (hx, hx + w) for y in (hy - 2, hy + h)) and place(m, s, hx, hy, w, h):
                _yard(m, lx + 2, ly, lot_w - 2, lot_h - h - 1)


def _yard(m: Province, x0: int, y0: int, w: int, h: int) -> None:
    for _ in range(2):
        x, y = m.rnd.randint(x0, x0 + max(0, w - 2)), m.rnd.randint(y0, y0 + max(0, h - 1))
        roll = m.rnd.random()
        if roll < 0.3:
            place(m, "haystack", x, y, 2, 2)
        elif roll < 0.6:
            place(m, "jar", x, y, 1, 1)
        elif roll < 0.7:
            place(m, "well", x, y, 2, 2)
        elif m.area_free(x - 1, y - 2, 3, 3):
            m.put(x, y, TRUNK)

