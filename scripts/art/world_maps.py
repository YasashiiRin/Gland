"""The two big province maps (425x425): Quảng Bình and Huế, laid out after the
player's reference pictures. North is up, the sea is on the east.

Quảng Bình: Ba Đồn on the Gianh river (north), Phong Nha – Kẻ Bàng and Sơn
Đoòng with the Son river, Đồng Hới (the NPC town, Quảng Bình Quan, the market)
at the Nhật Lệ mouth with its bridge to Bảo Ninh, Quảng Ninh's rice, dunes
and fish ponds, Quán Hàu bridge on the Long Đại, Lệ Thủy's fields with the
Võ Nguyên Giáp memorial house and boat racing on the Kiến Giang, the Bang hot
spring, and Trường Sơn along the west.

Huế: the Đại Nội citadel north of the Perfume River, Thiên Mụ upstream, Phú
Xuân (the NPC town) and Trường Tiền bridge, Đông Ba market, Ngự Bình hill,
royal tombs among pines, craft villages (nón lá), rice, Trường Sơn, the Tam
Giang lagoon with Rú Chá mangroves, the Thuận An mouth and the dunes.
"""
from __future__ import annotations

from .biome import Regions, connect, fill_contents, paint_ground, trail
from .province_tiles import BRIDGE, LOTUS, PAVING
from .region import (Province, beach_trees, boats, coast, ellipse, exit_north, exit_south, finish, meander, place,
                     river, road, walls)
from .tiles import BLOCK, DIRT, WATER

SIZE = 425
HOUSES = [("house_a", 5, 4), ("house_b", 5, 4), ("house_c", 5, 4), ("thatched_house", 5, 4)]
GARDEN_HOUSES = [("house_a", 5, 4), ("house_c", 5, 4), ("house_b", 5, 4)]
MOUNTAINS = [("mountain", 8, 6)]
KARST = [("karst_a", 4, 6), ("karst_b", 4, 6), ("mountain", 8, 6)]
STALLS = ["stall_fish", "stall_veg", "stall_rice"]


def _water_spots(m: Province, w: int, every: int, rows: range, cols: range) -> list[tuple[int, int]]:
    spots = []
    for y in rows[::every]:
        for x in cols:
            if all(m.ground[yy][xx] == WATER for xx in range(x, x + w) for yy in (y, y + 1)):
                spots.append((x, y))
                break
    return spots


def _crossing(m: Province, x: int, y_range: range) -> int | None:
    """First row where the road at column x becomes a bridge."""
    return next((y for y in y_range if m.ground[y][x] == BRIDGE), None)


def _market(m: Province, x0: int, y0: int, rows: int = 2, cols: int = 4) -> None:
    """A paved market square with rows of stalls."""
    for dy in range(-2, rows * 5 + 1):
        road(m, [(x0 - 2, y0 + dy), (x0 + cols * 5 + 1, y0 + dy)], 1, PAVING)
    for r in range(rows):
        for c in range(cols):
            x, y = x0 + c * 5, y0 + r * 5
            m.prop(STALLS[(r + c) % 3], x, y, 3, 3)
            for yy in range(y + 1, y + 3):
                for xx in range(x, x + 3):
                    m.put(xx, yy, BLOCK)


def _fish_ponds(m: Province, x0: int, y0: int, x1: int, y1: int) -> None:
    """Square fish ponds separated by earth dikes."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if m.free(x, y):
                m.ground[y][x] = DIRT if (x - x0) % 12 == 11 or (y - y0) % 9 == 8 else WATER
                m.taken.add((x, y))


def _herd(m: Province, regions: Regions, biomes: tuple[str, ...], count: int) -> None:
    """Water buffaloes grazing in the fields and meadows."""
    rs = [r for r, b in regions.biome.items() if b in biomes]
    for i in range(count * 8):
        if count <= 0 or not rs:
            break
        tiles = regions.tiles(rs[i % len(rs)])
        x, y = tiles[m.rnd.randrange(len(tiles))]
        if m.free(x, y) and m.free(x + 1, y) and place(m, "buffalo", x, y, 2, 1, solid_from=0, force=True):
            count -= 1


def build_quang_binh() -> Province:
    m = Province(seed=301, w=SIZE, h=SIZE)
    shore = coast(m, 396, amp=4)
    river(m, meander(0, 40, shore[44] + 3, 44, 5, 1.5, seed=1), 8)                       # sông Gianh
    cave_x, cave_y = 146, 100
    river(m, meander(cave_x + 4, cave_y + 5, 236, 46, 6, 1, seed=2), 6)                  # sông Son
    river(m, meander(56, 250, 300, 298, 7, 1.5, seed=3), 6)                              # sông Long Đại
    river(m, meander(66, 412, 300, 306, 8, 1.5, seed=4), 6)                              # sông Kiến Giang
    river(m, meander(300, 302, 352, 214, 5, 1, seed=5) + [(352, 214), (352, 188), (shore[186] + 3, 186)], 8)  # Nhật Lệ
    regions = Regions(m, 64)
    regions.force(320, 132, "village")                                                    # Đồng Hới
    regions.force_area((286, 96, 392, 184), "village")
    regions.force(110, 18, "hamlet")                                                      # Ba Đồn
    regions.force(380, 250, "hamlet")                                                     # Bảo Ninh
    regions.force(222, 284, "hamlet")                                                     # Quán Hàu
    regions.force(250, 372, "hamlet")                                                     # Lệ Thủy
    regions.force(104, 340, "meadow")                                                     # Bang hot spring
    regions.force_area((0, 0, 72, SIZE), "mountain")                                     # Trường Sơn
    regions.force_area((72, 56, 240, 180), "karst")                                      # Phong Nha – Kẻ Bàng
    regions.force_area((282, 196, 346, 292), "dunes")                                    # Quảng Ninh dunes
    regions.force_area((108, 186, 282, 292), "rice")                                     # Quảng Ninh fields
    regions.force_area((96, 316, 340, 420), "rice")                                      # Lệ Thủy fields
    regions.force_area((72, 180, 108, SIZE), "forest")                                   # foothills
    regions.assign([
        ("pine", 3, lambda x, y: -abs(x - 270) - abs(y - 90)),
        ("bamboo", 3, lambda x, y: -abs(x - 200) - abs(y - 30)),
        ("marsh", 2, lambda x, y: -abs(x - 300) - abs(y - 170)),
        ("meadow", 4, lambda x, y: -abs(x - 250) - abs(y - 200)),
    ])
    paint_ground(m, regions)
    exit_south(m, 30, "Farm", "fromQuangBinh", "fromFarm")
    road(m, [(270, 6), (270, SIZE - 6)], tile=PAVING)                                    # the national road
    road(m, [(270, 140), (318, 140), (318, 232), (388, 232)], tile=PAVING)               # Đồng Hới, over the Nhật Lệ to Bảo Ninh
    road(m, [(270, 232), (318, 232)], tile=PAVING)
    bridge_y = _crossing(m, 270, range(240, 320))                                        # Quán Hàu bridge
    if bridge_y:
        place(m, "truong_tien", 268, bridge_y, 5, 7, solid_from=None, layer="floor", force=True)
    river_x = next((x for x in range(330, 380) if m.ground[232][x] == BRIDGE), None)
    if river_x:
        place(m, "cable_bridge", river_x - 2, 229, 10, 4, solid_from=None, layer="floor", force=True)
    place(m, "phong_nha_cave", cave_x, cave_y, 8, 6, solid_from=2, force=True)
    for y in range(cave_y + 3, cave_y + 6):                                               # the Son flows out of the cave
        for x in range(cave_x + 3, cave_x + 6):
            m.ground[y][x] = WATER
    place(m, "phong_nha_cave", 96, 72, 8, 6, solid_from=2, force=True)                   # Sơn Đoòng
    place(m, "quang_binh_quan", 300, 136, 5, 3, solid_from=1, force=True)
    _market(m, 324, 150)                                                                  # chợ Đồng Hới
    _market(m, 92, 8, rows=1, cols=3)                                                     # chợ Ba Đồn
    place(m, "hot_spring", 98, 336, 4, 3, solid_from=0, force=True)                      # suối Bang
    place(m, "memorial_house", 214, 352, 5, 4, force=True)                               # Võ Nguyên Giáp
    _fish_ponds(m, 300, 312, 346, 352)
    connect(m, regions, [(30, SIZE - 8), (cave_x + 4, cave_y + 7), (100, 80), (100, 340), (216, 357)])
    fill_contents(m, regions, KARST, HOUSES)
    _herd(m, regions, ("rice", "meadow"), 14)
    for x, y in _water_spots(m, 6, 18, range(330, 410), range(80, 290))[:3]:            # đua thuyền on the Kiến Giang
        m.prop("race_boat", x, y, 6, 1)
    for x, y in _water_spots(m, 3, 30, range(30, 60), range(20, 380)):
        m.prop("sampan", x, y, 3, 1)
    beach_trees(m, shore, "casuarina", every=4, skip=set(range(180, 240)))
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in range(244, 300, 8)])
    return finish(m, "fromFarm")


def build_hue() -> Province:
    m = Province(seed=303, w=SIZE, h=SIZE)
    shore = coast(m, 398, amp=4)
    river(m, meander(338, 0, 350, 330, 8, 1.2, seed=5), 20)                              # phá Tam Giang
    river(m, [(350, 200), (shore[200] + 3, 200)], 8)                                     # cửa Thuận An
    river(m, meander(56, 424, 132, 300, 6, 1, seed=6) + meander(132, 300, 200, 222, 5, 1, seed=7)
          + meander(200, 222, 348, 210, 5, 1, seed=8), 8)                                # sông Hương
    regions = Regions(m, 64)
    regions.force(195, 150, "none")                                                       # the citadel
    regions.force(215, 268, "village")                                                    # Phú Xuân
    regions.force_area((176, 236, 290, 300), "village")
    regions.force(120, 186, "hamlet")                                                     # nón lá village
    regions.force(290, 124, "hamlet")
    regions.force(318, 60, "mangrove")                                                    # Rú Chá
    regions.force(118, 258, "meadow")                                                     # Thiên Mụ hill
    regions.force_area((0, 0, 70, SIZE), "mountain")                                     # Trường Sơn
    regions.force_area((370, 0, SIZE, SIZE), "dunes")
    regions.force_area((70, 0, 330, 96), "rice")
    regions.force_area((70, 320, 170, 420), "rice")
    regions.force_area((180, 316, 330, 420), "pine")                                     # Ngự Bình and the tombs
    regions.assign([
        ("marsh", 3, lambda x, y: -abs(x - 300) - 0.3 * abs(y - 170)),
        ("orchard", 2, lambda x, y: -abs(x - 280) - abs(y - 270)),                        # thanh trà
        ("bamboo", 2, lambda x, y: -abs(x - 100) - abs(y - 130)),
        ("forest", 3, lambda x, y: -x),
        ("meadow", 3, lambda x, y: -abs(x - 260) - abs(y - 300)),
    ])
    paint_ground(m, regions)
    walls(m, 150, 112, 240, 190, inside=PAVING, moat=True)                               # Đại Nội
    exit_north(m, 10, "Town", "fromHue", "fromQuangBinh")
    road(m, [(10, 8), (10, 40), (195, 40), (195, 300)], tile=PAVING)                     # through the citadel, over the river
    road(m, [(195, 250), (300, 250), (300, 200)], tile=PAVING)
    place(m, "ngo_mon", 192, 186, 8, 5, solid_from=None, force=True)
    for y in range(188, 191):
        for x in range(192, 200):
            if x not in (195, 196):
                m.put(x, y, BLOCK)
    place(m, "royal_hall", 181, 130, 7, 4, force=True)
    ellipse(m, 222, 152, 9, 5, LOTUS)
    bridge_y = _crossing(m, 195, range(196, 290))
    if bridge_y:
        place(m, "truong_tien", 193, bridge_y, 5, 7, solid_from=None, layer="floor", force=True)
    place(m, "thien_mu", 114, 262, 2, 2, force=True)
    place(m, "pagoda", 118, 260, 4, 4, force=True)
    place(m, "mountain", 210, 336, 8, 6, solid_from=2, force=True)                       # Ngự Bình
    _market(m, 250, 196, rows=2, cols=3)                                                  # chợ Đông Ba
    connect(m, regions, [(10, 40), (195, 300), (116, 268)])
    for r in regions.regions_of("pine")[:5]:                                             # royal tombs among the pines
        cx, cy = regions.centers[r]
        if not place(m, "royal_tomb", cx + 3, cy - 6, 6, 4):
            place(m, "royal_tomb", cx - 9, cy + 3, 6, 4)
    for r in regions.regions_of("hamlet"):                                               # nón lá stalls
        cx, cy = regions.centers[r]
        for dx in (0, 5):
            place(m, "hat_stall", cx + dx, cy + 4, 3, 2)
    fill_contents(m, regions, MOUNTAINS, GARDEN_HOUSES)
    _herd(m, regions, ("rice", "meadow"), 10)
    for x, y in _water_spots(m, 4, 30, range(210, 330), range(20, 330)):
        m.prop("dragon_boat", x, y, 4, 2)
    for x, y in _water_spots(m, 3, 40, range(10, 320), range(330, 365)):
        m.prop("sampan", x, y, 3, 1)
    beach_trees(m, shore, "casuarina", every=4, skip=set(range(194, 207)))
    trail(m, (195, 300), (195, 318))
    return finish(m, "fromQuangBinh")


WORLD_MAPS = (("quang_binh", build_quang_binh), ("hue", build_hue))
