import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiPlus, FiSettings, FiClock, FiActivity, FiGlobe, FiEyeOff } from 'react-icons/fi';
import { courseService } from '../../services/courseService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await courseService.getAllCourses();
                setCourses(res.courses || []);
                console.log(res.courses,"nocourses found");
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center mb-2">
                                <FiBook className="mr-3 text-blue-600" /> Course Management
                            </h1>
                            <p className="text-slate-500 font-medium">Create, configure, and manage all platform courses.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/courses/new')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-full md:w-auto"
                        >
                            <FiPlus className="w-5 h-5" />
                            <span>Create Course</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-32 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 text-slate-300 rounded-full mb-8">
                            <FiBook className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Courses Found</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                            There are currently no courses on the platform. Click 'Create Course' to add your first one.
                        </p>
                        <button
                            onClick={() => navigate('/admin/courses/new')}
                            className="flex items-center mx-auto space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                        >
                            <FiPlus className="w-5 h-5" />
                            <span>Create Your First Course</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courses.map(course => (
                            <div key={course._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                                <div className="relative h-32 overflow-hidden bg-slate-100">
                                    <img 
                                        src={course.thumbnail || 'https://via.placeholder.com/400x200'} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        <span className={`flex items-center px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10 ${
                                            course.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {course.isPublished ? <FiGlobe className="mr-1 w-3 h-3"/> : <FiEyeOff className="mr-1 w-3 h-3"/>}
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h2 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h2>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed min-h-[33px]">{course.subtitle}</p>
                                    
                                    <div className="flex items-center gap-3 mb-auto pb-3">
                                        <div className="flex items-center px-2 py-1 bg-slate-50 rounded-md text-slate-600 text-[10px] font-bold uppercase tracking-wide border border-slate-100">
                                            <FiActivity className="mr-1.5 text-blue-500" />
                                            {course.level}
                                        </div>
                                        <div className="flex items-center px-2 py-1 bg-slate-50 rounded-md text-slate-600 text-[10px] font-bold tracking-wide border border-slate-100">
                                            <FiClock className="mr-1.5 text-indigo-500" />
                                            {course.duration}h
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course._id}/modules`)}
                                            className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group/btn shadow-md shadow-slate-200"
                                        >
                                            <FiSettings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-500" />
                                            <span>Manage Content</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Courses;
