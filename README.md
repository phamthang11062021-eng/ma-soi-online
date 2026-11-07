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
6. Chọn gói Free nếu muốn thử nghiệm miễn phí, sau đó Deploy.

Repository đã có `render.yaml` để Render nhận diện cấu hình dịch vụ. Sau khi deploy, kiểm tra đường dẫn `/health`.

## Luật và vai hiện tại

- 5–16 người; chia số Ma sói theo số người.
- Dân làng, Ma sói, Tiên tri, Phù thủy; Bảo vệ được thêm từ 7 người.
- Đêm tự động theo thứ tự Bảo vệ → Ma sói → Tiên tri → Phù thủy.
- Ban ngày thảo luận, bỏ phiếu kín; kiểm tra điều kiện thắng sau mỗi lần loại.
- Vai và hành động ban đêm chỉ được gửi riêng cho người chơi tương ứng.

## Lưu ý bản thử nghiệm

Bản hiện tại lưu phòng trong bộ nhớ tiến trình máy chủ. Khi dịch vụ khởi động lại hoặc ngủ rồi khởi động lại, phòng đang chơi có thể mất. Chưa có database bền vững, xác thực tài khoản, chat người chết, Thợ săn, xử lý hòa phiếu vòng hai hoặc hệ thống quản trị. Hãy thử với nhóm nhỏ trước khi dùng trong buổi chơi chính thức.