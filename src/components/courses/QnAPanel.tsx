'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { QnAComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Send, Reply, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QnAPanelProps {
    courseId: string;
    moduleId: string;
    currentUserId?: string;
}

export default function QnAPanel({ courseId, moduleId, currentUserId }: QnAPanelProps) {
    const supabase = createClient();
    const [comments, setComments] = useState<QnAComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reply state: id of the parent comment we are replying to
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        // We fetch all comments for this module and course
        // Also joining the user data to get avatar and name
        const { data, error } = await supabase
            .from('qna_comments')
            .select(`
                *,
                user:users!user_id(id, full_name, avatar_url)
            `)
            .eq('course_id', courseId)
            .eq('module_id', moduleId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching QnA:', error);
        } else if (data) {
            // Organize into tree (parent -> children)
            const commentMap = new Map<string, QnAComment>();
            const roots: QnAComment[] = [];

            // First pass: put all in a map and ensure replies array exists
            data.forEach((c: any) => {
                c.replies = [];
                // if user info is nested due to foreign key alias, handle it safely
                if (Array.isArray(c.user)) c.user = c.user[0];
                commentMap.set(c.id, c);
            });

            // Second pass: attach children to parents
            data.forEach((c: any) => {
                if (c.parent_id) {
                    const parent = commentMap.get(c.parent_id);
                    if (parent) {
                        parent.replies!.push(c);
                    } else {
                        roots.push(c); // fallback if parent missing
                    }
                } else {
                    roots.push(c);
                }
            });

            // Roots are the top-level comments
            setComments(roots);
        }
        setIsLoading(false);
    }, [courseId, moduleId, supabase]);

    useEffect(() => {
        if (moduleId) {
            fetchComments();
        }
    }, [moduleId, fetchComments]);

    const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();

        const content = parentId ? replyContent : newComment;
        if (!content.trim() || !currentUserId) return;

        setIsSubmitting(true);
        const { data, error } = await supabase
            .from('qna_comments')
            .insert({
                user_id: currentUserId,
                course_id: courseId,
                module_id: moduleId,
                content: content.trim(),
                parent_id: parentId
            })
            .select(`
                *,
                user:users!user_id(id, full_name, avatar_url)
            `)
            .single();

        if (error) {
            toast({ title: 'Lỗi gửi bình luận', description: error.message, variant: 'destructive' });
        } else if (data) {
            // Fix nested user array if any
            if (Array.isArray(data.user)) data.user = data.user[0];
            data.replies = [];

            if (parentId) {
                // Find parent and push reply locally to avoid full refetch
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...(c.replies || []), data] };
                    }
                    return c;
                }));
                setReplyingTo(null);
                setReplyContent('');
            } else {
                setComments(prev => [...prev, data]);
                setNewComment('');
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (commentId: string, parentId: string | null = null) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        const { error } = await supabase.from('qna_comments').delete().eq('id', commentId);
        if (!error) {
            if (parentId) {
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: c.replies?.filter(r => r.id !== commentId) };
                    }
                    return c;
                }));
            } else {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
            toast({ title: 'Đã xóa bình luận' });
        }
    };

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const renderComment = (comment: QnAComment, isReply = false) => {
        const isOwner = currentUserId === comment.user_id;

        return (
            <div key={comment.id} className={`flex gap-3 w-full ${isReply ? 'mt-3 pl-8 border-l-2 border-border/50' : 'mt-5'}`}>
                {/* Avatar Fallback */}
                <div className={`shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden relative ${isReply ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"}`}>
                    {comment.user?.avatar_url ? (
                        <Image 
                            src={comment.user.avatar_url} 
                            alt="avatar" 
                            fill
                            className="object-cover" 
                        />
                    ) : (
                        comment.user?.full_name?.charAt(0) || 'U'
                    )}
                </div>

                <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate max-w-[120px]">
                                {comment.user?.full_name || 'Người dùng'}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatTime(comment.created_at)}</span>
                        </div>
                        {isOwner && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => handleDelete(comment.id, comment.parent_id)}
                            >
                                <Trash2 size={12} />
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>

                    {!isReply && (
                        <div className="flex items-center gap-4 mt-1">
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                            >
                                <Reply size={12} /> {replyingTo === comment.id ? 'Hủy' : 'Trả lời'}
                            </button>
                        </div>
                    )}

                    {/* Reply Input Box */}
                    {replyingTo === comment.id && !isReply && (
                        <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-2 flex gap-2 w-full animate-in fade-in slide-in-from-top-1">
                            <Input
                                autoFocus
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Viết câu trả lời..."
                                className="h-8 text-sm"
                                disabled={isSubmitting}
                            />
                            <Button type="submit" size="sm" className="h-8 px-3" disabled={isSubmitting || !replyContent.trim()}>
                                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            </Button>
                        </form>
                    )}

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {comment.replies.map(reply => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-border relative">
            <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <form onSubmit={(e) => handleSubmit(e, null)} className="flex flex-col gap-2 relative">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Bạn có câu hỏi gì về bài học này?"
                        className="resize-none min-h-[80px] text-sm pr-12 pb-8"
                        disabled={isSubmitting || !currentUserId}
                    />
                    <div className="absolute right-2 bottom-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim() || !currentUserId}
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full"
                        >
                            <Send size={12} className={isSubmitting ? "animate-pulse" : ""} />
                        </Button>
                    </div>
                </form>
                {!currentUserId && <p className="text-xs text-destructive mt-2">Vui lòng tải lại trang để đăng nhập.</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="animate-spin text-muted-foreground opacity-50" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
                        <MessageCircle size={32} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium">Chưa có câu hỏi nào</p>
                        <p className="text-xs mt-1">Hãy là người đầu tiên đặt câu hỏi cho bài học này!</p>
                    </div>
                ) : (
                    <div className="pb-8">
                        {comments.map(c => renderComment(c, false))}
                    </div>
                )}
            </div>
        </div>
    );
}
