"""Extra tree sprites for the big maps: the mangrove (cây đước) of Huế's Rú Chá
forest on the Tam Giang lagoon. Drawn freehand in code.
"""
from __future__ import annotations

from PIL import Image

from .common import disc, new, outline, put, rect, save, soft_shadow


def mangrove() -> Image.Image:
    """Cây đước of Cần Giờ: a dense crown on a fan of arching stilt roots."""
    im = new(48, 64)
    soft_shadow(im, 24, 60, 15, 3, alpha=75)
    for i in range(-4, 5):  # stilt roots
        for t in range(16):
            x = 24 + i * t * 0.5
            y = 44 + t - (t * t) / 32 * (1 if abs(i) > 1 else 0)
            put(im, round(x), round(min(60, y)), (110, 84, 60))
    rect(im, 22, 30, 25, 46, (110, 84, 60))
    for cx, cy, r in ((24, 22, 14), (12, 28, 9), (36, 28, 9)):
        disc(im, cx, cy, r, (46, 90, 52)); disc(im, cx - 2, cy - 3, r - 3, (66, 116, 62)); disc(im, cx - 4, cy - 5, r * 0.3, (100, 146, 80))
    outline(im, 0.5)
    return im


def make_extra_trees() -> list[dict]:
    save(mangrove(), "sprites/trees/mangrove.png")
    return [{"type": "image", "key": "tree_mangrove", "url": "sprites/trees/mangrove.png"}]
