'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff, BookOpen, Briefcase } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'student' | 'instructor'>('student');
    const supabase = createClient();

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'student', referral_code: '' },
    });

    // Handle referral code from URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) setValue('referral_code', ref);
        }
    }, [setValue]);

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                        role: data.role,
                        referral_code: data.referral_code || null,
                    },
                },
            });
            if (signUpError) throw signUpError;

            toast({
                title: t('auth_register_success'),
                description: t('auth_register_check_email'),
                variant: 'success',
            });
            router.push('/login?registered=1');
        } catch (err: any) {
            toast({
                title: t('auth_register_failed'),
                description: err.message?.includes('already registered') ? t('auth_register_email_exists') : err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role: 'student' | 'instructor') => {
        setSelectedRole(role);
        setValue('role', role);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
                        <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                            <GraduationCap className="text-white" size={20} />
                        </div>
                        <span className="gradient-text">CourseMarket VN</span>
                    </Link>
                    <h1 className="text-2xl font-display font-bold">{t('auth_register_title')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('auth_register_has_account')}{' '}
                        <Link href="/login" className="text-primary font-medium hover:underline">{t('auth_register_login_now')}</Link>
                    </p>
                </div>

                {/* Role selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                        { role: 'student' as const, label: t('auth_register_role_student'), desc: t('auth_register_role_student_desc'), icon: BookOpen },
                        { role: 'instructor' as const, label: t('auth_register_role_instructor'), desc: t('auth_register_role_instructor_desc'), icon: Briefcase },
                    ].map(({ role, label, desc, icon: Icon }) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${selectedRole === role
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon size={22} />
                            <span className="font-semibold text-sm">{label}</span>
                            <span className="text-xs opacity-70">{desc}</span>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('auth_register_fullname')}</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input {...register('full_name')} className="pl-9" placeholder={t('auth_register_fullname_placeholder')} autoComplete="name" />
                        </div>
                        {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input {...register('email')} type="email" className="pl-9" placeholder="email@example.com" autoComplete="email" />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Mật khẩu</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                {...register('password')}
                                type={showPass ? 'text' : 'password'}
                                className="pl-9 pr-10"
                                placeholder={t('auth_register_password_hint')}
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('auth_register_confirm_password')}</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input {...register('confirm_password')} type={showPass ? 'text' : 'password'} className="pl-9" placeholder={t('auth_register_confirm_password_placeholder')} autoComplete="new-password" />
                        </div>
                        {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                            Mã giới thiệu (Tùy chọn)
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">-10% khóa học</span>
                        </label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input {...register('referral_code')} className="pl-9 uppercase font-mono" placeholder="Ví dụ: REF123ABC" />
                        </div>
                        {errors.referral_code && <p className="text-xs text-destructive mt-1">{errors.referral_code.message}</p>}
                    </div>

                    <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                        {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> {t('auth_register_loading')}</> : t('auth_register_button')}
                    </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    {t('auth_register_terms')}{' '}
                    <Link href="/terms" className="text-primary hover:underline">{t('auth_register_tos')}</Link>{' '}
                    {t('auth_register_and')}{' '}
                    <Link href="/privacy" className="text-primary hover:underline">{t('auth_register_privacy')}</Link>
                </p>
            </div>
        </div>
    );
}
