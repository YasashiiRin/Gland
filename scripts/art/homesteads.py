"""Village homesteads: every village house stands in its own walled plot.

A plot is 11 x 10 tiles, unwalled (the player asked for no straw wall): a
clump of bamboo or a banana tree marks a corner or two.

    rows 1-2   back garden with banana trees
    rows 3-6   the house (5 x 4) with a big tree on its left, a haystack on its right
    rows 7-8   the beaten-earth yard (sân)
    row 9      the front edge; "gate" is the middle of it, just below

Each plot is a "zone" object of kind "home": a safe zone (no ghosts or tigers,
no tilling or building by others). Some plots hold an empty thatched house
("vacant"): a new player is given one of those as their home, and inside their
own plot they may farm and build freely.
"""
from __future__ import annotations

from .province_tiles import BAMBOO_TREE, ORCHARD
from .region import Province, place
from .tiles import DIRT

T = 16
W, H = 11, 10
VACANT_HOUSE = "thatched_house"


def homestead(m: Province, x0: int, y0: int, sprite: str, vacant: bool, prefix: str) -> bool:
    """Builds a walled plot with its top-left corner at (x0, y0). False if the ground isn't free."""
    if not m.area_free(x0, y0, W, H):
        return False
    hx, hy = x0 + 3, y0 + 3
    house = VACANT_HOUSE if vacant else sprite
    if not place(m, house, hx, hy, 5, 4):
        return False
    x1, y1 = x0 + W - 1, y0 + H - 1
    for y in range(y0 + 7, y1):                                       # the beaten-earth yard
        for x in range(x0 + 1, x1):
            m.ground[y][x] = DIRT
    m.put(x0 + 1, y0 + 6, ORCHARD)                                    # the big tree
    place(m, "haystack", x0 + 8, y0 + 5, 2, 2, solid_from=0, force=True)
    for bx, by in ((x0 + 1, y0 + 2), (x0 + 8, y0 + 1)):
        m.prop("banana", bx, by, 1, 1)                               # banana trees behind the house
    # No wall: a clump of bamboo or a banana tree marks a corner or two of the plot.
    corners = [(x0, y0), (x1, y0), (x0, y1), (x1, y1), (x0, y0 + 5), (x1, y0 + 5)]
    m.rnd.shuffle(corners)
    for cx, cy in corners[: m.rnd.randint(2, 3)]:
        if m.rnd.random() < 0.6:
            m.put(cx, cy, BAMBOO_TREE)
        else:
            m.prop("banana", cx, cy, 1, 1)
    m.claim(x0, y0, W, H)
    count = getattr(m, "home_count", 0)
    m.home_count = count + 1  # type: ignore[attr-defined]
    home_id = f"{prefix}{count}"
    m.obj("zone", x0 * T, y0 * T, W * T, H * T, {
        "zoneName": "Nhà trống" if vacant else "Nhà dân", "kind": "home", "homeId": home_id,
        "vacant": "1" if vacant else "0", "house": house, "gateX": str(hx + 2), "gateY": str(y1 + 1),
    })
    return True
