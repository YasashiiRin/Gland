"""Big province maps, round 2: Huế, Đà Nẵng and Quảng Nam (Hội An), going south
from Quảng Trị along the main road (x 112).
"""
from __future__ import annotations

from .province_maps import HOUSES, MOUNTAINS
from .province_tiles import BRIDGE, LOTUS, PAVING, SAND
from .region import (Province, beach_trees, boats, coast, ellipse, exit_north, exit_south, finish, forest, meander,
                     mountains, orchard, place, rice_fields, river, road, scatter, village, walls)
from .tiles import BLOCK, BUSH, ROCK, TRUNK, WATER

GARDEN_HOUSES = [("house_a", 5, 4), ("house_c", 5, 4), ("house_b", 5, 4)]
HOI_AN_HOUSES = [("hoian_house_a", 4, 4), ("hoian_house_b", 4, 4)]


def build_hue() -> Province:
    """Huế: the moated citadel (Ngọ Môn, Thái Hòa hall, Tịnh Tâm lotus lake), the
    Perfume River with Trường Tiền bridge and dragon boats, Thiên Mụ's tower, royal
    tombs among the pine hills, garden houses, rice plains and Thuận An beach."""
    m = Province(seed=211)
    shore = coast(m, 192)
    river(m, meander(0, 118, 100, 76, 6, 1, seed=5) + meander(100, 76, shore[44] + 2, 44, 5, 1, seed=6), 7)
    walls(m, 84, 16, 141, 58, inside=PAVING, moat=True)                     # the citadel
    exit_north(m, 112, "QuangTri", "fromHue", "fromQuangTri")
    exit_south(m, 112, "DaNang", "fromHue", "fromDaNang")
    road(m, [(112, 6), (112, 133)])                                          # through the citadel's gates
    road(m, [(112, 96), (40, 96), (40, 116)])                                # to the tombs
    road(m, [(112, 70), (shore[70] + 2, 70)])
    place(m, "ngo_mon", 109, 54, 8, 5, solid_from=None, force=True)          # over the south wall
    for y in range(56, 59):
        for x in range(109, 117):
            if x not in (112, 113):
                m.put(x, y, BLOCK)
    place(m, "royal_hall", 101, 24, 7, 4, force=True)
    ellipse(m, 128, 30, 7, 4, LOTUS)                                         # Tịnh Tâm lake
    bridge_y = min((y for y in range(62, 110) if m.ground[y][112] == BRIDGE), default=80)
    place(m, "truong_tien", 110, bridge_y, 5, 7, solid_from=None, layer="floor", force=True)
    place(m, "thien_mu", 46, 90, 2, 2, force=True)
    place(m, "pagoda", 50, 88, 4, 4, force=True)
    for x, y in ((24, 120), (62, 124), (80, 110)):
        place(m, "royal_tomb", x, y, 6, 4, force=True)
    for x, y in ((70, 100), (140, 64), (160, 54)):
        if all(m.ground[y][xx] == WATER for xx in range(x, x + 4)):
            m.prop("dragon_boat", x, y, 4, 2)
    orchard(m, (6, 100, 96, 136), step=3)                                    # pine hills
    mountains(m, (3, 3, 70, 60), MOUNTAINS, 6)
    village(m, (122, 84, 184, 112), GARDEN_HOUSES)                           # garden houses (nhà vườn)
    village(m, (6, 64, 60, 86), GARDEN_HOUSES)
    rice_fields(m, (146, 4, 188, 50))
    rice_fields(m, (120, 114, 188, 136))
    forest(m, (3, 3, 80, 136), 0.05)
    scatter(m, TRUNK, (3, 3, 188, 136), 0.006)
    scatter(m, BUSH, (3, 3, 188, 136), 0.012)
    beach_trees(m, shore, "casuarina", skip={69, 70, 71})
    return finish(m, "fromQuangTri")


def build_da_nang() -> Province:
    """Đà Nẵng: the Hải Vân pass, Bà Nà hills with the Golden Bridge, the Hàn river
    and the Dragon Bridge, a city of towers and flame trees, Sơn Trà with Lady
    Buddha, the Marble Mountains, rice in Hòa Vang and Mỹ Khê beach."""
    m = Province(seed=213)
    shore = coast(m, 192)
    river(m, meander(150, 0, 146, 139, 5, 1.5, seed=7), 7)                  # sông Hàn
    exit_north(m, 112, "Hue", "fromDaNang", "fromHue")
    exit_south(m, 112, "QuangNam", "fromDaNang", "fromQuangNam")
    road(m, [(112, 6), (112, 133)], tile=PAVING)
    road(m, [(60, 72), (shore[72] + 2, 72)], tile=PAVING)                    # across the Dragon Bridge
    road(m, [(112, 40), (40, 40), (40, 60)])                                 # up to Bà Nà
    river_x = [x for x in range(120, 180) if m.ground[72][x] == BRIDGE]
    if river_x:
        place(m, "dragon_bridge", river_x[0] - 1, 71, 7, 3, solid_from=None, force=True)
    place(m, "golden_bridge", 32, 56, 8, 3, solid_from=None, force=True)
    place(m, "lady_buddha", 178, 36, 2, 2, force=True)
    for x, y in ((170, 100), (176, 112), (164, 116)):
        place(m, "marble_mountain", x, y, 6, 6, solid_from=2, force=True)
    mountains(m, (3, 3, 100, 34), MOUNTAINS, 8)                              # Hải Vân
    mountains(m, (3, 44, 70, 104), MOUNTAINS, 6)                             # Bà Nà
    mountains(m, (156, 3, 188, 32), MOUNTAINS, 3)                            # Sơn Trà
    village(m, (76, 48, 140, 96), [("city_tower", 3, 3)], street=PAVING, yard=(4, 4))
    village(m, (154, 40, 186, 96), GARDEN_HOUSES)
    orchard(m, (74, 98, 140, 104))                                           # flame trees along the boulevard
    rice_fields(m, (60, 108, 140, 136))
    forest(m, (3, 3, 74, 136), 0.06)
    scatter(m, TRUNK, (3, 3, 188, 136), 0.005)
    scatter(m, ROCK, (3, 3, 70, 104), 0.01)
    scatter(m, BUSH, (3, 3, 188, 136), 0.01)
    beach_trees(m, shore, "casuarina", every=4, skip={71, 72, 73})
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in (20, 58, 90, 128)])
    return finish(m, "fromHue")


def build_quang_nam() -> Province:
    """Quảng Nam: Hội An's old quarter (yellow shophouses with lanterns, Chùa Cầu over
    the canal), the Thu Bồn river with lantern boats, Mỹ Sơn's Cham towers in the
    hills, Trà Quế gardens and rice, the Bảy Mẫu coconut grove, Cù Lao Chàm offshore."""
    m = Province(seed=215)
    shore = coast(m, 186)
    river(m, meander(0, 72, shore[86] + 2, 86, 7, 1.5, seed=8), 7)           # sông Thu Bồn
    river(m, [(150, 40), (150, 72)], 2)                                      # the canal under Chùa Cầu
    for cy, cx in ((26, 208), (48, 214)):                                    # Cù Lao Chàm islands
        ellipse(m, cx, cy, 7, 6, SAND)
        ellipse(m, cx, cy, 4, 3.5, 0)
    exit_north(m, 112, "DaNang", "fromQuangNam", "fromDaNang")
    exit_south(m, 112, "QuangNgai", "fromQuangNam", "fromQuangNgai")
    road(m, [(112, 6), (112, 133)])
    road(m, [(118, 58), (184, 58)], tile=PAVING)                             # Trần Phú street
    road(m, [(118, 66), (184, 66)], tile=PAVING)                             # Bạch Đằng riverside
    road(m, [(112, 58), (118, 58)], tile=PAVING)
    road(m, [(112, 110), (40, 110), (40, 100)])                              # to Mỹ Sơn
    place(m, "japanese_bridge", 149, 56, 4, 3, solid_from=None, force=True)
    for i, (x, y) in enumerate(((30, 96), (36, 94), (44, 97), (34, 102), (48, 102))):
        place(m, "cham_tower_a" if i % 2 else "cham_tower_b", x, y, 3, 2, force=True)
    village(m, (118, 40, 186, 57), HOI_AN_HOUSES, street=PAVING, yard=(2, 2))
    village(m, (118, 60, 186, 66), HOI_AN_HOUSES, street=PAVING, yard=(2, 1))
    for x in (126, 140, 162, 174):
        if all(m.ground[70][xx] == WATER for xx in range(x, x + 3)):
            m.prop("lantern_boat", x, 70, 3, 1)
    mountains(m, (3, 88, 90, 136), MOUNTAINS, 7)                             # Mỹ Sơn's hills
    orchard(m, (152, 94, 184, 132))                                          # Bảy Mẫu coconuts
    rice_fields(m, (60, 8, 108, 52))
    rice_fields(m, (118, 8, 184, 36), plot=(7, 4))                           # Trà Quế
    village(m, (6, 8, 56, 56), HOUSES)
    rice_fields(m, (94, 96, 148, 136))
    forest(m, (3, 3, 100, 136), 0.04)
    scatter(m, BUSH, (3, 3, 184, 136), 0.01)
    beach_trees(m, shore, "coconut", skip={85, 86, 87})
    for x, y in ((206, 24), (211, 28), (213, 47), (217, 50)):
        m.prop("coconut", x, y, 1, 1)
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in (100, 110, 120, 30)])
    return finish(m, "fromDaNang")


ROUND_2_MAPS = (("hue", build_hue), ("da_nang", build_da_nang), ("quang_nam", build_quang_nam))
