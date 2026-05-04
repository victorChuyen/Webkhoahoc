import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get current user's affiliate data
export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get referral code
    const { data: code } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Get referrals made
    const { data: referrals } = await supabase
        .from('referrals')
        .select('*, referred:users!referred_id(full_name), enrollment:enrollments!enrollment_id(course_id, course:courses!course_id(title, price_vnd))')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

    const totalCommission = (referrals || []).reduce((sum, r) => sum + (r.commission_amount || 0), 0);
    const paidCommission = (referrals || []).filter(r => r.status === 'paid').reduce((sum, r) => sum + r.commission_amount, 0);

    return NextResponse.json({
        code,
        referrals: referrals || [],
        stats: {
            total_referrals: referrals?.length || 0,
            total_commission: totalCommission,
            paid_commission: paidCommission,
            pending_commission: totalCommission - paidCommission,
        },
    });
}

// POST: Create a referral code for current user
export async function POST() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if already has a code
    const { data: existing } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

    if (existing) return NextResponse.json({ code: existing.code });

    // Generate unique code
    const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
        .from('referral_codes')
        .insert({ user_id: user.id, code, discount_percent: 10, commission_percent: 15 })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
