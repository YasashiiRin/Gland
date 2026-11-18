"""Shared pieces for the big 425x425 province maps: house sets, markets, fish
ponds, buffalo herds, stone quays, jetties and the special-zone markers."""
from __future__ import annotations

from .biome import Regions
from .province_tiles import BRIDGE, PALM_TREE, PAVING
from .region import Province, place, road
from .tiles import BLOCK, DIRT, GRASS, WATER
from .water_tiles import FLOWERBED, QUAY_EDGE

SIZE = 425
# The maps grew 50% (the player asked, 2026-11-18): the same 425 wide, 640 tall; the new
# southern plain holds the village and its fields (villages.py).
TALL = 640
HOUSES = [("house_a", 5, 4), ("house_b", 5, 4), ("house_c", 5, 4), ("thatched_house", 5, 4)]
GARDEN_HOUSES = [("house_a", 5, 4), ("house_c", 5, 4), ("house_b", 5, 4)]
MOUNTAINS = [("mountain", 8, 6)]
KARST = [("karst_a", 4, 6), ("karst_b", 4, 6), ("mountain", 8, 6)]
STALLS = ["umbrella_fruit", "umbrella_veg", "umbrella_fish", "umbrella_flower", "stall_rice", "umbrella_veg"]


def water_spots(m: Province, w: int, every: int, rows: range, cols: range) -> list[tuple[int, int]]:
    spots = []
    for y in rows[::every]:
        for x in cols:
            if all(m.ground[yy][xx] == WATER for xx in range(x, x + w) for yy in (y, y + 1)):
                spots.append((x, y))
                break
    return spots


def crossing(m: Province, x: int, y_range: range) -> int | None:
    """First row where the road at column x becomes a bridge."""
    return next((y for y in y_range if m.ground[y][x] == BRIDGE), None)


def market(m: Province, x0: int, y0: int, rows: int = 2, cols: int = 4) -> None:
    """A paved market square with rows of stalls."""
    for dy in range(-2, rows * 5 + 1):
        road(m, [(x0 - 2, y0 + dy), (x0 + cols * 5 + 1, y0 + dy)], 1, PAVING)
    for r in range(rows):
        for c in range(cols):
            x, y = x0 + c * 5, y0 + r * 5
            m.prop(STALLS[(r * cols + c) % len(STALLS)], x, y, 3, 3)
            for yy in range(y + 1, y + 3):
                for xx in range(x, x + 3):
                    m.put(xx, yy, BLOCK)


def fish_ponds(m: Province, x0: int, y0: int, x1: int, y1: int, name: str = "") -> None:
    """Square fish ponds separated by earth dikes; each one a "fish_pond" players can stock."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y):
                m.ground[y][x] = DIRT if (x - x0) % 12 == 11 or (y - y0) % 9 == 8 else WATER
                m.taken.add((x, y))
    n = 0
    for cy in range(y0, y1 + 1, 9):
        for cx in range(x0, x1 + 1, 12):
            w, h = min(11, x1 + 1 - cx), min(8, y1 + 1 - cy)
            water = sum(m.ground[y][x] == WATER for y in range(cy, cy + h) for x in range(cx, cx + w))
            if w > 2 and h > 2 and water * 2 > w * h:
                n += 1
                m.obj("fish_pond", cx * 16, cy * 16, w * 16, h * 16, {"pondName": f"Ao cá {name} số {n}".replace("  ", " ")})


def herd(m: Province, regions: Regions, biomes: tuple[str, ...], count: int) -> None:
    """Water buffaloes grazing in the fields and meadows."""
    rs = [r for r, b in regions.biome.items() if b in biomes]
    for i in range(count * 8):
        if count <= 0 or not rs:
            break
        tiles = regions.tiles(rs[i % len(rs)])
        x, y = tiles[m.rnd.randrange(len(tiles))]
        if m.free(x, y) and m.free(x + 1, y) and place(m, "buffalo", x, y, 2, 1, solid_from=0, force=True):
            count -= 1


def quay(m: Province, x0: int, y0: int, x1: int, y1: int) -> None:
    """River water in the rectangle gets stone embankments (a town riverside)."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.ground[y][x] == WATER:
                m.ground[y][x] = QUAY_EDGE


def jetty(m: Province, x: int, y0: int, y1: int) -> None:
    """A two-plank-wide wooden landing stage running north/south into the water."""
    road(m, [(x, y0), (x, y1)], 2, BRIDGE)


def clearing(m: Province, area: tuple[int, int, int, int], palms: float = 0.02, flowers: float = 0.03) -> None:
    """Open grass for a landmark area (nothing else will grow or be built there),
    with a few palms and flower beds."""
    x0, y0, x1, y1 = area
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if (x, y) in m.taken or m.ground[y][x] == WATER:
                continue
            m.ground[y][x] = GRASS if m.ground[y][x] != PAVING else PAVING
            roll = m.rnd.random()
            if roll < palms and all(m.decor[yy][xx] is None for yy in (y - 1, y) for xx in (x - 1, x, x + 1)):
                m.put(x, y, PALM_TREE)
            elif roll < palms + flowers and m.decor[y][x] is None:
                m.put(x, y, FLOWERBED)
            m.taken.add((x, y))


def place_near(m: Province, sprite: str, x: int, y: int, w: int, h: int, solid_from: int | None = 1,
               radius: int = 12) -> tuple[int, int] | None:
    """Places a prop on free ground as close to (x, y) as possible."""
    for r in range(radius + 1):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                if max(abs(dx), abs(dy)) == r and place(m, sprite, x + dx, y + dy, w, h, solid_from):
                    return x + dx, y + dy
    return None


def walk_under(m: Province, sprite: str, x: int, y: int, w: int, h: int, solid_rows: int) -> None:
    """A prop whose top `solid_rows` rows block and whose bottom rows can be walked (stairs)."""
    m.prop(sprite, x, y, w, h, solid_from=None)
    m.claim(x, y, w, h)
    for yy in range(y, y + solid_rows):
        for xx in range(x, x + w):
            m.put(xx, yy, BLOCK)


def zone(m: Province, name: str, area: tuple[int, int, int, int]) -> None:
    """Marks a special landmark zone (safe, no building; its fields, ponds and
    terrain are always there). Read by the game from the "zone" objects."""
    x0, y0, x1, y1 = area
    m.obj("zone", x0 * 16, y0 * 16, (x1 - x0 + 1) * 16, (y1 - y0 + 1) * 16, {"zoneName": name, "kind": "landmark"})


def street_row(m: Province, x0: int, x1: int, road_y: int, seed: int = 0) -> None:
    """Two-storey shophouses side by side along the north side of an east-west
    street at road_y (fronts facing the street), wherever the ground is free."""
    x, i = x0, seed
    while x + 3 <= x1:
        if place(m, f"shophouse_{i % 6}", x, road_y - 2, 3, 2, solid_from=0):
            i += 1
            x += 3
        else:
            x += 1


def mooring(m: Province, boat_id: str, x: int, y: int, radius: int = 10) -> bool:
    """A rowing boat tied up on the water nearest to (x, y), right beside the bank."""
    def wet(xx: int, yy: int) -> bool:
        return 0 <= xx < m.w and 0 <= yy < m.h and m.ground[yy][xx] in (WATER, QUAY_EDGE)
    for r in range(radius + 1):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                tx, ty = x + dx, y + dy
                if max(abs(dx), abs(dy)) != r or not wet(tx, ty) or not all(wet(tx + a, ty) for a in (-1, 1)):
                    continue
                if any(not wet(tx + a, ty + b) for a, b in ((0, 1), (0, -1), (2, 0), (-2, 0))):
                    m.obj("boat", tx * 16 + 8, ty * 16 + 12, props={"boatId": boat_id}, point=True)
                    return True
    return False
