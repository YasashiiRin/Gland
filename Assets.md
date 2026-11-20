# Assets — hình còn thiếu (cây trồng giá 2000, đợt 1)

Danh sách hình **còn thiếu** cho 16 cây trồng mới (trong tổng 22 cây) và phân bón. Trong lúc chưa có hình, game tạm dùng hình vẽ bằng code: cây non tô xanh, cây chín tô vàng, biểu tượng là gói hạt hoặc hình tròn có màu.
Cách vẽ, cách lưu và cách nạp vào game giống hệt `ASSET_LIST.md`: đính kèm `assets/reference.jpg`, dán prompt, lưu đúng tên file, rồi chạy `python3 scripts/art/import_assets.py`.

## Tóm tắt

| Loại | Còn thiếu | Lưu vào |
|---|---|---|
| Cây trồng (dải 5 giai đoạn, 160 x 64) | 16 | `assets/crops/<id>.png` |
| Biểu tượng vật phẩm (32 x 32) | 33 + 11 thủy sản | `assets/icons/<id>.png` |

## Bảng kiểm

| Cây | Dải cây trồng | Biểu tượng hạt | Biểu tượng nông sản |
|---|---|---|---|
| Lúa (`rice`) | ✅ | ✅ | ✅ |
| Khoai tây (`potato`) | ✅ | ✅ | ✅ |
| Cải xanh (`mustard_greens`) | ⬜ | ⬜ | ⬜ |
| Xà lách (`lettuce`) | ⬜ | ⬜ | ⬜ |
| Súp lơ (`cauliflower`) | ✅ | ✅ | ✅ |
| Dâu tây (`strawberry`) | ✅ | ✅ | ✅ |
| Đậu que (`green_bean`) | ✅ | ✅ | ✅ |
| Ngô (`corn`) | ⬜ | ⬜ | ⬜ |
| Dưa hấu (`watermelon`) | ⬜ | ⬜ | ⬜ |
| Dưa leo (`cucumber`) | ⬜ | ⬜ | ⬜ |
| Rau muống (`water_spinach`) | ⬜ | ⬜ | ⬜ |
| Đậu đũa (`long_bean`) | ⬜ | ⬜ | ⬜ |
| Lúa nếp (`glutinous_rice`) | ⬜ | ⬜ | ⬜ |
| Khoai lang (`sweet_potato`) | ⬜ | ⬜ | ⬜ |
| Bí đỏ (`pumpkin`) | ⬜ | ⬜ | ⬜ |
| Cà tím (`eggplant`) | ⬜ | ⬜ | ⬜ |
| Ớt (`chili`) | ⬜ | ⬜ | ⬜ |
| Cải bắp (`cabbage`) | ⬜ | ⬜ | ⬜ |
| Su hào (`kohlrabi`) | ⬜ | ⬜ | ⬜ |
| Củ cải trắng (`parsnip`) | ✅ | ✅ | ✅ |
| Cà rốt (`carrot`) | ⬜ | ⬜ | ⬜ |
| Tỏi (`garlic`) | ⬜ | ⬜ | ⬜ |
| Phân bón (`fertilizer`) | — | — | ⬜ |

## 1. Cây trồng (5 giai đoạn)

### Cải xanh

- **File:** `assets/crops/mustard_greens.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a Vietnamese mustard greens plant (cải xanh): 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Xà lách

- **File:** `assets/crops/lettuce.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a lettuce plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Ngô

- **File:** `assets/crops/corn.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a corn (maize) plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Dưa hấu

- **File:** `assets/crops/watermelon.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a watermelon vine: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Dưa leo

- **File:** `assets/crops/cucumber.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a cucumber vine climbing a small bamboo stake: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Rau muống

- **File:** `assets/crops/water_spinach.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a water spinach (rau muống) plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Đậu đũa

- **File:** `assets/crops/long_bean.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a yardlong bean vine climbing a bamboo stake: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Lúa nếp

- **File:** `assets/crops/glutinous_rice.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a glutinous rice plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Khoai lang

- **File:** `assets/crops/sweet_potato.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a sweet potato vine with purple-red tubers at frame 5: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Bí đỏ

- **File:** `assets/crops/pumpkin.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a pumpkin vine: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Cà tím

- **File:** `assets/crops/eggplant.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of an eggplant plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Ớt

- **File:** `assets/crops/chili.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a chili pepper bush: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Cải bắp

- **File:** `assets/crops/cabbage.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a cabbage plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Su hào

- **File:** `assets/crops/kohlrabi.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a kohlrabi plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Cà rốt

- **File:** `assets/crops/carrot.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a carrot plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

### Tỏi

- **File:** `assets/crops/garlic.png`  ·  **Kích thước file:** 160 x 64 px  ·  **Trong game:** 1 ô
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Pixel grid: 160 x 64 pixels (the picture must look like a 160 x 64 pixel sprite scaled up, every art pixel a clean square). Crop growth strip of a garlic plant: 5 frames side by side, each 32 x 64 pixels (whole strip 160 x 64), the plant rooted at the bottom middle of each frame. Frame 1 a few seeds in a little mound of soil, frame 2 a tiny sprout, frame 3 a young plant, frame 4 a full grown plant, frame 5 ripe and ready to harvest. Plain pure white (#FFFFFF) background, no soil tile.
```

## 2. Biểu tượng vật phẩm

### Hạt cải xanh (`mustard_greens_seeds`)

- **File:** `assets/icons/mustard_greens_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a bundle of fresh green mustard greens on it, a few seeds spilling out.
```

### Hạt xà lách (`lettuce_seeds`)

- **File:** `assets/icons/lettuce_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a fresh round head of lettuce on it, a few seeds spilling out.
```

### Ngô giống (`corn_seeds`)

- **File:** `assets/icons/corn_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one ear of fresh corn with green husk on it, a few seeds spilling out.
```

### Hạt dưa hấu (`watermelon_seeds`)

- **File:** `assets/icons/watermelon_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one big striped green watermelon on it, a few seeds spilling out.
```

### Hạt dưa leo (`cucumber_seeds`)

- **File:** `assets/icons/cucumber_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one fresh green cucumber on it, a few seeds spilling out.
```

### Hạt rau muống (`water_spinach_seeds`)

- **File:** `assets/icons/water_spinach_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a tied bunch of water spinach on it, a few seeds spilling out.
```

### Hạt đậu đũa (`long_bean_seeds`)

- **File:** `assets/icons/long_bean_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a tied bunch of long green yardlong beans on it, a few seeds spilling out.
```

### Nếp giống (`glutinous_rice_seeds`)

- **File:** `assets/icons/glutinous_rice_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a sheaf of golden glutinous rice on it, a few seeds spilling out.
```

### Dây khoai lang giống (`sweet_potato_seeds`)

- **File:** `assets/icons/sweet_potato_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one purple-red sweet potato on it, a few seeds spilling out.
```

### Hạt bí đỏ (`pumpkin_seeds`)

- **File:** `assets/icons/pumpkin_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one big orange pumpkin on it, a few seeds spilling out.
```

### Hạt cà tím (`eggplant_seeds`)

- **File:** `assets/icons/eggplant_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one long purple eggplant on it, a few seeds spilling out.
```

### Hạt ớt (`chili_seeds`)

- **File:** `assets/icons/chili_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of a small bunch of red chili peppers on it, a few seeds spilling out.
```

### Hạt cải bắp (`cabbage_seeds`)

- **File:** `assets/icons/cabbage_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one round green cabbage on it, a few seeds spilling out.
```

### Hạt su hào (`kohlrabi_seeds`)

- **File:** `assets/icons/kohlrabi_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one pale green kohlrabi bulb with leaf stems on it, a few seeds spilling out.
```

### Hạt cà rốt (`carrot_seeds`)

- **File:** `assets/icons/carrot_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one orange carrot with green top on it, a few seeds spilling out.
```

### Tỏi giống (`garlic_seeds`)

- **File:** `assets/icons/garlic_seeds.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small folded paper seed packet tied with string, with a little picture of one white garlic bulb on it, a few seeds spilling out.
```

### Cải xanh (`mustard_greens`)

- **File:** `assets/icons/mustard_greens.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A bundle of fresh green mustard greens.
```

### Xà lách (`lettuce`)

- **File:** `assets/icons/lettuce.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A fresh round head of lettuce.
```

### Ngô (`corn`)

- **File:** `assets/icons/corn.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One ear of fresh corn with green husk.
```

### Dưa hấu (`watermelon`)

- **File:** `assets/icons/watermelon.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One big striped green watermelon.
```

### Dưa leo (`cucumber`)

- **File:** `assets/icons/cucumber.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One fresh green cucumber.
```

### Rau muống (`water_spinach`)

- **File:** `assets/icons/water_spinach.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A tied bunch of water spinach.
```

### Đậu đũa (`long_bean`)

- **File:** `assets/icons/long_bean.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A tied bunch of long green yardlong beans.
```

### Lúa nếp (`glutinous_rice`)

- **File:** `assets/icons/glutinous_rice.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A sheaf of golden glutinous rice.
```

### Khoai lang (`sweet_potato`)

- **File:** `assets/icons/sweet_potato.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One purple-red sweet potato.
```

### Bí đỏ (`pumpkin`)

- **File:** `assets/icons/pumpkin.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One big orange pumpkin.
```

### Cà tím (`eggplant`)

- **File:** `assets/icons/eggplant.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One long purple eggplant.
```

### Ớt (`chili`)

- **File:** `assets/icons/chili.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small bunch of red chili peppers.
```

### Cải bắp (`cabbage`)

- **File:** `assets/icons/cabbage.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One round green cabbage.
```

### Su hào (`kohlrabi`)

- **File:** `assets/icons/kohlrabi.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One pale green kohlrabi bulb with leaf stems.
```

### Cà rốt (`carrot`)

- **File:** `assets/icons/carrot.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One orange carrot with green top.
```

### Tỏi (`garlic`)

- **File:** `assets/icons/garlic.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). One white garlic bulb.
```

### Phân bón (`fertilizer`)

- **File:** `assets/icons/fertilizer.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small woven bamboo scoop holding dark brown crumbly manure fertilizer with a few white fertilizer granules.
```

## 3. Thủy sản — giá 2000, đợt 2

10 loài cá mới và túi thức ăn cá. Trong lúc chưa có hình, game tạm dùng hình cá vẽ bằng code (mỗi loài một màu).

| Vật phẩm | Biểu tượng |
|---|---|
| Cá rô phi (`tilapia`) | ⬜ |
| Cá mè (`silver_carp`) | ⬜ |
| Cá linh (`linh_fish`) | ⬜ |
| Cá nục (`scad`) | ⬜ |
| Cá ngừ (`tuna`) | ⬜ |
| Cá chim (`pomfret`) | ⬜ |
| Cá hồng (`red_snapper`) | ⬜ |
| Cá bạc má (`indian_mackerel`) | ⬜ |
| Cá hố (`hairtail`) | ⬜ |
| Cá chẽm (`barramundi`) | ⬜ |
| Thức ăn cá (`fish_feed`) | ⬜ |

### Cá rô phi (`tilapia`)

- **File:** `assets/icons/tilapia.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A grey-green tilapia fish with faint dark vertical bands and a spiny dorsal fin.
```

### Cá mè (`silver_carp`)

- **File:** `assets/icons/silver_carp.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A silvery bighead silver carp with a large head and small low-set eyes.
```

### Cá linh (`linh_fish`)

- **File:** `assets/icons/linh_fish.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A tiny slim silvery Mekong linh fish (Henicorhynchus), a little shiny minnow.
```

### Cá nục (`scad`)

- **File:** `assets/icons/scad.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A slim blue-green round scad sea fish with a silver belly.
```

### Cá ngừ (`tuna`)

- **File:** `assets/icons/tuna.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A stout dark navy blue tuna with a silver belly and small yellow finlets.
```

### Cá chim (`pomfret`)

- **File:** `assets/icons/pomfret.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A flat round silvery pomfret fish with a deeply forked tail.
```

### Cá hồng (`red_snapper`)

- **File:** `assets/icons/red_snapper.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A bright pinkish red snapper fish with a silver-pink belly.
```

### Cá bạc má (`indian_mackerel`)

- **File:** `assets/icons/indian_mackerel.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small Indian mackerel with blue-green back, faint dark stripes and a silver belly.
```

### Cá hố (`hairtail`)

- **File:** `assets/icons/hairtail.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A long thin ribbon-like silver hairtail fish with sharp teeth, curled in an S shape to fit.
```

### Cá chẽm (`barramundi`)

- **File:** `assets/icons/barramundi.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). An olive-grey barramundi (Asian sea bass) with a large mouth and silver flanks.
```

### Thức ăn cá (`fish_feed`)

- **File:** `assets/icons/fish_feed.png`  ·  **Kích thước file:** 32 x 32 px
```
Original pixel art game asset for a cozy farming game set in a humble Vietnamese countryside village of the old days. Match the art style of the attached reference image (assets/reference.jpg): a high top-down three-quarter view looking down at about 45 degrees, like an illustrated pixel-art town map, so roofs and tops are clearly visible and fronts are seen below them; bright, saturated, cheerful colours (lush greens, turquoise water, warm terracotta roof tiles, sandy orange earth, grey cobblestone, golden rice and straw); a thin dark outline around every shape with soft cel shading and a light top-left highlight; rich small details at a small scale (planks, tiles, leaves, baskets) but readable; clean square pixels, no anti-aliasing, no blur, no photo texture. No text, letters, signs with writing, logos or watermark. Original design: learn only the look of the reference, do not copy its layout or any existing game. Draw exactly one inventory icon, centered and fully visible, on a plain pure white (#FFFFFF) background with nothing else in the image: no ground, no scenery, only a small soft oval shadow right under it. Pixel grid: 32 x 32 pixels (the picture must look like a 32 x 32 pixel sprite scaled up, every art pixel a clean square). A small tied burlap sack of chopped trash-fish feed with a few bits spilling out.
```
