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

## Đóng gói thành ứng dụng desktop (Tauri)

Thư mục `src-tauri/` đã có sẵn cấu hình Tauri cơ bản. **Lưu ý: phần này chưa được build/chạy thử thật**,
vì môi trường tạo ra dự án này không có sẵn Rust và không có màn hình để kiểm tra ứng dụng desktop — việc
build/test thật cần làm trên máy thật (khuyên dùng Claude Code hoặc Claude Cowork), theo các bước:

1. Cài Rust: xem hướng dẫn tại https://www.rust-lang.org/tools/install
2. Cài Tauri CLI: `cargo install tauri-cli --version "^2"`
3. Chạy thử: `cargo tauri dev` (mở ứng dụng desktop, tự tải lại khi sửa code)
4. Build file cài đặt: `cargo tauri build` (ra file `.exe`/`.msi` trên Windows, `.app`/`.dmg` trên Mac, tùy hệ điều hành đang build)
5. Icon hiện mới có 1 file gốc `src-tauri/icons/icon.png`. Chạy `cargo tauri icon src-tauri/icons/icon.png`
   để tự sinh đủ bộ icon cho từng nền tảng trước khi build bản phát hành chính thức.

**Việc còn thiếu trước khi dùng được save file thật sự trên desktop:** hiện `SaveService.ts` vẫn chỉ lưu qua
`localStorage` của trình duyệt (dùng được cả khi chạy trong Tauri, vì Tauri vẫn có localStorage riêng cho app),
nhưng để lưu ra **file thật trong thư mục dữ liệu máy** (bền hơn, dễ sao lưu) cần nối thêm gói
`@tauri-apps/plugin-fs` và sửa `SaveService.ts` để phát hiện môi trường Tauri rồi đọc/ghi file thay vì
`localStorage` — phần này chưa làm vì không thể kiểm thử nếu không có Tauri chạy thật để thử.
