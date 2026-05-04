'use client';

import Link from 'next/link';
import { GraduationCap, Facebook, Youtube, Mail, Phone } from 'lucide-react';
import { useTranslation } from '@/lib/stores/i18nStore';

export function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="border-t border-border bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg mb-4">
                            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                                <GraduationCap className="text-white" size={20} />
                            </div>
                            <span className="gradient-text">CourseMarket VN</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {t('footer_desc')}
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-300 transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-red-600 hover:border-red-300 transition-colors">
                                <Youtube size={16} />
                            </a>
                            <a href="mailto:Victorchuyen68@gmail.com" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Khóa học */}
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer_courses')}</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: t('footer_cat_web'), href: '/courses?category=web-development' },
                                { label: t('footer_cat_data'), href: '/courses?category=data-science' },
                                { label: t('footer_cat_design'), href: '/courses?category=ui-ux-design' },
                                { label: t('footer_cat_marketing'), href: '/courses?category=digital-marketing' },
                                { label: t('footer_cat_ai'), href: '/courses?category=ai-ml' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Giảng viên & Admin */}
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer_instructor')}</h4>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
                                <img src="https://api.dicebear.com/7.x/initials/svg?seed=Victor+Chuyen" alt="Victor Chuyen" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-foreground">Victor Chuyen</p>
                                <p className="text-xs text-muted-foreground">{t('footer_instructor_role')}</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            <li>
                                <a href="tel:0989890022" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <Phone size={14} className="text-primary shrink-0" /> 0989 890 022 (Zalo)
                                </a>
                            </li>
                            <li>
                                <a href="mailto:Victorchuyen68@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors break-all">
                                    <Mail size={14} className="text-primary shrink-0" /> Victorchuyen68@gmail.com
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/vitorchuyen" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="w-3.5 h-3.5 flex items-center justify-center text-primary shrink-0">
                                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                    </span>
                                    Telegram: @vitorchuyen
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/vibecode_longai" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="w-3.5 h-3.5 flex items-center justify-center text-primary shrink-0">
                                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                    </span>
                                    Channel VibeCode
                                </a>
                            </li>
                            <li>
                                <a href="https://zalo.me/g/tdhmtu261" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-primary text-primary-foreground rounded shrink-0">Z</span>
                                    Zalo Group Hỗ trợ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Hỗ trợ */}
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer_support')}</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: t('footer_help'), href: '/help' },
                                { label: t('footer_privacy'), href: '/privacy' },
                                { label: t('footer_terms'), href: '/terms' },
                                { label: t('footer_refund'), href: '/refund' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 space-y-1.5">
                            <a href="tel:0989890022" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <Phone size={14} /> 0989 890 022
                            </a>
                            <a href="mailto:Victorchuyen68@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors break-all">
                                <Mail size={14} /> Victorchuyen68@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {t('footer_rights')}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-bold text-[#005BAA] opacity-60 hover:opacity-100 transition-opacity">VNPay</div>
                        <div className="text-xs font-bold text-[#A50064] opacity-60 hover:opacity-100 transition-opacity">MoMo</div>
                        <div className="text-xs font-bold text-[#003087] opacity-60 hover:opacity-100 transition-opacity">PayPal</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
