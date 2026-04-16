import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestService, inquiryService } from '../../services';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
    FiPlus,
    FiUsers,
    FiCode,
    FiBook,
    FiBell,
    FiInbox,
    FiSettings,
    FiArrowRight,
    FiActivity,
    FiPieChart,
    FiLayers
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalContests: 0,
        activeContests: 0,
        totalQuestions: 0,
        unreadInquiries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [contestData, inquiryData] = await Promise.all([
                contestService.getAdminContests(),
                inquiryService.getInquiries()
            ]);
            
            const contests = contestData.contests || [];
            const inquiries = inquiryData.inquiries || [];
            
            const now = moment();
            const active = contests.filter(c => 
                now.isBetween(moment(c.startTime), moment(c.endTime))
            ).length;

            setStats({
                totalContests: contests.length,
                activeContests: active,
                totalQuestions: contests.reduce((acc, c) => acc + (c.questions?.length || 0), 0),
                unreadInquiries: inquiries.filter(i => i.status === 'unread').length
            });
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
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

    const managementTiles = [
        {
            title: 'Contest Forge',
            desc: 'Create, edit and manage coding competitions',
            icon: <FiCode className="w-6 h-6" />,
            link: '/contests',
            color: 'blue',
            badge: stats.activeContests > 0 ? `${stats.activeContests} Active` : null
        },
        {
            title: 'Course Studio',
            desc: 'Design curriculum and instructional modules',
            icon: <FiBook className="w-6 h-6" />,
            link: '/admin/courses',
            color: 'green'
        },
        {
            title: 'Inquiry Portal',
            desc: 'Respond to user messages and support tickets',
            icon: <FiInbox className="w-6 h-6" />,
            link: '/admin/inquiries',
            color: 'rose',
            badge: stats.unreadInquiries > 0 ? `${stats.unreadInquiries} New` : null
        },
        {
            title: 'User Management',
            desc: 'Control user access and permission levels',
            icon: <FiUsers className="w-6 h-6" />,
            link: '/admin/user-management',
            color: 'indigo'
        },
        {
            title: 'Broadcaster',
            desc: 'Send system-wide alerts and notifications',
            icon: <FiBell className="w-6 h-6" />,
            link: '/admin/notifications',
            color: 'amber'
        },
        {
            title: 'Platform Config',
            desc: 'Adjust global settings and system parameters',
            icon: <FiSettings className="w-6 h-6" />,
            link: '#',
            color: 'slate',
            disabled: true
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            <main className="container mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Manage your platform ecosystem from one central command center.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/contests/new"
                            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5"
                        >
                            <FiPlus className="w-5 h-5 mr-2" />
                            Quick Contest
                        </Link>
                    </div>
                </div>


                {/* Operations Grid */}
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <FiSettings className="mr-2 text-slate-400" /> System Operations
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managementTiles.map((tile, idx) => (
                        <Link
                            key={idx}
                            to={tile.link}
                            className={`group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 ${
                                tile.disabled 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 hover:-translate-y-1'
                            }`}
                            onClick={(e) => tile.disabled && e.preventDefault()}
                        >
                            {tile.badge && (
                                <span className={`absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                    tile.color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'
                                } shadow-sm`}>
                                    {tile.badge}
                                </span>
                            )}
                            
                            <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${
                                tile.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                tile.color === 'green' ? 'bg-green-50 text-green-600' :
                                tile.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                tile.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                tile.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {tile.icon}
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {tile.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                {tile.desc}
                            </p>
                            
                            <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                <span>Navigate</span>
                                <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
                
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
