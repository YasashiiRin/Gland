"""
Prices of Vietnam in 2000 (Bang_gia_nong_san_VN_2000.xlsx, sheet Thuy_San) -> game data.

Wave 2: fish. Every fish is counted in "con" and weighs up to `maxKg`; it sells by
the kilo (`pricePerKg`, the spreadsheet's average price, or an estimate where the
sheet has none). Each fish has a peak season (`peakSeason`, within the seasons it
bites in): a catch then gets +50% chance of reaching full weight (see produce.json).

Writes src/data/fish.json, the fish and fish-feed items in items.json, the fish
stall's stock in shops.json and the pond fingerlings in fishPonds.json.

Run from the repo root:  python3 scripts/data/apply_vn2000_fish.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src" / "data"

ALL = ["spring", "summer", "fall", "winter"]
SEASON_VI = {"spring": "xuân", "summer": "hạ", "fall": "thu", "winter": "đông"}
QB_HUE = ["QuangBinh", "Hue"]

# id: name, đ/kg, max kg a fish, seasons, peak seasons, hours, weather, difficulty, behaviour, water, places, note.
# Fish already in the game keep their bite rules (seasons, hours, weather, difficulty, behaviour, water,
# places) from fish.json; only their name, price, weight and peak season come from here.
FISH: dict[str, dict] = {
    # Fresh water: rivers, lakes, ponds.
    "carp": dict(name="Cá chép", price=14500, kg=1.2, seasons=ALL, peak=["spring"], hours=(6, 26), weather="any",
                 diff=15, beh="smooth", water="fresh", where=QB_HUE, note="Loại cá phổ biến quanh năm, béo nhất vào xuân."),
    "perch": dict(name="Cá rô đồng", price=20000, kg=0.15, seasons=["spring", "fall"], peak=["fall"], hours=(6, 18), weather="any",
                  diff=35, beh="mixed", water="fresh", where=QB_HUE, note="Hay gặp vào mùa xuân và mùa thu."),
    "grass_carp": dict(name="Cá trắm cỏ", price=14500, kg=3.0, seasons=["spring", "summer"], peak=["summer"], hours=(6, 26), weather="rainy",
                       diff=45, beh="smooth", water="fresh", where=["QuangBinh"], note="Thích cắn câu vào ngày mưa."),
    # Not in the sheet: a small loach, priced like a field eel (lươn đồng 40,000 đ/kg).
    "golden_loach": dict(name="Cá chạch vàng", price=40000, kg=0.15, seasons=["spring"], peak=["spring"], hours=(20, 26), weather="any",
                         diff=70, beh="dart", water="fresh", where=["QuangBinh"], note="Hiếm, chỉ xuất hiện ban đêm."),
    # Not in the sheet: cá diếc, a little cheaper than cá trê.
    "crucian": dict(name="Cá diếc", price=11000, kg=0.3, seasons=["spring", "fall", "winter"], peak=["winter"], hours=(6, 22), weather="any",
                    diff=20, beh="smooth", water="fresh", where=QB_HUE, note="Cá nước ngọt nhỏ, bơi lững lờ."),
    "snakehead": dict(name="Cá lóc đồng", price=32500, kg=1.5, seasons=["summer", "fall"], peak=["fall"], hours=(5, 20), weather="any",
                      diff=65, beh="dart", water="fresh", where=QB_HUE, note="Cá sông dữ, giật mạnh và lao rất nhanh."),
    "catfish": dict(name="Cá trê", price=12500, kg=0.6, seasons=["summer", "fall"], peak=["summer"], hours=(18, 26), weather="rainy",
                    diff=72, beh="sinker", water="fresh", where=QB_HUE, note="Hay lặn sát đáy, kéo rất nặng tay. Cắn câu nhiều khi trời mưa."),
    # Cá bống sông Gianh: a small goby, priced like cá bống tượng.
    "goby": dict(name="Cá bống", price=80000, kg=0.1, seasons=["fall", "winter"], peak=["winter"], hours=(6, 18), weather="any",
                 diff=50, beh="sinker", water="fresh", where=["QuangBinh"], note="Cá bống sông Gianh, đặc sản Quảng Bình."),
    "tilapia": dict(name="Cá rô phi", price=8500, kg=0.6, seasons=ALL, peak=["summer"], hours=(6, 20), weather="any",
                    diff=20, beh="smooth", water="fresh", where=QB_HUE, note="Cá ao hồ dễ câu, mau lớn."),
    "silver_carp": dict(name="Cá mè", price=9000, kg=2.0, seasons=["spring", "summer", "fall"], peak=["spring"], hours=(6, 20), weather="any",
                        diff=30, beh="floater", water="fresh", where=QB_HUE, note="Cá mè, cá trôi sông hồ, hay nổi gần mặt nước."),
    "linh_fish": dict(name="Cá linh", price=7500, kg=0.05, seasons=["fall"], peak=["fall"], hours=(5, 19), weather="any",
                      diff=15, beh="dart", water="fresh", where=["Hue"], note="Cá nhỏ theo con nước lũ mùa thu, rẻ mà ngon."),
    # The sea.
    "anchovy": dict(name="Cá cơm", price=4000, kg=0.03, seasons=["spring", "summer", "fall"], peak=["summer"], hours=(4, 20), weather="any",
                    diff=25, beh="mixed", water="sea", where=QB_HUE, note="Cá biển nhỏ, dễ câu."),
    "mackerel": dict(name="Cá thu", price=32500, kg=3.0, seasons=["spring", "summer"], peak=["spring"], hours=(5, 18), weather="any",
                     diff=78, beh="dart", water="sea", where=QB_HUE, note="Cá biển bơi nhanh, đổi hướng liên tục."),
    "grouper": dict(name="Cá mú", price=110000, kg=2.5, seasons=["summer", "fall"], peak=["summer"], hours=(6, 18), weather="any",
                    diff=88, beh="sinker", water="sea", where=QB_HUE, note="Cá biển quý, khỏe và rất khó kéo."),
    "scad": dict(name="Cá nục", price=6500, kg=0.15, seasons=ALL, peak=["summer"], hours=(4, 20), weather="any",
                 diff=25, beh="mixed", water="sea", where=QB_HUE, note="Cá biển bình dân, đi thành đàn."),
    "tuna": dict(name="Cá ngừ", price=16000, kg=4.0, seasons=["spring", "summer"], peak=["summer"], hours=(5, 17), weather="sunny",
                 diff=82, beh="dart", water="sea", where=QB_HUE, note="Cá biển lớn, kéo rất khỏe."),
    "pomfret": dict(name="Cá chim", price=32500, kg=0.8, seasons=["summer", "fall"], peak=["fall"], hours=(6, 18), weather="any",
                    diff=55, beh="floater", water="sea", where=QB_HUE, note="Cá biển thịt ngọt, giá cao."),
    "red_snapper": dict(name="Cá hồng", price=32500, kg=1.5, seasons=["fall", "winter"], peak=["winter"], hours=(6, 20), weather="any",
                        diff=60, beh="sinker", water="sea", where=QB_HUE, note="Cá biển đỏ au, sống gần đáy đá."),
    "indian_mackerel": dict(name="Cá bạc má", price=6500, kg=0.2, seasons=ALL, peak=["spring"], hours=(4, 20), weather="any",
                            diff=30, beh="mixed", water="sea", where=QB_HUE, note="Cá biển nhỏ, rẻ, ai cũng mua."),
    "hairtail": dict(name="Cá hố", price=16000, kg=0.8, seasons=["fall", "winter"], peak=["winter"], hours=(18, 26), weather="any",
                     diff=50, beh="dart", water="sea", where=QB_HUE, note="Cá biển dài như dải bạc, cắn câu ban đêm."),
    "barramundi": dict(name="Cá chẽm", price=45000, kg=3.0, seasons=["spring", "summer", "fall"], peak=["summer"], hours=(5, 20), weather="any",
                       diff=70, beh="mixed", water="sea", where=QB_HUE, note="Cá vùng nước lợ cửa sông, giật rất mạnh."),
}

# Thức ăn cá: a bag of trash fish (cá tạp 2,250 đ/kg), about half a kilo.
FISH_FEED = {
    "name": "Thức ăn cá",
    "category": "fish_feed",
    "stackable": True,
    "sellPrice": 1100,
    "description": "Một túi cá tạp băm (khoảng nửa ký). Cầm và bấm dùng cạnh ao để cho cá của bạn trong ao ăn. "
                   "Mỗi ngày được cho ăn, mỗi con tăng 10% khả năng đạt cân nặng tối đa khi vớt.",
}
# Fingerlings grow into these (repeats weigh the draw): tra/basa/rô phi in the sheet; tilapia most of all.
FRY_POOL = ["tilapia", "tilapia", "carp", "crucian", "crucian", "perch", "snakehead", "catfish"]
# What the fish stall sells (besides fingerlings and feed).
STALL = ["carp", "tilapia", "silver_carp", "grass_carp", "snakehead", "scad", "anchovy", "mackerel"]


def fmt(n: float) -> str:
    return f"{n:,.0f}".replace(",", ".")


def kg_text(kg: float) -> str:
    return f"{kg:g}".replace(".", ",")


def main() -> None:
    old = json.loads((DATA / "fish.json").read_text())
    fish_out: dict[str, dict] = {}
    items = json.loads((DATA / "items.json").read_text())
    for fid, f in FISH.items():
        if fid in old:
            o = old[fid]
            f = {**f, "where": o["locations"], "seasons": o["season"], "hours": (o["minHour"], o["maxHour"]), "weather": o["weather"],
                 "diff": o["difficulty"], "beh": o["behavior"], "water": o["water"]}
        assert set(f["peak"]) <= set(f["seasons"]), fid
        fish_out[fid] = {"name": f["name"], "locations": f["where"], "season": f["seasons"], "peakSeason": f["peak"],
                         "minHour": f["hours"][0], "maxHour": f["hours"][1], "weather": f["weather"],
                         "difficulty": f["diff"], "behavior": f["beh"], "water": f["water"]}
        peak = ", ".join(SEASON_VI[s] for s in f["peak"])
        item = dict(items.get(fid, {}))
        item.update(name=f["name"], category="fish", stackable=True, unit="con", maxKg=f["kg"], pricePerKg=f["price"],
                    sellPrice=round(f["kg"] * 0.7 * f["price"]),
                    description=f"{f['note']} Mỗi con nặng tối đa {kg_text(f['kg'])} kg, giá {fmt(f['price'])} đ/kg. Câu vào mùa {peak} dễ được con to.")
        items[fid] = item
    items["fish_feed"] = FISH_FEED
    (DATA / "fish.json").write_text(json.dumps(fish_out, ensure_ascii=False, indent=2) + "\n")
    (DATA / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")

    shops = json.loads((DATA / "shops.json").read_text())
    shops["market_fish"]["stock"] = STALL + ["fish_fry", "fish_feed"]
    (DATA / "shops.json").write_text(json.dumps(shops, ensure_ascii=False, indent=2) + "\n")

    ponds = json.loads((DATA / "fishPonds.json").read_text())
    ponds["fry"] = {"fish_fry": FRY_POOL}
    (DATA / "fishPonds.json").write_text(json.dumps(ponds, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(FISH)} fish")


if __name__ == "__main__":
    main()
