import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Top users by EXP
export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('user_gamification')
        .select('user_id, total_exp, current_streak, longest_streak, tokens, level, user:users!user_id(full_name, avatar_url)')
        .order('total_exp', { ascending: false })
        .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
