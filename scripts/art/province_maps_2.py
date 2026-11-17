"""Round 2 of the central-Vietnam maps: Huế, Đà Nẵng and Quảng Nam (Hội An),
continuing south from Quảng Trị. Each map is 64x40 with the sea to the east
and the north-south road through x 31-32, like the round 1 maps.
"""
from __future__ import annotations

from .maps import MapBuilder
from .province_maps import H, SHORE_X, W, border, casuarinas, coast, edge_road, road
from .province_tiles import BRIDGE, CITADEL, LOTUS, ORCHARD, PAVING, SAND
from .tiles import BLOCK, BUSH, ROCK, SIGN, TRUNK, WATER


def river(m: MapBuilder, y0: int, y1: int) -> None:
    """A river across the map flowing out to sea, with sand banks at its mouth."""
    m.fill(0, y0, SHORE_X + 6, y1, WATER)
    for x in range(SHORE_X, SHORE_X + 7):
        m.ground[y0 - 1][x] = SAND
        m.ground[y1 + 1][x] = SAND


def pave(m: MapBuilder, x0: int, y0: int, x1: int, y1: int) -> None:
    """A paved street (old town, city, citadel), clearing anything standing on it."""
    m.fill(x0, y0, x1, y1, PAVING)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            m.put(x, y, None)


def build_hue() -> MapBuilder:
    """Huế: the citadel with Ngọ Môn and the Thái Hòa hall, the Perfume River with
    the Trường Tiền bridge and dragon boats, Thiên Mụ's tower, lotus ponds, pine hills."""
    m = MapBuilder(W, H, seed=107)
    m.grass_variation()
    coast(m)
    river(m, 22, 26)                                    # sông Hương
    m.fill(30, 21, 32, 27, BRIDGE)
    # the citadel: brick walls around a paved courtyard
    m.fill(20, 4, 43, 16, CITADEL)
    m.fill(21, 5, 42, 15, PAVING)
    m.fill(31, 16, 32, 16, PAVING)                      # the way through Ngọ Môn
    m.blob(13, 35, 5, 2.2, LOTUS)                       # lotus pond on the south bank
    border(m, edge_road(0) | edge_road(H - 1))
    m.prop("royal_hall", 25, 6, 7, 4, solid_from=1)
    m.prop("ngo_mon", 28, 12, 8, 5, solid_from=None)    # gate over the south wall; the middle arch is open
    for y in range(14, 17):
        for x in range(28, 36):
            if x not in (31, 32):
                m.put(x, y, BLOCK)
    m.prop("thien_mu", 9, 18, 2, 2, solid_from=1)       # Phước Duyên tower on the north bank, west of the city
    m.prop("pagoda", 12, 16, 4, 4, solid_from=1)
    m.prop("truong_tien", 29, 21, 5, 7, solid_from=None, layer="floor")
    for x in (12, 44):
        m.prop("dragon_boat", x, 23, 4, 2)
    for y in range(29, 38, 3):                          # pine hill on the south bank
        for x in range(38, 50, 3):
            m.put(x + (y % 2), y, ORCHARD)
    # roads: around the citadel's east side, through Ngọ Môn, over the bridge, on south
    road(m, 31, 0, 32, 3)
    road(m, 31, 2, 46, 3)
    road(m, 45, 2, 46, 19)
    road(m, 31, 18, 46, 19)
    road(m, 31, 17, 32, 20)
    road(m, 31, 28, 32, H - 1)
    road(m, 4, 31, 30, 32)
    casuarinas(m, SHORE_X - 2, [y for y in range(2, H - 2, 2) if not 19 <= y <= 28])
    m.scatter(TRUNK, 10, (4, 3, 18, 15))
    m.scatter(TRUNK, 6, (4, 28, 28, 37), avoid=(7, 30, 19, 36))
    m.scatter(BUSH, 26, (4, 3, 50, 38), avoid=(19, 3, 47, 20))
    m.door(30, 0, 4, 1, "QuangTri", "fromHue")
    m.door(30, H - 1, 4, 1, "DaNang", "fromHue")
    m.spawn("fromQuangTri", 31, 2)
    m.spawn("fromDaNang", 31, H - 3)
    m.spawn("default", 31, 2)
    return m


def build_da_nang() -> MapBuilder:
    """Đà Nẵng: the Hải Vân pass, the Hàn river with the Dragon Bridge, a city street
    of towers and flame trees, Sơn Trà's Lady Buddha, Marble Mountains, Mỹ Khê beach."""
    m = MapBuilder(W, H, seed=109)
    m.grass_variation()
    coast(m)
    m.fill(40, 0, 44, H - 1, WATER)                     # sông Hàn, flowing north to the bay
    border(m, edge_road(0) | edge_road(H - 1))
    for x0, y0 in ((2, 1), (12, 0)):                    # Hải Vân pass in the north-west
        m.prop("mountain", x0, y0, 8, 6, solid_from=2)
    pave(m, 4, 20, 39, 21)                              # Bạch Đằng street to the bridge
    pave(m, 31, 0, 32, H - 1)
    m.fill(39, 19, 45, 21, PAVING)                      # Dragon Bridge deck over the river
    pave(m, 46, 20, SHORE_X - 1, 21)
    m.fill(SHORE_X, 20, SHORE_X + 1, 21, SAND)
    m.prop("dragon_bridge", 39, 19, 7, 3, solid_from=None)
    for x in range(6, 30, 6):                           # tower blocks along the street
        m.prop("city_tower", x, 13, 3, 3, solid_from=1)
    for x in range(5, 39, 3):                           # flame trees lining the street
        if x not in (31, 32):
            m.put(x, 23, ORCHARD)
    m.prop("lady_buddha", 49, 6, 2, 2, solid_from=1)    # Sơn Trà, facing the sea
    m.prop("mountain", 45, 0, 8, 6, solid_from=2)
    m.prop("marble_mountain", 45, 29, 6, 6, solid_from=2)
    casuarinas(m, SHORE_X - 2, [y for y in range(8, H - 2, 2) if y not in (20, 22) and not 28 <= y <= 35])
    for x, y in ((54, 12), (55, 27), (53, 36)):
        m.prop("basket_boat", x, y, 2, 1)
    m.scatter(TRUNK, 8, (4, 25, 38, 37))
    m.scatter(ROCK, 6, (4, 7, 30, 12))
    m.scatter(BUSH, 24, (4, 7, 38, 37), avoid=(4, 12, 39, 24))
    m.door(30, 0, 4, 1, "Hue", "fromDaNang")
    m.door(30, H - 1, 4, 1, "QuangNam", "fromDaNang")
    m.spawn("fromHue", 31, 2)
    m.spawn("fromQuangNam", 31, H - 3)
    m.spawn("default", 31, 2)
    return m


def build_quang_nam() -> MapBuilder:
    """Quảng Nam: Hội An's old quarter (yellow shophouses, lanterns, the covered
    Japanese bridge), the Thu Bồn river with lantern boats, Mỹ Sơn's Cham towers,
    the Bảy Mẫu coconut grove and the Cù Lao Chàm islands offshore."""
    m = MapBuilder(W, H, seed=113)
    m.grass_variation()
    coast(m)
    river(m, 27, 30)                                    # sông Thu Bồn
    m.fill(26, 8, 27, 26, WATER)                        # the little canal under Chùa Cầu
    for cy in (12, 25):                                 # Cù Lao Chàm: small islands out at sea
        m.blob(61, cy, 3.2, 3.6, SAND)
    border(m, edge_road(0))
    pave(m, 4, 14, 50, 15)                              # Trần Phú street
    pave(m, 4, 22, 50, 23)                              # Bạch Đằng riverside street
    pave(m, 31, 0, 32, 26)
    for y in (14, 15, 22, 23):                          # wooden decks over the canal
        for x in (26, 27):
            m.ground[y][x] = BRIDGE
    m.prop("japanese_bridge", 25, 13, 4, 3, solid_from=None)
    m.fill(30, 26, 32, 31, BRIDGE)                      # An Hội bridge over the river
    for i, x in enumerate((6, 11, 16, 20, 34, 39, 44)):
        side = "a" if i % 2 else "b"
        m.prop(f"hoian_house_{side}", x, 10, 4, 4, solid_from=1)
        m.prop(f"hoian_house_{'b' if side == 'a' else 'a'}", x, 17, 4, 4, solid_from=1)
    for x in (8, 22, 42):
        m.prop("lantern_boat", x, 28, 3, 1)
    # south bank: Mỹ Sơn towers among the trees (west) and the coconut grove (east)
    road(m, 31, 32, 32, H - 2)
    for x, y, v in ((5, 34, "a"), (9, 33, "b"), (13, 35, "a")):
        m.prop(f"cham_tower_{v}", x, y, 3, 2, solid_from=1)
    for y in range(33, 38, 2):
        for x in range(37, 47, 3):
            m.put(x + (y % 3), y, ORCHARD)
    casuarinas(m, SHORE_X - 2, [y for y in range(2, H - 2, 3) if not 12 <= y <= 31], sprite="coconut")
    for x, y in ((54, 6), (55, 18), (53, 35)):
        m.prop("basket_boat", x, y, 2, 1)
    for x, y in ((61, 11), (61, 24)):
        m.prop("coconut", x, y, 1, 1)
    m.scatter(TRUNK, 10, (4, 32, 28, 37), avoid=(4, 32, 16, 37))
    m.scatter(TRUNK, 6, (4, 3, 50, 8))
    m.scatter(BUSH, 20, (4, 3, 50, 38), avoid=(4, 9, 50, 26))
    m.put(34, H - 2, SIGN)                              # the road south to Quảng Ngãi (not open yet)
    m.door(30, 0, 4, 1, "DaNang", "fromQuangNam")
    m.spawn("fromDaNang", 31, 2)
    m.spawn("default", 31, 2)
    return m


ROUND_2_MAPS = (("hue", build_hue), ("da_nang", build_da_nang), ("quang_nam", build_quang_nam))
