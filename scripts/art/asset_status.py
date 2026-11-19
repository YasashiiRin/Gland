"""
Marks every picture of ASSET_LIST.md with where it stands, and writes the
summary at the top (the player's request, 2026-11-20: keep the list up to date
with every change). Run after adding pictures to assets/ or new entries:

    python3 scripts/art/asset_status.py

  ✅ in the game   🔁 there, but should be redrawn (why)   🟡 there, not used in the game yet
  ⬜ still missing
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from art.asset_import import SRC  # noqa: E402
from art.import_sheets import drawn_rows  # noqa: E402

LIST = SRC.parent / "ASSET_LIST.md"
START, END = "<!-- status:start -->", "<!-- status:end -->"

REDRAW = {
    "folk_5": "vẽ sẵn đòn gánh, game tự vẽ đòn gánh: cần người đi tay không",
    "ngo_mon": "vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc",
    "quang_binh_quan": "vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc",
    "pagoda_gate": "vẽ nghiêng chéo: cần nhìn thẳng từ trước",
    "cable_bridge": "vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy ngang",
    "river_bridge": "vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc",
    "truong_tien": "vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc",
    "stubble": "vẽ thành cả thửa ruộng: cần 1 ô gốc rạ phủ kín",
}
NOT_USED = {
    "rice_young": "game chưa có ô lúa non riêng",
    "buffalo_plough": "chưa có cảnh dân làng cày bằng trâu", "rice_sheaf": "chưa đặt lên bản đồ",
    "produce_baskets": "chưa đặt lên bản đồ", "hat_drying_rack": "chưa đặt lên bản đồ",
    "drying_leaves": "chưa đặt lên bản đồ", "ferry_boat": "chưa đặt lên bản đồ", "wooden_jetty": "chưa đặt lên bản đồ",
    "bamboo_fence": "chưa đặt lên bản đồ", "flower_bush": "chưa đặt lên bản đồ", "garden_house": "chưa đặt lên bản đồ",
    "drying_rice": "chưa đặt lên bản đồ", "tree_stump": "chưa có code hiện gốc cây",
}
# The player's sheet came as characters/character.png
SAME_AS = {"player": "character"}


def find_any(name: str) -> Path | None:
    for n in (name, SAME_AS.get(name, "")):
        if not n:
            continue
        for pattern in (f"{n}.png", f"{n}.png.png"):
            hits = sorted(p for p in SRC.rglob(pattern) if "previews" not in p.parts)
            if hits:
                return hits[0]
    return None


def status(rel: str) -> tuple[str, str]:
    """(mark, note) for assets/<rel>."""
    name = Path(rel).stem
    p = find_any(name)
    if not p:
        return "⬜", "còn thiếu"
    if name in REDRAW:
        return "🔁", f"có ảnh, cần vẽ lại: {REDRAW[name]}"
    if name in NOT_USED:
        return "🟡", f"có ảnh, chưa dùng: {NOT_USED[name]}"
    if rel.startswith("characters/") and not name.startswith("vendor_") and drawn_rows(p) != 3:
        return "🔁", "đang dùng 1 hình mỗi hướng: vẽ lại theo prompt 3 hàng để có bước chân"
    return "✅", "đã có trong game"


def main() -> None:
    text = LIST.read_text()
    lines = text.split("\n")
    out, section, rows = [], "", []
    for line in lines:
        if line.startswith("- **Tình trạng:**"):
            continue  # rewritten below
        out.append(line)
        if line.startswith("## "):
            section = line[3:].strip()
        m = re.match(r"- \*\*File:\*\* `assets/([^`]+)`", line)
        if m:
            mark, note = status(m.group(1))
            out.append(f"- **Tình trạng:** {mark} {note}")
            title = next((x[4:] for x in reversed(out) if x.startswith("### ")), m.group(1))
            rows.append((section, title, m.group(1), mark, note))
    text = "\n".join(out)
    count = {k: sum(1 for r in rows if r[3] == k) for k in ("✅", "🔁", "🟡", "⬜")}
    summary = [START, "", "### Tình trạng (tự cập nhật bằng `python3 scripts/art/asset_status.py`)", "",
               f"✅ đã có trong game: **{count['✅']}** · 🔁 có nhưng cần vẽ lại: **{count['🔁']}** · "
               f"🟡 có ảnh, chưa dùng trong game: **{count['🟡']}** · ⬜ còn thiếu: **{count['⬜']}** (tổng {len(rows)})", ""]
    for mark, head in (("🔁", "Cần vẽ lại"), ("⬜", "Còn thiếu, cần vẽ tiếp"), ("🟡", "Có ảnh, chờ đưa vào game")):
        group = [r for r in rows if r[3] == mark]
        if not group:
            continue
        summary += [f"**{head} ({len(group)}):**", ""]
        last = None
        for sec, title, rel, _, note in group:
            if sec != last:
                summary.append(f"- *{sec}*")
                last = sec
            summary.append(f"  - {title} — `assets/{rel}`" + (f" ({note.split(': ', 1)[1]})" if mark != "⬜" and ": " in note else ""))
        summary.append("")
    summary.append(END)
    block = "\n".join(summary)
    if START in text:
        text = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: block, text, flags=re.S)
    else:
        text = text.replace("## Cách dùng", block + "\n\n## Cách dùng", 1)
    LIST.write_text(text)
    print(f"ASSET_LIST.md: {count}")


if __name__ == "__main__":
    main()
