import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { FiUsers, FiUserPlus, FiUpload, FiUser, FiMail, FiHash, FiCalendar, FiShield } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        teamNumber: '',
        batchYear: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response.users);
            setError('');
        } catch (err) {
            setError('Failed to fetch users');
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.addUser(formData);
            toast.success('User added successfully');
            setFormData({ name: '', username: '', email: '', teamNumber: '', batchYear: '' });
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add user';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }
        try {
            await userService.bulkUploadUsers(file);
            toast.success('Users uploaded successfully');
            setFile(null);
            e.target.reset();
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to upload users';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const roleColor = (role) => {
        if (role === 'admin') return 'bg-red-100 text-red-700';
        if (role === 'khub') return 'bg-green-100 text-green-700';
        return 'bg-blue-100 text-blue-700';
    };

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 pt-10 pb-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-3">
                        <FiUsers className="text-blue-600" /> User Management
                    </h1>
                    <p className="text-slate-500 font-medium">Add, manage, and bulk import platform users.</p>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10 flex-1">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 font-semibold text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Forms Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Manual Add */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-blue-50 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <FiUserPlus className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900">Add User Manually</h2>
                                </div>
                                <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                                    {[
                                        { label: 'Full Name', name: 'name', type: 'text', icon: FiUser },
                                        { label: 'Username', name: 'username', type: 'text', icon: FiUser },
                                        { label: 'Email', name: 'email', type: 'email', icon: FiMail },
                                        { label: 'Team Number', name: 'teamNumber', type: 'text', icon: FiHash },
                                        { label: 'Batch Year', name: 'batchYear', type: 'text', icon: FiCalendar },
                                    ].map(field => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">{field.label}</label>
                                            <div className="relative">
                                                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 text-sm transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 mt-2"
                                    >
                                        <FiUserPlus className="w-4 h-4" /> Add User
                                    </button>
                                </form>
                            </div>

                            {/* Bulk Upload */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-green-50 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                        <FiUpload className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900">Bulk Upload Users</h2>
                                </div>
                                <form onSubmit={handleFileUpload} className="p-6 space-y-4">
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                        <FiUpload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 font-semibold mb-3">Choose an Excel file to upload</p>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                            required
                                        />
                                        {file && <p className="text-xs mt-2 text-green-600 font-bold">✓ {file.name}</p>}
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-semibold">
                                        📋 Excel columns required: <code className="bg-amber-100 px-1 rounded">name, username, email, teamNumber, batchYear</code>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2"
                                    >
                                        <FiUpload className="w-4 h-4" /> Upload Users
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <FiUsers className="text-blue-600" /> User List
                                </h2>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                    {users.length} users
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            {['#', 'Name', 'Username', 'Email', 'Role', 'Team #', 'Batch Year'].map(h => (
                                                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {currentUsers.map((user, idx) => (
                                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-400 font-mono">{indexOfFirstUser + idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                                                            {(user.fullName || user.username || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">@{user.username}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${roleColor(user.role)}`}>
                                                        <FiShield className="w-3 h-3" /> {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{user.teamNumber || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{user.batchYear || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && (
                                    <div className="text-center py-16 text-slate-400 font-semibold">No users found.</div>
                                )}
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 rounded-b-2xl">
                                    <div className="text-sm text-slate-500 font-medium">
                                        Showing <span className="font-bold text-slate-900">{indexOfFirstUser + 1}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastUser, users.length)}</span> of <span className="font-bold text-slate-900">{users.length}</span> users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => paginate(i + 1)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                                                        currentPage === i + 1 
                                                            ? 'bg-blue-600 text-white shadow-sm' 
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default UserManagement;