import React, { useRef, useEffect, useState } from 'react';
import { saveVideoProgress, loadVideoProgress, clearVideoProgress } from '../utils/videoProgress';

const SimpleVideoPlayer = ({
    videoUrl,
    duration, // Format: "3:45" or "12:30"
    topicId,
    onVideoComplete,
    isCompleted = false
}) => {
    const [timeSpent, setTimeSpent] = useState(() => isCompleted ? 0 : loadVideoProgress(topicId));
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef(null);
    const intervalRef = useRef(null);
    const [requiredTime, setRequiredTime] = useState(0);
    const completedRef = useRef(false);
    const timeSpentRef = useRef(timeSpent);
    const lastSavedTimeRef = useRef(timeSpent);

    // Keep the ref strictly in sync with state for unmount saves
    useEffect(() => {
        timeSpentRef.current = timeSpent;
    }, [timeSpent]);

    // Save final progress strictly on unmount
    useEffect(() => {
        return () => {
            if (!completedRef.current && timeSpentRef.current > 0) {
                saveVideoProgress(topicId, timeSpentRef.current);
                console.log(`💾 Saved video progress on exit: ${timeSpentRef.current}s for topic ${topicId}`);
            }
        };
    }, [topicId]);

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const videoId = getVideoId(videoUrl);

    // Parse duration string to seconds
    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;

        const parts = durationStr.split(':');
        if (parts.length === 2) {
            // MM:SS format
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            return minutes * 60 + seconds;
        } else if (parts.length === 3) {
            // HH:MM:SS format
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            return hours * 3600 + minutes * 60 + seconds;
        }
        return 0;
    };

    // Calculate required time (70% of duration)
    useEffect(() => {
        const totalSeconds = parseDuration(duration);
        const required = Math.floor(totalSeconds * 0.7);
        setRequiredTime(required);
        console.log(`📹 Video duration: ${duration} (${totalSeconds}s). Required time: ${required}s (70%)`);
    }, [duration]);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Track page time
    useEffect(() => {
        if (isCompleted || requiredTime === 0 || completedRef.current) return;

        startTimeRef.current = Date.now();

        const trackingInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            startTimeRef.current = now;

            setTimeSpent(prev => {
                const newTime = prev + elapsed;
                const progressPercent = Math.min(Math.floor((newTime / requiredTime) * 100), 100);
                setProgress(progressPercent);

                // Save to local storage every ~60 seconds if not completed.
                // We check if (newTime - lastSaved) >= 60 because browsers heavily throttle 
                // setInterval in background tabs, meaning newTime can jump by 10s or 60s at a time
                // and completely miss a strict `newTime % 60 === 0` check.
                if (!isCompleted && !completedRef.current && (newTime - lastSavedTimeRef.current >= 60)) {
                    saveVideoProgress(topicId, newTime);
                    lastSavedTimeRef.current = newTime;
                    console.log(`💾 Saved video progress: ${newTime}s for topic ${topicId}`);
                }

                // Auto-complete when 70% time is reached
                if (newTime >= requiredTime && !completedRef.current && !isCompleted) {
                    completedRef.current = true;
                    clearVideoProgress(topicId);
                    console.log(`🎉 Topic auto-completed! Time spent: ${newTime}s / ${requiredTime}s required`);
                    onVideoComplete(topicId);
                }

                return newTime;
            });
        }, 1000);

        intervalRef.current = trackingInterval;

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isCompleted, requiredTime, topicId, onVideoComplete]);

    // Reset completed ref when topic changes
    useEffect(() => {
        completedRef.current = isCompleted;
        if (isCompleted) {
            clearVideoProgress(topicId);
        }
    }, [isCompleted, topicId]);

    if (!videoId) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Invalid YouTube URL</p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?` +
        new URLSearchParams({
            rel: '0',
            modestbranding: '1',
            controls: '1',
            enablejsapi: '1',
            origin: window.location.origin
        }).toString();

    return (
        <div className="space-y-4">
            {/* Video Player */}
            <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>

            {/* Progress indicator */}
            {isCompleted ? (
                <div className="bg-green-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-700">
                            Topic Progress
                        </span>
                        <span className="text-sm font-medium text-green-600">
                            Completed ✅
                        </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                        Topic completed!
                    </p>
                </div>
            ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Topic Progress
                        </span>
                        <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-blue-600'
                            }`}>
                            {progress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${progress >= 100 ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>

                    <div className="mt-3">
                        {progress >= 100 ? (
                            <p className="text-sm text-green-600">
                                🎉 Great! You've spent enough time on this topic.
                            </p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-sm text-blue-600">
                                    ⏱️ Stay on this page for 70% of the video duration to complete this topic.
                                </p>
                                {requiredTime > 0 ? (
                                    <p className="text-xs text-gray-500">
                                        Time spent: {formatTime(timeSpent)} / {formatTime(requiredTime)} required
                                        {` • ${formatTime(Math.max(0, requiredTime - timeSpent))} remaining`}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        ⏳ Loading duration...
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    💡 Video duration: {duration}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleVideoPlayer;
