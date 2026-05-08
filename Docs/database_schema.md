# Thiết kế Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng PostgreSQL trên nền tảng Supabase. Dưới đây là chi tiết các bảng và quan hệ.

## 1. Các bảng cốt lõi (Core Tables)

### `users`
Lưu trữ thông tin người dùng, đồng bộ từ Supabase Auth.
- `id`: UUID (Primary Key, khớp với Auth ID).
- `email`: TEXT (Unique).
- `role`: admin, instructor, student.
- `exp_points`: Điểm kinh nghiệm (Gamification).
- `current_streak`: Chuỗi ngày học liên tục.

### `courses`
Lưu trữ thông tin khóa học.
- `instructor_id`: References `users.id`.
- `modules`: JSONB (Danh sách các bài học, video URL, thời lượng).
- `price_vnd`: Giá tiền Việt Nam.
- `published`: Boolean (Trạng thái hiển thị).

### `categories` & `course_categories`
Phân loại khóa học (nhiều - nhiều).

### `enrollments`
Lưu trữ quan hệ đăng ký giữa học viên và khóa học.
- `progress`: JSONB (Theo dõi bài học đã hoàn thành).
- `completion_percentage`: Tỷ lệ hoàn thành.

### `payments`
Lưu trữ lịch sử giao dịch.
- `status`: pending, paid, failed, refunded.
- `payment_method`: vnpay, momo, paypal.
- `provider_ref`: Mã giao dịch từ đối tác thanh toán.

## 2. Tính năng mở rộng (Extended Tables)

### `notes`
Ghi chú của học viên tại các mốc thời gian (timestamp) của video.

### `certificates`
Chứng chỉ cấp sau khi hoàn thành 100% khóa học.

### `coupons`
Mã giảm giá do giảng viên tạo cho khóa học của họ.

### `referrals` & `commissions` (Affiliate)
- `referrals`: Theo dõi ai giới thiệu ai.
- `commissions`: Tính toán tiền hoa hồng cho người giới thiệu khi có đơn hàng thành công.

## 3. Bảo mật Dữ liệu (Row Level Security - RLS)

Dự án áp dụng RLS triệt để để đảm bảo an toàn dữ liệu:
- **`courses`**: Bất kỳ ai cũng có thể xem khóa học đã `published`. Chỉ giảng viên sở hữu hoặc Admin mới có quyền chỉnh sửa.
- **`enrollments`**: Chỉ học viên sở hữu, Giảng viên khóa học đó, hoặc Admin mới có quyền xem thông tin đăng ký.
- **`payments`**: Chỉ người thực hiện giao dịch hoặc Admin mới có quyền xem.
- **`notes`**: Chỉ chủ sở hữu ghi chú mới có quyền xem/sửa/xóa.

## 4. Functions & Triggers (PL/pgSQL)

- `handle_new_user()`: Tự động tạo record trong `public.users` khi có user mới đăng ký qua Auth.
- `add_exp(user_id, amount)`: RPC bảo mật để tăng EXP cho người dùng.
- `update_streak(user_id)`: Logic cập nhật chuỗi ngày học hàng ngày.
- `handle_updated_at()`: Tự động cập nhật cột `updated_at`.

## 5. View & Analytics

- `revenue_daily`: View thống kê doanh thu theo ngày phục vụ cho Admin Dashboard.
