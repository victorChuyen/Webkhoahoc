'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { profileSchema, type ProfileFormData } from '@/lib/schemas/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, FileText, Camera } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';
import { useAuthStore } from '@/lib/stores/authStore';

export function ProfileForm() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            bio: user?.bio || '',
            avatar_url: user?.avatar_url || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: data.full_name,
                    bio: data.bio,
                    avatar_url: data.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            setUser({ ...user, ...data });
            toast({ title: t('profile_update_success'), variant: 'success' });
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-brand-gradient flex items-center justify-center text-white text-4xl font-bold border-4 border-background shadow-xl overflow-hidden relative">
                            {user?.avatar_url ? (
                                <Image 
                                    src={user.avatar_url} 
                                    alt={user.full_name || ''} 
                                    fill
                                    className="object-cover" 
                                />
                            ) : (
                                user?.full_name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-[150px]">
                        Nhấn để thay đổi ảnh đại diện (Tính năng đang cập nhật)
                    </p>
                </div>

                {/* Form Section */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">{t('auth_register_fullname')}</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                {...register('full_name')}
                                className="pl-9"
                                placeholder={t('auth_register_fullname_placeholder')}
                            />
                        </div>
                        {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Bio / Giới thiệu</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-muted-foreground" />
                            <textarea
                                {...register('bio')}
                                className="w-full min-h-[120px] pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Chia sẻ một chút về bản thân bạn..."
                            />
                        </div>
                        {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Avatar URL (Mockup)</label>
                        <Input
                            {...register('avatar_url')}
                            placeholder="https://example.com/avatar.jpg"
                        />
                        {errors.avatar_url && <p className="text-xs text-destructive mt-1">{errors.avatar_url.message}</p>}
                    </div>

                    <Button type="submit" variant="gradient" disabled={loading} className="w-full md:w-auto px-8">
                        {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Đang cập nhật...</> : 'Lưu thay đổi'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
