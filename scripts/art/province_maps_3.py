"""Big province maps, round 3: Thanh Hóa and Nghệ An (north of Hà Tĩnh), Quảng Ngãi
and Bình Định (south of Hội An). Each has its mountains, rivers, villages, rice
fields, coast and landmarks, laid out with region.py.
"""
from __future__ import annotations

from .province_maps import HOUSES, MOUNTAINS
from .province_tiles import GARLIC, LOTUS, SAND
from .region import (Province, beach_trees, boats, coast, ellipse, exit_north, exit_south, finish, forest, meander,
                     mountains, orchard, place, rice_fields, river, road, salt_fields, scatter, village, walls)
from .tiles import BUSH, GRASS, ROCK, SIGN, TRUNK, WATER

THAI_HOUSES = [("stilt_house", 5, 4)]
THATCH = [("thatched_house", 5, 4), ("house_c", 5, 4)]


def build_thanh_hoa() -> Province:
    """Thanh Hóa: Pù Luông's terraced rice and Thái stilt houses in the western
    mountains, the stone citadel of the Hồ dynasty, the Mã river delta of rice,
    a lowland village, and Sầm Sơn beach with the Trống Mái rocks."""
    m = Province(seed=205)
    shore = coast(m, 190)
    river(m, meander(0, 92, shore[104] + 2, 104, 8, 2, seed=9), 7)            # sông Mã
    exit_south(m, 112, "NgheAn", "fromThanhHoa", "fromNgheAn")
    road(m, [(112, 133), (112, 20), (60, 20), (60, 40)])
    road(m, [(112, 60), (shore[60] + 2, 60)])
    walls(m, 90, 26, 108, 50)                                                 # Hồ dynasty citadel
    road(m, [(99, 50), (99, 56), (112, 56)])
    place(m, "ho_gate", 95, 46, 8, 5, solid_from=None, force=True)
    scatter(m, ROCK, (91, 27, 107, 45), 0.04)
    place(m, "trong_mai", shore[40] + 2, 38, 3, 2, force=True)               # Sầm Sơn
    mountains(m, (3, 3, 84, 30), MOUNTAINS, 7)
    rice_fields(m, (6, 32, 80, 86), plot=(14, 2))                            # Pù Luông terraces
    village(m, (20, 40, 76, 70), THAI_HOUSES)
    mountains(m, (3, 86, 70, 136), MOUNTAINS, 6)
    rice_fields(m, (74, 66, 186, 136))                                       # Mã river delta
    village(m, (120, 6, 184, 52), HOUSES)
    forest(m, (3, 3, 88, 136), 0.06)
    scatter(m, TRUNK, (3, 3, 186, 136), 0.006)
    scatter(m, BUSH, (3, 3, 186, 136), 0.012)
    beach_trees(m, shore, "casuarina", skip={59, 60, 61, 37, 38, 39})
    boats(m, "basket_boat", 2, [(shore[y] + 3, y) for y in (16, 28, 76, 124)])
    m.put(114, 3, SIGN)                                                       # the road north isn't open yet
    return finish(m, "fromNgheAn")


def build_nghe_an() -> Province:
    """Nghệ An: Pù Mát forest in the west, the Lam river with its ferries, Kim Liên's
    village of thatched houses among lotus ponds, rice fields and Cửa Lò beach."""
    m = Province(seed=203)
    shore = coast(m, 188)
    river(m, meander(0, 40, shore[118] + 2, 118, 10, 1.5, seed=10), 7)       # sông Lam
    exit_north(m, 112, "ThanhHoa", "fromNgheAn", "fromThanhHoa")
    exit_south(m, 112, "HaTinh", "fromNgheAn", "fromHaTinh")
    road(m, [(112, 6), (112, 133)])
    road(m, [(112, 30), (150, 30)])                                          # to Kim Liên
    road(m, [(112, 90), (shore[90] + 2, 90)])                                # to Cửa Lò
    for cx, cy in ((128, 46), (168, 16), (176, 50)):                         # Làng Sen: lotus ponds
        ellipse(m, cx, cy, 7, 4, LOTUS)
    village(m, (120, 14, 184, 44), THATCH)                                   # Kim Liên
    mountains(m, (3, 3, 70, 136), MOUNTAINS, 12)                             # Pù Mát
    rice_fields(m, (74, 52, 184, 86))
    rice_fields(m, (74, 96, 184, 136))
    village(m, (74, 8, 108, 48), HOUSES)
    forest(m, (3, 3, 80, 136), 0.14)
    scatter(m, BUSH, (3, 3, 184, 136), 0.012)
    for x, y in ((80, 66), (100, 84), (140, 104)):
        if all(m.ground[y][xx] == WATER for xx in range(x, x + 3)):
            m.prop("sampan", x, y, 3, 1)
    beach_trees(m, shore, "casuarina", skip={89, 90, 91})
    boats(m, "basket_boat", 2, [(shore[y] + 3, y) for y in (20, 60, 80, 132)])
    return finish(m, "fromHaTinh")


def build_quang_ngai() -> Province:
    """Quảng Ngãi: Thiên Ấn mountain over the Trà Khúc river and its water wheels,
    the western mountains, rice and villages, Sa Huỳnh's salt fields and, out at
    sea, Lý Sơn island with its garlic, the Thới Lới crater and a rock sea arch."""
    m = Province(seed=217)
    shore = coast(m, 170, amp=3)
    river(m, meander(0, 46, shore[54] + 2, 54, 6, 1.5, seed=11), 7)          # sông Trà Khúc
    ellipse(m, 202, 72, 14, 22, SAND)                                        # Lý Sơn island
    ellipse(m, 202, 72, 11, 19, GRASS)
    for y in range(58, 90, 2):
        for x in range(194, 206):
            if m.ground[y][x] == GRASS and (x + y) % 3:
                m.decor[y][x] = GARLIC
    place(m, "crater", 198, 54, 6, 4, solid_from=1, force=True)              # Thới Lới
    place(m, "sea_arch", 210, 88, 4, 4, force=True)                          # Hang Câu
    exit_north(m, 112, "QuangNam", "fromQuangNgai", "fromQuangNam")
    exit_south(m, 112, "BinhDinh", "fromQuangNgai", "fromBinhDinh")
    road(m, [(112, 6), (112, 133)])
    road(m, [(112, 30), (92, 30), (92, 22)])
    road(m, [(112, 110), (shore[110] + 2, 110)])
    place(m, "mountain", 84, 14, 8, 6, solid_from=2, force=True)             # Thiên Ấn
    place(m, "pagoda", 92, 10, 4, 4, force=True)
    for x in (60, 80, 132, 150):                                             # water wheels on the river banks
        ys = [y for y in range(30, 70) if m.ground[y][x] == WATER]
        if ys:
            m.prop("water_wheel", x, ys[0] - 2, 4, 3, solid_from=None)
    salt_fields(m, (132, 100, 166, 134))                                     # Sa Huỳnh
    mountains(m, (3, 3, 56, 136), MOUNTAINS, 12)
    village(m, (120, 6, 166, 40), HOUSES)
    rice_fields(m, (58, 62, 166, 96))
    rice_fields(m, (58, 100, 128, 136))
    forest(m, (3, 3, 70, 136), 0.08)
    scatter(m, BUSH, (3, 3, 166, 136), 0.012)
    beach_trees(m, shore, "casuarina", skip={109, 110, 111})
    boats(m, "basket_boat", 2, [(shore[y] + 3, y) for y in (20, 80, 96)])
    return finish(m, "fromQuangNam")


def build_binh_dinh() -> Province:
    """Bình Định: Tây Sơn's martial-arts village under the western mountains, the
    Côn river, the Bánh Ít towers on their hill, the Twin Towers of Quy Nhơn, rice
    fields, Tam Quan coconuts and the granite boulders of Ghềnh Ráng."""
    m = Province(seed=219)
    shore = coast(m, 190)
    river(m, meander(0, 64, shore[76] + 2, 76, 7, 1.5, seed=12), 7)          # sông Côn
    exit_north(m, 112, "QuangNgai", "fromBinhDinh", "fromQuangNgai")
    road(m, [(112, 6), (112, 132), (150, 132), (150, 100)])
    road(m, [(112, 40), (50, 40), (50, 30)])                                 # to Tây Sơn
    road(m, [(112, 90), (shore[90] + 2, 90)])
    place(m, "martial_yard", 44, 22, 6, 4, force=True)                       # Tây Sơn võ đường
    place(m, "twin_towers", 146, 94, 6, 4, force=True)                       # Tháp Đôi
    for i, (x, y) in enumerate(((96, 18), (101, 16), (105, 20))):            # Bánh Ít towers
        place(m, "cham_tower_a" if i % 2 else "cham_tower_b", x, y, 3, 2, force=True)
    for y in (108, 118, 128):                                                # Ghềnh Ráng
        place(m, "granite_rocks", shore[y] - 2, y, 6, 4, solid_from=1, force=True)
    village(m, (14, 28, 80, 56), HOUSES)                                     # Tây Sơn village
    mountains(m, (3, 60, 70, 136), MOUNTAINS, 10)
    mountains(m, (3, 3, 40, 26), MOUNTAINS, 3)
    village(m, (150, 20, 186, 60), HOUSES)                                   # Quy Nhơn
    rice_fields(m, (74, 44, 186, 70))
    rice_fields(m, (74, 80, 140, 136))
    orchard(m, (156, 104, 184, 136))                                         # Tam Quan coconuts
    forest(m, (3, 3, 74, 136), 0.06)
    scatter(m, TRUNK, (3, 3, 186, 136), 0.005)
    scatter(m, BUSH, (3, 3, 186, 136), 0.012)
    beach_trees(m, shore, "coconut", skip={89, 90, 91})
    boats(m, "basket_boat", 2, [(shore[y] + 3, y) for y in (20, 40, 60)])
    m.put(114, m.h - 4, SIGN)                                                # the road south isn't open yet
    return finish(m, "fromQuangNgai")


ROUND_3_MAPS = (("thanh_hoa", build_thanh_hoa), ("nghe_an", build_nghe_an),
                ("quang_ngai", build_quang_ngai), ("binh_dinh", build_binh_dinh))
