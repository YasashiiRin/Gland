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
from .tiles import BUSH, DIRT, FOREST, WATER
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


WALKABLE = LAND | {DIRT, PAVING}
BELT_GROUND = GRASSY | {ROCKY, DRY_GRASS}


def _zone_rects(m: Province) -> list[Area]:
    return [(int(o["x"] // T), int(o["y"] // T), int((o["x"] + o["width"]) // T) - 1, int((o["y"] + o["height"]) // T) - 1)
            for o in m.objects if o["name"] == "zone"]


def _in_any(rects: list[Area], x: int, y: int, margin: int = 0) -> bool:
    return any(x0 - margin <= x <= x1 + margin and y0 - margin <= y <= y1 + margin for x0, y0, x1, y1 in rects)


def zone_belts(m: Province, depth: int = 3, gate: int = 2) -> None:
    """A belt of dense forest just outside every safe zone, so each landmark or
    town sits in its own clearing. Roads, rivers, fields and buildings break
    the belt where they cross it (only open grass is planted), and every side
    keeps a gate in its middle so no zone is ever sealed off."""
    rects = _zone_rects(m)
    covered = _covered(m)
    for x0, y0, x1, y1 in rects:
        mx, my = (x0 + x1) // 2, (y0 + y1) // 2
        for y in range(y0 - depth, y1 + depth + 1):
            for x in range(x0 - depth, x1 + depth + 1):
                if not (0 < x < m.w - 1 and 0 < y < m.h - 1) or _in_any(rects, x, y):
                    continue
                if abs(x - mx) <= gate or abs(y - my) <= gate:                  # gates in the middle of each side
                    continue
                if (x, y) in covered or m.decor[y][x] is not None or m.ground[y][x] not in BELT_GROUND:
                    continue
                ring = max(x0 - x, x - x1, y0 - y, y - y1)                       # 1 = right next to the zone
                if ring == depth and m.rnd.random() < 0.35:
                    continue                                                    # a ragged outer edge
                m.put(x, y, FOREST)
                m.taken.add((x, y))


def start_points(m: Province, prefix: str, nears: list[tuple[int, int]]) -> list[str]:
    """New-game start spots ("spawn_start_<prefix>_<i>"), outside every safe zone and its belt."""
    rects = _zone_rects(m)
    covered = _covered(m)
    names = []
    for i, near in enumerate(nears):
        at = _walkable_near(m, covered, rects, near)
        if at:
            names.append(f"start_{prefix}_{i}")
            m.spawn(names[-1], *at)
            print(f"  start point {names[-1]} at {at}")
    return names


def _walkable_near(m: Province, covered: set[tuple[int, int]], rects: list[Area], near: tuple[int, int],
                   radius: int = 20) -> tuple[int, int] | None:
    for r in range(radius + 1):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                x, y = near[0] + dx, near[1] + dy
                if max(abs(dx), abs(dy)) != r or not (2 <= x < m.w - 2 and 2 <= y < m.h - 2) or _in_any(rects, x, y, 6):
                    continue
                if all(m.decor[yy][xx] is None and m.ground[yy][xx] in WALKABLE and (xx, yy) not in covered
                       for yy in (y - 1, y, y + 1) for xx in (x - 1, x, x + 1)):
                    return x, y
    return None
