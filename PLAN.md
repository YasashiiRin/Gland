# PLAN.md – Kế hoạch phát triển game nông trại 2D (offline)

> **Trạng thái:** Phase 0–7 đã xong (v0.7.0). Bước tiếp theo: Phase 8 (chế tạo & máy chế biến).
>
> Ghi chú Phase 7: `ResourceSystem` (logic thuần, có test) quản lý `GameState.resourceNodes` (key "mapKey:x,y").
> Tái sử dụng tile trang trí có sẵn (TRUNK=cây, ROCK=đá, BUSH=cỏ dại) làm tài nguyên tương tác được — không cần
> thêm object mới trên bản đồ. Logic dùng chung giữa mọi bản đồ qua `MapScene.applyGatheringToolEffect`, không
> chỉ riêng Nông trại. Hiệu ứng chữ bay lên (`showFloatingText`) khi nhận gỗ/đá/sợi.
>
> Ghi chú giao diện: gộp HUD thành 2 bảng gọn (trạng thái + đồng hồ), thay toàn bộ icon vật phẩm ô-màu-chữ-tắt
> bằng icon vẽ tay bằng code riêng cho từng món (`src/ui/itemIcons.ts`).
>
> Ghi chú Phase 6: `ShopSystem` (logic thuần, có test) + `ShopMenu` (UI). Cửa hàng hạt giống ở Làng, tương tác
> bằng **E** đứng cạnh cửa. Đóng cửa bằng nút "Đóng" hoặc phím **Esc** (cũng dùng để đóng túi đồ).
>
> Ghi chú đồ họa: đã thêm viền đậm (màu "ink") quanh nhân vật, cây, đá, bụi cây theo hướng phong cách
> nét vẽ tay/viền rõ (lấy cảm hứng chung, không sao chép hình cụ thể từ game nào). Xem `INK`/`outline_ellipse`
> trong `scripts/gen_placeholders.py`.
>
> Ghi chú Phase 5: `SaveService` lưu/tải qua `localStorage` (khoá `farm-game-save`), tự lưu mỗi khi sang ngày mới
> và khi đóng/tải lại trang (`beforeunload`). Màn hình tiêu đề (`TitleScene`) là scene đầu tiên; "Tiếp tục" chỉ
> sáng lên khi có save. Tên nhân vật/nông trại hiện dùng mặc định ("Nông dân" / "Nông trại nhỏ"), **chưa có** màn
> hình nhập tên tuỳ chỉnh (Phaser không có input chữ sẵn, cần overlay HTML — để lại cho phase hoàn thiện sau).
> Tên game tạm thời: "Vườn Nhà Nhỏ" — đổi dễ dàng trong `TitleScene.ts`.
>
> Ghi chú Phase 3: `docs/game-design.md` mô tả đầy đủ cơ chế các phase 3–15.
> Túi đồ 36 ô (`InventorySystem`), công cụ tốn năng lượng (`EnergySystem`), chọn hotbar bằng phím số/cuộn chuột,
> dùng đồ bằng Space, mở túi đồ bằng phím I.
>
> Ghi chú Phase 4: `FarmingSystem` (logic thuần) quản lý `GameState.farmPlots` (key "x,y" trên bản đồ Nông trại).
> Cuốc/tưới/trồng bằng Space (dùng đúng công cụ/hạt giống đang chọn ở hotbar), thu hoạch bằng **E** khi đứng trước cây chín.
> `FarmScene` vẽ lại tile đất + cây mỗi lần vào lại bản đồ (tilemap load lại từ file tĩnh nên phải tô lại từ `gameState.farmPlots`).
> Thùng bán ở gần nhà (object `shipping_bin`): đứng cạnh, bấm **E** để gửi cả chồng đồ đang cầm vào thùng; tiền cộng vào `money` lúc ngủ qua đêm.
> 5 loại cây đã có: củ cải trắng, khoai tây, súp lơ, dâu tây (thu hoạch lại), đậu que (thu hoạch lại).
>
> Ghi chú Phase 2: đồng hồ chạy trong `UIScene` (10 phút game ≈ 7 giây thực, xem `src/config/time.ts`).
> Ngủ bằng cách lại gần giường trong nhà rồi bấm **E**; thức quá 2:00 sẽ tự ngất và bị đưa về giường.
> Thời tiết random mỗi ngày mới theo mùa (`rollWeather`); mưa chỉ hiện hiệu ứng ở bản đồ ngoài trời (`isOutdoor`).
>
> Ghi chú kỹ thuật đã có: bản đồ tạo bởi `scripts/gen_placeholders.py` (Tiled JSON, layer `ground`/`decor`/`above`/`objects`).
> Cửa là object tên `door` với thuộc tính `to` (tên map) và `spawn`; điểm xuất hiện là object tên `spawn_<id>`.
> Tile có thuộc tính `collides` sẽ chặn đường. Khu đất có rào ở nông trại (tile `tilled_soil`) để dành cho Phase 4.

## 1. Tóm tắt thiết kế game

**Thể loại:** mô phỏng nông trại, góc nhìn từ trên xuống, pixel art 16x16, chơi đơn, offline.

**Vòng lặp chính mỗi ngày:** thức dậy 6:00 → làm việc (trồng trọt, khai thác, câu cá, gặp dân làng) → bỏ hàng vào thùng bán → đi ngủ → nhận tiền, cây lớn, sang ngày mới.

**Các hệ thống chính:**
- **Thời gian:** ngày từ 6:00 đến 2:00 sáng hôm sau; mỗi 10 phút trong game ≈ 7 giây thực. 4 mùa, mỗi mùa 28 ngày. Thời tiết: nắng, mưa (tự tưới cây), bão.
- **Năng lượng:** dùng công cụ tốn năng lượng; hết năng lượng thì đi chậm; ngủ để hồi phục. Thức quá 2:00 sẽ ngất và mất tiền.
- **Trồng trọt:** cuốc đất → gieo hạt → tưới nước mỗi ngày → cây lớn qua nhiều giai đoạn → thu hoạch. Mỗi cây chỉ mọc trong mùa nhất định, chết khi đổi mùa. Một số cây thu hoạch nhiều lần.
- **Công cụ:** cuốc, bình tưới, rìu, cuốc chim, liềm, cần câu, kiếm. Có thể nâng cấp.
- **Túi đồ:** thanh nhanh 12 ô, túi đồ 36 ô, vật phẩm xếp chồng.
- **Kinh tế:** thùng bán (thanh toán qua đêm), cửa hàng hạt giống, thợ rèn, cửa hàng dụng cụ.
- **Thu thập:** cây cối, đá, cỏ dại, đồ hái lượm theo mùa.
- **Chế tạo & nấu ăn:** công thức mở khóa theo cấp độ; rương, vòi phun tự động, bù nhìn, máy chế biến.
- **Dân làng (NPC):** lịch di chuyển theo giờ/ngày/mùa, hội thoại, độ thân thiết (tim), tặng quà, sinh nhật.
- **Câu cá:** minigame giữ thanh trong vùng cá di chuyển.
- **Hầm mỏ:** nhiều tầng tạo ngẫu nhiên, đá chứa quặng, thang xuống tầng, quái vật, chiến đấu, máu.
- **Vật nuôi:** chuồng gà, chuồng gia súc, cho ăn, vuốt ve, thu sản phẩm.
- **Kỹ năng:** Trồng trọt, Khai thác, Hái lượm, Câu cá, Chiến đấu; cấp 1–10.
- **Mục tiêu dài hạn:** hệ thống nhiệm vụ / bộ sưu tập (tự thiết kế, ví dụ khôi phục một tòa nhà trong làng) để mở khóa khu vực mới.

**Bản sắc riêng (bắt buộc):** tên làng, tên và tính cách NPC, cốt truyện, bản đồ đều do mình tự thiết kế. Ghi vào `docs/world.md` ở Phase 9.

---

## 2. Các phase

Mỗi phase là một phiên làm việc với Claude Code. Làm xong, chơi thử, commit git rồi mới sang phase tiếp theo.

### Phase 0 – Khởi tạo dự án
- Vite + TypeScript + Phaser 3, cấu hình pixel art, Vitest, ESLint.
- Tạo cấu trúc thư mục theo CLAUDE.md.
- Script tạo asset placeholder (nhân vật 16x32, tile đất/cỏ/nước 16x16).
- Scene Boot → Preload (thanh tải) → Farm (màn hình trống).

**Tiêu chí hoàn thành:**
- [x] `npm run dev` mở được game, thấy màn hình nông trại trống.
- [x] `npm run build` và `npm test` chạy không lỗi.

### Phase 1 – Nhân vật và bản đồ
- Bản đồ nông trại từ Tiled (layer: ground, decoration, collision, objects).
- Nhân vật đi 4 hướng (WASD/phím mũi tên), hoạt ảnh đi/đứng, va chạm với tường, nước, đồ vật.
- Camera theo nhân vật, giới hạn trong bản đồ.
- Chuyển cảnh qua cửa: Farm ↔ House ↔ Town (có hiệu ứng mờ dần).

**Tiêu chí hoàn thành:**
- [x] Đi lại mượt, không xuyên tường.
- [x] Vào nhà và ra làng được, xuất hiện đúng vị trí cửa.

### Phase 2 – Thời gian, ngày và thời tiết
- `TimeSystem`: đồng hồ, ngày, mùa, năm; hiển thị góc màn hình.
- Trời tối dần từ chiều; ánh sáng ban đêm.
- Ngủ trên giường → màn hình tổng kết → sang ngày mới. Ngất lúc 2:00.
- Thời tiết ngẫu nhiên theo mùa, hiệu ứng mưa.

**Tiêu chí hoàn thành:**
- [x] Đồng hồ chạy, đổi ngày/mùa đúng (28 ngày/mùa).
- [x] Có test cho TimeSystem.

### Phase 3 – Túi đồ, công cụ và năng lượng
- Dữ liệu `items.json`. `InventorySystem`: thêm, bớt, xếp chồng, đổi chỗ.
- Thanh nhanh 12 ô (phím 1–9, 0, -, = và cuộn chuột), menu túi đồ (phím E), kéo thả.
- Công cụ tương tác với ô phía trước mặt nhân vật; hoạt ảnh dùng công cụ.
- Thanh năng lượng.

**Tiêu chí hoàn thành:**
- [x] Đổi công cụ, dùng công cụ trừ năng lượng.
- [x] Có test cho InventorySystem.

### Phase 4 – Trồng trọt và bán hàng
- Dữ liệu `crops.json` (mùa, số ngày mỗi giai đoạn, thu hoạch lại, giá).
- Cuốc đất, gieo hạt, tưới (đất ướt đổi màu), cây lớn qua đêm, thu hoạch.
- Đất cuốc không trồng sẽ trở lại cỏ; cây chết khi đổi mùa; mưa tự tưới.
- Thùng bán và màn hình tổng kết thu nhập cuối ngày.

**Tiêu chí hoàn thành:**
- [x] Trồng, chăm, thu hoạch và bán được ít nhất 5 loại cây.
- [x] Có test cho FarmingSystem.

### Phase 5 – Lưu và tải game
- `SaveService`: lưu toàn bộ GameState khi đi ngủ, tải khi mở game.
- Màn hình tiêu đề: Chơi mới / Tiếp tục; tạo nhân vật (tên, tên nông trại).
- Có số phiên bản trong file lưu để nâng cấp dữ liệu sau này.

**Tiêu chí hoàn thành:**
- [x] Tắt trình duyệt, mở lại vẫn đúng ngày, tiền, túi đồ, cây trồng.

### Phase 6 – Cửa hàng và làng  ✅ Đã xong
- Bản đồ làng, cửa hàng hạt giống (theo mùa), giờ mở cửa.
- Giao diện mua bán, hiển thị tiền.
- Ghi chú: cửa hàng tương tác ngay ở cửa ngoài trời (không có phòng nội thất riêng, để đơn giản hoá phạm vi).
  Mỗi lần bấm "Mua" lấy đúng 1 món; mở giờ 9:00–17:00, nghỉ 1 ngày/tuần (`ShopSystem.isShopOpen`).

### Phase 7 – Tài nguyên và hái lượm  ✅ Đã xong (bản rút gọn)
- Chặt cây bằng rìu (3 nhát, rơi 3-6 gỗ, mọc lại sau 3 ngày).
- Đập đá bằng cuốc chim (1 nhát, rơi 1-3 đá, mọc lại sau 1 ngày).
- Cắt cỏ dại bằng liềm (dùng lại tile bụi cây trang trí có sẵn, 1 nhát, rơi 1-2 sợi, mọc lại sau 1 ngày).
- **Chưa làm**: đồ hái lượm theo mùa xuất hiện ngẫu nhiên mỗi sáng (nấm, quả mọng...) — để dành cho một bản cập nhật sau,
  vì hệ thống chặt/đập/cắt ở trên đã là phần quan trọng nhất và dùng chung được object đã có sẵn trên bản đồ.

### Phase 8 – Chế tạo
- Dữ liệu `recipes.json`, menu chế tạo.
- Đặt đồ xuống đất: rương (có túi đồ riêng), vòi phun tự động, bù nhìn (quạ ăn cây nếu không có), hàng rào.
- Máy chế biến (ví dụ: thùng ủ, lọ ngâm) chạy theo thời gian.

### Phase 9 – Dân làng
- Viết `docs/world.md`: tên làng, 6–8 NPC nguyên bản (tính cách, sở thích, sinh nhật).
- NPC đi theo lịch, tìm đường (A*) trên bản đồ.
- Hộp thoại có chân dung, lời thoại theo mùa/thời tiết/độ thân thiết.
- Độ thân thiết (tim), tặng quà (thích/ghét), sinh nhật x8 điểm.
- Menu xem quan hệ.

### Phase 10 – Câu cá
- Minigame câu cá; dữ liệu `fish.json` (địa điểm, mùa, giờ, thời tiết, độ khó).

### Phase 11 – Hầm mỏ và chiến đấu
- Tầng mỏ tạo ngẫu nhiên, đá chứa quặng, thang xuống tầng, thang máy mỗi 5 tầng.
- Quái vật đơn giản, vũ khí, máu, ăn đồ để hồi phục, ngất trong mỏ mất đồ.
- Thợ rèn: nấu quặng, nâng cấp công cụ.

### Phase 12 – Vật nuôi
- Xây chuồng (thợ mộc), mua gà/bò, cho ăn cỏ khô, vuốt ve, thu trứng/sữa.

### Phase 13 – Kỹ năng và nhiệm vụ dài hạn
- 5 kỹ năng, kinh nghiệm, lên cấp mở công thức.
- Hệ thống bộ sưu tập/nhiệm vụ mở khóa khu vực mới.
- Sự kiện lễ hội (1 lễ mỗi mùa).

### Phase 14 – Hoàn thiện
- Âm thanh và nhạc nền theo mùa, menu cài đặt (âm lượng, phím), hỗ trợ tay cầm.
- Tối ưu hiệu năng, sửa lỗi, cân bằng giá cả.

### Phase 15 – Đóng gói desktop
- Đóng gói bằng Tauri thành file chạy Windows/Mac.
- Chuyển SaveService sang lưu file trên máy.

---

## 3. Mốc kiểm tra

- **Sau Phase 5:** bản chơi được tối thiểu (trồng, bán, lưu game). Dừng lại chơi thử vài ngày trong game, ghi lại cảm nhận trước khi đi tiếp.
- **Sau Phase 9:** game bắt đầu có "hồn". Thay asset placeholder bằng asset thật tại đây.
- **Sau Phase 14:** bản hoàn chỉnh.
