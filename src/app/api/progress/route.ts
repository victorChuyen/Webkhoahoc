import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseId, moduleId } = body;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch current user stats
        const { data: userData } = await supabase
            .from('users')
            .select('exp_points, current_streak')
            .eq('id', user.id)
            .single();

        const currentExp = userData?.exp_points || 0;
        const currentStreak = userData?.current_streak || 0;

        // Add 10 EXP per module completed
        const EXP_REWARD = 10;

        const { error } = await supabase
            .from('users')
            .update({
                exp_points: currentExp + EXP_REWARD,
                // Simple streak logic: if updating, ensure it's at least 1
                current_streak: currentStreak > 0 ? currentStreak : 1
            })
            .eq('id', user.id);

        if (error) {
            return new NextResponse(error.message, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            expAdded: EXP_REWARD,
            newTotalExp: currentExp + EXP_REWARD
        });

    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}
