import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
                    <ShieldOff size={48} className="text-amber-500" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-3">Không có quyền truy cập</h1>
                <p className="text-muted-foreground mb-6">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>
                <Button variant="gradient" asChild>
                    <Link href="/">← Về trang chủ</Link>
                </Button>
            </div>
        </div>
    );
}
