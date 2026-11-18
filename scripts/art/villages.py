"""Villages and the deep forest (layout asked for by the player, 2026-11-18).

* Each province has one or two villages, far from the landmarks and towns and
  away from the deep forest: 10 homesteads (homesteads.py) scattered either
  side of a crooked lane, footpaths to each yard, a village school and the
  village paddies. Besides them only a few lonely huts stand in the wilds.
* Outside the villages the country is wild: no roads (bridges remain).
* The deep forest (tall trees, thick) only grows along the edges of the map;
  the woods in the middle are open. (Later the player may chop a way through.)
"""
from __future__ import annotations

from .homesteads import H as PLOT_H, W as PLOT_W, homestead
from .province_tiles import SAND, SAND2, BAMBOO_TREE, BRIDGE, DRY_GRASS, PADDY, PAVING, PINE_TREE, RICE, ROCKY
from .region import GRASSY, Province, _pave, place
from .tiles import BUSH, DIRT, FOREST, GRASS, PATH, TRUNK, WATER

T = 16
HOUSES = 10
VW, VH = 70, 44                      # the village's area (tiles); houses are scattered inside it
OPEN = GRASSY | {DRY_GRASS, ROCKY}
VILLAGE_LAND = OPEN | {SAND, SAND2}          # coastal villages stand on the sandy plain
VACANT = {2, 5, 8}                     # plots left empty for players (thatched houses)


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
    bad = 0
    for y in range(y0, y0 + VH):
        for x in range(x0, x0 + VW):
            g = m.ground[y][x]
            if (x, y) in covered:
                return False                                         # buildings and props
            if not (g in VILLAGE_LAND or g in (PATH, DIRT)) or ((x, y) in m.taken and g not in (PATH, DIRT)):
                bad += 1                                             # a pond, a corner of a field...
                if bad > VW * VH // 25:
                    return False
    return True


def village(m: Province, name: str, near: tuple[int, int], avoid: list[tuple[int, int, int, int]],
            radius: int = 170, edge: int = 36, gap: int = 16) -> tuple[int, int, int, int] | None:
    """A village of 10 homesteads scattered over open land near `near` (not in rows: each one
    set down where it falls, with footpaths to a lane through the middle), its school and its
    paddies. Returns the village's area, or None if there is no room."""
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
        return None
    x0, y0 = site
    for y in range(y0, y0 + VH):                                     # clear the land (ponds and fields stay)
        for x in range(x0, x0 + VW):
            if m.ground[y][x] in VILLAGE_LAND or m.ground[y][x] in (PATH, DIRT):
                m.decor[y][x] = None
                m.ground[y][x] = GRASS
                m.taken.discard((x, y))
    mid = y0 + VH // 2
    for x in range(x0 + 2, x0 + VW - 2):                             # the village lane, a little crooked
        bend = 1 if (x // 9) % 2 else 0
        _pave(m, x, mid + bend, PATH)
        if x % 9 == 0:
            _pave(m, x, mid + 1 - bend, PATH)                       # where it bends, both rows: no gap
    plots: list[tuple[int, int]] = []
    for _ in range(4000):                                            # houses scattered either side of the lane
        if len(plots) >= HOUSES:
            break
        px = m.rnd.randint(x0 + 1, x0 + VW - PLOT_W - 1)
        py = m.rnd.choice([m.rnd.randint(y0 + 1, mid - PLOT_H - 2), m.rnd.randint(mid + 3, y0 + VH - PLOT_H - 1)])
        if any(abs(px - qx) < PLOT_W + 1 and abs(py - qy) < PLOT_H + 1 for qx, qy in plots):
            continue
        sprite = ("house_a", "house_c", "thatched_house", "house_b", "house_c")[len(plots) % 5]
        if homestead(m, px, py, sprite, len(plots) in VACANT, m.home_prefix):
            plots.append((px, py))
            gx, gy = px + 5, py + PLOT_H                             # footpath from the yard to the lane
            for y in range(min(gy, mid), max(gy, mid) + 1):
                if (gx, y) not in m.taken or m.ground[y][gx] == PATH:
                    _pave(m, gx, y, PATH)
    for py in range(y0 + 1, y0 + VH - PLOT_H):                       # any room left: fill it, still off the grid
        for px in range(x0 + 1, x0 + VW - PLOT_W, 2):
            if len(plots) >= HOUSES or mid - PLOT_H - 1 < py < mid + 3:
                continue
            if any(abs(px - qx) < PLOT_W + 1 and abs(py - qy) < PLOT_H + 1 for qx, qy in plots):
                continue
            if homestead(m, px, py, "house_c", len(plots) in VACANT, m.home_prefix):
                plots.append((px, py))
                for y in range(min(py + PLOT_H, mid), max(py + PLOT_H, mid) + 1):
                    if (px + 5, y) not in m.taken or m.ground[y][px + 5] == PATH:
                        _pave(m, px + 5, y, PATH)
    _school(m, x0, y0, mid)
    _clear_round(m, x0, y0, 7)
    _fields(m, x0, y0)
    m.obj("village", x0 * T, y0 * T, VW * T, VH * T, {"villageName": name})
    print(f"  village {name} at {site}: {len(plots)} homesteads")
    return (x0, y0, x0 + VW - 1, y0 + VH - 1)


def _school(m: Province, x0: int, y0: int, mid: int) -> None:
    """The village school (trường làng), on the lane where there is room."""
    for _ in range(200):
        x = m.rnd.randint(x0 + 1, x0 + VW - 10)
        y = m.rnd.choice([mid - 4, mid + 3])
        if place(m, "school", x, y, 9, 3, solid_from=0):
            return


def lone_houses(m: Province, count: int, avoid: list[tuple[int, int, int, int]], edge: int = 45) -> None:
    """A few lonely thatched huts out in the wilds, far from everything (someone lives there)."""
    placed = 0
    for _ in range(4000):
        if placed >= count:
            return
        x, y = m.rnd.randint(edge, m.w - edge - PLOT_W), m.rnd.randint(edge, m.h - edge - PLOT_H)
        if any(x - 25 < ax1 and x + PLOT_W + 25 > ax0 and y - 25 < ay1 and y + PLOT_H + 25 > ay0 for ax0, ay0, ax1, ay1 in avoid):
            continue
        if not all(m.ground[yy][xx] in OPEN and (xx, yy) not in m.taken for yy in range(y, y + PLOT_H) for xx in range(x, x + PLOT_W)):
            continue
        for yy in range(y, y + PLOT_H):
            for xx in range(x, x + PLOT_W):
                m.decor[yy][xx] = None
        if homestead(m, x, y, "thatched_house", False, m.home_prefix):
            avoid.append((x, y, x + PLOT_W, y + PLOT_H))
            placed += 1


def strip_roads(m: Province, keep: list[tuple[int, int, int, int]], landmarks: list[tuple[int, int, int, int]]) -> None:
    """Wild country: no roads outside the villages. Dirt roads go back to grass everywhere else;
    old stone paving survives only inside the landmarks; bridges stay so rivers can be crossed."""
    inside = lambda x, y, rects: any(x0 <= x <= x1 and y0 <= y <= y1 for x0, y0, x1, y1 in rects)  # noqa: E731
    for y in range(m.h):
        for x in range(m.w):
            g = m.ground[y][x]
            if g == PATH and not inside(x, y, keep):
                m.ground[y][x] = GRASS
            elif g == PAVING and not inside(x, y, landmarks):
                m.ground[y][x] = GRASS


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
