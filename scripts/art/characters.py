"""Walking character spritesheets (16x32 frames, 4 columns x 4 rows: down, left, right, up).

Proportions are closer to a real person (head ~1/3 of the height) instead of
a big-headed chibi, with muted clothing colors and selective dark outlines.
The same body generator is reused for villagers with different palettes.
"""
from __future__ import annotations

from dataclasses import dataclass

from PIL import Image, ImageOps

from .common import new, outline, put, rect, save, shade, soft_shadow


@dataclass(frozen=True)
class Look:
    skin: tuple[int, int, int]
    hair: tuple[int, int, int]
    shirt: tuple[int, int, int]
    legs: tuple[int, int, int]
    shoes: tuple[int, int, int] = (58, 40, 32)
    hair_style: str = "short"   # short | long | bun | grey
    skirt: bool = False
    apron: tuple[int, int, int] | None = None


PLAYER = Look(skin=(232, 184, 150), hair=(96, 60, 40), shirt=(80, 114, 138), legs=(102, 76, 54))
VILLAGERS = {
    "chu_tu": Look(skin=(214, 164, 128), hair=(156, 150, 142), shirt=(128, 96, 62), legs=(72, 76, 84), hair_style="grey"),
    "co_hanh": Look(skin=(228, 180, 146), hair=(72, 46, 34), shirt=(168, 88, 82), legs=(104, 92, 124),
                    hair_style="bun", skirt=True, apron=(222, 210, 184)),
    "linh": Look(skin=(236, 192, 160), hair=(42, 34, 38), shirt=(206, 166, 88), legs=(74, 92, 122), hair_style="long"),
    "minh": Look(skin=(222, 172, 136), hair=(54, 40, 32), shirt=(88, 128, 94), legs=(62, 66, 82)),
}


def _body_front(im: Image.Image, lk: Look, step: int, back: bool) -> None:
    lift = {0: (0, 0), 1: (1, -1), 2: (0, 0), 3: (-1, 1)}[step]
    bob = -1 if step in (1, 3) else 0
    # legs / skirt
    if lk.skirt:
        rect(im, 4, 21, 11, 27, lk.legs); rect(im, 10, 21, 11, 27, shade(lk.legs, 0.8))
        rect(im, 5, 28, 6, 29 + lift[0], lk.shoes); rect(im, 9, 28, 10, 29 + lift[1], lk.shoes)
    else:
        for (x0, l) in ((5, lift[0]), (8, lift[1])):
            rect(im, x0, 21, x0 + 2, 27 + l, lk.legs)
            rect(im, x0 + 2, 21, x0 + 2, 27 + l, shade(lk.legs, 0.8))
            rect(im, x0, 28 + l, x0 + 2, 29 + l, lk.shoes)
    # torso
    y = bob
    rect(im, 4, 14 + y, 11, 21 + y, lk.shirt)
    rect(im, 4, 14 + y, 4, 21 + y, shade(lk.shirt, 1.12))
    rect(im, 10, 14 + y, 11, 21 + y, shade(lk.shirt, 0.82))
    rect(im, 4, 21 + y, 11, 21 + y, shade(lk.shirt, 0.7))
    if lk.apron and not back:
        rect(im, 5, 17 + y, 10, 24, lk.apron); rect(im, 9, 17 + y, 10, 24, shade(lk.apron, 0.86))
    # arms swing opposite to legs
    for (ax, s) in ((3, -lift[0]), (12, -lift[1])):
        rect(im, ax, 15 + y, ax, 19 + y + s, shade(lk.shirt, 0.9))
        rect(im, ax, 20 + y + s, ax, 21 + y + s, lk.skin)
    # neck + head
    rect(im, 7, 13 + y, 8, 13 + y, shade(lk.skin, 0.85))
    rect(im, 5, 5 + y, 10, 12 + y, lk.skin)
    rect(im, 4, 6 + y, 11, 11 + y, lk.skin)
    rect(im, 5, 12 + y, 10, 12 + y, shade(lk.skin, 0.88))
    _hair_front(im, lk, y, back)
    if not back:
        for ex in (6, 9):
            put(im, ex, 9 + y, (40, 30, 34)); put(im, ex, 10 + y, (40, 30, 34))
        put(im, 7, 11 + y, shade(lk.skin, 0.86)); put(im, 8, 11 + y, shade(lk.skin, 0.86))
        if lk.hair_style == "grey":  # moustache
            rect(im, 6, 11 + y, 9, 11 + y, lk.hair)


def _hair_front(im: Image.Image, lk: Look, y: int, back: bool) -> None:
    h, hd = lk.hair, shade(lk.hair, 0.75)
    rect(im, 5, 3 + y, 10, 4 + y, h)
    rect(im, 4, 4 + y, 11, 7 + y, h)
    put(im, 4, 4 + y, (0, 0, 0, 0)); put(im, 11, 4 + y, (0, 0, 0, 0))
    rect(im, 4, 7 + y, 4, 9 + y, h); rect(im, 11, 7 + y, 11, 9 + y, hd)
    rect(im, 6, 3 + y, 8, 3 + y, shade(h, 1.18))
    if back:
        rect(im, 4, 7 + y, 11, 12 + y, h); rect(im, 5, 12 + y, 10, 12 + y, hd)
    else:
        for x in (5, 8, 10):  # fringe
            put(im, x, 8 + y, h)
    if lk.hair_style == "long":
        rect(im, 3, 7 + y, 4, 17 + y, h); rect(im, 11, 7 + y, 12, 17 + y, hd)
        if back:
            rect(im, 4, 12 + y, 11, 17 + y, h)
    if lk.hair_style == "bun":
        rect(im, 6, 1 + y, 9, 2 + y, h); put(im, 7, 1 + y, shade(h, 1.2))


def _body_side(im: Image.Image, lk: Look, step: int) -> None:
    """Facing right; 'left' is a mirror image."""
    stride = {0: 0, 1: 2, 2: 0, 3: -2}[step]
    bob = -1 if step in (1, 3) else 0
    y = bob
    if lk.skirt:
        rect(im, 5, 21, 11, 27, lk.legs); rect(im, 5, 21, 6, 27, shade(lk.legs, 0.8))
        rect(im, 7 + stride // 2, 28, 9 + stride // 2, 29, lk.shoes)
    else:
        for (dx, dark) in ((-stride, True), (stride, False)):  # back leg first
            col = shade(lk.legs, 0.78) if dark else lk.legs
            x0 = 7 + dx // 2
            rect(im, x0, 21, x0 + 2, 27, col)
            rect(im, x0, 28, x0 + 3, 29, shade(lk.shoes, 0.8) if dark else lk.shoes)
    rect(im, 5, 14 + y, 10, 21 + y, lk.shirt)
    rect(im, 5, 14 + y, 5, 21 + y, shade(lk.shirt, 0.82))
    rect(im, 5, 21 + y, 10, 21 + y, shade(lk.shirt, 0.7))
    if lk.apron:
        rect(im, 9, 17 + y, 10, 24, lk.apron)
    arm = stride // 2
    rect(im, 7 + arm, 15 + y, 8 + arm, 19 + y, shade(lk.shirt, 0.88))
    rect(im, 7 + arm, 20 + y, 8 + arm, 21 + y, lk.skin)
    rect(im, 7, 13 + y, 8, 13 + y, shade(lk.skin, 0.85))
    rect(im, 5, 5 + y, 11, 12 + y, lk.skin)
    rect(im, 6, 12 + y, 10, 12 + y, shade(lk.skin, 0.88))
    put(im, 12, 9 + y, lk.skin)  # nose
    h = lk.hair
    rect(im, 5, 3 + y, 10, 6 + y, h); rect(im, 4, 5 + y, 7, 11 + y, h)
    rect(im, 11, 5 + y, 11, 6 + y, h)
    rect(im, 7, 3 + y, 9, 3 + y, shade(h, 1.18))
    put(im, 7, 8 + y, shade(lk.skin, 0.8))  # ear
    put(im, 10, 8 + y, (40, 30, 34)); put(im, 10, 9 + y, (40, 30, 34))
    if lk.hair_style == "long":
        rect(im, 3, 7 + y, 6, 17 + y, h)
    if lk.hair_style == "bun":
        rect(im, 3, 3 + y, 5, 5 + y, h)
    if lk.hair_style == "grey":
        rect(im, 9, 11 + y, 11, 11 + y, h)


def frame(lk: Look, direction: str, step: int) -> Image.Image:
    im = new(16, 32)
    if direction in ("down", "up"):
        _body_front(im, lk, step, back=direction == "up")
    else:
        _body_side(im, lk, step)
    outline(im, 0.38)
    shadow = new(16, 32)
    soft_shadow(shadow, 7.5, 29.5, 5, 1.6, alpha=80)
    shadow.alpha_composite(im)
    if direction == "left":
        shadow = ImageOps.mirror(shadow)
    return shadow


def sheet(lk: Look) -> Image.Image:
    out = new(16 * 4, 32 * 4)
    for r, d in enumerate(("down", "left", "right", "up")):
        for c in range(4):
            out.paste(frame(lk, d, c), (c * 16, r * 32))
    return out


def make_characters() -> list[dict]:
    save(sheet(PLAYER), "sprites/player.png")
    files = []
    for npc_id, look in VILLAGERS.items():
        rel = f"sprites/npcs/{npc_id}.png"
        save(sheet(look), rel)
        files.append({"type": "spritesheet", "key": f"npc_{npc_id}", "url": rel,
                      "frameConfig": {"frameWidth": 16, "frameHeight": 32}})
    return files
