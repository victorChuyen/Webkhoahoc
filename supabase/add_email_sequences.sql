-- ==========================================
-- EMAIL SEQUENCE AUTOMATION
-- Chạy trong Supabase SQL Editor
-- ==========================================
-- Bảng chuỗi email mẫu theo từng khóa học
CREATE TABLE IF NOT EXISTS public.email_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL DEFAULT 1,
    delay_days INTEGER NOT NULL DEFAULT 0,
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Bảng log gửi email (tránh gửi trùng)
CREATE TABLE IF NOT EXISTS public.email_send_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id),
    sequence_id UUID REFERENCES public.email_sequences(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'opened', 'clicked'))
);
-- RLS policies
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
-- Drop nếu đã tồn tại (tránh lỗi duplicate)
DROP POLICY IF EXISTS "Admin and instructors can manage email sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Admin can view email logs" ON public.email_send_log;
CREATE POLICY "Admin and instructors can manage email sequences" ON public.email_sequences FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'instructor')
    )
);
CREATE POLICY "Admin can view email logs" ON public.email_send_log FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ==========================================
-- Seed email mẫu: Lấy khóa học ĐẦU TIÊN có trong DB
-- (Dùng SELECT thay vì hardcode UUID)
-- ==========================================
DO $$
DECLARE v_course_id UUID;
v_course_title TEXT;
v_admin_id UUID;
BEGIN -- Lấy admin user đầu tiên
SELECT id INTO v_admin_id
FROM public.users
WHERE role = 'admin'
LIMIT 1;
-- Lấy khóa học đầu tiên
SELECT id,
    title INTO v_course_id,
    v_course_title
FROM public.courses
LIMIT 1;
IF v_course_id IS NULL THEN RAISE NOTICE 'Không tìm thấy khóa học nào. Bỏ qua seed data.';
RETURN;
END IF;
RAISE NOTICE 'Tạo email sequence cho khóa: % (ID: %)',
v_course_title,
v_course_id;
-- Xóa data cũ nếu có
DELETE FROM public.email_sequences
WHERE course_id = v_course_id;
-- Step 1: Chào mừng (gửi ngay)
INSERT INTO public.email_sequences (
        course_id,
        step_order,
        delay_days,
        subject,
        body_template,
        created_by
    )
VALUES (
        v_course_id,
        1,
        0,
        'Chào mừng bạn đến với {course_name}! 🎉',
        'Chào {student_name},' || E'\n\n' || 'Cảm ơn bạn đã đăng ký khóa "{course_name}"!' || E'\n\n' || 'Để bắt đầu tốt nhất:' || E'\n' || '1. Xem video giới thiệu đầu tiên' || E'\n' || '2. Tham gia nhóm Q&A để hỏi đáp' || E'\n' || '3. Đặt mục tiêu hoàn thành 1 bài/ngày' || E'\n\n' || 'Chúc bạn học vui! 🚀' || E'\n' || 'Đội ngũ CourseMarket VN',
        v_admin_id
    );
-- Step 2: Check-in 3 ngày
INSERT INTO public.email_sequences (
        course_id,
        step_order,
        delay_days,
        subject,
        body_template,
        created_by
    )
VALUES (
        v_course_id,
        2,
        3,
        '3 ngày đầu tiên - Bạn đang làm tốt lắm! ⚡',
        'Chào {student_name},' || E'\n\n' || 'Bạn đã đăng ký "{course_name}" được 3 ngày rồi!' || E'\n' || 'Tiến độ hiện tại: {progress}' || E'\n\n' || 'Mẹo: Hãy dành ít nhất 30 phút mỗi ngày để xem video và thực hành.' || E'\n\n' || 'Nếu cần hỗ trợ, reply email này nhé!' || E'\n' || 'Đội ngũ CourseMarket VN',
        v_admin_id
    );
-- Step 3: 7 ngày
INSERT INTO public.email_sequences (
        course_id,
        step_order,
        delay_days,
        subject,
        body_template,
        created_by
    )
VALUES (
        v_course_id,
        3,
        7,
        '1 tuần rồi! Hãy kiểm tra tiến độ 📊',
        'Chào {student_name},' || E'\n\n' || 'Đã 1 tuần kể từ khi bạn bắt đầu "{course_name}".' || E'\n' || 'Tiến độ: {progress}' || E'\n\n' || '💡 Bạn có biết? Học viên hoàn thành trong 2 tuần đầu có tỷ lệ thành công cao gấp 3 lần!' || E'\n\n' || 'Hãy tiếp tục nhé! 💪' || E'\n' || 'Đội ngũ CourseMarket VN',
        v_admin_id
    );
-- Step 4: 30 ngày (ưu đãi)
INSERT INTO public.email_sequences (
        course_id,
        step_order,
        delay_days,
        subject,
        body_template,
        created_by
    )
VALUES (
        v_course_id,
        4,
        30,
        '🔥 Đừng bỏ cuộc - Ưu đãi đặc biệt dành cho bạn!',
        'Chào {student_name},' || E'\n\n' || 'Đã 30 ngày và chúng tôi nhận thấy bạn chưa hoàn thành "{course_name}".' || E'\n\n' || 'Chúng tôi hiểu - cuộc sống bận rộn! Nhưng đừng bỏ lỡ kiến thức bạn đã đầu tư.' || E'\n\n' || '🎁 ĐẶC BIỆT: Reply email này để nhận GIẢM 20% cho khóa tiếp theo!' || E'\n\n' || 'Đội ngũ CSKH CourseMarket VN',
        v_admin_id
    );
RAISE NOTICE 'Đã tạo 4 email sequence cho khóa: %',
v_course_title;
END $$;