'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                    <XCircle size={48} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-3">Thanh toán thất bại</h1>
                <p className="text-muted-foreground mb-6">
                    Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="gradient" onClick={() => window.history.back()}>
                        <ArrowLeft size={16} className="mr-2" /> Thử lại
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/courses">Về trang khóa học</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
