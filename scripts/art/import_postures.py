"""
Sitting poses (2026-11-20): assets/postures/<npc>.png -> public/assets/sprites/npcs/<npc>_sit.png,
loaded as "<npc>_sit" (src/scenes/villagers.ts uses it when the NPC sits; without one the
standing sprite is cropped at the knees as before).

Each picture is 3 rows (front, side, back) of 4 near-identical drawings. The first drawing
of each row is used (the generator's sparkle sits on the last one); the side view is
mirrored for the other side. The sheet keeps the walk sheet's layout (4 rows: down, left,
right, up x 4 frames of 32 x 64) and the NPC's own scale: the hat is as wide as on their
walking sprite. Pictures whose name isn't an NPC (e.g. unused_*.png) are skipped.

Run from scripts/:  python3 -m art.import_postures
"""
from __future__ import annotations

import json

import numpy as np
from PIL import Image, ImageOps

from .asset_import import ROOT, SRC, bbox, place
from .import_sheets import CHAR, faces_left, grid, sheet

PUB = ROOT / "public" / "assets"
NPC_DIR = PUB / "sprites" / "npcs"


def hat_width(alpha: np.ndarray, top_share: float = 0.3) -> int:
    """Widest opaque row in the top part of a drawing (the nón lá's brim)."""
    ys, _ = np.nonzero(alpha > 0)
    y0, y1 = ys.min(), ys.max() + 1
    band = alpha[y0:y0 + max(1, int((y1 - y0) * top_share))] > 0
    widths = [np.nonzero(r)[0].ptp() + 1 for r in band if r.any()]
    return max(widths)


def walking_hat_width(npc: str) -> int:
    im = np.asarray(Image.open(NPC_DIR / f"{npc}.png").convert("RGBA"))
    w, h = CHAR["canvas"]
    return hat_width(im[0:h, 0:w, 3])


def sit_sheet(npc: str) -> Image.Image:
    cells = grid(SRC / "postures" / f"{npc}.png", 3, 4)
    front, side, back = cells[0][0], cells[1][0], cells[2][0]
    scale = walking_hat_width(npc) / hat_width(front[0][..., 3])
    canvas, pad = CHAR["canvas"], CHAR["bottom_pad"]
    down, side_im, up = (place(a, sh, bbox(a), scale, canvas, "bottom", pad) for a, sh in (front, side, back))
    looks_left = faces_left(side[0]) is not False
    left = side_im if looks_left else ImageOps.mirror(side_im)
    right = ImageOps.mirror(left)
    return sheet([im for im in (down, left, right, up) for _ in range(4)], 4)


def import_postures() -> list[str]:
    done, files = [], []
    for path in sorted((SRC / "postures").glob("*.png")):
        npc = path.stem
        if not (NPC_DIR / f"{npc}.png").exists():
            continue
        rel = f"sprites/npcs/{npc}_sit.png"
        sit_sheet(npc).save(PUB / rel)
        w, h = CHAR["canvas"]
        files.append({"type": "spritesheet", "key": f"{npc}_sit", "url": rel,
                      "frameConfig": {"frameWidth": w, "frameHeight": h}, "hd": True})
        done.append(f"postures/{npc}")
    pack_path = PUB / "sprites" / "pack.json"
    pack = json.loads(pack_path.read_text())
    new = {f["key"] for f in files}
    pack["generated"]["files"] = [f for f in pack["generated"]["files"] if f["key"] not in new] + files
    pack_path.write_text(json.dumps(pack, indent=1))
    return done


if __name__ == "__main__":
    print("\n".join(import_postures()))
