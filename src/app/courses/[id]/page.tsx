import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDuration } from '@/lib/utils';
import type { Course } from '@/types';
import {
    Star, Users, Clock, Globe, Award, PlayCircle,
    ChevronRight, BookOpen, CheckCircle2, ShoppingCart
} from 'lucide-react';

async function getCourse(id: string): Promise<Course | null> {
    try {
        const supabase = createClient();
        const { data } = await supabase
            .from('courses')
            .select('*, instructor:users(id, full_name, avatar_url, bio), reviews(id, rating, comment, user:users(id, full_name, avatar_url), created_at)')
            .eq('id', id)
            .eq('published', true)
            .single();
        return data as unknown as Course;
    } catch {
        return null;
    }
}

async function checkEnrollment(courseId: string): Promise<boolean> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', courseId).single();
        return !!data;
    } catch {
        return false;
    }
}

const LEVEL_LABEL: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
    const [course, isEnrolled] = await Promise.all([
        getCourse(params.id),
        checkEnrollment(params.id),
    ]);

    if (!course) {
        // Show demo if DB not configured
        return <DemoCourseDetail />;
    }

    const totalDuration = (course.modules || []).reduce((acc, m) => acc + (m.duration || 0), 0);
    const reviews = (course as any).reviews || [];

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="border-b border-border bg-muted/20 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link href="/courses" className="hover:text-foreground">Khóa học</Link>
                    <ChevronRight size={14} />
                    <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Course info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {LEVEL_LABEL[course.level] || 'Cơ bản'}
                                </span>
                                {course.featured && <Badge className="bg-amber-500 text-white border-0">⭐ Nổi bật</Badge>}
                            </div>
                            <h1 className="text-2xl lg:text-4xl font-display font-bold mb-4 leading-tight">{course.title}</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-4">{course.short_description || course.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="fill-amber-400 text-amber-400" />
                                    <span className="font-bold">{course.avg_rating > 0 ? course.avg_rating.toFixed(1) : '4.8'}</span>
                                    <span className="text-muted-foreground">({course.total_reviews} đánh giá)</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users size={14} /> <span>{course.total_students} học viên</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock size={14} /> <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Globe size={14} /> <span>{course.language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                                </div>
                            </div>

                            {(course as any).instructor && (
                                <div className="flex items-center gap-3 mt-4 p-4 bg-muted/40 rounded-xl">
                                    <img
                                        src={(course as any).instructor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(course as any).instructor.id}`}
                                        alt={(course as any).instructor.full_name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                    />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Giảng viên</p>
                                        <p className="font-semibold">{(course as any).instructor.full_name}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail (mobile) */}
                        <div className="lg:hidden rounded-2xl overflow-hidden">
                            <img src={course.thumbnail_url || ''} alt={course.title} className="w-full aspect-video object-cover" />
                        </div>

                        {/* What you'll learn */}
                        <div className="bg-muted/30 border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-display font-bold mb-4">Bạn sẽ học được gì?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    'Xây dựng ứng dụng thực tế từ đầu đến cuối',
                                    'Nắm vững các best practices trong lĩnh vực',
                                    'Tư duy giải quyết vấn đề chuyên nghiệp',
                                    'Áp dụng kiến thức vào dự án thực tế ngay',
                                    'Cộng đồng hỗ trợ và review code',
                                    'Chứng chỉ hoàn thành được công nhận',
                                ].map(item => (
                                    <div key={item} className="flex items-start gap-2.5">
                                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div>
                            <h2 className="text-xl font-display font-bold mb-4">
                                Nội dung khóa học — {(course.modules || []).length} bài học · {formatDuration(totalDuration)}
                            </h2>
                            <div className="space-y-2">
                                {(course.modules || []).map((module, idx) => (
                                    <div key={module.id} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{module.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                            <PlayCircle size={14} />
                                            {formatDuration(module.duration || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div>
                                <h2 className="text-xl font-display font-bold mb-4">Đánh giá từ học viên</h2>
                                <div className="space-y-4">
                                    {reviews.slice(0, 5).map((review: any) => (
                                        <div key={review.id} className="p-4 border border-border rounded-xl">
                                            <div className="flex items-start gap-3 mb-2">
                                                <img
                                                    src={review.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`}
                                                    alt={review.user?.full_name}
                                                    className="w-9 h-9 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-sm">{review.user?.full_name}</p>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Purchase card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <Card className="overflow-hidden shadow-xl">
                                <div className="relative aspect-video hidden lg:block">
                                    <img src={course.thumbnail_url || ''} alt={course.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <PlayCircle size={56} className="text-white opacity-90" />
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        {course.price_vnd > 0 ? (
                                            <>
                                                <p className="text-3xl font-display font-bold text-primary">{formatCurrency(course.price_vnd, 'VND')}</p>
                                                {course.price_usd > 0 && (
                                                    <p className="text-sm text-muted-foreground">{formatCurrency(course.price_usd, 'USD')}</p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-3xl font-display font-bold text-emerald-500">Miễn phí</p>
                                        )}
                                    </div>

                                    {isEnrolled ? (
                                        <Button variant="gradient" className="w-full mb-3" asChild>
                                            <Link href={`/student/courses/${course.id}/learn`}>
                                                <PlayCircle size={18} className="mr-2" /> Tiếp tục học
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="gradient" className="w-full mb-3" asChild>
                                                <Link href={`/checkout/${course.id}`}>
                                                    <ShoppingCart size={18} className="mr-2" />
                                                    {course.price_vnd > 0 ? 'Đăng ký ngay' : 'Học miễn phí'}
                                                </Link>
                                            </Button>
                                            <p className="text-center text-xs text-muted-foreground">Hoàn tiền 100% trong 30 ngày</p>
                                        </>
                                    )}

                                    <div className="border-t border-border mt-5 pt-5 space-y-2.5">
                                        {[
                                            { icon: BookOpen, text: `${(course.modules || []).length} bài học` },
                                            { icon: Clock, text: `Tổng thời lượng ${formatDuration(totalDuration)}` },
                                            { icon: Globe, text: 'Cập nhật liên tục' },
                                            { icon: Award, text: 'Chứng chỉ hoàn thành' },
                                        ].map(({ icon: Icon, text }) => (
                                            <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <Icon size={16} className="text-primary" /> {text}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DemoCourseDetail() {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cần kết nối Supabase</h2>
            <p className="text-muted-foreground mb-4">Vui lòng cấu hình Supabase và chạy migrations để xem chi tiết khóa học.</p>
            <Button asChild><Link href="/courses">← Quay lại danh sách</Link></Button>
        </div>
    );
}
