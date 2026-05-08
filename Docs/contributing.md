# Hướng dẫn Phát triển (Contributing)

Chào mừng bạn tham gia phát triển CourseMarket VN! Dưới đây là các quy chuẩn để đảm bảo dự án luôn ổn định và dễ nâng cấp.

## 1. Quy trình phát triển (Workflow)

1. **Clone project** và cài đặt: `npm install`.
2. **Tạo nhánh mới:** `git checkout -b feature/ten-tinh-nang`.
3. **Phát triển & Test Local:** Chạy `npm run dev` và kiểm tra trên trình duyệt.
4. **Linting:** Chạy `npm run lint` để đảm bảo code sạch.
5. **Commit:** Sử dụng [Conventional Commits](https://www.conventionalcommits.org/) (ví dụ: `feat: add gamification badge system`).
6. **Push & Create PR:** Đẩy code lên và tạo Pull Request để review.

## 2. Quy chuẩn Code (Coding Standards)

- **TypeScript:** Tuyệt đối không dùng `any`. Luôn định nghĩa Interface/Type rõ ràng trong thư mục `src/types`.
- **Component:**
  - Sử dụng Functional Components và Hooks.
  - Chia nhỏ component nếu nó vượt quá 200 dòng code.
  - Đặt component UI vào `src/components/ui`.
- **Styling:** Sử dụng Tailwind CSS Utility Classes. Hạn chế viết CSS thuần trừ trường hợp bất khả kháng.
- **Naming:** 
  - File/Folder: `kebab-case` hoặc `PascalCase` cho component.
  - Biến/Hàm: `camelCase`.

## 3. Thêm tính năng liên quan đến Database

- Không sửa trực tiếp trên DB qua Dashboard nếu có thể. Hãy viết script SQL vào thư mục `supabase/`.
- Nếu thêm bảng mới, nhớ cấu hình **RLS Policies**. Dữ liệu mặc định nên là `private` trừ khi có lý do để công khai.
- Cập nhật lại tài liệu `Docs/database_schema.md` sau khi thay đổi cấu trúc DB.

## 4. Xử lý lỗi (Error Handling)

- Sử dụng `try-catch` trong các Route Handler.
- Phản hồi lỗi với Status Code phù hợp (400 cho bad request, 401 cho unauthorized, 500 cho server error).
- Hiển thị thông báo thân thiện với người dùng qua Toast (ví dụ: `react-hot-toast` hoặc `sonner`).

## 5. Kiểm thử (Testing)

- **Manual Test:** Kiểm tra luồng thanh toán bằng Sandbox (VNPay/MoMo test cards).
- **Edge cases:** Kiểm tra khi người dùng không đăng nhập, khi hết hạn phiên, khi nhập sai mã coupon.

---

Cảm ơn bạn đã đóng góp cho sự phát triển của CourseMarket VN!
