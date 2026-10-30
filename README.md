# TlinhGame — Bước 2, phần 2.1

**Phiên bản 0.1.0: bộ khung website và kết nối máy chủ.** Bước 1 đã được chủ dự án xác nhận. Mã nguồn này chưa phải nền tảng game hoàn chỉnh, chưa triển khai GitHub/Supabase/Render.

Nếu chưa biết lập trình, mở **BAT_DAU_O_DAY.html** bằng Chrome hoặc Edge. Hướng dẫn này hoạt động cả khi chưa cài Node.js. Bạn không phải tạo từng file hoặc tự tìm tài liệu tiếng Anh.

## Có gì trong phần này?

- Trang chủ thương hiệu TlinhGame; bố cục máy tính/điện thoại.
- Cảnh ý tưởng Three.js, xoay góc nhìn và điều chỉnh chất lượng. Đây chưa phải bản đồ thi đấu hoặc nhân vật hoàn chỉnh.
- Thư viện 13 game dự kiến; lọc thể loại, tìm tên có/không dấu, xem luật và điều khiển dự kiến. Tất cả chưa mở chơi.
- Cài đặt đồ họa, giảm chuyển động, âm lượng/tắt tiếng hiệu ứng và âm thanh thử tổng hợp riêng; lưu trong trình duyệt.
- Máy chủ Node.js/Express và Socket.IO thật, kênh chẩn đoán riêng. Hai cửa sổ có thể nhận cùng tín hiệu từ máy chủ, hiển thị số kết nối và độ trễ đo thực tế.
- Kiểm tra cấu trúc gói tin, giới hạn tần suất, origin, phiên bản giao thức và chống phát trùng tín hiệu trong một kết nối.
- Namespace game bị đóng cho đến khi có xác thực; không có chế độ đăng nhập giả hoặc nhận token tùy ý.
- Bộ kiểm thử tích hợp, lockfile và cấu hình GitHub Actions; cấu hình Render chuẩn bị cho Bước 5.

## Chưa có

Đăng ký/đăng nhập Supabase, hồ sơ bền vững, Avatar Studio, nhân vật chân thực, ghép trận, phòng riêng, mô phỏng Ice Arena/Kart Racing, kết quả/XP/ELO/xu, shop, bạn bè, nhiệm vụ và nhạc nền. Chức năng chưa có được ghi rõ trên giao diện; không có số người chơi hoặc điểm thưởng giả.

Cảnh Three.js đã được kiểm tra kiểu dữ liệu và build, nhưng trình duyệt kiểm tra hiện tắt WebGL. Chưa xác minh hình ảnh 3D hoặc tốc độ khung hình trên GPU thật. Thông báo dự phòng khi không tạo được WebGL đã được quan sát trong trình duyệt; các chức năng khác tiếp tục hoạt động.

## Chạy trên Windows

1. Giải nén toàn bộ gói; không chạy trực tiếp trong cửa sổ ZIP.
2. Mở `BAT_DAU_O_DAY.html` và làm phần “Chạy trên máy Windows”.
3. Cài Node.js 24 LTS từ nguồn chính thức được dẫn trong hướng dẫn nếu máy chưa có. Phiên bản đã dùng kiểm tra: 24.22.1.
4. Nhấp đúp `CHAY_TLINHGAME.cmd`. Lần đầu cần Internet; script chạy `npm ci` để cài đúng phiên bản thư viện.
5. Khi Vite báo sẵn sàng, mở http://localhost:5173. Giữ cửa sổ lệnh mở; đóng nó để dừng chương trình.

Script Windows được cung cấp để thuận tiện, chưa được chạy trên máy Windows thật trong phiên phát triển này. Nếu gặp lỗi, chụp thông báo để được hỗ trợ.

## Các lệnh cho kiểm tra kỹ thuật

Chạy tại thư mục có `package.json` gốc, với Node.js 24.22.1 hoặc bản vá mới hơn của nhánh 24:

```bash
npm ci
npm run dev
```

Kiểm tra và build:

```bash
npm run check
```

Build server riêng: `npm run build:server`; build web riêng: `npm run build:web`; chạy server đã build: `npm start`. Bản chạy thử dùng frontend 5173 và backend 3100. `scripts/dev.mjs` khởi động cả hai và báo rõ nếu cổng đang được dùng.

## Biến môi trường

Chạy local phần 2.1 không cần tạo `.env` hoặc điền khóa Supabase. Vite chuyển tiếp `/api`, `/healthz`, `/readyz`, `/socket.io` tới backend. Origin localhost được cấu hình riêng cho proxy phát triển; production dùng origin HTTPS được khai báo rõ ràng.

Xem `apps/web/.env.example`, `apps/server/.env.example`. Chỉ `VITE_API_URL` và `VITE_SOCKET_URL` được dùng ở frontend hiện tại. Backend production yêu cầu `ALLOWED_ORIGINS`, dùng `PORT` do Render cấp và lắng nghe `0.0.0.0`.

`/readyz` xác nhận bộ khung đang sẵn sàng, đồng thời báo `gameReady: false`. Nó chưa kiểm tra database vì phần này chưa dùng database.

## Kiểm tra nhanh kết nối

1. Mở http://localhost:5173/connection ở hai tab/cửa sổ.
2. Quan sát trạng thái đã kết nối và số cửa sổ kiểm tra tăng.
3. Nhấn “Gửi tín hiệu kiểm tra” ở một tab.
4. Hai tab phải có cùng số tín hiệu và giờ máy chủ. Đóng một tab thì số kết nối ở tab còn lại giảm.

Đó là hai kết nối kiểm tra ẩn danh, **chưa phải hai người chơi đăng nhập hoặc một trận đấu**. Kiểm tra giữa hai thiết bị trên Internet vẫn chờ Bước 5–6.

## Tệp và tiến độ

`DANH_SACH_FILE.md` liệt kê toàn bộ file thực tế trong gói, đúng vị trí. `docs/02-trang-thai.md` ghi phạm vi và bằng chứng kiểm tra. `docs/01-thiet-ke.md` là bản thiết kế Bước 1 dùng làm tham chiếu; các mô-đun tương lai chưa được tạo dưới dạng file rỗng.

## Tài nguyên và bảo mật

Biểu tượng và cảnh 3D trong phần này được dựng bằng mã; hiệu ứng thử được tổng hợp bằng Web Audio. Không có tệp ảnh, nhạc hoặc mô hình bên thứ ba được lấy tùy ý. Thư viện bên ngoài giữ giấy phép riêng, xem `docs/tai-nguyen-va-giay-phep.md` và package tương ứng khi cài.

Không commit `node_modules`, `.env`, secret key, log hoặc dữ liệu cá nhân. Gói bàn giao không có khóa thật. Kênh kiểm tra công khai chỉ truyền request ID ngẫu nhiên, số kết nối, số thứ tự và thời gian máy chủ; không truyền tên, email, điểm hoặc chat. Giới hạn hiện tại: 100 kết nối kiểm tra toàn server và 12 trên một địa chỉ IP; không phải cam kết sức chứa game.

## Phần tiếp theo

Sau khi bạn kiểm tra phần 2.1, tiếp tục tài khoản, hồ sơ và Avatar Studio. Sau đó mới đến phòng/ghép trận, Ice Arena, Kart Racing và phần thưởng. GitHub, Supabase, Render và kiểm tra Internet vẫn thực hiện đúng Bước 3–6.
