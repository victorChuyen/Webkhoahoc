import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ==========================================
// CRON PROCESSOR: Email Sequence Auto-Send
// Gọi endpoint này mỗi ngày (Vercel Cron / Supabase pg_cron / external cron)
// URL: GET /api/email/process-sequences?secret=YOUR_CRON_SECRET
// ==========================================

const CRON_SECRET = process.env.CRON_SECRET || 'coursemarket-cron-2024';

export async function GET(req: NextRequest) {
    // Basic auth for cron
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const results: { sent: number; skipped: number; errors: string[] } = { sent: 0, skipped: 0, errors: [] };

    try {
        // 1. Fetch all active email sequences
        const { data: sequences } = await supabase
            .from('email_sequences')
            .select('*, course:courses!course_id(id, title)')
            .eq('is_active', true)
            .order('course_id')
            .order('step_order');

        if (!sequences || sequences.length === 0) {
            return NextResponse.json({ message: 'No active sequences', ...results });
        }

        // 2. Fetch all enrollments
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id, user_id, course_id, enrolled_at, progress, user:users!user_id(id, full_name, email)');

        if (!enrollments || enrollments.length === 0) {
            return NextResponse.json({ message: 'No enrollments', ...results });
        }

        // 3. Fetch already sent logs to avoid duplicates
        const { data: sentLogs } = await supabase
            .from('email_send_log')
            .select('enrollment_id, sequence_id');

        const sentSet = new Set(
            (sentLogs || []).map(l => `${l.enrollment_id}__${l.sequence_id}`)
        );

        // 4. Process each enrollment × sequence match
        for (const enrollment of enrollments) {
            const user = Array.isArray(enrollment.user) ? enrollment.user[0] : enrollment.user;
            if (!user?.email) continue;

            const enrolledAt = new Date(enrollment.enrolled_at);
            const daysSince = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

            // Find sequences for this course
            const courseSequences = sequences.filter(s => {
                const course = Array.isArray(s.course) ? s.course[0] : s.course;
                return course?.id === enrollment.course_id;
            });

            for (const seq of courseSequences) {
                const key = `${enrollment.id}__${seq.id}`;

                // Already sent? Skip
                if (sentSet.has(key)) {
                    results.skipped++;
                    continue;
                }

                // Not yet time? Skip
                if (daysSince < seq.delay_days) continue;

                // Time to send!
                const course = Array.isArray(seq.course) ? seq.course[0] : seq.course;
                const progressObj = enrollment.progress || {};
                const completedCount = Object.keys(progressObj).filter(k => k !== 'last_module' && progressObj[k] === true).length;

                const subject = interpolateTemplate(seq.subject, {
                    student_name: user.full_name || 'Bạn',
                    course_name: course?.title || '',
                    progress: `${completedCount} bài hoàn thành`,
                    days_since_enrollment: String(daysSince),
                });

                const body = interpolateTemplate(seq.body_template, {
                    student_name: user.full_name || 'Bạn',
                    course_name: course?.title || '',
                    progress: `${completedCount} bài hoàn thành`,
                    days_since_enrollment: String(daysSince),
                });

                // Try sending via email API
                try {
                    const sendRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: user.email,
                            subject,
                            body,
                            enrollment_id: enrollment.id,
                            sequence_id: seq.id,
                        }),
                    });

                    if (sendRes.ok) {
                        results.sent++;
                        sentSet.add(key); // Prevent duplicate in same run
                    } else {
                        results.errors.push(`Failed: ${user.email} - ${seq.subject}`);
                    }
                } catch (e: any) {
                    results.errors.push(`Error: ${user.email} - ${e.message}`);
                }
            }
        }

        return NextResponse.json({
            message: `Processed: ${results.sent} sent, ${results.skipped} skipped, ${results.errors.length} errors`,
            ...results,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function interpolateTemplate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}
