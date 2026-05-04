'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

export default function NewCoursePage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const short_description = formData.get('short_description') as string;
        const price_vnd = Number(formData.get('price_vnd')) || 0;
        const level = formData.get('level') as string;
        const thumbnail_url = formData.get('thumbnail_url') as string;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Vui lòng đăng nhập lại.');

            const { data, error } = await supabase.from('courses').insert([
                {
                    title,
                    short_description,
                    price_vnd,
                    price_usd: Math.round(price_vnd / 25000), // temp format
                    level: level || 'beginner',
                    language: 'vi', // default
                    thumbnail_url: thumbnail_url || null,
                    instructor_id: user.id,
                    published: false,
                    modules: []
                }
            ]).select().single();

            if (error) throw error;

            toast({ title: 'Tạo khóa học thành công!', description: 'Chuyển đến trang chỉnh sửa bài giảng...' });
            router.push(`/instructor/courses/${data.id}/edit`);

        } catch (error: any) {
            console.error(error);
            toast({ title: 'Lỗi tạo khóa học', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container max-w-2xl mx-auto px-4">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-muted-foreground">
                        <Link href="/instructor/dashboard">
                            <ChevronLeft size={16} className="mr-1" /> Quay lại Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-display font-bold">Tạo khóa học mới</h1>
                    <p className="text-muted-foreground mt-1">Điền các thông tin cơ bản để nháp khóa học của bạn</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                        <CardDescription>Bạn có thể chỉnh sửa lại sau khi tạo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">Tên khóa học <span className="text-destructive">*</span></label>
                                <Input id="title" name="title" required placeholder="VD: Lập trình Next.js từ cơ bản đến nâng cao" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="short_description" className="text-sm font-medium">Mô tả ngắn</label>
                                <Textarea id="short_description" name="short_description" placeholder="Khóa học này giúp học viên đạt được điều gì...?" rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="price_vnd" className="text-sm font-medium">Giá tiền (VND)</label>
                                    <Input id="price_vnd" name="price_vnd" type="number" min="0" step="1000" placeholder="0 = Miễn phí" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="level" className="text-sm font-medium">Cấp độ</label>
                                    <select
                                        id="level"
                                        name="level"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="beginner">Người mới bắt đầu (Beginner)</option>
                                        <option value="intermediate">Trung bình (Intermediate)</option>
                                        <option value="advanced">Nâng cao (Advanced)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="thumbnail_url" className="text-sm font-medium">Link Ảnh bìa (Thumbnail URL)</label>
                                <Input id="thumbnail_url" name="thumbnail_url" placeholder="https://..." />
                                <p className="text-xs text-muted-foreground">Tạm thời hỗ trợ nhập link ảnh copy từ bên ngoài (Imgur, Unsplash...)</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/instructor/dashboard">Hủy</Link>
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Đang tạo...</> : 'Tạo khóa học'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
