-- ==========================================
-- COURSEMARKET VN - PHASE 11 MIGRATIONS
-- ==========================================
-- 1. Thêm cột EXP và Chuỗi ngày học vào bảng users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS exp_points INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_study_date DATE;
-- 2. Tạo bảng notes (Ghi chú theo timestamp video)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    timestamp_sec INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notes" ON public.notes FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);
-- 3. Tạo bảng certificates (Chứng chỉ hoàn thành)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cert_url TEXT,
    UNIQUE(user_id, course_id)
);
-- RLS for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view certificates (for sharing)" ON public.certificates FOR
SELECT USING (true);
-- 4. Tạo bảng coupons (Mã giảm giá do GV tạo)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL CHECK (
        discount_percent > 0
        AND discount_percent <= 100
    ),
    max_uses INT,
    current_uses INT DEFAULT 0,
    valid_until TIMESTAMP WITH TIME ZONE,
    instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage their own coupons" ON public.coupons FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Anyone can check a coupon" ON public.coupons FOR
SELECT USING (true);
-- 5. Helper RPC to add EXP securely
CREATE OR REPLACE FUNCTION public.add_exp(user_id_param UUID, amount INT) RETURNS VOID AS $$ BEGIN
UPDATE public.users
SET exp_points = exp_points + amount
WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 6. Helper RPC to update Streak (gọi hàng ngày nếu học viên login/học)
CREATE OR REPLACE FUNCTION public.update_streak(user_id_param UUID) RETURNS VOID AS $$
DECLARE last_date DATE;
cur_streak INT;
today DATE := CURRENT_DATE;
BEGIN
SELECT last_study_date,
    current_streak INTO last_date,
    cur_streak
FROM public.users
WHERE id = user_id_param;
IF last_date IS NULL
OR last_date < today - 1 THEN -- Quên học hơn 1 ngày -> đứt chuỗi, reset về 1
UPDATE public.users
SET current_streak = 1,
    last_study_date = today
WHERE id = user_id_param;
ELSIF last_date = today - 1 THEN -- Đã học hôm qua -> tăng chuỗi 1 ngày
UPDATE public.users
SET current_streak = cur_streak + 1,
    last_study_date = today
WHERE id = user_id_param;
ELSE -- Hôm nay đã update rồi, bỏ qua
NULL;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;