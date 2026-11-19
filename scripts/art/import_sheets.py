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


def import_characters() -> list[str]:
    done = []
    for name, (target, rows, side) in WALKERS.items():
        p = find(f"characters/{name}.png")
        if not p:
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
        if not p:
            continue
        picks = [pick for d in ("down", "left", "right", "up") for pick in dirs[d]]
        out = frames(grid(p, rows, 4, labelled=True), picks, **CHAR)
        for i in range(1, len(picks)):
            if picks[i] == picks[i - 1]:
                out[i] = bob(out[i])
        sheet(out, 4).save(PUB / f"{target}.png")
        done.append(f"characters/{name}")
    for name in PORTRAITS:
        p = find(f"characters/{name}.png")
        if p:
            frames(grid(p, 2, 2), [(0, 0, False)], **CHAR)[0].save(PUB / "npcs" / f"{name}.png")
            done.append(f"characters/{name}")
    return done


# --- animals: 2 walk frames side by side, facing right ------------------------------------
LABELLED = {"chicken", "pig"}  # 2 x 2 views, each with a written label
ANIMALS: dict[str, tuple[int, int, list[Cell], tuple[int, int], tuple[int, int]]] = {
    # picture: grid rows, cols, the two drawings (mirrored to face right), size to fit, frame size
    "chicken": (2, 2, [(0, 1, False), (1, 0, True)], (28, 29), (32, 32)),
    "pig": (2, 2, [(0, 1, False), (1, 0, True)], (57, 35), (64, 48)),
    "cow": (4, 4, [(2, 0, False), (2, 2, False)], (57, 41), (64, 48)),
    "buffalo": (4, 4, [(1, 0, True), (1, 2, True)], (57, 45), (64, 48)),
    "tiger": (4, 4, [(1, 1, False), (1, 3, False)], (74, 42), (80, 48)),
}


def import_animals() -> list[str]:
    done = []
    for name, (rows, cols, picks, fit, size) in ANIMALS.items():
        p = find(f"animals/{name}.png")
        if p:
            sheet(frames(grid(p, rows, cols, labelled=name in LABELLED), picks, fit, size, 0), 2).save(PUB / "animals" / f"{name}.png")
            done.append(f"animals/{name}")
    return done


# --- vehicles: down, left, right, up, 64 x 64 each ----------------------------------------
VEHICLES = {  # picture: (which of the 4 drawings is the side view, does it face left, size to fit)
    "bicycle": (1, False, (59, 44)), "motorbike": (1, False, (60, 47)), "ox_cart": (1, True, (63, 60)),
    "tractor": (1, True, (60, 52)), "harvester": (1, True, (62, 52)), "water_truck": (2, True, (60, 47)),
}


def import_vehicles() -> list[str]:
    done = []
    for name, (side, faces_left, fit) in VEHICLES.items():
        p = find(f"vehicles/{name}.png")
        if p:
            picks = [(0, 0, False), (0, side, not faces_left), (0, side, faces_left), (0, 3, False)]
            sheet(frames(grid(p, 1, 4), picks, fit, (64, 64), 0), 4).save(PUB / "vehicles" / f"{name}.png")
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
# The great buildings, drawn bigger than a house (HD px; a tile is 32): the footprints in the
# maps match (map_quang_binh.py, world_maps.py). A village house is 160 x 160.
BIG = {"pagoda": (256, 224), "thien_mu": (128, 384), "royal_hall": (320, 384), "royal_tomb": (256, 384),
       "memorial": (128, 256)}
# Gates still drawn by code: shown at twice their first size (only once, from the size they are drawn at).
GROW = {"quang_binh_quan": (160, 160), "ngo_mon": (256, 160)}  # the pagoda gate stays: in front of the pagoda it would hide it


def grow_gates() -> list[str]:
    done = []
    for name, base in GROW.items():
        path = PUB / "props" / f"{name}.png"
        im = Image.open(path)
        if im.size == base:
            im.resize((base[0] * 2, base[1] * 2), Image.NEAREST).save(path)
            done.append(f"bigger/{name}")
    return done


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
        size = BIG.get(target) or Image.open(out).size
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
    return import_characters() + import_animals() + import_vehicles() + import_buildings() + grow_gates()
