# Ma Sói Online

Website chơi Ma Sói nhiều người bằng tiếng Việt, tự động điều hành ván chơi, không cần quản trò.

## Chạy thử trên máy tính

- Cài Node.js 20 trở lên.
- Tải repository về máy.
- Chạy `npm install`.
- Chạy `npm start`.
- Mở `http://localhost:3000`.

## Triển khai lên Render

1. Đăng nhập Render và chọn **New → Web Service**.
2. Kết nối GitHub repository `phamthang11062021-eng/ma-soi-online`.
3. Chọn branch `main`.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Chọn gói Free để thử nghiệm, sau đó Deploy.
7. Kiểm tra đường dẫn `/health` sau khi dịch vụ chạy.

Repository có `render.yaml` để Render nhận diện cấu hình dịch vụ.

## Vai trò trong phiên bản hiện tại

Có 11 role, mỗi người chỉ nhận hướng dẫn riêng cho role mình được chia:

- **Phe sói:** Ma sói.
- **Phe dân:** Dân làng, Tiên tri, Phù thủy, Bảo vệ, Thợ săn, Thần tình yêu, Già làng, Cô bé, Thị trưởng, Thầy đồng.

### Kỹ năng đã triển khai

- Ma sói: bỏ phiếu chọn mục tiêu ban đêm.
- Tiên tri: soi một người mỗi đêm, biết người đó có thuộc phe sói không.
- Phù thủy: một bình cứu và một bình độc; mỗi đêm chọn tối đa một hành động.
- Bảo vệ: bảo vệ một người, không lặp mục tiêu ở hai đêm liên tiếp.
- Thợ săn: khi bị loại có 20 giây để bắn một người còn sống.
- Thần tình yêu: đêm đầu ghép hai người; một người chết thì người kia chết theo. Nếu đôi tình nhân khác phe là hai người cuối cùng còn sống, họ thắng riêng.
- Già làng: sống sót sau lần đầu bị sói cắn.
- Cô bé: có thể quan sát lén danh sách Ma sói trong lượt sói.
- Thị trưởng: lá phiếu ban ngày có trọng số gấp đôi.
- Thầy đồng: một lần mỗi ván xem chính xác role của một người đã chết.
- Dân làng: thảo luận và bỏ phiếu.

## Hướng dẫn role

Khi ván bắt đầu, thẻ role riêng của người chơi hiển thị:
- Mục tiêu chiến thắng.
- Kỹ năng và giới hạn.
- Hướng dẫn từng bước.
- Mẹo sử dụng role.

Người chơi có thể ẩn/mở phần hướng dẫn trong suốt ván. Role và thông tin bí mật không được gửi cho người chơi khác; vai của mọi người chỉ được công khai khi ván kết thúc.

## Lưu ý bản thử nghiệm

- Phòng và trạng thái ván hiện lưu trong bộ nhớ tiến trình máy chủ. Khi dịch vụ khởi động lại, phòng đang chơi có thể mất.
- Chưa có database bền vững, tài khoản người chơi, chế độ chat riêng cho người đã chết, hoặc giao diện cấu hình bộ role.
- Luật và kỹ năng là bộ luật riêng của phiên bản này; nên thử nghiệm với nhóm nhỏ trước khi chơi chính thức.
