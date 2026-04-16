import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiUsers, FiAward, FiClipboard,
    FiCheckCircle, FiClock, FiAlertCircle, FiUser,
    FiLink, FiStar, FiBarChart2
} from 'react-icons/fi';
import { courseService } from '../../services/courseService';
import { quizService } from '../../services/quizService';
import { taskService } from '../../services/taskService';
import { enrollmentService } from '../../services/enrollmentService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const CourseReports = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('participants');
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [quizMarks, setQuizMarks] = useState([]);
    const [taskSubmissions, setTaskSubmissions] = useState([]);
    const [moduleQuizzes, setModuleQuizzes] = useState({});
    const [gradingState, setGradingState] = useState({});

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    useEffect(() => {
        if (!course) return;
        if (activeTab === 'participants') fetchParticipants();
        if (activeTab === 'quiz') fetchQuizMarks();
        if (activeTab === 'tasks') fetchTaskSubmissions();
    }, [activeTab, course]);

    const fetchCourseData = async () => {
        try {
            const response = await courseService.getCourse(courseId);
            setCourse(response.course);
            if (response.course.modules) {
                const quizzesData = {};
                for (const module of response.course.modules) {
                    try {
                        const qr = await quizService.getModuleQuizzes(courseId, module._id);
                        quizzesData[module._id] = qr.quizzes || [];
                    } catch { quizzesData[module._id] = []; }
                }
                setModuleQuizzes(quizzesData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            fetchParticipants();
        }
    };

    const fetchParticipants = async () => {
        setLoadingData(true);
        try {
            const res = await enrollmentService.getCourseEnrollments(courseId);
            setParticipants(res.enrollments || []);
        } catch { setParticipants([]); }
        finally { setLoadingData(false); }
    };

    const fetchQuizMarks = async () => {
        setLoadingData(true);
        try {
            const allQuizzes = Object.values(moduleQuizzes).flat();
            const data = [];
            for (const quiz of allQuizzes) {
                try {
                    const res = await quizService.getAllQuizAttempts(quiz._id);
                    data.push({ quiz, attempts: res.attempts || [] });
                } catch {}
            }
            setQuizMarks(data);
        } catch { setQuizMarks([]); }
        finally { setLoadingData(false); }
    };

    const fetchTaskSubmissions = async () => {
        setLoadingData(true);
        try {
            const allTasks = [];
            for (const module of (course?.modules || [])) {
                try {
                    const res = await taskService.getModuleTasks(courseId, module._id);
                    allTasks.push(...(res.tasks || []));
                } catch {}
            }
            const data = [];
            for (const task of allTasks) {
                try {
                    const res = await taskService.getTaskSubmissions(task._id);
                    data.push({ task, submissions: res.submissions || [] });
                } catch {}
            }
            setTaskSubmissions(data);
        } catch { setTaskSubmissions([]); }
        finally { setLoadingData(false); }
    };

    const handleGradeSubmission = async (taskId, submissionId) => {
        const key = `${taskId}_${submissionId}`;
        const { score, feedback } = gradingState[key] || {};
        if (!score) return;
        try {
            await taskService.gradeSubmission(taskId, submissionId, score, feedback || '');
            fetchTaskSubmissions();
            setGradingState(prev => { const s = { ...prev }; delete s[key]; return s; });
        } catch (err) { console.error(err); }
    };

    const tabs = [
        { id: 'participants', label: 'Participants', icon: FiUsers, color: 'blue' },
        { id: 'quiz', label: 'Quiz Marks', icon: FiAward, color: 'purple' },
        { id: 'tasks', label: 'Task Submissions', icon: FiClipboard, color: 'orange' },
    ];

    const colorMap = {
        blue: { active: 'bg-blue-600 text-white shadow-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
        purple: { active: 'bg-purple-600 text-white shadow-purple-200', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-700' },
        orange: { active: 'bg-orange-500 text-white shadow-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 pt-10 pb-6">
                <div className="container mx-auto">
                    <button
                        onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
                        className="flex items-center text-slate-500 hover:text-blue-600 font-semibold mb-4 transition-colors text-sm"
                    >
                        <FiArrowLeft className="mr-2" /> Back to Modules
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                                Course <span className="text-blue-600">Reports</span>
                            </h1>
                            <p className="text-slate-500 font-medium">{course?.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center">
                                <p className="text-2xl font-black text-slate-900">{participants.length}</p>
                                <p className="text-xs text-slate-500 font-semibold">Students</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center">
                                <p className="text-2xl font-black text-slate-900">{Object.values(moduleQuizzes).flat().length}</p>
                                <p className="text-xs text-slate-500 font-semibold">Quizzes</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const colors = colorMap[tab.color];
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg ${isActive ? colors.active : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-none'}`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : colors.icon}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-6 py-10">
                {loadingData ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Participants Tab */}
                        {activeTab === 'participants' && (
                            <div>
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <FiUsers className="text-blue-600" /> Enrolled Students ({participants.length})
                                </h2>
                                {participants.length === 0 ? (
                                    <EmptyState icon={FiUsers} message="No students enrolled yet." />
                                ) : (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">#</th>
                                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</th>
                                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Last Accessed</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {participants.map((enrollment, idx) => {
                                                    const progress = typeof enrollment.progress === 'number' ? Math.round(enrollment.progress) : 0;
                                                    return (
                                                        <tr key={enrollment._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4 text-sm text-slate-400 font-mono">{idx + 1}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm">
                                                                        {(enrollment.user?.fullName || enrollment.user?.username || 'U')[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 text-sm">{enrollment.user?.fullName || enrollment.user?.username || 'Unknown'}</p>
                                                                        <p className="text-xs text-slate-400">{enrollment.user?.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 w-28">
                                                                        <div
                                                                            className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700">{progress}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {progress === 100 ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                                                        <FiCheckCircle className="w-3 h-3" /> Completed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                                        <FiClock className="w-3 h-3" /> In Progress
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                                {enrollment.lastAccessedAt 
                                                                    ? new Date(enrollment.lastAccessedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : enrollment._id 
                                                                        ? new Date(parseInt(enrollment._id.substring(0,8), 16) * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                        : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quiz Marks Tab */}
                        {activeTab === 'quiz' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <FiAward className="text-purple-600" /> Quiz Marks
                                </h2>
                                {quizMarks.length === 0 ? (
                                    <EmptyState icon={FiAward} message="No quizzes found for this course." />
                                ) : quizMarks.map(({ quiz, attempts }) => (
                                    <div key={quiz._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="px-6 py-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg">{quiz.title}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{quiz.questions?.length || 0} questions · {quiz.totalPoints} total points</p>
                                            </div>
                                            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {attempts.length === 0 ? (
                                            <div className="px-6 py-8 text-center text-slate-400 text-sm">No attempts yet.</div>
                                        ) : (
                                            <table className="w-full">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Percentage</th>
                                                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {attempts.map(attempt => {
                                                        const pct = quiz.totalPoints > 0 ? Math.round((attempt.score / quiz.totalPoints) * 100) : 0;
                                                        return (
                                                            <tr key={attempt._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">
                                                                            {(attempt.user?.fullName || attempt.user?.username || 'U')[0].toUpperCase()}
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-800">
                                                                            {attempt.user?.fullName || attempt.user?.username || 'Unknown'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="font-black text-slate-900">{attempt.score}</span>
                                                                    <span className="text-slate-400 text-sm"> / {quiz.totalPoints}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                                                            <div className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                                                        </div>
                                                                        <span className={`text-xs font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-slate-400">{new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Task Submissions Tab */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <FiClipboard className="text-orange-500" /> Task Submissions
                                </h2>
                                {taskSubmissions.length === 0 ? (
                                    <EmptyState icon={FiClipboard} message="No tasks found for this course." />
                                ) : taskSubmissions.map(({ task, submissions }) => (
                                    <div key={task._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="px-6 py-5 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg">{task.title}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">Max Score: {task.maxScore || 100} pts</p>
                                            </div>
                                            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                                {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {submissions.length === 0 ? (
                                            <div className="px-6 py-8 text-center text-slate-400 text-sm">No submissions yet.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {submissions.map(submission => {
                                                    const key = `${task._id}_${submission._id}`;
                                                    const isGraded = submission.score !== undefined && submission.score !== null;
                                                    return (
                                                        <div key={submission._id} className="px-6 py-5">
                                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm shrink-0">
                                                                        {(submission.user?.fullName || submission.user?.username || 'U')[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 text-sm">
                                                                            {submission.user?.fullName || submission.user?.username || 'Unknown'}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400">{new Date(submission.submittedAt || submission.createdAt).toLocaleString()}</p>
                                                                        {submission.submissionLinks?.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                                {submission.submissionLinks.map((link, li) => (
                                                                                    <a key={li} href={link} target="_blank" rel="noopener noreferrer"
                                                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg">
                                                                                        <FiLink className="w-3 h-3" /> Link {li + 1}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 min-w-[220px]">
                                                                    {isGraded ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                                                                <FiStar className="w-3 h-3" /> {submission.score}/{task.maxScore || 100} pts
                                                                            </span>
                                                                            <button
                                                                                onClick={() => setGradingState(prev => ({ ...prev, [key]: { score: submission.score, feedback: submission.feedback || '' } }))}
                                                                                className="text-xs text-slate-400 hover:text-blue-500 font-semibold transition-colors"
                                                                            >Re-grade</button>
                                                                        </div>
                                                                    ) : null}
                                                                    {(!isGraded || gradingState[key]) && (
                                                                        <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="number"
                                                                                    placeholder={`Score (max ${task.maxScore || 100})`}
                                                                                    value={gradingState[key]?.score || ''}
                                                                                    onChange={e => setGradingState(prev => ({ ...prev, [key]: { ...prev[key], score: e.target.value } }))}
                                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                                                    min={0} max={task.maxScore || 100}
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleGradeSubmission(task._id, submission._id)}
                                                                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shrink-0"
                                                                                >
                                                                                    {isGraded ? 'Update' : 'Grade'}
                                                                                </button>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Feedback (optional)"
                                                                                value={gradingState[key]?.feedback || ''}
                                                                                onChange={e => setGradingState(prev => ({ ...prev, [key]: { ...prev[key], feedback: e.target.value } }))}
                                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

const EmptyState = ({ icon: Icon, message }) => (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-24 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-full mb-6">
            <Icon className="w-10 h-10" />
        </div>
        <p className="text-slate-500 font-semibold">{message}</p>
    </div>
);

export default CourseReports;
