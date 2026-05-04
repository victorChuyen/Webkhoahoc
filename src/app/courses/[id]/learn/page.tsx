'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course, CourseModule, Enrollment, Note } from '@/types';
import FocusPlayer from '@/components/courses/FocusPlayer';
import ModulesSidebar from '@/components/courses/ModulesSidebar';
import NotesPanel from '@/components/courses/NotesPanel';
import QnAPanel from '@/components/courses/QnAPanel';
import { ChevronLeft, Menu, X, MessageSquare, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);

    const [currentModuleId, setCurrentModuleId] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'qna'>('notes');

    const playerRef = useRef<any>(null);

    useEffect(() => {
        fetchLessonData();
    }, [courseId]);

    const fetchLessonData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Check Enrollment
            const { data: enrollData } = await supabase
                .from('enrollments')
                .select('*')
                .eq('course_id', courseId)
                .eq('user_id', user.id)
                .single();

            if (!enrollData) {
                // Not enrolled, kick out
                toast({ title: "Truy cập bị từ chối", description: "Bạn cần mua khóa học để xem nội dung.", variant: "destructive" });
                router.push(`/courses/${courseId}`);
                return;
            }
            setEnrollment(enrollData);

            // 2. Fetch Course & Modules
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();
            if (courseData) {
                setCourse(courseData);
                // Assume modules are stored as JSONB array in courseData.modules 
                // Alternatively from course_modules table if it exists. Based on types.ts, it's inside Course.
                let mods: CourseModule[] = [];
                if (Array.isArray(courseData.modules)) {
                    mods = courseData.modules;
                }
                setModules(mods);

                // Determine current module to play
                let defaultModuleId = '';
                if (enrollData.progress && enrollData.progress.last_module) {
                    defaultModuleId = enrollData.progress.last_module as string;
                } else if (mods.length > 0) {
                    defaultModuleId = mods[0].id;
                }
                setCurrentModuleId(defaultModuleId);
            }

            // 3. Fetch Notes for this course
            const { data: notesData } = await supabase
                .from('notes')
                .select('*')
                .eq('course_id', courseId)
                .eq('user_id', user.id);
            if (notesData) {
                setNotes(notesData);
            }

        } catch (error) {
            console.error('Error fetching lesson dat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProgress = (state: { playedSeconds: number }) => {
        setCurrentTime(state.playedSeconds);
    };

    const handleVideoEnded = async () => {
        if (!currentModuleId || !enrollment) return;

        // Mark as completed in DB
        const newProgress = { ...enrollment.progress, [currentModuleId]: true };

        try {
            // Update enrollment progress
            await supabase.from('enrollments').update({
                progress: newProgress
            }).eq('id', enrollment.id);

            setEnrollment({ ...enrollment, progress: newProgress });

            // Call API for Gamification (+ EXP)
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, moduleId: currentModuleId })
            });

            toast({
                title: "Hoàn thành bài học! 🎉",
                description: "Bạn vừa nhận được +10 EXP.",
            });

        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectModule = async (moduleId: string) => {
        setCurrentModuleId(moduleId);
        // Save last_module to DB
        if (enrollment) {
            const newProgress = { ...enrollment.progress, last_module: moduleId };
            await supabase.from('enrollments').update({ progress: newProgress }).eq('id', enrollment.id);
            setEnrollment({ ...enrollment, progress: newProgress });
        }
    };

    const handleAddNote = async (content: string, timestamp: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('notes').insert([
            {
                user_id: user.id,
                course_id: courseId,
                module_id: currentModuleId,
                content,
                timestamp_sec: timestamp
            }
        ]).select().single();

        if (!error && data) {
            setNotes([...notes, data]);
            toast({ title: "Đã thêm ghi chú" });
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (!error) {
            setNotes(notes.filter(n => n.id !== noteId));
            toast({ title: "Đã xóa ghi chú", variant: "destructive" });
        }
    };

    const handleSeekTo = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds, 'seconds');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu học tập...</div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy khóa học</div>;

    const currentModule = modules.find(m => m.id === currentModuleId) || modules[0];
    const completedModuleIds = enrollment?.progress ? Object.keys(enrollment.progress).filter(k => k !== 'last_module' && enrollment.progress[k] === true) : [];
    const currentNotes = notes.filter(n => n.module_id === currentModuleId);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Header */}
            <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground transition-colors flex flex-row items-center gap-1 text-sm">
                        <ChevronLeft size={16} /> Quay lại
                    </Link>
                    <div className="h-4 w-px bg-border"></div>
                    <h1 className="font-semibold truncate max-w-[300px] md:max-w-[500px]">
                        {currentModule?.title || 'Đang tải...'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="md:hidden">
                        {showSidebar ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Modules Sidebar (Left) */}
                <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 absolute md:static inset-y-0 left-0 z-10 w-80 shrink-0 bg-background md:translate-x-0`}>
                    <ModulesSidebar
                        courseTitle={course.title}
                        modules={modules}
                        currentModuleId={currentModuleId}
                        completedModuleIds={completedModuleIds}
                        onSelectModule={handleSelectModule}
                    />
                </div>

                {/* Video & Notes (Right) */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
                    {/* Video Area */}
                    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950/50 p-2 md:p-6 overflow-y-auto w-full">
                        <div className="max-w-5xl mx-auto w-full">
                            {currentModule ? (
                                <FocusPlayer
                                    module={currentModule}
                                    onProgress={handleProgress}
                                    onEnded={handleVideoEnded}
                                    playerRef={playerRef}
                                />
                            ) : (
                                <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                    Không có bài giảng nào
                                </div>
                            )}

                            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
                                <h2 className="text-2xl font-bold mb-2">{currentModule?.title}</h2>
                                {currentModule?.description && (
                                    <p className="text-muted-foreground whitespace-pre-wrap">{currentModule.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel (Notes / QnA) */}
                    <div className="w-full lg:w-96 shrink-0 h-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-border bg-card overflow-hidden flex flex-col">
                        {/* Tabs Header */}
                        <div className="flex border-b border-border bg-muted/20">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <Edit3 size={16} /> Ghi chú
                            </button>
                            <button
                                onClick={() => setActiveTab('qna')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'qna' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <MessageSquare size={16} /> Hỏi đáp
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {activeTab === 'notes' ? (
                                <NotesPanel
                                    notes={currentNotes}
                                    currentTime={currentTime}
                                    onAddNote={handleAddNote}
                                    onDeleteNote={handleDeleteNote}
                                    onSeekTo={handleSeekTo}
                                />
                            ) : (
                                <QnAPanel
                                    courseId={courseId}
                                    moduleId={currentModuleId}
                                    currentUserId={enrollment?.user_id}
                                />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
