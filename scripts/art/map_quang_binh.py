"""Quảng Bình (425x425), laid out after the player's reference pictures and
checked against the real map. North is up and the coast is straightened to
run north-south along the east, so places keep their real order and sides:

- Gianh river across the north; Ba Đồn on its north bank near the mouth, the
  national road (QL1) crossing it on the Gianh bridge.
- Phong Nha – Kẻ Bàng to the west-north-west: the Son river flows out of
  Phong Nha cave east to join the Gianh; the tourist centre, boat wharf and
  stilt houses sit on its south bank downstream of the cave; Thiên Đường
  (Paradise) cave lies south-west and Sơn Đoòng further south, deep in the
  karst; a dirt road leads south-east to Đồng Hới and a trail north-east to
  Ba Đồn.
- Đồng Hới on the WEST bank of the Nhật Lệ, just south of the river mouth
  (the river runs north along the town's east side, between the town and
  the Bảo Ninh sand spit). Quảng Bình Quan and the old citadel, the market
  by the river, the railway station west of the centre, Nhật Lệ bridge
  (east, to Bảo Ninh), the cable-stayed Nhật Lệ 2 bridge further south and
  Cầu Dài south of town. Quang Phú dunes north of the mouth, Bảo Ninh's
  fishing village and beach east.
- Quán Hàu (Quảng Ninh) where the Long Đại and Kiến Giang meet to form the
  Nhật Lệ: Quán Hàu bridge, market, district offices, Võ Xá wine village
  across the Kiến Giang, the Long Đại ferry memorial upstream, Đào Duy Từ's
  rampart (Lũy Thầy) running south-west to Thần Đinh mountain, Tam Lu falls
  in the Trường Sơn, and the road east to Hải Ninh on the coast.
- Lệ Thủy on the Kiến Giang (boat racing, the Võ Nguyên Giáp memorial
  house), the Bang hot spring to its west, Trường Sơn along the west edge.
"""
from __future__ import annotations

from .biome import Regions, connect, fill_contents, paint_ground, trail
from .landmark_fields import landmark_fields, start_point
from .map_services import services
from .map_helpers import (HOUSES, KARST, SIZE, clearing, crossing, fish_ponds, herd, jetty, market, mooring, place_near, quay, street_row,
                          walk_under, water_spots, zone)
from .province_tiles import BRIDGE, CITADEL, PAVING
from .region import (Province, beach_trees, boats, coast, exit_south, finish, meander, place, river, road, walls)
from .tiles import WATER


def _rivers(m: Province, shore: list[int]) -> None:
    river(m, meander(0, 34, 236, 64, 6, 1.2, seed=1) + [(236, 64), (290, 58), (340, 56), (shore[57] + 3, 57)], 8)  # Gianh
    river(m, meander(170, 102, 228, 101, 2, 1, seed=2) + meander(228, 101, 238, 64, 3, 0.5, seed=7), 6)       # Son
    river(m, meander(60, 252, 312, 284, 7, 1.5, seed=3), 6)                                                    # Long Đại
    river(m, meander(70, 415, 332, 372, 6, 1, seed=4) + meander(332, 372, 316, 286, 3, 0.8, seed=6), 6)         # Kiến Giang
    river(m, meander(314, 284, 352, 240, 3, 0.6, seed=8)
          + [(352, 240), (352, 176), (356, 168), (shore[166] + 3, 166)], 8)                                     # Nhật Lệ
    river(m, meander(44, 304, 64, 262, 2, 1, seed=9), 3)                                                       # Tam Lu stream


def _regions(m: Province) -> Regions:
    regions = Regions(m, 64)
    regions.force(315, 205, "village")                                                    # Đồng Hới
    regions.force_area((282, 176, 346, 246), "village")
    regions.force(278, 306, "village")                                                    # Quán Hàu
    for x, y in ((320, 268), (332, 300), (306, 262), (340, 330)):                         # open land round Quán Hàu
        regions.force(x, y, "grass")
    regions.force(320, 40, "hamlet")                                                      # Ba Đồn
    regions.force(378, 210, "hamlet")                                                     # Bảo Ninh
    regions.force(306, 384, "hamlet")                                                     # Lệ Thủy
    regions.force(150, 372, "meadow")                                                     # Bang hot spring
    regions.force_area((0, 0, 72, SIZE), "mountain")                                     # Trường Sơn
    regions.force_area((300, 112, 396, 162), "dunes")                                    # Quang Phú dunes
    regions.force_area((350, 262, 396, 420), "dunes")                                    # Quảng Ninh – Lệ Thủy dunes
    regions.force_area((72, 60, 262, 200), "karst")                                      # Phong Nha – Kẻ Bàng
    regions.force_area((120, 280, 262, 336), "rice")                                     # Quảng Ninh fields
    regions.force_area((96, 336, 340, 420), "rice")                                      # Lệ Thủy fields
    regions.force_area((72, 200, 120, SIZE), "forest")                                   # foothills
    regions.assign([
        ("bamboo", 3, lambda x, y: -abs(x - 270) - abs(y - 90)),
        ("pine", 2, lambda x, y: -abs(x - 160) - abs(y - 230)),
        ("marsh", 2, lambda x, y: -abs(x - 190) - abs(y - 250)),
        ("meadow", 4, lambda x, y: -abs(x - 220) - abs(y - 230)),
    ])
    paint_ground(m, regions)
    return regions


def _roads(m: Province) -> None:
    road(m, [(296, 6), (296, SIZE - 6)], tile=PAVING)                                    # QL1, north to south
    road(m, [(296, 180), (390, 180)], tile=PAVING)                                       # Nhật Lệ bridge to Bảo Ninh
    road(m, [(296, 226), (390, 226)], tile=PAVING)                                       # Nhật Lệ 2 bridge
    road(m, [(326, 226), (326, 296)], tile=PAVING)                                       # Cầu Dài, south to Quảng Ninh
    road(m, [(296, 312), (372, 312)], tile=PAVING)                                       # Quán Hàu → Hải Ninh
    road(m, [(232, 118), (270, 118), (270, 190), (296, 190)])                            # dirt road Phong Nha → Đồng Hới
    road(m, [(284, 199), (296, 199)], tile=PAVING)                                       # station forecourt


def _phong_nha(m: Province) -> None:
    cave_x, cave_y = 166, 96
    place(m, "phong_nha_cave", cave_x, cave_y, 8, 6, solid_from=2, force=True)          # động Phong Nha
    for x, y in ((158, 92), (176, 92), (150, 100), (180, 98), (134, 128), (112, 128), (140, 140), (138, 168),
                 (160, 170), (128, 180), (214, 92), (226, 88), (246, 112), (220, 132), (250, 128)):
        place(m, "karst_a" if (x + y) % 3 else "karst_b", x, y, 4, 6, solid_from=2, force=True)   # limestone towers
    for y in range(cave_y + 3, cave_y + 6):                                               # the Son flows out of it
        for x in range(cave_x + 3, cave_x + 6):
            m.ground[y][x] = WATER
    jetty(m, 208, 102, 109)                                                               # the boat wharf
    clearing(m, (180, 108, 238, 126))                                                     # tourist centre, south bank
    place(m, "thatched_house", 202, 112, 5, 4, force=True)                               # Trung tâm du lịch
    for i, (s, w, h) in enumerate((("stall_veg", 3, 3), ("hat_stall", 3, 2), ("stall_rice", 3, 3))):
        place(m, s, 198 + i * 6, 120, w, h, solid_from=1, force=True)                    # bánh khoái, nón lá, snacks
    place(m, "stilt_house", 184, 110, 5, 4, force=True)                                   # nhà sàn
    place(m, "stilt_house", 226, 110, 5, 4, force=True)
    place(m, "signpost", 236, 116, 1, 2, solid_from=1, force=True)                       # đi Ba Đồn / đi Đồng Hới
    place(m, "buffalo", 190, 122, 2, 1, solid_from=0, force=True)
    clearing(m, (178, 84, 206, 94), palms=0.03)                                           # stilt houses north bank
    place(m, "stilt_house", 182, 86, 5, 4, force=True)
    place(m, "stilt_house", 194, 86, 5, 4, force=True)
    clearing(m, (112, 134, 134, 162), palms=0.01)                                         # Thiên Đường
    walk_under(m, "paradise_cave", 118, 136, 5, 6, solid_rows=4)
    road(m, [(120, 142), (120, 160)], 2, BRIDGE)                                          # wooden walkway
    place(m, "phong_nha_cave", 146, 176, 8, 6, solid_from=2, force=True)                 # Sơn Đoòng
    for x, y in ((242, 100), (232, 138)):                                                 # lookouts with fan palms
        clearing(m, (x - 3, y - 2, x + 5, y + 4), palms=0.08, flowers=0.0)
        place(m, "lookout", x, y, 3, 2, solid_from=1, force=True)
    trail(m, (121, 160), (182, 124))
    trail(m, (150, 182), (122, 160))
    trail(m, (238, 116), (296, 72))                                                       # đi Ba Đồn
    trail(m, (243, 103), (234, 116))
    trail(m, (233, 141), (238, 120))


def _dong_hoi(m: Province, shore: list[int]) -> None:
    walls(m, 302, 186, 324, 206)                                                          # Đồng Hới citadel, now a park
    road(m, [(303, 199), (323, 199)], 1, PAVING)
    road(m, [(313, 187), (313, 205)], 2, PAVING)
    clearing(m, (303, 187, 323, 205), palms=0.04, flowers=0.08)
    for x, y in [(313, 206), (314, 206), (324, 195), (324, 196), (302, 199), (302, 200)]:  # gates
        m.ground[y][x] = PAVING
    place(m, "quang_binh_quan", 311, 184, 5, 3, solid_from=1, force=True)
    market(m, 330, 190, rows=2, cols=3)                                                   # chợ Đồng Hới
    place(m, "station", 286, 194, 7, 4, solid_from=1, force=True)                        # ga Đồng Hới
    quay(m, 340, 170, 362, 236)                                                           # stone river walls in town
    river_x = next((x for x in range(340, 380) if m.ground[226][x] == BRIDGE), None)
    if river_x:
        place(m, "cable_bridge", river_x - 2, 223, 10, 4, solid_from=None, layer="floor", force=True)
    y = crossing(m, 326, range(236, 300))                                                 # Cầu Dài
    if y:
        place(m, "river_bridge", 325, y - 1, 3, 7, solid_from=None, layer="floor", force=True)
    for y in range(190, 262, 7):                                                          # Bảo Ninh beach parasols
        if y not in range(178, 184) and y not in range(224, 230):
            place(m, "beach_parasol", shore[y] + 1, y, 2, 2, solid_from=None, force=True)
    for x, y in water_spots(m, 3, 9, range(172, 240), range(346, 360))[:6]:             # fishing boats on the river
        m.prop("sampan", x, y, 3, 1)
    boats(m, "basket_boat", 2, [(shore[y] + 9, y) for y in range(196, 256, 12)])
    place_near(m, "signpost", 300, 160, 1, 2)
    for x, y in ((305, 191), (318, 191), (305, 203), (318, 203)):                         # park benches and lamps
        place(m, "bench", x, y, 2, 1, solid_from=0, force=True)
    for x, y in ((311, 196), (316, 196), (311, 202), (316, 202)):
        place(m, "street_lamp", x, y, 1, 1, solid_from=0, force=True)
    street_row(m, 298, 345, 180)                                                          # shophouse streets
    street_row(m, 362, 392, 180, seed=3)
    street_row(m, 298, 345, 226, seed=1)
    place_near(m, "ubnd", 300, 212, 8, 4)
    place_near(m, "post_office", 318, 212, 4, 3)
    place_near(m, "school", 276, 212, 9, 3)


def _quan_hau(m: Province) -> None:
    y = crossing(m, 296, range(262, 300))                                                 # Quán Hàu bridge
    if y:
        place(m, "truong_tien", 294, y - 1, 5, 7, solid_from=None, layer="floor", force=True)
    clearing(m, (268, 288, 294, 300), palms=0.0, flowers=0.0)
    market(m, 272, 290, rows=1, cols=4)                                                   # chợ Quán Hàu
    place(m, "ubnd", 298, 300, 8, 4, force=True)                                          # UBND huyện
    place(m, "post_office", 307, 300, 4, 3, force=True)                                   # bưu điện
    place(m, "warehouse", 270, 302, 6, 4, force=True)                                     # farming co-operative
    for i in range(10):                                                                   # Võ Xá wine village: jars
        place_near(m, "jar", 332 + (i % 5) * 2, 304 + (i // 5) * 2, 1, 1, radius=3)
    place_near(m, "thatched_house", 338, 316, 5, 4)
    place_near(m, "memorial", 236, 290, 3, 3, radius=10)                                 # Long Đại ferry memorial
    place_near(m, "signpost", 372, 308, 1, 2)                                            # đi Hải Ninh
    for i in range(0, 64):                                                                # Lũy Đào Duy Từ rampart
        x, y = round(200 + i), round(338 - i * 0.5)
        if i % 22 not in (10, 11) and m.ground[y][x] != WATER and (x, y) not in m.taken:
            m.ground[y][x] = CITADEL
            m.taken.add((x, y))
    at = place_near(m, "pagoda", 262, 316, 4, 4)                                         # Chùa Ông
    if at:
        place_near(m, "pagoda_gate", at[0] - 1, at[1] + 5, 5, 2, solid_from=None)
    place_near(m, "ferry_shelter", 244, 290, 3, 3)                                       # bến phà Long Đại
    place(m, "mountain", 186, 330, 8, 6, solid_from=2, force=True)                       # núi Thần Đinh
    place_near(m, "pagoda", 194, 338, 4, 4)
    walk_under(m, "waterfall", 40, 298, 4, 5, solid_rows=3)                               # thác Tam Lu
    fish_ponds(m, 222, 296, 262, 320, "Quán Hàu")                                                     # ao cá


def _ba_don(m: Province) -> None:
    market(m, 304, 38, rows=1, cols=3)                                                    # chợ Ba Đồn
    road(m, [(298, 48), (352, 48)], tile=PAVING)
    street_row(m, 322, 352, 48, seed=2)
    street_row(m, 300, 352, 34, seed=4)
    place_near(m, "ubnd", 330, 22, 8, 4)
    place_near(m, "school", 306, 20, 9, 3)
    place_near(m, "post_office", 344, 24, 4, 3)
    place_near(m, "ferry_shelter", 354, 49, 3, 3)                                        # bến phà on the Gianh
    quay(m, 296, 50, 372, 64)                                                             # riverside embankment
    clearing(m, (298, 12, 372, 50), palms=0.01, flowers=0.03)


def _south(m: Province) -> None:
    place(m, "hot_spring", 146, 368, 4, 3, solid_from=0, force=True)                     # suối Bang
    place(m, "memorial_house", 286, 392, 5, 4, force=True)                               # Võ Nguyên Giáp
    for x, y in water_spots(m, 6, 14, range(330, 410), range(100, 330))[:3]:            # đua thuyền on the Kiến Giang
        m.prop("race_boat", x, y, 6, 1)


FIELDS = [  # (zone, area, pond near, rice field near) - see landmark_fields.py
    ("Đồng Hới", (272, 160, 402, 262), (350, 225), (380, 245)),
    ("Ba Đồn", (284, 22, 372, 52), (320, 30), (345, 30)),
    ("Phong Nha – Kẻ Bàng", (104, 80, 252, 190), (190, 150), (215, 165)),
    ("Quán Hàu", (220, 270, 380, 330), None, None),                # its ao cá are fish_ponds() above
    ("Lệ Thủy", (270, 360, 340, 404), (300, 385), None),
]


def _zones(m: Province) -> None:
    landmark_fields(m, FIELDS)
    for sid, near in (("phong_nha", (198, 122)), ("ba_don", (330, 36)), ("le_thuy", (306, 394))):
        start_point(m, sid, near)                                                       # where a new game may begin
    for name, area in [("Ba Đồn", (284, 22, 372, 52)), ("Phong Nha – Kẻ Bàng", (104, 80, 252, 190)),
                       ("Đồng Hới", (272, 160, 402, 262)), ("Quán Hàu", (220, 270, 380, 330)),
                       ("Núi Thần Đinh", (180, 324, 202, 346)), ("Thác Tam Lu", (34, 292, 50, 308)),
                       ("Lệ Thủy", (270, 360, 340, 404)), ("Suối Bang", (138, 360, 160, 380))]:
        zone(m, name, area)


def build_quang_binh() -> Province:
    m = Province(seed=301, w=SIZE, h=SIZE)
    shore = coast(m, 396, amp=4)
    _rivers(m, shore)
    regions = _regions(m)
    exit_south(m, 30, "Hue", "fromQuangBinh", "fromHue")
    _roads(m)
    _phong_nha(m)
    _dong_hoi(m, shore)
    _quan_hau(m)
    _south(m)
    _ba_don(m)
    connect(m, regions, [(30, SIZE - 8), (170, 104), (150, 182), (146, 370), (290, 396), (44, 304)])
    fill_contents(m, regions, KARST, HOUSES)
    herd(m, regions, ("rice", "meadow"), 14)
    for x, y in water_spots(m, 3, 30, range(30, 60), range(20, 380)):
        m.prop("sampan", x, y, 3, 1)
    for x, y in water_spots(m, 3, 3, range(97, 106), range(186, 236))[:3]:              # tour boats on the Son
        m.prop("sampan", x, y, 3, 1)
    town_beach = set(range(186, 262))
    beach_trees(m, shore, "casuarina", every=4, skip=town_beach | set(range(160, 186)))
    beach_trees(m, shore, "coconut", every=3, skip=set(range(SIZE)) - town_beach | set(range(222, 230)))
    for i, (x, y) in enumerate([(210, 100), (348, 196), (356, 52), (244, 282), (324, 360), (330, 290)]):
        mooring(m, f"qb_boat_{i}", x, y)                                                 # rowing boats
    services(m)
    _zones(m)
    return finish(m, "start")
