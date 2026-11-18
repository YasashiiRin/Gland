"""Village services in Quảng Bình (big world, phase 2): what used to live on
the separate Farm and Town maps now sits in the world itself.

* Đồng Hới: the seed shop, grocery and vehicle shop (doors with a "shop"
  object in front), three market stalls with their vendors, the quest board,
  and a guesthouse to sleep in (until the player gets a sleeping mat).
* The farming co-operative (hợp tác xã) on the edge of Đồng Hới: warehouse with
  five vehicle bays in front (keep in sync with src/data/garage.ts) and the
  shipping bin; its meadow is where bought farm animals arrive.
* Sơn Đoòng: the entrance of the mine.

Prints where the co-operative ended up, for garage.ts.
"""
from __future__ import annotations

from .map_helpers import place_near
from .region import Province
from .tiles import DIRT, GRASS, PATH

T = 16
# The co-operative yard: warehouse (6x5) at (CX, CY), bays on row CY + 7.
COOP = (262, 236)
BAY_OFFSETS = (-2, 1, 4, 7, 10)


def _shop(m: Province, sprite: str, x: int, y: int, w: int, shop_id: str, name: str = "shop") -> None:
    """A building with an interaction tile in front of its door (a "shop" or a "bed")."""
    at = place_near(m, sprite, x, y, w, 5, radius=16)
    if not at:
        raise RuntimeError(f"no room for {shop_id or name}")
    door_x, front_y = at[0] + w // 2, at[1] + 5
    m.ground[front_y][door_x] = PATH
    m.taken.add((door_x, front_y))
    m.obj(name, door_x * T, front_y * T, T, T, {"shopId": shop_id} if shop_id else None)


def _stalls(m: Province) -> None:
    for i, (kind, shop_id) in enumerate((("fish", "market_fish"), ("veg", "market_veg"), ("rice", "market_rice"))):
        at = place_near(m, f"stall_{kind}", 332 + i * 4, 202, 3, 3, radius=10)
        if not at:
            raise RuntimeError(f"no room for {shop_id}")
        front = (at[0] + 1, at[1] + 3)
        m.taken.add(front)
        m.obj("shop", front[0] * T, front[1] * T, T, T, {"shopId": shop_id})


def _coop(m: Province) -> None:
    cx, cy = COOP
    m.fill(cx - 3, cy - 1, cx + 10, cy + 9, DIRT)                     # the yard
    for y in range(cy - 1, cy + 10):
        for x in range(cx - 3, cx + 11):
            m.put(x, y, None)
    m.prop("warehouse", cx, cy, 6, 5, solid_from=1)
    m.obj("warehouse", (cx + 2) * T, (cy + 4) * T, 2 * T, T)
    m.prop("shipping_bin", cx - 3, cy + 4, 2, 1)
    m.obj("shipping_bin", (cx - 3) * T, (cy + 4) * T, 2 * T, T)
    m.claim(cx - 3, cy - 1, 14, 11)
    m.fill(cx + 10, cy + 5, cx + 22, cy + 5, PATH)                     # track east into town
    m.spawn("coop", cx + 3, cy + 6)
    print(f"co-operative warehouse at {COOP}, bays row {cy + 7}, columns {[cx + d for d in BAY_OFFSETS]}")


def _mine(m: Province) -> None:
    x, y = 149, 182                                                    # in front of Sơn Đoòng (146,176 8x6)
    m.fill(x - 1, y, x + 2, y + 3, DIRT)
    for yy in range(y, y + 4):
        for xx in range(x - 1, x + 3):
            m.put(xx, yy, None)
    m.obj("mine_entrance", x * T, y * T, 2 * T, T)
    m.spawn("fromMine", x + 1, y + 2)


def services(m: Province) -> None:
    _shop(m, "shop", 290, 238, 6, "seed_shop")
    _shop(m, "grocery_house", 300, 240, 5, "grocery")
    _shop(m, "vehicle_house", 312, 240, 5, "vehicle_shop")
    _stalls(m)
    _shop(m, "house_c", 326, 240, 5, "", name="bed")                   # the guesthouse (nhà nghỉ): sleep here
    at = place_near(m, "signpost", 313, 209, 1, 2, radius=8)          # the quest board by the park gate
    if at:
        m.obj("quest_board", at[0] * T, (at[1] + 2) * T, T, T)
        m.ground[at[1] + 2][at[0]] = PATH if m.ground[at[1] + 2][at[0]] == GRASS else m.ground[at[1] + 2][at[0]]
    _coop(m)
    _mine(m)
    m.spawn("start", 313, 200)                                         # Đồng Hới park, until a start can be chosen
