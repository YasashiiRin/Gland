"""HD walking characters (graphics x2): 32x64 frames, 4 columns x 4 rows
(down, left, right, up), shown at half size so they keep the 16x32 footprint
(feet at y=56 of 64, like 28 of 32) with twice the detail: eyes with a
catch-light, eyebrows, hair strands, buttons and pockets on the áo bà ba,
cloth folds and a ribbed conical hat. Uses the same `Look` palettes as the
1x sheets (characters.py).
"""
from __future__ import annotations

from PIL import Image, ImageOps

from .characters import PLAYER, VILLAGERS, Look
from .common import disc, new, outline, put, rect, save, shade, soft_shadow

FW, FH = 32, 64
CX = 15.5
EYE, EYE_HI = (34, 26, 30), (250, 246, 240)
STRAW, STRAW_D, STRAW_L, STRAW_RIB = (218, 196, 138), (172, 148, 96), (242, 228, 180), (192, 168, 112)
TRANSPARENT = (0, 0, 0, 0)


def shaded(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c, light: bool = True) -> None:
    """A box lit from the top-left: a light left column, a two-column shadow on the right."""
    rect(im, x0, y0, x1, y1, c)
    if light:
        rect(im, x0, y0, x0, y1, shade(c, 1.14))
    rect(im, x1 - 1, y0, x1, y1, shade(c, 0.84))
    rect(im, x1, y0, x1, y1, shade(c, 0.74))


def non_la(im: Image.Image, top: int, cx: float = CX) -> None:
    """Conical palm-leaf hat: apex at the top, ribbed rings, lit on the left."""
    for r in range(17):
        half = 0.7 + r * 0.86
        for x in range(round(cx - half), round(cx + half) + 1):
            rel = (x - (cx - half)) / (2 * half + 1)
            c = STRAW_L if rel < 0.3 else STRAW if rel < 0.68 else STRAW_D
            if r in (4, 8, 12):
                c = shade(c, 0.86)
            put(im, x, top + r, c)
    for x in range(round(cx - 14), round(cx + 15)):  # brim rim
        put(im, x, top + 16, STRAW_RIB)
    put(im, round(cx), top, STRAW_L)


def face_front(im: Image.Image, lk: Look, y: int) -> None:
    skin = lk.skin
    rect(im, 10, 12 + y, 21, 24 + y, skin)
    rect(im, 9, 14 + y, 22, 22 + y, skin)
    rect(im, 11, 25 + y, 20, 25 + y, shade(skin, 0.9))     # jaw
    rect(im, 20, 13 + y, 22, 24 + y, shade(skin, 0.9))     # shadow side
    put(im, 8, 18 + y, shade(skin, 0.86)); put(im, 8, 19 + y, shade(skin, 0.86))   # ears
    put(im, 23, 18 + y, shade(skin, 0.8)); put(im, 23, 19 + y, shade(skin, 0.8))
    for ex in (12, 18):                                     # eyes with a catch-light
        rect(im, ex, 18 + y, ex + 1, 20 + y, EYE)
        put(im, ex, 18 + y, EYE_HI)
        rect(im, ex - 1, 16 + y, ex + 1, 16 + y, shade(lk.hair, 0.9))  # brows
    put(im, 15, 21 + y, shade(skin, 0.82)); put(im, 16, 21 + y, shade(skin, 0.86))  # nose
    rect(im, 14, 23 + y, 17, 23 + y, shade(skin, 0.7))    # mouth
    for bx in (10, 20):                                     # cheeks
        put(im, bx, 21 + y, (232, 150, 140))
    if lk.hair_style == "grey":                             # moustache and a wisp of beard
        rect(im, 12, 22 + y, 19, 22 + y, lk.hair); rect(im, 14, 25 + y, 17, 27 + y, lk.hair)


def hair_front(im: Image.Image, lk: Look, y: int, back: bool) -> None:
    h, hd, hl = lk.hair, shade(lk.hair, 0.72), shade(lk.hair, 1.3)
    rect(im, 11, 7 + y, 20, 9 + y, h)
    rect(im, 9, 9 + y, 22, 14 + y, h)
    rect(im, 8, 12 + y, 9, 19 + y, h); rect(im, 22, 12 + y, 23, 19 + y, hd)
    for x in (12, 15, 18):                                  # strand highlights
        put(im, x, 9 + y, hl); put(im, x + 1, 10 + y, hl)
    if back:
        rect(im, 8, 14 + y, 23, 25 + y, h)
        rect(im, 20, 14 + y, 23, 25 + y, hd)
        for x in (11, 15, 19):
            rect(im, x, 15 + y, x, 23 + y, hd)
    else:
        for x in (10, 13, 17, 20):                          # fringe
            put(im, x, 15 + y, h); put(im, x + 1, 15 + y, h)
    if lk.hair_style == "long":
        rect(im, 6, 13 + y, 9, 35 + y, h); rect(im, 22, 13 + y, 25, 35 + y, hd)
        if back:
            rect(im, 8, 24 + y, 23, 35 + y, h)
            for x in (10, 14, 18):
                rect(im, x, 24 + y, x, 34 + y, hd)
    if lk.hair_style == "bun":
        disc(im, 15.5, 5 + y, 3.4, h); put(im, 14, 3 + y, hl); put(im, 15, 3 + y, hl)
        rect(im, 13, 8 + y, 18, 8 + y, (200, 60, 60))       # hair tie


def torso_front(im: Image.Image, lk: Look, y: int, back: bool) -> None:
    s = lk.shirt
    rect(im, 14, 26 + y, 17, 27 + y, shade(lk.skin, 0.84))  # neck
    shaded(im, 8, 28 + y, 23, 43 + y, s)
    rect(im, 9, 28 + y, 22, 28 + y, shade(s, 1.08))          # shoulders
    rect(im, 8, 43 + y, 23, 43 + y, shade(s, 0.66))          # hem
    if back:
        return
    rect(im, 13, 28 + y, 18, 29 + y, shade(s, 0.78))         # collar
    if lk.skirt:                                             # áo dài: high collar, side seam
        rect(im, 13, 27 + y, 18, 28 + y, shade(s, 0.9))
        for yy in range(30, 40):
            put(im, 19 + (yy - 30) // 5, yy + y, shade(s, 0.82))
        return
    for by in (31, 35, 39):                                   # buttons down the front
        put(im, 15, by + y, shade(s, 0.62)); put(im, 16, by + y, shade(s, 1.3))
    for px in (10, 19):                                       # two lower pockets
        rect(im, px, 38 + y, px + 3, 38 + y, shade(s, 0.74))
        rect(im, px, 39 + y, px + 3, 42 + y, shade(s, 0.92))
    if lk.apron:
        shaded(im, 10, 34 + y, 21, 49, lk.apron)
        rect(im, 10, 34 + y, 21, 34 + y, shade(lk.apron, 0.8))
        rect(im, 13, 41, 18, 41, shade(lk.apron, 0.86))      # apron pocket


def legs_front(im: Image.Image, lk: Look, lift: tuple[int, int]) -> None:
    if lk.skirt:  # áo dài panels over wide trousers
        shaded(im, 9, 43, 22, 52, lk.shirt)
        rect(im, 15, 44, 16, 52, shade(lk.shirt, 0.86))
        for i, x0 in enumerate((10, 17)):
            rect(im, x0, 53, x0 + 4, 55 + lift[i], lk.legs)
            rect(im, x0, 56 + lift[i], x0 + 4, 57 + lift[i], lk.shoes)
        return
    for i, x0 in enumerate((10, 17)):
        shaded(im, x0, 43, x0 + 4, 54 + lift[i], lk.legs)
        put(im, x0 + 2, 48, shade(lk.legs, 0.8))              # knee fold
        rect(im, x0, 55 + lift[i], x0 + 4, 57 + lift[i], lk.shoes)
        put(im, x0, 55 + lift[i], shade(lk.shoes, 1.4))


def arms_front(im: Image.Image, lk: Look, y: int, swing: tuple[int, int]) -> None:
    for i, ax in enumerate((6, 24)):
        s = swing[i]
        sleeve = shade(lk.shirt, 0.92 if i == 0 else 0.8)
        rect(im, ax, 29 + y, ax + 1, 39 + y + s, sleeve)
        rect(im, ax, 40 + y + s, ax + 1, 42 + y + s, lk.skin)
        put(im, ax + (1 if i == 0 else 0), 42 + y + s, shade(lk.skin, 0.84))


def body_front(im: Image.Image, lk: Look, step: int, back: bool) -> None:
    lift = {0: (0, 0), 1: (2, -2), 2: (0, 0), 3: (-2, 2)}[step]
    y = -1 if step in (1, 3) else 0
    legs_front(im, lk, lift)
    torso_front(im, lk, y, back)
    arms_front(im, lk, y, (-lift[0], -lift[1]))
    if back:
        hair_front(im, lk, y, True)
        if lk.hair_style != "long":
            rect(im, 10, 25 + y, 21, 26 + y, shade(lk.skin, 0.84))
    else:
        face_front(im, lk, y)
        hair_front(im, lk, y, False)
    if lk.hat:
        non_la(im, y + 1)


def body_side(im: Image.Image, lk: Look, step: int) -> None:
    """Facing right; 'left' is a mirror image."""
    stride = {0: 0, 1: 4, 2: 0, 3: -4}[step]
    y = -1 if step in (1, 3) else 0
    skin, h = lk.skin, lk.hair
    if lk.skirt:
        shaded(im, 10, 43, 22, 52, lk.shirt, light=False)
        rect(im, 14 + stride // 2, 53, 18 + stride // 2, 55, lk.legs)
        rect(im, 14 + stride // 2, 56, 19 + stride // 2, 57, lk.shoes)
    else:
        for dx, dark in ((-stride, True), (stride, False)):   # back leg first
            col = shade(lk.legs, 0.76) if dark else lk.legs
            x0 = 14 + dx // 2
            rect(im, x0, 43, x0 + 4, 54, col)
            rect(im, x0 + 3, 43, x0 + 4, 54, shade(col, 0.86))
            rect(im, x0, 55, x0 + 6, 57, shade(lk.shoes, 0.8) if dark else lk.shoes)
    shaded(im, 10, 28 + y, 21, 43 + y, lk.shirt)
    rect(im, 10, 28 + y, 11, 43 + y, shade(lk.shirt, 0.8))   # back of the shirt in shade
    rect(im, 10, 43 + y, 21, 43 + y, shade(lk.shirt, 0.66))
    if lk.apron:
        rect(im, 19, 34 + y, 22, 49, lk.apron); rect(im, 22, 34 + y, 22, 49, shade(lk.apron, 0.8))
    arm = stride // 2
    rect(im, 14 + arm, 30 + y, 17 + arm, 39 + y, shade(lk.shirt, 0.86))
    rect(im, 14 + arm, 30 + y, 14 + arm, 39 + y, shade(lk.shirt, 1.06))
    rect(im, 14 + arm, 40 + y, 17 + arm, 42 + y, skin)
    rect(im, 14, 26 + y, 17, 27 + y, shade(skin, 0.84))      # neck
    rect(im, 11, 12 + y, 23, 24 + y, skin)
    rect(im, 13, 25 + y, 21, 25 + y, shade(skin, 0.88))
    rect(im, 24, 18 + y, 24, 20 + y, skin)                   # nose
    put(im, 24, 21 + y, shade(skin, 0.86))
    rect(im, 19, 18 + y, 20, 20 + y, EYE); put(im, 20, 18 + y, EYE_HI)
    rect(im, 18, 16 + y, 21, 16 + y, shade(h, 0.9))          # brow
    rect(im, 21, 23 + y, 22, 23 + y, shade(skin, 0.7))       # mouth
    put(im, 20, 21 + y, (232, 150, 140))
    rect(im, 11, 7 + y, 21, 11 + y, h); rect(im, 9, 10 + y, 15, 22 + y, h)
    rect(im, 21, 10 + y, 23, 13 + y, h)
    for x in (13, 16, 19):
        put(im, x, 8 + y, shade(h, 1.3))
    rect(im, 14, 17 + y, 15, 19 + y, shade(skin, 0.8))       # ear
    if lk.hair_style == "long":
        rect(im, 6, 13 + y, 12, 35 + y, h); rect(im, 6, 13 + y, 7, 35 + y, shade(h, 0.75))
    if lk.hair_style == "bun":
        disc(im, 8.5, 9 + y, 3.4, h)
    if lk.hair_style == "grey":
        rect(im, 19, 22 + y, 23, 22 + y, h); rect(im, 19, 25 + y, 22, 27 + y, h)
    if lk.hat:
        non_la(im, y + 1, cx=16.5)


def frame(lk: Look, direction: str, step: int) -> Image.Image:
    im = new(FW, FH)
    if direction in ("down", "up"):
        body_front(im, lk, step, back=direction == "up")
    else:
        body_side(im, lk, step)
    outline(im)
    out = new(FW, FH)
    soft_shadow(out, CX, 58, 10, 3, alpha=80)
    out.alpha_composite(im)
    return ImageOps.mirror(out) if direction == "left" else out


def sheet(lk: Look) -> Image.Image:
    out = new(FW * 4, FH * 4)
    for r, d in enumerate(("down", "left", "right", "up")):
        for c in range(4):
            out.paste(frame(lk, d, c), (c * FW, r * FH))
    return out


def make_characters_hd() -> list[dict]:
    """Player and villager sheets at x2; every entry is flagged "hd"."""
    save(sheet(PLAYER), "sprites/player.png")
    files = [{"type": "spritesheet", "key": "player", "url": "sprites/player.png",
              "frameConfig": {"frameWidth": FW, "frameHeight": FH}, "hd": True}]
    for npc_id, look in VILLAGERS.items():
        rel = f"sprites/npcs/{npc_id}.png"
        save(sheet(look), rel)
        files.append({"type": "spritesheet", "key": f"npc_{npc_id}", "url": rel,
                      "frameConfig": {"frameWidth": FW, "frameHeight": FH}, "hd": True})
    return files
