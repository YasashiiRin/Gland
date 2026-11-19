"""
Inside a player's house (the player's request, 2026-11-20): one simple room,
earthen floor and plain walls, a sleeping mat to sleep on (a "bed" zone), the
door at the bottom leading back out to the yard. Furniture comes later.
Every player's house opens onto this room; it is theirs alone (the game keeps
who is inside which house).
"""
from __future__ import annotations

from .maps import MapBuilder
from .tiles import BLOCK, FLOOR2, WAINSCOT, WALLPAPER

T = 16
W, H = 14, 10


def build_home() -> MapBuilder:
    m = MapBuilder(W, H, seed=7)
    for y in range(H):
        for x in range(W):
            m.ground[y][x] = FLOOR2
    for x in range(W):
        m.ground[0][x] = WALLPAPER
        m.ground[1][x] = WALLPAPER
        m.ground[2][x] = WAINSCOT
    for y in range(H):
        for x in (0, W - 1):
            m.put(x, y, BLOCK)
    door_x = W // 2
    for x in range(W):
        if x not in (door_x - 1, door_x):
            m.put(x, H - 1, BLOCK)
    # The sleeping mat against the back wall, on the left; lie down beside it to sleep.
    m.prop("sleeping_mat", 2, 3, 1, 2, solid_from=None, layer="floor")
    m.obj("bed", 2 * T, 3 * T, T, 2 * T)
    # The way out: back to the yard of whichever house you came in by (MapScene: door "back").
    m.door(door_x - 1, H - 1, 2, 1, "back", "home")
    m.spawn("default", door_x, H - 2)
    return m
