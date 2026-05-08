# Hướng dẫn API & Webhooks

Dự án sử dụng Next.js Route Handlers để xử lý các logic phía Server và Supabase RPC cho các thao tác Database bảo mật.

## 1. Next.js API Routes

### Thanh toán (Payments)
- `POST /api/payments/create`: Tạo giao dịch và lấy URL thanh toán.
  - Body: `{ courseId, method }`
- `GET/POST /api/payments/vnpay/callback`: Xử lý dữ liệu trả về từ VNPay (Frontend redirect).
- `POST /api/payments/vnpay/ipn`: Xử lý cập nhật trạng thái đơn hàng (Server-to-Server) cho VNPay.
- `POST /api/payments/momo/ipn`: Xử lý cập nhật trạng thái đơn hàng cho MoMo.

### Webhooks
- `POST /api/webhooks/supabase`: Lắng nghe các thay đổi từ Supabase (nếu có dùng Edge Functions/External Webhooks).

## 2. Supabase RPC (Remote Procedure Calls)

Các hàm này được gọi từ Frontend thông qua `supabase.rpc('function_name', { params })`.

- `add_exp(user_id_param, amount)`: Tăng EXP cho người dùng.
- `update_streak(user_id_param)`: Cập nhật chuỗi ngày học (gọi khi người dùng hoàn thành bài học đầu tiên trong ngày).
- `check_coupon(code_param, course_id_param)`: Kiểm tra tính hợp lệ và lấy % giảm giá của mã coupon.

## 3. Luồng xử lý Thanh toán (IPN Logic)

Để đảm bảo tính toàn vẹn, việc mở khóa khóa học **LUÔN LUÔN** thực hiện tại Route IPN:

1. Provider gửi yêu cầu đến IPN URL.
2. Kiểm tra chữ ký (Signature/Checksum) dựa trên `Secret Key`.
3. Kiểm tra số tiền có khớp với bản ghi `payments` trong Database không.
4. Nếu hợp lệ:
   - Cập nhật `payments.status = 'paid'`.
   - Tạo bản ghi mới trong `enrollments`.
   - Gửi Email xác nhận cho khách hàng.
5. Phản hồi cho Provider theo format quy định (thường là JSON `{"RspCode": "00", "Message": "Confirm Success"}`).

## 4. Quản lý File (Storage)

- `thumbnails`: Public bucket. URL format: `storage/v1/object/public/thumbnails/filename`.
- `videos`: Private bucket. Cần dùng `createSignedUrl` để xem video.
