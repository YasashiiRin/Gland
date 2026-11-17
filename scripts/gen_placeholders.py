"""
Generate all procedural pixel art + Tiled maps for the game.

Run:  python3 scripts/gen_placeholders.py   (needs: pip install pillow)

Everything is drawn in code (see scripts/art/*), not copied from any asset
pack. Real art can replace any generated PNG later as long as its size /
frame layout stays the same; sprite keys are listed in
public/assets/sprites/pack.json, which the game loads at startup.
Maps can be opened and edited in Tiled (https://www.mapeditor.org).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from art.common import ASSETS  # noqa: E402
from art.crops import make_crops  # noqa: E402
from art.furniture import make_furniture  # noqa: E402
from art.maps import make_maps  # noqa: E402
from art.mine import make_mine_tileset  # noqa: E402
from art.nature import make_nature  # noqa: E402
from art.tiles import make_tileset  # noqa: E402
from art.vn_nature import make_vn_nature  # noqa: E402
from art.horror import make_horror  # noqa: E402
from art.extra_trees import make_extra_trees  # noqa: E402
from art.trees_hd import HD_SPRITES, make_trees_hd  # noqa: E402
from art.characters_hd import make_characters_hd  # noqa: E402
from art.buildings_hd import make_buildings_hd  # noqa: E402
from art.animals_hd import make_animals_hd  # noqa: E402
from art.vehicles_hd import make_vehicles_hd  # noqa: E402


def main() -> None:
    make_tileset()
    make_mine_tileset()
    files = make_characters_hd() + make_buildings_hd() + make_nature() + make_furniture() + make_crops() + make_vehicles_hd() + make_vn_nature() + make_horror() + make_extra_trees() + make_animals_hd()
    make_trees_hd()  # graphics x2: these overwrite the 1x tree PNGs
    for f in files:
        if f["key"] in HD_SPRITES:
            f["hd"] = True
    pack = {"generated": {"files": files}}
    (ASSETS / "sprites" / "pack.json").write_text(json.dumps(pack, indent=1))
    make_maps()
    print(f"Generated tileset, {len(files)} sprites and maps in {ASSETS}")


if __name__ == "__main__":
    main()
