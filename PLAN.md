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

### 10 bản đồ miền Trung (đang làm — xong đợt 1/3)
- 10 tỉnh theo tên cũ (trước sáp nhập 2025), nối từ Bắc vào Nam: Thanh Hóa → Nghệ An → Hà Tĩnh → Quảng Bình → Quảng Trị → Huế → Đà Nẵng → Quảng Nam (Hội An) → Quảng Ngãi → Bình Định.
- Nông trại và thị trấn hiện tại nằm ở **Quảng Bình**.
- Bước đầu chỉ làm phong cảnh đặc trưng từng vùng, chưa có cửa hàng hay đặc sản.
- Cách thêm một tỉnh: thêm mục vào `src/data/maps.json` (`province`, `forestTrees`, `orchardTree`), viết hàm dựng map trong `scripts/art/province_maps.py`, vẽ sprite riêng trong `scripts/art/provinces.py`, chạy `python3 scripts/gen_placeholders.py`. Mỗi map không có scene riêng sẽ tự chạy bằng `ProvinceScene`.
- [x] Đợt 1: khung chung + **Hà Tĩnh** (núi Hồng Lĩnh, chùa trên sườn núi, đồi chè Hương Sơn, hồ Kẻ Gỗ, vườn bưởi Phúc Trạch, biển Thiên Cầm) — đi lên từ mép bắc nông trại; **Quảng Trị** (sông Bến Hải, cầu Hiền Lương sơn hai màu, cột cờ, mỏm đá đỏ Cửa Tùng, rừng cao su) — đi xuống từ mép nam làng. Có ô cát, biển (câu cá được), hàng chè, ván cầu, cây phi lao, thuyền thúng.
- [x] Bản đồ thế giới: nhấn vào minimap để mở; ghép các vùng đúng chỗ đường nối (vị trí trong `src/data/world.json`), chấm đỏ "Bạn ở đây" (trong nhà/hầm mỏ thì hiện ở cửa vào); phóng to/thu nhỏ bằng lăn chuột, nút +/−, chụm hai ngón; kéo để di chuyển; ⌖ về chỗ mình; Esc/✕ để đóng (đồng hồ tạm dừng). Thêm tỉnh mới nhớ thêm vị trí vào `world.json` (có test kiểm tra đường nối khớp).
- [ ] Đợt 2: Huế, Đà Nẵng, Quảng Nam (Hội An) — nối tiếp từ mép nam Quảng Trị (đang có biển chỉ đường).
- [ ] Đợt 3: Thanh Hóa, Nghệ An (nối từ mép bắc Hà Tĩnh), Quảng Ngãi, Bình Định.

### Việc chờ làm: nghề Thầy pháp (chưa bắt đầu — còn câu hỏi mở)
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
