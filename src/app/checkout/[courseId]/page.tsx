'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Course, User } from '@/types';
import { Input } from '@/components/ui/input';
import { ShoppingCart, CreditCard, Smartphone, Globe, Lock, CheckCircle2, Loader2, Tag } from 'lucide-react';

const PAYMENT_METHODS = [
    {
        id: 'vnpay',
        label: 'VNPay',
        desc: 'Thanh toán qua cổng VNPay',
        icon: '🏦',
        badge: 'Phổ biến',
        color: '#1C4DA1',
        currencies: ['VND'],
    },
    {
        id: 'momo',
        label: 'MoMo',
        desc: 'Ví điện tử MoMo',
        icon: '💜',
        badge: '',
        color: '#AE2071',
        currencies: ['VND'],
    },
    {
        id: 'paypal',
        label: 'PayPal',
        desc: 'International payment via PayPal',
        icon: '🌐',
        badge: 'International',
        color: '#003087',
        currencies: ['USD'],
    },
];

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('vnpay');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [appliedCode, setAppliedCode] = useState<any>(null);
    const [couponInput, setCouponInput] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        const loadData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push(`/login?next=/checkout/${params.courseId}`);
                return;
            }

            const [courseRes, userRes] = await Promise.all([
                supabase.from('courses').select('*').eq('id', params.courseId).single(),
                supabase.from('users').select('*').eq('id', authUser.id).single(),
            ]);

            if (courseRes.data) setCourse(courseRes.data as Course);
            if (userRes.data) setUser(userRes.data as User);

            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', authUser.id)
                .eq('course_id', params.courseId)
                .maybeSingle();

            // Check for referral code
            const refCode = authUser.user_metadata?.referral_code;
            if (refCode) {
                const { data: refData } = await supabase
                    .from('referral_codes')
                    .select('*')
                    .eq('code', refCode)
                    .eq('is_active', true)
                    .single();
                if (refData && refData.user_id !== authUser.id) {
                    setAppliedCode(refData);
                }
            }

            if (enrollment) {
                toast({ title: '✅ Bạn đã đăng ký khóa học này', variant: 'success' });
                router.push(`/student/courses/${params.courseId}/learn`);
                return;
            }

            setLoadingData(false);
        };

        loadData();
    }, [params.courseId]);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setApplyingCoupon(true);
        const supabase = createClient();

        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { data: refData, error } = await supabase
                .from('referral_codes')
                .select('*')
                .eq('code', couponInput.trim().toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !refData) {
                throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
            if (refData.user_id === authUser.id) {
                throw new Error('Bạn không thể tự dùng mã của chính mình.');
            }

            setAppliedCode(refData);
            setCouponInput('');
            toast({ title: 'Áp dụng mã thành công!', variant: 'success' });

        } catch (err: any) {
            toast({
                title: 'Lỗi',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handlePayment = async () => {
        if (!course || !user) return;
        setLoading(true);
        const supabase = createClient();

        try {
            const baseAmount = selectedMethod === 'paypal' ? course.price_usd : course.price_vnd;
            const discountPercent = appliedCode ? appliedCode.discount_percent : 0;
            const amount = baseAmount - (baseAmount * discountPercent / 100);

            if (amount === 0) {
                // Free course - direct enrollment
                const { error: enrollError } = await supabase.from('enrollments').insert({
                    user_id: user.id,
                    course_id: course.id,
                    status: 'active'
                });
                if (enrollError) throw enrollError;

                toast({ title: '🎉 Đăng ký thành công!', variant: 'success' });
                router.push(`/student/courses/${course.id}/learn`);
                return;
            }

            const res = await fetch(`/api/payment/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: course.id,
                    amount,
                    currency,
                    course_title: course.title,
                    referral_code: appliedCode?.code,
                    provider: selectedMethod,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Payment creation failed');

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data.payUrl) {
                window.location.href = data.payUrl;
            } else {
                throw new Error('No payment URL returned');
            }
        } catch (err: any) {
            toast({
                title: 'Lỗi thanh toán',
                description: err.message,
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!course) return null;

    const activeMethods = course.price_vnd > 0 || course.price_usd > 0 ? PAYMENT_METHODS : [];
    const currency = selectedMethod === 'paypal' ? 'USD' : 'VND';
    const baseAmount = selectedMethod === 'paypal' ? course.price_usd : course.price_vnd;
    const discountPercent = appliedCode ? appliedCode.discount_percent : 0;
    const amount = baseAmount - (baseAmount * discountPercent / 100);

    return (
        <div className="min-h-screen bg-muted/20 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                    <ShoppingCart size={28} className="text-primary" /> Thanh toán
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Payment methods */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary" /> Phương thức thanh toán
                                </h2>
                                <div className="space-y-3">
                                    {activeMethods.map((method) => (
                                        <label
                                            key={method.id}
                                            className={`payment-btn cursor-pointer ${selectedMethod === method.id ? 'selected border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value={method.id}
                                                checked={selectedMethod === method.id}
                                                onChange={() => setSelectedMethod(method.id)}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{method.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{method.label}</span>
                                                    {method.badge && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                            {method.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                                            </div>
                                            {selectedMethod === method.id && (
                                                <CheckCircle2 size={20} className="text-primary shrink-0" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security notice */}
                        <div className="flex items-start gap-3 text-sm text-muted-foreground p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
                            <Lock size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium text-emerald-700 dark:text-emerald-400">Thanh toán bảo mật 100%</p>
                                <p className="mt-0.5">Thông tin thanh toán của bạn được mã hóa SSL. Chúng tôi không lưu trữ thông tin thẻ.</p>
                            </div>
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-2">
                        <Card className="sticky top-20">
                            <CardContent className="p-6">
                                <h2 className="font-display font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>

                                <div className="flex gap-3 mb-4 p-3 bg-muted/50 rounded-xl">
                                    <img
                                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                                        alt={course.title}
                                        className="w-16 h-12 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold line-clamp-2 leading-tight">{course.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Truy cập trọn đời</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Giá khóa học</span>
                                        <span className={discountPercent > 0 ? "line-through text-muted-foreground truncate ml-4" : "font-medium"}>
                                            {baseAmount > 0 ? formatCurrency(baseAmount, currency) : 'Miễn phí'}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between ${discountPercent > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                        <span className="flex items-center gap-1">
                                            Ưu đãi {appliedCode && <Badge variant="outline" className="border-emerald-500 text-emerald-500 px-1 py-0 h-4 text-[9px]">{appliedCode.code}</Badge>}
                                        </span>
                                        <span className="font-semibold">-{discountPercent}%</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-5 border-t border-border pt-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nhập mã giảm giá..."
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            className="h-9 uppercase"
                                            disabled={appliedCode !== null}
                                        />
                                        {appliedCode ? (
                                            <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => setAppliedCode(null)}>
                                                Hủy
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" size="sm" className="h-9 shrink-0 flex items-center gap-1" onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput.trim()}>
                                                {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />} Áp dụng
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground ml-1">Nhập mã Affiliate từ người giới thiệu để được giảm giá 10%</p>
                                </div>

                                <div className="border-t border-border pt-3 mb-5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Tổng cộng</span>
                                        <span className="text-xl font-bold text-primary">
                                            {amount > 0 ? formatCurrency(amount, currency) : 'Miễn phí'}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="gradient"
                                    className="w-full"
                                    onClick={handlePayment}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 size={16} className="animate-spin mr-2" /> Đang xử lý...</>
                                    ) : (
                                        <>{amount > 0 ? `Thanh toán ${formatCurrency(amount, currency)}` : '🎉 Đăng ký miễn phí'}</>
                                    )}
                                </Button>

                                <div className="mt-4 space-y-2">
                                    {['✓ Hoàn tiền 100% trong 30 ngày', '✓ Học trọn đời không giới hạn', '✓ Chứng chỉ hoàn thành'].map(item => (
                                        <p key={item} className="text-xs text-muted-foreground text-center">{item}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
