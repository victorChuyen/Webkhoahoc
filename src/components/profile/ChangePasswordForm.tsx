'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

export function ChangePasswordForm() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ResetPasswordFormData>({
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
            reset();
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
        <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <ShieldCheck className="text-primary" size={24} />
                <div>
                    <h3 className="font-semibold text-sm">{t('profile_tab_security')}</h3>
                    <p className="text-xs text-muted-foreground">Đảm bảo tài khoản của bạn được bảo mật bằng mật khẩu mạnh.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('profile_new_password')}</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            {...register('password')}
                            type="password"
                            className="pl-9"
                            placeholder="******"
                            autoComplete="new-password"
                        />
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('profile_confirm_new_password')}</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            {...register('confirm_password')}
                            type="password"
                            className="pl-9"
                            placeholder="******"
                            autoComplete="new-password"
                        />
                    </div>
                    {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>}
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="destructive" disabled={loading} className="w-full md:w-auto px-8">
                        {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Đang cập nhật...</> : t('profile_change_password')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
