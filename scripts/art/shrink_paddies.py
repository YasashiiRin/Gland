"""Shrinks the village paddies of the finished maps to the plots the families work
(asked for by the player, 2026-11-19), without rebuilding the maps.

Each "field" object becomes just big enough for its family's plots
(src/data/npcFarm.json: plots one behind the other from the road, a grass strip
between; a homestead drawn for 3 gets room for 3 plots, one for 1 gets 2 small
ones), centred on its plank bridge and still touching the canal. The footpaths
between the paddies are cut back to the new depth (the lane from the village to
the road stays). The freed ground is plain grass, open to the player.

Run once: python3 -m scripts.art.shrink_paddies  (from the repository root)
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAPS = ["quang_binh", "hue"]
T = 16
GRASS = 1
PATH = 4                      # gid of a plain path tile
PATH_EDGE = 41                # gids 41..56: path variants, 41 + mask (1 north, 2 east, 4 south, 8 west open)
ROAD, CANAL = 3, 1


def is_path(gid: int) -> bool:
    return gid == PATH or PATH_EDGE <= gid < PATH_EDGE + 16


def with_open_end(gid: int, bit: int) -> int:
    mask = 0 if gid == PATH else gid - PATH_EDGE
    return PATH_EDGE + (mask | bit)


def props(o: dict) -> dict:
    return {p["name"]: p["value"] for p in o.get("properties", [])}


def paddy_size(members: int, cfg: dict) -> tuple[int, int]:
    """(width, depth) in tiles for a homestead drawn with this many people."""
    f = cfg["field"]
    family = "3" if members >= 3 else "2" if members == 2 else "1"
    w, h = f["plotTilesByFamilyType"][family]
    n = f["plotsByFamilyType"][family]
    return w, n * h + (n - 1) * f["plotGapTiles"]


def shrink(name: str, cfg: dict) -> None:
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
            w, h = paddy_size(members.get(p["homeId"], 1), cfg)
            w, h = min(w, w0), min(h, h0)
            keep = max(keep, h)
            bridge = int(p["bridgeX"])
            nx = max(x0, min(bridge - w // 2, x0 + w0 - w))
            if p["side"] == "north":
                ny = y0 + h0 - h
                road_y = y0 + h0 + CANAL                                # the road's first row
            else:
                ny = y0
            o["x"], o["y"], o["width"], o["height"] = nx * T, ny * T, w * T, h * T
        if road_y is None:
            continue
        north_cut = range(by0, road_y - CANAL - keep)                    # rows above the kept band
        south_cut = range(road_y + ROAD + CANAL + keep, by1 + 1)
        for x in range(bx0, bx1 + 1):
            lane = is_path(ground[(by0 - 1) * W + x])                    # the path up into the village: keep it
            if lane:
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
    for name in MAPS:
        shrink(name, cfg)


if __name__ == "__main__":
    main()
