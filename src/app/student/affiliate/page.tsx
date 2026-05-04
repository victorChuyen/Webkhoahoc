'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Share2, Copy, DollarSign, Users, TrendingUp, ArrowLeft,
    ExternalLink, Gift, CheckCircle2, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

interface AffiliateData {
    code: { code: string; discount_percent: number; commission_percent: number } | null;
    referrals: any[];
    stats: {
        total_referrals: number;
        total_commission: number;
        paid_commission: number;
        pending_commission: number;
    };
}

export default function AffiliatePage() {
    const [data, setData] = useState<AffiliateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    const load = async () => {
        const res = await fetch('/api/affiliate');
        if (res.ok) setData(await res.json());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const createCode = async () => {
        setCreating(true);
        await fetch('/api/affiliate', { method: 'POST' });
        await load();
        setCreating(false);
    };

    const copyLink = () => {
        if (!data?.code) return;
        const link = `${window.location.origin}/register?ref=${data.code.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatVND = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white py-8">
            <div className="container mx-auto px-4 max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Share2 size={22} className="text-emerald-400" />
                            Affiliate Program
                        </h1>
                        <p className="text-xs text-slate-400">Giới thiệu bạn bè — nhận hoa hồng</p>
                    </div>
                </div>

                {/* Referral Code Card */}
                {data?.code ? (
                    <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white mb-6 overflow-hidden relative">
                        <div className="absolute -top-4 -right-4 text-[80px] opacity-10">🎁</div>
                        <CardContent className="p-6">
                            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">Mã giới thiệu của bạn</p>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/20 rounded-xl px-5 py-3 font-mono text-xl font-bold tracking-widest flex-1 text-center">
                                    {data.code.code}
                                </div>
                                <Button
                                    onClick={copyLink}
                                    className="bg-white/20 hover:bg-white/30 border-0 shrink-0"
                                    size="icon"
                                >
                                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center text-sm">
                                <div className="bg-white/10 rounded-lg p-2">
                                    <Gift size={16} className="mx-auto mb-0.5 text-emerald-200" />
                                    <p className="font-bold">{data.code.discount_percent}%</p>
                                    <p className="text-[10px] text-emerald-200">Giảm giá cho bạn bè</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2">
                                    <DollarSign size={16} className="mx-auto mb-0.5 text-emerald-200" />
                                    <p className="font-bold">{data.code.commission_percent}%</p>
                                    <p className="text-[10px] text-emerald-200">Hoa hồng cho bạn</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700 mb-6 border-dashed border-2">
                        <CardContent className="py-10 text-center">
                            <Share2 size={40} className="mx-auto text-emerald-400/40 mb-3" />
                            <p className="text-slate-300 mb-4">Bạn chưa có mã giới thiệu</p>
                            <Button onClick={createCode} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                                {creating ? 'Đang tạo...' : 'Tạo mã giới thiệu'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Share Link */}
                {data?.code && (
                    <Card className="bg-slate-800/50 border-slate-700 mb-6">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Link chia sẻ</p>
                            <div className="bg-slate-900 rounded-lg p-3 flex items-center gap-2">
                                <LinkIcon size={14} className="text-emerald-400 shrink-0" />
                                <code className="text-xs text-emerald-300 break-all flex-1">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/register?ref={data.code.code}
                                </code>
                            </div>
                            <Button onClick={copyLink} variant="outline" size="sm" className="w-full mt-3 border-emerald-700 text-emerald-400 hover:bg-emerald-900/20">
                                <Copy size={13} className="mr-1.5" /> {copied ? 'Đã copy!' : 'Copy link chia sẻ'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Commission Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <Users size={18} className="mx-auto text-blue-400 mb-1" />
                            <p className="text-xl font-bold text-white">{data?.stats.total_referrals || 0}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Đã giới thiệu</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <TrendingUp size={18} className="mx-auto text-emerald-400 mb-1" />
                            <p className="text-lg font-bold text-white">{formatVND(data?.stats.total_commission || 0)}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Tổng hoa hồng</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <DollarSign size={18} className="mx-auto text-amber-400 mb-1" />
                            <p className="text-lg font-bold text-white">{formatVND(data?.stats.pending_commission || 0)}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Chờ thanh toán</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral History */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Lịch sử giới thiệu</p>
                        {(data?.referrals.length || 0) === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                Chưa có ai đăng ký qua link của bạn
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {data?.referrals.map((ref: any) => {
                                    const referred = Array.isArray(ref.referred) ? ref.referred[0] : ref.referred;
                                    const enrollment = Array.isArray(ref.enrollment) ? ref.enrollment[0] : ref.enrollment;
                                    const course = enrollment?.course ? (Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course) : null;
                                    return (
                                        <div key={ref.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {referred?.full_name?.[0] || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{referred?.full_name || 'Học viên'}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{course?.title || '...'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-400">{formatVND(ref.commission_amount)}</p>
                                                <Badge className={`text-[9px] ${ref.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}`}>
                                                    {ref.status === 'paid' ? 'Đã trả' : 'Chờ'}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* How It Works */}
                <Card className="bg-slate-800/50 border-slate-700 mt-6">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">📖 Cách hoạt động</p>
                        <div className="space-y-3 text-sm text-slate-300">
                            <div className="flex items-start gap-2">
                                <Badge className="bg-emerald-900/30 text-emerald-400 shrink-0">1</Badge>
                                <p>Chia sẻ link giới thiệu cho bạn bè</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge className="bg-emerald-900/30 text-emerald-400 shrink-0">2</Badge>
                                <p>Bạn bè đăng ký & mua khóa học → được <strong>giảm 10%</strong></p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge className="bg-emerald-900/30 text-emerald-400 shrink-0">3</Badge>
                                <p>Bạn nhận <strong>15% hoa hồng</strong> từ mỗi đơn hàng</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
