"""HD farm animals and the tiger (graphics x2): the same side-view, 2-frame
walk strips as animals.py at twice the size (chicken 32x32, cattle and pig
64x48, tiger 80x48), with lit backs, shaded bellies, eyes with a
catch-light, hooves, nostrils and fur strokes.
"""
from __future__ import annotations

import math
import random

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow

EYE, EYE_HI = (24, 20, 18), (250, 246, 240)


def eye(im: Image.Image, x: int, y: int) -> None:
    rect(im, x, y, x + 1, y + 1, EYE)
    put(im, x, y, EYE_HI)


def legs(im: Image.Image, xs: list[int], top: int, bottom: int, c, hoof, frame: int, w: int = 3) -> None:
    for i, x in enumerate(xs):
        off = (2 if (i + frame) % 2 else -2) if frame else 0
        far = i in (1, 3)  # legs on the far side are darker
        col = shade(c, 0.8) if far else c
        rect(im, x + off, top, x + off + w - 1, bottom - 2, col)
        rect(im, x + off + w - 1, top, x + off + w - 1, bottom - 2, shade(col, 0.82))
        rect(im, x + off, bottom - 1, x + off + w - 1, bottom, hoof)


def lit_body(im: Image.Image, cx: float, cy: float, r: float, c, squash: float) -> None:
    disc(im, cx, cy, r, shade(c, 0.86), squash=squash)
    disc(im, cx - 1, cy - 1.5, r * 0.94, c, squash=squash * 0.94)
    disc(im, cx - r * 0.2, cy - r * squash * 0.45, r * 0.6, shade(c, 1.12), squash=squash * 0.5)


def chicken(frame: int) -> Image.Image:
    im = new(32, 32)
    soft_shadow(im, 16, 28, 10, 3)
    white, mid, dark = (248, 242, 230), (222, 212, 196), (186, 174, 158)
    rect(im, 3, 10, 7, 17, mid); rect(im, 2, 9, 4, 12, white); put(im, 5, 9, dark)       # tail feathers
    legs(im, [12, 18], 24, 29, (236, 168, 44), (200, 130, 30), frame, w=2)
    lit_body(im, 14, 18, 9, white, 0.72)
    disc(im, 12, 20, 6, mid, squash=0.55)                                                 # wing
    for k in range(3):
        rect(im, 8 + k * 3, 21 + k, 10 + k * 3, 21 + k, dark)
    disc(im, 22, 11, 5, white)
    disc(im, 21, 12, 3.4, shade(white, 0.96))
    eye(im, 23, 9)
    for x, y in ((25, 12), (26, 12), (27, 12), (25, 13), (26, 13)):                       # beak
        put(im, x, y, (240, 172, 44) if y == 12 else (200, 130, 30))
    for x in (20, 22, 24):                                                                # comb
        rect(im, x, 5, x + 1, 6, (222, 52, 44)); put(im, x, 4, (244, 96, 80))
    rect(im, 23, 15, 24, 17, (216, 50, 42))                                               # wattle
    outline(im)
    return im


def quadruped(body, belly, head_c, frame: int, horns: str = "", spots=None, snout=None, hoof=(52, 40, 34)) -> Image.Image:
    rnd = random.Random(7)
    im = new(64, 48)
    soft_shadow(im, 30, 44, 26, 3.5)
    rect(im, 7, 18, 9, 31, shade(body, 0.74)); disc(im, 8, 32, 2, shade(body, 0.5))      # tail + tuft
    legs(im, [14, 21, 36, 42], 31, 43, shade(body, 0.82), hoof, frame, w=4)
    lit_body(im, 28, 24, 18, body, 0.55)
    disc(im, 27, 29, 13, belly, squash=0.32)
    if spots:
        for sx, sy, r in ((19, 20, 5), (34, 26, 4), (27, 17, 3)):
            disc(im, sx, sy, r, spots, squash=0.8)
    for _ in range(14):                                                                   # fur strokes
        x, y = rnd.randint(14, 42), rnd.randint(16, 28)
        if im.getpixel((x, y))[3]:
            put(im, x, y, shade(body, 0.9)); put(im, x + 1, y + 1, shade(body, 0.9))
    disc(im, 48, 22, 8.4, shade(head_c, 0.86))                                            # head
    disc(im, 47, 21, 7.6, head_c)
    disc(im, 45, 18, 3.5, shade(head_c, 1.12))
    sn = snout or shade(head_c, 1.15)
    disc(im, 54, 26, 5, sn)
    put(im, 55, 25, shade(sn, 0.55)); put(im, 57, 26, shade(sn, 0.55))                    # nostrils
    rect(im, 53, 29, 56, 29, shade(sn, 0.7))                                               # mouth
    eye(im, 49, 18)
    disc(im, 41, 17, 2.6, shade(head_c, 0.78), squash=0.6)                                # ear
    horn_c, horn_d = (232, 222, 198), (196, 180, 150)
    if horns == "buffalo":   # long backswept crescents
        for i in range(14):
            put(im, 44 - i, 14 - i // 2 - (i * i) // 40, horn_c if i < 10 else horn_d)
            put(im, 44 - i, 15 - i // 2 - (i * i) // 40, horn_d)
            put(im, 50 + i // 2, 13 - i // 2, horn_c if i < 10 else horn_d)
    elif horns == "cow":
        rect(im, 43, 11, 44, 14, horn_c); put(im, 43, 10, horn_d)
        rect(im, 51, 12, 52, 14, horn_c); put(im, 52, 11, horn_d)
    outline(im)
    return im


def pig(frame: int) -> Image.Image:
    c = (240, 178, 172)
    im = quadruped(c, shade(c, 1.08), c, frame, snout=(230, 140, 144), hoof=(150, 96, 90))
    for i in range(5):  # curly tail
        a = i * 1.4
        put(im, round(8 + math.cos(a) * 2), round(19 + math.sin(a) * 2), shade(c, 0.7))
    return im


def cow(frame: int) -> Image.Image:
    return quadruped((198, 142, 86), (228, 198, 152), (188, 132, 78), frame, horns="cow", spots=(246, 236, 218))


def buffalo(frame: int) -> Image.Image:
    return quadruped((84, 84, 96), (108, 106, 116), (78, 78, 90), frame, horns="buffalo", snout=(118, 112, 120))


def tiger(frame: int) -> Image.Image:
    im = new(80, 48)
    soft_shadow(im, 40, 44, 34, 3.5)
    orange, light, stripe = (232, 134, 48), (250, 228, 194), (38, 26, 22)
    for i in range(18):                                                                   # tail curling up
        x, y = 13 - i // 2, 24 - i
        rect(im, x, y, x + 1, y, stripe if i % 5 in (3, 4) else orange)
    legs(im, [18, 26, 46, 53], 32, 43, shade(orange, 0.86), light, frame, w=4)
    lit_body(im, 36, 26, 22, orange, 0.45)
    disc(im, 34, 31, 16, light, squash=0.25)
    for x in range(20, 54, 6):                                                            # stripes
        for k in range(8):
            put(im, x + k // 3, 18 + k, stripe); put(im, x + 1 + k // 3, 18 + k, stripe)
    disc(im, 62, 22, 10, shade(orange, 0.86))                                             # head
    disc(im, 61, 21, 9.2, orange)
    disc(im, 67, 26, 5.4, light)
    disc(im, 57, 28, 4, light)
    rect(im, 70, 25, 71, 26, (60, 40, 40))                                                # nose
    rect(im, 64, 18, 66, 19, (250, 222, 70)); put(im, 65, 18, EYE); put(im, 65, 19, EYE)  # eye
    for x in (57, 60, 63):
        rect(im, x, 12, x, 16, stripe)
    for ex in (55, 65):                                                                   # ears
        disc(im, ex, 13, 2.6, orange); put(im, ex, 13, light)
    for k in range(3):                                                                    # whiskers
        rect(im, 70, 28 + k, 74, 28 + k, (230, 220, 210))
    outline(im)
    return im


def make_animals_hd() -> list[dict]:
    files = []
    for key, draw, w, h in (("chicken", chicken, 32, 32), ("pig", pig, 64, 48), ("cow", cow, 64, 48),
                            ("buffalo", buffalo, 64, 48), ("tiger", tiger, 80, 48)):
        strip = new(w * 2, h)
        for f in range(2):
            strip.alpha_composite(draw(f), (f * w, 0))
        rel = f"sprites/animals/{key}.png"
        save(strip, rel)
        files.append({"type": "spritesheet", "key": f"animal_{key}", "url": rel,
                      "frameConfig": {"frameWidth": w, "frameHeight": h}, "hd": True})
    return files
