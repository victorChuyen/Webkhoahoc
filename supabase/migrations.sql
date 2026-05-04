-- ==========================================
-- COURSEMARKET VN - DATABASE MIGRATIONS
-- ==========================================
-- Run this in Supabase SQL Editor
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ==========================================
-- TABLE: users
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    provider TEXT DEFAULT 'email' CHECK (provider IN ('email', 'google', 'github')),
    role TEXT CHECK (role IN ('admin', 'instructor', 'student')) DEFAULT 'student',
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==========================================
-- TABLE: categories
-- ==========================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==========================================
-- TABLE: courses
-- ==========================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price_vnd INTEGER DEFAULT 0,
    price_usd NUMERIC(10, 2) DEFAULT 0,
    instructor_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        thumbnail_url TEXT,
        preview_video_url TEXT,
        modules JSONB DEFAULT '[]'::JSONB,
        -- Module format: [{"id":"1","title":"...","video_url":"...","duration":300,"payment":1}]
        level TEXT CHECK (
            level IN ('beginner', 'intermediate', 'advanced')
        ) DEFAULT 'beginner',
        language TEXT DEFAULT 'vi',
        published BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        total_students INTEGER DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        avg_rating NUMERIC(3, 2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==========================================
-- TABLE: course_categories (pivot)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.course_categories (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);
-- ==========================================
-- TABLE: enrollments
-- ==========================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress JSONB DEFAULT '{}'::JSONB,
    -- Progress format: {"module_id": true/false, "last_module": "module_id"}
    completion_percentage INTEGER DEFAULT 0,
    UNIQUE (user_id, course_id)
);
-- ==========================================
-- TABLE: payments
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        course_id UUID REFERENCES public.courses(id) ON DELETE
    SET NULL,
        amount_vnd INTEGER,
        amount_usd NUMERIC(10, 2),
        currency TEXT DEFAULT 'VND' CHECK (currency IN ('VND', 'USD')),
        payment_method TEXT CHECK (
            payment_method IN ('vnpay', 'momo', 'paypal', 'mock')
        ),
        status TEXT DEFAULT 'pending' CHECK (
            status IN ('pending', 'paid', 'failed', 'refunded')
        ),
        provider_ref TEXT,
        -- Transaction ID from payment provider
        metadata JSONB DEFAULT '{}'::JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(payment_method, provider_ref)
);
-- ==========================================
-- TABLE: reviews
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);
-- ==========================================
-- VIEW: revenue_daily
-- ==========================================
CREATE OR REPLACE VIEW public.revenue_daily AS
SELECT DATE(created_at) AS date,
    SUM(amount_vnd) AS total_revenue_vnd,
    SUM(amount_usd) AS total_revenue_usd,
    COUNT(id) AS total_payments
FROM public.payments
WHERE status = 'paid'
GROUP BY DATE(created_at)
ORDER BY date;
-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses (instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses (published);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments (created_at);
-- ==========================================
-- TRIGGERS: updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_courses_updated_at BEFORE
UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE
UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- ==========================================
-- TRIGGER: sync Supabase auth.users → public.users
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.users (id, email, full_name, avatar_url, provider)
VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
-- USERS policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR
SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);
-- COURSES policies
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR
SELECT USING (
        published = true
        OR auth.uid() = instructor_id
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Instructors can create courses" ON public.courses FOR
INSERT WITH CHECK (
        auth.uid() = instructor_id
        AND EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('instructor', 'admin')
        )
    );
CREATE POLICY "Instructors can update their own courses" ON public.courses FOR
UPDATE USING (
        auth.uid() = instructor_id
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ENROLLMENTS policies
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.courses c
            WHERE c.id = course_id
                AND c.instructor_id = auth.uid()
        )
    );
CREATE POLICY "System can create enrollments" ON public.enrollments FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollment progress" ON public.enrollments FOR
UPDATE USING (auth.uid() = user_id);
-- PAYMENTS policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Users can create payments" ON public.payments FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update payments" ON public.payments FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- REVIEWS policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR
SELECT USING (true);
CREATE POLICY "Enrolled users can create reviews" ON public.reviews FOR
INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.enrollments
            WHERE user_id = auth.uid()
                AND course_id = reviews.course_id
        )
    );
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR
UPDATE USING (auth.uid() = user_id);
-- CATEGORIES policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- COURSE_CATEGORIES policies
CREATE POLICY "Course categories are viewable by everyone" ON public.course_categories FOR
SELECT USING (true);
CREATE POLICY "Instructors can manage their course categories" ON public.course_categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.courses c
        WHERE c.id = course_id
            AND c.instructor_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ==========================================
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard > Storage
-- ==========================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);