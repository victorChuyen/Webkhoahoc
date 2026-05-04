import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ==========================================
// EMAIL SEND API - Dùng Resend (Free: 100 emails/ngày)
// Hoặc fallback: log + mailto link nếu chưa config
// ==========================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'CourseMarket VN <noreply@coursemarket.vn>';

interface SendEmailRequest {
    to: string;
    subject: string;
    body: string; // plain text
    enrollment_id?: string;
    sequence_id?: string;
}

async function sendViaResend(to: string, subject: string, body: string): Promise<boolean> {
    if (!RESEND_API_KEY) return false;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: [to],
            subject,
            text: body,
        }),
    });

    return res.ok;
}

// POST: Send a single email
export async function POST(req: NextRequest) {
    try {
        const { to, subject, body, enrollment_id, sequence_id }: SendEmailRequest = await req.json();

        if (!to || !subject || !body) {
            return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 });
        }

        let sent = false;
        let method = 'none';

        // Attempt: Resend API (free tier)
        if (RESEND_API_KEY) {
            sent = await sendViaResend(to, subject, body);
            method = 'resend';
        }

        // Log the attempt in DB if enrollment/sequence IDs provided
        if (enrollment_id && sequence_id) {
            const supabase = createAdminClient();
            await supabase.from('email_send_log').insert({
                enrollment_id,
                sequence_id,
                status: sent ? 'sent' : 'failed',
            });
        }

        // If no API configured, return mailto link as fallback
        if (!RESEND_API_KEY) {
            const encodedBody = encodeURIComponent(body);
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
            return NextResponse.json({
                sent: false,
                method: 'mailto_fallback',
                mailto_link: mailtoLink,
                message: 'RESEND_API_KEY chưa cấu hình. Dùng link mailto để gửi thủ công.',
            });
        }

        return NextResponse.json({ sent, method });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
