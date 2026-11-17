"""Graphics x2, batch 4: nature props, furniture, crops, Vietnamese plants,
the horror sprites and the extra trees, redrawn at double resolution
through hd_canvas (same layout, finer lines).
"""
from __future__ import annotations

from . import crops, extra_trees, furniture, horror, nature, vn_nature
from .hd_canvas import hd_modules, mark_hd


def make_nature_hd() -> list[dict]:
    files: list[dict] = []
    with hd_modules(nature, furniture, crops, vn_nature, horror, extra_trees):
        for make in (nature.make_nature, furniture.make_furniture, crops.make_crops, vn_nature.make_vn_nature,
                     horror.make_horror, extra_trees.make_extra_trees):
            files += make()
    return mark_hd(files)
