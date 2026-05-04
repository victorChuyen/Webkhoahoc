import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const url = new URL(request.url);

    // 1. VNPAY Return
    if (url.searchParams.has('vnp_SecureHash')) {
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

        const targetPaymentId = url.searchParams.get('vnp_TxnRef');
        const isSuccess = url.searchParams.get('vnp_ResponseCode') === '00' && signed === vnp_SecureHash;

        if (isSuccess) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?paymentId=${targetPaymentId}`);
        } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed?paymentId=${targetPaymentId}`);
        }
    }

    // 2. MoMo Return
    if (url.searchParams.has('signature') && url.searchParams.has('partnerCode')) {
        const accessKey = process.env.MOMO_ACCESS_KEY || 'test1';
        const secretKey = process.env.MOMO_SECRET_KEY || 'testsecret';

        const amount = url.searchParams.get('amount') || '';
        const extraData = url.searchParams.get('extraData') || '';
        const message = url.searchParams.get('message') || '';
        const orderId = url.searchParams.get('orderId') || '';
        const orderInfo = url.searchParams.get('orderInfo') || '';
        const orderType = url.searchParams.get('orderType') || '';
        const partnerCode = url.searchParams.get('partnerCode') || '';
        const payType = url.searchParams.get('payType') || '';
        const requestId = url.searchParams.get('requestId') || '';
        const responseTime = url.searchParams.get('responseTime') || '';
        const resultCode = url.searchParams.get('resultCode') || '';
        const transId = url.searchParams.get('transId') || '';
        const providedSignature = url.searchParams.get('signature');

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const targetPaymentId = orderId;
        const isSuccess = resultCode === '0' && providedSignature === expectedSignature;

        if (isSuccess) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?paymentId=${targetPaymentId}`);
        } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed?paymentId=${targetPaymentId}`);
        }
    }

    // 3. PayPal Return
    if (url.searchParams.has('token') && url.searchParams.get('provider') === 'paypal') {
        const paymentId = url.searchParams.get('paymentId');
        const token = url.searchParams.get('token'); // PayPal Order ID
        const targetPaymentId = paymentId;

        if (!targetPaymentId) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`);
        }

        const clientId = process.env.PAYPAL_CLIENT_ID || 'test';
        const secret = process.env.PAYPAL_SECRET || 'test';
        const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

        try {
            // Get Access Token
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

            if (tokenData.access_token) {
                // Capture Order
                const captureRes = await fetch(`${apiUrl}/v2/checkout/orders/${token}/capture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`,
                        'Content-Type': 'application/json',
                    }
                });
                const captureData = await captureRes.json();

                if (captureData.status === 'COMPLETED') {
                    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?paymentId=${targetPaymentId}`);
                }
            }
        } catch (e) {
            console.error("PayPal Capture Error", e);
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed?paymentId=${targetPaymentId}`);
    }

    // 4. Fallback (Mock)
    const paymentId = url.searchParams.get('paymentId');
    const status = url.searchParams.get('status');
    const targetPaymentId = paymentId;

    if (!targetPaymentId) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed`);
    }

    if (status === 'success') {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?paymentId=${targetPaymentId}`);
    } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/payment/failed?paymentId=${targetPaymentId}`);
    }
}
