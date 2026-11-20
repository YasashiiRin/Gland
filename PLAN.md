# PLAN.md – Kế hoạch phát triển game nông trại 2D (offline)

> **Trạng thái:** Phase 0–14 hoàn thành đầy đủ và đã kiểm thử (v0.14.0). Phase 15 chỉ hoàn thành được
> phần cấu hình, chưa build/test thật được (xem ghi chú Phase 15 bên dưới) — đây là **giới hạn môi trường**,
> không phải việc bỏ dở. Toàn bộ 16 phase trong kế hoạch gốc đã được triển khai ở một mức độ nào đó.
>
> Việc tiếp theo nếu muốn hoàn thiện Phase 15 thật sự: mở thư mục này trong Claude Code hoặc Claude Cowork
> trên máy có cài Rust, chạy `cargo tauri dev` để thử, rồi `cargo tauri build` để ra file cài đặt.
>
> Ghi chú Phase 14: `SfxSystem` dùng trực tiếp Web Audio API (oscillator), không qua Phaser Sound Manager vì
> không có file âm thanh. `GameState.settings` lưu âm lượng/tắt tiếng (lưu ý: hiện nằm trong save file, nên
> "Chơi mới" sẽ reset về mặc định thay vì giữ nguyên tuỳ chọn cũ — có thể tách riêng khỏi save sau).
>
> Ghi chú Phase 13: `SkillSystem` + `QuestSystem` (logic thuần, có test). XP cộng trực tiếp tại nơi hành động xảy ra
> (`MapScene`, `FarmScene`, `MineScene`, `UIScene.resolveFishing`) — chưa có menu riêng hiển thị cấp độ, chỉ lưu
> trong `GameState.skills`. Quỹ cộng đồng dùng lại chính object `quest_board` đặt cạnh biển chỉ dẫn có sẵn ở Làng.
>
> Ghi chú Phase 12: `AnimalSystem` (logic thuần, có test). Vật nuôi gắn vào `PlacedObjectSystem` (thêm kind
> `chicken_coop`, field `animal`), xử lý qua đêm trong `MapScene.sleepSequence` cùng chỗ với vòi tưới tự động.
>
> Ghi chú Phase 11: `MineSystem` + `CombatSystem` (logic thuần, có test). `MineScene` là scene riêng, **không** kế thừa
> `MapScene` (hầm mỏ không dùng Tiled, không có cửa/giường/NPC) — tilemap dựng trực tiếp từ mảng số qua
> `this.make.tilemap({data,...})`. Thời gian dừng hoàn toàn khi ở trong hầm mỏ (`timeControl.paused=true`).</br>
> Thêm vật phẩm kiếm + 3 loại quặng, icon riêng cho từng loại.
>
> Ghi chú Phase 10: `FishingSystem` (logic thuần, có test) mô phỏng vật lý thanh/vùng cá; UI ở `ui/FishingMinigame.ts`,
> điều khiển qua một phím Space riêng trong `UIScene` (giữ=kéo lên, thả=rơi xuống do trọng lực).
> Lưu ý quan trọng khi mở rộng công cụ sau này: các map scene con (`FarmScene`...) ghi đè `applyToolEffect`
> phải luôn gọi `super.applyToolEffect(itemId, tile)` ở nhánh else, nếu không các công cụ xử lý ở lớp cha
> (rìu/cuốc chim/liềm/cần câu) sẽ âm thầm không hoạt động trên map đó mà không báo lỗi gì.
>
> Ghi chú Phase 9: `RelationshipSystem` (logic thuần, có test) quản lý `GameState.relationships`.
> NPC data ở `data/npcs.json` + `data/dialogues.json`. Ảnh chân dung ghép từ bộ asset người dùng gửi,
> lưu ở `public/assets/portraits/`, xem nguồn gốc trong `CREDITS.md`.
> NPC chỉ xuất hiện ở bản đồ Làng trong bản này (chưa có ở Nông trại/Nhà), vị trí tính lại mỗi khi vào lại Làng
> theo giờ hiện tại — không phải di chuyển real-time trong lúc bạn đứng nhìn.
>
> Ghi chú Phase 8: `CraftingSystem` + `PlacedObjectSystem` (logic thuần, có test). `GameState.placedObjects`
> (key "mapKey:x,y") lưu rương/bù nhìn/vòi tưới. Vòi tưới tự tưới qua `sprinklerTileKeysOnMap` gọi trong
> `MapScene.sleepSequence`. Rương dùng kiểu tương tác đơn giản (click ô trống=cất, ô đầy=lấy) thay vì kéo-thả đầy đủ.
>
> Ghi chú đồ họa: thêm sắc độ loang trên cỏ, điểm sáng trên tán cây, góc sáng trên mái nhà, vân rạn trên đá —
> cho đỡ phẳng, gần phong cách Stardew Valley hơn (xem phần cập nhật bảng màu trong `scripts/gen_placeholders.py`).
> Cập nhật thêm: cỏ mượt hơn (bớt lốm đốm, mảng màu mềm thay vì chấm cứng), ô đất đã cuốc đổi từ vạch kẻ thẳng
> sang từng luống đất tròn mềm — hết cảm giác "ô vuông cứng" khi cuốc đất liền khoảnh.
> Cập nhật tiếp theo: đổi màu cỏ sang một màu xanh đậm đồng nhất (bỏ phần loang màu pastel nhạt trước đó) theo
> yêu cầu người dùng — xem `C["grass"]` trong `scripts/gen_placeholders.py`.
> Đã xem qua bộ asset nhân vật/texture do người dùng gửi (`files__1_.zip`) — xác nhận là asset tự sinh bằng script,
> không vi phạm bản quyền, nhưng khác quy mô hoàn toàn với pixel art 16px hiện tại (ảnh tĩnh 300x480, không có
> khung hình đi lại). Đề xuất dùng làm ảnh chân dung NPC ở Phase 9 thay vì thay nhân vật đi lại.
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
> Tên game: "Làng Việt" (trước đây tạm gọi "Vườn Nhà Nhỏ") — đổi trong `TitleScene.ts`, `index.html`, `src-tauri`.
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

### Phase 9 – Dân làng  ✅ Đã xong (bản rút gọn)
- `docs/world.md`: Làng Suối Hiền, 4 dân làng nguyên bản (Chú Tư, Cô Hạnh, Linh, Minh) — giảm từ 6-8 xuống 4 để vừa phạm vi.
- NPC xuất hiện đúng vị trí theo lịch 2-3 mốc giờ/ngày (`scheduleEntryAt`) — dịch chuyển tức thời, **chưa có pathfinding mượt**.
- Hộp thoại (`DialogueBox`): ảnh chân dung + tên + 1 câu thoại ngẫu nhiên trong vài câu có sẵn/người (chưa đổi theo mùa/thời tiết).
- Tặng quà: đứng cạnh, cầm đồ ăn được rồi bấm **E** — tự nhận biết yêu thích/thích/ghét/cực ghét, cộng điểm đúng,
  giới hạn 2 quà/tuần/người, sinh nhật nhân đôi điểm. Không cầm gì thì bấm E chỉ để trò chuyện.
- **Chưa làm**: menu xem danh sách độ thân thiết tất cả NPC (tim), lời thoại thay đổi theo thời tiết/mùa/độ thân thiết,
  sự kiện sinh nhật đặc biệt, pathfinding mượt — để dành cho bản cập nhật sau.

### Phase 10 – Câu cá  ✅ Đã xong
- Minigame câu cá dạng thanh dọc: vùng cá di chuyển, con mồi điều khiển bằng giữ Space, tiến trình tăng/giảm theo độ trùng khớp.
- 4 loại cá, chọn theo mùa/giờ/thời tiết/bản đồ (`data/fish.json`, `FishingSystem.pickFish`).
- Thả cần: dùng cần câu (Space) hướng vào ô nước, tốn năng lượng như công cụ khác dù câu được hay không.
- Bắt được thì thêm cá vào túi đồ (bán được qua thùng bán); sổng mất thì không có gì, chỉ mất năng lượng.

### Phase 11 – Hầm mỏ và chiến đấu
- Tầng mỏ tạo ngẫu nhiên, đá chứa quặng, thang xuống tầng, thang máy mỗi 5 tầng.
- Quái vật đơn giản, vũ khí, máu, ăn đồ để hồi phục, ngất trong mỏ mất đồ.
- Thợ rèn: nấu quặng, nâng cấp công cụ.

### Phase 12 – Vật nuôi  ✅ Đã xong (bản rút gọn: chỉ gà)
- Chuồng gà là công thức chế tạo (80 gỗ + 30 đá) rồi đặt xuống đất như rương/vòi tưới — không qua thợ mộc riêng,
  không tốn ngày chờ xây (để đơn giản hoá, khác thiết kế gốc).
- Tương tác **E**: chưa cho ăn hôm nay → cho ăn; đã cho ăn → vuốt ve (giới hạn 1 lần/ngày, tăng thân thiết);
  cả hai rồi → chỉ hiện thông báo.
- Mỗi sáng: nếu hôm qua được cho ăn → vui vẻ tăng, thân thiết tăng nhẹ; không cho ăn → vui vẻ giảm mạnh.
  Xác suất đẻ trứng tăng theo vui vẻ + thân thiết (đã test: gà vui/thân thiết cao đẻ trứng gần như chắc chắn).
- **Chưa làm**: nhiều loại vật nuôi (bò, cừu...), thức ăn phải mua/trữ cỏ khô riêng (hiện cho ăn miễn phí mỗi lần
  tương tác), chất lượng sản phẩm theo cấp (thường/bạc/vàng), chuồng gia súc (Barn) riêng — để dành bản cập nhật sau.

### Phase 13 – Kỹ năng và nhiệm vụ dài hạn  ✅ Đã xong (bản rút gọn: không có lễ hội)
- 5 kỹ năng (Trồng trọt/Khai thác/Hái lượm/Câu cá/Chiến đấu), XP cộng dồn, cấp 1-10 theo công thức `n*(n-1)*25`.
  Thu hoạch +3 XP Trồng trọt, chặt cây +4 Hái lượm, cắt cỏ +2 Hái lượm, đào quặng/đập đá +5 Khai thác,
  câu được cá +6 Câu cá, hạ quái +8 Chiến đấu — đã test từng loại qua trình duyệt thật.
- Quỹ cộng đồng (bảng ở Làng, cạnh biển chỉ dẫn): góp đủ 5 loại nông sản (củ cải, khoai tây, súp lơ, dâu tây,
  đậu que) để nhận 1000₫ — đã test hoàn thành đầy đủ.
- **Chưa làm**: lên cấp mở khoá công thức chế tạo mới (hiện công thức không phân biệt cấp độ), menu xem cấp
  độ kỹ năng, mở khu vực mới khi hoàn thành nhiệm vụ, lễ hội theo mùa — để dành bản cập nhật sau.

### Phase 14 – Hoàn thiện  ✅ Đã xong (bản rút gọn)
- Hiệu ứng âm thanh tổng hợp bằng Web Audio (dao động âm thuần, không dùng file nhạc nào): dùng công cụ, nhặt đồ,
  đánh trúng, chuông đầu ngày, click giao diện. Tất cả tự nghĩ, không sao chép từ đâu.
- Menu cài đặt (phím **Tab**): thanh âm lượng (bấm để chỉnh), nút tắt/bật tiếng, nút toàn màn hình.
- Rà soát nhanh giá bán/mua/chi phí chế tạo — không thấy bất thường rõ rệt.
- **Chưa làm**: nhạc nền theo mùa/khu vực (cần tổng hợp nhạc phức tạp hơn nhiều so với hiệu ứng ngắn, để dành sau),
  đổi phím tuỳ ý, hỗ trợ tay cầm/rung, cân bằng sâu dựa trên dữ liệu người chơi thật (cần người chơi thật để
  thu thập, không làm được chỉ bằng cách đọc code).

### Phase 15 – Đóng gói desktop
- Đóng gói bằng Tauri thành file chạy Windows/Mac.
- Chuyển SaveService sang lưu file trên máy.

---

## 3. Mốc kiểm tra

- **Sau Phase 5:** bản chơi được tối thiểu (trồng, bán, lưu game). Dừng lại chơi thử vài ngày trong game, ghi lại cảm nhận trước khi đi tiếp.
- **Sau Phase 9:** game bắt đầu có "hồn". Thay asset placeholder bằng asset thật tại đây.
- **Sau Phase 14:** bản hoàn chỉnh.


## Ghi chú sửa lỗi (sau khi hoàn thành 16 phase)
- **Thanh đen giữa màn hình + chữ "Âm lượng" nổi lơ lửng:** do `FishingMinigame.ts` và `SettingsMenu.ts` tạo
  một vài phần tử trang trí (nền thanh tiến trình câu cá, nhãn "Âm lượng") nhưng quên thêm vào container ẩn của
  menu, nên chúng hiển thị vĩnh viễn dù menu đang đóng. Đã rà soát toàn bộ các file UI khác, không còn chỗ nào bị tương tự.
- **Màu cỏ:** đổi từ pastel loang màu sang một màu xanh đậm đồng nhất theo yêu cầu người dùng.
- **"Vừa di chuyển vừa rê chuột không được":** thêm CSS chặn trình duyệt tự kéo-chọn văn bản/hình ảnh khi rê
  chuột trên canvas (`user-select: none`, chặn sự kiện `dragstart`/`selectstart`) — đây là nguyên nhân phổ biến
  khiến phím đang giữ bị "quên" giữa chừng. Đã kiểm tra kỹ bằng cách đọc mã nguồn Phaser: không có lỗi tạm dừng
  vòng lặp game ở tầng engine liên quan tới việc rê chuột.


## Ghi chú: ô highlight xanh/đỏ (theo yêu cầu người dùng)
Thêm ô vuông bán trong suốt báo trước hành động tại ô đang nhìn, lấy cảm hứng từ quy ước giao diện chung của
thể loại game nông trại (không sao chép hình ảnh cụ thể từ game nào): xanh lá nếu hành động hợp lệ, đỏ nếu không.
Áp dụng cho: cuốc, bình tưới, hạt giống, vật thể đặt (rương/bù nhìn/vòi tưới/chuồng gà) ở `FarmScene`;
rìu/cuốc chim/liềm/cần câu dùng chung logic ở `MapScene` (áp dụng mọi bản đồ). Đã test bằng cách đọc trực tiếp
trạng thái ô highlight (vị trí, màu) qua trình duyệt thật, khớp chính xác với luật hợp lệ của từng công cụ.


## Ghi chú: hiệu ứng chặt cây và tưới nước (theo yêu cầu người dùng)
- Chặt cây: bắn mảnh gỗ nhỏ (`wood_chip`) tại ô cây mỗi lần vung rìu trúng — kể cả những nhát chưa làm cây gãy,
  nhiều mảnh hơn ở nhát cuối cùng khi cây đổ. Dùng `MapScene.playBurstEffect` (particle emitter dùng 1 lần rồi tự huỷ).
- Tưới nước: giọt nước nhỏ (`water_droplet`) rơi xuống ô đất mỗi khi tưới thành công.
- Texture `wood_chip`/`water_droplet` tự vẽ bằng code (Phaser Graphics), không dùng ảnh có sẵn nào.


## Cập nhật: điều khiển chuột, đồ hoạ mới, nông trại 64×48, giao diện mới, minimap
- **Chuột:** click trái = dùng công cụ/hạt giống, click phải = tương tác (thu hoạch, rương, giường, bán...). Nhắm vào ô
  dưới con trỏ nếu ô đó sát nhân vật, nếu xa thì ô kế bên theo hướng con trỏ; dùng được cả khi đang đi. Bấm phím di
  chuyển thì quay lại nhắm bằng hướng nhìn (Space). Click ô hotbar để chọn; giữ chuột trái để kéo cần khi câu cá.
  Lưu ý: trên laptop Linux, touchpad mặc định bị tắt khi đang giữ phím — tắt "Disable while typing" trong cài đặt
  Touchpad của Ubuntu (lỗi hệ điều hành, không phải lỗi game).
- **Đồ hoạ:** bộ sinh hình tách thành `scripts/art/*` (tiles, characters, nature, buildings, furniture, crops, maps).
  Mọi sprite liệt kê trong `public/assets/sprites/pack.json` (game tự tải) → thay asset thật chỉ cần thay PNG cùng kích thước.
  Tile nước/đường tự nối viền (autotile 16 biến thể); cây, nhà, nội thất là sprite (`prop` trong Tiled) nằm trên ô va chạm
  vô hình `BLOCK`; cây rung khi chặt, đổ khi gãy, trong suốt khi đi phía sau. Cây trồng có ảnh riêng 5 giai đoạn
  (`sprites/crops/<cropId>.png`; cây mới chưa có ảnh thì dùng hình chồi mặc định).
- **Bản đồ:** nông trại 64×48 (rừng bao quanh, hầm mỏ góc đông bắc, 2 ao, rừng nhỏ phía tây, khoảnh đất trống cạnh nhà),
  nhà trong rộng 16×12 có bếp, lò sưởi, kệ sách, bàn ghế. Save cũ vẫn dùng được: ô đất/đồ đặt nằm sai chỗ trên bản đồ
  mới tự gỡ (đồ + đồ trong rương trả về túi).
- **Giao diện:** đồng hồ ngày-đêm + ngày/thời tiết/mùa + tiền ở góc trên phải; thanh năng lượng/máu dọc ở góc dưới phải
  (rê chuột để xem số); hotbar khung gỗ sát đáy; minimap + tên khu vực ở góc trên trái (phím **M** ẩn/hiện, có test cho
  `MinimapSystem`). Các menu (túi đồ, cửa hàng...) chưa đổi sang khung gỗ mới.
- **Chưa làm:** hầm mỏ vẫn dùng hình cũ (quái vật là hình tròn), icon vật phẩm vẫn vẽ bằng code cũ, đất cuốc chưa nối
  liền nhau giữa các ô kề, `MapScene.ts` đã vượt ~300 dòng (nên tách tiếp ở lần sau).


## Cập nhật: chỉ số vật phẩm, phương tiện, cài đặt/zoom, giao diện gọn, phong cách Việt Nam
- **Bỏ Shift chạy nhanh.** Tốc độ chỉ đến từ chỉ số (`StatsSystem`, có test): `stats.speed` của vũ khí đang cầm
  (kiếm -5%), xe đang cưỡi, và hiệu ứng đồ ăn có thời hạn (`GameState.buffs`). Chỉnh trong `src/data/items.json`.
- **Đồ ăn:** cầm đồ ăn + Space/chuột trái để ăn (hồi năng lượng, có món kèm buff). Quán tạp hoá Cô Hạnh ở làng bán
  cơm nắm, bánh mì, cà phê sữa đá. Cửa hàng trong Tiled giờ là object `shop` có thuộc tính `shopId`.
- **Phương tiện** (mua ở Tiệm xe trong làng; Space/chuột trái để lên/xuống; chỉ ngoài trời): xe bò (+35%, chất hàng
  bán từ xa bằng chuột phải/E), xe máy (+120%), máy cày (+15%, tự cày ô cỏ chạy qua, 1 năng lượng/ô), máy gặt lúa
  (+10%, tự gặt cây chín chạy qua). Logic ở `src/scenes/rideController.ts`; cây **lúa** mới (xuân/hạ).
- **Cài đặt:** nút ⚙ trên màn hình (hoặc Tab): âm lượng, tắt tiếng, **thu phóng 1–4x** (đổi ngay), toàn màn hình,
  danh sách phím. Save cũ thiếu trường mới được tự điền mặc định khi tải.
- **Giao diện gọn:** đồng hồ là một vòng tròn trời (mặt trời/mặt trăng chạy theo giờ) + giờ + tiền; rê chuột vào để
  xem ngày/mùa/thời tiết. Thanh năng lượng/máu mảnh ở góc dưới phải; minimap nhỏ hơn.
- **Phong cách Việt Nam:** nhà mái ngói đỏ mũi hài, bờ nóc cong, tường vôi vàng, hiên cột gỗ, cửa bức bàn, cửa sổ
  song gỗ, biển hiệu đỏ có hình minh hoạ; nón lá, áo bà ba, áo dài; lũy tre, chuối, cau, cây đa, giếng làng, đống
  rơm, chum; nội thất: sàn gạch bát, giường mắc màn, tủ chè, chạn bát, bếp kiềng, chiếu cói, tranh thư pháp.
- **Chưa làm:** người ngồi trên xe chỉ là cắt chân nhân vật (chưa có tư thế ngồi riêng); xe không có nhiên liệu;
  các menu túi đồ/cửa hàng/chế tạo chưa đổi sang khung gỗ; hầm mỏ vẫn hình cũ; `MapScene.ts` ~750 dòng (nên tách).


## Cập nhật: nhà kho, xe đậu trên bản đồ, khói, chế độ cày 2x2
- **Nhà kho** (nông trại, cạnh nhà chính): E/chuột phải ở cửa → mở kho chứa 36 ô (`GameState.warehouse`) và gọi mọi xe
  đang để nơi khác về 4 chỗ đậu trước kho (`src/data/garage.ts`, khớp với `build_farm()` trong `scripts/art/maps.py`).
- **Xe không còn là vật phẩm trong túi**: là xe thật đậu trên bản đồ (`GameState.vehicles`, `VehicleSystem` có test).
  Đứng cạnh xe + E/chuột phải = lên xe; đang lái + E/chuột phải = xuống, xe đậu tại chỗ. Vào nhà/hầm mỏ/đi ngủ thì xe
  tự đậu ngoài cửa; sang map ngoài trời khác thì xe đi cùng. Mua ở tiệm → xe được giao về nhà kho. Save cũ có xe
  trong túi được tự chuyển thành xe đậu ở kho.
- **`DEV_GIVE_ALL_VEHICLES = true`** trong `src/config/dev.ts`: có sẵn cả 4 xe để thử. **Đổi thành `false` trước khi
  phát hành** để người chơi phải mua.
- **Khi lái:** chuột trái/Space = bật/tắt chế độ làm việc (máy cày: cày; máy gặt: gặt) hoặc bấm còi (xe máy).
  Máy cày/máy gặt to 2x2 ô (thân va chạm rộng hơn), làm việc trên cả 4 ô dưới máy (ô vàng hiển thị vùng làm việc).
  Xe máy, máy cày, máy gặt nhả khói khi chạy (máy đang làm việc nhả khói dày hơn).


## Phase 16 – Chơi nhiều người (co-op, 1 chủ phòng + tối đa 2 khách)
Kết nối bằng **mã phòng 6 ký tự** qua Internet (WebRTC, thư viện `peerjs` 1.5.5). Máy chủ môi giới mặc định là dịch vụ
miễn phí `0.peerjs.com` (chỉ thấy mã phòng ngẫu nhiên; dữ liệu game đi thẳng giữa các máy). Có thể tự chạy
`peerjs-server` sau này. **Chung một nông trại**: phần dùng chung = `SHARED_KEYS` trong `src/net/protocol.ts`
(thời gian, tiền, đất, tài nguyên, đồ đặt, xe, nhà kho...); túi đồ/năng lượng/kỹ năng là riêng từng người.
Chủ phòng giữ save; khách không ghi save. Tab của chủ phòng phải luôn hiển thị (trình duyệt dừng game ở tab nền).

- [x] **Bước 1:** màn hình tiêu đề mới (Chơi một mình / Tạo phòng / Vào phòng, nền làng quê Việt), phòng chờ có mã
  phòng + danh sách người chơi, từ chối người thứ 4 ("Phòng đã đủ người"), vào giữa chừng được. Trong game: thấy
  nhau đi lại (nhuộm màu + tên, kể cả đang lái xe), giờ theo chủ phòng, khách nhận thế giới khi vào và mỗi sáng
  (chủ phòng ngủ → cả nhóm sang ngày mới; khách không tự ngủ được). Mất kết nối → khách về màn hình tiêu đề.
  Đã thử thật với 4 trình duyệt (1 chủ + 2 khách + 1 bị từ chối).
- [x] **Bước 2:** đồng bộ hành động trong ngày (`src/net/worldPatch.ts` có test, `src/net/worldSync.ts`): mỗi ~0,15s
  mỗi máy gửi phần thế giới chung vừa đổi (ô đất, tài nguyên, đồ đặt/rương, xe, độ thân thiết, nhà kho, quỹ cộng
  đồng); chủ phòng áp dụng và chuyển tiếp cho khách còn lại. Tiền và thùng bán gửi dạng cộng/trừ nên hai người làm
  cùng lúc vẫn cộng đủ; các thứ khác "ai sửa sau thắng". Không lái chung một xe ("X đang lái xe này").
  Đã thử thật 3 trình duyệt: cuốc/gieo/tưới/chặt cây/bán/tiêu tiền khớp ở cả 3 máy.
- [x] **Bước 3:** ngủ chung — ai bấm giường sẽ nằm chờ (lớp phủ "Đã ngủ x/3", nút "Dậy" để huỷ); khi tất cả đều nằm
  thì chủ phòng kết thúc ngày, khách nhận thế giới mới + bảng tổng kết, hồi đầy năng lượng và thức dậy trong nhà; ai
  chưa ngủ lúc 2:00 thì chỉ hồi nửa năng lượng (`everyoneAsleep` có test). Túi đồ/năng lượng/máu/kỹ năng của khách
  gửi về chủ phòng mỗi 5 giây, lưu trong save chủ phòng (`GameState.guestProfiles`, theo **tên** — tên trùng trong
  phòng được tự thêm số) và trả lại khi khách vào lại. Thông báo "X đã vào nông trại" / "X đã rời phòng".
  Đã thử thật 3 trình duyệt (ngủ 2/3 chưa sang ngày, 3/3 sang ngày; rời phòng rồi vào lại vẫn còn đồ).
- **Còn có thể làm thêm:** khách ở trong hầm mỏ lúc sang ngày chưa được đưa về nhà; chưa có chat; chủ phòng thoát thì
  khách về màn hình tiêu đề (không chuyển chủ phòng); máy chủ môi giới vẫn là dịch vụ miễn phí của PeerJS.


## Ảnh xem trước
Ảnh xem trước bản đồ/đồ họa để trong `docs/previews/` (tạo bằng `python3 scripts/preview_map.py <map> <file.png> [px/ô] [x0 y0 x1 y1]`).


## Cập nhật: xe bò có thùng chứa 20 ô và 2 chỗ ngồi
- Xe bò = túi đồ lớn: đang ngồi xe (lái hoặc ngồi ké) bấm chuột trái/Space để mở thùng 20 ô (`GameState.vehicleStorage`,
  dùng chung cả nhóm, đồng bộ như nhà kho). Số ô và số ghế khai báo trong `items.json` (`vehicle.storageSlots`, `vehicle.seats`).
- 2 chỗ ngồi (chơi nhiều người): đứng cạnh xe bò bạn đang lái, E/chuột phải = ngồi ké (đi theo xe, không tự lái);
  E lần nữa = xuống; người lái đậu xe hoặc sang bản đồ khác thì người ngồi ké tự xuống. Xe hết chỗ thì báo.
- Bỏ tính năng cũ "chất nông sản lên xe để bán từ xa" (trùng nút với xuống xe) — giờ chở hàng tới thùng bán.


## Cập nhật: chơi trên điện thoại (điều khiển cảm ứng)
- Tự bật trên thiết bị cảm ứng (cài đặt "Nút cảm ứng": Tự động / Luôn bật / Tắt). Cần điều khiển ảo góc trái (đi 8
  hướng), nút góc phải: **Dùng** (= Space/chuột trái), **Tương tác** (= E/chuột phải), **Túi**, **Chế tạo**; khi mở
  menu hiện nút **✕ Đóng** ở trên. Chạm vào bản đồ vẫn dùng đồ vào ô được chạm. Cầm dọc máy thì nhắc xoay ngang.
  Trang chặn phóng to/kéo trang khi chạm. Code: `src/ui/TouchControls.ts`, `src/state/touchInput.ts`.
- Đã thử bằng giả lập điện thoại của Chrome (844x390, chạm): đi bằng cần điều khiển, cuốc bằng nút Dùng, mở/đóng túi.
  Chưa thử trên điện thoại thật.


## Cập nhật: yếu tố kinh dị ban đêm
- Từ 20:00 tới 2:00, **mỗi giờ trong game tung xúc xắc một lần**: 40% lúc 20:00, +10% mỗi giờ (tối đa 90% lúc 1:00).
  Trúng thì hiện tượng xảy ra vào thời điểm ngẫu nhiên trong giờ đó; không lặp lại hiện tượng vừa gặp. Tất cả con số
  và danh sách hiện tượng nằm trong `src/data/horror.json` (logic `HorrorSystem`, có test).
- Hiện tượng (theo nơi/giờ): bóng trắng tóc dài đứng xa (lại gần thì biến mất, đôi khi hiện ngay sau lưng), ma trơi,
  bóng đen bám theo (quay lại nhìn thì biến mất) từ 22:00, ma da (bàn tay trồi lên ở ao gần đó), tiếng bước chân sau
  lưng, tiếng thì thầm + chữ mờ, đèn chập chờn, tiếng trẻ con khóc, tiếng gõ cửa (trong nhà), đồng hồ nhảy 03:33,
  và **jump scare** hiếm sau 0:00. Nền: viền tối khép dần, tiếng tim đập từ ~23:00 (nhanh dần), tiếng ù trầm sau nửa đêm.
- Âm thanh tổng hợp bằng Web Audio (`src/systems/HorrorAudio.ts`), hình tự vẽ (`scripts/art/horror.py`).
- Cài đặt **Kinh dị ban đêm: Bật / Nhẹ (không hù, tỷ lệ một nửa) / Tắt** — cho người yếu tim / nhạy cảm ánh sáng nhấp nháy.
- Mỗi người chơi trong phòng gặp hiện tượng riêng của mình (không đồng bộ — mỗi người sợ theo cách riêng).
- Chưa có trong hầm mỏ. Âm thanh chưa nghe thử bằng tai (chỉ kiểm tra chạy không lỗi).


## Cập nhật: chợ ngoài trời ở làng
- 3 sạp chợ trên quảng trường (dưới giếng làng), họp **6:00–14:00** mỗi ngày, đứng trước sạp bấm E/chuột phải:
  sạp cá cô Hoa (bán cá, **thu mua mọi loại cá**), sạp rau củ bà Sáu (bán rau củ, **thu mua toàn bộ nông sản**),
  sạp gạo chú Bảy (bán **gạo** + lúa giống, **thu mua lúa** giá cao). Bán ở chợ nhận tiền ngay; sạp đúng chuyên môn
  trả thêm 10% (sạp gạo +20% cho lúa) so với thùng bán qua đêm; mua ở chợ đắt hơn giá gốc (x1,5–1,6).
  Dữ liệu trong `shops.json` (`kind: "market"`, `buysCategories`, `buysItems`, `buyBonus`, `sellMarkup`); giá trong
  `ShopSystem` (có test). Món mới: **Gạo**.
- Giao diện chợ (`src/ui/MarketMenu.ts`): mái bạt sọc theo màu dù của sạp, biển bìa các-tông, người bán + bong bóng
  lời thoại (chào mời, cảm ơn, "thiếu tiền rồi con ơi"…), hàng bày trên mẹt tre với giá viết tay, thẻ Mua/Bán, "Bán hết".


## Cập nhật: bàn chế tác và ba lô
- Chế tạo **phải đứng ở bàn chế tác**: E/chuột phải vào bàn, hoặc C / nút "Chế tạo" khi đứng cạnh (đứng xa thì có nhắc).
  **Bàn chế tác thô sơ** có sẵn từ đầu ở sân trước nhà; làm được Ba lô vải, Rương, Bù nhìn, **Bàn thợ mộc**.
  Bàn thợ mộc (đặt xuống đất như đồ nội thất) làm được thêm Ba lô lớn, Vòi tưới, Chuồng gà. Mỗi công thức có
  `station` trong `recipes.json`; bàn tốt hơn làm được mọi món của bàn kém hơn (`CraftingSystem`, có test).
- Màn hình chế tạo mới: danh sách bên trái (món chưa làm được ở bàn này bị mờ), bên phải mô tả + từng nguyên liệu
  "có X / cần Y" kèm "thiếu Z" (đỏ) hoặc "✓ đủ" (xanh), nút ghi rõ lý do nếu chưa làm được.
- **Ba lô:** cầm ba lô và dùng (Space/chuột trái) để đeo → túi đồ 36 → 48 ô (ba lô vải) hoặc 60 ô (ba lô lớn).
  Chỉ đổi lên ba lô to hơn, không tháo ra (để không mất đồ). Ô chưa mở hiện ổ khoá trong túi đồ.
- Save cũ: ô đất/đồ đặt trùng chỗ bàn chế tác ở sân được tự trả lại như các lần đổi bản đồ trước.

### Cập nhật: ngủ tự do, thanh tinh thần, ma tấn công, toàn màn hình
- Khung hình lấp đầy màn hình: chiều rộng canvas theo tỉ lệ màn hình (800–1280 × 540), xoay máy/đổi cửa sổ thì UI dựng lại.
- Một ngày chạy 6:00 → 6:00 hôm sau. Không còn bị ngất lúc 2:00; thức tới 6:00 thì sang ngày mới ngay tại chỗ, không hồi gì.
- Ngủ: mỗi giờ ngủ hồi 12,5% năng lượng / máu / tinh thần (8 tiếng = đầy). Ngủ lúc nào cũng thức dậy 6:00.
- Đêm tối hơn (MAX_NIGHT_ALPHA 0.6 → 0.7).
- Ma (horror.json): 20:00–5:00, cứ 30 phút gieo một lần; 15% lúc 20:00, +6%/giờ; ×0.6 ở chỗ trống → ×1.6 giữa rừng cây; tối đa 85%.
- Tinh thần (SanitySystem): mỗi lần bị hù mất 12, 16, 20… (tối đa 30) trong đêm; mỗi 10% mất → −3% tốc chạy; 35% bị "mất kiểm soát" (60% hoặc 80% tốc độ trong 2 giây); ban ngày hồi 3%/giờ.
- Tinh thần < 15% (chế độ kinh dị "Bật", ban đêm): ma đuổi theo tấn công, mỗi đòn mất 5%, 10%, 15%… (tối đa 25%) máu và 5% năng lượng. Hết máu → ngất, tỉnh ở nhà với 30% máu/tinh thần, mất 10% tiền (tối đa 1000 ₫).

### 10 bản đồ miền Trung (xong 3 đợt, bản 224×140)
- 10 tỉnh theo tên cũ (trước sáp nhập 2025), nối từ Bắc vào Nam: Thanh Hóa → Nghệ An → Hà Tĩnh → Quảng Bình → Quảng Trị → Huế → Đà Nẵng → Quảng Nam (Hội An) → Quảng Ngãi → Bình Định.
- Nông trại và thị trấn hiện tại nằm ở **Quảng Bình**.
- Bước đầu chỉ làm phong cảnh đặc trưng từng vùng, chưa có cửa hàng hay đặc sản.
- Cách thêm một tỉnh: thêm mục vào `src/data/maps.json` (`province`, `forestTrees`, `orchardTree`), viết hàm dựng map trong `scripts/art/province_maps.py`, vẽ sprite riêng trong `scripts/art/provinces.py`, chạy `python3 scripts/gen_placeholders.py`. Mỗi map không có scene riêng sẽ tự chạy bằng `ProvinceScene`.
- [x] Đợt 1: khung chung + **Hà Tĩnh** (núi Hồng Lĩnh, chùa trên sườn núi, đồi chè Hương Sơn, hồ Kẻ Gỗ, vườn bưởi Phúc Trạch, biển Thiên Cầm) — đi lên từ mép bắc nông trại; **Quảng Trị** (sông Bến Hải, cầu Hiền Lương sơn hai màu, cột cờ, mỏm đá đỏ Cửa Tùng, rừng cao su) — đi xuống từ mép nam làng. Có ô cát, biển (câu cá được), hàng chè, ván cầu, cây phi lao, thuyền thúng.
- [x] Bản đồ thế giới: nhấn vào minimap để mở; ghép các vùng đúng chỗ đường nối (vị trí trong `src/data/world.json`), chấm đỏ "Bạn ở đây" (trong nhà/hầm mỏ thì hiện ở cửa vào); phóng to/thu nhỏ bằng lăn chuột, nút +/−, chụm hai ngón; kéo để di chuyển; ⌖ về chỗ mình; Esc/✕ để đóng (đồng hồ tạm dừng). Thêm tỉnh mới nhớ thêm vị trí vào `world.json` (có test kiểm tra đường nối khớp).
- [x] Đợt 2 (nối tiếp từ mép nam Quảng Trị): **Huế** (kinh thành tường gạch, Ngọ Môn, điện Thái Hòa, sông Hương, cầu Trường Tiền, thuyền rồng, tháp Phước Duyên chùa Thiên Mụ, hồ sen, đồi thông, biển Thuận An); **Đà Nẵng** (đèo Hải Vân, sông Hàn, cầu Rồng, phố nhà cao tầng với hàng phượng, tượng Phật Bà Sơn Trà, Ngũ Hành Sơn, biển Mỹ Khê); **Quảng Nam / Hội An** (phố cổ nhà vàng treo đèn lồng, Chùa Cầu, sông Thu Bồn với thuyền đèn, tháp Chăm Mỹ Sơn, rừng dừa Bảy Mẫu, đảo Cù Lao Chàm). Mép nam Hội An có biển chỉ đường đi Quảng Ngãi (chưa mở).
- [x] Đợt 3 + làm giàu map cũ (bản 224×140, sẽ được thay bằng bản 425×425 bên dưới): đủ 10 tỉnh — thêm **Phong Nha – Kẻ Bàng** (Quảng Bình, đi từ mép tây nông trại), **Thanh Hóa** (ruộng bậc thang Pù Luông, nhà sàn, Thành nhà Hồ, sông Mã, Sầm Sơn – Hòn Trống Mái), **Nghệ An** (rừng Pù Mát, sông Lam, làng Sen – Kim Liên, Cửa Lò), **Quảng Ngãi** (núi Thiên Ấn, sông Trà Khúc với guồng nước, ruộng muối Sa Huỳnh, đảo Lý Sơn với tỏi, miệng núi lửa, vòm đá), **Bình Định** (võ đường Tây Sơn, tháp Bánh Ít, Tháp Đôi, Ghềnh Ráng, dừa Tam Quan). Quảng Trị có Thành cổ + đài tưởng niệm, Huế có lăng vua, Đà Nẵng có Cầu Vàng Bà Nà.
- [x] **Đồng lúa làng** gặt được (phím E hoặc liềm): mỗi ô cho lúa theo tỉ lệ trong `src/data/wildFields.json`, gặt xong còn gốc rạ, **đầu mùa sau chín lại**; chơi chung thì mọi người thấy như nhau.

### Thế giới lớn 425×425 kiểu Don't Starve (đang làm — xong giai đoạn 1, 2 và 3)
- Người chơi đổi ý: **chỉ 2 map tỉnh — Quảng Bình và Huế**, mỗi map **425×425 ô** (các tỉnh khác bỏ khỏi game; hình vẽ vẫn giữ trong `scripts/art`).
- Mỗi map có nhiều **vùng địa hình hình dạng tự nhiên** (không vuông vức), thảm thực vật khác nhau: đồng cỏ, rừng rậm, rừng thông, núi đá, đầm lầy/đồng sen, đồng lúa, bãi biển, sông ngòi… theo đặc trưng tỉnh; đường mòn nối các vùng; địa danh đặt trong vùng hợp với nó.
- Mỗi map có **một khu làng NPC** tập trung nhiều nhà.
- **Bỏ nông trại + nhà riêng ban đầu**: lúc bắt đầu, người chơi **chọn vị trí** trên bản đồ; được phát **một chiếc chiếu** để ngủ đêm (thay cho giường).
- Chia giai đoạn (mỗi giai đoạn một cuộc trò chuyện mới):
  1. [x] Bộ sinh địa hình theo vùng `scripts/art/biome.py` (khoảng 64 vùng bờ cong tự nhiên, mỗi vùng một kiểu: núi đá vôi, núi, rừng, rừng thông, tre, đầm sen, rừng ngập mặn, đồi cát, cỏ khô, đồng cỏ hoa, vườn, đồng lúa, làng NPC, xóm nhỏ; đường mòn nối các vùng). Map trong `scripts/art/world_maps.py`: **Quảng Bình** (Phong Nha – Kẻ Bàng, Đèo Ngang, sông Son–Gianh, sông Nhật Lệ, đồi cát Quang Phú, làng NPC Đồng Hới, làng chài Bảo Ninh) — đi từ mép bắc nông trại; **Huế** (kinh thành có hào, Ngọ Môn, điện Thái Hòa, sông Hương, cầu Trường Tiền, thuyền rồng, Thiên Mụ, lăng vua trong đồi thông, Bạch Mã, phá Tam Giang, rừng đước Rú Chá, cửa Thuận An, làng NPC Gia Hội) — đi từ mép nam làng. Hiệu năng: cây/nhà chỉ tạo quanh camera (`src/scenes/chunkedImages.ts`), map tỉnh chỉ tải khi bước vào và bỏ map kia khỏi bộ nhớ, bỏ lớp "above" ở map tỉnh. Đo trên trình duyệt: ~60 khung hình/giây, bộ nhớ ~98 MB.
  1b. [x] **Bố cục theo 2 ảnh tham khảo của người chơi** (`~/Downloads/2aOboRDG…jpg`): Quảng Bình — Ba Đồn + chợ trên sông Gianh, Phong Nha – Kẻ Bàng + Sơn Đoòng + sông Son, Đồng Hới (phố NPC lớn, Quảng Bình Quan, chợ), cầu dây văng Nhật Lệ sang Bảo Ninh, Quảng Ninh (đồng lúa, đồi cát, đầm cá, trâu), cầu Quán Hàu trên sông Long Đại, Lệ Thủy (đồng lúa, nhà lưu niệm Võ Nguyên Giáp, đua thuyền trên sông Kiến Giang), suối nước nóng Bang, Trường Sơn phía tây. Huế — Đại Nội, Thiên Mụ, sông Hương, Phú Xuân (phố NPC lớn), cầu Trường Tiền, chợ Đông Ba, núi Ngự Bình, lăng vua trong đồi thông, làng nón lá, đồng lúa, Trường Sơn, phá Tam Giang, rừng đước Rú Chá, cửa Thuận An, đồi cát.
  1d. [x] **Bố cục Quảng Bình theo 3 ảnh cận cảnh + bản đồ thật** (Đồng Hới, Phong Nha – Kẻ Bàng, Quán Hàu; `scripts/art/map_quang_binh.py`). Đã so toạ độ thật: Đồng Hới nằm **bờ tây** sông Nhật Lệ, **phía nam** cửa biển (sông chảy lên phía bắc dọc phía đông phố, Bảo Ninh là dải cát giữa sông và biển); Quảng Bình Quan + thành cổ (nay là công viên), chợ Đồng Hới sát sông, ga Đồng Hới phía tây, cầu Nhật Lệ, cầu dây văng Nhật Lệ 2 phía nam, Cầu Dài, cồn cát Quang Phú phía bắc cửa sông, làng chài + bãi tắm Bảo Ninh. Phong Nha: sông Son chảy ra từ động Phong Nha về phía đông nhập sông Gianh, trung tâm du lịch + bến thuyền + nhà sàn ở bờ nam phía hạ lưu, động Thiên Đường phía tây nam (có cầu thang gỗ), Sơn Đoòng xa hơn về phía nam, chòi ngắm cảnh, đường đất về Đồng Hới và lối mòn về Ba Đồn. Quán Hàu: nơi sông Long Đại và Kiến Giang gặp nhau thành sông Nhật Lệ — cầu Quán Hàu (QL1), chợ, UBND, bưu điện, hợp tác xã, làng rượu Võ Xá (chum rượu), đài tưởng niệm bến phà Long Đại, Lũy Đào Duy Từ chạy về núi Thần Đinh (có chùa), chùa Ông, thác Tam Lu ở Trường Sơn, ao cá, đường đi Hải Ninh. Ba Đồn dời xuống bờ bắc sông Gianh gần cửa biển (đúng thực tế), QL1 chạy bắc–nam qua cầu Gianh, Đồng Hới, Quán Hàu, Lệ Thủy. Bản đồ chưa đúng tỉ lệ (phố được phóng to để chơi được) nhưng đúng hướng và đúng bờ sông.
  1c. **Nâng cấp đồ họa** theo ảnh mẫu `~/Downloads/2aOboRDG7zv97GrZ4EZD5FElkQ6DxrJCZbnzlrLU.jpg` (cận cảnh chợ Ba Đồn: phố đá cuội, kênh có bờ kè đá, nhà phố mái ngói, chợ ô dù, UBND, bưu điện, trường học, chùa, công viên, nhà vườn, bến phà, cầu, trâu cày, dừa). Giữ góc nhìn từ trên xuống; chỉ học màu sắc/độ chi tiết, tự vẽ bằng code, không chép hình.
     - [x] Bước 1: bảng màu tươi sáng (cỏ, lá, nước, đất) + đường lát đá cuội.
     - [x] Bước 2: nước sâu (giữa sông/hồ rộng, màu đậm hơn), vùng nước nông sáng màu ven bờ, sóng nhỏ trên sông; biển có sóng bạc đầu và dải biển sâu ngoài khơi; **bờ kè đá** cho sông chảy qua phố (Nhật Lệ ở Đồng Hới); cây dừa lá rủ mới, cây tán tròn mới (một loại có quả); bụi cây tròn có hoa; **luống hoa** (đi xuyên qua được). Code: `scripts/art/water_tiles.py`.
     - [x] Bước 3: **nét vẽ mới cho mọi hình** (theo yêu cầu người chơi, học nét của ảnh mẫu): viền 1 điểm ảnh nâu rất đậm quanh mọi vật + đường viền bên trong nơi hai mảng màu khác hẳn nhau (`outline()` trong `scripts/art/common.py`). Công trình phố (`scripts/art/town_buildings.py`, `town_props.py`): 6 kiểu nhà phố 2 tầng mái ngói (nhiều màu tường, ban công chậu hoa, cửa hàng tầng trệt, biển hiệu), UBND (cờ, sao, cột trắng), bưu điện, trường học, cổng tam quan chùa, chợ ô dù lá (trái cây, rau, cá, hoa), bến phà mái lá, ghế đá, đèn đường. Đã đặt vào: Đồng Hới (dãy nhà phố hai bên đường cầu Nhật Lệ và Nhật Lệ 2, UBND, bưu điện, trường, công viên thành cổ có ghế đá + đèn), Ba Đồn (phố, chợ, UBND, trường, bưu điện, bờ kè sông Gianh, bến phà), Quán Hàu (UBND huyện, bưu điện, cổng chùa Ông, bến phà Long Đại), Phú Xuân (Huế). Ảnh: `docs/previews/cong_trinh_pho.png`.
     - [x] Bước 4: người và vật (xong): dân làng đội nón lá (6 kiểu, áo bà ba) đi lại trên đường các phố/danh lam từ 5h đến
       21h, một số đạp xe đạp cũ; trâu kéo cày, người cày đi sau trên các thửa ruộng (6h–17h); thuyền nan trôi trên sông.
       Chỉ quanh camera, không vật lý, không lưu (`scenes/ambientLife.ts`, `ambientFields.ts`, `scripts/art/folk.py`).
- **Khu đặc biệt (địa danh)** (ý của người chơi, làm cùng giai đoạn 2): các địa danh là khu có **địa hình dựng sẵn** — không được xây thêm công trình; ruộng, ao cá, địa hình luôn có sẵn; người chơi được **gieo hạt** trên ruộng có sẵn, **thả cá** vào ao có sẵn, hoặc **gặt/thu tài nguyên**; **đầu mỗi mùa tài nguyên tự mọc lại**; ai gieo/thả thì người đó thu được phần của mình. Ranh giới các khu đã đánh dấu sẵn trong map Quảng Bình (đối tượng `zone`, thuộc tính `zoneName`, `kind: "landmark"`): Ba Đồn, Phong Nha – Kẻ Bàng, Đồng Hới, Quán Hàu, núi Thần Đinh, thác Tam Lu, Lệ Thủy, suối Bang. Game chưa đọc các vùng này. Đã chốt: đầu mùa, cây người chơi gieo mà chưa gặt **bị thay** bằng tài nguyên mọc lại; cá thả vào ao **phải chờ vài ngày cho lớn** mới câu được.
- **Khu an toàn / khu tự do** (ý của người chơi): các địa danh và khu phố (như chợ Ba Đồn, Đồng Hới, Phú Xuân…) là **khu an toàn** cho NPC và người chơi (ví dụ: không có ma); bên ngoài là **khu tự do** của người chơi (tự do khai hoang, trồng trọt, dựng nhà). Làm cùng giai đoạn 2.
  2a. [x] **Bỏ Nông trại / Nhà / Làng** (xong): bắt đầu ở công viên Đồng Hới. Ở Đồng Hới có cửa hàng hạt giống, tạp hoá
      cô Hạnh, tiệm xe, 3 sạp chợ có người bán, bảng nhiệm vụ, nhà nghỉ (ngủ được, tạm thời tới khi có chiếu), dân làng theo
      lịch; **hợp tác xã** phía tây Đồng Hới: nhà kho (gọi xe về, kho lớn), 4 chỗ đậu xe, thùng bán hàng, bãi cỏ thả vật nuôi
      mua về; **lối vào hầm mỏ ở động Sơn Đoòng** (ra khỏi hầm là về đó). **Cuốc đất / trồng trọt / đặt rương, bù nhìn,
      vòi tưới, chuồng gà, bàn thợ mộc được ở mọi nơi** trên cả 2 bản đồ (cỏ, cỏ khô, đất trống), **trừ khu an toàn**.
      **Khu an toàn** = các vùng "zone" (phố, địa danh): không có ma, hổ không vào, không cuốc đất/xây dựng. Ngủ xong thức
      dậy tại chỗ; ngất vì ma thì tỉnh lại giữa phố. Quảng Bình nối thẳng với Huế (mép nam Quảng Bình ↔ mép bắc Huế).
      Bản lưu cũ: về Quảng Bình, cây trên nông trại cũ mất, đồ đã đặt ở nông trại cũ (và đồ trong rương) chuyển vào nhà kho
      hợp tác xã, xe về chỗ đậu, vật nuôi về bãi cỏ. Code: `scripts/art/map_services.py`, `src/scenes/FieldScene.ts`,
      `VillageScene.ts`, `src/state/worldMigration.ts`. Ảnh: `docs/previews/gd2_dong_hoi.png`, `gd2_hop_tac_xa.png`.
  2b. [x] **Khu địa danh đặc biệt** (xong): ruộng lúa và ao cá dựng sẵn trong các zone (Đồng Hới, Ba Đồn, Phong Nha, Quán Hàu
      12 ao, Lệ Thủy; Huế thêm zone Đại Nội (hồ sen), chợ Đông Ba, Phú Xuân, Thiên Mụ, Ngự Bình). Gặt lúa xong gieo hạt thẳng
      lên gốc rạ (không cần cuốc); **cá giống** (sạp cá) thả xuống ao, 3 ngày sau tương tác cạnh ao để vớt; ai gieo/thả người
      đó thu (khi chơi chung); đầu mùa lúa mọc lại thay cây chưa gặt, ao làm lại từ đầu (`FishPondSystem`, `landmark_fields.py`).
      Thêm **máy tưới nước** ở tiệm xe (bật chế độ tưới: tưới ô đất dưới xe), chỗ đậu thứ 5 ở hợp tác xã.
  (Ghi chú cũ) 2. Bỏ Farm/House/Town: khu làng NPC trong map Quảng Bình nhận cửa hàng, chợ, bảng nhiệm vụ, lịch NPC; trồng trọt được ở mọi map (cuốc đất bất kỳ đâu); thùng bán hàng, bàn chế tác, nhà kho xe, chuồng gà, lối vào hầm mỏ chuyển vào thế giới mới.
  3. [x] Màn chọn vị trí bắt đầu + vật phẩm **chiếu** (xong): chơi mới (và tạo phòng mới) chỉ chọn **tỉnh** (Quảng Bình
      hoặc Huế); chỗ xuất phát là ngẫu nhiên một trong các điểm ngoài đồng, luôn **ngoài khu an toàn** (`startPoints.json`,
      spawn `start_qb_*` / `start_hue_*`); người vào phòng xuất hiện ở nơi chủ phòng bắt đầu. Mỗi khu an toàn (danh lam,
      phố NPC) được **dải rừng rậm** dày 3 ô bao quanh, chừa lối ở đường đi, sông và cổng giữa mỗi cạnh (`zone_belts`). Có sẵn 1 **chiếu**: cầm bấm dùng để trải (được trải cả trong khu an toàn), đứng
      cạnh bấm E để ngủ, bổ cuốc/rìu/cuốc chim lên chiếu để cuộn lại; chiếu của ai người nấy cuộn. Bản lưu lên phiên bản 12.
  3b. [x] **Không khí Việt Nam thời xưa**: mọi nhà thường (trừ danh lam) vẽ lại kiểu xưa — nhà ngói ba gian (vôi ố, ngói
      rêu, gạch trần), nhà tranh vách đất, phố cổ một tầng treo đèn lồng, đình làng (thay UBND), quán nước (thay bưu điện),
      trường làng lợp tranh, cột đèn dầu (`old_village.py`). **Đèn dầu** sáng ở cửa sổ/cửa từ 18h, tắt lúc 21h
      (`houseLights.json`, `ui/NightLights.ts`, vẽ trên lớp màn đêm).
  3c. [x] **Thanh đói** (kiểu Don't Starve): bụng 150, mỗi ngày game hụt 75 (cả lúc ngủ); ăn để no lại (cơm nắm, bánh mì,
      trứng, và ăn sống được nông sản như củ cải, khoai, súp lơ, đậu, dâu); đói về 0 thì mất 20 máu/giờ game. Mỗi thanh có chữ
      cái ở đầu: N năng lượng, H máu, T tinh thần, Đ đói (`HungerSystem`, `hunger.json`, `state/hungerClock.ts`).
  3d. Nhà và dân làng (yêu cầu người chơi 2026-11-18):
      - [x] A. **Khu nhà tường rơm**: mỗi nhà làng có khu đất 11x10 bọc tường rơm (cổng trước), vườn chuối sau, cây to,
        đống rơm, sân đất (`scripts/art/homesteads.py`); phố chật thì nhà không có tường. Mỗi khu là khu an toàn; người chơi
        mới được cấp một **nhà tranh trống** trong làng của tỉnh đã chọn (bắt đầu ở sân nhà), trong tường rơm nhà mình được
        cuốc/xây tuỳ ý (`HomeSystem`, `scenes/homesteads.ts`, `gameState.homes` dùng chung khi chơi nhiều người).
      - [x] **Bố cục mới**: mỗi tỉnh chỉ 2 làng (Quảng Bình: Võ Ninh, Quảng Hòa; Huế: Kim Long, Vỹ Dạ), mỗi làng 10 khu nhà
        trên lưới ngõ, có ruộng lúa riêng sát làng, xa danh lam và tách khỏi rừng; không còn nhà rải rác ngoài đồng (nhà phố
        chỉ trong các khu phố). Rừng rậm chỉ ở rìa bản đồ, rừng giữa bản đồ thưa (`scripts/art/villages.py`).
      - [x] B. **Dân trong mỗi nhà** (nhà phố: 1 người bán hàng; nhà làng: 1 người, hoặc vợ chồng + con đi học): 5h30 ra
        đồng, cuốc từng đợt 3 tiếng, nghỉ ngồi 30', 15h về nhà, quanh sân tới 18h rồi vào nhà; con 6h30 đi trường làng, 11h
        về. Mỗi nhà có mảnh ruộng riêng, tìm đường thật (`gridPath`, `scenes/villagers.ts`). *(Đã thay bằng
        "Hệ thống NPC gia đình nông trại" ở cuối file.)*
      - [x] C. **Cửa nhà** (đứng trước cửa bấm E): nhà mình → Đi ngủ / làm lại nhà (nhà tranh → nhà tranh vách đất 1.500 ₫
        → nhà ngói ba gian 4.000 ₫, `homes.json`) / Đóng; nhà trống → chuyển về ở (nhà cũ để trống cho người khác). Bảng chọn
        dùng chung `ui/ChoiceMenu.ts`; nhà đã làm lại lưu trong `gameState.homeHouses` (chung khi chơi nhiều người).
  3e. [x] **Làng quê nghèo thời xưa** (yêu cầu 2026-11-18): nhà trong làng đặt rải rác hai bên một con ngõ cong, lối mòn
      ra từng sân, không tường rơm (góc vườn có bụi tre / cây chuối), mỗi làng có trường làng. Xoá mọi nhà ngoài làng (dãy
      phố, nhà sàn, bưu điện/quán nước, trường trong phố, dù bãi biển), chỉ còn 4 nhà tranh lẻ ngoài hoang mỗi bản đồ. Ngoài
      làng không có đường (chỉ giữ cầu và sân đá cổ trong danh lam). Số người theo số nhà: bỏ người đi dạo và đội trâu cày
      ngẫu nhiên. Không có tiệm ăn: bỏ tạp hoá, sạp chợ, nhà nghỉ — thay bằng **gánh hàng rong** (cơm nắm/bánh/đồ lặt vặt,
      cá, rau củ) đi quanh làng 6h–17h, bấm E để mua bán (`scenes/hawkers.ts`, `hawkers.json`). Xe cộ không cấp sẵn.
  3f. [x] **Làng và đồng áng khép kín** (yêu cầu 2026-11-18): bản đồ cao thêm 50% (425x640), đồng bằng phía nam có 1 làng
      mỗi tỉnh. Mỗi nhà một khu đất 19x18 (nền đất màu đường, nhiều tre/chuối/cây ăn quả quanh, bàn trà trong sân, ngẫu nhiên
      có ao cá hoặc chuồng gà; nhà có/không trâu bò). Cánh đồng: mỗi nhà một thửa 32x64 (nhà 1 người nhỏ hơn) hai bên đường
      chính rộng 3 ô, kênh nhỏ dọc đường, cầu ván vào từng thửa, lối 1 ô viền cỏ giữa các thửa. Vòng ruộng (NpcFarmSystem — nay đã thay bằng `systems/npc/`, xem cuối file):
      cuốc → gieo → tưới mỗi ngày (bón phân 1 lần) → lớn (chỉ ngày được tưới) → gặt → bó lúa trên bờ → gánh từng bó về nhà
      → cuốc lại; làm theo công (người-phút/ô), chạy cả khi không ai đứng xem. Lịch người lớn (adultDoing): 5h30 cho gà ăn,
      ra ruộng; làm từng đợt 3 tiếng, nghỉ 30' ngồi bên đường; xong việc: nhà có trâu bò thì một người chăn, người kia đi
      chợ rồi về; không có thì nghỉ bên đường rồi về; về nhà uống trà ở bàn sân tới 18h. Người chơi cuốc/tưới có hiệu ứng
      giơ cuốc bổ xuống, nghiêng bình tưới.
  4. [~] Bản đồ thế giới, minimap, chơi nhiều người, kiểm tra trên điện thoại:
      - [x] Điện thoại: bỏ cảnh báo xoay ngang, **chơi được cả màn hình dọc** (khung 720 x cao theo máy); khung game vừa phần
        thật sự nhìn thấy (visualViewport, vùng tai thỏ), chạm lần đầu xin toàn màn hình (Android ẩn thanh trình duyệt).
      - [x] Bản đồ thế giới hiện tên các danh lam / khu phố khi phóng to.
      - [x] Thử chơi nhiều người tự động (2 trình duyệt trên cùng máy, `scripts/dev/two-players.mjs`): khách vào phòng,
        được cấp nhà riêng, danh sách nhà / ô đất cuốc / ruộng dân làng đồng bộ đúng giữa hai bên.
      - [ ] Thử qua mạng thật giữa 2 máy khác nhau, và trên điện thoại thật (iPhone Safari, Android Chrome) — cần máy của người chơi.
      - [x] Hình hầm mỏ HD (vách đá xếp lớp, sỏi, quặng lấp lánh, thang gỗ) — `make_mine_tileset_hd` trong `scripts/art/mine.py`.

### Nghề Thầy pháp — phần A và B xong (2026-11-18); TẠM GÁC theo người chơi, nhắc lại khi làm nghề Thầy thuốc
- [x] **Bùa khai đạo** rơi ngẫu nhiên ngoài hoang (35%/ngày/bản đồ nếu chưa có); dùng → thành Thầy pháp (`professionActions.ts`).
- [x] **Linh lực**: khởi đầu 5, +1/ngày (khi thức dậy), tối đa 100; thanh cam "L" + hình đại diện ☯ trên các thanh (`ui/ProfessionHud.ts`).
- [x] **Bảng Thầy pháp** (bấm hình đại diện): 4 thanh chỉ số, tổng linh lực, 10 ô bị động mốc 10…100 (khoá), phép đã học, thanh phép kéo thả đổi thứ tự (`ui/ProfessionMenu.ts`); ngoài bảng là cột phép bên phải màn hình, phím Q dùng ô đầu.
- [x] **Khai nhãn** (0,4 linh lực, 60 giây): khói âm khí hiện ở chỗ nhiều cây quanh người chơi (`scenes/khaiNhan.ts`).
- [x] **Sách cổ**: vùng 40x40 ô, mỗi cây +0,5%/ngày (tối đa 50%, ≤2 sách mới/ngày, ≤5 sách/bản đồ); ma đánh rơi khi đòn đầu trúng, tỉ lệ = sát thương/10 (`scenes/groundItems.ts`, `professions.json`).
- [x] Nhược điểm: mất tinh thần ×1,5 khi bị doạ; ban đêm ma tấn công ngay không cần tinh thần thấp.
- [x] Phần B: **truyền phép** khi chơi chung — đứng cạnh người khác (≤3 ô), mở bảng Thầy pháp, bấm "Truyền cho …"; người nhận phải là Thầy pháp mới học được (tin nhắn `teach` qua máy chủ phòng). Đã thử bằng `scripts/dev/two-players-teach.mjs`.
- [ ] Nội dung 10 kỹ năng bị động (người chơi sẽ nghĩ sau); thêm phép chủ động mới (chỉ cần thêm vào `professions.json` + hiệu ứng).

### (Bản kế hoạch gốc) nghề Thầy pháp
Ý tưởng của người chơi (tóm tắt):
- Hệ thống chức nghiệp; vật phẩm mở khóa nghề có thể xuất hiện ở bất kỳ đâu trên bản đồ (theo tỉ lệ).
- Nhấn vào minimap → mở bản đồ cả thế giới, phóng to / thu nhỏ được.
- Mở nghề → avatar nhỏ phía trên các thanh trạng thái + thanh **linh lực** màu cam.
- Nhấn avatar → bảng thông tin: chỉ số 3 thanh, tổng linh lực, cây kỹ năng bị động, danh sách kỹ năng chủ động đã học, hàng ô ngang để xếp thứ tự; ra ngoài hiện thành cột dọc bên phải màn hình; kéo thả để đổi chỗ.
- Học kỹ năng chủ động chỉ qua 3 đường: (1) sách cổ ở rừng sâu (0,5% mỗi cây trong phạm vi 20 ô); (2) người cùng nghề truyền lại (multiplayer); (3) ma rơi ra, tỉ lệ = sát thương đòn đầu / 10 (đòn 5% máu → 0,5%).
- Linh lực khởi đầu 5, mỗi ngày +1. Kỹ năng bị động mở ở mốc 10, 20 … 100 linh lực.
- Thầy pháp nhìn thấy ma nên dễ mất tinh thần hơn; ban đêm ma xuất hiện là tấn công ngay, không cần chờ tinh thần thấp.
- Kỹ năng chủ động đầu tiên **Khai nhãn**: hiện khói bụi ở các vùng ma hay xuất hiện (càng dày tỉ lệ càng cao), tốn 0,4 linh lực mỗi lần.
Đã chốt với người chơi:
1. Chỉ có **một** tài nguyên, gọi chung là **linh lực** (thanh màu cam): khởi đầu 5, mỗi ngày +1, dùng kỹ năng thì trừ (Khai nhãn tốn 0,4). Kỹ năng bị động chỉ có hiệu lực khi linh lực **hiện tại** đang ở mốc đó trở lên; từng đạt mốc nhưng sau bị tụt xuống dưới thì bị khoá lại.
2. 10 ô kỹ năng bị động ở các mốc 10…100: tạm thời **khoá hết** (hiện ổ khoá), nội dung sẽ nghĩ sau.
3. Sách cổ: chia bản đồ thành từng khu vực bán kính 20 ô; mỗi cây trong khu vực cộng +0,5% khả năng xuất hiện (giả định mỗi ngày gieo một lần); sách xuất hiện ở ô bất kỳ trong khu vực đó.
4. Thứ tự làm: **bản đồ miền Trung trước**, nghề Thầy pháp sau.


## Cập nhật: câu cá mới, thuyền chèo, hổ, nuôi gia súc, cây roi
- **Câu cá** (`FishingSystem`, `FishSpawnSystem`, `ui/FishingSession.ts`, có test): mua **cần câu** ở quán tạp hoá; cần phải **gắn mồi** mới câu được (cầm giun → bấm dùng để gắn, tối đa 20 mồi). **Giun**: cuốc đất có 12% đào được (cũng bán ở quán tạp hoá). Quăng cần → chờ phao → khi hiện "!" phải **giật cần kịp lúc** (cá khó thì thời gian ngắn hơn; trễ là mất mồi) → mini-game kéo cá: thanh xanh có trọng lực và nảy ở đáy, mỗi loại cá bơi một kiểu (êm, lao vụt, chìm đáy, nổi mặt, hỗn hợp), cá khó bơi nhanh và đổi hướng liên tục; thanh to dần theo cấp kỹ năng câu cá. Thỉnh thoảng có **rương báu** trên đường kéo; câu **hoàn hảo** (không để tụt tiến độ) được gấp đôi kinh nghiệm. Cá nước ngọt và cá biển khác nhau; thêm cá diếc, cá lóc, cá trê, cá bống, cá cơm, cá thu, cá mú.
- **Thuyền chèo** (`BoatSystem`, `scenes/boats.ts`): thuyền buộc sẵn ở bến sông (Phong Nha, Nhật Lệ, Ba Đồn, bến phà Long Đại, Kiến Giang, Quán Hàu; Huế 2 chiếc trên sông Hương). E cạnh thuyền để lên, phím di chuyển để chèo (chỉ đi trên nước, chui được dưới cầu), E sát bờ để xuống; thuyền nằm lại chỗ bạn để.
- **Hổ** (`WildlifeSystem`, `scenes/tigers.ts`, tiếng gầm tổng hợp `WildAudio.ts`): 5 con mỗi map tỉnh, sống ở chỗ rừng rậm nhất, không vào khu địa danh (khu an toàn). Lại gần ~7 ô: hổ **gầm cảnh báo** 2,4 giây (rung màn hình); lùi ra xa thì nó tha; vẫn ở gần (~5 ô) thì nó lao tới vồ, mất **45% máu**, rồi lui về hang nghỉ. Đang ở trên thuyền hoặc trong khu an toàn thì hổ không tấn công.
- **Gia súc** (`LivestockSystem`, `scenes/livestockHerd.ts`): mua gà, heo, bê, nghé ở Cửa hàng Mùa Vụ; con mua về được thả ở bãi cỏ nông trại. Chúng tự đi lang thang, đứng trên cỏ là tự gặm (trâu bò gặm giỏi nhất), mỗi ngày lớn thêm nếu không đói. **Bấm vào con vật** để xem chỉ số đói và lớn. **Cây roi** (mua ở quán tạp hoá hoặc chế tạo: 5 gỗ + 15 sợi): cầm roi thì gia súc tránh xa, quất roi thì chúng chạy tán loạn — dùng để lùa.
- Xe máy giảm tốc 10% (+120% → +98%).
- Chưa làm: gia súc chưa đi qua cửa sang map khác, chưa có sản phẩm (trứng, sữa…), chưa đồng bộ khi chơi nhiều người (thuyền, hổ, gia súc chỉ ở máy mình).


## Đồ họa x2 (HD) — người chơi chọn hướng 1: giữ pixel art, tăng gấp đôi độ phân giải
Cách làm (`src/scenes/hd.ts`): hình HD vẽ gấp đôi (ô nền 32×32, cây 96×128…) rồi hiển thị ở ½ kích thước, nên ở mức
phóng to mặc định ×2 mỗi điểm ảnh của hình = 1 điểm trên màn hình (nét gấp đôi). Toạ độ thế giới vẫn 16 px/ô nên
vị trí, va chạm, logic không đổi. Bản đồ dùng bộ ô `tilesets/farm_tiles_hd.png` (lớp bản đồ thu nhỏ ½); hình nào có
`"hd": true` trong `pack.json` thì tự thu nhỏ ½. Ô/hình chưa vẽ lại thì tạm phóng to từ bản 16 px (trông như cũ) —
nâng cấp dần từng đợt. Lưu ý: ở mức phóng to ×1 hình HD bị thu nhỏ (mất nét), ×3 không chia hết; nên chơi ở ×2 hoặc ×4.
- [x] Đợt 1: engine HD; ô nền HD: cỏ (4 kiểu), đường đất + mép cỏ, nước + bờ (16 kiểu), nước sâu, cát, biển, biển sâu,
      sóng vỗ bờ, đường đá cuội, đất, bụi cây; cây HD: cây tán tròn (2), dừa, tre, cau, thông. Ảnh: `docs/previews/hd_*.png`, `cay_hd.png`.
- [x] Đợt 2: nhân vật HD 32×64 (người chơi + 4 dân làng: mắt có ánh sáng, lông mày, tóc sợi, nút áo, túi áo bà ba,
      nón lá có vành), con vật HD (gà, heo, bò, trâu, hổ), xe HD (xe máy, máy cày, máy gặt, xe bò: bánh có lốp, vành, nan).
      Ảnh: `docs/previews/hd_nhan_vat.png`, `hd_con_vat_xe.png`, `hd_trong_game.png`.
- [x] Đợt 3: nhà cửa, công trình phố, chợ (cả người bán), mọi địa danh ở HD — vẽ lại bằng `scripts/art/hd_canvas.py`
      (giữ nguyên bố cục, vẽ ở x2: viền mảnh một nửa, hình tròn mượt, mép sáng). Ảnh: `docs/previews/hd_dong_hoi_dot3.png`, `hd_lang_dot3.png`.
- [x] Đợt 4: mọi ô nền còn lại (đá, hàng rào, sàn, tường, ruộng, ô tỉnh…) vẽ lại ở x2; cây trồng, đồ nội thất,
      cây/đá/giếng/rơm, chuối, đước, đa, ma quỷ ở HD. Giờ **toàn bộ** sprite trong pack đều là HD.
      Ảnh: `docs/previews/hd_cay_trong_dot4.png`, `hd_noi_that_dot4.png`.


## Hệ thống NPC gia đình nông trại (theo spec `npc-farm-spec.md`, 2026-11-19)
Thay hẳn `NpcFarmSystem` + `VillagerSchedule` cũ. Logic thuần trong `src/systems/npc/` (có test), mọi con số trong
`src/data/npcFarm.json` (giờ giấc, bán kính, thời lượng, tỉ lệ, danh sách cây). Trạng thái lưu ở `gameState.npcFamilies`
(lưu game + đồng bộ khi chơi nhiều người: chủ phòng chạy mô phỏng, khách nhận lại).
- `config.ts` đọc file config; `families.ts` dựng gia đình từ bản đồ (băm theo mã nhà → luôn ra cùng một nhà);
  `field.ts` máy trạng thái **từng ô** ruộng; `schedule.ts` lịch theo giờ + việc vặt (dắt trâu, đi chợ);
  `sim.ts` chạy từng phút (dùng chung cho NPC trên màn hình, ngoài màn hình và chạy bù); `child.ts` hành vi đứa con.
- Phần vẽ: `scenes/npcWorld.ts` (chạy mô phỏng, vị trí nhà/ruộng/bãi cỏ/trường), `villageFields.ts` (vẽ từng ô, đống
  nông sản), `villagers.ts` + `villagerPaths.ts` + `villagerPlay.ts` + `villagerChores.ts` (người), `villageAnimals.ts` (gà, heo, trâu).

Tiêu chí hoàn thành:
- [x] 3 loại gia đình (1 người / vợ chồng / vợ chồng + con); gà, heo, trâu; vợ chăm gia súc; không đói/máu/tiền.
- [x] Lịch người lớn đúng bảng giờ (giờ là giờ XUẤT PHÁT); nghỉ trưa 11h30–13h ngồi bên ruộng; ăn tối, uống trà, đi ngủ.
- [x] Đi chợ: 1 người 3 ngày/lần rời ruộng 15h; vợ (nhà 2 người) mỗi ngày, (nhà 3 người) 2 ngày/lần, 16h; ở chợ 20 phút
      rồi về thẳng nhà; `marketCounter` lưu trong save.
- [x] Dắt trâu: vợ dắt ra 7h, dắt về 16h; ngày vợ đi chợ ai về nhà trước nhận việc (`buffaloReturnClaimedBy`, không áp
      luật trễ); cuối tuần con dắt thay mẹ, ở trong 10 m quanh trâu (đi theo / nằm trên lưng / ngủ; gặp trẻ khác thì đuổi bắt).
- [x] Con: thứ 2–6 đi học 6h30, tan 16h30; ở nhà chơi trong bán kính 15 m.
- [x] Trễ lịch tối đa 30 phút, quá thì bỏ việc, đi nhanh +50%. Nói chuyện (E cạnh dân làng): NPC đứng lại; còn 5 phút
      tới giờ kế tiếp thì nói 1 câu chào rồi đi nhanh +50%.
- [x] Ruộng từng ô: UNTILLED → TILLED → SEEDED/GROWING → MATURE → TILLED, chết thành DEAD nếu bỏ lỡ 1 ngày tưới; mưa =
      đã tưới; bón ngay ngày gieo rồi 7 ngày/lần; ưu tiên thu hoạch > tưới > bón > gieo > cuốc > nhổ cỏ; chồng nửa trái,
      vợ nửa phải, xong thì sang phụ; mỗi ô chỉ 1 người nhận (`reservedBy`).
- [x] Mỗi thửa 1 loại cây/vụ (nhà có 2–3 thửa, xem dưới), random từ 14 loại (không trùng vụ trước, theo seed lưu trong save); cứ 20% thửa thành 1 đống
      bên đường; thu xong thì mỗi người lớn vác 1 đống/chuyến về sân; mang hết thì nghỉ ở nhà, hôm sau vụ mới.
- [x] Đống trong sân tối đa 5, mỗi đống 3 ngày.
- [x] LOD: ngoài màn hình không vẽ, không tìm đường; tới gần thì đặt đúng chỗ. Ngủ/tua giờ/vào lại bản đồ: chạy bù
      (tối đa 30 ngày). Ruộng, nhà, gia súc của NPC là vùng khoá.

Những chỗ mình tự quyết (đều chỉnh được trong `npcFarm.json`):
- **1 ô ruộng NPC = 1 ô đất, mỗi nhát 2 phút game (≈1,4 giây: vung cuốc xuống, nghỉ ~1 giây)** cho cuốc, gieo,
  bón, thu hoạch; tưới 1 phút như spec (người chơi yêu cầu 2026-11-19, spec gốc: gieo/tưới/bón 1 phút). Thửa trên bản đồ ~1.300–2.000
  ô, làm từng nhát thì không kịp tưới, nên mỗi nhà chỉ canh tác **vài thửa nhỏ** sát đường quanh cầu ván, nối tiếp
  nhau từ đường vào, cách nhau 1 hàng bờ cỏ (người chơi yêu cầu 2026-11-19): nhà 3 người 3 thửa, nhà 1–2 người 2 thửa;
  mỗi thửa 16×5 ô (nhà 1 người 11×4) (`field.plotTilesByFamilyType`, `plotsByFamilyType`, `plotGapTiles`). Phần còn
  lại của thửa lớn để cỏ. **Mỗi thửa một loại cây, vụ riêng** (seed riêng mỗi thửa): thu xong thửa nào thì mang thửa đó
  về; mang về được ưu tiên sau thu hoạch và tưới các thửa khác (để cây không chết), trước bón/gieo/cuốc. Cả nhà chỉ ở
  nhà nghỉ khi mọi thửa đều vừa mang về xong trong ngày. Chồng nửa trái, vợ nửa phải của mỗi thửa. Save cũ có ruộng
  khác cỡ thì ruộng NPC được làm lại từ đầu.
- Người chơi: mỗi nhát dụng cụ cách nhau 0,8 giây (`TOOL_STROKE_MS` trong `config/constants.ts`).
- Đồng hồ NPC theo giờ thật: ngày mới lúc 0h (ngày của game vẫn đổi lúc 6h). Ngày 1 của game là Thứ 2.
- Bản đồ chỉ có "trâu" hoặc "bò": cả hai đều được dắt đi ăn cỏ như trâu (hình vẫn giữ là bò nếu bản đồ ghi bò).
  Heo được thêm ngẫu nhiên (`families.pigChance`); nhà 2–3 người không có con vật nào thì được thêm gà.
- Nhà ghi "3 người" trên bản đồ: ~35% là vợ chồng (loại 2), còn lại có con (loại 3) (`families.twoPersonShare`).
- Chợ nằm "xa xa" theo đường cái (đi 45 phút, rồi khuất khỏi màn hình); trường là trường làng trên bản đồ.
- Đi bộ 3 ô/phút game (≈ tốc độ người chơi); nhà ở xa ruộng nên tới nơi muộn hơn giờ xuất phát.
- Nhà lẻ ngoài hoang không có ruộng: giờ ra đồng thì làm vườn trong sân.
- Lúc chạy bù khi vắng mặt lâu, thời tiết của cả khoảng đó lấy theo thời tiết hiện tại (game không lưu lịch sử mưa).
- Cây trồng tạm dùng hình cây lúa nhuộm màu theo loại cây (màu trong config) — thay hình thật sau.

## Cập nhật: đồ khởi đầu và bình tưới có nước (yêu cầu 2026-11-19)
- [x] Game mới chỉ cho đúng 4 dụng cụ cơ bản: cuốc, rìu, cuốc chim, bình tưới (bỏ liềm, kiếm, chiếu ngủ, hạt giống;
      `STARTING_ITEMS` trong `state/GameState.ts`). Ngủ trong nhà mình (game bắt đầu ở nhà), hạt giống phải mua.
- [x] Bình tưới đầy tưới được 15 lần (`capacity` của `watering_can` trong `items.json`); số lần còn lại hiện ở góc ô
      bình tưới trên thanh công cụ, lưu trong save (`gameState.wateringCanWater`). Hết nước thì đứng sát ao/sông/kênh
      (ô nước cạnh chỗ đứng, hoặc nhắm vào ô nước) bấm bình để múc đầy lại (`systems/WateringCanSystem.ts`, có test).
      Xe chở nước vẫn tưới như cũ, không tốn nước bình.

## Cập nhật: thu nhỏ thửa ruộng trên bản đồ (yêu cầu 2026-11-19)
- [x] Thửa của mỗi nhà trên bản đồ giờ chỉ vừa đúng các mảnh NPC làm, sát kênh, giữa cột cũ. Mỗi thửa to thêm ~60%
      (người chơi yêu cầu): nhà 2–3 người 16×8 ô, nhà 1 người 12×6. Khung trên bản đồ: nhà 3 người 16×26 (3 thửa), nhà
      2 người 16×17 (2 thửa), nhà 1 người 12×13 (2 thửa). Giữa hai thửa: 1 ô đường đất (`plotGapTiles` = 1, vẽ sẵn
      trên bản đồ). Loại gia đình tính giống hệt trong game (băm mã nhà).
- Để NPC vẫn tưới kịp ruộng to hơn, tưới trở lại 1 phút/ô như spec gốc (cuốc, gieo, bón, thu hoạch vẫn 2 phút);
      đã chạy thử 40 ngày, nhà ở xa ruộng tới 90 phút đi bộ cũng không có ô nào chết. Lối đi giữa các thửa cắt ngắn bằng độ sâu mới (lối từ làng
      xuống đường cái giữ nguyên). Phần đất thửa cũ còn lại là cỏ trống, người chơi dùng được.
- [x] Bố cục gọn (người chơi yêu cầu): mỗi bên đường cái các thửa xếp sát nhau dựa vào kênh, giữa hai thửa và ở hai
      đầu là 1 ô đường đất; mỗi thửa có đường đất chạy dọc mép trên; đường giữa các thửa nhỏ chạy ngang nối vào hai
      đường bên — mọi đầu đường đều nối vào nhau, không còn dải đất thừa. Lối từ làng chạy xuống tới đường gặp đầu tiên
      (hoặc tới kênh, có cầu ván sang đường cái). Cầu ván dời vào giữa mỗi thửa.
- Sửa thẳng 2 file bản đồ bằng `scripts/art/shrink_paddies.py` (không tạo lại bản đồ, nhà cửa giữ nguyên);
  `scripts/art/maps.py` tự chạy bước này sau khi tạo bản đồ. Cỡ lấy từ `src/data/npcFarm.json`.

## Cập nhật: tự làm đường đất, cỏ mọc lại, lát đá (yêu cầu 2026-11-19)
- [x] Cuốc lên cỏ: mất cỏ, thành ô đường đất (tự nối liền với đường bên cạnh, cả đường có sẵn trên bản đồ).
      Cuốc thêm nhát nữa lên đường đất: thành đất tơi để gieo hạt. Đất trống (nền đất, không có cỏ) thì cuốc thẳng ra đất trồng.
- [x] Cỏ mọc lại: đường đất và đất trồng bỏ không (cuốc từ cỏ ra), sau 3 ngày có cỏ mờ mờ phủ lên, sau 5 ngày thành cỏ
      như cũ. Cuốc lên chỗ đang mờ cỏ thì dọn sạch (đường vẫn là đường, đếm lại từ đầu). Đang có cây thì không mọc cỏ.
      Đất trồng từ save cũ và ruộng dựng sẵn ở danh lam không mọc cỏ lại.
- [x] Lát đá: cầm Đá bấm lên đường đất → tốn 1 viên, thành ô lát đá, cỏ không mọc. Đập bằng cuốc chim → trả lại viên
      đá, ô về đường đất và cỏ bắt đầu mọc lại từ hôm đó.
- Logic thuần trong `systems/GroundSystem.ts` (có test), số ngày trong `src/data/ground.json`; vẽ ở `scenes/groundPaths.ts`;
  lưu ở `gameState.groundEdits` (lưu game + đồng bộ khi chơi nhiều người).

## Cập nhật: xe đạp ở sân nhà, sức lực theo quãng đường, thanh hồi phục (yêu cầu 2026-11-20)

Thông số nằm trong `src/data/stamina.json`; logic thuần ở `src/systems/StaminaSystem.ts`.

- [x] Mỗi người chơi có 1 xe đạp dựng ở sân nhà mình (+15% tốc độ), lên/xuống xe như các xe khác; không bị gọi về nhà kho.
- [x] Đi bộ trừ sức theo mét: đầy sức (270) đi được 7 km → 270/7000 ≈ 0,0386 sức/m. Xe đạp: 20 km → 0,0135 sức/m. Xe máy, máy cày, thuyền, ngồi ké: không trừ.
- [x] Sức > 0: mỗi giờ game hồi 1,5% (4,05 sức). Sức = 0: không hồi theo giờ.
- [x] Thanh hồi phục (nhỏ, ngắn, cùng màu, chữ "P"), dung lượng bằng thanh sức. Mỗi ngày +30% (81 điểm), ăn +50% năng lượng của món ăn. Game mới bắt đầu với 30%.
- [x] Sức = 0 và không làm gì tốn sức (đi lại, dùng công cụ) ≥ 30 giây thật → khi cử động lại, bơm n% thanh hồi phục (n = số giây nghỉ, tối đa 100) sang thanh sức, thưởng thêm 20%. Thanh hồi phục không đủ → chuyển phần còn lại, không thưởng. Không lấy quá chỗ trống của thanh sức. Nghỉ bị ngắt thì đếm lại từ 0.

## Cập nhật: tư thế ngồi riêng cho dân làng (yêu cầu 2026-11-20)

- [x] Ảnh ngồi trong `assets/postures/<npc>.png` → `scripts/art/import_postures.py` → `sprites/npcs/<npc>_sit.png` (key `<npc>_sit`).
- [x] Ghép theo ngoại hình: folk_0 (ông cụ), folk_1 (phụ nữ áo trắng), folk_2 (áo xanh đậm). folk_3, folk_4 chưa có ảnh nên vẫn ngồi kiểu cũ (cắt chân).
- [x] NPC ngồi (uống trà, ăn, ngồi hiên, nghỉ trưa bên ruộng) dùng ảnh ngồi; nói chuyện khi đang ngồi thì vẫn ngồi, quay mặt về người chơi.

## Cập nhật: giá nông sản Việt Nam năm 2000 — đợt 1: cây trồng (yêu cầu 2026-11-20)

Nguồn: `Bang_gia_nong_san_VN_2000.xlsx` (giá ước tính). Script `scripts/data/apply_vn2000_prices.py` ghi ra `crops.json`, `items.json`, `shops.json`; thông số cân nặng ở `src/data/produce.json`; logic ở `src/systems/ProduceSystem.ts`.

- [x] Tiền là đồng thật năm 2000: vốn đầu 100.000 đ; hạt, đồ ăn, cá, con giống, xe, nâng cấp nhà, tiền phạt, thưởng đều đổi theo. Save cũ: tiền ×40, thùng gửi bán làm trống.
- [x] 22 cây (16 mới) đủ 4 mùa; ngày chín = thời gian thật ÷ 7; mỗi gói hạt gieo 1 ô, giá ≈ 25% một vụ đạt cân tối đa.
- [x] Nông sản đếm theo đơn vị (bó, củ, trái…) và có kg; bán theo kg (thùng gửi bán: giá gốc; gánh rau: +10%).
- [x] Tỉ lệ đạt kg tối đa: gốc 10%, mỗi ngày tưới (hoặc mưa) +5% hoặc bón phân +10% (mỗi ngày chỉ 1 lần), gieo đúng mùa +50%. Trượt thì nặng 50–90% mức tối đa.
- [x] Phân bón (300 đ/nắm, 1 ô) bán ở cửa hàng hạt giống.
- [x] Trồng trái mùa: cây vẫn lớn, không chết, chỉ mất +50% (đổi bằng `offSeasonWithers` trong `produce.json`).
- [x] `Assets.md`: 16 dải cây trồng và 33 biểu tượng còn thiếu, có prompt.
- [ ] Đợt 2: chăn nuôi và thuỷ sản theo kg (cân nặng tối đa từng con, tỉ lệ đạt tối đa).

## Cập nhật: tuỳ chỉnh phím, nút cảm ứng và bố cục giao diện (yêu cầu 2026-11-20)

Cài đặt (Tab / ⚙) có thêm 2 nút. Lưu trong `settings.keys` và `settings.layout` của save.

- [x] **Phím điều khiển:** 24 việc (đi 4 hướng, dùng, tương tác, túi, chế tạo, bản đồ nhỏ, cài đặt, đóng bảng, phép đầu tiên, 12 ô công cụ), mỗi việc tối đa 2 phím; gán phím đã dùng thì phím đó tự gỡ khỏi việc cũ; Backspace xoá, Esc huỷ; nút "Khôi phục mặc định". Thanh công cụ và ô phép hiện đúng tên phím. Logic: `src/systems/KeyBindings.ts`.
- [x] **Chỉnh bố cục:** kéo khung để di chuyển, − / + đổi cỡ (60–180%), Ẩn/Hiện, "Mặc định". Áp dụng cho: đồng hồ & tiền, thanh chỉ số, thanh công cụ, bản đồ nhỏ, linh lực và cột phép (thầy pháp), cần điều khiển và 4 nút cảm ứng. Logic: `src/systems/UiLayout.ts`.

## Sửa lỗi: NPC nhảy cóc / biến mất trước mắt (báo 2026-11-20)

- [x] Gia đình nông dân (`villagers.ts`): đổi việc, đổi ô ruộng, hết đường đi… không còn đặt thẳng sang chỗ mới mà đi bộ tới (70 px/giây) rồi mới làm việc. Khoảng cách quá 24 ô (chỉ xảy ra ngoài màn hình) mới cho nhảy.
- [x] Người gánh hàng rong (`hawkers.ts`): chỉ xuất hiện ở điểm dừng ngoài khung hình, và chỉ biến mất khi đã ra khỏi khung hình (đang trong tầm nhìn lúc hết giờ thì đi tiếp cho tới khi khuất).

## Cập nhật: NPC là "người thật" — đi lại liên tục, kể cả khi không nhìn (yêu cầu 2026-11-20)

- [x] Mỗi người trong gia đình nông dân có thân thể riêng (`villagerAgents.ts`): vị trí, hướng, quãng đã đi. Thời gian biểu (`systems/npc`) chỉ nói cần ở đâu, làm gì; họ tự tìm đường quanh nhà, hàng rào (`findPath`) và đi tới với tốc độ đều (3 ô/phút game ≈ 69 px/giây, khớp với thời gian biểu), tới nơi mới làm việc.
- [x] Mọi gia đình trên bản đồ đang chơi đều đi lại mỗi khung hình, dù camera ở đâu; chỉ phần vẽ bỏ qua khi ở xa (không còn cảnh hiện ra / biến mất trước mắt).
- [x] Bước chân theo quãng đường đã đi (không trượt, không giật); làm cỏ đi lần lượt từng ô cạnh nhau; dừng lại khi đồng hồ game dừng (mở menu).
- [x] Kiểm tra: 22 NPC trong 25 giây, 0 lần nhảy chỗ.

- Tốc độ NPC = tốc độ đi bộ của người chơi (`PLAYER_SPEED` 72 px/s), không tăng tốc khi "trễ giờ"; nhịp bước chân khớp người chơi (8 khung/giây).

- Dân làng trồng trọt theo thứ tự thật: cuốc xong **toàn bộ thửa ruộng** rồi mới bắt đầu gieo hạt (`sowingOpen` trong `systems/npc/field.ts` đòi không còn ô UNTILLED).
