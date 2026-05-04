import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { course_id, amount, currency, provider } = body;

        // Create payment record
        const { data: payment, error } = await supabase.from('payments').insert({
            user_id: user.id,
            course_id,
            amount_vnd: currency === 'VND' ? amount : null,
            amount_usd: currency === 'USD' ? amount : null,
            currency,
            payment_method: provider || 'mock',
            status: 'pending',
        }).select().single();

        if (error) throw error;

        const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/payment-return?paymentId=${payment.id}`;

        // VNPay generator
        if (provider === 'vnpay') {
            const tmnCode = process.env.VNPAY_TMN_CODE || 'TESTCODE';
            const secretKey = process.env.VNPAY_SECURE_SECRET || 'testsecret';
            const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

            const vnpParams: Record<string, string> = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: payment.id,
                vnp_OrderInfo: `Thanh toan ma GD: ${payment.id}`,
                vnp_OrderType: 'other',
                vnp_Amount: String(amount * 100),
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: '127.0.0.1',
                vnp_CreateDate: new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14),
            };

            const sortedParams: Record<string, string> = {};
            const keys = Object.keys(vnpParams).map(k => encodeURIComponent(k)).sort();
            for (const key of keys) {
                sortedParams[key] = encodeURIComponent(vnpParams[key]).replace(/%20/g, '+');
            }

            const signData = Object.entries(sortedParams).map(([key, val]) => `${key}=${val}`).join('&');
            const hmac = crypto.createHmac('sha512', secretKey);
            sortedParams['vnp_SecureHash'] = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            const paramsUrl = new URLSearchParams(sortedParams);
            return NextResponse.json({ paymentUrl: `${vnpUrl}?${signData}&vnp_SecureHash=${sortedParams['vnp_SecureHash']}`, paymentId: payment.id });
        }

        // MoMo generator
        if (provider === 'momo') {
            const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMOTEST';
            const accessKey = process.env.MOMO_ACCESS_KEY || 'test1';
            const secretKey = process.env.MOMO_SECRET_KEY || 'testsecret';
            const momoApi = process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create';
            const ipnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/payment-ipn`;

            const orderInfo = `Thanh toan khoa hoc ${course_id}`;
            const amountStr = String(amount);
            const extraData = '';
            const requestType = 'captureWallet';
            const requestId = payment.id;
            const orderId = payment.id;

            const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                partnerName: "Webkhoahoc",
                storeId: "MomoTestStore",
                requestId: requestId,
                amount: amountStr,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: returnUrl,
                ipnUrl: ipnUrl,
                lang: "vi",
                requestType: requestType,
                autoCapture: true,
                extraData: extraData,
                signature: signature
            });

            const momoRes = await fetch(momoApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody
            });
            const momoData = await momoRes.json();

            if (momoData.payUrl) {
                return NextResponse.json({ paymentUrl: momoData.payUrl, paymentId: payment.id });
            } else {
                throw new Error(momoData.message || "Lỗi tạo thanh toán MoMo");
            }
        }

        // PayPal generator
        if (provider === 'paypal') {
            const clientId = process.env.PAYPAL_CLIENT_ID || 'test';
            const secret = process.env.PAYPAL_SECRET || 'test';
            const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

            // 1. Get Access Token
            const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
            const tokenRes = await fetch(`${apiUrl}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials'
            });
            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;

            if (!accessToken) throw new Error('Không thể kết nối PayPal');

            // 2. Create Order
            const orderRes = await fetch(`${apiUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        reference_id: payment.id,
                        amount: {
                            currency_code: 'USD',
                            value: String(amount)
                        },
                        description: `Thanh toan khoa hoc ${course_id}`
                    }],
                    application_context: {
                        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/payment-return?paymentId=${payment.id}&provider=paypal`,
                        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/failed?paymentId=${payment.id}`,
                        user_action: "PAY_NOW"
                    }
                })
            });

            const orderData = await orderRes.json();

            // Save paypal order id into provider_ref to check in IPN/Return later
            await supabase.from('payments').update({ provider_ref: orderData.id }).eq('id', payment.id);

            const approveLink = orderData.links?.find((link: any) => link.rel === 'approve')?.href;
            if (approveLink) {
                return NextResponse.json({ paymentUrl: approveLink, paymentId: payment.id });
            } else {
                throw new Error("Lỗi tạo thanh toán PayPal");
            }
        }

        // MOCK Payment (for unsupported/test providers)
        const mockPaymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/payment-return?paymentId=${payment.id}&provider=mock&status=success`;
        return NextResponse.json({ paymentUrl: mockPaymentUrl, paymentId: payment.id });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
