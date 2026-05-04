'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Course } from '@/types';
import { useTranslation } from '@/lib/stores/i18nStore';
import {
    ArrowRight, Star, Users, BookOpen, Award, Zap, Shield, TrendingUp,
    PlayCircle, Trophy, Globe2
} from 'lucide-react';

const LEVEL_BADGE = (t: any) => ({
    beginner: { label: t('home_course_level_beginner'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    intermediate: { label: t('home_course_level_intermediate'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    advanced: { label: t('home_course_level_advanced'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
});

export default function HomeContent({ featuredCourses, demoCourses }: { featuredCourses: Course[], demoCourses: any[] }) {
    const { t, language } = useTranslation();

    const STATS = [
        { label: t('home_hero_stats_students_label'), value: t('home_hero_stats_students'), icon: Users, color: 'text-blue-500' },
        { label: t('home_hero_stats_courses_label'), value: t('home_hero_stats_courses'), icon: BookOpen, color: 'text-purple-500' },
        { label: t('home_hero_stats_instructors_label'), value: t('home_hero_stats_instructors'), icon: Award, color: 'text-amber-500' },
        { label: t('home_hero_stats_certs_label'), value: t('home_hero_stats_certs'), icon: Trophy, color: 'text-emerald-500' },
    ];

    const FEATURES = [
        { icon: Zap, title: t('home_features_1_title'), desc: t('home_features_1_desc') },
        { icon: Shield, title: t('home_features_2_title'), desc: t('home_features_2_desc') },
        { icon: TrendingUp, title: t('home_features_3_title'), desc: t('home_features_3_desc') },
        { icon: Globe2, title: t('home_features_4_title'), desc: t('home_features_4_desc') },
    ];

    const TESTIMONIALS = [
        {
            name: 'Nguyễn Minh Khoa', role: 'Frontend Developer tại FPT',
            text: language === 'vi' ? 'Nhờ khóa học React & Next.js, tôi đã có được công việc lập trình viên frontend mơ ước chỉ sau 3 tháng.' : 'Thanks to the React & Next.js course, I landed my dream frontend developer job in just 3 months.',
            rating: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khoa',
        },
        {
            name: 'Trần Thị Lan Anh', role: 'UI/UX Designer freelance',
            text: language === 'vi' ? 'Khóa học Figma rất thực tế và hữu ích. Tôi đã tăng thu nhập gấp đôi sau khi hoàn thành khóa học.' : 'The Figma course was very practical and helpful. I doubled my income after completing the course.',
            rating: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lananh',
        },
        {
            name: 'Phạm Văn Đức', role: 'Data Analyst tại Vingroup',
            text: language === 'vi' ? 'Khóa học Python Data Science cực kỳ chất lượng. Giảng viên tận tâm và giải thích rõ ràng từng concept.' : 'The Python Data Science course is extremely high quality. The instructor is dedicated and explains every concept clearly.',
            rating: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* HERO SECTION */}
            <section className="hero-bg relative py-24 lg:py-36">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm px-4 py-1.5 rounded-full mb-6 animate-fade-in backdrop-blur-sm">
                            <Zap size={14} className="text-amber-400" />
                            <span>🇻🇳 {t('home_hero_badge')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-white leading-tight mb-6 animate-fade-in animation-delay-100">
                            {t('home_hero_title')}
                        </h1>

                        <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in animation-delay-200">
                            {t('home_hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-300">
                            <Button variant="gradient" size="xl" asChild className="w-full sm:w-auto text-base shadow-2xl">
                                <Link href="/courses">
                                    {t('home_hero_cta')} <ArrowRight size={18} className="ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="xl" asChild className="w-full sm:w-auto text-base border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                                <Link href="/register">
                                    <PlayCircle size={18} className="mr-2" /> {t('home_hero_trial')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-16 bg-muted/30 border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className={`inline-flex p-3 rounded-xl bg-background border border-border mb-3 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED COURSES */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <Badge variant="info" className="mb-3">⭐ {t('home_featured_badge')}</Badge>
                            <h2 className="text-3xl lg:text-4xl font-display font-bold">{t('home_featured_title')}</h2>
                            <p className="text-muted-foreground mt-2">{t('home_featured_subtitle')}</p>
                        </div>
                        <Button variant="outline" asChild className="hidden sm:flex">
                            <Link href="/courses">{t('home_featured_view_all')} <ArrowRight size={16} className="ml-2" /></Link>
                        </Button>
                    </div>

                    {featuredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {demoCourses.map((course) => (
                                <CourseCard key={course.id} course={course} demo />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <Badge variant="secondary" className="mb-3">🚀 {t('home_how_badge')}</Badge>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold">{t('home_how_title')}</h2>
                        <p className="text-muted-foreground mt-2">{t('home_how_subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '01', title: t('home_how_1_title'), desc: t('home_how_1_desc'), icon: BookOpen },
                            { step: '02', title: t('home_how_2_title'), desc: t('home_how_2_desc'), icon: Shield },
                            { step: '03', title: t('home_how_3_title'), desc: t('home_how_3_desc'), icon: TrendingUp },
                        ].map((step) => (
                            <div key={step.step} className="text-center">
                                <div className="relative inline-flex mb-5">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <step.icon size={28} className="text-primary" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                                        {step.step.slice(-1)}
                                    </div>
                                </div>
                                <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <Badge variant="success" className="mb-3">❤️ {t('home_testi_badge')}</Badge>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold">{t('home_testi_title')}</h2>
                        <p className="text-muted-foreground mt-2">{t('home_testi_subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {TESTIMONIALS.map((t) => (
                            <Card key={t.name} className="course-card">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-0.5 mb-4">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
                                    <div className="flex items-center gap-3">
                                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-muted" />
                                        <div>
                                            <p className="font-semibold text-sm">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function CourseCard({ course, demo }: { course: Course; demo?: boolean }) {
    const { t } = useTranslation();
    const level = LEVEL_BADGE(t)[course.level as keyof ReturnType<typeof LEVEL_BADGE>] || LEVEL_BADGE(t).beginner;
    return (
        <Link href={demo ? '/courses' : `/courses/${course.id}`}>
            <Card className="course-card h-full overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.color}`}>
                            {level.label}
                        </span>
                    </div>
                    {course.featured && (
                        <div className="absolute top-2 right-2 badge-featured">⭐ Hot</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={48} />
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>
                    {(course as any).instructor && (
                        <p className="text-xs text-muted-foreground mb-2">
                            {(course as any).instructor.full_name}
                        </p>
                    )}
                    <div className="flex items-center gap-1 mb-3">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold">{course.avg_rating > 0 ? course.avg_rating.toFixed(1) : '4.8'}</span>
                        <span className="text-xs text-muted-foreground">({course.total_reviews || '120'})</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            {course.price_vnd > 0 ? (
                                <span className="font-bold text-primary">{formatCurrency(course.price_vnd, 'VND')}</span>
                            ) : (
                                <span className="font-bold text-emerald-500">{t('home_course_free')}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users size={12} /> {course.total_students || 0}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
