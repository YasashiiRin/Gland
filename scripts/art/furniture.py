"""Interior furniture sprites for the farmhouse (bed, kitchen, fireplace...).

Each piece is drawn in 3/4 view and anchored at its bottom edge; pieces that
stand against the back wall are taller than their floor footprint so their
upper part overlaps the wall, like real furniture would.
"""
from __future__ import annotations

from PIL import Image

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

WOOD = (126, 84, 54)
WOOD_L = shade(WOOD, 1.2)
WOOD_D = shade(WOOD, 0.7)


def _box(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c, top_h: int = 3) -> None:
    rect(im, x0, y0, x1, y1, c)
    rect(im, x0, y0, x1, y0 + top_h - 1, shade(c, 1.18))
    rect(im, x1, y0 + top_h, x1, y1, shade(c, 0.72))
    rect(im, x0, y1, x1, y1, shade(c, 0.6))


def bed() -> Image.Image:
    im = new(32, 40)
    soft_shadow(im, 16, 38, 15, 2)
    _box(im, 1, 0, 30, 12, WOOD)                                  # headboard
    rect(im, 4, 3, 27, 9, WOOD_D)
    rect(im, 2, 10, 29, 37, (232, 226, 210))                      # sheet
    rect(im, 5, 11, 26, 17, (248, 244, 234)); rect(im, 5, 17, 26, 17, (204, 196, 180))  # pillow
    for y in range(20, 36):                                       # quilt with a simple patch pattern
        for x in range(2, 30):
            c = (178, 70, 60) if ((x // 4) + (y // 4)) % 2 else (196, 150, 70)   # flowered quilt
            put(im, x, y, c if y > 20 else shade(c, 1.15))
    rect(im, 29, 20, 29, 35, shade((112, 138, 168), 0.7))
    _box(im, 1, 35, 30, 39, WOOD, top_h=1)                        # footboard
    outline(im, 0.45)
    # mosquito net ("màn") tied up over the head of the bed
    for y in range(0, 22):
        for x in range(2, 30):
            if (x + y) % 3 == 0 and (y < 4 or x < 6 or x > 25):
                put(im, x, y, (246, 244, 236))
    rect(im, 2, 0, 29, 1, (246, 244, 236))
    return im


def table() -> Image.Image:
    im = new(32, 28)
    soft_shadow(im, 16, 26, 15, 2)
    rect(im, 3, 12, 4, 26, WOOD_D); rect(im, 27, 12, 28, 26, WOOD_D)
    _box(im, 1, 4, 30, 14, WOOD, top_h=9)
    disc(im, 14, 6, 3, (236, 232, 222)); rect(im, 17, 5, 18, 5, (236, 232, 222))       # teapot
    rect(im, 13, 2, 15, 3, (200, 196, 186))
    for x in (6, 9, 21, 24):
        rect(im, x, 7, x + 1, 8, (236, 232, 222))                                         # cups
    outline(im, 0.45)
    return im


def chair() -> Image.Image:
    im = new(16, 24)
    soft_shadow(im, 8, 22, 6, 1.5)
    _box(im, 3, 0, 12, 12, WOOD, top_h=2)
    rect(im, 5, 3, 10, 9, WOOD_D)
    _box(im, 2, 12, 13, 16, WOOD_L, top_h=3)
    rect(im, 3, 17, 3, 22, WOOD_D); rect(im, 12, 17, 12, 22, WOOD_D)
    outline(im, 0.45)
    return im


def dish_cabinet() -> Image.Image:
    """Wooden dish cabinet ("chạn bát") with lattice doors."""
    im = new(32, 36)
    _box(im, 0, 0, 31, 35, WOOD, top_h=2)
    for x0 in (2, 17):
        rect(im, x0, 4, x0 + 12, 20, (60, 44, 34))
        for x in range(x0 + 1, x0 + 12, 3):
            rect(im, x, 4, x, 20, WOOD_L)
        for y in range(6, 20, 4):
            rect(im, x0, y, x0 + 12, y, WOOD_L)
    rect(im, 2, 23, 29, 33, WOOD_D); rect(im, 15, 23, 16, 33, WOOD)
    disc(im, 8, 13, 2, (236, 232, 222)); disc(im, 23, 12, 2, (110, 150, 180))       # bowls behind the lattice
    outline(im, 0.45)
    return im


def kitchen_stove() -> Image.Image:
    """Wood-fire kitchen: three-stone hearth ("kiềng") with a clay pot."""
    im = new(16, 24)
    soft_shadow(im, 8, 22, 7, 1.5)
    rect(im, 2, 17, 13, 21, P["r1"]); rect(im, 2, 17, 13, 17, P["r2"])
    rect(im, 5, 18, 10, 20, (240, 140, 50)); put(im, 7, 18, (252, 220, 120))
    for x in (2, 7, 12):
        rect(im, x, 13, x + 1, 17, P["r0"])
    disc(im, 8, 10, 5, (124, 70, 44)); disc(im, 6, 8, 2, (160, 100, 70))             # clay pot
    rect(im, 4, 4, 11, 5, (90, 52, 34))
    rect(im, 0, 21, 5, 22, P["k2"]); rect(im, 11, 22, 15, 23, P["k2"])              # firewood
    outline(im, 0.45)
    return im


def tea_cabinet() -> Image.Image:
    """Low carved cabinet ("tủ chè") with a tea set and a vase of lotus."""
    im = new(32, 32)
    soft_shadow(im, 16, 30, 15, 2)
    _box(im, 0, 12, 31, 30, (92, 50, 30), top_h=3)
    for x0 in (3, 17):
        rect(im, x0, 17, x0 + 11, 27, (110, 62, 38)); rect(im, x0 + 2, 19, x0 + 9, 25, (76, 40, 24))
    rect(im, 4, 7, 9, 12, (236, 232, 222)); rect(im, 3, 6, 10, 7, (200, 196, 186))  # teapot tray
    rect(im, 12, 9, 14, 12, (236, 232, 222))
    rect(im, 22, 4, 26, 12, (70, 110, 150)); rect(im, 22, 4, 22, 12, (100, 140, 180))   # vase
    disc(im, 23, 2, 2.5, (232, 150, 170)); disc(im, 26, 3, 2, (240, 180, 196))         # lotus
    rect(im, 24, 0, 24, 4, P["f2"])
    outline(im, 0.45)
    return im


def bookshelf() -> Image.Image:
    im = new(32, 40)
    _box(im, 0, 0, 31, 39, WOOD, top_h=2)
    books = [(170, 70, 64), (76, 104, 140), (200, 170, 90), (90, 126, 90), (130, 90, 130), (220, 210, 190)]
    for i, y in enumerate((4, 16, 28)):
        rect(im, 2, y, 29, y + 9, WOOD_D)
        x = 3
        while x < 28:
            w = 2 + (x * 7 + i) % 3
            c = books[(x + i * 3) % len(books)]
            rect(im, x, y + 1 + (x % 3 == 0), x + w - 1, y + 9, c)
            rect(im, x, y + 3, x + w - 1, y + 3, shade(c, 1.2))
            x += w + (1 if x % 4 == 0 else 0)
        rect(im, 2, y + 10, 29, y + 11, WOOD_L)
    outline(im, 0.45)
    return im


def plant() -> Image.Image:
    im = new(16, 24)
    soft_shadow(im, 8, 22, 5, 1.5)
    rect(im, 4, 15, 11, 22, (176, 96, 66)); rect(im, 4, 15, 11, 16, (206, 130, 92))
    for (cx, cy, r) in ((8, 8, 4), (4, 11, 3), (12, 11, 3), (8, 3, 3)):
        disc(im, cx, cy, r, P["f2"]); disc(im, cx - 1, cy - 1, r * 0.5, P["f3"])
    outline(im, 0.45)
    return im


def rug() -> Image.Image:
    """Woven sedge mat ("chiếu cói") with red patterned stripes."""
    im = new(48, 32)
    rect(im, 0, 0, 47, 31, (214, 190, 132))
    for y in range(0, 32, 2):
        rect(im, 0, y, 47, y, (200, 174, 116))
    for y0 in (3, 25):
        rect(im, 0, y0, 47, y0 + 3, (168, 52, 44))
        for x in range(1, 47, 4):
            put(im, x, y0 + 1, (230, 196, 90)); put(im, x + 1, y0 + 2, (230, 196, 90))
    for x in range(0, 48, 3):
        put(im, x, 0, (176, 150, 96)); put(im, x, 31, (176, 150, 96))
    return im


def window() -> Image.Image:
    im = new(24, 20)
    rect(im, 2, 1, 21, 17, WOOD_D)
    for y in range(2, 16):
        rect(im, 3, y, 20, y, (int(130 + 4 * y), int(176 + 3 * y), 200))
    rect(im, 11, 2, 12, 16, WOOD_D); rect(im, 3, 9, 20, 9, WOOD_D)
    rect(im, 0, 0, 5, 18, (176, 92, 86)); rect(im, 18, 0, 23, 18, (176, 92, 86))         # curtains
    rect(im, 0, 0, 23, 1, WOOD)
    rect(im, 1, 17, 22, 19, WOOD_L)
    return im


def painting() -> Image.Image:
    """Calligraphy scroll ("thư pháp") with a red seal."""
    im = new(12, 22)
    rect(im, 0, 0, 11, 1, P["k1"]); rect(im, 0, 20, 11, 21, P["k1"])
    rect(im, 1, 2, 10, 19, (236, 226, 196))
    for (x, y0, y1) in ((5, 4, 8), (4, 10, 11), (6, 10, 14), (5, 15, 16)):
        rect(im, x, y0, x, y1, (40, 32, 30)); put(im, x + 1, y0, (40, 32, 30))
    rect(im, 7, 17, 8, 18, (190, 40, 36))
    return im


def rough_bench() -> Image.Image:
    """The starting workbench: rough planks on log legs, an axe stuck in it, a coil of rope."""
    im = new(32, 26)
    soft_shadow(im, 16, 24, 15, 2)
    for x in (4, 25):
        rect(im, x, 13, x + 3, 23, (110, 76, 46)); rect(im, x, 13, x, 23, (140, 100, 62))
    rect(im, 1, 8, 30, 14, (150, 108, 66)); rect(im, 1, 8, 30, 9, (178, 134, 86))
    for x in (9, 18, 24):
        rect(im, x, 9, x, 13, (118, 82, 50))
    rect(im, 20, 2, 21, 8, P["k1"]); rect(im, 17, 2, 23, 4, (170, 172, 178))      # axe
    disc(im, 8, 7, 3, (196, 176, 120)); disc(im, 8, 7, 1.5, (150, 130, 84))        # rope coil
    rect(im, 11, 6, 16, 7, (200, 200, 206))                                          # hand saw
    outline(im, 0.45)
    return im


def carpenter_bench() -> Image.Image:
    """A proper joiner's bench with a vice and a tool rack."""
    im = new(24, 28)
    soft_shadow(im, 12, 26, 11, 2)
    rect(im, 2, 2, 21, 9, P["k1"]); rect(im, 2, 2, 21, 2, P["k2"])                   # tool rack
    for x, c in ((5, (170, 172, 178)), (9, (200, 160, 90)), (13, (170, 172, 178)), (17, (130, 90, 60))):
        rect(im, x, 3, x + 1, 8, c)
    _box(im, 0, 10, 23, 17, (152, 104, 62), top_h=3)
    rect(im, 2, 18, 4, 26, (100, 66, 40)); rect(im, 19, 18, 21, 26, (100, 66, 40))
    rect(im, 3, 22, 20, 23, (120, 82, 50))                                           # stretcher
    rect(im, 18, 8, 22, 12, (110, 112, 118)); rect(im, 19, 7, 21, 7, (150, 152, 158))  # vice
    outline(im, 0.45)
    return im


def sleeping_mat() -> Image.Image:
    """A woven sedge mat (chiếu cói) rolled out on the ground, a small pillow at the head."""
    im = new(16, 28)
    straw, dark = (222, 196, 132), (196, 166, 100)
    rect(im, 1, 4, 14, 27, straw)
    for y in range(4, 28):
        for x in range(1, 15):
            if (x + y) % 2 == 0:
                put(im, x, y, dark)                                                # the weave
    for y, c in ((7, (176, 52, 48)), (8, (176, 52, 48)), (23, (60, 120, 80)), (24, (60, 120, 80))):
        rect(im, 1, y, 14, y, c)                                                   # dyed bands
    rect(im, 3, 1, 12, 5, (236, 232, 220)); rect(im, 3, 1, 12, 1, (250, 248, 240))  # pillow
    outline(im, 0.5)
    return im


def tea_table() -> Image.Image:
    """A low bamboo table in the yard with a teapot, two cups and two little stools (32x24)."""
    im = new(32, 24)
    soft_shadow(im, 16, 21, 14, 2)
    bam, bam_d = (182, 160, 96), (140, 120, 64)
    rect(im, 8, 9, 23, 12, bam); rect(im, 8, 9, 23, 9, (210, 190, 126))                # table top
    for x in range(9, 23, 3):
        put(im, x, 11, bam_d)
    rect(im, 9, 13, 10, 19, bam_d); rect(im, 21, 13, 22, 19, bam_d)                     # legs
    disc(im, 13, 7, 2.5, (96, 120, 128)); rect(im, 15, 6, 16, 6, (96, 120, 128))         # teapot
    rect(im, 12, 4, 14, 4, (70, 90, 96))
    rect(im, 18, 7, 19, 8, (236, 232, 220)); rect(im, 20, 8, 21, 8, (236, 232, 220))    # cups
    for x in (1, 26):                                                                   # stools
        rect(im, x, 15, x + 4, 16, bam); rect(im, x, 17, x, 20, bam_d); rect(im, x + 4, 17, x + 4, 20, bam_d)
    outline(im, 0.45)
    return im


def chicken_coop() -> Image.Image:
    """A small bamboo chicken coop with a thatched lid (chuồng gà), 32x28."""
    im = new(32, 28)
    soft_shadow(im, 16, 26, 14, 2)
    rect(im, 3, 12, 28, 25, (150, 118, 66))
    for x in range(4, 28, 3):
        rect(im, x, 12, x, 25, (110, 84, 44))                                            # slats
    rect(im, 12, 18, 18, 25, (60, 44, 30))                                              # little door
    for y in range(3, 13):                                                              # thatched lid
        inset = (12 - y) // 2
        rect(im, 1 + inset, y, 30 - inset, y, (200, 170, 100) if y % 2 else (168, 136, 76))
    outline(im, 0.45)
    return im


PIECES = {"bed": bed, "table": table, "chair": chair, "dish_cabinet": dish_cabinet,
          "kitchen_stove": kitchen_stove, "tea_cabinet": tea_cabinet, "bookshelf": bookshelf,
          "plant": plant, "rug": rug, "window": window, "painting": painting,
          "rough_bench": rough_bench, "carpenter_bench": carpenter_bench,
          "sleeping_mat": sleeping_mat, "tea_table": tea_table, "chicken_coop": chicken_coop}


def make_furniture() -> list[dict]:
    files = []
    for name, draw in PIECES.items():
        rel = f"sprites/furniture/{name}.png"
        save(draw(), rel)
        files.append({"type": "image", "key": f"prop_{name}", "url": rel})
    return files
