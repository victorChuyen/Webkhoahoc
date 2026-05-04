'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CourseModule } from '@/types';
import { Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import ReactPlayer to prevent SSR hydration errors
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface FocusPlayerProps {
    module: CourseModule;
    onProgress: (progress: { playedSeconds: number }) => void;
    onEnded: () => void;
    playerRef: React.MutableRefObject<any>;
}

export default function FocusPlayer({ module, onProgress, onEnded, playerRef }: FocusPlayerProps) {
    const [mounted, setMounted] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!mounted) return <div className="aspect-video bg-slate-900 animate-pulse rounded-lg"></div>;

    return (
        <div ref={containerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden group">
            <ReactPlayer
                // @ts-ignore - dynamic component ref typing issue
                ref={playerRef}
                url={module.video_url}
                width="100%"
                height="100%"
                playing={playing}
                controls={true}
                // @ts-ignore - react-player type mismatch with next/dynamic
                onProgress={onProgress}
                onEnded={onEnded}
                // @ts-ignore - react-player config typings are sometimes strict
                config={{
                    youtube: {
                        playerVars: { showinfo: 1, rel: 0 }
                    }
                } as any}
            />

            {/* Custom Overlay for Fullscreen Toggle if needed (Controls are true, so native fullscreen might exist, but custom is nice) */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-black/50 bg-black/30 backdrop-blur-sm"
                    onClick={toggleFullscreen}
                >
                    {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </Button>
            </div>
        </div>
    );
}
