'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course, CourseModule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Save, GripVertical, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

// Fallback UUID if package is missing
const generateId = () => typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7);

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const courseId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
        if (data) {
            setCourse(data);
            setModules(Array.isArray(data.modules) ? data.modules : []);
        }
        setIsLoading(false);
    };

    const handleAddModule = () => {
        const newModule: CourseModule = {
            id: generateId(),
            title: `Bài giảng ${modules.length + 1}`,
            video_url: '',
            duration: 0,
            order: modules.length + 1,
            description: ''
        };
        setModules([...modules, newModule]);
    };

    const handleUpdateModule = (id: string, field: keyof CourseModule, value: any) => {
        setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleDeleteModule = (id: string) => {
        setModules(modules.filter(m => m.id !== id));
    };

    const togglePublish = async () => {
        if (!course) return;

        // Validation check before publishing
        if (!course.published && modules.length === 0) {
            toast({ title: 'Lỗi', description: 'Phải có ít nhất 1 bài giảng để xuất bản.', variant: 'destructive' });
            return;
        }

        const newStatus = !course.published;
        const { error } = await supabase.from('courses').update({ published: newStatus }).eq('id', courseId);
        if (!error) {
            setCourse({ ...course, published: newStatus });
            toast({ title: newStatus ? 'Đã xuất bản khóa học!' : 'Đã đưa về trạng thái Nháp.' });
        }
    };

    const handleSaveCourse = async () => {
        if (!course) return;
        setIsSaving(true);

        const { error } = await supabase.from('courses').update({
            modules: modules
        }).eq('id', courseId);

        if (!error) {
            toast({ title: 'Đã lưu thay đổi!' });
        } else {
            toast({ title: 'Lỗi khi lưu', description: error.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy khóa học.</div>;

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-muted-foreground">
                            <Link href="/instructor/dashboard">
                                <ChevronLeft size={16} className="mr-1" /> Quay lại Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-display font-bold line-clamp-1">{course.title}</h1>
                        <p className="text-muted-foreground mt-1">Quản lý nội dung và bài giảng</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border">
                        <label htmlFor="publish-toggle" className="font-semibold cursor-pointer">
                            {course.published ? (
                                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16} /> Đã xuất bản</span>
                            ) : (
                                <span className="text-muted-foreground">Bản nháp</span>
                            )}
                        </label>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-primary cursor-pointer focus:ring-primary"
                            id="publish-toggle"
                            checked={course.published}
                            onChange={togglePublish}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Danh sách bài giảng ({modules.length})</h2>
                    <Button onClick={handleAddModule} variant="secondary" size="sm">
                        <Plus size={16} className="mr-2" /> Thêm bài giảng
                    </Button>
                </div>

                {modules.length === 0 ? (
                    <Card className="border-dashed mb-6 bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p className="mb-4">Khóa học này chưa có video nào.</p>
                            <Button onClick={handleAddModule}><Plus size={16} className="mr-2" /> Thêm bài học đầu tiên</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 mb-6">
                        {modules.sort((a, b) => a.order - b.order).map((mod, index) => (
                            <Card key={mod.id} className="relative group overflow-hidden border-border/60 shadow-sm">
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted border-r border-border/50 flex flex-col items-center justify-center cursor-move text-slate-400 opacity-50 hover:opacity-100">
                                    <GripVertical size={16} />
                                    <span className="text-[10px] font-bold mt-1">{index + 1}</span>
                                </div>
                                <CardContent className="p-4 pl-12">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div className="md:col-span-3">
                                                    <label className="text-xs mb-1 block text-muted-foreground font-medium">Tên bài giảng</label>
                                                    <Input
                                                        value={mod.title}
                                                        onChange={(e) => handleUpdateModule(mod.id, 'title', e.target.value)}
                                                        className="h-9 font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs mb-1 block text-muted-foreground font-medium">Thời lượng (giây)</label>
                                                    <Input
                                                        type="number"
                                                        value={mod.duration}
                                                        onChange={(e) => handleUpdateModule(mod.id, 'duration', Number(e.target.value))}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs mb-1 block text-muted-foreground font-medium">Link Video (YouTube, MP4...)</label>
                                                <Input
                                                    value={mod.video_url}
                                                    onChange={(e) => handleUpdateModule(mod.id, 'video_url', e.target.value)}
                                                    placeholder="https://..."
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10 -mt-1 -mr-1 shrink-0"
                                            onClick={() => handleDeleteModule(mod.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={mod.description || ''}
                                        onChange={(e) => handleUpdateModule(mod.id, 'description', e.target.value)}
                                        placeholder="Mô tả cho bài giảng này..."
                                        rows={2}
                                        className="text-sm bg-muted/30"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-border flex justify-between items-center shadow-sm sticky bottom-4">
                    <p className="text-sm text-muted-foreground">Nhớ lưu lại cấu trúc bài giảng nhé!</p>
                    <Button onClick={handleSaveCourse} disabled={isSaving || modules.length === 0} size="lg" className="px-8 shadow-sm">
                        {isSaving ? 'Đang lưu...' : <><Save size={18} className="mr-2" /> Lưu nội dung</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
