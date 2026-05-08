# Hướng dẫn Triển khai (Deployment)

Tài liệu này hướng dẫn cách đưa dự án lên môi trường Production.

## 1. Yêu cầu hệ thống
- Node.js 18.x trở lên.
- Tài khoản Supabase.
- Tài khoản đối tác thanh toán (VNPay Sandbox, MoMo Test, PayPal Developer).

## 2. Thiết lập Supabase

1. **Khởi tạo Database:**
   - Copy nội dung `supabase/migrations.sql` và chạy trong SQL Editor.
   - (Tùy chọn) Chạy `supabase/seed.sql` để có dữ liệu mẫu.
   - Chạy các script bổ sung: `migrations_phase11.sql`, `add_gamification_affiliate.sql`, `add_email_sequences.sql`.

2. **Cấu hình Storage:**
   - Tạo các Buckets: `thumbnails` (Public), `avatars` (Public), `videos` (Private).

3. **Cấu hình Auth:**
   - Bật Email Provider trong Dashboard.
   - Thêm Redirect URL: `http://localhost:3000/auth/callback` (Local) và `https://your-domain.com/auth/callback` (Prod).

## 3. Biến môi trường (Environment Variables)

Tạo file `.env.local` hoặc cấu hình trên Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# VNPay
VNPAY_TMN_CODE=...
VNPAY_SECURE_SECRET=...
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# MoMo
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

## 4. Deploy lên Vercel

1. Kết nối Repository GitHub với Vercel.
2. Thêm toàn bộ các biến môi trường trên.
3. Vercel sẽ tự động phát hiện Next.js và thực hiện build.
4. **Lưu ý:** Đảm bảo `NEXT_PUBLIC_SITE_URL` khớp với tên miền Vercel cấp để xử lý Callback thanh toán chính xác.

## 5. Cấu hình Domain & SSL
- Sử dụng domain riêng và đảm bảo SSL (HTTPS) được kích hoạt vì các cổng thanh toán bắt buộc dùng HTTPS cho URL Callback/IPN.

## 6. Bảo trì định kỳ
- **Backup:** Sử dụng tính năng Backup của Supabase.
- **Logs:** Kiểm tra Edge Function Logs và Vercel Logs để phát hiện lỗi thanh toán hoặc lỗi hệ thống.
