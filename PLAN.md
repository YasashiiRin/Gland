# PLAN.md – Kế hoạch phát triển game nông trại 2D (offline)

> **Trạng thái:** Phase 0 và Phase 1 đã xong (v0.1.0). Bước tiếp theo: Phase 2.
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
- [ ] Đồng hồ chạy, đổi ngày/mùa đúng (28 ngày/mùa).
- [ ] Có test cho TimeSystem.

### Phase 3 – Túi đồ, công cụ và năng lượng
- Dữ liệu `items.json`. `InventorySystem`: thêm, bớt, xếp chồng, đổi chỗ.
- Thanh nhanh 12 ô (phím 1–9, 0, -, = và cuộn chuột), menu túi đồ (phím E), kéo thả.
- Công cụ tương tác với ô phía trước mặt nhân vật; hoạt ảnh dùng công cụ.
- Thanh năng lượng.

**Tiêu chí hoàn thành:**
- [ ] Đổi công cụ, dùng công cụ trừ năng lượng.
- [ ] Có test cho InventorySystem.

### Phase 4 – Trồng trọt và bán hàng
- Dữ liệu `crops.json` (mùa, số ngày mỗi giai đoạn, thu hoạch lại, giá).
- Cuốc đất, gieo hạt, tưới (đất ướt đổi màu), cây lớn qua đêm, thu hoạch.
- Đất cuốc không trồng sẽ trở lại cỏ; cây chết khi đổi mùa; mưa tự tưới.
- Thùng bán và màn hình tổng kết thu nhập cuối ngày.

**Tiêu chí hoàn thành:**
- [ ] Trồng, chăm, thu hoạch và bán được ít nhất 5 loại cây.
- [ ] Có test cho FarmingSystem.

### Phase 5 – Lưu và tải game
- `SaveService`: lưu toàn bộ GameState khi đi ngủ, tải khi mở game.
- Màn hình tiêu đề: Chơi mới / Tiếp tục; tạo nhân vật (tên, tên nông trại).
- Có số phiên bản trong file lưu để nâng cấp dữ liệu sau này.

**Tiêu chí hoàn thành:**
- [ ] Tắt trình duyệt, mở lại vẫn đúng ngày, tiền, túi đồ, cây trồng.

### Phase 6 – Cửa hàng và làng
- Bản đồ làng, cửa hàng hạt giống (theo mùa), giờ mở cửa.
- Giao diện mua bán, hiển thị tiền.

### Phase 7 – Tài nguyên và hái lượm
- Cây (chặt nhiều nhát, gốc cây, cây mọc lại), đá, cỏ dại, gỗ khô.
- Đồ hái lượm theo mùa xuất hiện ngẫu nhiên mỗi ngày.

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
