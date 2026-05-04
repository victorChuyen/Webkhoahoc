import Link from 'next/link';
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage({
    searchParams,
}: {
    searchParams: { paymentId?: string };
}) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-3">Thanh toán thành công! 🎉</h1>
                <p className="text-muted-foreground mb-2">
                    Cảm ơn bạn đã đăng ký! Bạn đã có thể bắt đầu học ngay bây giờ.
                </p>
                {searchParams.paymentId && (
                    <p className="text-xs text-muted-foreground mb-6">Mã giao dịch: {searchParams.paymentId}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="gradient" asChild>
                        <Link href="/student/dashboard">
                            <BookOpen size={16} className="mr-2" /> Vào học ngay
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/courses">
                            Khám phá thêm <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
