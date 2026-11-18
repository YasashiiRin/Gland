"""
Edge tiles built from one picture of the top edge (assets/tiles/edge_*.png):
the strip of bank along the top is cut off and turned for the other sides,
then laid over the plain tile, for each of the 16 neighbour masks.
"""
from pathlib import Path
from typing import Callable

import numpy as np
from PIL import Image

from . import tiles as t
from . import water_tiles as wt
from .asset_import import find, hide_sparkle, load, sprite

S = 32
N, E, SO, W = 1, 2, 4, 8


def bank_strip(path: Path) -> Image.Image:
    """The top rows of the edge picture (shrunk to one tile) that are not yet the plain ground below."""
    a = hide_sparkle(load(path))
    small = Image.fromarray(a.astype(np.uint8)).resize((S, S), Image.BOX).convert("RGBA")
    px = np.asarray(small).astype(np.float32)[..., :3]
    plain = px[S - 8:].reshape(-1, 3).mean(axis=0)
    far = np.abs(px.mean(axis=1) - plain).sum(axis=1) > 40
    k = int(np.nonzero(far)[0].max()) + 2 if far.any() else S // 4
    return small.crop((0, 0, S, min(k, S // 2)))


def compose(base: Image.Image, strip: Image.Image, mask: int) -> Image.Image:
    im = base.copy()
    k = strip.height
    thin = strip.crop((0, 0, S, max(2, round(k * 0.7))))
    if mask & W:
        im.alpha_composite(thin.rotate(90, expand=True), (0, 0))
    if mask & E:
        side = thin.rotate(-90, expand=True)
        im.alpha_composite(side, (S - side.width, 0))
    if mask & SO:
        low = thin.transpose(Image.FLIP_TOP_BOTTOM)
        im.alpha_composite(low, (0, S - low.height))
    if mask & N:
        im.alpha_composite(strip, (0, 0))
    return im


def edge_tiles(plain: Callable[[str], Image.Image | None]) -> dict[int, Image.Image]:
    """Tileset index -> new tile, for every edge set whose pictures exist."""
    out: dict[int, Image.Image] = {}
    for picture, ground, first in (("edge_water_bank", "water", t.WATER_EDGE),
                                   ("edge_quay", "water", wt.QUAY_EDGE),
                                   ("edge_path", "path", t.PATH_EDGE)):
        p = find(f"tiles/{picture}.png")
        base = plain(ground)
        if not p or base is None:
            continue
        strip = bank_strip(p)
        for mask in range(1, 16):
            out[first + mask] = compose(base, strip, mask)
    return out


def overlay_tile(path: Path, _under: Image.Image) -> Image.Image:
    """A rock, bush, clump of rice… standing on one tile, transparent around it."""
    return sprite(path, (S, S), margin=1, bottom_pad=1)
