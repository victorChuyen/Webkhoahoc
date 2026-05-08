# Kiến trúc hệ thống (Architecture)

Tài liệu này mô tả cấu trúc tổng thể và các lựa chọn công nghệ của dự án CourseMarket VN.

## 1. Tech Stack

- **Frontend:**
  - [Next.js 14](https://nextjs.org/) (App Router): Server Components, Streaming, API Routes.
  - [Tailwind CSS](https://tailwindcss.com/): Styling.
  - [Framer Motion](https://www.framer.com/motion/): Animations & Transitions.
  - [Lucide React](https://lucide.dev/): Icons.
  - [Next-PWA](https://github.com/shadowwalker/next-pwa): Progressive Web App support.
- **Backend & Database:**
  - [Supabase](https://supabase.com/): PostgreSQL, Auth, Storage, Real-time.
- **Payments:**
  - VNPay (Thanh toán nội địa/Quốc tế).
  - MoMo (Ví điện tử).
  - PayPal (Thanh toán quốc tế).
- **Languages:**
  - TypeScript (Strict mode).

## 2. Cấu trúc thư mục (Folder Structure)

```text
/
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API)
│   │   ├── (auth)/         # Routes liên quan đến Authentication
│   │   ├── (dashboard)/    # Dashboard cho Admin, Instructor, Student
│   │   ├── api/            # API Routes (Webhooks, Payment IPNs)
│   │   └── courses/        # Course listings và detail pages
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Atomic components (Button, Input, etc.)
│   │   ├── layout/         # Header, Footer, Sidebar
│   │   └── course/         # Course-specific components
│   ├── lib/                # Shared utilities, Supabase client, Payment helpers
│   ├── types/              # TypeScript definitions & interfaces
│   └── middleware.ts       # Auth guarding & Role-based redirection
├── supabase/               # Database migrations, seeds, RLS definitions
├── public/                 # Static assets (images, icons)
├── Docs/                   # Tài liệu kỹ thuật dự án
└── next.config.js          # Next.js configuration (PWA, domains, etc.)
```

## 3. Luồng dữ liệu (Data Flow)

### Authentication
1. Người dùng đăng nhập qua Supabase Auth (Email, Google, GitHub).
2. Supabase Trigger tự động đồng bộ dữ liệu sang bảng `public.users`.
3. Next.js Middleware kiểm tra JWT và phân quyền (Role) để cho phép truy cập các Route tương ứng.

### Học tập & Tiến độ
1. Khi học viên xem video, tiến độ được cập nhật qua API lên bảng `enrollments` (JSONB field).
2. Hệ thống tính toán `% hoàn thành` dựa trên số lượng module đã học.
3. Khi đạt 100%, một bản ghi tự động được tạo trong bảng `certificates`.

### Thanh toán
1. Người dùng chọn khóa học -> Chọn phương thức thanh toán.
2. Server tạo URL thanh toán (VNPay/MoMo) và redirect người dùng.
3. Sau khi người dùng thanh toán thành công, Provider gọi về `api/payments/webhook`.
4. Server xác thực chữ ký (Checksum) -> Cập nhật trạng thái `paid` -> Tự động Enroll học viên vào khóa học.

## 4. Quản lý Trạng thái (State Management)

- **Server State:** Sử dụng dữ liệu trực tiếp từ Supabase qua Server Components.
- **Client State:** Sử dụng React Hooks (useState, useEffect) cho các tương tác UI nhỏ.
- **Form State:** React Hook Form cho các form phức tạp.
