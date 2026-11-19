"""
Helpers to turn the AI-drawn pictures in assets/ (big, white background,
"pixel art" at an arbitrary pixel size) into game-ready art: background made
transparent, shrunk to the sprite size, crisp edges, a dark outline.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets"


def find(*names: str) -> Path | None:
    """The first of assets/<name> that exists (people sometimes save into another folder)."""
    for n in names:
        for p in (SRC / n, SRC / f"{n}.png"):  # "x.png.png": saved with the extension typed twice
            if p.exists():
                return p
    return None


def load(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGBA")).astype(np.float32)


def hide_sparkle(a: np.ndarray) -> np.ndarray:
    """Covers the faint generator sparkle in the bottom-right corner with the texture just left of it."""
    h, w = a.shape[:2]
    y0, y1, x0, x1 = int(h * 0.83), int(h * 0.93), int(w * 0.83), int(w * 0.93)
    dx = int(w * 0.12)
    a = a.copy()
    a[y0:y1, x0:x1] = a[y0:y1, x0 - dx:x1 - dx]
    return a


def background(a: np.ndarray, pockets: bool = True) -> np.ndarray:
    """Mask of the near-white background connected to the picture's border (and, with
    `pockets`, pure white holes shut in by the object: not for white clothes or walls)."""
    rgb = a[..., :3]
    light = (rgb.min(axis=2) >= 218) & (rgb.max(axis=2) - rgb.min(axis=2) <= 32)
    lab, _ = ndimage.label(light)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    if not pockets:
        return bg
    # Pure white pockets shut in by the object (sky between branches) are background too.
    white = (rgb.min(axis=2) >= 240) & (rgb.max(axis=2) - rgb.min(axis=2) <= 12) & ~bg
    lab, n = ndimage.label(white)
    if n:
        sizes = ndimage.sum(white, lab, range(1, n + 1))
        big = np.nonzero(sizes >= a.shape[0] * a.shape[1] * 0.0002)[0] + 1
        bg |= np.isin(lab, big)
    return bg


def shadow_like(rgb: np.ndarray) -> np.ndarray:
    """Pale greyish pixels: the soft ground shadow the generator puts under objects."""
    return (rgb.max(axis=2) - rgb.min(axis=2) <= 34) & (rgb.min(axis=2) >= 150)


def cut_out(a: np.ndarray, keep_shadow: bool, pockets: bool = True, solo: bool = False,
            pale_ok: bool = False) -> tuple[np.ndarray, np.ndarray]:
    """(picture with alpha, shadow mask): background removed, specks and loose shadows dropped
    (`solo`: everything but the biggest piece, e.g. a written label beside the drawing)."""
    fg = ~background(a, pockets) & (a[..., 3] > 0)
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, lab, range(1, n + 1)) if n else np.array([])
    shadow = np.zeros(fg.shape, bool)
    if n:
        big = sizes.max()
        rgb = a[..., :3]
        pale = shadow_like(rgb)
        for i, s in enumerate(sizes, start=1):
            comp = lab == i
            if s < big * (0.999 if solo else 0.02) or (s < big and pale[comp].mean() > 0.8) or (not pale_ok and pale[comp].mean() > 0.8):
                # specks, or a shadow on its own (`pale_ok`: the biggest piece may be pale, like whitish leaves)
                fg[comp] = False
        if keep_shadow:  # a shadow joined to the object: only near the bottom of it
            ys = np.nonzero(fg)[0]
            low = np.zeros(fg.shape, bool)
            top, span = ys.min(), ys.max() - ys.min()
            low[int(top + span * 0.78):] = True
            shadow = fg & pale & low
            # ...and the pale patches of it reaching up beside the object's lower half
            half = np.zeros(fg.shape, bool)
            half[int(top + span * 0.5):] = True
            plab, _ = ndimage.label(fg & pale & half)
            touched = np.unique(plab[shadow])
            shadow |= np.isin(plab, touched[touched > 0])
        else:
            fg &= ~(pale & _bottom_band(fg))
    out = a.copy()
    out[..., 3] = np.where(fg, 255, 0)
    return out, shadow


def _bottom_band(fg: np.ndarray) -> np.ndarray:
    ys = np.nonzero(fg)[0]
    band = np.zeros(fg.shape, bool)
    if len(ys):
        band[int(ys.min() + (ys.max() - ys.min()) * 0.85):] = True
    return band


def shrink(a: np.ndarray, size: tuple[int, int], shadow: np.ndarray | None = None) -> Image.Image:
    """Area-averaged resize without white fringes; alpha snapped to on/off (shadow kept see-through)."""
    alpha = a[..., 3:4] / 255.0
    pre = np.concatenate([a[..., :3] * alpha, alpha], axis=2)
    small = np.stack([np.asarray(Image.fromarray(pre[..., c].astype(np.float32), "F").resize(size, Image.BOX)) for c in range(4)], axis=2)
    al = small[..., 3]
    rgb = small[..., :3] / np.maximum(al[..., None], 1e-6)
    solid = al >= 0.5
    out = np.zeros((size[1], size[0], 4), np.uint8)
    out[..., :3] = np.clip(rgb, 0, 255)
    out[..., 3] = np.where(solid, 255, 0)
    if shadow is not None and shadow.any():
        sh = np.asarray(Image.fromarray((shadow * 255).astype(np.uint8)).resize(size, Image.BOX)) >= 110
        sh &= ~solid | _is_pale(out)
        out[sh] = (34, 26, 22, 70)
    return Image.fromarray(out)


def _is_pale(px: np.ndarray) -> np.ndarray:
    rgb = px[..., :3].astype(np.int16)
    return shadow_like(rgb) & (px[..., 3] > 0)


def outline(im: Image.Image, dark: float = 0.45) -> Image.Image:
    """Darkens the opaque pixels on the sprite's rim, so it reads as cleanly outlined art."""
    a = np.asarray(im).copy()
    solid = a[..., 3] == 255
    inner = ndimage.binary_erosion(solid, structure=np.ones((3, 3)), border_value=0)
    rim = solid & ~inner
    a[rim, :3] = (a[rim, :3].astype(np.float32) * dark).astype(np.uint8)
    return Image.fromarray(a)


def bbox(a: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(a[..., 3] > 0)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def fit_scale(boxes: list[tuple[int, int, int, int]], w: int, h: int) -> float:
    bw = max(b[2] - b[0] for b in boxes)
    bh = max(b[3] - b[1] for b in boxes)
    return min(w / bw, h / bh)


def place(a: np.ndarray, shadow: np.ndarray, box: tuple[int, int, int, int], scale: float,
          canvas: tuple[int, int], anchor: str = "bottom", bottom_pad: int = 1, line: bool = True) -> Image.Image:
    """Crops `box`, shrinks it by `scale` and puts it on a transparent canvas (feet on the bottom, or centred)."""
    x0, y0, x1, y1 = box
    size = (max(1, round((x1 - x0) * scale)), max(1, round((y1 - y0) * scale)))
    small = shrink(a[y0:y1, x0:x1], size, shadow[y0:y1, x0:x1])
    if line:
        small = outline(small)
    out = Image.new("RGBA", canvas, (0, 0, 0, 0))
    cx = (canvas[0] - size[0]) // 2
    cy = canvas[1] - size[1] - bottom_pad if anchor == "bottom" else (canvas[1] - size[1]) // 2
    out.alpha_composite(small, (cx, max(0, cy)))
    return out


def drop_ground_shadow(a: np.ndarray) -> np.ndarray:
    """Removes loose pieces lying below the object (a dark ground shadow drawn under an icon)."""
    fg = a[..., 3] > 0
    lab, n = ndimage.label(fg)
    if n < 2:
        return a
    sizes = ndimage.sum(fg, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    bottom = np.nonzero(lab == main)[0].max()
    out = a.copy()
    for i in range(1, n + 1):
        ys = np.nonzero(lab == i)[0]
        if i != main and ys.mean() > bottom - 2:
            out[lab == i, 3] = 0
    return out


def sprite(path: Path, canvas: tuple[int, int], margin: int = 0, anchor: str = "bottom",
           keep_shadow: bool = False, bottom_pad: int = 1, no_ground: bool = False, pale_ok: bool = False) -> Image.Image:
    """One object picture -> a sprite of size `canvas` (`no_ground`: drop a shadow lying under it)."""
    a, sh = cut_out(load(path), keep_shadow, pale_ok=pale_ok)
    if no_ground:
        a = drop_ground_shadow(a)
    box = bbox(a)
    s = fit_scale([box], canvas[0] - 2 * margin, canvas[1] - margin - bottom_pad)
    return place(a, sh, box, s, canvas, anchor, bottom_pad)


def strip_frames(path: Path, n: int) -> tuple[np.ndarray, np.ndarray, list[tuple[int, int, int, int]]]:
    """A row of `n` objects drawn side by side -> the cut-out picture and each object's box."""
    a, sh = cut_out(load(path), keep_shadow=False)
    cols = (a[..., 3] > 0).any(axis=0)
    runs, start = [], None
    for x, on in enumerate(list(cols) + [False]):
        if on and start is None:
            start = x
        elif not on and start is not None:
            runs.append((start, x))
            start = None
    runs = [r for r in runs if r[1] - r[0] > a.shape[1] * 0.01]
    if len(runs) != n:  # fall back to equal slices
        w = a.shape[1] // n
        runs = [(i * w, (i + 1) * w) for i in range(n)]
    boxes = []
    for x0, x1 in runs:
        rows = np.nonzero((a[:, x0:x1, 3] > 0).any(axis=1))[0]
        boxes.append((x0, int(rows.min()), x1, int(rows.max()) + 1))
    return a, sh, boxes


def texture(path: Path, size: int) -> Image.Image:
    """A ground texture shrunk to `size` px square, its edges blended so it tiles without a seam."""
    a = hide_sparkle(load(path))[..., :3]
    small = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((size, size), Image.BOX)).astype(np.float32)
    b = max(2, size // 32)
    for axis in (0, 1):
        s = np.moveaxis(small, axis, 0)
        for i in range(b):
            w = (b - i) / (2 * b)
            lo, hi = s[i].copy(), s[-1 - i].copy()
            s[i], s[-1 - i] = lo * (1 - w) + hi * w, hi * (1 - w) + lo * w
    out = np.dstack([np.clip(small, 0, 255), np.full((size, size), 255, np.float32)]).astype(np.uint8)
    return Image.fromarray(out)


def match_tone(im: Image.Image, ref: Image.Image) -> Image.Image:
    """Shifts a texture's colours so its average and spread per channel equal the reference's."""
    a = np.asarray(im).astype(np.float32)
    r = np.asarray(ref).astype(np.float32)
    for c in range(3):
        m, s = a[..., c].mean(), a[..., c].std() + 1e-6
        a[..., c] = (a[..., c] - m) / s * r[..., c].std() + r[..., c].mean()
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def native_tile(path: Path, size: int = 32, native: int = 192, richest: bool = False) -> Image.Image:
    """One tile cut from a texture at the picture's own pixel size (`native` px across), edges
    blended to tile; `richest` centres it on the most colourful spot (veins of ore)."""
    a = hide_sparkle(load(path))[..., :3]
    big = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((native, native), Image.BOX)).astype(np.float32)
    x0 = y0 = (native - size) // 2
    if richest:
        sat = big.max(axis=2) - big.min(axis=2)
        k = size // 2
        sm = ndimage.uniform_filter(sat, size)[k:-k, k:-k]
        cy, cx = np.unravel_index(np.argmax(sm), sm.shape)
        x0 = int(np.clip(cx + k - size // 2, 0, native - size))
        y0 = int(np.clip(cy + k - size // 2, 0, native - size))
    tile = Image.fromarray(big[y0:y0 + size, x0:x0 + size].astype(np.uint8))
    return _blend_edges(tile, 4)


def _blend_edges(im: Image.Image, b: int) -> Image.Image:
    small = np.asarray(im.convert("RGB")).astype(np.float32).copy()
    for axis in (0, 1):
        s = np.moveaxis(small, axis, 0)
        for i in range(b):
            w = (b - i) / (2 * b)
            lo, hi = s[i].copy(), s[-1 - i].copy()
            s[i], s[-1 - i] = lo * (1 - w) + hi * w, hi * (1 - w) + lo * w
    out = np.dstack([np.clip(small, 0, 255), np.full(small.shape[:2], 255, np.float32)]).astype(np.uint8)
    return Image.fromarray(out)


def framed_tile(path: Path, size: int = 32) -> Image.Image:
    """The dark framed thing in the middle of a picture (the ladder hole), shrunk whole into one tile."""
    a = hide_sparkle(load(path))
    lum = a[..., :3].mean(axis=2)
    lab, n = ndimage.label(lum < 45)
    if not n:
        return native_tile(path, size)
    biggest = int(np.argmax(ndimage.sum(np.ones_like(lum), lab, range(1, n + 1)))) + 1
    ys, xs = np.nonzero(lab == biggest)
    pad = int(0.18 * max(xs.ptp(), ys.ptp()))
    cx, cy, half = (xs.min() + xs.max()) // 2, (ys.min() + ys.max()) // 2, max(xs.ptp(), ys.ptp()) // 2 + pad
    box = (max(0, cx - half), max(0, cy - half), min(a.shape[1], cx + half), min(a.shape[0], cy + half))
    im = Image.fromarray(a.astype(np.uint8)).crop(box).resize((size, size), Image.BOX)
    return im.convert("RGBA")


def darken(im: Image.Image, k: float) -> Image.Image:
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    a[..., :3] *= k
    return Image.fromarray(a.astype(np.uint8))
