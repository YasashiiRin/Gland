"""Village homesteads (the player's layout, 2026-11-18): every village house
stands on its own 19 x 18 plot of bare beaten earth (the colour of the lanes),
unwalled and ringed with trees - bamboo clumps, banana and fruit trees:

    rows 0-2    back garden: banana trees, the edge trees
    rows 3-8    the house, true size (about 10 x 6, real_scale.py); a haystack on its right,
                a big shade tree at the front left; a low hedge along the front edge
    rows 9-16   the yard: a low bamboo tea table with stools; some plots also have
                a fish pond or a chicken coop
    row 17      the front edge; "gate" is its middle, just below

Each plot is a "zone" object of kind "home": a safe zone (no ghosts or tigers,
no tilling or building by others). The household is decided here too: how
many live there (1, or a couple and a child), and whether they keep a buffalo
or a cow. Some plots hold an empty thatched house ("vacant") that a new player
is given; inside their own plot they may farm and build freely.
"""
from __future__ import annotations

from .province_tiles import BAMBOO_TREE, ORCHARD
from .region import Province, place
from .tiles import BUSH, DIRT, WATER

T = 16
W, H = 19, 18
VACANT_HOUSE = "thatched_house"


def homestead(m: Province, x0: int, y0: int, sprite: str, vacant: bool, prefix: str) -> bool:
    """Builds a plot with its top-left corner at (x0, y0). False if the ground isn't free."""
    if not m.area_free(x0, y0, W, H):
        return False
    hx, hy = x0 + 7, y0 + 5
    house = VACANT_HOUSE if vacant else sprite
    if not place(m, house, hx, hy, 5, 4, facing="down"):  # towards the yard gate and its lane
        return False
    x1, y1 = x0 + W - 1, y0 + H - 1
    for y in range(y0, y1 + 1):                                       # bare earth, like the lanes
        for x in range(x0, x1 + 1):
            m.ground[y][x] = DIRT
    gate = range(hx + 1, hx + 4)
    for x in range(x0, x1 + 1):                                       # trees round the back, a low hedge in front
        for y in (y0, y1):
            if (y == y1 and x in gate) or m.rnd.random() < 0.35:
                continue
            if y == y1:
                m.put(x, y, BUSH)  # full-size trees here would hide the whole yard
            else:
                _edge_tree(m, x, y)
    for y in range(y0 + 1, y1):
        for x in (x0, x1):
            if m.rnd.random() < 0.6:
                _edge_tree(m, x, y)
    for bx in range(x0 + 2, x1 - 1, 3):                               # the back garden
        if m.rnd.random() < 0.6:
            m.prop("banana", bx, y0 + 1 + m.rnd.randint(0, 1), 1, 1)   # behind the house
    m.put(x0 + 2, y0 + 10, ORCHARD)                                   # the big shade tree, front left
    place(m, "haystack", x0 + 16, y0 + 7, 2, 2, solid_from=0, force=True)
    place(m, "tea_table", x0 + 10, y0 + 11, 2, 1, solid_from=0, force=True)
    feature = "" if vacant else m.rnd.choice(["pond", "chickens", "", ""])
    if feature == "pond":
        for y in range(y0 + 12, y0 + 15):
            for x in range(x0 + 2, x0 + 6):
                m.ground[y][x] = WATER
    elif feature == "chickens":
        place(m, "chicken_coop", x0 + 14, y0 + 12, 2, 2, solid_from=1, force=True)
    m.claim(x0, y0, W, H)
    count = getattr(m, "home_count", 0)
    m.home_count = count + 1  # type: ignore[attr-defined]
    home_id = f"{prefix}{count}"
    members = "0" if vacant else m.rnd.choice(["1", "3", "3"])
    livestock = "" if vacant or members == "1" else m.rnd.choice(["buffalo", "cow", "", ""])
    m.obj("zone", x0 * T, y0 * T, W * T, H * T, {
        "zoneName": "Nhà trống" if vacant else "Nhà dân", "kind": "home", "homeId": home_id,
        "vacant": "1" if vacant else "0", "house": house, "gateX": str(hx + 2), "gateY": str(y1 + 1),
        "members": members, "feature": feature, "livestock": livestock,
    })
    return True


def _edge_tree(m: Province, x: int, y: int) -> None:
    roll = m.rnd.random()
    if roll < 0.5:
        m.put(x, y, BAMBOO_TREE)
    elif roll < 0.8:
        m.prop("banana", x, y, 1, 1)
    else:
        m.put(x, y, ORCHARD)
