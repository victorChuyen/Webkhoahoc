'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setSubmitted(true);
            toast({ title: t('auth_forgot_success'), variant: 'success' });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-muted/30">
            <div className="w-full max-w-md">
                <div className="bg-background border border-border rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
                                <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                                    <GraduationCap className="text-white" size={20} />
                                </div>
                                <span className="gradient-text">CourseMarket VN</span>
                            </Link>
                            <h1 className="text-2xl font-display font-bold">{t('auth_forgot_title')}</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                {t('auth_forgot_desc')}
                            </p>
                        </div>

                        {!submitted ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                                <Button type="submit" variant="gradient" className="w-full py-6 text-base" disabled={loading}>
                                    {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> {t('auth_login_loading')}</> : t('auth_forgot_button')}
                                </Button>

                                <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <ArrowLeft size={14} /> Quay lại đăng nhập
                                </Link>
                            </form>
                        ) : (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                    <Mail size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Kiểm tra hộp thư của bạn</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. 
                                        Nếu không thấy, hãy kiểm tra thư mục Spam.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login">Quay lại đăng nhập</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
