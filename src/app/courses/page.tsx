'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Course } from '@/types';
import { Star, Users, Search, BookOpen, Filter, PlayCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

async function getCourses(searchParams: { q?: string; category?: string; level?: string }) {
    try {
        const supabase = createClient();
        let query = supabase
            .from('courses')
            .select('*, instructor:users(id, full_name, avatar_url), course_categories(category_id, categories(id, name, slug))')
            .eq('published', true)
            .order('total_students', { ascending: false });

        if (searchParams.q) {
            query = query.ilike('title', `%${searchParams.q}%`);
        }
        if (searchParams.level) {
            query = query.eq('level', searchParams.level);
        }

        const { data } = await query;
        return (data as unknown as Course[]) || [];
    } catch {
        return DEMO_COURSES as unknown as Course[];
    }
}

async function getCategories() {
    try {
        const supabase = createClient();
        const { data } = await supabase.from('categories').select('*').order('name');
        return data || [];
    } catch {
        return [];
    }
}

const LEVEL_COLOR = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

function CoursesContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';

    const { t } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const LEVEL_LABEL = {
        beginner: t('courses_level_beginner'),
        intermediate: t('courses_level_intermediate'),
        advanced: t('courses_level_advanced'),
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getCourses({ q, category, level }),
            getCategories()
        ]).then(([dataCourses, dataCats]) => {
            setCourses(dataCourses);
            setCategories(dataCats);
            setLoading(false);
        });
    }, [q, category, level]);

    return (
        <div className="min-h-screen animate-fade-in">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-display font-bold mb-2">{t('courses_explore_title')}</h1>
                    <p className="text-muted-foreground mb-6">{t('courses_explore_desc')}</p>
                    {/* Search */}
                    <form action="/courses" method="GET" className="flex gap-3 max-w-2xl">
                        {category && <input type="hidden" name="category" value={category} />}
                        {level && <input type="hidden" name="level" value={level} />}
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder={t('courses_search_placeholder')}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <Button type="submit" variant="default">
                            <Search size={16} className="mr-1.5 hidden sm:block" /> {t('courses_search_btn')}
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="sticky top-20 space-y-6">
                            {/* Level filter */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Filter size={16} /> {t('courses_filter_level')}
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { value: '', label: t('courses_level_all') },
                                        { value: 'beginner', label: t('courses_level_beginner') },
                                        { value: 'intermediate', label: t('courses_level_intermediate') },
                                        { value: 'advanced', label: t('courses_level_advanced') },
                                    ].map(option => {
                                        const query = new URLSearchParams();
                                        if (q) query.set('q', q);
                                        if (category) query.set('category', category);
                                        if (option.value) query.set('level', option.value);

                                        return (
                                            <Link
                                                key={option.value}
                                                href={`/courses?${query.toString()}`}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${level === option.value
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {option.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category filter */}
                            {categories.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <BookOpen size={16} /> {t('courses_filter_category')}
                                    </h3>
                                    <div className="space-y-2">
                                        {categories.map((cat: any) => {
                                            const query = new URLSearchParams();
                                            if (q) query.set('q', q);
                                            if (level) query.set('level', level);
                                            query.set('category', cat.slug);

                                            return (
                                                <Link
                                                    key={cat.slug}
                                                    href={`/courses?${query.toString()}`}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    <span>{cat.icon}</span> {cat.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Course grid */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-muted-foreground">
                                {loading ? '...' : courses.length} {t('courses_count_text')} {q && `${t('courses_count_for')} "${q}"`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-20 animate-fade-in">
                                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{t('courses_not_found_title')}</h3>
                                <p className="text-muted-foreground mb-4">{t('courses_not_found_desc')}</p>
                                <Button asChild variant="outline">
                                    <Link href="/courses">{t('courses_view_all')}</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <Link key={course.id} href={`/courses/${course.id}`}>
                                        <Card className="h-full overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                                            <div className="relative aspect-video overflow-hidden">
                                                <img
                                                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <PlayCircle className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 transition-all" />
                                                </div>
                                                <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[course.level as keyof typeof LEVEL_COLOR] || LEVEL_COLOR.beginner}`}>
                                                    {LEVEL_LABEL[course.level as keyof typeof LEVEL_LABEL] || t('courses_level_beginner')}
                                                </span>
                                                {course.featured && (
                                                    <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Hot</span>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {(course as any).instructor?.full_name || 'Giảng viên'}
                                                </p>
                                                <div className="flex items-center gap-1 mb-3">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-semibold">{course.avg_rating > 0 ? course.avg_rating.toFixed(1) : '4.8'}</span>
                                                    <span className="text-xs text-muted-foreground">({course.total_reviews || 0})</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-primary text-sm">
                                                        {course.price_vnd > 0 ? formatCurrency(course.price_vnd, 'VND') : <span className="text-emerald-500">Miễn phí</span>}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users size={12} /> {course.total_students || 0}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
            <CoursesContent />
        </Suspense>
    );
}

// Demo fallback
const DEMO_COURSES = [
    { id: '1', title: 'React & Next.js từ Zero đến Hero', level: 'intermediate', featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', price_vnd: 799000, avg_rating: 4.9, total_reviews: 245, total_students: 1200, instructor: { full_name: 'Victor Chuyen' } },
    { id: '2', title: 'Python cho Data Science & AI', level: 'beginner', featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', price_vnd: 999000, avg_rating: 4.8, total_reviews: 189, total_students: 890, instructor: { full_name: 'Victor Chuyen' } },
    { id: '3', title: 'UI/UX Design với Figma', level: 'beginner', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400', price_vnd: 599000, avg_rating: 4.7, total_reviews: 98, total_students: 540, instructor: { full_name: 'Victor Chuyen' } },
    { id: '4', title: 'Digital Marketing & SEO', level: 'intermediate', featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400', price_vnd: 699000, avg_rating: 4.9, total_reviews: 312, total_students: 1580, instructor: { full_name: 'Victor Chuyen' } },
    { id: '5', title: 'Flutter Mobile App Development', level: 'intermediate', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', price_vnd: 899000, avg_rating: 4.8, total_reviews: 156, total_students: 720, instructor: { full_name: 'Victor Chuyen' } },
    { id: '6', title: 'AI & Machine Learning với Python', level: 'advanced', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400', price_vnd: 1299000, avg_rating: 4.9, total_reviews: 78, total_students: 350, instructor: { full_name: 'Victor Chuyen' } },
];

