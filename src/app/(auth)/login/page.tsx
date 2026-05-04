'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

function LoginForm() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);
    const supabase = createClient();
    const nextPath = searchParams.get('next') || '/';

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (error) throw error;
            toast({ title: t('auth_login_success'), variant: 'success' });
            router.push(nextPath);
            router.refresh();
        } catch (err: any) {
            toast({
                title: t('auth_login_failed'),
                description: err.message === 'Invalid login credentials' ? t('auth_login_invalid') : err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'github') => {
        setOauthLoading(provider);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${nextPath}`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            toast({ title: 'OAuth Error', description: err.message, variant: 'destructive' });
            setOauthLoading(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Left visual panel */}
            <div className="hidden lg:flex lg:w-1/2 hero-bg items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 text-white max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6">
                        <GraduationCap size={32} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4 leading-tight">
                        {t('auth_login_subtitle')}
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed mb-8">
                        {t('auth_login_desc')}
                    </p>
                    <div className="space-y-3">
                        {[
                            language === 'vi' ? '500+ khóa học chất lượng cao' : '500+ high quality courses',
                            language === 'vi' ? 'Chứng chỉ được công nhận toàn quốc' : 'Nationally recognized certificates',
                            language === 'vi' ? 'Học mọi lúc, mọi nơi' : 'Learn anytime, anywhere'
                        ].map(item => (
                            <div key={item} className="flex items-center gap-3 text-white/80">
                                <div className="w-5 h-5 rounded-full bg-emerald-400/30 border border-emerald-400/50 flex items-center justify-center">
                                    <span className="text-emerald-300 text-xs">✓</span>
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
                            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                                <GraduationCap className="text-white" size={20} />
                            </div>
                            <span className="gradient-text">CourseMarket VN</span>
                        </Link>
                        <h1 className="text-2xl font-display font-bold">{t('auth_login_title')}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {t('auth_login_no_account')}{' '}
                            <Link href="/register" className="text-primary font-medium hover:underline">{t('auth_login_register_free')}</Link>
                        </p>
                    </div>

                    {/* OAuth buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleOAuth('google')}
                            disabled={!!oauthLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all disabled:opacity-60"
                        >
                            {oauthLoading === 'google' ? <Loader2 size={18} className="animate-spin" /> : (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            {t('auth_login_google')}
                        </button>
                        <button
                            onClick={() => handleOAuth('github')}
                            disabled={!!oauthLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all disabled:opacity-60"
                        >
                            {oauthLoading === 'github' ? <Loader2 size={18} className="animate-spin" /> : (
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            )}
                            {t('auth_login_github')}
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-3 text-muted-foreground">{t('auth_login_or_email')}</span>
                        </div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    {...register('email')}
                                    type="email"
                                    className="pl-9"
                                    placeholder="email@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium">Mật khẩu</label>
                                <Link href="/forgot-password" className="text-xs text-primary hover:underline">{t('auth_login_forgot')}</Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    className="pl-9 pr-10"
                                    placeholder="******"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                            {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> {t('auth_login_loading')}</> : t('auth_login_button')}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
