import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiSquare, FiArrowLeft, FiBookOpen, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModuleSection from '../components/ModuleSection';
import NotificationPanel from '../components/CourseNotifications';
import SimpleVideoPlayer from '../components/SimpleVideoPlayer';

const CourseContent = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const checkEnrollmentAndFetchCourse = useCallback(async () => {
        try {
            setLoading(true);
            const [courseRes, enrollmentsRes] = await Promise.all([
                courseService.getCourse(courseId),
                enrollmentService.getEnrolledCourses()
            ]);

            if (!courseRes.course) {
                navigate('/courses');
                return;
            }

            const courseEnrollment = enrollmentsRes.enrollments.find(
                e => e.course._id === courseId
            );

            if (!courseEnrollment) {
                navigate(`/courses/${courseId}`);
                return;
            }

            setCourse(courseRes.course);
            setProgress(courseEnrollment.progress);

            if (courseEnrollment.progress.currentModule) {
                const currentModule = courseRes.course.modules.find(
                    m => m._id === courseEnrollment.progress.currentModule
                );
                setSelectedModule(currentModule);

                if (currentModule && courseEnrollment.progress.currentTopic) {
                    const currentTopic = currentModule.mainTopics.find(
                        t => t._id === courseEnrollment.progress.currentTopic
                    );
                    setSelectedTopic(currentTopic);
                }
            }
        } catch (error) {
            console.error('Error fetching course content:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId, navigate]);

    useEffect(() => {
        checkEnrollmentAndFetchCourse();
    }, [checkEnrollmentAndFetchCourse]);

    const handleTopicComplete = useCallback(async (topicId) => {
        try {
            const response = await enrollmentService.markTopicComplete(courseId, topicId);
            setProgress(response.progress);
        } catch (error) {
            console.error('Error marking topic complete:', error);
        }
    }, [courseId]);

    const handleVideoComplete = useCallback(async (topicId) => {
        console.log('Video completed automatically for topic:', topicId);
        await handleTopicComplete(topicId);
    }, [handleTopicComplete]);

    const handleTopicSelect = useCallback(async (module, topic) => {
        try {
            setSelectedModule(module);
            setSelectedTopic(topic);
            await enrollmentService.updateProgress(courseId, {
                moduleId: module._id,
                topicId: topic._id
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }, [courseId]);

    const hasVideoContent = (topic) => {
        return topic.contents?.some(content => content.type === 'youtube');
    };

    const handleCopyCode = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Count total topics across all modules
    const getTotalTopics = () => {
        if (!course?.modules) return 0;
        return course.modules.reduce((total, m) => total + (m.mainTopics?.length || 0), 0);
    };

    const renderContent = (content, topicId, contentIndex) => {
        switch (content.type) {
            case 'youtube':
                return (
                    <div className="max-w-4xl">
                        <SimpleVideoPlayer
                            key={`${topicId}-${content.content}`}
                            videoUrl={content.content}
                            duration={content.duration}
                            topicId={topicId}
                            onVideoComplete={handleVideoComplete}
                            isCompleted={progress?.completedTopics.includes(topicId)}
                        />
                    </div>
                );
            case 'code':
                return (
                    <div className="relative group rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Code</span>
                            <button
                                onClick={() => handleCopyCode(content.content, contentIndex)}
                                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                            >
                                {copiedIndex === contentIndex ? (
                                    <><FiCheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                                ) : (
                                    <><FiCopy className="w-3.5 h-3.5" /><span>Copy</span></>
                                )}
                            </button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-5 overflow-x-auto font-mono text-sm leading-relaxed">
                            <code>{content.content}</code>
                        </pre>
                    </div>
                );
            case 'points':
                return (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-xl">
                        <ul className="space-y-2.5">
                            {content.content.split('\n').filter(p => p.trim()).map((point, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                    <span className="text-gray-700 leading-relaxed">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'heading':
                return (
                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3 mt-2">
                        {content.content}
                    </h2>
                );
            case 'subheading':
                return (
                    <h3 className="text-xl font-semibold text-gray-800 mt-1">
                        {content.content}
                    </h3>
                );
            case 'paragraph':
                return (
                    <div className="text-gray-700 leading-relaxed">
                        {content.content.split('\n').map((line, index) => (
                            <p key={index} className="mb-2 last:mb-0">{line}</p>
                        ))}
                    </div>
                );
            case 'syntax':
                return (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5">
                        <div className="flex items-start">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded mr-3 mt-0.5">Syntax</span>
                            <pre className="text-amber-900 font-mono text-sm flex-1 overflow-x-auto">{content.content}</pre>
                        </div>
                    </div>
                );
            case 'output':
                return (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <div className="flex items-start">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mr-3 mt-0.5">Output</span>
                            <pre className="text-emerald-900 font-mono text-sm flex-1 overflow-x-auto">{content.content}</pre>
                        </div>
                    </div>
                );
            default:
                return <p className="text-gray-700 leading-relaxed">{content.content}</p>;
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {/* Skeleton header */}
                        <div className="animate-pulse mb-8">
                            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-1/3 animate-pulse space-y-3">
                                <div className="h-12 bg-gray-200 rounded-xl"></div>
                                <div className="h-12 bg-gray-200 rounded-xl"></div>
                                <div className="h-12 bg-gray-200 rounded-xl"></div>
                            </div>
                            <div className="w-2/3 animate-pulse">
                                <div className="h-64 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!course) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">Course not found</h2>
                        <button onClick={() => navigate('/courses')} className="text-blue-600 hover:underline">
                            ← Back to courses
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const totalTopics = getTotalTopics();
    const completedCount = progress?.completedTopics?.length || 0;

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            <Navbar />

            {/* Main Dashboard Layout */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Top Actions Bar (Fixed) */}
                <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 z-10">
                        <button
                            onClick={() => navigate('/courses')}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-1.5" />
                            Back to Courses
                        </button>
                        <NotificationPanel
                            type="course"
                            courseId={courseId}
                            autoRefresh={true}
                            refreshInterval={120000}
                            showSettings={false}
                            showRefresh={true}
                        />
                </div>

                {/* Scrollable Split Panes */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Pane (Fixed Width, Independent Scroll) */}
                    <aside className="w-[350px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
                        <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="font-bold text-gray-900 text-sm truncate" title={course?.title}>
                                    {course?.title}
                                </h2>
                                <span className="text-xs font-bold text-blue-600 ml-2">
                                    {Math.round(progress?.completionPercentage || 0)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress?.completionPercentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                {course?.modules?.length || 0} modules • {totalTopics} topics
                            </p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                            <div className="space-y-1">
                                        {course?.modules?.map((module) => (
                                            <ModuleSection
                                                key={module._id}
                                                module={module}
                                                courseId={courseId}
                                                selectedModule={selectedModule}
                                                selectedTopic={selectedTopic}
                                                progress={progress}
                                                onModuleSelect={setSelectedModule}
                                                onTopicSelect={handleTopicSelect}
                                                onTopicComplete={handleTopicComplete}
                                            />
                                        ))}
                            </div>
                        </div>
                    </aside>

                    {/* Content Pane (Independent Scroll) */}
                    <main className="flex-1 overflow-y-auto bg-white">
                        <div className="max-w-5xl mx-auto p-8">
                            <div className="min-h-[60vh]">
                                {selectedTopic ? (
                                    <div className="p-6 lg:p-8">
                                        <div className="max-w-4xl mx-auto">
                                            {/* Breadcrumb */}
                                            {selectedModule && (
                                                <div className="flex items-center text-sm text-gray-400 mb-4">
                                                    <span>{selectedModule.name}</span>
                                                    <span className="mx-2">›</span>
                                                    <span className="text-gray-600">{selectedTopic.name}</span>
                                                </div>
                                            )}

                                            {/* Topic Header */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedTopic.name}</h1>
                                                    {selectedTopic.description && (
                                                        <p className="text-gray-500 leading-relaxed">{selectedTopic.description}</p>
                                                    )}
                                                </div>
                                                {/* Completion button for non-video topics */}
                                                {!hasVideoContent(selectedTopic) && (
                                                    <button
                                                        onClick={() => handleTopicComplete(selectedTopic._id)}
                                                        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${progress?.completedTopics.includes(selectedTopic._id)
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                                            }`}
                                                    >
                                                        {progress?.completedTopics.includes(selectedTopic._id) ? (
                                                            <><FiCheck className="w-4 h-4" /><span>Completed</span></>
                                                        ) : (
                                                            <><FiSquare className="w-4 h-4" /><span>Mark Complete</span></>
                                                        )}
                                                    </button>
                                                )}
                                                {/* Completion badge for video topics */}
                                                {hasVideoContent(selectedTopic) && progress?.completedTopics.includes(selectedTopic._id) && (
                                                    <div className="flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200">
                                                        <FiCheck className="w-4 h-4" />
                                                        <span>Completed</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Topic Content */}
                                            <div className="space-y-6">
                                                {selectedTopic.contents?.map((content, index) => (
                                                    <div key={index} className="content-item">
                                                        {renderContent(content, selectedTopic._id, index)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div className="flex flex-col items-center justify-center py-20 px-6">
                                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                                            <FiBookOpen className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                            Ready to learn?
                                        </h2>
                                        <p className="text-gray-400 text-center max-w-sm">
                                            Select a topic from the sidebar to begin. Your progress will be saved automatically.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CourseContent;