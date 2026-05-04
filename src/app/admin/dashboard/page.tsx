'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, BookOpen, ShoppingBag, DollarSign, Download } from 'lucide-react';

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

// Demo data for when DB is not configured
const DEMO_REVENUE_DATA = MONTHS.map((month, i) => ({
    month,
    vnpay: Math.floor(Math.random() * 20000000) + 5000000,
    momo: Math.floor(Math.random() * 15000000) + 3000000,
    paypal: Math.floor(Math.random() * 5000000) + 1000000,
    total: 0,
})).map(d => ({ ...d, total: d.vnpay + d.momo + d.paypal }));

const DEMO_PIE_DATA = [
    { name: 'VNPay', value: 145000000, color: '#3B82F6' },
    { name: 'MoMo', value: 92000000, color: '#8B5CF6' },
    { name: 'PayPal', value: 38000000, color: '#10B981' },
];

const DEMO_COURSES = [
    { title: 'React & Next.js Hero', students: 1200, revenue: 957600000, rating: 4.9 },
    { title: 'Python Data Science', students: 890, revenue: 889110000, rating: 4.8 },
    { title: 'Digital Marketing', students: 1580, revenue: 1104200000, rating: 4.9 },
    { title: 'Flutter Mobile', students: 720, revenue: 647280000, rating: 4.8 },
    { title: 'UI/UX Figma', students: 540, revenue: 323730000, rating: 4.7 },
];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 275000000,
        totalStudents: 4930,
        totalCourses: 5,
        totalpayments: 48,
    });
    const [revenueData] = useState(DEMO_REVENUE_DATA);
    const [pieData] = useState(DEMO_PIE_DATA);
    const [courseStats] = useState(DEMO_COURSES);

    const exportCSV = () => {
        const rows = [
            ['Tháng', 'VNPay', 'MoMo', 'PayPal', 'Tổng'],
            ...revenueData.map(d => [d.month, d.vnpay, d.momo, d.paypal, d.total]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'revenue_report.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatVND = (value: number) => `${(value / 1e6).toFixed(0)}M`;

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold mb-1">Revenue Dashboard</h1>
                        <p className="text-muted-foreground">Thống kê doanh thu và học viên</p>
                    </div>
                    <Button variant="outline" onClick={exportCSV}>
                        <Download size={16} className="mr-2" /> Xuất CSV
                    </Button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Tổng doanh thu', value: formatCurrency(stats.totalRevenue, 'VND'), icon: DollarSign, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', trend: '+12.5%' },
                        { label: 'Tổng học viên', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', trend: '+8.2%' },
                        { label: 'Khóa học', value: stats.totalCourses, icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', trend: '+2' },
                        { label: 'Đơn hàng', value: stats.totalpayments, icon: ShoppingBag, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', trend: '+24' },
                    ].map((stat) => (
                        <Card key={stat.label} className="stat-card overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                                        <p className="text-2xl font-display font-bold">{stat.value}</p>
                                        <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                                            <TrendingUp size={12} /> {stat.trend}
                                        </p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Revenue Bar Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Doanh thu theo tháng (VNĐ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis tickFormatter={formatVND} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value, 'VND'), '']}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="vnpay" name="VNPay" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="momo" name="MoMo" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="paypal" name="PayPal" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Payment Method Pie */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Phương thức thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value, 'VND'), '']}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            {item.name}
                                        </span>
                                        <span className="font-medium">{((item.value / pieData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Line Chart */}
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Tổng doanh thu tích lũy theo tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={revenueData.map((d, i) => ({
                                    ...d,
                                    cumulative: revenueData.slice(0, i + 1).reduce((s, r) => s + r.total, 0),
                                }))}
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis tickFormatter={formatVND} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value, 'VND'), 'Tổng tích lũy']}
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                />
                                <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Course Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Hiệu suất theo khóa học</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Khóa học</th>
                                        <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Học viên</th>
                                        <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Doanh thu</th>
                                        <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Đánh giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseStats.map((course, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-2 font-medium">{course.title}</td>
                                            <td className="py-3 px-2 text-right">
                                                <span className="font-semibold">{course.students.toLocaleString()}</span>
                                            </td>
                                            <td className="py-3 px-2 text-right text-primary font-bold">
                                                {formatCurrency(course.revenue, 'VND')}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                                                    ⭐ {course.rating}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
