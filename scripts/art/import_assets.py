"""
Loads the hand-picked pictures in assets/ (see ASSET_LIST.md) into the game,
over the code-drawn placeholders. Only pictures that exist are used, so the
art can arrive a batch at a time.

Run:  python3 scripts/art/import_assets.py   (gen_placeholders.py runs it too)

  * ground textures -> public/assets/tilesets/ground_hd.png: each one a 6 x 6
    block of tiles (a picture is too detailed for one 32 px tile), drawn over
    the map by src/scenes/groundLook.ts; src/data/groundTextures.json says
    which tile uses which block;
  * edges, overlays (rock, bush, rice…) and plain tiles -> farm_tiles_hd.png;
  * mine tiles -> mine_tiles_hd.png;
  * trees, crops, ghosts -> public/assets/sprites/...;
  * item icons -> public/assets/sprites/icons/<item>.png (32 x 32, in pack.json);
  * characters, animals, vehicles, buildings -> their sprite sheets (import_sheets.py).
"""
import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from art import province_tiles as pt  # noqa: E402
from art import tiles as t  # noqa: E402
from art import water_tiles as wt  # noqa: E402
from art.asset_import import ROOT, SRC, find, fit_scale, darken, framed_tile, match_tone, native_tile, place, sprite, strip_frames, texture  # noqa: E402
from art.import_edges import edge_tiles, overlay_tile  # noqa: E402
from art.import_sheets import import_sheets  # noqa: E402

PUB = ROOT / "public" / "assets"
S = 32
BLOCK = 6

# Ground pictures and the tileset indices (0-based) drawn with them.
GROUND: dict[str, list[int]] = {
    "grass": [t.GRASS], "grass2": [t.GRASS2], "flowers": [t.FLOWERS], "grass3": [t.GRASS3],
    "path": [t.PATH, t.PATH_EDGE], "water": [t.WATER, t.WATER_EDGE, wt.QUAY_EDGE],
    "soil": [t.SOIL], "dirt": [t.DIRT], "sand": [pt.SAND], "sand2": [pt.SAND2],
    "sea": [pt.SEA], "sea_deep": [wt.SEA_DEEP], "deep_water": [wt.DEEP],
    "bridge_planks": [pt.BRIDGE], "citadel_wall": [pt.CITADEL], "lotus": [pt.LOTUS],
    "paving": [pt.PAVING], "marsh": [pt.MARSH], "rocky": [pt.ROCKY], "dry_grass": [pt.DRY_GRASS],
    "paddy": [pt.PADDY],
}
# Variants scattered one tile at a time among another ground: given its colours.
TONE_OF = {"grass2": "grass", "flowers": "grass"}
# Things standing on a tile (transparent around them).
OVERLAYS: dict[str, int] = {
    "rock": t.ROCK, "bush": t.BUSH, "reeds": pt.REEDS, "flowerbed": wt.FLOWERBED,
    "rice_ripe": pt.RICE,  # stubble.png is drawn as a whole plot, not one tile: kept code-drawn
}
MINE = ["mine_floor", "mine_wall", "mine_ore_copper", "mine_ore_iron", "mine_ore_gold", "mine_ladder"]
TREES = ["broadleaf_0:oak_0", "broadleaf_1:oak_1", "bamboo", "banana", "areca", "coconut", "casuarina",
         "pine", "mangrove", "pomelo", "flame", "rubber"]
CROPS = ["parsnip", "potato", "cauliflower", "strawberry", "green_bean", "rice"]
HORROR = {"ghost": (32, 64), "shadow": (32, 64), "hand": (24, 36), "face": (128, 128)}


def tile_at(sheet: Image.Image, idx: int, cols: int) -> tuple[int, int]:
    return (idx % cols) * S, (idx // cols) * S


def import_ground() -> list[str]:
    done, rows, blocks = [], {}, []
    for name, idxs in GROUND.items():
        p = find(f"tiles/{name}.png")
        if not p:
            continue
        block = texture(p, S * BLOCK)
        if name in TONE_OF and TONE_OF[name] in done:  # single variant tiles among grass must not show as squares
            block = match_tone(block, blocks[done.index(TONE_OF[name])])
        blocks.append(block)
        for i in idxs:
            rows[str(i + 1)] = len(blocks) - 1  # keyed by Tiled gid
        done.append(name)
    sheet = Image.new("RGBA", (S * BLOCK * BLOCK, S * max(1, len(blocks))), (0, 0, 0, 0))
    for r, b in enumerate(blocks):  # one row per texture: its 16 tiles left to right
        for k in range(BLOCK * BLOCK):
            tx, ty = (k % BLOCK) * S, (k // BLOCK) * S
            sheet.paste(b.crop((tx, ty, tx + S, ty + S)), (k * S, r * S))
    sheet.save(PUB / "tilesets" / "ground_hd.png")
    data = {"tile": S, "block": BLOCK, "columns": BLOCK * BLOCK, "rows": rows}
    (ROOT / "src" / "data" / "groundTextures.json").write_text(json.dumps(data, indent=1) + "\n")
    # The plain tiles in the main tileset match too (first tile of each block), and the edges.
    path = PUB / "tilesets" / "farm_tiles_hd.png"
    farm = Image.open(path).convert("RGBA")
    for name, idxs in GROUND.items():
        if name in done:
            b = blocks[done.index(name)].crop((0, 0, S, S))
            for i in idxs:
                farm.paste(b, tile_at(farm, i, t.COLS))
    for idx, im in edge_tiles(lambda n: blocks[done.index(n)].crop((0, 0, S, S)) if n in done else None).items():
        farm.paste(im, tile_at(farm, idx, t.COLS))
    surf = find("tiles/surf.png")
    if surf:
        farm.paste(texture(surf, S), tile_at(farm, pt.SURF, t.COLS))
        done.append("surf")
    for name, idx in OVERLAYS.items():
        p = find(f"tiles/{name}.png")
        if p:
            x, y = tile_at(farm, idx, t.COLS)
            under = farm.crop((x, y, x + S, y + S))
            farm.paste(overlay_tile(p, under), (x, y))
            done.append(name)
    farm.save(path)
    return done


def import_mine() -> list[str]:
    path = PUB / "tilesets" / "mine_tiles_hd.png"
    sheet = Image.open(path).convert("RGBA")
    done = []
    for i, name in enumerate(MINE):
        p = find(f"tiles/{name}.png")
        if p:
            if name == "mine_ladder":
                tile = framed_tile(p, S)
            else:  # rock you dig (wall, ore) a shade darker than the floor you walk on
                tile = native_tile(p, S) if name == "mine_floor" else darken(native_tile(p, S, richest="ore" in name), 0.68)
            sheet.paste(tile, (i * S, 0))
            done.append(name)
    sheet.save(path)
    return done


def import_sprites() -> list[str]:
    done = []
    for entry in TREES:
        name, _, target = entry.partition(":")
        p = find(f"trees/{name}.png")
        if p:
            sprite(p, (96, 128), margin=2, keep_shadow=True).save(PUB / "sprites" / "trees" / f"{target or name}.png")
            done.append(f"trees/{name}")
    for name in CROPS:
        p = find(f"crops/{name}.png", f"trees/{name}.png")
        if not p:
            continue
        a, sh, boxes = strip_frames(p, 5)
        scale = fit_scale(boxes, 30, 50)
        sheet = Image.new("RGBA", (160, 64), (0, 0, 0, 0))
        for k, box in enumerate(boxes):
            sheet.alpha_composite(place(a, sh, box, scale, (32, 64), bottom_pad=6), (k * 32, 0))
        sheet.save(PUB / "sprites" / "crops" / f"{name}.png")
        done.append(f"crops/{name}")
    for name, size in HORROR.items():
        p = find(f"horror/{name}.png")
        if p:
            anchor = "center" if name == "face" else "bottom"
            sprite(p, size, anchor=anchor, bottom_pad=0).save(PUB / "sprites" / "horror" / f"{name}.png")
            done.append(f"horror/{name}")
    return done


def import_icons() -> list[str]:
    """Item icons: one 32 x 32 picture per item id, registered in the sprite pack."""
    out_dir = PUB / "sprites" / "icons"
    out_dir.mkdir(exist_ok=True)
    pack_path = PUB / "sprites" / "pack.json"
    pack = json.loads(pack_path.read_text())
    files = [f for f in pack["generated"]["files"] if not f["key"].startswith("item_icon_")]
    done = []
    for p in sorted((SRC / "icons").glob("*.png")) if (SRC / "icons").exists() else []:
        sprite(p, (S, S), margin=1, anchor="center", bottom_pad=1).save(out_dir / p.name)
        files.append({"type": "image", "key": f"item_icon_{p.stem}", "url": f"sprites/icons/{p.name}"})
        done.append(f"icons/{p.stem}")
    pack["generated"]["files"] = files
    pack_path.write_text(json.dumps(pack, indent=1))
    return done


def main() -> None:
    done = import_ground() + import_mine() + import_sprites() + import_icons() + import_sheets()
    print(f"Imported {len(done)} pictures from assets/: {', '.join(done)}")


if __name__ == "__main__":
    main()
