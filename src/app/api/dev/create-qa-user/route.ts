import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    // SECURITY: Chỉ allow run ở localhost
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Only allowed in development' }, { status: 403 });
    }

    try {
        const supabase = createAdminClient();
        const testEmail = 'qa.student@test.com';
        const testPassword = 'password123';

        // 1. Cố gắng xóa user cũ nếu tồn tại để reset
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const oldUser = existingUsers?.users.find((u: any) => u.email === testEmail);
        if (oldUser) {
            // Xóa ở public.users trước để tránh lỗi Foreign Key
            await supabase.from('users').delete().eq('email', testEmail);
            await supabase.auth.admin.deleteUser(oldUser.id);
        }

        // 2. Tạo User mới qua Admin API (Tự động pass qua Hash Auth và verify email)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: { full_name: 'QA Tester' }
        });

        if (authError) throw authError;

        // 3. Upsert vào bảng public.users
        if (authData?.user) {
            await supabase.from('users').upsert({
                id: authData.user.id,
                email: testEmail,
                full_name: 'QA Tester',
                role: 'student',
                provider: 'email',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qa'
            });
        }

        return NextResponse.json({
            message: 'QA Student Account Created Successfully!',
            email: testEmail,
            password: testPassword
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
