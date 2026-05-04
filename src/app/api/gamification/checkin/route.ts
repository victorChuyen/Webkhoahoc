import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Check in today
export async function POST() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    // Try to insert check-in (unique constraint prevents duplicates)
    const { error: checkinError } = await supabase
        .from('checkins')
        .insert({ user_id: user.id, checked_in_at: today, exp_earned: 10 });

    if (checkinError) {
        if (checkinError.code === '23505') {
            return NextResponse.json({ error: 'Bạn đã check-in hôm nay rồi!' }, { status: 409 });
        }
        return NextResponse.json({ error: checkinError.message }, { status: 500 });
    }

    // Get or create gamification row
    const { data: existing } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    let bonusExp = 0;

    if (existing) {
        // Continue streak if checked in yesterday
        if (existing.last_checkin === yesterdayStr) {
            newStreak = existing.current_streak + 1;
        }

        // Streak bonuses
        if (newStreak >= 7) bonusExp = 20;
        else if (newStreak >= 3) bonusExp = 10;

        const totalExp = existing.total_exp + 10 + bonusExp;
        const newLevel = Math.floor(totalExp / 100) + 1;
        const tokensEarned = newStreak >= 7 ? 5 : newStreak >= 3 ? 2 : 1;

        await supabase
            .from('user_gamification')
            .update({
                total_exp: totalExp,
                current_streak: newStreak,
                longest_streak: Math.max(existing.longest_streak, newStreak),
                tokens: existing.tokens + tokensEarned,
                last_checkin: today,
                level: newLevel,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        return NextResponse.json({
            success: true,
            exp_earned: 10 + bonusExp,
            streak: newStreak,
            tokens_earned: tokensEarned,
            total_exp: totalExp,
            level: newLevel,
        });
    } else {
        // First time: create gamification row
        await supabase
            .from('user_gamification')
            .insert({
                user_id: user.id,
                total_exp: 10,
                current_streak: 1,
                longest_streak: 1,
                tokens: 1,
                last_checkin: today,
                level: 1,
            });

        return NextResponse.json({
            success: true,
            exp_earned: 10,
            streak: 1,
            tokens_earned: 1,
            total_exp: 10,
            level: 1,
        });
    }
}

// GET: Get current user's gamification status
export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: todayCheckin } = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('checked_in_at', today)
        .single();

    // Get recent 7 days checkin history
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const { data: history } = await supabase
        .from('checkins')
        .select('checked_in_at')
        .eq('user_id', user.id)
        .gte('checked_in_at', weekAgo.toISOString().split('T')[0])
        .order('checked_in_at');

    return NextResponse.json({
        ...(gamification || { total_exp: 0, current_streak: 0, longest_streak: 0, tokens: 0, level: 1 }),
        checked_in_today: !!todayCheckin,
        history: (history || []).map(h => h.checked_in_at),
    });
}
