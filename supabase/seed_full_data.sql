-- ==========================================
-- COURSEMARKET VN - COMPREHENSIVE SEED DATA
-- Chạy file này SAU KHI đã chạy migrations.sql + seed.sql gốc
-- File này sẽ: Tạo bảng Notes/QnA + Đổ dữ liệu thực tế
-- ==========================================
-- =====================
-- BƯỚC 0: TẠO BẢNG NOTES & QNA (NẾU CHƯA CÓ)
-- =====================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    timestamp_sec INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notes'
        AND policyname = 'Users can view their own notes'
) THEN CREATE POLICY "Users can view their own notes" ON public.notes FOR
SELECT USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notes'
        AND policyname = 'Users can insert their own notes'
) THEN CREATE POLICY "Users can insert their own notes" ON public.notes FOR
INSERT WITH CHECK (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notes'
        AND policyname = 'Users can update their own notes'
) THEN CREATE POLICY "Users can update their own notes" ON public.notes FOR
UPDATE USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'notes'
        AND policyname = 'Users can delete their own notes'
) THEN CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);
END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.qna_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.qna_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.qna_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'qna_comments'
        AND policyname = 'Everyone can view comments'
) THEN CREATE POLICY "Everyone can view comments" ON public.qna_comments FOR
SELECT USING (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'qna_comments'
        AND policyname = 'Users can insert comments'
) THEN CREATE POLICY "Users can insert comments" ON public.qna_comments FOR
INSERT WITH CHECK (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'qna_comments'
        AND policyname = 'Users can update their own comments'
) THEN CREATE POLICY "Users can update their own comments" ON public.qna_comments FOR
UPDATE USING (auth.uid() = user_id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'qna_comments'
        AND policyname = 'Users can delete their own comments'
) THEN CREATE POLICY "Users can delete their own comments" ON public.qna_comments FOR DELETE USING (auth.uid() = user_id);
END IF;
END $$;
-- =====================
-- PHẦN 1: THÊM INSTRUCTORS
-- =====================
INSERT INTO public.users (
        id,
        email,
        provider,
        role,
        full_name,
        avatar_url,
        bio
    )
VALUES (
        '00000000-0000-0000-0000-000000000002',
        'thao.nguyen@instructor.vn',
        'email',
        'instructor',
        'Nguyễn Thanh Thảo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=thao',
        'Chuyên gia Data Science với 8 năm kinh nghiệm tại FPT Software.'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'minh.le@instructor.vn',
        'email',
        'instructor',
        'Lê Quang Minh',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
        'UX Designer tại Tiki, Google UX Certificate.'
    ) ON CONFLICT (id) DO NOTHING;
-- =====================
-- PHẦN 2: CẬP NHẬT GIÁ & PHÂN BỔ INSTRUCTOR
-- =====================
UPDATE public.courses
SET price_vnd = 499000,
    price_usd = 20,
    instructor_id = '00000000-0000-0000-0000-000000000001',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000001';
UPDATE public.courses
SET price_vnd = 799000,
    price_usd = 32,
    instructor_id = '00000000-0000-0000-0000-000000000001',
    level = 'intermediate',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000002';
UPDATE public.courses
SET price_vnd = 1299000,
    price_usd = 52,
    instructor_id = '00000000-0000-0000-0000-000000000001',
    level = 'advanced',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000003';
UPDATE public.courses
SET price_vnd = 599000,
    price_usd = 24,
    instructor_id = '00000000-0000-0000-0000-000000000001',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000004';
UPDATE public.courses
SET price_vnd = 1499000,
    price_usd = 60,
    instructor_id = '00000000-0000-0000-0000-000000000001',
    level = 'advanced',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000005';
UPDATE public.courses
SET price_vnd = 899000,
    price_usd = 36,
    instructor_id = '00000000-0000-0000-0000-000000000002',
    level = 'intermediate',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000006';
UPDATE public.courses
SET price_vnd = 399000,
    price_usd = 16,
    instructor_id = '00000000-0000-0000-0000-000000000002',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000007';
UPDATE public.courses
SET price_vnd = 299000,
    price_usd = 12,
    instructor_id = '00000000-0000-0000-0000-000000000002',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000008';
UPDATE public.courses
SET price_vnd = 1799000,
    price_usd = 72,
    instructor_id = '00000000-0000-0000-0000-000000000002',
    level = 'advanced',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000009';
UPDATE public.courses
SET price_vnd = 699000,
    price_usd = 28,
    instructor_id = '00000000-0000-0000-0000-000000000002',
    level = 'intermediate',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000010';
UPDATE public.courses
SET price_vnd = 599000,
    price_usd = 24,
    instructor_id = '00000000-0000-0000-0000-000000000003',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000011';
UPDATE public.courses
SET price_vnd = 999000,
    price_usd = 40,
    instructor_id = '00000000-0000-0000-0000-000000000003',
    level = 'intermediate',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000012';
UPDATE public.courses
SET price_vnd = 449000,
    price_usd = 18,
    instructor_id = '00000000-0000-0000-0000-000000000003',
    level = 'beginner',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000013';
UPDATE public.courses
SET price_vnd = 1599000,
    price_usd = 64,
    instructor_id = '00000000-0000-0000-0000-000000000003',
    level = 'advanced',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000014';
UPDATE public.courses
SET price_vnd = 799000,
    price_usd = 32,
    instructor_id = '00000000-0000-0000-0000-000000000003',
    level = 'intermediate',
    language = 'vi'
WHERE id = '30000000-0000-0000-0000-000000000015';
-- =====================
-- PHẦN 3: TẠO 15 HỌC VIÊN
-- =====================
INSERT INTO public.users (id, email, provider, role, full_name, avatar_url)
VALUES (
        '40000000-0000-0000-0000-000000000001',
        'hoa.pham@gmail.com',
        'email',
        'student',
        'Phạm Thị Thu Hoa',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        'duc.tran@gmail.com',
        'email',
        'student',
        'Trần Văn Đức',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=duc'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'linh.nguyen@gmail.com',
        'email',
        'student',
        'Nguyễn Thùy Linh',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=linh'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        'nam.le@gmail.com',
        'email',
        'student',
        'Lê Hoàng Nam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=nam'
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        'mai.vo@gmail.com',
        'email',
        'student',
        'Võ Ngọc Mai',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=mai'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        'hung.dao@gmail.com',
        'email',
        'student',
        'Đào Quốc Hưng',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=hung'
    ),
    (
        '40000000-0000-0000-0000-000000000007',
        'thuy.bui@gmail.com',
        'email',
        'student',
        'Bùi Minh Thủy',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=thuy'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        'khanh.hoang@gmail.com',
        'email',
        'student',
        'Hoàng Gia Khánh',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=khanh'
    ),
    (
        '40000000-0000-0000-0000-000000000009',
        'trang.dinh@gmail.com',
        'email',
        'student',
        'Đinh Thu Trang',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=trang'
    ),
    (
        '40000000-0000-0000-0000-000000000010',
        'son.phan@gmail.com',
        'email',
        'student',
        'Phan Thanh Sơn',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=son'
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        'yen.truong@gmail.com',
        'email',
        'student',
        'Trương Thị Yến',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=yen'
    ),
    (
        '40000000-0000-0000-0000-000000000012',
        'tuan.ngo@gmail.com',
        'email',
        'student',
        'Ngô Anh Tuấn',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan'
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        'hanh.ly@gmail.com',
        'email',
        'student',
        'Lý Ngọc Hạnh',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=hanh'
    ),
    (
        '40000000-0000-0000-0000-000000000014',
        'quang.dang@gmail.com',
        'email',
        'student',
        'Đặng Minh Quang',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=quang'
    ),
    (
        '40000000-0000-0000-0000-000000000015',
        'ngoc.ha@gmail.com',
        'email',
        'student',
        'Hà Thị Ngọc',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=ngoc'
    ) ON CONFLICT (id) DO NOTHING;
-- =====================
-- PHẦN 4: TẠO ENROLLMENTS (dùng enrolled_at, KHÔNG dùng created_at)
-- =====================
INSERT INTO public.enrollments (
        user_id,
        course_id,
        completion_percentage,
        progress
    )
VALUES (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        66,
        '{"m0-1": true, "m0-2": true, "m0-3": false, "last_module": "m0-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000006',
        33,
        '{"m5-1": true, "m5-2": false, "m5-3": false, "last_module": "m5-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        100,
        '{"m0-1": true, "m0-2": true, "m0-3": true, "last_module": "m0-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        66,
        '{"m1-1": true, "m1-2": true, "m1-3": false, "last_module": "m1-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000005',
        33,
        '{"m4-1": true, "m4-2": false, "m4-3": false, "last_module": "m4-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        0,
        '{"last_module": "m2-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        100,
        '{"m0-1": true, "m0-2": true, "m0-3": true, "last_module": "m0-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000004',
        100,
        '{"m3-1": true, "m3-2": true, "m3-3": true, "last_module": "m3-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000009',
        66,
        '{"m8-1": true, "m8-2": true, "m8-3": false, "last_module": "m8-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000007',
        0,
        '{}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000002',
        33,
        '{"m1-1": true, "m1-2": false, "m1-3": false, "last_module": "m1-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000011',
        66,
        '{"m10-1": true, "m10-2": true, "m10-3": false, "last_module": "m10-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000007',
        '30000000-0000-0000-0000-000000000008',
        33,
        '{"m7-1": true, "m7-2": false, "m7-3": false, "last_module": "m7-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000003',
        100,
        '{"m2-1": true, "m2-2": true, "m2-3": true, "last_module": "m2-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000005',
        100,
        '{"m4-1": true, "m4-2": true, "m4-3": true, "last_module": "m4-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000014',
        33,
        '{"m13-1": true, "m13-2": false, "m13-3": false, "last_module": "m13-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000009',
        '30000000-0000-0000-0000-000000000012',
        0,
        '{}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000010',
        '30000000-0000-0000-0000-000000000004',
        66,
        '{"m3-1": true, "m3-2": true, "m3-3": false, "last_module": "m3-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000010',
        '30000000-0000-0000-0000-000000000010',
        33,
        '{"m9-1": true, "m9-2": false, "m9-3": false, "last_module": "m9-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        '30000000-0000-0000-0000-000000000001',
        100,
        '{"m0-1": true, "m0-2": true, "m0-3": true, "last_module": "m0-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        '30000000-0000-0000-0000-000000000013',
        66,
        '{"m12-1": true, "m12-2": true, "m12-3": false, "last_module": "m12-2"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000012',
        '30000000-0000-0000-0000-000000000006',
        0,
        '{"last_module": "m5-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000002',
        100,
        '{"m1-1": true, "m1-2": true, "m1-3": true, "last_module": "m1-3"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000015',
        33,
        '{"m14-1": true, "m14-2": false, "m14-3": false, "last_module": "m14-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000014',
        '30000000-0000-0000-0000-000000000009',
        33,
        '{"m8-1": true, "m8-2": false, "m8-3": false, "last_module": "m8-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000001',
        33,
        '{"m0-1": true, "m0-2": false, "m0-3": false, "last_module": "m0-1"}'::JSONB
    ),
    (
        '40000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000011',
        0,
        '{}'::JSONB
    ) ON CONFLICT DO NOTHING;
-- =====================
-- PHẦN 5: TẠO PAYMENTS
-- =====================
INSERT INTO public.payments (
        user_id,
        course_id,
        amount_vnd,
        amount_usd,
        currency,
        payment_method,
        status,
        provider_ref,
        created_at
    )
VALUES (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        499000,
        20,
        'VND',
        'vnpay',
        'paid',
        'VNP-S001',
        NOW() - INTERVAL '45 days'
    ),
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000006',
        899000,
        36,
        'VND',
        'momo',
        'paid',
        'MOMO-S001',
        NOW() - INTERVAL '20 days'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        499000,
        20,
        'VND',
        'vnpay',
        'paid',
        'VNP-S002',
        NOW() - INTERVAL '60 days'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        799000,
        32,
        'VND',
        'momo',
        'paid',
        'MOMO-S002',
        NOW() - INTERVAL '30 days'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000005',
        1499000,
        60,
        'VND',
        'paypal',
        'paid',
        'PP-S002',
        NOW() - INTERVAL '10 days'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        1299000,
        52,
        'VND',
        'vnpay',
        'paid',
        'VNP-S003',
        NOW() - INTERVAL '5 days'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        499000,
        20,
        'VND',
        'momo',
        'paid',
        'MOMO-S004',
        NOW() - INTERVAL '90 days'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000004',
        599000,
        24,
        'VND',
        'vnpay',
        'paid',
        'VNP-S004',
        NOW() - INTERVAL '50 days'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000009',
        1799000,
        72,
        'VND',
        'paypal',
        'paid',
        'PP-S004',
        NOW() - INTERVAL '15 days'
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000007',
        399000,
        16,
        'VND',
        'momo',
        'paid',
        'MOMO-S005',
        NOW() - INTERVAL '2 days'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000002',
        799000,
        32,
        'VND',
        'vnpay',
        'paid',
        'VNP-S006',
        NOW() - INTERVAL '25 days'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000011',
        599000,
        24,
        'VND',
        'momo',
        'paid',
        'MOMO-S006',
        NOW() - INTERVAL '35 days'
    ),
    (
        '40000000-0000-0000-0000-000000000007',
        '30000000-0000-0000-0000-000000000008',
        299000,
        12,
        'VND',
        'vnpay',
        'paid',
        'VNP-S007',
        NOW() - INTERVAL '12 days'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000003',
        1299000,
        52,
        'VND',
        'paypal',
        'paid',
        'PP-S008',
        NOW() - INTERVAL '80 days'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000005',
        1499000,
        60,
        'VND',
        'vnpay',
        'paid',
        'VNP-S008',
        NOW() - INTERVAL '40 days'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000014',
        1599000,
        64,
        'VND',
        'momo',
        'paid',
        'MOMO-S008',
        NOW() - INTERVAL '7 days'
    ),
    (
        '40000000-0000-0000-0000-000000000009',
        '30000000-0000-0000-0000-000000000012',
        999000,
        40,
        'VND',
        'vnpay',
        'paid',
        'VNP-S009',
        NOW() - INTERVAL '1 day'
    ),
    (
        '40000000-0000-0000-0000-000000000010',
        '30000000-0000-0000-0000-000000000004',
        599000,
        24,
        'VND',
        'momo',
        'paid',
        'MOMO-S010',
        NOW() - INTERVAL '28 days'
    ),
    (
        '40000000-0000-0000-0000-000000000010',
        '30000000-0000-0000-0000-000000000010',
        699000,
        28,
        'VND',
        'vnpay',
        'paid',
        'VNP-S010',
        NOW() - INTERVAL '14 days'
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        '30000000-0000-0000-0000-000000000001',
        499000,
        20,
        'VND',
        'paypal',
        'paid',
        'PP-S011',
        NOW() - INTERVAL '70 days'
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        '30000000-0000-0000-0000-000000000013',
        449000,
        18,
        'VND',
        'vnpay',
        'paid',
        'VNP-S011',
        NOW() - INTERVAL '18 days'
    ),
    (
        '40000000-0000-0000-0000-000000000012',
        '30000000-0000-0000-0000-000000000006',
        899000,
        36,
        'VND',
        'momo',
        'paid',
        'MOMO-S012',
        NOW() - INTERVAL '3 days'
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000002',
        799000,
        32,
        'VND',
        'vnpay',
        'paid',
        'VNP-S013',
        NOW() - INTERVAL '55 days'
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000015',
        799000,
        32,
        'VND',
        'paypal',
        'paid',
        'PP-S013',
        NOW() - INTERVAL '8 days'
    ),
    (
        '40000000-0000-0000-0000-000000000014',
        '30000000-0000-0000-0000-000000000009',
        1799000,
        72,
        'VND',
        'vnpay',
        'paid',
        'VNP-S014',
        NOW() - INTERVAL '22 days'
    ),
    (
        '40000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000001',
        499000,
        20,
        'VND',
        'momo',
        'paid',
        'MOMO-S015',
        NOW() - INTERVAL '16 days'
    ),
    (
        '40000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000011',
        599000,
        24,
        'VND',
        'vnpay',
        'paid',
        'VNP-S015B',
        NOW() - INTERVAL '4 days'
    ) ON CONFLICT DO NOTHING;
-- =====================
-- PHẦN 6: REVIEWS
-- =====================
INSERT INTO public.reviews (user_id, course_id, rating, comment)
VALUES (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        5,
        'Khóa học cực kỳ chi tiết, dễ hiểu!'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        5,
        'Áp dụng ngay vào dự án thực tế!'
    ),
    (
        '40000000-0000-0000-0000-000000000011',
        '30000000-0000-0000-0000-000000000001',
        4,
        'Nội dung tốt, bài tập cuối hơi khó.'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000003',
        5,
        'Khóa hay nhất về AI clone!'
    ),
    (
        '40000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000002',
        5,
        'Cursor + Copilot tăng 10x productivity!'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000011',
        5,
        'UI/UX với v0 quá đỉnh!'
    ) ON CONFLICT DO NOTHING;
-- =====================
-- PHẦN 7: CẬP NHẬT THỐNG KÊ
-- =====================
UPDATE public.courses
SET total_students = 5,
    total_reviews = 3,
    avg_rating = 4.7
WHERE id = '30000000-0000-0000-0000-000000000001';
UPDATE public.courses
SET total_students = 3,
    total_reviews = 1,
    avg_rating = 5.0
WHERE id = '30000000-0000-0000-0000-000000000002';
UPDATE public.courses
SET total_students = 2,
    total_reviews = 1,
    avg_rating = 5.0
WHERE id = '30000000-0000-0000-0000-000000000003';
UPDATE public.courses
SET total_students = 2
WHERE id = '30000000-0000-0000-0000-000000000004';
UPDATE public.courses
SET total_students = 2
WHERE id = '30000000-0000-0000-0000-000000000005';
UPDATE public.courses
SET total_students = 2
WHERE id = '30000000-0000-0000-0000-000000000006';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000007';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000008';
UPDATE public.courses
SET total_students = 2
WHERE id = '30000000-0000-0000-0000-000000000009';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000010';
UPDATE public.courses
SET total_students = 2,
    total_reviews = 1,
    avg_rating = 5.0
WHERE id = '30000000-0000-0000-0000-000000000011';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000012';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000013';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000014';
UPDATE public.courses
SET total_students = 1
WHERE id = '30000000-0000-0000-0000-000000000015';
-- =====================
-- PHẦN 8: Q&A COMMENTS
-- =====================
INSERT INTO public.qna_comments (
        id,
        user_id,
        course_id,
        module_id,
        content,
        parent_id,
        created_at
    )
VALUES (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'm0-1',
        'Thầy ơi, cài đặt môi trường dùng WSL được không ạ?',
        NULL,
        NOW() - INTERVAL '58 days'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'm0-1',
        'Được em nhé! WSL2 hoạt động rất tốt.',
        '50000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '57 days'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        'm0-2',
        'Bài thực hành rất tuyệt vời!',
        NULL,
        NOW() - INTERVAL '48 days'
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'm0-2',
        'API key ở phút 12:30 lấy ở đâu?',
        NULL,
        NOW() - INTERVAL '40 days'
    ),
    (
        '50000000-0000-0000-0000-000000000005',
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'm0-2',
        'Vào Settings > API Keys nhé.',
        '50000000-0000-0000-0000-000000000004',
        NOW() - INTERVAL '39 days'
    ) ON CONFLICT DO NOTHING;
-- =====================
-- PHẦN 9: NOTES
-- =====================
INSERT INTO public.notes (
        user_id,
        course_id,
        module_id,
        timestamp_sec,
        content,
        created_at
    )
VALUES (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'm0-1',
        120,
        'Cần nhớ: Cài Node.js >= 18',
        NOW() - INTERVAL '59 days'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'm0-1',
        450,
        'SSR vs CSR trong Next.js',
        NOW() - INTERVAL '59 days'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        'm0-1',
        60,
        'Link docs: nextjs.org/docs',
        NOW() - INTERVAL '88 days'
    ),
    (
        '40000000-0000-0000-0000-000000000008',
        '30000000-0000-0000-0000-000000000003',
        'm2-1',
        240,
        'Kiến trúc: Next.js -> API -> OpenAI',
        NOW() - INTERVAL '78 days'
    ) ON CONFLICT DO NOTHING;
-- ==========================================
-- DONE! Tổng cộng:
-- ✅ Tạo bảng notes + qna_comments (nếu chưa có)
-- ✅ 2 Instructors mới
-- ✅ 15 Students mới
-- ✅ 15 khóa học cập nhật giá (299K-1.8M VNĐ)
-- ✅ 27 Enrollments
-- ✅ 27 Payments (VNPay/MoMo/PayPal)
-- ✅ 6 Reviews
-- ✅ 5 Q&A Comments
-- ✅ 4 Notes
-- ==========================================