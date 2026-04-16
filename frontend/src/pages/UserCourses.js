import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBook,
    FiSearch,
    FiPlay,
    FiAward,
    FiClock,
    FiTrendingUp,
    FiCheckCircle,
    FiBookOpen,
    FiArrowRight,
    FiGrid,
    FiFilter
} from 'react-icons/fi';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserCourses = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); 
    const [visibleCount, setVisibleCount] = useState(8);
    const navigate = useNavigate();

    useEffect(() => {
        setVisibleCount(8);
    }, [searchTerm, activeTab]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const [coursesRes, enrolledRes] = await Promise.all([
                courseService.getAllCourses(),
                enrollmentService.getEnrolledCourses()
            ]);
            setCourses(coursesRes.courses || []);
            setEnrolledCourses(enrolledRes.enrollments || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const isEnrolled = (courseId) => {
        return enrolledCourses.some(enrollment =>
            enrollment.course._id === courseId
        );
    };

    const getEnrollmentForCourse = (courseId) => {
        return enrolledCourses.find(enrollment => enrollment.course._id === courseId);
    };

    // Advanced Filtering Logic
    const getDisplayCourses = () => {
        let list = [];

        switch (activeTab) {
            case 'completed':
                list = enrolledCourses
                    .filter(e => e.progress?.completionPercentage === 100)
                    .map(e => ({ ...e.course, enrollment: e }));
                break;
            case 'enrolled':
                list = enrolledCourses
                    .filter(e => e.progress?.completionPercentage < 100)
                    .map(e => ({ ...e.course, enrollment: e }));
                break;
            default: // all
                list = courses
                    .filter(c => c.isPublished)
                    .map(c => ({ ...c, enrollment: getEnrollmentForCourse(c._id) }));
                break;
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(item =>
                (item?.title || '').toLowerCase().includes(lowerSearch)
            );
        }

        return list;
    };

    const counts = {
        all: courses.filter(c => c.isPublished).length,
        enrolled: enrolledCourses.filter(e => (e.progress?.completionPercentage || 0) < 100).length,
        completed: enrolledCourses.filter(e => (e.progress?.completionPercentage || 0) === 100).length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    const CourseCard = ({ course }) => {
        const enrollment = course.enrollment;
        const progress = enrollment?.progress?.completionPercentage || 0;

        return (
            <div
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
                onClick={() => navigate(enrollment ? `/courses/${course._id}/learn` : `/courses/${course._id}`)}
            >
                <div className="relative h-32 overflow-hidden">
                    <img
                        src={course.thumbnail || 'https://via.placeholder.com/300x150'}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                            course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>
                            {course.level}
                        </span>
                        {progress === 100 && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm bg-emerald-500 text-white flex items-center gap-1">
                                <FiCheckCircle className="w-3 h-3" />
                                Completed
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {course.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] line-clamp-2 mb-2 leading-relaxed">
                        {course.subtitle}
                    </p>

                    <div className="flex items-center gap-3 mb-auto pb-2">
                        <div className="flex items-center text-slate-400 text-[11px] font-semibold">
                            <FiClock className="mr-1 text-blue-500" />
                            {course.duration}h
                        </div>
                        <div className="flex items-center text-slate-400 text-[11px] font-semibold">
                            <FiBookOpen className="mr-1 text-indigo-500" />
                            {course.modules?.length || 0} Modules
                        </div>
                    </div>

                    {enrollment ? (
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5">
                                    <span className="flex items-center">
                                        <FiTrendingUp className="mr-1 text-green-500" />
                                        Progress
                                    </span>
                                    <span className="text-blue-600 font-black">{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-1000 relative ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <button className={`w-full py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn ${progress === 100
                                ? 'bg-slate-900 text-white hover:bg-black shadow-md shadow-slate-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                                }`}>
                                {progress === 100 ? (
                                    <>
                                        <FiAward className="w-4 h-4 text-amber-400" />
                                        <span>View Certificate</span>
                                    </>
                                ) : (
                                    <>
                                        <FiPlay className="w-4 h-4" />
                                        <span>Continue Learning</span>
                                        <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2">
                            <FiBook className="w-4 h-4" />
                            <span>View Course Details</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const displayCourses = getDisplayCourses();
    const paginatedCourses = displayCourses.slice(0, visibleCount);
    const hasMore = paginatedCourses.length < displayCourses.length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-4 md:px-10">
                <div className="w-full mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                Available <span className="text-blue-600">Courses</span>
                            </h1>
                            <p className="text-slate-500 font-medium">Explore our catalog and level up your skills.</p>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <FiSearch className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Find a course..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-semibold transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
                        {[
                            { id: 'all', label: 'All Courses', icon: <FiGrid />, count: counts.all },
                            { id: 'enrolled', label: 'In Progress', icon: <FiTrendingUp />, count: counts.enrolled },
                            { id: 'completed', label: 'Completed', icon: <FiCheckCircle />, count: counts.completed },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="w-full px-4 md:px-10 py-12">
                {displayCourses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {paginatedCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 hover:shadow-lg shadow-sm transition-all duration-300 flex items-center gap-2 group"
                                >
                                    <span>Load More Courses</span>
                                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-32 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 text-slate-300 rounded-full mb-8">
                            {activeTab === 'all' ? <FiBookOpen className="w-12 h-12" /> :
                                activeTab === 'enrolled' ? <FiTrendingUp className="w-12 h-12" /> :
                                    <FiCheckCircle className="w-12 h-12" />}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                            {searchTerm ? 'No results found' :
                                activeTab === 'enrolled' ? "No courses in progress" :
                                    activeTab === 'completed' ? "No completed courses yet" : "No courses available"}
                        </h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                            {searchTerm ? `We couldn't find anything matching "${searchTerm}"` :
                                activeTab === 'enrolled' ? "Why not start a new learning journey today?" :
                                    activeTab === 'completed' ? "Complete your first course to see it here!" : "Please check back later for new content."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default UserCourses;