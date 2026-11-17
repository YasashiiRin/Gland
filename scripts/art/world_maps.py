"""The two big province maps (425x425): Quảng Bình and Huế.

Each is a patchwork of Don't Starve-style regions (biome.py) shaped around
the province's real geography and landmarks, with one dense NPC village and
a few hamlets. Quảng Bình is reached from the farm's north edge, Huế from
the village's south edge.
"""
from __future__ import annotations

from .biome import Regions, connect, fill_contents, paint_ground, trail
from .province_tiles import BRIDGE, LOTUS, PAVING
from .region import Province, beach_trees, boats, coast, ellipse, exit_north, exit_south, finish, meander, place, river, road, walls
from .tiles import BLOCK, WATER

SIZE = 425
HOUSES = [("house_a", 5, 4), ("house_b", 5, 4), ("house_c", 5, 4), ("thatched_house", 5, 4)]
GARDEN_HOUSES = [("house_a", 5, 4), ("house_c", 5, 4), ("house_b", 5, 4)]
MOUNTAINS = [("mountain", 8, 6)]
KARST = [("karst_a", 4, 6), ("karst_b", 4, 6), ("mountain", 8, 6)]


def _water_spots(m: Province, w: int, every: int, rows: range, cols: range) -> list[tuple[int, int]]:
    spots = []
    for y in rows[::every]:
        for x in cols:
            if all(m.ground[y][xx] == WATER for xx in range(x, x + w)) and all(m.ground[y + 1][xx] == WATER for xx in range(x, x + w)):
                spots.append((x, y))
                break
    return spots


def build_quang_binh() -> Province:
    """Quảng Bình: Phong Nha – Kẻ Bàng's karst forest and cave in the west, Đèo Ngang
    in the north, the Son–Gianh and Nhật Lệ rivers, Quang Phú's white sand dunes,
    rice plains, lotus marshes, bamboo and pine, Đồng Hới (the NPC town) and the
    fishing village of Bảo Ninh by the sea."""
    m = Province(seed=301, w=SIZE, h=SIZE)
    shore = coast(m, 392, amp=5)
    regions = Regions(m, 64)
    cave_x, cave_y = 104, 170
    regions.force(cave_x + 4, cave_y + 3, "karst")
    regions.force(330, 292, "village")                                        # Đồng Hới
    regions.force(372, 330, "hamlet")                                          # Bảo Ninh
    regions.assign([
        ("karst", 14, lambda x, y: -x + 0.15 * y),
        ("mountain", 5, lambda x, y: -2 * y + 0.2 * x),                        # Đèo Ngang
        ("dunes", 7, lambda x, y: x - 0.2 * abs(y - 200)),                     # Quang Phú
        ("rice", 7, lambda x, y: -abs(x - 270) - 0.5 * abs(y - 230)),
        ("forest", 7, lambda x, y: -abs(x - 170) - 0.3 * abs(y - 330)),
        ("marsh", 3, lambda x, y: -abs(x - 300) - abs(y - 360)),
        ("bamboo", 3, lambda x, y: -abs(x - 220) - abs(y - 300)),
        ("pine", 3, lambda x, y: -abs(x - 200) - abs(y - 60)),
        ("hamlet", 3, lambda x, y: -abs(x - 250) - abs(y - 150)),
        ("meadow", 4, lambda x, y: -abs(x - 230) - abs(y - 390)),
    ])
    paint_ground(m, regions)
    river(m, meander(cave_x + 4, cave_y + 5, 240, 120, 8, 1.5, seed=1) + meander(240, 120, shore[64] + 3, 64, 6, 1, seed=2), 7)
    river(m, meander(150, SIZE - 1, 260, 330, 9, 1, seed=3) + meander(260, 330, shore[306] + 3, 306, 5, 1, seed=4), 7)
    exit_south(m, 30, "Farm", "fromQuangBinh", "fromFarm")
    place(m, "phong_nha_cave", cave_x, cave_y, 8, 6, solid_from=2, force=True)
    for y in range(cave_y + 3, cave_y + 6):                                    # the river runs into the cave
        for x in range(cave_x + 3, cave_x + 6):
            m.ground[y][x] = WATER
    connect(m, regions, [(30, SIZE - 8), (cave_x + 4, cave_y + 7)])
    fill_contents(m, regions, KARST, HOUSES)
    beach_trees(m, shore, "casuarina", every=4)
    boats(m, "basket_boat", 2, [(shore[y] + 2, y) for y in range(300, 360, 8)])
    for x, y in _water_spots(m, 3, 40, range(80, 330), range(130, 330)):
        m.prop("sampan", x, y, 3, 1)
    return finish(m, "fromFarm")


def build_hue() -> Province:
    """Huế: the moated citadel (Ngọ Môn, Thái Hòa hall, a lotus lake), the Perfume
    River with Trường Tiền bridge and dragon boats, Thiên Mụ's tower, royal tombs in
    the pine hills, Bạch Mã in the south, rice plains, the Tam Giang lagoon with Rú
    Chá's mangroves, the Thuận An mouth and the dunes along the sea."""
    m = Province(seed=303, w=SIZE, h=SIZE)
    shore = coast(m, 398, amp=4)
    river(m, meander(332, 0, 346, 300, 8, 1.2, seed=5), 18)                    # Tam Giang lagoon
    river(m, [(346, 190), (shore[190] + 3, 190)], 7)                          # Thuận An mouth
    regions = Regions(m, 64)
    regions.force(235, 120, "none")                                            # the citadel
    regions.force(300, 140, "village")                                         # Gia Hội – Đông Ba
    regions.force(316, 70, "mangrove")                                         # Rú Chá
    regions.force(150, 232, "meadow")                                          # Thiên Mụ hill
    regions.assign([
        ("dunes", 6, lambda x, y: x),
        ("pine", 10, lambda x, y: y - x),
        ("mountain", 6, lambda x, y: 2 * y + 0.5 * x),                         # Bạch Mã
        ("rice", 7, lambda x, y: -1.5 * y - 0.3 * abs(x - 200)),
        ("marsh", 4, lambda x, y: -abs(x - 300) - 0.2 * abs(y - 120)),
        ("forest", 6, lambda x, y: -x),
        ("bamboo", 3, lambda x, y: -abs(x - 120) - abs(y - 180)),
        ("orchard", 2, lambda x, y: -abs(x - 280) - abs(y - 260)),             # thanh trà
        ("hamlet", 4, lambda x, y: -abs(x - 170) - abs(y - 120)),
        ("meadow", 4, lambda x, y: -abs(x - 200) - abs(y - 300)),
    ])
    paint_ground(m, regions)
    river(m, meander(0, 342, 120, 280, 6, 1, seed=6) + meander(120, 280, 200, 212, 5, 1, seed=7)
          + meander(200, 212, 346, 186, 5, 1, seed=8), 7)                       # sông Hương
    walls(m, 195, 84, 275, 160, inside=PAVING, moat=True)                      # Kinh thành
    exit_north(m, 10, "Town", "fromHue", "fromQuangBinh")
    road(m, [(234, 60), (234, 262)])                                           # through the citadel and over the river
    place(m, "ngo_mon", 231, 156, 8, 5, solid_from=None, force=True)
    for y in range(158, 161):
        for x in range(231, 239):
            if x not in (234, 235):
                m.put(x, y, BLOCK)
    place(m, "royal_hall", 220, 100, 7, 4, force=True)
    ellipse(m, 258, 124, 9, 5, LOTUS)
    bridge_y = min((y for y in range(165, 260) if m.ground[y][234] == BRIDGE), default=200)
    place(m, "truong_tien", 232, bridge_y, 5, 7, solid_from=None, layer="floor", force=True)
    place(m, "thien_mu", 148, 230, 2, 2, force=True)
    place(m, "pagoda", 152, 228, 4, 4, force=True)
    connect(m, regions, [(10, 8), (234, 60), (234, 262)])
    trail(m, (150, 234), regions.centers[regions.at(150, 232)])
    for r in regions.regions_of("pine")[:4]:                                   # royal tombs in the pine hills
        cx, cy = regions.centers[r]
        if not place(m, "royal_tomb", cx + 3, cy - 6, 6, 4):
            place(m, "royal_tomb", cx - 9, cy + 3, 6, 4)
    fill_contents(m, regions, MOUNTAINS, GARDEN_HOUSES)
    beach_trees(m, shore, "casuarina", every=4, skip=set(range(184, 197)))
    for x, y in _water_spots(m, 4, 30, range(200, 340), range(20, 330)):
        m.prop("dragon_boat", x, y, 4, 2)
    for x, y in _water_spots(m, 3, 40, range(10, 290), range(330, 360)):
        m.prop("sampan", x, y, 3, 1)
    return finish(m, "fromQuangBinh")


WORLD_MAPS = (("quang_binh", build_quang_binh), ("hue", build_hue))
