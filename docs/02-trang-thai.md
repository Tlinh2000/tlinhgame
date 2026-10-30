# Trạng thái bàn giao — phần 2.1

Ngày ghi nhận: 30/10/2026. Phiên bản: 0.1.0. Môi trường chạy kiểm tra: Linux, Node.js 24.22.1. Giữ nguyên trình tự: Bước 1 đã xác nhận; đang Bước 2, phần 1/7.

## Phần được triển khai

Giao diện trang chủ, thư viện 13 game dự kiến và trang luật; cảnh ý tưởng Three.js; cài đặt cục bộ; hiệu ứng thử bằng Web Audio; HTTP health/readiness/status; Socket.IO diagnostics; chia sẻ kiểu dữ liệu và kiểm tra payload; kiểm soát origin, tần suất, phiên bản giao thức; cấu hình build, kiểm thử, GitHub Actions và Render.

## Bằng chứng kiểm tra

| Kiểm tra | Trạng thái |
| --- | --- |
| Kiểm tra kiểu dữ liệu web/server/shared/tests | Đã đạt với TypeScript 6.0.3 |
| Build web/server | Đã đạt; Three.js tải thành chunk riêng |
| Cài mới từ gói ZIP | Đã giải nén sang thư mục mới, chạy npm ci rồi build web/server thành công trên Linux |
| 11 bài kiểm thử HTTP/Socket.IO với server thật | Đã đạt |
| Trang chủ, tìm/lọc game, trang luật | Đã kiểm tra trong Chrome máy tính |
| Hai tab nhận cùng tín hiệu và số kết nối giảm khi đóng tab | Đã kiểm tra: hai tab nhận tín hiệu #1 cùng giờ máy chủ 21:14:00; số kết nối từ 2 giảm còn 1 |
| Chất lượng/giảm chuyển động lưu qua tải lại trang | Đã quan sát Thấp và Giảm chuyển động vẫn được chọn sau reload |
| Nút âm thanh thử | Trình duyệt báo phát thành công; chưa kiểm tra âm thanh nghe được trên thiết bị người dùng |
| Hình ảnh cảnh 3D trên GPU | Chưa xác minh: môi trường Chrome tắt WebGL (GL_RENDERER = Disabled); thông báo dự phòng hiển thị đúng |
| Điện thoại thật | Chưa kiểm tra; đã có CSS responsive, chưa coi là bằng chứng thiết bị thật |
| Chạy CMD và cài trên Windows thật | Chưa kiểm tra |
| Hai thiết bị trên hai mạng qua Internet | Chưa kiểm tra; chờ Bước 5–6 |
| Render và Supabase | Chưa cấu hình hoặc triển khai |

GitHub Actions và Render Blueprint mới được cung cấp dưới dạng cấu hình. Chưa chạy workflow trên GitHub hoặc xác nhận triển khai Render. Kiểm tra `npm audit --omit=dev` không báo lỗ hổng phụ thuộc production tại thời điểm chạy; kết quả này không thay thế đánh giá bảo mật toàn hệ thống.

Kênh diagnostics không lưu database. Số tín hiệu khởi động lại khi server khởi động lại; danh sách tối đa 5 tín hiệu chỉ giữ trong bộ nhớ trình duyệt. Chống phát trùng request ID áp dụng tối đa 100 ID gần nhất trong cùng một kết nối, không phải cơ chế giao dịch tài chính.

Giới hạn kết nối kiểm tra là biện pháp giới hạn tải ban đầu, chưa phải benchmark. Tất cả game trong catalog là `planned`. Không có dữ liệu người chơi, xu, kết quả hoặc ELO mẫu trình bày như dữ liệu thật.

## Phần còn lại của Bước 2

1. Tài khoản, hồ sơ, schema/RLS Supabase và Avatar Studio.
2. Sảnh, ghép trận, phòng riêng và kết nối lại.
3. Mô phỏng Ice Arena và kiểm tra luật.
4. Mô phỏng Kart Racing và checkpoint.
5. XP/ELO, xu, shop, nhiệm vụ, thành tích, bạn bè và âm thanh đầy đủ.
6. Kiểm tra liên thông, hoàn tất nguồn trước Bước 3.

Chưa coi bất kỳ phần nào ở trên là hoàn thành chỉ vì đã có mục trong menu hoặc kế hoạch trong tài liệu.
