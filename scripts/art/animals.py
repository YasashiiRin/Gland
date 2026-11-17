"""Farm animals and the tiger, seen from the side, drawn freehand in code in
the ink-outline style. Each is a 2-frame walk cycle (legs apart / together)
saved as a horizontal strip; the game flips it to face left/right.
"""
from __future__ import annotations

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow


def _legs(im: Image.Image, xs: list[int], top: int, bottom: int, c, frame: int) -> None:
    for i, x in enumerate(xs):
        off = (1 if (i + frame) % 2 else -1) if frame else 0
        rect(im, x + off, top, x + off + 1, bottom, c)


def chicken(frame: int) -> Image.Image:
    im = new(16, 16)
    soft_shadow(im, 8, 14, 5, 1.5)
    white, shade_c = (246, 240, 228), (210, 200, 186)
    disc(im, 7, 9, 4.5, white, squash=0.75)
    disc(im, 6, 10, 3, shade_c, squash=0.6)
    disc(im, 11, 6, 2.6, white)
    put(im, 12, 5, (30, 24, 20)); rect(im, 14, 6, 14, 6, (240, 170, 40)); put(im, 13, 6, (240, 170, 40))
    rect(im, 10, 3, 11, 3, (220, 50, 40)); put(im, 11, 8, (220, 50, 40))
    rect(im, 2, 6, 3, 8, shade_c)                                       # tail
    _legs(im, [6, 9], 12, 14, (230, 160, 40), frame)
    outline(im)
    return im


def _quadruped(body, belly, head_c, frame: int, w: int = 32, horns: str = "", spots=None, snout=None) -> Image.Image:
    im = new(w, 24)
    soft_shadow(im, w // 2, 22, w // 2 - 3, 2)
    disc(im, 14, 12, 9, body, squash=0.55)
    disc(im, 13, 14, 7, belly, squash=0.4)
    if spots:
        for sx, sy, r in ((10, 10, 2.5), (17, 13, 2)):
            disc(im, sx, sy, r, spots)
    disc(im, 24, 11, 4.2, head_c)
    disc(im, 27, 13, 2.6, snout or shade(head_c, 1.15))
    put(im, 25, 9, (24, 20, 18))
    if horns == "buffalo":
        for i in range(7):
            put(im, 22 - i, 7 - i // 2, (226, 214, 190)); put(im, 25 + i // 2, 6 - i // 3, (226, 214, 190))
    elif horns == "cow":
        put(im, 22, 6, (236, 226, 200)); put(im, 22, 5, (236, 226, 200)); put(im, 26, 6, (236, 226, 200))
    put(im, 21, 8, shade(head_c, 0.8)); put(im, 20, 9, shade(head_c, 0.8))   # ear
    rect(im, 4, 9, 5, 15, shade(body, 0.75))                                # tail
    _legs(im, [7, 10, 17, 20], 16, 21, shade(body, 0.7), frame)
    outline(im)
    return im


def pig(frame: int) -> Image.Image:
    c = (240, 176, 172)
    return _quadruped(c, shade(c, 1.1), c, frame, snout=(228, 136, 140))


def cow(frame: int) -> Image.Image:
    return _quadruped((196, 140, 84), (226, 196, 150), (186, 130, 76), frame, horns="cow", spots=(246, 236, 218))


def buffalo(frame: int) -> Image.Image:
    return _quadruped((86, 86, 96), (110, 108, 116), (80, 80, 90), frame, horns="buffalo", snout=(120, 114, 120))


def tiger(frame: int) -> Image.Image:
    im = new(40, 24)
    soft_shadow(im, 20, 22, 17, 2)
    orange, light, stripe = (232, 134, 48), (250, 226, 190), (40, 26, 22)
    disc(im, 18, 13, 11, orange, squash=0.45)
    disc(im, 17, 15, 8, light, squash=0.3)
    for x in range(10, 28, 4):                                               # stripes
        rect(im, x, 9, x, 12, stripe); put(im, x + 1, 13, stripe)
    disc(im, 31, 11, 5, orange)
    disc(im, 34, 13, 2.8, light)
    put(im, 32, 9, (250, 230, 80)); put(im, 33, 9, (24, 20, 18))
    for x in (29, 31):
        rect(im, x, 6, x, 7, stripe)
    put(im, 28, 6, orange); put(im, 33, 6, orange)                           # ears
    for i in range(8):                                                       # tail curling up
        put(im, 6 - i // 2, 12 - i, orange if i % 3 else stripe)
    _legs(im, [9, 13, 22, 26], 17, 21, shade(orange, 0.8), frame)
    outline(im)
    return im


def make_animals() -> list[dict]:
    files = []
    for key, draw, w, h in (("chicken", chicken, 16, 16), ("pig", pig, 32, 24), ("cow", cow, 32, 24),
                            ("buffalo", buffalo, 32, 24), ("tiger", tiger, 40, 24)):
        strip = new(w * 2, h)
        for f in range(2):
            strip.alpha_composite(draw(f), (f * w, 0))
        rel = f"sprites/animals/{key}.png"
        save(strip, rel)
        files.append({"type": "spritesheet", "key": f"animal_{key}", "url": rel, "frameConfig": {"frameWidth": w, "frameHeight": h}})
    return files
