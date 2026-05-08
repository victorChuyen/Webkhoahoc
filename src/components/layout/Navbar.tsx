'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18nStore, useTranslation } from '@/lib/stores/i18nStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import {
    BookOpen, GraduationCap, LayoutDashboard, LogOut,
    Mail, Menu, Moon, Settings, Sun, User, Users, X, ChevronDown
} from 'lucide-react';

export function Navbar() {
    const { user, setUser, clearUser } = useAuthStore();
    const { language: lang, setLanguage: setLang } = useI18nStore();
    const { t } = useTranslation();
    const [isDark, setIsDark] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Use a stable supabase instance
    const [supabase] = useState(() => createClient());

    const toggleDark = useCallback(() => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDark(!isDark);
    }, [isDark]);

    useEffect(() => {
        setMounted(true);
        // Load dark mode preference
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }

        // Get session
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
            if (authUser) {
                supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setUser(data);
                    });
            } else {
                clearUser();
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) clearUser();
        });

        return () => subscription.unsubscribe();
    }, [clearUser, setUser, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        clearUser();
        setProfileOpen(false);
        window.location.href = '/';
    };

    const getDashboardLink = () => {
        if (!user) return '/student/dashboard';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'instructor') return '/instructor/dashboard';
        return '/student/dashboard';
    };

    const roleLabel = {
        admin: lang === 'vi' ? 'Quản trị' : 'Admin',
        instructor: lang === 'vi' ? 'Giảng viên' : 'Instructor',
        student: lang === 'vi' ? 'Học viên' : 'Student'
    };
    const roleBadgeVariant = { admin: 'destructive', instructor: 'info', student: 'success' } as const;

    const toggleLang = (l: 'vi' | 'en') => {
        setLang(l);
        setLangOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-primary/30">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <span className="gradient-text hidden sm:block">CourseMarket VN</span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                        <BookOpen size={16} /> {t('nav_courses')}
                    </Link>
                    {mounted && user && (
                        <Link href={getDashboardLink()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                    )}
                    {mounted && user?.role === 'admin' && (
                        <>
                            <Link href="/admin/students" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                                <Users size={16} /> Quản lý CRM
                            </Link>
                            <Link href="/admin/email-sequences" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                                <Mail size={16} /> Email Sequences
                            </Link>
                        </>
                    )}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Language toggle */}
                    <div className="relative">
                        <button
                            onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all text-sm font-medium"
                            aria-label="Toggle Language"
                        >
                            {lang === 'vi'
                                ? <><Image src="https://flagcdn.com/w20/vn.png" alt="VN" width={16} height={12} className="shadow-sm" /> VN</>
                                : <><Image src="https://flagcdn.com/w20/us.png" alt="EN" width={16} height={12} className="shadow-sm" /> EN</>}
                            <ChevronDown size={14} className="text-muted-foreground" />
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-popover border border-border rounded-xl shadow-xl p-1 z-50 animate-fade-in">
                                <button
                                    onClick={() => toggleLang('vi')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors ${lang === 'vi' ? 'bg-accent font-semibold' : ''}`}
                                >
                                    <Image src="https://flagcdn.com/w20/vn.png" alt="VN" width={16} height={12} className="shadow-sm" /> Tiếng Việt
                                </button>
                                <button
                                    onClick={() => toggleLang('en')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors ${lang === 'en' ? 'bg-accent font-semibold' : ''}`}
                                >
                                    <Image src="https://flagcdn.com/w20/us.png" alt="EN" width={16} height={12} className="shadow-sm" /> English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleDark}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {mounted && (user ? (
                        <div className="relative">
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0 relative overflow-hidden">
                                    {user.avatar_url
                                        ? <Image src={user.avatar_url} alt="" fill className="object-cover" />
                                        : getInitials(user.full_name)
                                    }
                                </div>
                                <span className="text-sm font-medium max-w-[100px] truncate">{user.full_name || user.email}</span>
                                <ChevronDown size={14} className="text-muted-foreground" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <p className="text-sm font-semibold truncate">{user.full_name || 'User'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        <Badge variant={roleBadgeVariant[user.role]} className="mt-1 text-xs">
                                            {roleLabel[user.role]}
                                        </Badge>
                                    </div>
                                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                                        <User size={14} /> {t('nav_profile')}
                                    </Link>
                                    <Link href={getDashboardLink()} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                                        <LayoutDashboard size={14} /> Dashboard
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link href="/admin/students" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                                            <Users size={14} /> Quản lý CRM
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                                        <LogOut size={14} /> {t('nav_logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">{t('nav_login')}</Link>
                            </Button>
                            <Button variant="gradient" size="sm" asChild>
                                <Link href="/register">{t('nav_register')}</Link>
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Mobile menu button */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg border">
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-3 animate-fade-in">
                    <Link href="/courses" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 flex items-center gap-2">
                        <BookOpen size={16} /> {t('nav_courses')}
                    </Link>
                    {mounted && (user ? (
                        <>
                            <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 flex items-center gap-2">
                                <LayoutDashboard size={16} /> Dashboard
                            </Link>
                            {user.role === 'admin' && (
                                <Link href="/admin/students" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 flex items-center gap-2">
                                    <Users size={16} /> Quản lý CRM
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-sm font-medium py-2 text-destructive flex items-center gap-2">
                                <LogOut size={16} /> {t('nav_logout')}
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/login">{t('nav_login')}</Link>
                            </Button>
                            <Button variant="gradient" className="flex-1" asChild>
                                <Link href="/register">{t('nav_register')}</Link>
                            </Button>
                        </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                        <button onClick={toggleDark} className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            {isDark ? t('nav_light_mode') : t('nav_dark_mode')}
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleLang('vi')}
                                className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded-lg transition-colors ${lang === 'vi' ? 'bg-accent font-semibold' : 'text-muted-foreground hover:bg-accent'}`}
                            >
                                <Image src="https://flagcdn.com/w20/vn.png" alt="VN" width={16} height={12} className="shadow-sm" /> VN
                            </button>
                            <button
                                onClick={() => toggleLang('en')}
                                className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded-lg transition-colors ${lang === 'en' ? 'bg-accent font-semibold' : 'text-muted-foreground hover:bg-accent'}`}
                            >
                                <Image src="https://flagcdn.com/w20/us.png" alt="EN" width={16} height={12} className="shadow-sm" /> EN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
