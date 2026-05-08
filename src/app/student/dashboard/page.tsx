import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Enrollment, Payment } from '@/types';
import { BookOpen, Clock, Award, ShoppingBag, PlayCircle, ArrowRight, TrendingUp } from 'lucide-react';

async function getStudentData(userId: string) {
    const supabase = createClient();
    const [enrollmentsRes, paymentsRes] = await Promise.all([
        supabase.from('enrollments')
            .select('*, course:courses(id, title, thumbnail_url, modules, price_vnd)')
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false }),
        supabase.from('payments')
            .select('*, course:courses(id, title, thumbnail_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);
    return {
        enrollments: (enrollmentsRes.data || []) as unknown as Enrollment[],
        payments: (paymentsRes.data || []) as unknown as Payment[],
    };
}

const PAYMENT_STATUS_BADGE: Record<string, any> = {
    paid: { label: '✅ Thành công', variant: 'success' },
    pending: { label: '⏳ Chờ xử lý', variant: 'warning' },
    failed: { label: '❌ Thất bại', variant: 'destructive' },
    refunded: { label: '🔄 Hoàn tiền', variant: 'secondary' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
    vnpay: '🏦 VNPay', momo: '💜 MoMo', paypal: '🌐 PayPal',
};

export default async function StudentDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/student/dashboard');

    const { enrollments, payments } = await getStudentData(user.id);

    const stats = {
        inProgress: enrollments.filter(e => e.completion_percentage < 100 && e.completion_percentage > 0).length,
        completed: enrollments.filter(e => e.completion_percentage === 100).length,
        totalSpent: payments.filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.amount_vnd || 0), 0),
    };

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-1">Dashboard Học viên</h1>
                    <p className="text-muted-foreground">Tiếp tục hành trình học tập của bạn</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Khóa học đã đăng ký', value: enrollments.length, icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Đang học', value: stats.inProgress, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Hoàn thành', value: stats.completed, icon: Award, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Đã chi tiêu', value: formatCurrency(stats.totalSpent, 'VND'), icon: ShoppingBag, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', isText: true },
                    ].map((stat) => (
                        <Card key={stat.label} className="stat-card">
                            <CardContent className="p-5">
                                <div className={`inline-flex p-2.5 rounded-xl mb-3 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-2xl font-display font-bold mb-0.5">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions: Gamification + Affiliate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link href="/student/checkin">
                        <Card className="stat-card hover:shadow-lg transition-all cursor-pointer border-violet-200 dark:border-violet-800 hover:scale-[1.02]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="inline-flex p-2.5 rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Check-in Hằng Ngày</p>
                                    <p className="text-[11px] text-muted-foreground">Nhận EXP + Streak + Tokens</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/student/leaderboard">
                        <Card className="stat-card hover:shadow-lg transition-all cursor-pointer border-amber-200 dark:border-amber-800 hover:scale-[1.02]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="inline-flex p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Bảng Xếp Hạng</p>
                                    <p className="text-[11px] text-muted-foreground">Top học viên nổi bật</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/student/affiliate">
                        <Card className="stat-card hover:shadow-lg transition-all cursor-pointer border-emerald-200 dark:border-emerald-800 hover:scale-[1.02]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="inline-flex p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Affiliate Program</p>
                                    <p className="text-[11px] text-muted-foreground">Giới thiệu — nhận hoa hồng</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* My Courses */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold">Khóa học của tôi</h2>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/courses">Tìm thêm <ArrowRight size={14} className="ml-1" /></Link>
                            </Button>
                        </div>

                        {enrollments.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
                                    <p className="font-medium mb-1">Bạn chưa đăng ký khóa học nào</p>
                                    <p className="text-sm text-muted-foreground mb-4">Hãy bắt đầu học ngay hôm nay!</p>
                                    <Button asChild><Link href="/courses">Khám phá khóa học</Link></Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {enrollments.map((enrollment) => {
                                    const course = (enrollment as any).course;
                                    const totalModules = (course?.modules || []).length;
                                    return (
                                        <Card key={enrollment.id} className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex gap-4 p-4">
                                                    <div className="w-24 h-18 rounded-xl overflow-hidden shrink-0 relative">
                                                        <Image
                                                            src={course?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                                                            alt={course?.title || ''}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                                                            {course?.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="flex-1 progress-bar">
                                                                <div
                                                                    className="progress-bar-fill"
                                                                    style={{ width: `${enrollment.completion_percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground shrink-0">
                                                                {enrollment.completion_percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button size="sm" variant="gradient" asChild>
                                                                <Link href={`/student/courses/${course?.id}/learn`}>
                                                                    <PlayCircle size={14} className="mr-1" />
                                                                    {enrollment.completion_percentage > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                                                                </Link>
                                                            </Button>
                                                            <span className="text-xs text-muted-foreground">
                                                                {totalModules > 0 ? `${Math.round(enrollment.completion_percentage / 100 * totalModules)}/${totalModules} bài` : ''}
                                                            </span>
                                                            {enrollment.completion_percentage === 100 && (
                                                                <Badge variant="success" className="text-xs">✅ Hoàn thành</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent payments */}
                    <div>
                        <h2 className="text-xl font-display font-bold mb-4">Lịch sử thanh toán</h2>
                        {payments.length === 0 ? (
                            <Card className="text-center py-8">
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Chưa có giao dịch nào</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => {
                                    const statusInfo = PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.pending;
                                    return (
                                        <Card key={payment.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 relative">
                                                        <Image
                                                            src={(payment as any).course?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium line-clamp-1">{(payment as any).course?.title}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</p>
                                                        <div className="flex items-center justify-between mt-1.5">
                                                            <span className="text-xs font-bold text-primary">
                                                                {payment.amount_vnd ? formatCurrency(payment.amount_vnd, 'VND') : `$${payment.amount_usd}`}
                                                            </span>
                                                            <Badge variant={statusInfo.variant} className="text-xs">
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {PAYMENT_METHOD_LABEL[payment.payment_method]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
