import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Users, Search, Mail, BookOpen, MessageSquare, Tag, Phone, Calendar, ExternalLink } from 'lucide-react';
import { ExportButtons } from './ExportButtons';
import { AiCrmButton } from './AiCrmButton';

async function getAdminData(courseIdFilter?: string, search?: string) {
    // Use admin client (service role) to bypass RLS and see ALL enrollments
    const supabase = createAdminClient();

    // 1. Fetch available courses for the filter dropdown
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .order('created_at', { ascending: false });

    // 2. Fetch Enrollments with User, Course data
    // Use enrolled_at (NOT created_at) & price_vnd (NOT price)
    let query = supabase
        .from('enrollments')
        .select(`
            id,
            progress,
            completion_percentage,
            enrolled_at,
            course_id,
            user_id,
            user:users!user_id(id, full_name, email, avatar_url),
            course:courses!course_id(id, title, price_vnd)
        `)
        .order('enrolled_at', { ascending: false });

    if (courseIdFilter && courseIdFilter !== 'all') {
        query = query.eq('course_id', courseIdFilter);
    }

    const { data: enrollments, error } = await query;

    if (error) {
        console.error('Error fetching enrollments:', error);
    }

    // Filter by search term in memory
    let filteredEnrollments = enrollments || [];
    if (search) {
        const s = search.toLowerCase();
        filteredEnrollments = filteredEnrollments.filter((e: any) =>
            e.user?.full_name?.toLowerCase().includes(s) ||
            e.user?.email?.toLowerCase().includes(s)
        );
    }

    return { courses: courses || [], enrollments: filteredEnrollments };
}

// Function to calculate progress percentage
const calculateProgress = (progressObj: any) => {
    if (!progressObj || typeof progressObj !== 'object') return 0;
    const moduleKeys = Object.keys(progressObj).filter(k => k !== 'last_module');
    if (moduleKeys.length === 0) return 0;

    const completed = moduleKeys.filter(k => progressObj[k] === true).length;
    // For a real calculation, we'd need total modules, but let's approximate or just show completed count
    // Since we don't fetch full module count efficiently here, we'll return the completed count
    return completed;
};

// Fake CRM Statuses for Demo
const CRM_STATUSES = ['Đang học', 'Nguy cơ bỏ cuộc', 'Đã chăm sóc', 'Mới'];
const getRandomStatus = (id: string) => {
    const charCode = id.charCodeAt(id.length - 1) || 0;
    return CRM_STATUSES[charCode % CRM_STATUSES.length];
};
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Đang học': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Nguy cơ bỏ cuộc': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Đã chăm sóc': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
};

// Enrollment age & follow-up milestones
const getEnrollmentDaysAgo = (enrolledAt: string) => {
    const diff = Date.now() - new Date(enrolledAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getFollowUpMilestone = (daysAgo: number) => {
    if (daysAgo >= 30) return { label: '30+ ngày', color: 'bg-red-500 text-white', template: '30day' };
    if (daysAgo >= 7) return { label: `${daysAgo}d`, color: 'bg-amber-500 text-white', template: '7day' };
    if (daysAgo >= 5) return { label: `${daysAgo}d`, color: 'bg-yellow-400 text-black', template: '5day' };
    return { label: `${daysAgo}d`, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', template: 'welcome' };
};

const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
    welcome: {
        subject: '[CourseMarket VN] Chào mừng bạn đến học!',
        body: 'Chào {name},%0D%0A%0D%0ACảm ơn bạn đã đăng ký khóa "{course}". Chúc bạn học tập hiệu quả!%0D%0A%0D%0AĐội ngũ hỗ trợ CourseMarket VN',
    },
    '5day': {
        subject: '[CourseMarket VN] Kiểm tra tiến độ 5 ngày - {course}',
        body: 'Chào {name},%0D%0A%0D%0ABạn đã đăng ký khóa "{course}" được 5 ngày. Bạn có gặp khó khăn gì không?%0D%0AChúng tôi sẵn sàng hỗ trợ 24/7!%0D%0A%0D%0AĐội ngũ CSKH CourseMarket VN',
    },
    '7day': {
        subject: '[CourseMarket VN] ⚡ 7 ngày - Bạn đã hoàn thành bao nhiêu? - {course}',
        body: 'Chào {name},%0D%0A%0D%0AĐã 1 tuần kể từ khi bạn đăng ký "{course}".%0D%0AHãy tiếp tục hoàn thành các bài học nhé! 🚀%0D%0A%0D%0ANếu cần hỗ trợ, hãy reply email này.%0D%0A%0D%0AĐội ngũ CourseMarket VN',
    },
    '30day': {
        subject: '[CourseMarket VN] 🔥 30 ngày - Đừng bỏ cuộc! - {course}',
        body: 'Chào {name},%0D%0A%0D%0AĐã 30 ngày và chúng tôi nhận thấy bạn chưa hoàn thành khóa "{course}".%0D%0A%0D%0A🎁 ĐẶC BIỆT: Reply email này để nhận voucher GIẢM 20%25 cho khóa tiếp theo!%0D%0A%0D%0AĐội ngũ CSKH CourseMarket VN',
    },
};

export default async function AdminStudentsPage({
    searchParams,
}: {
    searchParams: { q?: string; course_id?: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const courseIdFilter = searchParams.course_id || 'all';
    const searchQuery = searchParams.q || '';

    const { courses, enrollments } = await getAdminData(courseIdFilter, searchQuery);

    // Calculate approx total revenue for this view
    const totalRevenueDisplay = enrollments.reduce((sum, e: any) => {
        const course = Array.isArray(e.course) ? e.course[0] : e.course;
        return sum + (course?.price_vnd || 0);
    }, 0);

    // Prepare CRM statuses for export
    const crmStatuses = enrollments.reduce((acc: any, e: any) => {
        acc[e.id] = getRandomStatus(e.id);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold mb-1 flex items-center gap-3">
                            <Users size={28} className="text-primary" /> CRM Chăm sóc Học viên
                        </h1>
                        <p className="text-muted-foreground">Phân tích hành vi & hỗ trợ {enrollments.length} người học</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons data={enrollments} crmStatuses={crmStatuses} />
                    </div>
                </div>

                {/* Filters & Search */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <form className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder="Tìm học viên theo tên, email..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="w-full md:w-64 shrink-0 relative">
                                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                <select
                                    name="course_id"
                                    defaultValue={courseIdFilter}
                                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                                >
                                    <option value="all">Tất cả khóa học</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" className="w-full md:w-auto">
                                Lọc dữ liệu
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Stats Summary Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Học sinh trong danh sách</p>
                        <p className="text-2xl font-bold">{enrollments.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Tỷ lệ rủi ro (Bỏ cuộc)</p>
                        <p className="text-2xl font-bold text-red-500">
                            {enrollments.length > 0
                                ? Math.round((enrollments.filter(e => getRandomStatus(e.id) === 'Nguy cơ bỏ cuộc').length / enrollments.length) * 100)
                                : 0}%
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Học sinh năng nổ</p>
                        <p className="text-2xl font-bold text-emerald-500">
                            {enrollments.filter(e => getRandomStatus(e.id) === 'Đang học').length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Trị giá đơn hàng</p>
                        <p className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenueDisplay)}
                        </p>
                    </div>
                </div>

                {/* Students CRM Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left py-4 px-3 font-semibold text-muted-foreground whitespace-nowrap">Học viên</th>
                                    <th className="text-left py-4 px-3 font-semibold text-muted-foreground hidden md:table-cell">Email / SĐT</th>
                                    <th className="text-left py-4 px-3 font-semibold text-muted-foreground hidden lg:table-cell">Khóa học</th>
                                    <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Tiến độ</th>
                                    <th className="text-center py-4 px-3 font-semibold text-muted-foreground hidden sm:table-cell whitespace-nowrap">CRM / Follow-up</th>
                                    <th className="text-right py-4 px-3 font-semibold text-muted-foreground hidden md:table-cell">Giá trị</th>
                                    <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Liên hệ & Lịch hẹn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {enrollments.map((enr: any) => {
                                    const user = enr.user || {};
                                    // Make sure it's an object, since it can sometimes return as an array in one-to-one joins depending on FK constraint setup
                                    const usr = Array.isArray(user) ? user[0] : user;
                                    const course = Array.isArray(enr.course) ? enr.course[0] : enr.course;

                                    const completedModulesCount = calculateProgress(enr.progress);
                                    const crmStatus = getRandomStatus(enr.id);
                                    const daysAgo = getEnrollmentDaysAgo(enr.enrolled_at);
                                    const milestone = getFollowUpMilestone(daysAgo);
                                    const tpl = EMAIL_TEMPLATES[milestone.template];
                                    const emailSubject = tpl.subject.replace('{course}', course?.title || '');
                                    const emailBody = tpl.body.replace(/{name}/g, usr?.full_name || 'bạn').replace(/{course}/g, course?.title || '');

                                    return (
                                        <tr key={enr.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                                        {usr?.avatar_url ? (
                                                            <img src={usr.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-slate-500 text-sm">{(usr?.full_name || 'U')[0].toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-foreground text-sm leading-tight">{usr?.full_name || 'Ẩn danh'}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 hidden md:table-cell">
                                                <div className="space-y-0.5">
                                                    <a href={`mailto:${usr?.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                        <Mail size={10} className="shrink-0" />
                                                        <span className="truncate max-w-[160px]">{usr?.email}</span>
                                                    </a>
                                                    {usr?.phone_number && (
                                                        <a href={`tel:${usr.phone_number}`} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                                                            <Phone size={10} className="shrink-0" />
                                                            <span>{usr.phone_number}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 hidden lg:table-cell">
                                                <div className="font-medium text-sm line-clamp-1" title={course?.title}>{course?.title || '...'}</div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">Ghi danh: {formatDate(enr.enrolled_at)}</div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <Badge variant="outline" className={`font-mono text-[11px] ${completedModulesCount === 0 ? 'text-muted-foreground' : 'text-primary border-primary/30'}`}>
                                                    {completedModulesCount > 0 ? `${completedModulesCount} bài` : 'Chưa học'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-center hidden sm:table-cell">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${getStatusColor(crmStatus)}`}>
                                                        <Tag size={9} className="mr-1 opacity-70" /> {crmStatus}
                                                    </div>
                                                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${milestone.color}`}>
                                                        {milestone.label}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-right hidden md:table-cell">
                                                <span className="font-semibold tabular-nums text-sm">
                                                    {new Intl.NumberFormat('vi-VN').format(course?.price_vnd || 0)} ₫
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center justify-center gap-0.5 flex-wrap">
                                                    <a href={`mailto:${usr?.email}?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`} title={`Email: ${milestone.template}`} target="_blank">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                            <Mail size={13} />
                                                        </Button>
                                                    </a>
                                                    {usr?.phone_number && (
                                                        <>
                                                            <a href={`tel:${usr.phone_number}`} title={`Gọi ${usr.phone_number}`}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
                                                                    <Phone size={13} />
                                                                </Button>
                                                            </a>
                                                            <a href={`https://zalo.me/${usr.phone_number}`} title="Nhắn Zalo" target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                                    <MessageSquare size={13} />
                                                                </Button>
                                                            </a>
                                                        </>
                                                    )}
                                                    <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=CSKH: ${usr?.full_name}&details=Khóa: ${course?.title}%0AEmail: ${usr?.email}%0ASĐT: ${usr?.phone_number || 'N/A'}%0AMốc: ${milestone.label}`} title="Lên lịch Google Calendar" target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                                                            <Calendar size={13} />
                                                        </Button>
                                                    </a>
                                                    <AiCrmButton
                                                        studentName={usr?.full_name || 'Học viên'}
                                                        studentEmail={usr?.email || ''}
                                                        courseName={course?.title || ''}
                                                        daysEnrolled={daysAgo}
                                                        completedModules={completedModulesCount}
                                                        crmStatus={crmStatus}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {enrollments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <Users size={48} className="text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Chưa có học viên nào</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {courseIdFilter !== 'all'
                                        ? 'Khóa học này hiện tại chưa có học viên nào đăng ký hoặc phù hợp với bộ lọc tìm kiếm.'
                                        : 'Chưa có dữ liệu học viên trong hệ thống.'}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
