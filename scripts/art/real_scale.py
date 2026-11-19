"""
Real-world sizes (the player's request, 2026-11-20): every animal, vehicle,
tree and building is drawn at its true size next to a person, with a person
(an adult of the old village, about 1.6 m) as the yardstick:

    the player's sprite is 61 HD px tall  ->  1 m = 38 HD px  (32 HD px = 1 tile)

Very tall things (coconut palms, pines, the citadel gates) would not fit the
screen at true scale, so above KNEE they are squeezed (each extra metre counts
COMPRESS) and never exceed CAP: they stay much bigger than a house, in the right
order of size. Small things (seeds, items, tools, furniture) keep their size.
Mountains, caves and bridges are terrain and are not scaled.

Sizes are approximate everyday figures (typical Vietnamese buffalo, Honda Cub,
three-room tiled house; published dimensions for the landmarks).
"""
from __future__ import annotations

import json
import math
from pathlib import Path

PX_PER_M = 61 / 1.6
KNEE = 320          # HD px (10 tiles): true scale up to here
COMPRESS = 0.3
CAP = 900           # HD px (28 tiles)
TILE = 32           # HD px

# sprite path under public/assets/sprites -> (visible width m, visible height m, ground depth m or None)
# Width/height are what the picture shows (for a building in 3/4 view: its length and roof-to-ground);
# depth is the ground it stands on, front to back (buildings only: their footprint on the map).
SIZES: dict[str, tuple[float, float, float | None]] = {
    # animals (side view)
    "animals/chicken": (0.45, 0.4, None), "animals/pig": (1.0, 0.65, None), "animals/cow": (1.9, 1.3, None),
    "animals/buffalo": (2.6, 1.5, None), "animals/tiger": (2.7, 1.0, None),
    # vehicles (side view: length, height)
    "vehicles/bicycle": (1.75, 1.05, None), "vehicles/motorbike": (1.85, 1.1, None), "vehicles/ox_cart": (4.0, 1.9, None),
    "vehicles/tractor": (3.0, 1.9, None), "vehicles/harvester": (4.6, 2.6, None), "vehicles/water_truck": (5.0, 2.4, None),
    # boats (props)
    "props/basket_boat": (2.0, 0.8, None), "props/sampan": (6.0, 1.4, None), "props/dragon_boat": (12.0, 3.0, None),
    "props/race_boat": (15.0, 1.2, None),
    # a resting buffalo and the plough a buffalo pulls
    "props/buffalo": (2.6, 1.3, None), "props/plough": (1.6, 0.9, None),
    # trees (crown width, height)
    "trees/banana": (3, 4, None), "trees/pomelo": (5, 6, None), "trees/oak_0": (8, 10, None), "trees/oak_1": (7, 8, None),
    "trees/flame": (10, 10, None), "trees/bamboo": (6, 12, None), "trees/areca": (3, 14, None), "trees/coconut": (6, 18, None),
    "trees/casuarina": (5, 18, None), "trees/mangrove": (7, 12, None), "trees/pine": (6, 25, None), "trees/rubber": (6, 15, None),
    # village houses and buildings
    "props/thatched_house": (9, 7, 5), "props/house_c": (9, 7.5, 5), "props/house_a": (12, 8, 6), "props/house_b": (10, 7.5, 5.5),
    "props/vehicle_house": (10, 8, 6), "props/shop": (12, 8, 6), "props/warehouse": (20, 9, 10), "props/school": (25, 10, 7),
    "props/ubnd": (20, 10, 10), "props/memorial_house": (10, 7, 6), "props/station": (35, 12, 12),
    "props/pagoda": (14, 11, 9), "props/pagoda_gate": (10, 9, 3), "props/lookout": (4, 4.5, 4),
    "props/hat_stall": (4, 3.5, 2.5), "props/stall_veg": (3, 3, 2.5), "props/stall_rice": (3, 3, 2.5), "props/stall_fish": (3, 3, 2.5),
    "props/umbrella_fruit": (3, 3, 2.5), "props/umbrella_veg": (3, 3, 2.5), "props/umbrella_fish": (3, 3, 2.5),
    "props/umbrella_flower": (3, 3, 2.5), "props/ferry_shelter": (5, 5, 4), "props/haystack": (2.5, 3.2, 2.5),
    "props/chicken_coop": (2, 1.8, 1.5),
    # landmarks
    "props/quang_binh_quan": (13, 13, 8), "props/ngo_mon": (58, 20, 27), "props/royal_hall": (44, 22, 30),
    "props/royal_tomb": (15, 20, 15), "props/thien_mu": (7, 21, 7), "props/memorial": (6, 12, 6),
}
# The canvas the old (pre-2026-11-20) art was drawn on: lamp spots (houseLights.json) were placed for it.
OLD_WIDTH = {"thatched_house": 160, "house_c": 160, "house_a": 160, "house_b": 160, "vehicle_house": 160, "shop": 192,
             "school": 288, "ubnd": 256}


def _px(m: float) -> float:
    v = m * PX_PER_M
    if v > KNEE:
        v = KNEE + (v - KNEE) * COMPRESS
    return min(v, CAP)


def factor(name: str) -> float:
    """HD px per metre for this thing: true scale, or less for the very big ones (both axes alike)."""
    w, h, _ = SIZES[name]
    big = max(w, h)
    return _px(big) / big


def canvas(name: str) -> tuple[int, int]:
    """The sprite size (HD px) for `name`, e.g. "trees/coconut"."""
    w, h, _ = SIZES[name]
    k = factor(name)
    return max(8, math.ceil(w * k)), max(8, math.ceil(h * k))


def footprint(sprite: str) -> tuple[int, int] | None:
    """(tiles wide, tiles deep) a building stands on, or None for things not scaled on the map."""
    entry = SIZES.get(f"props/{sprite}")
    if not entry or entry[2] is None:
        return None
    w, h, depth = entry
    k = factor(f"props/{sprite}")
    # Seen from above at an angle, the ground it covers is at most ~60% of the picture's height.
    deep = min(depth * k, 0.6 * h * k)
    return max(1, round(w * k / TILE)), max(1, round(deep / TILE))


def scale_box(sprite: str, x: int, y: int, w: int, h: int) -> tuple[int, int, int, int]:
    """A map footprint grown to the building's true size, keeping its bottom edge and its middle
    (so doors, gates and the counter in front stay where they were). Same result if applied twice."""
    fp = footprint(sprite)
    if not fp:
        return x, y, w, h
    nw, nh = fp
    cx2 = 2 * x + w                    # twice the middle, to stay in whole numbers
    nx = (cx2 - nw) // 2
    bottom = y + h
    return nx, bottom - nh, nw, nh


# Buildings whose front must stay in view: no tree may stand in the band just below them
# (trees are true size too, about 10 tiles tall, and would hide the facade).
LANDMARKS = {"quang_binh_quan", "ngo_mon", "royal_hall", "royal_tomb", "thien_mu", "pagoda", "pagoda_gate",
             "memorial", "station", "school", "warehouse", "ubnd", "memorial_house", "shop", "vehicle_house"}
FRONT_ROWS = 8


def write_lamp_scale(root: Path) -> None:
    """How much each lit building grew, for its oil-lamp spots (src/data/realScale.json)."""
    out = {name: round(canvas(f"props/{name}")[0] / old, 3) for name, old in OLD_WIDTH.items()}
    (root / "src" / "data" / "realScale.json").write_text(json.dumps(out, indent=1) + "\n")
