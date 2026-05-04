import { createClient } from '@/lib/supabase/server';
import type { Course } from '@/types';
import HomeContent from '@/components/home/HomeContent';

async function getFeaturedCourses(): Promise<Course[]> {
    try {
        const supabase = createClient();
        const { data } = await supabase
            .from('courses')
            .select('*, instructor:users(id, full_name, avatar_url)')
            .eq('published', true)
            .eq('featured', true)
            .limit(4);
        return (data as Course[]) || [];
    } catch {
        return [];
    }
}

// Demo courses for when DB is not configured
const DEMO_COURSES = [
    {
        id: '1', title: 'React & Next.js từ Zero đến Hero', level: 'intermediate', featured: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        price_vnd: 799000, avg_rating: 4.9, total_reviews: 245, total_students: 1200,
        instructor: { full_name: 'Victor Chuyen' },
    },
    {
        id: '2', title: 'Python cho Data Science & Machine Learning', level: 'beginner', featured: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        price_vnd: 999000, avg_rating: 4.8, total_reviews: 189, total_students: 890,
        instructor: { full_name: 'Victor Chuyen' },
    },
    {
        id: '3', title: 'UI/UX Design với Figma chuyên nghiệp', level: 'beginner', featured: false,
        thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
        price_vnd: 599000, avg_rating: 4.7, total_reviews: 98, total_students: 540,
        instructor: { full_name: 'Victor Chuyen' },
    },
    {
        id: '4', title: 'Digital Marketing & SEO toàn tập 2024', level: 'intermediate', featured: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400',
        price_vnd: 699000, avg_rating: 4.9, total_reviews: 312, total_students: 1580,
        instructor: { full_name: 'Victor Chuyen' },
    },
];

export default async function HomePage() {
    const featuredCourses = await getFeaturedCourses();

    return <HomeContent featuredCourses={featuredCourses} demoCourses={DEMO_COURSES} />;
}

