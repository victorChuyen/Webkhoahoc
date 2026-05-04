// ==========================================
// COURSEMARKET VN - TypeScript Types
// ==========================================

export type UserRole = 'admin' | 'instructor' | 'student';
export type AuthProvider = 'email' | 'google' | 'github';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type PaymentMethod = 'vnpay' | 'momo' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type Currency = 'VND' | 'USD';

export interface User {
    id: string;
    email: string;
    provider: AuthProvider;
    role: UserRole;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    exp_points?: number;
    current_streak?: number;
    last_study_date?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CourseModule {
    id: string;
    title: string;
    video_url: string;
    duration: number; // seconds
    order: number;
    description?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    short_description: string | null;
    price_vnd: number;
    price_usd: number;
    instructor_id: string | null;
    thumbnail_url: string | null;
    preview_video_url: string | null;
    modules: CourseModule[];
    level: CourseLevel;
    language: string;
    published: boolean;
    featured: boolean;
    total_students: number;
    total_reviews: number;
    avg_rating: number;
    created_at: string;
    updated_at: string;
    // Joined
    instructor?: User;
    categories?: Category[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    created_at: string;
}

export interface EnrollmentProgress {
    [moduleId: string]: boolean | string | undefined;
    last_module?: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    completed_at: string | null;
    progress: EnrollmentProgress;
    completion_percentage: number;
    // Joined
    course?: Course;
    user?: User;
}

export interface Payment {
    id: string;
    user_id: string;
    course_id: string;
    amount_vnd: number | null;
    amount_usd: number | null;
    currency: Currency;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    provider_ref: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    // Joined
    course?: Pick<Course, 'id' | 'title' | 'thumbnail_url'>;
    user?: Pick<User, 'id' | 'email' | 'full_name'>;
}

export interface Review {
    id: string;
    user_id: string;
    course_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>;
}

// ==========================================
// Dashboard / Analytics Types
// ==========================================

export interface RevenueDataPoint {
    month: string;
    vnpay: number;
    momo: number;
    paypal: number;
    total: number;
}

export interface CourseStats {
    courseId: string;
    courseTitle: string;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
}

export interface DashboardStats {
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    totalPayments: number;
    revenueGrowth: number;
    studentGrowth: number;
}

export interface Note {
    id: string;
    user_id: string;
    course_id: string;
    module_id: string;
    timestamp_sec: number;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    issue_date: string;
    cert_url: string | null;
}

export interface Coupon {
    id: string;
    code: string;
    discount_percent: number;
    max_uses: number | null;
    current_uses: number;
    valid_until: string | null;
    instructor_id: string;
    course_id: string;
    created_at: string;
}

export interface QnAComment {
    id: string;
    user_id: string;
    course_id: string;
    module_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    // Joined user info for display
    user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>;
    // For nested UI mapping
    replies?: QnAComment[];
}
