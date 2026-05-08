import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'vi' | 'en';

interface I18nState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
    persist(
        (set) => ({
            language: 'vi',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'i18n-storage',
        }
    )
);

// Dictionary
export const translations = {
    vi: {
        // Navbar
        nav_courses: 'Khóa học',
        nav_dashboard: 'Dashboard',
        nav_login: 'Đăng nhập',
        nav_register: 'Đăng ký',
        nav_profile: 'Hồ sơ cá nhân',
        nav_logout: 'Đăng xuất',
        nav_light_mode: 'Chế độ sáng',
        nav_dark_mode: 'Chế độ tối',

        // Home - Hero
        home_hero_badge: 'Nền tảng học Online #1 Việt Nam',
        home_hero_title: 'Học kỹ năng của tương lai từ chuyên gia',
        home_hero_subtitle: 'Cùng hơn 50,000 học viên tại CourseMarket VN chinh phục các kỹ năng mới. Không giới hạn thời gian, học mọi lúc mọi nơi.',
        home_hero_cta: 'Bắt đầu ngay',
        home_hero_trial: 'Học thử miễn phí',
        home_hero_stats_students: '50K+',
        home_hero_stats_students_label: 'Học viên',
        home_hero_stats_courses: '200+',
        home_hero_stats_courses_label: 'Khóa học chất lượng',
        home_hero_stats_rating: '4.8/5',
        home_hero_stats_rating_label: 'Đánh giá trung bình',
        home_hero_stats_instructors: '200+',
        home_hero_stats_instructors_label: 'Giảng viên',
        home_hero_stats_certs: '30,000+',
        home_hero_stats_certs_label: 'Chứng chỉ cấp',

        // Home - Features
        home_features_1_title: 'Học linh hoạt',
        home_features_1_desc: 'Học mọi lúc, mọi nơi trên mọi thiết bị',
        home_features_2_title: 'Chứng chỉ uy tín',
        home_features_2_desc: 'Chứng chỉ được doanh nghiệp công nhận',
        home_features_3_title: 'Cập nhật liên tục',
        home_features_3_desc: 'Nội dung luôn được cập nhật theo xu hướng',
        home_features_4_title: 'Thanh toán dễ dàng',
        home_features_4_desc: 'VNPay, MoMo, PayPal đều được hỗ trợ',

        // Home - Featured
        home_featured_badge: 'Nổi bật',
        home_featured_title: 'Khóa học được yêu thích',
        home_featured_subtitle: 'Nâng cấp kỹ năng với các khóa học hàng đầu trị trường.',
        home_featured_view_all: 'Xem tất cả',
        home_course_free: 'Miễn phí',
        home_course_level_beginner: 'Cơ bản',
        home_course_level_intermediate: 'Trung cấp',
        home_course_level_advanced: 'Nâng cao',

        // Home - How it works
        home_how_badge: 'Quy trình',
        home_how_title: 'Lộ trình thành công',
        home_how_subtitle: 'Học tập đúng cách, rút ngắn thời gian tới mục tiêu.',
        home_how_1_title: '1. Chọn khóa học',
        home_how_1_desc: 'Tìm khóa học phù hợp với định hướng nghề nghiệp của bạn.',
        home_how_2_title: '2. Học qua thực hành',
        home_how_2_desc: 'Vừa học video vừa làm bài tập thực tế để nhớ lâu hơn.',
        home_how_3_title: '3. Lấy chứng chỉ',
        home_how_3_desc: 'Nâng cấp portfolio và ghi điểm tối đa với nhà tuyển dụng.',

        // Home - Testimonials
        home_testi_badge: 'Học viên nói gì',
        home_testi_title: 'Câu chuyện thành công',
        home_testi_subtitle: 'Hàng ngàn học viên đã thay đổi sự nghiệp cùng CourseMarket VN.',

        // Footer
        footer_desc: 'Nền tảng học trực tuyến hàng đầu Việt Nam. Học từ các chuyên gia, phát triển kỹ năng, thay đổi nghề nghiệp.',
        footer_courses: 'Khóa học',
        footer_instructor: 'Giảng viên / Admin',
        footer_instructor_role: 'Chuyên gia AI & Web',
        footer_support: 'Hỗ trợ',
        footer_help: 'Trợ giúp',
        footer_privacy: 'Chính sách bảo mật',
        footer_terms: 'Điều khoản sử dụng',
        footer_refund: 'Chính sách hoàn tiền',
        footer_rights: 'CourseMarket VN. Bảo lưu mọi quyền.',
        footer_cat_web: 'Lập trình Web',
        footer_cat_data: 'Data Science',
        footer_cat_design: 'UI/UX Design',
        footer_cat_marketing: 'Digital Marketing',
        footer_cat_ai: 'AI & Machine Learning',

        // Auth
        auth_login_title: 'Đăng nhập',
        auth_login_subtitle: 'Chào mừng trở lại!',
        auth_login_desc: 'Tiếp tục hành trình học tập của bạn. Hàng ngàn học viên đang chờ bạn.',
        auth_login_no_account: 'Chưa có tài khoản?',
        auth_login_register_free: 'Đăng ký miễn phí',
        auth_login_google: 'Tiếp tục với Google',
        auth_login_github: 'Tiếp tục với GitHub',
        auth_login_or_email: 'hoặc đăng nhập bằng email',
        auth_login_forgot: 'Quên mật khẩu?',
        auth_login_button: 'Đăng nhập',
        auth_login_loading: 'Đang đăng nhập...',
        auth_login_success: '✅ Đăng nhập thành công!',
        auth_login_failed: 'Đăng nhập thất bại',
        auth_login_invalid: 'Email hoặc mật khẩu không đúng',

        auth_register_title: 'Tạo tài khoản miễn phí',
        auth_register_has_account: 'Đã có tài khoản?',
        auth_register_login_now: 'Đăng nhập',
        auth_register_role_student: 'Học viên',
        auth_register_role_student_desc: 'Tôi muốn học',
        auth_register_role_instructor: 'Giảng viên',
        auth_register_role_instructor_desc: 'Tôi muốn dạy',
        auth_register_fullname: 'Họ và tên',
        auth_register_fullname_placeholder: 'Nguyễn Văn A',
        auth_register_password_hint: 'Ít nhất 8 ký tự, 1 hoa, 1 số',
        auth_register_confirm_password: 'Xác nhận mật khẩu',
        auth_register_confirm_password_placeholder: 'Nhập lại mật khẩu',
        auth_register_button: '🚀 Tạo tài khoản miễn phí',
        auth_register_loading: 'Đang tạo tài khoản...',
        auth_register_success: '🎉 Đăng ký thành công!',
        auth_register_check_email: 'Vui lòng kiểm tra email để xác nhận tài khoản.',
        auth_register_failed: 'Đăng ký thất bại',
        auth_register_email_exists: 'Email này đã được đăng ký',
        auth_register_terms: 'Bằng cách đăng ký, bạn đồng ý với',
        auth_register_tos: 'Điều khoản dịch vụ',
        auth_register_and: 'và',
        auth_register_privacy: 'Chính sách bảo mật',

        // Forgot Password
        auth_forgot_title: 'Quên mật khẩu',
        auth_forgot_desc: 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu.',
        auth_forgot_button: 'Gửi yêu cầu',
        auth_forgot_success: '✅ Đã gửi email hướng dẫn đặt lại mật khẩu!',
        auth_reset_title: 'Đặt lại mật khẩu',
        auth_reset_button: 'Cập nhật mật khẩu',
        auth_reset_success: '✅ Mật khẩu đã được cập nhật thành công!',

        // Profile
        profile_title: 'Hồ sơ cá nhân',
        profile_tab_info: 'Thông tin chung',
        profile_tab_security: 'Bảo mật',
        profile_change_password: 'Đổi mật khẩu',
        profile_current_password: 'Mật khẩu hiện tại',
        profile_new_password: 'Mật khẩu mới',
        profile_confirm_new_password: 'Xác nhận mật khẩu mới',
        profile_update_success: '✅ Cập nhật thông tin thành công!',

        // Courses Search
        courses_explore_title: 'Khám phá khóa học',
        courses_explore_desc: 'Hơn 500+ khóa học từ các chuyên gia hàng đầu',
        courses_search_placeholder: 'Tìm kiếm khóa học...',
        courses_search_btn: 'Tìm kiếm',
        courses_filter_level: 'Cấp độ',
        courses_filter_category: 'Danh mục',
        courses_level_all: 'Tất cả cấp độ',
        courses_level_beginner: 'Cơ bản',
        courses_level_intermediate: 'Trung cấp',
        courses_level_advanced: 'Nâng cao',
        courses_count_text: 'khóa học',
        courses_count_for: 'cho',
        courses_not_found_title: 'Không tìm thấy khóa học',
        courses_not_found_desc: 'Thử tìm kiếm với từ khóa khác',
        courses_view_all: 'Xem tất cả khóa học',
    },
    en: {
        // Navbar
        nav_courses: 'Courses',
        nav_dashboard: 'Dashboard',
        nav_login: 'Log in',
        nav_register: 'Sign up',
        nav_profile: 'Profile',
        nav_logout: 'Log out',
        nav_light_mode: 'Light Mode',
        nav_dark_mode: 'Dark Mode',

        // Home - Hero
        home_hero_badge: '#1 Online Learning Platform in VN',
        home_hero_title: 'Learn Future Skills from Experts',
        home_hero_subtitle: 'Join over 50,000 students at CourseMarket VN to master new skills. Lifetime access, learn anywhere anytime.',
        home_hero_cta: 'Start Learning',
        home_hero_trial: 'Start Free Trial',
        home_hero_stats_students: '50K+',
        home_hero_stats_students_label: 'Students',
        home_hero_stats_courses: '200+',
        home_hero_stats_courses_label: 'Top Courses',
        home_hero_stats_rating: '4.8/5',
        home_hero_stats_rating_label: 'Avg Rating',
        home_hero_stats_instructors: '200+',
        home_hero_stats_instructors_label: 'Instructors',
        home_hero_stats_certs: '30,000+',
        home_hero_stats_certs_label: 'Certificates issued',

        // Home - Features
        home_features_1_title: 'Flexible Learning',
        home_features_1_desc: 'Learn anytime, anywhere on any device',
        home_features_2_title: 'Trusted Certificates',
        home_features_2_desc: 'Certificates recognized by top companies',
        home_features_3_title: 'Regular Updates',
        home_features_3_desc: 'Content always updated with latest trends',
        home_features_4_title: 'Easy Payments',
        home_features_4_desc: 'VNPay, MoMo, PayPal all supported',

        // Home - Featured
        home_featured_badge: 'Featured',
        home_featured_title: 'Featured Courses',
        home_featured_subtitle: 'Upgrade your skills with our top-rated courses.',
        home_featured_view_all: 'View All',
        home_course_free: 'Free',
        home_course_level_beginner: 'Beginner',
        home_course_level_intermediate: 'Intermediate',
        home_course_level_advanced: 'Advanced',

        // Home - How it works
        home_how_badge: 'Process',
        home_how_title: 'Your Path to Success',
        home_how_subtitle: 'Learn the right way, achieve your goals faster.',
        home_how_1_title: '1. Choose a Course',
        home_how_1_desc: 'Find the perfect course for your career goals.',
        home_how_2_title: '2. Learn by Doing',
        home_how_2_desc: 'Watch videos and complete real-world projects.',
        home_how_3_title: '3. Get Certified',
        home_how_3_desc: 'Boost your portfolio and impress employers.',

        // Home - Testimonials
        home_testi_badge: 'Testimonials',
        home_testi_title: 'Success Stories',
        home_testi_subtitle: 'Thousands of students have transformed their careers with us.',

        // Footer
        footer_desc: 'Vietnam\'s leading online learning platform. Learn from experts, develop skills, transform your career.',
        footer_courses: 'Courses',
        footer_instructor: 'Instructor / Admin',
        footer_instructor_role: 'AI & Web Expert',
        footer_support: 'Support',
        footer_help: 'Help Center',
        footer_privacy: 'Privacy Policy',
        footer_terms: 'Terms of Service',
        footer_refund: 'Refund Policy',
        footer_rights: 'CourseMarket VN. All rights reserved.',
        footer_cat_web: 'Web Development',
        footer_cat_data: 'Data Science',
        footer_cat_design: 'UI/UX Design',
        footer_cat_marketing: 'Digital Marketing',
        footer_cat_ai: 'AI & Machine Learning',

        // Auth
        auth_login_title: 'Log in',
        auth_login_subtitle: 'Welcome Back!',
        auth_login_desc: 'Continue your learning journey. Thousands of students are waiting for you.',
        auth_login_no_account: 'Don\'t have an account?',
        auth_login_register_free: 'Sign up for free',
        auth_login_google: 'Continue with Google',
        auth_login_github: 'Continue with GitHub',
        auth_login_or_email: 'or log in with email',
        auth_login_forgot: 'Forgot password?',
        auth_login_button: 'Log in',
        auth_login_loading: 'Logging in...',
        auth_login_success: '✅ Logged in successfully!',
        auth_login_failed: 'Login failed',
        auth_login_invalid: 'Invalid email or password',

        auth_register_title: 'Create Free Account',
        auth_register_has_account: 'Already have an account?',
        auth_register_login_now: 'Log in',
        auth_register_role_student: 'Student',
        auth_register_role_student_desc: 'I want to learn',
        auth_register_role_instructor: 'Instructor',
        auth_register_role_instructor_desc: 'I want to teach',
        auth_register_fullname: 'Full Name',
        auth_register_fullname_placeholder: 'John Doe',
        auth_register_password_hint: 'Min 8 chars, 1 upper, 1 number',
        auth_register_confirm_password: 'Confirm Password',
        auth_register_confirm_password_placeholder: 'Re-enter password',
        auth_register_button: '🚀 Create Free Account',
        auth_register_loading: 'Creating account...',
        auth_register_success: '🎉 Registration successful!',
        auth_register_check_email: 'Please check your email to confirm your account.',
        auth_register_failed: 'Registration failed',
        auth_register_email_exists: 'This email is already registered',
        auth_register_terms: 'By signing up, you agree to our',
        auth_register_tos: 'Terms of Service',
        auth_register_and: 'and',
        auth_register_privacy: 'Privacy Policy',

        // Forgot Password
        auth_forgot_title: 'Forgot Password',
        auth_forgot_desc: 'Enter your email to receive a password reset link.',
        auth_forgot_button: 'Send Request',
        auth_forgot_success: '✅ Password reset instructions sent to your email!',
        auth_reset_title: 'Reset Password',
        auth_reset_button: 'Update Password',
        auth_reset_success: '✅ Password updated successfully!',

        // Profile
        profile_title: 'User Profile',
        profile_tab_info: 'General Info',
        profile_tab_security: 'Security',
        profile_change_password: 'Change Password',
        profile_current_password: 'Current Password',
        profile_new_password: 'New Password',
        profile_confirm_new_password: 'Confirm New Password',
        profile_update_success: '✅ Profile updated successfully!',

        // Courses Search
        courses_explore_title: 'Explore Courses',
        courses_explore_desc: 'Over 500+ courses from top experts',
        courses_search_placeholder: 'Search courses...',
        courses_search_btn: 'Search',
        courses_filter_level: 'Level',
        courses_filter_category: 'Category',
        courses_level_all: 'All levels',
        courses_level_beginner: 'Beginner',
        courses_level_intermediate: 'Intermediate',
        courses_level_advanced: 'Advanced',
        courses_count_text: 'courses',
        courses_count_for: 'for',
        courses_not_found_title: 'No courses found',
        courses_not_found_desc: 'Try searching with different keywords',
        courses_view_all: 'View all courses',
    }
};

export function useTranslation() {
    const { language } = useI18nStore();
    const t = (key: keyof typeof translations['vi']): string => {
        return translations[language][key] || key;
    };
    return { t, language };
}
