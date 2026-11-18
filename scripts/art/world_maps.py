"""The two big province maps (425x425). Quảng Bình is in map_quang_binh.py; this
file holds Huế, laid out after the player's reference picture. North is up,
the sea is on the east.

Huế: the Đại Nội citadel north of the Perfume River, Thiên Mụ upstream, Phú
Xuân (the NPC town) and Trường Tiền bridge, Đông Ba market, Ngự Bình hill,
royal tombs among pines, craft villages (nón lá), rice, Trường Sơn, the Tam
Giang lagoon with Rú Chá mangroves, the Thuận An mouth and the dunes.
"""
from __future__ import annotations

from .biome import Regions, connect, fill_contents, paint_ground, trail
from .landmark_fields import landmark_fields, start_point
from .map_helpers import GARDEN_HOUSES, MOUNTAINS, SIZE, crossing, herd, market, mooring, street_row, water_spots, zone
from .map_quang_binh import build_quang_binh
from .province_tiles import LOTUS, PAVING
from .region import Province, beach_trees, coast, ellipse, exit_north, finish, meander, place, river, road, walls
from .tiles import BLOCK


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
    exit_north(m, 10, "QuangBinh", "fromHue", "fromQuangBinh")
    road(m, [(10, 8), (10, 40), (195, 40), (195, 300)], tile=PAVING)                     # through the citadel, over the river
    road(m, [(195, 250), (300, 250), (300, 200)], tile=PAVING)
    street_row(m, 198, 298, 250)                                                          # Phú Xuân shophouses
    place(m, "ngo_mon", 192, 186, 8, 5, solid_from=None, force=True)
    for y in range(188, 191):
        for x in range(192, 200):
            if x not in (195, 196):
                m.put(x, y, BLOCK)
    place(m, "royal_hall", 181, 130, 7, 4, force=True)
    ellipse(m, 222, 152, 9, 5, LOTUS)
    m.obj("fish_pond", 213 * 16, 147 * 16, 19 * 16, 11 * 16, {"pondName": "Hồ sen Đại Nội"})
    bridge_y = crossing(m, 195, range(196, 290))
    if bridge_y:
        place(m, "truong_tien", 193, bridge_y, 5, 7, solid_from=None, layer="floor", force=True)
    place(m, "thien_mu", 114, 262, 2, 2, force=True)
    place(m, "pagoda", 118, 260, 4, 4, force=True)
    place(m, "mountain", 210, 336, 8, 6, solid_from=2, force=True)                       # Ngự Bình
    market(m, 250, 196, rows=2, cols=3)                                                  # chợ Đông Ba
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
    herd(m, regions, ("rice", "meadow"), 10)
    for x, y in water_spots(m, 4, 30, range(210, 330), range(20, 330)):
        m.prop("dragon_boat", x, y, 4, 2)
    for x, y in water_spots(m, 3, 40, range(10, 320), range(330, 365)):
        m.prop("sampan", x, y, 3, 1)
    beach_trees(m, shore, "casuarina", every=4, skip=set(range(194, 207)))
    trail(m, (195, 300), (195, 318))
    for i, (x, y) in enumerate([(190, 222), (120, 270), (300, 212)]):
        mooring(m, f"hue_boat_{i}", x, y)                                                # rowing boats on the Hương
    _hue_zones(m)
    return finish(m, "fromQuangBinh")


HUE_ZONES = [  # (zone, area, pond near, rice field near) - see landmark_fields.py
    ("Đại Nội", (148, 110, 242, 194), None, None),                    # its lotus lake is the pond
    ("Chợ Đông Ba", (242, 186, 278, 214), None, None),
    ("Phú Xuân", (176, 236, 300, 300), (270, 285), None),
    ("Chùa Thiên Mụ", (104, 248, 132, 276), (112, 272), None),
    ("Núi Ngự Bình", (204, 328, 224, 348), None, None),
]


def _hue_zones(m: Province) -> None:
    landmark_fields(m, HUE_ZONES)
    for sid, near in (("phu_xuan", (262, 290)), ("thien_mu", (120, 264))):
        start_point(m, sid, near)                                                       # where a new game may begin
    for name, area, _, _ in HUE_ZONES:
        zone(m, name, area)


WORLD_MAPS = (("quang_binh", build_quang_binh), ("hue", build_hue))
