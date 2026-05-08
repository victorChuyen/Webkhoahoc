'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTranslation } from '@/lib/stores/i18nStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { User, Shield, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const { t } = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            if (!user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (data) setUser(data);
            }
            setLoading(false);
        };

        checkAuth();
    }, [user, router, setUser, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <ChevronRight size={14} />
                        <span className="text-foreground font-medium">{t('profile_title')}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1 space-y-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                    activeTab === 'info' 
                                    ? 'bg-background shadow-md border border-border text-primary' 
                                    : 'text-muted-foreground hover:bg-background/50'
                                }`}
                            >
                                <User size={18} />
                                {t('profile_tab_info')}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                    activeTab === 'security' 
                                    ? 'bg-background shadow-md border border-border text-primary' 
                                    : 'text-muted-foreground hover:bg-background/50'
                                }`}
                            >
                                <Shield size={18} />
                                {t('profile_tab_security')}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-background border border-border rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-display font-bold mb-8">
                                        {activeTab === 'info' ? t('profile_tab_info') : t('profile_tab_security')}
                                    </h2>

                                    {activeTab === 'info' ? <ProfileForm /> : <ChangePasswordForm />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
