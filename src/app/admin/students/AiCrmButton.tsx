'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Copy, Send, Loader2, CalendarPlus, Lightbulb } from 'lucide-react';

interface AiCrmButtonProps {
    studentName: string;
    studentEmail: string;
    courseName: string;
    daysEnrolled: number;
    completedModules: number;
    crmStatus: string;
}

interface AiEmailResult {
    subject: string;
    body: string;
    coaching_tip: string;
    suggested_schedule: string;
}

export function AiCrmButton({ studentName, studentEmail, courseName, daysEnrolled, completedModules, crmStatus }: AiCrmButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AiEmailResult | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateEmail = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await fetch('/api/ai/crm-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentName, studentEmail, courseName, daysEnrolled, completedModules, crmStatus }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed');
            }
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setError(e.message || 'Lỗi kết nối AI');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        if (!result) generateEmail();
    };

    const copyToClipboard = () => {
        if (!result) return;
        const text = `Subject: ${result.subject}\n\n${result.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendViaMailto = () => {
        if (!result) return;
        const body = result.body.replace(/\n/g, '%0D%0A');
        window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(result.subject)}&body=${body}`, '_blank');
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                onClick={handleOpen}
                title="✨ AI Tạo email cá nhân hóa"
            >
                <Sparkles size={13} />
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-violet-600" />
                                <div>
                                    <h3 className="font-semibold text-sm">AI CRM Assistant</h3>
                                    <p className="text-[11px] text-muted-foreground">{studentName} • {courseName}</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 size={28} className="animate-spin text-violet-500" />
                                    <p className="text-sm text-muted-foreground">Gemini AI đang viết email cá nhân hóa...</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm">
                                    <p className="text-red-700 dark:text-red-400 font-medium mb-1">Lỗi AI</p>
                                    <p className="text-red-600 dark:text-red-300 text-xs">{error}</p>
                                    <Button variant="outline" size="sm" className="mt-3" onClick={generateEmail}>
                                        Thử lại
                                    </Button>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-4">
                                    {/* Subject */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tiêu đề Email</label>
                                        <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium">
                                            {result.subject}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div>
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nội dung Email</label>
                                        <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                            {result.body}
                                        </div>
                                    </div>

                                    {/* Coaching Tip */}
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Lightbulb size={13} className="text-amber-600" />
                                            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Coaching Tip</span>
                                        </div>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">{result.coaching_tip}</p>
                                    </div>

                                    {/* Suggested Schedule */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CalendarPlus size={13} className="text-blue-600" />
                                            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Follow-up tiếp</span>
                                        </div>
                                        <p className="text-sm text-blue-800 dark:text-blue-300">{result.suggested_schedule}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {result && (
                            <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-slate-50 dark:bg-slate-800/50">
                                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
                                    <Copy size={13} className="mr-1.5" />
                                    {copied ? 'Đã copy!' : 'Copy'}
                                </Button>
                                <Button size="sm" onClick={sendViaMailto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Send size={13} className="mr-1.5" />
                                    Gửi Email
                                </Button>
                                <Button variant="ghost" size="sm" onClick={generateEmail} disabled={loading} className="shrink-0">
                                    <Sparkles size={13} className="mr-1" />
                                    Viết lại
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
