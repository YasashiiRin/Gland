"""Prebuilt fields and ponds of the special landmark zones (big world, phase 2b).

Inside a zone nothing can be tilled or built, so each zone gets what the game
lets players use there instead:

* a rice field (paddy with dikes, ripe rice on it): anyone may reap it; a
  reaped tile can be sown straight away; it is ripe rice again next season,
* a fish pond ("fish_pond" object): players stock it with fingerlings and net
  them out once grown.

Spots are searched near a preferred point, inside the zone, on open grass
that no prop or other object covers.
"""
from __future__ import annotations

from .province_tiles import DRY_GRASS, PADDY, PALM_TREE, PAVING, RICE, ROCKY, SAND
from .region import GRASSY, Province, ellipse
from .tiles import BUSH, DIRT, WATER
from .water_tiles import FLOWERBED

T = 16
Area = tuple[int, int, int, int]


def _covered(m: Province) -> set[tuple[int, int]]:
    """Tiles under any object other than the zones themselves."""
    out: set[tuple[int, int]] = set()
    for o in m.objects:
        if o["name"] == "zone" or o.get("point"):
            continue
        x0, y0 = int(o["x"] // T), int(o["y"] // T)
        x1, y1 = int((o["x"] + max(o["width"], 1) - 1) // T), int((o["y"] + max(o["height"], 1) - 1) // T)
        out.update((x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1))
    return out


# Open ground a pond or field may replace, and the small decor cleared away for it.
LAND = GRASSY | {ROCKY, DRY_GRASS, SAND}            # not roads, paths or paving
CLEARABLE = {None, PALM_TREE, FLOWERBED, BUSH}


def _open(m: Province, covered: set[tuple[int, int]], x0: int, y0: int, w: int, h: int) -> bool:
    return all(0 <= x < m.w and 0 <= y < m.h and (x, y) not in covered and m.decor[y][x] in CLEARABLE
               and m.ground[y][x] in LAND
               for y in range(y0 - 1, y0 + h + 1) for x in range(x0 - 1, x0 + w + 1)) \
        and all(y >= m.h or m.decor[y][x] in CLEARABLE                   # no tree or house just below
                for y in range(y0 + h + 1, y0 + h + 4) for x in range(x0 - 1, x0 + w + 1))


def _spot(m: Province, area: Area, near: tuple[int, int], w: int, h: int) -> tuple[int, int] | None:
    ax0, ay0, ax1, ay1 = area
    covered = _covered(m)
    best: tuple[int, tuple[int, int]] | None = None
    for y in range(ay0 + 1, ay1 - h):
        for x in range(ax0 + 1, ax1 - w):
            d = abs(x - near[0]) + abs(y - near[1])
            if (best is None or d < best[0]) and _open(m, covered, x, y, w, h):
                best = (d, (x, y))
    return best[1] if best else None


def pond(m: Province, name: str, area: Area, near: tuple[int, int], w: int = 8, h: int = 5) -> bool:
    at = _spot(m, area, near, w, h)
    if not at:
        print(f"  no room for the pond of {name}")
        return False
    x, y = at
    ellipse(m, x + (w - 1) / 2, y + (h - 1) / 2, w / 2, h / 2, WATER, wobble=0.05)
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            m.put(xx, yy, None)
    m.claim(x - 1, y - 1, w + 2, h + 2)
    m.obj("fish_pond", x * T, y * T, w * T, h * T, {"pondName": f"Ao cá {name}"})
    print(f"  pond of {name} at {at}")
    return True


def paddy(m: Province, name: str, area: Area, near: tuple[int, int], w: int = 10, h: int = 6) -> bool:
    at = _spot(m, area, near, w, h)
    if not at:
        print(f"  no room for the rice field of {name}")
        return False
    x, y = at
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            dike = xx in (x, x + w - 1) or yy in (y, y + h - 1)
            m.ground[yy][xx] = DIRT if dike else PADDY
            m.put(xx, yy, None if dike else RICE)
    m.claim(x, y, w, h)
    print(f"  rice field of {name} at {at}")
    return True


def landmark_fields(m: Province, plans: list[tuple[str, Area, tuple[int, int] | None, tuple[int, int] | None]]) -> None:
    """For each zone: (name, area, where to put a pond or None, where to put a rice field or None)."""
    for name, area, pond_near, paddy_near in plans:
        if pond_near:
            pond(m, name, area, pond_near)
        if paddy_near:
            paddy(m, name, area, paddy_near)
