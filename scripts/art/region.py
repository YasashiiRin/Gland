"""Toolkit for the big province maps (224x140 tiles, about 12x the first ones).

A province is laid out in layers, each step only using ground that is still
free, so earlier features win: terrain (coast, rivers, lakes) -> roads ->
landmarks -> mountains -> villages -> rice fields -> forest and scatter ->
the forest border and the road exits. Roads crossing water become bridges.
"""
from __future__ import annotations

import math

from .maps import MapBuilder
from .real_scale import scale_box
from .water_tiles import SEA_DEEP
from .province_tiles import BRIDGE, CITADEL, ORCHARD, PADDY, RICE, SALT, SAND, SAND2, SEA, SURF, TEA
from .tiles import (BLOCK, DIRT, FENCE, FLOWERS, FOREST, GRASS, GRASS2, GRASS3, PATH, ROCK, TRUNK, WATER,
                    WATER_EDGE)

W, H = 224, 140
GRASSY = {GRASS, GRASS2, GRASS3, FLOWERS}
WATERY = {WATER, SEA, SURF, SEA_DEEP}
EXIT_W = 4


class Province(MapBuilder):
    """MapBuilder plus a record of tiles already claimed by a feature."""

    def __init__(self, seed: int, w: int = W, h: int = H, home_prefix: str = "h"):
        super().__init__(w, h, seed)
        self.home_prefix = home_prefix            # homestead ids ("qb12"), see homesteads.py
        self.town_areas: list[tuple[int, int, int, int]] = []   # landmark/town zones: where houses may stand in streets
        self.grass_variation()
        self.taken: set[tuple[int, int]] = set()
        self.exits: list[tuple[str, int]] = []

    def free(self, x: int, y: int) -> bool:
        return (0 <= x < self.w and 0 <= y < self.h and (x, y) not in self.taken
                and self.decor[y][x] is None and self.ground[y][x] in GRASSY)

    def area_free(self, x0: int, y0: int, w: int, h: int, pad: int = 0) -> bool:
        return all(self.free(x, y) for y in range(y0 - pad, y0 + h + pad) for x in range(x0 - pad, x0 + w + pad))

    def to_tmj(self) -> dict:
        """Like MapBuilder's, without the "above" layer (always empty here; it would cost
        the game one tile object per cell)."""
        tmj = super().to_tmj()
        tmj["layers"] = [layer for layer in tmj["layers"] if layer["name"] != "above"]
        return tmj

    def claim(self, x0: int, y0: int, w: int, h: int) -> None:
        self.taken.update((x, y) for y in range(y0, y0 + h) for x in range(x0, x0 + w))


# ------------------------------------------------------------------ terrain
def ellipse(m: Province, cx: float, cy: float, rx: float, ry: float, tile: int, wobble: float = 0.15) -> None:
    for y in range(max(0, int(cy - ry - 1)), min(m.h, int(cy + ry + 2))):
        for x in range(max(0, int(cx - rx - 1)), min(m.w, int(cx + rx + 2))):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 - wobble * m.rnd.random():
                m.ground[y][x] = tile


def coast(m: Province, base_x: int, amp: float = 4, sand: int = 7) -> list[int]:
    """A wavy east coast: sand, a line of surf, then sea. Returns the shore x of each row."""
    shore = []
    for y in range(m.h):
        sx = int(base_x + amp * math.sin(y / 17) + amp * 0.5 * math.sin(y / 6.3))
        shore.append(sx)
        for x in range(sx, m.w):
            d = x - sx
            m.ground[y][x] = ((SAND2 if m.rnd.random() < 0.07 else SAND) if d < sand else SURF if d == sand
                              else SEA if d < sand + 9 + (y // 5) % 3 else SEA_DEEP)
    return shore


def river(m: Province, points: list[tuple[float, float]], width: float, tile: int = WATER) -> None:
    """A river along a polyline, `width` tiles wide (land only: it stops at the sea)."""
    r = width / 2
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(steps + 1):
            t = i / steps
            cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for y in range(int(cy - r - 1), int(cy + r + 2)):
                for x in range(int(cx - r - 1), int(cx + r + 2)):
                    if 0 <= x < m.w and 0 <= y < m.h and (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                        if m.ground[y][x] not in (SEA, SURF, SEA_DEEP):
                            m.ground[y][x] = tile


def meander(x0: float, y0: float, x1: float, y1: float, amp: float, waves: float, seed: int = 0) -> list[tuple[float, float]]:
    """Points of a winding line from (x0,y0) to (x1,y1)."""
    n = 40
    dx, dy = x1 - x0, y1 - y0
    ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / ln, dx / ln
    pts = []
    for i in range(n + 1):
        t = i / n
        off = amp * math.sin(t * math.pi * 2 * waves + seed) * math.sin(math.pi * t) ** 0.5
        pts.append((x0 + dx * t + nx * off, y0 + dy * t + ny * off))
    return pts


# ------------------------------------------------------------------ roads
def road(m: Province, points: list[tuple[int, int]], width: int = 2, tile: int = PATH) -> None:
    """Axis-aligned road segments through the points (x first, then y). Water becomes bridge."""
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        for x, y in ([(x, y0) for x in _span(x0, x1)] + [(x1, y) for y in _span(y0, y1)]):
            for dy in range(width):
                for dx in range(width):
                    _pave(m, x + dx, y + dy, tile)


def _span(a: int, b: int) -> range:
    return range(a, b + 1) if b >= a else range(a, b - 1, -1)


def _pave(m: Province, x: int, y: int, tile: int) -> None:
    if not (0 <= x < m.w and 0 <= y < m.h):
        return
    g = m.ground[y][x]
    if g in WATERY or WATER_EDGE <= g < WATER_EDGE + 16:
        m.ground[y][x] = BRIDGE
    elif g not in (BRIDGE,):
        m.ground[y][x] = tile if g not in (SAND, SAND2) else g
    m.decor[y][x] = None
    m.taken.add((x, y))


# ------------------------------------------------------------------ placing things
def place(m: Province, sprite: str, x: int, y: int, w: int, h: int, solid_from: int | None = 1,
          force: bool = False, layer: str = "", pad: int = 0, facing: str = "") -> bool:
    """A landmark/house prop, only on free ground unless forced. Returns whether it was placed."""
    x, y, w, h = scale_box(sprite, x, y, w, h)  # true size next to a person (real_scale.py)
    if not force and not m.area_free(x, y, w, h, pad):
        return False
    m.prop(sprite, x, y, w, h, solid_from=solid_from, layer=layer, facing=facing)
    m.claim(x - pad, y - pad, w + 2 * pad, h + 2 * pad)
    return True


def place_some(m: Province, sprite: str, w: int, h: int, count: int, area: tuple[int, int, int, int],
               solid_from: int | None = 1, pad: int = 1) -> int:
    x0, y0, x1, y1 = area
    placed = 0
    for _ in range(count * 30):
        if placed >= count:
            break
        if place(m, sprite, m.rnd.randint(x0, x1 - w), m.rnd.randint(y0, y1 - h), w, h, solid_from, pad=pad):
            placed += 1
    return placed


def mountains(m: Province, area: tuple[int, int, int, int], sprites: list[tuple[str, int, int]], count: int) -> None:
    """A range of mountain props (sprite, footprint w, h), then thick forest between them."""
    for i in range(count):
        s, w, h = sprites[i % len(sprites)]
        place_some(m, s, w, h, 1, area, solid_from=h // 3, pad=0)
    forest(m, area, 0.32)
    scatter(m, ROCK, area, 0.02)


def forest(m: Province, area: tuple[int, int, int, int], density: float) -> None:
    """Big uncuttable trees with room to walk between them."""
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y) and m.rnd.random() < density and not any(
                    m.decor[yy][xx] == FOREST for yy in (y - 1, y) for xx in (x - 1, x, x + 1)
                    if 0 <= yy < m.h and 0 <= xx < m.w and (xx, yy) != (x, y)):
                m.put(x, y, FOREST)


def scatter(m: Province, tile: int, area: tuple[int, int, int, int], density: float) -> None:
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y) and m.rnd.random() < density:
                if tile == TRUNK and not m.area_free(x - 1, y - 2, 3, 3):
                    continue
                m.put(x, y, tile)


def rice_fields(m: Province, area: tuple[int, int, int, int], plot: tuple[int, int] = (9, 6)) -> None:
    """Ripe village rice in plots separated by earth dikes; skips anything already there."""
    x0, y0, x1, y1 = area
    pw, ph = plot
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if not m.free(x, y):
                continue
            dike = (x - x0) % (pw + 1) == pw or (y - y0) % (ph + 1) == ph
            m.ground[y][x] = DIRT if dike else PADDY
            if not dike:
                m.decor[y][x] = RICE
            m.taken.add((x, y))


def village(m: Province, area: tuple[int, int, int, int], houses: list[tuple[str, int, int]],
            street: int = PATH, yard: tuple[int, int] = (3, 3)) -> int:
    """Houses in lots along a grid of streets, with yards (haystacks, jars, a well, fences, fruit trees)."""
    x0, y0, x1, y1 = area
    hw = max(w for _, w, _ in houses)
    hh = max(h for _, _, h in houses)
    lot_w, lot_h = hw + yard[0], hh + yard[1]
    built = 0
    for row, ly in enumerate(range(y0, y1 - lot_h, lot_h + 2)):
        road(m, [(x0, ly + lot_h), (x1, ly + lot_h)], 2, street)                 # street under each row
        for col, lx in enumerate(range(x0, x1 - lot_w, lot_w)):
            if col % 3 == 0:
                road(m, [(lx, ly), (lx, ly + lot_h)], 2, street)                 # cross lanes
            s, w, h = houses[(row * 7 + col) % len(houses)]
            hx, hy = lx + 2 + m.rnd.randint(0, lot_w - w - 2), ly + lot_h - h
            if place(m, s, hx, hy, w, h):
                built += 1
                _yard(m, lx + 2, ly, lot_w - 2, lot_h - h)
    return built


def _yard(m: Province, x0: int, y0: int, w: int, h: int) -> None:
    for _ in range(3):
        x, y = m.rnd.randint(x0, x0 + max(0, w - 2)), m.rnd.randint(y0, y0 + max(0, h - 2))
        kind = m.rnd.random()
        if kind < 0.3:
            place(m, "haystack", x, y, 2, 2)
        elif kind < 0.55:
            place(m, "jar", x, y, 1, 1)
        elif kind < 0.65:
            place(m, "well", x, y, 2, 2)
        elif kind < 0.85 and m.area_free(x - 1, y - 2, 3, 3):
            m.put(x, y, TRUNK)
        else:
            for fx in range(x, min(x + 4, x0 + w)):
                if m.free(fx, y):
                    m.put(fx, y, FENCE)


def tea_hills(m: Province, area: tuple[int, int, int, int]) -> None:
    """Clipped tea hedges every other row on red earth, with a gap to walk through every 9 tiles."""
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y):
                m.ground[y][x] = TEA if (y - y0) % 2 == 0 and (x - x0) % 9 != 4 else DIRT
                m.taken.add((x, y))


def orchard(m: Province, area: tuple[int, int, int, int], step: int = 3) -> None:
    """Planted trees in straight rows (the map's orchard sprite: pomelo, rubber, coconut, pine...)."""
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1, step):
        for x in range(x0, x1 + 1, step):
            if m.free(x, y):
                m.put(x, y, ORCHARD)


def salt_fields(m: Province, area: tuple[int, int, int, int]) -> None:
    """Sa Huỳnh salt pans in square plots, with heaps of salt on the dikes."""
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y):
                dike = (x - x0) % 6 == 5 or (y - y0) % 5 == 4
                m.ground[y][x] = DIRT if dike else SALT
                m.taken.add((x, y))
    for y in range(y0 + 4, y1, 10):
        for x in range(x0 + 5, x1 - 2, 12):
            m.prop("salt_pile", x, y, 2, 1)


def beach_trees(m: Province, shore: list[int], sprite: str, every: int = 3, skip: set[int] | None = None) -> None:
    """A row of casuarinas or coconut palms along the back of the beach."""
    for y in range(3, m.h - 3, every):
        x = shore[y] - 1 + (y % 2)
        if (skip and y in skip) or not (0 <= x < m.w) or m.ground[y][x] not in (SAND, SAND2) or (x, y) in m.taken:
            continue
        m.prop(sprite, x, y, 1, 1)
        m.taken.add((x, y))


def boats(m: Province, sprite: str, w: int, spots: list[tuple[int, int]]) -> None:
    for x, y in spots:
        m.prop(sprite, x, y, w, 1)


def walls(m: Province, x0: int, y0: int, x1: int, y1: int, inside: int | None = None, moat: bool = False) -> None:
    """A walled citadel (brick ring), optionally paved inside and ringed by a moat."""
    if moat:
        for y in range(y0 - 3, y1 + 4):
            for x in range(x0 - 3, x1 + 4):
                if not (x0 - 1 <= x <= x1 + 1 and y0 - 1 <= y <= y1 + 1):
                    m.ground[y][x] = WATER
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            edge = x in (x0, x1) or y in (y0, y1)
            if edge:
                m.ground[y][x] = CITADEL
            elif inside is not None:
                m.ground[y][x] = inside


# ------------------------------------------------------------------ edges
def exit_north(m: Province, x: int, to: str, spawn: str, arrive: str) -> None:
    m.exits.append(("n", x))
    road(m, [(x, 0), (x, 6)])
    m.door(x - 1, 0, EXIT_W, 1, to, spawn)
    m.spawn(arrive, x, 2)


def exit_south(m: Province, x: int, to: str, spawn: str, arrive: str) -> None:
    m.exits.append(("s", x))
    road(m, [(x, m.h - 7), (x, m.h - 1)])
    m.door(x - 1, m.h - 1, EXIT_W, 1, to, spawn)
    m.spawn(arrive, x, m.h - 3)


def exit_east(m: Province, y: int, to: str, spawn: str, arrive: str) -> None:
    m.exits.append(("e", y))
    road(m, [(m.w - 7, y), (m.w - 1, y)])
    m.door(m.w - 1, y - 1, 1, EXIT_W, to, spawn)
    m.spawn(arrive, m.w - 3, y)


def finish(m: Province, default_spawn: str) -> Province:
    """Forest border (2 deep, on grass only, open at the exits) and the default spawn."""
    gaps: set[tuple[int, int]] = set()
    for side, at in m.exits:
        for d in range(-1, EXIT_W - 1):
            for k in range(3):
                gaps.add({"n": (at + d, k), "s": (at + d, m.h - 1 - k), "e": (m.w - 1 - k, at + d)}[side])
    for y in range(m.h):
        for x in range(m.w):
            ring = min(x, y, m.w - 1 - x, m.h - 1 - y)
            if ring >= 2 or (x, y) in gaps or m.ground[y][x] not in GRASSY:
                continue
            m.put(x, y, FOREST if ring == 0 or (x + y) % 2 == 0 else BLOCK)
    spawn = next(o for o in m.objects if o["name"] == f"spawn_{default_spawn}")
    m.obj("spawn_default", spawn["x"], spawn["y"], point=True)
    return m


