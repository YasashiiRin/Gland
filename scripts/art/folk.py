"""Graphics step 4: people and things that move about the villages (ambient life).

- folk_0..5: villagers in áo bà ba, most under a nón lá, walking the roads of
  towns and landmarks (same 4x4 walk sheet as the named villagers, x2).
- plough: the wooden plough a buffalo drags through the paddies, drawn
  facing right (the buffalo walks ahead of it, the ploughman behind).
The bicycle they ride is in vehicles.py ("bicycle").
"""
from __future__ import annotations

from PIL import Image

from . import characters_hd
from .characters import Look
from .common import new, outline, put, rect, save, shade
from .hd_canvas import hd_modules, mark_hd

FOLK = [
    Look(skin=(214, 166, 130), hair=(40, 32, 28), shirt=(66, 70, 96), legs=(40, 38, 44), hat=True),
    Look(skin=(226, 178, 144), hair=(52, 36, 30), shirt=(150, 70, 60), legs=(44, 40, 46), hair_style="bun", hat=True),
    Look(skin=(206, 156, 120), hair=(156, 150, 142), shirt=(110, 92, 64), legs=(56, 52, 50), hair_style="grey", hat=True),
    Look(skin=(232, 186, 152), hair=(34, 28, 32), shirt=(226, 220, 204), legs=(46, 44, 50), hair_style="long", hat=True),
    Look(skin=(220, 170, 136), hair=(44, 34, 30), shirt=(84, 112, 80), legs=(52, 48, 46)),
    Look(skin=(228, 182, 148), hair=(40, 30, 28), shirt=(120, 96, 140), legs=(40, 36, 44), hair_style="bun",
         apron=(210, 196, 170)),
]
WOOD = (130, 88, 52)


def plough() -> Image.Image:
    """A wooden plough seen from the side: shaft forward to the yoke, handle back, iron share in the mud."""
    im = new(24, 16)
    for i in range(14):                                     # shaft rising to the right, towards the buffalo
        put(im, 9 + i, 11 - i // 3, WOOD); put(im, 9 + i, 12 - i // 3, shade(WOOD, 0.75))
    rect(im, 6, 9, 9, 13, WOOD)                             # body
    for i in range(7):                                      # handle up and back, for the ploughman
        put(im, 6 - i // 2, 9 - i, shade(WOOD, 1.15)); put(im, 7 - i // 2, 9 - i, WOOD)
    rect(im, 8, 13, 13, 14, (120, 120, 126)); put(im, 14, 14, (150, 150, 156))   # iron share
    rect(im, 2, 14, 12, 15, (96, 74, 52))                   # turned earth behind it
    outline(im, 0.45)
    return im


def ganh() -> Image.Image:
    """A hawker's shoulder pole (đòn gánh) with a round flat basket hanging at each end."""
    im = new(40, 22)
    rect(im, 1, 4, 38, 5, (150, 112, 60)); rect(im, 1, 4, 38, 4, (186, 146, 86))      # the bamboo pole
    for cx in (5, 34):
        rect(im, cx - 3, 6, cx - 3, 13, (110, 90, 60)); rect(im, cx + 3, 6, cx + 3, 13, (110, 90, 60))
        rect(im, cx - 5, 14, cx + 5, 19, (176, 140, 80)); rect(im, cx - 5, 14, cx + 5, 14, (206, 172, 106))  # basket
        for x in range(cx - 4, cx + 5, 2):
            put(im, x, 16, (140, 106, 56))
        rect(im, cx - 4, 12, cx + 4, 13, (230, 220, 190) if cx < 20 else (120, 160, 80))   # goods on top
    outline(im, 0.45)
    return im


def make_folk_hd() -> list[dict]:
    files = []
    for i, look in enumerate(FOLK):
        rel = f"sprites/npcs/folk_{i}.png"
        save(characters_hd.sheet(look), rel)
        files.append({"type": "spritesheet", "key": f"folk_{i}", "url": rel,
                      "frameConfig": {"frameWidth": characters_hd.FW, "frameHeight": characters_hd.FH}, "hd": True})
    import sys
    with hd_modules(sys.modules[__name__]):
        save(plough(), "sprites/props/plough.png")
        save(ganh(), "sprites/props/ganh.png")
    files += mark_hd([{"type": "image", "key": "prop_plough", "url": "sprites/props/plough.png"},
                      {"type": "image", "key": "prop_ganh", "url": "sprites/props/ganh.png"}])
    return files
