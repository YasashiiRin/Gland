"""Graphics x2, batch 3: houses, town buildings and props, market stalls and
every landmark, redrawn at double resolution through hd_canvas (same layout,
finer lines). Market vendors use the HD character sheets.
"""
from __future__ import annotations

from . import (buildings, landmarks_hoi_an, landmarks_hue_danang, landmarks_north, landmarks_qb, landmarks_qb2,
               landmarks_south, market, old_village, provinces, town_buildings, town_props)
from .characters import Look
from .characters_hd import frame as frame_hd
from .hd_canvas import HdImage, hd_modules, mark_hd

MODULES = (buildings, town_buildings, town_props, market, provinces, landmarks_hue_danang, landmarks_hoi_an,
           landmarks_north, landmarks_south, landmarks_qb, landmarks_qb2, old_village)
MAKERS = (buildings.make_buildings, market.make_market, provinces.make_province_art,
          landmarks_hue_danang.make_hue_danang_art, landmarks_hoi_an.make_hoi_an_art,
          landmarks_north.make_north_landmarks, landmarks_south.make_south_landmarks,
          landmarks_qb.make_qb_landmarks, landmarks_qb2.make_qb2_landmarks,
          town_buildings.make_town_buildings, town_props.make_town_props, old_village.make_old_village)


def _vendor_frame(lk: Look, direction: str, step: int) -> HdImage:
    return HdImage(16, 32, frame_hd(lk, direction, step))


def make_buildings_hd() -> list[dict]:
    files: list[dict] = []
    with hd_modules(*MODULES, extra={"frame": _vendor_frame}):
        for make in MAKERS:
            files += make()
    return mark_hd(files)
