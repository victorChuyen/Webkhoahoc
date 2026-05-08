# Danh sách tính năng (Features)

Tài liệu này liệt kê và mô tả các tính năng đã triển khai và các module chính của CourseMarket VN.

## 1. Authentication & Phân quyền
- **Đăng ký/Đăng nhập:** Hỗ trợ Email/Password và Social Login (Google, GitHub) qua Supabase.
- **Vai trò (Roles):**
  - `Admin`: Toàn quyền quản trị hệ thống, duyệt khóa học, quản lý người dùng, xem báo cáo doanh thu tổng.
  - `Instructor`: Tạo và quản lý khóa học, quản lý mã giảm giá, xem doanh thu cá nhân.
  - `Student`: Tìm kiếm, mua và học các khóa học, quản lý tiến độ, nhận chứng chỉ.

## 2. Quản lý khóa học (LMS Core)
- **Course Builder:** Cho phép giảng viên tạo Module và bài học (Video URL từ YouTube/Vimeo/S3).
- **Phân loại:** Gắn Tags và Categories để dễ dàng tìm kiếm.
- **Tìm kiếm & Lọc:** Tìm kiếm theo tên, giảng viên, mức giá, cấp độ (Beginner/Advanced).
- **Video Player:** Trình phát video tùy chỉnh hỗ trợ ghi chú (Notes) trực tiếp tại mốc thời gian (timestamp).

## 3. Hệ thống Thanh toán
- **Đa phương thức:**
  - **VNPay:** QR Code, Thẻ ATM nội địa, Thẻ quốc tế.
  - **MoMo:** Quét mã QR hoặc App-to-App.
  - **PayPal:** Checkout nhanh bằng tài khoản PayPal hoặc Thẻ quốc tế.
- **Tự động hóa:** Tự động mở khóa khóa học ngay khi thanh toán thành công (xử lý qua Webhook/IPN).

## 4. Gamification (Tăng tương tác)
- **EXP & Levels:** Nhận điểm kinh nghiệm khi hoàn thành bài học, làm bài tập.
- **Streak:** Khuyến khích học tập hàng ngày bằng chuỗi ngày học liên tục.
- **Bảng xếp hạng:** Hiển thị học viên tiêu biểu dựa trên EXP.

## 5. Affiliate (Tiếp thị liên kết)
- **Referral Link:** Mỗi học viên có thể trở thành người giới thiệu.
- **Commission:** Nhận hoa hồng (tính theo %) khi người được giới thiệu mua khóa học thành công.
- **Dashboard:** Theo dõi số lượng click, lượt đăng ký và số tiền hoa hồng tích lũy.

## 6. Email Automation
- **Email Sequence:** Tự động gửi email chào mừng, email nhắc nhở học tập khi học viên bỏ dở khóa học quá lâu.
- **Thông báo:** Email xác nhận thanh toán thành công và cấp chứng chỉ.

## 7. Mobile Friendly & PWA
- **Giao diện Responsive:** Tối ưu hóa cho tất cả các loại màn hình.
- **PWA:** Có thể cài đặt trực tiếp vào điện thoại/máy tính như một ứng dụng Native, hỗ trợ Offline cache cơ bản.
