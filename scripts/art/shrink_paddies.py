"""Shrinks the village paddies of the finished maps to the plots the families work
(asked for by the player, 2026-11-19), without rebuilding the maps.

Each "field" object becomes just big enough for its family's plots
(src/data/npcFarm.json: plots one behind the other from the road), centred on
its plank bridge and still touching the canal. Between two plots a dirt path
runs along the middle of the gap (plotGapTiles; 1 = just the path, 3 = grass,
path, grass), so they are easy to tell apart. The family type (and so the number of plots) is worked out exactly
as the game does (systems/npc/families.ts: FNV-1a hash of the home key, then
seededRandom). The footpaths between the paddies are cut back to the new depth
(the lane from the village to the road stays). The freed ground is plain grass.

Run it on the maps as villages.py built them (it only shrinks):
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


def with_open_end(gid: int, bit: int) -> int:
    mask = 0 if gid == PATH else gid - PATH_EDGE
    return PATH_EDGE + (mask | bit)


def props(o: dict) -> dict:
    return {p["name"]: p["value"] for p in o.get("properties", [])}


def shrink(name: str, map_key: str, cfg: dict) -> None:
    path = ROOT / "public/assets/maps" / f"{name}.tmj"
    m = json.loads(path.read_text())
    W = m["width"]
    ground = next(l for l in m["layers"] if l["name"] == "ground")["data"]
    objs = next(l for l in m["layers"] if l["name"] == "objects")["objects"]
    members = {props(o)["homeId"]: int(props(o).get("members", "1")) for o in objs if o["name"] == "zone" and props(o).get("kind") == "home"}
    for block in (o for o in objs if o["name"] == "fields"):
        bx0, by0 = int(block["x"] // T), int(block["y"] // T)
        bx1, by1 = bx0 + int(block["width"] // T) - 1, by0 + int(block["height"] // T) - 1
        fields = [o for o in objs if o["name"] == "field" and bx0 * T <= o["x"] < (bx1 + 1) * T and by0 * T <= o["y"] < (by1 + 1) * T]
        if not fields:
            continue
        keep = 0
        road_y = None
        for o in fields:
            p = props(o)
            x0, y0 = int(o["x"] // T), int(o["y"] // T)
            w0, h0 = int(o["width"] // T), int(o["height"] // T)
            family = family_type(f"{map_key}:{p['homeId']}", members.get(p["homeId"], 1), cfg)
            w, h = paddy_size(family, cfg)
            w, h = min(w, w0), min(h, h0)
            keep = max(keep, h)
            bridge = int(p["bridgeX"])
            nx = max(x0, min(bridge - w // 2, x0 + w0 - w))
            north = p["side"] == "north"
            ny = y0 + h0 - h if north else y0
            if north:
                road_y = y0 + h0 + CANAL                                # the road's first row
            o["x"], o["y"], o["width"], o["height"] = nx * T, ny * T, w * T, h * T
            for r in gap_paths(family, cfg):                            # grass | dirt path | grass between plots
                if r >= h:
                    continue
                y = ny + h - 1 - r if north else ny + r
                for x in range(nx, nx + w):
                    if ground[y * W + x] == GRASS:
                        mask = 1 | 4 | (8 if x == nx else 0) | (2 if x == nx + w - 1 else 0)
                        ground[y * W + x] = PATH_EDGE + mask
        if road_y is None:
            continue
        north_cut = range(by0, road_y - CANAL - keep)                    # rows above the kept band
        south_cut = range(road_y + ROAD + CANAL + keep, by1 + 1)
        for x in range(bx0, bx1 + 1):
            if is_path(ground[(by0 - 1) * W + x]):                       # the path up into the village: keep it
                continue
            for rows, edge_row, bit in ((north_cut, road_y - CANAL - keep, 1), (south_cut, road_y + ROAD + CANAL + keep - 1, 4)):
                cut = False
                for y in rows:
                    if is_path(ground[y * W + x]):
                        ground[y * W + x] = GRASS
                        cut = True
                if cut and is_path(ground[edge_row * W + x]):
                    ground[edge_row * W + x] = with_open_end(ground[edge_row * W + x], bit)
        print(f"  {name}: {len(fields)} paddies in the block at {(bx0, by0)} shrunk; paths kept {keep} deep")
    path.write_text(json.dumps(m, separators=(",", ":")))


def main() -> None:
    cfg = json.loads((ROOT / "src/data/npcFarm.json").read_text())
    for name, key in MAPS.items():
        shrink(name, key, cfg)


if __name__ == "__main__":
    main()
