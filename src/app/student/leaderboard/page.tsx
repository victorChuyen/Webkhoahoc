'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Zap, ArrowLeft, Medal, Crown } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
    user_id: string;
    total_exp: number;
    current_streak: number;
    longest_streak: number;
    tokens: number;
    level: number;
    user: { full_name: string; avatar_url: string | null } | null;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await fetch('/api/gamification/leaderboard');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.map((u: any) => ({
                    ...u,
                    user: Array.isArray(u.user) ? u.user[0] : u.user,
                })));
            }
            setLoading(false);
        };
        load();
    }, []);

    const getRankIcon = (idx: number) => {
        if (idx === 0) return <Crown size={20} className="text-yellow-400" />;
        if (idx === 1) return <Medal size={20} className="text-slate-300" />;
        if (idx === 2) return <Medal size={20} className="text-amber-600" />;
        return <span className="text-sm font-bold text-slate-500 w-5 text-center">{idx + 1}</span>;
    };

    const getRankBg = (idx: number) => {
        if (idx === 0) return 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-yellow-700/40';
        if (idx === 1) return 'bg-gradient-to-r from-slate-800/60 to-slate-800/30 border-slate-600/40';
        if (idx === 2) return 'bg-gradient-to-r from-amber-900/20 to-orange-900/10 border-amber-800/40';
        return 'bg-slate-800/30 border-slate-700/50';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white py-8">
            <div className="container mx-auto px-4 max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/student/checkin">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Trophy size={22} className="text-amber-400" />
                            Bảng Xếp Hạng
                        </h1>
                        <p className="text-xs text-slate-400">Top học viên năng nổ nhất</p>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {users.length >= 3 && (
                    <div className="flex items-end justify-center gap-3 mb-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-400 overflow-hidden flex items-center justify-center text-lg font-bold">
                                {users[1].user?.full_name?.[0] || '?'}
                            </div>
                            <p className="text-xs font-medium mt-1 text-slate-300 truncate max-w-[80px]">{users[1].user?.full_name}</p>
                            <div className="bg-slate-600 rounded-t-lg w-20 h-16 flex items-center justify-center mt-2">
                                <span className="text-lg font-bold text-slate-300">🥈</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{users[1].total_exp} EXP</p>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center -mt-4">
                            <div className="w-16 h-16 rounded-full bg-yellow-600 border-2 border-yellow-400 overflow-hidden flex items-center justify-center text-xl font-bold shadow-lg shadow-yellow-500/30">
                                {users[0].user?.full_name?.[0] || '?'}
                            </div>
                            <p className="text-xs font-bold mt-1 text-yellow-300 truncate max-w-[80px]">{users[0].user?.full_name}</p>
                            <div className="bg-yellow-700 rounded-t-lg w-20 h-20 flex items-center justify-center mt-2">
                                <span className="text-2xl font-bold">🥇</span>
                            </div>
                            <p className="text-xs text-yellow-400 mt-1 font-bold">{users[0].total_exp} EXP</p>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-amber-800 border-2 border-amber-600 overflow-hidden flex items-center justify-center text-lg font-bold">
                                {users[2].user?.full_name?.[0] || '?'}
                            </div>
                            <p className="text-xs font-medium mt-1 text-amber-300 truncate max-w-[80px]">{users[2].user?.full_name}</p>
                            <div className="bg-amber-800 rounded-t-lg w-20 h-12 flex items-center justify-center mt-2">
                                <span className="text-lg font-bold">🥉</span>
                            </div>
                            <p className="text-xs text-amber-400 mt-1">{users[2].total_exp} EXP</p>
                        </div>
                    </div>
                )}

                {/* Full List */}
                <div className="space-y-2">
                    {users.map((u, idx) => (
                        <div key={u.user_id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(idx)}`}>
                            <div className="w-6 flex justify-center">{getRankIcon(idx)}</div>
                            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                                {u.user?.full_name?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{u.user?.full_name || 'Ẩn danh'}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span>Lv.{u.level}</span>
                                    <span className="flex items-center gap-0.5"><Flame size={9} className="text-orange-400" /> {u.current_streak}d</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-violet-300">{u.total_exp}</p>
                                <p className="text-[10px] text-slate-500">EXP</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
