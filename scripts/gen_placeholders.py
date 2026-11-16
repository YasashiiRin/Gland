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

from art.buildings import make_buildings  # noqa: E402
from art.characters import make_characters  # noqa: E402
from art.common import ASSETS  # noqa: E402
from art.crops import make_crops  # noqa: E402
from art.furniture import make_furniture  # noqa: E402
from art.maps import make_maps  # noqa: E402
from art.mine import make_mine_tileset  # noqa: E402
from art.nature import make_nature  # noqa: E402
from art.tiles import make_tileset  # noqa: E402
from art.vehicles import make_vehicles  # noqa: E402
from art.vn_nature import make_vn_nature  # noqa: E402
from art.horror import make_horror  # noqa: E402
from art.market import make_market  # noqa: E402


def main() -> None:
    make_tileset()
    make_mine_tileset()
    files = make_characters() + make_nature() + make_buildings() + make_furniture() + make_crops() + make_vehicles() + make_vn_nature() + make_horror() + make_market()
    pack = {"generated": {"files": files}}
    (ASSETS / "sprites" / "pack.json").write_text(json.dumps(pack, indent=1))
    make_maps()
    print(f"Generated tileset, {len(files)} sprites and maps in {ASSETS}")


if __name__ == "__main__":
    main()
