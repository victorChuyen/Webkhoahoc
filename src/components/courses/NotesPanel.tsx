'use client';

import React, { useState } from 'react';
import { Note } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Edit3, MessageSquarePlus } from 'lucide-react';
import { formatDuration } from '@/lib/utils'; // wait, does formatDuration exist?

// Fallback formatter if not in utils
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

interface NotesPanelProps {
    notes: Note[];
    currentTime: number;
    onAddNote: (content: string, timestamp: number) => Promise<void>;
    onDeleteNote: (noteId: string) => Promise<void>;
    onSeekTo: (seconds: number) => void;
}

export default function NotesPanel({ notes, currentTime, onAddNote, onDeleteNote, onSeekTo }: NotesPanelProps) {
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddNote(newNote, currentTime);
            setNewNote('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-border">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Edit3 size={18} /> Ghi chú bài học
                </h3>
                <p className="text-sm text-muted-foreground">Thêm ghi chú tại {formatTime(currentTime)}</p>
            </div>

            <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-800/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Nhập nội dung ghi chú..."
                        className="flex-1"
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting || !newNote.trim()} size="icon">
                        <MessageSquarePlus size={18} />
                    </Button>
                </form>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {notes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        Chưa có ghi chú nào cho bài học này.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.sort((a, b) => a.timestamp_sec - b.timestamp_sec).map(note => (
                            <div key={note.id} className="group relative p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <button
                                        onClick={() => onSeekTo(note.timestamp_sec)}
                                        className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
                                    >
                                        <Clock size={12} />
                                        {formatTime(note.timestamp_sec)}
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => onDeleteNote(note.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
