'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDuration } from '@/lib/utils';
import type { Course, CourseModule } from '@/types';
import { CheckCircle2, PlayCircle, ChevronLeft, ChevronRight, Menu, X, Maximize, Minimize, MessageSquarePlus, Clock, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
const Player = ReactPlayer as any;

type Note = {
    id: string;
    module_id: string;
    timestamp_sec: number;
    content: string;
    created_at: string;
};

export default function CourseLearnPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const [course, setCourse] = useState<Course | null>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notesOpen, setNotesOpen] = useState(false);
    const [focusMode, setFocusMode] = useState(false);

    // Notes state
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef<any>(null);

    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const [courseRes, enrollRes] = await Promise.all([
                supabase.from('courses').select('*').eq('id', courseId).single(),
                supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', courseId).single(),
            ]);

            if (courseRes.data) {
                setCourse(courseRes.data as Course);
                const modules = courseRes.data.modules as CourseModule[];
                if (modules?.length > 0) setActiveModule(modules[0]);
            }
            if (enrollRes.data) setEnrollment(enrollRes.data);

            // Record streak
            await supabase.rpc('update_streak', { user_id_param: user.id });
        };
        load();
    }, [courseId, router, supabase]);

    const loadNotes = useCallback(async (moduleId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('module_id', moduleId)
            .order('timestamp_sec', { ascending: true });
        if (data) setNotes(data);
    }, [courseId, supabase]);

    useEffect(() => {
        if (activeModule) {
            loadNotes(activeModule.id);
        }
    }, [activeModule, loadNotes]);

    const handleAddNote = async () => {
        if (!newNote.trim() || !activeModule) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Pause player while adding
        const timestamp = Math.floor(currentTime);

        const { data, error } = await supabase.from('notes').insert({
            user_id: user.id,
            course_id: courseId,
            module_id: activeModule.id,
            timestamp_sec: timestamp,
            content: newNote.trim()
        }).select().single();

        if (data && !error) {
            setNotes([...notes, data].sort((a, b) => a.timestamp_sec - b.timestamp_sec));
            setNewNote('');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        await supabase.from('notes').delete().eq('id', noteId);
        setNotes(notes.filter(n => n.id !== noteId));
    };

    const seekTo = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds, 'seconds');
        }
    };

    const markComplete = async (moduleId: string) => {
        if (!enrollment || !course) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newProgress = { ...(enrollment.progress || {}), [moduleId]: true };
        const totalModules = course.modules.length;
        const completedModules = Object.values(newProgress).filter(Boolean).length;
        const completionPct = Math.round((completedModules / totalModules) * 100);

        await supabase.from('enrollments').update({
            progress: newProgress,
            completion_percentage: completionPct,
            completed_at: completionPct === 100 ? new Date().toISOString() : null,
        }).eq('user_id', user.id).eq('course_id', courseId);

        setEnrollment({ ...enrollment, progress: newProgress, completion_percentage: completionPct });

        // Add EXP for completion (e.g., 50 EXP per module)
        await supabase.rpc('add_exp', { user_id_param: user.id, amount: 50 });
    };

    const toggleFocusMode = () => {
        setFocusMode(!focusMode);
        if (!focusMode) {
            setSidebarOpen(false);
            setNotesOpen(false);
        } else {
            setSidebarOpen(true);
        }
    };

    const formatTimestamp = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!course) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const modules = course.modules || [];
    const currentIdx = modules.findIndex(m => m.id === activeModule?.id);
    const progress = enrollment?.progress || {};

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Left Sidebar (Lessons) */}
            <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden transition-all duration-300 border-r border-border bg-muted/10 flex-shrink-0 z-10`}>
                <div className="w-80 h-full overflow-y-auto flex flex-col">
                    <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
                        <h2 className="font-semibold text-sm line-clamp-2">{course.title}</h2>
                        <div className="progress-bar mt-3">
                            <div className="progress-bar-fill" style={{ width: `${enrollment?.completion_percentage || 0}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{enrollment?.completion_percentage || 0}% hoàn thành</p>
                    </div>
                    <div className="p-3 flex-1">
                        {modules.map((module, idx) => {
                            const isDone = progress[module.id];
                            const isActive = activeModule?.id === module.id;
                            return (
                                <button
                                    key={module.id}
                                    onClick={() => setActiveModule(module)}
                                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl mb-2 transition-all duration-200 ${isActive ? 'bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20' : 'hover:bg-muted border border-transparent'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isDone ? 'border-emerald-500 bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' :
                                        isActive ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30 text-muted-foreground'
                                        }`}>
                                        {isDone ? '✓' : idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-primary' : 'text-foreground'}`}>{module.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PlayCircle size={12} className="text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">{formatDuration(module.duration || 0)}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Main content (Player) */}
            <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${focusMode ? 'bg-black' : 'bg-background'}`}>
                {/* Top bar */}
                {!focusMode && (
                    <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                            <span className="text-sm font-semibold truncate">
                                Bài {currentIdx + 1}: {activeModule?.title || 'Chọn bài học'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setNotesOpen(!notesOpen)} className={notesOpen ? 'bg-primary/10 text-primary' : ''}>
                                <MessageSquarePlus size={16} className="mr-2" /> Ghi chú
                            </Button>
                            <Button variant="ghost" size="sm" onClick={toggleFocusMode} title="Học đắm chìm">
                                <Maximize size={16} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Video Area */}
                <div className={`flex-1 overflow-y-auto ${focusMode ? 'flex flex-col' : ''}`}>
                    <div className={`w-full bg-black relative ${focusMode ? 'flex-1 flex flex-col justify-center' : 'aspect-video max-h-[70vh]'}`}>
                        {focusMode && (
                            <button onClick={toggleFocusMode} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur transition-colors">
                                <Minimize size={20} />
                            </button>
                        )}
                        {activeModule?.video_url ? (
                            <Player
                                ref={playerRef}
                                url={activeModule.video_url}
                                width="100%"
                                height="100%"
                                controls
                                onProgress={(p: any) => setCurrentTime(p.playedSeconds)}
                                playing={focusMode}
                                config={{
                                    youtube: { playerVars: { showinfo: 1, modestbranding: 1 } } as any
                                }}
                                style={{ position: focusMode ? 'relative' : 'absolute', top: 0, left: 0 }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center absolute inset-0">
                                <PlayCircle size={64} className="text-white/30" />
                            </div>
                        )}
                    </div>

                    {/* Content below video */}
                    {!focusMode && (
                        <div className="max-w-5xl mx-auto w-full p-6 lg:p-8">
                            <div className="flex items-start justify-between gap-6 flex-wrap">
                                <div className="flex-1 min-w-[300px]">
                                    <h1 className="text-2xl font-display font-bold text-foreground mb-2">{activeModule?.title}</h1>
                                    <p className="text-muted-foreground">{activeModule?.description || 'Chưa có mô tả cho bài học này.'}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    {activeModule && !progress[activeModule.id] ? (
                                        <Button variant="gradient" size="lg" className="shadow-lg shadow-primary/20" onClick={() => markComplete(activeModule.id)}>
                                            <CheckCircle2 size={18} className="mr-2" /> Hoàn thành (+50 EXP)
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 font-semibold border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 size={18} /> Đã hoàn thành
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="my-8 border-border" />

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    disabled={currentIdx <= 0}
                                    onClick={() => setActiveModule(modules[currentIdx - 1])}
                                    className="w-[140px]"
                                >
                                    <ChevronLeft size={18} className="mr-2" /> Bài trước
                                </Button>
                                <Button
                                    variant="default"
                                    size="lg"
                                    disabled={currentIdx >= modules.length - 1}
                                    onClick={() => setActiveModule(modules[currentIdx + 1])}
                                    className="w-[140px]"
                                >
                                    Bài tiếp <ChevronRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar (Notes) */}
            <aside className={`${notesOpen && !focusMode ? 'w-80 border-l' : 'w-0 border-transparent'} transition-all duration-300 overflow-hidden bg-background flex-shrink-0 z-10 border-border`}>
                <div className="w-80 h-full flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquarePlus size={18} className="text-primary" /> Ghi chú của tôi
                        </h3>
                        <button onClick={() => setNotesOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                        {notes.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                <Clock size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Chưa có ghi chú nào.<br />Thêm ghi chú tại thời điểm hiện tại của video.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} className="bg-background border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col gap-2 relative">
                                        <button
                                            onClick={() => seekTo(note.timestamp_sec)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 w-fit px-2 py-1 rounded-md transition-colors"
                                        >
                                            <PlayCircle size={12} /> {formatTimestamp(note.timestamp_sec)}
                                        </button>
                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>

                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="absolute top-0 right-0 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Note Form */}
                    <div className="p-4 border-t border-border bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                Thêm tại: {formatTimestamp(currentTime)}
                            </span>
                        </div>
                        <Textarea
                            value={newNote}
                            onChange={(e: any) => setNewNote(e.target.value)}
                            placeholder="Nhập nội dung ghi chú..."
                            className="text-sm mb-3 min-h-[80px] resize-none"
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                            }}
                        />
                        <Button className="w-full" onClick={handleAddNote} disabled={!newNote.trim()}>
                            Lưu ghi chú
                        </Button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
