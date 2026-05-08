'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

function ResetPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });
            if (error) throw error;
            toast({ title: t('auth_reset_success'), variant: 'success' });
            router.push('/login');
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
                            <div className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
                                <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                                    < GraduationCap className="text-white" size={20} />
                                </div>
                                <span className="gradient-text">CourseMarket VN</span>
                            </div>
                            <h1 className="text-2xl font-display font-bold">{t('auth_reset_title')}</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Vui lòng nhập mật khẩu mới của bạn.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Mật khẩu mới</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        {...register('password')}
                                        type={showPass ? 'text' : 'password'}
                                        className="pl-9 pr-10"
                                        placeholder="******"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        {...register('confirm_password')}
                                        type={showPass ? 'text' : 'password'}
                                        className="pl-9 pr-10"
                                        placeholder="******"
                                        autoComplete="new-password"
                                    />
                                </div>
                                {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>}
                            </div>

                            <Button type="submit" variant="gradient" className="w-full py-6 text-base" disabled={loading}>
                                {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> {t('auth_login_loading')}</> : t('auth_reset_button')}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
