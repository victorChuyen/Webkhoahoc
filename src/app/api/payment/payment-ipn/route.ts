import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// VNPAY Webhook Server-to-Server
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        if (!url.searchParams.has('vnp_SecureHash')) {
            return NextResponse.json({ RspCode: '99', Message: 'Unknown request' });
        }

        const vnp_SecureHash = url.searchParams.get('vnp_SecureHash');
        const secretKey = process.env.VNPAY_SECURE_SECRET || 'testsecret';

        const vnp_Params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
                vnp_Params[key] = value;
            }
        });

        const sortedParams: Record<string, string> = {};
        const keys = Object.keys(vnp_Params).map(k => encodeURIComponent(k)).sort();
        for (const key of keys) {
            sortedParams[key] = encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+');
        }

        const signData = Object.entries(sortedParams).map(([key, val]) => `${key}=${val}`).join('&');
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (signed !== vnp_SecureHash) {
            return NextResponse.json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const targetPaymentId = url.searchParams.get('vnp_TxnRef');
        const vnpAmount = parseInt(url.searchParams.get('vnp_Amount') || '0', 10) / 100;

        const supabase = createAdminClient();
        const { data: payment } = await supabase.from('payments').select('*').eq('id', targetPaymentId).single();

        if (!payment) {
            return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
        }

        if (payment.amount_vnd !== vnpAmount) {
            return NextResponse.json({ RspCode: '04', Message: 'Invalid amount' });
        }

        if (payment.status === 'paid') {
            return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        const isSuccess = url.searchParams.get('vnp_ResponseCode') === '00';
        if (isSuccess) {
            try {
                await supabase.from('payments').update({
                    status: 'paid',
                    provider_ref: url.searchParams.get('vnp_TransactionNo'),
                }).eq('id', targetPaymentId);

                await supabase.from('enrollments').upsert({ user_id: payment.user_id, course_id: payment.course_id });
                await supabase.rpc('increment_course_students', { course_id: payment.course_id });

                await processReferral(supabase, payment);
            } catch (e) { }
        } else {
            await supabase.from('payments').update({ status: 'failed' }).eq('id', targetPaymentId);
        }

        return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (err) {
        return NextResponse.json({ RspCode: '99', Message: 'Unknown error' });
    }
}

// MoMo & PayPal Webhook Server-to-Server
export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        let body;
        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // MoMo IPN Webhook
        if (body.partnerCode && body.signature) {
            const accessKey = process.env.MOMO_ACCESS_KEY || 'test1';
            const secretKey = process.env.MOMO_SECRET_KEY || 'testsecret';

            const rawSignature = `accessKey=${accessKey}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
            const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

            if (body.signature !== expectedSignature) {
                return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
            }

            if (body.resultCode !== 0) {
                return NextResponse.json({ message: 'OK' }, { status: 200 });
            }

            const { data: payment } = await supabase.from('payments').select('*').eq('id', body.orderId).single();
            if (payment && payment.status !== 'paid' && payment.amount_vnd === parseInt(body.amount)) {
                try {
                    await supabase.from('payments').update({
                        status: 'paid',
                        provider_ref: body.transId,
                    }).eq('id', payment.id);

                    await supabase.from('enrollments').upsert({ user_id: payment.user_id, course_id: payment.course_id });
                    await supabase.rpc('increment_course_students', { course_id: payment.course_id });

                    await processReferral(supabase, payment);
                } catch (e) {
                    // Ignore unique constraint errors
                }
            }
            return NextResponse.json({ resultCode: 0, message: 'OK' }, { status: 200 });
        }

        // PayPal Webhook
        if (body.event_type && body.resource_type === 'checkout-order') {
            const orderId = body.resource.id;
            const { data: payment } = await supabase.from('payments').select('*').eq('provider_ref', orderId).single();
            if (payment && payment.status !== 'paid' && body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                try {
                    await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id);
                    await supabase.from('enrollments').upsert({ user_id: payment.user_id, course_id: payment.course_id });
                    await supabase.rpc('increment_course_students', { course_id: payment.course_id });

                    await processReferral(supabase, payment);
                } catch (e) { }
            }
            return NextResponse.json({ message: 'OK' }, { status: 200 });
        }

        return NextResponse.json({ message: 'Unknown provider' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function processReferral(supabase: any, payment: any) {
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(payment.user_id);
        const refCode = user?.user_metadata?.referral_code;
        if (refCode && payment.amount_vnd > 0) {
            const { data: refData } = await supabase.from('referral_codes').select('*').eq('code', refCode).eq('is_active', true).single();
            if (refData && refData.user_id !== payment.user_id) {
                const { data: enrollment } = await supabase.from('enrollments').select('id').eq('user_id', payment.user_id).eq('course_id', payment.course_id).single();
                if (enrollment) {
                    const { data: existingRef } = await supabase.from('referrals').select('id').eq('enrollment_id', enrollment.id).single();
                    if (!existingRef) {
                        const commission = Math.round(payment.amount_vnd * (refData.commission_percent || 15) / 100);
                        await supabase.from('referrals').insert({
                            referrer_id: refData.user_id,
                            referred_id: payment.user_id,
                            referral_code: refData.code,
                            enrollment_id: enrollment.id,
                            commission_amount: commission,
                            status: 'pending'
                        });
                    }
                }
            }
        }
    } catch (err) { }
}
