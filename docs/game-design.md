# Thiết kế chi tiết các hệ thống (Phase 3–15)

> Tài liệu này mô tả **cơ chế gameplay** cho các phase còn lại, viết từ hiểu biết
> chung về thể loại game mô phỏng nông trại — không sao chép từ bất kỳ mã nguồn
> hay tài liệu có bản quyền nào. Mọi con số (giá, thời gian, chỉ số) là giá trị
> khởi điểm do dự án tự đặt ra, chỉnh được thoải mái để cân bằng game sau này.
> Tên vật phẩm, cây trồng, NPC... dùng tên gốc tự nghĩ, tránh trùng tên riêng
> của bất kỳ game cụ thể nào.

## Phase 3 — Túi đồ, công cụ, năng lượng

### Vật phẩm (`data/items.json`)
```ts
interface ItemDef {
  id: string;            // "parsnip_seeds"
  name: string;          // tên hiển thị tiếng Việt
  category: 'seed' | 'crop' | 'tool' | 'material' | 'food' | 'fish' | 'furniture';
  stackable: boolean;    // công cụ không stack, hạt giống/nông sản stack tới 999
  sellPrice?: number;    // giá bán cho thùng/cửa hàng; để trống = không bán được
  description: string;
}
```

### Túi đồ
- 12 ô thanh nhanh (hotbar) + 24 ô túi đồ chính = 36 ô, mỗi ô một `{itemId, quantity}` hoặc rỗng.
- `InventorySystem` (logic thuần, test được):
  - `addItem(state, itemId, qty)`: dồn vào ô đã có cùng item trước, còn dư thì tìm ô trống; trả về số lượng **không nhét vừa** (để biết túi đầy).
  - `removeItem(state, itemId, qty)`: trừ từ các ô có item đó; lỗi nếu không đủ.
  - `moveItem(state, fromSlot, toSlot)`: hoán đổi hoặc dồn ô.
  - `hasItem(state, itemId, qty)`: kiểm tra đủ nguyên liệu (dùng khi chế tạo/nấu ăn sau này).
- Phím 1–9, 0, -, = chọn nhanh slot hotbar 1–12; cuộn chuột đổi slot kế tiếp/trước; phím **I** mở/đóng túi đồ chính (kéo-thả bằng chuột).

### Công cụ
| Công cụ | Việc làm | Năng lượng tốn |
|---|---|---|
| Cuốc | Cuốc đất trống thành đất trồng được | 2 |
| Bình tưới | Tưới 1 ô đất đã trồng | 1 |
| Rìu | Chặt cây/bụi rậm | 3 |
| Cuốc chim | Đập đá, quặng | 3 |
| Liềm | Cắt cỏ dại, thu hoạch cây lan | 1 |
| Cần câu | Câu cá (Phase 10) | 3 |

Mỗi công cụ có 3 cấp (Thường → Đồng → Bạc, xem Phase 11), cấp cao hơn giảm năng lượng tốn hoặc tăng phạm vi/hiệu quả (ví dụ cuốc cấp cao cuốc được 3 ô một lần theo hình chữ thập).

Dùng công cụ: nhấn **Space** khi đang cầm công cụ đó (chọn qua hotbar); công cụ tác động vào ô đất ngay trước mặt nhân vật theo hướng đang nhìn (`facing`).

### Năng lượng
- Thanh năng lượng tối đa mặc định **270** điểm (tăng dần khi nâng cấp — Phase 13).
- Mỗi hành động tốn năng lượng theo bảng trên; đi bộ/chạy không tốn năng lượng.
- Năng lượng về 0: nhân vật di chuyển chậm hẳn (còn 50% tốc độ) và không dùng được công cụ nữa cho tới khi ngủ.
- Ngủ hồi đầy năng lượng (trừ khi ngất — Phase 2 — thì chỉ hồi 50% và bị trừ một khoản tiền nhỏ, xem mục "Phạt khi ngất" bên dưới, bổ sung cho Phase 2).
- `EnergySystem.consume(state, amount)`, `EnergySystem.restore(state, amount)`: logic thuần.

### Phạt khi ngất (bổ sung Phase 2)
Khi ngất xỉu (ngủ bắt buộc lúc 2:00), ngoài việc mất một ngày, trừ thêm **10% số tiền đang có** (tối đa trừ 1000), tối thiểu 0.

---

## Phase 4 — Trồng trọt và bán hàng

### Cây trồng (`data/crops.json`)
```ts
interface CropDef {
  id: string;
  name: string;
  seedItemId: string;        // vật phẩm hạt giống tương ứng
  seedPrice: number;         // giá mua hạt ở cửa hàng
  season: Season[];          // mọc được trong mùa nào
  growthStages: number[];    // số ngày mỗi giai đoạn, vd [1,2,2,2,1] = 8 ngày tổng
  regrowDays?: number;       // nếu có: sau thu hoạch lần đầu, bao nhiêu ngày thu lại (dâu tây, cà chua...)
  harvestedItemId: string;   // vật phẩm thu được
  harvestYield: [number, number]; // số lượng ngẫu nhiên min-max mỗi lần thu
  sellPrice: number;
}
```

### Đất trồng (ô đất, lưu trong `GameState.farmPlots`, khoá bằng toạ độ tile `"x,y"`)
```ts
interface FarmPlot {
  tilled: boolean;       // đã cuốc chưa
  cropId?: string;       // đang trồng cây gì
  daysWatered: boolean;  // đã tưới hôm nay chưa (reset mỗi ngày mới)
  growthDay: number;     // số ngày đã lớn kể từ khi gieo
  isDead: boolean;       // chết do hết mùa / không tưới quá lâu (tuỳ chọn, bản đầu có thể bỏ qua luật "chết vì khô")
}
```

### Vòng đời
1. Cuốc đất trống (ô `grass`/`dirt`) → `tilled = true`.
2. Gieo hạt lên ô đã cuốc (tốn 1 hạt giống từ túi đồ) → tạo `FarmPlot.cropId`, `growthDay = 0`.
3. Mỗi ngày (xử lý trong `FarmingSystem.advanceDay`, gọi từ sự kiện `DayStarted`):
   - Nếu `daysWatered` hôm qua hoặc trời mưa → `growthDay += 1`.
   - Nếu không mùa phù hợp (đổi mùa) → `isDead = true`, cây biến mất, đất trở lại `tilled` (đã cuốc, trống).
   - Reset `daysWatered = false`.
4. `growthDay` đạt tổng `growthStages` → cây chín, có thể thu hoạch (liềm với cây lan, hoặc chạm để hái với rau/củ).
5. Thu hoạch: nhận `harvestedItemId` x số lượng random trong `harvestYield` vào túi đồ. Nếu có `regrowDays`, đặt lại `growthDay` về mốc chờ `regrowDays` thay vì xoá cây.

### Thùng bán (Shipping Bin)
- Vật thể đặt sẵn gần nhà, tương tác (**E**) mở giao diện: kéo vật phẩm từ túi đồ vào thùng.
- Vào lúc chuyển ngày (`DayStarted`), toàn bộ vật phẩm trong thùng được bán theo `sellPrice`, cộng vào `GameState.money`, thùng trống lại, hiện bảng tổng kết "Hôm qua bạn kiếm được X tiền" trên màn hình ngày mới.

### Tiền (`GameState.money: number`), bắt đầu 500.

---

## Phase 6 — Cửa hàng và làng

- Cửa hàng hạt giống (`Cửa hàng Mùa Vụ`): mở cửa 9:00–17:00, mỗi ngày trong tuần trừ Chủ Nhật.
- Giao diện mua: danh sách cây trồng theo mùa hiện tại, giá `seedPrice`, nút mua/nhập số lượng, trừ tiền + thêm vào túi đồ (hoặc gửi thư báo "túi đồ đầy" nếu hết chỗ).
- Thợ rèn/Cửa hàng dụng cụ: bán nâng cấp công cụ (Phase 11), vật liệu xây dựng cơ bản.
- `ShopDef` dữ liệu chung: `{id, name, openHour, closeHour, closedDays: number[], stock: {itemId, price, limitPerDay?}[]}`.

---

## Phase 7 — Tài nguyên và hái lượm

- Cây rừng (khác cây ăn quả/cây trồng): chặt bằng rìu, mỗi nhát trừ một phần "máu" (`treeHealth`), hết máu thì ngã, rơi gỗ (3-6 khúc), để lại gốc cây (chướng ngại, có thể đào bỏ bằng cuốc chim), sau N ngày mọc cây non trở lại nếu không bị chặt tiếp.
- Đá: đập bằng cuốc chim, vỡ cho đá vụn, có xác suất nhỏ ra quặng đồng (ngoài trời chỉ có quặng thường, quặng hiếm dành cho hầm mỏ Phase 11).
- Cỏ dại: cắt bằng liềm, rơi ngẫu nhiên hạt cỏ khô hoặc sợi.
- Đồ hái lượm theo mùa (nấm, quả mọng...): object rải ngẫu nhiên mỗi sáng trên các ô cỏ hợp lệ của bản đồ (tỉ lệ ví dụ 1 điểm hái lượm / 40 ô cỏ), biến mất khi nhặt, không hồi lại trong ngày.

---

## Phase 8 — Chế tạo & máy chế biến

### Công thức (`data/recipes.json`)
```ts
interface RecipeDef {
  id: string;
  name: string;
  ingredients: { itemId: string; qty: number }[];
  resultItemId: string;
  resultQty: number;
  unlockedBy: 'default' | { skill: SkillId; level: number }; // mở khoá mặc định hay theo cấp kỹ năng
  category: 'craft' | 'cook';
}
```
- Menu chế tạo (**C**): liệt kê công thức đã mở khoá, làm mờ nếu thiếu nguyên liệu; chọn → trừ nguyên liệu, thêm thành phẩm. Vật thể đặt được xuống đất ở ô đang nhìn (rương, vòi tưới tự động, bù nhìn, hàng rào, máy chế biến).
- Máy chế biến (thùng ủ rượu, lọ ngâm mứt...): đặt nguyên liệu vào, chờ số ngày cố định (lưu `startedDay`, kiểm tra khi `DayStarted`), lấy thành phẩm giá trị cao hơn.
- Bù nhìn: trong bán kính ô nhất định, quạ không phá hoại cây trồng (nếu sau này thêm cơ chế quạ).
- Rương: object có túi đồ riêng (giống `GameState.chests[id].slots`), mở bằng **E**.

---

## Phase 9 — Dân làng

### NPC (`data/npcs.json`)
```ts
interface NpcDef {
  id: string;
  name: string;         // tên tự đặt, không trùng tên riêng của IP nào
  portrait: string;     // id ảnh chân dung
  birthday: { season: Season; day: number };
  lovedGifts: string[]; itemId[]; likedGifts: string[]; dislikedGifts: string[]; hatedGifts: string[];
  schedule: ScheduleEntry[]; // theo khung giờ, map tới toạ độ
}
interface ScheduleEntry { hour: number; mapKey: MapKey; x: number; y: number; }
```
- 6–8 dân làng nguyên bản cho bản đầu, viết tiểu sử/tính cách ngắn trong chính file này hoặc `docs/world.md`.
- Di chuyển theo lịch: tại mỗi giờ mốc trong `schedule`, NPC dịch chuyển dần (A* đơn giản trên lưới tile, hoặc đơn giản hơn ở bản đầu: dịch chuyển tức thời khi đổi khung giờ, nâng cấp pathfinding mượt sau).
- Hộp thoại khi **E** tương tác: một dòng thoại ngẫu nhiên trong tập hợp phù hợp (mùa/thời tiết/giờ/đã quen thân chưa).
- Độ thân thiết: `GameState.relationships[npcId] = { points: number (0-250, mỗi 25 điểm = 1 tim, tối đa 10 tim) }`. Tặng quà (giới hạn 2 món/tuần/NPC): yêu thích +80, thích +45, ghét -20, cực ghét -40. Sinh nhật nhân 2 điểm quà hôm đó.
- Menu quan hệ: liệt kê NPC + số tim hiện tại.

---

## Phase 10 — Câu cá

- Minigame: thanh "vùng cá" (fish zone) di chuyển ngẫu nhiên (đổi hướng theo khoảng thời gian ngẫu nhiên) trong một cột dọc; người chơi giữ/nhả phím để thanh "con mồi" của mình đuổi theo; thanh tiến trình (progress bar) tăng khi trùng vùng, giảm khi lệch; đầy progress = câu được cá, cạn = cá chạy mất.
- Độ khó cá (`difficulty: 0-100`) quyết định vùng cá di chuyển nhanh/thất thường cỡ nào.
- `data/fish.json`: `{id, name, locations: MapKey[], season: Season[], minHour, maxHour, weather: Weather[] | 'any', difficulty, sellPrice}`.
- Chọn cá để câu: khi thả cần ở ô nước, random có trọng số trong các cá hợp lệ theo mùa/giờ/thời tiết/vị trí hiện tại.

---

## Phase 11 — Hầm mỏ và chiến đấu

- Hầm mỏ nhiều tầng, vào từ một cổng trong bản đồ Nông trại/Làng (map `Mine`), mỗi tầng là bản đồ tạo ngẫu nhiên đơn giản (thuật toán đào phòng-hành lang hoặc cellular automata) với: đá thường, đá chứa quặng (đồng/sắt/vàng theo độ sâu), thang xuống tầng kế, thỉnh thoảng quái vật.
- Quái vật đơn giản: di chuyển về phía người chơi trong tầm nhìn, có `health`, `damage`; người chơi tấn công bằng kiếm (phím Space khi cầm vũ khí), có `playerHealth` riêng (khác năng lượng).
- Ngất trong hầm mỏ (hết máu): mất một phần tiền, bị đưa về đầu hầm/nhà, mất một số vật phẩm trong túi đồ (tuỳ chọn, có thể bỏ ở bản đầu cho nhẹ nhàng hơn).
- Thang máy: cứ mỗi 5 tầng có trạm, cho phép lần sau đi thẳng tới tầng đó thay vì đi lại từ đầu.
- Thợ rèn: dùng quặng + than để nâng cấp công cụ lên các cấp Đồng/Bạc/Vàng, mỗi cấp tốn thời gian chờ (qua đêm) để hoàn thành.

---

## Phase 12 — Vật nuôi

- Chuồng (Coop cho gia cầm, Barn cho gia súc): xây qua thợ mộc, tốn tiền + vật liệu + vài ngày chờ.
- Mua con giống tại chuồng, mỗi con có `happiness (0-255)`, `friendship (0-1000)`.
- Hằng ngày: nếu có cỏ khô trong máng ăn → vui vẻ tăng, không có → giảm. Vuốt ve (tương tác **E**) tăng thêm friendship. Cho ra ngoài đồng cỏ nếu trời đẹp tăng vui vẻ nhanh hơn.
- Sản phẩm (trứng, sữa, len...) xuất hiện cạnh con vật mỗi sáng nếu đủ điều kiện vui vẻ/friendship, chất lượng (thường/bạc/vàng) tỉ lệ theo friendship.

---

## Phase 13 — Kỹ năng, nhiệm vụ, lễ hội

### Kỹ năng
5 kỹ năng: Trồng trọt, Khai thác, Hái lượm, Câu cá, Chiến đấu. Mỗi hành động liên quan cộng XP (ví dụ thu hoạch cây +3 XP Trồng trọt, đập đá +5 XP Khai thác...). Bảng XP cần cho mỗi cấp 1–10 tăng dần (vd cấp n cần `n * (n+1) * 25` XP luỹ kế). Lên cấp mở khoá công thức chế tạo/nấu ăn tương ứng, và ở cấp 5/10 có thể chọn "chuyên môn" tăng thêm hiệu quả (tuỳ chọn mở rộng sau).

### Nhiệm vụ / bộ sưu tập dài hạn
- Bảng thông báo trong làng liệt kê các mục tiêu (ví dụ "góp 10 loại nông sản khác nhau cho quỹ cộng đồng để sửa cây cầu cũ", mở khoá khu vực mới khi hoàn thành) — thay cho "Nhà Cộng Đồng" của IP gốc bằng một địa danh tự đặt tên.
- `data/quests.json` mô tả điều kiện hoàn thành (loại: thu thập X vật phẩm, đạt độ thân thiết Y với NPC, đạt cấp kỹ năng Z) và phần thưởng.

### Lễ hội
- 1 sự kiện/mùa, vào một ngày cố định, tại bản đồ Làng, tạm khoá lịch trình NPC bình thường (tất cả NPC tụ tập ở khu lễ hội), có thể có minigame nhỏ riêng (tuỳ chọn mở rộng).

---

## Phase 14 — Hoàn thiện
- Âm thanh: nhạc nền đổi theo mùa/trong nhà/ngoài trời/hầm mỏ; hiệu ứng tiếng bước chân, dùng công cụ, nhặt đồ.
- Menu cài đặt: âm lượng nhạc/hiệu ứng riêng, đổi phím, bật/tắt rung (nếu dùng tay cầm), toàn màn hình.
- Cân bằng số liệu: rà lại giá bán/mua, tốc độ kiếm tiền những ngày đầu, độ khó hầm mỏ.

## Phase 15 — Đóng gói desktop
- Tauri bọc bản build Vite thành ứng dụng Windows/Mac, chuyển `SaveService` sang ghi file trong thư mục dữ liệu người dùng thay vì `localStorage`.

---

## Ghi chú về an toàn bản quyền
Toàn bộ tài liệu này mô tả **cơ chế** (ý tưởng, công thức, luồng xử lý) — phần không được luật bản quyền bảo hộ. Khi code các phase trên, Claude/Claude Code cần tiếp tục tự đặt: tên vật phẩm, tên NPC, tên địa danh, lời thoại, nhạc, hình ảnh của riêng dự án, không tra cứu hay sao chép từ mã nguồn/asset của bất kỳ game thương mại nào, kể cả bản decompile được chia sẻ công khai.
