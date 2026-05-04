import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Plus, BookOpen, Users, DollarSign, Star, Edit, Eye } from 'lucide-react';

async function getInstructorData(instructorId: string) {
    const supabase = createClient();
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

    const courseIds = (courses || []).map(c => c.id);
    let totalStudents = 0, totalRevenue = 0;
    if (courseIds.length > 0) {
        const { data: payments } = await supabase
            .from('payments')
            .select('amount_vnd')
            .in('course_id', courseIds)
            .eq('status', 'paid');
        totalRevenue = (payments || []).reduce((s, o) => s + (o.amount_vnd || 0), 0);
        const { count } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('course_id', courseIds);
        totalStudents = count || 0;
    }

    return { courses: courses || [], totalStudents, totalRevenue };
}

export default async function InstructorDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { courses, totalStudents, totalRevenue } = await getInstructorData(user.id);

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold mb-1">Instructor Dashboard</h1>
                        <p className="text-muted-foreground">Quản lý khóa học và doanh thu</p>
                    </div>
                    <Button variant="gradient" asChild>
                        <Link href="/instructor/courses/new">
                            <Plus size={16} className="mr-2" /> Tạo khóa học
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Tổng khóa học', value: courses.length, icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Học viên', value: totalStudents, icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'Doanh thu', value: formatCurrency(totalRevenue, 'VND'), icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', isText: true },
                    ].map(stat => (
                        <Card key={stat.label} className="stat-card">
                            <CardContent className="p-5">
                                <div className={`inline-flex p-2.5 rounded-xl mb-3 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-2xl font-display font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Courses list */}
                <Card>
                    <CardContent className="p-0">
                        {courses.length === 0 ? (
                            <div className="text-center py-16">
                                <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
                                <p className="font-medium mb-1">Bạn chưa có khóa học nào</p>
                                <p className="text-sm text-muted-foreground mb-4">Tạo khóa học đầu tiên để bắt đầu kiếm thu nhập</p>
                                <Button variant="gradient" asChild>
                                    <Link href="/instructor/courses/new"><Plus size={16} className="mr-2" /> Tạo khóa học</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Khóa học</th>
                                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Trạng thái</th>
                                            <th className="text-right py-3 px-4 font-semibold text-muted-foreground hidden md:table-cell">Giá</th>
                                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground hidden lg:table-cell">Học viên</th>
                                            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map(course => (
                                            <tr key={course.id} className="border-b border-border/50 hover:bg-muted/20">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}
                                                            alt={course.title}
                                                            className="w-14 h-10 rounded-lg object-cover shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-medium line-clamp-1">{course.title}</p>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                                                <span className="text-xs text-muted-foreground">{course.avg_rating > 0 ? course.avg_rating : '—'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge variant={course.published ? 'success' : 'secondary'}>
                                                        {course.published ? '✅ Đã đăng' : '⏳ Nháp'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right hidden md:table-cell font-semibold text-primary">
                                                    {course.price_vnd > 0 ? formatCurrency(course.price_vnd, 'VND') : 'Miễn phí'}
                                                </td>
                                                <td className="py-3 px-4 text-center hidden lg:table-cell">{course.total_students}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                                            <Link href={`/courses/${course.id}`}><Eye size={14} /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                                            <Link href={`/instructor/courses/${course.id}/edit`}><Edit size={14} /></Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
