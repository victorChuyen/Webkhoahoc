# CourseMarket VN

CourseMarket VN là một nền tảng học trực tuyến được xây dựng với Next.js 14 App Router, Tailwind CSS, TypeScript và Supabase. Hỗ trợ thanh toán các cổng VNPay, MoMo, PayPal.

## Tính năng chính
- Xóa bỏ rào cản bằng việc hỗ trợ đa phương thức thanh toán.
- Authentication với Supabase (Email/Password, Google, GitHub).
- Phân quyền người dùng: Admin, Instructor, Student.
- Student Dashboard: Theo dõi tiến độ học tập.
- Instructor Dashboard: Quản lý khóa học, doanh thu.
- Admin Dashboard: Thống kê doanh thu, CRM học viên.

## Yêu cầu môi trường
Tạo file `.env.local` dựa trên `.env.example` và điền các thông tin sau:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Gateways (Sandbox)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECURE_SECRET=your_vnpay_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_IPN_URL=your_momo_ipn_url

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

## Cài đặt Supabase

1. Tạo một dự án mới trên [Supabase](https://supabase.com).
2. Vào **SQL Editor** và chạy toàn bộ nội dung trong file `supabase/migrations.sql`.
3. Chạy tiếp toàn bộ nội dung trong file `supabase/seed.sql` để tạo dữ liệu mẫu (20 khóa học AI, admin, instructor, student).
4. Vào **Storage**, tạo bằng tay các bucket (nếu chưa có):
   - `thumbnails` (Public)
   - `avatars` (Public)
   - `videos` (Private)
5. Vào **Authentication > Providers**, bật Email/Password. Nếu muốn dùng Social Login, cấu hình Client ID và Secret cho Google/GitHub.

## Chạy dự án Local

```bash
# Cài đặt dependencies
npm install

# Khởi chạy server phát triển
npm run dev
```

Truy cập `http://localhost:3000`.

Tài khoản demo:
- Admin: `admin@coursemarket.vn`
- Instructor: `demo@instructor.vn`
- Student: `student@coursemarket.vn`
*Mật khẩu cho tất cả tài khoản sau khi đăng ký sẽ tùy ý bạn vì đây là mockup db nếu dùng auth thật thì tự đăng ký qua UI với các email trên.* (Supabase Auth user cần được tạo qua giao diện UI hoặc CLI để link với bảng public.users).

## Deploy lên Vercel

1. Push code lên GitHub.
2. Tạo project mới trên [Vercel](https://vercel.com).
3. Import repository.
4. Add toàn bộ các Environment Variables từ `.env.local` vào Vercel (bỏ qua `NEXT_PUBLIC_SITE_URL` hoặc để là URL của Vercel sinh ra).
5. Deploy!

## Cấu hình PWA
Ứng dụng đã được tích hợp `next-pwa`. Khi người dùng truy cập trên Mobile/Desktop Chrome có thể chọn cài đặt App thông qua trình duyệt.
