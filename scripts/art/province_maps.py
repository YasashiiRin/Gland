"""Tiled maps for the central-Vietnam provinces (north -> south along the coast).

Quảng Bình is the home province (the existing Farm + Town maps). Its
neighbours are reached by road: Hà Tĩnh through the north edge of the farm,
Quảng Trị through the south edge of the village. Scenery only for now.
"""
from __future__ import annotations

from .maps import MapBuilder
from .province_tiles import BRIDGE, ORCHARD, SAND, SAND2, SEA, SURF, TEA
from .tiles import BUSH, DIRT, FLOWERS, FOREST, GRASS, GRASS2, GRASS3, PATH, ROCK, SIGN, TRUNK, WATER

GRASSY = (GRASS, GRASS2, GRASS3, FLOWERS)
W, H = 64, 40
SHORE_X = 52            # first sand column of the east coast
EXIT_X = range(30, 34)  # the road between provinces is 4 tiles wide at the map edge


def border(m: MapBuilder, gaps: set[tuple[int, int]], depth: int = 2) -> None:
    """Forest border like MapBuilder.forest_border, but only on grassy ground."""
    for y in range(m.h):
        for x in range(m.w):
            ring = min(x, y, m.w - 1 - x, m.h - 1 - y)
            if ring >= depth or (x, y) in gaps or m.ground[y][x] not in GRASSY:
                continue
            m.put(x, y, FOREST)


def coast(m: MapBuilder) -> None:
    """Sand beach, a line of surf, then open sea on the east side of the map."""
    for y in range(m.h):
        for x in range(SHORE_X, m.w):
            if x < SHORE_X + 6:
                tile = SAND2 if m.rnd.random() < 0.08 else SAND
            else:
                tile = SURF if x == SHORE_X + 6 else SEA
            m.ground[y][x] = tile


def casuarinas(m: MapBuilder, x: int, rows: list[int], sprite: str = "casuarina") -> None:
    """A windbreak of phi lao trees (or palms) along the back of the beach."""
    for y in rows:
        m.prop(sprite, x + (y % 2), y, 1, 1)


def edge_road(y: int) -> set[tuple[int, int]]:
    """The 4-wide gap in the border where a province road leaves the map."""
    return {(x, yy) for x in EXIT_X for yy in (y, y + (1 if y == 0 else -1))}


def road(m: MapBuilder, x0: int, y0: int, x1: int, y1: int) -> None:
    m.fill(x0, y0, x1, y1, PATH)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            m.put(x, y, None)


def build_ha_tinh() -> MapBuilder:
    """Hà Tĩnh: the Hồng Lĩnh ridge and a pagoda, Hương Sơn tea hills,
    Kẻ Gỗ lake, Phúc Trạch pomelo orchards and Thiên Cầm beach."""
    m = MapBuilder(W, H, seed=101)
    m.grass_variation()
    coast(m)
    m.blob(42, 19, 6.5, 4, WATER)                       # Kẻ Gỗ lake
    for y in range(12, 24):                             # tea hills: hedge rows on red hill soil
        for x in range(4, 25):
            m.ground[y][x] = TEA if y % 2 == 0 and x % 7 != 3 else DIRT
    border(m, edge_road(H - 1))
    # Hồng Lĩnh ridge along the north, a pagoda on its slope
    for x0, y0 in ((2, 1), (10, 0), (18, 1)):
        m.prop("mountain", x0, y0, 8, 6, solid_from=2)
    m.prop("pagoda", 29, 2, 4, 4, solid_from=1)
    # pomelo orchard (south-west)
    for y in range(26, 37, 3):
        for x in range(5, 24, 3):
            m.put(x, y, ORCHARD)
    # roads: from the south exit up to the pagoda, and across to the beach
    road(m, 31, 6, 32, H - 1)
    road(m, 4, 30, SHORE_X - 1, 31)
    m.fill(SHORE_X, 30, SHORE_X + 1, 31, SAND)
    casuarinas(m, SHORE_X - 2, [y for y in range(3, H - 3, 2) if y not in (29, 31)])
    for x, y in ((54, 9), (55, 22), (53, 34)):
        m.prop("basket_boat", x, y, 2, 1)
    m.scatter(TRUNK, 10, (26, 8, 48, 36), avoid=(28, 26, 50, 33))
    m.scatter(ROCK, 12, (24, 6, 50, 12))
    m.scatter(BUSH, 30, (26, 8, 48, 37))
    m.put(37, 2, SIGN)                                  # the road north to Nghệ An (not open yet)
    m.door(30, H - 1, 4, 1, "Farm", "fromHaTinh")
    m.spawn("fromQuangBinh", 31, H - 3)
    m.spawn("default", 31, H - 3)
    return m


def build_quang_tri() -> MapBuilder:
    """Quảng Trị: the Bến Hải river with the Hiền Lương bridge and its flag tower,
    Cửa Tùng beach with a red basalt headland, and rubber plantations."""
    m = MapBuilder(W, H, seed=103)
    m.grass_variation()
    coast(m)
    m.fill(0, 17, SHORE_X + 6, 21, WATER)               # Bến Hải river, flowing into the sea
    for x in range(SHORE_X, SHORE_X + 7):
        for y in (16, 22):
            m.ground[y][x] = SAND
    m.fill(30, 16, 32, 22, BRIDGE)                      # Hiền Lương bridge deck
    border(m, edge_road(0) | edge_road(H - 1))
    m.prop("river_bridge", 30, 16, 3, 7, solid_from=None, layer="floor")
    m.prop("flag_tower", 34, 13, 2, 1)
    m.prop("red_cliff", SHORE_X + 3, 3, 6, 7, solid_from=2)   # Cửa Tùng basalt headland
    # rubber plantation (south-west), in straight rows
    for y in range(26, 37, 3):
        for x in range(4, 26, 3):
            m.put(x, y, ORCHARD)
    road(m, 31, 0, 32, 15)
    road(m, 31, 23, 32, H - 1)
    road(m, 28, 30, SHORE_X - 1, 31)
    m.fill(SHORE_X, 30, SHORE_X + 1, 31, SAND)
    casuarinas(m, SHORE_X - 2, [y for y in range(2, H - 2, 2) if not 14 <= y <= 23 and y not in (30, 31)])
    for x, y in ((53, 12), (55, 25), (54, 35)):
        m.prop("basket_boat", x, y, 2, 1)
    m.scatter(TRUNK, 12, (4, 3, 48, 14))
    m.scatter(ROCK, 8, (36, 24, 48, 38))
    m.scatter(BUSH, 30, (4, 3, 48, 38), avoid=(3, 25, 27, 37))
    m.door(30, 0, 4, 1, "Town", "fromQuangTri")
    m.door(30, H - 1, 4, 1, "Hue", "fromQuangTri")
    m.spawn("fromHue", 31, H - 3)
    m.spawn("fromQuangBinh", 31, 2)
    m.spawn("default", 31, 2)
    return m


def province_maps() -> tuple:
    from .province_maps_2 import ROUND_2_MAPS
    return (("ha_tinh", build_ha_tinh), ("quang_tri", build_quang_tri), *ROUND_2_MAPS)
