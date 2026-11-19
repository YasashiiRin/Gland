"""Lays the village paddies out tidily around the families' plots (asked for by the
player, 2026-11-19), on the maps villages.py built, without rebuilding them.

On each side of the main road the paddies are packed side by side against the
canal, a 1-tile dirt path between neighbours and at both ends; each paddy has a
dirt path along its top, and inside it a dirt path between its plots that runs
into the side paths, so every path end meets another path and no strips of
spare ground are left between the fields. Each paddy is just big enough for its
family's plots (src/data/npcFarm.json), the family type (and so how many plots)
worked out exactly as the game does (systems/npc/families.ts: FNV-1a hash of
the home key, then seededRandom). The lanes coming down from the village run on
until they meet one of these paths. Plank bridges move to the middle of their
paddy; a lane that reaches the canal gets one over it to the road, and a
bridge that no longer leads anywhere becomes canal again.

maps.py runs this after building the maps; to redo it by hand on freshly built maps:
    python3 -m scripts.art.shrink_paddies     (from the repository root)
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAPS = {"quang_binh": "QuangBinh", "hue": "Hue"}      # file -> map key (home keys are "<map key>:<homeId>")
T = 16
GRASS = 1
PATH = 4                      # gid of a plain path tile
PATH_EDGE = 41                # gids 41..56: path variants, 41 + mask (1 north, 2 east, 4 south, 8 west open)
DIRT = 58
BRIDGE = 70
WATER = 5
WATER_EDGE = 25               # gids 25..40: water bank variants, 25 + mask
DEEP = 89
ROAD, CANAL = 3, 1
U32 = 0xFFFFFFFF


# ---------------------------------------------------------------- the game's family dice (families.ts, clock.ts)
def _imul(a: int, b: int) -> int:
    return (a * b) & U32


def hash_string(s: str) -> int:
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = _imul(h, 0x01000193)
    return h


def seeded_random(seed: int, *parts: int) -> float:
    h = seed & U32
    for p in parts:
        h = _imul(h ^ (p & U32), 0x9E3779B1)
        h ^= h >> 15
    t = (h + 0x6D2B79F5) & U32
    t = _imul(t ^ (t >> 15), t | 1)
    t = (t ^ ((t + _imul(t ^ (t >> 7), t | 61)) & U32)) & U32
    return ((t ^ (t >> 14)) & U32) / 4294967296


def family_type(home_key: str, members: int, cfg: dict) -> str:
    if members <= 1:
        return "1"
    return "2" if seeded_random(hash_string(home_key), 1) < cfg["families"]["twoPersonShare"] else "3"


# ---------------------------------------------------------------- sizes
def paddy_size(family: str, cfg: dict) -> tuple[int, int]:
    """(width, depth) in tiles of the paddy of a family type ("1", "2" or "3")."""
    f = cfg["field"]
    w, h = f["plotTilesByFamilyType"][family]
    n = f["plotsByFamilyType"][family]
    return w, n * h + (n - 1) * f["plotGapTiles"]


def gap_paths(family: str, cfg: dict) -> list[int]:
    """Rows (counted from the road side of the paddy) of the dirt path in each gap between plots."""
    f = cfg["field"]
    h = f["plotTilesByFamilyType"][family][1]
    gap = f["plotGapTiles"]
    if gap < 1:
        return []
    return [k * (h + gap) + h + gap // 2 for k in range(f["plotsByFamilyType"][family] - 1)]


def is_path(gid: int) -> bool:
    return gid == PATH or PATH_EDGE <= gid < PATH_EDGE + 16


def props(o: dict) -> dict:
    return {p["name"]: p["value"] for p in o.get("properties", [])}


def set_prop(o: dict, name: str, value: str) -> None:
    for p in o["properties"]:
        if p["name"] == name:
            p["value"] = value


class Ground:
    def __init__(self, data: list[int], width: int):
        self.d, self.w = data, width

    def __getitem__(self, xy: tuple[int, int]) -> int:
        return self.d[xy[1] * self.w + xy[0]]

    def __setitem__(self, xy: tuple[int, int], gid: int) -> None:
        self.d[xy[1] * self.w + xy[0]] = gid

    def autotile_paths(self, x0: int, y0: int, x1: int, y1: int) -> None:
        """Path edge variants (as maps.py autotile) for the paths in this rectangle."""
        def pathy(x: int, y: int) -> bool:
            return not (0 <= x < self.w) or is_path(self[x, y]) or self[x, y] == DIRT
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if not is_path(self[x, y]):
                    continue
                mask = (not pathy(x, y - 1)) * 1 | (not pathy(x + 1, y)) * 2 | (not pathy(x, y + 1)) * 4 | (not pathy(x - 1, y)) * 8
                self[x, y] = PATH if mask == 0 else PATH_EDGE + mask


def is_water(gid: int) -> bool:
    return gid in (WATER, DEEP) or WATER_EDGE <= gid < WATER_EDGE + 16


def autotile_canal(g: "Ground", y: int, x0: int, x1: int) -> None:
    """Bank variants of a 1-tall canal row after its bridges moved."""
    for x in range(x0, x1 + 1):
        if not is_water(g[x, y]):
            continue
        mask = (not is_water(g[x, y - 1])) * 1 | (not is_water(g[x + 1, y])) * 2 | (not is_water(g[x, y + 1])) * 4 | (not is_water(g[x - 1, y])) * 8
        g[x, y] = WATER if mask == 0 else WATER_EDGE + mask


def lay_out(name: str, map_key: str, cfg: dict) -> None:
    path = ROOT / "public/assets/maps" / f"{name}.tmj"
    m = json.loads(path.read_text())
    g = Ground(next(l for l in m["layers"] if l["name"] == "ground")["data"], m["width"])
    objs = next(l for l in m["layers"] if l["name"] == "objects")["objects"]
    members = {props(o)["homeId"]: int(props(o).get("members", "1")) for o in objs if o["name"] == "zone" and props(o).get("kind") == "home"}
    for block in (o for o in objs if o["name"] == "fields"):
        bx0, by0 = int(block["x"] // T), int(block["y"] // T)
        bx1, by1 = bx0 + int(block["width"] // T) - 1, by0 + int(block["height"] // T) - 1
        fields = [o for o in objs if o["name"] == "field" and bx0 * T <= o["x"] < (bx1 + 1) * T and by0 * T <= o["y"] < (by1 + 1) * T]
        north = [o for o in fields if props(o)["side"] == "north"]
        if not north:
            continue
        canal_n = int((north[0]["y"] + north[0]["height"]) // T)        # the canal north of the road
        canal_s = canal_n + CANAL + ROAD                                 # and south of it
        lanes = [x for x in range(bx0, bx1 + 1) if is_path(g[x, by0 - 1])]
        old_bridges = {x for x in range(bx0, bx1 + 1) for y in (canal_n, canal_s) if g[x, y] == BRIDGE}
        # 1. a clean slate: the old paths and bridges of the fields go
        for y in list(range(by0, canal_n)) + list(range(canal_s + 1, by1 + 1)):
            for x in range(bx0, bx1 + 1):
                if is_path(g[x, y]):
                    g[x, y] = GRASS
        for x in old_bridges:
            for y in (canal_n, canal_s):
                if g[x, y] == BRIDGE:
                    g[x, y] = WATER
        # 2. each side: paddies packed against the canal, paths between, along their tops and between plots
        start = min(int(o["x"] // T) for o in fields) - 1               # where the first old paddy began
        bridges: set[int] = set()
        for side, row in (("north", north), ("south", [o for o in fields if props(o)["side"] == "south"])):
            row.sort(key=lambda o: o["x"])
            toward = -1 if side == "north" else 1                        # rows go away from the road this way
            edge = canal_n - 1 if side == "north" else canal_s + 1       # the row next to the canal
            x = start
            depths: list[int] = []
            for o in row:
                p = props(o)
                family = family_type(f"{map_key}:{p['homeId']}", members.get(p["homeId"], 1), cfg)
                w, h = paddy_size(family, cfg)
                px = x + 1
                rows = [edge + toward * r for r in range(h)]
                o["x"], o["y"], o["width"], o["height"] = px * T, min(rows) * T, w * T, h * T
                bx = px + w // 2
                set_prop(o, "bridgeX", str(bx))
                bridges.add(bx)
                g[bx, canal_n if side == "north" else canal_s] = BRIDGE
                for r in gap_paths(family, cfg):                         # between its plots, into the side paths
                    for xx in range(px, px + w):
                        g[xx, edge + toward * r] = PATH
                for xx in range(px - 1, px + w + 1):                     # along its top
                    g[xx, edge + toward * h] = PATH
                depths.append(h)
                x = px + w
            seps = [start] + [int(o["x"] // T) + int(o["width"] // T) for o in row]
            for i, sx in enumerate(seps):                                # the paths between, as deep as the deeper neighbour
                d = max(depths[max(0, i - 1)], depths[min(len(depths) - 1, i)]) + 1
                for r in range(d):
                    g[sx, edge + toward * r] = PATH
        # 3. the lanes from the village run down to the first path they meet
        for lx in lanes:
            for y in range(by0, canal_n):
                if is_path(g[lx, y]):
                    break
                if any(int(o["x"] // T) <= lx < int((o["x"] + o["width"]) // T) and int(o["y"] // T) <= y for o in north):
                    break                                                # a paddy (its top path is just above)
                g[lx, y] = PATH
            else:
                g[lx, canal_n] = BRIDGE                                  # down to the canal: a plank over it to the road
        g.autotile_paths(bx0 - 1, by0 - 1, bx1 + 1, by1 + 1)
        for y in (canal_n, canal_s):
            autotile_canal(g, y, bx0 - 1, bx1 + 1)
        print(f"  {name}: {len(fields)} paddies laid out in the block at {(bx0, by0)}; lanes {lanes}")
    path.write_text(json.dumps(m, separators=(",", ":")))


def main() -> None:
    cfg = json.loads((ROOT / "src/data/npcFarm.json").read_text())
    for name, key in MAPS.items():
        if (ROOT / "public/assets/maps" / f"{name}.tmj").exists():
            lay_out(name, key, cfg)


if __name__ == "__main__":
    main()
