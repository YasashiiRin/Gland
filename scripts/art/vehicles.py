"""Rideable vehicles: 32x32 frames, 4 per sheet (down, left, right, up).

The player sprite is drawn on top with its legs cropped, so every vehicle
has its seat around y=20-22 and touches the ground at y=31. Side views are
drawn facing right and mirrored for left.
"""
from __future__ import annotations

from typing import Callable

from PIL import Image, ImageOps

from .common import P, disc, new, outline, put, rect, save, shade, soft_shadow

W = H = 32
Frame = Callable[[Image.Image], None]


def wheel(im: Image.Image, cx: float, cy: float, r: float) -> None:
    disc(im, cx, cy, r, (40, 36, 36))
    disc(im, cx, cy, max(1.0, r - 2), (120, 116, 112))
    put(im, int(cx), int(cy), (60, 56, 56))


def wheel_front(im: Image.Image, cx: int, top: int, bottom: int, w: int = 3) -> None:
    rect(im, cx - w // 2, top, cx + w // 2, bottom, (40, 36, 36))
    rect(im, cx - w // 2, top, cx - w // 2, bottom, (80, 76, 74))


# ------------------------------------------------------------------ motorbike (a classic step-through)
BIKE = (172, 52, 44)


def bike_side(im: Image.Image) -> None:
    wheel(im, 7, 27, 4); wheel(im, 25, 27, 4)
    rect(im, 8, 21, 22, 23, (70, 66, 66))                                   # step-through floor
    rect(im, 4, 15, 12, 22, BIKE); rect(im, 4, 15, 12, 16, shade(BIKE, 1.25))  # rear body
    rect(im, 5, 17, 13, 18, (40, 34, 30))                                   # seat
    rect(im, 21, 13, 24, 23, BIKE); rect(im, 21, 13, 21, 23, shade(BIKE, 1.2))  # front leg shield
    rect(im, 23, 9, 24, 13, (90, 86, 84)); rect(im, 21, 9, 27, 10, (60, 56, 56))  # handlebar
    put(im, 27, 12, (250, 230, 150)); put(im, 26, 12, (220, 200, 120))      # headlight
    rect(im, 24, 22, 27, 23, BIKE)                                          # mudguard


def bike_front(im: Image.Image, back: bool) -> None:
    wheel_front(im, 16, 24, 31)
    rect(im, 11, 14, 20, 24, BIKE); rect(im, 11, 14, 12, 24, shade(BIKE, 1.2)); rect(im, 19, 14, 20, 24, shade(BIKE, 0.75))
    rect(im, 8, 11, 23, 12, (60, 56, 56))
    if back:
        rect(im, 13, 18, 18, 19, (200, 60, 50)); rect(im, 12, 20, 19, 21, (40, 34, 30))
    else:
        disc(im, 15.5, 16, 2, (250, 230, 150))


# ------------------------------------------------------------------ tractor
TRACTOR = (196, 92, 40)


def tractor_side(im: Image.Image) -> None:
    rect(im, 8, 16, 28, 24, TRACTOR); rect(im, 8, 16, 28, 17, shade(TRACTOR, 1.25))
    rect(im, 20, 11, 22, 16, (60, 56, 56)); rect(im, 20, 10, 23, 10, (40, 36, 36))  # exhaust
    rect(im, 4, 17, 12, 20, (40, 34, 30))                                    # seat
    rect(im, 24, 18, 28, 21, (60, 56, 56))                                   # grille
    wheel(im, 9, 25, 6.5); wheel(im, 25, 28, 3.5)


def tractor_front(im: Image.Image, back: bool) -> None:
    for x in (6, 25):
        rect(im, x - 2, 20, x + 2, 31, (40, 36, 36)); rect(im, x - 2, 20, x - 1, 31, (80, 76, 74))
    rect(im, 9, 14, 22, 26, TRACTOR); rect(im, 9, 14, 22, 15, shade(TRACTOR, 1.25))
    if back:
        rect(im, 11, 16, 20, 19, (40, 34, 30)); rect(im, 13, 24, 18, 27, (60, 56, 56))   # seat + hitch
    else:
        rect(im, 12, 19, 19, 24, (60, 56, 56)); put(im, 10, 16, (250, 230, 150)); put(im, 21, 16, (250, 230, 150))
    rect(im, 19, 8, 20, 14, (60, 56, 56))


# ------------------------------------------------------------------ rice harvester
HARV = (78, 136, 82)
REEL = (214, 176, 60)


def harvester_side(im: Image.Image) -> None:
    rect(im, 4, 24, 22, 30, (50, 46, 44))                                    # tracks
    for x in range(5, 22, 3):
        put(im, x, 27, (90, 86, 84))
    rect(im, 4, 13, 22, 23, HARV); rect(im, 4, 13, 22, 14, shade(HARV, 1.25))
    rect(im, 6, 16, 12, 19, (40, 34, 30))                                    # seat
    rect(im, 14, 8, 20, 13, (170, 200, 210)); rect(im, 14, 8, 20, 8, shade(HARV, 0.7))  # cab window
    rect(im, 22, 22, 30, 27, REEL); rect(im, 22, 22, 30, 22, shade(REEL, 1.2))           # header
    for x in range(23, 30, 2):
        put(im, x, 28, (120, 116, 112)); put(im, x, 29, (120, 116, 112))     # cutter teeth


def harvester_front(im: Image.Image, back: bool) -> None:
    rect(im, 5, 22, 9, 31, (50, 46, 44)); rect(im, 22, 22, 26, 31, (50, 46, 44))
    rect(im, 7, 11, 24, 24, HARV); rect(im, 7, 11, 24, 12, shade(HARV, 1.25))
    if back:
        rect(im, 11, 15, 20, 18, (40, 34, 30))
    else:
        rect(im, 10, 13, 21, 17, (170, 200, 210))
        rect(im, 1, 24, 30, 29, REEL); rect(im, 1, 24, 30, 24, shade(REEL, 1.2))
        for x in range(2, 30, 3):
            put(im, x, 30, (120, 116, 112))


# ------------------------------------------------------------------ water truck (a pump cart with a tank)
TANK = (70, 128, 176)
CAB = (232, 196, 70)


def watertruck_side(im: Image.Image) -> None:
    rect(im, 2, 21, 29, 24, (60, 56, 56))                                    # chassis
    disc(im, 9, 16, 6.5, TANK, squash=0.75); rect(im, 3, 12, 15, 20, TANK)     # tank (behind the seat)
    rect(im, 3, 12, 15, 13, shade(TANK, 1.3)); rect(im, 8, 10, 10, 11, (60, 56, 56))  # filler cap
    for x in (6, 12):
        rect(im, x, 12, x, 20, shade(TANK, 0.8))                             # tank bands
    rect(im, 1, 23, 3, 24, (150, 150, 156))                                  # spray bar
    rect(im, 15, 17, 19, 20, (40, 34, 30))                                   # seat
    rect(im, 20, 15, 29, 22, CAB); rect(im, 20, 15, 29, 16, shade(CAB, 1.2))  # bonnet with the pump
    rect(im, 26, 18, 29, 20, (60, 56, 56))                                   # grille
    wheel(im, 8, 26, 5); wheel(im, 24, 27, 4)


def watertruck_front(im: Image.Image, back: bool) -> None:
    for x in (6, 25):
        wheel_front(im, x, 21, 31, 5)
    if back:   # the tank nearest the viewer, spray bar under it
        disc(im, 15.5, 16, 9, TANK, squash=0.8); rect(im, 7, 14, 24, 23, TANK)
        rect(im, 7, 14, 24, 15, shade(TANK, 1.3))
        for x in (11, 20):
            rect(im, x, 14, x, 23, shade(TANK, 0.8))
        rect(im, 4, 25, 27, 26, (150, 150, 156))
        for x in range(5, 27, 4):
            put(im, x, 27, (120, 190, 230))
    else:      # bonnet towards the viewer
        rect(im, 9, 15, 22, 26, CAB); rect(im, 9, 15, 22, 16, shade(CAB, 1.2))
        rect(im, 12, 20, 19, 25, (60, 56, 56)); put(im, 10, 17, (250, 230, 150)); put(im, 21, 17, (250, 230, 150))
        rect(im, 8, 9, 23, 13, TANK); rect(im, 8, 9, 23, 9, shade(TANK, 1.3))   # tank top behind the rider


# ------------------------------------------------------------------ ox cart
OX = (150, 96, 58)
HORN = (232, 220, 190)


def oxcart_side(im: Image.Image) -> None:
    # ox in front (right), cart behind (left) with the driver's bench
    rect(im, 17, 15, 28, 22, OX); rect(im, 17, 15, 28, 16, shade(OX, 1.2))     # body
    rect(im, 26, 11, 31, 17, OX); rect(im, 29, 10, 31, 10, HORN); put(im, 27, 10, HORN)  # head + horns
    put(im, 30, 13, (30, 24, 20))
    for x in (18, 21, 25, 27):
        rect(im, x, 23, x + 1, 30, shade(OX, 0.8))
    rect(im, 12, 17, 18, 17, P["k1"])                                          # shaft
    rect(im, 1, 16, 13, 22, P["k2"]); rect(im, 1, 16, 13, 16, P["k3"])        # cart bed
    rect(im, 3, 13, 9, 15, P["k1"])                                            # bench
    wheel(im, 7, 25, 6)


def oxcart_front(im: Image.Image, back: bool) -> None:
    if back:   # cart nearest the viewer, ox beyond
        rect(im, 12, 0, 19, 8, OX); rect(im, 10, 0, 11, 2, HORN); rect(im, 20, 0, 21, 2, HORN)
        rect(im, 6, 12, 25, 24, P["k2"]); rect(im, 6, 12, 25, 13, P["k3"])
        rect(im, 10, 15, 21, 18, P["k1"])
        for x in (4, 27):
            rect(im, x - 1, 16, x + 1, 31, (60, 44, 32))
    else:      # facing the viewer: drawn over the rider, the cart's front board hides their lap
        for x in (3, 28):
            rect(im, x - 1, 8, x + 1, 24, (60, 44, 32))                   # wheels seen edge-on
        rect(im, 5, 14, 26, 20, P["k2"]); rect(im, 5, 14, 26, 14, P["k3"])  # front board
        rect(im, 15, 20, 16, 22, P["k1"])                                   # yoke pole
        rect(im, 11, 21, 20, 29, OX); rect(im, 11, 21, 20, 22, shade(OX, 1.2))  # ox head
        rect(im, 8, 21, 10, 22, HORN); rect(im, 21, 21, 23, 22, HORN)
        put(im, 13, 25, (30, 24, 20)); put(im, 18, 25, (30, 24, 20))
        rect(im, 13, 28, 18, 29, shade(OX, 1.25))
        rect(im, 12, 30, 13, 31, shade(OX, 0.8)); rect(im, 18, 30, 19, 31, shade(OX, 0.8))


VEHICLES: dict[str, tuple[Frame, Callable[[Image.Image, bool], None]]] = {
    "motorbike": (bike_side, bike_front),
    "tractor": (tractor_side, tractor_front),
    "harvester": (harvester_side, harvester_front),
    "water_truck": (watertruck_side, watertruck_front),
    "ox_cart": (oxcart_side, oxcart_front),
}


def vehicle_sheet(side: Frame, front: Callable[[Image.Image, bool], None]) -> Image.Image:
    frames = []
    for kind in ("down", "left", "right", "up"):
        im = new(W, H)
        if kind in ("left", "right"):
            side(im)
        else:
            front(im, kind == "up")
        outline(im, 0.45)
        base = new(W, H)
        soft_shadow(base, 16, 30, 14, 2.5, alpha=80)
        base.alpha_composite(im)
        frames.append(ImageOps.mirror(base) if kind == "left" else base)
    out = new(W * 4, H)
    for i, f in enumerate(frames):
        out.paste(f, (i * W, 0))
    return out


def make_vehicles() -> list[dict]:
    files = []
    for vid, (side, front) in VEHICLES.items():
        rel = f"sprites/vehicles/{vid}.png"
        save(vehicle_sheet(side, front), rel)
        files.append({"type": "spritesheet", "key": f"vehicle_{vid}", "url": rel,
                      "frameConfig": {"frameWidth": W, "frameHeight": H}})
    return files
