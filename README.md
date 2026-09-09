# Vở luyện toán — Lớp 4 đến Lớp 12

App luyện tập Toán theo đúng SGK "Kết nối tri thức với cuộc sống" — 486 câu trắc nghiệm chấm điểm tự động + 810 bài tự luyện có lời giải (khóa bằng mật khẩu).

## Chạy thử trên máy (không bắt buộc)

Cần cài [Node.js](https://nodejs.org) trước (bản 18 trở lên).

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiện ra (thường là http://localhost:5173).

## Cách đưa lên mạng thật (để nhiều học sinh truy cập) — dùng Vercel, miễn phí

Đây là cách đơn giản nhất, không cần biết code:

1. Vào **vercel.com**, đăng ký tài khoản (có thể dùng tài khoản Google/GitHub).
2. Vào **github.com**, tạo tài khoản nếu chưa có, tạo một repository mới (ví dụ đặt tên `vo-luyen-toan`).
3. Tải toàn bộ nội dung thư mục này lên repository đó (kéo-thả file qua giao diện web GitHub, hoặc dùng GitHub Desktop nếu muốn dễ hơn).
4. Quay lại Vercel, bấm **"Add New Project"**, chọn repository `vo-luyen-toan` vừa tạo.
5. Vercel tự nhận diện đây là dự án Vite, để mặc định cấu hình rồi bấm **Deploy**.
6. Sau khoảng 1 phút, Vercel cho bạn một địa chỉ web dạng `vo-luyen-toan.vercel.app` — đây chính là trang thật, học sinh nào có link đều vào được.
7. Muốn gắn tên miền riêng (ví dụ `voluyentoan.vn`): vào phần **Settings → Domains** trong Vercel, mua tên miền ở nơi bán tên miền (Mắt Bão, PA Vietnam, Namecheap...) rồi trỏ về theo hướng dẫn Vercel đưa ra.

## Cách đổi mật khẩu xem lời giải

Mở file `src/App.jsx`, tìm dòng gần đầu file:

```js
const SOLUTION_PASSWORD = "toanvietphap2026";
```

Đổi chuỗi trong ngoặc kép thành mật khẩu bạn muốn, lưu file, rồi deploy lại (nếu đã đưa lên Vercel, chỉ cần cập nhật file trên GitHub, Vercel sẽ tự build lại).

## Cấu trúc nội dung

Mở `src/App.jsx`, tìm mảng `GRADES` ở đầu file — đây là toàn bộ ngân hàng câu hỏi, mỗi lớp có:
- `topics`: chủ đề lý thuyết, mỗi chủ đề có `questions` (trắc nghiệm) và `exercises` (tự luận có lời giải)
- `examTopics`: đề thi thật đã nạp thành quiz (hiện chỉ có 1 đề, lớp 10)
- `examSources`: link tham khảo ra ngoài để tải thêm đề PDF

Muốn thêm nội dung, copy một object có sẵn trong các mảng trên và sửa lại — cấu trúc dữ liệu giữ nguyên, chỉ cần đúng định dạng.
