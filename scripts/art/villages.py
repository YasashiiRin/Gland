"""Villages and the deep forest (layout asked for by the player, 2026-11-18).

* Each province has one or two villages, far from the landmarks and towns and
  away from the deep forest: 10 homesteads (homesteads.py) in two rows, each
  row fronting its own crooked lane (houses face their road, 2026-11-19),
  footpaths to each yard gate, a village school and the village paddies. Besides them only a few lonely huts stand in the wilds.
* Outside the villages the country is wild: no roads (bridges remain).
* The deep forest (tall trees, thick) only grows along the edges of the map;
  the woods in the middle are open. (Later the player may chop a way through.)
"""
from __future__ import annotations

import numpy as np
from .homesteads import H as PLOT_H, W as PLOT_W, homestead
from .province_tiles import SAND, SAND2, BAMBOO_TREE, BRIDGE, DRY_GRASS, PADDY, PAVING, PINE_TREE, RICE, ROCKY
from .region import GRASSY, Province, _pave, place
from .tiles import BUSH, DIRT, FOREST, GRASS, GRASS3, PATH, TRUNK, WATER
from .shrink_paddies import ROOT, paddy_size
import json

NPC_CFG = json.loads((ROOT / "src/data/npcFarm.json").read_text())

T = 16
HOUSES = 10
VW, VH = 118, 64                     # the houses' area (tiles): homesteads scattered inside it
FIELD_W, FIELD_D = 32, 64            # a full paddy (household of three): 32 along the road, 64 deep
PER_SIDE, SEP, ROAD, CANAL = 5, 3, 3, 1
OPEN = GRASSY | {DRY_GRASS, ROCKY}
VILLAGE_LAND = OPEN | {SAND, SAND2}          # coastal villages stand on the sandy plain
VACANT = {2, 5, 8}                     # plots left empty for players (thatched houses)


# Small things a new village may clear away (they are not landmarks).
REMOVABLE = {"buffalo", "jar", "haystack", "well", "casuarina", "coconut", "banana", "bench", "basket_boat"}


def _prop_sprite(o: dict) -> str:
    return next((p["value"] for p in o.get("properties", []) if p["name"] == "sprite"), "")


def _covered(m: Province) -> set[tuple[int, int]]:
    out: set[tuple[int, int]] = set()
    for o in m.objects:
        if o.get("point") or o["name"] == "zone" or (o["name"] == "prop" and _prop_sprite(o) in REMOVABLE):
            continue
        x0, y0 = int(o["x"] // T), int(o["y"] // T)
        x1, y1 = int((o["x"] + max(o["width"], 1) - 1) // T), int((o["y"] + max(o["height"], 1) - 1) // T)
        out.update((x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1))
    return out


def _site_ok(m: Province, x0: int, y0: int, w: int, h: int, covered: set[tuple[int, int]],
             avoid: list[tuple[int, int, int, int]], edge: int, gap: int, tolerance: int = 12) -> bool:
    if x0 < edge or y0 < edge or x0 + w > m.w - edge or y0 + h > m.h - edge:
        return False
    if any(x0 - gap < ax1 and x0 + w + gap > ax0 and y0 - gap < ay1 and y0 + h + gap > ay0 for ax0, ay0, ax1, ay1 in avoid):
        return False
    bad = 0
    for y in range(y0, y0 + h, 2):
        for x in range(x0, x0 + w, 2):
            g = m.ground[y][x]
            if (x, y) in covered:
                return False                                         # buildings and props
            if not (g in VILLAGE_LAND or g in (PATH, DIRT, PADDY, PAVING)):
                bad += 1                                             # a pond, a stream...
                if bad > (w * h // 4) // tolerance:
                    return False
    return True


def _find_site(m: Province, near: tuple[int, int], w: int, h: int, avoid: list[tuple[int, int, int, int]],
               radius: int = 220, edge: int = 22, gap: int = 8, tolerance: int = 12) -> tuple[int, int] | None:
    covered = _covered(m)
    for r in range(0, radius, 4):
        for dy in range(-r, r + 1, 4):
            for dx in range(-r, r + 1, 4):
                if max(abs(dx), abs(dy)) == r and _site_ok(m, near[0] + dx, near[1] + dy, w, h, covered, avoid, edge, gap, tolerance):
                    return near[0] + dx, near[1] + dy
    return None


def _clear(m: Province, x0: int, y0: int, w: int, h: int) -> None:
    """Fresh land for the village and its fields (ponds and streams stay; small props go)."""
    def inside(o: dict) -> bool:
        return x0 * T <= o["x"] < (x0 + w) * T and y0 * T <= o["y"] < (y0 + h) * T
    for o in [o for o in m.objects if o["name"] == "prop" and _prop_sprite(o) in REMOVABLE and inside(o)]:
        m.objects.remove(o)
        ox, oy = int(o["x"] // T), int(o["y"] // T)
        for yy in range(oy, oy + max(1, int(o["height"] // T))):
            for xx in range(ox, ox + max(1, int(o["width"] // T))):
                if m.decor[yy][xx] is not None:
                    m.decor[yy][xx] = None
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            if m.ground[y][x] in VILLAGE_LAND or m.ground[y][x] in (PATH, DIRT, PADDY, PAVING):
                m.decor[y][x] = None
                m.ground[y][x] = GRASS
                m.taken.discard((x, y))


def _best_site(m: Province, avoid: list[tuple[int, int, int, int]]) -> tuple[float, int, int, int, int] | None:
    """Scans the whole map for the place where the village (houses above, fields below) fits
    best, at the largest field size that leaves at most 4% of it on water or rough ground.
    Returns (scale, x, y, width, height)."""
    covered = _covered(m)
    bad = np.zeros((m.h, m.w), dtype=np.int32)
    for y in range(m.h):
        for x in range(m.w):
            g = m.ground[y][x]
            if not (g in VILLAGE_LAND or g in (PATH, DIRT, PADDY, PAVING)) or (x, y) in covered:
                bad[y, x] = 1
    for ax0, ay0, ax1, ay1 in avoid:
        bad[max(0, ay0 - 8):ay1 + 9, max(0, ax0 - 8):ax1 + 9] = 1
    e = 22
    bad[:e, :] = 1
    bad[-e:, :] = 1
    bad[:, :e] = 1
    bad[:, -e:] = 1
    acc = np.pad(bad.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    def count(x: int, y: int, w: int, h: int) -> int:
        return int(acc[y + h, x + w] - acc[y, x + w] - acc[y + h, x] + acc[y, x])

    best = None
    for scale in (1.0, 0.85, 0.7, 0.6, 0.5):
        w, h = _size(scale)
        for y in range(0, m.h - h, 3):
            for x in range(0, m.w - w, 3):
                houses = count(x + (w - VW) // 2, y, VW, VH)        # the houses want dry land: weigh it heavily
                n = count(x, y, w, h) + 8 * houses
                if best is None or n < best[0]:
                    best = (n, scale, x, y, w, h)
        if best and best[0] <= w * h // 25:
            return best[1:]
    return best[1:] if best else None


def _size(scale: float) -> tuple[int, int]:
    fw, fd = round(FIELD_W * scale), round(FIELD_D * scale)
    bw = PER_SIDE * fw + (PER_SIDE - 1) * SEP + 2
    bh = 2 * fd + ROAD + 2 * CANAL
    return max(VW, bw), VH + 2 + bh


def village(m: Province, name: str, avoid: list[tuple[int, int, int, int]]) -> tuple[int, int, int, int] | None:
    """A village where the map has most room: 10 homesteads in two rows, each fronting its own
    lane, its school, and right below them the village fields - one paddy per household along a
    3-wide main road (fields_block). Returns its whole area, or None."""
    found = _best_site(m, avoid)
    if not found:
        print(f"  no room for the village {name}")
        return None
    scale, x0, y0, w, h = found
    fw, fd = round(FIELD_W * scale), round(FIELD_D * scale)
    bw = PER_SIDE * fw + (PER_SIDE - 1) * SEP + 2
    _clear(m, x0, y0, w, h)
    hx0 = x0 + (w - VW) // 2
    homes = _houses(m, hx0, y0)
    bx0 = x0 + (w - bw) // 2
    lane_x = bx0 + 2 * (fw + SEP) + fw + 1                           # the path between the 3rd and 4th paddies
    _school(m, hx0, y0, lane_x)
    fields_block(m, bx0, y0 + VH + 2, homes, fw, fd)
    road_y = y0 + VH + 2 + fd + CANAL
    for y in range(lanes(y0)[1], road_y):
        if m.ground[y][lane_x] != WATER:
            _pave(m, lane_x, y, PATH)
        else:
            m.ground[y][lane_x] = BRIDGE
    _clear_round(m, x0, y0, w, h, 7)
    m.obj("village", hx0 * T, y0 * T, VW * T, VH * T, {"villageName": name})
    m.obj("fields", bx0 * T, (y0 + VH + 2) * T, bw * T, (h - VH - 2) * T, {"villageName": name})
    print(f"  village {name} at {(x0, y0)} ({w}x{h}, paddies {fw}x{fd}): {len(homes)} households")
    return (x0, y0, x0 + w - 1, y0 + h - 1)


def lanes(y0: int) -> tuple[int, int]:
    """The two village lanes: each row of homesteads stands just north of one, fronting it."""
    return y0 + 24, y0 + 52


def _houses(m: Province, x0: int, y0: int) -> list[tuple[str, int]]:
    """Two rows of homesteads, each along the north side of its own crooked lane so that every
    house and yard gate fronts a lane (houses face their road); returns (homeId, members) of each
    lived-in one. The lanes are joined at both ends."""
    for lane in lanes(y0):
        for x in range(x0 + 2, x0 + VW - 2):
            bend = 1 if (x // 9) % 2 else 0
            _pave(m, x, lane + bend, PATH)
            if x % 9 == 0:
                _pave(m, x, lane + 1 - bend, PATH)
    top, low = lanes(y0)
    for x in (x0 + 2, x0 + VW - 3):                                  # the lanes joined at both ends
        for y in range(top, low + 2):
            _pave(m, x, y, PATH)
    plots: list[tuple[int, int]] = []
    before = getattr(m, "home_count", 0)
    for lane in lanes(y0):
        x = x0 + 4 + m.rnd.randint(0, 2)
        while x + PLOT_W < x0 + VW - 3 and len(plots) < HOUSES:
            py = lane - PLOT_H - 1 - m.rnd.randint(0, 3)
            sprite = ("house_a", "house_c", "thatched_house", "house_b", "house_c")[len(plots) % 5]
            if homestead(m, x, py, sprite, len(plots) in VACANT, m.home_prefix):
                plots.append((x, py))
                gx = x + 9                                           # footpath from the yard gate to the lane
                for y in range(py + PLOT_H, lane + 1):
                    _pave(m, gx, y, PATH)
                x += PLOT_W + 1 + m.rnd.randint(1, 3)
            else:
                x += 2
    homes = []
    for o in m.objects:                                              # the households just built
        props = {p["name"]: p["value"] for p in o.get("properties", [])}
        if o["name"] == "zone" and props.get("kind") == "home" and props.get("vacant") == "0":
            n = int(props["homeId"][len(m.home_prefix):])
            if n >= before:
                homes.append((props["homeId"], int(props.get("members", "1"))))
    return homes


def fields_block(m: Province, x0: int, y0: int, homes: list[tuple[str, int]], fw: int, fd: int) -> None:
    """The village fields: a 3-wide main road with a small canal along each side, and the paddies
    on both sides of it, one per household, sized by how many work it (1 person: two thirds).
    Between neighbouring paddies a 1-wide dirt path with a grass strip either side; a plank
    bridge crosses the canal into each paddy. Each paddy is a "field" object owned by its house."""
    road_y = y0 + fd + CANAL
    width = PER_SIDE * fw + (PER_SIDE - 1) * SEP + 2
    for x in range(x0, x0 + width):
        for d in range(ROAD):
            _pave(m, x, road_y + d, PATH)
        m.ground[road_y - 1][x] = WATER                              # canals along the road
        m.ground[road_y + ROAD][x] = WATER
    # Each paddy is just the family's plots (src/data/npcFarm.json, see shrink_paddies.py),
    # centred in its column and touching the canal; the paths between are as deep as the deepest.
    sizes = [paddy_size(members, NPC_CFG) for _, members in homes[: 2 * PER_SIDE]]
    path_d = min(fd, max((d for _, d in sizes), default=fd))
    for i, (home_id, members) in enumerate(homes[: 2 * PER_SIDE]):
        side, col = i % 2, i // 2
        w, d = (min(v, lim) for v, lim in zip(sizes[i], (fw, fd)))
        fx = x0 + 1 + col * (fw + SEP) + (fw - w) // 2
        fy = road_y - 1 - d if side == 0 else road_y + ROAD + 1
        for y in range(fy, fy + d):
            for x in range(fx, fx + w):
                if m.ground[y][x] != WATER:                          # a stream through it stays
                    m.ground[y][x] = GRASS                           # plain ground: nobody has hoed it yet
                m.taken.add((x, y))
        bx = fx + w // 2
        m.ground[road_y - 1 if side == 0 else road_y + ROAD][bx] = BRIDGE   # plank over the canal
        m.obj("field", fx * T, fy * T, w * T, d * T, {"homeId": home_id, "side": "north" if side == 0 else "south",
                                                       "bridgeX": str(bx)})
        if col < PER_SIDE - 1:                                       # the path to the next paddy, grass either side
            px = x0 + 1 + col * (fw + SEP) + fw + 1
            ys = range(road_y - 1 - path_d, road_y - 1) if side == 0 else range(road_y + ROAD + 1, road_y + ROAD + 1 + path_d)
            for y in ys:
                m.ground[y][px - 1] = GRASS
                _pave(m, px, y, PATH)
                m.ground[y][px + 1] = GRASS


def _school(m: Province, x0: int, y0: int, lane_x: int) -> None:
    """The village school (trường làng), fronting a lane where there is room (or just below the lower one)."""
    for _ in range(300):
        x = m.rnd.randint(x0 + 4, x0 + VW - 13)
        lane = m.rnd.choice(lanes(y0))
        if place(m, "school", x, lane - 4, 9, 3, solid_from=0, facing="down"):
            return
    for _ in range(300):
        x = m.rnd.randint(x0 + 4, x0 + VW - 13)
        if not x - 1 <= lane_x <= x + 9 and place(m, "school", x, lanes(y0)[1] + 3, 9, 3, solid_from=0, facing="up"):
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


def _clear_round(m: Province, x0: int, y0: int, w: int, h: int, margin: int) -> None:
    """Open ground all round the village: it stands apart from the woods."""
    for y in range(max(0, y0 - margin), min(m.h, y0 + h + margin)):
        for x in range(max(0, x0 - margin), min(m.w, x0 + w + margin)):
            if m.decor[y][x] in TREE_TILES and (x, y) not in m.taken:
                m.decor[y][x] = None


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
