# ASSET_LIST — danh sách hình cần vẽ để thay đồ hoạ vẽ bằng code

Tài liệu này liệt kê **mọi thứ game đang vẽ bằng code**, kèm kích thước, animation, tên file nên lưu, và prompt tiếng Anh để dán vào Gemini. Chưa sửa code game: khi có ảnh, sẽ có một bước riêng để nạp các file `assets/...` vào game.

## Tóm tắt

| Nhóm | Số hình |
|---|---|
| 1. Nhân vật (sprite sheet đi bộ) | 14 |
| 2. Động vật | 5 |
| 3. Xe cộ | 6 |
| 4. Nhà và công trình (đang có trên bản đồ) | 38 |
| 5. Vật trang trí và đồ đặt được | 17 |
| 6. Cây | 11 |
| 7. Cây trồng (5 giai đoạn) | 6 |
| 8. Ma (chế độ kinh dị ban đêm) | 4 |
| 9. Ô mặt đất (tile 32 x 32 px, ghép liền) | 22 |
| 9b. Dải viền và lớp phủ trên mặt đất | 10 |
| 9c. Ô hầm mỏ (32 x 32 px) | 6 |
| 10. Biểu tượng vật phẩm (túi đồ, thanh công cụ) | 63 |
| 11. Giao diện (UI) | 13 |
| 12. Asset mới gợi ý từ ảnh mẫu (game nên có) | 12 |
| **Tổng** | **227** |

<!-- status:start -->

### Tình trạng (tự cập nhật bằng `python3 scripts/art/asset_status.py`)

✅ đã có trong game: **176** · 🔁 có nhưng cần vẽ lại: **10** · 🟡 có ảnh, chưa dùng trong game: **12** · ⬜ còn thiếu: **29** (tổng 227)

**Cần vẽ lại (10):**

- *1. Nhân vật (sprite sheet đi bộ)*
  - Chú Tư (nông dân già) — `assets/characters/chu_tu.png` (vẽ lại theo prompt 3 hàng để có bước chân)
  - Dân làng 1 — `assets/characters/folk_0.png` (vẽ lại theo prompt 3 hàng để có bước chân)
  - Dân làng 4 — `assets/characters/folk_3.png` (vẽ lại theo prompt 3 hàng để có bước chân)
- *4. Nhà và công trình (đang có trên bản đồ)*
  - Quảng Bình Quan (cổng thành cổ) — `assets/buildings/quang_binh_quan.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc)
  - Cổng tam quan chùa — `assets/buildings/pagoda_gate.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trước)
  - Ngọ Môn (Huế) — `assets/buildings/ngo_mon.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc)
  - Cầu Trường Tiền (nhìn từ trên) — `assets/buildings/truong_tien.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc)
  - Cầu dây văng Nhật Lệ — `assets/buildings/cable_bridge.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy ngang)
  - Cầu bắc qua sông — `assets/buildings/river_bridge.png` (vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc)
- *9b. Dải viền và lớp phủ trên mặt đất*
  - Gốc rạ (sau khi gặt) — `assets/tiles/stubble.png` (vẽ thành cả thửa ruộng: cần 1 ô gốc rạ phủ kín)

**Còn thiếu, cần vẽ tiếp (29):**

- *1. Nhân vật (sprite sheet đi bộ)*
  - Người chơi — `assets/characters/player.png`
  - Dân làng 6 / người bán gánh hàng rong — `assets/characters/folk_5.png`
- *4. Nhà và công trình (đang có trên bản đồ)*
  - Đình làng — `assets/buildings/dinh_lang.png`
  - Bến phà (mái lá) — `assets/buildings/ferry_shelter.png`
  - Sạp gạo — `assets/buildings/stall_rice.png`
  - Chợ ô dù: rau — `assets/buildings/umbrella_veg.png`
  - Động Phong Nha (cửa động) — `assets/landmarks/phong_nha_cave.png`
  - Động Thiên Đường (cửa động) — `assets/landmarks/paradise_cave.png`
  - Núi đá vôi 1 — `assets/landmarks/karst_a.png`
  - Núi đá vôi 2 — `assets/landmarks/karst_b.png`
  - Núi (Thần Đinh / Ngự Bình) — `assets/landmarks/mountain.png`
  - Thác nước — `assets/landmarks/waterfall.png`
  - Suối nước nóng — `assets/landmarks/hot_spring.png`
- *5. Vật trang trí và đồ đặt được*
  - Đống rơm — `assets/props/haystack.png`
  - Chum, vại — `assets/props/jar.png`
  - Bàn trà trong sân — `assets/props/tea_table.png`
  - Thùng bán hàng — `assets/props/shipping_bin.png`
  - Cột đèn dầu — `assets/props/oil_lamp_post.png`
  - Ghế đá — `assets/props/stone_bench.png`
  - Biển chỉ đường — `assets/props/signpost.png`
  - Cái cày — `assets/props/plough.png`
  - Đòn gánh hàng rong — `assets/props/ganh.png`
  - Trâu nằm (trang trí) — `assets/props/buffalo_resting.png`
  - Thuyền nan (thuyền thúng tròn) — `assets/props/basket_boat.png`
  - Thuyền tam bản — `assets/props/sampan.png`
  - Thuyền rồng — `assets/props/dragon_boat.png`
  - Thuyền đua — `assets/props/race_boat.png`
- *9. Ô mặt đất (tile 32 x 32 px, ghép liền)*
  - Ruộng ngập nước (bùn) — `assets/tiles/paddy.png`
- *12. Asset mới gợi ý từ ảnh mẫu (game nên có)*
  - Gốc cây sau khi chặt — `assets/props/tree_stump.png`

**Có ảnh, chờ đưa vào game (12):**

- *9b. Dải viền và lớp phủ trên mặt đất*
  - Lúa non / mạ (game cũng tô xanh lúa chín được, nhưng có hình riêng thì đẹp hơn) — `assets/tiles/rice_young.png` (game chưa có ô lúa non riêng)
- *12. Asset mới gợi ý từ ảnh mẫu (game nên có)*
  - Trâu kéo cày (người cày đi sau) — `assets/animals/buffalo_plough.png` (chưa có cảnh dân làng cày bằng trâu)
  - Bó lúa (sau khi gặt) — `assets/props/rice_sheaf.png` (chưa đặt lên bản đồ)
  - Thúng / rổ hàng của gánh hàng rong — `assets/props/produce_baskets.png` (chưa đặt lên bản đồ)
  - Giàn phơi nón lá — `assets/props/hat_drying_rack.png` (chưa đặt lên bản đồ)
  - Lá nón phơi trên sân — `assets/tiles/drying_leaves.png` (chưa đặt lên bản đồ)
  - Đò ngang có mái (bến phà) — `assets/props/ferry_boat.png` (chưa đặt lên bản đồ)
  - Cầu tàu gỗ (bến thuyền) — `assets/props/wooden_jetty.png` (chưa đặt lên bản đồ)
  - Hàng rào tre thấp (vườn nhà) — `assets/tiles/bamboo_fence.png` (chưa đặt lên bản đồ)
  - Bụi hoa ven đường — `assets/props/flower_bush.png` (chưa đặt lên bản đồ)
  - Nhà vườn (nhà ngói trong vườn cây) — `assets/buildings/garden_house.png` (chưa đặt lên bản đồ)
  - Chiếu tre / phên phơi lúa trên sân — `assets/tiles/drying_rice.png` (chưa đặt lên bản đồ)

<!-- status:end -->

## Cách dùng

1. Mở Gemini, **đính kèm ảnh mẫu `assets/reference.jpg`** rồi dán nguyên prompt của từng mục. Mọi prompt đều mở đầu bằng cùng một đoạn phong cách, để các hình đồng bộ với nhau. Riêng nhân vật có đoạn phong cách riêng (xem đầu mục 1).
2. Lưu ảnh đúng **tên file** ghi ở mỗi mục (thư mục `assets/...` ở gốc repo).
3. Gemini thường trả ảnh to (1024 px…) và không đúng kích thước pixel. Sau khi có ảnh, cần một bước xử lý (sẽ làm bằng script khi nạp vào game):
   - thu nhỏ về đúng **Kích thước file** bằng *nearest neighbour* (không làm mờ);
   - đổi **nền trắng thành trong suốt** (đồ vật, nhân vật, cây). Vì vậy đồ vật **không được có màu trắng tinh** trong thân, nếu cần màu trắng thì dùng trắng ngà;
   - tile mặt đất thì giữ nguyên, phủ kín ảnh, ghép liền được.
4. Hình nào chưa ưng thì chạy lại prompt, hoặc thêm 1–2 câu mô tả cuối prompt.

## Nạp hình vào game

Chạy `python3 scripts/art/import_assets.py` (hoặc `python3 scripts/gen_placeholders.py`, nó tự gọi bước này ở cuối). Script chỉ dùng những file đã có trong `assets/`, nên có thể thêm hình dần từng đợt. Script làm các việc sau:
- **Ô mặt đất:** một ảnh Gemini chi tiết bằng khoảng 6 x 6 ô, nên mỗi ảnh được cắt thành một **mảng 6 x 6 ô** (`public/assets/tilesets/ground_hd.png`) và game vẽ phủ lên bản đồ. Viền nước, viền đường, kè đá được ghép từ ảnh `edge_*.png`.
- **Đồ vật, cây, cây trồng, ma, biểu tượng:** xoá nền trắng (kể cả khoảng trắng giữa cành lá), bỏ bóng xám dưới đồ vật (cây thì giữ bóng mờ), thu nhỏ đúng kích thước, kẻ viền tối.
- **Hầm mỏ:** cắt một ô ở đúng cỡ điểm ảnh gốc. Vách và quặng tối hơn nền để dễ phân biệt.
- **Cây trồng** để ở `assets/crops/` hoặc `assets/trees/` đều được.
- **Nhân vật, động vật, xe, nhà** (`scripts/art/import_sheets.py`): ảnh được tách thành từng hình theo khoảng trống giữa chúng, rồi bảng trong script chọn hình nào vào khung nào. Hàng nhìn ngang chỉ cần một phía, script tự lật ra phía kia. Nhà lấy hình đầu tiên (góc trên trái) của tấm.
- **Kích thước thật** (`scripts/art/real_scale.py`): lấy người cao 1,6 m làm chuẩn (1 m ≈ 1,2 ô). Động vật, xe, thuyền, nhà dân, sạp chợ vẽ đúng tỉ lệ thật. Vật cao hơn 10 ô (cây dừa, thông, Ngọ Môn…) thì phần vượt chỉ tính 30%, tối đa 28 ô. Cỡ ảnh, cỡ khung hình động và chỗ đứng trên bản đồ đều lấy từ bảng này. Vật nhỏ (hạt giống, biểu tượng, đồ trong nhà) và núi, hang, cầu giữ nguyên. Số **Kích thước file** ghi trong các mục dưới là cỡ cũ: ảnh Gemini cứ vẽ to, script tự thu về đúng cỡ.
- **Hướng nhà:** lúc tạo bản đồ, mỗi nhà được ghi hướng ra con đường gần nhất (`scripts/art/facing.py`). Nhà trong sân vườn luôn quay ra cổng sân và con đường trước cổng. Từ tấm 2 x 2: hàng trên là mặt trước, hàng dưới là mặt sau. Script làm ra 4 hình `<tên>`, `_left`, `_right`, `_up`, và mọi nhà dùng chung một kiểu: cửa ở tường bên trái.
- **Nhân vật đi bộ:** tấm **3 hàng** (prompt mới) được dùng đủ 4 bước chân cho mọi hướng, hướng phải lật từ hàng trái. Tấm cũ 4 hàng thì mỗi hướng chỉ dùng **một hình** (các khung cũ hay lệch góc), khi đi hình nhún lên xuống.
- Tên file lỡ gõ đuôi hai lần (`x.png.png`) vẫn được nhận.
- **Tình trạng từng hình** (✅ ⬜ 🔁 🟡, bảng tổng ở đầu file): chạy `python3 scripts/art/asset_status.py` sau mỗi lần thêm ảnh hoặc thêm mục mới.

**Đợt 1 (đã nạp):** 53 hình gồm ô mặt đất, ô hầm mỏ, viền, đá, bụi, lau sậy, luống hoa, lúa chín, 4 cây (thông, đước, bưởi, phượng), 5 cây trồng, 4 hình ma và 8 biểu tượng công cụ.

**Đợt 2 (đã nạp):** 9 nhân vật (người chơi, Chú Tư, Cô Hạnh, Linh, Minh, dân làng 1, 2, 4, người bán rau, người bán gạo), 5 con vật, 6 xe và 24 nhà, công trình.

**Đợt 3 (đã nạp):** `characters/character.png` (người chơi mới: áo bà ba chàm, nón lá), có bước chân thật. Hàng nhìn trước dùng đủ 4 khung, hàng quay trái là hàng nghiêng lật lại, hàng quay lưng chỉ dùng ô 1 và ô 3 (ô 2 và ô 4 bị vẽ nghiêng). Hình này thay cho `player.png` cũ.

**Đợt 3b (đã nạp):** giao diện gỗ (`assets/ui/`: khung bảng, nút, ô đồ, đồng hồ, bánh răng, thanh chỉ số, khung bản đồ nhỏ, nút cảm ứng, nền màn hình tiêu đề), 57 biểu tượng vật phẩm, và các hình mục 12 (bó lúa, thúng hàng, giàn phơi nón, lá nón, đò, cầu tàu, hàng rào tre, bụi hoa, nhà vườn, nong phơi lúa, trâu kéo cày). Hình mục 12 mới được cắt sẵn thành sprite, chưa đặt lên bản đồ.

**Đợt 4 (đã nạp):** cây cau, tre, chuối, cây tán tròn 1 và 2, phi lao, dừa. Giờ cả 11 loại cây đều là hình vẽ.

**Chưa dùng:**
- `folk_5.png`: vẽ người gánh hàng có sẵn đòn gánh, nhưng game tự vẽ đòn gánh lên người bán rong (sẽ thành hai đòn). Cần tấm 4 x 4 người đi bộ không cầm gì.
- `ngo_mon.png`, `quang_binh_quan.png`, `pagoda_gate.png`: cổng vẽ nghiêng chéo, nên lối đi qua cổng không thẳng hàng với đường. Đang giữ hình cũ nhìn thẳng. Cần vẽ lại cổng **nhìn thẳng từ phía trước**, lối đi qua cổng chạy dọc từ dưới lên trên.
- `cable_bridge.png`, `river_bridge.png`, `truong_tien.png`: cầu vẽ nghiêng chéo, không đặt được lên dòng sông thẳng. Cần cầu nhìn thẳng từ trên xuống (cầu sông và Trường Tiền chạy dọc trên–dưới, cầu dây văng chạy ngang).
- `stubble.png`: Gemini vẽ thành cả một thửa ruộng chứ không phải 1 ô, nên vẫn giữ hình cũ. Nếu muốn thay thì vẽ lại thành 1 ô gốc rạ phủ kín.
- `rice_young.png`: game chưa có ô riêng cho lúa non, vẫn dùng lúa chín tô xanh.

## Quy ước kích thước

- Thế giới game: **1 ô = 16 px**. Đồ hoạ đang ở chế độ **HD x2**: ảnh vẽ gấp đôi rồi hiện ở ½, nên **1 ô = 32 px trong file ảnh**.
- *Kích thước file* = kích thước ảnh cần có, ví dụ `160 x 160`. *Trong game* = số ô nó chiếm, ví dụ `5 x 5 ô` (5 ô rộng, cao 5 ô tính cả mái). *Chân đế* = phần chạm đất, dùng để va chạm.
- Góc nhìn như `assets/reference.jpg`: **từ trên cao chếch khoảng 45°**, thấy rõ mái và mặt trên, mặt trước ở dưới. Đồ vật đặt ở **đáy ảnh**: chân chạm mép dưới, phần thừa phía trên để trống.
- Ảnh mẫu là **phố chợ đông đúc**; game là **làng quê nghèo thời xưa**. Chỉ học **góc nhìn, màu sắc, nét viền, độ chi tiết**, còn nội dung giữ đúng bối cảnh làng xưa (xem mục 12 về những thứ trong ảnh mẫu cố ý không đưa vào).

## Đoạn phong cách chung (đã có sẵn ở đầu mọi prompt)

```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game.
```


## 1. Nhân vật (sprite sheet đi bộ)

Mỗi nhân vật là **1 tấm 3 hàng x 4 khung**: hàng 1 nhìn trước (đi xuống), hàng 2 nghiêng sang trái, hàng 3 quay lưng (đi lên). Mỗi hàng là 4 bước chân. Hướng phải không cần vẽ, script tự lật hàng 2. Mỗi khung 32 x 64 px (trong game 1 x 2 ô). Khi ngồi nghỉ hay ngồi uống trà, game tự cắt bớt chân, không cần hình riêng.

**Vì sao prompt cũ hay sai, và prompt mới sửa thế nào:**
- Đoạn phong cách chung ("nhìn từ trên xuống, nghiêng 45 độ") viết cho nhà cửa, làm Gemini xoay người nhân vật 3/4. Prompt nhân vật giờ có đoạn phong cách riêng, chỉ học màu và nét viền của ảnh mẫu.
- Bắt vẽ cả hàng trái lẫn hàng phải thì Gemini gần như luôn vẽ hai hàng quay cùng một phía. Giờ chỉ vẽ hàng trái.
- Quy tắc nằm giữa một đoạn văn dài thì bị bỏ qua. Giờ mỗi hàng một dòng riêng, viết hoa tên hàng.
- Gemini luôn đóng dấu lấp lánh ở góc dưới phải. Prompt xin lề trắng rộng bên phải và bên dưới để dấu rơi vào chỗ trống.

**Cách tạo và lưu cho chuẩn:**
1. Đính kèm `assets/reference.jpg`, dán nguyên prompt.
2. Nếu Gemini vẫn vẽ sai một hàng, đừng sửa tay: trả lời Gemini ngay trong cuộc trò chuyện, ví dụ *"Row 2 must be a pure left side profile in all 4 cells, redraw the whole sheet"*.
3. Lưu bằng **nút tải về** của Gemini (file PNG gốc), **không chụp màn hình**: ảnh chụp bị nút bấm đè lên và bị nén mờ.
4. Đặt đúng tên file, ví dụ `assets/characters/chu_tu.png`. Script tự nhận ra tấm 3 hàng và cho đi đủ bước chân. Tấm kiểu cũ 4 hàng vẫn dùng được, nhưng mỗi hướng chỉ có một hình.

**Kiểm tra trước khi đưa vào:**
- Hàng 1: cả 4 ô nhìn thẳng, không ô nào xoay người.
- Hàng 2: cả 4 ô nghiêng **hẳn sang trái**, chỉ thấy một bên mặt.
- Hàng 3: cả 4 ô **quay lưng**, không ô nào quay ngang.
- Không cầm gì trên tay, không có đường kẻ khung, không có chữ.

### Người chơi

- **File:** `assets/characters/player.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/player.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a young Vietnamese farmer wearing an indigo áo bà ba shirt, dark trousers, bare feet or simple sandals and a conical palm-leaf hat (nón lá). Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Chú Tư (nông dân già)

- **File:** `assets/characters/chu_tu.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** 🔁 đang dùng 1 hình mỗi hướng: vẽ lại theo prompt 3 hàng để có bước chân
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/chu_tu.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: an old Vietnamese farmer with grey hair, a faded brown áo bà ba, dark trousers rolled to the knee and a conical hat. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Cô Hạnh (người buôn bán)

- **File:** `assets/characters/co_hanh.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/co_hanh.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a middle-aged Vietnamese woman with her hair in a bun, a purple áo bà ba, black trousers and a cream apron. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Linh (cô gái)

- **File:** `assets/characters/linh.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/linh.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a young Vietnamese woman with long black hair wearing a white áo dài and white trousers. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Minh (chàng trai)

- **File:** `assets/characters/minh.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/minh.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a young Vietnamese man with short black hair, a blue shirt and brown trousers. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 1

- **File:** `assets/characters/folk_0.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** 🔁 đang dùng 1 hình mỗi hướng: vẽ lại theo prompt 3 hàng để có bước chân
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_0.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a Vietnamese village man in a dark indigo áo bà ba, black trousers and a conical hat. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 2

- **File:** `assets/characters/folk_1.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_1.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a Vietnamese village woman in a red-brown áo bà ba, black trousers, hair in a bun under a conical hat. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 3

- **File:** `assets/characters/folk_2.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_2.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: an elderly Vietnamese villager with grey hair in a faded khaki áo bà ba and a conical hat. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 4

- **File:** `assets/characters/folk_3.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** 🔁 đang dùng 1 hình mỗi hướng: vẽ lại theo prompt 3 hàng để có bước chân
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_3.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a Vietnamese village woman with long black hair, an off-white áo bà ba, dark trousers and a conical hat. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 5 (cũng dùng cho trẻ con, game tự thu nhỏ)

- **File:** `assets/characters/folk_4.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_4.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a Vietnamese village man without a hat, short black hair, a green-grey shirt and brown trousers. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Dân làng 6 / người bán gánh hàng rong

- **File:** `assets/characters/folk_5.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** 1 x 2 ô mỗi khung
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** 3 hàng (trước, nghiêng trái, sau) x 4 bước (12 khung). Hướng phải script tự lật từ hàng trái
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/folk_5.png`
```
Pixel art walking sprite sheet for a cozy top-down 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines; ignore its camera angle and its layout.

CHARACTER: a Vietnamese village woman with her hair in a bun, a lilac áo bà ba, dark trousers and a beige apron. Chibi proportions: big head, small body. Hands empty: holding nothing, no pole, no baskets, no tools.

LAYOUT (most important):
- A neat grid of 3 rows x 4 columns: 12 copies of the same character, same size, evenly spaced.
- Plain pure white background. No grid lines, no frames, no borders, no ground shadow, no text, no numbers.
- Leave a wide empty white margin around the grid, especially on the right side and at the bottom.

ROW 1, FRONT: in all 4 cells the character faces the viewer squarely: symmetrical body, both shoulders, both eyes, both feet pointing at the viewer. The body never turns.
ROW 2, SIDE: in all 4 cells the character faces LEFT in pure side profile: one eye, nose pointing at the left edge, toes pointing left. Never three-quarter, never turned toward the viewer.
ROW 3, BACK: in all 4 cells the character faces away: only the back of the head (or hat) and the back of the shirt, no face, no side view.

WALK CYCLE, the same in every row: cell 1 standing with feet together, cell 2 left leg forward, cell 3 standing with feet together, cell 4 right leg forward. Only the legs and arms move; the head and body keep exactly the same angle in all 4 cells of a row. Feet on the same baseline in every cell.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, light from the top left, no anti-aliasing, no blur.
```

### Người bán cá (bảng mua bán)

- **File:** `assets/characters/vendor_fish.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** hiện to trong bảng mua bán
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (1 khung, nhìn thẳng)
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/vendor_fish.png`
```
Pixel art character portrait for a cozy 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines.

CHARACTER: A Vietnamese fish seller woman in a conical hat and a blue-grey áo bà ba. Chibi proportions: big head, small body.

LAYOUT: ONE single figure only, standing and facing the viewer squarely, full body from hat to feet, centred, filling most of the picture height. Not several views, not a sheet. Plain pure white background, no ground shadow, no frame, no text. Leave an empty white margin on the right side and at the bottom.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, no anti-aliasing, no blur.
```

### Người bán rau

- **File:** `assets/characters/vendor_veg.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** hiện to trong bảng mua bán
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (1 khung, nhìn thẳng)
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/vendor_veg.png`
```
Pixel art character portrait for a cozy 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines.

CHARACTER: An old Vietnamese vegetable seller woman in a brown áo bà ba and a scarf. Chibi proportions: big head, small body.

LAYOUT: ONE single figure only, standing and facing the viewer squarely, full body from hat to feet, centred, filling most of the picture height. Not several views, not a sheet. Plain pure white background, no ground shadow, no frame, no text. Leave an empty white margin on the right side and at the bottom.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, no anti-aliasing, no blur.
```

### Người bán gạo

- **File:** `assets/characters/vendor_rice.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** hiện to trong bảng mua bán
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (1 khung, nhìn thẳng)
- **Thay cho (hiện tại):** `public/assets/sprites/npcs/vendor_rice.png`
```
Pixel art character portrait for a cozy 2D farming game set in an old, humble Vietnamese village. Classic 16-bit RPG character style. Use the attached reference image only for its colours and its thin dark outlines.

CHARACTER: A Vietnamese rice seller man in a white shirt and a conical hat. Chibi proportions: big head, small body.

LAYOUT: ONE single figure only, standing and facing the viewer squarely, full body from hat to feet, centred, filling most of the picture height. Not several views, not a sheet. Plain pure white background, no ground shadow, no frame, no text. Leave an empty white margin on the right side and at the bottom.

STYLE: crisp pixel art, every pixel a clean square, thin dark outline, soft cel shading, no anti-aliasing, no blur.
```


## 2. Động vật

Mỗi con là **1 dải 2 khung** nằm ngang (bước chân trái / phải), nhìn ngang **quay mặt sang phải** (game tự lật khi đi sang trái).

### Gà

- **File:** `assets/animals/chicken.png`  ·  **Kích thước file:** 64 x 32 px  ·  **Trong game:** 1 x 1 ô mỗi khung (khoảng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 2 khung đi
- **Thay cho (hiện tại):** `public/assets/sprites/animals/chicken.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 64 x 32 pixels (the picture must look like a 64 x 32 pixel sprite scaled up, every art pixel a clean square). Animal sprite strip of a small brown-and-white village chicken, side view facing right, 2 frames side by side, each frame 32 x 32 pixels (whole strip 64 x 32): frame 1 left legs forward, frame 2 right legs forward. Same size and ground line in both frames. Plain pure white (#FFFFFF) background.
```

### Heo

- **File:** `assets/animals/pig.png`  ·  **Kích thước file:** 128 x 48 px  ·  **Trong game:** 2 x 1 ô mỗi khung (khoảng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 2 khung đi
- **Thay cho (hiện tại):** `public/assets/sprites/animals/pig.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 128 x 48 pixels (the picture must look like a 128 x 48 pixel sprite scaled up, every art pixel a clean square). Animal sprite strip of a small black Vietnamese pot-bellied pig, side view facing right, 2 frames side by side, each frame 64 x 48 pixels (whole strip 128 x 48): frame 1 left legs forward, frame 2 right legs forward. Same size and ground line in both frames. Plain pure white (#FFFFFF) background.
```

### Bò

- **File:** `assets/animals/cow.png`  ·  **Kích thước file:** 128 x 48 px  ·  **Trong game:** 2 x 1 ô mỗi khung (khoảng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 2 khung đi
- **Thay cho (hiện tại):** `public/assets/sprites/animals/cow.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 128 x 48 pixels (the picture must look like a 128 x 48 pixel sprite scaled up, every art pixel a clean square). Animal sprite strip of a lean yellow-brown Vietnamese cow, side view facing right, 2 frames side by side, each frame 64 x 48 pixels (whole strip 128 x 48): frame 1 left legs forward, frame 2 right legs forward. Same size and ground line in both frames. Plain pure white (#FFFFFF) background.
```

### Trâu

- **File:** `assets/animals/buffalo.png`  ·  **Kích thước file:** 128 x 48 px  ·  **Trong game:** 2 x 1 ô mỗi khung (khoảng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 2 khung đi
- **Thay cho (hiện tại):** `public/assets/sprites/animals/buffalo.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 128 x 48 pixels (the picture must look like a 128 x 48 pixel sprite scaled up, every art pixel a clean square). Animal sprite strip of a dark grey Vietnamese water buffalo with long curved horns, side view facing right, 2 frames side by side, each frame 64 x 48 pixels (whole strip 128 x 48): frame 1 left legs forward, frame 2 right legs forward. Same size and ground line in both frames. Plain pure white (#FFFFFF) background.
```

### Hổ

- **File:** `assets/animals/tiger.png`  ·  **Kích thước file:** 160 x 48 px  ·  **Trong game:** 2 x 1 ô mỗi khung (khoảng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 2 khung đi
- **Thay cho (hiện tại):** `public/assets/sprites/animals/tiger.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 48 pixels (the picture must look like a 160 x 48 pixel sprite scaled up, every art pixel a clean square). Animal sprite strip of a fierce Indochinese tiger, side view facing right, 2 frames side by side, each frame 80 x 48 pixels (whole strip 160 x 48): frame 1 left legs forward, frame 2 right legs forward. Same size and ground line in both frames. Plain pure white (#FFFFFF) background.
```


## 3. Xe cộ

Mỗi xe là **1 dải 4 khung 64 x 64 px**: nhìn từ phía trước (đi xuống), quay trái, quay phải, nhìn từ phía sau (đi lên). Người lái do game vẽ chồng lên (cắt chân), nên **xe không có người**, chừa chỗ ngồi ở giữa khung, cao khoảng 2/3 từ dưới lên.

### Xe đạp

- **File:** `assets/vehicles/bicycle.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/bicycle.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of an old black Vietnamese bicycle with a rear rack, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```

### Xe máy

- **File:** `assets/vehicles/motorbike.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/motorbike.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of a classic small red step-through motorbike, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```

### Xe bò

- **File:** `assets/vehicles/ox_cart.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/ox_cart.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of a wooden ox cart pulled by one brown ox, with a driver's bench and a wooden cargo bed, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```

### Máy cày

- **File:** `assets/vehicles/tractor.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/tractor.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of a small old orange farm tractor with big rear wheels, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```

### Máy gặt lúa

- **File:** `assets/vehicles/harvester.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/harvester.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of a small green rice harvester on tracks with a yellow cutting header, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```

### Máy tưới nước

- **File:** `assets/vehicles/water_truck.png`  ·  **Kích thước file:** 256 x 64 px  ·  **Trong game:** 2 x 2 ô (xe nhỏ 1 x 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 4 hướng (1 khung mỗi hướng)
- **Thay cho (hiện tại):** `public/assets/sprites/vehicles/water_truck.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 256 x 64 pixels (the picture must look like a 256 x 64 pixel sprite scaled up, every art pixel a clean square). Vehicle sprite strip of a small yellow pump cart carrying a blue water tank with a spray bar at the back, with nobody riding it. 4 frames side by side, each 64 x 64 pixels (whole strip 256 x 64): frame 1 seen from the front (driving towards the viewer), frame 2 driving left, frame 3 driving right, frame 4 seen from behind. Wheels touch the bottom of each frame, the seat around two thirds of the way down. Plain pure white (#FFFFFF) background.
```


## 4. Nhà và công trình (đang có trên bản đồ)

Đều **không cần animation**. Đặt ở đáy ảnh, cửa chính quay về phía người xem.

### Nhà tranh (nhà trống cấp cho người chơi)

- **File:** `assets/buildings/thatched_house.png`  ·  **Kích thước file:** 160 x 128 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/thatched_house.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 128 pixels (the picture must look like a 160 x 128 pixel sprite scaled up, every art pixel a clean square). A poor thatched cottage with a thick straw roof, bamboo and woven-reed walls, a dark wooden door in the middle and two small windows.
```

### Nhà tranh vách đất

- **File:** `assets/buildings/house_mud_thatch.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/house_c.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A thatched farmhouse with a thick straw roof and earthen mud walls with straw flecks, a plank door, two small bamboo-barred windows and a bamboo porch.
```

### Nhà ngói ba gian (tường vôi)

- **File:** `assets/buildings/house_tile_lime.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/house_a.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A traditional three-bay Vietnamese village house with an old weathered dark-red clay tile roof with a little moss and upturned ridge ends, faded yellow lime-washed walls, round wooden columns on a brick terrace, wooden lattice double doors and barred windows.
```

### Nhà ngói gạch trần

- **File:** `assets/buildings/house_tile_brick.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/house_b.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A traditional three-bay Vietnamese village house with an old dark tile roof, bare red-brown brick walls, wooden columns, wooden double doors and barred windows.
```

### Tiệm xe (nhà ngói có biển)

- **File:** `assets/buildings/vehicle_shop.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 5 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/vehicle_house.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A traditional tiled village house used as a cart and vehicle workshop, with a small red signboard showing a wheel picture (no letters) above the door.
```

### Tiệm hạt giống

- **File:** `assets/buildings/seed_shop.png`  ·  **Kích thước file:** 192 x 160 px  ·  **Trong game:** chân đế 6 x 5 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/shop.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 192 x 160 pixels (the picture must look like a 192 x 160 pixel sprite scaled up, every art pixel a clean square). A traditional tiled village shop selling seeds, open wooden front with sacks of seed and rice, a small red signboard showing a sprouting seed picture (no letters).
```

### Nhà kho hợp tác xã

- **File:** `assets/buildings/warehouse.png`  ·  **Kích thước file:** 192 x 160 px  ·  **Trong game:** chân đế 6 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/warehouse.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 192 x 160 pixels (the picture must look like a 192 x 160 pixel sprite scaled up, every art pixel a clean square). An old wooden plank barn with a tiled roof and a wide double barn door with cross bracing in the middle.
```

### Trường làng

- **File:** `assets/buildings/village_school.png`  ·  **Kích thước file:** 288 x 176 px  ·  **Trong game:** chân đế 9 x 3 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/school.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 288 x 176 pixels (the picture must look like a 288 x 176 pixel sprite scaled up, every art pixel a clean square). A long low thatched village classroom with mud walls, a row of bamboo-barred windows, a plank door in the middle and a small hanging bronze bell.
```

### Đình làng

- **File:** `assets/buildings/dinh_lang.png`  ·  **Kích thước file:** 256 x 192 px  ·  **Trong game:** chân đế 8 x 4 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/ubnd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 256 x 192 pixels (the picture must look like a 256 x 192 pixel sprite scaled up, every art pixel a clean square). A large traditional Vietnamese communal house (đình làng): a huge dark tile roof with strongly curled-up corners, a ridge with a pearl and two small dragons, an open front hall of red-brown wooden columns on a stone floor with steps, a dim altar with candles inside.
```

### Nhà lưu niệm Võ Nguyên Giáp (Lệ Thủy)

- **File:** `assets/buildings/memorial_house.png`  ·  **Kích thước file:** 160 x 128 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/memorial_house.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 128 pixels (the picture must look like a 160 x 128 pixel sprite scaled up, every art pixel a clean square). A simple old traditional tiled family house in central Vietnam with a small courtyard wall, a memorial place.
```

### Ga Đồng Hới (ga tàu cũ)

- **File:** `assets/buildings/station.png`  ·  **Kích thước file:** 224 x 144 px  ·  **Trong game:** chân đế 7 x 4 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/station.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 224 x 144 pixels (the picture must look like a 224 x 144 pixel sprite scaled up, every art pixel a clean square). A small old colonial-era railway station building with a tiled roof, cream walls and a platform canopy, no signs.
```

### Quảng Bình Quan (cổng thành cổ)

- **File:** `assets/buildings/quang_binh_quan.png`  ·  **Kích thước file:** 320 x 320 px  ·  **Trong game:** chân đế 10 x 6, vòm cổng ở giữa đi xuyên được ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/quang_binh_quan.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). An old citadel gate tower of grey stone with a two-tier tiled pavilion roof on top and an arched gateway.
```

### Chùa

- **File:** `assets/buildings/pagoda.png`  ·  **Kích thước file:** 256 x 224 px  ·  **Trong game:** chân đế 7 x 5 ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/pagoda.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 128 pixels (the picture must look like a 128 x 128 pixel sprite scaled up, every art pixel a clean square). A small Vietnamese Buddhist pagoda with a curved double tile roof, red pillars and incense in front.
```

### Cổng tam quan chùa

- **File:** `assets/buildings/pagoda_gate.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 2 ô
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trước
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/pagoda_gate.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A Vietnamese three-entrance temple gate (tam quan) with small tiled roofs over each opening, walk-through.
```

### Bến phà (mái lá)

- **File:** `assets/buildings/ferry_shelter.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/ferry_shelter.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A small open river ferry shelter: a palm-leaf roof on four wooden posts with a bench.
```

### Chòi ngắm cảnh

- **File:** `assets/buildings/lookout.png`  ·  **Kích thước file:** 80 x 80 px  ·  **Trong game:** chân đế 3 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/lookout.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 80 x 80 pixels (the picture must look like a 80 x 80 pixel sprite scaled up, every art pixel a clean square). A small wooden lookout platform with a thatched roof.
```

### Đài tưởng niệm

- **File:** `assets/buildings/memorial.png`  ·  **Kích thước file:** 128 x 256 px  ·  **Trong game:** chân đế 4 x 3 ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/memorial.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 192 pixels (the picture must look like a 96 x 192 pixel sprite scaled up, every art pixel a clean square). A simple stone memorial stele on a stepped base with an incense bowl.
```

### Sạp nón lá

- **File:** `assets/buildings/hat_stall.png`  ·  **Kích thước file:** 96 x 80 px  ·  **Trong game:** chân đế 3 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/hat_stall.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 80 pixels (the picture must look like a 96 x 80 pixel sprite scaled up, every art pixel a clean square). A small bamboo stall displaying stacked conical palm-leaf hats.
```

### Sạp rau

- **File:** `assets/buildings/stall_veg.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/stall_veg.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A small wooden market stall with a cloth awning and baskets of green vegetables.
```

### Sạp gạo

- **File:** `assets/buildings/stall_rice.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/stall_rice.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A small wooden market stall with a cloth awning and sacks and baskets of rice.
```

### Chợ ô dù: trái cây

- **File:** `assets/buildings/umbrella_fruit.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/umbrella_fruit.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A market spot under a big faded canvas umbrella with round flat baskets of tropical fruit on the ground.
```

### Chợ ô dù: rau

- **File:** `assets/buildings/umbrella_veg.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/umbrella_veg.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A market spot under a big faded canvas umbrella with baskets of vegetables on the ground.
```

### Chợ ô dù: cá

- **File:** `assets/buildings/umbrella_fish.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/umbrella_fish.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A market spot under a big faded canvas umbrella with flat baskets of fresh fish on the ground.
```

### Chợ ô dù: hoa

- **File:** `assets/buildings/umbrella_flower.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** chân đế 3 x 3 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/umbrella_flower.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A market spot under a big faded canvas umbrella with buckets of flowers on the ground.
```

### Ngọ Môn (Huế)

- **File:** `assets/buildings/ngo_mon.png`  ·  **Kích thước file:** 512 x 320 px  ·  **Trong game:** chân đế 16 x 10, vòm giữa đi xuyên được ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trước, lối qua cổng chạy dọc
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/ngo_mon.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 256 x 160 pixels (the picture must look like a 256 x 160 pixel sprite scaled up, every art pixel a clean square). An imperial citadel gate: a massive U-shaped stone base with arched gateways and a two-storey wooden pavilion with yellow-tiled roofs on top.
```

### Điện trong Đại Nội

- **File:** `assets/buildings/royal_hall.png`  ·  **Kích thước file:** 320 x 384 px  ·  **Trong game:** chân đế 10 x 5 ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/royal_hall.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 224 x 128 pixels (the picture must look like a 224 x 128 pixel sprite scaled up, every art pixel a clean square). An imperial throne hall with a double yellow glazed tile roof, red lacquered columns and stone steps.
```

### Lăng vua

- **File:** `assets/buildings/royal_tomb.png`  ·  **Kích thước file:** 256 x 384 px  ·  **Trong game:** chân đế 8 x 6 ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/royal_tomb.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 192 x 160 pixels (the picture must look like a 192 x 160 pixel sprite scaled up, every art pixel a clean square). An old imperial tomb: a stone courtyard with stone guardian statues, a stele pavilion and a weathered gate.
```

### Tháp chùa Thiên Mụ

- **File:** `assets/buildings/thien_mu.png`  ·  **Kích thước file:** 128 x 384 px  ·  **Trong game:** chân đế 3 x 3 ô (công trình lớn, to hơn nhà dân)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/thien_mu.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 224 pixels (the picture must look like a 64 x 224 pixel sprite scaled up, every art pixel a clean square). A tall slim seven-tiered octagonal pagoda tower in light ochre with small roofs on each tier.
```

### Cầu Trường Tiền (nhìn từ trên)

- **File:** `assets/buildings/truong_tien.png`  ·  **Kích thước file:** 160 x 224 px  ·  **Trong game:** chân đế 5 x 7 ô
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/truong_tien.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 224 pixels (the picture must look like a 160 x 224 pixel sprite scaled up, every art pixel a clean square). A steel truss bridge with several curved arches, seen from above and slightly from the side, running from top to bottom of the image.
```

### Cầu dây văng Nhật Lệ

- **File:** `assets/buildings/cable_bridge.png`  ·  **Kích thước file:** 320 x 144 px  ·  **Trong game:** chân đế 10 x 4 ô
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy ngang
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/cable_bridge.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 320 x 144 pixels (the picture must look like a 320 x 144 pixel sprite scaled up, every art pixel a clean square). A road bridge seen from above running left to right with two tall towers and fans of cables.
```

### Cầu bắc qua sông

- **File:** `assets/buildings/river_bridge.png`  ·  **Kích thước file:** 96 x 224 px  ·  **Trong game:** chân đế 3 x 7 ô
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ nghiêng chéo: cần nhìn thẳng từ trên, cầu chạy dọc
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/river_bridge.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 224 pixels (the picture must look like a 96 x 224 pixel sprite scaled up, every art pixel a clean square). A simple old concrete road bridge seen from above running from top to bottom, low railings on both sides.
```

### Động Phong Nha (cửa động)

- **File:** `assets/landmarks/phong_nha_cave.png`  ·  **Kích thước file:** 256 x 192 px  ·  **Trong game:** chân đế 8 x 6 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/phong_nha_cave.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 256 x 192 pixels (the picture must look like a 256 x 192 pixel sprite scaled up, every art pixel a clean square). A huge limestone cliff with a dark cave mouth at its foot where a river flows out, hanging plants on the rock.
```

### Động Thiên Đường (cửa động)

- **File:** `assets/landmarks/paradise_cave.png`  ·  **Kích thước file:** 160 x 192 px  ·  **Trong game:** chân đế 5 x 6 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/paradise_cave.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 192 pixels (the picture must look like a 160 x 192 pixel sprite scaled up, every art pixel a clean square). A limestone cliff with a cave entrance reached by wooden stairs.
```

### Núi đá vôi 1

- **File:** `assets/landmarks/karst_a.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** chân đế 4 x 6 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/karst_a.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 192 pixels (the picture must look like a 128 x 192 pixel sprite scaled up, every art pixel a clean square). A tall jagged grey limestone karst peak covered with patches of green jungle.
```

### Núi đá vôi 2

- **File:** `assets/landmarks/karst_b.png`  ·  **Kích thước file:** 128 x 192 px  ·  **Trong game:** chân đế 4 x 6 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/karst_b.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 192 pixels (the picture must look like a 128 x 192 pixel sprite scaled up, every art pixel a clean square). A rounded grey limestone karst peak with green jungle on its ledges.
```

### Núi (Thần Đinh / Ngự Bình)

- **File:** `assets/landmarks/mountain.png`  ·  **Kích thước file:** 256 x 192 px  ·  **Trong game:** chân đế 8 x 6 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/mountain.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 256 x 192 pixels (the picture must look like a 256 x 192 pixel sprite scaled up, every art pixel a clean square). A small green forested mountain with rocky outcrops.
```

### Thác nước

- **File:** `assets/landmarks/waterfall.png`  ·  **Kích thước file:** 128 x 160 px  ·  **Trong game:** chân đế 4 x 5 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/waterfall.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 160 pixels (the picture must look like a 128 x 160 pixel sprite scaled up, every art pixel a clean square). A small waterfall falling over grey rocks into a pool, seen from the front.
```

### Suối nước nóng

- **File:** `assets/landmarks/hot_spring.png`  ·  **Kích thước file:** 128 x 96 px  ·  **Trong game:** chân đế 4 x 3 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/hot_spring.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one building, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 96 pixels (the picture must look like a 128 x 96 pixel sprite scaled up, every art pixel a clean square). A small natural hot spring pool surrounded by rocks with a little steam.
```


## 5. Vật trang trí và đồ đặt được

Không cần animation (trừ ghi chú).

### Đống rơm

- **File:** `assets/props/haystack.png`  ·  **Kích thước file:** 64 x 64 px  ·  **Trong game:** 2 x 2 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/haystack.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 64 pixels (the picture must look like a 64 x 64 pixel sprite scaled up, every art pixel a clean square). A round Vietnamese rice-straw haystack built around a central pole.
```

### Chum, vại

- **File:** `assets/props/jar.png`  ·  **Kích thước file:** 32 x 48 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/jar.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 48 pixels (the picture must look like a 32 x 48 pixel sprite scaled up, every art pixel a clean square). A big brown glazed clay water jar.
```

### Bàn trà trong sân

- **File:** `assets/props/tea_table.png`  ·  **Kích thước file:** 64 x 48 px  ·  **Trong game:** 2 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/furniture/tea_table.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 48 pixels (the picture must look like a 64 x 48 pixel sprite scaled up, every art pixel a clean square). A low bamboo table with a small teapot and two cups, and two little bamboo stools on its left and right.
```

### Chuồng gà

- **File:** `assets/props/chicken_coop.png`  ·  **Kích thước file:** 64 x 56 px  ·  **Trong game:** 2 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/furniture/chicken_coop.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 56 pixels (the picture must look like a 64 x 56 pixel sprite scaled up, every art pixel a clean square). A small bamboo-slat chicken coop with a thatched lid and a little door.
```

### Chiếu (trải ra để ngủ)

- **File:** `assets/props/sleeping_mat.png`  ·  **Kích thước file:** 32 x 56 px  ·  **Trong game:** 1 x 2 ô (nằm phẳng)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/furniture/sleeping_mat.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 56 pixels (the picture must look like a 32 x 56 pixel sprite scaled up, every art pixel a clean square). A woven sedge sleeping mat (chiếu cói) lying flat, seen from above, with a red and a green woven band and a small white pillow at the top.
```

### Bàn thợ mộc

- **File:** `assets/props/carpenter_bench.png`  ·  **Kích thước file:** 48 x 56 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/furniture/carpenter_bench.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 48 x 56 pixels (the picture must look like a 48 x 56 pixel sprite scaled up, every art pixel a clean square). A wooden carpenter's workbench with a vice and a rack of hand tools.
```

### Thùng bán hàng

- **File:** `assets/props/shipping_bin.png`  ·  **Kích thước file:** 64 x 48 px  ·  **Trong game:** 2 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/shipping_bin.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 48 pixels (the picture must look like a 64 x 48 pixel sprite scaled up, every art pixel a clean square). A wooden crate bin with a hinged lid for selling farm produce.
```

### Cột đèn dầu

- **File:** `assets/props/oil_lamp_post.png`  ·  **Kích thước file:** 32 x 80 px  ·  **Trong game:** 1 x 1 ô (cao 2,5 ô)
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/street_lamp.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 80 pixels (the picture must look like a 32 x 80 pixel sprite scaled up, every art pixel a clean square). A wooden post with a crossbar and a small hanging glass oil lantern.
```

### Ghế đá

- **File:** `assets/props/stone_bench.png`  ·  **Kích thước file:** 64 x 32 px  ·  **Trong game:** 2 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/bench.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 32 pixels (the picture must look like a 64 x 32 pixel sprite scaled up, every art pixel a clean square). A simple grey stone bench.
```

### Biển chỉ đường

- **File:** `assets/props/signpost.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** 1 x 2 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/signpost.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 64 pixels (the picture must look like a 32 x 64 pixel sprite scaled up, every art pixel a clean square). A wooden signpost with two blank arrow boards.
```

### Cái cày

- **File:** `assets/props/plough.png`  ·  **Kích thước file:** 48 x 32 px  ·  **Trong game:** dùng khi trâu cày ruộng
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/plough.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 48 x 32 pixels (the picture must look like a 48 x 32 pixel sprite scaled up, every art pixel a clean square). A traditional wooden Vietnamese plough with an iron share, side view, the shaft pointing up to the right.
```

### Đòn gánh hàng rong

- **File:** `assets/props/ganh.png`  ·  **Kích thước file:** 80 x 44 px  ·  **Trong game:** vắt trên vai người bán rong
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/ganh.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 80 x 44 pixels (the picture must look like a 80 x 44 pixel sprite scaled up, every art pixel a clean square). A bamboo shoulder pole with a round flat basket hanging from each end, one with rice balls and one with greens.
```

### Trâu nằm (trang trí)

- **File:** `assets/props/buffalo_resting.png`  ·  **Kích thước file:** 64 x 48 px  ·  **Trong game:** 2 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/props/buffalo.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 48 pixels (the picture must look like a 64 x 48 pixel sprite scaled up, every art pixel a clean square). A dark grey water buffalo lying down resting, side view.
```

### Thuyền nan (thuyền thúng tròn)

- **File:** `assets/props/basket_boat.png`  ·  **Kích thước file:** 64 x 48 px  ·  **Trong game:** trên mặt nước
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không (game tự cho trôi, nhấp nhô)
- **Thay cho (hiện tại):** `public/assets/sprites/props/basket_boat.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one boat, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 48 pixels (the picture must look like a 64 x 48 pixel sprite scaled up, every art pixel a clean square). A round woven bamboo basket boat floating, seen from above at an angle. Draw no water, only the boat.
```

### Thuyền tam bản

- **File:** `assets/props/sampan.png`  ·  **Kích thước file:** 96 x 48 px  ·  **Trong game:** trên mặt nước
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không (game tự cho trôi, nhấp nhô)
- **Thay cho (hiện tại):** `public/assets/sprites/props/sampan.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one boat, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 48 pixels (the picture must look like a 96 x 48 pixel sprite scaled up, every art pixel a clean square). A small wooden river sampan with a curved woven bamboo canopy, side view, seen from above at an angle. Draw no water, only the boat.
```

### Thuyền rồng

- **File:** `assets/props/dragon_boat.png`  ·  **Kích thước file:** 128 x 64 px  ·  **Trong game:** trên mặt nước
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không (game tự cho trôi, nhấp nhô)
- **Thay cho (hiện tại):** `public/assets/sprites/props/dragon_boat.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one boat, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 64 pixels (the picture must look like a 128 x 64 pixel sprite scaled up, every art pixel a clean square). A Huế dragon boat with a carved golden dragon head at the bow, side view. Draw no water, only the boat.
```

### Thuyền đua

- **File:** `assets/props/race_boat.png`  ·  **Kích thước file:** 192 x 48 px  ·  **Trong game:** trên mặt nước
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không (game tự cho trôi, nhấp nhô)
- **Thay cho (hiện tại):** `public/assets/sprites/props/race_boat.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one boat, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 192 x 48 pixels (the picture must look like a 192 x 48 pixel sprite scaled up, every art pixel a clean square). A long narrow wooden racing boat, side view, no people. Draw no water, only the boat.
```


## 6. Cây

Mỗi cây 96 x 128 px (trong game 3 x 4 ô; gốc cây ở giữa đáy ảnh, khoảng 8 px trên mép dưới). Không cần animation (game tự cho cây mờ đi khi người chơi đi sau tán).

### Cây tán tròn 1 (chặt được)

- **File:** `assets/trees/broadleaf_0.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/oak_0.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A round leafy tropical shade tree with a thick brown trunk. The trunk base stands at the middle of the bottom edge.
```

### Cây tán tròn 2 (có quả)

- **File:** `assets/trees/broadleaf_1.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/oak_1.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A round leafy tropical tree with a few small orange fruits. The trunk base stands at the middle of the bottom edge.
```

### Bụi tre

- **File:** `assets/trees/bamboo.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/bamboo.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A dense clump of tall green bamboo stems with feathery leaves. The trunk base stands at the middle of the bottom edge.
```

### Cây chuối

- **File:** `assets/trees/banana.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/banana.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A banana plant with big ragged green leaves and a hanging bunch of green bananas. The trunk base stands at the middle of the bottom edge.
```

### Cây cau

- **File:** `assets/trees/areca.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/areca.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A tall slender areca palm with a thin ringed trunk and a small crown of fronds. The trunk base stands at the middle of the bottom edge.
```

### Cây dừa

- **File:** `assets/trees/coconut.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/coconut.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A coconut palm with a slightly curved trunk, drooping fronds and coconuts. The trunk base stands at the middle of the bottom edge.
```

### Cây phi lao

- **File:** `assets/trees/casuarina.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/casuarina.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A coastal casuarina tree with fine needle-like drooping foliage. The trunk base stands at the middle of the bottom edge.
```

### Cây thông

- **File:** `assets/trees/pine.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/pine.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A tall mountain pine tree. The trunk base stands at the middle of the bottom edge.
```

### Cây đước (rừng ngập mặn)

- **File:** `assets/trees/mangrove.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/mangrove.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A mangrove tree standing on tangled arching roots. The trunk base stands at the middle of the bottom edge.
```

### Cây bưởi (vườn Huế)

- **File:** `assets/trees/pomelo.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/pomelo.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A pomelo fruit tree with glossy leaves and big round green-yellow pomelos. The trunk base stands at the middle of the bottom edge.
```

### Cây phượng (Huế)

- **File:** `assets/trees/flame.png`  ·  **Kích thước file:** 96 x 128 px  ·  **Trong game:** 3 x 4 ô (gốc 1 ô)
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/trees/flame.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one tree, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 128 pixels (the picture must look like a 96 x 128 pixel sprite scaled up, every art pixel a clean square). A flame tree (royal poinciana) with a wide crown of red flowers. The trunk base stands at the middle of the bottom edge.
```


## 7. Cây trồng (5 giai đoạn)

Mỗi cây trồng là **1 dải 5 khung 32 x 64 px** (trong game 1 ô, cây cao lấn lên ô trên): gieo hạt → mầm → cây non → cây lớn → chín.

### Củ cải trắng

- **File:** `assets/crops/parsnip.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/parsnip.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a white radish plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Khoai tây

- **File:** `assets/crops/potato.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/potato.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a potato plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Súp lơ

- **File:** `assets/crops/cauliflower.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/cauliflower.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a cauliflower plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Dâu tây

- **File:** `assets/crops/strawberry.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/strawberry.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a strawberry plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Đậu que

- **File:** `assets/crops/green_bean.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/green_bean.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a green bean plant climbing a bamboo stake: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Lúa

- **File:** `assets/crops/rice.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** 5 giai đoạn lớn (không phải chuyển động)
- **Thay cho (hiện tại):** `public/assets/sprites/crops/rice.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a rice plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```


## 8. Ma (chế độ kinh dị ban đêm)

### Bóng ma

- **File:** `assets/horror/ghost.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** 1 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (game cho trôi, mờ dần)
- **Thay cho (hiện tại):** `public/assets/sprites/horror/ghost.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one figure, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 64 pixels (the picture must look like a 32 x 64 pixel sprite scaled up, every art pixel a clean square). A pale Vietnamese female ghost with long black hair covering her face, a white tattered gown, floating with no feet.
```

### Bóng đen

- **File:** `assets/horror/shadow.png`  ·  **Kích thước file:** 32 x 64 px  ·  **Trong game:** 1 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/horror/shadow.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one figure, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 64 pixels (the picture must look like a 32 x 64 pixel sprite scaled up, every art pixel a clean square). A tall dark shadowy humanoid figure with faint glowing eyes.
```

### Bàn tay ma

- **File:** `assets/horror/hand.png`  ·  **Kích thước file:** 24 x 36 px  ·  **Trong game:** 1 x 2 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (game cho trồi lên)
- **Thay cho (hiện tại):** `public/assets/sprites/horror/hand.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one figure, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 24 x 36 pixels (the picture must look like a 24 x 36 pixel sprite scaled up, every art pixel a clean square). A thin pale ghostly hand reaching up out of the ground.
```

### Mặt ma (hù doạ toàn màn hình)

- **File:** `assets/horror/face.png`  ·  **Kích thước file:** 128 x 128 px  ·  **Trong game:** hiện to giữa màn hình
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/sprites/horror/face.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one figure, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 128 pixels (the picture must look like a 128 x 128 pixel sprite scaled up, every art pixel a clean square). A frightening close-up of a pale ghost woman's face with hollow dark eyes and long wet black hair, front view.
```


## 9. Ô mặt đất (tile 32 x 32 px, ghép liền)

Mỗi tile là **1 ảnh vuông 32 x 32 px, phủ kín, ghép liền 4 phía**. Các viền (mép nước có bờ, mép đường, kè đá) game sẽ **tự ghép bằng code** từ tile gốc + dải viền ở mục 9b, không cần vẽ đủ 16 kiểu viền.

### Cỏ

- **File:** `assets/tiles/grass.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Lush bright green grass with small darker tufts.
```

### Cỏ (biến thể)

- **File:** `assets/tiles/grass2.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Short green grass with a few small clover leaves.
```

### Cỏ có hoa dại

- **File:** `assets/tiles/flowers.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Short green grass with a few tiny white, yellow and lilac wild flowers.
```

### Cỏ ruộng bỏ hoang (thửa ruộng chưa cuốc)

- **File:** `assets/tiles/grass3.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Rough tufty field grass, slightly longer and yellower.
```

### Đường đất

- **File:** `assets/tiles/path.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A packed sandy orange-brown dirt path with a few small pebbles.
```

### Đất nện / sân / bờ ruộng

- **File:** `assets/tiles/dirt.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Bare beaten warm orange-brown earth.
```

### Đất đã cuốc

- **File:** `assets/tiles/soil.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Freshly hoed dark brown soil in neat furrows.
```

### Ruộng ngập nước (bùn)

- **File:** `assets/tiles/paddy.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A flooded rice paddy: muddy brown water with a sheen.
```

### Nước sông / ao

- **File:** `assets/tiles/water.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (có thể thêm 2–3 khung sóng sau)
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Bright turquoise-blue river water with small white-blue ripple highlights.
```

### Nước sâu

- **File:** `assets/tiles/deep_water.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Deeper, darker blue river water with a few ripples.
```

### Biển

- **File:** `assets/tiles/sea.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (có thể thêm 2–3 khung sóng sau)
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Bright blue-green sea water.
```

### Biển sâu

- **File:** `assets/tiles/sea_deep.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Deep dark blue sea water.
```

### Sóng vỗ bờ (biển gặp cát, cát ở bên trái)

- **File:** `assets/tiles/surf.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không (có thể thêm 2–3 khung sóng sau)
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). White foamy surf where the sea meets the sand; sand on the left side, sea on the right, the foam line vertical (this one tiles only top to bottom).
```

### Cát

- **File:** `assets/tiles/sand.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Pale golden beach sand.
```

### Cát có vỏ sò

- **File:** `assets/tiles/sand2.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Pale golden beach sand with a few tiny shells.
```

### Đường / sân đá cuội (sân đình, Đại Nội, bến chợ)

- **File:** `assets/tiles/paving.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Grey rounded cobblestones of slightly different sizes set in dark joints, like an old market square.
```

### Tường thành gạch (Huế)

- **File:** `assets/tiles/citadel_wall.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). The top of an old red-brown brick citadel wall.
```

### Hồ sen

- **File:** `assets/tiles/lotus.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A lotus pond: dark water with round green lotus leaves and a pink flower.
```

### Ván cầu gỗ

- **File:** `assets/tiles/bridge_planks.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Weathered wooden bridge planks running left to right.
```

### Đầm lầy

- **File:** `assets/tiles/marsh.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Dark wet marsh mud with puddles.
```

### Đất đá sỏi

- **File:** `assets/tiles/rocky.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Grey rocky ground with gravel.
```

### Cỏ khô

- **File:** `assets/tiles/dry_grass.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png (1 ô trong tileset)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Dry yellowed grass.
```


## 9b. Dải viền và lớp phủ trên mặt đất

**Lớp phủ** (đá, bụi cỏ, lúa…) nằm **trên** tile mặt đất: vẽ trên nền trắng (sẽ đổi trong suốt). **Dải viền**: vẽ 1 ô 32 x 32 có viền ở **cạnh trên**, code sẽ xoay cho các cạnh còn lại.

### Bờ nước (viền cỏ/đất ở cạnh trên của ô nước)

- **File:** `assets/tiles/edge_water_bank.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A 32 x 32 tile of calm blue water whose top edge is a natural grassy earth bank, the bank only along the top 6 pixels; the left, right and bottom sides must tile with plain water.
```

### Kè đá (bờ sông có kè trong phố)

- **File:** `assets/tiles/edge_quay.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A 32 x 32 tile of turquoise river water whose top edge is a grey stone-block embankment wall with a lighter top coping, only along the top 8 pixels; the other sides tile with plain water.
```

### Mép đường đất

- **File:** `assets/tiles/edge_path.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A 32 x 32 tile of a dirt path whose top edge fades into a ragged strip of grass, only along the top 5 pixels; the other sides tile with plain dirt path.
```

### Hòn đá

- **File:** `assets/tiles/rock.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A grey boulder.
```

### Bụi cỏ

- **File:** `assets/tiles/bush.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small round green shrub.
```

### Lau sậy

- **File:** `assets/tiles/reeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A clump of reeds.
```

### Luống hoa

- **File:** `assets/tiles/flowerbed.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small round bed of red and yellow flowers.
```

### Lúa chín (trên ruộng)

- **File:** `assets/tiles/rice_ripe.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A dense patch of ripe golden rice stalks filling the square (meant to sit on a paddy tile).
```

### Lúa non / mạ (game cũng tô xanh lúa chín được, nhưng có hình riêng thì đẹp hơn)

- **File:** `assets/tiles/rice_young.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: game chưa có ô lúa non riêng
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A dense patch of young bright green rice seedlings filling the square.
```

### Gốc rạ (sau khi gặt)

- **File:** `assets/tiles/stubble.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** 🔁 có ảnh, cần vẽ lại: vẽ thành cả thửa ruộng: cần 1 ô gốc rạ phủ kín
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/farm_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Short cut rice stubble rows on bare earth filling the square.
```


## 9c. Ô hầm mỏ (32 x 32 px)

### Nền hang

- **File:** `assets/tiles/mine_floor.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A cave floor of dark grey-brown rock with small pebbles.
```

### Vách đá hang

- **File:** `assets/tiles/mine_wall.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A wall of stacked rough dark cave stones seen from above, lit top edges.
```

### Mạch quặng đồng

- **File:** `assets/tiles/mine_ore_copper.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). The same dark stone wall with glinting orange-brown copper ore crystals in it.
```

### Mạch quặng sắt

- **File:** `assets/tiles/mine_ore_iron.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). The same dark stone wall with silvery grey iron ore crystals in it.
```

### Mạch quặng vàng

- **File:** `assets/tiles/mine_ore_gold.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). The same dark stone wall with shiny gold ore crystals in it.
```

### Thang xuống tầng dưới

- **File:** `assets/tiles/mine_ladder.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `public/assets/tilesets/mine_tiles_hd.png`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw a seamless, tileable square ground texture that fills the whole image edge to edge, with no border, no frame, no objects and no perspective, seen straight from above, so it repeats in every direction without visible seams. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A dark square shaft in a rocky cave floor with a wooden ladder going down.
```


## 10. Biểu tượng vật phẩm (túi đồ, thanh công cụ)

Hiện đang vẽ bằng code ở `src/ui/itemIcons.ts` (16 x 16). Ảnh mới: **32 x 32 px**, đồ vật nằm giữa, nền trắng (sẽ đổi trong suốt). Hiện trong ô 40 x 40 px của thanh công cụ.

### Cuốc (`hoe`)

- **File:** `assets/icons/hoe.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a farmer's hoe with a wooden handle and an iron blade, filling most of the square.
```

### Bình tưới (`watering_can`)

- **File:** `assets/icons/watering_can.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a metal watering can, filling most of the square.
```

### Rìu (`axe`)

- **File:** `assets/icons/axe.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a woodcutter's axe, filling most of the square.
```

### Cuốc chim (`pickaxe`)

- **File:** `assets/icons/pickaxe.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a pickaxe, filling most of the square.
```

### Liềm (`scythe`)

- **File:** `assets/icons/scythe.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a curved rice sickle, filling most of the square.
```

### Cần câu (`fishing_rod`)

- **File:** `assets/icons/fishing_rod.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a bamboo fishing rod with a line, filling most of the square.
```

### Kiếm (`sword`)

- **File:** `assets/icons/sword.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a simple old sword, filling most of the square.
```

### Quặng đồng (`copper_ore`)

- **File:** `assets/icons/copper_ore.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a lump of copper ore, filling most of the square.
```

### Quặng sắt (`iron_ore`)

- **File:** `assets/icons/iron_ore.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a lump of iron ore, filling most of the square.
```

### Quặng vàng (`gold_ore`)

- **File:** `assets/icons/gold_ore.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a lump of gold ore, filling most of the square.
```

### Hạt củ cải trắng (`parsnip_seeds`)

- **File:** `assets/icons/parsnip_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a white radish, filling most of the square.
```

### Củ cải trắng (`parsnip`)

- **File:** `assets/icons/parsnip.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a white radish, filling most of the square.
```

### Hạt khoai tây (`potato_seeds`)

- **File:** `assets/icons/potato_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a potato, filling most of the square.
```

### Khoai tây (`potato`)

- **File:** `assets/icons/potato.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a potato, filling most of the square.
```

### Hạt súp lơ (`cauliflower_seeds`)

- **File:** `assets/icons/cauliflower_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a cauliflower, filling most of the square.
```

### Súp lơ (`cauliflower`)

- **File:** `assets/icons/cauliflower.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cauliflower, filling most of the square.
```

### Hạt dâu tây (`strawberry_seeds`)

- **File:** `assets/icons/strawberry_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a strawberry, filling most of the square.
```

### Dâu tây (`strawberry`)

- **File:** `assets/icons/strawberry.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a strawberry, filling most of the square.
```

### Hạt đậu que (`green_bean_seeds`)

- **File:** `assets/icons/green_bean_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a few green beans, filling most of the square.
```

### Đậu que (`green_bean`)

- **File:** `assets/icons/green_bean.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a few green beans, filling most of the square.
```

### Gỗ (`wood`)

- **File:** `assets/icons/wood.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small bundle of firewood logs, filling most of the square.
```

### Đá (`stone`)

- **File:** `assets/icons/stone.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a grey stone, filling most of the square.
```

### Sợi (`fiber`)

- **File:** `assets/icons/fiber.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a bundle of plant fibre, filling most of the square.
```

### Cá chép nhỏ (`carp`)

- **File:** `assets/icons/carp.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small carp fish, side view, filling most of the square.
```

### Cá rô (`perch`)

- **File:** `assets/icons/perch.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a climbing perch fish, side view, filling most of the square.
```

### Cá trắm (`grass_carp`)

- **File:** `assets/icons/grass_carp.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a grass carp fish, side view, filling most of the square.
```

### Cá chạch vàng (`golden_loach`)

- **File:** `assets/icons/golden_loach.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a golden loach fish, side view, filling most of the square.
```

### Rương (`chest`)

- **File:** `assets/icons/chest.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a wooden storage chest, filling most of the square.
```

### Bù nhìn (`scarecrow`)

- **File:** `assets/icons/scarecrow.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a straw scarecrow with a conical hat, filling most of the square.
```

### Vòi tưới tự động (`sprinkler`)

- **File:** `assets/icons/sprinkler.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small farm water sprinkler, filling most of the square.
```

### Chuồng gà (`chicken_coop`)

- **File:** `assets/icons/chicken_coop.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small bamboo chicken coop, filling most of the square.
```

### Trứng gà (`egg`)

- **File:** `assets/icons/egg.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a brown chicken egg, filling most of the square.
```

### Cơm nắm muối vừng (`com_nam`)

- **File:** `assets/icons/com_nam.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a Vietnamese rice ball wrapped in a banana leaf with sesame salt, filling most of the square.
```

### Bánh mì (`banh_mi`)

- **File:** `assets/icons/banh_mi.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a crusty Vietnamese baguette sandwich, filling most of the square.
```

### Cà phê sữa đá (`ca_phe_sua_da`)

- **File:** `assets/icons/ca_phe_sua_da.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a glass of Vietnamese iced milk coffee with a little metal phin filter, filling most of the square.
```

### Lúa giống (`rice_seeds`)

- **File:** `assets/icons/rice_seeds.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small paper seed packet with a picture of a sheaf of ripe golden rice, filling most of the square.
```

### Lúa (`rice`)

- **File:** `assets/icons/rice.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a sheaf of ripe golden rice, filling most of the square.
```

### Xe bò (`ox_cart`)

- **File:** `assets/icons/ox_cart.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small icon of an ox cart, filling most of the square.
```

### Xe máy (`motorbike`)

- **File:** `assets/icons/motorbike.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small icon of an old motorbike, filling most of the square.
```

### Máy cày (`tractor`)

- **File:** `assets/icons/tractor.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small icon of a small tractor, filling most of the square.
```

### Máy gặt lúa (`harvester`)

- **File:** `assets/icons/harvester.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small icon of a small rice harvester, filling most of the square.
```

### Máy tưới nước (`water_truck`)

- **File:** `assets/icons/water_truck.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small icon of a water pump cart, filling most of the square.
```

### Gạo (`gao`)

- **File:** `assets/icons/gao.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small cloth sack of white rice, filling most of the square.
```

### Ba lô vải (`backpack_cloth`)

- **File:** `assets/icons/backpack_cloth.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cloth backpack, filling most of the square.
```

### Ba lô lớn (`backpack_large`)

- **File:** `assets/icons/backpack_large.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a large leather-strapped backpack, filling most of the square.
```

### Bàn thợ mộc (`carpenter_bench`)

- **File:** `assets/icons/carpenter_bench.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a carpenter's workbench, filling most of the square.
```

### Chiếu (`sleeping_mat`)

- **File:** `assets/icons/sleeping_mat.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a rolled-up sedge sleeping mat, filling most of the square.
```

### Giun (mồi câu) (`worm`)

- **File:** `assets/icons/worm.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a pink earthworm, filling most of the square.
```

### Cá giống (`fish_fry`)

- **File:** `assets/icons/fish_fry.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a small clear bag of water with tiny fish, filling most of the square.
```

### Cây roi (`whip`)

- **File:** `assets/icons/whip.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a herder's bamboo whip, filling most of the square.
```

### Gà con (`animal_chicken`)

- **File:** `assets/icons/animal_chicken.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cute young chick, filling most of the square.
```

### Heo con (`animal_pig`)

- **File:** `assets/icons/animal_pig.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cute young piglet, filling most of the square.
```

### Nghé (trâu con) (`animal_buffalo`)

- **File:** `assets/icons/animal_buffalo.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cute young buffalo calf, filling most of the square.
```

### Bê (bò con) (`animal_cow`)

- **File:** `assets/icons/animal_cow.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a cute young calf, filling most of the square.
```

### Cá lóc (`snakehead`)

- **File:** `assets/icons/snakehead.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a snakehead fish, side view, filling most of the square.
```

### Cá diếc (`crucian`)

- **File:** `assets/icons/crucian.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a crucian carp fish, side view, filling most of the square.
```

### Cá trê (`catfish`)

- **File:** `assets/icons/catfish.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a catfish fish, side view, filling most of the square.
```

### Cá bống (`goby`)

- **File:** `assets/icons/goby.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a goby fish, side view, filling most of the square.
```

### Cá thu (`mackerel`)

- **File:** `assets/icons/mackerel.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a mackerel fish, side view, filling most of the square.
```

### Cá mú (`grouper`)

- **File:** `assets/icons/grouper.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a grouper fish, side view, filling most of the square.
```

### Cá cơm (`anchovy`)

- **File:** `assets/icons/anchovy.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a anchovy fish, side view, filling most of the square.
```

### Bùa khai đạo (`bua_khai_dao`)

- **File:** `assets/icons/bua_khai_dao.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of a yellow paper talisman with red brush marks, filling most of the square.
```

### Sách cổ: Khai nhãn (`sach_co`)

- **File:** `assets/icons/sach_co.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** ô 40 x 40 px trên thanh công cụ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code: src/ui/itemIcons.ts`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An inventory icon of an old stitched book with yellowed pages, filling most of the square.
```


## 11. Giao diện (UI)

Hiện đều vẽ bằng code (khung gỗ, nút, ô…). Khung và nút sẽ dùng kiểu **9-slice** (co giãn được), nên **viền đều 4 phía, giữa trơn**.

### Khung bảng gỗ (bảng túi đồ, cửa hàng, hộp thoại…)

- **File:** `assets/ui/panel_wood.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** co giãn theo bảng
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A UI panel frame: a dark wooden border 12 pixels thick with small corner pegs around a light parchment-coloured inside; the inside is plain and flat so the panel can be stretched (9-slice).
```

### Nút bấm

- **File:** `assets/ui/button.png`  ·  **Kích thước file:** 96 x 32 px  ·  **Trong game:** co giãn theo chữ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 32 pixels (the picture must look like a 96 x 32 pixel sprite scaled up, every art pixel a clean square). A UI button: a brown wooden plank with a darker 2-pixel border and a light top edge, plain middle for a label, no text.
```

### Nút bấm (đang rê chuột)

- **File:** `assets/ui/button_hover.png`  ·  **Kích thước file:** 96 x 32 px  ·  **Trong game:** co giãn theo chữ
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 32 pixels (the picture must look like a 96 x 32 pixel sprite scaled up, every art pixel a clean square). The same wooden UI button but lighter and warmer, as when hovered, no text.
```

### Ô vật phẩm (thanh công cụ, túi đồ)

- **File:** `assets/ui/slot.png`  ·  **Kích thước file:** 40 x 40 px  ·  **Trong game:** 40 x 40 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 40 x 40 pixels (the picture must look like a 40 x 40 pixel sprite scaled up, every art pixel a clean square). A square inventory slot: a recessed parchment square with a thin dark wooden border.
```

### Ô vật phẩm đang chọn

- **File:** `assets/ui/slot_selected.png`  ·  **Kích thước file:** 40 x 40 px  ·  **Trong game:** 40 x 40 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 40 x 40 pixels (the picture must look like a 40 x 40 pixel sprite scaled up, every art pixel a clean square). The same inventory slot with a bright red-orange highlight border.
```

### Đồng hồ ngày đêm

- **File:** `assets/ui/day_dial.png`  ·  **Kích thước file:** 48 x 48 px  ·  **Trong game:** 48 x 48 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 48 x 48 pixels (the picture must look like a 48 x 48 pixel sprite scaled up, every art pixel a clean square). A round day/night dial frame: a dark wooden ring with a hollow centre (the sky is drawn by the game), small notches.
```

### Khung thanh chỉ số

- **File:** `assets/ui/bar_frame.png`  ·  **Kích thước file:** 12 x 80 px  ·  **Trong game:** 12 x 80 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 12 x 80 pixels (the picture must look like a 12 x 80 pixel sprite scaled up, every art pixel a clean square). A slim vertical gauge frame: a dark wooden outline with an empty dark inside.
```

### Nút cảm ứng tròn (Dùng / Tương tác / Túi…)

- **File:** `assets/ui/touch_button.png`  ·  **Kích thước file:** 64 x 64 px  ·  **Trong game:** 64 x 64 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 64 pixels (the picture must look like a 64 x 64 pixel sprite scaled up, every art pixel a clean square). A round wooden touch-screen button with a raised rim, plain centre, no text.
```

### Cần điều khiển cảm ứng: đế

- **File:** `assets/ui/joystick_base.png`  ·  **Kích thước file:** 96 x 96 px  ·  **Trong game:** 96 x 96 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 96 pixels (the picture must look like a 96 x 96 pixel sprite scaled up, every art pixel a clean square). A round semi-flat joystick base: a light wooden ring with a darker inner circle.
```

### Cần điều khiển cảm ứng: núm

- **File:** `assets/ui/joystick_knob.png`  ·  **Kích thước file:** 40 x 40 px  ·  **Trong game:** 40 x 40 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 40 x 40 pixels (the picture must look like a 40 x 40 pixel sprite scaled up, every art pixel a clean square). A round wooden joystick knob with a light top.
```

### Khung bản đồ nhỏ

- **File:** `assets/ui/minimap_frame.png`  ·  **Kích thước file:** 112 x 112 px  ·  **Trong game:** 112 x 112 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 112 x 112 pixels (the picture must look like a 112 x 112 pixel sprite scaled up, every art pixel a clean square). A square wooden picture frame for a minimap, a hollow centre, a small plaque at the bottom with no text.
```

### Nút cài đặt (bánh răng)

- **File:** `assets/ui/gear.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 32 x 32 px
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one UI element, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A round wooden button with a small brass gear symbol.
```

### Nền màn hình tiêu đề

- **File:** `assets/ui/title_background.png`  ·  **Kích thước file:** 1280 x 720 px  ·  **Trong game:** phủ kín màn hình
- **Tình trạng:** ✅ đã có trong game
- **Animation:** không
- **Thay cho (hiện tại):** `vẽ bằng code (src/ui/*.ts)`
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 1280 x 720 pixels (the picture must look like a 1280 x 720 pixel sprite scaled up, every art pixel a clean square). a wide landscape illustration of a Vietnamese countryside at sunset: layered blue-violet mountains, terraced green rice fields, a small thatched house on the left and a bamboo clump on the right, a warm orange sky with a pale sun, leaving the centre calm for a title and buttons. Fill the whole image, no border, no text.
```


## 12. Asset mới gợi ý từ ảnh mẫu (game nên có)

Những thứ có trong `assets/reference.jpg` hợp với làng quê xưa của game. Sau khi có ảnh, mỗi thứ cần một chút code để dùng (ghi ở cột *Dùng cho*).

### Trâu kéo cày (người cày đi sau)

- **File:** `assets/animals/buffalo_plough.png`  ·  **Kích thước file:** 192 x 64 px  ·  **Trong game:** 2 khung, mỗi khung 96 x 64; trong game 3 x 2 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa có cảnh dân làng cày bằng trâu
- **Animation:** 2 khung đi
- **Dùng cho:** dân làng cày ruộng bằng trâu thay vì cuốc tay *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 192 x 64 pixels (the picture must look like a 192 x 64 pixel sprite scaled up, every art pixel a clean square). Sprite strip of a dark grey water buffalo pulling a wooden plough through a muddy paddy, a farmer in a conical hat walking behind holding the plough handle, side view facing right. 2 frames side by side, each 96 x 64 pixels (whole strip 192 x 64): frame 1 left legs forward, frame 2 right legs forward; same size and ground line in both. Plain pure white (#FFFFFF) background.
```

### Bó lúa (sau khi gặt)

- **File:** `assets/props/rice_sheaf.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** bó lúa xếp bên đường ruộng và trên vai người gánh (hiện dùng đống rơm thu nhỏ) *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small upright bundle of freshly cut golden rice stalks tied with straw.
```

### Thúng / rổ hàng của gánh hàng rong

- **File:** `assets/props/produce_baskets.png`  ·  **Kích thước file:** 64 x 32 px  ·  **Trong game:** 2 x 1 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** đặt xuống khi gánh hàng rong dừng trước nhà *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 32 pixels (the picture must look like a 64 x 32 pixel sprite scaled up, every art pixel a clean square). Two round flat woven bamboo baskets on the ground, one heaped with fruit and greens, one with small fish.
```

### Giàn phơi nón lá

- **File:** `assets/props/hat_drying_rack.png`  ·  **Kích thước file:** 96 x 64 px  ·  **Trong game:** 3 x 2 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** trang trí làng (làng nghề nón lá) *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 64 pixels (the picture must look like a 96 x 64 pixel sprite scaled up, every art pixel a clean square). A low bamboo rack with rows of unfinished pale conical palm-leaf hats laid out to dry, and a few stacked hats beside it.
```

### Lá nón phơi trên sân

- **File:** `assets/tiles/drying_leaves.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô (lớp phủ)
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** trang trí sân nhà làng nghề *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Pale green-white palm leaves spread flat on the ground to dry, filling the square.
```

### Đò ngang có mái (bến phà)

- **File:** `assets/props/ferry_boat.png`  ·  **Kích thước file:** 128 x 48 px  ·  **Trong game:** 4 x 1,5 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không (game cho trôi)
- **Dùng cho:** đò chở khách qua sông ở bến *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 128 x 48 pixels (the picture must look like a 128 x 48 pixel sprite scaled up, every art pixel a clean square). A wooden river ferry boat with a curved dark woven-bamboo roof in the middle, seen from above at an angle, no people. Draw no water, only the boat.
```

### Cầu tàu gỗ (bến thuyền)

- **File:** `assets/props/wooden_jetty.png`  ·  **Kích thước file:** 96 x 64 px  ·  **Trong game:** 3 x 2 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** bến đò, bến thuyền câu *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 96 x 64 pixels (the picture must look like a 96 x 64 pixel sprite scaled up, every art pixel a clean square). A short wooden jetty of weathered planks on posts sticking out from a riverbank, seen from above, no water drawn.
```

### Hàng rào tre thấp (vườn nhà)

- **File:** `assets/tiles/bamboo_fence.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô (nối liền ngang)
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** rào vườn nhà, rào ruộng *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A short section of low woven bamboo fence running left to right across the square, its ends touching the left and right edges so sections join seamlessly.
```

### Bụi hoa ven đường

- **File:** `assets/props/flower_bush.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** trang trí sân, ngõ *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small round bush with red and pink tropical flowers.
```

### Nhà vườn (nhà ngói trong vườn cây)

- **File:** `assets/buildings/garden_house.png`  ·  **Kích thước file:** 160 x 160 px  ·  **Trong game:** chân đế 5 x 4 ô
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** thêm một kiểu nhà cho làng *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 160 x 160 pixels (the picture must look like a 160 x 160 pixel sprite scaled up, every art pixel a clean square). A small single-storey Vietnamese garden house with a terracotta tile roof, ochre walls, a wooden door and shutters, a small porch.
```

### Chiếu tre / phên phơi lúa trên sân

- **File:** `assets/tiles/drying_rice.png`  ·  **Kích thước file:** 32 x 32 px  ·  **Trong game:** 1 x 1 ô (lớp phủ)
- **Tình trạng:** 🟡 có ảnh, chưa dùng: chưa đặt lên bản đồ
- **Animation:** không
- **Dùng cho:** nhà vừa gặt: lúa phơi trên sân *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw one small ground decoration seen from above, centered on a plain pure white (#FFFFFF) background, filling most of the square. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). Golden rice grains spread out thinly on a woven bamboo drying mat, filling the square.
```

**Có trong ảnh mẫu nhưng cố ý KHÔNG đưa vào** (trái với bối cảnh làng quê nghèo thời xưa đã chốt): UBND thị xã, bưu điện, trường THPT, dãy nhà phố hai tầng, sạp chợ / chợ ô dù đông đúc (game dùng gánh hàng rong thay chợ), cờ đỏ, biển hiệu có chữ, xe máy của dân, cầu bê tông lớn.


### Gốc cây sau khi chặt

- **File:** `assets/props/tree_stump.png`  ·  **Kích thước file:** 64 x 48 px  ·  **Trong game:** 1 x 1 ô (gốc), mọc lại thành cây sau 15 ngày
- **Tình trạng:** ⬜ còn thiếu
- **Animation:** không
- **Dùng cho:** chỗ cây vừa bị chặt (hiện để trống cỏ) *(asset mới, chưa có trong game)*
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one object, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 64 x 48 pixels (the picture must look like a 64 x 48 pixel sprite scaled up, every art pixel a clean square). A single freshly cut tree stump, low and wide, pale cut wood on top with growth rings, dark bark around, a few roots spreading on the ground and two small wood chips beside it. One object only, centred, standing at the bottom of the picture. Plain pure white (#FFFFFF) background, no ground shadow, no text.
```

## 13. Hiệu ứng: giữ vẽ bằng code (không cần ảnh)

Các hình rất nhỏ hoặc là hiệu ứng ánh sáng, vẽ bằng code đẹp và nhẹ hơn: hạt mưa, khói xe, giọt nước, vụn gỗ, đất văng khi cuốc, quầng **đèn dầu** buổi tối, **khói Khai nhãn**, viền tối khi hù doạ, màn đêm, bản đồ nhỏ và bản đồ thế giới (vẽ từ dữ liệu bản đồ). Ô vô hình dùng để chặn đường (`BLOCK`) và các ô đánh dấu cây (cây thật là hình ở mục 6) cũng không cần ảnh.


## 14. Hình cũ không còn dùng trên bản đồ hiện tại (KHÔNG cần vẽ)

Các hình này còn trong code (từ các tỉnh đã bỏ, hoặc đã thay), không xuất hiện ở bản đồ Quảng Bình / Huế hiện tại: `farmhouse`, `grocery_house`, `post_office`, `shophouse_0..5`, `stilt_house`, `beach_parasol`, `stall_fish`, `well`, `banyan`, `flag_tower`, `red_cliff`, `dragon_bridge`, `lady_buddha`, `marble_mountain`, `city_tower`, `hoian_house_a/b`, `japanese_bridge`, `lantern_boat`, `cham_tower_a/b`, `memorial (Hà Tĩnh)`, `ho_gate`, `trong_mai`, `golden_bridge`, `water_wheel`, `salt_pile`, `crater`, `sea_arch`, `twin_towers`, `granite_rocks`, `martial_yard`, `cave`, `tree_rubber`, `nội thất trong nhà (bed, table, chair, dish_cabinet, kitchen_stove, tea_cabinet, bookshelf, plant, rug, window, painting, rough_bench)`, `tường rơm (FENCE)`.

