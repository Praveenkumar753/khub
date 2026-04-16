import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiCheck, FiClock, FiPlayCircle, 
    FiAward, FiUser, FiCalendar, FiGlobe 
} from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    const fetchCourseAndStatus = useCallback(async () => {
        try {
            const [courseRes, statusRes] = await Promise.all([
                courseService.getCourse(courseId),
                enrollmentService.checkEnrollmentStatus(courseId)
            ]);
            setCourse(courseRes.course);
            setEnrollmentStatus(statusRes);
        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseAndStatus();
    }, [fetchCourseAndStatus]);

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await enrollmentService.enrollInCourse(courseId);
            toast.success('Successfully enrolled in course!');
            navigate(`/courses/${courseId}/learn`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to enroll in course');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-7xl mx-auto py-20 px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Course not available</h2>
                    <button 
                        onClick={() => navigate('/courses')}
                        className="mt-4 text-indigo-600 font-bold hover:underline"
                    >
                        Return to catalog
                    </button>
                </div>
            </div>
        );
    }

    const lastUpdated = course.updatedAt ? format(new Date(course.updatedAt), 'M/yyyy') : '--';

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />

            {/* Standard Dark Hero Section */}
            <div className="bg-slate-900 py-12 lg:py-16 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
                        {/* Title & Meta Area */}
                        <div className="lg:w-2/3 space-y-6">
                            <nav className="flex space-x-2 text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">
                                <span>Courses</span>
                                <span>/</span>
                                <span className="text-white opacity-80">{course.level || 'All Levels'}</span>
                            </nav>
                            
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-medium max-w-3xl opacity-90">
                                {course.subtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-bold">
                                <div className="flex items-center text-emerald-400">
                                    <FiAward className="mr-2" /> 
                                    <span className="uppercase tracking-[0.1em]">{course.level || 'Beginner'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiClock className="mr-2 text-indigo-400" />
                                    <span>{course.duration || 'Self-paced'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiCalendar className="mr-2 text-indigo-400" />
                                    <span>Last updated {lastUpdated}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiGlobe className="mr-2 text-indigo-400" />
                                    <span>English</span>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center">
                                <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center font-black text-xs uppercase mr-3">
                                    {course.createdBy?.fullName?.charAt(0) || course.createdBy?.username?.charAt(0) || '?'}
                                </div>
                                <span className="font-bold flex items-center">
                                    Created by <span className="text-indigo-400 ml-2 decoration-indigo-400 underline-offset-4 cursor-pointer underline">{course.createdBy?.fullName || course.createdBy?.username || 'Instructor'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Mobile Placeholder or Sidebar Placement for Desktop */}
                        <div className="hidden lg:block lg:w-1/3">
                            {/* Empty space for sidebar to overlap if needed, or keeping it as a clear split */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Sidebar Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="lg:flex lg:gap-16 relative">
                    
                    {/* Left Column: Course Details */}
                    <div className="lg:w-2/3 space-y-12 lg:space-y-16">

                        {/* Description Section */}
                        <section>
                            <h2 className="text-2xl font-black mb-6 tracking-tight uppercase tracking-widest text-[13px] text-gray-500">About this course</h2>
                            <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:font-medium">
                                <p>{course.description || "No description provided."}</p>
                            </div>
                        </section>
                        
                        {/* What You'll Learn Section (Strictly Backend Data) */}
                        {course.learningObjectives && course.learningObjectives.length > 0 && (
                            <section className="bg-white border rounded-2xl p-8 shadow-sm">
                                <h2 className="text-2xl font-black mb-8 tracking-tight uppercase tracking-widest text-[13px] text-gray-500">What you'll learn</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {course.learningObjectives.map((objective, i) => (
                                        <div key={i} className="flex gap-4">
                                            <FiCheck className="mt-1 flex-shrink-0 h-5 w-5 text-gray-400" />
                                            <p className="text-[17px] font-bold text-gray-700 leading-snug">{objective}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Prerequisites Section (Strictly Backend Data) */}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black mb-8 tracking-tight uppercase tracking-widest text-[13px] text-gray-500">Prerequisites</h2>
                                <ul className="space-y-4">
                                    {course.prerequisites.map((prereq, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-900 mt-2.5 mr-4 flex-shrink-0"></div>
                                            <span className="text-[17px] text-gray-600 font-bold">{prereq}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Enrollment Sidebar (Fixed Width) */}
                    <div className="lg:w-1/3 mt-12 lg:mt-0 relative">
                        <div className="lg:sticky lg:top-8 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden ring-4 ring-white ring-offset-4">
                            {/* Course Image */}
                            <div className="aspect-video relative bg-slate-100 group">
                                <img 
                                    src={course.thumbnail || 'https://via.placeholder.com/600x400?text=Course+Thumbnail'}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiPlayCircle className="h-14 w-14 text-white drop-shadow-xl" />
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Pricing */}
                                <div className="mb-8 flex items-baseline gap-2">
                                    {course.pricing?.isFree ? (
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                                {course.pricing?.currency || '$'}{course.pricing?.price || '0'}
                                            </span>
                                            {/* Old price placeholder if you wanted logic for discounts later */}
                                        </>
                                    )}
                                </div>

                                {/* Main CTA Button */}
                                <div className="space-y-3">
                                    {enrollmentStatus?.isEnrolled ? (
                                        <button
                                            onClick={() => navigate(`/courses/${courseId}/learn`)}
                                            className="w-full py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-lg border border-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center"
                                        >
                                            <FiPlayCircle className="mr-3 h-5 w-5" />
                                            Continue learning
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className={`w-full py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-lg border border-indigo-600 hover:bg-indigo-700 transition-all ${enrolling ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll now'}
                                        </button>
                                    )}
                                    <p className="text-center text-[11px] font-bold text-gray-400 pt-4 uppercase tracking-widest">30-day money-back guarantee</p>
                                </div>

                                {/* Featured Benefits */}
                                <div className="mt-10 pt-8 border-t space-y-5">
                                    <h4 className="text-[12px] font-black text-gray-900 uppercase tracking-widest mb-2">This course includes:</h4>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <FiPlayCircle className="h-5 w-5 text-gray-400" />
                                        <span>On-demand video content</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <FiAward className="h-5 w-5 text-gray-400" />
                                        <span>Certificate of completion</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <FiUser className="h-5 w-5 text-gray-400" />
                                        <span>Full lifetime access</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default CourseDetails;