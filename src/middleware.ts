import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/student',
    '/instructor',
    '/admin',
    '/checkout',
    '/profile',
];

// Routes accessible only by guests
const AUTH_ROUTES = [
    '/login',
    '/register',
];

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);
    const pathname = request.nextUrl.pathname;

    // Create Supabase client to get user
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return request.cookies.get(name)?.value; },
                set() { },
                remove() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect unauthenticated users from protected routes
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (isProtected && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth routes
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin route protection
    if (pathname.startsWith('/admin') && user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Instructor route protection
    if (pathname.startsWith('/instructor') && user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!['instructor', 'admin'].includes(profile?.role || '')) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
