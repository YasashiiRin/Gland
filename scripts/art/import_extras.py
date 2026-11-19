"""
Batch 3 pictures (2026-11-20): the UI skin (assets/ui/) and the new village
things of ASSET_LIST section 12. Pictures are looked up by name in any
folder of assets/ (they are sometimes saved in another one).

  * UI -> public/assets/ui/<name>.png at the listed screen size, loaded as
    "ui_<name>" (src/ui/uiSkin.ts uses them, else the code-drawn look stays);
  * new things -> public/assets/sprites/props/<name>.png (HD, "prop_<name>"),
    the ploughing buffalo -> sprites/animals/buffalo_plough.png (2 frames).
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

from .asset_import import ROOT, SRC, cut_out, load, place, sprite
from .import_sheets import frames, grid, sheet

PUB = ROOT / "public" / "assets"

# name: (width, height) on screen
UI = {"panel_wood": (96, 96), "button": (96, 32), "button_hover": (96, 32), "slot": (40, 40),
      "slot_selected": (40, 40), "day_dial": (48, 48), "bar_frame": (12, 80), "touch_button": (64, 64),
      "joystick_base": (96, 96), "joystick_knob": (40, 40), "minimap_frame": (112, 112), "gear": (32, 32)}
# name: (width, height) in HD px (32 a tile), anchored at the bottom
PROPS = {"rice_sheaf": (32, 32), "produce_baskets": (64, 32), "hat_drying_rack": (96, 64), "drying_leaves": (32, 32),
         "ferry_boat": (128, 48), "wooden_jetty": (96, 64), "bamboo_fence": (32, 32), "flower_bush": (32, 32),
         "garden_house": (160, 160), "drying_rice": (32, 32)}


PALE = {"drying_leaves"}  # whitish things the shadow filter would take for a shadow


def find_any(name: str) -> Path | None:
    """assets/**/<name>.png (or .png.png), wherever it was saved."""
    for pattern in (f"{name}.png", f"{name}.png.png"):
        hits = sorted(SRC.rglob(pattern))
        if hits:
            return hits[0]
    return None


def _stretch(path: Path, size: tuple[int, int]) -> Image.Image:
    """A UI piece cut out and squeezed to exactly `size` (frames must fill their box)."""
    a, sh = cut_out(load(path), keep_shadow=False)
    ys, xs = np.nonzero(a[..., 3] > 0)
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    w, h = box[2] - box[0], box[3] - box[1]
    big = place(a, sh, box, 1.0, (w, h), "center", 0, line=False)
    return big.resize(size, Image.BOX).convert("RGBA")


def _crisp(im: Image.Image) -> Image.Image:
    a = np.asarray(im).copy()
    a[..., 3] = np.where(a[..., 3] >= 128, 255, 0)
    return Image.fromarray(a)


def import_ui() -> tuple[list[str], list[dict]]:
    out_dir = PUB / "ui"
    out_dir.mkdir(exist_ok=True)
    done, files = [], []
    for name, size in UI.items():
        p = find_any(name)
        if not p:
            continue
        _crisp(_stretch(p, size)).save(out_dir / f"{name}.png")
        files.append({"type": "image", "key": f"ui_{name}", "url": f"ui/{name}.png"})
        done.append(f"ui/{name}")
    p = find_any("title_background")
    if p:  # cover 1280 x 720
        im = Image.open(p).convert("RGB")
        k = max(1280 / im.width, 720 / im.height)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        x0, y0 = (im.width - 1280) // 2, (im.height - 720) // 2
        im.crop((x0, y0, x0 + 1280, y0 + 720)).save(out_dir / "title_background.png")
        files.append({"type": "image", "key": "ui_title_background", "url": "ui/title_background.png"})
        done.append("ui/title_background")
    return done, files


def import_props() -> tuple[list[str], list[dict]]:
    done, files = [], []
    for name, size in PROPS.items():
        p = find_any(name)
        if not p:
            continue
        sprite(p, size, margin=0, keep_shadow=True, bottom_pad=0, pale_ok=name in PALE).save(PUB / "sprites" / "props" / f"{name}.png")
        files.append({"type": "image", "key": f"prop_{name}", "url": f"sprites/props/{name}.png", "hd": True})
        done.append(f"props/{name}")
    p = find_any("buffalo_plough")
    if p:  # two drawings side by side, the ploughman behind, facing right
        out = frames(grid(p, 1, 2, pockets=True), [(0, 0, False), (0, 1, False)], (94, 62), (96, 64), 0)
        sheet(out, 2).save(PUB / "sprites" / "animals" / "buffalo_plough.png")
        files.append({"type": "spritesheet", "key": "animal_buffalo_plough", "url": "sprites/animals/buffalo_plough.png",
                      "frameConfig": {"frameWidth": 96, "frameHeight": 64}, "hd": True})
        done.append("animals/buffalo_plough")
    return done, files


def import_extras() -> list[str]:
    ui_done, ui_files = import_ui()
    prop_done, prop_files = import_props()
    path = PUB / "sprites" / "pack.json"
    pack = json.loads(path.read_text())
    new = {f["key"] for f in ui_files + prop_files}
    pack["generated"]["files"] = [f for f in pack["generated"]["files"] if f["key"] not in new] + ui_files + prop_files
    path.write_text(json.dumps(pack, indent=1))
    return ui_done + prop_done
