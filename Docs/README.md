# CourseMarket VN Documentation

Chào mừng bạn đến với tài liệu kỹ thuật của dự án **CourseMarket VN**. Thư mục này chứa toàn bộ thông tin cần thiết để hiểu, vận hành, nâng cấp và bảo trì hệ thống.

## Mục lục tài liệu

1. **[Kiến trúc hệ thống (Architecture)](./architecture.md)**
   - Tổng quan về Tech Stack, cấu trúc thư mục và luồng dữ liệu.
2. **[Thiết kế Cơ sở dữ liệu (Database Schema)](./database_schema.md)**
   - Chi tiết các bảng, quan hệ, RLS Policies và Functions/Triggers.
3. **[Danh sách tính năng (Features)](./features.md)**
   - Chi tiết các module chính: Khóa học, Thanh toán, Gamification, Affiliate.
4. **[Hướng dẫn API & Webhooks](./api_endpoints.md)**
   - Các API Routes, Supabase RPC và luồng xử lý thanh toán IPN.
5. **[Hướng dẫn Triển khai (Deployment)](./deployment.md)**
   - Các bước cài đặt môi trường, cấu hình Supabase và deploy lên Vercel.
6. **[Hướng dẫn Phát triển (Contributing)](./contributing.md)**
   - Quy chuẩn code, cách thêm tính năng mới và quy trình bảo trì.

---

## Tổng quan dự án

- **Tên dự án:** CourseMarket VN
- **Mục tiêu:** Nền tảng bán khóa học trực tuyến (E-learning Marketplace) tập trung vào thị trường Việt Nam.
- **Công nghệ cốt lõi:** Next.js 14, Supabase, Tailwind CSS, TypeScript.
- **Thanh toán:** VNPay, MoMo, PayPal.

## Sơ đồ luồng chính (High-level)

1. **Học viên:** Tìm khóa học -> Đăng ký/Thanh toán -> Học (Video + Note) -> Nhận chứng chỉ.
2. **Giảng viên:** Tạo khóa học -> Đăng video/tài liệu -> Quản lý doanh thu/Coupon.
3. **Admin:** Duyệt khóa học -> Quản lý người dùng -> Thống kê hệ thống.
