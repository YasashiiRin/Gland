# Nguồn tài nguyên (asset)

| File | Nguồn | Giấy phép |
|------|-------|-----------|
| public/assets/tilesets/*.png | Tự vẽ bằng code: scripts/art/tiles.py, scripts/art/mine.py | Thuộc dự án |
| public/assets/sprites/player.png, sprites/npcs/*.png | Tự vẽ bằng code: scripts/art/characters.py | Thuộc dự án |
| public/assets/sprites/trees, props, furniture, crops, vehicles | Tự vẽ bằng code: scripts/art/{nature,vn_nature,buildings,furniture,crops,vehicles}.py | Thuộc dự án |
| public/assets/sprites/pack.json, maps/*.tmj | Sinh bởi scripts/gen_placeholders.py | Thuộc dự án |

Khi thay bằng asset thật (ví dụ từ itch.io), ghi tên tác giả, đường link và giấy phép vào bảng này.

## Ảnh chân dung dân làng (Phase 9)

Ghép từ bộ asset nhân vật lớp do người dùng cung cấp (`game_assets/05_character_parts`),
mô tả trong README đi kèm là asset tự sinh bằng script Python (có kèm mã nguồn), lấy cảm
hứng màu sắc Stardew Valley + nét vẽ Don't Starve. Không sao chép nhân vật cụ thể của game nào.
File: `public/assets/portraits/{chu_tu,co_hanh,linh,minh}.png`.

## Hình vẽ AI theo ASSET_LIST.md (đợt 1)

Người dùng tự tạo bằng Gemini theo các prompt trong `ASSET_LIST.md` (phong cách học từ ảnh mẫu
`assets/reference.jpg`, không chép bố cục hay asset của game nào). Ảnh gốc nằm trong `assets/`
(`tiles/`, `trees/`, `crops/`, `horror/`, `icons/`); script `scripts/art/import_assets.py` thu nhỏ,
xoá nền trắng và ghi đè vào `public/assets/...` (tileset mặt đất, hầm mỏ, cây, cây trồng, ma, biểu tượng công cụ).
