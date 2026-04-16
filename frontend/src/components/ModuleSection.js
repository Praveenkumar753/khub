import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiCheck, FiSquare, FiHelpCircle, FiFileText, FiBook, FiVideo, FiCode, FiList, FiType, FiPlay } from 'react-icons/fi';
import { quizService } from '../services/quizService';
import { taskService } from '../services/taskService';

const ModuleSection = ({
    module,
    courseId,
    selectedModule,
    selectedTopic,
    progress,
    onModuleSelect,
    onTopicSelect,
    onTopicComplete
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [userQuizAttempts, setUserQuizAttempts] = useState({});
    const [userTaskSubmissions, setUserTaskSubmissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedTaskForView, setSelectedTaskForView] = useState(null);
    const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState(null);

    const isSelected = selectedModule?._id === module._id;

    // Count completed topics in this module
    const completedInModule = module.mainTopics?.filter(
        t => progress?.completedTopics?.includes(t._id)
    ).length || 0;
    const totalInModule = module.mainTopics?.length || 0;

    useEffect(() => {
        if (isSelected && !isExpanded) {
            setIsExpanded(true);
            fetchModuleData();
        }
    }, [isSelected]);

    const fetchModuleData = async () => {
        setLoading(true);
        try {
            const quizResponse = await quizService.getModuleQuizzes(courseId, module._id);
            setQuizzes(quizResponse.quizzes || []);

            const quizAttemptsData = {};
            for (const quiz of quizResponse.quizzes || []) {
                try {
                    const attempts = await quizService.getQuizAttempts(quiz._id);
                    quizAttemptsData[quiz._id] = attempts.attempts || [];
                } catch (error) {
                    console.error(`Error fetching attempts for quiz ${quiz._id}:`, error);
                    quizAttemptsData[quiz._id] = [];
                }
            }
            setUserQuizAttempts(quizAttemptsData);

            const taskResponse = await taskService.getModuleTasks(courseId, module._id);
            setTasks(taskResponse.tasks || []);

            const taskSubmissionsData = {};
            for (const task of taskResponse.tasks || []) {
                try {
                    const submissions = await taskService.getUserTaskSubmissions(task._id);
                    taskSubmissionsData[task._id] = submissions.submissions || [];
                } catch (error) {
                    console.error(`Error fetching submissions for task ${task._id}:`, error);
                    taskSubmissionsData[task._id] = [];
                }
            }
            setUserTaskSubmissions(taskSubmissionsData);
        } catch (error) {
            console.error('Error fetching module data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleToggle = () => {
        if (!isExpanded) {
            onModuleSelect(module);
            if (module.mainTopics?.length > 0) {
                onTopicSelect(module, module.mainTopics[0]);
            }
            fetchModuleData();
        }
        setIsExpanded(!isExpanded);
    };

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'youtube': return <FiVideo className="w-3 h-3 text-red-500" />;
            case 'code': return <FiCode className="w-3 h-3 text-blue-500" />;
            case 'points': return <FiList className="w-3 h-3 text-green-500" />;
            case 'heading': return <FiType className="w-3 h-3 text-purple-500" />;
            case 'subheading': return <FiType className="w-3 h-3 text-indigo-500" />;
            default: return <FiFileText className="w-3 h-3 text-gray-400" />;
        }
    };

    const getBestQuizScore = (quizId) => {
        const attempts = userQuizAttempts[quizId] || [];
        if (attempts.length === 0) return null;
        return Math.max(...attempts.map(attempt => attempt.percentage || 0));
    };

    const getTaskStatus = (taskId) => {
        const submissions = userTaskSubmissions[taskId] || [];
        if (submissions.length === 0) return { status: 'not_submitted', score: null };
        const latestSubmission = submissions[0];
        return {
            status: latestSubmission.status,
            score: latestSubmission.grade?.score,
            maxScore: tasks.find(t => t._id === taskId)?.maxScore
        };
    };

    return (
        <div className="group">
            {/* Module Header */}
            <button
                onClick={handleModuleToggle}
                className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all duration-200 ${isSelected
                    ? 'bg-blue-50 border-l-3 border-l-blue-500'
                    : 'hover:bg-gray-50'
                    }`}
            >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'
                        }`} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                            <span className={`font-bold text-xs uppercase tracking-wider truncate border-b border-transparent ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                {module.name}
                            </span>
                        </div>
                        {/* Mini progress indicator */}
                        <div className="flex items-center mt-1 space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                                <div
                                    className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: totalInModule > 0 ? `${(completedInModule / totalInModule) * 100}%` : '0%' }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400">{completedInModule}/{totalInModule}</span>
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="bg-gray-50/50">
                    {loading ? (
                        <div className="px-4 py-3">
                            <div className="animate-pulse space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Topics */}
                            {module.mainTopics && module.mainTopics.length > 0 && (
                                <div className="py-1">
                                    {module.mainTopics.map((topic) => {
                                        const isTopicSelected = selectedTopic?._id === topic._id;
                                        const isCompleted = progress?.completedTopics?.includes(topic._id);
                                        const hasVideo = topic.contents?.some(c => c.type === 'youtube');

                                        return (
                                            <button
                                                key={topic._id}
                                                onClick={() => onTopicSelect(module, topic)}
                                                className={`w-full text-left pl-8 pr-3 py-1.5 flex items-center justify-between transition-all duration-150 ${isTopicSelected
                                                    ? 'bg-blue-100/80 text-blue-700'
                                                    : 'hover:bg-gray-100/80 text-gray-600'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                                    {/* Completion indicator */}
                                                    {isCompleted ? (
                                                        <FiCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    ) : hasVideo ? (
                                                        <FiPlay className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                                    )}
                                                    <span className={`text-xs truncate ${isCompleted ? 'text-gray-500' : ''}`}>
                                                        {topic.name}
                                                    </span>
                                                </div>

                                                {/* Content type indicators */}
                                                <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                                    {topic.contents?.slice(0, 2).map((content, idx) => (
                                                        <span key={idx} className="inline-flex">
                                                            {getContentTypeIcon(content.type)}
                                                        </span>
                                                    ))}
                                                    {topic.contents?.length > 2 && (
                                                        <span className="text-xs text-gray-400">+{topic.contents.length - 2}</span>
                                                    )}
                                                </div>

                                                {/* Mark complete button for non-video topics */}
                                                {!hasVideo && !isCompleted && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTopicComplete(topic._id);
                                                        }}
                                                        className="ml-1 p-0.5 hover:bg-blue-200 rounded flex-shrink-0"
                                                        title="Mark as complete"
                                                    >
                                                        <FiSquare className="w-3.5 h-3.5 text-gray-400" />
                                                    </button>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quizzes */}
                            {quizzes.length > 0 && (
                                <div className="px-4 py-2 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 pl-7">
                                        Quizzes
                                    </h4>
                                    <div className="space-y-1">
                                        {quizzes.map((quiz) => {
                                            const bestScore = getBestQuizScore(quiz._id);
                                            const attempts = userQuizAttempts[quiz._id] || [];

                                            return (
                                                <div
                                                    key={quiz._id}
                                                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                                                    className="pl-7 pr-2 py-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors flex items-center justify-between"
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0">
                                                        <FiHelpCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="text-sm text-gray-700 truncate">{quiz.title}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {quiz.questions?.length || 0} Qs • {quiz.totalPoints} pts
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-2 text-right">
                                                        {bestScore !== null ? (
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bestScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                                bestScore >= 60 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {bestScore.toFixed(0)}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Start</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tasks */}
                            {tasks.length > 0 && (
                                <div className="px-4 py-2 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 pl-7">
                                        Tasks
                                    </h4>
                                    <div className="space-y-1">
                                        {tasks.map((task) => {
                                            const taskStatus = getTaskStatus(task._id);
                                            const submissions = userTaskSubmissions[task._id] || [];

                                            return (
                                                <div
                                                    key={task._id}
                                                    className="pl-7 pr-2 py-2 rounded-lg text-sm"
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <FiFileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                                            <span className="text-gray-700 truncate">{task.title}</span>
                                                        </div>
                                                        <div className="flex-shrink-0 ml-2">
                                                            {taskStatus.status === 'graded' ? (
                                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                                    {taskStatus.score}/{taskStatus.maxScore}
                                                                </span>
                                                            ) : taskStatus.status === 'not_submitted' ? (
                                                                <span className="text-xs text-gray-400">Pending</span>
                                                            ) : (
                                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                                    Submitted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Task Action Buttons */}
                                                    <div className="flex space-x-2 pl-5">
                                                        <button
                                                            onClick={() => setSelectedTaskForView(task)}
                                                            className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedTaskForSubmit(task)}
                                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-xs hover:bg-emerald-100 transition-colors"
                                                        >
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Task View Modal */}
            {selectedTaskForView && (
                <TaskViewModal
                    task={selectedTaskForView}
                    onClose={() => setSelectedTaskForView(null)}
                />
            )}

            {/* Task Submit Modal */}
            {selectedTaskForSubmit && (
                <TaskSubmitModal
                    task={selectedTaskForSubmit}
                    onClose={() => setSelectedTaskForSubmit(null)}
                    onSubmissionSuccess={() => {
                        setSelectedTaskForSubmit(null);
                        fetchModuleData();
                    }}
                />
            )}
        </div>
    );
};

// Task View Modal Component
const TaskViewModal = ({ task, onClose }) => {
    const handleDownloadFile = async (filename) => {
        try {
            const response = await taskService.downloadTaskFile(task._id, filename);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{task.description}</p>
                        </div>

                        {task.instructions && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructions</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.instructions}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-6 text-sm">
                            <div>
                                <span className="text-gray-500">Max Score:</span>
                                <span className="ml-1 font-semibold text-gray-800">{task.maxScore}</span>
                            </div>
                            {task.dueDate && (
                                <div>
                                    <span className="text-gray-500">Due:</span>
                                    <span className="ml-1 font-semibold text-gray-800">
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {task.taskFiles && task.taskFiles.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents</h3>
                                <div className="space-y-2">
                                    {task.taskFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center min-w-0">
                                                <FiFileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 truncate">{file.originalName}</span>
                                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadFile(file.filename)}
                                                className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors flex-shrink-0"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Task Submit Modal Component
const TaskSubmitModal = ({ task, onClose, onSubmissionSuccess }) => {
    const [submissionData, setSubmissionData] = useState({
        links: [],
        notes: ''
    });
    const [newLink, setNewLink] = useState({
        title: '',
        url: '',
        type: 'other'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const linkTypes = [
        { value: 'github', label: 'GitHub Repository', icon: '🐙' },
        { value: 'drive', label: 'Google Drive', icon: '📁' },
        { value: 'dropbox', label: 'Dropbox', icon: '📦' },
        { value: 'onedrive', label: 'OneDrive', icon: '☁️' },
        { value: 'other', label: 'Other Link', icon: '🔗' }
    ];

    const addLink = () => {
        if (!newLink.title.trim() || !newLink.url.trim()) {
            setError('Please provide both title and URL for the link');
            return;
        }

        try {
            new URL(newLink.url);
        } catch (e) {
            setError('Please enter a valid URL');
            return;
        }

        setSubmissionData(prev => ({
            ...prev,
            links: [...prev.links, { ...newLink }]
        }));

        setNewLink({
            title: '',
            url: '',
            type: 'other'
        });
        setError('');
    };

    const removeLink = (index) => {
        setSubmissionData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (submissionData.links.length === 0) {
            setError('Please add at least one link to submit');
            return;
        }

        try {
            setLoading(true);

            const submissionPayload = {
                submissionLinks: submissionData.links,
                submissionText: submissionData.notes.trim()
            };

            await taskService.submitTask(task._id, submissionPayload);

            setSuccess('Task submitted successfully!');
            setTimeout(() => {
                onSubmissionSuccess();
            }, 1500);
        } catch (error) {
            console.error('Error submitting task:', error);
            setError('Failed to submit task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                        <h2 className="text-xl font-bold text-gray-900">Submit: {task.title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Solution Links *
                            </label>
                            <div className="space-y-2">
                                {submissionData.links.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="min-w-0">
                                            <span className="text-sm font-medium text-gray-700">{link.title}</span>
                                            <span className="text-sm text-gray-400 ml-2 truncate">{link.url}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLink(index)}
                                            className="text-red-500 hover:text-red-700 text-xs ml-2 flex-shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Link Title"
                                    value={newLink.title}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <input
                                    type="url"
                                    placeholder="Link URL"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <select
                                    value={newLink.type}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {linkTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="w-full p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Add Link
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={submissionData.notes}
                                onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                rows="3"
                                placeholder="Any additional notes about your submission..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || submissionData.links.length === 0}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center transition-colors text-sm font-medium"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Task'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModuleSection;