# CLAUDE.md – Hướng dẫn cho Claude Code

Đây là dự án game nông trại 2D offline, lấy cảm hứng từ thể loại "cozy farming sim" (như Stardew Valley).
Gameplay tương tự thể loại, nhưng **toàn bộ nhân vật, tên gọi, bản đồ, cốt truyện, hình ảnh và âm thanh là nguyên bản**.
Không sao chép asset, tên NPC, tên địa danh, lời thoại hay dữ liệu từ Stardew Valley.

Kế hoạch chi tiết nằm trong `PLAN.md`. Luôn đọc `PLAN.md` trước khi bắt đầu một phase mới.

## Công nghệ

- **Phaser 3** (ghim một phiên bản 3.x ổn định trong package.json, không dùng `latest`)
- **TypeScript** (strict mode)
- **Vite** để chạy dev server và build
- **Tiled** (file `.tmj` JSON) để thiết kế bản đồ
- **Vitest** để test phần logic thuần
- Lưu game: `localStorage` (bọc trong lớp `SaveService` để sau này đổi sang file khi đóng gói desktop)
- Đóng gói desktop (phase cuối): **Tauri**

## Cấu trúc thư mục

```
src/
  main.ts              # khởi tạo Phaser
  config/              # hằng số game (kích thước tile, tốc độ thời gian...)
  scenes/              # Boot, Preload, Farm, House, Town, Mine, UI...
  systems/             # TimeSystem, FarmingSystem, InventorySystem... (logic thuần, không phụ thuộc Phaser nếu được)
  entities/            # Player, NPC, Crop, Animal...
  ui/                  # Hotbar, InventoryMenu, DialogueBox, ShopMenu...
  data/                # JSON: items, crops, recipes, npcs, shops, fish...
  state/               # GameState (nguồn dữ liệu duy nhất), SaveService
  events/              # EventBus và danh sách tên sự kiện
public/assets/
  sprites/ tilesets/ maps/ audio/ fonts/
tests/                 # test Vitest cho systems/
```

## Quy tắc kiến trúc

1. **Dữ liệu tách khỏi code.** Vật phẩm, cây trồng, công thức, NPC, cửa hàng đều định nghĩa trong `src/data/*.json`. Thêm cây mới không cần sửa code.
2. **GameState là nguồn sự thật duy nhất.** Scene chỉ hiển thị trạng thái; mọi thay đổi đi qua các system. GameState phải serialize được thành JSON để lưu game.
3. **System là logic thuần.** Ví dụ `FarmingSystem.advanceDay(state)` không gọi Phaser. Nhờ vậy test được bằng Vitest.
4. **Giao tiếp qua EventBus** (ví dụ `day:started`, `item:added`, `crop:harvested`), không để scene gọi chéo lẫn nhau.
5. **Pixel art chuẩn:** `pixelArt: true`, `roundPixels: true`, tile 16x16, phóng to theo số nguyên (x3 hoặc x4).
6. Không dùng `any`. Mỗi file nên dưới ~300 dòng; tách file khi lớn hơn.

## Asset

- Nếu chưa có asset thật, tạo **placeholder** (phong cách pastel ấm, nhân vật chibi, đúng kích thước 16x16 / 16x32) bằng script `scripts/gen_placeholders.py`, để gameplay chạy được trước. Không sao chép hình ảnh từ bất kỳ bộ asset có bản quyền nào (kể cả khi 'lấy cảm hứng' từ một bộ cụ thể) — chỉ học phong cách chung (màu pastel, hình tròn mềm mại), không sao chép bố cục/pixel cụ thể.
- Asset thật sẽ do người dùng thêm vào (bộ asset có bản quyền hợp lệ từ itch.io). Viết code để chỉ cần thay file PNG, không cần sửa logic.
- Ghi nguồn và giấy phép của mọi asset vào `CREDITS.md`.

## Cách làm việc

- Mỗi lần chỉ làm **một phase** trong `PLAN.md`. Không làm trước phase sau.
- Trước khi code: tóm tắt ngắn những gì sẽ làm trong phase này.
- Sau khi code: chạy `npm run build` và `npm test`, sửa hết lỗi TypeScript và test.
- Cuối phase: kiểm tra từng mục "Tiêu chí hoàn thành" trong PLAN.md, đánh dấu [x] những mục đã xong, và viết hướng dẫn ngắn để người dùng tự chơi thử.
- Giải thích cho người dùng bằng **tiếng Việt**, dễ hiểu, vì người dùng không phải lập trình viên chuyên nghiệp. Code, tên biến và comment trong code dùng tiếng Anh.
- Khi sửa lỗi người dùng báo, hỏi lại nếu mô tả chưa rõ thay vì đoán.

## Lệnh

- `npm run dev` – chạy game ở http://localhost:5173
- `npm run build` – build kiểm tra lỗi
- `npm test` – chạy test
