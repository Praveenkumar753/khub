import React, { useState, useEffect } from 'react';
import { inquiryService } from '../../services';
import { toast } from 'react-toastify';
import moment from 'moment';
import { 
    FiMail, 
    FiUser, 
    FiMessageSquare, 
    FiTrash2, 
    FiCheckCircle, 
    FiClock, 
    FiSearch, 
    FiFilter,
    FiInbox,
    FiCornerUpRight
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';

const InquiryManagement = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read, replied
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const data = await inquiryService.getInquiries();
            setInquiries(data.inquiries);
        } catch (error) {
            toast.error('Failed to fetch messages');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await inquiryService.updateInquiryStatus(id, status);
            toast.success(`Marked as ${status}`);
            fetchInquiries();
            if (selectedInquiry?._id === id) {
                setSelectedInquiry(prev => ({ ...prev, status }));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message permanently?')) return;
        try {
            await inquiryService.deleteInquiry(id);
            toast.success('Message deleted');
            setSelectedInquiry(null);
            fetchInquiries();
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const filteredInquiries = inquiries.filter(item => {
        const matchesFilter = filter === 'all' || item.status === filter;
        const matchesSearch = 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'read': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'replied': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center">
                            <FiInbox className="mr-3 text-indigo-600" />
                            Contact Inquiries
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Manage and respond to user messages</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search messages..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                            {['all', 'unread', 'read', 'replied'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                                        filter === f 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Inquiry List */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                                <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate-500 font-bold">Loading messages...</p>
                            </div>
                        ) : filteredInquiries.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center border border-slate-200 shadow-sm text-center">
                                <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                                    <FiInbox size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">No messages found</h3>
                                <p className="text-slate-500 mt-2">When users contact you, they'll appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredInquiries.map((item) => (
                                                <tr 
                                                    key={item._id}
                                                    onClick={() => setSelectedInquiry(item)}
                                                    className={`group cursor-pointer hover:bg-slate-50/80 transition-all ${selectedInquiry?._id === item._id ? 'bg-indigo-50/30' : ''}`}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center">
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${item.status === 'unread' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'} transition-colors duration-300`}>
                                                                {item.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className={`text-sm font-black ${item.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>{item.name}</p>
                                                                <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className={`text-sm font-bold truncate max-w-[200px] ${item.status === 'unread' ? 'text-slate-900' : 'text-slate-500'}`}>{item.subject}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(item.status)} transition-all duration-300`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <p className="text-xs font-bold text-slate-400">{moment(item.createdAt).format('MMM D, YYYY')}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{moment(item.createdAt).fromNow()}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Inquiry Details Panel */}
                    <div className="lg:col-span-12 xl:col-span-4 sticky top-10">
                        {selectedInquiry ? (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedInquiry.status)}Shadow-sm`}>
                                            {selectedInquiry.status}
                                        </span>
                                        <button 
                                            onClick={() => handleDelete(selectedInquiry._id)}
                                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-950 leading-tight mb-2">{selectedInquiry.subject}</h3>
                                            <div className="flex items-center text-sm text-slate-400 font-medium italic">
                                                <FiClock size={14} className="mr-1.5" />
                                                Sent {moment(selectedInquiry.createdAt).format('MMMM Do YYYY, h:mm a')}
                                            </div>
                                        </div>

                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center">
                                            <div className="h-10 w-10 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600">
                                                <FiUser size={18} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">From</p>
                                                <p className="text-sm font-black text-slate-900">{selectedInquiry.name}</p>
                                                <p className="text-xs text-indigo-600 font-bold">{selectedInquiry.email}</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                                            <div className="pl-10 text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                                {selectedInquiry.message}
                                            </div>
                                        </div>

                                        <div className="pt-6 grid grid-cols-2 gap-3">
                                            {selectedInquiry.status === 'unread' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'read')}
                                                    className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                                                >
                                                    <FiCheckCircle size={16} className="mr-2" /> Mark Read
                                                </button>
                                            )}
                                            <a 
                                                href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                                onClick={() => handleUpdateStatus(selectedInquiry._id, 'replied')}
                                                className="flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-100 hover:bg-slate-800 active:scale-[0.98] transition-all"
                                            >
                                                <FiCornerUpRight size={16} className="mr-2" /> Reply
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center opacity-60">
                                <div className="h-16 w-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                                    <FiMessageSquare size={32} />
                                </div>
                                <h4 className="text-slate-400 font-black">Select a message</h4>
                                <p className="text-slate-300 text-sm font-medium mt-1">Select an inquiry from the list to view its contents and reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InquiryManagement;
