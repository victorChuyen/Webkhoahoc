'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Mail, Plus, Trash2, Save, Clock, GripVertical,
    ChevronDown, Sparkles, Eye, ToggleLeft, ToggleRight,
    ArrowLeft, Send
} from 'lucide-react';
import Link from 'next/link';

interface EmailSequence {
    id?: string;
    course_id: string;
    step_order: number;
    delay_days: number;
    subject: string;
    body_template: string;
    is_active: boolean;
    course?: { id: string; title: string };
}

interface Course {
    id: string;
    title: string;
}

const TEMPLATE_VARS = [
    { var: '{student_name}', desc: 'Tên học viên' },
    { var: '{course_name}', desc: 'Tên khóa học' },
    { var: '{progress}', desc: 'Tiến độ học tập' },
    { var: '{days_since_enrollment}', desc: 'Số ngày đã ghi danh' },
];

export default function EmailSequencesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [sequences, setSequences] = useState<EmailSequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewIdx, setPreviewIdx] = useState<number | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const supabase = createClient();

    // Load courses
    useEffect(() => {
        const loadCourses = async () => {
            const { data } = await supabase.from('courses').select('id, title').order('title');
            if (data) setCourses(data);
            setLoading(false);
        };
        loadCourses();
    }, []);

    // Load sequences when course changes
    const loadSequences = useCallback(async (courseId: string) => {
        if (!courseId) { setSequences([]); return; }
        const res = await fetch(`/api/email-sequences?course_id=${courseId}`);
        if (res.ok) {
            const data = await res.json();
            setSequences(data.sort((a: EmailSequence, b: EmailSequence) => a.step_order - b.step_order));
        }
    }, []);

    useEffect(() => {
        if (selectedCourse) loadSequences(selectedCourse);
    }, [selectedCourse, loadSequences]);

    // Add new step
    const addStep = () => {
        const maxOrder = sequences.length > 0 ? Math.max(...sequences.map(s => s.step_order)) : 0;
        const lastDelay = sequences.length > 0 ? sequences[sequences.length - 1].delay_days : 0;
        setSequences([...sequences, {
            course_id: selectedCourse,
            step_order: maxOrder + 1,
            delay_days: lastDelay + 5,
            subject: '',
            body_template: '',
            is_active: true,
        }]);
    };

    // Update a step
    const updateStep = (idx: number, field: string, value: any) => {
        const updated = [...sequences];
        (updated[idx] as any)[field] = value;
        setSequences(updated);
    };

    // Remove a step
    const removeStep = async (idx: number) => {
        const step = sequences[idx];
        if (step.id) {
            await fetch(`/api/email-sequences?id=${step.id}`, { method: 'DELETE' });
        }
        setSequences(sequences.filter((_, i) => i !== idx));
    };

    // Save all steps
    const saveAll = async () => {
        setSaving(true);
        try {
            for (const seq of sequences) {
                if (seq.id) {
                    await fetch('/api/email-sequences', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(seq),
                    });
                } else {
                    const res = await fetch('/api/email-sequences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(seq),
                    });
                    if (res.ok) {
                        const created = await res.json();
                        seq.id = created.id;
                    }
                }
            }
            await loadSequences(selectedCourse);
        } finally {
            setSaving(false);
        }
    };

    // AI generate email content
    const aiGenerate = async (idx: number) => {
        setAiLoading(true);
        try {
            const courseName = courses.find(c => c.id === selectedCourse)?.title || '';
            const step = sequences[idx];
            const res = await fetch('/api/ai/crm-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: '{student_name}',
                    studentEmail: 'student@example.com',
                    courseName,
                    daysEnrolled: step.delay_days,
                    completedModules: 0,
                    crmStatus: step.delay_days === 0 ? 'Mới' : step.delay_days >= 30 ? 'Nguy cơ bỏ cuộc' : 'Đang học',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                updateStep(idx, 'subject', data.subject);
                updateStep(idx, 'body_template', data.body);
            }
        } finally {
            setAiLoading(false);
        }
    };

    // Preview with sample data
    const previewBody = (template: string) => {
        return template
            .replace(/{student_name}/g, 'Nguyễn Văn An')
            .replace(/{course_name}/g, courses.find(c => c.id === selectedCourse)?.title || 'Khóa học')
            .replace(/{progress}/g, '3/10 bài hoàn thành')
            .replace(/{days_since_enrollment}/g, '7');
    };

    const getDelayLabel = (days: number) => {
        if (days === 0) return 'Gửi ngay khi đăng ký';
        if (days === 1) return 'Sau 1 ngày';
        return `Sau ${days} ngày`;
    };

    const getDelayColor = (days: number) => {
        if (days === 0) return 'bg-emerald-500 text-white';
        if (days <= 3) return 'bg-blue-500 text-white';
        if (days <= 7) return 'bg-amber-500 text-white';
        return 'bg-red-500 text-white';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin/students">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                            <Mail size={24} className="text-primary" />
                            Email Sequence Editor
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Tạo chuỗi email tự động chăm sóc học viên theo từng khóa học
                        </p>
                    </div>
                </div>

                {/* Course Selector */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="text-sm font-semibold whitespace-nowrap">Chọn khóa học:</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="flex-1 min-w-[250px] px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                            >
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={addStep} disabled={!selectedCourse}>
                                    <Plus size={14} className="mr-1" /> Thêm bước
                                </Button>
                                <Button size="sm" onClick={saveAll} disabled={!selectedCourse || saving}>
                                    <Save size={14} className="mr-1" /> {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Variables Reference */}
                <div className="flex items-center gap-2 flex-wrap mb-4 px-1">
                    <span className="text-xs text-muted-foreground font-semibold">Biến mẫu:</span>
                    {TEMPLATE_VARS.map(v => (
                        <code key={v.var} className="text-[11px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 cursor-pointer hover:bg-violet-200 transition-colors" title={v.desc}>
                            {v.var}
                        </code>
                    ))}
                </div>

                {/* Empty State */}
                {selectedCourse && sequences.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <Mail size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground mb-4">Chưa có chuỗi email nào cho khóa học này</p>
                            <Button onClick={addStep}>
                                <Plus size={14} className="mr-1" /> Tạo email đầu tiên
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!selectedCourse && (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <ChevronDown size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground">Chọn khóa học ở trên để bắt đầu thiết lập chuỗi email</p>
                        </CardContent>
                    </Card>
                )}

                {/* Sequence Steps */}
                <div className="space-y-4">
                    {sequences.map((step, idx) => (
                        <Card key={step.id || `new-${idx}`} className={`overflow-hidden transition-all ${!step.is_active ? 'opacity-50' : ''}`}>
                            {/* Step Header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <GripVertical size={14} className="text-muted-foreground" />
                                        <Badge className="font-mono text-[11px]">Step {idx + 1}</Badge>
                                    </div>
                                    <Badge className={`text-[11px] ${getDelayColor(step.delay_days)}`}>
                                        <Clock size={10} className="mr-1" />
                                        {getDelayLabel(step.delay_days)}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => updateStep(idx, 'is_active', !step.is_active)}
                                        title={step.is_active ? 'Tắt' : 'Bật'}
                                    >
                                        {step.is_active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-violet-600 hover:bg-violet-50"
                                        onClick={() => aiGenerate(idx)}
                                        disabled={aiLoading}
                                        title="✨ AI viết nội dung"
                                    >
                                        <Sparkles size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                        onClick={() => setPreviewIdx(previewIdx === idx ? null : idx)}
                                        title="Preview"
                                    >
                                        <Eye size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                                        onClick={() => removeStep(idx)}
                                        title="Xóa"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                                {/* Delay + Subject Row */}
                                <div className="grid grid-cols-[100px_1fr] gap-3">
                                    <div>
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Gửi sau</label>
                                        <div className="flex items-center gap-1 mt-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="365"
                                                value={step.delay_days}
                                                onChange={(e) => updateStep(idx, 'delay_days', parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1.5 rounded-md border border-border bg-background text-sm text-center focus:ring-2 focus:ring-primary/30"
                                            />
                                            <span className="text-xs text-muted-foreground">ngày</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tiêu đề email</label>
                                        <input
                                            type="text"
                                            value={step.subject}
                                            onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                                            placeholder="VD: Chào mừng bạn đến với {course_name}! 🎉"
                                            className="w-full mt-1 px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>

                                {/* Body Template */}
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nội dung email</label>
                                    <textarea
                                        value={step.body_template}
                                        onChange={(e) => updateStep(idx, 'body_template', e.target.value)}
                                        placeholder="Chào {student_name},&#10;&#10;Cảm ơn bạn đã đăng ký khóa &quot;{course_name}&quot;!&#10;..."
                                        rows={5}
                                        className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm leading-relaxed focus:ring-2 focus:ring-primary/30 resize-y"
                                    />
                                </div>

                                {/* Preview Panel */}
                                {previewIdx === idx && (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Eye size={13} className="text-blue-600" />
                                            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Preview (dữ liệu mẫu)</span>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-border">
                                            <p className="font-semibold text-sm mb-3 pb-2 border-b border-border">
                                                📧 {previewBody(step.subject || 'Chưa có tiêu đề')}
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                                {previewBody(step.body_template || 'Chưa có nội dung')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bottom Actions */}
                {sequences.length > 0 && (
                    <div className="flex items-center justify-between mt-6 gap-3">
                        <Button variant="outline" onClick={addStep}>
                            <Plus size={14} className="mr-1" /> Thêm bước tiếp theo
                        </Button>
                        <Button onClick={saveAll} disabled={saving} className="px-6">
                            <Save size={14} className="mr-1" /> {saving ? 'Đang lưu...' : 'Lưu toàn bộ chuỗi'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
