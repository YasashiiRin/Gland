"""Villages and the deep forest (layout asked for by the player, 2026-11-18).

* Each province has one or two villages, far from the landmarks and towns and
  away from the deep forest: a compact block of 10 walled homesteads (2 rows of
  5, homesteads.py) on a grid of lanes, linked by a trail to the nearest road.
  Houses no longer stand scattered over the countryside.
* The deep forest (tall trees, thick) only grows along the edges of the map;
  the woods in the middle are open. (Later the player may chop a way through.)
"""
from __future__ import annotations

from .biome import trail
from .homesteads import H as PLOT_H, W as PLOT_W, homestead
from .province_tiles import BAMBOO_TREE, BRIDGE, DRY_GRASS, PADDY, PAVING, PINE_TREE, RICE, ROCKY
from .region import GRASSY, Province, _pave
from .tiles import BUSH, DIRT, FOREST, GRASS, PATH, TRUNK, WATER

T = 16
COLS, ROWS, LANE = 5, 2, 2
VW = LANE + COLS * (PLOT_W + LANE)
VH = LANE + ROWS * (PLOT_H + LANE)
OPEN = GRASSY | {DRY_GRASS, ROCKY}
VACANT = {1, 4, 7}                     # plots left empty for players (thatched houses)


def _covered(m: Province) -> set[tuple[int, int]]:
    out: set[tuple[int, int]] = set()
    for o in m.objects:
        if o.get("point") or o["name"] == "zone":
            continue
        x0, y0 = int(o["x"] // T), int(o["y"] // T)
        x1, y1 = int((o["x"] + max(o["width"], 1) - 1) // T), int((o["y"] + max(o["height"], 1) - 1) // T)
        out.update((x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1))
    return out


def _site_ok(m: Province, x0: int, y0: int, covered: set[tuple[int, int]], avoid: list[tuple[int, int, int, int]],
             edge: int, gap: int) -> bool:
    if x0 < edge or y0 < edge or x0 + VW > m.w - edge or y0 + VH > m.h - edge:
        return False
    if any(x0 - gap < ax1 and x0 + VW + gap > ax0 and y0 - gap < ay1 and y0 + VH + gap > ay0 for ax0, ay0, ax1, ay1 in avoid):
        return False
    for y in range(y0, y0 + VH):
        for x in range(x0, x0 + VW):
            g = m.ground[y][x]
            if (x, y) in covered or not (g in OPEN or g in (PATH, DIRT)):
                return False                                         # water, fields, buildings
            if (x, y) in m.taken and g not in (PATH, DIRT):
                return False
    return True


def village(m: Province, name: str, near: tuple[int, int], avoid: list[tuple[int, int, int, int]],
            radius: int = 130, edge: int = 40, gap: int = 16) -> bool:
    """Lays out a village of 10 homesteads on open land as close to `near` as it can, `gap` tiles clear of `avoid`."""
    covered = _covered(m)
    site = None
    for r in range(0, radius, 3):
        for dy in range(-r, r + 1, 3):
            for dx in range(-r, r + 1, 3):
                if max(abs(dx), abs(dy)) == r and _site_ok(m, near[0] + dx, near[1] + dy, covered, avoid, edge, gap):
                    site = (near[0] + dx, near[1] + dy)
                    break
            if site:
                break
        if site:
            break
    if not site:
        print(f"  no room for the village {name}")
        return False
    x0, y0 = site
    for y in range(y0, y0 + VH):                                     # clear the land
        for x in range(x0, x0 + VW):
            m.decor[y][x] = None
            m.ground[y][x] = GRASS
            m.taken.discard((x, y))                                  # roads crossing it join the lanes
    for r in range(ROWS + 1):                                        # lanes between the rows of plots
        for x in range(x0, x0 + VW):
            for d in range(LANE):
                _pave(m, x, y0 + r * (PLOT_H + LANE) + d, PATH)
    for c in range(COLS + 1):
        for y in range(y0, y0 + VH):
            for d in range(LANE):
                _pave(m, x0 + c * (PLOT_W + LANE) + d, y, PATH)
    n = 0
    for r in range(ROWS):
        for c in range(COLS):
            px, py = x0 + LANE + c * (PLOT_W + LANE), y0 + LANE + r * (PLOT_H + LANE)
            sprite = ("house_a", "house_c", "house_b", "thatched_house")[(r * COLS + c) % 4]
            if homestead(m, px, py, sprite, n in VACANT, m.home_prefix):
                n += 1
    _clear_round(m, x0, y0, 7)
    _fields(m, x0, y0)
    _link(m, (x0 + VW // 2, y0 + VH - 1), (x0, y0, x0 + VW, y0 + VH))
    m.obj("village", x0 * T, y0 * T, VW * T, VH * T, {"villageName": name})
    print(f"  village {name} at {site}: {n} homesteads")
    return True


TREE_TILES = {FOREST, TRUNK, PINE_TREE, BAMBOO_TREE, BUSH}


def _clear_round(m: Province, x0: int, y0: int, margin: int) -> None:
    """Open ground all round the village: it stands apart from the woods."""
    for y in range(max(0, y0 - margin), min(m.h, y0 + VH + margin)):
        for x in range(max(0, x0 - margin), min(m.w, x0 + VW + margin)):
            if m.decor[y][x] in TREE_TILES and (x, y) not in m.taken:
                m.decor[y][x] = None


def _fields(m: Province, x0: int, y0: int, rows: int = 12) -> None:
    """The village's own paddies, just below it (else above): where its farmers hoe every morning."""
    covered = _covered(m)
    for fy in (y0 + VH + 1, y0 - rows - 1):
        if fy < 2 or fy + rows > m.h - 2:
            continue
        cells = [(x, y) for y in range(fy, fy + rows) for x in range(x0, x0 + VW)]
        if sum((x, y) in m.taken or (x, y) in covered or m.ground[y][x] not in OPEN for x, y in cells) > len(cells) // 6:
            continue
        for x, y in cells:
            if (x, y) in m.taken or (x, y) in covered or m.ground[y][x] not in OPEN:
                continue
            dike = (x - x0) % 10 == 9 or (y - fy) % 7 == 6
            m.ground[y][x] = DIRT if dike else PADDY
            m.decor[y][x] = None if dike else RICE
            m.taken.add((x, y))
        return


def _link(m: Province, start: tuple[int, int], box: tuple[int, int, int, int]) -> None:
    """A trail from the village to the nearest road outside it."""
    bx0, by0, bx1, by1 = box
    best, best_d = None, 10 ** 9
    for y in range(max(0, start[1] - 120), min(m.h, start[1] + 120), 2):
        for x in range(max(0, start[0] - 120), min(m.w, start[0] + 120), 2):
            if bx0 <= x < bx1 and by0 <= y < by1:
                continue
            if m.ground[y][x] in (PATH, PAVING, BRIDGE):
                d = abs(x - start[0]) + abs(y - start[1])
                if d < best_d:
                    best, best_d = (x, y), d
    if best:
        trail(m, start, best)


def deep_forest(m: Province, depth: int = 34) -> None:
    """Thick tall forest along the land edges of the map, thinning out inwards; roads stay open."""
    for y in range(m.h):
        for x in range(m.w):
            ring = min(x, y, m.w - 1 - x, m.h - 1 - y)
            if ring >= depth or (x, y) in m.taken or m.decor[y][x] is not None or m.ground[y][x] not in OPEN:
                continue
            density = 0.75 - 0.6 * ring / depth
            if m.rnd.random() < density:
                m.put(x, y, FOREST)


__all__ = ["village", "deep_forest", "WATER"]
