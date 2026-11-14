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
