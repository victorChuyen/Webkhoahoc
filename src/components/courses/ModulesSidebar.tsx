'use client';

import React from 'react';
import { CourseModule } from '@/types';
import { PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

// Fallback formatDuration if not present in lib/utils
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
};

interface ModulesSidebarProps {
    courseTitle: string;
    modules: CourseModule[];
    currentModuleId: string;
    completedModuleIds: string[];
    onSelectModule: (moduleId: string) => void;
}

export default function ModulesSidebar({ courseTitle, modules, currentModuleId, completedModuleIds, onSelectModule }: ModulesSidebarProps) {
    // Sort modules by order just in case
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-border w-full">
            <div className="p-4 border-b border-border bg-white dark:bg-slate-950 sticky top-0 z-10">
                <h2 className="font-bold text-lg leading-tight line-clamp-2">{courseTitle}</h2>
                <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between">
                    <span>Tiến độ học tập</span>
                    <span className="font-medium text-primary">
                        {completedModuleIds.length}/{modules.length}
                    </span>
                </div>
                {/* Simple Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${modules.length > 0 ? (completedModuleIds.length / modules.length) * 100 : 0}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-0">
                    {sortedModules.map((mod, index) => {
                        const isCurrent = mod.id === currentModuleId;
                        const isCompleted = completedModuleIds.includes(mod.id);

                        return (
                            <button
                                key={mod.id}
                                onClick={() => onSelectModule(mod.id)}
                                className={`w-full text-left p-4 border-b border-border/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 ${isCurrent ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {isCompleted ? (
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                    ) : isCurrent ? (
                                        <PlayCircle className="text-primary" size={20} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                            <span className="text-[10px] font-medium text-slate-500">{index + 1}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium leading-snug ${isCurrent ? 'text-foreground' : 'text-foreground/80'}`}>
                                        {index + 1}. {mod.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <PlayCircle size={12} /> {formatTime(mod.duration)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
