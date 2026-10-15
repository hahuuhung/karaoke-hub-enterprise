# Karaoke Hub Enterprise - Project Guidelines & Rules

## 1. Nguyên Tắc Chung / General Principles
- **Ưu tiên khả năng đọc**: Mã nguồn rõ ràng, clean code, đặt tên theo chuẩn convention domain Karaoke (Room, Session, Hostess, OrderItem, Invoice, etc.).
- **Thay đổi tối thiểu**: Tập trung vào phạm vi MVP và các tính năng được yêu cầu.

## 2. Tiêu Chuẩn Kỹ Thuật & Đa Nền Tảng (Cross-Platform)
- **Đường dẫn**: Tuyệt đối KHÔNG hardcode đường dẫn tuyệt đối (như `C:\...`). Luôn dùng `path.join("folder", "file")` trong Node.js / TypeScript.
- **Node.js / TypeScript Stack**:
  - Desktop POS: Electron + React + Tailwind CSS + Lucide Icons + SQLite (local offline storage).
  - Web POS / Mobile PWA: React + Tailwind CSS (Responsive cho Tablet/Mobile).
  - Realtime & Backend: Node.js (Fastify / Express + Socket.io / WebSocket Server).
  - Structured Logging: Pino structured JSON logger (tương đương Serilog) ghi log theo context correlation ID.

## 3. Tiêu Chuẩn Giao Diện (UI/UX) & Mockups
- **White Theme chủ đạo**: Thiết kế giao diện sáng, tối giản, sang trọng, tương phản cao, tối ưu cho môi trường ánh sáng phòng thu ngân/quản lý karaoke.
- **Visual Mockups**: Luôn tạo mockup trực quan chi tiết cho từng màn hình trước khi hiện thực hóa.
- **Thành phần UI chính**:
  - **Sơ đồ phòng (Room Grid Matrix)**: Trạng thái phòng (Trống, Đang hát, Chờ dọn, Đặt trước), hiển thị đồng hồ thời gian thực và tiền tạm tính.
  - **Bảng điều phối tiếp viên (Hostess Dispatch Kanban)**: Cột Sẵn sàng (xoay tua), Đang phục vụ (đồng hồ thời gian ngồi, cảnh báo quá giờ), Nghỉ tạm.
  - **Bảng Thu ngân & Gọi món (POS Cashier)**: Order F&B, chức năng kiểm đồ trả lại (trả bia/nước chưa khui), In Pre-bill, mã VietQR động.

## 4. Kiến Trúc & Quy Trình Xử Lý (Workflows)
- **Workflow Diagrams**: Luôn có sơ đồ Mermaid mô tả luồng nghiệp vụ (Tính giờ, Đổi/Gộp phòng, Điều phối tiếp viên, Đồng bộ Offline-First).
- **Core Billing Engine**:
  - Hỗ trợ tính giờ theo block linh hoạt (block đầu 60p, block sau 15p/30p, 10p grace period).
  - Phân giá theo Loại phòng x Khung giờ x Ngày lễ/Cuối tuần.
  - Xử lý chuyển phòng cộng dồn & tạm dừng tính giờ.
- **Dual-layer Sync**:
  - Lớp 1 (LAN Sync): WebSockets nội bộ quán đảm bảo 0ms latency giữa POS & Mobile Tablet.
  - Lớp 2 (Cloud Sync): Outbox pattern đẩy dữ liệu lên Cloud khi có Internet.
- **Unit Test**: Kiểm thử tự động cho Billing Engine, Hostess Round-robin Queue và Transaction Calculation.

## 5. Quy Trình Kiểm Thử & Báo Cáo
- Hoàn thành task -> Review 2 lần -> Git commit -> Cập nhật Walkthrough / Tài liệu bàn giao.
