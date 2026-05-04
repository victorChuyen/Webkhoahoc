-- ==========================================
-- GAMIFICATION: Check-in, EXP, Streak, Tokens
-- Chạy trong Supabase SQL Editor
-- ==========================================
-- Bảng check-in hằng ngày
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    checked_in_at DATE NOT NULL DEFAULT CURRENT_DATE,
    exp_earned INTEGER DEFAULT 10,
    UNIQUE(user_id, checked_in_at)
);
-- Bảng tổng EXP + Streak + Tokens
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_exp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    tokens INTEGER DEFAULT 0,
    last_checkin DATE,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Bảng Affiliate (referral codes + commissions)
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER DEFAULT 10,
    commission_percent INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES public.users(id),
    referred_id UUID REFERENCES public.users(id),
    referral_code TEXT REFERENCES public.referral_codes(code),
    enrollment_id UUID REFERENCES public.enrollments(id),
    commission_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
-- Checkins: users can see/insert own
CREATE POLICY "Users manage own checkins" ON public.checkins FOR ALL USING (auth.uid() = user_id);
-- Gamification: users see own, admin sees all
CREATE POLICY "Users see own gamification" ON public.user_gamification FOR ALL USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Referral codes: users manage own
CREATE POLICY "Users manage own referral codes" ON public.referral_codes FOR ALL USING (auth.uid() = user_id);
-- Referrals: users see own referrals (as referrer)
CREATE POLICY "Users see own referrals" ON public.referrals FOR
SELECT USING (
        auth.uid() = referrer_id
        OR auth.uid() = referred_id
    );
CREATE POLICY "System inserts referrals" ON public.referrals FOR
INSERT WITH CHECK (true);
-- Seed gamification data for existing students
INSERT INTO public.user_gamification (
        user_id,
        total_exp,
        current_streak,
        longest_streak,
        tokens,
        last_checkin,
        level
    )
SELECT id,
    (RANDOM() * 500)::INTEGER + 10,
    (RANDOM() * 7)::INTEGER,
    (RANDOM() * 30)::INTEGER + 1,
    (RANDOM() * 100)::INTEGER,
    CURRENT_DATE - ((RANDOM() * 3)::INTEGER || ' days')::INTERVAL,
    GREATEST(1, ((RANDOM() * 500)::INTEGER / 100) + 1)
FROM public.users
WHERE role = 'student' ON CONFLICT (user_id) DO NOTHING;
-- Seed referral codes for first 5 students
DO $$
DECLARE v_user RECORD;
v_count INTEGER := 0;
BEGIN FOR v_user IN
SELECT id,
    full_name
FROM public.users
WHERE role = 'student'
LIMIT 5 LOOP v_count := v_count + 1;
INSERT INTO public.referral_codes (
        user_id,
        code,
        discount_percent,
        commission_percent
    )
VALUES (
        v_user.id,
        'REF' || UPPER(
            SUBSTRING(
                MD5(v_user.id::text)
                FROM 1 FOR 6
            )
        ),
        10,
        15
    ) ON CONFLICT (code) DO NOTHING;
END LOOP;
RAISE NOTICE 'Created % referral codes',
v_count;
END $$;