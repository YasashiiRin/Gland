# Nông trại (v0.1.0 – Phase 0 + 1)

Game nông trại 2D, viết bằng Phaser 3 + TypeScript + Vite.

## Chạy game

1. Cài **Node.js** bản LTS từ https://nodejs.org (chỉ cần làm một lần).
2. Mở terminal trong thư mục này.
3. Chạy `npm install` (chỉ cần lần đầu).
4. Chạy `npm run dev`. Trình duyệt sẽ tự mở http://localhost:5173.

Dừng game: nhấn `Ctrl + C` trong terminal.

## Điều khiển

- WASD hoặc phím mũi tên: đi lại
- Giữ Shift: chạy
- Đi vào cửa nhà hoặc ra mép phải nông trại để chuyển cảnh

## Lệnh khác

- `npm test` – chạy kiểm thử
- `npm run build` – kiểm tra lỗi và đóng gói vào thư mục `dist`
- `npm run assets` – tạo lại hình placeholder và bản đồ (cần Python 3 và `pip install pillow`)

## Thay đồ họa

Thay file PNG trong `public/assets/` bằng hình thật, giữ nguyên kích thước ô 16x16
và thứ tự ô trong tileset (xem danh sách ở đầu `scripts/gen_placeholders.py`).
Bản đồ `.tmj` mở và chỉnh được bằng Tiled (https://www.mapeditor.org).

Kế hoạch các phase tiếp theo nằm trong `PLAN.md`.
