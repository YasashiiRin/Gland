"""
Which way each building faces: towards its main road (the player asked for
houses to front their road, 2026-11-19). Written into the map as the prop's
"facing" property (down / left / right / up); the game then draws the matching
picture (sprites/props/<name>_<facing>.png, made by import_sheets.py).

* A building with something to use right below it (a shop counter, a door, the
  co-operative's bays) or one placed with a set facing keeps that.
* Otherwise the side with the most road close by wins (nearer road counts more);
  with no road around, it faces down, towards the viewer.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from .province_tiles import BRIDGE, PAVING
from .tiles import PATH, PATH_EDGE

if TYPE_CHECKING:
    from .maps import MapBuilder

T = 16
ROAD = {PATH, PAVING, BRIDGE} | set(range(PATH_EDGE, PATH_EDGE + 16))
REACH = 4                      # how far (tiles) from a wall a road still counts
# Buildings drawn in several facings (see import_sheets.FACING_SHEETS).
FACED = {"thatched_house", "house_a", "house_b", "house_c", "vehicle_house", "shop", "warehouse",
         "school", "memorial_house", "station", "pagoda", "royal_hall"}
USED_FROM_FRONT = {"shop", "door", "warehouse", "bed"}
ORDER = ("down", "left", "right", "up")   # ties go to the first


def _props(o: dict) -> dict[str, str]:
    return {p["name"]: p["value"] for p in o.get("properties", [])}


def _side_tiles(x0: int, y0: int, w: int, h: int, side: str, d: int) -> list[tuple[int, int]]:
    if side == "down":
        return [(x, y0 + h - 1 + d) for x in range(x0 - 1, x0 + w + 1)]
    if side == "up":
        return [(x, y0 - d) for x in range(x0 - 1, x0 + w + 1)]
    if side == "left":
        return [(x0 - d, y) for y in range(y0, y0 + h)]
    return [(x0 + w - 1 + d, y) for y in range(y0, y0 + h)]


def facing_of(m: MapBuilder, x0: int, y0: int, w: int, h: int) -> str:
    """The side of the footprint with the most road near it."""
    best, score = "down", 0.0
    for side in ORDER:
        s = 0.0
        for d in range(1, REACH + 1):
            for x, y in _side_tiles(x0, y0, w, h, side, d):
                if 0 <= x < m.w and 0 <= y < m.h and m.ground[y][x] in ROAD:
                    s += 1 / d
        if side in ("left", "right"):
            s *= (w + 2) / max(1, h)   # a short side wall sees fewer tiles: even it up
        if s > score + 1e-6:
            best, score = side, s
    return best


def set_facings(m: MapBuilder) -> None:
    fronts = [(o["x"] // T, o["y"] // T, max(1, o["width"] // T)) for o in m.objects if o["name"] in USED_FROM_FRONT]
    for o in m.objects:
        if o["name"] != "prop":
            continue
        props = _props(o)
        if props.get("sprite") not in FACED or props.get("facing"):
            continue
        x0, y0, w, h = int(o["x"] // T), int(o["y"] // T), int(o["width"] // T), int(o["height"] // T)
        used = any(y0 + h <= fy <= y0 + h + 1 and x0 <= fx + fw - 1 and fx <= x0 + w - 1 for fx, fy, fw in fronts)
        facing = "down" if used else facing_of(m, x0, y0, w, h)
        o.setdefault("properties", []).append({"name": "facing", "type": "string", "value": facing})
