'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Star, Trophy, Calendar, ArrowLeft, Coins, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface GamificationData {
    total_exp: number;
    current_streak: number;
    longest_streak: number;
    tokens: number;
    level: number;
    checked_in_today: boolean;
    history: string[];
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CheckinPage() {
    const [data, setData] = useState<GamificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    const load = async () => {
        const res = await fetch('/api/gamification/checkin');
        if (res.ok) setData(await res.json());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const doCheckin = async () => {
        setChecking(true);
        const res = await fetch('/api/gamification/checkin', { method: 'POST' });
        const json = await res.json();
        if (res.ok) {
            setResult(json);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
            load(); // Refresh data
        } else {
            setResult({ error: json.error });
        }
        setChecking(false);
    };

    // Generate 7-day calendar
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                day: WEEKDAYS[d.getDay()],
                isToday: i === 0,
                checked: data?.history.includes(dateStr) || false,
            });
        }
        return days;
    };

    const getExpProgress = () => {
        if (!data) return 0;
        return (data.total_exp % 100);
    };

    const getLevelTitle = (level: number) => {
        if (level >= 10) return '🏆 Grandmaster';
        if (level >= 7) return '⚡ Expert';
        if (level >= 5) return '🔥 Pro';
        if (level >= 3) return '💪 Fighter';
        return '🌱 Beginner';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 text-white py-8">
            {/* Celebration Animation */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="animate-bounce text-6xl">🎉</div>
                </div>
            )}

            <div className="container mx-auto px-4 max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Check-in Hằng Ngày</h1>
                </div>

                {/* Level + EXP Card */}
                <Card className="bg-gradient-to-br from-violet-600 to-purple-800 border-0 text-white mb-6 overflow-hidden relative">
                    <div className="absolute top-2 right-3 text-4xl opacity-20">{getLevelTitle(data?.level || 1).split(' ')[0]}</div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Level {data?.level || 1}</p>
                                <p className="text-lg font-bold">{getLevelTitle(data?.level || 1)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-violet-200 text-xs">Tổng EXP</p>
                                <p className="text-2xl font-bold">{data?.total_exp || 0}</p>
                            </div>
                        </div>
                        {/* EXP Progress Bar */}
                        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
                                style={{ width: `${getExpProgress()}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-violet-200 mt-1 text-right">{getExpProgress()}/100 EXP → Level {(data?.level || 1) + 1}</p>
                    </CardContent>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <Flame size={20} className="mx-auto text-orange-400 mb-1" />
                            <p className="text-xl font-bold text-white">{data?.current_streak || 0}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Streak</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <Trophy size={20} className="mx-auto text-amber-400 mb-1" />
                            <p className="text-xl font-bold text-white">{data?.longest_streak || 0}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Kỷ lục</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-3 text-center">
                            <Coins size={20} className="mx-auto text-yellow-400 mb-1" />
                            <p className="text-xl font-bold text-white">{data?.tokens || 0}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Tokens</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 7-Day Calendar */}
                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">7 ngày gần nhất</p>
                        <div className="grid grid-cols-7 gap-2">
                            {getLast7Days().map(day => (
                                <div key={day.date} className="flex flex-col items-center gap-1">
                                    <span className={`text-[10px] font-medium ${day.isToday ? 'text-violet-400' : 'text-slate-500'}`}>{day.day}</span>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${day.checked
                                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                            : day.isToday
                                                ? 'border-2 border-dashed border-violet-400 text-violet-400'
                                                : 'bg-slate-700 text-slate-500'
                                        }`}>
                                        {day.checked ? <CheckCircle2 size={16} /> : day.date.split('-')[2]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Check-in Button */}
                <div className="text-center mb-6">
                    {data?.checked_in_today ? (
                        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-2xl p-6">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
                            <p className="text-emerald-300 font-bold text-lg">Đã check-in hôm nay! ✨</p>
                            <p className="text-emerald-400/60 text-sm mt-1">Quay lại vào ngày mai nhé!</p>
                        </div>
                    ) : (
                        <button
                            onClick={doCheckin}
                            disabled={checking}
                            className="w-full py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl text-white font-bold text-lg shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {checking ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                    Đang check-in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Star size={20} /> CHECK-IN (+10 EXP)
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Result Toast */}
                {result && !result.error && (
                    <Card className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-emerald-700/50 mb-6 animate-in">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Zap size={24} className="text-yellow-400" />
                                <div>
                                    <p className="font-bold text-emerald-300">+{result.exp_earned} EXP earned!</p>
                                    <p className="text-xs text-emerald-400/70">
                                        Streak: {result.streak} ngày • +{result.tokens_earned} tokens
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Streak Rewards Info */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">🎁 Phần thưởng Streak</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">3 ngày liên tục</span>
                                <Badge className="bg-blue-600/30 text-blue-300 border-blue-700">+10 EXP bonus • +2 tokens</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">7 ngày liên tục</span>
                                <Badge className="bg-violet-600/30 text-violet-300 border-violet-700">+20 EXP bonus • +5 tokens</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">30 ngày liên tục</span>
                                <Badge className="bg-amber-600/30 text-amber-300 border-amber-700">🏆 Huy chương vàng</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Link to Leaderboard */}
                <div className="mt-6 text-center">
                    <Link href="/student/leaderboard">
                        <Button variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/20">
                            <Trophy size={16} className="mr-1.5" /> Xem Bảng Xếp Hạng
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
