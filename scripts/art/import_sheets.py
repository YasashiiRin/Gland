"""
Sheets of several drawings (characters, animals, vehicles, buildings) from
assets/ -> the game's sprite sheets. The generator rarely keeps to the asked
layout, so each picture is split into its grid of drawings by the empty
gaps between them, and the tables below say which drawing goes to which
frame (and whether to mirror it: side views often all face the same way).
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from .import_scale import real_frame, resize_drawn, set_frame_size
from .real_scale import SIZES, canvas
from .asset_import import background, bbox, cut_out, find, fit_scale, load, place

PUB = Path(__file__).resolve().parents[2] / "public" / "assets" / "sprites"

Cell = tuple[int, int, bool]  # row, column, mirror
STD = {"down": 0, "up": 3}  # rows of a 4 x 4 walk sheet
UP_ROW = {"minh": 4}  # 6 rows: its first back row has the legs cut short


def _runs(on: np.ndarray, n: int) -> list[tuple[int, int]]:
    """`n` spans of `on`: runs of True, the closest neighbours merged (labels join their drawing)."""
    runs, start = [], None
    for i, v in enumerate(list(on) + [False]):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append([start, i])
            start = None
    while len(runs) > n:
        k = min(range(len(runs) - 1), key=lambda j: runs[j + 1][0] - runs[j][1])
        runs[k][1] = runs.pop(k + 1)[1]
    if len(runs) < n:
        return _even(n, len(on))
    return [(a, b) for a, b in runs]


def _even(n: int, length: int) -> list[tuple[int, int]]:
    return [(i * length // n, (i + 1) * length // n) for i in range(n)]


def grid(path: Path, rows: int, cols: int, keep_shadow: bool = False,
         labelled: bool = False, pockets: bool = False) -> list[list[tuple[np.ndarray, np.ndarray]]]:
    """The drawings of a picture laid out in `rows` x `cols`, each cut out on its own.
    `labelled`: equal cells (perhaps ruled with lines, cut just inside them), each holding one
    drawing and maybe a written label to drop;
    `pockets`: shut-in pure white is background too (sky under a porch; not white clothes)."""
    a = load(path)
    fg = ~background(a, pockets=False)
    out = []
    for y0, y1 in _even(rows, a.shape[0]) if labelled else _runs(fg.any(axis=1), rows):
        line = []
        for x0, x1 in _even(cols, a.shape[1]) if labelled else _runs(fg[y0:y1].any(axis=0), cols):
            k = -6 if labelled else 3
            cy0, cy1, cx0, cx1 = max(0, y0 - k), min(a.shape[0], y1 + k), max(0, x0 - k), min(a.shape[1], x1 + k)
            line.append(cut_out(a[cy0:cy1, cx0:cx1], keep_shadow, pockets=pockets, solo=labelled))
        out.append(line)
    return out


def frames(cells: list[list[tuple[np.ndarray, np.ndarray]]], picks: list[Cell], fit: tuple[int, int],
           canvas: tuple[int, int], bottom_pad: int, anchor: str = "bottom") -> list[Image.Image]:
    """The picked drawings, all shrunk by one scale so the biggest fits `fit`, each on its own canvas."""
    used = [cells[r][c] for r, c, _ in picks]
    boxes = [bbox(a) for a, _ in used]
    scale = fit_scale(boxes, *fit)
    out = []
    for (a, sh), box, (_, _, flip) in zip(used, boxes, picks):
        im = place(a, sh, box, scale, canvas, anchor, bottom_pad)
        out.append(ImageOps.mirror(im) if flip else im)
    return out


def bob(im: Image.Image, dy: int = 2) -> Image.Image:
    """The same drawing a little higher: the step of a walk when there is one drawing per direction."""
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.alpha_composite(im, (0, -dy))
    return out


def sheet(images: list[Image.Image], cols: int) -> Image.Image:
    w, h = images[0].size
    out = Image.new("RGBA", (w * cols, h * ((len(images) + cols - 1) // cols)), (0, 0, 0, 0))
    for i, im in enumerate(images):
        out.alpha_composite(im, ((i % cols) * w, (i // cols) * h))
    return out


# --- characters: 4 rows (down, left, right, up) x 4 walk frames of 32 x 64 ---------------
WALKERS = {  # picture -> (target under sprites/, grid rows, the row with the clearest left profile)
    "player": ("player", 4, 2), "chu_tu": ("npcs/chu_tu", 4, 2), "co_hanh": ("npcs/co_hanh", 4, 2),
    "linh": ("npcs/linh", 4, 2), "minh": ("npcs/minh", 6, 2), "folk_0": ("npcs/folk_0", 4, 2),
    "folk_1": ("npcs/folk_1", 4, 1), "folk_2": ("npcs/folk_2", 4, 2), "folk_3": ("npcs/folk_3", 4, 2),
    "folk_4": ("npcs/folk_4", 4, 2),
}
# folk_5 came as a hawker with the carrying pole drawn in: the game draws the pole itself, so not used.
# Full walk cycles (4 drawings at one angle per row), ruled into equal cells:
# picture -> (target, rows of the sheet, {direction: [(row, column, mirror) x 4]}). Drawings
# used twice (the back view has only two good ones) get a small step up the second time.
CYCLE = [0, 1, 2, 3]
WALK_CYCLES: dict[str, tuple[str, int, dict[str, list[Cell]]]] = {
    # The young farmer (2026-11-19): both side rows face right, and the back row's 2nd and 4th
    # drawings are side views, so left = the side row mirrored and the back uses its 1st and 3rd.
    "character": ("player", 4, {"down": [(0, c, False) for c in CYCLE], "left": [(1, c, True) for c in CYCLE],
                                "right": [(1, c, False) for c in CYCLE],
                                "up": [(3, 0, False), (3, 0, False), (3, 2, False), (3, 2, False)]}),
}
PORTRAITS = ["vendor_fish", "vendor_veg", "vendor_rice"]  # front view of a 2 x 2 sheet, 32 x 64
CHAR = dict(fit=(30, 58), canvas=(32, 64), bottom_pad=3)


def drawn_rows(path: Path) -> int:
    """How many rows of drawings a sheet holds (bands of drawing between empty white lines)."""
    a = load(path)
    on = (~background(a, pockets=False)).any(axis=1)
    runs, start = [], None
    for i, v in enumerate(list(on) + [False]):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append(i - start)
            start = None
    return sum(1 for r in runs if r > len(on) * 0.06)


# The walk sheet asked for in ASSET_LIST.md (2026-11-20): 3 rows - front, left profile, back -
# of 4 steps each; right is the left row mirrored.
THREE_ROWS = {"down": [(0, c, False) for c in CYCLE], "left": [(1, c, False) for c in CYCLE],
              "right": [(1, c, True) for c in CYCLE], "up": [(2, c, False) for c in CYCLE]}


def faces_left(a: np.ndarray) -> bool | None:
    """Which way a side view looks: its hair shows at the back of the head (None: can't tell)."""
    x0, y0, x1, y1 = bbox(a)
    h = y1 - y0
    band = a[y0 + int(h * 0.12):y0 + int(h * 0.45), x0:x1]
    solid = band[..., 3] > 0
    hair = np.nonzero(solid & (band[..., :3].mean(axis=2) < 70))[1]
    xs = np.nonzero(solid)[1]
    if len(hair) < 5 or not len(xs):
        return None
    return bool(hair.mean() > (xs.min() + xs.max()) / 2)


def side_faces_left(cells: list[list[tuple[np.ndarray, np.ndarray]]], row: int) -> bool:
    """The way most drawings of a side row look (the generator may draw right though asked left)."""
    votes = [faces_left(a) for a, _ in cells[row]]
    return votes.count(False) <= votes.count(True)


def _cycle_sheet(cells: list[list[tuple[np.ndarray, np.ndarray]]], dirs: dict[str, list[Cell]]) -> Image.Image:
    picks = [pick for d in ("down", "left", "right", "up") for pick in dirs[d]]
    out = frames(cells, picks, **CHAR)
    for i in range(1, len(picks)):
        if picks[i] == picks[i - 1]:
            out[i] = bob(out[i])
    return sheet(out, 4)


def import_characters() -> list[str]:
    done = []
    full: set[str] = set()  # targets that got a real walk cycle this run
    for name, (target, rows, side) in WALKERS.items():
        p = find(f"characters/{name}.png")
        if not p:
            continue
        if drawn_rows(p) == 3:  # the new layout: a real walk in every direction
            cells = grid(p, 3, 4)
            left = side_faces_left(cells, 1)
            dirs = {**THREE_ROWS, "left": [(1, c, not left) for c in CYCLE], "right": [(1, c, left) for c in CYCLE]}
            _cycle_sheet(cells, dirs).save(PUB / f"{target}.png")
            full.add(target)
            done.append(f"characters/{name}")
            continue
        # The generator's walk frames drift between angles (half-turned toward the viewer, over
        # the shoulder), so each direction keeps one drawing: front, a true left profile, that
        # profile mirrored for right, back.
        picks = [(STD["down"], 0, False), (side, 0, False), (side, 0, True), (UP_ROW.get(name, STD["up"]), 0, False)]
        one = frames(grid(p, rows, 4), picks, **CHAR)
        sheet([im if k % 2 == 0 else bob(im) for im in one for k in range(4)], 4).save(PUB / f"{target}.png")
        done.append(f"characters/{name}")
    for name, (target, rows, dirs) in WALK_CYCLES.items():
        p = find(f"characters/{name}.png")
        if not p or target in full:  # a newer 3-row sheet of the same person wins
            continue
        _cycle_sheet(grid(p, rows, 4, labelled=True), dirs).save(PUB / f"{target}.png")
        done.append(f"characters/{name}")
    for name in PORTRAITS:
        p = find(f"characters/{name}.png")
        if p:
            frames(grid(p, 2, 2), [(0, 0, False)], **CHAR)[0].save(PUB / "npcs" / f"{name}.png")
            done.append(f"characters/{name}")
    return done


# --- animals: 2 walk frames side by side, facing right ------------------------------------
LABELLED = {"chicken", "pig"}  # 2 x 2 views, each with a written label
ANIMALS: dict[str, tuple[int, int, list[Cell]]] = {
    # picture: grid rows, cols, the two drawings (mirrored to face right); size: real_scale.py
    "chicken": (2, 2, [(0, 1, False), (1, 0, True)]),
    "pig": (2, 2, [(0, 1, False), (1, 0, True)]),
    "cow": (4, 4, [(2, 0, False), (2, 2, False)]),
    "buffalo": (4, 4, [(1, 0, True), (1, 2, True)]),
    "tiger": (4, 4, [(1, 1, False), (1, 3, False)]),
}


def import_animals() -> list[str]:
    done = []
    for name, (rows, cols, picks) in ANIMALS.items():
        p = find(f"animals/{name}.png")
        if p:
            fit, size = real_frame(f"animals/{name}")
            sheet(frames(grid(p, rows, cols, labelled=name in LABELLED), picks, fit, size, 0), 2).save(PUB / "animals" / f"{name}.png")
            set_frame_size(f"animal_{name}", size)
            done.append(f"animals/{name}")
    return done


# --- vehicles: down, left, right, up; true size (real_scale.py) ---------------------------
VEHICLES = {  # picture: (which of the 4 drawings is the side view, does it face left)
    "bicycle": (1, False), "motorbike": (1, False), "ox_cart": (1, True),
    "tractor": (1, True), "harvester": (1, True), "water_truck": (2, True),
}


def import_vehicles() -> list[str]:
    done = []
    for name, (side, faces_left) in VEHICLES.items():
        p = find(f"vehicles/{name}.png")
        if p:
            picks = [(0, 0, False), (0, side, not faces_left), (0, side, faces_left), (0, 3, False)]
            fit, size = real_frame(f"vehicles/{name}")
            sheet(frames(grid(p, 1, 4), picks, fit, size, 0), 4).save(PUB / "vehicles" / f"{name}.png")
            set_frame_size(f"vehicle_{name}", size)
            done.append(f"vehicles/{name}")
    return done


# --- buildings: one drawing of the sheet, standing on the bottom of the sprite ------------
BUILDINGS: dict[str, tuple[str, int, int]] = {  # picture: (target in sprites/props, grid rows, cols)
    "thatched_house": ("thatched_house", 2, 2), "house_mud_thatch": ("house_c", 2, 2),
    "house_tile_lime": ("house_a", 2, 2), "house_tile_brick": ("house_b", 2, 2),
    "vehicle_shop": ("vehicle_house", 2, 2), "seed_shop": ("shop", 2, 2), "warehouse": ("warehouse", 2, 2),
    "village_school": ("school", 2, 2), "dinh_lang": ("ubnd", 2, 2), "memorial_house": ("memorial_house", 2, 2),
    "station": ("station", 2, 2), "pagoda": ("pagoda", 2, 2),
    "ferry_shelter": ("ferry_shelter", 4, 4), "lookout": ("lookout", 4, 4),
    "memorial": ("memorial", 4, 4), "hat_stall": ("hat_stall", 4, 4), "stall_veg": ("stall_veg", 4, 4),
    "stall_rice": ("stall_rice", 4, 4), "umbrella_fruit": ("umbrella_fruit", 4, 4),
    "umbrella_veg": ("umbrella_veg", 4, 4), "umbrella_fish": ("umbrella_fish", 4, 4),
    "umbrella_flower": ("umbrella_flower", 4, 4),
    "royal_hall": ("royal_hall", 6, 4), "royal_tomb": ("royal_tomb", 4, 4), "thien_mu": ("thien_mu", 4, 4),
    # Not used: the bridges and the gates you walk through (ngo_mon, quang_binh_quan, pagoda_gate)
    # came as slanted corner views, so their way through cannot line up with a straight road.
}
# 2 x 2 sheets: top row the front (with the door) seen from a corner, bottom row the back.
# Which wall of the top-left drawing holds the door: L(eft), R(ight) or F(acing us).
# The game picks <target>_<facing>.png from the map's "facing" (scripts/art/facing.py):
# down and left = the door on the left wall (one look for every house), right = mirrored, up = the back.
DOOR_WALL = {"thatched_house": "R", "house_mud_thatch": "R", "house_tile_lime": "L", "house_tile_brick": "R",
             "vehicle_shop": "L", "seed_shop": "L", "warehouse": "R", "village_school": "F",
             "memorial_house": "L", "station": "L", "pagoda": "L"}


def import_buildings() -> list[str]:
    done: list[str] = []
    facings: list[str] = []
    for name, (target, rows, cols) in BUILDINGS.items():
        p = find(f"buildings/{name}.png")
        if not p:
            continue
        out = PUB / "props" / f"{target}.png"
        size = canvas(f"props/{target}") if f"props/{target}" in SIZES else Image.open(out).size
        cells = grid(p, rows, cols, keep_shadow=True, pockets=True)
        wall = DOOR_WALL.get(name)
        if not wall:
            frames(cells, [(0, 0, False)], size, size, 0)[0].save(out)
        else:  # one scale for all four, so the house keeps its size whichever way it faces
            flip = wall == "R"
            left, right, up = frames(cells, [(0, 0, flip), (0, 0, not flip), (1, 0, False)], size, size, 0)
            down = left
            down.save(out)
            for facing, im in (("left", left), ("right", right), ("up", up)):
                im.save(PUB / "props" / f"{target}_{facing}.png")
                facings.append(target + "_" + facing)
        done.append(f"buildings/{name}")
    _register(facings)
    return done


def _register(keys: list[str]) -> None:
    """Adds the facing pictures to the sprite pack (once each)."""
    path = PUB / "pack.json"
    pack = json.loads(path.read_text())
    files = pack["generated"]["files"]
    have = {f["key"] for f in files}
    for k in keys:
        if f"prop_{k}" not in have:
            files.append({"type": "image", "key": f"prop_{k}", "url": f"sprites/props/{k}.png", "hd": True})
    path.write_text(json.dumps(pack, indent=1))


def import_sheets() -> list[str]:
    return import_characters() + import_animals() + import_vehicles() + import_buildings() + resize_drawn()
