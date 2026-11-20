"""
Prices of Vietnam in 2000 (Bang_gia_nong_san_VN_2000.xlsx, estimated đồng) -> game data.

Wave 1: the crops (src/data/crops.json + their seed and produce items), fertilizer,
and every other price in items.json rescaled to real đồng. Produce is counted in
units (a cabbage, a bunch of water spinach…) that each weigh up to `maxKg`; it sells
by the kilo (`pricePerKg`, the spreadsheet's average price). Growth time is the real
time divided by 7. A seed packet sows one plot and costs about a quarter of a full
harvest at its best weight.

Run from the repo root:  python3 scripts/data/apply_vn2000_prices.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src" / "data"

REAL_DAYS_PER_GAME_DAY = 7
SEED_COST_SHARE = 0.25

SEASON_VI = {"spring": "Xuân", "summer": "Hạ", "fall": "Thu", "winter": "Đông"}

# id: name, seed name, unit, seasons, real days, regrow (game days), yield [min, max] units,
#     max kg per unit, đ/kg (spreadsheet average), food (energy, hunger) or None, seed price override
CROPS: dict[str, dict] = {
    # Spring
    "rice": dict(name="Lúa", seed="Lúa giống", unit="bó", seasons=["spring", "summer"], real=100, yld=[1, 2], kg=1.5, price=2000),
    "potato": dict(name="Khoai tây", seed="Khoai tây giống", unit="củ", seasons=["spring"], real=90, yld=[3, 6], kg=0.25, price=3750, food=(12, 18)),
    "mustard_greens": dict(name="Cải xanh", seed="Hạt cải xanh", unit="cây", seasons=["spring"], real=35, yld=[1, 2], kg=0.3, price=2000, food=(6, 8)),
    "lettuce": dict(name="Xà lách", seed="Hạt xà lách", unit="cây", seasons=["spring"], real=45, yld=[1, 1], kg=0.3, price=4000, food=(5, 6)),
    "cauliflower": dict(name="Súp lơ", seed="Hạt súp lơ", unit="bông", seasons=["spring"], real=80, yld=[1, 1], kg=0.8, price=4000, food=(15, 20)),
    # Not in the spreadsheet: Đà Lạt strawberries cost about 15,000–25,000 đ/kg in 2000; seedlings are dear.
    "strawberry": dict(name="Dâu tây", seed="Cây giống dâu tây", unit="trái", seasons=["spring"], real=60, regrow=4, yld=[4, 8], kg=0.02, price=20000, food=(2, 2), seed_price=1500),
    "green_bean": dict(name="Đậu que", seed="Hạt đậu que", unit="bó", seasons=["spring"], real=55, regrow=3, yld=[1, 2], kg=0.25, price=3750, food=(8, 10)),
    # Summer
    "corn": dict(name="Ngô", seed="Ngô giống", unit="bắp", seasons=["summer"], real=75, yld=[1, 2], kg=0.35, price=1300, food=(10, 14)),
    "watermelon": dict(name="Dưa hấu", seed="Hạt dưa hấu", unit="trái", seasons=["summer"], real=70, yld=[1, 1], kg=4.0, price=2000, food=(20, 25)),
    "cucumber": dict(name="Dưa leo", seed="Hạt dưa leo", unit="trái", seasons=["summer"], real=40, regrow=2, yld=[1, 3], kg=0.25, price=2000, food=(5, 6)),
    "water_spinach": dict(name="Rau muống", seed="Hạt rau muống", unit="bó", seasons=["summer"], real=25, regrow=3, yld=[1, 1], kg=0.5, price=1400, food=(6, 8)),
    "long_bean": dict(name="Đậu đũa", seed="Hạt đậu đũa", unit="bó", seasons=["summer"], real=50, regrow=3, yld=[1, 2], kg=0.25, price=3250, food=(7, 9)),
    # Fall
    "glutinous_rice": dict(name="Lúa nếp", seed="Nếp giống", unit="bó", seasons=["fall"], real=110, yld=[1, 2], kg=1.5, price=3200),
    "sweet_potato": dict(name="Khoai lang", seed="Dây khoai lang giống", unit="củ", seasons=["fall"], real=100, yld=[2, 4], kg=0.3, price=1050, food=(10, 16)),
    "pumpkin": dict(name="Bí đỏ", seed="Hạt bí đỏ", unit="trái", seasons=["fall"], real=90, yld=[1, 1], kg=3.0, price=1600, food=(18, 24)),
    "eggplant": dict(name="Cà tím", seed="Hạt cà tím", unit="trái", seasons=["fall"], real=70, regrow=3, yld=[1, 2], kg=0.2, price=2600, food=(4, 5)),
    "chili": dict(name="Ớt", seed="Hạt ớt", unit="chùm", seasons=["fall"], real=80, regrow=3, yld=[1, 3], kg=0.1, price=8500),
    # Winter
    "cabbage": dict(name="Cải bắp", seed="Hạt cải bắp", unit="bắp", seasons=["winter"], real=90, yld=[1, 1], kg=1.5, price=2150, food=(12, 16)),
    "kohlrabi": dict(name="Su hào", seed="Hạt su hào", unit="củ", seasons=["winter"], real=60, yld=[1, 1], kg=0.4, price=1850, food=(8, 10)),
    "parsnip": dict(name="Củ cải trắng", seed="Hạt củ cải trắng", unit="củ", seasons=["winter"], real=45, yld=[1, 1], kg=0.5, price=1400, food=(10, 12)),
    "carrot": dict(name="Cà rốt", seed="Hạt cà rốt", unit="củ", seasons=["winter"], real=80, yld=[1, 2], kg=0.2, price=2500, food=(6, 8)),
    "garlic": dict(name="Tỏi", seed="Tỏi giống", unit="củ", seasons=["winter"], real=120, yld=[3, 6], kg=0.05, price=8000),
}

# Other items, in đồng of 2000 (spreadsheet where it has them, else a reasonable estimate).
PRICES = {
    "fishing_rod": 15000, "whip": 2000, "worm": 200,
    "copper_ore": 400, "iron_ore": 900, "gold_ore": 1800,
    "wood": 100, "stone": 100, "fiber": 50,
    "gao": 3300,  # rice, retail, a kilo
    "egg": 1000,  # free-range hen's egg
    "com_nam": 1000, "banh_mi": 1500, "ca_phe_sua_da": 2500,
    "backpack_cloth": 20000, "backpack_large": 60000, "sleeping_mat": 15000,
    "fish_fry": 250,
    # Fish are sold by the kilo: see apply_vn2000_fish.py (wave 2).
    # Young animals (Chan_Nuoi): chick, piglet (20 kg), calf; a buffalo calf is dearer than a cow calf.
    "animal_chicken": 3000, "animal_pig": 315000, "animal_cow": 1500000, "animal_buffalo": 1800000,
    # Vehicles (May_Xe where listed).
    "motorbike": 19500000, "tractor": 13500000, "harvester": 200000000,
    "ox_cart": 2500000, "water_truck": 25000000,
}

FERTILIZER = {
    "name": "Phân bón",
    "category": "fertilizer",
    "stackable": True,
    "sellPrice": 300,
    "description": "Một nắm phân chuồng trộn NPK cho một ô đất đang có cây. Ngày được bón, cây tăng 10% khả năng đạt cân nặng tối đa (thay cho 5% của tưới nước).",
}


def round100(x: float) -> int:
    return max(100, int(round(x / 100.0)) * 100)


def game_days(real: int) -> int:
    return max(2, round(real / REAL_DAYS_PER_GAME_DAY))


def stages(days: int) -> list[int]:
    """Four growth stages (the crop sprite picks its picture by fraction grown)."""
    base, extra = divmod(days, 4)
    return [base + (1 if i < extra else 0) for i in range(4)]


def fmt(n: float) -> str:
    return f"{n:,.0f}".replace(",", ".")


def kg_text(kg: float) -> str:
    return f"{kg:g}".replace(".", ",")


def main() -> None:
    items = json.loads((DATA / "items.json").read_text())
    crops_out: dict[str, dict] = {}
    for cid, c in CROPS.items():
        days = game_days(c["real"])
        avg_units = sum(c["yld"]) / 2
        seed_price = c.get("seed_price") or round100(avg_units * c["kg"] * c["price"] * SEED_COST_SHARE)
        seasons = ", ".join(SEASON_VI[s] for s in c["seasons"])
        seed_id = f"{cid}_seeds"
        crop = {"name": c["name"], "seedItemId": seed_id, "harvestedItemId": cid, "season": c["seasons"],
                "growthStages": stages(days), "harvestYield": c["yld"]}
        if c.get("regrow"):
            crop["regrowDays"] = c["regrow"]
        crops_out[cid] = crop
        regrow = f", ra lứa mới sau {c['regrow']} ngày" if c.get("regrow") else ""
        seed = dict(items.get(seed_id, {}))
        seed.update(name=c["seed"], category="seed", stackable=True, sellPrice=seed_price,
                    description=f"Gieo được 1 ô. Mùa: {seasons}. Chín sau {days} ngày{regrow}. Trồng đúng mùa: +50% khả năng đạt cân nặng tối đa.")
        items[seed_id] = seed
        produce = dict(items.get(cid, {}))
        units = f"{c['yld'][0]}" if c["yld"][0] == c["yld"][1] else f"{c['yld'][0]}–{c['yld'][1]}"
        produce.update(name=c["name"], category="crop", stackable=True, unit=c["unit"], maxKg=c["kg"], pricePerKg=c["price"],
                       sellPrice=round(c["kg"] * 0.7 * c["price"]),
                       description=f"{units} {c['unit']} mỗi ô, mỗi {c['unit']} nặng tối đa {kg_text(c['kg'])} kg. Giá {fmt(c['price'])} đ/kg.")
        if c.get("food"):
            produce["food"] = {"energy": c["food"][0], "hunger": c["food"][1]}
        else:
            produce.pop("food", None)
        items[cid] = produce
    items["fertilizer"] = FERTILIZER
    for iid, price in PRICES.items():
        if iid in items:
            items[iid]["sellPrice"] = price
    (DATA / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    (DATA / "crops.json").write_text(json.dumps(crops_out, ensure_ascii=False, indent=2) + "\n")

    shops = json.loads((DATA / "shops.json").read_text())
    animals = [i for i in shops["seed_shop"]["stock"] if i.startswith("animal_")]
    shops["seed_shop"]["stock"] = [f"{c}_seeds" for c in CROPS] + ["fertilizer"] + animals
    shops["market_veg"]["stock"] = [c for c, d in CROPS.items() if d.get("food") and c not in ("rice",)]
    (DATA / "shops.json").write_text(json.dumps(shops, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(CROPS)} crops, {len(PRICES)} other prices")


if __name__ == "__main__":
    main()
