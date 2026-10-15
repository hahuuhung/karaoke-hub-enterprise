# Kế Hoạch Triển Khai - Karaoke Hub Enterprise (Phase 1)

## Danh Sách Công Việc (Work Breakdown Structure)

- [ ] **Task 1: Khởi tạo Project Structure & Dependencies**
  - Cấu hình `package.json`, TypeScript, Vite, Tailwind CSS, Vitest.
  - Thiết lập Pino structured logging & folder structure (`src/core`, `src/server`, `src/client`, `tests`).
- [ ] **Task 2: Phát triển Core Domain Logic & Unit Tests**
  - `BillingEngine`: Tính tiền giờ theo Block, Grace period, Khung giờ, Chuyển/Tạm dừng phòng.
  - `HostessQueueEngine`: Hàng đợi xoay tua Round-robin, Bấm giờ phục vụ, Cảnh báo quá ca, Hoa hồng.
  - `InventoryAuditEngine`: Quản lý kho, Kiểm đồ trả lại (hoàn bia/nước chưa khui), In Pre-bill, Sinh VietQR động.
  - Bộ Unit Tests toàn diện với Vitest đạt 100% pass rate.
- [ ] **Task 3: Backend Local Server & SQLite Storage & WebSocket Hub**
  - SQLite Database schema & repository.
  - Fastify HTTP API endpoints.
  - WebSocket Hub đồng bộ LAN Realtime hai chiều.
  - Outbox Sync background queue giả lập sync Cloud.
- [ ] **Task 4: Giao Diện Người Dùng White Theme Hiện Đại (React + Tailwind)**
  - Navigation bar, chỉ báo kết nối mạng LAN & Cloud.
  - Sơ đồ phòng hát (Room Grid Matrix) với live timer, trạng thái, modal chi tiết phòng.
  - Bảng điều phối tiếp viên (Hostess Dispatch Kanban) hỗ trợ kéo thả/điều đào 1 chạm và cảnh báo quá giờ.
  - Modal "Kiểm đồ trả lại" và Thanh toán VietQR động chuẩn Napas247.
- [ ] **Task 5: Kiểm Thử Tích Hợp, Review 2 Lần & Git Commit**
  - Chạy toàn bộ Test suite & kiểm tra Build production.
  - Thực hiện Review 2 lần theo quy tắc dự án.
  - Git commit & xuất Walkthrough chi tiết.
