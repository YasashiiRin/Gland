"""Big province maps (224x140) around the home province, Quảng Bình.

Quảng Bình itself is the farm + village (unchanged) plus Phong Nha – Kẻ Bàng
to the west of the farm. Hà Tĩnh is north of the farm, Quảng Trị south of
the village. Laid out with the toolkit in region.py.
"""
from __future__ import annotations

from .province_tiles import BRIDGE, LOTUS
from .region import (Province, beach_trees, boats, coast, ellipse, exit_east, exit_north, exit_south, finish, forest,
                     meander, mountains, orchard, place, rice_fields, river, road, scatter, tea_hills, village, walls)
from .tiles import BUSH, ROCK, SIGN, TRUNK, WATER

HOUSES = [("house_a", 5, 4), ("house_b", 5, 4), ("house_c", 5, 4), ("thatched_house", 5, 4)]
MOUNTAINS = [("mountain", 8, 6)]
KARST = [("karst_a", 4, 6), ("karst_b", 4, 6)]


def build_ha_tinh() -> Province:
    """Hà Tĩnh: Trường Sơn and Hương Sơn's tea hills in the west, the Hồng Lĩnh range
    with Hương Tích pagoda, the La river, Kẻ Gỗ lake, Phúc Trạch pomelo orchards,
    Nguyễn Du's village of Tiên Điền, big rice fields and Thiên Cầm beach."""
    m = Province(seed=201)
    shore = coast(m, 190)
    river(m, meander(0, 88, shore[96] + 2, 96, 7, 2.5, seed=1), 5)          # sông La
    ellipse(m, 66, 118, 17, 10, WATER)                                        # Kẻ Gỗ lake
    exit_south(m, 30, "Farm", "fromHaTinh", "fromQuangBinh")
    exit_north(m, 112, "NgheAn", "fromHaTinh", "fromNgheAn")
    road(m, [(30, 133), (30, 104), (112, 104), (112, 6)])
    road(m, [(112, 62), (165, 62), (165, 44)])                                # to the village and the pagoda
    road(m, [(112, 104), (shore[104] + 2, 104)])                              # to Thiên Cầm beach
    road(m, [(112, 30), (62, 30)])                                            # to the tea hills
    place(m, "pagoda", 163, 38, 4, 4, force=True)                             # Hương Tích pagoda
    mountains(m, (120, 4, 182, 36), MOUNTAINS, 6)                             # Hồng Lĩnh
    mountains(m, (3, 4, 48, 84), MOUNTAINS, 9)                                # Trường Sơn
    tea_hills(m, (52, 8, 104, 52))                                            # Hương Sơn tea
    village(m, (120, 46, 182, 82), HOUSES)                                    # Tiên Điền
    rice_fields(m, (96, 84, 186, 134))
    rice_fields(m, (52, 56, 104, 84), plot=(8, 5))
    orchard(m, (6, 92, 46, 134))                                              # Phúc Trạch pomelos
    forest(m, (3, 86, 104, 136), 0.06)
    scatter(m, TRUNK, (50, 54, 186, 136), 0.01)
    scatter(m, BUSH, (3, 3, 186, 136), 0.015)
    beach_trees(m, shore, "casuarina", skip={103, 104, 105})
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in (20, 50, 78, 118, 130)])
    m.put(118, 3, SIGN)                                                       # nothing north of Thanh Hóa yet
    return finish(m, "fromQuangBinh")


def build_quang_tri() -> Province:
    """Quảng Trị: the Bến Hải river with the Hiền Lương bridge and flag tower, the
    Thạch Hãn river past the old citadel and its memorial, rubber on the western
    hills, Trường Sơn, wide rice plains, villages, Cửa Tùng's red cliffs."""
    m = Province(seed=209)
    shore = coast(m, 190)
    river(m, meander(0, 34, shore[30] + 2, 30, 4, 1.5, seed=2), 5)          # sông Bến Hải
    river(m, meander(0, 86, shore[92] + 2, 92, 8, 2, seed=3), 6)              # sông Thạch Hãn
    exit_north(m, 10, "Town", "fromQuangTri", "fromQuangBinh")
    exit_south(m, 112, "Hue", "fromQuangTri", "fromHue")
    road(m, [(10, 6), (10, 14), (112, 14), (112, 133)])
    road(m, [(112, 70), (shore[70] + 2, 70)])
    road(m, [(112, 112), (60, 112), (60, 96)])
    # Hiền Lương: the first bridge the main road meets going south
    bridge_y = min((y for y in range(16, 70) if m.ground[y][112] == BRIDGE), default=30)
    place(m, "river_bridge", 111, bridge_y - 1, 3, 7, solid_from=None, layer="floor", force=True)
    place(m, "flag_tower", 116, bridge_y - 4, 2, 1, force=True)
    walls(m, 46, 100, 74, 122, moat=True)                                     # the old citadel and its moat
    road(m, [(60, 96), (60, 110)])
    place(m, "memorial", 62, 106, 3, 2, force=True)
    place(m, "red_cliff", shore[18] + 2, 14, 6, 7, solid_from=2, force=True)  # Cửa Tùng
    orchard(m, (4, 40, 60, 80))                                               # rubber on the hills
    mountains(m, (3, 84, 40, 136), MOUNTAINS, 5)                              # Trường Sơn
    village(m, (20, 18, 100, 32), HOUSES)                                     # Vĩnh Linh
    village(m, (122, 76, 182, 100), HOUSES)                                   # Triệu Phong
    rice_fields(m, (64, 38, 186, 68))
    rice_fields(m, (80, 100, 186, 136))
    rice_fields(m, (120, 16, 186, 28), plot=(8, 5))
    forest(m, (3, 30, 110, 136), 0.04)
    scatter(m, TRUNK, (3, 3, 186, 136), 0.006)
    scatter(m, BUSH, (3, 3, 186, 136), 0.012)
    beach_trees(m, shore, "casuarina", skip={69, 70, 71})
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in (44, 60, 110, 126)])
    return finish(m, "fromQuangBinh")


def build_phong_nha() -> Province:
    """Quảng Bình, Phong Nha – Kẻ Bàng: a forest of limestone karst towers, the Son
    river flowing out of Phong Nha cave, boats on the river, the village of Sơn
    Trạch and its rice fields. The road east leads back to the farm."""
    m = Province(seed=207)
    cave_x, cave_y = 56, 30
    river(m, meander(cave_x + 4, cave_y + 6, 223, 98, 9, 2, seed=4), 6)       # sông Son
    exit_east(m, 70, "Farm", "fromPhongNha", "fromFarm")
    road(m, [(216, 70), (140, 70), (140, 52), (cave_x + 9, 52), (cave_x + 9, cave_y + 8)])
    road(m, [(140, 70), (140, 120), (190, 120)])
    road(m, [(180, 70), (180, 40)])
    place(m, "phong_nha_cave", cave_x, cave_y, 8, 6, solid_from=2, force=True)
    for y in range(cave_y + 3, cave_y + 6):                                   # the river runs into the cave
        for x in range(cave_x + 3, cave_x + 6):
            m.ground[y][x] = WATER
    ellipse(m, 100, 112, 8, 5, LOTUS)
    mountains(m, (3, 3, 130, 136), KARST, 40)                                 # karst towers all over the west
    mountains(m, (3, 3, 220, 34), KARST + MOUNTAINS, 10)
    village(m, (150, 36, 218, 66), HOUSES)                                    # Sơn Trạch
    rice_fields(m, (146, 76, 218, 136))
    forest(m, (3, 3, 140, 136), 0.12)
    scatter(m, ROCK, (3, 3, 140, 136), 0.01)
    scatter(m, BUSH, (3, 3, 220, 136), 0.012)
    boats(m, "sampan", 3, [(x, y) for x, y in ((70, 41), (96, 52), (128, 66))
                          if all(m.ground[y][xx] == WATER for xx in range(x, x + 3))])
    return finish(m, "fromFarm")


def province_maps() -> tuple:
    from .province_maps_2 import ROUND_2_MAPS
    from .province_maps_3 import ROUND_3_MAPS
    return (("ha_tinh", build_ha_tinh), ("quang_tri", build_quang_tri), ("phong_nha", build_phong_nha),
            *ROUND_2_MAPS, *ROUND_3_MAPS)
