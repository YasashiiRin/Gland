"""Night horror sprites: the white lady, the shadow that follows you, a
drowned hand from the pond, and the (rare) jump-scare face. Drawn freehand
in code, inspired by Vietnamese ghost folklore in general, nothing copied.
"""
from __future__ import annotations

import random

from PIL import Image

from .common import disc, new, outline, put, rect, save, shade, soft_shadow

PALE = (226, 230, 232)
PALE_D = (176, 184, 192)
HAIR = (14, 12, 16)


def ghost() -> Image.Image:
    """Woman in a long white dress, black hair hanging over her face, no feet."""
    im = new(16, 32)
    for y in range(13, 31):                                  # dress, fraying into mist at the hem
        half = 3 + (y - 13) // 5
        for x in range(8 - half, 8 + half):
            if y > 26 and (x + y) % 3 == 0:
                continue
            put(im, x, y, PALE if x < 8 + half - 2 else PALE_D)
    rect(im, 3, 15, 3, 22, PALE_D); rect(im, 12, 15, 12, 22, PALE_D)   # limp arms
    rect(im, 3, 23, 3, 24, (210, 214, 216)); rect(im, 12, 23, 12, 24, (210, 214, 216))
    rect(im, 5, 3, 10, 12, HAIR)                              # hair over the face
    rect(im, 4, 5, 11, 20, HAIR)
    for x in (4, 6, 9, 11):
        rect(im, x, 20, x, 22 + (x % 3), HAIR)
    put(im, 7, 9, (60, 60, 64)); put(im, 8, 10, (200, 200, 205))       # a glimpse of an eye
    outline(im, 0.3)
    return im


def shadow_figure() -> Image.Image:
    im = new(16, 32)
    dark = (8, 8, 12)
    disc(im, 8, 8, 4.2, dark)
    rect(im, 4, 12, 11, 27, dark)
    rect(im, 3, 14, 3, 25, dark); rect(im, 12, 14, 12, 25, dark)
    rect(im, 5, 27, 6, 30, dark); rect(im, 9, 27, 10, 30, dark)
    put(im, 6, 8, (150, 20, 20)); put(im, 9, 8, (150, 20, 20))
    soft = new(16, 32)
    soft_shadow(soft, 8, 30, 6, 1.5, alpha=90)
    soft.alpha_composite(im)
    return soft


def hand() -> Image.Image:
    im = new(12, 18)
    rect(im, 4, 8, 8, 17, PALE_D)                              # forearm
    rect(im, 3, 4, 9, 9, PALE)                                 # palm
    for i, x in enumerate((3, 5, 7, 9)):
        rect(im, x, 0 + (1 if i in (0, 3) else 0), x, 4, PALE)  # long fingers
    put(im, 2, 6, PALE)
    for y in range(9, 17, 3):
        put(im, 5, y, (120, 140, 150))                          # waterlogged veins
    outline(im, 0.35)
    return im


def scare_face() -> Image.Image:
    """Pale face with hollow eyes and an open mouth, framed by long hair."""
    rnd = random.Random(13)
    im = new(64, 64)
    rect(im, 6, 0, 57, 63, HAIR)
    for y in range(6, 60):                                     # face oval with grey shading
        for x in range(12, 52):
            if ((x - 32) / 18) ** 2 + ((y - 32) / 25) ** 2 <= 1:
                f = 1.0 - abs(x - 32) / 60
                put(im, x, y, shade(PALE, f * 0.95))
    for (cx, cy) in ((24, 26), (40, 26)):                      # hollow eyes
        disc(im, cx, cy, 5.5, (20, 18, 22), squash=1.2)
        disc(im, cx, cy - 1, 1.2, (230, 230, 230))
        rect(im, cx - 1, cy + 6, cx, cy + 14, (60, 50, 56))    # dark tear streaks
    disc(im, 32, 46, 6, (24, 10, 12), squash=1.6)               # gaping mouth
    for x in range(28, 37, 2):
        put(im, x, 41, (200, 196, 186))
    for _ in range(20):                                         # hair strands across the face
        x = rnd.randrange(12, 52)
        for y in range(rnd.randrange(0, 10), rnd.randrange(30, 60)):
            if rnd.random() < 0.85:
                put(im, x + (y // 17), y, HAIR)
    return im


def make_horror() -> list[dict]:
    files = []
    for key, draw, rel in [("horror_ghost", ghost, "horror/ghost.png"), ("horror_shadow", shadow_figure, "horror/shadow.png"),
                           ("horror_hand", hand, "horror/hand.png"), ("horror_face", scare_face, "horror/face.png")]:
        save(draw(), f"sprites/{rel}")
        files.append({"type": "image", "key": key, "url": f"sprites/{rel}"})
    return files
