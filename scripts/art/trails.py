"""
Village trails (the player's request, 2026-11-20): from the village a simple
1-tile dirt path winds to every landmark of the map, going round houses,
fields and buildings, bridging streams. Later trails reuse earlier ones, so
together they make a little network of footpaths.
"""
from __future__ import annotations

import heapq

from .region import Province, _pave
from .tiles import PATH, PATH_EDGE, WATER

ROADS = {PATH} | set(range(PATH_EDGE, PATH_EDGE + 16))


def _nearest_path(m: Province, x: int, y: int) -> tuple[int, int]:
    for r in range(0, 40):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                xx, yy = x + dx, y + dy
                if 0 <= xx < m.w and 0 <= yy < m.h and m.ground[yy][xx] in ROADS:
                    return xx, yy
    return x, y


def _edge_point(rect: tuple[int, int, int, int], frm: tuple[int, int]) -> tuple[int, int]:
    """The point of the rectangle's outline (just outside it) nearest to `frm`."""
    x0, y0, x1, y1 = rect
    fx, fy = frm
    x = min(max(fx, x0), x1)
    y = min(max(fy, y0), y1)
    if x0 < fx < x1 and y0 < fy < y1:
        return fx, y1 + 1
    return (x0 - 1 if fx < x0 else x1 + 1 if fx > x1 else x), (y0 - 1 if fy < y0 else y1 + 1 if fy > y1 else y)


def _route(m: Province, a: tuple[int, int], goal: set[tuple[int, int]]) -> list[tuple[int, int]] | None:
    """Cheapest way over open land (existing paths cheaper, water dearer, buildings and fields barred)."""
    def cost(x: int, y: int) -> float | None:
        g = m.ground[y][x]
        if g in ROADS:
            return 0.4
        if (x, y) in m.taken:
            return None
        if g == WATER:
            return 6.0
        return 1.0 if m.decor[y][x] is None else 1.6
    best = {a: 0.0}
    came: dict[tuple[int, int], tuple[int, int]] = {}
    gx = sum(p[0] for p in goal) / len(goal)
    gy = sum(p[1] for p in goal) / len(goal)
    heap = [(0.0, a)]
    while heap:
        _, cur = heapq.heappop(heap)
        if cur in goal:
            path = [cur]
            while path[-1] in came:
                path.append(came[path[-1]])
            return path[::-1]
        x, y = cur
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if not (1 <= nx < m.w - 1 and 1 <= ny < m.h - 1):
                continue
            c = cost(nx, ny)
            if c is None and (nx, ny) not in goal:
                continue
            nd = best[cur] + (c or 1.0)
            if nd < best.get((nx, ny), 1e18):
                best[(nx, ny)] = nd
                came[(nx, ny)] = cur
                heapq.heappush(heap, (nd + 0.9 * (abs(nx - gx) + abs(ny - gy)), (nx, ny)))
    return None


def village_trails(m: Province, village: tuple[int, int, int, int], places: list[tuple[int, int, int, int]]) -> int:
    """Footpaths from the village to each place (landmark areas), nearest first. Returns how many were laid."""
    vx0, vy0, vx1, vy1 = village
    start = _nearest_path(m, (vx0 + vx1) // 2, (vy0 + vy1) // 2)
    order = sorted(places, key=lambda r: abs((r[0] + r[2]) / 2 - start[0]) + abs((r[1] + r[3]) / 2 - start[1]))
    laid = 0
    for rect in order:
        end = _edge_point(rect, start)
        goal = {(end[0] + dx, end[1] + dy) for dx in range(-1, 2) for dy in range(-1, 2)}
        path = _route(m, start, goal)
        if not path:
            continue
        for x, y in path:
            if (x, y) not in m.taken or m.ground[y][x] in ROADS:
                _pave(m, x, y, PATH)
        laid += 1
    return laid
