# Vocab Notebook

Website sổ tay học từ vựng theo **Topic** (Collocation, Họ từ `n/v/adj/adv`, Từ đồng nghĩa, Ví dụ), hỗ trợ giao diện **Mobile (menu ẩn + thẻ dọc)**, **Flashcard**, **Test chọn từ** (bỏ qua từ đã thuộc) và **Trang Quản trị viên**.

## Cài đặt & Chạy local

```bash
npm install
cp .env.example .env
npm start
```

Mở trình duyệt tại `http://localhost:3000`. Tài khoản đăng ký đầu tiên sẽ tự động có quyền **Admin**.

## Biến môi trường (`.env` / Deploy)

- `PORT`: Cổng chạy server (mặc định `3000`)
- `MONGODB_URI`: Chuỗi kết nối MongoDB hoặc **MongoDB Atlas** (`mongodb+srv://...`)
- `JWT_SECRET`: Chuỗi bí mật ký token đăng nhập
- `ALLOW_SELF_REGISTER`: Mặc định `false` (tắt đăng ký tự do, chỉ Admin tạo tài khoản)
- `ADMIN_USERNAME`: Tên tài khoản Admin khởi tạo ban đầu (mặc định `admin`)
- `ADMIN_PASSWORD`: Mật khẩu Admin khởi tạo ban đầu (mặc định `admin123` — nên đặt mật khẩu riêng khi deploy)
- `AI_API_KEY`: API Key miễn phí từ **Groq** (`console.groq.com`), **OpenRouter**, hoặc **Cerebras** cho tính năng **📥 Nhập nhanh bằng AI**
- `AI_BASE_URL`: Mặc định `https://api.groq.com/openai/v1`
- `AI_MODEL`: Mặc định `openai/gpt-oss-20b`
